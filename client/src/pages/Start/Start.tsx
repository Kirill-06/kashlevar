import React from 'react';
import { IBasePage, PAGES } from '../PageManager';
import Button from '../../components/Button/Button';
import './Start.scss';

const Start: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    const startGameHandler = () => {
        setPage(PAGES.GAME); // Вот сюда следующий экран вместо GAME
    };

    const exitHandler = () => {
        setPage(PAGES.LOGIN);
    };

    return (
        <div className='start'>
            <div className='start-background'></div>
            <div className='start-texture'></div>
            <div className='start-logo'></div>
            <div className='start-title'>
                <div className='start-rectangle'></div>
                Кашлевар
                <div className='start-rectangle'></div>
            </div>
            <div className='start-buttons'>
                <Button 
                    onClick={exitHandler} 
                    text='Выход' 
                    variant='secondary' 
                    className="button-exit"
                />
                <div style={{flex: 1}}></div>
                <Button 
                    onClick={startGameHandler} 
                    text='Начать игру' 
                    className="button-start"
                />
            </div>
        </div>
    );
};

export default Start;