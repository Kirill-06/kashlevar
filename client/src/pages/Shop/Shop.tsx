
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import { ShopItem, UserVapes } from '../../services/server/types';
import { ReactComponent as Coins } from '../../assets/img/MainScreen/coin.svg';

import Bg from '../../assets/img/ShopScreen/shop_bg_clean.png';
import ShelfWide from '../../assets/img/ShopScreen/shelf_plain.png';
import Counter from '../../assets/img/ShopScreen/counter.png';
import PersonImg from '../../assets/img/ShopScreen/person2.png';
import TraderImg from '../../assets/img/ShopScreen/trader4.png';

import './Shop.scss';

type DialogType = 'success' | 'error';
interface DialogState {
  type: DialogType;
  title: string;
  message: string;
}

const BASE = 1024;
const toPx = (pct: number) => (pct / 100) * BASE;

function useContainScale(baseSize = BASE) {
  const calc = useCallback(
    () => Math.min(window.innerWidth / baseSize, window.innerHeight / baseSize),
    [baseSize],
  );
  const [scale, setScale] = useState<number>(() => (typeof window !== 'undefined' ? calc() : 1));

  useEffect(() => {
    const onResize = () => setScale(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [calc]);

  return scale;
}


const SHELF_TOP_PCTS = [25.0, 50.0];


const CARD_GAP_PX = 12;

const CARD_W = 248;

const Shop: React.FC<IBasePage> = ({ setPage }) => {
  const server = useContext(ServerContext);
  const store = useContext(StoreContext);

  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<UserVapes[]>([]);
  const [coins, setCoins] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const scale = useContainScale(BASE);

  
  const visibleItems = useMemo(() => items.slice(0, 4), [items]);

  useEffect(() => {
    if (!server) return;
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
        const [catalog, user, inv] = await Promise.all([
          server.getCatalog(),
          server.getUserInfo(),
          server.getInventory(),
        ]);

        if (!mounted) return;

        setItems(catalog ?? []);
        setInventory(inv ?? []);

        if (user) {
          store.setUserInfo && store.setUserInfo(user as any);
          setCoins(Number((user as any).money ?? 0));
        }

      mounted && setIsLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [server, store]);

  const ownedForItem = (item: ShopItem) =>
    inventory.find((inv) => inv.name === item.name && inv.type === item.type);

  const refreshUserInfo = async () => {
    if (!server) return;
    const user = await server.getUserInfo();
    if (user) {
      store.setUserInfo && store.setUserInfo(user as any);
      setCoins(Number((user as any).money ?? 0));
    }
  };

  const refreshInventory = async () => {
    if (!server) return;
    const inv = await server.getInventory();
    setInventory(inv ?? []);
  };

  const buy = async (item: ShopItem) => {
    if (!server || isBusy) return;

    if (coins < item.cost) {
      setDialog({
        type: 'error',
        title: 'Недостаточно монет',
        message: `Для покупки "${item.name}" нужно ${item.cost} монет, а у вас только ${coins}.`,
      });
      return;
    }

    setIsBusy(true);

    const ok = await server.buy(item.id);
    if (ok) {
      setDialog({ type: 'success', title: 'Покупка успешна', message: `Вы купили "${item.name}"!` });
      await refreshUserInfo();
      await refreshInventory();
    } else {
      setDialog({ type: 'error', title: 'Ошибка покупки', message: 'Не удалось купить товар. Попробуйте позже.' });
    }

    setIsBusy(false);
  };

  const upgrade = async (inventoryId: number, item: ShopItem) => {
    if (!server || isBusy) return;

    setIsBusy(true);

    const res = await server.upgradeItem(inventoryId);
    if (res) {
      setDialog({
        type: 'success',
        title: 'Улучшение успешно',
        message: `Предмет "${item.name}" улучшен до уровня ${res.level}.`,
      });
      await refreshUserInfo();
      await refreshInventory();
    } else {
      setDialog({
        type: 'error',
        title: 'Ошибка улучшения',
        message: 'Не удалось улучшить предмет. Возможно, не хватает монет или предмет не ваш.',
      });
    }

    setIsBusy(false);
  };

  const refill = async (inventoryId: number, item: ShopItem) => {
    if (!server || isBusy) return;

    setIsBusy(true);

    const res = await server.refillItem(inventoryId);
    if (res) {
      setDialog({
        type: 'success',
        title: 'Заправка успешна',
        message: `Предмет "${item.name}" заправлен.`,
      });
      await refreshUserInfo();
      await refreshInventory();
    } else {
      setDialog({
        type: 'error',
        title: 'Ошибка заправки',
        message: 'Не удалось заправить предмет. Возможно, не хватает монет или предмет не ваш.',
      });
    }

    setIsBusy(false);
  };

  
  const shelfLeft = 512;

  
  const slotOffset = CARD_W / 2 + CARD_GAP_PX / 2;
  const slotX = [512 - slotOffset, 512 + slotOffset];

  const renderCard = (item: ShopItem, x: number, shelfTop: number) => {
      const owned = ownedForItem(item);

      return (
        <div
          className={'shop-card ' + (!owned ? 'shop-card_buy' : '')}
          style={{
            left: x,
            top: shelfTop,
            
            transform: 'translate(-50%, -100%) translateY(0px)',
          }}
        >
          <div className="shop-cardContent">
            <div className="shop-cardName" title={item.name}>
              {item.name}
            </div>

            <div className="shop-cardPrice">Цена: {item.cost} 🪙</div>

            {}
            {owned && (
              <div className="shop-cardInfoCompact" title={`Уровень: ${owned.level}, Заряды: ${owned.current_value}`}>
                <span>Ур. {owned.level}</span>
                <span className="shop-cardInfoDot">•</span>
                <span>Заряды {owned.current_value}</span>
              </div>
            )}
          </div>

          <div className={'shop-cardBtns ' + (owned ? 'shop-cardBtns_two' : 'shop-cardBtns_one')}>
            {!owned ? (
              <button className="shop-cardBtn shop-cardBtn_full" onClick={() => buy(item)} disabled={isLoading || isBusy}>
                Купить
              </button>
            ) : (
              <>
                <button className="shop-cardBtn" onClick={() => upgrade(owned.id, item)} disabled={isLoading || isBusy}>
                  Улучшить
                </button>
                <button className="shop-cardBtn" onClick={() => refill(owned.id, item)} disabled={isLoading || isBusy}>
                  Заправить
                </button>
              </>
            )}
          </div>
        </div>
      );
    };

  return (
    <div className="shop">
      <div className="shop-bgFill" style={{ backgroundImage: `url(${Bg})` }} />
      <div className="shop-bgDim" />

      <button className="shop-exitButton" onClick={() => setPage(PAGES.MAIN_SCREEN)} aria-label="Назад" />
      <div className="shop-title">Нажмите на кнопку, чтобы купить или улучшить товар</div>

      <div className="shop-coins" aria-label="Монеты">
        <Coins className="shop-coinsIcon" />
        <span className="shop-coinsText">{coins}</span>
      </div>

      <div className="shop-stage">
        <div className="shop-scene" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
          <img className="shop-bg" src={Bg} alt="" />

          {SHELF_TOP_PCTS.map((pct, row) => {
            const shelfTop = toPx(pct);
            const leftItem = visibleItems[row * 2];
            const rightItem = visibleItems[row * 2 + 1];

            return (
              <React.Fragment key={`shelf_${row}`}>
                <img className="shop-shelfWide" src={ShelfWide} alt="" style={{ left: shelfLeft, top: shelfTop }} />
                {leftItem && renderCard(leftItem, slotX[0], shelfTop)}
                {rightItem && renderCard(rightItem, slotX[1], shelfTop)}
              </React.Fragment>
            );
          })}

          <img className="shop-personSprite" src={PersonImg} alt="" />
          <img className="shop-traderSprite" src={TraderImg} alt="" />
          <img className="shop-counterSprite" src={Counter} alt="" />
        </div>
      </div>

      {dialog && (
        <div className="shop-dialogOverlay" onClick={() => setDialog(null)}>
          <div className="shop-dialog" onClick={(e) => e.stopPropagation()}>
            <div
              className={
                'shop-dialog-title ' +
                (dialog.type === 'success' ? 'shop-dialog-title_success' : 'shop-dialog-title_error')
              }
            >
              {dialog.title}
            </div>
            <div className="shop-dialog-text">{dialog.message}</div>
            <button className="shop-dialog-button" onClick={() => setDialog(null)}>
              Ок
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;