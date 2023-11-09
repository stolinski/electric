import { AuthConfig, AuthState } from '../auth/index.js'
import { DatabaseAdapter } from '../electric/adapter.js'
import { Migrator } from '../migrators/index.js'
import { Notifier } from '../notifiers/index.js'
import { sleepAsync } from '../util/timer.js'
import {
  AuthResponse,
  DbName,
  LSN,
  SatelliteError,
  DataTransaction,
  Relation,
  SatelliteErrorCode,
  RelationsCache,
  Record as DataRecord,
  StartReplicationResponse,
  StopReplicationResponse,
  OutboundStartedCallback,
  TransactionCallback,
} from '../util/types.js'
import { ElectricConfig } from '../config/index.js'

import { Client, ConnectionWrapper, Satellite } from './index.js'
import {
  SatelliteOpts,
  SatelliteOverrides,
  satelliteDefaults,
} from './config.js'
import { BaseRegistry } from './registry.js'
import { SocketFactory } from '../sockets/index.js'
import { EventEmitter } from 'events'
import {
  DEFAULT_LOG_POS,
  subsDataErrorToSatelliteError,
  base64,
} from '../util/index.js'
import { bytesToNumber, uuid } from '../util/common.js'
import { generateTag } from './oplog.js'
import {
  ClientShapeDefinition,
  InitialDataChange,
  SUBSCRIPTION_DELIVERED,
  SUBSCRIPTION_ERROR,
  ShapeRequest,
  SubscribeResponse,
  SubscriptionData,
  SubscriptionDeliveredCallback,
  SubscriptionErrorCallback,
  UnsubscribeResponse,
} from './shapes/types.js'
import {
  SatSubsDataError,
  SatSubsDataError_Code,
  SatSubsDataError_ShapeReqError,
  SatSubsDataError_ShapeReqError_Code,
} from '../_generated/protocol/satellite.js'
import { ShapeSubscription } from './process.js'
import { DbSchema } from '../client/model/schema.js'

export const MOCK_BEHIND_WINDOW_LSN = 42
export const MOCK_INTERNAL_ERROR = 27

export class MockSatelliteProcess implements Satellite {
  dbName: DbName
  adapter: DatabaseAdapter
  migrator: Migrator
  notifier: Notifier
  socketFactory: SocketFactory
  opts: SatelliteOpts

  constructor(
    dbName: DbName,
    adapter: DatabaseAdapter,
    migrator: Migrator,
    notifier: Notifier,
    socketFactory: SocketFactory,
    opts: SatelliteOpts
  ) {
    this.dbName = dbName
    this.adapter = adapter
    this.migrator = migrator
    this.notifier = notifier
    this.socketFactory = socketFactory
    this.opts = opts
  }
  subscribe(
    _shapeDefinitions: ClientShapeDefinition[]
  ): Promise<ShapeSubscription> {
    return Promise.resolve({
      synced: Promise.resolve(),
    })
  }

  unsubscribe(_shapeUuid: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async start(_authConfig: AuthConfig): Promise<ConnectionWrapper> {
    await sleepAsync(50)
    return {
      connectionPromise: new Promise((resolve) => resolve()),
    }
  }

  async stop(): Promise<void> {
    await sleepAsync(50)
  }
}

export class MockRegistry extends BaseRegistry {
  private shouldFailToStart = false

  setShouldFailToStart(shouldFail: boolean): void {
    this.shouldFailToStart = shouldFail
  }

  async startProcess(
    dbName: DbName,
    _dbDescription: DbSchema<any>,
    adapter: DatabaseAdapter,
    migrator: Migrator,
    notifier: Notifier,
    socketFactory: SocketFactory,
    config: ElectricConfig,
    overrides?: SatelliteOverrides
  ): Promise<Satellite> {
    if (this.shouldFailToStart) {
      throw new Error('Failed to start satellite process')
    }

    const opts = { ...satelliteDefaults, ...overrides }

    const satellite = new MockSatelliteProcess(
      dbName,
      adapter,
      migrator,
      notifier,
      socketFactory,
      opts
    )
    await satellite.start(config.auth)

    return satellite
  }
}

export class MockSatelliteClient extends EventEmitter implements Client {
  isDown = false
  replicating = false
  disconnected = true
  inboundAck: Uint8Array = DEFAULT_LOG_POS

  outboundSent: Uint8Array = DEFAULT_LOG_POS

  // to clear any pending timeouts
  timeouts: NodeJS.Timeout[] = []

  relations: RelationsCache = {}
  relationsCb?: (relation: Relation) => void
  transactionsCb?: TransactionCallback

  relationData: Record<string, DataRecord[]> = {}

  setRelations(relations: RelationsCache): void {
    this.relations = relations
    if (this.relationsCb) {
      Object.values(relations).forEach(this.relationsCb)
    }
  }

  setRelationData(tablename: string, record: DataRecord): void {
    if (!this.relationData[tablename]) {
      this.relationData[tablename] = []
    }
    const data = this.relationData[tablename]

    data.push(record)
  }

  subscribe(
    subscriptionId: string,
    shapes: ShapeRequest[]
  ): Promise<SubscribeResponse> {
    const data: InitialDataChange[] = []
    const shapeReqToUuid: Record<string, string> = {}

    for (const shape of shapes) {
      for (const { tablename } of shape.definition.selects) {
        if (tablename === 'failure' || tablename === 'Items') {
          return Promise.resolve({
            subscriptionId,
            error: new SatelliteError(SatelliteErrorCode.TABLE_NOT_FOUND),
          })
        }
        if (tablename === 'another' || tablename === 'User') {
          return new Promise((resolve) => {
            this.sendErrorAfterTimeout(subscriptionId, 1)
            resolve({
              subscriptionId,
            })
          })
        } else {
          shapeReqToUuid[shape.requestId] = uuid()
          const records: DataRecord[] = this.relationData[tablename] ?? []

          for (const record of records) {
            const dataChange: InitialDataChange = {
              relation: this.relations[tablename],
              record,
              tags: [generateTag('remote', new Date())],
            }
            data.push(dataChange)
          }
        }
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit(SUBSCRIPTION_DELIVERED, {
          subscriptionId,
          lsn: base64.toBytes('MTIz'), // base64.encode("123")
          data,
          shapeReqToUuid,
        } as SubscriptionData)
      }, 1)

      resolve({
        subscriptionId,
      })
    })
  }

  unsubscribe(_subIds: string[]): Promise<UnsubscribeResponse> {
    return Promise.resolve({})
  }

  subscribeToSubscriptionEvents(
    successCallback: SubscriptionDeliveredCallback,
    errorCallback: SubscriptionErrorCallback
  ): void {
    this.on(SUBSCRIPTION_DELIVERED, successCallback)
    this.on(SUBSCRIPTION_ERROR, errorCallback)
  }

  unsubscribeToSubscriptionEvents(
    successCallback: SubscriptionDeliveredCallback,
    errorCallback: SubscriptionErrorCallback
  ): void {
    this.removeListener(SUBSCRIPTION_DELIVERED, successCallback)
    this.removeListener(SUBSCRIPTION_ERROR, errorCallback)
  }

  subscribeToError(cb: ErrorCallback): void {
    this.on('error', cb)
  }

  unsubscribeToError(cb: ErrorCallback): void {
    this.removeListener('error', cb)
  }

  isConnected(): boolean {
    return !this.disconnected
  }

  shutdown(): void {
    this.isDown = true
  }

  getLastSentLsn(): Uint8Array {
    return this.outboundSent
  }
  connect(): Promise<void> {
    if (this.isDown) {
      throw new SatelliteError(SatelliteErrorCode.UNEXPECTED_STATE, 'FAKE DOWN')
    }

    this.disconnected = false
    return Promise.resolve()
  }
  disconnect(): Promise<void> {
    this.disconnected = true
    for (const t of this.timeouts) {
      clearTimeout(t)
    }
    return Promise.resolve()
  }
  authenticate(_authState: AuthState): Promise<AuthResponse> {
    return Promise.resolve({})
  }
  startReplication(lsn: LSN): Promise<StartReplicationResponse> {
    this.replicating = true
    this.inboundAck = lsn

    const t = setTimeout(() => this.emit('outbound_started'), 100)
    this.timeouts.push(t)

    if (lsn && bytesToNumber(lsn) == MOCK_BEHIND_WINDOW_LSN) {
      return Promise.resolve({
        error: new SatelliteError(
          SatelliteErrorCode.BEHIND_WINDOW,
          'MOCK BEHIND_WINDOW_LSN ERROR'
        ),
      })
    }

    if (lsn && bytesToNumber(lsn) == MOCK_INTERNAL_ERROR) {
      return Promise.resolve({
        error: new SatelliteError(
          SatelliteErrorCode.INTERNAL,
          'MOCK INTERNAL_ERROR'
        ),
      })
    }

    return Promise.resolve({})
  }

  stopReplication(): Promise<StopReplicationResponse> {
    this.replicating = false
    return Promise.resolve({})
  }

  subscribeToRelations(callback: (relation: Relation) => void): void {
    this.relationsCb = callback
  }

  unsubscribeToRelations(): void {
    this.relationsCb = undefined
  }

  subscribeToTransactions(callback: TransactionCallback): void {
    this.transactionsCb = callback
  }

  unsubscribeToTransactions(): void {
    throw new Error('Method not implemented.')
  }

  enqueueTransaction(transaction: DataTransaction): void {
    this.outboundSent = transaction.lsn
  }

  subscribeToOutboundStarted(callback: OutboundStartedCallback): void {
    this.on('outbound_started', callback)
  }

  unsubscribeToOutboundStarted(): void {
    throw new Error('Method not implemented.')
  }

  sendErrorAfterTimeout(subscriptionId: string, timeout: number): void {
    setTimeout(() => {
      const satSubsError: SatSubsDataError = SatSubsDataError.fromPartial({
        code: SatSubsDataError_Code.SHAPE_DELIVERY_ERROR,
        message: 'there were shape errors',
        subscriptionId,
        shapeRequestError: [
          SatSubsDataError_ShapeReqError.fromPartial({
            code: SatSubsDataError_ShapeReqError_Code.SHAPE_SIZE_LIMIT_EXCEEDED,
            message:
              "Requested shape for table 'another' exceeds the maximum allowed shape size",
          }),
        ],
      })

      const satError = subsDataErrorToSatelliteError(satSubsError)
      this.emit(SUBSCRIPTION_ERROR, satError, subscriptionId)
    }, timeout)
  }
}
