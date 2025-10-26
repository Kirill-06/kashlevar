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
        $result = array_map(
            function($item) {
                return [
                    'id' => $item['id'],
                    'type' => $item['type'],
                    'name' =>  $item['name'],
                    'level' => $item['level'],
                    'current_value' => $item['current_value']
                ];
            }, $inventory);
       
        if (!$result) {
            return ['error' => 900];
        }
        return $result;
    }
    
    public function puff($userId, $itemId) {
        $person = $this->db->getUserPerson($userId);
        
        if ($this->isDead($person->id)) {
            return ['error' => 901];
        }
        
        $item = $this->findItemInInventory($person->id, $itemId);
        if (!$item) {
            return ['error' => 800];
        }
        
        $this->consumeItem($person->id, $itemId, $item->current_value);
        $this->applyPuffEffects($person, $item->level);
        
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
        $newValue = $currentValue - 1;
        
        if ($newValue <= 0) {
            $this->db->removeItemFromPerson($personId, $itemId);
        } else {
            $this->db->updateInventoryCurrentValue($itemId, $newValue);
        }
    }
    
    private function applyPuffEffects($person, $level) {
        $hpDamage = 2 + $level;
        $happinessGain = round(5 + ($level * 1.5));
        
        $person->hp -= $hpDamage;
        $person->happines += $happinessGain;

        if ($person->hp <= 0 || $person->happines <= 0) {
            $this->killPerson($person->id);
            return;
        }

        $this->db->updatePersonHP($person->id, $person->hp);
        $this->db->updatePersonHappines($person->id, $person->happines);
    }
    
    public function update($userId, $happinessDecayRate, $decayInterval) {
        $person = $this->db->getUserPerson($userId);
        
        if ($this->isDead($userId)) {
            return ['error' => 901];
        }
        
        $lastUpdate = strtotime($person->last_update);
        $currentTime = time();
        $timePassed = $currentTime - $lastUpdate;
        
        $happinessLost = floor($timePassed / $decayInterval) * $happinessDecayRate;
        
        if ($happinessLost > 0) {
            $newHappines = $person->happines - $happinessLost;
            $this->db->updatePersonHappines($person->id, $newHappines);
            $this->db->updatePersonLastUpdate($person->id);
            $this->killPerson($person->id);
        }
        
        return $this->getPerson($userId);
    }
    
    public function getRating() {

    }
    
    private function resurrect() {

    }

    private function killPerson($personId) {
        $this->db->updatePersonHP($personId, 0);
        $this->db->updatePersonStatus($personId, 'dead');
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
