<?php

class DB {
    private $pdo;

    function __construct() {
        $host = getenv('POSTGRES_HOST') ?: 'postgres';
        $port = getenv('POSTGRES_PORT') ?: '5432';
        $user = getenv('POSTGRES_USER') ?: 'user';
        $pass = getenv('POSTGRES_PASSWORD') ?: 'user';
        $db   = getenv('POSTGRES_DB') ?: 'game_data';

        $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
        $this->pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    public function __destruct() {
        $this->pdo = null;
    }

    // выполнить запрос без возвращения данных
    private function execute($sql, $params = []) {
        $sth = $this->pdo->prepare($sql);
        return $sth->execute($params);
    }

    // получение ОДНОЙ записи
    private function query($sql, $params = []) {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetch(PDO::FETCH_OBJ);
    }

    // получение НЕСКОЛЬКИХ записей
    private function queryAll($sql, $params = []) {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetchAll(PDO::FETCH_ASSOC);
    }

    // ======================= USERS =======================

    public function getUserByUserName($username) {
        return $this->query("SELECT * FROM users WHERE username=?", [$username]);
    }

    public function getUserByToken($token) {
        return $this->query("SELECT * FROM users WHERE token=?", [$token]);
    }

    public function updateToken($userId, $token) {
        $this->execute("UPDATE users SET token=? WHERE id=?", [$token, $userId]);
    }

    public function registration($username, $hash_password) {
        $this->execute("INSERT INTO users (username, hash_password) VALUES (?, ?)", [$username, $hash_password]);
    }
    public function getUserProgress($userId) {
        return $this->query("SELECT * FROM user_progress WHERE user_id=?", [$userId]);
    }

    public function addUserProgress($userId) {
        $this->execute(
            "INSERT INTO user_progress (user_id) VALUES (?)",
            [$userId]
        );
    }

    public function updateUserProgress($userId, $happines = null, $health = null, $coins = null, $lastPlayed = null) {
        $fields = [];
        $params = [];

        if ($happines !== null) { $fields[] = "happines=?"; $params[] = $happines; }
        if ($health !== null)   { $fields[] = "health=?";   $params[] = $health; }
        if ($coins !== null)    { $fields[] = "coins=?";    $params[] = $coins; }
        if ($lastPlayed !== null) { $fields[] = "last_played=?"; $params[] = $lastPlayed; }

        if (empty($fields)) return;

        $params[] = $userId;
        $sql = "UPDATE user_progress SET " . implode(", ", $fields) . " WHERE user_id=?";
        $this->execute($sql, $params);
    }

    public function getUserItems($userId) {
        return $this->queryAll("SELECT * FROM user_items WHERE user_id=?", [$userId]);
    }

    public function addUserItem($userId, $itemId, $quantity = 1) {
        $this->execute("INSERT INTO user_items (user_id, item_id, quantity) VALUES (?, ?, ?)", [$userId, $itemId, $quantity]);
    }

    public function updateUserItem($userItemId, $quantity) {
        $this->execute("UPDATE user_items SET quantity=? WHERE id=?", [$quantity, $userItemId]);
    }

    public function deleteUserItem($userItemId) {
        $this->execute("DELETE FROM user_items WHERE id=?", [$userItemId]);
    }

    public function getChatHash() {
        return $this->query("SELECT * FROM hashes WHERE id=1");
    }

    public function updateChatHash($hash) {
        $this->execute("UPDATE hashes SET chat_hash=? WHERE id=1", [$hash]);
    }

    public function addMessage($userId, $message) {
        $this->execute('INSERT INTO messages (user_id, message, created) VALUES (?,?, now())', [$userId, $message]);
    }

    public function getMessages() {
        return $this->queryAll("SELECT u.name AS author, m.message AS message,
                                to_char(m.created, 'yyyy-mm-dd hh24:mi:ss') AS created FROM messages as m 
                                LEFT JOIN users as u on u.id = m.user_id 
                                ORDER BY m.created DESC"
        );
    }
}
