<?php

require_once('db/DB.php');
require_once('user/User.php');
require_once('chat/Chat.php');
require_once('math/HellConfig.php');
require_once('math/HellTasksRequestMapper.php');
require_once('math/Math.php');
require_once('person/PersonConfig.php');
require_once('person/PersonRules.php');
require_once('person/Person.php');
require_once('shop/ShopConfig.php');
require_once('shop/ShopPricing.php');
require_once('shop/Shop.php');
require_once('tower/TowerConfig.php');
require_once('tower/Tower.php');

class Application
{
    private User $user;
    private Chat $chat;
    private Math $math;
    private Person $person;
    private Shop $shop;
    private Tower $tower;

    public function __construct()
    {
        $db = new DB();
        $this->user = new User($db);
        $this->chat = new Chat($db);
        $this->math = new Math();
        $this->person = new Person($db);
        $this->shop = new Shop($db);
        $this->tower = new Tower($db);
    }

    public function login(array $params): array
    {
        if (!empty($params['username']) && !empty($params['hash']) && !empty($params['rnd'])) {
            return $this->user->login($params['username'], $params['hash'], $params['rnd']);
        }

        return ['error' => 242];
    }

    public function logout(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->user->logout($params['token']);
    }

    public function registration(array $params): array
    {
        if (!empty($params['login']) && !empty($params['hash_password'])) {
            return $this->user->registration($params['login'], $params['hash_password']);
        }

        return ['error' => 242];
    }

    public function getUser(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $user;
    }

    public function sendMessage(array $params)
    {
        if (empty($params['token']) || empty($params['message'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->chat->sendMessage($user->id, $params['message']);
    }

    public function getMessages(array $params)
    {
        if (empty($params['hash'])) {
            return ['error' => 242];
        }

        return $this->chat->getMessages($params['hash']);
    }

    public function getSolvesQuadraticEquations(array $params)
    {
        if (!isset($params['a'], $params['b'], $params['c'])) {
            return ['error' => 242];
        }

        return $this->math->getSolvesQuadraticEquations($params['a'], $params['b'], $params['c']);
    }

    public function getSolvesCubicEquations(array $params)
    {
        if (!isset($params['a'], $params['b'], $params['c'], $params['d'])) {
            return ['error' => 242];
        }

        return $this->math->getSolvesCubicEquations($params['a'], $params['b'], $params['c'], $params['d']);
    }

    public function getSolvesQuadrupleEquations(array $params)
    {
        if (!isset($params['a'], $params['b'], $params['c'], $params['d'], $params['e'])) {
            return ['error' => 242];
        }

        return $this->math->getSolvesQuadrupleEquations($params['a'], $params['b'], $params['c'], $params['d'], $params['e']);
    }

    public function getPerson(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->person->getPerson($user->id);
    }

    public function getInventory(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->person->getInventory($user->id);
    }

    public function puff(array $params)
    {
        if (empty($params['token']) || empty($params['itemId'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->person->puff($user->id, (int)$params['itemId']);
    }

    public function update(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->person->update($user->id, PersonConfig::DEFAULT_HAPPINESS_DECAY_RATE, PersonConfig::DEFAULT_DECAY_INTERVAL);
    }

    public function getRating(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->person->getRating($user->id, PersonConfig::DEFAULT_HAPPINESS_DECAY_RATE, PersonConfig::DEFAULT_DECAY_INTERVAL);
    }

    public function getCatalog(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->shop->getCatalog();
    }

    public function buy(array $params)
    {
        if (empty($params['token']) || empty($params['itemId'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->shop->buy($user->id, (int)$params['itemId']);
    }

    public function upgradeItem(array $params)
    {
        if (empty($params['token']) || empty($params['itemId'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->shop->upgradeItem($user->id, (int)$params['itemId']);
    }

    public function refillItem(array $params)
    {
        if (empty($params['token']) || empty($params['itemId'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->shop->refillItem($user->id, (int)$params['itemId']);
    }

    public function getHellTasks(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->math->generateHellTasksSet();
    }

    public function solveHellTasks(array $params): array
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        $payload = HellTasksRequestMapper::fromParams($params);
        $okCount = $this->math->checkHellTasksSet($payload);
        $success = $okCount >= HellConfig::REQUIRED_SUCCESS;

        if ($success) {
            $this->person->resurrectFromHell($user->id);
        }

        return [
            'resurrected'  => $success,
            'solved_count' => $okCount,
        ];
    }

    public function goToTower(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->tower->goToTower($user->id);
    }

    public function leaveTower(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->tower->leaveTower($user->id);
    }

    public function movePerson(array $params)
    {
        if (empty($params['token']) || !isset($params['x'], $params['y'], $params['direction'], $params['moveStatus'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->tower->movePerson(
            $user->id,
            (float)$params['x'],
            (float)$params['y'],
            (string)$params['direction'],
            (string)$params['moveStatus']
        );
    }

    public function updateScene(array $params)
    {
        if (empty($params['token'])) {
            return ['error' => 242];
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705];
        }

        return $this->tower->updateScene(
            $user->id,
            (string)($params['personsHash'] ?? ''),
            (string)($params['itemsHash'] ?? '')
        );
    }
}
