<?php

class ShopPricing
{
    public static function upgradeCost(float $itemCost, int $nextLevel): int
    {
        $cost = ($itemCost / ShopConfig::UPGRADE_COST_BASE_DIVISOR) + (ShopConfig::UPGRADE_COST_LEVEL_FACTOR * ($nextLevel ** 2));
        return (int)round($cost);
    }

    public static function refillCost(float $itemCost): int
    {
        return (int)round($itemCost / ShopConfig::REFILL_COST_DIVISOR);
    }
}
