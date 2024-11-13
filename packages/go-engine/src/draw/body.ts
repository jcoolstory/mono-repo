import { CollisionTester } from "../collisiontester";

import { MathUtil } from "../mathutil";
import { Animate, MoveAnimate } from "./animate";
import {
  Line,
  Canvas2D,
  Point,
  RenderObject,
  Shape,
  Vector,
  Rect,
  SpriteBitmap,
} from "./shapes";

export class RBody implements RenderObject, Shape {
  color: string = "#000";
  shape: Rect = new Rect();
  angle: number = 0;
  public render(canvas: Canvas2D) {}
}

export class CircleBody extends RBody {
  render(canvas: Canvas2D) {
    canvas.save();
    canvas.translate(this.shape.x, this.shape.y);
    canvas.beginPath();
    canvas.strokeStyle = this.color;
    canvas.arc(0, 0, this.shape.width, 0, 2 * Math.PI, false);
    canvas.stroke();
    canvas.fillStyle = this.color;
    canvas.fill();
    //canvas.strokeRect(this.shape.x,this.shape.y,3,3)
    canvas.restore();
  }
}

export class SpriteBody extends RBody {
  image: SpriteBitmap = null;
  currentAnimation: Animate;

  public render(canvas: Canvas2D) {
    canvas.save();
    canvas.translate(
      this.shape.x + this.shape.width / 2,
      this.shape.y + this.shape.height / 2,
    );
    canvas.rotate(this.angle);
    canvas.translate(-this.shape.width / 2, -this.shape.height / 2);

    if (this.image) {
      const imageRegion = this.image.currentImage();
      canvas.drawImage(
        this.image.source,
        imageRegion.x,
        imageRegion.y,
        imageRegion.width,
        imageRegion.height,
        0,
        0,
        this.shape.width,
        this.shape.height,
      );
    } else {
      canvas.strokeStyle = this.color;
      canvas.strokeRect(0, 0, this.shape.width, this.shape.height);
    }
    canvas.restore();
  }
}

export class RectBody extends RBody {
  public render(canvas: Canvas2D) {
    canvas.strokeStyle = this.color;
    canvas.beginPath();
    canvas.strokeRect(
      this.shape.x,
      this.shape.y,
      this.shape.width,
      this.shape.height,
    );
    canvas.stroke();
  }
}

export class TextBody extends RectBody {
  public text: string;
  public render(canvas: Canvas2D) {
    canvas.fillStyle = this.color;
    if (this.text) {
      canvas.fillText(this.text, this.shape.x, this.shape.y, 100);
    }
  }
}

export class PolygonBody implements RenderObject, RBody {
  color: string = "#FFF";
  points: Point[] = [];
  shape: Rect = null;
  angle: number = 0;
  closedPath: boolean = true;

  setPoints(point: number[]) {
    this.points = [];
    while (point.length) {
      this.points.push(new Point(point.shift(), point.shift()));
    }
  }

  render(canvas: Canvas2D) {
    canvas.beginPath();
    canvas.strokeStyle = this.color;
    this.points.forEach((pt, index) => {
      if (index == 0) canvas.moveTo(pt.x, pt.y);
      canvas.lineTo(pt.x, pt.y);
    });

    if (this.closedPath) canvas.closePath();

    canvas.stroke();
  }
}

export class LineBody extends PolygonBody {
  public startPos: Point;
  public endPos: Point;

  constructor(start: Point, end: Point) {
    super();
    this.startPos = start;
    this.endPos = end;
    this.updatePoint();
  }

  updatePoint() {
    this.setPoints([
      this.startPos.x,
      this.startPos.y,
      this.endPos.x,
      this.endPos.y,
    ]);
  }
}

export class RayCastVectorBody extends PolygonBody {
  vector: Vector;
  relationBody: RBody[];
  vertexes: CircleBody[] = [];
  guideLine: LineBody[] = [];

  render(canvas: Canvas2D) {
    this.vertexes = [];
    this.guideLine = [];
    this.closedPath = false;
    this.updateVector();
    super.render(canvas);
    for (let i = 0; i < this.vertexes.length; i++) {
      this.vertexes[i].render(canvas);
    }
    canvas.setLineDash([5, 15]);
    for (let i = 0; i < this.guideLine.length; i++) {
      this.guideLine[i].render(canvas);
    }
    canvas.setLineDash([]);
  }

  converttonumarray(point: Point[]): number[] {
    const array: number[] = [];
    point.forEach((el) => {
      array.push(el.x, el.y);
    });
    return array;
  }

  updateVector() {
    const points: Point[] = [this.vector.position];
    const lines: Line[] = [];

    for (let i = 0; i < this.relationBody.length; i++)
      getLineBody(this.relationBody[i], lines);

    const circlebodies: CircleBody[] = [];
    for (let i = 0; i < this.relationBody.length; i++) {
      if (this.relationBody[i] instanceof CircleBody)
        circlebodies.push(this.relationBody[i]);
    }

    let startPoint = this.vector.position;
    let angle = this.vector.angle;
    let distance = this.vector.distance;
    let lastLine = null;
    let endPoint = null;
    while (true) {
      let newangle = 0;
      endPoint = MathUtil.getEndPoint(startPoint, angle, distance);
      const midlePoint = CollisionTester.checkintersection(
        lines,
        startPoint,
        endPoint,
        lastLine,
        function (point: Point, line: Line) {
          const p = MathUtil.subjectPoint(line.startPos, line.endPos);
          const lineangle = Math.abs(MathUtil.toDegrees(Math.atan2(p.y, p.x)));
          lastLine = line;
          newangle = angle + (lineangle - angle) * 2;
        },
      );

      if (midlePoint) {
        points.push(midlePoint);
        const dist = MathUtil.getDistance(startPoint, midlePoint);
        startPoint = midlePoint;
        angle = newangle;
        distance -= dist;
      } else {
        break;
      }
    }

    CollisionTester.validCircleToLine(
      circlebodies,
      startPoint,
      endPoint,
      function (newpoint, angle, subdistance) {
        distance -= subdistance;
        endPoint = MathUtil.getEndPoint(newpoint, angle, distance);
        points.push(newpoint);
      },
    );
    points.push(endPoint);
    const vbuffer = this.converttonumarray(points);
    this.setPoints(vbuffer);
  }
}

export class VectorBody extends Vector implements RenderObject, Shape {
  color: string = "#FFF";

  constructor(point: Point, angle: number = 0, distance: number = 1) {
    super(point, angle, distance);
  }

  startRotate() {
    const animate = new MoveAnimate();
    animate.data = this;
    const roff = Math.random() / 2 - 0.5 / 2;
    animate.callback = function (data: VectorBody) {
      data.angle += roff;
    };
    animate.start();
  }

  render(canvas: Canvas2D) {
    canvas.save();
    canvas.strokeStyle = this.color;
    canvas.beginPath();
    canvas.moveTo(this.position.x, this.position.y);
    const x = Math.cos(MathUtil.toRadians(this.angle)) * this.distance;
    const y = -Math.sin(MathUtil.toRadians(this.angle)) * this.distance;
    canvas.lineTo(this.position.x + x, this.position.y + y);
    canvas.stroke();
    canvas.restore();
  }
}

export function getLineBody(body: RBody, lines: Line[]): Line[] {
  if (body instanceof PolygonBody) {
    const pbody = <PolygonBody>body;
    const pos: Point[] = pbody.points;

    for (let i = 0; i < pos.length - 1; i++) {
      lines.push(new Line(pos[i], pos[i + 1]));
    }
    return lines;
  }
  if (body instanceof RectBody) {
    const pos: Point[] = [];
    pos.push(new Point(body.shape.x, body.shape.y));
    pos.push(new Point(body.shape.x + body.shape.width, body.shape.y));
    pos.push(
      new Point(
        body.shape.x + body.shape.width,
        body.shape.y + body.shape.height,
      ),
    );
    pos.push(new Point(body.shape.x, body.shape.y + body.shape.height));

    for (let i = 0; i < pos.length - 1; i++) {
      lines.push(new Line(pos[i], pos[i + 1]));
    }

    lines.push(new Line(pos[pos.length - 1], pos[0]));
  }

  return lines;
}
