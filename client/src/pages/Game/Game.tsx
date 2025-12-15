import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import CONFIG from '../../config';
import { EDIRECTION } from '../../config';
import { IBasePage, PAGES } from '../PageManager';
import Game from '../../game/Game';
import { Canvas, useCanvas } from '../../services/canvas';
import useSprites from './hooks/useSprites';
import cityBackground from '../../assets/img/background/city.png';

const GAME_FIELD = 'game-field';

const GamePage: React.FC<IBasePage> = (props: IBasePage) => {
    const { SPRITE_SIZE } = CONFIG;
    const { setPage } = props;
    const gameRef = useRef<Game | null>(null);
    const canvasRef = useRef<Canvas | null>(null);
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
        const game = gameRef.current;
        const canvas = canvasRef.current;
        if (!game || !canvas) return;
        game.update();
        canvas.clearImage(backgroundImage.current!);
        const { kapitoshka } = game.getScene();

        printKapitoshka(canvas, kapitoshka, getSprite(1));
        canvas.render();
    }


    const mouseMove = (_x: number, _y: number) => {}
    const mouseClick = (_x: number, _y: number) => {}
    const mouseRightClick = () => {}


    useEffect(() => {
    gameRef.current = new Game();
    const canvasWidth = window.innerWidth * 0.47;
    const canvasHeight = window.innerHeight;
    canvasRef.current = Canvas({
        parentId: GAME_FIELD,
        WIDTH: canvasWidth,
        HEIGHT: canvasHeight,
        WINDOW: {
            LEFT: 0,
            TOP: 0,
            WIDTH: Math.floor(canvasWidth / SPRITE_SIZE),
            HEIGHT: Math.floor(canvasHeight / SPRITE_SIZE),
            },
            callbacks: { mouseMove, mouseClick, mouseRightClick },
        });

        return () => {
        gameRef.current?.destructor();
        canvasRef.current?.destructor();
        gameRef.current = null;
        canvasRef.current = null;
        };
    }, []); 


    useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
        const game = gameRef.current;
        if (!game) return;
        if (e.key === 'a') game.moveDirection(EDIRECTION.LEFT);
        if (e.key === 'd') game.moveDirection(EDIRECTION.RIGHT);
        if (e.key === 'w') game.moveDirection(EDIRECTION.UP);
    };
    const keyUpHandler = (e: KeyboardEvent) => {
        if (e.key === 'a' || e.key === 'd') {
            gameRef.current?.stopHorizontal();
        }
    };
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    return () => {
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
    };
}, []);


    return (<div className='game'>
        <div id={GAME_FIELD} className={GAME_FIELD}></div>
    </div>)
}

export default GamePage;