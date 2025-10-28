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

    public function upgradeItem($userId, $itemId) 
    {
        
    }
}
