import React from 'react';
import { IBasePage, PAGES } from '../PageManager';
import './Welcome.scss';

const Welcome: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;

    const startGameHandler = () => {
        setPage(PAGES.MAIN_SCREEN); // Вот сюда следующий экран вместо GAME
    };

    return (
        <div className='welcome'>
            <div className='welcome-background'></div>
            <div className='welcome-title'>
                Добро пожаловать в КАШЛеваР!
                <br></br>
                Вам предстоит Побороться за право быть сачстливым в этом жестоком Cером мире. 
                <br></br>
                Удачи!
            </div>
            <div >
                <button className='welcome-button' onClick={startGameHandler}/>
            </div>
        </div>
    );
};

export default Welcome;