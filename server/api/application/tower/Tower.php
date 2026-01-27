<?php

class Tower
{
    private DB $db;

    public function __construct(DB $db)
    {
        $this->db = $db;
    }

    public function goToTower(int $userId): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            $this->db->createPerson($userId);
            $person = $this->db->getUserPerson($userId);
        }

        if (isset($person->hp) && (int)$person->hp <= 0) {
            $this->db->updatePersonHP($person->id, PersonConfig::DEFAULT_HP);
        }

        $this->db->setPersonActive($person->id, 1);

        $x = TowerConfig::SPAWN_X;
        $y = TowerConfig::SPAWN_Y;

        $this->db->updatePersonCoords($person->id, $x, $y, 'right', 'stand');

        return ['active' => true, 'x' => $x, 'y' => $y];
    }

    public function leaveTower(int $userId): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        $this->db->setPersonActive($person->id, 0);
        $this->db->updatePersonCoords($person->id, $person->x, $person->y, $person->direction, 'stand');

        return ['active' => false];
    }

    public function movePerson(int $userId, float $x, float $y, string $direction, string $moveStatus): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        if ((int)$person->active !== 1) {
            return ['error' => 903];
        }

        if (isset($person->hp) && (int)$person->hp <= 0) {
            return ['error' => 903];
        }

        $direction = $this->sanitizeDirection($direction);
        $moveStatus = $this->sanitizeMoveStatus($moveStatus);

        $maxDelta = TowerConfig::MAX_MOVE_DELTA;
        if (abs($x - (float)$person->x) > $maxDelta || abs($y - (float)$person->y) > $maxDelta) {
            $x = (float)$person->x;
            $y = (float)$person->y;
        }

        $this->db->updatePersonCoords($person->id, $x, $y, $direction, $moveStatus);

        return ['x' => $x, 'y' => $y, 'direction' => $direction, 'moveStatus' => $moveStatus];
    }

    public function updateScene(int $userId, string $personsHash, string $itemsHash): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        if ((int)$person->active !== 1) {
            return ['error' => 903];
        }

        if (isset($person->hp) && (int)$person->hp <= 0) {
            return ['error' => 903];
        }

        $picked = $this->pickDropsNearUser($userId);
        $this->ensureTowerDrops(TowerConfig::DROPS_TARGET_COINS, TowerConfig::DROPS_TARGET_TABLETS);

        $persons = $this->db->getActiveTowerPersons();

        $py = isset($person->y) ? (float)$person->y : 0.0;
        $yMin = max(0.0, $py - TowerConfig::VIEW_Y_BELOW);
        $yMax = $py + TowerConfig::VIEW_Y_ABOVE;
        $items = $this->db->getTowerDropsInRange($yMin, $yMax);

        $personsHashNew = $this->hashArray($persons);
        $itemsHashNew = $this->hashArray($items);

        $resp = [
            'personsHash' => $personsHashNew,
            'itemsHash' => $itemsHashNew,
        ];

        if ($personsHashNew !== ($personsHash ?? '')) {
            $resp['persons'] = $persons;
        }

        if ($itemsHashNew !== ($itemsHash ?? '')) {
            $resp['items'] = $items;
        }

        if (!empty($picked) && !empty($picked['picked_ids'])) {
            $resp['picked'] = $picked;
        }

        return $resp;
    }

    private function ensureTowerDrops(int $targetCoins, int $targetTablets): void
    {
        $coins = $this->db->countAvailableTowerDrops('coin');
        $tabs  = $this->db->countAvailableTowerDrops('tablet');

        $needCoins = max(0, $targetCoins - $coins);
        $needTabs  = max(0, $targetTablets - $tabs);

        $maxCoinsPerTick = 8;
        $maxTabsPerTick  = 4;

        $needCoins = min($needCoins, $maxCoinsPerTick);
        $needTabs  = min($needTabs, $maxTabsPerTick);

        for ($i = 0; $i < $needCoins; $i++) {
            [$x, $y] = $this->randomDropPosition();
            $val = random_int(TowerConfig::COIN_VALUE_MIN, TowerConfig::COIN_VALUE_MAX);
            $this->db->insertTowerDrop('coin', $val, $x, $y);
        }

        for ($i = 0; $i < $needTabs; $i++) {
            [$x, $y] = $this->randomDropPosition();
            $this->db->insertTowerDrop('tablet', TowerConfig::TABLET_VALUE, $x, $y);
        }
    }

    private function randomDropPosition(): array
    {
        $shaftTiles = TowerConfig::DROP_SHAFT_TILES;
        $floorGap = TowerConfig::DROP_FLOOR_GAP;
        $floorOffset = TowerConfig::DROP_FLOOR_OFFSET;
        $maxFloorIndex = TowerConfig::DROP_MAX_FLOOR_INDEX;

        $u = random_int(0, 1000000) / 1000000;

        if ($u < TowerConfig::DROP_BIAS_THRESHOLD) {
            $localMax = TowerConfig::DROP_LOCAL_MAX;
            $v = random_int(0, 1000000) / 1000000;
            $floorIndex = (int)floor(($v * $v) * $localMax);
        } else {
            $v = random_int(0, 1000000) / 1000000;
            $floorIndex = (int)floor(($v * $v) * $maxFloorIndex);
        }

        $x = (float)(random_int(0, $shaftTiles - 1) + 0.5);
        $y = (float)($floorOffset + $floorIndex * $floorGap);

        return [$x, $y];
    }

    private function pickDropsNearUser(int $userId): array
    {
        $person = $this->db->getPersonPositionByUserId($userId);
        if (!$person) {
            return [];
        }

        $px = (float)$person->x;
        $py = (float)$person->y;

        $drops = $this->db->getTowerDropsNear($px, $py, TowerConfig::PICK_RADIUS, TowerConfig::PICK_QUERY_LIMIT);
        if (!$drops) {
            return [];
        }

        $coinsSum = 0;
        $healSum = 0;
        $pickedIds = [];

        foreach ($drops as $d) {
            $id = (int)$d['id'];
            if (!$this->db->deleteTowerDropIfUnpicked($id)) {
                continue;
            }

            $pickedIds[] = $id;

            if ($d['kind'] === 'coin') {
                $coinsSum += (int)$d['value'];
                continue;
            }

            if ($d['kind'] === 'tablet') {
                $healSum += (int)$d['value'];
            }
        }

        $this->db->addMoneyToUser($userId, $coinsSum);
        $this->db->healPersonByUserId($userId, $healSum);

        return [
            'picked_ids' => $pickedIds,
            'coins' => $coinsSum,
            'heal' => $healSum,
        ];
    }

    private function sanitizeDirection(string $d): string
    {
        $allowed = ['left', 'right', 'up', 'down'];
        return in_array($d, $allowed, true) ? $d : 'right';
    }

    private function sanitizeMoveStatus(string $s): string
    {
        $allowed = ['move', 'stand', 'jump'];
        return in_array($s, $allowed, true) ? $s : 'stand';
    }

    private function hashArray(array $arr): string
    {
        return md5(json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION));
    }
}
