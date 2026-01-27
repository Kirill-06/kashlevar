import React from 'react';

type Props = {
  onBack: () => void;
  hp: number;
  coins: number;
  heartIcon: string;
  coinIcon: string;
};

export const TowerTopBar: React.FC<Props> = ({ onBack, hp, coins, heartIcon, coinIcon }) => {
  return (
    <div className="towerTopBar">
      <button className="towerTopBtn" onClick={onBack}>
        ←
      </button>

      <div className="towerHud">
        <div className="hudItem" title="HP">
          <img className="hudIcon" src={heartIcon} alt="hp" />
          <span className="hudValue">{hp}</span>
        </div>

        <div className="hudItem" title="Coins">
          <img className="hudIcon" src={coinIcon} alt="coins" />
          <span className="hudValue">{coins}</span>
        </div>
      </div>
    </div>
  );
};
