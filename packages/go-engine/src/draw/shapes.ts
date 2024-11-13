export interface RenderObject {
  color: string;
  render(canvas: Canvas2D);
}

export interface Shape {}

export class Canvas2D extends CanvasRenderingContext2D {
  width: number = 1;
  height: number = 1;
}



export class Point {
  public x: number = 0;
  public y: number = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class Rect extends Point {
  public width: number = 0;
  public height: number = 0;

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0,
  ) {
    super(x, y);
    this.width = width;
    this.height = height;
  }

  containPoint(x: number, y: number): boolean {
    if (this.x > x) return false;
    if (this.y > y) return false;
    if (this.x + this.width < x) return false;
    if (this.y + this.height < y) return false;

    return true;
  }

  containRect(rect: Rect): boolean {
    if (!this.containPoint(rect.x, rect.y)) return false;
    if (!this.containPoint(rect.x + rect.width, rect.y + rect.height))
      return false;
    return true;
  }

  collisionSide(rect: Rect, callback: Function) {
    if (this.x > rect.x) callback("left");
    if (this.y > rect.y) callback("top");
    if (this.x + this.width < rect.x + rect.width) callback("right");
    if (this.y + this.height < rect.y + rect.height) callback("bottom");
  }
}

export class Bitmap extends Rect {
  source: HTMLImageElement = null;
  constructor(
    image: HTMLImageElement,
    width = image.width,
    height = image.height,
  ) {
    super(0, 0, width, height);
    this.source = image;
  }
}


export class SpriteBitmap {
  source: HTMLImageElement = null;
  rects: Rect[];
  public currentIndex: number = 0;

  constructor(image: HTMLImageElement, rects: Rect[]) {
    this.source = image;
    this.rects = rects;
  }

  public getImageShift(): Rect {
    const rect = this.getImageRect(this.currentIndex++);
    this.nextStep();
    return rect;
  }

  public nextStep() {
    this.currentIndex++;
    this.currentIndex = this.currentIndex % this.rects.length;
  }

  public currentImage(): Rect {
    return this.getImageRect(this.currentIndex);
  }

  public getImageRect(index: number): Rect {
    return this.rects[index];
  }
}


export class ScrollSprite implements RenderObject {
  color: string = "black";
  view: Rect = new Rect();
  region: Rect = new Rect();
  image: Bitmap;

  public render(canvas: Canvas2D) {
    canvas.save();
    canvas.drawImage(
      this.image.source,
      this.view.x,
      this.view.y,
      this.view.width,
      this.view.height,
      this.region.x,
      this.region.y,
      this.region.width,
      this.region.height,
    );
    canvas.restore();
  }
}


export class Circle implements Shape {
  point: Point;
  radius: number = 0;
}

export class Line implements Shape {
  public startPos: Point;
  public endPos: Point;

  constructor(sp: Point, ep: Point) {
    this.startPos = sp;
    this.endPos = ep;
  }
}

export class Vector {
    position : Point ;
    angle : number=  0;
    distance : number =1;

    constructor(point:Point, angle:number = 0, distance:number = 1){
        this.position = point;
        this.angle = angle;
        this.distance = distance;
    }
}