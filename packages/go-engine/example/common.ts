import { CollisionTester } from "../src/collisiontester";
import { Bitmap, Canvas2D, MoveAnimate, Point, RBody, RectBody, Renderer, Resource, Vector } from "../src/drawimage";
import { MathUtil } from "../src/mathutil";


export class TestBody  extends RectBody{    
    image : Bitmap | null = null;
    debugging : Boolean = false;
    angle : number = 0;
    collision : CollisionTester;
    selected : boolean = false;
    move (x:number,y:number){
        var vector = new Vector(this.shape,this.shape.y);
        vector.angle = MathUtil.toDegrees(Math.atan2(y,x));
        vector.distance =  MathUtil.getDistance(new Point(),new Point(x,y));
        var animate = new MoveAnimate();
        animate.data = this;
        var roff = Math.random()/2-0.5/2;
        animate.callback = function(data:RBody){
            Resource.worldRect.collisionSide(data.shape,function(direction){
                switch(direction){
                    case "left":
                        x = -x;
                        break;
                    case "right":
                        x = -x;
                        break;
                    case "top":
                        y = -y;
                        break;
                    case "bottom":
                        y = -y;
                        break;
                }
            });
            
            data.shape.x += x;
            data.shape.y += y;
            data.angle +=roff;

        };
        animate.start();
    }

    public render(canvas : Canvas2D){
        canvas.save();
        canvas.translate(this.shape.x + this.shape.width / 2 ,this.shape.y + this.shape.height/2)
        canvas.rotate(this.angle);
        canvas.translate( -this.shape.width / 2 ,-this.shape.height/2)
        
        if (this.image)
        {
            canvas.drawImage(this.image.source,this.image.x, this.image.y,this.image.width,this.image.height,0,0,this.shape.width,this.shape.height);
        }
        else
        {
            canvas.strokeStyle = this.color;
            canvas.strokeRect(0,0,this.shape.width,this.shape.height);
        }
        if (this.selected){
            canvas.strokeStyle = "#FFF"
            canvas.strokeRect(0,0,this.shape.width,this.shape.height);
        }
        canvas.restore();
    } 
}

export class SampleRenderer extends Renderer {
    selectedBody : TestBody | null ; 
    public addMouseEvent(element:HTMLElement){
        element.addEventListener("mousedown",this.onmousedown.bind(this));
        element.addEventListener("mousemove",this.onmousemove.bind(this));
        element.addEventListener("mouseup",this.onmouseup.bind(this));
    }

    onmousedown(event:MouseEvent){
        var _sbody =  this.selectedBody;
        this.objects.forEach(el => {
            
            if (el instanceof TestBody)
            {
                if (el.shape.containPoint(event.x,event.y)){
                    el.selected = true;
                    _sbody = el;
                    return;
                }   
            }   
        });
        if (_sbody)
        {
            if (this.selectedBody)
                this.selectedBody.selected =false;
            this.selectedBody = _sbody;
            this.offset.x=  this.selectedBody.shape.x -  event.x;
            this.offset.y = this.selectedBody.shape.y - event.y;
        }
        
    }
    onmousemove(event:MouseEvent){
        
        if (this.selectedBody)
        {
            this.selectedBody.shape.x = event.x + this.offset.x;
            this.selectedBody.shape.y = event.y + this.offset.y;
        }
    }

    onmouseup(event:MouseEvent){
        if (this.selectedBody){
            this.selectedBody.selected = false;

            this.selectedBody = null;
        }
    }
}