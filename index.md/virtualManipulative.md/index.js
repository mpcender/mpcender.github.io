
//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *                                      Variables
 */
//////////////////////////////////////////////////////////////////////////////////////////////////

// variables for resizing canvas and stage
let canvas, stage, holder;

let maxCanvas = 1000;
let minCanvas = 400;

// Modify the y translation of the divider line
let dividerLocation;

// Venn stage order storag
let vennOnePlace, venn2_1Place, venn2_2Place,
    venn3_1Place, venn3_2Place, venn3_3Place;
let holderVenn1, holderVenn2_1, holderVenn2_2,
    holderVenn3_1, holderVenn3_2, holderVenn3_3;
let stageState = 0;		// Zero Venn

let text_1, text_2, text_3;

let isSwitchShape = false;
let update = false;
let tweenRunningCount = 0;

let childCountShape = new Array(60);
//let childCountThickShape = [30];

let shapeSelect;
var xTween;
var yTween;


/**
 * @TODO 
 * Add Tween functionality
 * Figure out how to tween and keep dragger function
 * Fix venn to change color on selection and tween to target, then revert to normal
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
    resize();
    dividerLocation = (canvas.height * .65);

    // For mobile devices.
    createjs.Touch.enable(stage);

    // to get onMouseOver & onMouseOut events, we need to enable them on the stage:
    stage.enableMouseOver();

    // this lets our drag continue to track the mouse even when it leaves the canvas:
    // play with commenting this out to see the difference.
    stage.mouseMoveOutside = true;

    // When shape selected, tween to cursor location on stage
    let hit = new createjs.Shape();
    hit.graphics.beginFill("black").drawRect(0, 0,
    canvas.width, dividerLocation);
    hit.alpha = .1;
    stage.addChild(hit);
    hit.on("click", checkSelected);

    // Draw line
    drawStageLines();


    /**
    DRAW CUSTOM SHAPES FOR PROGRAM
    */
    for (var i = 0; i < childCountShape.length; i++) {
        childCountShape[i] = new Array(2);
    }
    // create thin and thick shapes, set thick to invisible init
    initializeShape();

    initializeTextToggle();

    // Button to clear workspace
    var clearButton = createButton("CLEAR", canvas.height * (10.4 / 16));
    stage.addChild(clearButton);
    clearButton.on("click", clearWorkspace);

    // Button to switch shape thickness on stage
    var switchShapeButton = createButton("Thickness", canvas.height * (11.7 / 16));
    stage.addChild(switchShapeButton);
    switchShapeButton.on("click", switchShape);

    // Initialize Venn Diagrams and set to invisible
    drawVenn();

    // Draw One Venn Diagram
    var oneVennButton = createButton("One Venn", canvas.height * (12.7 / 16));
    stage.addChild(oneVennButton);
    oneVennButton.on("click", vennOneEvent);

    // Draw Two Venn Diagram
    var twoVennButton = createButton("Two Venn", canvas.height * (13.7 / 16));
    stage.addChild(twoVennButton);
    twoVennButton.on("click", vennTwoEvent);


    // Draw Three Venn Diagram
    var threeVennButton = createButton("Three Venn", canvas.height * (14.7 / 16));
    stage.addChild(threeVennButton);
    threeVennButton.on("click", vennThreeEvent);
    createjs.Ticker.setFPS(20);
    createjs.Ticker.addEventListener("tick", stage);

    update = true;
}



//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *                                  Methods and functions
 */
//////////////////////////////////////////////////////////////////////////////////////////////////


function initializeTextToggle() {
    let hit = new createjs.Shape();
    let px = canvas.height / 40 + "px";

    text_1 = new createjs.Text("Click", "bold " + px + " Arial", "Black");
    text_1.alpha = 0;
    text_1.textAlign = "center";
    text_1.on("click", textToggle);
    hit.graphics.beginFill("rgba(0,0,0,0.5)").drawRect(-text_1.getMeasuredWidth(), 0,
        text_1.getMeasuredWidth() * 2, text_1.getMeasuredHeight() * 1.1);
    text_1.hitArea = hit;


    text_2 = new createjs.Text("Click", "bold " + px + " Arial", "Black");
    text_2.alpha = 0;
    text_2.textAlign = "center";
    text_2.on("click", textToggle);
    hit.graphics.beginFill("rgba(0,0,0,0.5)").drawRect(-text_2.getMeasuredWidth() * 1, 0,
        text_2.getMeasuredWidth() * 2, text_2.getMeasuredHeight() * 1.1);
    text_2.hitArea = hit;


    text_3 = new createjs.Text("Click", "bold " + px + " Arial", "Black");
    text_3.alpha = 0;
    text_3.textAlign = "center";
    text_3.on("click", textToggle);
    hit.graphics.beginFill("rgba(0,0,0,0.5)").drawRect(-text_3.getMeasuredWidth() * 1, 0,
        text_3.getMeasuredWidth() * 2, text_3.getMeasuredHeight() * 1.3);
    text_3.hitArea = hit;

    stage.addChild(text_1, text_2, text_3);
}

function textToggle(evt) {
    switch (evt.target.text) {
        case "Click":
            evt.target.text = "Blue"
            console.log(evt.target)
            evt.target.color = "#024593"
            break;
        case "Blue":
            evt.target.text = "Yellow"
            evt.target.shadow = new createjs.Shadow("#000000", 0,0, 3);
            evt.target.color = "#fbd133"
            break;
        case "Yellow":
            evt.target.text = "Red"
            evt.target.shadow = null;
            evt.target.color = "#d03d42"
            break;
        case "Red":
            evt.target.text = "Thin"
            evt.target.font = "22.5px Arial"
            evt.target.color = "Black"
            break;
        case "Thin":
            evt.target.text = "Thick"
            evt.target.font = "bold 22.5px Arial"
            evt.target.color = "Black"
            break;
        case "Thick":
            evt.target.text = "LARGE"
            evt.target.font = "bold 25px Arial"
            evt.target.color = "Black"
            break;
        case "LARGE":
            evt.target.text = "small"
            evt.target.font = "bold 17.5px Arial"
            evt.target.color = "Black"
            break;
        case "small":
            evt.target.text = "Circle"
            evt.target.shadow = new createjs.Shadow("#000000", 0, 0, 2);
            evt.target.font = "bold 22.5px Arial"
            evt.target.color = "gray"
            break;
        case "Circle":
            evt.target.text = "Square"
            evt.target.color = "gray"
            break;
        case "Square":
            evt.target.text = "Triangle"
            evt.target.color = "gray"
            break;
        case "Triangle":
            evt.target.text = "Rectangle"
            evt.target.color = "gray"
            break;
        case "Rectangle":
            evt.target.text = "Octagon"
            evt.target.color = "gray"
            break;
        case "Octagon":
            evt.target.text = "-   -"
            evt.target.shadow = null;
            evt.target.color = "black"
            break;
        case "-   -":
            evt.target.text = "Blue"
            evt.target.color = "#024593"
            break;
    }
}

/**
 * Create shapes for thin an thick manipulatives, set shadow to thick
 */
function initializeShape() {
    let shapeSize = canvas.width / 10;

    let colors = ["#024593", "#fbd133", "#d03d42"];
    let shapeType = ["smallCircle", "smallSquare", "smallTriangle", "smallRectangle",
        "smallOctagon", "largeCircle", "largeSquare", "largeTriangle", "largeRectangle",
        "largeOctagon"]

    let arrayPosition = 0;
    let weight = "thin";

    for (let i = 1; i < 4; i++) {
        // Draw all "thin" shapes
        for (let n = 0; n < 10; n++) {
            childCountShape[arrayPosition][0] = createShape(shapeType[n], colors[i - 1], shapeSize * (i - 1));
            childCountShape[arrayPosition][1] = weight;
            stage.addChild(childCountShape[arrayPosition][0]);
            arrayPosition++;
        }
    }
    isSwitchShape = true;
    weight = "thick";
    for (let i = 1; i < 4; i++) {
        // Draw all "thin" shapes
        for (let n = 0; n < 10; n++) {
            childCountShape[arrayPosition][0] = createShape(shapeType[n], colors[i - 1], shapeSize * (i - 1));
            childCountShape[arrayPosition][0].getChildAt(0).shadow = new createjs.Shadow("#000000", 4, 4, 3);
            childCountShape[arrayPosition][1] = weight;
            childCountShape[arrayPosition][0].alpha = 0;
            stage.addChild(childCountShape[arrayPosition][0]);
            arrayPosition++;
        }
    }
    isSwitchShape = false;
}

function updateShapeIndex(evt) {
    if (isSwitchShape == false) {
        for (let i = 0; i < childCountShape.length; i++) {
            if (evt.target.id == childCountShape[i][0].getChildAt(0).id) {
                childCountShape[i][1] = evt.target.parent.parent.getNumChildren();
                break;
            }
        }
    }
}

function switchShape(evt) {
    for (let i = 0; i < evt.target.parent.parent.getNumChildren() + 1; i++) {
        try {
            if (!isSwitchShape) {
                if (childCountShape[i][0].y > dividerLocation) {
                    if (childCountShape[i][1] == "thin") {
                        childCountShape[i][0].alpha = 0;
                    } else if (childCountShape[i][1] == "thick") {
                        childCountShape[i][0].alpha = 1;
                    }
                }
            }
            else {
                if (childCountShape[i][0].y > dividerLocation) {
                    if (childCountShape[i][1] == "thin") {
                        childCountShape[i][0].alpha = 1;
                    } else if (childCountShape[i][1] == "thick") {
                        childCountShape[i][0].alpha = 0;

                    }
                }
            }
        } catch (error) {
        }
    }
    isSwitchShape = !isSwitchShape;
}

/**
 * Allow user to click the stage and tween selected shape to cursor
 * @param {*} evt 
 */
function checkSelected(evt) {
    console.log(evt);
    console.log(canvas.height*.04);

    if (shapeSelect != null && (evt.stageY + canvas.height*.04) < dividerLocation) {
        xTween = evt.stageX;
        yTween = evt.stageY;

        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener("tick", stage);
        tweenRunningCount++;
        createjs.Tween.get(shapeSelect, { loop: false }, null, false)
            .to({ x: xTween, y: yTween }, 1000, createjs.Ease.get(1))
            .call(handleTweenComplete);

        if (shapeSelect != null) {
            shapeSelect.alpha = 1;
            shapeSelect = null;
        }
    }

}

/**
 * Resize the canvas to fit window
 * maxCanvas and minCanvas variable controll size
 */
function resize() {
    // Draw canvas as the size of the window (Scale by height)
    if (window.innerHeight > maxCanvas) {
        canvas.width = maxCanvas;
        canvas.height = maxCanvas;
    } else if (window.innerHeight <= minCanvas) {
        canvas.width = minCanvas
        canvas.height = minCanvas;
    } else {
        canvas.width = (window.innerHeight - 15);
        canvas.height = (window.innerHeight - 15);
    }

    // (Scale by width)
    /*
    if (document.getElementById("wrapper").offsetWidth > maxCanvas) {
        canvas.width = maxCanvas;
        canvas.height = maxCanvas;
    } else if (document.getElementById("wrapper").offsetWidth > minCanvas) {
        canvas.width = (document.getElementById("wrapper").offsetWidth - 15);
        canvas.height = ((document.getElementById("wrapper").offsetWidth / 1) - 15);
    } else if (document.getElementById("wrapper").offsetWidth <= minCanvas) {
        canvas.width = minCanvas
        canvas.height = minCanvas;
    }
    */
}

/**
 * Create buttons for activating venn diagrams
 * @param {*} text 
 * @param {*} row 
 */
function createButton(text, row) {
    var buttonBackground = new createjs.Shape();
    buttonBackground.name = text;
    buttonBackground.graphics.beginFill("black").drawRoundRect(0, 0, canvas.width * (13 / 90),
        canvas.width * (1 / 18), canvas.width * (1 / 90));
    var textSize = canvas.width * (11 / 450);

    var label = new createjs.Text(text, "bold " + textSize + "px Arial", "#FFFFFF");
    label.textAlign = "center";
    label.textBaseline = "middle";
    label.x = canvas.width * (13 / 90) / 2;
    label.y = canvas.width * (1 / 18) / 2;

    var button = new createjs.Container();
    button.x = canvas.width * (1 / 90);
    button.y = canvas.width * (1 / 90) + row;
    button.addChild(buttonBackground, label);

    return button;
}

/**
 * Draws the border and seperation line for the canvas
 */
function drawStageLines() {
    // Draw divider line
    let dividerLine = new createjs.Shape();
    dividerLine.graphics.beginStroke("black");
    // Line to divide stage in half
    dividerLine.graphics.moveTo(0, dividerLocation).lineTo(canvas.width, dividerLocation);
    // Draw Border Lines
    dividerLine.graphics.moveTo(1, 1).lineTo(1, canvas.height - 1).
        lineTo(canvas.width - 1, canvas.height - 1).lineTo(canvas.width - 1, 1).lineTo(-1, 1);
    stage.addChild(dividerLine);

}

/**
 * Generate a pair of shapes to be placed on the canvas
 * @param {*} shapeString 
 * @param {*} color 
 * 
 */

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

function handleTweenComplete() {
    // reset alpha and clear shape select variable
    xTween = 0;
    yTween = 0;
    tweenRunningCount--;
}

function drawVenn() {
    // Draw One Circle Venn
    let oneCircleVenn = new createjs.Shape();

    oneCircleVenn.graphics.setStrokeStyle(1).beginStroke("#000000")
        .drawCircle(canvas.width * .55, canvas.height * .335, canvas.width * .3);
    // Add shapes to holder to allow access to alpha modifier
    holder.addChild(oneCircleVenn);

    // Store position in holder
    vennOnePlace = holder.numChildren;
    // Set alpha to zero init
    holderVenn1 = holder.getChildAt(vennOnePlace - 1);
    holderVenn1.alpha = 0;

    // Create hit area for user selection of specific area on venn
    let hit = new createjs.Shape();
    hit.graphics.beginFill("#000").drawCircle(canvas.width * .55,
        canvas.height * .325, canvas.width * .3);
    holderVenn1.hitArea = hit;
    holderVenn1.on("click", VennMouseEvent);


    // Draw Two Circle Venn
    let twoCircleVennOne = new createjs.Shape();
    twoCircleVennOne.graphics.setStrokeStyle(1).beginStroke("#000000")
        .drawCircle(canvas.width * .315, canvas.height * .325, canvas.width * .285);

    let twoCircleVennTwo = new createjs.Shape();
    twoCircleVennTwo.graphics.setStrokeStyle(1).beginStroke("#000000")
        .drawCircle(canvas.width * .685, canvas.height * .325, canvas.width * .285);
    // Add shapes to holder to allow access to alpha modifier
    holder.addChild(twoCircleVennOne, twoCircleVennTwo);

    // Store position in holder
    venn2_1Place = holder.numChildren - 1;
    venn2_2Place = holder.numChildren;
    // Set alpha to zero init
    holderVenn2_1 = holder.getChildAt(venn2_1Place - 1);
    holderVenn2_1.alpha = 0;
    holderVenn2_2 = holder.getChildAt(venn2_2Place - 1);
    holderVenn2_2.alpha = 0;

    // Draw Three Circle Venn
    let threeCircleVennOne = new createjs.Shape();
    threeCircleVennOne.graphics.setStrokeStyle(1).beginStroke("#000000")
        .drawCircle(canvas.width * .42, canvas.width * .465, canvas.width * .18);
    let threeCircleVennTwo = new createjs.Shape();
    threeCircleVennTwo.graphics.setStrokeStyle(1).beginStroke("#000000")
        .drawCircle(canvas.width * .68, canvas.width * .465, canvas.width * .18);
    let threeCircleVennThree = new createjs.Shape();
    threeCircleVennThree.graphics.setStrokeStyle(1).beginStroke("#000000")
        .drawCircle(canvas.width * .55, canvas.width * .21, canvas.width * .18);
    // Add shapes to holder to allow access to alpha modifier
    holder.addChild(threeCircleVennOne, threeCircleVennTwo, threeCircleVennThree);
    // Store position in holder
    venn3_1Place = holder.numChildren - 2;
    venn3_2Place = holder.numChildren - 1;
    venn3_3Place = holder.numChildren;
    // Set alpha to zero initially
    holderVenn3_1 = holder.getChildAt(venn3_1Place - 1);
    holderVenn3_1.alpha = 0;
    holderVenn3_2 = holder.getChildAt(venn3_2Place - 1);
    holderVenn3_2.alpha = 0;
    holderVenn3_3 = holder.getChildAt(venn3_3Place - 1);
    holderVenn3_3.alpha = 0;
}



/**
 * Event to add two circle venn diagram
 * Checks Alpha of all diagrams and toggles based on button selected
 * @param {*} evt 
 */
function vennOneEvent(evt) {
    /*
    if (!isShapeFullSize) {
        updateAllShapeSize(1);
        isShapeFullSize = true;
    }
    */

    if (!(holderVenn2_1.alpha == 0)) {
        holderVenn2_1.alpha = 0;
        holderVenn2_2.alpha = 0;
        text_1.alpha = 0;
        text_2.alpha = 0;
    }
    if (!(holderVenn3_1.alpha == 0)) {
        holderVenn3_1.alpha = 0;
        holderVenn3_2.alpha = 0;
        holderVenn3_3.alpha = 0;
        text_1.alpha = 0;
        text_2.alpha = 0;
        text_3.alpha = 0;
    }
    if ((holderVenn1.alpha == 0)) {
        holderVenn1.alpha = 1;

        text_1.alpha = 1;
        text_1.x = canvas.width / 1.85;
        text_1.y = canvas.height / 100;
        /*
        if (holderVenn1.graphics._fill != null) {
            holderVenn1.alpha = .1;
        } else {
            
        }
        */

    } else {
        holderVenn1.alpha = 0;
        text_1.alpha = 0;
    }

    update = true;
}

/**
 * Event to add two circle venn diagram
 * Checks Alpha of all diagrams and toggles based on button selected
 * @param {*} evt 
 */
function vennTwoEvent(evt) {
    /*
    if (!isShapeFullSize) {
        updateAllShapeSize(1);
        isShapeFullSize = true;
    }
    */
    console.log(holderVenn2_1)

    if (!(holderVenn1.alpha == 0)) {
        holderVenn1.alpha = 0;
        text_1.alpha = 0;
    }
    if (!(holderVenn3_1.alpha == 0)) {
        holderVenn3_1.alpha = 0;
        holderVenn3_2.alpha = 0;
        holderVenn3_3.alpha = 0;
        text_1.alpha = 0;
        text_2.alpha = 0;
        text_3.alpha = 0;
    }
    if ((holderVenn2_1.alpha == 0)) {
        holderVenn2_1.alpha = 1;
        holderVenn2_2.alpha = 1;

        text_1.alpha = 1;
        text_1.x = canvas.width / 3.2;
        text_1.y = canvas.height / 100;
        text_2.alpha = 1;
        text_2.x = canvas.width / 1.48;
        text_2.y = canvas.height / 100;

    } else {
        holderVenn2_1.alpha = 0;
        holderVenn2_2.alpha = 0;

        text_1.alpha = 0;
        text_2.alpha = 0;
    }
    update = true;
}


/**
 * Event to add three circle venn diagram
 * Checks Alpha of all diagrams and toggles based on button selected
 * @param {*} evt 
 */
function vennThreeEvent(evt) {
    /*
    if (isShapeFullSize) {
        updateAllShapeSize(.8);
        isShapeFullSize = false;
    }
    */

    if (!(holderVenn1.alpha == 0)) {
        holderVenn1.alpha = 0;
        text_1.alpha = 0;
    }
    if (!(holderVenn2_1.alpha == 0)) {
        holderVenn2_1.alpha = 0;
        holderVenn2_2.alpha = 0;
        text_1.alpha = 0;
        text_2.alpha = 0;
    }
    if ((holderVenn3_1.alpha == 0)) {
        holderVenn3_1.alpha = 1;
        holderVenn3_2.alpha = 1;
        holderVenn3_3.alpha = 1;

        text_1.alpha = 1;
        text_1.x = canvas.width / 1.815;
        text_1.y = canvas.height / 140;
        text_2.alpha = 1;
        text_2.x = canvas.width / 4.4;
        text_2.y = canvas.height / 1.7;
        text_3.alpha = 1;
        text_3.x = canvas.width / 1.145;
        text_3.y = canvas.height / 1.7;
    } else {
        holderVenn3_1.alpha = 0;
        holderVenn3_2.alpha = 0;
        holderVenn3_3.alpha = 0;

        text_1.alpha = 0;
        text_2.alpha = 0;
        text_3.alpha = 0;
    }
    update = true;
}

function clearWorkspace(evt) {
    // Remove all children a restart init main method
    stage.removeAllChildren();
    init();
}


function tick(event) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (update || tweenRunningCount > 0) {
        update = false; // only update once
        stage.update(event);
    }
}

// attempt to resize on venn three. Does not work properly
/*
function updateAllShapeSize(miniTransform) {
 
    console.log(childCountShape[0][1])
    console.log(childCountShape[0][0])
 
 
    for (let i = 0; i < childCountShape.length; i++) {
        // Resize shapes if above the divider line on the stage
 
        console.log(childCountShape[i][0])
        childCountShape[i][0].setTransform(childCountShape[i][1], childCountShape[i][2], miniTransform, miniTransform);
        if (childCountShape[i][0].id == "smallRectangle" ||
            childCountShape[i][0].id == "largeRectangle") {
            childCountShape[i][0].rotation = 90;
        } if (childCountShape[i][0].id == "smallOctagon" ||
            childCountShape[i][0].id == "largeOctagon") {
            childCountShape[i][0].rotation = 22.5;
        }
 
    }
}
*/

/**
 * 
 * @param {*} evt 
 */
function VennMouseEvent(evt) {
    /*
    if (holderVenn1.alpha == 1) {
        //evt.currentTarget.graphics._fill.setStrokeStyle("blue");
        evt.currentTarget.graphics.beginFill("red");
        console.log(evt.currentTarget.graphics._fill);
 
        holder.removeChildAt(vennOnePlace - 1);
        let oneCircleVenn = new createjs.Shape();
        oneCircleVenn.graphics.setStrokeStyle(1).beginStroke("#000000").beginFill("red").
            drawCircle(canvas.width * .55, canvas.height * .325, canvas.width * .3);
        holder.addChild(oneCircleVenn);
        vennOnePlace = holder.numChildren;
        holderVenn1 = holder.getChildAt(vennOnePlace - 1);
        holderVenn1.alpha = .1;
        update = true;
 
        let hit = new createjs.Shape();
        hit.graphics.beginFill("#000").drawCircle(canvas.width * .55,
            canvas.height * .325, canvas.width * .3);
        holderVenn1.hitArea = hit;
        holderVenn1.on("click", VennMouseEvent);
 
 
        // tween 
    }
    else if (holderVenn1.alpha == .1) {
        console.log(evt.currentTarget.graphics._fill.style);
        holder.removeChildAt(vennOnePlace - 1);
        // Draw One Circle Venn
        let oneCircleVenn = new createjs.Shape();
        oneCircleVenn.graphics.setStrokeStyle(1).beginStroke("#000000")
            .drawCircle(canvas.width * .55, canvas.height * .325, canvas.width * .3);
        // Add shapes to holder to allow access to alpha modifier
        holder.addChild(oneCircleVenn);
        // Store position in holder
        vennOnePlace = holder.numChildren;
        // Set alpha to zero init
        holderVenn1 = holder.getChildAt(vennOnePlace - 1);
        holderVenn1.alpha = 1;
        update = true;
 
        // Create hit area for user selection of specific area on venn
        let hit = new createjs.Shape();
        hit.graphics.beginFill("#000").drawCircle(canvas.width * .55,
            canvas.height * .325, canvas.width * .3);
        holderVenn1.hitArea = hit;
        holderVenn1.on("click", VennMouseEvent);
    }
    if (holderVenn2_1.alpha == 1) {
 
    }
    if (holderVenn3_1.alpha == 1) {
 
    }
    */



}
