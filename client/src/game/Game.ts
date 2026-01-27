import CONFIG, { TPoint } from "../config";
const { WIDTH, HEIGHT } = CONFIG;
import { EDIRECTION } from "../config";

const GRAVITY = 0.05; // сила гравитации

class Game {
    private kapitoshka: TPoint;
    private vy: number = 0;
    private vx: number = 0;
    private SPEED = 0.05;

    private LEFT_WALL = 0;
    private RIGHT_WALL = CONFIG.WIDTH - 6;
    private TOP_WALL = 0.5;
    private BOTTOM_WALL = CONFIG.HEIGHT - 7;

    constructor() {
        this.kapitoshka = {
            x: 1,
            y: this.BOTTOM_WALL };
    }

    destructor() {
        //...
    }
    getScene() {
        return {
            kapitoshka: this.kapitoshka,
        };
    }

    //Движение
    moveHorizontal(dx: number) {
        const newX = this.kapitoshka.x + dx;
        if (newX >= this.LEFT_WALL && newX <= this.RIGHT_WALL) {
            this.kapitoshka.x = newX;
        }
    }
    jump(strength: number) {
        if (this.kapitoshka.y >= this.BOTTOM_WALL - 0.01) {
            this.vy = -strength;
        }
    }


    update() {
    // Горизатально
    const newX = this.kapitoshka.x + this.vx;
    if (newX >= this.LEFT_WALL && newX <= this.RIGHT_WALL) {
        this.kapitoshka.x = newX;
    }

    // Вертикально
    this.vy += GRAVITY;
    let newY = this.kapitoshka.y + this.vy;
    if (newY >= this.BOTTOM_WALL) {
        newY = this.BOTTOM_WALL;
        this.vy = 0;
    }
    this.kapitoshka.y = newY;
    console.log(
    'x:', this.kapitoshka.x,
    'y:', this.kapitoshka.y,
    'vx:', this.vx,
    'vy:', this.vy,
    'walls:', this.LEFT_WALL, this.RIGHT_WALL
    );
    }

    moveDirection(direction: EDIRECTION) {
    switch (direction) {
        case EDIRECTION.LEFT:
            this.vx = -this.SPEED; 
            break;
        case EDIRECTION.RIGHT:
            this.vx = this.SPEED; 
            break;
        case EDIRECTION.UP:
            this.jump(0.5); 
            break;
        }
    }

    stopHorizontal() {
    this.vx = 0;
    }   
}

export default Game;