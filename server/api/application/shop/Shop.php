<?php

class Shop {
    private $db;

    function __construct($db) 
    {
        $this->db = $db;
    }

    public function getCatalog() 
    {
        $catalog = $this->db->getCatalogItems();
        $result = array_map(
            function($item) {
                return [
                    'id' => $item['id'],
                    'name' =>  $item['name'],
                    'cost' => $item['cost'],
                    'type' => $item['type'],
                    'value' => $item['value']
                ];
            }, $catalog);
       
        if (!$result) {
            return ['error' => 1010];
        }
        return $result;
    }

    public function buy($userId, $itemId) 
    {
        $item = $this->db->getItemById($itemId);
        if (!$item) {
            return ['error' => 1011];
        }
        
        $person = $this->db->getUserPerson($userId);

        $inventory = $this->db->getInventoryByPerson($person->id);
        foreach ($inventory as $inv) {
            if ($inv->item_id == $itemId) {
                return ['error' => 1012];
            }
        }

        $user = $this->db->getUserById($userId);
        if ($user->money < $item->cost) {
            return ['error' => 1013];
        }

        $user->money -= $item->cost;
        $this->db->updateUserMoney($userId, $user->money);
        $this->db->addItemToPerson($person->id, $itemId, $item->base_level, $item->value);
    }

    
    public function upgradeCost($personId)
    {
        $inventory = $this->db->getInventoryByPerson($personId);

        $items = array_map(
            function($item) {
                $currentLevel = $item['level'] + 1;
                $upgradeCost = round($item['cost'] / 2 + (1.6 * ($currentLevel ^ 2)));

                return [
                    'id' => $item['id'],
                    'cost' => $upgradeCost,
                    'level' => $currentLevel
                ];
            }, 
            $inventory
        );

        if (empty($items)) {
            return ['error' => 1015];
        }

        return $items;
    }

    public function upgradeItem($userId, $itemId) 
    {
        $user = $this->db->getUserById($userId);
        $person = $this->db->getUserPerson($userId);
        $item = $this->db->getInventoryById($itemId);
        if (!$item){
            return ['error' => 1014];
        }
        
        foreach ($this->upgradeCost($person->id) as $item){

            if ($item['id'] == $itemId){
                $costUpgrage = $item['cost'];
                break;
            }
        }

        if ($user->money < $costUpgrage){
            return ['error' => 1013];
        }
        $user->money -= $costUpgrage;

        $this->db->updateUserMoney($userId, $user->money);
        $this->db->updateInventoryLevel($itemId, $item['level']);

        return [
            'itemId' => $item['id'],
            'level' => $item['level']
        ];
    }

    public function refillItem($userId, $itemId)
    {
        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ['error' => 705];
        }

        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        $inventoryItem = $this->db->getInventoryById($itemId);
        if (!$inventoryItem) {
            return ['error' => 1016];
        }

        if ($inventoryItem->person_id != $person->id) {
            return ['error' => 1016];
        }

        if ($inventoryItem->type !== 'vape') {
            return ['error' => 800];
        }

        $refillCost = round($inventoryItem->cost / 4);

        if ($user->money < $refillCost) {
            return ['error' => 1013];
        }

        $user->money -= $refillCost;
        $this->db->updateUserMoney($userId, $user->money);

        $fullValue = $inventoryItem->value;
        $this->db->updateInventoryCurrentValue($itemId, $fullValue);

        return [
            'itemId'        => $inventoryItem->id,
            'current_value' => $fullValue,
            'money'         => $user->money,
            'refill_cost'   => $refillCost
        ];
    }
}
