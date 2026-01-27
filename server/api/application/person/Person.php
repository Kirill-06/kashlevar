<?php

class Person
{
    private DB $db;

    public function __construct(DB $db)
    {
        $this->db = $db;
    }

    public function getPerson(int $userId): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        return [
            'hp'       => (int)$person->hp,
            'happines' => (int)$person->happines,
            'status'   => (string)$person->status,
        ];
    }

    public function getInventory(int $userId): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            $this->db->createPerson($userId);
            $person = $this->db->getUserPerson($userId);
        }

        $inventory = $this->db->getInventoryByPerson($person->id);
        if (!$inventory) {
            return [];
        }

        return array_values(
            array_map(
                static function (array $item): array {
                    return [
                        'id'            => $item['id'],
                        'type'          => $item['type'],
                        'name'          => $item['name'],
                        'level'         => $item['level'],
                        'current_value' => $item['current_value'],
                    ];
                },
                $inventory
            )
        );
    }

    public function puff(int $userId, int $itemId): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        if ($this->isDead($userId)) {
            return $this->getPerson($userId);
        }

        $item = $this->findItemInInventory($person->id, $itemId);
        if (!$item) {
            return ['error' => 902];
        }

        if ((int)$item['current_value'] <= 0) {
            return ['error' => 905];
        }

        $this->consumeItem($itemId, (int)$item['current_value']);
        $this->applyPuffEffects($person, (int)$item['level'], $userId);

        return $this->getPerson($userId);
    }

    public function update(
        int $userId,
        int $happinessDecayRate = PersonConfig::DEFAULT_HAPPINESS_DECAY_RATE,
        int $decayInterval = PersonConfig::DEFAULT_DECAY_INTERVAL
    ): array {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        if ($person->status === PersonConfig::STATUS_DEAD || $person->status === PersonConfig::STATUS_IN_HELL) {
            return $this->getPerson($userId);
        }

        $lastUpdate = strtotime((string)$person->last_update);
        $now = time();
        $timePassed = $now - $lastUpdate;

        if ($timePassed <= 0) {
            return $this->getPerson($userId);
        }

        $intervalsPassed = (int)floor($timePassed / $decayInterval);
        if ($intervalsPassed <= 0) {
            return $this->getPerson($userId);
        }

        $h0 = (int)$person->happines;
        $h1 = PersonRules::happinessAfterDecay($h0, $intervalsPassed, $happinessDecayRate);

        if ($h1 <= 0) {
            $intervalsToZero = PersonRules::intervalsToZero($h0, $happinessDecayRate);
            $zeroTs = $lastUpdate + ($intervalsToZero * $decayInterval);

            $this->db->updatePersonHappines($person->id, 0);

            if ($person->status === PersonConfig::STATUS_ALIVE) {
                $this->moveToHell($person->id, $zeroTs);
            } elseif ($person->status === PersonConfig::STATUS_RESURRECTED) {
                $this->db->deletePerson($person->id);
                $this->db->createPerson($userId);
            }

            return $this->getPerson($userId);
        }

        $this->db->updatePersonHappines($person->id, $h1);
        $this->db->updatePersonLastUpdate($person->id);

        return $this->getPerson($userId);
    }

    public function getRating(
        int $userId,
        int $happinessDecayRate = PersonConfig::DEFAULT_HAPPINESS_DECAY_RATE,
        int $decayInterval = PersonConfig::DEFAULT_DECAY_INTERVAL
    ): array {
        $persons = $this->db->getAllPersonsWithUsers();
        if (!$persons || count($persons) === 0) {
            return ['error' => 9000];
        }

        $now = time();
        $rating = [];

        foreach ($persons as $p) {
            $proj = $this->projectStateForRating($p, $now, $happinessDecayRate, $decayInterval);

            $rating[] = [
                'user_id'       => (int)$p['user_id'],
                'username'      => $p['username'],
                'person_id'     => (int)$p['id'],
                'status'        => $proj['status'],
                'hp'            => (int)$proj['hp'],
                'happines'      => (int)$proj['happines'],
                'alive_seconds' => (int)$proj['alive_seconds'],
            ];
        }

        usort(
            $rating,
            static function (array $a, array $b): int {
                $aAlive = ($a['status'] === PersonConfig::STATUS_ALIVE || $a['status'] === PersonConfig::STATUS_RESURRECTED);
                $bAlive = ($b['status'] === PersonConfig::STATUS_ALIVE || $b['status'] === PersonConfig::STATUS_RESURRECTED);

                if ($aAlive && !$bAlive) {
                    return -1;
                }
                if (!$aAlive && $bAlive) {
                    return 1;
                }
                if ($a['alive_seconds'] === $b['alive_seconds']) {
                    return 0;
                }

                return ($a['alive_seconds'] > $b['alive_seconds']) ? -1 : 1;
            }
        );

        $userPosition = null;
        foreach ($rating as $index => &$row) {
            $row['position'] = $index + 1;

            if ($row['user_id'] === (int)$userId) {
                $userPosition = [
                    'user_id'       => $row['user_id'],
                    'username'      => $row['username'],
                    'person_id'     => $row['person_id'],
                    'position'      => $row['position'],
                    'alive_seconds' => $row['alive_seconds'],
                    'status'        => $row['status'],
                ];
            }
        }
        unset($row);

        return [
            'rating' => $rating,
            'user'   => $userPosition,
        ];
    }

    public function resurrectFromHell(int $userId): array
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        $this->db->updatePersonHP($person->id, PersonConfig::DEFAULT_HP);
        $this->db->updatePersonHappines($person->id, PersonConfig::DEFAULT_HAPPINESS);
        $this->db->updatePersonStatus($person->id, PersonConfig::STATUS_RESURRECTED);
        $this->db->setPersonActive($person->id, 1);
        $this->db->updatePersonLastUpdate($person->id);

        return [
            'id'       => $person->id,
            'status'   => PersonConfig::STATUS_RESURRECTED,
            'hp'       => PersonConfig::DEFAULT_HP,
            'happines' => PersonConfig::DEFAULT_HAPPINESS,
        ];
    }

    private function projectStateForRating(array $p, int $now, int $happinessDecayRate, int $decayInterval): array
    {
        $createdTs = strtotime($p['created'] ?? 'now');
        $lastUpdateTs = strtotime($p['last_update'] ?? $p['created'] ?? 'now');

        $hp = (int)($p['hp'] ?? 0);
        $h = (int)($p['happines'] ?? 0);
        $status = (string)($p['status'] ?? PersonConfig::STATUS_ALIVE);

        if ($status === PersonConfig::STATUS_DEAD || $status === PersonConfig::STATUS_IN_HELL) {
            $deathTs = $lastUpdateTs ?: $now;

            return [
                'hp'            => 0,
                'happines'      => 0,
                'status'        => $status,
                'alive_seconds' => max(0, $deathTs - $createdTs),
            ];
        }

        if ($hp <= 0 || $h <= 0) {
            $deathTs = $lastUpdateTs ?: $now;

            return [
                'hp'            => 0,
                'happines'      => 0,
                'status'        => PersonConfig::STATUS_DEAD,
                'alive_seconds' => max(0, $deathTs - $createdTs),
            ];
        }

        $timePassed = $now - $lastUpdateTs;
        if ($timePassed <= 0) {
            return [
                'hp'            => $hp,
                'happines'      => $h,
                'status'        => $status,
                'alive_seconds' => max(0, $now - $createdTs),
            ];
        }

        $intervalsPassed = (int)floor($timePassed / $decayInterval);
        if ($intervalsPassed <= 0) {
            return [
                'hp'            => $hp,
                'happines'      => $h,
                'status'        => $status,
                'alive_seconds' => max(0, $now - $createdTs),
            ];
        }

        $h1 = PersonRules::happinessAfterDecay($h, $intervalsPassed, $happinessDecayRate);
        if ($h1 <= 0) {
            $intervalsToZero = PersonRules::intervalsToZero($h, $happinessDecayRate);
            $zeroTs = $lastUpdateTs + ($intervalsToZero * $decayInterval);

            return [
                'hp'            => 0,
                'happines'      => 0,
                'status'        => PersonConfig::STATUS_DEAD,
                'alive_seconds' => max(0, $zeroTs - $createdTs),
            ];
        }

        return [
            'hp'            => $hp,
            'happines'      => (int)$h1,
            'status'        => $status,
            'alive_seconds' => max(0, $now - $createdTs),
        ];
    }

    private function findItemInInventory(int $personId, int $inventoryId)
    {
        $inventory = $this->db->getInventoryByPerson($personId);
        if (!$inventory) {
            return null;
        }

        foreach ($inventory as $inv) {
            if ((int)$inv['id'] === $inventoryId) {
                return $inv;
            }
        }

        return null;
    }

    private function consumeItem(int $inventoryId, int $currentValue): void
    {
        $newValue = max(0, $currentValue - 1);
        $this->db->updateInventoryCurrentValue($inventoryId, $newValue);
    }

    private function applyPuffEffects($person, int $level, int $userId): void
    {
        $hpDamage = PersonRules::puffHpDamage($level);
        $happinessGain = PersonRules::puffHappinessGain($level);

        $person->hp -= $hpDamage;
        $person->happines += $happinessGain;

        $this->db->updatePersonHP($person->id, $person->hp);
        $this->db->updatePersonHappines($person->id, $person->happines);

        $this->isDead($userId);
    }

    private function isDead(int $userId): bool
    {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return true;
        }

        if ($person->status === PersonConfig::STATUS_DEAD || $person->status === PersonConfig::STATUS_IN_HELL) {
            return true;
        }

        if (
            $person->status === PersonConfig::STATUS_RESURRECTED
            && ((int)$person->happines <= 0 || (int)$person->hp <= 0)
        ) {
            $this->db->deletePerson($person->id);
            $this->db->createPerson($userId);

            return true;
        }

        if (
            $person->status === PersonConfig::STATUS_ALIVE
            && ((int)$person->happines <= 0 || (int)$person->hp <= 0)
        ) {
            $this->moveToHell($person->id);

            return true;
        }

        return false;
    }

    private function moveToHell(int $personId, ?int $timeTs = null): void
    {
        $timeTs = $timeTs ?? time();

        $this->db->updatePersonHP($personId, 0);
        $this->db->updatePersonHappines($personId, 0);
        $this->db->updatePersonStatus($personId, PersonConfig::STATUS_IN_HELL);
        $this->db->updatePersonLastUpdate($personId, $timeTs);
    }
}
