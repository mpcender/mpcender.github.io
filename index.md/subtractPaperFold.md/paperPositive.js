class PaperPositive extends Paper {
 
    #left_font_color = style.getPropertyValue("--left_blue");
    #cover_color = "#0802ff";
 
    constructor(size, x, y){
        super(size, x, y);
    }

    getColor() {
        return this.#cover_color;
    }
    
    resizePaper(size, x, y){
        super.resizePaper(size, x, y, this.#left_font_color);

        // generate new dragger
        this._nodeDragger = this.#createColumnDragger(0, this._paperSize.y, this._cRad);
        
        if (!document.getElementById("button_repartition").disabled) {
            // Restore dragger and cover state
            let newX = parseInt((this._paperSize.x/parseInt(this._xdiv))*this._fillVal);
            this._nodeDragger.x = newX;
            this._nodeDragger.cover.graphics.command.w = newX;

            // Restore fraction values
            this._frac.stageFrac.children[0].text = this._numVal;
            this._frac.stageFrac.children[2].text = parseInt(this._xdiv)*parseInt(this._ydiv);
        } else {
            
        }

        this._paper.addChild(this._nodeDragger);

        this.#buildButtons();
    }

    #buildButtons() {
        let text = "add";
        // Variable distance between plus and minus depending on length of text
        let x = -15 - (8 * text.length + 40)
        let y = -15 + (8 * text.length + 40 )
        let label = this.#generateStageRowColButton(text, 
            (this._paperSize.x*.5), (this._paperSize.y+25), x, y);

        this._displayText = label;
        this._paper.addChild(label);
    }

    #generateStageRowColButton(type, x, y, xPlus, xMinus){
        let container = new createjs.Container();
        super._generateStageRowColButton(
            container, type, x, y, 
            xPlus, xMinus, this.#left_font_color);

        container.plusHit.addEventListener("click", function(event) { 
            if (event.target.source._xdiv >= 12) {
                return;
            }

            let new_denom = (parseInt(event.target.source._xdiv)+1);
            event.target.source.updateGrid(
                new_denom,
                event.target.source._ydiv);
            
            // Reset node slider to location
            let paperSize = event.target.source._paperSize;
            let newX = parseInt((paperSize.x/new_denom)*event.target.source._fillVal);
            event.target.source._nodeDragger.x = newX;
            event.target.source._nodeDragger.cover.graphics.command.w = newX;
            // Update "Define" button numeric values
            document.getElementById("leftDen").value = parseInt(document.getElementById("leftDen").value)+1;
            // Update stage "Display" fraction values
            event.target.source._frac.stageFrac.children[2].text = new_denom;
         });
         
         container.minusHit.addEventListener("click", function(event) { 
            // Disallow minus if paper object has no dividers or if paper is filled
            if (event.target.source._xdiv <= 1 
                || (event.target.source._xdiv) <= event.target.source._fillVal) {
                return;
            } else {
                let new_denom = (parseInt(event.target.source._xdiv)-1);
                event.target.source.updateGrid(
                    new_denom,
                    event.target.source._ydiv);

                let paperSize = event.target.source._paperSize;
                let newX = parseInt((paperSize.x/new_denom)*event.target.source._fillVal);
                event.target.source._nodeDragger.x = newX;
                event.target.source._nodeDragger.cover.graphics.command.w = newX;
                // Reset numerator to zero, update denominator
                document.getElementById("leftDen").value = new_denom;

                event.target.source._frac.stageFrac.children[2].text = new_denom;
            }
         });
        return container;
    }

    /**
     * Generate grid for "Repartition" button
     * @param {*} mult 
     */
    setRow(mult){
        this._numVal = this._numVal*mult;
        this._ydiv = mult;
        this._frac.stageFrac.children[0].text = this._numVal;
        this._frac.stageFrac.children[2].text = this._ydiv*this._xdiv;

        this.updateGrid(this._xdiv, this._ydiv);
    }

    // Repartition button
    updateGrid(xdiv, ydiv) {
        PlaySound(bloopSound,.4);

        // Update global paper divider variables
        this._xdiv = xdiv;
        this._ydiv = ydiv;
        
        this._updateDividers();
    }

    // Define button behavior
    defineGrid(num, den) {
        this._xdiv = den;
        this._ydiv = 1; // Reset y dividers on manual update
        let slideTo = (this._paperSize.x/den)*num;

        // Update grid and dragger (-1 to x or y indicates do not alter)
        super.defineGrid(num, den, slideTo, -1);
    }

    resetSliders(){   
        this._nodeDragger.x = 0;
        this._nodeDragger.cover.graphics.command.w = 0;
    }

    
    #createColumnDragger(x, y, radius) {
        let node = new createjs.Shape();
        node.graphics.beginFill("purple").drawCircle(0,0, radius);
        node.alpha = .5;
        node.properties = this;

        let cover = new createjs.Shape();
        cover.graphics.beginFill(this.#cover_color).drawRect(this._lineStroke/2,this._lineStroke/2, 0, this._paperSize.y-this._lineStroke);
        cover.alpha = .25;
        this._paper.addChild(cover);
        node.cover = cover;
        node.frac = this._frac.stageFrac;
        this._nodeDraggerCover = cover;
        
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
            } else if ((evt.stageX + this.offset.x) >= evt.target.properties._paperSize.x) {
                this.x = evt.target.properties._paperSize.x;
            }
            else { 
                this.x = evt.stageX + this.offset.x;
            }
            evt.target.cover.graphics.command.w = this.x;
        });
        dragger.on("pressup", function (evt) {
            PlaySound(slideSound,.4);
            let paperSize = evt.target.properties._paperSize.x;
            let div = evt.target.properties._xdiv;
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

            evt.target.properties._fillVal = Math.round(numVal);
            evt.target.properties._numVal = Math.round(numVal)*evt.target.properties._ydiv;
            document.getElementById("leftNum").value = evt.target.properties._numVal
            evt.target.frac.children[0].text = evt.target.properties._numVal
            evt.target.frac.children[2].text = Math.round(div)*evt.target.properties._ydiv;
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
