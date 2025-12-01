<?php
class Person {
    private $db;
    
    function __construct($db) {
        $this->db = $db;
    }
    
    public function getPerson($userId) {
        $person = $this->db->getUserPerson($userId);
        return [
            'hp' => $person->hp,
            'happines' => $person->happines,
            'status' => $person->status,
        ];
    }
    
   public function getInventory($userId) {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            $this->db->createPerson($userId);
            $person = $this->db->getUserPerson($userId);
        }

        $inventory = $this->db->getInventoryByPerson($person->id);
        if (!$inventory) {
            return [];
        }

        $result = array_map(
            function($item) {
                return [
                    'id'            => $item['id'],
                    'type'          => $item['type'],
                    'name'          => $item['name'],
                    'level'         => $item['level'],
                    'current_value' => $item['current_value']
                ];
            },
            $inventory
        );
        return $result ?: [];
    }
    
   public function puff($userId, $itemId) {
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

        if ($item['current_value'] <= 0) {
            return ['error' => 905];
        }

        $this->consumeItem($person->id, $itemId, $item['current_value']);

        $this->applyPuffEffects($person, $item['level'], $userId);

        return $this->getPerson($userId);
    }

    
    private function findItemInInventory($personId, $itemId) {
        $inventory = $this->db->getInventoryByPerson($personId);
        
        foreach ($inventory as $inv) {
            if ($inv['id'] == $itemId) {
                return $inv;
            }
        }
        return null;
    }
    
    private function consumeItem($personId, $itemId, $currentValue) {
        if ($currentValue <= 0) {
            return;
        }

        $newValue = $currentValue - 1;
        
        $this->db->updateInventoryCurrentValue($itemId, max(0, $newValue));
    }
    
    private function applyPuffEffects($person, $level, $userId) {
        $hpDamage      = 2 + $level;
        $happinessGain = round(5 + ($level * 1.5));
        
        $person->hp       -= $hpDamage;
        $person->happines += $happinessGain;

        $this->db->updatePersonHP($person->id, $person->hp);
        $this->db->updatePersonHappines($person->id, $person->happines);

        $this->isDead($userId);
    }

    
    public function update($userId, $happinessDecayRate, $decayInterval) {
        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        if ($person->status === 'dead') {
            return $this->getPerson($userId);
        }

        $lastUpdate   = strtotime($person->last_update);
        $currentTime  = time();
        $timePassed   = $currentTime - $lastUpdate;

        if ($timePassed <= 0) {
            return $this->getPerson($userId);
        }

        $intervalsPassed = floor($timePassed / $decayInterval);
        if ($intervalsPassed <= 0) {
            return $this->getPerson($userId);
        }

        $H0 = $person->happines;
        $happinessLost = $intervalsPassed * $happinessDecayRate;
        $H1 = $H0 - $happinessLost;

        if ($H1 <= 0) {
            $intervalsToDeath = (int)ceil($H0 / $happinessDecayRate);
            $deathTs = $lastUpdate + $intervalsToDeath * $decayInterval;
            $this->db->updatePersonHappines($person->id, 0);
            $this->killPerson($person->id, $deathTs);
        } else {
            $this->db->updatePersonHappines($person->id, $H1);
            $this->db->updatePersonLastUpdate($person->id);
        }

        return $this->getPerson($userId);
    }
    
    public function getRating($userId) {
        $persons = $this->db->getAllPersonsWithUsers();

        if (!$persons || count($persons) === 0) {
            return ['error' => 9000];
        }

        $now = time();
        $rating = [];

        foreach ($persons as $p) {
            $createdTs = strtotime($p['created']);

            if ($p['status'] === 'dead') {
                $deathTs = strtotime($p['last_update']);
                $aliveSeconds = max(0, $deathTs - $createdTs);
            } else {
                $aliveSeconds = max(0, $now - $createdTs);
            }

            $rating[] = [
                'user_id'       => (int)$p['user_id'],
                'username'      => $p['username'],
                'person_id'     => (int)$p['id'],
                'status'        => $p['status'],
                'hp'            => (int)$p['hp'],
                'happines'      => (int)$p['happines'],
                'alive_seconds' => $aliveSeconds,
            ];
        }

        usort($rating, function($a, $b) {
            $aAlive = ($a['status'] === 'alive');
            $bAlive = ($b['status'] === 'alive');

            if ($aAlive && !$bAlive) return -1;
            if (!$aAlive && $bAlive) return 1;

            if ($a['alive_seconds'] == $b['alive_seconds']) return 0;
            return ($a['alive_seconds'] > $b['alive_seconds']) ? -1 : 1;
        });

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
            'user'   => $userPosition
        ];
    }
    
    private function resurrect() {

    }

    private function killPerson($personId, $deathTimeTs = null) {
        if ($deathTimeTs === null) {
            $deathTimeTs = time();
        }


        $this->db->updatePersonHP($personId, 0);
        $this->db->updatePersonHappines($personId, 0);
        $this->db->updatePersonStatus($personId, 'dead');
        $this->db->updatePersonLastUpdate($personId, $deathTimeTs);
    }


    private function isDead($userId) {
        $person = $this->db->getUserPerson($userId);
        
        if ($person->status == 'dead') {
            return true;
        }
        
        if ($person->happines <= 0 || $person->hp <= 0) {
            $this->killPerson($person->id);
            return true;
        }
        
        return false;
    }
}
