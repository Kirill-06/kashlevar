<?php

class Answer {
    static $CODES = array(
        '101' => 'Param method not setted',
        '102' => 'Method not found',
        '242' => 'Params not set fully',
        '705' => 'User is not found',
        '1001' => 'Is it unique login?',
        '1002' => 'Wrong login or password',
        '1003' => 'Error to logout user',
        '1004' => 'Error to register user',
        '1005' => 'User is no exists',
        '404' => 'Not found',
        '605' => 'Invalid teamId',
        '700' => 'No skins',
        '701' => 'Skin is not found',
        '706' => 'Text message is empty',
        '707' => 'Could not send message',
        '708' => 'Invalid code from E-mail',
        '709' => 'Session did not start or you need use previous method',
        '800' => 'Not found object',
        '801' => 'Unknown state',
        '900' => 'Inventory is empty',
        '901' => 'Person is dead',
        '902' => 'Item not found in inventory',
        '903' => 'Cannot perform action - person is dead',
        '904' => 'Person not found',
        '905' => 'E-liquid is empty, please refill your vape',
        '1000' => 'Division by zero',
        '1006' => 'User with this email is already registered',
        '1010' => 'Catalog is empty',
        '1011' => 'Item not found in catalog',
        '1012' => 'Item already owned',
        '1013' => 'Not enough money',
        '1014' => 'Cannot upgrade item - not owned',
        '1015' => 'Inventory is empty',
        '1016' => 'Cannot refill item - not owned',
        '8001' => 'At least one of the parameters must be non-zero.',
        '8002' => 'There are no real roots',
        '9000' => 'Unknown error'
    );

    static function response($data) {
        if (is_array($data) && array_key_exists('error', $data)) {
            $code = $data['error'];
            return [
                'result' => 'error',
                'error'  => [
                    'code' => $code,
                    'text' => self::$CODES[$code] ?? 'Unknown error'
                ]
            ];
        }

        if ($data !== null) {
            return [
                'result' => 'ok',
                'data'   => $data
            ];
        }

        $code = 9000;
        return [
            'result' => 'error',
            'error'  => [
                'code' => $code,
                'text' => self::$CODES[$code] ?? 'Unknown error'
            ]
        ];
    }
}
