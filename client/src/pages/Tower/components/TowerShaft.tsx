import React from 'react';
import { EDIRECTION } from '../../../config';
import { TowerSceneItem, TowerScenePerson } from '../../../services/server/types';
import { ITEM_H_TILES, ITEM_W_TILES, PLAYER_H_TILES, PLAYER_W_TILES, SHAFT_LEFT, SHAFT_WIDTH } from '../towerConstants';
import { AnimName, DirName, pickSprite } from '../towerSprites';
import { Platform, Ladder } from '../towerWorld';
import { RemoteSmooth } from '../towerTypes';

type Props = {
  shaftRef: React.RefObject<HTMLDivElement>;
  tilePx: number;
  cameraY: number;
  player: { x: number; y: number };
  selfName: string;
  selfSprite: string;
  platforms: Platform[];
  ladders: Ladder[];
  scenePersons: TowerScenePerson[];
  sceneItems: TowerSceneItem[];
  selfUserId: number | null;
  remoteSmoothRef: React.MutableRefObject<Map<number, RemoteSmooth>>;
  coinSvg: string;
  pillSvg: string;
};

export const TowerShaft: React.FC<Props> = ({
  shaftRef,
  tilePx,
  cameraY,
  player,
  selfName,
  selfSprite,
  platforms,
  ladders,
  scenePersons,
  sceneItems,
  selfUserId,
  remoteSmoothRef,
  coinSvg,
  pillSvg,
}) => {
  const toPxX = (xTiles: number) => xTiles * tilePx;
  const toPxY = (yTiles: number) => (yTiles - cameraY) * tilePx;

  const nowFrame = Math.floor((performance.now() / 1000) * 12) % 4;

  const getPersonSprite = (p: TowerScenePerson): string => {
    const pDir: DirName =
      String((p as any).direction ?? (p as any).dir ?? EDIRECTION.RIGHT) === EDIRECTION.LEFT
        ? 'left'
        : 'right';
    const pSt = String((p as any).moveStatus ?? (p as any).st ?? 'stand');
    const pAnim: AnimName = pSt === 'jump' ? 'jump' : 'run';
    const pMoving = pSt === 'move' || pAnim === 'jump';
    const frame = pAnim === 'jump' ? 0 : pMoving ? nowFrame : 0;
    return pickSprite({ anim: pAnim, dir: pDir, frame });
  };

  return (
    <div
      ref={shaftRef}
      className="towerShaft"
      style={{
        ['--shaft-left' as any]: `${SHAFT_LEFT * 100}%`,
        ['--shaft-width' as any]: `${SHAFT_WIDTH * 100}%`,
        ['--tilepx' as any]: `${tilePx}px`,
      }}
    >
      {platforms.map(p => (
        <div
          key={p.id}
          className="platform"
          style={{
            left: toPxX(p.x),
            bottom: toPxY(p.y) - tilePx,
            width: p.w * tilePx,
            height: tilePx,
          }}
        />
      ))}

      {ladders.map(l => {
        const hTiles = Math.max(1, Math.abs(l.yBottom - l.yTop));
        const wPx = tilePx * 0.5;
        const yMin = Math.min(l.yTop, l.yBottom);

        return (
          <div
            key={l.id}
            className="ladder"
            style={{
              left: toPxX(l.x) - wPx / 2,
              bottom: toPxY(yMin) - tilePx,
              height: hTiles * tilePx + tilePx,
              width: wPx,
            }}
          />
        );
      })}

      <div
        className="playerWrap"
        style={{
          left: toPxX(player.x),
          bottom: toPxY(player.y),
          transform: 'translate(-50%, 0)',
        }}
      >
        <div className="playerName">{selfName || 'You'}</div>

        <div
          className="playerSprite"
          style={{
            width: tilePx * PLAYER_W_TILES,
            height: tilePx * PLAYER_H_TILES,
            backgroundImage: `url(${selfSprite})`,
          }}
        />
      </div>

      {scenePersons
        .filter(p => {
          const uid = Number((p as any).user_id ?? (p as any).userId);
          return selfUserId == null || uid !== selfUserId;
        })
        .map(p => {
          const uid = Number((p as any).user_id ?? (p as any).userId);
          const s = remoteSmoothRef.current.get(uid);
          const rx = s ? s.x : Number((p as any).x);
          const ry = s ? s.y : Number((p as any).y);

          const pSprite = getPersonSprite(p);

          return (
            <div
              key={uid}
              className="playerWrap"
              style={{
                left: toPxX(rx),
                bottom: toPxY(ry),
                transform: 'translate(-50%, 0)',
              }}
              title={(p as any).username ?? ''}
            >
              <div className="playerName">{(p as any).username ?? ''}</div>

              <div
                className="otherPlayerSprite"
                style={{
                  width: tilePx * PLAYER_W_TILES,
                  height: tilePx * PLAYER_H_TILES,
                  backgroundImage: `url(${pSprite})`,
                }}
              />
            </div>
          );
        })}

      {sceneItems.map(it => {
        const kind = String((it as any).kind);
        const img = kind === 'coin' ? coinSvg : pillSvg;

        return (
          <div
            key={Number((it as any).id)}
            className={`dropItem ${kind === 'coin' ? 'dropCoin' : 'dropTablet'}`}
            style={{
              left: toPxX(Number((it as any).x)),
              bottom: toPxY(Number((it as any).y)),
              width: tilePx * ITEM_W_TILES,
              height: tilePx * ITEM_H_TILES,
              backgroundImage: `url(${img})`,
              transform: 'translate(-50%, 0)',
            }}
            title={`${kind} +${Number((it as any).value)}`}
          />
        );
      })}
    </div>
  );
};
