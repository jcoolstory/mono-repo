import { Point } from "./draw";

export class MathUtil {
    
    // generate random integer number
    public static randomInt =  function(max:number) : number{
        return (Math.random() * max )| 0;
    }

    // Converts from degree to radian
    public static toRadians = function(degrees) {
        return degrees * Math.PI / 180;
    };
 
    // Converts from radians to degrees.
    public static toDegrees = function(radians) {
        return radians * 180 / Math.PI;
    };

    public static getDistance(sp:Point,ep:Point) : number{            
        return Math.sqrt(Math.pow(sp.x - ep.x,2) + Math.pow(sp.y - ep.y,2));
    }

    public static get3PointDegree(x1 : number, y1: number, x2: number,y2: number){
        return MathUtil.toDegrees(Math.atan2(y1*x2-x1*y2, x1*x2+y1*y2));
    }

    /**
     * find line intersection point
     * @param srt1 first line start point
     * @param end1 first line end point
     * @param srt2 second line start point
     * @param end2 second line end point
     * @param callback result callback function ( if find intersection point then return ture and point, if not found intersection point then result false)
     * 
     */
    public static lineIntersection(srt1:Point, end1:Point,srt2:Point,end2:Point, callback:Function){

        const dx_ba = end1.x - srt1.x;
        const dx_dc = end2.x - srt2.x;
        const dy_ba = end1.y - srt1.y;
        const dy_dc = end2.y - srt2.y;
        const den = dy_dc * dx_ba - dx_dc * dy_ba;

        if (den == 0)
            callback(false);

        const dy_ac = srt1.y-srt2.y;
        const dx_ac = srt1.x-srt2.x
        const ua = (dx_dc * dy_ac-dy_dc * dx_ac) / den;
        const ub = (dx_ba * dy_ac-dy_ba * dx_ac) / den;

        if ( 0 < ua && ua <1 && 0 < ub && ub <1 )
        {   
            const nx = srt1.x + dx_ba * ua;
            const ny = srt1.y + dy_ba * ua;
            callback(true,{x:nx,y:ny});
        }else{
            callback(false)
        }
    }

    public static subjectPoint(sp:Point, ep:Point) : Point{
        return {
            x:sp.x - ep.x,
            y:sp.y - ep.y
        }
    }
    
    /**
     * 
     * @param point 
     * @param angle 
     * @param distance 
     */
    public static getEndPoint(point:Point,angle:number,distance:number) : Point{
        const rad = MathUtil.toRadians(angle);
        const x = Math.cos(rad) * distance;
        const y = -Math.sin(rad) * distance;                           
        return { x: point.x + x, y: point.y + y };
    }

    public static circlelineintersection(p1:Point,r:number,p2:Point,p3:Point) : Array<Point> {

        const x = p1.x;
        const y = p1.y;

        const a = p2.x;
        const b = p2.y;
        const c = p3.x;
        const d = p3.y;

        if (c != a){
            const m = (d-b)/(c-a);;
            const n = (b*c-a*d)/(c-a);

            const A = m*m+1;
            const B1 = (m*n-m*y-x);
            const C = (x*x+y*y-r*r + n*n - 2 * n * y);
            const D = B1 * B1 - A*C;

            if (D<0){
                return []
            }
            else if (D==0){
                const X = -B1/A
                const Y = m*X+n
                return [new Point(X,Y)]
            }
            else {
                const X = -(B1 + Math.sqrt(D))/A
                const Y = m*X + n

                const X2 = -(B1 - Math.sqrt(D))/A
                const Y2 = m*X2+n
                return [ new Point(X,Y), new Point(X2,Y2)]
            }
        }
        else {
            if (a < (x - r) || a > (x + r) ) {
                return []
            }
            else if (a == (x-r) || a ==(x+r)){
                const X=a;
                const Y=y;
                return [new Point(X,Y)]
            }
            else {
                const X = a
                const Y = y + Math.sqrt( r * r - (a-x)*(a-x))
                
                const Y1 = y - Math.sqrt( r * r - (a-x)*(a-x))

                return [new Point(X,Y), new Point(X,Y1)]
            }
        }
    }

}
