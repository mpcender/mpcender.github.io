class Paper { 
    // Maxium denominator value user can input
    _MAXVAL = 12;

    _paperSize;
    _displayText;
    _nodeDragger;
    _nodeDraggerCover;

    // Array to hold all (vertical & horizontal) dividers
    _grid;
    // Current numerator
    _numVal;
    // Dragger size with respect to corresponding axis 
    _fillVal;
    // Number of dividers along each axis
    _xdiv;
    _ydiv;


    _cRad = 15;
    _lineStroke = 4;
    _paper;

    _frac = {
        stageFrac: new createjs.Container()
    };

    constructor(size, x, y){
        this._paper = new createjs.Container();
        this._paperSize = size;

        this._numVal = 0;
        this._fillVal = 0;
        this._xdiv = 1;
        this._ydiv = 1;

        this._paper.x = x-(this._paperSize.x/2);
        this._paper.y = y-(this._paperSize.y/2)+bannerHeight/2;
        
    	let rect = new createjs.Shape();
        rect.graphics.setStrokeStyle(4).beginStroke(bannerBorderColor)
    		.drawRect(0,0,this._paperSize.x,this._paperSize.y);

        this._grid = [];

    	this._paper.addChild(rect, this._nodeDragger);
        stage.addChild(this._paper);
    }

    getRow() {
        return this._ydiv;
    }
    getCol() {
        return this._xdiv;
    }

    getFillVal() {
        return this._fillVal;
    }

    getValue() {
        return parseInt(this._frac.stageFrac.children[0].text) / parseInt(this._frac.stageFrac.children[2].text);
    }

    getCover() {
        return this._nodeDraggerCover;
    }
    
    getPaperSize(){
        return this._paperSize;
    }

    setFraction(){
        this.setNumerator(this._numVal);
        this.setDenominator(this._xdiv*this._ydiv);
    }

    setNumerator(num){
        this._frac.stageFrac.children[0].text = num;
        this._numVal = num;
    }

    setDenominator(den) {
        this._frac.stageFrac.children[2].text = den;
    }

    decrementNumerator(){
        this._frac.stageFrac.children[0].text = this._numVal-1;
        this._numVal = this._numVal-1;
    }

    /**
     * Allow the window to resize
     * @param {*} size 
     * @param {*} x 
     * @param {*} y 
     * @param {*} color 
     */
    resizePaper(size, x, y, color) {
        // Save fraction visibility state
        let fracOff = (this._frac.stageFrac.children.length == 0 || this._frac.stageFrac.alpha == 0);

        // Store new xy dimensions
        this._paperSize = {x: size, y: size};
        // Update container base location
        this._paper.x = x-(this._paperSize.x/2);
        this._paper.y = y-(this._paperSize.y/2)+bannerHeight/2;
        
        this._paper.removeChild(this._frac.stageFrac);
        this._frac.stageFrac._off = true;
        this.#buildFracSet( [ {n: 0, d: 1} , {n: 0, d: 1} , {n: 0, d: 1} ] , color);
        
        // Remove dragger
        this._paper.removeChild(this._nodeDraggerCover);
        this._paper.removeChild(this._nodeDragger);
        
        // Remove all current dividers
        this._grid.forEach(element => this._paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this._generateGrid(this._paperSize, this._xdiv, this._ydiv);
        this._grid = newGrid;

        this._paper.removeChild(this._displayText);
        
        this._paper.children[0].graphics.command.w = this._paperSize.x;
        this._paper.children[0].graphics.command.h = this._paperSize.y;

        if (fracOff) {
            this._frac.stageFrac.alpha = 0;
        }

        // dont attempt at add dividers for 1x1 grid
        if (this._grid.length > 1) { 
            this._grid.forEach(element => this._paper.addChild(element));
        }
    }

    #buildFracSet(n, color){
        let stageFrac = this.#buildFrac(this._paperSize.x*.5, -50, n[1].n, n[1].d, color, fontSize);
        this._frac = {stageFrac: stageFrac};
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
        this._paper.addChild(frac);
        return frac
    }

    // Generates n*n grid
    _generateGrid(paperSize, xdiv, ydiv){
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
        line.graphics.setStrokeStyle(this._lineStroke)
                .beginStroke(color)
                .moveTo(x0, y0)
                .lineTo(x1, y1).endStroke();
        return line;    
    }

    _generateStageRowColButton(container, type, x, y, xPlus, xMinus, color){
        container.x = x;
        container.y = y

        // Plus button and hit box
        let plusHit = new createjs.Shape();
        plusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xPlus,0,34,34,5,5,5,5);
        let plus =  new createjs.Shape();
	    plus.graphics.beginFill(bannerFontColor).drawRect(15,5,4,24).drawRect(5,15,24,4);
        plus.x = xPlus;
        plusHit.source = this;
        
        // Visible text
        let text = new createjs.Text(type, "32px Balsamiq Sans", color);
        text.textAlign = 'center';

        // Minus button and hit box
        let minusHit = new createjs.Shape();
        minusHit.graphics.beginFill(bannerBorderColor).drawRoundRectComplex(xMinus-5,0,34,34,5,5,5,5);
        let minus =  new createjs.Shape();
	    minus.graphics.beginFill(bannerFontColor).drawRect(0,15,24,4);
        minus.x = xMinus;
        minusHit.source = this;

        container.plusHit = plusHit;
        container.minusHit = minusHit;
        container.addChild(minusHit, minus, text, plusHit, plus);
    }

    

    /**
     * Define button behavior
     * @param {*} num 
     * @param {*} den 
     * @param {*} x     dragger location (-1 = do not alter)
     * @param {*} y     dragger location (-1 = do not alter)
     * @returns 
     */
    defineGrid(num, den, x, y) {
        PlaySound(bloopSound,.4);

        if (!this.isValidInput(num, den)) {
            return; 
        }

        this.enableInput();
        
        // Update global paper divider variables
        this._numVal = num;
        this._fillVal = num;

        this._frac.stageFrac.children[0].text = num;
        this._frac.stageFrac.children[2].text = den;

        this._nodeDragger.x = x == -1 ? this._nodeDragger.x : x;
        this._nodeDragger.cover.graphics.command.w = 
            x == -1 ? this._nodeDragger.cover.graphics.command.w : x;
        this._nodeDragger.y = y == -1 ? this._nodeDragger.y : y;
        this._nodeDragger.cover.graphics.command.h = 
            y == -1 ? this._nodeDragger.cover.graphics.command.h : y;

        this._updateDividers();
    }
    

    _updateDividers(){
        // Remove all current dividers
        this._grid.forEach(element => this._paper.removeChild(element));
        // Generate new divider objects
        let newGrid = this._generateGrid(this._paperSize, this._xdiv, this._ydiv);
        this._grid = newGrid;
        
        // dont attempt at add dividers for 1x1 grid
        if (this._grid.length > 0) { 
            // Add nsew dividers to stage
            try {
              this._grid.forEach(element => this._paper.addChild(element));
            } catch (error) {
            }
        }
    }

    toggleFraction(){
        if (this._frac.stageFrac.alpha == 0){
            this._frac.stageFrac.alpha = 1;
        }
        else if (this._frac.stageFrac.alpha == 1 && this._frac.stageFrac.scaleX == 1) {
            this._frac.stageFrac.scaleX = 1.5;
            this._frac.stageFrac.scaleY = 1.5;
            this._frac.stageFrac.y -= 25;
        } else {
            this._frac.stageFrac.alpha = 0
            this._frac.stageFrac.scaleX = 1;
            this._frac.stageFrac.scaleY = 1;
            this._frac.stageFrac.y += 25;
        } 
    }

    enableInput(){
        for (let i = 0; i < this._displayText.children.length; i++) {
            if (i==2) { continue; }
            this._displayText.children[i].alpha = 1;
        }
        this._nodeDragger.children[0].alpha = .5
    }

    disableInput(){
        for (let i = 0; i < this._displayText.children.length; i++) {
            // Skip "text"
            if (i==2) { continue; }
            this._displayText.children[i].alpha = 0;
        }
        this._nodeDragger.children[0].alpha = 0
    }

    isValidInput(num, den){
        if (parseInt(num) > this._MAXVAL) {
            this.#toastAlert("Numerator must be less than " + this._MAXVAL);
            return false;
        }
        if (parseInt(den) > this._MAXVAL) {
            this.#toastAlert("Denominator must be less than " + this._MAXVAL);
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