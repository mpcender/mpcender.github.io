class Leg {
    
    
    constructor(xPos, xPos, type) {
        this.sizeX;
        this.sizeY;
        this.xPos = xPos;
        this.yPos = yPos;
        this.type = type;
    }

    drawLeg() {
        let box = new createjs.Container();
        box.x = this.xPos; box.y = this.yPos;
        

    }
}

