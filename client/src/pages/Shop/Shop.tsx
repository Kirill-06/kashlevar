import React, { useContext, useEffect, useState } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import { ShopItem, UserVapes } from '../../services/server/types';
import { ReactComponent as Coins } from '../../assets/img/MainScreen/coin.svg';
import ShopBg from '../../assets/img/background/shop.png';
import './Shop.scss';

type DialogType = 'success' | 'error';

interface DialogState {
    type: DialogType;
    title: string;
    message: string;
}

const Shop: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);

    const [items, setItems] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const [dialog, setDialog] = useState<DialogState | null>(null);
    const [coins, setCoins] = useState<number>(0);
    const [inventory, setInventory] = useState<UserVapes[]>([]);

    useEffect(() => {
        if (!server) return;
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            try {
                const [catalog, user, inv] = await Promise.all([
                    server.getCatalog(),
                    server.getUserInfo(),
                    server.getInventory(),
                ]);

                if (!isMounted) return;

                if (catalog) setItems(catalog);
                if (inv) setInventory(inv);
                if (user) {
                    store.setUserInfo && store.setUserInfo(user as any);
                    setCoins(Number((user as any).money ?? 0));
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        load();
        return () => {
            isMounted = false;
        };
    }, [server, store]);

    const exitClickHandler = () => {
        setPage(PAGES.MAIN_SCREEN);
    };

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
        setInventory(inv);
    };

    const buyClickHandler = async (item: ShopItem) => {
        if (!server || isBusy) return;

        if (coins < item.cost) {
            setDialog({
                type: 'error',
                title: 'Недостаточно монет',
                message: `Для покупки "${item.name}" нужно ${item.cost} монет, а у вас только ${coins}.`
            });
            return;
        }

        setIsBusy(true);
        try {
            const ok = await server.buy(item.id);

            if (ok) {
                setDialog({
                    type: 'success',
                    title: 'Покупка успешна',
                    message: `Вы купили "${item.name}"!`
                });
                await refreshUserInfo();
                await refreshInventory(); 
            } else {
                setDialog({
                    type: 'error',
                    title: 'Ошибка покупки',
                    message: 'Не удалось купить товар. Попробуйте позже.'
                });
            }
        } catch (e) {
            setDialog({
                type: 'error',
                title: 'Ошибка',
                message: 'Произошла непредвиденная ошибка при покупке товара.'
            });
        } finally {
            setIsBusy(false);
        }
    };

    const upgradeClickHandler = async (item: ShopItem) => {
        if (!server || isBusy) return;

        setIsBusy(true);
        try {
            const result = await server.upgradeItem(item.id);

            if (result) {
                setDialog({
                    type: 'success',
                    title: 'Улучшение успешно',
                    message: `Предмет "${item.name}" улучшен до уровня ${result.level}.`
                });

                await refreshUserInfo();
                await refreshInventory();
            } else {
                setDialog({
                    type: 'error',
                    title: 'Ошибка улучшения',
                    message: 'Не удалось улучшить предмет. Возможно, он вам не принадлежит или не хватает монет.'
                });
            }
        } catch (e) {
            setDialog({
                type: 'error',
                title: 'Ошибка',
                message: 'Произошла ошибка при улучшении предмета.'
            });
        } finally {
            setIsBusy(false);
        }
    };

    const refillClickHandler = async (item: ShopItem) => {
        if (!server || isBusy) return;

        const ownedVape = inventory.find(
            (inv) => inv.name === item.name && inv.type === item.type
        );

        if (!ownedVape) {
            setDialog({
                type: 'error',
                title: 'Нет вейпа',
                message: 'У вас нет такого вейпа, который можно заправить.'
            });
            return;
        }

        setIsBusy(true);
        try {
            const result = await server.refillItem(ownedVape.id);

            if (!result) {
                setDialog({
                    type: 'error',
                    title: 'Ошибка заправки',
                    message: 'Не удалось заправить вейп. Попробуйте позже.'
                });
                return;
            }

            setDialog({
                type: 'success',
                title: 'Вейп заправлен',
                message: `Ваш вейп "${item.name}" успешно заправлен. Списано ${result.refill_cost} монет.`
            });

            await refreshUserInfo();
            await refreshInventory();
        } catch (e) {
            setDialog({
                type: 'error',
                title: 'Ошибка',
                message: 'Произошла ошибка при заправке вейпа.'
            });
        } finally {
            setIsBusy(false);
        }
    };

    const closeDialog = () => setDialog(null);

    return (
        <div className='shop'>
            <img src={ShopBg} alt="" className="shop-bg" />

            <div className='shop-exitButton' onClick={exitClickHandler}></div>
            <div className='shop-title'>
                Нажмите на ценник, чтобы купить, улучшить или заправить товар
            </div>
            <div className='shop-person'></div>
            <div className='shop-trader'></div>

            <div className="shop-coins">
                <Coins className="shop-coinsIcon" />
                <span className="shop-coinsText">{coins}</span>
            </div>

            <div className="shop-priceList">
                {isLoading && (
                    <div className="shop-priceList-loading">Загрузка...</div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="shop-priceList-empty">
                        Пока нет доступных товаров
                    </div>
                )}

                {items.map((item) => {
                    const ownedItem = inventory.find(
                        (inv) => inv.name === item.name && inv.type === item.type
                    );
                    const owned = !!ownedItem;
                    const isVape = item.type === 'vape';

                    return (
                        <div
                            key={item.id}
                            className="shop-priceTag"
                        >
                            <div className="shop-priceTag-name">{item.name}</div>
                            <div className="shop-priceTag-price">
                                Стоимость: {item.cost} монет
                            </div>

                            <div className="shop-priceTag-actions">
                                {!owned && (
                                    <button
                                        className="shop-priceTag-btn shop-priceTag-btn_buy"
                                        onClick={() => buyClickHandler(item)}
                                        disabled={isBusy}
                                    >
                                        Купить
                                    </button>
                                )}

                                {owned && (
                                    <>
                                        <button
                                            className="shop-priceTag-btn shop-priceTag-btn_upgrade"
                                            onClick={() => upgradeClickHandler(item)}
                                            disabled={isBusy}
                                        >
                                            Улучшить
                                        </button>

                                        {isVape && (
                                            <button
                                                className="shop-priceTag-btn shop-priceTag-btn_refill"
                                                onClick={() => refillClickHandler(item)}
                                                disabled={isBusy}
                                            >
                                                Заправить
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {dialog && (
                <div className="shop-dialogOverlay" onClick={closeDialog}>
                    <div
                        className="shop-dialog"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={
                                'shop-dialog-title ' +
                                (dialog.type === 'success'
                                    ? 'shop-dialog-title_success'
                                    : 'shop-dialog-title_error')
                            }
                        >
                            {dialog.title}
                        </div>
                        <div className="shop-dialog-text">
                            {dialog.message}
                        </div>
                        <button
                            className="shop-dialog-button"
                            onClick={closeDialog}
                        >
                            Ок
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;