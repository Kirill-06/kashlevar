import runR0 from '../../assets/img/tower/run_right_0.png';
import runR1 from '../../assets/img/tower/run_right_1.png';
import runR2 from '../../assets/img/tower/run_right_2.png';
import runR3 from '../../assets/img/tower/run_right_3.png';

import runL0 from '../../assets/img/tower/run_left_0.png';
import runL1 from '../../assets/img/tower/run_left_1.png';
import runL2 from '../../assets/img/tower/run_left_2.png';
import runL3 from '../../assets/img/tower/run_left_3.png';

import jumpR0 from '../../assets/img/tower/jump_right_0.png';
import jumpR1 from '../../assets/img/tower/jump_right_1.png';
import jumpR2 from '../../assets/img/tower/jump_right_2.png';
import jumpR3 from '../../assets/img/tower/jump_right_3.png';

import jumpL0 from '../../assets/img/tower/jump_left_0.png';
import jumpL1 from '../../assets/img/tower/jump_left_1.png';
import jumpL2 from '../../assets/img/tower/jump_left_2.png';
import jumpL3 from '../../assets/img/tower/jump_left_3.png';

export type AnimName = 'run' | 'jump';
export type DirName = 'left' | 'right';

const SPRITES = {
  run: {
    right: [runR0, runR1, runR2, runR3],
    left: [runL0, runL1, runL2, runL3],
  },
  jump: {
    right: [jumpR0, jumpR1, jumpR2, jumpR3],
    left: [jumpL0, jumpL1, jumpL2, jumpL3],
  },
} as const;

export const pickSprite = (opts: { anim: AnimName; dir: DirName; frame: number }) => {
  const arr = SPRITES[opts.anim][opts.dir];
  return arr[((opts.frame % arr.length) + arr.length) % arr.length];
};
