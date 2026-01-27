<?php

error_reporting(1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once('application/Answer.php');
require_once('application/Application.php');

function result($params)
{
    $method = $params['method'] ?? null;

    if (!$method) {
        return ['error' => 101];
    }

    $app = new Application();

    switch ($method) {
        case 'login': return $app->login($params);
        case 'logout': return $app->logout($params);
        case 'registration': return $app->registration($params);
        case 'getUser': return $app->getUser($params);

        case 'sendMessage': return $app->sendMessage($params);
        case 'getMessages': return $app->getMessages($params);

        case 'getSolvesQuadraticEquations': return $app->getSolvesQuadraticEquations($params);
        case 'getSolvesCubicEquations': return $app->getSolvesCubicEquations($params);
        case 'getSolvesQuadrupleEquations': return $app->getSolvesQuadrupleEquations($params);

        case 'getPerson': return $app->getPerson($params);
        case 'getInventory': return $app->getInventory($params);
        case 'puff': return $app->puff($params);
        case 'update': return $app->update($params);
        case 'getRating': return $app->getRating($params);

        case 'getCatalog': return $app->getCatalog($params);
        case 'buy': return $app->buy($params);
        case 'upgradeItem': return $app->upgradeItem($params);
        case 'refillItem': return $app->refillItem($params);

        case 'goToTower': return $app->goToTower($params);
        case 'leaveTower': return $app->leaveTower($params);
        case 'movePerson': return $app->movePerson($params);
        case 'updateScene': return $app->updateScene($params);

        case 'getHellTasks': return $app->getHellTasks($params);
        case 'solveHellTasks': return $app->solveHellTasks($params);

        default: return ['error' => 102];
    }
}

echo json_encode(Answer::response(result($_GET)), JSON_UNESCAPED_UNICODE);
