import { useEffect, useMemo, useRef, useState } from 'react';
import CONFIG, { EDIRECTION } from '../../../config';
import { PAGES } from '../../PageManager';
import {
  CLIMB_SPEED,
  CHUNK_HEIGHT,
  FLOOR_OFFSET,
  GRAVITY,
  JUMP_CUT_EXTRA_G,
  JUMP_V,
  MARGIN_TILES,
  MOVE_SPEED,
  PW,
  REMOTE_SMOOTH_K,
  SHAFT_TILES,
} from '../towerConstants';
import { DirName, AnimName, pickSprite } from '../towerSprites';
import { Chunk, Ladder, Platform, clamp, generateChunk } from '../towerWorld';
import { Keys, RemoteSmooth } from '../towerTypes';
import { TowerSceneItem, TowerScenePerson } from '../../../services/server/types';

export const useTowerEngine = (server: any, setPage: (p: any) => void) => {
  const seed = 1337;

  const [joined, setJoined] = useState(false);
  const [player, setPlayer] = useState({ x: 10.5, y: FLOOR_OFFSET });
  const [cameraY, setCameraY] = useState(0);

  const [hudHP, setHudHP] = useState<number>(0);
  const [hudCoins, setHudCoins] = useState<number>(0);

  const playerRef = useRef({ x: 10.5, y: FLOOR_OFFSET });
  const velRef = useRef({ vx: 0, vy: 0 });
  const groundedRef = useRef(true);
  const ladderNoGrabUntilRef = useRef(0);

  const ladderModeRef = useRef(false);
  const ladderRef = useRef<Ladder | null>(null);

  const keysRef = useRef<Keys>({ left: false, right: false, up: false, down: false, jump: false });

  const chunksRef = useRef<Map<number, Chunk>>(new Map());
  const [worldVersion, setWorldVersion] = useState(0);

  const shaftRef = useRef<HTMLDivElement | null>(null);
  const [tilePx, setTilePx] = useState<number>(CONFIG.SPRITE_SIZE);

  const [scenePersons, setScenePersons] = useState<TowerScenePerson[]>([]);
  const [sceneItems, setSceneItems] = useState<TowerSceneItem[]>([]);
  const selfUserIdRef = useRef<number | null>(null);
  const [selfName, setSelfName] = useState<string>('');

  const remoteSmoothRef = useRef<Map<number, RemoteSmooth>>(new Map());

  const personsHashRef = useRef('init');
  const itemsHashRef = useRef('init');

  const lastSendRef = useRef({ t: 0, x: 0, y: 0, dir: 'right', st: 'stand' });
  const selfAnimRef = useRef<{ dir: string; st: string }>({ dir: EDIRECTION.RIGHT, st: 'stand' });

  useEffect(() => {
    const update = () => {
      const el = shaftRef.current;
      if (!el) return;
      const w = el.clientWidth;
      if (w > 0) setTilePx(w / SHAFT_TILES);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') keysRef.current.down = true;
      if (e.key === ' ') keysRef.current.jump = true;

      if (e.key === 'Escape') {
        (async () => {
          await server?.leaveTower();
          setPage(PAGES.MAIN_SCREEN);
        })();
      }
    };

    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') keysRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') keysRef.current.down = false;
      if (e.key === ' ') keysRef.current.jump = false;
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [server, setPage]);

  useEffect(() => {
    if (!chunksRef.current.has(0)) {
      chunksRef.current.set(0, generateChunk(seed, 0));
      setWorldVersion(v => v + 1);
    }
  }, [seed]);

  useEffect(() => {
    (async () => {
        const info = await server?.getUserInfo?.();
        if (info?.id != null) selfUserIdRef.current = Number((info as any).id);
        if ((info as any)?.username) setSelfName(String((info as any).username));
        else if ((info as any)?.name) setSelfName(String((info as any).name));

        if ((info as any)?.money != null) setHudCoins(Number((info as any).money));

        const person = await server?.getPerson?.();
        if (person && (person as any).hp != null) setHudHP(Number((person as any).hp));
    })();
  }, [server]);

  useEffect(() => {
    if (!server || !joined) return;

    const id = window.setInterval(async () => {
      const info = await server.getUserInfo?.();
      if (info && (info as any).money != null) setHudCoins(Number((info as any).money));

      const person = await server?.getPerson?.();
      if (person && (person as any).hp != null) setHudHP(Number((person as any).hp));
    }, 500);

    return () => window.clearInterval(id);
  }, [server, joined]);

  useEffect(() => {
    (async () => {
      if (!server) return;
      const join = await server.goToTower();
      if (!join?.active) return;

      const spawnX = Number(join.x);
      const spawnY = Number(join.y);

      playerRef.current = { x: spawnX, y: spawnY };
      setPlayer({ x: spawnX, y: spawnY });

      velRef.current = { vx: 0, vy: 0 };
      groundedRef.current = true;
      ladderModeRef.current = false;
      ladderRef.current = null;

      personsHashRef.current = 'init';
      itemsHashRef.current = 'init';

      lastSendRef.current = { t: performance.now(), x: spawnX, y: spawnY, dir: 'right', st: 'stand' };
      selfAnimRef.current = { dir: EDIRECTION.RIGHT, st: 'stand' };

      setJoined(true);
    })();
  }, [server]);

  useEffect(() => {
    const viewTop = cameraY + CONFIG.WINDOW.HEIGHT + MARGIN_TILES;
    const viewBottom = Math.max(0, cameraY - MARGIN_TILES);

    const from = Math.floor(viewBottom / CHUNK_HEIGHT);
    const to = Math.floor(viewTop / CHUNK_HEIGHT);

    let changed = false;
    for (let i = from; i <= to; i++) {
      if (!chunksRef.current.has(i)) {
        chunksRef.current.set(i, generateChunk(seed, i));
        changed = true;
      }
    }
    if (changed) setWorldVersion(v => v + 1);
  }, [cameraY, seed]);

  const world = useMemo(() => {
    const version = worldVersion;
    void version;
    const platforms: Platform[] = [];
    const ladders: Ladder[] = [];
    Array.from(chunksRef.current.values()).forEach(ch => {
      platforms.push(...ch.platforms);
      ladders.push(...ch.ladders);
    });
    return { platforms, ladders };
  }, [worldVersion]);

  useEffect(() => {
    if (!server || !joined) return;

    const id = window.setInterval(async () => {
      const res = await server.updateScene(personsHashRef.current, itemsHashRef.current);
      if (!res) return;

      personsHashRef.current = res.personsHash;
      itemsHashRef.current = res.itemsHash;

      if (res.persons) {
        const normalized = (res.persons as any[]).map(p => ({
          ...p,
          user_id: Number(p.user_id ?? p.userId),
          x: Number(p.x),
          y: Number(p.y),
          username: String(p.username ?? p.name ?? ''),
          direction: String(p.direction ?? p.dir ?? EDIRECTION.RIGHT),
          moveStatus: String(p.moveStatus ?? p.st ?? 'stand'),
          hp: p.hp != null ? Number(p.hp) : undefined,
        })) as any as TowerScenePerson[];

        setScenePersons(normalized);

        const selfUid = selfUserIdRef.current;
        if (selfUid != null) {
          const me = (normalized as any[]).find(pp => Number(pp.user_id) === selfUid);
          if (me && (me as any).hp != null) setHudHP(Number((me as any).hp));
        }

        for (const p of normalized as any[]) {
          const uid = Number(p.user_id);
          if (!remoteSmoothRef.current.has(uid)) {
            remoteSmoothRef.current.set(uid, {
              x: Number(p.x),
              y: Number(p.y),
              tx: Number(p.x),
              ty: Number(p.y),
            });
          } else {
            const s = remoteSmoothRef.current.get(uid)!;
            s.tx = Number(p.x);
            s.ty = Number(p.y);
          }
        }
      }

      if (res.items) {
        const normalizedItems = (res.items as any[]).map(it => ({
          ...it,
          id: Number(it.id),
          x: Number(it.x),
          y: Number(it.y),
          value: Number(it.value),
          kind: it.kind,
        })) as TowerSceneItem[];
        setSceneItems(normalizedItems);
      }
    }, 200);

    return () => window.clearInterval(id);
  }, [server, joined]);

  useEffect(() => {
    if (!server) return;

    let raf = 0;
    let last = performance.now();

    const getLadderAt = (px: number, py: number): Ladder | null => {
      for (const l of world.ladders) {
        const dx = Math.abs(px - l.x);
        if (dx > 0.6) continue;

        const yMin = Math.min(l.yTop, l.yBottom);
        const yMax = Math.max(l.yTop, l.yBottom);

        if (py >= yMin - 0.25 && py <= yMax + 0.25) return l;
      }
      return null;
    };

    const findAdjacentLadder = (from: Ladder, dir: 'up' | 'down'): Ladder | null => {
      const eps = 0.001;
      const x = from.x;

      if (dir === 'up') {
        const target = Math.max(from.yTop, from.yBottom);
        for (const l of world.ladders) {
          if (Math.abs(l.x - x) > 0.001) continue;
          const yMin = Math.min(l.yTop, l.yBottom);
          if (Math.abs(yMin - target) <= eps) return l;
        }
        return null;
      }

      const target = Math.min(from.yTop, from.yBottom);
      for (const l of world.ladders) {
        if (Math.abs(l.x - x) > 0.001) continue;
        const yMax = Math.max(l.yTop, l.yBottom);
        if (Math.abs(yMax - target) <= eps) return l;
      }
      return null;
    };

    const platformSurfaceUnder = (px: number, py: number): number | null => {
      let bestY: number | null = null;

      for (const p of world.platforms) {
        const left = px - PW / 2;
        const right = px + PW / 2;

        const pLeft = p.x;
        const pRight = p.x + p.w;

        if (!(right > pLeft && left < pRight)) continue;

        const y = p.y;
        if (py >= y - 0.001) {
          if (bestY === null || y > bestY) bestY = y;
        }
      }
      return bestY;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      {
        const a = 1 - Math.exp(-REMOTE_SMOOTH_K * dt);
        remoteSmoothRef.current.forEach(s => {
          s.x += (s.tx - s.x) * a;
          s.y += (s.ty - s.y) * a;
        });
      }

      if (!joined) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const k = keysRef.current;

      let { x: px, y: py } = playerRef.current;
      const prevY = py;
      let { vx, vy } = velRef.current;

      const ladderNow = getLadderAt(px, py);

      const canGrab = performance.now() >= ladderNoGrabUntilRef.current;
      const wantGrab = canGrab && !!ladderNow && (k.up || k.down);
      if (wantGrab) {
        ladderModeRef.current = true;
        ladderRef.current = ladderNow;
        px = ladderNow.x;
        vx = 0;
        vy = 0;
      }

      let dir: string = selfAnimRef.current.dir || EDIRECTION.RIGHT;
      vx = 0;
      if (k.left) {
        vx = -MOVE_SPEED;
        dir = EDIRECTION.LEFT;
      }
      if (k.right) {
        vx = MOVE_SPEED;
        dir = EDIRECTION.RIGHT;
      }

      if (ladderModeRef.current && ladderRef.current && k.jump) {
        ladderModeRef.current = false;
        ladderRef.current = null;
        groundedRef.current = false;
        vy = Math.min(vy, 0);
        ladderNoGrabUntilRef.current = performance.now() + 200;
      }

      if (ladderModeRef.current && ladderRef.current && (k.left || k.right)) {
        const lx = ladderRef.current.x;
        const underY = platformSurfaceUnder(lx, py + 0.02);
        const atIntersection = underY !== null && Math.abs(py - underY) < 0.08;

        if (!atIntersection) {
          ladderModeRef.current = false;
          ladderRef.current = null;
          groundedRef.current = false;
          vy = Math.min(vy, 0);
          ladderNoGrabUntilRef.current = performance.now() + 200;
        }
      }

      if (k.jump && groundedRef.current) {
        vy = JUMP_V;
        groundedRef.current = false;
        ladderModeRef.current = false;
        ladderRef.current = null;
      }

      if (ladderModeRef.current && ladderRef.current) {
        vx = 0;
        vy = 0;
        px = ladderRef.current.x;

        const yMin = Math.min(ladderRef.current.yTop, ladderRef.current.yBottom);
        const yMax = Math.max(ladderRef.current.yTop, ladderRef.current.yBottom);

        if (k.up) py += CLIMB_SPEED * dt;
        if (k.down) py -= CLIMB_SPEED * dt;

        if (py > yMax) {
          const next = findAdjacentLadder(ladderRef.current, 'up');
          if (next) {
            ladderRef.current = next;
            py = Math.min(py, Math.max(next.yTop, next.yBottom));
          } else py = yMax;
        }

        if (py < yMin) {
          const prev = findAdjacentLadder(ladderRef.current, 'down');
          if (prev) {
            ladderRef.current = prev;
            py = Math.max(py, Math.min(prev.yTop, prev.yBottom));
          } else py = yMin;
        }

        if (k.left || k.right) {
          const underY = platformSurfaceUnder(px, py + 0.02);
          if (underY !== null && Math.abs(py - underY) < 0.08) {
            py = underY;
            groundedRef.current = true;
            ladderModeRef.current = false;
            ladderRef.current = null;
            ladderNoGrabUntilRef.current = performance.now() + 200;
          }
        }

        if (ladderModeRef.current) groundedRef.current = false;
      } else {
        vy += GRAVITY * dt;
        if (!k.jump && vy > 0) {
          vy += GRAVITY * dt * JUMP_CUT_EXTRA_G;
        }
      }

      px += vx * dt;
      py += vy * dt;

      px = clamp(px, PW / 2, SHAFT_TILES - PW / 2);

      if (!ladderModeRef.current && vy <= 0) {
        const underY = platformSurfaceUnder(px, prevY);
        if (underY !== null) {
          if (prevY >= underY && py < underY) {
            py = underY;
            vy = 0;
            groundedRef.current = true;
          } else groundedRef.current = Math.abs(py - underY) < 0.03;
        } else groundedRef.current = false;
      } else if (!ladderModeRef.current) groundedRef.current = false;

      if (py < 0) {
        py = 0;
        vy = 0;
        groundedRef.current = true;
        ladderModeRef.current = false;
        ladderRef.current = null;
      }

      velRef.current = { vx, vy };
      playerRef.current = { x: px, y: py };
      setPlayer({ x: px, y: py });

      const halfH = CONFIG.WINDOW.HEIGHT / 2;
      setCameraY(Math.max(0, py - halfH));

      const moveStatus =
        ladderModeRef.current
          ? 'move'
          : !groundedRef.current
            ? 'jump'
            : Math.abs(vx) > 0.01
              ? 'move'
              : 'stand';

      selfAnimRef.current = { dir, st: moveStatus };

      const nowMs = performance.now();
      const lastSend = lastSendRef.current;

      const changedEnough =
        Math.abs(px - lastSend.x) > 0.05 ||
        Math.abs(py - lastSend.y) > 0.05 ||
        moveStatus !== lastSend.st ||
        dir !== lastSend.dir;

      if (changedEnough && nowMs - lastSend.t > 120) {
        lastSendRef.current = { t: nowMs, x: px, y: py, dir, st: moveStatus };
        server.movePerson({ x: px, y: py, direction: dir, moveStatus }).catch(() => {});
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [server, joined, world]);

  const selfDir: DirName = selfAnimRef.current.dir === EDIRECTION.LEFT ? 'left' : 'right';
  const selfAnim: AnimName = selfAnimRef.current.st === 'jump' ? 'jump' : 'run';
  const selfMoving = selfAnimRef.current.st === 'move' || selfAnim === 'jump';
  const selfFrame = selfAnim === 'jump' ? 0 : selfMoving ? Math.floor((performance.now() / 1000) * 12) % 4 : 0;

  const selfSprite = pickSprite({ anim: selfAnim, dir: selfDir, frame: selfFrame });

  const onBack = async () => {
    await server?.leaveTower();
    setPage(PAGES.MAIN_SCREEN);
  };

  return {
    shaftRef,
    tilePx,
    world,
    cameraY,
    player,
    hudHP,
    hudCoins,
    selfName,
    selfUserId: selfUserIdRef.current,
    scenePersons,
    sceneItems,
    remoteSmoothRef,
    onBack,
    selfSprite,
  };
};
