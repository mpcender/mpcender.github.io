class PaperNegative extends Paper {
    
    #right_font_color = style.getPropertyValue("--right_red");
    #cover_color = "#ff1b1b";

    constructor(size, x, y){
        super(size, x, y);
    }

    getColor() {
        return this.#cover_color;
    }

    resizePaper(size, x, y){
        super.resizePaper(size, x, y, this.#right_font_color);

        // generate new dragger
        this._nodeDragger = this.#createRowDragger(this._paperSize.x, 0, this._cRad);
        
        if (!document.getElementById("button_repartition").disabled) {
            // Restore dragger and cover state
            let newY = parseInt((this._paperSize.y/parseInt(this._ydiv))*this._fillVal);
            this._nodeDragger.y = newY;
            this._nodeDragger.cover.graphics.command.h = newY;
            
            // Restore fraction values
            this._frac.stageFrac.children[0].text = this._numVal;
            this._frac.stageFrac.children[2].text = parseInt(this._xdiv)*parseInt(this._ydiv)
        } else {
            
        }

        this._paper.addChild(this._nodeDragger);

        this.#buildRowColButtons();
    }

    #buildRowColButtons() {
        let row = this.#generateStageRowColButton("subtract", 
            (this._paperSize.x*.5), (this._paperSize.y+25), -110, 80);
        
        this._displayText = row;
        this._paper.addChild(row);
    }

    #generateStageRowColButton(type, x, y, xPlus, xMinus){
        let container = new createjs.Container();
        super._generateStageRowColButton(
            container, type, x, y, 
            xPlus, xMinus, this.#right_font_color);

            container.plusHit.addEventListener("click", function(event) { 
            if (event.target.source._ydiv >= 12) {
                return;
            }

            let new_denom = (parseInt(event.target.source._ydiv)+1);
            event.target.source.updateGrid(
                new_denom,
                event.target.source._xdiv);

            // Reset node slider to location
            let paperSize = event.target.source._paperSize;
            let newY = parseInt((paperSize.y/new_denom)*event.target.source._fillVal);
            event.target.source._nodeDragger.y = newY;
            event.target.source._nodeDragger.cover.graphics.command.h = newY;
            // Update "Define" button numeric values
            document.getElementById("rightDen").value = parseInt(document.getElementById("rightDen").value)+1;
            // Update stage "Display" fraction values
            event.target.source._frac.stageFrac.children[2].text = new_denom;
         });
         
        container.minusHit.addEventListener("click", function(event) { 
            if (event.target.source._ydiv <= 1 
                || (event.target.source._ydiv) <= event.target.source._fillVal) {
                return;
            } else {
                let new_denom = (parseInt(event.target.source._ydiv)-1);
                event.target.source.updateGrid(
                    new_denom ,
                    event.target.source._xdiv);
                
                    let paperSize = event.target.source._paperSize;
                    let newY = parseInt((paperSize.y/new_denom)*event.target.source._fillVal);
                    event.target.source._nodeDragger.y = newY;
                    event.target.source._nodeDragger.cover.graphics.command.h = newY;
                    // Update "Define" button numeric values
                    document.getElementById("rightDen").value = new_denom;
                    // Update stage "Display" fraction values
                    event.target.source._frac.stageFrac.children[2].text = new_denom;
            }
         });
        return container;
    }
    
    /**
     * Generate grid for "Repartition" button
     * @param {*} mult 
     */
    setCol(mult){
        this._numVal = this._numVal*mult;
        this._xdiv = mult;
        this._frac.stageFrac.children[0].text = this._numVal;
        this._frac.stageFrac.children[2].text = this._ydiv*this._xdiv;

        this.updateGrid(this._ydiv, this._xdiv);
    }

    // Repartition button
    updateGrid(ydiv, xdiv) {
        PlaySound(bloopSound,.4);

        // Update global paper divider variables
        this._xdiv = xdiv;
        this._ydiv = ydiv;

        super._updateDividers();
    }

    // Define button behavior
    defineGrid(num, den) {
        this._xdiv = 1; // Reset x dividers on manual update
        this._ydiv = den;
        let slideTo = (this._paperSize.y/den)*num;

        super.defineGrid(num, den, -1, slideTo);
    }


    resetSliders(){
        this._nodeDragger.y = 0;
        this._nodeDragger.cover.graphics.command.h = 0;
    }

    #createRowDragger(x, y, radius) {
        let node = new createjs.Shape();
        node.graphics.beginFill("green").drawCircle(0,0, radius);
        node.alpha = .5;
        node.properties = this;
        
        let cover = new createjs.Shape();
        cover.graphics.beginFill(this.#cover_color).drawRect(this._lineStroke/2,this._lineStroke/2, this._paperSize.x-this._lineStroke, 0);
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
            dragger.oldY = dragger.y;
            this.parent.addChild(this);
            this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
        });
    
        dragger.on("pressmove", function (evt) {
            if (evt.stageY + this.offset.y <= 0 ){ 
                this.y = 0;
            } else if ((evt.stageY + this.offset.y) >= evt.target.properties._paperSize.y) {
                this.y = evt.target.properties._paperSize.y;
            }
            else { 
                this.y = evt.stageY + this.offset.y;
            }
            evt.target.cover.graphics.command.h = this.y;
        });
        dragger.on("pressup", function (evt) {
            PlaySound(slideSound,.4);
            let paperSize = evt.target.properties._paperSize.y;
            let div = evt.target.properties._ydiv;
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

            evt.target.properties._fillVal = Math.round(numVal);
            evt.target.properties._numVal = Math.round(numVal)*evt.target.properties._xdiv;
            document.getElementById("rightNum").value = evt.target.properties._numVal;
            evt.target.frac.children[0].text = evt.target.properties._numVal;
            evt.target.frac.children[2].text = Math.round(div)*evt.target.properties._xdiv;
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

