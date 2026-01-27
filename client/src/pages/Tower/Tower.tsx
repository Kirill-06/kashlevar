import React, { useContext } from 'react';
import './Tower.scss';
import { IBasePage } from '../PageManager';
import { ServerContext } from '../../App';

import coinSvg from '../../assets/img/tower/coin.svg';
import pillSvg from '../../assets/img/tower/pill.svg';
import heartPng from '../../assets/img/tower/heart.png';

import { TowerTopBar } from './components/TowerTopBar';
import { TowerShaft } from './components/TowerShaft';
import { useTowerEngine } from './hooks/useTowerEngine';

export default function Tower({ setPage }: IBasePage) {
  const server = useContext(ServerContext);

  const {
    shaftRef,
    tilePx,
    world,
    cameraY,
    player,
    hudHP,
    hudCoins,
    selfName,
    selfUserId,
    scenePersons,
    sceneItems,
    remoteSmoothRef,
    onBack,
    selfSprite,
  } = useTowerEngine(server, setPage);

  return (
    <div className="towerRoot">
      <TowerTopBar onBack={onBack} hp={hudHP} coins={hudCoins} heartIcon={heartPng} coinIcon={coinSvg} />

      <TowerShaft
        shaftRef={shaftRef}
        tilePx={tilePx}
        cameraY={cameraY}
        player={player}
        selfName={selfName}
        selfSprite={selfSprite}
        platforms={world.platforms}
        ladders={world.ladders}
        scenePersons={scenePersons}
        sceneItems={sceneItems}
        selfUserId={selfUserId}
        remoteSmoothRef={remoteSmoothRef}
        coinSvg={coinSvg}
        pillSvg={pillSvg}
      />
    </div>
  );
}
