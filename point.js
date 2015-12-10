function write_point(img,x,y,value){
    img.data[y*img.width*4+x*4]=value[0];
    img.data[y*img.width*4+x*4+1]=value[1];
    img.data[y*img.width*4+x*4+2]=value[2];
    img.data[y*img.width*4+x*4+3]=value[3];
}
function read_point(img,x,y){
    if(x>=img.width||x<0||y>=img.height||y<0){
        return [0,0,0,255];
    }
    return [
        img.data[y*img.width*4+x*4],
        img.data[y*img.width*4+x*4+1],
        img.data[y*img.width*4+x*4+2],
        img.data[y*img.width*4+x*4+3]
    ];
}
function clamp(lo, value, hi) {
    return value < lo ? lo : value > hi ? hi : value;
}
function scale(x,y,a,b){
    x=x/a;
    y=y/b;
    return [x,y];
}
function translate(x,y,a,b){
    x=x-a;
    y=y-b;
    return [x,y];
}
function rotate(x,y,deg,center){
    var theta = deg/180.0*Math.PI;
    var tempa = (x-center.x)*Math.cos(theta) - (y-center.y)*Math.sin(theta) + center.x;
    var tempb = (x-center.x)*Math.sin(theta) + (y-center.y)*Math.cos(theta) + center.y;
    x=tempa;
    y=tempb;
    return [x,y];
}
function shearing(x,y,shear_direc,shear_dist,center){
    if (shear_direc == 1){
        x = x + shear_dist*((y - center.y) / center.y);
        y = y;
    }
    else if (shear_direc == 2){
        x = x;
        y = y + shear_dist*((x - center.x) / center.x);
    }
    return [x,y];
}
function nearest(x,y,img){
    x=x;
    y=y;
    if(x>=img.width||x<0||y>=img.height||y<0){
        return [0,0,0,255];
    }
    x=Math.round(x);
    y=Math.round(y);
    return read_point(img,x,y);
}
function bilinear(x,y,img){
    x=x;
    y=y;
    if(x>=img.width||x<0||y>=img.height||y<0){
        return [0,0,0,255];
    }
    var x_l=Math.floor(x),x_h=Math.ceil(x);
    var y_l=Math.floor(y),y_h=Math.ceil(y);
    var v=[read_point(img,x_l,y_l),read_point(img,x_l,y_h),read_point(img,x_h,y_l),read_point(img,x_h,y_h)];
    var rate_x=x-x_l,rate_y=y-y_l;
    var left_r=rate_y*(v[1][0]-v[0][0])+v[0][0],
        left_g=rate_y*(v[1][1]-v[0][1])+v[0][1],
        left_b=rate_y*(v[1][2]-v[0][2])+v[0][2],
        left_a=rate_y*(v[1][3]-v[0][3])+v[0][3],
        right_r=rate_y*(v[3][0]-v[2][0])+v[2][0],
        right_g=rate_y*(v[3][1]-v[2][1])+v[2][1],
        right_b=rate_y*(v[3][2]-v[2][2])+v[2][2],
        right_a=rate_y*(v[3][3]-v[2][3])+v[2][3];
    var mid_r=rate_x*(right_r-left_r)+left_r,
        mid_g=rate_x*(right_g-left_g)+left_g,
        mid_b=rate_x*(right_b-left_b)+left_b,
        mid_a=rate_x*(right_a-left_a)+left_a;
    return [mid_r,mid_g,mid_b,mid_a];
}
function bicubic_value(x, a, b, c, d) {
    var arr=new Array();
    for(i=0;i<4;i++){
        arr[i]=clamp(0, 0.5 * (c[i] - a[i] + (2.0 * a[i] - 5.0 * b[i] + 4.0 * c[i] - d[i] + (3.0 * (b[i] - c[i]) + d[i] - a[i]) * x) * x) * x + b[i], 255);
    }
    return [arr[0],arr[1],arr[2],arr[3]];
}
    
function bicubic(x,y,img) {
    var pixels=img.data;
    var width=img.width;
    var v = [0, 0, 0, 0];
    var fx = Math.floor(x);
    var fy = Math.floor(y);
    var percentX = x - fx;
    var percentY = y - fy;
    for (var i = -1; i < 3; i++) {
        v[i + 1] = 
            (bicubic_value(percentX,
                                  read_point(img,x-1,fy+i),
                                  read_point(img,x,fy+i),
                                  read_point(img,x+1,fy+i),
                                  read_point(img,x+2,fy+i)));
    }
    var r=Math.floor(bicubic_value(percentY, v[0], v[1], v[2], v[3]));
    
    return r;
}