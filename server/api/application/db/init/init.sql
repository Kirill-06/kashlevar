 CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     username      VARCHAR(30)  NOT NULL UNIQUE,
     hash_password VARCHAR(32)  NOT NULL,
     token         VARCHAR(32),
     money         INT          DEFAULT 1000
 );

 CREATE TABLE IF NOT EXISTS persons (
     id          SERIAL PRIMARY KEY,
     user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     hp          INT DEFAULT 100,
     happines    INT DEFAULT 100,
     created     TIMESTAMPTZ DEFAULT NOW(),
     last_update TIMESTAMPTZ DEFAULT NOW(),
     status      VARCHAR(30) DEFAULT 'alive', -- 'alive', 'inHell', 'resurrected', 'dead'
     active      INT DEFAULT 0,
     x           REAL DEFAULT 0,
     y           REAL DEFAULT 0,
     direction   VARCHAR(10) DEFAULT 'right',
     moveStatus  VARCHAR(10) DEFAULT 'stand'
 );

 CREATE TABLE IF NOT EXISTS items (
     id         SERIAL PRIMARY KEY,
     name       VARCHAR(100) NOT NULL,
     cost       INT DEFAULT 1,
     type       VARCHAR(20) DEFAULT 'vape', -- 'vape', 'sigaret', 'sigara', 'tablets'
     value      INT DEFAULT 1,
     base_level INT DEFAULT 1,
     CONSTRAINT uk_items_name UNIQUE (name)
 );

 CREATE TABLE IF NOT EXISTS inventory (
     id            SERIAL PRIMARY KEY,
     person_id     INT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
     item_id       INT NOT NULL REFERENCES items(id)   ON DELETE CASCADE,
     level         INT DEFAULT 1,
     current_value INT NOT NULL
 );

 CREATE TABLE IF NOT EXISTS messages (
     id      SERIAL PRIMARY KEY,
     user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     message TEXT NOT NULL,
     created TIMESTAMPTZ DEFAULT NOW()
 );

 CREATE TABLE IF NOT EXISTS hashes (
     id        INT PRIMARY KEY,
     chat_hash VARCHAR(64) NOT NULL
 );

 INSERT INTO hashes (id, chat_hash)
 VALUES (1, MD5(RANDOM()::TEXT))
 ON CONFLICT (id) DO NOTHING;

 INSERT INTO items (name, cost, type, value)
 VALUES
     ('XROS 5',       100, 'vape', 10),
     ('Aegis Hero 5', 250, 'vape', 20),
     ('Pasito II',    500, 'vape', 30)
 ON CONFLICT (name) DO NOTHING;

 CREATE TABLE IF NOT EXISTS tower_drops (
   id         SERIAL PRIMARY KEY,
   kind       VARCHAR(10) NOT NULL,  -- 'coin' | 'tablet'
   value      INT NOT NULL,          -- для coin: сколько монет, для tablet можно держать 15
   x          REAL NOT NULL,
   y          REAL NOT NULL,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   expires_at TIMESTAMPTZ,           -- можно сделать TTL, напр. NOW() + interval '30 seconds'
   picked_by  INT REFERENCES users(id),
   picked_at  TIMESTAMPTZ
 );

 CREATE INDEX IF NOT EXISTS idx_tower_drops_active
 ON tower_drops (picked_by, expires_at);

 CREATE INDEX IF NOT EXISTS idx_tower_drops_xy
 ON tower_drops (x, y);

 CREATE TABLE IF NOT EXISTS tower_meta (
   id SERIAL PRIMARY KEY,
   last_spawn_at TIMESTAMPTZ DEFAULT NOW()
 );

 INSERT INTO tower_meta (id, last_spawn_at)
 VALUES (1, NOW())
 ON CONFLICT (id) DO NOTHING;

--CREATE TABLE IF NOT EXISTS users (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    username      VARCHAR(30)  NOT NULL UNIQUE,
--    hash_password VARCHAR(32)  NOT NULL,
--    token         VARCHAR(32),
--    money         INT DEFAULT 1000
--) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
--CREATE TABLE IF NOT EXISTS persons (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    user_id     INT NOT NULL,
--    hp          INT DEFAULT 100,
--    happines    INT DEFAULT 100,
--    created     DATETIME DEFAULT CURRENT_TIMESTAMP,
--    last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
--    status      VARCHAR(30) DEFAULT 'alive',
--    active      TINYINT(1) DEFAULT 0,
--    CONSTRAINT fk_person_user FOREIGN KEY (user_id)
--        REFERENCES users(id) ON DELETE CASCADE
--) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
--CREATE TABLE IF NOT EXISTS items (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    name       VARCHAR(100) NOT NULL,
--    cost       INT DEFAULT 1,
--    type       VARCHAR(20) DEFAULT 'vape',
--    value      INT DEFAULT 1,
--    base_level INT DEFAULT 1,
--    UNIQUE KEY uk_items_name (name)
--) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
--CREATE TABLE IF NOT EXISTS inventory (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    person_id INT NOT NULL,
--    item_id   INT NOT NULL,
--    level     INT DEFAULT 1,
--    current_value INT NOT NULL,
--    CONSTRAINT fk_inv_person FOREIGN KEY (person_id)
--        REFERENCES persons(id) ON DELETE CASCADE,
--    CONSTRAINT fk_inv_item FOREIGN KEY (item_id)
--        REFERENCES items(id) ON DELETE CASCADE
--) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
--CREATE TABLE IF NOT EXISTS messages (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    user_id INT NOT NULL,
--    message TEXT NOT NULL,
--    created DATETIME DEFAULT CURRENT_TIMESTAMP,
--    CONSTRAINT fk_messages_user FOREIGN KEY (user_id)
--        REFERENCES users(id) ON DELETE CASCADE
--) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
--CREATE TABLE IF NOT EXISTS hashes (
--    id INT PRIMARY KEY,
--    chat_hash VARCHAR(64) NOT NULL
--) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--
--INSERT IGNORE INTO hashes (id, chat_hash)
--VALUES (1, MD5(RAND()));
--
--INSERT IGNORE INTO items (name, cost, type, value)
--VALUES
--    ('XROS 5',       100, 'vape', 10),
--    ('Aegis Hero 5', 250, 'vape', 20),
--    ('Pasito II',    500, 'vape', 30);