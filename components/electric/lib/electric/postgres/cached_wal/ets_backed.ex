defmodule Electric.Postgres.CachedWal.EtsBacked do
  @moduledoc """
  ETS-backed WAL cache.

  This cache is implemented as a GenStage consumer, so it should be subscribed to a producer that sends
  `t:Transaction.t()` structs as events. This consumer will then fill and update the cache from the stream.

  ## `start_link/1` options

  - `name`: GenServer process name
  - `max_cache_count`: maximum count of WAL entries to store in cache. When maximum is reached, a cleanup will be performed,
    removing oldest entries (FIFO)
  """

  alias Electric.Replication.Changes.Transaction
  alias Electric.Postgres.Lsn
  alias Electric.Postgres.CachedWal.Api

  use GenStage
  @behaviour Electric.Postgres.CachedWal.Api

  @ets_table_name :ets_backed_cached_wal

  @typep state :: %{
           notification_requests: %{optional(reference()) => {Api.wal_pos(), pid()}},
           table: ETS.Set.t(),
           current_cache_count: non_neg_integer(),
           max_cache_count: non_neg_integer()
         }

  # Public API

  @doc """
  Get a `:gproc` via-tuple based on the origin that fills this cache
  """
  def get_name(origin) do
    {:via, :gproc, {:n, :l, {__MODULE__, origin}}}
  end

  @doc """
  Start the cache. See module docs for options
  """
  def start_link(opts) do
    genstage_opts = Keyword.take(opts, [:name])
    GenStage.start_link(__MODULE__, opts, genstage_opts)
  end

  def clear_cache(stage) do
    GenStage.cast(stage, :clear)
  end

  @impl Api
  def get_wal_position_from_lsn(lsn) do
    with {:ok, table} <- ETS.Set.wrap_existing(@ets_table_name) do
      if ETS.Set.has_key!(table, lsn_to_position(lsn)) do
        {:ok, lsn_to_position(lsn)}
      else
        {:error, :lsn_too_old}
      end
    end
  end

  @impl Api
  def next_segment(wal_pos) do
    with {:ok, table} <- ETS.Set.wrap_existing(@ets_table_name),
         {:ok, next_key} <- ETS.Set.next(table, wal_pos) do
      {:ok, ETS.Set.get_element!(table, next_key, 2), next_key}
    else
     {:error, :end_of_table} -> :latest
     error -> error
    end
  end

  @impl Api
  def request_notification(_wal_pos) do
    raise "Not implemented"
  end

  @impl Api
  def cancel_notification_request(_ref) do
    raise "Not implemented"
  end

  # Internal API

  @impl GenStage
  def init(opts) do
    set = ETS.Set.new!(name: @ets_table_name, ordered: true)

    state = %{
      notification_requests: %{},
      table: set,
      current_cache_count: 0,
      max_cache_count: Keyword.get(opts, :max_cache_count, 10000)
    }

    case Keyword.get(opts, :subscribe_to) do
      nil -> {:consumer, state}
      subscription -> {:consumer, state, subscribe_to: subscription}
    end
  end

  @impl GenStage
  def handle_cast(:clear, state) do
    ETS.Set.delete_all!(state.table)

    # This doesn't do anything with notification requests, but this function is not meant to be used in production
    {:noreply, [], %{state | current_cache_count: 0}}
  end

  @impl GenStage
  @spec handle_events([Transaction.t()], term(), state()) :: {:noreply, [], any}
  def handle_events(events, _, state) do
    events = Enum.filter(events, & &1.changes != [])

    events
    |> Enum.map(fn %Transaction{lsn: lsn} = tx -> {lsn_to_position(lsn), %{tx | ack_fn: nil}} end)
    |> then(&ETS.Set.put(state.table, &1))

    {%Transaction{lsn: max_lsn}, total} =
      events
      |> Stream.each(& &1.ack_fn.())
      |> Enum.to_list()
      |> Electric.Utils.list_last_and_length()

    state =
      state
      |> fulfill_notification_requests(lsn_to_position(max_lsn))
      |> Map.update!(:current_cache_count, &(&1 + total))
      |> trim_cache()

    {:noreply, [], state}
  end

  @spec fulfill_notification_requests(state(), Api.wal_pos()) :: state()
  defp fulfill_notification_requests(state, new_max_lsn) do
    fulfilled_refs =
      state.notification_requests
      |> Stream.filter(fn {_, {target, _}} -> target <= new_max_lsn end)
      |> Stream.each(fn {ref, {_, pid}} ->
        send(pid, {:cached_wal_notification, ref, :new_segments_available})
      end)
      |> Enum.map(&elem(&1, 0))

    Map.update!(state, :notification_requests, &Map.drop(&1, fulfilled_refs))
  end

  defp lsn_to_position(lsn), do: Lsn.to_integer(lsn)

  @spec trim_cache(state()) :: state()
  defp trim_cache(%{current_cache_count: current, max_cache_count: max} = state)
       when current <= max,
       do: state

  defp trim_cache(state) do
    to_trim = state.current_cache_count - state.max_cache_count

    state.table
    # `match/3` works here because it's an ordered set, which guarantees traversal from the beginning
    |> ETS.Set.match({:"$1", :_}, to_trim)
    |> Enum.each(fn [key] -> ETS.Set.delete!(state.table, key) end)

    Map.update!(state, :current_cache_count, &(&1 - to_trim))
  end
end