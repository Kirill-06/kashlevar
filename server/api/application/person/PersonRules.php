<?php

class PersonRules
{
    public static function puffHpDamage(int $level): int
    {
        return PersonConfig::PUFF_HP_DAMAGE_BASE + ($level * PersonConfig::PUFF_HP_DAMAGE_PER_LEVEL);
    }

    public static function puffHappinessGain(int $level): int
    {
        return (int)round(PersonConfig::PUFF_HAPPINESS_GAIN_BASE + ($level * PersonConfig::PUFF_HAPPINESS_GAIN_PER_LEVEL));
    }

    public static function happinessAfterDecay(int $h0, int $intervals, int $rate): int
    {
        return $h0 - ($intervals * $rate);
    }

    public static function intervalsToZero(int $h0, int $rate): int
    {
        return (int)ceil($h0 / $rate);
    }
}
