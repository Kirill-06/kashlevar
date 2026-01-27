import React from 'react';
import { UserVapes } from '../../../services/server/types';

type Props = {
  vapes: UserVapes[];
  activeVapeId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
};

export const VapeDialog: React.FC<Props> = ({ vapes, activeVapeId, onSelect, onClose }) => {
  return (
    <div className="mainScreen-dialogOverlay" onClick={onClose}>
      <div className="mainScreen-dialog mainScreen-vapeDialog" onClick={e => e.stopPropagation()}>
        <div className="mainScreen-dialog-title">Выберите вейп</div>

        <div className="mainScreen-vapeList">
          {vapes.map(vape => (
            <button
              key={vape.id}
              type="button"
              className={
                'mainScreen-vapeItem' +
                (activeVapeId === vape.id ? ' mainScreen-vapeItem_active' : '')
              }
              onClick={() => onSelect(vape.id)}
            >
              <div className="mainScreen-vapeItem-name">{vape.name}</div>
              <div className="mainScreen-vapeItem-meta">
                <span>Уровень: {vape.level}</span>
                <span>Заряд: {vape.current_value}</span>
              </div>
            </button>
          ))}

          {vapes.length === 0 && <div className="mainScreen-vapeEmpty">У вас пока нет вейпов</div>}
        </div>

        <div className="mainScreen-dialog-buttons">
          <button
            type="button"
            className="mainScreen-dialog-button mainScreen-dialog-button_secondary"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
