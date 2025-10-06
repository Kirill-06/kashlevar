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
}