<?php

class DB
{
    private $pdo;

    public function __construct()
    {
        $host = getenv('POSTGRES_HOST') ?: 'postgres';
        $port = getenv('POSTGRES_PORT') ?: '5432';
        $user = getenv('POSTGRES_USER') ?: 'messenger';
        $pass = getenv('POSTGRES_PASSWORD') ?: 'messenger';
        $db = getenv('POSTGRES_DB') ?: 'messenger';

        $dsn = "pgsql:host=$host;port=$port;dbname=$db;";
        $this->pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    }

    public function __destruct()
    {
        $this->pdo = null;
    }

    public function getUserByUserName($username)
    {
        return $this->query('SELECT * FROM users WHERE username=?', [$username]);
    }

    public function getUserByToken($token)
    {
        return $this->query('SELECT * FROM users WHERE token=?', [$token]);
    }

    public function getUserById($userId)
    {
        return $this->query('SELECT * FROM users WHERE id=?', [$userId]);
    }

    public function updateToken($userId, $token)
    {
        $this->execute('UPDATE users SET token=? WHERE id=?', [$token, $userId]);
    }

    public function updateUserMoney($userId, $coins)
    {
        $this->execute('UPDATE users SET money=? WHERE id=?', [$coins, $userId]);
    }

    public function addMoneyToUser(int $userId, int $amount): void
    {
        if ($amount <= 0) {
            return;
        }

        $this->execute('UPDATE users SET money = money + ? WHERE id = ?', [$amount, $userId]);
    }

    public function registration($username, $hash_password)
    {
        $this->execute('INSERT INTO users (username, hash_password) VALUES (?, ?)', [$username, $hash_password]);
        $userId = $this->pdo->lastInsertId();
        $this->createPerson($userId);
    }

    public function getPersonById($personId)
    {
        return $this->query('SELECT * FROM persons WHERE id=?', [$personId]);
    }

    public function createPerson($userId)
    {
        $this->execute('INSERT INTO persons (user_id) VALUES (?)', [$userId]);
    }

    public function deletePerson($personId)
    {
        $this->execute('DELETE FROM persons WHERE id=?', [$personId]);
    }

    public function getUserPerson($userId)
    {
        return $this->query('SELECT * FROM persons WHERE user_id=?', [$userId]);
    }

    public function updatePersonHP($personId, $hp)
    {
        $this->execute('UPDATE persons SET hp=? WHERE id=?', [max(0, min(100, $hp)), $personId]);
    }

    public function updatePersonHappines($personId, $happines)
    {
        $this->execute('UPDATE persons SET happines=? WHERE id=?', [max(0, min(100, $happines)), $personId]);
    }

    public function updatePersonStatus($personId, $status)
    {
        $this->execute('UPDATE persons SET status=? WHERE id=?', [$status, $personId]);
    }

    public function setPersonActive($personId, $active)
    {
        $this->execute('UPDATE persons SET active=? WHERE id=?', [$active, $personId]);
    }

    public function updatePersonLastUpdate($personId, $timestamp = null)
    {
        if ($timestamp === null) {
            $this->execute('UPDATE persons SET last_update=CURRENT_TIMESTAMP WHERE id=?', [$personId]);
            return;
        }

        $date = date('Y-m-d H:i:s', $timestamp);
        $this->execute('UPDATE persons SET last_update=? WHERE id=?', [$date, $personId]);
    }

    public function updatePersonCoords($personId, $x, $y, $direction, $moveStatus)
    {
        $this->execute(
            'UPDATE persons SET x=?, y=?, direction=?, moveStatus=?, last_update=CURRENT_TIMESTAMP WHERE id=?',
            [$x, $y, $direction, $moveStatus, $personId]
        );
    }

    public function healPersonByUserId(int $userId, int $amount): void
    {
        if ($amount <= 0) {
            return;
        }

        $this->execute('UPDATE persons SET hp = LEAST(100, hp + ?) WHERE user_id = ?', [$amount, $userId]);
    }

    public function getCatalogItems()
    {
        return $this->queryAll('SELECT * FROM items');
    }

    public function getItemById($itemId)
    {
        return $this->query('SELECT * FROM items WHERE id=?', [$itemId]);
    }

    public function addItemToPerson($personId, $itemId, $level, $currentValue)
    {
        $this->execute(
            'INSERT INTO inventory (person_id, item_id, level, current_value) VALUES (?, ?, ?, ?)',
            [$personId, $itemId, $level, $currentValue]
        );
    }

    public function updateInventoryLevel($inventoryId, $level)
    {
        $this->execute('UPDATE inventory SET level=? WHERE id=?', [$level, $inventoryId]);
    }

    public function updateInventoryCurrentValue($inventoryId, $currentValue)
    {
        $this->execute('UPDATE inventory SET current_value=? WHERE id=?', [$currentValue, $inventoryId]);
    }

    public function removeItemFromPerson($personId, $itemId)
    {
        $this->execute('DELETE FROM inventory WHERE person_id=? AND item_id=?', [$personId, $itemId]);
    }

    public function getInventoryByPerson($personId)
    {
        return $this->queryAll(
            'SELECT 
                    inventory.id,
                    inventory.item_id,
                    inventory.level,
                    inventory.current_value,
                    items.name,
                    items.type,
                    items.cost,
                    items.value
            FROM inventory
            JOIN items ON items.id = inventory.item_id
            WHERE inventory.person_id = ?',
            [$personId]
        );
    }

    public function getInventoryById($inventoryId)
    {
        return $this->query(
            'SELECT 
                    inventory.id,
                    inventory.person_id,
                    inventory.item_id,
                    inventory.level,
                    inventory.current_value,
                    items.name,
                    items.type,
                    items.cost,
                    items.value
            FROM inventory
            JOIN items ON items.id = inventory.item_id
            WHERE inventory.id = ?',
            [$inventoryId]
        );
    }

    public function getChatHash()
    {
        return $this->query('SELECT * FROM hashes WHERE id=1');
    }

    public function updateChatHash($hash)
    {
        $this->execute('UPDATE hashes SET chat_hash=? WHERE id=1', [$hash]);
    }

    public function addMessage($userId, $message)
    {
        $this->execute('INSERT INTO messages (user_id, message, created) VALUES (?,?, now())', [$userId, $message]);
    }

    public function getMessages()
    {
        return $this->queryAll(
            'SELECT 
                u.username AS author,
                m.message AS message,
                m.created AS created
            FROM messages AS m 
            LEFT JOIN users AS u ON u.id = m.user_id 
            ORDER BY m.created DESC'
        );
    }

    public function getAllPersonsWithUsers()
    {
        return $this->queryAll(
            'SELECT 
                p.id,
                p.user_id,
                p.hp,
                p.happines,
                p.created,
                p.last_update,
                p.status,
                p.active,
                u.username
            FROM persons p
            JOIN users u ON u.id = p.user_id'
        );
    }

    public function getActiveTowerPersons(): array
    {
        return $this->queryAll(
            'SELECT
                p.id            AS person_id,
                p.user_id       AS user_id,
                u.username      AS username,
                p.x             AS x,
                p.y             AS y,
                p.direction     AS direction,
                p.movestatus    AS movestatus,
                p.hp            AS hp,
                p.happines      AS happines,
                p.status        AS status
            FROM persons p
            JOIN users u ON u.id = p.user_id
            WHERE p.active = 1
            ORDER BY p.id ASC'
        );
    }

    public function getPersonPositionByUserId(int $userId)
    {
        return $this->query('SELECT id, user_id, x, y FROM persons WHERE user_id = ?', [$userId]);
    }

    public function countAvailableTowerDrops(string $kind): int
    {
        $row = $this->query(
            "SELECT COUNT(*) AS c FROM tower_drops WHERE picked_by IS NULL AND kind=?",
            [$kind]
        );

        return $row ? (int)$row->c : 0;
    }

    public function insertTowerDrop(string $kind, int $value, float $x, float $y): void
    {
        $this->execute(
            'INSERT INTO tower_drops (kind, value, x, y, picked_by, picked_at, expires_at) VALUES (?, ?, ?, ?, NULL, NULL, NULL)',
            [$kind, $value, $x, $y]
        );
    }

    public function getTowerDropsInRange(float $yMin, float $yMax): array
    {
        return $this->queryAll(
            'SELECT id, kind, value, x, y
             FROM tower_drops
             WHERE picked_by IS NULL
               AND y >= ?
               AND y <= ?
             ORDER BY id ASC',
            [$yMin, $yMax]
        );
    }

    public function getTowerDropsNear(float $x, float $y, float $radius, int $limit): array
    {
        return $this->queryAll(
            'SELECT id, kind, value, x, y
             FROM tower_drops
             WHERE picked_by IS NULL
               AND ABS(x - ?) <= ?
               AND ABS(y - ?) <= ?
             LIMIT ?',
            [$x, $radius, $y, $radius, $limit]
        );
    }

    public function deleteTowerDropIfUnpicked(int $dropId): bool
    {
        return (bool)$this->execute('DELETE FROM tower_drops WHERE id = ? AND picked_by IS NULL', [$dropId]);
    }

    public function cleanupExpiredDrops(): void
    {
        $this->execute(
            'DELETE FROM tower_drops
             WHERE picked_by IS NULL
               AND expires_at IS NOT NULL
               AND expires_at <= NOW()'
        );
    }

    private function execute($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        return $sth->execute($params);
    }

    private function query($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetch(PDO::FETCH_OBJ);
    }

    private function queryAll($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetchAll(PDO::FETCH_ASSOC);
    }
}
