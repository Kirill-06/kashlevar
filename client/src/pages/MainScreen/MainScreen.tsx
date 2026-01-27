import React, { useContext, useMemo, useState } from 'react';
import { IBasePage, PAGES } from '../PageManager';
import { ServerContext, StoreContext } from '../../App';
import './MainScreen.scss';
import { UserVapes } from '../../services/server/types';

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

import { Avatar } from './components/Avatar';
import { CenterPanel } from './components/CenterPanel';
import { LogoutDialog } from './components/LogoutDialog';
import { SmokeControls } from './components/SmokeControls';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { VapeButton } from './components/VapeButton';
import { VapeDialog } from './components/VapeDialog';
import { useMainStats, normalizeVapes } from './hooks/useMainStats';
import { usePuffAnimation } from './hooks/usePuffAnimation';

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

  const { stats, setStats, loading } = useMainStats(server, setPage);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showVapeDialog, setShowVapeDialog] = useState(false);
  const [selectedVapeId, setSelectedVapeId] = useState<number | null>(null);
  const [toast, setToast] = useState<string>('');

  const { personFrame, isPuffLoading, triggerPuff } = usePuffAnimation();

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1800);
  };

  const displayHappiness = stats.userProgress
    ? Math.max(0, Number(stats.userProgress.happines))
    : 0;

  const displayCoins = stats.userInfo ? Number(stats.userInfo.money ?? 0) : 0;

  const displayHealth = stats.userProgress ? Math.max(0, Number(stats.userProgress.hp)) : 0;

  const displayName = stats.userInfo?.username || 'Гость';

  const happinessBarImage = getHappinessBarImage(displayHappiness);
  const hpBarImage = getHpBarImage(displayHealth);

  const currentSelectedVape: UserVapes | null = useMemo(() => {
    if (stats.userVapes.length === 0) return null;
    const found = stats.userVapes.find(v => v.id === selectedVapeId);
    return found ?? stats.userVapes[0];
  }, [stats.userVapes, selectedVapeId]);

  React.useEffect(() => {
    if (selectedVapeId != null) return;
    if (stats.userVapes.length === 0) return;
    setSelectedVapeId(stats.userVapes[0].id);
  }, [stats.userVapes, selectedVapeId]);

  const onAvatarClick = async () => {
    if (!server) {
      showToast('Сервер недоступен');
      return;
    }

    if (isPuffLoading) return;

    const vapeToUse = currentSelectedVape;
    if (!vapeToUse) {
      showToast('У вас нет вейпа');
      return;
    }

    if (Number(vapeToUse.current_value) <= 0) {
      showToast('Вейп разряжен');
      return;
    }

    const animDone = triggerPuff();

    const updatedProgress = await server.puff(vapeToUse.id);
    if (!updatedProgress) {
      await animDone;
      showToast('Ошибка puff');
      return;
    }

    const updatedVapes = await server.getInventory();

    setStats(prev => ({
      ...prev,
      userProgress: updatedProgress,
      userVapes: normalizeVapes(updatedVapes),
    }));

    await animDone;
  };

  const onAscendClick = () => setPage(PAGES.TOWER);
  const onShopClick = () => setPage(PAGES.SHOP);
  const onRatingClick = () => setPage(PAGES.RATING);

  const onLogoutClick = () => setShowLogoutDialog(true);

  const confirmLogout = async () => {
    if (server && typeof server.logout === 'function') {
      await server.logout();
    }

    store.clearUser();
    store.clearUserInfo();
    store.clearMessages();
    setShowLogoutDialog(false);
    setPage(PAGES.LOGIN);
  };

  const cancelLogout = () => setShowLogoutDialog(false);

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

      <TopBar
        happinessBarImage={happinessBarImage}
        happinessValue={displayHappiness}
        coinsValue={displayCoins}
        CoinsIcon={Coins}
        onLogout={onLogoutClick}
      />

      <CenterPanel
        platformSrc={Platform}
        hpBarImage={hpBarImage}
        loading={loading}
        healthValue={displayHealth}
        heartSrc={Heart}
        displayName={displayName}
      />

      <Avatar personImage={personImage} onClick={onAvatarClick} disabled={isPuffLoading} />

      <SmokeControls
        rootClassName="mainScreen-smokeLeft"
        Smoke={SmokeLeft}
        buttons={[
          {
            key: 'ascend',
            onClick: onAscendClick,
            ariaLabel: 'Восхождение',
            className: 'circle circle-left is-clickable',
            children: <AscensionButton />,
          },
          {
            key: 'shop',
            onClick: onShopClick,
            ariaLabel: 'Магазин',
            className: 'circle circle-right is-clickable',
            children: <ShopButton />,
          },
        ]}
      />

      <SmokeControls
        rootClassName="mainScreen-smokeRight"
        Smoke={SmokeRight}
        buttons={[
          {
            key: 'rating',
            onClick: onRatingClick,
            ariaLabel: 'Рейтинг',
            className: 'circle circle-right is-clickable',
            children: <RatingButton />,
          },
        ]}
      />

      {currentSelectedVape && <VapeButton vape={currentSelectedVape} onClick={openVapeDialog} />}

      {showVapeDialog && (
        <VapeDialog
          vapes={stats.userVapes}
          activeVapeId={currentSelectedVape?.id ?? null}
          onSelect={handleSelectVape}
          onClose={() => setShowVapeDialog(false)}
        />
      )}

      {showLogoutDialog && <LogoutDialog onConfirm={confirmLogout} onCancel={cancelLogout} />}

      <Toast message={toast} />
    </div>
  );
};

export default MainScreen;
