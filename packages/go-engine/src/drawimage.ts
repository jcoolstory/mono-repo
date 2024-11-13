import { CollisionTester } from "./collisiontester";
import { MathUtil } from "./mathutil";

interface RenderObject {
    color :string;
    render(canvas:Canvas2D);
}

interface Shape {
}

interface Animate {
    timer : number;
    callback : Function;
    data : any;
    start();
    stop();
}

class Canvas2D extends CanvasRenderingContext2D{
    width : number = 1;
    height : number = 1;
}

class Action implements Animate{
    timer : number;
    callback : Function;
    data : any;
    duration : number = 500;
    repeat : boolean = true;    
    count : number = 0;
    frame : number = -1;
    
    constructor(data: any,dur:number, repeat = true){
        this.data = data;
        this.duration = dur;
        this.repeat = repeat;        
    }
    
    start(){
        const _this = this; 
        let count = 0;

        let framerate = this.duration/this.frame;
        if (this.duration == -1)
            framerate = 1000/60;

        this.timer = setInterval(function(){
            if (!_this.callback)
                return;

            const isStop = _this.callback(_this,_this.data,count)
            if (isStop)
                _this.stop();
            count++;
            if (!_this.repeat && count == _this.frame){
                _this.stop();
            }
        },framerate);
    }
    stop (){
        clearInterval(this.timer);
    }
}

class MoveAnimate implements Animate {
    timer =0;
    private duration : number = 0;
    public callback ;
    data : any;

    start(){
        const _this = this; 
        this.timer = setInterval(function(){
            _this.callback(_this.data);
        },1000/60);
    }

    stop (){
        clearInterval(this.timer);
    }
}

export class Point {
    public x : number = 0;
    public y : number = 0;

    constructor(x=0, y=0){
        this.x = x;
        this.y = y;
    }
}

export class Rect extends Point{
    public width : number = 0;
    public height : number = 0;

    constructor(x :number = 0, y : number = 0, width : number = 0 , height : number=0){
        super(x,y);
        this.width= width;
        this.height= height;
    }

    containPoint(x:number, y:number):boolean{
        if (this.x > x )
            return false;
        if (this.y > y)
            return false;
        if (this.x+this.width < x)
            return false;
        if (this.y+this.height < y)
            return false;

        return true;
    }

    containRect(rect:Rect) : boolean{
        if (!this.containPoint(rect.x,rect.y))
            return false;
        if (!this.containPoint(rect.x+rect.width,rect.y+rect.height))
            return false;            
        return true;
    }

    collisionSide(rect:Rect,callback:Function){
        if (this.x > rect.x )
            callback("left");
        if (this.y > rect.y)
            callback("top");
        if (this.x+this.width < rect.x + rect.width)
            callback("right");
        if (this.y+this.height < rect.y + rect.height)
            callback("bottom");
    }
}

export class Bitmap extends Rect {    
    source : HTMLImageElement = null;
    constructor(image:HTMLImageElement,width = image.width, height = image.height){
        super(0,0,width,height);
        this.source = image;
    }
}

class SpriteAction extends Action{
    constructor(data:SpriteBitmap,dur:number,repeat = true){        
        super(data,dur,repeat)
        this.frame =  data.rects.length;
        this.callback = this.step;
    }
    public step(obj:Action, dst:SpriteBitmap ,count:number){
        dst.nextStep();
    }
}

class SpriteBitmap  {
    source : HTMLImageElement = null;
    rects : Rect []
    public currentIndex :number =0;

    constructor(image:HTMLImageElement,rects:Rect[]){
        this.source = image;
        this.rects = rects;
    }

    public getImageShift() : Rect{
        const rect = this.getImageRect(this.currentIndex++);
        this.nextStep();
        return rect;
    }

    public nextStep(){
        this.currentIndex++;
        this.currentIndex = this.currentIndex % this.rects.length;
    }
    
    public currentImage(): Rect{
        return this.getImageRect(this.currentIndex);
    }

    public getImageRect(index:number) : Rect{
        return this.rects[index];
    }
}

class PolygonBody implements RenderObject, RBody{
    color : string = "#FFF";
    points : Point[] = [];
    shape : Rect = null;
    angle : number = 0;
    closedPath : boolean = true;
    
    setPoints(point : number[]){
        this.points = [];
        while(point.length){
            this.points.push(new Point(point.shift(),point.shift()));
        }
    }

    render(canvas:Canvas2D){
        canvas.beginPath();
        canvas.strokeStyle = this.color;
        this.points.forEach( (pt,index) => {
            if (index == 0)
                canvas.moveTo(pt.x,pt.y);
            canvas.lineTo(pt.x,pt.y);            
        });

        if (this.closedPath)
            canvas.closePath();
        
        canvas.stroke();        
    }
}

function getLineBody(body:RBody, lines : Line[]) : Line[]{
    if (body instanceof PolygonBody){
        const pbody = <PolygonBody> body;
        const pos : Point[] = pbody.points;
                                
        for(let i = 0 ; i<pos.length-1 ; i++){
            lines.push(new Line(pos[i], pos[i+1]));
        }
        return lines;
    }
    if (body instanceof RectBody){
        const pos : Point[] = [];
        pos.push(new Point(body.shape.x, body.shape.y));
        pos.push(new Point(body.shape.x + body.shape.width, body.shape.y));
        pos.push(new Point(body.shape.x + body.shape.width, body.shape.y + body.shape.height));
        pos.push(new Point(body.shape.x, body.shape.y + body.shape.height));
        
        for(let i = 0 ; i<pos.length-1 ; i++){
            lines.push(new Line(pos[i], pos[i+1]));
        }

        lines.push(new Line(pos[pos.length -1 ],pos[0]));
    }

    return lines;
}

class ScrollSprite implements RenderObject {
    color : string = "black";
    view : Rect = new Rect();
    region : Rect = new Rect();
    image : Bitmap;

    public render(canvas:Canvas2D){
        canvas.save();
        canvas.drawImage(this.image.source,this.view.x, this.view.y, this.view.width, this.view.height, this.region.x, this.region.y, this.region.width, this.region.height )
        canvas.restore();
    }
}
        
class RayCastVectorBody extends PolygonBody{
    vector : Vector
    relationBody :RBody[];
    vertexes : CircleBody[] = [];
    guideLine : LineBody[] =[]

    render(canvas:Canvas2D){
        this.vertexes=[];
        this.guideLine = [];
        this.closedPath = false;
        this.updateVector();
        super.render(canvas);
        for( let i = 0 ; i< this.vertexes.length; i++){
            this.vertexes[i].render(canvas);
        }
        canvas.setLineDash([5, 15]);
        for( let i = 0 ; i< this.guideLine.length; i++){
            this.guideLine[i].render(canvas);
        }
        canvas.setLineDash([]);
    }

    converttonumarray(point:Point[]):number[]{
        const array : number[] =[];
        point.forEach(el=>{
            array.push(el.x,el.y);
        }) 
        return array;
    }

    updateVector(){
        const points:Point[] = [this.vector.position];
        const lines : Line[] =[];

        for (let i = 0 ; i < this.relationBody.length ; i++)
            getLineBody(this.relationBody[i],lines);

        const circlebodies : CircleBody[] = [];
        for (let i = 0 ; i < this.relationBody.length ; i++){
            if (this.relationBody[i] instanceof CircleBody)
            circlebodies.push(this.relationBody[i]);
        }
        
        let startPoint = this.vector.position;
        let angle = this.vector.angle;
        let distance = this.vector.distance;
        let lastLine = null;
        let endPoint = null;
        while(true) {
            let newangle = 0;
            endPoint = MathUtil.getEndPoint(startPoint,angle,distance)
            const midlePoint = CollisionTester.checkintersection(lines, startPoint,endPoint, lastLine,function(point:Point, line:Line){
                const p = MathUtil.subjectPoint(line.startPos,line.endPos);
                const lineangle = Math.abs(MathUtil.toDegrees(Math.atan2(p.y,p.x)));
                lastLine = line;
                newangle = angle + (lineangle - angle)*2
            });

            if (midlePoint) {
                points.push(midlePoint);
                const dist =  MathUtil.getDistance(startPoint,midlePoint)
                startPoint = midlePoint;
                angle = newangle;
                distance -= dist;
            }
            else{
                break;
            }
        }
        
        CollisionTester.validCircleToLine(circlebodies,startPoint,endPoint,function(newpoint,angle,subdistance){
            distance -= subdistance;                
            endPoint =  MathUtil.getEndPoint(newpoint,angle,distance);
            points.push(newpoint);
        })
        points.push(endPoint);
        const vbuffer = this.converttonumarray(points);
        this.setPoints(vbuffer);
    }
}

class Vector {
    position : Point ;
    angle : number=  0;
    distance : number =1;

    constructor(point:Point, angle:number = 0, distance:number = 1){
        this.position = point;
        this.angle = angle;
        this.distance = distance;
    }
}

class VectorBody extends Vector implements RenderObject, Shape{
    color : string = "#FFF";

    constructor(point:Point, angle:number = 0, distance:number = 1){
        super(point,angle,distance);
    }

    startRotate(){
        const animate = new MoveAnimate();
        animate.data = this;
        const roff = Math.random()/2-0.5/2;
        animate.callback = function(data:VectorBody){
            data.angle +=roff;            
        };
        animate.start();
    }

    render(canvas:Canvas2D){
        canvas.save();
        canvas.strokeStyle = this.color;
        canvas.beginPath();
        canvas.moveTo(this.position.x, this.position.y);
        const x = Math.cos(MathUtil.toRadians(this.angle)) * this.distance;
        const y = -Math.sin(MathUtil.toRadians(this.angle)) * this.distance;
        canvas.lineTo(this.position.x+x,this.position.y+y);        
        canvas.stroke();        
        canvas.restore();
    }
}

export class Line implements Shape{
    public startPos : Point;
    public endPos : Point;

    constructor ( sp : Point, ep:Point){
        this.startPos = sp;
        this.endPos = ep;
    }
}

export class LineBody extends PolygonBody{
    public startPos : Point;
    public endPos : Point;

    constructor(start:Point,end:Point){
        super()
        this.startPos = start;
        this.endPos = end;
        this.updatePoint();
    }

    updatePoint(){
        this.setPoints([this.startPos.x,this.startPos.y,this.endPos.x,this.endPos.y]);
    }
}

class Renderer {
    backgroundColor : string = "#000";
    objects : RenderObject[] = [];
    timer : number = 0;
    canvas : Canvas2D = undefined;
    frameRate : number =60;
    offset : Point = new Point();

    public addObject(object:RenderObject){
        this.objects.push(object);
    } 

    public removeObject(object:RenderObject){
        const index= this.objects.indexOf(object);
        if (index > -1)
            this.objects.splice(index,1);
    }

    public render(canvas : Canvas2D){
        canvas.lineWidth = 1;
        const oldfillStyle = canvas.fillStyle;
        canvas.fillStyle = this.backgroundColor;   
        canvas.fillRect(0,0,Resource.width,Resource.height);
        canvas.fillStyle = oldfillStyle;

        this.objects.forEach(element => {
            element.render(canvas);
        });
    }

    public start(){
        const _this = this;
        this.timer = setInterval(function(){
            _this.render(_this.canvas);
        },1000/this.frameRate);
    }

    public stop(){
        clearInterval(this.timer);
    }

    public refresh(){
        this.render(this.canvas);
    }
}

class RBody implements RenderObject,Shape{    
    color : string = "#000";
    shape : Rect  = new Rect();
    angle : number = 0;
    public render(canvas : Canvas2D){
    } 
}

export class Circle implements Shape{
    point : Point 
    radius : number = 0;
}

export class CircleBody extends RBody{
    render(canvas:Canvas2D){
        canvas.save();
        canvas.translate(this.shape.x,this.shape.y);
        canvas.beginPath();
        canvas.strokeStyle = this.color;
        canvas.arc(0,0,this.shape.width,0,2*Math.PI, false);
        canvas.stroke();
        canvas.fillStyle = this.color;
        canvas.fill();
        //canvas.strokeRect(this.shape.x,this.shape.y,3,3)
        canvas.restore();
    }
}

class SpriteBody extends RBody{
    image : SpriteBitmap = null;
    angle : number;
    currentAnimation : Animate;  

    public render(canvas : Canvas2D){
        canvas.save();
        canvas.translate(this.shape.x + this.shape.width / 2 ,this.shape.y + this.shape.height/2)
        canvas.rotate(this.angle);
        canvas.translate( -this.shape.width / 2 ,-this.shape.height/2)
        
        if (this.image) {
            const imageRegion = this.image.currentImage();
            canvas.drawImage(this.image.source,imageRegion.x,imageRegion.y,imageRegion.width,imageRegion.height,0,0,this.shape.width,this.shape.height);
        }
        else {
            canvas.strokeStyle = this.color;
            canvas.strokeRect(0,0,this.shape.width,this.shape.height);
        }
        canvas.restore();
    } 
}

export class RectBody extends RBody{
    public render(canvas : Canvas2D){
        canvas.strokeStyle = this.color;
        canvas.beginPath();
        canvas.strokeRect(this.shape.x,this.shape.y,this.shape.width,this.shape.height);
        canvas.stroke();
    }
}

export class TextBody extends RectBody{
    public text : string;
    public render(canvas : Canvas2D){
        canvas.fillStyle = this.color;
        if (this.text) {
            canvas.fillText(this.text,this.shape.x,this.shape.y,100);
        }        
    }
}

class ResourceManager {
    public width : number= 1;
    public height : number =1;
    public worldRect : Rect ;
    public OnFinishedLoad : Function;
    public Images :string[] = [];
    private count : number = 0;
    private loadedCount : number = 0;
    public load(){
        this.count = this.Images.length;
        this.Images.forEach( el=>{
            this.imageLoad(el);
        });
    }

    private checkFinished(){
        if (this.count == this.loadedCount){
            if (this.OnFinishedLoad){
                this.OnFinishedLoad();
            }
        }
    }

    private imageLoad( url:string) {	
        const _this = this;
        const img = new Image();
        img.src = url;
        img.onload = function() {        
            Resource[url] = img;
            _this.loadedCount++;
            _this.checkFinished();
        };
    }
}


const Resource = new ResourceManager();