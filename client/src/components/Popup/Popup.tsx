import React, { useContext, useState, useEffect } from 'react';
import { ServerContext } from '../../App';
import Button from '../Button/Button';

import './Popup.scss';
import { TError } from '../../services/server/types';

type TInnerButton = {
    isHover?: boolean;
    text: string;
    onClick: () => void;
};

export type TPopupData = {
    className?: string;
    title?: string;
    text?: string;
    closeHovered?: boolean;
    buttons?: TInnerButton[];
};

const Popup: React.FC = () => {
    const server = useContext(ServerContext);
    const [data, setData] = useState<TPopupData | null>(null);

    useEffect(() => {
        if (!server) return;

        const showErrorHandler = (error: TError) => {
            const { code, text } = error;
            setData({
                title: `Ошибка №${code}`,
                text,
            });

            setTimeout(() => setData(null), 3000);
        };

        server.showError(showErrorHandler);
    }, [server]);

    if (!data) return null;

    const { title, text, buttons = [] } = data;

    return (
        <div className="popup">
            <div className="popup-wrapper">
                <div className="popup-text-block">
                    {title && <div className="popup-title">{title}</div>}
                    {text && <div className="popup-info-text">{text}</div>}
                </div>

                {buttons.length > 0 && (
                    <div className="popup-buttons">
                        {buttons.map((btn, index) => {
                            const { text, onClick, isHover } = btn;
                            return (
                                <Button
                                    variant="main"
                                    key={index}
                                    text={text}
                                    onClick={onClick}
                                    isHover={isHover}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popup;