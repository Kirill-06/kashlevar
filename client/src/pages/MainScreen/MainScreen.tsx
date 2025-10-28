import React, { useContext, useState, useEffect, useRef } from 'react';
import { IBasePage, PAGES } from '../PageManager';
import { ServerContext } from '../../App';
import './MainScreen.scss';
import { UserProgress, UserVapes, UserInfo} from '../../services/server/types';

import Background from '../../assets/img/MainScreen/city.png';
import Person from '../../assets/img/MainScreen/person2.png';
import { ReactComponent as AscensionButton } from '../../assets/img/MainScreen/AscensionButton.svg';
import { ReactComponent as ShopButton } from '../../assets/img/MainScreen/ShopButton.svg';
import { ReactComponent as RatingButton } from '../../assets/img/MainScreen/RatingButton.svg';
import { ReactComponent as Coins } from '../../assets/img/MainScreen/coin.svg';
import HappinessBar from '../../assets/img/MainScreen/happynessbar.png';
import Platform from '../../assets/img/MainScreen/Ellipse.svg';
import HpBar from '../../assets/img/MainScreen/Hpbar.png';
import SmokeLeft from '../../assets/img/MainScreen/smokeL.png';
import SmokeRight from '../../assets/img/MainScreen/smokeR.png';

const TEN_MIN_MS = 10 * 60 * 1000;

const MainScreen: React.FC<IBasePage> = (props: IBasePage) => {
     const { setPage } = props;
  const server = useContext(ServerContext);

  const [stats, setStats] = useState<{
    userProgress: UserProgress | null;
    userVapes: UserVapes | null;
    userInfo: UserInfo | null;
  }>({
    userProgress: null,
    userVapes: null,
    userInfo: null,
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const intervalRef = useRef<number | null>(null);

  const fetchInitial = async () => {
    try {
      const [progress, vapes, user] = await Promise.all([
        server.getUserProgress(),
        server.getUserVapes(),
        server.getUserInfo(),
      ]);
      setStats({ userProgress: progress, userVapes: vapes, userInfo: user });
      setError('');
    } catch (e) {
      console.error('Ошибка загрузки данных:', e);
      setError('Не удалось загрузить данные с сервера');
    } finally {
      setLoading(false);
    }
  };

  const updateHappiness = async () => {
    try {
      const res = await server.updateHappinessAfterOfline();
      if (res && typeof (res as any).happiness !== 'undefined') {
        const nextHappiness = Number((res as any).happiness);
        setStats(prev => {
          if (!prev.userProgress) return prev;
          return {
            ...prev,
            userProgress: {
              ...prev.userProgress,
              happines: (nextHappiness as unknown) as Number,
            },
          };
        });
      }
    } catch (e) {
      console.error('Ошибка обновления счастья:', e);
    }
  };

  useEffect(() => {
    fetchInitial();
    intervalRef.current = window.setInterval(updateHappiness, TEN_MIN_MS);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const displayHappiness = stats.userProgress
    ? Math.max(0, Number(stats.userProgress.happines))
    : 0;

  const displayCoins = stats.userProgress ? Number(stats.userProgress.coins) : 0;

  const displayHealth = stats.userProgress
    ? Math.max(0, Number(stats.userProgress.health))
    : 0;

  const displayName = stats.userInfo?.username || 'Гость';
  

  const onAvatarClick = async () => { 
    const updated = await server.puff(
    stats.userVapes ? Number(stats.userVapes.vape_id) : undefined
  );
    fetchInitial();
  }
  const onAscendClick = () => console.log('Ascension clicked');
  const onShopClick = () =>  setPage(PAGES.SHOP); 
  const onRatingClick = () => console.log('Rating clicked');
  return (
    <div className="mainScreen">
      <img src={Background} alt="Background" className="mainScreen-background" />

      <div className="mainScreen-topLeft">
        <img src={HappinessBar} alt="Happiness Bar" className="mainScreen-happinessIcon" />
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
          aria-label="Аватар"
        >
          <img src={Person} alt="Person" className="mainScreen-person" />
        </button>
        <img src={HpBar} alt="Health Bar" className="mainScreen-healthBar" />
        <div className="mainScreen-healthValue">{loading ? '—' : `${displayHealth}%`}</div>
        <div className="mainScreen-nicknameWrap">
          <span className="mainScreen-nicknameText">{displayName}</span>
        </div>
      </div>

      <div className="mainScreen-smokeLeft">
        <img src={SmokeLeft} alt="Smoke Left" className="smokeBase" />
        <div className="smokeCircles">
          <div
            className="circle circle-left is-clickable"
            role="button"
            tabIndex={0}
            onClick={onAscendClick}
            aria-label="Восхождение"
          >
            <AscensionButton />
          </div>
          <div
            className="circle circle-right is-clickable"
            role="button"
            tabIndex={0}
            onClick={onShopClick}
            aria-label="Магазин"
          >
            <ShopButton />
          </div>
        </div>
      </div>

      <div className="mainScreen-smokeRight">
        <img src={SmokeRight} alt="Smoke Right" className="smokeBase" />
        <div className="smokeCircles">
          <div
            className="circle circle-right is-clickable"
            role="button"
            tabIndex={0}
            onClick={onRatingClick}
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