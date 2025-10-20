import React, { useContext, useRef } from 'react';
import { ServerContext, StoreContext } from '../../App';
import Button from '../../components/Button/Button';
import { IBasePage, PAGES } from '../PageManager';
import './Shop.scss';


const Shop: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    const server = useContext(ServerContext);
    const store = useContext(StoreContext);
    const user = store.getUser();

    const exitClickHandler = async () => {
        setPage(PAGES.GAME); //сделать переход на главную страницу
    };

     const buyClickHandler = async () => {

        //сделать покупку товаров

    };
    

    return (
        <div className='shop'>
            <div></div>
            <div className='shop-exitButton'><Button onClick={exitClickHandler} text=' '/></div>

            <div className='shop-title'>Нажмите на ценник, чтобы купить понравившийся товар</div>
            <div className='shop-person'></div>

        </div>
    )
}

export default Shop;

