import React from 'react';

type Props = {
  happinessBarImage: string;
  happinessValue: number;
  coinsValue: number;
  CoinsIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onLogout: () => void;
};

export const TopBar: React.FC<Props> = ({
  happinessBarImage,
  happinessValue,
  coinsValue,
  CoinsIcon,
  onLogout,
}) => {
  return (
    <div className="mainScreen-topBar">
      <div className="mainScreen-topLeft">
        <img
          src={happinessBarImage}
          alt="Happiness Bar"
          className="mainScreen-happinessIcon"
        />
        <span className="mainScreen-happinessText">{happinessValue}%</span>
      </div>

      <div className="mainScreen-topRight">
        <CoinsIcon className="mainScreen-coinsIcon" />
        <span className="mainScreen-coinsText">{coinsValue}</span>

        <button
          type="button"
          className="mainScreen-logoutBtn"
          onClick={onLogout}
        >
          Выйти
        </button>
      </div>
    </div>
  );
};
