CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    hash_password VARCHAR(32) NOT NULL,
    token VARCHAR(32),
    money INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hp INTEGER DEFAULT 100,
    happines INTEGER DEFAULT 100,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'alive', -- 'alive', 'in hell', 'resurrected', 'dead'
    active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost INTEGER DEFAULT 1,
    type VARCHAR(20) DEFAULT 'vape', -- 'vape', 'sigaret', 'sigara', 'tablets'
    value INTEGER DEFAULT 1,
    base_level INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    current_value INTEGER NOT NULL
);
