var point=function(x,y){
    this.x=x;
    this.y=y;
    this.scale=function(a,b){
        this.x=this.x/a;
        this.y=this.y/b;
        return this;
    };
    this.translate=function(a,b){
        this.x=this.x-a;
        this.y=this.y-b;
        return this;
    };
    this.rotate=function(deg,center){
        var theta = deg/180.0*Math.PI;
		var tempa = (this.x-center.x)*Math.cos(theta) - (this.y-center.y)*Math.sin(theta) + center.x;
		var tempb = (this.x-center.x)*Math.sin(theta) + (this.y-center.y)*Math.cos(theta) + center.y;
        this.x=tempa;
        this.y=tempb;
        return this;
    }
    this.shearing=function(shear_direc,shear_dist,center){
        if (shear_direc == 1){
            this.x = this.x + shear_dist*((this.y - center.y) / center.y);
            this.y = this.y;
        }
        else if (shear_direc == 2){
            this.x = this.x;
            this.y = this.y + shear_dist*((this.x - center.x) / center.x);
        }
        return this;
    }
    this.nearest=function(img){
        x=this.x;
        y=this.y;
        if(x>=img.width||x<0||y>=img.height||y<0){
            return [0,0,0,255];
        }
        x=Math.round(x);
        y=Math.round(y);
        return read_point(img,x,y);
    }
    this.bilinear=function(img){
        x=this.x;
        y=this.y;
        if(x>=img.width||x<0||y>=img.height||y<0){
            return [0,0,0,255];
        }
        
        
        var x_l=Math.floor(x),x_h=Math.ceil(x);
        var y_l=Math.floor(y),y_h=Math.ceil(y);
        var v=[read_point(img,x_l,y_l),read_point(img,x_l,y_h),read_point(img,x_h,y_l),read_point(img,x_h,y_h)];
        //console.log(v);
        
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



}