import React from 'react';

type CircleBtn = {
  key: string;
  onClick: () => void;
  ariaLabel: string;
  className: string;
  children: React.ReactNode;
};

type Props = {
  rootClassName: string;
  Smoke: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  buttons: CircleBtn[];
};

export const SmokeControls: React.FC<Props> = ({ rootClassName, Smoke, buttons }) => {
  return (
    <div className={rootClassName}>
      <Smoke className="smokeBase" />
      <div className="smokeCircles">
        {buttons.map(btn => (
          <button
            key={btn.key}
            type="button"
            className={btn.className}
            onClick={btn.onClick}
            aria-label={btn.ariaLabel}
          >
            {btn.children}
          </button>
        ))}
      </div>
    </div>
  );
};
