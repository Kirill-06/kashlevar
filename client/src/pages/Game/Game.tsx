import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import CONFIG from '../../config';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import cityBackground from '../../assets/img/background/city.png';

const GAME_FIELD = 'game-field';

const GamePage: React.FC<IBasePage> = (props: IBasePage) => {
    const { SPRITE_SIZE } = CONFIG;
    const { setPage } = props;
    let game: Game | null = null;
    let canvas: Canvas | null = null;
    const Canvas = useCanvas(render);
    const backgroundImage = useRef<HTMLImageElement | null>(null);
    useEffect(() => {
    const img = new Image();
    img.src = cityBackground;
    img.onload = () => {
        backgroundImage.current = img;
    };
    }, []);
    let interval: NodeJS.Timer | null = null;
    const [
        [spritesImage],
        getSprite,
    ] = useSprites();
    function printFillSprite(image: HTMLImageElement, canvas: Canvas, { x = 0, y = 0 }, points: number[]): void {
        canvas.spriteFull(image, x, y, points[0], points[1], points[2]);
    }
    function printKapitoshka(canvas: Canvas, { x = 0, y = 0 }, points: number[]): void {
        printFillSprite(spritesImage, canvas, { x, y }, points);
    }
    function render(FPS: number): void {
        if (canvas && game) {
            canvas.clearImage(backgroundImage.current!);
            const { kapitoshka } = game.getScene();
            const { x, y } = kapitoshka;
            printKapitoshka(canvas, { x, y }, getSprite(1));
            canvas.render();}}
    const mouseMove = (_x: number, _y: number) => {}
    const mouseClick = (_x: number, _y: number) => {}
    const mouseRightClick = () => {}
    useEffect(() => {
        game = new Game();
        const canvasWidth = window.innerWidth * 0.47;
        const canvasHeight = window.innerHeight;
        canvas = Canvas({
        parentId: GAME_FIELD,
        WIDTH: canvasWidth,
        HEIGHT: canvasHeight,
        WINDOW: {
            LEFT: 0,
            TOP: 0,
            WIDTH: Math.floor(canvasWidth/ SPRITE_SIZE),
            HEIGHT: Math.floor(canvasHeight/ SPRITE_SIZE),
        },
        callbacks: {mouseMove,mouseClick,mouseRightClick,},
    });
        return () => {
            // деинициализировать все экземпляры
            game?.destructor();
            canvas?.destructor();
            canvas = null;
            game = null;
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
    });
    useEffect(() => {
        const keyDownHandler = (event: KeyboardEvent) => {
            const delta = 0.2;
            const keyCode = event.keyCode ? event.keyCode : event.which ? event.which : 0;
            switch (keyCode) {
                case 65: // a
                    game?.move(-delta, 0);
                break
                case 68: // d
                    game?.move(delta, 0);
                break
                case 87: // w
                    game?.move(0, -delta);
                break
                case 83: // s
                    game?.move(0, delta);
                break
            }
        }
        document.addEventListener('keydown', keyDownHandler);
        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        }
    });
    return (<div className='game'>
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
    </div>)
}

export default GamePage;