import React, { useEffect } from "react";
import { IBasePage, PAGES } from "../PageManager";
import './Preloader.scss';

const Preloader: React.FC<IBasePage> = (props: IBasePage) => {
    const { setPage } = props;
    useEffect(() => {
        setTimeout(() => setPage(PAGES.LOGIN), 3000);
    });
    return (
        <div className='preloader'>
            <div className='preloader-background'></div>
            <div className='preloader-texture'></div>
            <div className='preloader-log'></div>
            <div className='preloader-circle'></div>
            <div className='preloader-title'>
                <div className='preloader-rectangle'></div>
                Кашлевар
                <div className='preloader-rectangle'></div>
            </div>
        </div>
    );
}

export default Preloader;