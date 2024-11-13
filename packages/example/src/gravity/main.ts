import { Canvas2D, RBody, Resource, Rect, PolygonBody, CircleBody, Line, getLineBody, MathUtil, CollisionTester, Point, LineBody, Vector, MoveAnimate } from "@gostop/go-engine";
import { SampleRenderer, TestBody } from "@gostop/go-engine/example/common";

enum Controlmode {
    None,AddObject,
}

class Tester {
    ctx :Canvas2D= null;
    background = "../../image/background.png";
    renderer: SampleRenderer;
    mousePressed :boolean= false;
    status : Controlmode = Controlmode.None;
    relationBody : RBody[] = [];
    init(){
        
        var c  = <HTMLCanvasElement> document.getElementById("canvas");
        Resource.width = c.width;
        Resource.height = c.height;   
        Resource.worldRect = new Rect(0,0,Resource.width,Resource.height); 
        this.ctx  = <Canvas2D> c.getContext("2d");
        this.ctx.width = c.width;
        this.ctx.height = c.height;
        Resource.Images.push(this.background);
        Resource.OnFinishedLoad = function(){
            this.initBodies();
        }.bind(this)
        Resource.load();
        this.renderer = new SampleRenderer();
        
        this.renderer.canvas = this.ctx;
        this.renderer.addMouseEvent(c);

        c.addEventListener("mousedown",this.onmousedown.bind(this));
        c.addEventListener("mousemove",this.onmousemove.bind(this));
        c.addEventListener("mouseup",this.onmouseup.bind(this));    
    }

    onmousedown(event:MouseEvent){
        this.mousePressed = true;
        if (this.status == Controlmode.AddObject){
        }
    }

    onmousemove(event:MouseEvent){
        if (this.mousePressed){
            if (this.status == Controlmode.AddObject){
            }
        }
    }

    onmouseup(evnt:MouseEvent){
        
        this.mousePressed = false;;
        if (this.status == Controlmode.AddObject){
        }
    }

    setStatus(mode:string){
        this.status = Controlmode[mode];
    }

    stepframe(){
        this.renderer.refresh();
    }
    start(){
        this.renderer.start();
    }
    stop(){
        this.renderer.stop();
    }
    initBodies(){
        var box1 = new TestBody();
        box1.color = "#02F";
        box1.shape = new Rect(40,300,150,80);
        this.relationBody.push(box1);
        this.renderer.addObject(box1);

        var box2 = new TestBody();
        box2.color = "#F2F";
        box2.shape = new Rect(440,100,350,5);
        this.relationBody.push(box2);
        this.renderer.addObject(box2);

        var box3 = new TestBody();
        box3.color = "#F21";
        box3.shape = new Rect(540,400,5,80);
        this.relationBody.push(box3);
        this.renderer.addObject(box3);

        var wedge1 = new PolygonBody();        
        wedge1.setPoints([500,300,600,300,600,250,400,250,500,300]);
        this.relationBody.push(wedge1);
        this.renderer.addObject(wedge1);

         var wedge2 = new PolygonBody();        
        wedge2.setPoints([150,100,300,200,300,210,150,110,150,100]);
        this.relationBody.push(wedge2);
        this.renderer.addObject(wedge2);
        
        var ball1 = new CircleActor();
        ball1.color = "red";
        ball1.shape.x = 50;
        ball1.shape.y = 50;
        ball1.shape.width = 5;
        ball1.relationBody = this.relationBody;
        ball1.move(1,0);
        this.renderer.addObject(ball1);

        var ball2 = new CircleActor();
        ball2.color = "magenta";
        ball2.shape.x = 50;
        ball2.shape.y = 250;
        ball2.shape.width = 6;
        ball2.relationBody = this.relationBody;
        ball2.move(7,0);
        this.renderer.addObject(ball2);

        var ball3 = new CircleActor();
        ball3.color = "#3F1";
        ball3.shape.x = 450;
        ball3.shape.y = 50;
        ball3.shape.width = 16;
        ball3.relationBody = this.relationBody;
        ball3.move(-3,0);
        this.renderer.addObject(ball3);

        var ball4 = new CircleActor();
        ball4.color = "gray";
        ball4.shape.x = 250;
        ball4.shape.y = 70;
        ball4.shape.width = 3;
        ball4.relationBody = this.relationBody;
        ball4.move(4,0);
        this.renderer.addObject(ball4);

        var circleBody1 = new CircleBody();
        circleBody1.shape.x = 300;
        circleBody1.shape.y = 400;
        circleBody1.shape.width = 50;
        circleBody1.color= "yellow";
        this.relationBody.push(circleBody1);
        this.renderer.addObject(circleBody1)        

        document.addEventListener("keydown",this.OnKeyDown);

        this.start();
    }

    OnKeyDown(evt:KeyboardEvent) : any{
    }
}
class CircleActor extends CircleBody {
    relationBody :RBody[]=[];
    velocityX = 0;
    velocityY = 0;    
    update(){        
        this.velocityY += 9.8/60;

        var lines : Line[] =[];
        for (var i = 0 ; i < this.relationBody.length ; i++)
            getLineBody(this.relationBody[i],lines);
        
        var circlebodies : CircleBody[] = [];
        for (var i = 0 ; i < this.relationBody.length ; i++){
            if (this.relationBody[i] instanceof CircleBody)
            circlebodies.push(this.relationBody[i]);
        }

        var vector = this.getVector();
        var angle = vector.angle;
        var lastLine = null;
        var newangle = 0;
        var endPoint = MathUtil.getEndPoint(vector.position,vector.angle,vector.distance)
        var collision = CollisionTester.checkintersection(lines,vector.position,endPoint, lastLine,function(point:Point, line:LineBody){
            var p = MathUtil.subjectPoint(line.startPos,line.endPos);
            var lineangle = Math.abs(MathUtil.toDegrees(Math.atan2(p.y,p.x)));
            lastLine = line;
            newangle = angle + (lineangle - angle)*2
        });

        CollisionTester.validCircleToLine(circlebodies,vector.position,endPoint,function(newpoint,angle,subdistance){
            collision = newpoint;
            newangle = angle;
        })

        if (collision)
        {
            angle = newangle;
            var velocity =  MathUtil.getEndPoint(new Point(),angle,vector.distance);
            this.velocityX = velocity.x;
            this.velocityY = velocity.y;
        }
    }

    getVector() : Vector{
        var vector = new Vector(this.shape,this.shape.y);
        vector.angle = MathUtil.toDegrees(Math.atan2(-this.velocityY,this.velocityX));
        vector.distance =  MathUtil.getDistance(new Point(),new Point(this.velocityX,this.velocityY));
        this.angle = vector.angle;
        return vector;
    }

    move (x:number,y:number){
        this.velocityX = x;
        this.velocityY = y;
        var animate = new MoveAnimate();
        animate.data = this;
        animate.callback = function(data:CircleActor){
            
            var left =  data.shape.x - data.shape.width;
            var right = data.shape.x + data.shape.width;
            var top = data.shape.y - data.shape.width;
            var buttom = data.shape.y + data.shape.width;
            var rect = new Rect(left,top,data.shape.width*2,data.shape.width*2);
            var collistion = false;
            Resource.worldRect.collisionSide(rect,function(direction){
                collistion = true;
                switch(direction){
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
            if (!collistion)
                data.update();
            data.shape.x += data.velocityX;
            data.shape.y += data.velocityY;
        };
        animate.start();
    }
}


var tester  = new Tester();
tester.init()
    