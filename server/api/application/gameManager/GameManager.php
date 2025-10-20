<?php

class GameManager
{

    function __construct($db)
    {
        $this->db = $db;
    }

    public function puff($user, $device)
    {

        $progress = $this->db->getUserProgress($user->id);
        $newHappiness = $progress->happines + $device->happiness_change;
        $newHealth = $progress->health + $device->health_change;

        // TODO $this->idDead реализовать проверку смерти

        $this->db->updateUserProgress($user->id, $newHappiness, $newHealth, null, null);
        return [
            'success' => true,
            'health' => $newHealth,
            'happiness' => $newHappiness
        ];
    }

    public function isDead() {}

    public function buy($user, $vapeItemId)
    {

        $vape = $this->db->getVapeFromShop($vapeItemId);
        if (!$vape) {
            return [
                "success" => false,
                "error" => "Vape is not exist",
            ];
        }
        $userMoney = $this->db->getUserProgress($user->id)->coins;

        if ($userMoney < $vape->price) {
            return [
                'success' => false,
                'error' => "NO MONEY BITCH"
            ];
        }

        $userMoney -= $vape->price;
        $this->db->updateUserProgress($user->id, null, null, $userMoney, null);
        $this->db->addUserVape($user->id, $vapeItemId);

        return[
            "success" => true,
            "buyVape" => $vape->name
        ];
    }
}
