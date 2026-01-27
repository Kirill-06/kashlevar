import { TWINDOW } from '../../config';

enum EDIRECTION {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export type TCanvas = {
  parentId: string;
  WINDOW: TWINDOW;
  WIDTH: number;
  HEIGHT: number;
  callbacks: {
    mouseMove: (x: number, y: number) => void;
    mouseClick: (x: number, y: number) => void;
    mouseRightClick: () => void;
  };
};

class Canvas {
  parentId: string;

  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  canvasV: HTMLCanvasElement | null;
  contextV: CanvasRenderingContext2D | null;

  WIDTH: number;
  HEIGHT: number;
  WINDOW: TWINDOW;

  DIRECTION = {
    [EDIRECTION.UP]: (-90 * Math.PI) / 180,
    [EDIRECTION.DOWN]: (90 * Math.PI) / 180,
    [EDIRECTION.LEFT]: (180 * Math.PI) / 180,
    [EDIRECTION.RIGHT]: 0,
  };

  dx = 0;
  dy = 0;
  interval: NodeJS.Timer | null;

  callbacks: {
    mouseMove: (x: number, y: number) => void;
    mouseClick: (x: number, y: number) => void;
    mouseRightClick: () => void;
  };

  constructor(options: TCanvas) {
    const { parentId, WINDOW, WIDTH, HEIGHT, callbacks } = options;
    this.parentId = parentId;

    this.canvas = document.createElement('canvas');
    if (parentId) {
      document.getElementById(parentId)?.appendChild(this.canvas);
    } else {
      document.querySelector('body')?.appendChild(this.canvas);
    }

    this.WIDTH = WIDTH || window.innerWidth;
    this.HEIGHT = HEIGHT || window.innerHeight;

    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.context = this.canvas.getContext('2d');

    this.canvasV = document.createElement('canvas');
    this.canvasV.width = this.WIDTH;
    this.canvasV.height = this.HEIGHT;
    this.contextV = this.canvasV.getContext('2d');

    this.WINDOW = WINDOW;
    this.callbacks = callbacks;

    this.canvas.addEventListener('mousemove', (event) => this.mouseMoveHandler(event));
    this.canvas.addEventListener('mouseleave', () => this.mouseLeaveHandler());
    this.canvas.addEventListener('click', (event) => this.mouseClickHandler(event));
    this.canvas.addEventListener('contextmenu', (event) => this.mouseRightClickHandler(event));

    this.interval = setInterval(() => {
      if (this.dx === 0 && this.dy === 0) return;
      this.WINDOW.LEFT += this.dx;
      this.WINDOW.TOP += this.dy;
    }, 200);
  }

  destructor() {
    if (this.canvas) {
      this.canvas.remove();
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.contextV = null;
    this.canvasV = null;
    this.context = null;
    this.canvas = null;
  }

  mouseClickHandler(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.callbacks.mouseClick(this.sx(offsetX), this.sy(offsetY));
  }

  mouseRightClickHandler(event: MouseEvent) {
    event.preventDefault();
    this.callbacks.mouseRightClick();
  }

  mouseMoveHandler(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.callbacks.mouseMove(this.sx(offsetX), this.sy(offsetY));
  }

  mouseLeaveHandler() {
    this.dx = 0;
    this.dy = 0;
  }

  xs(x: number): number {
    return ((x - this.WINDOW.LEFT) / this.WINDOW.WIDTH) * this.WIDTH;
  }

  ys(y: number): number {
    return ((y - this.WINDOW.TOP) / this.WINDOW.HEIGHT) * this.HEIGHT;
  }

  sx(x: number): number {
    return (x * this.WINDOW.WIDTH) / this.WIDTH + this.WINDOW.LEFT;
  }

  sy(y: number): number {
    return (y * this.WINDOW.HEIGHT) / this.HEIGHT + this.WINDOW.TOP;
  }

  dec(x: number): number {
    return (x / this.WINDOW.WIDTH) * this.WIDTH;
  }

  clear(): void {
    if (!this.contextV) return;
    this.contextV.fillStyle = '#305160';
    this.contextV.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  clearImage(image: HTMLImageElement): void {
    if (!this.contextV) return;
    this.contextV.drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  line(x1: number, y1: number, x2: number, y2: number, color = '#0f0', width = 2): void {
    if (!this.contextV) return;
    this.contextV.beginPath();
    this.contextV.strokeStyle = color;
    this.contextV.lineWidth = width;
    this.contextV.moveTo(this.xs(x1), this.ys(y1));
    this.contextV.lineTo(this.xs(x2), this.ys(y2));
    this.contextV.stroke();
    this.contextV.closePath();
  }

  text(x: number, y: number, text: string, color = '#fff', font = 'bold 1rem Arial'): void {
    if (!this.contextV) return;
    this.contextV.fillStyle = color;
    this.contextV.font = font;
    this.contextV.fillText(text, this.xs(x), this.ys(y));
  }

  rect(x: number, y: number, size = 64, color = '#f004'): void {
    if (!this.contextV) return;
    this.contextV.fillStyle = color;
    this.contextV.fillRect(this.xs(x), this.ys(y), size, size);
  }

  rectangle(x: number, y: number, width = 64, height = 64, color = '#f004'): void {
    if (!this.contextV) return;
    this.contextV.fillStyle = color;
    this.contextV.fillRect(this.xs(x), this.ys(y), width, height);
  }

  spriteFull(image: HTMLImageElement, dx: number, dy: number, sx: number, sy: number, size: number): void {
    if (!this.contextV) return;
    this.contextV.drawImage(image, sx, sy, size, size, this.xs(dx), this.ys(dy), size, size);
  }

  render(): void {
    if (!this.context || !this.canvasV) return;
    this.context.drawImage(this.canvasV, 0, 0);
  }
}

export default Canvas;
