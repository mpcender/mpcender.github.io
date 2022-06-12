class PaperNegative {
    #MAXVAL = 12;
    #rowText
    //#colText
    #nodeRow;
    #nodeRowCover;
    #grid;

    #num_val;
    #fill_val;
    #xdiv;
    #ydiv;
    
    #right_font_color = style.getPropertyValue("--right_red");
    #cover_color = "#ff1b1b";
    
    #paperSize = {x: 600, y: 600};
    #frac = {negFrac: new createjs.Container(), result: new createjs.Container()};

    #cRad = 15;
    #lineStroke = 4;
    #paper;

    constructor(size, x, y){
        this.#paper = new createjs.Container();
        this.#paperSize = size;

        this.#num_val = 0;
        this.#fill_val = 0;
        this.#xdiv = 1;
        this.#ydiv = 1;

        this.#paper.x = x-(this.#paperSize.x/2);
        this.#paper.y = y-(this.#paperSize.y/2)+bannerHeight/2;
        
    	let rect = new createjs.Shape();
        rect.graphics.setStrokeStyle(4).beginStroke(bannerBorderColor)
    		.drawRect(0,0,this.#paperSize.x,this.#paperSize.y);

        this.#grid = [];

    	this.#paper.addChild(rect, this.#nodeRow);
        stage.addChild(this.#paper);
    }

    getRow() {
        return this.#ydiv;
    }
    getCol() {
        return this.#xdiv;
    }

    getColor() {
        return this.#cover_color;
    }


    getFillVal() {
        return this.#fill_val;
    }

    getValue() {
        return parseInt(this.#frac.negFrac.children[0].text) / parseInt(this.#frac.negFrac.children[2].text);
    }

    getCover() {
        return this.#nodeRowCover;
    }

    getPaperSize(){
        return this.#paperSize;
    }

    setFraction(num, den){
        this.setNumerator(num);
        this.setDenominator(den);
    }

    setNumerator(num){
        this.#frac.negFrac.children[0].text = num;
        this.#num_val = num;
    }

    setDenominator(den) {
        this.#frac.negFrac.children[2].text = den;
    }

    decrementNumerator(){
        this.#frac.negFrac.children[0].text = this.#num_val-1;
        this.#num_val = this.#num_val-1;
    }
    
    resizePaper(size, x, y){
        let fracOff = false;
        if (this.#frac.negFrac.children.length == 0 || this.#frac.negFrac.alpha == 0) {
            fracOff=true;
        }

        // Store new xy dimensions
        this.#paperSize = {x: size, y: size};
        // Update container base location
        this.#paper.x = x-(this.#paperSize.x/2);
        this.#paper.y = y-(this.#paperSize.y/2)+bannerHeight/2;
        
        this.#paper.removeChild(this.#frac.negFrac);
        this.#frac.negFrac._off = true;
        this.#buildFracSet( [ {n: 0, d: 1} , {n: 0, d: 1} , {n: 0, d: 1} ] );
        
        // Generate draggers
        this.#paper.removeChild(this.#nodeRowCover);
        this.#paper.removeChild(this.#nodeRow);
        this.#nodeRow = this.#createRowDragger(this.#paperSize.x, 0, this.#cRad);
        this.#paper.addChild(this.#nodeRow);
        
        // Remove all current dividers
        this.#grid.forEach(element => this.#paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this.#generateGrid(this.#paperSize, this.#xdiv, this.#ydiv);
        this.#grid = newGrid;

        this.#paper.removeChild(this.#rowText);
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

    setCol(mult){
        this.#num_val = this.#num_val*mult;
        this.#xdiv = mult;
        this.#frac.negFrac.children[0].text = this.#num_val;
        this.#frac.negFrac.children[2].text = this.#ydiv*this.#xdiv;

        this.updateGrid(this.#ydiv, this.#xdiv);
    }

    // Repartition button
    updateGrid(ydiv, xdiv) {
        PlaySound(bloopSound,.4);

        // Update global paper divider variables
        this.#xdiv = xdiv;
        this.#ydiv = ydiv;

        this.#updateDividers();
    }

    // Define button behavior
    defineGrid(num, den) {
        PlaySound(bloopSound,.4);

        if (!this.isValidInput(num, den)) { return; }

        this.enableInput();
        // Update global paper divider variables
        this.#num_val = num;
        this.#fill_val = num;
        let slideTo = (this.#paperSize.y/den)*num;
        this.#nodeRow.y = slideTo;
        this.#nodeRow.cover.graphics.command.h = slideTo;

        this.#xdiv = 1; // Reset x dividers on manual update
        this.#ydiv = den;

        this.#frac.negFrac.children[0].text = num;
        this.#frac.negFrac.children[2].text = den;

        this.#updateDividers();
    }

    #updateDividers(){
        // Remove all current dividers
        this.#grid.forEach(element => this.#paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this.#generateGrid(this.#paperSize, this.#xdiv, this.#ydiv);
        this.#grid = newGrid;
        
        // dont attempt at add dividers for 1x1 grid
        if (this.#grid.length >= 1) { 
            try {
                this.#grid.forEach(element => this.#paper.addChild(element));
              } catch (error) {
                console.error(error);
              }
        }
    }

    resetSliders(){
        this.#nodeRow.y = 0;
        this.#nodeRow.cover.graphics.command.h = 0;
    }

    disableInput(){
        for (let i = 0; i < this.#rowText.children.length; i++) {
            if (i==2) { continue; }
            this.#rowText.children[i].alpha = 0;
        }
        this.#nodeRow.children[0].alpha = 0
    }

    enableInput(){
        for (let i = 0; i < this.#rowText.children.length; i++) {
            if (i==2) { continue; }
            this.#rowText.children[i].alpha = 1;
        }
        this.#nodeRow.children[0].alpha = .5
    }

    toggleFractionNegative(){
        if (this.#frac.negFrac.alpha == 0){
            this.#frac.negFrac.alpha = 1;
        }
        else if (this.#frac.negFrac.alpha == 1 && this.#frac.negFrac.scaleX == 1) {
            this.#frac.negFrac.scaleX = 1.5;
            this.#frac.negFrac.scaleY = 1.5;
            this.#frac.negFrac.y -= 25;
        } else {
            this.#frac.negFrac.alpha = 0
            this.#frac.negFrac.scaleX = 1;
            this.#frac.negFrac.scaleY = 1;
            this.#frac.negFrac.y += 25;
        } 
    }
    fractionOff(){
        this.#frac.negFrac.alpha = 0;
    }

    findProduct(){
        let rowNum = this.#frac.negFrac.children[0].text;
        let rowDen = this.#frac.negFrac.children[2].text;

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
        let negFrac = this.#buildFrac(this.#paperSize.x*.5, -50, n[0].n, n[0].d, this.#right_font_color, fontSize);
        //let topFrac = this.#buildFrac(, n[1].n, n[1].d, , fontSize);
        let resultFrac = this.#buildFrac(this.#paperSize.x*.5, this.#paperSize.y*.4, n[2].n, n[2].d, "white", 48);
        resultFrac.alpha = 0;

        this.#frac = {negFrac: negFrac, result: resultFrac};
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
        let row = this.#generateStageRowColButton("right", 
            (this.#paperSize.x+25), (this.#paperSize.y*.5), -80, 50);
        row.rotation = -90;
        /*
        let col = this.#generateStageRowColButton("column", 
            (this.#paperSize.x*.5), (this.#paperSize.y+25), -100, 70);
        */
        
        this.#rowText = row;
        //this.#colText = col;
        this.#paper.addChild(row);
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
        
        let text = new createjs.Text(type, "32px Balsamiq Sans", this.#right_font_color);
        text.textAlign = 'center';

        let minusHit = new createjs.Shape();
        minusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xMinus-5,0,34,34,5,5,5,5);
        let minus =  new createjs.Shape();
	    minus.graphics.beginFill(bannerFontColor).drawRect(0,15,24,4);
        minus.x = xMinus;
        minusHit.source = this;

        plusHit.addEventListener("click", function(event) { 
            if (event.target.source.#ydiv >= 12) {
                return;
            }

            //console.log(event.target.source.#xdiv + " " + (parseInt(event.target.source.#ydiv)+1))
            let new_denom = (parseInt(event.target.source.#ydiv)+1);
            event.target.source.updateGrid(
                new_denom ,
                event.target.source.#xdiv);

            // Reset node slider to location
            let paperSize = event.target.source.#paperSize;
            let newY = parseInt((paperSize.y/new_denom)*event.target.source.#fill_val);
            event.target.source.#nodeRow.y = newY;
            event.target.source.#nodeRow.cover.graphics.command.h = newY;
            // Update "Define" button numeric values
            document.getElementById("rightDen").value = parseInt(document.getElementById("rightDen").value)+1;
            // Update stage "Display" fraction values
            event.target.source.#frac.negFrac.children[2].text = new_denom;
         });
        //plusHit.on("click", addRow); 
        minusHit.addEventListener("click", function(event) { 
            if (event.target.source.#ydiv <= 1 
                || (event.target.source.#ydiv) <= event.target.source.#fill_val) {
                return;
            } else {
                let new_denom = (parseInt(event.target.source.#ydiv)-1);
                event.target.source.updateGrid(
                    new_denom ,
                    event.target.source.#xdiv);
                
                    let paperSize = event.target.source.#paperSize;
                    let newY = parseInt((paperSize.y/new_denom)*event.target.source.#fill_val);
                    event.target.source.#nodeRow.y = newY;
                    event.target.source.#nodeRow.cover.graphics.command.h = newY;
                    // Update "Define" button numeric values
                    document.getElementById("rightDen").value = new_denom;
                    // Update stage "Display" fraction values
                    event.target.source.#frac.negFrac.children[2].text = new_denom;
            }
         });
        
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

    #storeSliderPosition(){
        
        /*
        this.y = (this.y-snapper[j-1] < snapper[j]-this.y) ? snapper[j-1] : snapper[j];
        evt.target.cover.graphics.command.h = this.y;
        let numVal = this.y/width;
        evt.target.frac.children[0].text = Math.round(numVal);
        evt.target.frac.children[2].text = Math.round(div);
        */
    }

    #createRowDragger(x, y, radius) {
        let node = new createjs.Shape();
        node.graphics.beginFill("green").drawCircle(0,0, radius);
        node.alpha = .5;
        node.properties = this;
        
        let cover = new createjs.Shape();
        cover.graphics.beginFill(this.#cover_color).drawRect(this.#lineStroke/2,this.#lineStroke/2, this.#paperSize.x-this.#lineStroke, 0);
        cover.alpha = .25;
        this.#paper.addChild(cover);
        node.cover = cover;
        node.frac = this.#frac.negFrac;
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

            evt.target.properties.#fill_val = Math.round(numVal);
            evt.target.properties.#num_val = Math.round(numVal)*evt.target.properties.#xdiv;
            document.getElementById("rightNum").value = evt.target.properties.#num_val;
            evt.target.frac.children[0].text = evt.target.properties.#num_val;
            evt.target.frac.children[2].text = Math.round(div)*evt.target.properties.#xdiv;
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

    isValidInput(num, den){
        if (parseInt(num) > this.#MAXVAL) {
            this.#toastAlert("Numerator must be less than " + this.#MAXVAL);
            return false;
        }
        if (parseInt(den) >this.#MAXVAL) {
            this.#toastAlert("Denominator must be less than " + this.#MAXVAL);
            return false;
        }
        if (parseInt(num) > parseInt(den)) {
            this.#toastAlert("Fraction numerator must be less or equal to denominator");
            return false;
        }
        return true;
    }

    #toastAlert(message) {
	    currentToast = document.getElementById("toast");
	    currentToast.innerHTML = "<br>"+message+"<br><br>";
	    currentToast.className = "show";
	    toastTimeout = setTimeout(function(){ currentToast.className = 
	    	currentToast.className.replace("show", ""); }, 4000);
    }
}

