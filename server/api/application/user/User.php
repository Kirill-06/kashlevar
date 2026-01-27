<?php

class User {
    function __construct($db) {
        $this->db = $db;
    }

    public function getUser($token) {
        return $this->db->getUserByToken($token);
    }

    public function login($username, $hash_password, $rnd) {
        $user = $this->db->getUserByUserName($username);
        if ($user) {
            if (md5($user->hash_password . $rnd) === $hash_password) {
                $token = md5(rand());
                $this->db->updateToken($user->id, $token);
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'token' => $token
                ];
            }
            return ['error' => 1002];
        }
        return ['error' => 1005];
    }

    public function logout($token) {
        $user = $this->db->getUserByToken($token);
        if ($user) {
            $this->db->updateToken($user->id, null);
            return true;
        }
        return ['error' => 1003];
    }
   //1&2
    public function registration($username, $hash_password) {
        $user = $this->db->getUserByUserName($username);
        if ($user) {
            return ['error' => 1001];
        }
        $this->db->registration($username, $hash_password);
        $user = $this->db->getUserByUserName($username);
        if ($user) {
            $token = md5(rand());
            $this->db->updateToken($user->id, $token);
            
            return [
                'id' => $user->id,
                'username' => $user->username,
                'token' => $token
            ];
        }
        return ['error' => 1004];
    }
}
