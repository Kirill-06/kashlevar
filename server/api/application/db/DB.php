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

    public function getUserById($userId) 
    {
        return $this->query("SELECT * FROM users WHERE id=?", [$userId]);
    }

    public function updateToken($userId, $token)
    {
        $this->execute("UPDATE users SET token=? WHERE id=?", [$token, $userId]);
    }

    public function updateUserMoney($userId, $coins) 
    {
        $this->execute("UPDATE users SET money=? WHERE id=?", [$coins, $userId]);
    }

    public function registration($username, $hash_password)
    {
        $this->execute(
            "INSERT INTO users (username, hash_password) VALUES (?, ?)",
            [$username, $hash_password]
        );
        $userId = $this->pdo->lastInsertId();
        $this->createPerson($userId);
    }

    public function getPersonById($personId)
    {
        return $this->query("SELECT * FROM persons WHERE id=?", [$personId]);
    }

    public function createPerson($userId)
    {
        $this->execute(
            "INSERT INTO persons (user_id) VALUES (?)",
            [$userId]
        );
    }

    public function updatePersonHP($personId, $hp) 
    {
        $this->execute(
            "UPDATE persons SET hp=? WHERE id=?",
            [max(0, min(100, $hp)), $personId]
        );
    }

    public function updatePersonHappines($personId, $happines) 
    {
        $this->execute(
            "UPDATE persons SET happines=? WHERE id=?",
            [max(0, min(100, $happines)), $personId]
        );
    }

    public function updatePersonStatus($personId, $status) 
    {
        $this->execute(
            "UPDATE persons SET status=? WHERE id=?",
            [$status, $personId]
        );
    }

    public function setPersonActive($personId, $active) 
    {
        $this->execute(
            "UPDATE persons SET active=? WHERE id=?",
            [$active, $personId]
        );
    }

    private function updatePersonLastUpdate($personId) 
    {
        $this->execute(
            "UPDATE persons SET last_update=CURRENT_TIMESTAMP WHERE id=?",
            [$personId]
        );
    }

    public function deletePerson($personId)
    {
        $this->execute("DELETE FROM persons WHERE id=?", [$personId]);
    }

    public function getUserPerson($userId)
    {
        return $this->query("SELECT * FROM persons WHERE user_id=?", [$userId]);
    }

    public function getCatalogItems()
    {
        return $this->queryAll("SELECT * FROM items");
    }

    public function getItemById($itemId) 
    {
        return $this->query("SELECT * FROM items WHERE id=?", [$itemId]);
    }

    public function addItemToPerson($personId, $itemId, $level, $currentValue)
    {
        $this->execute(
            "INSERT INTO inventory (person_id, item_id, level, current_value) VALUES (?, ?, ?, ?)",
            [$personId, $itemId, $level, $currentValue]
        );
    }

    public function updateInventoryLevel($inventoryId, $level)
    {
        $this->execute(
            "UPDATE inventory SET level=? WHERE id=?",
            [$level, $inventoryId]
        );
    }

    public function updateInventoryCurrentValue($inventoryId, $currentValue)
    {
        $this->execute(
            "UPDATE inventory SET current_value=? WHERE id=?",
            [$currentValue, $inventoryId]
        );
    }

    public function removeItemFromPerson($personId, $itemId)
    {
        $this->execute(
            "DELETE FROM inventory WHERE person_id=? AND item_id=?",
            [$personId, $itemId]
        );
    }

    public function getInventoryByPerson($personId)
    {
        return $this->queryAll(
            "SELECT 
                    inventory.id,
                    inventory.level,
                    inventory.current_value,
                    items.name,
                    items.type,
                    items.cost,
                    items.value
            FROM inventory
            JOIN items ON items.id = inventory.item_id
            WHERE inventory.person_id = ?",
            [$personId]
        );
    }

    public function getInventoryById($itemId)
    {
        return $this->query(
            "SELECT 
                    inventory.id,
                    inventory.person_id,
                    inventory.level,
                    inventory.current_value,
                    items.name,
                    items.type,
                    items.cost,
                    items.value
            FROM inventory
            JOIN items ON items.id = inventory.item_id
            WHERE inventory.id = ?",
            [$itemId]
        );
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
