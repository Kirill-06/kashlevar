import React, { useContext } from 'react';
import { ServerContext, StoreContext } from '../../App';
import { IBasePage, PAGES } from '../PageManager';
import './Shop.scss';

const Shop: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const user = store.getUser();

    const exitClickHandler = async () => {
        setPage(PAGES.MAIN_SCREEN);
    };

    const buyClickHandler = async () => {
        // функционал покупки товаров - оставляем для дальнейшего развития
    };

    return (
        <div className='shop'>
            <div className='shop-exitButton' onClick={exitClickHandler}></div>
            <div className='shop-title'>Нажмите на ценник, чтобы купить понравившийся товар</div>
            <div className='shop-person'></div>
            
            {/* Здесь будут товары для покупки */}
        </div>
    )
}

export default Shop;