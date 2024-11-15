import {
  Canvas2D,
  CircleBody,
  CollisionTester,
  getLineBody,
  Line,
  MathUtil,
  MoveAnimate,
  Point,
  RayCastVectorBody,
  RBody,
  Rect,
  Renderer,
  Resource,
  TextBody,
  Vector,
  VectorBody,
} from "@gostop/go-engine";
import { SampleRenderer, TestBody } from "@gostop/go-engine/example/common";

enum Controlmode {
  None,
  AddObject,
}
let distanceText: undefined | TextBody;
let wireLine: undefined | RayCastVectorBody;
class Tester {
  ctx: Canvas2D = null;
  background = "/image/background.png";
  renderer: SampleRenderer;
  mousePressed: boolean = false;
  status: Controlmode = Controlmode.None;
  relationBody: RBody[] = [];
  reletionBody2: RBody[] = [];
  circleActor: CircleActor;
  createRenderer(canvas: string): Renderer {
    var c = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = <Canvas2D>c.getContext("2d");
    this.ctx.width = c.width;
    this.ctx.height = c.height;
    var renderer = new SampleRenderer();
    renderer.canvas = this.ctx;
    renderer.addMouseEvent(c);

    c.addEventListener("mousedown", this.onmousedown.bind(this));
    c.addEventListener("mousemove", this.onmousemove.bind(this));
    c.addEventListener("mouseup", this.onmouseup.bind(this));
    return renderer;
  }
  init() {
    this.renderer = <SampleRenderer>this.createRenderer("canvas");
    var c = <HTMLCanvasElement>document.getElementById("canvas");
    Resource.width = c.width;
    Resource.height = c.height;
    Resource.worldRect = new Rect(0, 0, Resource.width, Resource.height);

    Resource.Images.push(this.background);
    Resource.OnFinishedLoad = function () {
      this.initBodies();
    }.bind(this);
    Resource.load();
  }

  onmousedown(event: MouseEvent) {
    this.mousePressed = true;
    if (this.status == Controlmode.AddObject) {
    }
  }

  onmousemove(event: MouseEvent) {
    if (this.mousePressed) {
      if (this.status == Controlmode.AddObject) {
      }
    }
  }

  onmouseup(evnt: MouseEvent) {
    this.mousePressed = false;
    if (this.status == Controlmode.AddObject) {
    }
  }

  setStatus(mode: string) {
    this.status = Controlmode[mode];
  }

  stepframe() {
    this.renderer.refresh();
  }
  start() {
    this.renderer.start();
  }
  stop() {
    this.renderer.stop();
  }

  changeX(x: number) {
    this.circleActor.shape.x = x;
  }

  changeY(y: number) {
    this.circleActor.shape.y = y;
  }

  rendColor(): string {
    let colorInt = MathUtil.randomInt(0xffffff);
    return colorInt.toString(16);
  }
  createCircleActor(): CircleActor {
    var ball1 = new CircleActor();

    ball1.color = "#" + this.rendColor();
    ball1.shape.x = 50 + MathUtil.randomInt(50);
    ball1.shape.y = 50 + MathUtil.randomInt(50);
    ball1.shape.width = 25 + MathUtil.randomInt(5);
    ball1.relationBody = this.relationBody;
    ball1.move(0, MathUtil.randomInt(8));
    this.renderer.addObject(ball1);
    return ball1;
  }

  initBodies() {
    //for (let i = 0 ; i< 1;i++)
    {
      this.circleActor = this.createCircleActor();
      this.renderer.addObject(this.circleActor);
    }

    distanceText = new TextBody();;
    distanceText.shape.x = 100;
    distanceText.shape.y = 50;
    distanceText.text = "hello";
    distanceText.color = "white";

    this.renderer.addObject(distanceText);

    for (var i = 0; i < 5; i++) {
      var circleBody1 = new CircleBody();
      circleBody1.shape.x = 50 + i * 150 + 10;
      circleBody1.shape.y = 400;
      circleBody1.shape.width = 50;
      circleBody1.color = "yellow";
      this.relationBody.push(circleBody1);
      this.renderer.addObject(circleBody1);
      this.reletionBody2.push(circleBody1);
    }

    var box3 = new TestBody();
    box3.color = "#F21";
    box3.shape = new Rect(0, 0, Resource.width, Resource.height);
    this.relationBody.push(box3);
    this.reletionBody2.push(box3);
    this.renderer.addObject(box3);

    wireLine = new RayCastVectorBody();
    wireLine.shape = new Rect(0, 0);
    wireLine.vector =  new VectorBody(new Point(500, 400), 140, 200);
    wireLine.color = "red";
    wireLine.relationBody = this.reletionBody2;
    this.renderer.addObject(wireLine);
    document.addEventListener("keydown", this.OnKeyDown);

    this.start();
  }

  OnKeyDown(evt: KeyboardEvent): any {}
}
class CircleActor extends CircleBody {
  relationBody: RBody[] = [];
  velocityX = 0;
  velocityY = 0;
  update() {
    var lines: Line[] = [];
    for (var i = 0; i < this.relationBody.length; i++) {
      if (this.relationBody[i] != this)
        getLineBody(this.relationBody[i], lines);
    }

    var circlebodies: CircleBody[] = [];

    for (var i = 0; i < this.relationBody.length; i++) {
      if (this.relationBody[i] instanceof CircleBody)
        if (this.relationBody[i] != this)
          circlebodies.push(this.relationBody[i]);
    }

    var vector = this.getVector();
    var angle = this.angle;
    var endPoint = MathUtil.getEndPoint(
      vector.position,
      vector.angle,
      vector.distance + this.shape.width,
    );
    var endPoint2 = MathUtil.getEndPoint(
      vector.position,
      vector.angle,
      vector.distance + this.shape.width + 500,
    );
    var startPoint = new Point(this.shape.x, this.shape.y);
    wireLine.vector = this.getVector();
    wireLine.shape.x = 100;
    wireLine.shape.y = 200;
    wireLine.angle = this.angle;
    wireLine.vector.distance += 1250;

    for (let i = 0; i < circlebodies.length; i++) {
      let index = i;
      let element = circlebodies[i];
      let collision = CollisionTester.CollisionCircle(this, element);
      let st = new Point(this.shape.x, this.shape.y);
      let dt = new Point(element.shape.x, element.shape.y);
      let distance = MathUtil.getDistance(
        new Point(this.shape.x, this.shape.y),
        new Point(element.shape.x, element.shape.y),
      );
      let rr = this.shape.width + element.shape.width;
      if (collision) {
        var interpoints: Point[] = [];
        var distances: number[] = [];
        var centerpos = new Point(element.shape.x, element.shape.y);
        var circlepoints = MathUtil.circlelineintersection(
          centerpos,
          element.shape.width,
          startPoint,
          endPoint,
        );
        var minx = startPoint.x < endPoint.x ? startPoint.x : endPoint.x;
        var maxx = startPoint.x > endPoint.x ? startPoint.x : endPoint.x;
        var miny = startPoint.y < endPoint.y ? startPoint.y : endPoint.y;
        var maxy = startPoint.y > endPoint.y ? startPoint.y : endPoint.y;
        for (var j = 0; j < circlepoints.length; j++) {
          var ppoint = circlepoints[j];
          if (
            ppoint.x > minx &&
            ppoint.x < maxx &&
            ppoint.y > miny &&
            ppoint.y < maxy
          ) {
            interpoints.push(circlepoints[j]);

            var dist = MathUtil.getDistance(startPoint, ppoint);
            distances.push(dist);
          } else if (minx == maxx) {
            interpoints.push(circlepoints[j]);

            var dist = MathUtil.getDistance(startPoint, ppoint);
            distances.push(dist);
          }

          var min = Number.MIN_VALUE;
          var minIndex = 0;
          distances.forEach((element, index) => {
            if (min > element) {
              minIndex = index;
            }
          });

          if (interpoints.length > 0) {
            var newpoint: Point = interpoints[minIndex];
            var linevect = MathUtil.subjectPoint(startPoint, endPoint);

            var linedgree = MathUtil.toDegrees(
              Math.atan2(-linevect.y, linevect.x),
            );

            var subp1 = MathUtil.subjectPoint(centerpos, newpoint);
            var guideStart = new Point(
              startPoint.x + subp1.x,
              startPoint.y + subp1.y,
            );
            var subp2 = MathUtil.subjectPoint(centerpos, guideStart);
            var d3angle =
              linedgree -
              MathUtil.get3PointDegree(subp1.x, subp1.y, subp2.x, subp2.y) * 2;

            var subdistanc = MathUtil.getDistance(newpoint, startPoint);
            angle = d3angle;
            var velocity = MathUtil.getEndPoint(
              new Point(),
              angle,
              vector.distance,
            );
            this.velocityX = velocity.x;
            this.velocityY = velocity.y;
          }
        }
        break;
      } else distanceText.color = "white";
      distanceText.text = distance + ":" + rr;
    }
  }

  getVector(): Vector {
    var vector = new Vector(this.shape);
    vector.angle = MathUtil.toDegrees(
      Math.atan2(-this.velocityY, this.velocityX),
    );
    vector.distance = MathUtil.getDistance(
      new Point(),
      new Point(this.velocityX, this.velocityY),
    );
    this.angle = vector.angle;
    return vector;
  }

  move(x: number, y: number) {
    this.velocityX = x;
    this.velocityY = y;
    var animate = new MoveAnimate();
    animate.data = this;
    animate.callback = function (data: CircleActor) {
      var left = data.shape.x - data.shape.width;
      var right = data.shape.x + data.shape.width;
      var top = data.shape.y - data.shape.width;
      var buttom = data.shape.y + data.shape.width;
      var rect = new Rect(
        left,
        top,
        data.shape.width * 2,
        data.shape.width * 2,
      );
      var collistion = false;
      Resource.worldRect.collisionSide(rect, function (direction) {
        collistion = true;
        switch (direction) {
          case "left":
            data.velocityX = -data.velocityX;
            break;
          case "right":
            data.velocityX = -data.velocityX;
            break;
          case "top":
            data.velocityY = -data.velocityY;
            break;
          case "bottom":
            data.velocityY = -data.velocityY;
            break;
          default:
            data.update();
            break;
        }
      });
      if (!collistion) data.update();
      data.shape.x += data.velocityX;
      data.shape.y += data.velocityY;
    };
    animate.start();
  }
}

export const tester = new Tester();
tester.init();
