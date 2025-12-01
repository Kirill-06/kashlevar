import React, { useState, useContext} from 'react';
import { StoreContext } from '../App';
import Preloader from './Preloader/Preloader';
import Login, {Register} from './Login/Login';
import Chat from './Chat/Chat';
import GamePage from './Game/Game';
import NotFound from './NotFound/NotFound';
import Start from './Start/Start';
import Welcome from './Welcome/Welcome';
import MainScreen from './MainScreen/MainScreen';
import Shop from './Shop/Shop';
import Rating from "./Rating/Rating";
import HellScreen from "./HellScreen/HellScreen";


export enum PAGES {
    PRELOADER,
    LOGIN,
    CHAT,
    GAME,
    NOT_FOUND,
    REGISTER,
    START,
    WELCOME,
    MAIN_SCREEN,
    SHOP,
    RATING,
    HELL,
}

export interface IBasePage {
    setPage: (name: PAGES) => void
}

const PageManager: React.FC = () => {
    const store = useContext(StoreContext);
    const [page, setPage] = useState<PAGES>(() => {
        const token = store.getToken();
        return token ? PAGES.MAIN_SCREEN : PAGES.LOGIN;
    });

    return (
        <>
            {page === PAGES.PRELOADER && <Preloader setPage={setPage} />}
            {page === PAGES.LOGIN && <Login setPage={setPage} />}
            {page === PAGES.CHAT && <Chat setPage={setPage} />}
            {page === PAGES.GAME && <GamePage setPage={setPage} />}
            {page === PAGES.NOT_FOUND && <NotFound setPage={setPage} />}
            {page === PAGES.REGISTER && <Register setPage={setPage} />}
            {page === PAGES.START && <Start setPage={setPage} />}
            {page === PAGES.WELCOME && <Welcome setPage={setPage} />}
            {page === PAGES.MAIN_SCREEN && <MainScreen setPage={setPage} />}
            {page === PAGES.SHOP && <Shop setPage={setPage} />}
            {page === PAGES.RATING && <Rating setPage={setPage} />}
            {page === PAGES.HELL && <HellScreen setPage={setPage} />}
        </>
    );
}

export default PageManager;
