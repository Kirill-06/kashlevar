import React, { useContext, useState, useEffect } from 'react';
import { IBasePage, PAGES } from '../PageManager';
import { ServerContext, StoreContext } from '../../App';
import './MainScreen.scss';
import { UserProgress, UserVapes, UserInfo } from '../../services/server/types';

import Background from '../../assets/img/MainScreen/city.png';
import Person1 from '../../assets/img/MainScreen/smokeanum1.png';
import Person2 from '../../assets/img/MainScreen/smokeanum2.png';
import Person3 from '../../assets/img/MainScreen/smokeanum3.png';
import Person4 from '../../assets/img/MainScreen/smokeanum4.png';
import { ReactComponent as AscensionButton } from '../../assets/img/MainScreen/AscensionButton.svg';
import { ReactComponent as ShopButton } from '../../assets/img/MainScreen/ShopButton.svg';
import { ReactComponent as RatingButton } from '../../assets/img/MainScreen/RatingButton.svg';
import { ReactComponent as Coins } from '../../assets/img/MainScreen/coin.svg';
import HappinessBar0 from '../../assets/img/MainScreen/happynessbar-0.png';
import HappinessBar1 from '../../assets/img/MainScreen/happynessbar-1.png';
import HappinessBar2 from '../../assets/img/MainScreen/happynessbar-2.png';
import HappinessBar3 from '../../assets/img/MainScreen/happynessbar-3.png';
import HappinessBar4 from '../../assets/img/MainScreen/happynessbar-4.png';
import HappinessBar5 from '../../assets/img/MainScreen/happynessbar-5.png';
import Platform from '../../assets/img/MainScreen/Ellipse.svg';
import Hp0 from '../../assets/img/MainScreen/hp-0%.png';
import Hp20 from '../../assets/img/MainScreen/hp-20%.png';
import Hp40 from '../../assets/img/MainScreen/hp-40%.png';
import Hp50 from '../../assets/img/MainScreen/hp-50%.png';
import Hp60 from '../../assets/img/MainScreen/hp-60%.png';
import Hp80 from '../../assets/img/MainScreen/hp-80%.png';
import Hp100 from '../../assets/img/MainScreen/hp-100%.png';
import Heart from '../../assets/img/MainScreen/heart.png';
import { ReactComponent as SmokeLeft } from '../../assets/img/MainScreen/smokeL.svg';
import { ReactComponent as SmokeRight } from '../../assets/img/MainScreen/smokeR.svg';

const UPDATE_INTERVAL_MS = 5 * 1000;

const getHappinessBarImage = (value: number) => {
  if (value <= 0) return HappinessBar0;
  if (value <= 20) return HappinessBar1;
  if (value <= 40) return HappinessBar2;
  if (value <= 60) return HappinessBar3;
  if (value <= 80) return HappinessBar4;
  return HappinessBar5;
};

const getHpBarImage = (value: number) => {
  if (value <= 0) return Hp0;
  if (value <= 20) return Hp20;
  if (value <= 40) return Hp40;
  if (value <= 50) return Hp50;
  if (value <= 60) return Hp60;
  if (value <= 80) return Hp80;
  return Hp100;
};

const MainScreen: React.FC<IBasePage> = (props: IBasePage) => {
  const { setPage } = props;
  const server = useContext(ServerContext);
  const store = useContext(StoreContext);

  const [stats, setStats] = useState<{
    userProgress: UserProgress | null;
    userVapes: UserVapes[];
    userInfo: UserInfo | null;
  }>({
    userProgress: null,
    userVapes: [],
    userInfo: null,
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isPuffLoading, setIsPuffLoading] = useState(false);
  const [showVapeDialog, setShowVapeDialog] = useState(false);
  const [selectedVapeId, setSelectedVapeId] = useState<number | null>(null);
  const [personFrame, setPersonFrame] = useState<number>(0);

  const fetchInitial = async () => {
    if (!server) return;
    try {
      const [progress, user, vapes] = await Promise.all([
        server.getUserProgress(),
        server.getUserInfo(),
        server.getInventory(),
      ]);

      const vapesList: UserVapes[] = Array.isArray(vapes)
          ? vapes
          : vapes
              ? [vapes]
              : [];

      setStats(prev => ({
        ...prev,
        userProgress: progress,
        userInfo: user,
        userVapes: vapesList,
      }));

      if (vapesList.length > 0) {
        setSelectedVapeId(prevId => prevId ?? vapesList[0].id);
      }

      const hp = progress ? Number(progress.hp ?? 0) : 0;
      if (hp <= 0) {
        setPage(PAGES.HELL);
      }

      setError('');
    } catch (e) {
      setError('Не удалось загрузить данные с сервера');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProgress = async () => {
    if (!server) return;

    try {
      const progress = await server.updateHappinessAfterOfline();
      if (!progress) return;

      setStats(prev => ({
        ...prev,
        userProgress: progress,
      }));
      const hp = Number(progress.hp ?? 0);
      if (hp <= 0) {
        setPage(PAGES.HELL);
      }
    } catch (e) {
    }
  };

  useEffect(() => {
    fetchInitial();

    const id = window.setInterval(updateUserProgress, UPDATE_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  const displayHappiness = stats.userProgress
      ? Math.max(0, Number(stats.userProgress.happines))
      : 0;

  const displayCoins = stats.userProgress ? Number(stats.userInfo?.money) : 0;

  const displayHealth = stats.userProgress
      ? Math.max(0, Number(stats.userProgress.hp))
      : 0;

  const displayName = stats.userInfo?.username || 'Гость';

  const happinessBarImage = getHappinessBarImage(displayHappiness);
  const hpBarImage = getHpBarImage(displayHealth);

  const currentSelectedVape: UserVapes | null =
      stats.userVapes.length === 0
          ? null
          : stats.userVapes.find(v => v.id === selectedVapeId) || stats.userVapes[0];

  const PUFF_FRAMES = [0, 1, 2, 3, 2, 1, 0];   
  const PUFF_FRAME_DURATION = 120;            

  const playPuffAnimation = () => {
    PUFF_FRAMES.forEach((frame, index) => {
      setTimeout(() => {
        setPersonFrame(frame);

        if (index === PUFF_FRAMES.length - 1) {
          setIsPuffLoading(false);
          setPersonFrame(0); 
        }
      }, index * PUFF_FRAME_DURATION);
    });
  };

  const onAvatarClick = async () => {
    if (!server) return;
    if (isPuffLoading) return; 

    const vapeToUse = currentSelectedVape;
    if (!vapeToUse) {
      return;
    }

    if (vapeToUse.current_value <= 0) {
      return;
    }

    setIsPuffLoading(true);
    playPuffAnimation(); 

    try {
      const updatedProgress = await server.puff(vapeToUse.id);

      if (updatedProgress) {
        const updatedVapes = await server.getInventory();

        setStats((prev) => ({
          ...prev,
          userProgress: updatedProgress,
          userVapes: updatedVapes,
        }));
      }
    } catch (e) {
    }
  };

  const onAscendClick = () => console.log('Ascension clicked');
  const onShopClick = () => setPage(PAGES.SHOP);
  const onRatingClick = () => setPage(PAGES.RATING);

  const onLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      if (server && typeof server.logout === 'function') {
        await server.logout();
      }
    } catch (e) {
    }

    store.clearUser();
    store.clearUserInfo();
    store.clearMessages();
    setShowLogoutDialog(false);
    setPage(PAGES.LOGIN);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const openVapeDialog = () => {
    if (stats.userVapes.length === 0) return;
    setShowVapeDialog(true);
  };

  const handleSelectVape = (id: number) => {
    setSelectedVapeId(id);
    setShowVapeDialog(false);
  };

  const personFrames = [Person1, Person2, Person3, Person4];
  const personImage = personFrames[personFrame] || Person1;

  return (
      <div className="mainScreen">
        <img src={Background} alt="Background" className="mainScreen-background" />

        <div className="mainScreen-topBar">
          <div className="mainScreen-topLeft">
            <img src={happinessBarImage} alt="Happiness Bar" className="mainScreen-happinessIcon" />
            <span className="mainScreen-happinessText">{displayHappiness}%</span>
          </div>

          <div className="mainScreen-topRight">
            <Coins className="mainScreen-coinsIcon" />
            <span className="mainScreen-coinsText">{displayCoins}</span>

            <button
                type="button"
                className="mainScreen-logoutBtn"
                onClick={onLogoutClick}
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="mainScreen-center">
          <img src={Platform} alt="Platform" className="mainScreen-platform" />
          <img src={hpBarImage} alt="Health Bar" className="mainScreen-healthBar" />
          <div className="mainScreen-healthValue">
            {loading ? (
                '—'
            ) : (
                <>
                  <span className="mainScreen-healthNumber">{displayHealth}</span>
                  <img
                      src={Heart}
                      alt="Здоровье"
                      className="mainScreen-healthHeart"
                  />
                </>
            )}
          </div>
          <div className="mainScreen-nicknameWrap">
            <span className="mainScreen-nicknameText">{displayName}</span>
          </div>
        </div>

        <div className="mainScreen-personContainer">
          <button
              type="button"
              className="mainScreen-avatarBtn"
              onClick={onAvatarClick}
              aria-label="Аватар"
          >
            <img src={personImage} alt="Person" className="mainScreen-person" />
          </button>
        </div>

        <div className="mainScreen-smokeLeft">
          <SmokeLeft className="smokeBase" />
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
          <SmokeRight className="smokeBase" />
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

        {currentSelectedVape && (
            <button
                type="button"
                className="mainScreen-vapeButton"
                onClick={openVapeDialog}
            >
              <div className="mainScreen-vapeButton-text">
                {currentSelectedVape.name}
                <span className="mainScreen-vapeButton-sub">
              Уровень {currentSelectedVape.level} · Заряд {currentSelectedVape.current_value}
            </span>
              </div>
            </button>
        )}

        {showVapeDialog && (
            <div className="mainScreen-dialogOverlay" onClick={() => setShowVapeDialog(false)}>
              <div
                  className="mainScreen-dialog mainScreen-vapeDialog"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="mainScreen-dialog-title">
                  Выберите вейп
                </div>

                <div className="mainScreen-vapeList">
                  {stats.userVapes.map(vape => (
                      <button
                          key={vape.id}
                          type="button"
                          className={
                              'mainScreen-vapeItem' +
                              (currentSelectedVape && currentSelectedVape.id === vape.id
                                  ? ' mainScreen-vapeItem_active'
                                  : '')
                          }
                          onClick={() => handleSelectVape(vape.id)}
                      >
                        <div className="mainScreen-vapeItem-name">{vape.name}</div>
                        <div className="mainScreen-vapeItem-meta">
                          <span>Уровень: {vape.level}</span>
                          <span>Заряд: {vape.current_value}</span>
                        </div>
                      </button>
                  ))}

                  {stats.userVapes.length === 0 && (
                      <div className="mainScreen-vapeEmpty">
                        У вас пока нет вейпов
                      </div>
                  )}
                </div>

                <div className="mainScreen-dialog-buttons">
                  <button
                      type="button"
                      className="mainScreen-dialog-button mainScreen-dialog-button_secondary"
                      onClick={() => setShowVapeDialog(false)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
        )}

        {showLogoutDialog && (
            <div className="mainScreen-dialogOverlay" onClick={cancelLogout}>
              <div
                  className="mainScreen-dialog"
                  onClick={(e) => e.stopPropagation()}
              >
                <div className="mainScreen-dialog-title">
                  Вы уверены, что хотите выйти?
                </div>
                <div className="mainScreen-dialog-text">
                  Ваш прогресс сохранён, вы сможете вернуться в игру позже.
                </div>

                <div className="mainScreen-dialog-buttons">
                  <button
                      type="button"
                      className="mainScreen-dialog-button mainScreen-dialog-button_secondary"
                      onClick={cancelLogout}
                  >
                    Отмена
                  </button>
                  <button
                      type="button"
                      className="mainScreen-dialog-button mainScreen-dialog-button_primary"
                      onClick={confirmLogout}
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default MainScreen;