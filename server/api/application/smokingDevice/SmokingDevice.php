<?php

class SmokingDevice {
    function __construct($db) {
        $this->db = $db;
    }

    public function getUserDevice($userId, $deviceId) {
        return $this->db->getUserVape($userId, $deviceId);
    }

    public function getUserDevices($userId) {
        return $this->db->getUserVapes($userId);
    }

    public function getShopDevice() {
        // TODO реализовать метод для получения вейпа по id в DB 
    }

    public function getShopDevices() {
        // TODO реализовать метод для получения списка всех вейпов в DB
    }

    public function updateUserDevice($userVapeId, $level = null, $healthChange = null, $happinessChange = null) {
        $this->db->updateUserVape($userVapeId, $level, $healthChange, $happinessChange);
    }

    public function addDeviceToUser($userId, $vapeShopId) {
        $this->db->addUserVape($userId, $vapeShopId);
    }

    public function removeUserDevice($userVapeId) {
        $this->db->deleteUserVape($userVapeId);
    }
}
