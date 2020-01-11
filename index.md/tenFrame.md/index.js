
//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *                                      Variables
 */
//////////////////////////////////////////////////////////////////////////////////////////////////

// variables for resizing canvas and stage
let canvas, stage, holder;
let maxCanvas = 900;
let minCanvas = 400;
let textSize;
let stageHit;
let chipStorage;

// Modify the y translation of the divider line
let dividerLocation;

// Stage re-draw control variables
let update = false;
let tweenRunningCount = 0;
let isMenuChipButton = false;

// Shape object tween controll
var xTween;
var yTween;

// stage button
var textButton

// Pop up box button
let boxButtonSelection;
let boxGrid5, boxGrid10, boxGrid20, boxGrid100;
let notButton;

// Selected Grid
let currentlySelected = null;
let copyObjectStorage = null;
let multiKeyFirstIn = null;
let innerSelected = null;

// Selected chip
let currentlySelectedChip;
let chipsOnBoard = [];
let addChipToGridChec = false;
let chipMultiDragger;

// If chip being moved disable selector box
let stageObjectDragging = true;

// 
let stageSelectorBox;
let oldPt;
let origPt;
let color;
let stroke;



/**
 * @TODO 
 * 
 * 1302 Fix xy check to make sure chip is moved out of gridFrame
 * 
 * selector dragger box groups objects (Chips) and drags as one.
 *  1280 add chip to dragger on select
 *  151 Dragger box
 * 
 * Key input (Copy,Paste,Delete) broken on certain cases (DEBUG)
 * 
 * Chip stage boundary check
 * 
 * CLICK hold on gridBox to perform some action??
 *      resize grid?
 *    
 * ////////////////////////////////////////////////////
 *                  ROUGH PATCHES
 *              Currently working but 
 *                 could be better  
 * /////////////////////////////////////////////////////
 * 
 * 1361 DIABLED GRID INNER SELECT TWEEN until fixed (next line)
 * 1328 - When innerGridSelector recieves tween, increment next tween to the
 * next available grid
 * 
 * 721 Clone event on rotated grid incorrectly attaches new chips. 
 * hotfix applied to disable clone unless grid is not rotated
 * 
 */


//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *                                      Main function
 */
//////////////////////////////////////////////////////////////////////////////////////////////////

function init() {
    /*
    CREATE STAGE & Set Properties
    */
    stage = new createjs.Stage("demoCanvas");
    holder = stage.addChild(new createjs.Container());
    canvas = document.getElementById("demoCanvas");
    chipStorage = new createjs.Container();



    // Allows various keyboard inputs for object manipulation
    document.addEventListener('keydown', enableMultiKeyEvents);

    // Set canvas size and create size control variables
    resize();
    dividerLocation = ((canvas.height * .9));
    textSize = (canvas.height * .022);

    // For mobile devices.
    createjs.Touch.enable(stage);
    //stage.autoClear = false;

    // to get onMouseOver & onMouseOut events, we need to enable them on the stage:
    stage.enableMouseOver();

    // this lets our drag continue to track the mouse even when it leaves the canvas:
    // play with commenting this out to see the difference.
    stage.mouseMoveOutside = true;

    // When shape selected, tween to cursor location on stage
    //stage.on("click", checkSelected);

    // Create container to keep track of shapes on stage
    drawChipStageContainer();



    // Draw line
    drawStageLines();

    // Draw UI buttons
    createButtonWorkspace();

    // currently unused multi dragger for chips
    chipMultiDragger = new createjs.Container();
    draggerHandler(chipMultiDragger);
    chipStorage.addChild(chipMultiDragger);

    currentlySelected = null;
    update = true;
}



//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *                                  Methods and functions
 */
//////////////////////////////////////////////////////////////////////////////////////////////////

function draggerHandler(dragger) {
    dragger.on("mousedown", function (evt) {
        dragger.oldX = dragger.x;
        dragger.oldY = dragger.y;
        this.parent.addChild(this);
        this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
        update = true;
    });

    dragger.on("pressmove", function (evt) {
        //if (draggerSmall.onTheMove)
        //	return;
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;
        // indicate that the stage should be updated on the next tick:
        resizeShape(evt);
        update = true;
    });
}


function drawChipStageContainer() {
    stageHit = new createjs.Shape();
    stageHit.graphics.beginFill("gray").rect(canvas.width * .072, 0,
        canvas.width - canvas.width * .072, canvas.height - (canvas.height - dividerLocation));
    stageHit.alpha = .1
    chipStorage.addChild(stageHit)
    stage.addChild(chipStorage)

    stageHit.on("click", handleStageClick);
    stageHit.addEventListener("mousedown", handleStageMouseDown);
    stageHit.addEventListener("pressup", handleStageMouseUp);
}

/**
 * Resize the canvas to fit window
 * maxCanvas and minCanvas variable controll size
 */
function resize() {
    // Draw canvas as the size of the window (Scale by height)
    if (window.innerHeight > maxCanvas) {
        canvas.width = maxCanvas * 1.4;
        canvas.height = maxCanvas;
    } else if (window.innerHeight <= minCanvas) {
        canvas.width = minCanvas * 1.4
        canvas.height = minCanvas;
    } else {
        canvas.width = (window.innerHeight * 1.4 - 35);
        canvas.height = (window.innerHeight - 25);
    }
}

/**
 * Draw a grid container and create grid object
 *      "mousedown" event: allow drag movement of object
 *      "click" event: select object and store grid object as global var
 *      "mouseover" event: Show opaque selector for individual grid field
 *      "mouseout" event: Make selector invisible
 */
function drawTenContainer(color, size, row, column, xpos, ypos) {
    // create constrained proportion for container
    let s = size * canvas.width * .01;

    // Create new GridFram Object
    let newGrid = new GridFrame(color, s, row, column, xpos, ypos);
    newGrid.drawTenContainer();
    if (notButton) {
        checkBounds(newGrid, s, row, column, xpos, ypos);
    }
    let box = newGrid.box;
    box.grid = newGrid;

    // allow drag movement of object 
    box.on("mousedown", function (evt) {
        // if tween is running disable
        if (tweenRunningCount > 0) { return }
        if (textButton.children[1].text == "Move Chips") { return }

        // Stop selector box from displaying when moving object
        box.oldX = box.x;
        box.oldY = box.y;
        this.parent.addChild(this);
        this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
        update = true;
    });

    // select object and store grid object as global var
    box.on("click", function (evt) {
        // if tween is running disable
        if (tweenRunningCount > 0) { return }
        if (textButton.children[1].text == "Move Chips") { return }

        // check if grid has moved and is on stage
        if (Math.abs(box.oldX - box.x) < 5 && Math.abs(box.oldY - box.y) < 5
            && box.grid.stageBox) {
            // if not selected then select, else de-select
            if (box.alpha != 1) {
                updateObjectSelected(box, true);
            } else {
                updateObjectSelected(box, false);
            }
        }

    });

    // Create a square the size of one field on the grid
    let gridInnerSelect = new createjs.Shape();
    // scale size of square to specific GridFrame object
    gridInnerSelect.graphics.beginFill("#4287f5").rect(0, 0, s, s);
    // add as child to gridBox and set to invisible
    box.addChild(gridInnerSelect);
    gridInnerSelect.alpha = 0;
    gridInnerSelect.on("click", function (evt) {
        innerSelected = new createjs.Point(gridInnerSelect.x, gridInnerSelect.y);
    });

    //  On mouseover GridFrame object move square to current grid field
    box.on('mouseover', function (evt) {
        // if tween is running disable
        if (tweenRunningCount > 0) { return }

        let xLoc = null;
        let yLoc = null;
        if (newGrid.stageBox) {

            // IF box rotation horizontal
            if (box.rotation % 180 == 0) {
                // xLoc & yLoc determine current ROW and COLUMN value 
                xLoc = Math.floor(Math.abs(evt.stageX - evt.currentTarget.x) / s);
                yLoc = Math.floor(Math.abs(evt.stageY - evt.currentTarget.y) / s);
                // Fixes selector square moving outside GridFrame on edges
                if (yLoc == newGrid.column) { yLoc -= 1; }
                if (xLoc == newGrid.row) { xLoc -= 1; }
            } else {
                // xLoc & yLoc determine current ROW and COLUMN value 
                yLoc = Math.floor(Math.abs(evt.stageX - evt.currentTarget.x) / s);
                xLoc = Math.floor(Math.abs(evt.stageY - evt.currentTarget.y) / s);
                // Fixes selector square moving outside GridFrame on edges
                if (yLoc == newGrid.row) { yLoc -= 1; }
                if (xLoc == newGrid.column) { xLoc -= 1; }
            }
            // Set selector square XY position to ROW & COLUMN times grid size
            gridInnerSelect.x = (s * xLoc);
            gridInnerSelect.y = (s * yLoc);
            // Make visible & Update changes
            gridInnerSelect.alpha = .5;
            stage.update();

        }
    });

    // On mouseout of GridFrame make grid selector square invisible
    box.on('mouseout', function (evt) {
        gridInnerSelect.alpha = 0;
    });

    // Applies default stage boundary check restraints to GridFrame
    gridPressmoveHandler(newGrid, s, row, column);

    // New object is automatically made currentSelected
    updateChipBoardStatus(newGrid.box)
    if (!notButton) {
        newGrid.box.alpha = 1;
    }

    return newGrid
}

/**
 * Helper method to update graphical representation of currentlySelected
 */
function updateObjectSelected(box, isSelected) {
    let compareTemp = currentlySelected;
    if (currentlySelected != null && isSelected == false) {
        // Outside Shadow
        currentlySelected.box.children[0].shadow = null;
        // Remove from currently selected
        currentlySelected = null;
    }
    if (compareTemp == null || compareTemp != box.grid && isSelected == true) {
        currentlySelected = box.grid;
        // Outside Shadow
        box.children[0].shadow = new createjs.Shadow("#4287f5", 0, 0, 30);
        // Outside & Inside Shadow
        // box.shadow = new createjs.Shadow("#4287f5", 0, 0, 10);

        update = true;
    }
}

// Ensure GridFrame box does NOT exit the boundaries of the stage
function checkBounds(newGrid, s, row, column, xpos, ypos) {
    let grid = newGrid.box;
    let c = 3;
    if ((grid.x < (canvas.height * .1)) && grid.y < 0) {
        grid.x = (canvas.height * .1) + (c * .8);
        grid.y = c;
    }
    //Top Right Corner
    else if ((grid.x + (s * row)) >= canvas.width && grid.y < 0) {
        grid.x = canvas.width - (s * row) - c;
        grid.y = c;
    }
    //Bottom Left Corner
    else if ((grid.x < (canvas.height * .1)) && ((grid.y + (s * column)) > (dividerLocation))) {
        grid.x = (canvas.height * .1) + (c * .8);
        grid.y = dividerLocation - (s * column) - (c * .8);
    }
    //Bottom Right
    else if ((grid.x + (s * row)) >= canvas.width && ((grid.y + (s * column)) > (dividerLocation))) {
        grid.x = canvas.width - (s * row) - c;
        grid.y = dividerLocation - (s * column) - (c * .8);
    }
    // wall check
    // Left Wall
    else if ((grid.x < (canvas.height * .1))) {
        grid.x = (canvas.height * .1) + (c * .8);
    }
    // Right Wall
    else if ((grid.x + (s * row)) >= canvas.width) {
        grid.x = canvas.width - (s * row) - c;
    }
    // Top Wall 
    else if (grid.y < 0) {
        grid.y = c;
    }
    // Bottom Wall
    else if ((grid.y + (s * column)) > (dividerLocation)) {
        grid.y = dividerLocation - (s * column) - (c * .8);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//                                       STAGE SETUP
//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Basic helper method for drawing a line on th stage
 */
function drawLine(color, xinit, yinit, xfin, yfin) {
    let line = new createjs.Shape();
    line.graphics.setStrokeStyle(2).beginStroke(color);
    // Line to divide stage in half
    line.graphics.moveTo(xinit, yinit).lineTo(xfin, yfin);
    return line;
}

/**
 * Draws the overall border and seperation lines for the canvas
 */
function drawStageLines() {
    // Draw Bottom fill shape
    let shapeBottom = new createjs.Shape();
    shapeBottom.graphics.beginFill("#4287f5").rect(canvas.width * (-23.1 / 900),
        canvas.width * (-23.1 / 900), canvas.width * (.997), canvas.height * (.097));
    shapeBottom.y = canvas.height * .937
    shapeBottom.x = canvas.width * .0275
    stage.addChild(shapeBottom);

    // Draw Side Fill Shape
    let shapeLeft = new createjs.Shape();
    let x = y = canvas.width * (-23.1 / 900);
    let w = canvas.width * (.069)
    let h = canvas.height * (.09)
    for (let i = 0; i < 7; i++) {
        shapeLeft.graphics.beginFill("#e0e0e0").rect(x, y, w, h);
        shapeLeft.y = canvas.height * .038
        shapeLeft.x = canvas.width * .027
        stage.addChild(shapeLeft);
        y += canvas.height * .095
    }
    shapeLeft.graphics.beginFill("#e0e0e0").rect(x, y, w, h * 2.6);
    shapeLeft.y = canvas.height * .038
    shapeLeft.x = canvas.width * .027
    stage.addChild(shapeLeft);

    // Draw divider line on horizontal plane
    let dividerLineHoriz = new createjs.Shape();
    dividerLineHoriz.graphics.beginStroke("black");
    // Line to divide stage in half
    dividerLineHoriz.graphics.moveTo(0, dividerLocation).lineTo(
        canvas.width, dividerLocation);
    // Draw Border Lines
    dividerLineHoriz.graphics.moveTo(1, 1).lineTo(1, canvas.height - 1).
        lineTo(canvas.width - 1, canvas.height - 1).lineTo(canvas.width - 1, 1).lineTo(-1, 1);
    stage.addChild(dividerLineHoriz);

    // Draw divider line on vertical plane
    let dividerLineVert = new createjs.Shape();
    dividerLineVert.graphics.beginStroke("black");
    // Line to divide stage in half
    dividerLineVert.graphics.moveTo((canvas.height * .1), 0).lineTo(
        (canvas.height * .1), canvas.height - (canvas.height * .1));
    // Draw Border Lines
    dividerLineVert.graphics.moveTo(1, 1).lineTo(1, canvas.height - 1).
        lineTo(canvas.width - 1, canvas.height - 1).lineTo(canvas.width - 1, 1).lineTo(-1, 1);
    stage.addChild(dividerLineVert);
}

/**
 * Draw out the UI on the stage
 */
function createButtonWorkspace() {

    // LEFT MENU

    // Draw LEFT Button for grid selection
    boxButtonSelection = drawBoxButtonSelectionContainer();
    stage.addChild(boxButtonSelection);
    notButton = false;
    let boxButtonGrid = drawTenContainer("black", 1, 5, 2, canvas.width * .012, canvas.width * .024);
    gridMenuPopupHandler(boxButtonGrid);
    stage.addChild(boxButtonGrid.box);
    notButton = true;

    // Draw Blue Chip Buttons
    chipBlue1 = drawChipButton("#4287f5", 1, canvas.width * (20 / 900));
    chipBlue1.x = canvas.width * .036; chipBlue1.y = canvas.height * .142;
    chipBlue5 = drawChipButton("#4287f5", 5, canvas.width * (15 / 900));
    chipBlue5.x = canvas.width * .028; chipBlue5.y = canvas.height * .25;
    chipBlue10 = drawChipButton("#4287f5", 10, canvas.width * (12 / 900));
    chipBlue10.x = canvas.width * .02; chipBlue10.y = canvas.height * .345;
    applyChipButtonHandlers(chipBlue1);
    applyChipButtonHandlers(chipBlue5);
    applyChipButtonHandlers(chipBlue10);
    // Draw Red Chip Buttons
    chipRed1 = drawChipButton("#bd2b35", 1, canvas.width * (20 / 900));
    chipRed1.x = canvas.width * .036; chipRed1.y = canvas.height * .428;
    chipRed5 = drawChipButton("#bd2b35", 5, canvas.width * (15 / 900));
    chipRed5.x = canvas.width * .028; chipRed5.y = canvas.height * .535;
    chipRed10 = drawChipButton("#bd2b35", 10, canvas.width * (12 / 900));
    chipRed10.x = canvas.width * .02; chipRed10.y = canvas.height * .63;
    applyChipButtonHandlers(chipRed1);
    applyChipButtonHandlers(chipRed5);
    applyChipButtonHandlers(chipRed10);

    // Add chip buttons to stage
    stage.addChild(chipBlue1, chipBlue5, chipBlue10, chipRed1, chipRed5, chipRed10);

    // BOTTOM MENU

    // Button to clear workspace
    var clearButton = createButton("CLEAR", canvas.width * (.12), canvas.height * (.9));
    stage.addChild(clearButton);
    clearButton.on("click", clearWorkspace);

    // Button to rotate selected object
    var rotateGridButton = createButton("Rotate", canvas.width * (.28), canvas.height * (.9));
    stage.addChild(rotateGridButton);
    rotateGridButton.on("click", rotateGrid);

    // Button to copy selected object
    var cloneButton = createButton("Clone", canvas.width * (.44), canvas.height * (.9));
    stage.addChild(cloneButton);
    cloneButton.on("click", cloneEvent);

    // Button to create text box
    textButton = createButton("Move Grid", canvas.width * (.6), canvas.height * (.9));
    createButton()
    stage.addChild(textButton);
    textButton.on("click", function docs() {
        stageObjectDragging = !stageObjectDragging
        //console.log(textButton.children[1].text)
        let newText;
        if (textButton.children[1].text == "Move Grid")
            newText = createButton("Move Chips", canvas.width * (.6), canvas.height * (.9));
        if (textButton.children[1].text == "Move Chips")
            newText = createButton("Move Grid", canvas.width * (.6), canvas.height * (.9));
        textButton = newText
        stage.addChild(textButton);
    });


    // Button to delete selected object
    var deleteButton = createButton("Delete", canvas.width * (.76), canvas.height * (.9));
    stage.addChild(deleteButton);
    deleteButton.on("click", deleteEvent);
    createjs.Ticker.setFPS(20);
    createjs.Ticker.addEventListener("tick", stage);
}

/**
 * Create buttons
 */
function createButton(text, x, y) {
    var buttonBackground = new createjs.Shape();
    buttonBackground.name = text;
    buttonBackground.graphics.beginFill("black").drawRoundRect(0, 0, canvas.width * (13 / 100),
        canvas.width * (1 / 22), canvas.width * (1 / 100));
    var textSize = canvas.width * (1 / 50);

    var label = new createjs.Text(text, "bold " + textSize + "px Arial", "#FFFFFF");
    label.textAlign = "center";
    label.textBaseline = "middle";
    label.x = canvas.width * (13 / 100) / 2;
    label.y = canvas.width * (1 / 22) / 2;

    var button = new createjs.Container();
    button.x = canvas.width * (1 / 90) + x;
    button.y = canvas.width * (1 / 90) + y;
    button.addChild(buttonBackground, label);

    return button;
}

/**
 * Creates pop out menu for selecting a grid container from UI
 *      Draw popup box
 *      Draw all text identifiers
 *      Draw and initialize unique initial GridFrame Objects
 */
function drawBoxButtonSelectionContainer() {
    // num of pixels off the top main stage line the frame is
    let float = 5;

    let containerSelection = new createjs.Container();
    let line = new createjs.Shape();
    let menuFill = new createjs.Shape();

    // Draw line for actual container bounds
    line.graphics.setStrokeStyle(1).beginStroke("black");
    line.graphics.moveTo(canvas.height * .105, float).lineTo(canvas.width * .4, float)
        .lineTo(canvas.width * .4, canvas.height * .5).lineTo(canvas.height * .105, canvas.height * .5)
        .lineTo(canvas.height * .105, float).moveTo(canvas.height * .105, canvas.height * .05)
        .lineTo(canvas.width * .4, canvas.height * .05);
    containerSelection.addChild(line);

    // Make menu top blue
    menuFill.graphics.beginFill("#4287f5").rect(canvas.height * .105, float, canvas.width * .325, canvas.height * (.0438));
    containerSelection.addChild(menuFill);
    // Fill bottom While
    menuFill.graphics.beginFill("white").rect(canvas.height * .106, canvas.height * .051, canvas.width * .3228, canvas.height * (.448));
    containerSelection.addChild(menuFill);
    // Banner Text
    var text = drawTextAt("Choose a Frame", textSize + "px Arial", "white", canvas.width * .175, canvas.height * .02);
    containerSelection.addChild(text);
    // Cancel Menu button (hides menu)
    var textCancel = drawTextAt("Cancel", textSize + "px Courier", "white", canvas.width * .34, canvas.height * .018);
    textCancel.hitArea = createHitBox(canvas.width * .06, canvas.height * .018);
    textCancel.on("click", function (evt) {
        boxButtonSelection.alpha = 0;
    });
    containerSelection.addChild(textCancel);

    // Draw grid selection Buttons for container
    var text5 = drawTextAt("5", "bold " + textSize + "px Arial", "#4287f5", canvas.width * .15, canvas.height * .09);
    boxGrid5 = drawTenContainer("black", 1.2, 5, 1, canvas.width * .2, canvas.height * .09);
    gridFrameButtonHandler(boxGrid5.box, 5, 1);

    var text10 = drawTextAt("10", "bold " + textSize + "px Arial", "#4287f5", canvas.width * .15, canvas.height * .145);
    boxGrid10 = drawTenContainer("black", 1.2, 5, 2, canvas.width * .2, canvas.height * .145);
    gridFrameButtonHandler(boxGrid10.box, 5, 2);

    var text20 = drawTextAt("20", "bold " + textSize + "px Arial", "#4287f5", canvas.width * .15, canvas.height * .22);
    boxGrid20 = drawTenContainer("black", 1.2, 10, 2, canvas.width * .2, canvas.height * .22);
    gridFrameButtonHandler(boxGrid20.box, 10, 2);

    var text100 = drawTextAt("100", "bold " + textSize + "px Arial", "#4287f5", canvas.width * .15, canvas.height * .295);
    boxGrid100 = drawTenContainer("black", 1.2, 10, 10, canvas.width * .2, canvas.height * .295);
    gridFrameButtonHandler(boxGrid100.box, 10, 10);

    // Resize on move
    gridPressmoveHandler(boxGrid5, 1 * canvas.width * .01, 5, 1);
    gridPressmoveHandler(boxGrid10, 1 * canvas.width * .01, 5, 2);
    gridPressmoveHandler(boxGrid20, 1 * canvas.width * .01, 10, 2);
    gridPressmoveHandler(boxGrid100, 1 * canvas.width * .01, 10, 10);

    containerSelection.addChild(text5, text10, text20, text100);
    containerSelection.addChild(boxGrid5.box, boxGrid10.box, boxGrid20.box, boxGrid100.box);

    // Set to invisible initially
    containerSelection.alpha = 0;

    return containerSelection;

    // Helper methods for drawBoxButtonSelectionContainer()
    function drawTextAt(displayText, font, color, x, y) {
        var text = new createjs.Text(displayText, font, color);
        text.x = x; text.y = y;
        return text;
    }
    // Draw hitBox for 'Cancel' Text on popup
    function createHitBox(length, width) {
        var hitBox = new createjs.Shape();
        hitBox.graphics.beginFill("black").drawRect(0, 0, length, width);
        return hitBox;
    }
}

// Draws chip button for left menu
function drawChipButton(color, num, size) {
    let shape = new createjs.Shape();
    let shapeContainer = new createjs.Container();

    let xTran = yTran = 0;
    let loc;
    for (let i = 0; i < num; i++) {
        if (i > 4) {
            loc = ((i - 5) * canvas.width * (4 / 900))
            shape.graphics.setStrokeStyle(2).beginStroke("white").
                beginFill(color).drawCircle(xTran + loc + canvas.width * (15 / 900),
                    yTran - loc, size);
        } else {
            loc = (i * canvas.width * (4 / 900))
            shape.graphics.setStrokeStyle(2).beginStroke("white").
                beginFill(color).drawCircle(xTran + loc, yTran - loc,
                    size);
        }
        shapeContainer.addChild(shape);
    }
    shapeContainer.numChild = num;
    shapeContainer.isBoardChip = false;
    shapeContainer.onTheMove = false;

    return shapeContainer;
}

// Takes button input and Draws chip objects for stage
function copyChipButton(color, num, size, xPos, yPos) {
    let shape = new createjs.Shape();
    let shapeContainer = new createjs.Container();

    let xTran = yTran = 0;
    let loc;
    for (let i = 0; i < num; i++) {
        if (i > 4) {
            loc = ((i - 5) * canvas.width * (4 / 900))
            shape.graphics.setStrokeStyle(2).beginStroke("white").
                beginFill(color).drawCircle(xTran + loc + canvas.width * (15 / 900),
                    yTran - loc, size);
        } else {
            loc = (i * canvas.width * (4 / 900))
            shape.graphics.setStrokeStyle(2).beginStroke("white").
                beginFill(color).drawCircle(xTran + loc, yTran - loc,
                    size);
        }
        shapeContainer.addChild(shape);
    }

    shapeContainer.x = xPos;
    shapeContainer.y = yPos;
    shapeContainer.isBoardChip = true;
    shapeContainer.isGridChip = false;
    shapeContainer.chipSelected = false;
    applyChipButtonHandlers(shapeContainer);

    return shapeContainer;
}


//////////////////////////////////////////////////////////////////////////////////////////////////
//                                   EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////////////////////////

//             -------------------  MAIN STAGE EVENTS -------------------

/**
 * Keyboard event listener method
 * SINGLE KEY INPUT: 
 *      Enable 'DELETE' & 'BACKSPACE' to delete currently selected object
 * MULTI-KEY INPUT: 
 *      Enable 'CTRL+C' & 'CTRL+V' (copy / paste) functionality
 */
function enableMultiKeyEvents(evt) {
    if (evt.defaultPrevented) {
        return;
    }
    // Get current key being pressed
    var key = evt.key || evt.keyCode;

    // If first key being pressed, set init key input
    if (multiKeyFirstIn == null) {
        multiKeyFirstIn = key;
    }

    // SINGLE KEY INPUTS
    // Delete and backspace remove currently selected objects
    if (multiKeyFirstIn == 'Delete' || multiKeyFirstIn == 46) {
        deleteEvent();
    } if (multiKeyFirstIn == 'Backspace' || multiKeyFirstIn == 8) {
        deleteEvent();
    }

    //MULTI-KEY INPUTS
    // Copy and Paste currently selected objects
    if (multiKeyFirstIn == 'Control' && key == 'c') {
        copyObject();
    }
    if (multiKeyFirstIn == 'Control' && key == 'v') {
        pasteObject();
    }

}

// Helper method to store copy of current object
//      Method use:  enableMultiKeyEvents(), cloneEvent()
function copyObject() {
    copyObjectStorage = currentlySelected;
    multiKeyFirstIn = null;
}

// Helper method to put clone of current object on stage
//      Method use:  enableMultiKeyEvents(), cloneEvent()
function pasteObject() {
    let c = copyObjectStorage;
    let size = c.s / canvas.width / .01;
    let copyGrid = null;


    // Only Allow clone if object is rotated normally
    // (THIS IS A ROUGH PATCH TO FIX CHIP MISPLACEMENT ON CLONE ROTATED GRID)
    if ((copyObjectStorage.box.rotation % 360) != 0) {
        window.alert("Clone cannot complete\n\nPlease rotate the grid " +
            ((360 - copyObjectStorage.box.rotation) / 90) + " times, back to default rotation");
        return
    }



    // if box vertical rotation
    if (copyObjectStorage.box.rotation % 180) {
        copyGrid = drawTenContainer(c.color, size, c.row,
            c.column, c.box.x + (c.s * c.row + c.s), c.box.y);
        //copyGrid.box.rotation = copyObjectStorage.box.rotation;
    }
    // if box horizontal rotation
    else {
        copyGrid = drawTenContainer(c.color, size, c.row,
            c.column, c.box.x, c.box.y + (c.s * c.column + c.s));
    }


    // Duplicate chips in grid to be copied
    let newChip = null;
    // Check if grid being copied has any chips
    if (c.box.children[c.box.children.length - 1].children != undefined) {
        let length = c.box.children.length - 1;
        let numChips = length - c.chipsOnGrid;
        let oldChip = null;
        // draw new duplicate chips, update location, and add to grid
        for (i = length; i > numChips; i--) {
            oldChip = c.box.children[i].children[0].graphics
            newChip = drawChipButton(oldChip._fill.style, 1, oldChip.command.radius)
            newChip.gridLocation = c.box.children[i].gridLocation;
            newChip.isBoardChip = true;
            applyGridChipButtonHandlers(newChip);
            newChip.x = c.box.children[i].x;
            newChip.y = c.box.children[i].y;
            copyGrid.box.addChild(newChip)
        }
    }
    // Update grid variables for tracking chips on grid
    for (i = 0; i < copyObjectStorage.indexChipTracker.length; i++) {
        copyGrid.indexChipTracker[i] = copyObjectStorage.indexChipTracker[i]
        if (copyGrid.indexChipTracker[i]) { copyGrid.chipsOnGrid++ }
    }

    // Add new grid to stage
    chipStorage.addChild(copyGrid.box);
    copyGrid.stageBox = true;
    update = true;
    multiKeyFirstIn = null;
}

/**
 * Handler for moving grid shapes on stage
 */
function gridPressmoveHandler(Grid, s, row, column) {
    let object = Grid.box;

    object.on("pressmove", function (evt) {

        if (textButton.children[1].text == "Move Chips") { return }

        // if tween is running diable listener
        if (tweenRunningCount > 0) { return }

        // Declare scalar variables
        let c = 3;
        let sRow = s * row;
        let sCol = s * column;
        let leftAdj = rightAdj = TopAdj = BotAdj = 0;

        // Change scalar variables depending on rotation orientation
        if (object.rotation == 0) {
            leftAdj = rightAdj = TopAdj = BotAdj = 0;
        } else if (object.rotation == 90) {
            leftAdj = s * column;
            BotAdj = -((s * row) - (s * column));
            rightAdj = s * row;
        } else if (object.rotation == 180) {
            TopAdj = s * column;
            BotAdj = s * column;
            leftAdj = s * row;
            rightAdj = s * row;
        } else if (object.rotation == 270) {
            TopAdj = s * row;
            BotAdj = s * column;
            rightAdj = ((s * row) - (s * column));
            leftAdj = 0;
        } else if (object.rotation == 360) {
            TopAdj = 0;
            leftAdj = rightAdj = BotAdj = 0;
        }

        object.grid.xpos = this.x;
        object.grid.ypos = this.y;

        // Check stage boundaries
        if ((this.x >= (canvas.height * .1)) && (this.x + sRow - rightAdj) <= canvas.width
            && this.y > 0 && (this.y + sCol - BotAdj) < (dividerLocation)) {
            this.x = object.grid.xpos = evt.stageX + this.offset.x;
            this.y = object.grid.ypos = evt.stageY + this.offset.y;

            // corner check
            // Top Left Corner
            if ((this.x < (canvas.height * .1) + leftAdj) && this.y - TopAdj < 0) {
                this.x = object.grid.xpos = (canvas.height * .1) + (c * .8) + leftAdj;
                this.y = object.grid.ypos = c + TopAdj;
            }
            //Top Right Corner
            else if ((this.x + sRow - rightAdj) >= canvas.width && this.y - TopAdj < 0) {
                this.x = object.grid.xpos = canvas.width - sRow - c + rightAdj;
                this.y = object.grid.ypos = c + TopAdj;
            }
            //Bottom Left Corner
            else if ((this.x < ((canvas.height * .1) + leftAdj)) && ((this.y +
                sCol - BotAdj) > (dividerLocation))) {
                this.x = object.grid.xpos = (canvas.height * .1) + (c * .8) + leftAdj;
                this.y = object.grid.ypos = dividerLocation - sCol - (c * .8) + BotAdj;
            }
            //Bottom Right
            else if ((this.x + sRow - rightAdj) >= canvas.width &&
                ((this.y + sCol - BotAdj) > (dividerLocation))) {
                this.x = object.grid.xpos = canvas.width - sRow - c + rightAdj;
                this.y = object.grid.ypos = dividerLocation - sCol - (c * .8) + BotAdj;
            }
            // wall check
            // Left Wall
            else if ((this.x < (canvas.height * .1) + leftAdj)) {
                this.x = object.grid.xpos = (canvas.height * .1) + (c * .8) + leftAdj;
            }
            // Right Wall
            else if ((this.x + sRow - rightAdj) >= canvas.width) {
                this.x = object.grid.xpos = canvas.width - sRow - c + rightAdj;
            }
            // Top Wall 
            else if (this.y - TopAdj < 0) {
                this.y = object.grid.ypos = c + TopAdj;
            }
            // Bottom Wall

            else if ((this.y + sCol - BotAdj) > (dividerLocation)) {
                this.y = object.grid.ypos = dividerLocation - sCol - (c * .8) + BotAdj;
            }
        }

        // indicate that the stage should be updated on the next tick:
        //resizeShape(evt);
        update = true;
    });
}

/* DRAW BOX EVENT HANDLERS
*/
function handleStageClick(evt) {
    //console.log("clicked")
}

function handleStageMouseDown(event) {
    // if tween is running disable
    if (tweenRunningCount > 0) { return }

    color = "black";
    stroke = canvas.width * (2.5 / 900);
    oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
    origPt = oldPt.clone();
    stageHit.addEventListener("pressmove", handleStageMouseMove);
}

function handleStageMouseMove(event) {
    // if tween is running disable
    if (tweenRunningCount > 0) { return }

    if (Math.abs(stage.mouseX - origPt.x) < 5 ||
        Math.abs(stage.mouseY - origPt.y) < 5) { return; }

    // return if start drawing on menu bars
    if (stage.mouseX < canvas.width * .072 ||
        stage.mouseY > dividerLocation) { return; }

    // Remove previous 
    stage.removeChild(stageSelectorBox)
    let shape = new createjs.Shape();
    shape.graphics.setStrokeDash([stroke * 2, stroke]).
        beginStroke(color).rect(oldPt.x, oldPt.y,
            stage.mouseX - oldPt.x, stage.mouseY - oldPt.y);
    // Store box
    stageSelectorBox = shape;
    stage.addChild(stageSelectorBox);

    update = true;
}

function handleStageMouseUp(event) {

    if (stageSelectorBox != undefined) {
        let shapeX, shapeY, selectXL, selectXR, selectYT, selectYB = 0;
        selectXL = stageSelectorBox.graphics.command.x;
        selectXR = selectXL + stageSelectorBox.graphics.command.w;
        selectYT = stageSelectorBox.graphics.command.y;
        selectYB = selectYT + stageSelectorBox.graphics.command.h;

        // If selector is drawn inverted adjust variables
        if (stageSelectorBox.graphics.command.w < 0) {
            selectXL = selectXR
            selectXR = stageSelectorBox.graphics.command.x;
        }
        if (stageSelectorBox.graphics.command.h < 0) {
            selectYT = selectYB
            selectYB = stageSelectorBox.graphics.command.y;
        }

        for (i = 0; i < chipStorage.children.length; i++) {
            // set boundary check for selector
            shapeX = chipStorage.children[i].x; shapeY = chipStorage.children[i].y;

            if (shapeX > selectXL && shapeX < selectXR &&
                shapeY > selectYT && shapeY < selectYB) {
                // Toggle selected state
                updateChipBoardStatus(chipStorage.children[i]);

            }
        }
        stage.removeEventListener("mousemove", handleStageMouseMove);
        stage.removeChild(stageSelectorBox)
        //stageSelectorBox = null;
    }

}

//             ------------------- BOTTOM MENU BUTTONS -------------------
/**
 * Handler for Re-draw stage to init state
 */
function clearWorkspace(evt) {
    if (tweenRunningCount > 0) { return }
    // Remove all children a restart init main method
    stage.removeAllChildren();
    chipsOnBoard = [];
    stageObjectDragging = false;
    currentlySelected = null;
    copyObjectStorage = null;
    multiKeyFirstIn = null;
    init();
}

/**
 * Rotates and re-centers a GridFrame Object
 */
function rotateGrid(evt) {

    if (tweenRunningCount > 0) { return }
    // If rotation 360 revert rotation to zero
    if (currentlySelected.box.rotation == 360) {
        currentlySelected.box.rotation = 0;
    }
    // Increase rotation by 90 degrees
    currentlySelected.box.rotation += 90;

    // Store variables to shorter names
    let rot = currentlySelected.box.rotation;
    let obj = currentlySelected;

    // get the dimensions for each shape
    let y, x;
    if (currentlySelected.box.rotation % 180 != 0) {
        y = obj.column * obj.s
        x = obj.row * obj.s
    } else {
        y = obj.row * obj.s
        x = obj.column * obj.s

    }

    // Center object after rotating
    if (rot == 90 && rot % 90 == 0) {
        obj.box.x += (y + x) / 2
        obj.box.y -= (x / 2) - (y / 2)
        updateRowCol();
    }
    if (rot == 180 && rot % 180 == 0) {
        obj.box.x += x / 2 - (y / 2)
        obj.box.y += (x / 2) + (y / 2)
        updateRowCol()
    }
    if (rot == 270 && rot % 270 == 0) {
        obj.box.x -= (x + y) / 2
        obj.box.y += (x / 2) - (y / 2)
        updateRowCol()
    }
    if (rot == 360 && rot % 360 == 0) {
        obj.box.x -= (x - y) / 2
        obj.box.y -= (x + y) / 2
        updateRowCol()
    }
    update = true;

    // Update object xpos and ypos
    currentlySelected.xpos = obj.box.x;
    currentlySelected.ypos = obj.box.y;

    function updateRowCol() {
        let temp = currentlySelected.row;
        currentlySelected.row = currentlySelected.column;
        currentlySelected.column = temp;
    }
}

/**
 * Button that clones current selected object onto the stage
 */
function cloneEvent(evt) {
    if (tweenRunningCount > 0) { return }

    copyObject();
    pasteObject();
}

/**
 * Remove currently selected box
 */
function deleteEvent() {
    if (tweenRunningCount > 0) { return }

    if (currentlySelected != null) {
        // Remove GridFram from stage
        chipStorage.removeChild(currentlySelected.box);
        currentlySelected = null;
        // Reset first keyboard input to null
        multiKeyFirstIn = null;
    }

    if (chipStorage.children.length != 1) {
        updateStageTrackers("delete", null);
    } else {
        console.log("no chip removal")
    }
    update = true;
}


//             ------------------- LEFT MENU BUTTONS -------------------
/**
 * GridFrame Pop-Up menu Child BUTTONS handler
 */
function gridFrameButtonHandler(button, row, col) {
    button.on("click", function (evt) {
        // Check that the object was moved AT LEAST 5 pixels
        if (!(Math.abs(evt.target.x - evt.target.oldX) < 5) &&
            !(Math.abs(evt.target.y - evt.target.oldY) < 5)) {
            // CLONE event object and place at the current coordinates

            let newBox = drawTenContainer("black", 2.2, row, col,
                evt.target.parent.x, evt.target.parent.y);

            // update object stage staus & add to stage
            newBox.stageBox = true;
            chipStorage.addChild(newBox.box);
            // Reset Popup frame grid to zero
            //      (for full button reset see gridSelectPopupHandler)
            boxButtonSelection.alpha = 0;
        }
    });
}

/**
 * GridFrame Selection Pop-Up MENU Main button handler
 */
function gridMenuPopupHandler(button) {
    button.box.on("click", function (evt) {
        if (boxButtonSelection.alpha != 1) {
            // Moves popup to top of the stage (show over stage objects)
            boxButtonSelection.parent.addChild(boxButtonSelection);
            // Make popup visible
            boxButtonSelection.alpha = 1;
            // reset GridFrame button to default location if moved
            boxGrid5.box.x = canvas.width * .2, boxGrid5.box.y = canvas.height * .09
            boxGrid10.box.x = canvas.width * .2, boxGrid10.box.y = canvas.height * .145,
                boxGrid20.box.x = canvas.width * .2, boxGrid20.box.y = canvas.height * .22,
                boxGrid100.box.x = canvas.width * .2, boxGrid100.box.y = canvas.height * .295;
        } else {
            boxButtonSelection.alpha = 0;
        }
    });
}

/**
 * Button and Stage Chip mouse event handlers
 */
function applyChipButtonHandlers(button) {

    button.on("mousedown", function (evt) {
        // if tween is running disable
        if (tweenRunningCount > 0) { return }

        // Stop selector box from displaying when moving object
        //stageObjectDragging = true;

        // Store original location of object
        this.oldX = this.x;
        this.oldY = this.y;
        this.parent.addChild(this);
        this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY }

        update = true;
    });

    button.on("pressmove", function (evt) {
        // if tween is running or on grid disable
        if (tweenRunningCount > 0 || button.isGridChip) { return }

        // On the move check for
        button.onTheMove = true;

        // Move chip to location where pointer is located
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;

        // Mark button chips as pressmove for pressup handler
        // (Unknown bug, does not work to call isBoardChip. Must assign to bool isMenuChip)
        if (!button.isBoardChip) {
            isMenuChipButton = true;
        }

        update = true;
    });

    button.on("pressup", function (evt) {

        // if tween is running disable
        if (tweenRunningCount > 0 || button.isGridChip) { return }


        // If LEFT menu button chip, move back to button location
        if (isMenuChipButton) {
            // 
            button.onTheMove = false;
            button.alpha = 0;
            button.x = button.oldX
            button.y = button.oldY
            pressupCheck(evt)

            setTimeout(() => { button.alpha = 1 }, 1200);
        } else {
            // distribute chips to stage
            pressupCheck(evt);
        }
        button.onTheMove = false;
    });

    // Helper method to distribute chips to stage
    function pressupCheck(evt) {
        // if target on stage select instead of tween
        if (Math.abs(button.oldX - button.x) > 2 || Math.abs(button.oldY - button.y) > 2)
            return;

        // if tween in progress dont allow selection of shapes at 
        // new tween possition during transit
        if (Math.abs(xTween - evt.stageX) < 10 || Math.abs(yTween - evt.stageY) < 10)
            return;

        // allow selection of shape when on main stage    
        if (button.isBoardChip) {
            updateChipBoardStatus(button);
        } else {
            // PRIORITY 1: if menu button moved, tween new chips to drop location
            if (isMenuChipButton) {
                xTween = evt.stageX - canvas.width * .0285;
                yTween = evt.stageY;
                isMenuChipButton = false;
                tweenChips(evt, button, xTween, yTween, canvas.width * .013);
            }
            // PRIORITY 2: if grid selected, tween to selected grid location
            else if (currentlySelected != null) {
                // X and Y tween location are null, will be determined from currentlySelected point method
                tweenChips(evt, button, xTween, yTween, currentlySelected.s / 2.4)
            }
            // if not moved, tween to random location
            else {
                xTween = (canvas.width / 4) + Math.random() * (canvas.width / 1.8);
                yTween = (canvas.width / 18) + Math.random() * (canvas.width / 1.8);
                tweenChips(evt, button, xTween, yTween, canvas.width * .013);
            }
        }
        update = true;
    }
}

function applyGridChipButtonHandlers(button) {

    button.on("mousedown", function (evt) {

        // if tween is running disable
        if (tweenRunningCount > 0) { return }

        if (textButton.children[1].text == "Move Grid") { return }

        // Store the grid is was assigned to
        button.oldGrid = button.parent.grid;

        // Store original location of object
        this.oldX = this.x;
        this.oldY = this.y;
        this.parent.addChild(this);
        this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY }

        update = true;
    });

    button.on("pressmove", function (evt) {
        // if tween is running or on grid disable
        if (tweenRunningCount > 0) { return }


        if (textButton.children[1].text == "Move Grid") { return }

        // On the move check for
        button.onTheMove = true;

        // Move chip to location where pointer is located
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;

        update = true;
    });

    button.on("pressup", function (evt) {

        // if tween is running disable
        if (tweenRunningCount > 0) { return }

        if (textButton.children[1].text == "Move Grid") { return }
        // distribute chips to stage

        ////////////////////////////////////////////////////////////////////////////////////////

        //                  FIX TRANSLATE CHECK (X-Y Values wrong on roatate)
        
        ////////////////////////////////////////////////////////////////////////////////////////
        if (Math.abs(this.x - this.oldX) < 5 || Math.abs(this.y - this.oldY) < 5) {
            
            this.x = this.oldX;
            this.y = this.oldY;
        } else {
            // Apply chip to stage pointer location
            this.x = evt.stageX
            this.y = evt.stageY

            // Remove old evt listeners & apply board chip listeners
            button._listeners = null;
            applyChipButtonHandlers(button);
            button.isGridChip = false
            chipStorage.addChild(button)

            // Resize button to proper scale ((FIND A BETTER WAY TO IMPLEMENT - BUTTON FUZZY))
            button.scaleX = button.scaleY = 1.45;

            // Get index of button and remove from gridFrame
            let indexRemove = (button.gridLocation.x * button.oldGrid.row) +
                button.gridLocation.y;
            button.oldGrid.indexChipTracker[indexRemove - 1] = false
            button.oldGrid.chipsOnGrid--;
        }

        button.onTheMove = false;
    });
}

// Toggle selected state on chip board (includes GridFrames)
function updateChipBoardStatus(button) {

    // if currently selected, deselect
    if (button.alpha == 1) {

        // if object is grid deselect grid
        if (button.grid != undefined) {
            updateObjectSelected(button, false);
        }
        // else deselect chip instead
        else {
            // add buttons to array of currently selected chips
            updateStageTrackers("select", button);
        }

    }
    else {
        if (button.grid != undefined) {
            updateObjectSelected(button, true);
        }
        else {
            // remove buttons from array of currently selected chips
            updateStageTrackers("deselect", button);
        }
    }
    update = true;
}


function updateStageTrackers(scenario, button) {
    switch (scenario) {
        case "delete":
            removeChips()
            break;
        case "add":

            break;
        case "select":
            // Append selected chip to the end of the selected array
            button.chipSelected = true;
            button.alpha = .6;
            //chipMultiDragger.addChild(button);

            break;
        case "deselect":
            // Copy entire array and omit deselected chip
            button.chipSelected = false;
            button.alpha = 1;

            //chipStorage.addChild(button)
            break;
        default:
            break;
    }
}

// Remove selected children from the stage
function removeChips() {
    let removalQueue = [];
    // find all chips that have been selected currently
    for (i = 1; i < chipStorage.children.length; i++) {
        if (chipStorage.children[i].chipSelected == true) {
            removalQueue[i] = chipStorage.children[i];
        }
    }

    // Seperately remove from the stage (buggy when removing child in loop above)
    for (i = 0; i < removalQueue.length; i++) {
        chipStorage.removeChild(removalQueue[i]);
    }
    update = true;
}

// Helper method for completing tween actions on Chip objects
function tweenChips(evt, button, xTween, yTween, chipSize) {
    // set scalar variables
    let color = evt.target.graphics._fill.style;
    let radius = canvas.width * .013;
    // xLoc & yLoc determine the tween origin of new chip objects
    let xLoc = evt.target.parent.oldX;
    let yLoc = evt.target.parent.oldY;

    //************************* Bound Check ******************************/

    // Left bound check
    if (xTween < canvas.width * .086) {
        xTween = canvas.width * .06
    }
    // Right Bound tween check
    if (evt.stageX + (button.numChild * (radius * 2.1)) > canvas.width) {
        if (button.numChild <= 5) {
            xTween = evt.stageX - (button.numChild * (radius * 2.1)) - (radius)
        } else if (button.numChild > 5) {
            xTween = evt.stageX - (5 * (radius * 2.1)) - (radius)
        }
    }

    //************************* Tween Behavior ******************************/

    // Reset rotation for tween to ensure proper chip placement
    if (currentlySelected != null && currentlySelected.box.rotation != 0) {
        currentlySelected.box.oldRotation = currentlySelected.box.rotation;
        let numRot = 4 - (currentlySelected.box.oldRotation / 90)
        for (i = 0; i < numRot; i++) {
            rotateGrid(evt);
        }
    }

    // Track number of chips being added to container for addChipToGrid()
    let chipsToAdd = 0;

    // Create all chips depending on button child number
    for (i = 1; i < button.numChild + 1; i++) {

        // Create chip and place at original button location
        let newChip = copyChipButton(color, 1, chipSize, xLoc, yLoc);

        // Not adding to grid (Chip size indicates if adding to grid or not)
        if (chipSize == canvas.width * .013) {
            addToStage(newChip, i);
        }
        // Adding to grid
        else {
            // Determine the number of chips currently contained
            let chipsOnGrid = currentlySelected.chipsOnGrid
            // If grid full, stop adding chips
            if (chipsOnGrid >= currentlySelected.getIndexSize()) {
                // Continue and break loop
                i = button.numChild + 1
                continue;
            } else {
                // If not full, increment number of chips
                chipsToAdd++
            }
            addToGrid(newChip, i);
            tweenRunningCount++;
        }
    }



    // Set timeout between Tween and moving chips to sub-stage or grid
    if (chipSize != canvas.width * .013) {
        setTimeout(() => { addChipToGrid(button, chipsToAdd); }, (button.numChild * 80) + 800);
    }

    //************************* Helper Methods ******************************/

    // Tween helper method
    function tween(newChip, i, xTween, yTween) {

        // Tween to random location on the screen
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener("tick", tick);
        tweenRunningCount++;
        createjs.Tween.get(newChip, { override: true })
            .to({ x: xTween, y: yTween }, (i * 80) + 600, createjs.Ease.get(3))
            .call(handleTweenComplete);
    }

    // Helper method, adds chip to stage
    function addToStage(newChip, i) {
        chipStorage.addChild(newChip)
        //addChipToGridCheck = false;
        let multiple = 2.1;

        if (i <= 5) {
            xTween += chipSize * multiple
        } else if (i == 6) {
            xTween -= (i - 1) * (chipSize * multiple)
            yTween += chipSize * multiple
        } if (i > 5) {
            xTween += chipSize * multiple
        }

        tween(newChip, i, xTween, yTween);
    }

    // Helper method, adds chip to specified GridFrame
    function addToGrid(newChip, i) {

        // Specific chip handlers for when in grid
        applyGridChipButtonHandlers(newChip)

        chipStorage.addChild(newChip)

        //addChipToGridCheck = true;
        let point;

        ///////////////////////////////////////////////////////////////////////////
        /*
        







                  FIND A WAY TO INCREMENT THE INNER SELECT CONTAINER LOCATION?








        */
        ////////////////////////////////////////////////////////////////////////////

        // THIS DISABLES TWEEN TO SPECIFIC POINT IN GRID
        innerSelected = null;

        // Tween to specific point in grid else tween to next available grid space
        if (innerSelected != null) {
            point = currentlySelected.getLocationToAddChip("drag", innerSelected);
            innerSelected = null
        } else {
            point = currentlySelected.getLocationToAddChip("click")
        }
        newChip.gridLocation = currentlySelected.getChipGridIndex();

        // Get points 
        if (point == null) {
            console.log('NULL')
        } else
            tween(newChip, i, point.x, point.y);
    }
}

function addChipToGrid(button, chipsToAdd) {



    if (currentlySelected != null) {
        // Get the number of children on the Active grid stage
        let numOnStage = chipStorage.children.length;
        // determine how man open spaces are left on the grid
        let availableGrids = currentlySelected.indexChipTracker.length - currentlySelected.chipsOnGrid;
        // Determine the number of chips attemted to add
        let chipsAdded = button.numChild;
        // If chips add exceed available space, only apply available
        if (chipsAdded > availableGrids) {
            chipsAdded = chipsToAdd;
        }

        // Go backwards in the active grid stage and update children just added to stage
        for (i = numOnStage; i > numOnStage - chipsAdded; i--) {
            chipStorage.children[i - 1].x = Math.abs(chipStorage.children[i - 1].x
                - currentlySelected.box.x);
            chipStorage.children[i - 1].y = Math.abs(chipStorage.children[i - 1].y
                - currentlySelected.box.y);
            chipStorage.children[i - 1].inContainer = true;

            chipStorage.children[i - 1].isGridChip = true;
            currentlySelected.box.addChild(chipStorage.children[i - 1])
        }

        tweenRunningCount = 0;

        // Restore pre-tween grid rotation
        if (currentlySelected != null && currentlySelected.box.oldRotation != undefined) {
            let evt = null;
            let retoreRot = currentlySelected.box.oldRotation / 90
            for (i = 0; i < retoreRot; i++) {
                rotateGrid(evt);
            }
            currentlySelected.box.oldRotation = undefined;
        }
    }



}

// Track tween events
function handleTweenComplete() {

    // reset alpha and clear shape select variable
    xTween = 0;
    yTween = 0;
    tweenRunningCount--;
}

function tick(evt) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (tweenRunningCount > 0) {
        stage.update(evt);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *                              OLD FUNCTIONS NOT YET USED IN PROGRAM
 */
//////////////////////////////////////////////////////////////////////////////////////////////////

function createShape(shapeString, color, row) {

    let shape = new createjs.Shape();
    shape.id = shapeString;
    let dragger = new createjs.Container();

    switch (shapeString) {
        case "smallCircle":
            shape.graphics.beginFill(color).drawCircle(0, 0, canvas.width * (21 / 900));
            dragger.x = canvas.width / 4.4;
            dragger.y = dividerLocation + canvas.width * (92.4 / 900) + row;
            break;
        case "largeCircle":
            shape.graphics.beginFill(color).drawCircle(0, 0, canvas.width * (31 / 900));
            dragger.x = canvas.width / 3.425;
            dragger.y = dividerLocation + canvas.width * (84 / 900) + row;
            break;
        case "smallSquare":
            shape.graphics.beginFill(color).rect(canvas.width * (-23.1 / 900),
                canvas.width * (-23.1 / 900), canvas.width * (46.2 / 900), canvas.width * (46.2 / 900));
            dragger.x = canvas.width / 2.775;
            dragger.y = dividerLocation + canvas.width * (91 / 900) + row;
            break;
        case "largeSquare":
            shape.graphics.beginFill(color).rect(canvas.width * (-30.8 / 900),
                canvas.width * (-30.8 / 900), canvas.width * (61.6 / 900), canvas.width * (61.8 / 900));
            dragger.x = canvas.width / 2.3;
            dragger.y = dividerLocation + canvas.width * (84 / 900) + row;
            break;
        case "smallTriangle":
            shape.graphics.beginFill(color).drawPolyStar(0, canvas.width * (19.25 / 900),
                canvas.width * (23.1 / 900), 3, 0, -90);
            dragger.x = canvas.width / 2.0;
            dragger.y = dividerLocation + canvas.width * (84 / 900) + row;
            break;
        case "largeTriangle":
            shape.graphics.beginFill(color).drawPolyStar(0, canvas.width * (11.55 / 900),
                canvas.width * (38.5 / 900), 3, 0, -90);
            dragger.x = canvas.width / 1.75;
            dragger.y = dividerLocation + canvas.width * (84 / 900) + row;
            break;
        case "smallRectangle":
            shape.graphics.beginFill(color).rect((canvas.width * (-17 / 900)),
                (canvas.width * (-35 / 900)), (canvas.width * (35 / 900)), (canvas.width * (70 / 900)));
            shape.rotation = 90;
            dragger.x = canvas.width / 1.52;
            dragger.y = dividerLocation + canvas.width * (96.25 / 900) + row;
            break;
        case "largeRectangle":
            shape.graphics.beginFill(color).rect((canvas.width * (-30 / 900)),
                (canvas.width * (-46 / 900)), (canvas.width * (60 / 900)), (canvas.width * (92 / 900)));
            shape.rotation = 90;
            dragger.x = canvas.width / 1.315;
            dragger.y = dividerLocation + canvas.width * (84 / 900) + row;
            break;
        case "smallOctagon":
            shape.graphics.beginFill(color).drawPolyStar(0, 0, canvas.width * (23.1 / 900),
                8, 0, -135);
            shape.rotation = 22.5;
            dragger.x = canvas.width / 1.185;
            dragger.y = dividerLocation + canvas.width * (92.75 / 900) + row;
            break;
        case "largeOctagon":
            shape.graphics.beginFill(color).drawPolyStar(0, 0, canvas.width * (38.5 / 900),
                8, 0, -135);
            shape.rotation = 22.5;
            dragger.x = canvas.width / 1.09;
            dragger.y = dividerLocation + canvas.width * (79.8 / 900) + row;
            break;
    }

    dragger.on("mousedown", function (evt) {
        dragger.oldX = dragger.x;
        dragger.oldY = dragger.y;
        this.parent.addChild(this);
        this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY };
        update = true;
    });

    dragger.on("pressmove", function (evt) {
        //if (draggerSmall.onTheMove)
        //	return;
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;
        // indicate that the stage should be updated on the next tick:
        resizeShape(evt);
        update = true;
    });
    dragger.on("pressup", function (evt) {
        // if target on stage select instead of tween
        if (Math.abs(dragger.oldX - dragger.x) > 2 || Math.abs(dragger.oldY - dragger.y) > 2)
            return;

        // if tween in progress dont allow selection of shapes at 
        // new tween possition during transit
        if (Math.abs(xTween - evt.stageX) < 10 || Math.abs(yTween - evt.stageY) < 10)
            return;

        // allow selection of shape when on main stage    
        if (evt.target.parent.y < dividerLocation) {
            evt.target.parent.alpha = .6
            shapeSelect = evt.target.parent;
        } else {
            update = true;

            // Tween to random location on the screen
            xTween = (canvas.width / 4) + Math.random() * (canvas.width / 1.8);
            yTween = (canvas.width / 18) + Math.random() * (canvas.width / 1.8);

            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.addEventListener("tick", stage);
            tweenRunningCount++;
            createjs.Tween.get(dragger, { loop: false }, null, false)
                .to({ x: xTween, y: yTween }, 1000, createjs.Ease.get(1))
                .call(handleTweenComplete);
        }

        //createShape(shapeString, color, row);

        /* 
        for (let i = 0; i < childCountShape.length; i++){
            if (evt.target.x == childCountShape[i][1] && evt.target.shadow == 
                childCountShape[i][0].getChildAt(0).shadow){
                childCountShape[i][1] = xTween;
                childCountShape[i][2] = yTween
            }
        }
        */

        update = true;
    });
    shape.on("mouseover", function (evt) {
        let miniTransform = 1;

        // Resize shapes if above the divider line on the stage
        if (evt.target.parent.y < dividerLocation) {
            //if (holderVenn3_1.alpha == 1) { miniTransform = .8 }
        }
        evt.target.setTransform(0, 0, miniTransform * 1.1, miniTransform * 1.1);
        if (evt.target.id == "smallRectangle" ||
            evt.target.id == "largeRectangle") {
            evt.target.rotation = 90;
        } if (evt.target.id == "smallOctagon" ||
            evt.target.id == "largeOctagon") {
            evt.target.rotation = 22.5;
        }
    });
    shape.on("mouseout", function (evt) {
        resizeShape(evt);
    });

    dragger.addChild(shape);
    return dragger;
}

function resizeShape(evt) {
    let miniTransform = 1;

    /* Resize depending on which venn is up. 
    Does not resize all when new venn selected
    may be better to resize on tween to stage instead
    */

    // Resize shapes if above the divider line on the stage
    if (evt.target.parent.y < dividerLocation) {
        //if (holderVenn3_1.alpha == 1) { miniTransform = .8 }
        evt.target.setTransform(0, 0, miniTransform * 1.1, miniTransform * 1.1);
    }

    evt.target.setTransform(0, 0, miniTransform, miniTransform);
    if (evt.target.id == "smallRectangle" ||
        evt.target.id == "largeRectangle") {
        evt.target.rotation = 90;
    } if (evt.target.id == "smallOctagon" ||
        evt.target.id == "largeOctagon") {
        evt.target.rotation = 22.5;
    }

}




