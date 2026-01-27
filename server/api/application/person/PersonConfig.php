<?php

class PersonConfig
{
    public const DEFAULT_HP = 100;
    public const DEFAULT_HAPPINESS = 100;

    public const STATUS_ALIVE = 'alive';
    public const STATUS_DEAD = 'dead';
    public const STATUS_IN_HELL = 'inHell';
    public const STATUS_RESURRECTED = 'resurrected';

    public const PUFF_HP_DAMAGE_BASE = 2;
    public const PUFF_HP_DAMAGE_PER_LEVEL = 1;

    public const PUFF_HAPPINESS_GAIN_BASE = 5.0;
    public const PUFF_HAPPINESS_GAIN_PER_LEVEL = 1.5;

    public const DEFAULT_HAPPINESS_DECAY_RATE = 4;
    public const DEFAULT_DECAY_INTERVAL = 100;
}
