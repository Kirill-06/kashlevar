<?php

class HellTasksRequestMapper
{
    public static function fromParams(array $params): array
    {
        $parseAnswers = static function (?string $str): array {
            if ($str === null || $str === '') {
                return [];
            }

            $parts = preg_split('/[ ,;]+/', $str);
            $out = [];

            foreach ($parts as $p) {
                $p = trim($p);
                if ($p === '') {
                    continue;
                }

                $p = str_replace(',', '.', $p);
                if (is_numeric($p)) {
                    $out[] = (float)$p;
                }
            }

            return $out;
        };

        return [
            'quadratic' => [
                'a'       => (int)($params['q_a'] ?? 0),
                'b'       => (int)($params['q_b'] ?? 0),
                'c'       => (int)($params['q_c'] ?? 0),
                'answers' => $parseAnswers($params['q_ans'] ?? ''),
            ],
            'cubic' => [
                'a'       => (int)($params['c_a'] ?? 0),
                'b'       => (int)($params['c_b'] ?? 0),
                'c'       => (int)($params['c_c'] ?? 0),
                'd'       => (int)($params['c_d'] ?? 0),
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
    }
}
