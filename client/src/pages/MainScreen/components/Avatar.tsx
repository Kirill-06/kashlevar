import React from 'react';

type Props = {
  personImage: string;
  onClick: () => void;
  disabled?: boolean;
};

export const Avatar: React.FC<Props> = ({ personImage, onClick, disabled }) => {
  return (
    <div className="mainScreen-personContainer">
      <button
        type="button"
        className="mainScreen-avatarBtn"
        onClick={onClick}
        aria-label="Аватар"
        disabled={disabled}
      >
        <img src={personImage} alt="Person" className="mainScreen-person" />
      </button>
    </div>
  );
};
