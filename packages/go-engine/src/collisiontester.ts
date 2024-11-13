import { CircleBody, Line, Point } from "./drawimage";
import { MathUtil } from "./mathutil";

export class CollisionTester{
    static CollisionCircle(st : CircleBody, dt:CircleBody) : boolean
    {
        return MathUtil.getDistance(new Point(st.shape.x, st.shape.y), new Point(dt.shape.x, dt.shape.y)) < (st.shape.width + dt.shape.width)
    }

    static getMinDistancePoint(dp : Point, arryPoint : Point[]) : number {
        const dists : number[] = [];
        for(let i = 0 ; i<arryPoint.length ; i++){
            dists.push(MathUtil.getDistance(dp,arryPoint[i]));
        }
        
        let min:number = Number.MAX_VALUE;
        let minindex = 0;
        for(let i = 0 ; i < dists.length; i++){

            if (min > dists[i]){
                min = dists[i];
                minindex =i;
            }
        }

        return minindex;
    }

    static checkintersection(lines:Line[], spoint:Point,epoint:Point,ignore:Line, resultF : Function): Point{
        let resultPoint : Point;
        const interPoints : Point[] = [];
        const interLines : Line[] = []
        for( let i = 0 ; i < lines.length; i++){
            
            const element = lines[i];
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
            const minIndex =  CollisionTester.getMinDistancePoint(spoint,interPoints);
            resultPoint = interPoints[minIndex];
            resultF(resultPoint,interLines[minIndex]);
        }

        return resultPoint;
    } 
    
    static validCircleToLine(circlebodies : CircleBody[], startPoint : Point, endPoint: Point, callback : Function){
        
        for (let i = 0 ; i <  circlebodies.length;i++){
            //
            const circle = circlebodies[i];
            
            const circlepoints = MathUtil.circlelineintersection(new Point(circle.shape.x,circle.shape.y), circle.shape.width,startPoint,endPoint);
            
            const centerpos = new Point(circle.shape.x,circle.shape.y);
            const minx = startPoint.x < endPoint.x ? startPoint.x : endPoint.x;
            const maxx = startPoint.x > endPoint.x ? startPoint.x : endPoint.x;
            const miny = startPoint.y < endPoint.y ? startPoint.y : endPoint.y;
            const maxy = startPoint.y > endPoint.y ? startPoint.y : endPoint.y;
            
            const interpoints : Point[] = [];
            const distances : number [] = [];
            for( let j = 0 ; j < circlepoints.length; j++){
                const ppoint = circlepoints[j];
                if (ppoint.x > minx && ppoint.x < maxx && ppoint.y > miny && ppoint.y < maxy){

                    interpoints.push(circlepoints[j]);

                    const dist = MathUtil.getDistance(startPoint,ppoint);                
                    distances.push(dist);
                }
            }

            const min = Number.MIN_VALUE;
            let minIndex = 0;
            distances.forEach( (element,index) => {
                if (min > element){
                    minIndex = index;
                }
            });

            if (interpoints.length > 0){
                const newpoint :Point= interpoints[minIndex];
                const linevect =  MathUtil.subjectPoint(startPoint,endPoint);                
                
                const linedgree =  MathUtil.toDegrees(Math.atan2(-linevect.y,linevect.x));

                const subp1 = MathUtil.subjectPoint(centerpos,newpoint);
                const guideStart = new Point(startPoint.x + subp1.x , startPoint.y + subp1.y);
                const subp2 = MathUtil.subjectPoint(centerpos,guideStart)
                const d3angle =linedgree-MathUtil.get3PointDegree(subp1.x,subp1.y,subp2.x,subp2.y)*2;

                const subdistanc = MathUtil.getDistance(newpoint,startPoint);
                callback(newpoint,d3angle,subdistanc);
            }
        }
    }
}
