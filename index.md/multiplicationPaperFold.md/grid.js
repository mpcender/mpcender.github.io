class Grid {
    #rowText
    #nodeCol;
    #nodeColCover;
    #colText
    #nodeRow;
    #nodeRowCover;
    #grid;
    #xdiv;
    #ydiv;
    #MAXDIV = 12;
    #MAXUNIT = 3;

    #xUnitDiv;
    #yUnitDiv;

    #color_red = "#94c2fe";
    #color_blue = "#f7aaa4";

    #paperSize = {x: 600, y: 600};
    #frac = {leftFrac: new createjs.Container(), 
            topFrac: new createjs.Container(), 
            result: new createjs.Container()};

    #cRad = 15;
    #lineStroke = 4;
    #paper;

    constructor(size, x, y){
        
        this.#paper = new createjs.Container();
        this.#paperSize = size;

        this.#xdiv = 1;
        this.#ydiv = 1;
        this.#xUnitDiv = 1;
        this.#yUnitDiv = 1;

        this.#paper.x = x-(this.#paperSize.x/2);
        this.#paper.y = y-(this.#paperSize.y/2)+bannerHeight/2;
        
    	let rect = new createjs.Shape();
        rect.graphics.setStrokeStyle(4).beginStroke(bannerBorderColor)
    		.drawRect(0,0,this.#paperSize.x,this.#paperSize.y);

        this.updateDefineFractions(0, 1, 0, 1);

        this.#grid = [];

    	this.#paper.addChild(rect, this.#nodeCol, this.#nodeRow);
        stage.addChild(this.#paper);
    }

    getMaxDiv(){
        return this.#MAXDIV;
    }
    getMaxUnit(){
        return this.#MAXUNIT;
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
        
        this.#paper.removeChild(this.#frac.leftFrac, this.#frac.topFrac);
        this.#frac.leftFrac._off = true;

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

    /*
    updateGridSections(div, clear){
        if (div > this.#MAXDIV) { return; }
        this.#gridDiv = div;
        this.updateGrid(div, div, clear);
        this.updateDefineFractions(0,1,0,1);
        this.#frac.leftFrac.children[3].text = this.#xdiv/this.#gridDiv;
        this.#frac.topFrac.children[3].text = this.#ydiv/this.#gridDiv;
    }
    */
    updateGridSections(xdiv, ydiv, clear){
        //console.log("updateGridSections " + xdiv)
        if (xdiv > this.#MAXUNIT || ydiv > this.#MAXUNIT ) { 
            this.#toastAlert("Units cannot be larger than " + this.#MAXUNIT);
            return; 
        }
        if (xdiv <= 0 || ydiv <= 0 ) { 
            this.#toastAlert("Units cannot be less than 1");
            return; 
        }
        //console.log(xdiv + " " + ydiv)
        this.#xUnitDiv = xdiv;
        this.#yUnitDiv = ydiv;
        
        this.updateGrid(xdiv, ydiv, clear);
        this.updateDefineFractions(0,1,0,1);
        this.#frac.leftFrac.children[3].text = this.#xdiv/this.#xUnitDiv;
        this.#frac.topFrac.children[3].text = this.#ydiv/this.#yUnitDiv;
    }
    

    updateGrid(xdiv, ydiv, clear) {
        //console.log("updateGrid: " + xdiv)
        if (xdiv > this.#MAXDIV || ydiv > this.#MAXDIV) { return; }

        PlaySound(bloopSound,.4);
        let xClear = (this.#xdiv != xdiv && this.#ydiv == ydiv) || clear;
        let yClear = (this.#xdiv == xdiv && this.#ydiv != ydiv) || clear;

        // Update global paper divider variables
        this.#xdiv = xdiv == 0 ? 1 : xdiv;
        this.#ydiv = ydiv == 0 ? 1 : ydiv;
        // Remove all current dividers
        this.#grid.forEach(element => this.#paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this.#generateGrid(this.#paperSize, this.#xdiv, this.#ydiv);
        this.#grid = newGrid;
        
        // dont attempt at add dividers for 1x1 grid
        if (this.#grid.length >= 1 && this.#grid[0] != 0) { 
            //this.#grid.pop()
            // Add new dividers to stage
            this.#grid.forEach(element => 
                this.#paper.addChild(element));
        }
        this.resetSliders(xClear, yClear);
    }

    resetSliders(xClear, yClear){
        if (xClear) { 
            this.#frac.topFrac.children[3].text = 0;
            this.#nodeCol.x = 0;
            this.#nodeCol.cover.graphics.command.w = 0;
            this.#frac.topFrac.children[1].text = 0;
        } else { 
            let slideTo = (this.#paperSize.x/this.#xdiv)*this.#frac.topFrac.children[1].text
            this.#nodeCol.x = slideTo;
            this.#nodeCol.cover.graphics.command.w = slideTo;
        }

        if (yClear) {
            this.#frac.leftFrac.children[3].text = 0;
            this.#nodeRow.y = 0;
            this.#nodeRow.cover.graphics.command.h = 0;
            this.#frac.leftFrac.children[1].text = 0;
        } else {
            let slideTo = (this.#paperSize.y/this.#ydiv)*this.#frac.leftFrac.children[1].text
            this.#nodeRow.y = slideTo;
            this.#nodeRow.cover.graphics.command.h = slideTo;
            //console.log("resetSliders " + this.#paperSize.y + " "+ this.#ydiv+ " "+ this.#frac.leftFrac.children[1].text);
        }
    }

    updateDefineFractions(rNum, rDen, cNum, cDen){
        document.getElementById("rNum").value = rNum == -1 ? document.getElementById("rNum").value : rNum;
		document.getElementById("rDen").value = rDen == -1 ? document.getElementById("rDen").value : rDen;
		document.getElementById("cNum").value = cNum == -1 ? document.getElementById("cNum").value : cNum;
		document.getElementById("cDen").value = cDen == -1 ? document.getElementById("cDen").value : cDen;
    }

    updateStageFractions(rNum, rDen, cNum, cDen){
        let update = true;
        if (!this.isValidInput(rNum, rDen, cNum, cDen)) { return; }

        this.#yUnitDiv = Math.ceil(rNum/rDen);
        this.#xUnitDiv = Math.ceil(cNum/cDen);
        this.updateGrid(cDen*this.#xUnitDiv, rDen*this.#yUnitDiv);

        if (update){
            this.#frac.leftFrac.children[1].text = rNum;
            this.#frac.leftFrac.children[3].text = rDen;
            this.#frac.topFrac.children[1].text = cNum
            this.#frac.topFrac.children[3].text = cDen; 

            this.resetSliders(false, false)
        }
    }

    isValidInput(rNum, rDen, cNum, cDen){
        if (rNum > this.#MAXDIV) {
            this.#toastAlert("Numerators cannot exceed " + this.#MAXDIV);
            this.#frac.leftFrac.children[1].text = "0";
            this.updateDefineFractions(0, -1, -1, -1);
            return false;
        }
        if (rDen > this.#MAXDIV ) {
            this.#toastAlert("Denominators cannot exceed " + this.#MAXDIV);
            this.#frac.leftFrac.children[3].text = "0";
            this.updateDefineFractions(-1, 1, -1, -1);
            return false;
        }
        if (cNum > this.#MAXDIV) {
            this.#toastAlert("Numerators cannot exceed " + this.#MAXDIV);
            this.#frac.topFrac.children[1].text = "0";
            this.updateDefineFractions(-1, -1, 0, -1);
            return false;
        }
        if (cDen > this.#MAXDIV) {
            this.#toastAlert("Denominators cannot exceed " + this.#MAXDIV);
            this.#frac.topFrac.children[3].text = "0";
            this.updateDefineFractions(-1, -1, -1, 1);
            return false;
        }
        if (rDen == 0 || cDen == 0) { 
            this.#toastAlert("Cannot divide by zero");
            return false;
        } 
        if (rNum/rDen > this.#MAXUNIT || cNum/cDen > this.#MAXUNIT) {
            this.#toastAlert("Fractions cannot be larger than " + this.#MAXUNIT);
            return false;
        }
        let rowValid2 = (rNum/rDen > 2 && rDen > (this.#MAXDIV/3));
        let colValid2 = (cNum/cDen > 2 && cDen > (this.#MAXDIV/3));
        let rowValid1 = (rNum/rDen > 1 && rDen > (this.#MAXDIV/2));
        let colValid1 = (cNum/cDen > 1 && cDen > (this.#MAXDIV/2));
        if (rowValid2 || colValid2) {
            let text = (colValid2 ? "" : "Row") + "" + (rowValid2 ? "" : "Column");
            this.#toastAlert(text+" Invalid: Fractions greater than 2 must have denominators of " + (this.#MAXDIV/3) + " or less");
            return false;
        } else if (rowValid1 || colValid1) {
            let text = (colValid1 ? "" : "Row") + "" + (rowValid1 ? "" : "Column");
            this.#toastAlert(text+" Invalid: Fractions greater than 1 must have denominators of " + (this.#MAXDIV/2) + " or less");
            return false;
        }

        return true;
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
        let rowNum = this.#frac.leftFrac.children[1].text;
        let rowDen = this.#frac.leftFrac.children[3].text;
        let colNum = this.#frac.topFrac.children[1].text;
        let colDen = this.#frac.topFrac.children[3].text;

        this.#frac.result.children[1].text = Math.round(rowNum*colNum)
        this.#frac.result.children[3].text = Math.round(rowDen*colDen)

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
    }

    revealUnit(){
        let rect = new createjs.Shape();
        
        rect.graphics.setStrokeStyle(5).beginStroke("white")
        .drawRoundRectComplex(0,0,this.#paperSize.x/this.#xUnitDiv,this.#paperSize.y/this.#yUnitDiv,5,5,5,5);
        rect.alpha = 0;
        rect.shadow = new createjs.Shadow("#FFFFFF", 0, 0, 25);
        rect.paper = this.#paper;
        this.#paper.addChild(rect)

        createjs.Tween.get(rect)
	    .to({alpha:1}, 1000).wait(1000).to({alpha:0}, 1000).call(handleComplete);
    
        function handleComplete() {
            rect.paper.removeChild(rect);
        }
        
    }

    #buildFracSet(n){
        let leftFrac = this.#buildFrac(-50, (this.#paperSize.y*.5), n[0].n, n[0].d, this.#color_red , fontSize);
        let topFrac = this.#buildFrac(this.#paperSize.x*.5, -50, n[1].n, n[1].d, this.#color_blue, fontSize);
        let resultFrac = this.#buildFrac(this.#paperSize.x*.5, this.#paperSize.y*.4, n[2].n, n[2].d, "white", 60);
        resultFrac.alpha = 0;
        let shadow = new createjs.Shadow(bannerBorderColor, 0, 0, 20);
        resultFrac.children[0].shadow = shadow;
        resultFrac.children[1].shadow = shadow;
        resultFrac.children[2].shadow = shadow;
        resultFrac.children[3].shadow = shadow;
        resultFrac.children[0].alpha = .8;
    

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

        let rect = new createjs.Shape();
        rect.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(-font,-font*1.2,font*2,font*3.3,font,font,font,font);
        rect.alpha = 0;
        
        frac.addChild(rect, fractNum, line, fractDenom);
        this.#paper.addChild(frac);
        return frac
    }

    #buildRowColButtons() {
        let row = this.#generateStageRowColButton("row", this.#color_red,  
            (this.#paperSize.x+25), (this.#paperSize.y*.5), -80, 50);
        row.rotation = -90;

        let col = this.#generateStageRowColButton("column", this.#color_blue,
            (this.#paperSize.x*.5), (this.#paperSize.y+25), -100, 70);
        
        this.#rowText = row;
        this.#colText = col;
        this.#paper.addChild(row, col);
    }

    #generateStageRowColButton(type, color, x, y, xPlus, xMinus){
        let container = new createjs.Container();
        container.x = x;
        container.y = y

        let plusHit = new createjs.Shape();
        plusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xPlus,0,34,34,5,5,5,5);
        let plus =  new createjs.Shape();
	    plus.graphics.beginFill(bannerFontColor).drawRect(15,5,4,24).drawRect(5,15,24,4);
        plus.x = xPlus;
        plusHit.source = this;
        
        let text = new createjs.Text(type, "32px Balsamiq Sans", color);
        text.textAlign = 'center';

        let minusHit = new createjs.Shape();
        minusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xMinus-5,0,34,34,5,5,5,5);
        let minus =  new createjs.Shape();
	    minus.graphics.beginFill(bannerFontColor).drawRect(0,15,24,4);
        minus.x = xMinus;
        minusHit.source = this;

        if(type == "row") {
            plusHit.addEventListener("click", function(event) { 
                let i = event.target.source.#yUnitDiv
                event.target.source.updateGrid(parseFloat(event.target.source.#xdiv),parseFloat(event.target.source.#ydiv)+parseFloat(i));
                event.target.source.updateDefineFractions(0, event.target.source.#ydiv/i, -1, event.target.source.#xdiv/i);
                event.target.source.#frac.leftFrac.children[3].text = event.target.source.#ydiv/i;
             });
            minusHit.addEventListener("click", function(event) { 
                let i = event.target.source.#yUnitDiv
                if (event.target.source.#ydiv <= i) {
                    //console.log(event.target.source.#ydiv)
                } else {
                    event.target.source.updateGrid(parseFloat(event.target.source.#xdiv),parseFloat(event.target.source.#ydiv)-parseFloat(i));
                    event.target.source.updateDefineFractions(0, event.target.source.#ydiv, -1, event.target.source.#xdiv);
                    event.target.source.#frac.leftFrac.children[3].text = event.target.source.#ydiv/i;
                }
             });
        } else {
            plusHit.addEventListener("click", function(event) { 
                let i = event.target.source.#xUnitDiv
                event.target.source.updateGrid(parseFloat(event.target.source.#xdiv)+parseFloat(i),event.target.source.#ydiv);
                event.target.source.updateDefineFractions(-1, event.target.source.#ydiv/i, 0, event.target.source.#xdiv/i);
                event.target.source.#frac.topFrac.children[3].text = event.target.source.#xdiv/i;
             });
            minusHit.addEventListener("click", function(event) { 
                let i = event.target.source.#xUnitDiv
                if (event.target.source.#xdiv <= i) {
                    //console.log(event.target.source.#xdiv)
                } else {
                    event.target.source.updateGrid(parseFloat(event.target.source.#xdiv)-parseFloat(i),event.target.source.#ydiv);
                    event.target.source.updateDefineFractions(-1, event.target.source.#ydiv/i, 0, event.target.source.#xdiv/i);
                    event.target.source.#frac.topFrac.children[3].text = event.target.source.#xdiv/i;
                }
             });
        }
        
        container.addChild(minusHit, minus, text, plusHit, plus);
        return container;
    }
    
    // Generates n*n grid
    #generateGrid(paperSize, xdiv, ydiv){
        let lines = [(xdiv-1)+(ydiv-1)];
        let xSeperatorColor = this.#xUnitDiv <= 1 ? bannerBorderColor : "white";
        let ySeperatorColor = this.#yUnitDiv <= 1 ? bannerBorderColor : "white";

        for (let i = 0; i < (xdiv-1); i++){
            // Modifies color of grid to seperate "whole" numbers
            let color;
            if (this.#xUnitDiv <= 2) {
                color = (xdiv/this.#xUnitDiv)-1 == i ? xSeperatorColor : bannerBorderColor;
            } else {
                color = (xdiv/this.#xUnitDiv)-1 == i || (((xdiv/this.#xUnitDiv)*2)-1)  == i ? 
                        xSeperatorColor : bannerBorderColor;
            }
            // Draw row divider
            lines[i] = this.#drawLine(paperSize.x*((i+1)/xdiv),0, 
            paperSize.x*((i+1)/xdiv),paperSize.y, color); 

        }
        for (let i = (xdiv-1); i < (xdiv-1)+(ydiv-1); i++){
            // Modifies color of grid to seperate "whole" numbers
            let color;
            if (this.#yUnitDiv <= 2) {
                color = (ydiv/this.#yUnitDiv)-1 == i-(xdiv-1) ? ySeperatorColor : bannerBorderColor;
            } else {
                color = (ydiv/this.#yUnitDiv)-1 == i-(xdiv-1) || (((ydiv/this.#yUnitDiv)*2)-1)  == i-(xdiv-1) ? 
                        ySeperatorColor : bannerBorderColor;
            }
            // Draw column divider
            lines[i] = this.#drawLine(0,paperSize.y*(((i-(xdiv-1))+1)/ydiv), 
            paperSize.x,paperSize.y*(((i-(xdiv-1))+1)/ydiv), color); 
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
            let numVal = (this.x/width);
            evt.target.cover.graphics.command.w = this.x;
            evt.target.frac.children[1].text = Math.round(numVal);
            evt.target.frac.children[3].text = Math.round(div/evt.target.properties.#xUnitDiv);

            evt.target.properties.updateDefineFractions(-1,-1,evt.target.frac.children[1].text,evt.target.frac.children[3].text);
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
            evt.target.frac.children[1].text = Math.round(numVal);
            evt.target.frac.children[3].text = Math.round(div/evt.target.properties.#yUnitDiv);

            evt.target.properties.updateDefineFractions(evt.target.frac.children[1].text,evt.target.frac.children[3].text, -1,-1);
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

    #toastAlert(message) {
	    currentToast = document.getElementById("toast");
	    currentToast.innerHTML = "<br>"+message+"<br><br>";
	    currentToast.className = "show";
	    toastTimeout = setTimeout(function(){ currentToast.className = 
	    	currentToast.className.replace("show", ""); }, 4000);
    }
}




