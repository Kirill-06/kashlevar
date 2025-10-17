CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    hash_password VARCHAR(255) NOT NULL,
    token VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    happines INT DEFAULT 100, 
    health INT DEFAULT 100,
    coins INT DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS shop (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL  -- 'vape'
);


CREATE TABLE IF NOT EXISTS vape_items (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER NOT NULL REFERENCES shop(id) ON DELETE CASCADE,
    base_health_change INTEGER NOT NULL,
    base_happiness_change INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS user_vapes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vape_id INTEGER NOT NULL REFERENCES vape_items(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    health_change INTEGER NOT NULL,
    happiness_change INTEGER NOT NULL,
    UNIQUE (user_id, vape_id)
);
