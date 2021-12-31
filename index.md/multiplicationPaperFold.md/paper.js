class Paper {
    #rowText
    #nodeCol;
    #nodeColCover;
    #colText
    #nodeRow;
    #nodeRowCover;
    #grid;
    #xdiv;
    #ydiv;

    #paperSize = {x: 600, y: 600};
    #frac = {leftFrac: new createjs.Container(), topFrac: new createjs.Container(), result: new createjs.Container()};

    #cRad = 15;
    #lineStroke = 4;
    #paper;

    constructor(size, x, y){
        this.#paper = new createjs.Container();
        this.#paperSize = size;

        this.#xdiv = 1;
        this.#ydiv = 1;

        this.#paper.x = x-(this.#paperSize.x/2);
        this.#paper.y = y-(this.#paperSize.y/2)+bannerHeight/2;
        
    	let rect = new createjs.Shape();
        rect.graphics.setStrokeStyle(4).beginStroke(bannerBorderColor)
    		.drawRect(0,0,this.#paperSize.x,this.#paperSize.y);

        this.#grid = [];

    	this.#paper.addChild(rect, this.#nodeCol, this.#nodeRow);
        stage.addChild(this.#paper);
    }

    getRow() {
        return this.#ydiv;
    }
    getCol() {
        return this.#xdiv;
    }
    
    resizePaper(size, x, y){
        let fracOff = false;
        if (this.#frac.leftFrac.children.length == 0 || this.#frac.leftFrac.alpha == 0) {
            fracOff=true;
        }

        // Store new xy dimensions
        this.#paperSize = {x: size, y: size};
        // Update container base location
        this.#paper.x = x-(this.#paperSize.x/2);
        this.#paper.y = y-(this.#paperSize.y/2)+bannerHeight/2;
        
        //console.log(this.#paper)
        this.#paper.removeChild(this.#frac.leftFrac, this.#frac.topFrac);
        this.#frac.leftFrac._off = true;
        //console.log(this.#paper)
        this.#buildFracSet( [ {n: 0, d: 1} , {n: 0, d: 1} , {n: 0, d: 1} ] );
        
        /** TODO make update, not reset */
        // Generate draggers
        this.#paper.removeChild(this.#nodeColCover, this.#nodeRowCover);
        this.#paper.removeChild(this.#nodeCol, this.#nodeRow);
        this.#nodeCol = this.#createColumnDragger(0, this.#paperSize.y, this.#cRad);
        this.#nodeRow = this.#createRowDragger(this.#paperSize.x, 0, this.#cRad);
        this.#paper.addChild(this.#nodeCol, this.#nodeRow);
        
        // Remove all current dividers
        this.#grid.forEach(element => this.#paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this.#generateGrid(this.#paperSize, this.#xdiv, this.#ydiv);
        this.#grid = newGrid;

        this.#paper.removeChild(this.#rowText, this.#colText);
        this.#buildRowColButtons();
        
        // dont attempt at add dividers for 1x1 grid
        if (this.#grid.length > 1) { 
            this.#grid.forEach(element => this.#paper.addChild(element));
        }
        this.#paper.children[0].graphics.command.w = this.#paperSize.x;
        this.#paper.children[0].graphics.command.h = this.#paperSize.y;

        if (fracOff) {
            this.fractionOff();
        }
    }

    updateGrid(xdiv, ydiv) {
        PlaySound(bloopSound,.4);
        // Update global paper divider variables
        this.#xdiv = xdiv;
        this.#ydiv = ydiv;
        // Remove all current dividers
        this.#grid.forEach(element => this.#paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this.#generateGrid(this.#paperSize, this.#xdiv, this.#ydiv);
        this.#grid = newGrid;
        
        // dont attempt at add dividers for 1x1 grid
        if (this.#grid.length >= 1) { 
            // Add new dividers to stage
            this.#grid.forEach(element => this.#paper.addChild(element));
        }

        this.resetSliders(xdiv, ydiv)
    }

    resetSliders(xdiv, ydiv){
        this.#frac.leftFrac.children[2].text = xdiv;
        this.#nodeRow.y = 0;
        this.#nodeRow.cover.graphics.command.h = 0;
        this.#frac.leftFrac.children[0].text = 0;
        
        this.#frac.topFrac.children[2].text = ydiv;
        this.#nodeCol.x = 0;
        this.#nodeCol.cover.graphics.command.w = 0;
        this.#frac.topFrac.children[0].text = 0;
    }

    toggleFraction(){
        this.#frac.leftFrac.alpha = this.#frac.leftFrac.alpha == 0 ? 1 : 0;
        this.#frac.topFrac.alpha = this.#frac.topFrac.alpha == 0 ? 1 : 0;
    }
    fractionOff(){
        this.#frac.leftFrac.alpha = 0;
        this.#frac.topFrac.alpha = 0;
    }

    findProduct(){
        let rowNum = this.#frac.leftFrac.children[0].text;
        let rowDen = this.#frac.leftFrac.children[2].text;
        let colNum = this.#frac.topFrac.children[0].text;
        let colDen = this.#frac.topFrac.children[2].text;

        this.#frac.result.children[0].text = (rowNum*colNum)
        this.#frac.result.children[2].text = (rowDen*colDen)

        this.#paper.removeChild(this.#frac.result);
        this.#paper.addChild(this.#frac.result);

        let orig = this.#paperSize.y*.4;
        let drop = this.#paperSize.x*.47;

        createjs.Tween.get(this.#frac.result, {bounce:true, loop:false})
	    .to({alpha:1}, 0)
        .to({y: drop}, 1000, createjs.Ease.bounceOut)
        .wait(3000)
        .to({alpha:0}, 500)
        .to({y: orig}, 0);

        //return [rowNum, rowDen, colNum, colDen]
        //console.log(this.#frac.leftFrac.children[0].text)
    }

    #buildFracSet(n){
        let leftFrac = this.#buildFrac(-50, (this.#paperSize.y*.5), n[0].n, n[0].d, "#94c2fe", fontSize);
        let topFrac = this.#buildFrac(this.#paperSize.x*.5, -50, n[1].n, n[1].d, "#f7aaa4", fontSize);
        let resultFrac = this.#buildFrac(this.#paperSize.x*.5, this.#paperSize.y*.4, n[2].n, n[2].d, "white", 48);
        resultFrac.alpha = 0;

        this.#frac = {leftFrac: leftFrac, topFrac: topFrac, result: resultFrac};
    }

    #buildFrac(x, y, num, denom, color, font) {
        let frac = new createjs.Container();
        frac.x = x;
        frac.y = y;

        let fractNum = new createjs.Text(num, font+"px Balsamiq Sans", color);
        fractNum.textAlign = 'center';
        fractNum.y = -(font*(5/6));

        let line = this.#drawLine(-(font*(5/6)),(font*(5/12)),(font*(5/6)),(font*(5/12)), color); 
        line.textAlign = 'center';

        var fractDenom = new createjs.Text(denom, font+"px Balsamiq Sans", color);
        fractDenom.textAlign = 'center';
        fractDenom.y = (font*(5/6));

        frac.addChild(fractNum, line, fractDenom);
        this.#paper.addChild(frac);
        return frac
    }

    #buildRowColButtons() {
        let row = this.#generateStageRowColButton("row", 
            (this.#paperSize.x+25), (this.#paperSize.y*.5), -80, 50);
        row.rotation = -90;
        let col = this.#generateStageRowColButton("column", 
            (this.#paperSize.x*.5), (this.#paperSize.y+25), -100, 70);
        
        this.#rowText = row;
        this.#colText = col;
        this.#paper.addChild(row, col);
    }

    #generateStageRowColButton(type, x, y, xPlus, xMinus){
        let container = new createjs.Container();
        container.x = x;
        container.y = y

        let plusHit = new createjs.Shape();
        plusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xPlus,0,34,34,5,5,5,5);
        let plus =  new createjs.Shape();
	    plus.graphics.beginFill(bannerFontColor).drawRect(15,5,4,24).drawRect(5,15,24,4);
        plus.x = xPlus;
        plusHit.source = this;
        
        let text = new createjs.Text(type, "32px Balsamiq Sans", "#94c2fe");
        text.textAlign = 'center';
        console.log(text)

        let minusHit = new createjs.Shape();
        minusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xMinus-5,0,34,34,5,5,5,5);
        let minus =  new createjs.Shape();
	    minus.graphics.beginFill(bannerFontColor).drawRect(0,15,24,4);
        minus.x = xMinus;
        minusHit.source = this;

        if(type == "row") {
            plusHit.addEventListener("click", function(event) { 
                event.target.source.updateGrid(event.target.source.#xdiv,event.target.source.#ydiv+1);
             });
            //plusHit.on("click", addRow); 
            minusHit.addEventListener("click", function(event) { 
                if (event.target.source.#ydiv <= 1) {
                    console.log(event.target.source.#ydiv)
                } else {
                    event.target.source.updateGrid(event.target.source.#xdiv,event.target.source.#ydiv-1);
                }
             });
        } else {
            plusHit.addEventListener("click", function(event) { 
                event.target.source.updateGrid(event.target.source.#xdiv+1,event.target.source.#ydiv);
             });
            //plusHit.on("click", addRow); 
            minusHit.addEventListener("click", function(event) { 
                if (event.target.source.#xdiv <= 1) {
                    console.log(event.target.source.#xdiv)
                } else {
                    event.target.source.updateGrid(event.target.source.#xdiv-1,event.target.source.#ydiv);
                }
             });
        }
        
        container.addChild(minusHit, minus, text, plusHit, plus);
        return container;
    }
    
    // Generates n*n grid
    #generateGrid(paperSize, xdiv, ydiv){
        let lines = [(xdiv-1)+(ydiv-1)];

        for (let i = 0; i < (xdiv-1); i++){
            // Draw row divider
            lines[i] = this.#drawLine(paperSize.x*((i+1)/xdiv),0, 
            paperSize.x*((i+1)/xdiv),paperSize.y, bannerBorderColor); 

        }
        for (let i = (xdiv-1); i < (xdiv-1)+(ydiv-1); i++){
            // Draw column divider
            lines[i] = this.#drawLine(0,paperSize.y*(((i-(xdiv-1))+1)/ydiv), 
            paperSize.x,paperSize.y*(((i-(xdiv-1))+1)/ydiv), bannerBorderColor); 
        }
        return lines;
    }

    #drawLine(x0, y0, x1, y1, color){
        let line = new createjs.Shape();
        line.graphics.setStrokeStyle(this.#lineStroke)
                .beginStroke(color)
                .moveTo(x0, y0)
                .lineTo(x1, y1).endStroke();
        return line;    
    }

    #createColumnDragger(x, y, radius) {
        let node = new createjs.Shape();
        node.graphics.beginFill("purple").drawCircle(0,0, radius);
        node.alpha = .5;
        node.properties = this;

        let cover = new createjs.Shape();
        cover.graphics.beginFill("#ff1b1b").drawRect(this.#lineStroke/2,this.#lineStroke/2, 0, this.#paperSize.y-this.#lineStroke);
        cover.alpha = .25;
        this.#paper.addChild(cover);
        node.cover = cover;
        node.frac = this.#frac.topFrac;
        this.#nodeColCover = cover;
        
        let dragger = new createjs.Container();
        dragger.x = x;
        dragger.y = y;
        dragger.cover = cover;
        
    
        dragger.on("mousedown", function (evt) {
            console.log(evt)
            dragger.oldX = dragger.x;
            //dragger.oldY = dragger.y;
            this.parent.addChild(this);
            this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
        });
    
        dragger.on("pressmove", function (evt) {
            if (evt.stageX + this.offset.x <= 0 ){ 
                this.x = 0;
            } else if ((evt.stageX + this.offset.x) >= evt.target.properties.#paperSize.x) {
                this.x = evt.target.properties.#paperSize.x;
            }
            else { 
                this.x = evt.stageX + this.offset.x;
            }
            evt.target.cover.graphics.command.w = this.x;
        });
        dragger.on("pressup", function (evt) {
            PlaySound(slideSound,.4);
            let paperSize = evt.target.properties.#paperSize.x;
            let div = evt.target.properties.#xdiv;
            let width = paperSize/div;

            // Generate array of snap-to locations on the grid
            let snapper = [div+2];
            snapper[0] = 0;
            snapper[div+2] = paperSize;
            for (let i = 1; i < div+1; i++){
                snapper[i] = width*i;
            }
            let j = 0;
            // Find lower bound
            while (this.x > snapper[j]) { j++ }
            // Snap node location to closer grid intersect
            this.x = (this.x-snapper[j-1] < snapper[j]-this.x) ? snapper[j-1] : snapper[j];
            let numVal = this.x/width;
            evt.target.cover.graphics.command.w = this.x;
            evt.target.frac.children[0].text = numVal;
            evt.target.frac.children[2].text = div;
        });

        node.on("mouseover", function (evt) {
            evt.target.scaleX = 1.2;
            evt.target.scaleY = 1.2;
    
        });
        node.on("mouseout", function (evt) {
            evt.target.scaleX = 1;
            evt.target.scaleY = 1;
        });
    
        dragger.addChild(node);
        return dragger;
    }

    #createRowDragger(x, y, radius) {
        let node = new createjs.Shape();
        node.graphics.beginFill("green").drawCircle(0,0, radius);
        node.alpha = .5;
        node.properties = this;
        
        let cover = new createjs.Shape();
        cover.graphics.beginFill("#0802ff").drawRect(this.#lineStroke/2,this.#lineStroke/2, this.#paperSize.x-this.#lineStroke, 0);
        cover.alpha = .25;
        this.#paper.addChild(cover);
        node.cover = cover;
        node.frac = this.#frac.leftFrac;
        this.#nodeRowCover = cover;
        
        let dragger = new createjs.Container();
        dragger.x = x;
        dragger.y = y;
        dragger.cover = cover;
    
        dragger.on("mousedown", function (evt) {
            dragger.oldY = dragger.y;
            this.parent.addChild(this);
            this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
        });
    
        dragger.on("pressmove", function (evt) {
            if (evt.stageY + this.offset.y <= 0 ){ 
                this.y = 0;
            } else if ((evt.stageY + this.offset.y) >= evt.target.properties.#paperSize.y) {
                this.y = evt.target.properties.#paperSize.y;
            }
            else { 
                this.y = evt.stageY + this.offset.y;
            }
            evt.target.cover.graphics.command.h = this.y;
        });
        dragger.on("pressup", function (evt) {
            PlaySound(slideSound,.4);
            let paperSize = evt.target.properties.#paperSize.y;
            let div = evt.target.properties.#ydiv;
            let width = paperSize/div;

            // Generate array of snap-to locations on the grid
            let snapper = [div+2];
            snapper[0] = 0;
            snapper[div+2] = paperSize;
            for (let i = 1; i < div+1; i++){
                snapper[i] = width*i;
            }
            let j = 0;
            // Find lower bound
            while (this.y > snapper[j]) { j++ }
            // Snap node location to closer grid intersect
            this.y = (this.y-snapper[j-1] < snapper[j]-this.y) ? snapper[j-1] : snapper[j];
            evt.target.cover.graphics.command.h = this.y;
            let numVal = this.y/width;
            evt.target.frac.children[0].text = numVal;
            evt.target.frac.children[2].text = div;
        });

        node.on("mouseover", function (evt) {
            evt.target.scaleX = 1.2;
            evt.target.scaleY = 1.2;
    
        });
        node.on("mouseout", function (evt) {
            evt.target.scaleX = 1;
            evt.target.scaleY = 1;
        });
    
        dragger.addChild(node);
        return dragger;
    }
}

function addRow(){
    mainPaper.updateGrid(mainPaper.getRow,mainPaper.getCol+1);
}
function removeRow(){
    mainPaper.updateGrid(mainPaper.getRow,mainPaper.getCol-1);
}
function addCol(){
    mainPaper.updateGrid(mainPaper.getRow+1,mainPaper.getCol);
}
function removeCol(){
    if (mainPaper.getRow <= 1) {
        alert("Cannot go lower than 1")
    } else {
        mainPaper.updateGrid(mainPaper.getRow-1,mainPaper.getCol);
    }
    
}