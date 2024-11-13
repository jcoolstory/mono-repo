import { RenderObject, Canvas2D, Point } from "../draw";
import { Resource } from "./ResourceManager";

export class Renderer {
  backgroundColor: string = "#000";
  objects: RenderObject[] = [];
  timer: number = 0;
  canvas: Canvas2D = undefined;
  frameRate: number = 60;
  offset: Point = new Point();

  public addObject(object: RenderObject) {
    this.objects.push(object);
  }

  public removeObject(object: RenderObject) {
    const index = this.objects.indexOf(object);
    if (index > -1) this.objects.splice(index, 1);
  }

  public render(canvas: Canvas2D) {
    canvas.lineWidth = 1;
    const oldfillStyle = canvas.fillStyle;
    canvas.fillStyle = this.backgroundColor;
    canvas.fillRect(0, 0, Resource.width, Resource.height);
    canvas.fillStyle = oldfillStyle;

    this.objects.forEach((element) => {
      element.render(canvas);
    });
  }

  public start() {
    const _this = this;
    this.timer = setInterval(function () {
      _this.render(_this.canvas);
    }, 1000 / this.frameRate);
  }

  public stop() {
    clearInterval(this.timer);
  }

  public refresh() {
    this.render(this.canvas);
  }
}
