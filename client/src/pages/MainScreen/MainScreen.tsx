import React, { useContext, useState, useEffect } from 'react';
import { IBasePage, PAGES } from '../PageManager';
import { ServerContext } from '../../App';
import './MainScreen.scss';
import { UserProgress, UserVapes } from '../../services/server/types';

// === Изображения ===
// Для PNG используйте правильный путь
import Background from '../../assets/img/MainScreen/city.png';

// Для SVG можно использовать оба варианта
import { ReactComponent as Person } from '../../assets/img/MainScreen/person 2.svg';
import { ReactComponent as Nickname } from '../../assets/img/MainScreen/Nickname.svg';
import { ReactComponent as AscensionButton } from '../../assets/img/MainScreen/Кнопка восхождения.svg';
import { ReactComponent as ShopButton } from '../../assets/img/MainScreen/Кнопка магазина.svg';
import { ReactComponent as RatingButton } from '../../assets/img/MainScreen/Кнопка рейтинга.svg';
import { ReactComponent as Coins } from '../../assets/img/MainScreen/Баланс монеток.svg';
import { ReactComponent as HappinessBar } from '../../assets/img/MainScreen/happynessbar 2.svg';
import HealthBar from '../../assets/img/MainScreen/Hpbar.png'; // PNG
import { ReactComponent as SmokeLeft } from '../../assets/img/MainScreen/Smokebuttons 2.svg';
import { ReactComponent as SmokeRight } from '../../assets/img/MainScreen/Smokebuttons 3.svg';

const MainScreen: React.FC<IBasePage> = ({ setPage }) => {
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

  // Правильное преобразование чисел
  const displayHappiness = stats.userProgress 
    ? Number(stats.userProgress.happines) * 10 
    : 0;

  const displayCoins = stats.userProgress 
    ? Number(stats.userProgress.coins) * 10 
    : 0;

  const displayHealth = stats.userProgress 
    ? Number(stats.userProgress.health) 
    : 0;

  return (
    <div className="mainScreen">
      {/* Фон */}
      <img src={Background} alt="Background" className="mainScreen-background" />

      {/* Верхние показатели */}
      <div className="mainScreen-top">
        <div className="mainScreen-happiness">
          <HappinessBar />
          <span>{displayHappiness.toString()}%</span>
        </div>
        <div className="mainScreen-coins">
          <Coins />
          <span>{displayCoins.toString()}</span>
        </div>
      </div>

      {/* Центральный персонаж и здоровье */}
      <div className="mainScreen-center">
        <Person className="mainScreen-person" />

        <div className="mainScreen-health">
          <img src={HealthBar} alt="HealthBar" />
          <span>{displayHealth.toString()}%</span>
        </div>

        <div className="mainScreen-nickname">
          <Nickname />
          <span>Nickname</span>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="mainScreen-actions">
        <div className="mainScreen-left">
          <SmokeLeft className="smoke" />
          <button onClick={() => setPage(PAGES.GAME)}>
            <AscensionButton />
          </button>
          <button onClick={() => setPage(PAGES.GAME)}>
            <ShopButton />
          </button>
        </div>

        <div className="mainScreen-right">
          <SmokeRight className="smoke" />
          <button onClick={() => setPage(PAGES.GAME)}>
            <RatingButton />
          </button>
        </div>
      </div>

      {error && <div className="mainScreen-error">{error}</div>}
    </div>
  );
};

export default MainScreen;