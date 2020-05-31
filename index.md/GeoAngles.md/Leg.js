class Leg {
    
    constructor(originX,originY,topX,topY,bottomX,bottomY,rotation) {
        // THESE ARE GLOBAL POINTS MEASURED FROM CANVAS (0,0)
        this.originX=originX;
        this.originY=originY;  
        this.topX=topX;   
        this.topY=topY;    
        this.bottomX=bottomX; 
        this.bottomY=bottomY; 
        this.rotation=rotation;

        // These are CONTAINER REFERENCE POINTS
        this.contTopX = topX-originX;
        this.contTopY = topY-originY;
        this.contBottomX = bottomX-originX;
        this.contBottomY = bottomY-originY;

        this.tempMove;

        this.topOffsetX;
        this.topOffsetY;
        this.bottomOffsetX;
        this.bottomOffsetY;

    }

    updateAll(originX,originY,topX,topY,bottomX,bottomY,rotation) {
        this.originX=originX;
        this.originY=originY;  
        this.topX=topX;   
        this.topY=topY;    
        this.bottomX=bottomX; 
        this.bottomY=bottomY; 
        this.rotation=rotation;
    }

    setOrigin(originX,originY) {
        this.originX=originX;
        this.originY=originY;  
    }

    setTop(topX,topY) {
        this.topX=topX;   
        this.topY=topY;    
    }

    setBottom(bottomX,bottomY) {
        this.bottomX=bottomX; 
        this.bottomY=bottomY; 
    }

    setRotation(rotation){
        /*
        let round = Math.round(rotation)-(rotation%5)
        let mod = round-(round%5);
        this.rotation = mod;
        return mod;
        */
       this.rotation = rotation;
    }

    setOffsets(topOffsetX, topOffsetY, bottomOffsetX, bottomOffsetY){
        this.topOffsetX = topOffsetX;
        this.topOffsetY = topOffsetY;
        this.bottomOffsetX = bottomOffsetX;
        this.bottomOffsetY = bottomOffsetY;
    }
    
    // translate all points by new reference point
    setSimpleDragLocal(xAdj, yAdj) {
        

        this.originX+=xAdj;
        this.originY+=yAdj;  
        this.topX+=xAdj  
        this.topY+=yAdj;   
        this.bottomX+=xAdj
        this.bottomY+=yAdj;
    }
    
    setTopRotLocal(xAdj, yAdj) {
        console.log("setTopLoc")
        let distBtmTop = Math.sqrt(Math.pow(this.topX-this.bottomX, 2)
                        +Math.pow(this.topY-this.bottomY,2))
        /*
        // distance formula
        
        let distOrgBtm = Math.sqrt(Math.pow(this.originX-this.bottomX, 2)
                        +Math.pow(this.originY-this.bottomY,2))
        // angle between orig and btm
        let angleOrig = Math.acos(())
        // law of cosines
        let distOrigTop = Math.sqrt(Math.pow(distBtmTop,2)+Math.pow(distOrgBtm,2)
                        -((2*distBtmTop*distOrgBtm)*Math.cos(angleOrig)));
        
        let radian = rotation*(Math.PI/180)
        console.log("SIN TEST: " + Math.sin(45*(Math.PI/180)))
        console.log("------------MATH SHIT--------------");
        console.log("distBtmTop: " + distBtmTop);
        console.log("distOrgBtm: " + distOrgBtm);
        console.log("radian " + radian);
        console.log("rotation: " + this.rotation)
        console.log("------------END--------------");
        */
       let radian = this.rotation*(Math.PI/180)

        this.originX += xAdj;
        this.originY += yAdj;  
        this.topX+=xAdj  
        this.topY+=yAdj;
        this.bottomX+=xAdj
        this.bottomY+=yAdj; 
 

        //this.contTopX += this.topX-this.originX;
        //this.contTopY += this.topY-this.originY;
        //this.contBottomX += this.bottomX-this.originX;
        //this.contBottomY += this.bottomY-this.originY;


        this.printStats();


    }
    setBottomRotLocal(xAdj, yAdj) {
        this.originX+=xAdj;
        this.originY+=yAdj;  
        this.topX+=xAdj  
        this.topY+=yAdj;   
        this.bottomX+=xAdj
        this.bottomY+=yAdj; 
    }
    /*
    calcMidGlobal(){
        let x = (this.topX+this.bottomX)/2;
        let y = (this.topY+this.bottomY)/2;
        let pt = [x,y];
        return pt;
    }
    */
    calcMidLocal(){
        // Calculate the middle point
        let x = (this.contTopX+this.contBottomX)/2;
        let y = (this.contTopY+this.contBottomY)/2;
        // store to tempMove for restoration after execution
        this.tempMove = [x,y];
    }


    caltOffset(){

        this.setOffsets(topOffsetX, topOffsetY, bottomOffsetX, bottomOffsetY);
    }

    // returns adjX, adjY, midX, midY
    enableMove(){
        this.calcMidLocal();
        let mid = this.tempMove;
        this.setSimpleDragLocal(mid[0], mid[1]);
        console.log("enable move method")


        this.printStats();


        return [this.originX, this.originY, mid[0], mid[1]];
    }

    disableMove(adjX, adjY){
        let mid = this.tempMove;
        this.setSimpleDragLocal((adjX-mid[0]), (adjY-mid[1]));


        this.printStats();


        return [this.originX, this.originY, 0, 0];
    }

    // returns adjX, adjY, midX, midY
    enableTopRotate(){
        console.log("top rot enabled")
        this.printStats();

        // save adjusment for restoring position
        this.tempMove = [this.contBottomX, this.contBottomY];
        this.setSimpleDragLocal(this.contBottomX, this.contBottomY);
        return [this.originX, this.originY, this.contBottomX, this.contBottomY];
    }

    disableTopRotate(){
        
        // use saved adjusment to restoring position
        this.setSimpleDragLocal(-this.tempMove[0], -this.tempMove[1]);
        //this.setTopRotLocal(-this.tempMove[0], -this.tempMove[1]);
        return [this.originX, this.originY, 0, 0];
    }

    printStats(){
        console.log("------------START--------------");
        console.log("Origin: " + this.originX, this.originY);
        console.log("top: " + this.topX,this.topY);
        console.log("bottom: " + this.bottomX,this.bottomY);
        console.log("ContTop: " + this.contTopX,this.contTopY);
        console.log("contBottom: " + this.contBottomX,this.contBottomY);
        console.log("rotation: " + this.rotation)
        console.log("------------END--------------");
    }

    enableBottomRotate(){
        console.log("top rot enabled")
        this.printStats();

        // save adjusment for restoring position
        this.tempMove = [this.contTopX, this.contTopY];
        this.setSimpleDragLocal(this.contTopX, this.contTopY);
        return [this.originX, this.originY, this.contTopX, this.contTopY];
    }

    disableBottomRotate(){
        // use saved adjusment to restoring position
        this.setSimpleDragLocal(-this.tempMove[0], -this.tempMove[1]);
        //this.setTopRotLocal(-this.tempMove[0], -this.tempMove[1]);
        return [this.originX, this.originY, 0, 0];
    }
    
    

    calcCoords() {
        
    }
}

