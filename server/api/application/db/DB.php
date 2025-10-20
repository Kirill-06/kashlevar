<?php

class DB
{
    private $pdo;

    function __construct()
    {
        $host = getenv('POSTGRES_HOST') ?: 'postgres';
        $port = getenv('POSTGRES_PORT') ?: '5432';
        $user = getenv('POSTGRES_USER') ?: 'user';
        $pass = getenv('POSTGRES_PASSWORD') ?: 'user';
        $db   = getenv('POSTGRES_DB') ?: 'game_data';

        $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
        $this->pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    public function __destruct()
    {
        $this->pdo = null;
    }

    // выполнить запрос без возвращения данных
    private function execute($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        return $sth->execute($params);
    }

    // получение ОДНОЙ записи
    private function query($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetch(PDO::FETCH_OBJ);
    }

    // получение НЕСКОЛЬКИХ записей
    private function queryAll($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUserByUserName($username)
    {
        return $this->query("SELECT * FROM users WHERE username=?", [$username]);
    }

    public function getUserByToken($token)
    {
        return $this->query("SELECT * FROM users WHERE token=?", [$token]);
    }

    public function updateToken($userId, $token)
    {
        $this->execute("UPDATE users SET token=? WHERE id=?", [$token, $userId]);
    }

    public function registration($username, $hash_password)
    {
        $this->execute(
            "INSERT INTO users (username, hash_password) VALUES (?, ?)",
            [$username, $hash_password]
        );

        $userId = $this->pdo->lastInsertId();

        $this->execute(
            "INSERT INTO user_progress (user_id) VALUES (?)",
            [$userId]
        );
    }

    public function getUserProgress($userId)
    {
        return $this->query("SELECT * FROM user_progress WHERE user_id=?", [$userId]);
    }

    public function addUserProgress($userId)
    {
        $this->execute(
            "INSERT INTO user_progress (user_id) VALUES (?)",
            [$userId]
        );
    }

    public function updateUserProgress($userId, $happines = null, $health = null, $coins = null, $lastPlayed = null)
    {
        $fields = [];
        $params = [];

        if ($happines !== null) {
            $fields[] = "happines=?";
            $params[] = $happines;
        }
        if ($health !== null) {
            $fields[] = "health=?";
            $params[] = $health;
        }
        if ($coins !== null) {
            $fields[] = "coins=?";
            $params[] = $coins;
        }
        if ($lastPlayed !== null) {
            $fields[] = "last_played=?";
            $params[] = $lastPlayed;
        }

        if (empty($fields)) return;

        $params[] = $userId;
        $sql = "UPDATE user_progress SET " . implode(", ", $fields) . " WHERE user_id=?";
        $this->execute($sql, $params);
    }

    public function getUserVape($userId, $vapeId)
    {
        return $this->query("
            SELECT user_vapes.id, user_vapes.user_id, user_vapes.vape_id, user_vapes.level,
                user_vapes.health_change, user_vapes.happiness_change,
                shop.name AS name
            FROM user_vapes
            JOIN vape_items ON user_vapes.vape_id = vape_items.id
            JOIN shop ON vape_items.shop_id = shop.id
            WHERE user_vapes.user_id = ? AND user_vapes.vape_id = ?
        ", [$userId, $vapeId]);
    }


    public function getUserVapes($userId)
    {
        return $this->queryAll("
            SELECT user_vapes.id, user_vapes.user_id, user_vapes.vape_id, user_vapes.level,
                user_vapes.health_change, user_vapes.happiness_change, shop.name AS name
            FROM user_vapes
            JOIN vape_items ON user_vapes.vape_id = vape_items.id
            JOIN shop ON vape_items.shop_id = shop.id
            WHERE user_vapes.user_id = ?
        ", [$userId]);
    }

    /*public function getVapesFromShop()
    {

    }*/

    public function getVapeFromShop($shopId)
    {
        return $this->query("
            SELECT 
                vape_items.shop_id,
                vape_items.base_health_change,
                vape_items.base_happiness_change,
                shop.name,
                shop.price,
                shop.type
            FROM vape_items
            JOIN shop ON vape_items.shop_id = shop.id
            WHERE shop.id = ?
        ", [$shopId]);
    }

    public function addUserVape($userId, $vapeShopId)
    {
        $vape = $this->query("
            SELECT id AS vape_id, base_health_change, base_happiness_change
            FROM vape_items
            WHERE shop_id = ?
        ", [$vapeShopId]);

        $this->execute("
            INSERT INTO user_vapes (user_id, vape_id, level, health_change, happiness_change)
            VALUES (?, ?, 1, ?, ?)
        ", [$userId, $vape->vape_id, $vape->base_health_change, $vape->base_happiness_change]);
    }

    public function updateUserVape($userVapeId, $level = null, $healthChange = null, $happinessChange = null)
    {
        $fields = [];
        $params = [];

        if ($level !== null) {
            $fields[] = "level=?";
            $params[] = $level;
        }
        if ($healthChange !== null) {
            $fields[] = "health_change=?";
            $params[] = $healthChange;
        }
        if ($happinessChange !== null) {
            $fields[] = "happiness_change=?";
            $params[] = $happinessChange;
        }

        if (empty($fields)) return;

        $params[] = $userVapeId;
        $sql = "UPDATE user_vapes SET " . implode(", ", $fields) . " WHERE id=?";
        $this->execute($sql, $params);
    }

    public function deleteUserVape($userVapeId)
    {
        $this->execute("DELETE FROM user_vapes WHERE id=?", [$userVapeId]);
    }

    public function getChatHash()
    {
        return $this->query("SELECT * FROM hashes WHERE id=1");
    }

    public function updateChatHash($hash)
    {
        $this->execute("UPDATE hashes SET chat_hash=? WHERE id=1", [$hash]);
    }

    public function addMessage($userId, $message)
    {
        $this->execute('INSERT INTO messages (user_id, message, created) VALUES (?,?, now())', [$userId, $message]);
    }

    public function getMessages()
    {
        return $this->queryAll(
            "SELECT u.name AS author, m.message AS message,
                                to_char(m.created, 'yyyy-mm-dd hh24:mi:ss') AS created FROM messages as m 
                                LEFT JOIN users as u on u.id = m.user_id 
                                ORDER BY m.created DESC"
        );
    }
}
