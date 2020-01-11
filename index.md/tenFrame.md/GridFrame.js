
class GridFrame {

    constructor(color, size, row, column, xpos, ypos) {
        this.color = color;
        this.s = size;
        this.row = row;
        this.column = column;
        this.xpos = xpos;
        this.ypos = ypos;
        this.stageBox = false;
        this.chipsOnGrid = 0;
        this. chipGridIndex = null;
        this.indexChipTracker = this.generateArray();
        //this.containerArray = containerArray[0][0];
    }

    generateArray() {
        let array = [];
        for (let i = 0; i < (this.row * this.column); i++) {
            array[i] = false;
        }
        return array;
    }

    drawTenContainer() {
        // initialize container and hitbox
        let box = new createjs.Container();
        box.x = this.xpos; box.y = this.ypos;

        let hitBox = new createjs.Shape();
        hitBox.graphics.beginFill("white").rect(0, 0, this.s * this.row, this.s * this.column);

        box.addChild(hitBox);

        //vertical grid lines
        for (let i = 0; i < this.row + 1; i++) {
            box.addChild(drawLine(this.color, this.s * i, 0, this.s * i, this.s * this.column));
        }
        // horizontal grid lines
        for (let i = 0; i < this.column + 1; i++) {
            box.addChild(drawLine(this.color, 0, this.s * i, this.s * this.row, this.s * i));
        }

        this.box = box;
    }

    getLocationToAddChip(type, location) {
        // Set the initial tween to selected box
        let radius = this.s / 2;
        let multiple = 2.4;
        let chipSize = this.s / multiple;
        let xTween = this.xpos - radius;
        let yTween = this.ypos + radius;
        let i = 0;
        let point;

        if (type == "click") {

            while (this.indexChipTracker[i] == true) { i++ }
            this.indexChipTracker[i] = true;

            // Current row to add chips
            let row = Math.floor(i / this.row);
            let col = i % this.row + 1;

            //console.log(chipSize / 2 * multiple * col)
            xTween += chipSize * multiple * col;
            yTween += chipSize * multiple * row;
            this.chipGridIndex = new createjs.Point(row, col);
            point = new createjs.Point(xTween, yTween);
            this.chipsOnGrid++;
            return point;

        } else if (type == "drag") {
            let row = (Math.round(location.y / (chipSize * multiple)));
            let col = (Math.round(location.x / (chipSize * multiple))) + 1;
            let index = (row * this.row) + col;

            // If already containts chip, send back null
            if (this.indexChipTracker[index - 1] == true) { return null; }
            // otherwise update index and add chip
            this.indexChipTracker[index - 1] = true

            // Current row to add chip
            xTween += location.x + chipSize * multiple;
            yTween += location.y;

            this.chipGridIndex = new createjs.Point(row, col);
            point = new createjs.Point(xTween, yTween);
            this.chipsOnGrid++;
            return point;
        }
    }

    getChipGridIndex() {
        return this.chipGridIndex;
    }

    getNumChips() {
        return this.chipsOnGrid;
    }

    getIndexSize() {
        return this.row * this.column;
    }

}