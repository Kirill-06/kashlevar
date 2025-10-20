<?php

error_reporting(1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once('application/Answer.php');
require_once('application/Application.php');

function result($params) {
    $method = $params['method'];
    if ($method) {
        $app = new Application();
        switch ($method) {
            // user
            case 'login': return $app->login($params);
            case 'logout': return $app->logout($params);
            case 'registration': return $app->registration($params);
            case 'getUser': return $app->getPersonInfo($params);
            case 'getUserProgress': return $app->getPersonProgress($params);
            case 'getUserVapes': return $app->getUserVapes($params);
            // chat
            case 'sendMessage': return $app->sendMessage($params);
            case 'getMessages': return $app->getMessages($params);
            //math
            case 'getSolvesQuadraticEquations': return $app->getSolvesQuadraticEquations($params);
            case 'getSolvesCubicEquations': return $app->getSolvesCubicEquations($params);
            case 'getSolvesQuadrupleEquations': return $app->getSolvesQuadrupleEquations($params);
            //game
            case 'puff': return $app->puff($params);
            case 'buyVape': return $app->buyVape($params);

            default: return ['error' => 102];

        }
    }
    return ['error' => 101];
}

echo json_encode(Answer::response(result($_GET)), JSON_UNESCAPED_UNICODE);
