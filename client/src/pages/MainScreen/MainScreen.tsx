import React, { useContext, useState, useEffect } from 'react';
import { IBasePage, PAGES } from '../PageManager';
import { ServerContext } from '../../App';
import './MainScreen.scss';
import {UserProgress, UserVapes} from "../../services/server/types.ts";

// Импортируем SVG
// import HealthBar from '../../assets/img/MainScreen/Hpbar.svg';
import HealthBar from '../../assets/img/MainScreen/Hpbar'
import Person from '../../assets/img/MainScreen/person 2.svg';
import Nickname from '../../assets/img/MainScreen/Nickname.svg';
import AscensionButton from '../../assets/img/MainScreen/Кнопка восхождения.svg';
import ShopButton from '../../assets/img/MainScreen/Кнопка магазина.svg';
import RatingButton from '../../assets/img/MainScreen/Кнопка рейтинга.svg';
import Coins from '../../assets/img/MainScreen/Баланс монеток.svg';
import Level from '../../assets/img/MainScreen/15.svg';
import HappinessBar from '../../assets/img/MainScreen/happynessbar 2.svg';
import SmokeLeft from '../../assets/img/MainScreen/Smokebuttons 2.svg';
import SmokeRight from '../../assets/img/MainScreen/Smokebuttons 3.svg';

interface IPlayerStats {
    userProgress: UserProgress; 
    userVapes: UserVapes;
}

const MainScreen: React.FC<IBasePage> = (props: IBasePage) => {
    const [stats, setStats] = useState<IPlayerStats>({
       userProgrees: UserProgress(1),
       userVapes: UserVapes(id: "1"),
    });


    const fetchStats = async () => {
        try {
            const response = await fetch('/api/player/stats');
            if (!response.ok) throw new Error('Ошибка при получении данных');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
        }
    };

    useEffect(() => {
        fetchStats();

        const interval = setInterval(fetchStats, 10000);

        return () => clearInterval(interval);
    }, []);

    const { setPage } = props;
    const server = useContext(ServerContext);
    const [error, setError] = React.useState<string>("");

    const handleAscensionClick = () => {
        setPage(PAGES.GAME)
        console.log('Восхождение clicked');
    };

    const handleShopClick = () => {
        setPage(PAGES.GAME)
        console.log('Магазин clicked');
    };

    const handleRatingClick = () => {
        setPage(PAGES.GAME)
        console.log('Рейтинг clicked');
    };

    const handleVapeClick = async () => {
        try {
            const response = await server.puff();

        } catch (err) {
            console.error(err);
            setError("Ошибка соединения с сервером");
        }
        setPage(PAGES.GAME)
        console.log('Vape clicked');
    };

    return (
        <div className='mainScreen'>
            <div className='mainScreen-background'></div>
            <div className='mainScreen-smokeLeft'>
                <img src={SmokeLeft} alt="" />
            </div>
            <div className='mainScreen-smokeRight'>
                <img src={SmokeRight} alt="" />
            </div>

            <div className='mainScreen-healthContainer'>
                <img src={HealthBar} alt="Health Bar" className='mainScreen-healthBar' />
                <div className='mainScreen-healthText'>75%</div>
            </div>

            <div className='mainScreen-centerSection'>
                <img src={Person} alt="Person" className='mainScreen-person' />
                <div className='mainScreen-nicknameContainer'>
                    <img src={Nickname} alt="Nickname" className='mainScreen-nickname' />
                </div>
            </div>
            
            <div className='mainScreen-leftPanel'>
                <div className='mainScreen-statsCard'>
                    <h3 className='mainScreen-statsTitle'>СТАТИСТИКА</h3>
                    <div className='mainScreen-levelContainer'>
                        <img src={Level} alt="Level 15" className='mainScreen-level' />
                    </div>
                    <div className='mainScreen-coinsContainer'>
                        <img src={Coins} alt="Coins" className='mainScreen-coins' />
                    </div>
                    <div className='mainScreen-happinessContainer'>
                        <img src={HappinessBar} alt="Happiness" className='mainScreen-happiness' />
                    </div>
                </div>
            </div>

            <div className='mainScreen-rightPanel'>
                <div className='mainScreen-buttonsContainer'>
                    <button className='button' onClick={handleAscensionClick}>
                        <img src={AscensionButton} alt="Восхождение" />
                    </button>
                    <button className='button' onClick={handleShopClick}>
                        <img src={ShopButton} alt="Магазин" />
                    </button>
                    <button className='button' onClick={handleRatingClick}>
                        <img src={RatingButton} alt="Рейтинг" />
                    </button>
                    <button className='button' onClick={handlePillClick}>
                        <img src={Pill} alt="Таблетка" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainScreen;