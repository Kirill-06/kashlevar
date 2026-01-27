import React from 'react';

type Props = {
  platformSrc: string;
  hpBarImage: string;
  loading: boolean;
  healthValue: number;
  heartSrc: string;
  displayName: string;
};

export const CenterPanel: React.FC<Props> = ({
  platformSrc,
  hpBarImage,
  loading,
  healthValue,
  heartSrc,
  displayName,
}) => {
  return (
    <div className="mainScreen-center">
      <img src={platformSrc} alt="Platform" className="mainScreen-platform" />
      <img src={hpBarImage} alt="Health Bar" className="mainScreen-healthBar" />

      <div className="mainScreen-healthValue">
        {loading ? (
          '—'
        ) : (
          <>
            <span className="mainScreen-healthNumber">{healthValue}</span>
            <img src={heartSrc} alt="Здоровье" className="mainScreen-healthHeart" />
          </>
        )}
      </div>

      <div className="mainScreen-nicknameWrap">
        <span className="mainScreen-nicknameText">{displayName}</span>
      </div>
    </div>
  );
};
