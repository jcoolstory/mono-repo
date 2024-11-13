
import { Canvas2D, VectorBody, LineBody, RayCastVectorBody, Resource, Rect, Point, ScrollSprite, Bitmap, RBody, CircleBody, Line, getLineBody, MathUtil, Vector, MoveAnimate } from "@gostop/go-engine";
import { SampleRenderer } from "@gostop/go-engine/example/common";

enum Controlmode {
    None,AddObject,
}

class Tester {
    ctx :Canvas2D= null;
     background = "../../image/background.png";
    vector : VectorBody;
    renderer: SampleRenderer;
    mousePressed :boolean= false;
    status : Controlmode = Controlmode.None;
    lineActor : LineBody;
    polygon : RayCastVectorBody;
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
            var P : Point =  new Point(event.x,event.y);            
            this.lineActor = new LineBody(P,P);
            this.lineActor.color = "#F00";
        }
    }

    onmousemove(event:MouseEvent){
        if (this.mousePressed){
            if (this.status == Controlmode.AddObject){
                this.lineActor.endPos = new Point(event.x,event.y);
            }
        }
    }

    onmouseup(evnt:MouseEvent){
        
        this.mousePressed = false;;
        if (this.status == Controlmode.AddObject){
            this.lineActor.updatePoint();
            this.renderer.addObject(this.lineActor);
            this.polygon.relationBody.push(this.lineActor);
                console.log(this.lineActor)
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
        
        var backgroundSprite = new ScrollSprite();
        backgroundSprite.image =  new Bitmap(Resource[this.background]);
        var hratio =  backgroundSprite.image.height/ Resource.height;
        backgroundSprite.view = new Rect(0,0,backgroundSprite.image.width * hratio, backgroundSprite.image.height);

        var line = new LineBody(new Point(0,0), new Point(Resource.width/2, Resource.height/2));
        
         var relationBody : RBody[]= [];
         var anlearray = [-30,30,45,90,100,140,200,240,300,330]
        for (var i= 0 ; i < 10; i++){
            var vector= new VectorBody(new Point(200,200),anlearray[i],500);
            var polygon = new RayCastVectorBody();
            polygon.color = "#ff00ff"
            polygon.vector = vector;
            polygon.relationBody = relationBody;
            this.renderer.addObject(polygon);
            vector.startRotate();
        }

        this.polygon = polygon;
        var circleBody1 = new CircleBody();
        circleBody1.shape.x = 100;
        circleBody1.shape.y = 100;
        circleBody1.shape.width = 100;
        circleBody1.color= "red";
        
        relationBody.push(circleBody1);
        this.renderer.addObject(circleBody1)
        document.addEventListener("keydown",this.OnKeyDown);

        this.start();
    }

    changeAngle(data){
        var angle = parseFloat(data);
        this.vector.angle = angle;
    }

    OnKeyDown(evt:KeyboardEvent) : any{
    }
}
class CircleActor extends CircleBody {
    relationBody :RBody[];
    velocityX = 0;
    velocityY = 0;
    update(){
        var lines : Line[] =[];
        for (var i = 0 ; i < this.relationBody.length ; i++)
            getLineBody(this.relationBody[i],lines);

        function getMinDistancePoint(dp : Point, arryPoint : Point[]){
            var dists : number[] = [];
            for(var i = 0 ; i<arryPoint.length ; i++){
                dists.push(MathUtil.getDistance(dp,arryPoint[i]));
            }
            
            var min:number = Number.MAX_VALUE;
            var minindex = 0;
            for(var i = 0 ; i < dists.length; i++){

                if (min > dists[i]){
                    min = dists[i];
                    minindex =i;
                }
            }

            return minindex;
        }
        
        function valid(spoint:Point,epoint:Point,ignore:Line, resultF : Function): Point{
            var resultPoint : Point;
            var interPoints : Point[] = [];
            var interLines : Line[] = []
            for( var i = 0 ; i < lines.length; i++){
                
                var element = lines[i];
                if (element == ignore)
                    continue;
                MathUtil.lineIntersection(spoint,epoint, element.startPos,element.endPos, function(result,point:Point){
                    if (result){                        
                        interPoints.push(point);
                        interLines.push(element);
                    }
                })
            }

            if (interPoints.length >0)
            {
                var minIndex =  getMinDistancePoint(spoint,interPoints);
                resultPoint = interPoints[minIndex];
                resultF(resultPoint,interLines[minIndex]);
            }

            return resultPoint;
        }

        var vector = this.getVector();
        var angle = vector.angle;
        var lastLine = null;
        var newangle = 0;
        var endPoint = MathUtil.getEndPoint(vector.position,vector.angle,vector.distance)
        var collision = valid(vector.position,endPoint, lastLine,function(point:Point, line:LineBody){
            var p = MathUtil.subjectPoint(line.startPos,line.endPos);
            var lineangle = Math.abs(MathUtil.toDegrees(Math.atan2(p.y,p.x)));
            lastLine = line;
            newangle = angle + (lineangle - angle)*2
        });

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
            data.update();
            var left =  data.shape.x - data.shape.width;
            var right = data.shape.x + data.shape.width;
            var top = data.shape.y - data.shape.width;
            var buttom = data.shape.y + data.shape.width;
            var rect = new Rect(left,top,data.shape.width*2,data.shape.width*2);

            Resource.worldRect.collisionSide(rect,function(direction){
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
                }
            });
            
            data.shape.x += data.velocityX;
            data.shape.y += data.velocityY;
        };
        animate.start();
    }
}

var tester  = new Tester();
tester.init();
    