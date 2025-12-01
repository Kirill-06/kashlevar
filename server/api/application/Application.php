<?php
require_once ('db/DB.php');
require_once ('user/User.php');
require_once ('chat/Chat.php');
require_once ('math/Math.php');
require_once ('person/Person.php');
require_once ('shop/Shop.php');


class Application {
    private $user;
    private $chat;
    private $math;
    private $person;
    private $shop;

    function __construct() {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->math = new Math();
        $this->person = new Person($db);
        $this->shop = new Shop($db);
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

    // получать персонаж и содержимое его карманов
    public function getPerson($params) 
    {
        if (!$params['token']) {
            return ['error' => 242];
        }
        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }
        return $this->person->getPerson($user->id);
    }

    public function getUser($params) 
    {
        if (!$params['token']) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return [
            'id' => $user->id,
            'username' => $user->username,
            'money' => $user->money
        ];
    }

    public function puff($params) {
        if (!($params['token'] && $params["itemId"])) {
            return ['error' => 242];
        }
        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }
        return $this->person->puff($user->id, $params['itemId']);
    }

    public function getCatalog($params) {
        if (!$params['token']) {
            return ['error' => 242];
        }
        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }
        return $this->shop->getCatalog();
    }

    public function buy($params) {
        if (!($params['token'] && $params['itemId'])) {
            return ['error' => 242];
        }
        
        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

       $result = $this->shop->buy($user->id, $params['itemId']);
        if ($result) {
            return $result;
        }
       return $this->person->getInventory($user->id);
    }

    public function getInventory($params) {
        if (!($params['token'])) {
            return ['error' => 242];
        }
        
        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }
        return $this->person->getInventory($user->id);
    }

    public function upgradeItem($params){
        if (!($params['token'] && $params['itemId'])){
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }
        return $this->shop->upgradeItem($user->id, $params['itemId']);
    }

    public function update($params){
        if (!($params['token'])){
            return ['error' => 242];
        }
        
        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }
        return $this->person->update($user->id, 4, 100);
    }

    //заправка
    public function refillItem($params) {
        if (!($params['token'] && $params['itemId'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->shop->refillItem($user->id, $params['itemId']);
    }

    public function getRating($params) 
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->person->getRating($user->id);
    }

    public function getHellTasks($params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        $tasks = $this->math->generateHellTasksSet();

        return $tasks;
    }

    public function solveHellTasks($params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        $parseAnswers = function(?string $str): array {
            if ($str === null || $str === '') return [];
            $parts = preg_split('/[ ,;]+/', $str);
            $out = [];
            foreach ($parts as $p) {
                $p = trim($p);
                if ($p === '') continue;
                $p = str_replace(',', '.', $p);
                if (is_numeric($p)) {
                    $out[] = (float)$p;
                }
            }
            return $out;
        };

        $payload = [
            'quadratic' => [
                'a'       => (int)($params['q_a']  ?? 0),
                'b'       => (int)($params['q_b']  ?? 0),
                'c'       => (int)($params['q_c']  ?? 0),
                'answers' => $parseAnswers($params['q_ans'] ?? ''),
            ],
            'cubic' => [
                'a'       => (int)($params['c_a']  ?? 0),
                'b'       => (int)($params['c_b']  ?? 0),
                'c'       => (int)($params['c_c']  ?? 0),
                'd'       => (int)($params['c_d']  ?? 0),
                'answers' => $parseAnswers($params['c_ans'] ?? ''),
            ],
            'quartic' => [
                'a'       => (int)($params['qt_a'] ?? 0),
                'b'       => (int)($params['qt_b'] ?? 0),
                'c'       => (int)($params['qt_c'] ?? 0),
                'd'       => (int)($params['qt_d'] ?? 0),
                'e'       => (int)($params['qt_e'] ?? 0),
                'answers' => $parseAnswers($params['qt_ans'] ?? ''),
            ],
        ];

        $okCount = $this->math->checkHellTasksSet($payload);
        $success = $okCount >= 2;

        if ($success) {
            $this->person->resurrectFromHell($user->id);
        }

        return [
            'resurrected'  => $success,
            'solved_count' => $okCount,
        ];
    }



}
