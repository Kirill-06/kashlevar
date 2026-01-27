export type TPoint = {
    x: number;
    y: number;
}

export enum EDIRECTION {
    LEFT = 'left',
    RIGHT = 'right',
    UP = 'up',
    DOWN = 'down',
};

export type TWINDOW = {
    LEFT: number;
    TOP: number;
    HEIGHT: number;
    WIDTH: number;
}

const CONFIG = {
    HOST: 'http://localhost:8080',

    CHAT_TIMESTAMP: 200, 

    SPRITE_SIZE: 64, 
    LINE_OF_SPRITES: 10, 
    WIDTH: 50, 
    HEIGHT: 32, 
    
    WINDOW: {
        LEFT: 0,
        TOP: 0,
        HEIGHT: 12,
        WIDTH: 20,
    },
};

export default CONFIG;