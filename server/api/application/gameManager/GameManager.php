<?php

class GameManager {

    function __construct($db) {
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

    public function isDead() {
        
    }
}
