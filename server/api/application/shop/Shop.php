<?php

class Shop
{
    private DB $db;

    public function __construct(DB $db)
    {
        $this->db = $db;
    }

    public function getCatalog(): array
    {
        $catalog = $this->db->getCatalogItems();

        $result = array_map(
            static function (array $item): array {
                return [
                    'id'    => $item['id'],
                    'name'  => $item['name'],
                    'cost'  => $item['cost'],
                    'type'  => $item['type'],
                    'value' => $item['value'],
                ];
            },
            $catalog
        );

        if (!$result) {
            return ['error' => 1010];
        }

        return $result;
    }

    public function buy(int $userId, int $itemId)
    {
        $item = $this->db->getItemById($itemId);
        if (!$item) {
            return ['error' => 1011];
        }

        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        $inventory = $this->db->getInventoryByPerson($person->id);
        foreach ($inventory as $inv) {
            if ((int)($inv['item_id'] ?? 0) === $itemId) {
                return ['error' => 1012];
            }
        }

        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ['error' => 705];
        }

        if ((int)$user->money < (int)$item->cost) {
            return ['error' => 1013];
        }

        $newMoney = (int)$user->money - (int)$item->cost;
        $this->db->updateUserMoney($userId, $newMoney);
        $this->db->addItemToPerson((int)$person->id, $itemId, (int)$item->base_level, (int)$item->value);

        return true;
    }

    public function upgradeItem(int $userId, int $inventoryId): array
    {
        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ['error' => 705];
        }

        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        $inv = $this->db->getInventoryById($inventoryId);
        if (!$inv) {
            return ['error' => 1014];
        }

        if ((int)$inv->person_id !== (int)$person->id) {
            return ['error' => 1014];
        }

        $nextLevel = (int)$inv->level + 1;
        $cost = ShopPricing::upgradeCost((float)$inv->cost, $nextLevel);

        if ((int)$user->money < $cost) {
            return ['error' => 1013];
        }

        $newMoney = (int)$user->money - $cost;
        $this->db->updateUserMoney($userId, $newMoney);
        $this->db->updateInventoryLevel($inventoryId, $nextLevel);

        return [
            'itemId' => (int)$inv->id,
            'level'  => $nextLevel,
            'money'  => $newMoney,
        ];
    }

    public function refillItem(int $userId, int $inventoryId): array
    {
        $user = $this->db->getUserById($userId);
        if (!$user) {
            return ['error' => 705];
        }

        $person = $this->db->getUserPerson($userId);
        if (!$person) {
            return ['error' => 904];
        }

        $inv = $this->db->getInventoryById($inventoryId);
        if (!$inv) {
            return ['error' => 1016];
        }

        if ((int)$inv->person_id !== (int)$person->id) {
            return ['error' => 1016];
        }

        if ((string)$inv->type !== 'vape') {
            return ['error' => 800];
        }

        $refillCost = ShopPricing::refillCost((float)$inv->cost);

        if ((int)$user->money < $refillCost) {
            return ['error' => 1013];
        }

        $newMoney = (int)$user->money - $refillCost;
        $this->db->updateUserMoney($userId, $newMoney);

        $fullValue = (int)$inv->value;
        $this->db->updateInventoryCurrentValue($inventoryId, $fullValue);

        return [
            'itemId'        => (int)$inv->id,
            'current_value' => $fullValue,
            'money'         => $newMoney,
            'refill_cost'   => $refillCost,
        ];
    }

    public function upgradeCost(int $personId)
    {
        $inventory = $this->db->getInventoryByPerson($personId);

        $items = array_map(
            static function (array $item): array {
                $nextLevel = (int)$item['level'] + 1;
                $upgradeCost = ShopPricing::upgradeCost((float)$item['cost'], $nextLevel);

                return [
                    'id'    => $item['id'],
                    'cost'  => $upgradeCost,
                    'level' => $nextLevel,
                ];
            },
            $inventory
        );

        if (empty($items)) {
            return ['error' => 1015];
        }

        return $items;
    }
}
