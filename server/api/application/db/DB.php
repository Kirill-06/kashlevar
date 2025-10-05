<?php

class DB {
    private $pdo;

    function __construct() {
        $host = getenv('POSTGRES_HOST') ?: 'localhost';
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
        $this->execute("INSERT INTO users (username,hash_password) VALUES (?, ?)",[$username, $hash_password]);
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
