import React from 'react';
import { IBasePage, PAGES } from '../PageManager';
import Button from '../../components/Button/Button';
import './Start.scss';

const Start: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    const startGameHandler = () => {
        setPage(PAGES.WELCOME); 
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
                    text='Новая игра' 
                    className="button-start"
                />
            </div>
        </div>
    );
};

export default Start;