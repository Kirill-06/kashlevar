<?php
require_once ('db/DB.php');
require_once ('user/User.php');
require_once ('chat/Chat.php');
require_once ('math/Math.php');

class Application {
    function __construct() {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->math = new Math($db);
    }

    public function login($params) {
        if ($params['username'] && $params['hash'] && $params['rnd']) {
            return $this->user->login($params['username'], $params['hash'], $params['rnd']);
        }
        return ['error' => 242];
    }

    public function logout($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->user->logout($params['token']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function registration($params) {
        if ($params['login'] && $params['hash_password']) {
            return $this->user->registration($params['login'], $params['hash_password']);
        }
        return ['error' => 242];
    }

    public function sendMessage($params) {
        if ($params['token'] && $params['message']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->chat->sendMessage($user->id, $params['message']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getMessages($params) {
        if ($params['token'] && $params['hash']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->chat->getMessages($params['hash']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function getSolvesQuadraticEquations($params) {
        $a = (float) $params['a'];
        $b = (float) $params['b'];
        $c = (float) $params['c'];
        if ($a != 0 || $b != 0 || $c != 0) {
            return $this->math->getSolvesQuadraticEquations($a, $b, $c);
        }
        return ['error' => 8001];
    }

    public function getSolvesCubicEquations($params) {
        $a = (float) $params['a'];
        $b = (float) $params['b'];
        $c = (float) $params['c'];
        $d = (float) $params['d'];
        if ($a != 0 || $b != 0 || $c != 0 || $d != 0) {
            return $this->math->getSolvesCubicEquations($a, $b, $c, $d);
        }
        return ['error' => 8001];
    }

    public function  getSolvesQuadrupleEquations($params) {
        $a = (float) $params['a'];
        $b = (float) $params['b'];
        $c = (float) $params['c'];
        $d = (float) $params['d'];
        $e = (float) $params['e'];
        if ($a != 0 || $b != 0 || $c != 0 || $d != 0 || $e != 0) {
            return $this->math->getSolvesQuadrupleEquations($a, $b, $c, $d, $e);
        }
        return ['error' => 8001];
    }

    public function getPersonInfo($params) {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                ];
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    public function puff($params) {
        $token = $params['token'];
        $itemId = $params['itemId'];
    }

}
