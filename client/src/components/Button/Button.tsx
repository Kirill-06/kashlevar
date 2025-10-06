import React from 'react';
import cn from 'classnames';

import './Button.scss';

export type TButton = {
    variant?: string;
    isHover?: boolean;
    className?: string;
    text?: string;
    onClick?: () => void;
    isDisabled?: boolean;
};


const Button: React.FC<TButton> = ({
    variant = 'main',
    isHover = false,
    className,
    text = 'No Text',
    onClick,
    isDisabled = false,
}) => {
    return (
        <button
            className={cn(
                'button',
                `button-${variant}`,
                className,
                { hover: isHover, disabled: isDisabled }
            )}
            onClick={onClick}
            disabled={isDisabled}
        >
            {text}
        </button>
    );
};


export default Button;