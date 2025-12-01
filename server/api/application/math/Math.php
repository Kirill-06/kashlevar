<?php

class Math
{
    public function getSolvesQuadraticEquations($a, $b, $c)
    {
        if ($a == 0) return ['error' => 8001];

        $D = $b ** 2 - 4 * $a * $c;
        if ($D > 0) {
            $x1 = (-$b + sqrt($D)) / (2 * $a);
            $x2 = (-$b - sqrt($D)) / (2 * $a);
            return [$x1, $x2];
        } else if ($D == 0) {
            $x1 = (-$b) / (2 * $a);
            return [$x1];
        } else {
            return ['error' => 8002];
        }
    }

    public function getSolvesCubicEquations($a, $b, $c, $d)
    {
        if ($a == 0) {
            return $this->getSolvesQuadraticEquations($b, $c, $d);
        }

        $p = (3 * $a * $c - $b * $b) / (3 * $a * $a);
        $q = (2 * $b * $b * $b - 9 * $a * $b * $c + 27 * $a * $a * $d) / (27 * $a * $a * $a);

        $Q = ($p / 3) * ($p / 3) * ($p / 3) + ($q / 2) * ($q / 2);

        if ($Q > 0) {
            $alpha = $this->safe_cbrt(-$q / 2 + sqrt($Q));
            $beta = $this->safe_cbrt(-$q / 2 - sqrt($Q));
            $x1 = $alpha + $beta - $b / (3 * $a);
            return [$x1];
        } else {
            $r = $this->safe_sqrt(- ($p / 3) * ($p / 3) * ($p / 3));
            if (abs($r) < 1e-10) return [-$b / (3 * $a)];

            $arg = -$q / (2 * $r);
            if ($arg < -1) $arg = -1;
            if ($arg > 1) $arg = 1;
            $phi = acos($arg);

            $x1 = 2 * $this->safe_cbrt($r) * cos($phi / 3) - $b / (3 * $a);
            $x2 = 2 * $this->safe_cbrt($r) * cos(($phi + 2 * M_PI) / 3) - $b / (3 * $a);
            $x3 = 2 * $this->safe_cbrt($r) * cos(($phi + 4 * M_PI) / 3) - $b / (3 * $a);

            return [$x1, $x2, $x3];
        }
    }

    public function getSolvesQuadrupleEquations($a, $b, $c, $d, $e)
    {
        if ($a == 0) return ['error' => 8001];

        $p = $b / $a;
        $q = $c / $a;
        $r = $d / $a;
        $s = $e / $a;

        $cubic_b = -$q;
        $cubic_c = $p * $r - 4 * $s;
        $cubic_d = - ($p * $p * $s + 4 * $q * $s - $r * $r);

        $cubic_solutions = $this->getSolvesCubicEquations(1, $cubic_b, $cubic_c, $cubic_d);
        if (isset($cubic_solutions['error'])) return $cubic_solutions;

        $y = $cubic_solutions[0];
        $R = $this->safe_sqrt($p * $p / 4 - $q + $y);

        if (abs($R) < 1e-10) {
            $R = 0;
            $D = $this->safe_sqrt(3 * $p * $p / 4 - 2 * $q + 2 * $this->safe_sqrt($y * $y - 4 * $s));
            $E = $this->safe_sqrt(3 * $p * $p / 4 - 2 * $q - 2 * $this->safe_sqrt($y * $y - 4 * $s));
        } else {
            $D = $this->safe_sqrt(3 * $p * $p / 4 - $R * $R - 2 * $q + (4 * $p * $q - 8 * $r - $p * $p * $p) / (4 * $R));
            $E = $this->safe_sqrt(3 * $p * $p / 4 - $R * $R - 2 * $q - (4 * $p * $q - 8 * $r - $p * $p * $p) / (4 * $R));
        }

        $x1 = -$p / 4 + $R / 2 + $D / 2;
        $x2 = -$p / 4 + $R / 2 - $D / 2;
        $x3 = -$p / 4 - $R / 2 + $E / 2;
        $x4 = -$p / 4 - $R / 2 - $E / 2;

        return [$x1, $x2, $x3, $x4];
    }

    private function safe_sqrt($x)
    {
        return $x >= 0 ? sqrt($x) : 0;
    }

    private function safe_cbrt($x)
    {
        return $x >= 0 ? pow($x, 1 / 3) : -pow(-$x, 1 / 3);
    }

     private function buildPolynomialFromRoots(array $roots, int $a = 1): array
    {
        $coeffs = [1]; 

        foreach ($roots as $r) {
            $new = array_fill(0, count($coeffs) + 1, 0);
            for ($i = 0; $i < count($coeffs); $i++) {
                $new[$i]     += -$r * $coeffs[$i];    
                $new[$i + 1] += $coeffs[$i];        
            }
            $coeffs = $new;
        }

        foreach ($coeffs as &$c) {
            $c *= $a;
        }
        unset($c);

        return array_reverse($coeffs);
    }

    private function formatPolynomialEquation(array $coeffs): string
    {
        $degree = count($coeffs) - 1;
        $parts = [];

        foreach ($coeffs as $idx => $coef) {
            if (abs($coef) < 1e-12) continue;

            $pow = $degree - $idx;
            $sign = $coef < 0 ? ' - ' : (empty($parts) ? '' : ' + ');
            $abs  = abs($coef);

            if ($pow === 0) {
                $parts[] = $sign . $abs;
            } elseif ($pow === 1) {
                if ($abs == 1) {
                    $parts[] = $sign . 'x';
                } else {
                    $parts[] = $sign . $abs . 'x';
                }
            } else {
                if ($abs == 1) {
                    $parts[] = $sign . 'x^' . $pow;
                } else {
                    $parts[] = $sign . $abs . 'x^' . $pow;
                }
            }
        }

        if (empty($parts)) {
            $parts[] = '0';
        }

        return implode('', $parts) . ' = 0';
    }

    public function generateQuadraticHellEquation(): array
    {
        $x1 = random_int(-5, 5);
        $x2 = random_int(-5, 5);

        if ($x1 === 0 && $x2 === 0) {
            $x1 = 1;
        }

        $a = random_int(1, 3);
        $coeffs = $this->buildPolynomialFromRoots([$x1, $x2], $a);

        $equationText = $this->formatPolynomialEquation($coeffs);

        return [
            'degree'   => 2,
            'a'        => $coeffs[0],
            'b'        => $coeffs[1],
            'c'        => $coeffs[2],
            'question' => 'Реши квадратное уравнение: ' . $equationText . '. Введи все действительные корни.',
        ];
    }

    public function generateCubicHellEquation(): array
    {
        $roots = [];
        while (count($roots) < 3) {
            $roots[] = random_int(-3, 3);
        }

        $a = random_int(1, 2);
        $coeffs = $this->buildPolynomialFromRoots($roots, $a);

        $equationText = $this->formatPolynomialEquation($coeffs);

        return [
            'degree'   => 3,
            'a'        => $coeffs[0],
            'b'        => $coeffs[1],
            'c'        => $coeffs[2],
            'd'        => $coeffs[3],
            'question' => 'Реши кубическое уравнение: ' . $equationText . '. Введи все действительные корни.',
        ];
    }

    public function generateQuarticHellEquation(): array
    {
        $roots = [];
        while (count($roots) < 4) {
            $roots[] = random_int(-2, 2);
        }

        $a = random_int(1, 2);
        $coeffs = $this->buildPolynomialFromRoots($roots, $a);

        $equationText = $this->formatPolynomialEquation($coeffs);

        return [
            'degree'   => 4,
            'a'        => $coeffs[0],
            'b'        => $coeffs[1],
            'c'        => $coeffs[2],
            'd'        => $coeffs[3],
            'e'        => $coeffs[4],
            'question' => 'Реши уравнение четвёртой степени: ' . $equationText . '. Введи все действительные корни.',
        ];
    }

    public function generateHellTasksSet(): array
    {
        return [
            'quadratic'        => $this->generateQuadraticHellEquation(),
            'cubic'            => $this->generateCubicHellEquation(),
            'quartic'          => $this->generateQuarticHellEquation(),
            'required_success' => 2,
        ];
    }

    private function compareRoots(array $solutions, array $answers, float $eps = 1e-4): bool
    {
        if (isset($solutions['error'])) {
            return false;
        }

        $roots = array_map('floatval', $solutions);
        sort($roots);

        $ans = array_map('floatval', $answers);
        sort($ans);

        if (count($roots) !== count($ans)) {
            return false;
        }

        for ($i = 0; $i < count($roots); $i++) {
            if (abs($roots[$i] - $ans[$i]) > $eps) {
                return false;
            }
        }

        return true;
    }

    public function checkQuadraticHellEquation(int $a, int $b, int $c, array $answers): bool
    {
        $solutions = $this->getSolvesQuadraticEquations($a, $b, $c);
        return $this->compareRoots($solutions, $answers);
    }

    public function checkCubicHellEquation(int $a, int $b, int $c, int $d, array $answers): bool
    {
        $solutions = $this->getSolvesCubicEquations($a, $b, $c, $d);
        return $this->compareRoots($solutions, $answers);
    }

    public function checkQuarticHellEquation(int $a, int $b, int $c, int $d, int $e, array $answers): bool
    {
        $solutions = $this->getSolvesQuadrupleEquations($a, $b, $c, $d, $e);
        return $this->compareRoots($solutions, $answers);
    }

    public function checkHellTasksSet(array $payload): int
    {
        $okCount = 0;

        if (isset($payload['quadratic'])) {
            $q = $payload['quadratic'];
            if ($this->checkQuadraticHellEquation(
                (int)$q['a'],
                (int)$q['b'],
                (int)$q['c'],
                $q['answers'] ?? []
            )) {
                $okCount++;
            }
        }

        if (isset($payload['cubic'])) {
            $c = $payload['cubic'];
            if ($this->checkCubicHellEquation(
                (int)$c['a'],
                (int)$c['b'],
                (int)$c['c'],
                (int)$c['d'],
                $c['answers'] ?? []
            )) {
                $okCount++;
            }
        }

        if (isset($payload['quartic'])) {
            $q4 = $payload['quartic'];
            if ($this->checkQuarticHellEquation(
                (int)$q4['a'],
                (int)$q4['b'],
                (int)$q4['c'],
                (int)$q4['d'],
                (int)$q4['e'],
                $q4['answers'] ?? []
            )) {
                $okCount++;
            }
        }

        return $okCount;
    }

}