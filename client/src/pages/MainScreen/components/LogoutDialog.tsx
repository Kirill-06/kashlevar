import React from 'react';

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export const LogoutDialog: React.FC<Props> = ({ onConfirm, onCancel }) => {
  return (
    <div className="mainScreen-dialogOverlay" onClick={onCancel}>
      <div className="mainScreen-dialog" onClick={e => e.stopPropagation()}>
        <div className="mainScreen-dialog-title">Вы уверены, что хотите выйти?</div>
        <div className="mainScreen-dialog-text">
          Ваш прогресс сохранён, вы сможете вернуться в игру позже.
        </div>

        <div className="mainScreen-dialog-buttons">
          <button
            type="button"
            className="mainScreen-dialog-button mainScreen-dialog-button_secondary"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="mainScreen-dialog-button mainScreen-dialog-button_primary"
            onClick={onConfirm}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};
