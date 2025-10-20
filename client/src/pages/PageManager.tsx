import React, { useState } from 'react';

import Preloader from './Preloader/Preloader';
import Login, {Register} from './Login/Login';
import Chat from './Chat/Chat';
import GamePage from './Game/Game';
import NotFound from './NotFound/NotFound';
import Start from './Start/Start';
import Welcome from './Welcome/Welcome';
import MainScreen from './MainScreen/MainScreen';
import Shop from './Shop/Shop';

export enum PAGES {
    PRELOADER,
    LOGIN,
    CHAT,
    GAME,
    NOT_FOUND,
    REGISTER,
    START,
    WELCOME,
    MAIN_SCREEN
    SHOP,
}

export interface IBasePage {
    setPage: (name: PAGES) => void
}

const PageManager: React.FC = () => {
    const [page, setPage] = useState<PAGES>(PAGES.PRELOADER);

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
        </>
    );
}

export default PageManager;