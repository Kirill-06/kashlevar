import React from 'react';
import { UserVapes } from '../../../services/server/types';

type Props = {
  vape: UserVapes;
  onClick: () => void;
};

export const VapeButton: React.FC<Props> = ({ vape, onClick }) => {
  return (
    <button type="button" className="mainScreen-vapeButton" onClick={onClick}>
      <div className="mainScreen-vapeButton-text">
        {vape.name}
        <span className="mainScreen-vapeButton-sub">
          Уровень {vape.level} · Заряд {vape.current_value}
        </span>
      </div>
    </button>
  );
};
