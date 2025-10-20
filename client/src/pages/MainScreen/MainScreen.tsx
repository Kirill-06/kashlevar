import React, { useContext, useState, useEffect } from 'react';
import { IBasePage } from '../PageManager';
import { ServerContext } from '../../App';
import './MainScreen.scss';
import { UserProgress, UserVapes } from '../../services/server/types';

// Изображения
import Background from '../../assets/img/MainScreen/city.png';
import { ReactComponent as Person } from '../../assets/img/MainScreen/person 2.svg';
import { ReactComponent as Nickname } from '../../assets/img/MainScreen/Nickname.svg';
import { ReactComponent as AscensionButton } from '../../assets/img/MainScreen/Кнопка восхождения.svg';
import { ReactComponent as ShopButton } from '../../assets/img/MainScreen/Кнопка магазина.svg';
import { ReactComponent as RatingButton } from '../../assets/img/MainScreen/Кнопка рейтинга.svg';
import { ReactComponent as Coins } from '../../assets/img/MainScreen/Монета.svg';
import { ReactComponent as HappinessBar } from '../../assets/img/MainScreen/happynessbar 2.svg';
import Platform from '../../assets/img/MainScreen/Ellipse 1.svg';
import HpBar from '../../assets/img/MainScreen/Hpbar.png';
import { ReactComponent as SmokeLeft } from '../../assets/img/MainScreen/Smokebuttons 2.svg';
import { ReactComponent as SmokeRight } from '../../assets/img/MainScreen/Smokebuttons 3.svg';

const MainScreen: React.FC<IBasePage> = () => {
  const server = useContext(ServerContext);
const [stats, setStats] = useState<{ userProgress: UserProgress | null; userVapes: UserVapes | null }>({
  userProgress: null,
  userVapes: null,
});
const [error, setError] = useState<string>("");

const fetchStats = async () => {
  try {
    const [progress, vapes] = await Promise.all([
      server.getUserProgress(),
      server.getUserVapes(),
    ]);
    setStats({ userProgress: progress, userVapes: vapes });
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    setError("Не удалось загрузить данные с сервера");
  }
};

useEffect(() => {
  fetchStats();
  const interval = setInterval(fetchStats, 10000);
  return () => clearInterval(interval);
}, []);

  const displayHappiness = userProgress ? Number(userProgress.happines) * 10 : 0;
  const displayCoins = userProgress ? Number(userProgress.coins) * 10 : 0;

  const onAvatarClick = () => console.log('Avatar clicked');
  const onAscendClick = () => console.log('Ascension clicked');
  const onShopClick = () => console.log('Shop clicked');
  const onRatingClick = () => console.log('Rating clicked');


  return (
    <div className="mainScreen">
      <img src={Background} alt="Background" className="mainScreen-background" />

      <div className="mainScreen-topLeft">
        <HappinessBar className="mainScreen-happinessIcon" />
        <span className="mainScreen-happinessText">{displayHappiness}%</span>
      </div>

      <div className="mainScreen-topRight">
        <Coins className="mainScreen-coinsIcon" />
        <span className="mainScreen-coinsText">{displayCoins}</span>
      </div>

      <div className="mainScreen-center">
        <img src={Platform} alt="Platform" className="mainScreen-platform" />
        <button
          type="button"
          className="mainScreen-avatarBtn"
          onClick={onAvatarClick}
          onKeyDown={onKeyBtn}
          aria-label="Аватар"
        >
          <Person className="mainScreen-person" />
        </button>
        <img src={HpBar} alt="Health Bar" className="mainScreen-healthBar" />
        <Nickname className="mainScreen-nickname" />
      </div>

      <div className="mainScreen-smokeLeft">
        <SmokeLeft className="smokeBase" />
        <div className="smokeCircles">
          <div
            className="circle circle-left is-clickable"
            role="button"
            tabIndex={0}
            onClick={onAscendClick}
            onKeyDown={onKeyBtn}
            aria-label="Восхождение"
          >
            <AscensionButton />
          </div>
          <div
            className="circle circle-right is-clickable"
            role="button"
            tabIndex={0}
            onClick={onShopClick}
            onKeyDown={onKeyBtn}
            aria-label="Магазин"
          >
            <ShopButton />
          </div>
        </div>
      </div>

      <div className="mainScreen-smokeRight">
        <SmokeRight className="smokeBase" />
        <div className="smokeCircles">
          <div
            className="circle circle-right is-clickable"
            role="button"
            tabIndex={0}
            onClick={onRatingClick}
            onKeyDown={onKeyBtn}
            aria-label="Рейтинг"
          >
            <RatingButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
