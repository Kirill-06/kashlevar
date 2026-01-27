import { CHUNK_HEIGHT, FLOOR_GAP, FLOOR_OFFSET, SHAFT_TILES } from './towerConstants';

export type Platform = { id: string; x: number; y: number; w: number };
export type Ladder = { id: string; x: number; yTop: number; yBottom: number };
export type Chunk = { index: number; platforms: Platform[]; ladders: Ladder[] };

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randInt = (rng: () => number, min: number, max: number) => {
  return Math.floor(rng() * (max - min + 1)) + min;
};

export const clamp = (n: number, a: number, b: number) => {
  return Math.max(a, Math.min(b, n));
};

const generateFloorWithFixedLadder = (
  rng: () => number,
  floorY: number,
  floorId: string,
  ladderXFixed: number,
) => {
  const hasGap = rng() < 0.55;
  let gapW = hasGap ? randInt(rng, 1, 3) : 0;
  let gapX = hasGap ? randInt(rng, 2, SHAFT_TILES - 2 - gapW) : -1;

  if (hasGap) {
    let guard = 50;
    while (guard-- > 0) {
      const inGap = ladderXFixed >= gapX && ladderXFixed < gapX + gapW;
      if (!inGap) break;
      gapW = randInt(rng, 1, 3);
      gapX = randInt(rng, 2, SHAFT_TILES - 2 - gapW);
    }
  }

  const platforms: Platform[] = [];

  if (!hasGap) {
    platforms.push({ id: `P_${floorId}_full`, x: 0, y: floorY, w: SHAFT_TILES });
  } else {
    const leftW = gapX;
    const rightX = gapX + gapW;
    const rightW = SHAFT_TILES - rightX;

    if (leftW > 0) platforms.push({ id: `P_${floorId}_L`, x: 0, y: floorY, w: leftW });
    if (rightW > 0) platforms.push({ id: `P_${floorId}_R`, x: rightX, y: floorY, w: rightW });
  }

  const ladder: Ladder = {
    id: `L_${floorId}`,
    x: ladderXFixed + 0.5,
    yTop: floorY,
    yBottom: floorY + FLOOR_GAP,
  };

  return { platforms, ladder };
};

export const generateChunk = (seed: number, chunkIndex: number): Chunk => {
  const rng = mulberry32(seed ^ (chunkIndex * 0x9e3779b1));
  const baseY = chunkIndex * CHUNK_HEIGHT;

  const platforms: Platform[] = [];
  const ladders: Ladder[] = [];

  const floorsCount = Math.floor(CHUNK_HEIGHT / FLOOR_GAP);

  const groupFloors = 2;
  const groups = Math.ceil(floorsCount / groupFloors);
  const ladderXs = Array.from({ length: groups }, () => randInt(rng, 1, SHAFT_TILES - 2));

  for (let i = 0; i < floorsCount; i++) {
    const floorY = baseY + i * FLOOR_GAP + FLOOR_OFFSET;
    const floorId = `${chunkIndex}_${i}`;

    const ladderXFixed = ladderXs[Math.floor(i / groupFloors)];
    const f = generateFloorWithFixedLadder(rng, floorY, floorId, ladderXFixed);

    platforms.push(...f.platforms);
    ladders.push(f.ladder);
  }

  return { index: chunkIndex, platforms, ladders };
};
