import { Canvas2D, VectorBody, LineBody, RayCastVectorBody, Resource, Rect, Point, ScrollSprite, Bitmap, RBody, CircleBody, Line, getLineBody, MathUtil, Vector, MoveAnimate, Action, SpriteAction, SpriteBitmap, SpriteBody } from "@gostop/go-engine";
import { SampleRenderer, TestBody } from "@gostop/go-engine/example/common";

enum Controlmode {
    None,AddObject,
}

class Tester {
    ctx :Canvas2D= null;
    imageUrl1 = "../../image/imagetest.png";
    spriteImageUrl1 = "../../image/spriteimage.png";
    background = "../../image/background.png";
    spriteBody :Cat ;
    vector : VectorBody;
    renderer: SampleRenderer;
    mousePressed :boolean= false;
    status : Controlmode = Controlmode.None;
    lineActor : LineBody;
    polygon : RayCastVectorBody;
    backgroundSprite : ScrollSprite;
    init(){
        
        var c  = <HTMLCanvasElement> document.getElementById("canvas");
        Resource.width = c.width;
        Resource.height = c.height;   
        Resource.worldRect = new Rect(0,0,Resource.width,Resource.height); 
        this.ctx  = <Canvas2D> c.getContext("2d");
        this.ctx.width = c.width;
        this.ctx.height = c.height;
        Resource.Images.push(this.imageUrl1);
        Resource.Images.push(this.spriteImageUrl1);
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
        this.spriteBody.run();    
    }
    stop(){
        this.renderer.stop();
    }
    initBodies(){
        
        this.backgroundSprite = new ScrollSprite();
        this.backgroundSprite.image =  new Bitmap(Resource[this.background]);
        this.backgroundSprite.region = new Rect(0,0,Resource.width,Resource.height);
        var hratio =  this.backgroundSprite.image.height/ Resource.height  ;
        
        this.backgroundSprite.view = new Rect(0,0,this.backgroundSprite.image.width * hratio, this.backgroundSprite.image.height);
        this.renderer.addObject(this.backgroundSprite);        
        var testBitmap = new Bitmap(Resource[this.imageUrl1]);

        for (var i = 0 ; i < 10 ; i++){
            var x = MathUtil.randomInt( Resource.width);
            var y = MathUtil.randomInt(Resource.height);
            var testBody = new TestBody();
            testBody.shape = new Rect(x,y,100,100);
                
            testBody.image =testBitmap;
            testBody.render(this.ctx);
            var moveX =  Math.random();
            var moveY = Math.random();
            testBody.move(moveX,moveY);
            this.renderer.addObject(testBody);
        }

        var image1 : any =  Resource[this.spriteImageUrl1];
        var spriteImage = new SpriteBitmap(image1,[new Rect(0,0,512,256),new Rect(512,0,512,256), new Rect(0,256,512,256),new Rect(512,256,512,256),new Rect(0,512,512,256),new Rect(512,512,512,256)])
        this.spriteBody = new Cat();
        this.spriteBody.image = spriteImage;
        this.spriteBody.shape = new Rect(100,300,128,64);
        this.renderer.addObject(this.spriteBody);
        
        document.addEventListener("keydown",this.OnKeyDown.bind(this));

        this.start();
    }

    changeAngle(data){
        var angle = parseFloat(data);
        this.vector.angle = angle;
    }

    OnKeyDown(evt:KeyboardEvent) : any{
        switch(evt.code){
            case "ArrowUp":
                
                break;
            case "ArrowDown":
                
                break;
            case "ArrowLeft":
            this.backgroundSprite.view.x -=5;
                break;
            case "ArrowRight":
                this.backgroundSprite.view.x +=5;
                break;
            case "Space":
                this.spriteBody.jump();
                break;
        }
    }
}

class Cat extends SpriteBody{
    isRun = false;
    public run(){
        if (this.isRun)
            return
        var animate = new SpriteAction(this.image,500);        
        animate.start();
        this.currentAnimation = animate;
        this.isRun = true;
    }

    public jump(){
        if (this.currentAnimation){            
            console.log(this.currentAnimation)
            this.currentAnimation.stop();
        }
        var _this = this; 
        this.image.currentIndex = 0;
        class tempJump extends JumpAction{
            stop(){
                super.stop();
                _this.run();
            }
        }
        var jump = new tempJump(_this,-1,true);
        jump.start();
        this.currentAnimation = jump;
        this.isRun = false;
    }
}

class JumpAction extends Action{
    offset : number = 0;
    up:boolean = true;
    height : number = 30;
    frame : number = 30;
    callback = function(obj:JumpAction,data:SpriteBody,count:number){
        
        if (obj.up)
        {
            obj.offset++;
            data.shape.y--;
            data.angle = 50;                    
        }
        else
        {
            obj.offset--;
            data.shape.y++;
            data.angle = 0;
        }

        if (obj.offset > obj.height)
            obj.up = false;
        
        if (obj.offset < 0){
            data.angle = 0;
            return true;                    
        }
    }
    stop(){
        super.stop();
    }
}

var tester  = new Tester();
tester.init()