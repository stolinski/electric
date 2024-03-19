export default [
  {
    "statements": [
      "CREATE TABLE \"activity_events\" (\n  \"id\" TEXT NOT NULL,\n  \"source_user_id\" TEXT NOT NULL,\n  \"target_user_id\" TEXT NOT NULL,\n  \"activity_type\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"message\" TEXT NOT NULL,\n  \"action\" TEXT,\n  \"read_at\" TEXT,\n  CONSTRAINT \"activity_events_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.activity_events', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_activity_events_primarykey;",
      "CREATE TRIGGER update_ensure_main_activity_events_primarykey\n  BEFORE UPDATE ON \"main\".\"activity_events\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_activity_events_into_oplog;",
      "CREATE TRIGGER insert_main_activity_events_into_oplog\n   AFTER INSERT ON \"main\".\"activity_events\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.activity_events')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'activity_events', 'INSERT', json_object('id', new.\"id\"), json_object('action', new.\"action\", 'activity_type', new.\"activity_type\", 'id', new.\"id\", 'message', new.\"message\", 'read_at', new.\"read_at\", 'source_user_id', new.\"source_user_id\", 'target_user_id', new.\"target_user_id\", 'timestamp', new.\"timestamp\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_activity_events_into_oplog;",
      "CREATE TRIGGER update_main_activity_events_into_oplog\n   AFTER UPDATE ON \"main\".\"activity_events\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.activity_events')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'activity_events', 'UPDATE', json_object('id', new.\"id\"), json_object('action', new.\"action\", 'activity_type', new.\"activity_type\", 'id', new.\"id\", 'message', new.\"message\", 'read_at', new.\"read_at\", 'source_user_id', new.\"source_user_id\", 'target_user_id', new.\"target_user_id\", 'timestamp', new.\"timestamp\"), json_object('action', old.\"action\", 'activity_type', old.\"activity_type\", 'id', old.\"id\", 'message', old.\"message\", 'read_at', old.\"read_at\", 'source_user_id', old.\"source_user_id\", 'target_user_id', old.\"target_user_id\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_activity_events_into_oplog;",
      "CREATE TRIGGER delete_main_activity_events_into_oplog\n   AFTER DELETE ON \"main\".\"activity_events\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.activity_events')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'activity_events', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('action', old.\"action\", 'activity_type', old.\"activity_type\", 'id', old.\"id\", 'message', old.\"message\", 'read_at', old.\"read_at\", 'source_user_id', old.\"source_user_id\", 'target_user_id', old.\"target_user_id\", 'timestamp', old.\"timestamp\"), NULL);\nEND;"
    ],
    "version": "1"
  },
  {
    "statements": [
      "CREATE TABLE \"logs\" (\n  \"id\" TEXT NOT NULL,\n  \"source_id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"content\" TEXT NOT NULL,\n  CONSTRAINT \"logs_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "CREATE INDEX \"logs_idx_timestamp\" ON \"logs\" (\"timestamp\" ASC);\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.logs', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_logs_primarykey;",
      "CREATE TRIGGER update_ensure_main_logs_primarykey\n  BEFORE UPDATE ON \"main\".\"logs\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_logs_into_oplog;",
      "CREATE TRIGGER insert_main_logs_into_oplog\n   AFTER INSERT ON \"main\".\"logs\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.logs')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'logs', 'INSERT', json_object('id', new.\"id\"), json_object('content', new.\"content\", 'id', new.\"id\", 'source_id', new.\"source_id\", 'timestamp', new.\"timestamp\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_logs_into_oplog;",
      "CREATE TRIGGER update_main_logs_into_oplog\n   AFTER UPDATE ON \"main\".\"logs\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.logs')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'logs', 'UPDATE', json_object('id', new.\"id\"), json_object('content', new.\"content\", 'id', new.\"id\", 'source_id', new.\"source_id\", 'timestamp', new.\"timestamp\"), json_object('content', old.\"content\", 'id', old.\"id\", 'source_id', old.\"source_id\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_logs_into_oplog;",
      "CREATE TRIGGER delete_main_logs_into_oplog\n   AFTER DELETE ON \"main\".\"logs\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.logs')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'logs', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('content', old.\"content\", 'id', old.\"id\", 'source_id', old.\"source_id\", 'timestamp', old.\"timestamp\"), NULL);\nEND;"
    ],
    "version": "2"
  },
  {
    "statements": [
      "CREATE TABLE \"requests\" (\n  \"id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"path\" TEXT NOT NULL,\n  \"method\" TEXT NOT NULL,\n  \"data\" TEXT_JSON,\n  \"processing\" INTEGER NOT NULL,\n  \"cancelled\" INTEGER NOT NULL,\n  CONSTRAINT \"requests_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "CREATE TABLE \"responses\" (\n  \"id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"request_id\" TEXT NOT NULL,\n  \"status_code\" INTEGER NOT NULL,\n  \"data\" TEXT_JSON,\n  CONSTRAINT \"responses_request_id_fkey\" FOREIGN KEY (\"request_id\") REFERENCES \"requests\" (\"id\") ON DELETE CASCADE,\n  CONSTRAINT \"responses_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.requests', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_requests_primarykey;",
      "CREATE TRIGGER update_ensure_main_requests_primarykey\n  BEFORE UPDATE ON \"main\".\"requests\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_requests_into_oplog;",
      "CREATE TRIGGER insert_main_requests_into_oplog\n   AFTER INSERT ON \"main\".\"requests\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.requests')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'requests', 'INSERT', json_object('id', new.\"id\"), json_object('cancelled', new.\"cancelled\", 'data', new.\"data\", 'id', new.\"id\", 'method', new.\"method\", 'path', new.\"path\", 'processing', new.\"processing\", 'timestamp', new.\"timestamp\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_requests_into_oplog;",
      "CREATE TRIGGER update_main_requests_into_oplog\n   AFTER UPDATE ON \"main\".\"requests\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.requests')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'requests', 'UPDATE', json_object('id', new.\"id\"), json_object('cancelled', new.\"cancelled\", 'data', new.\"data\", 'id', new.\"id\", 'method', new.\"method\", 'path', new.\"path\", 'processing', new.\"processing\", 'timestamp', new.\"timestamp\"), json_object('cancelled', old.\"cancelled\", 'data', old.\"data\", 'id', old.\"id\", 'method', old.\"method\", 'path', old.\"path\", 'processing', old.\"processing\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_requests_into_oplog;",
      "CREATE TRIGGER delete_main_requests_into_oplog\n   AFTER DELETE ON \"main\".\"requests\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.requests')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'requests', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('cancelled', old.\"cancelled\", 'data', old.\"data\", 'id', old.\"id\", 'method', old.\"method\", 'path', old.\"path\", 'processing', old.\"processing\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.responses', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_responses_primarykey;",
      "CREATE TRIGGER update_ensure_main_responses_primarykey\n  BEFORE UPDATE ON \"main\".\"responses\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_responses_into_oplog;",
      "CREATE TRIGGER insert_main_responses_into_oplog\n   AFTER INSERT ON \"main\".\"responses\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.responses')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'responses', 'INSERT', json_object('id', new.\"id\"), json_object('data', new.\"data\", 'id', new.\"id\", 'request_id', new.\"request_id\", 'status_code', new.\"status_code\", 'timestamp', new.\"timestamp\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_responses_into_oplog;",
      "CREATE TRIGGER update_main_responses_into_oplog\n   AFTER UPDATE ON \"main\".\"responses\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.responses')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'responses', 'UPDATE', json_object('id', new.\"id\"), json_object('data', new.\"data\", 'id', new.\"id\", 'request_id', new.\"request_id\", 'status_code', new.\"status_code\", 'timestamp', new.\"timestamp\"), json_object('data', old.\"data\", 'id', old.\"id\", 'request_id', old.\"request_id\", 'status_code', old.\"status_code\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_responses_into_oplog;",
      "CREATE TRIGGER delete_main_responses_into_oplog\n   AFTER DELETE ON \"main\".\"responses\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.responses')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'responses', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('data', old.\"data\", 'id', old.\"id\", 'request_id', old.\"request_id\", 'status_code', old.\"status_code\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS compensation_insert_main_responses_request_id_into_oplog;",
      "CREATE TRIGGER compensation_insert_main_responses_request_id_into_oplog\n  AFTER INSERT ON \"main\".\"responses\"\n  WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.requests') AND\n       1 == (SELECT value from _electric_meta WHERE key == 'compensations')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  SELECT 'main', 'requests', 'COMPENSATION', json_object('id', \"id\"), json_object('id', \"id\"), NULL, NULL\n  FROM \"main\".\"requests\" WHERE \"id\" = new.\"request_id\";\nEND;",
      "DROP TRIGGER IF EXISTS compensation_update_main_responses_request_id_into_oplog;",
      "CREATE TRIGGER compensation_update_main_responses_request_id_into_oplog\n   AFTER UPDATE ON \"main\".\"responses\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.requests') AND\n        1 == (SELECT value from _electric_meta WHERE key == 'compensations')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  SELECT 'main', 'requests', 'COMPENSATION', json_object('id', \"id\"), json_object('id', \"id\"), NULL, NULL\n  FROM \"main\".\"requests\" WHERE \"id\" = new.\"request_id\";\nEND;"
    ],
    "version": "3"
  },
  {
    "statements": [
      "CREATE TABLE \"monitoring\" (\n  \"id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"type\" TEXT NOT NULL,\n  \"value\" REAL NOT NULL,\n  CONSTRAINT \"monitoring_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "CREATE INDEX \"monitoring_idx_type_timestamp\" ON \"monitoring\" (\"type\" ASC, \"timestamp\" ASC);\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.monitoring', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_monitoring_primarykey;",
      "CREATE TRIGGER update_ensure_main_monitoring_primarykey\n  BEFORE UPDATE ON \"main\".\"monitoring\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_monitoring_into_oplog;",
      "CREATE TRIGGER insert_main_monitoring_into_oplog\n   AFTER INSERT ON \"main\".\"monitoring\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.monitoring')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'monitoring', 'INSERT', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'timestamp', new.\"timestamp\", 'type', new.\"type\", 'value', cast(new.\"value\" as TEXT)), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_monitoring_into_oplog;",
      "CREATE TRIGGER update_main_monitoring_into_oplog\n   AFTER UPDATE ON \"main\".\"monitoring\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.monitoring')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'monitoring', 'UPDATE', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'timestamp', new.\"timestamp\", 'type', new.\"type\", 'value', cast(new.\"value\" as TEXT)), json_object('id', old.\"id\", 'timestamp', old.\"timestamp\", 'type', old.\"type\", 'value', cast(old.\"value\" as TEXT)), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_monitoring_into_oplog;",
      "CREATE TRIGGER delete_main_monitoring_into_oplog\n   AFTER DELETE ON \"main\".\"monitoring\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.monitoring')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'monitoring', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('id', old.\"id\", 'timestamp', old.\"timestamp\", 'type', old.\"type\", 'value', cast(old.\"value\" as TEXT)), NULL);\nEND;"
    ],
    "version": "4"
  },
  {
    "statements": [
      "CREATE TABLE \"background_jobs\" (\n  \"id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"payload\" TEXT_JSON NOT NULL,\n  \"completed\" INTEGER NOT NULL,\n  \"cancelled\" INTEGER NOT NULL,\n  \"progress\" REAL NOT NULL,\n  \"result\" TEXT_JSON,\n  CONSTRAINT \"background_jobs_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.background_jobs', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_background_jobs_primarykey;",
      "CREATE TRIGGER update_ensure_main_background_jobs_primarykey\n  BEFORE UPDATE ON \"main\".\"background_jobs\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_background_jobs_into_oplog;",
      "CREATE TRIGGER insert_main_background_jobs_into_oplog\n   AFTER INSERT ON \"main\".\"background_jobs\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.background_jobs')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'background_jobs', 'INSERT', json_object('id', new.\"id\"), json_object('cancelled', new.\"cancelled\", 'completed', new.\"completed\", 'id', new.\"id\", 'payload', new.\"payload\", 'progress', cast(new.\"progress\" as TEXT), 'result', new.\"result\", 'timestamp', new.\"timestamp\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_background_jobs_into_oplog;",
      "CREATE TRIGGER update_main_background_jobs_into_oplog\n   AFTER UPDATE ON \"main\".\"background_jobs\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.background_jobs')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'background_jobs', 'UPDATE', json_object('id', new.\"id\"), json_object('cancelled', new.\"cancelled\", 'completed', new.\"completed\", 'id', new.\"id\", 'payload', new.\"payload\", 'progress', cast(new.\"progress\" as TEXT), 'result', new.\"result\", 'timestamp', new.\"timestamp\"), json_object('cancelled', old.\"cancelled\", 'completed', old.\"completed\", 'id', old.\"id\", 'payload', old.\"payload\", 'progress', cast(old.\"progress\" as TEXT), 'result', old.\"result\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_background_jobs_into_oplog;",
      "CREATE TRIGGER delete_main_background_jobs_into_oplog\n   AFTER DELETE ON \"main\".\"background_jobs\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.background_jobs')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'background_jobs', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('cancelled', old.\"cancelled\", 'completed', old.\"completed\", 'id', old.\"id\", 'payload', old.\"payload\", 'progress', cast(old.\"progress\" as TEXT), 'result', old.\"result\", 'timestamp', old.\"timestamp\"), NULL);\nEND;"
    ],
    "version": "5"
  },
  {
    "statements": [
      "CREATE INDEX \"chat_room_idx_timestamp\" ON \"logs\" (\"timestamp\" ASC);\n",
      "CREATE TABLE \"chat_room\" (\n  \"id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"username\" TEXT NOT NULL,\n  \"message\" TEXT NOT NULL,\n  CONSTRAINT \"chat_room_pkey\" PRIMARY KEY (\"id\")\n) WITHOUT ROWID;\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.chat_room', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_chat_room_primarykey;",
      "CREATE TRIGGER update_ensure_main_chat_room_primarykey\n  BEFORE UPDATE ON \"main\".\"chat_room\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"id\" != new.\"id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_chat_room_into_oplog;",
      "CREATE TRIGGER insert_main_chat_room_into_oplog\n   AFTER INSERT ON \"main\".\"chat_room\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.chat_room')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'chat_room', 'INSERT', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'message', new.\"message\", 'timestamp', new.\"timestamp\", 'username', new.\"username\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_chat_room_into_oplog;",
      "CREATE TRIGGER update_main_chat_room_into_oplog\n   AFTER UPDATE ON \"main\".\"chat_room\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.chat_room')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'chat_room', 'UPDATE', json_object('id', new.\"id\"), json_object('id', new.\"id\", 'message', new.\"message\", 'timestamp', new.\"timestamp\", 'username', new.\"username\"), json_object('id', old.\"id\", 'message', old.\"message\", 'timestamp', old.\"timestamp\", 'username', old.\"username\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_chat_room_into_oplog;",
      "CREATE TRIGGER delete_main_chat_room_into_oplog\n   AFTER DELETE ON \"main\".\"chat_room\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.chat_room')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'chat_room', 'DELETE', json_object('id', old.\"id\"), NULL, json_object('id', old.\"id\", 'message', old.\"message\", 'timestamp', old.\"timestamp\", 'username', old.\"username\"), NULL);\nEND;"
    ],
    "version": "6"
  },
  {
    "statements": [
      "CREATE TABLE \"commerce_orders\" (\n  \"order_id\" TEXT NOT NULL,\n  \"timestamp\" TEXT NOT NULL,\n  \"price_amount\" REAL NOT NULL,\n  \"price_currency\" TEXT NOT NULL,\n  \"promo_code\" TEXT,\n  \"customer_full_name\" TEXT NOT NULL,\n  \"country\" TEXT NOT NULL,\n  \"product\" TEXT NOT NULL,\n  CONSTRAINT \"commerce_orders_pkey\" PRIMARY KEY (\"order_id\")\n) WITHOUT ROWID;\n",
      "CREATE INDEX \"commerce_orders_idx_country\" ON \"commerce_orders\" (\"country\" ASC);\n",
      "CREATE INDEX \"commerce_orders_idx_timestamp\" ON \"commerce_orders\" (\"timestamp\" ASC);\n",
      "INSERT OR IGNORE INTO _electric_trigger_settings(tablename,flag) VALUES ('main.commerce_orders', 1);",
      "DROP TRIGGER IF EXISTS update_ensure_main_commerce_orders_primarykey;",
      "CREATE TRIGGER update_ensure_main_commerce_orders_primarykey\n  BEFORE UPDATE ON \"main\".\"commerce_orders\"\nBEGIN\n  SELECT\n    CASE\n      WHEN old.\"order_id\" != new.\"order_id\" THEN\n      \t\tRAISE (ABORT, 'cannot change the value of column order_id as it belongs to the primary key')\n    END;\nEND;",
      "DROP TRIGGER IF EXISTS insert_main_commerce_orders_into_oplog;",
      "CREATE TRIGGER insert_main_commerce_orders_into_oplog\n   AFTER INSERT ON \"main\".\"commerce_orders\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.commerce_orders')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'commerce_orders', 'INSERT', json_object('order_id', new.\"order_id\"), json_object('country', new.\"country\", 'customer_full_name', new.\"customer_full_name\", 'order_id', new.\"order_id\", 'price_amount', cast(new.\"price_amount\" as TEXT), 'price_currency', new.\"price_currency\", 'product', new.\"product\", 'promo_code', new.\"promo_code\", 'timestamp', new.\"timestamp\"), NULL, NULL);\nEND;",
      "DROP TRIGGER IF EXISTS update_main_commerce_orders_into_oplog;",
      "CREATE TRIGGER update_main_commerce_orders_into_oplog\n   AFTER UPDATE ON \"main\".\"commerce_orders\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.commerce_orders')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'commerce_orders', 'UPDATE', json_object('order_id', new.\"order_id\"), json_object('country', new.\"country\", 'customer_full_name', new.\"customer_full_name\", 'order_id', new.\"order_id\", 'price_amount', cast(new.\"price_amount\" as TEXT), 'price_currency', new.\"price_currency\", 'product', new.\"product\", 'promo_code', new.\"promo_code\", 'timestamp', new.\"timestamp\"), json_object('country', old.\"country\", 'customer_full_name', old.\"customer_full_name\", 'order_id', old.\"order_id\", 'price_amount', cast(old.\"price_amount\" as TEXT), 'price_currency', old.\"price_currency\", 'product', old.\"product\", 'promo_code', old.\"promo_code\", 'timestamp', old.\"timestamp\"), NULL);\nEND;",
      "DROP TRIGGER IF EXISTS delete_main_commerce_orders_into_oplog;",
      "CREATE TRIGGER delete_main_commerce_orders_into_oplog\n   AFTER DELETE ON \"main\".\"commerce_orders\"\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.commerce_orders')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'commerce_orders', 'DELETE', json_object('order_id', old.\"order_id\"), NULL, json_object('country', old.\"country\", 'customer_full_name', old.\"customer_full_name\", 'order_id', old.\"order_id\", 'price_amount', cast(old.\"price_amount\" as TEXT), 'price_currency', old.\"price_currency\", 'product', old.\"product\", 'promo_code', old.\"promo_code\", 'timestamp', old.\"timestamp\"), NULL);\nEND;"
    ],
    "version": "7"
  }
]