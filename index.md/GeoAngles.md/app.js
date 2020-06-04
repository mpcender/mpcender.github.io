//const containter = 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");
const stageQuery = document.querySelector("#cavasDiv");


let xMainStage, yMainStage, 
	xSltStage, ySltStge,
	xProt, yProt, wProt, hProt;
let windowSizeX, windowSizeY;
let stage, selectorStage;

// stage bound vars
let divider;
let dividerLocX = 210;
let scale = .4;
let scaleSelect = .3;
let legToBoard = 150;
let stageProtActive = false;

// Tween Vars
let tweenRunningCount = 0;
let tweenObj;
let restoreLeg;
var xTween, yTween;
let xToStage, yToStage;
let tweenCircle;

// Node stage tracker (enables collision detection)
let stageNodeTracker;
let stageIdInc = 1000;
let angleDispCont;

// Allows changing angle of legs by increments
let deg5Active = false;
let deg2p5Active = false;

// draw select box variables
let drawingCanvas;
let index =0;
let stageSelectorBox;
let objectEventActive = false;
let selectedObjects;


function main() {

	stage = new createjs.Stage("canvas");
	stage.addEventListener("stagemousedown", handleStageMouseDown);
	stage.addEventListener("stagemouseup", handleStageMouseUp);
	

	createjs.Touch.enable(stage);

	stageNodeTracker = new Array();

	// get and update container sizes & locations
	window.addEventListener("resize", resizeUpdate);
	resizeUpdate();

	drawSelectorStage();

	//Activate 5 degree selector
	degSel5Cont.children[0].graphics._fill.style = "#0066AA"
	deg5Active = true;
	
	createjs.Ticker.framerate = 30;
	createjs.Ticker.addEventListener("tick", stage);
	
	let distxDOM = document.getElementById("distx")
	let distyDOM = document.getElementById("disty")
	distxDOM.style.color = distyDOM.style.color = "white";
	createjs.Ticker.addEventListener("tick", function(){
		stage.update(); 
		var distX = stage.mouseX
		var distY = stage.mouseY
		distxDOM.innerHTML = "Dist x: " + distX.toString();
		distyDOM.innerHTML = "Dist y: " +distY.toString();
	});
}


//----------------------------------------------------
//
//		Stage object selection box
//
//----------------------------------------------------
function handleStageMouseDown(event) {
	if (!event.primary) { return; }
	stroke = 10;
	oldPt = new createjs.Point(stage.mouseX, stage.mouseY);
	stage.addEventListener("stagemousemove", handleStageMouseMove);
}

function handleStageMouseMove(event) {
	if (!event.primary || oldPt.x < dividerLocX  || objectEventActive) { return; }
	
	// prevent select box being drawn on 
	let stageMouseX = stage.mouseX;
	if (stageMouseX < dividerLocX){
		stageMouseX = dividerLocX;
	}

	stage.removeChild(stageSelectorBox)
	let shape = new createjs.Shape();
	shape.graphics.setStrokeDash([stroke * 2, stroke]).
		beginStroke("#FFFFFF").rect(oldPt.x, oldPt.y,
			stageMouseX - oldPt.x, stage.mouseY - oldPt.y);
	
	stageSelectorBox = shape;
    stage.addChild(stageSelectorBox);

	stage.update();
}

function handleStageMouseUp(event) {
	if (!event.primary) { return; }
	stage.removeChild(stageSelectorBox)
	stage.removeEventListener("stagemousemove", handleStageMouseMove);

	//console.log(oldPt)
	//console.log(event)
	for (i = 0; i < stageNodeTracker.length; i++){
		hitTop = {x: stageNodeTracker[i].GlblTop.x, y: stageNodeTracker[i].GlblTop.y}
		hitBot = {x: stageNodeTracker[i].GlblBot.x, y: stageNodeTracker[i].GlblBot.y}
		//----------------------------------------------------
		//
		//		Do stuff to select objects
		//
		//----------------------------------------------------

		//if (hitTop.x )

	}
}




//--------------------------------------------------------------------------------------
//
//							Functions
//
//--------------------------------------------------------------------------------------
// Leg to stage 
// - drawSelectorStage() 	- Loads img to XY for selector stage
// - handleSelectEvt()		- Evt handlers for buttons to add to main stage
// - generateTween() 		- Tween img to stage loc
// - handleTweenComplete() 	- Reset tween vars, call generate stage obj
// - handleImageLoad() 		- Generates stage object with nodes
// - handleLegContainer() 	- Evt handler for let object container


//---------------------------------------------------------------------
//
// Draw selector buttons stage
//
//---------------------------------------------------------------------
function drawSelectorStage(){

	let width = 200;
	let height = 800;

	let pt = {x: width*.07, y: height*.015}
	let red = loadImgBitmap("./res/red.png", pt);
	pt = {x: width*.23, y: height*.015}
	let blue = loadImgBitmap("./res/blue.png", pt);
	pt = {x: width*.39, y: height*.015}
	let yellow = loadImgBitmap("./res/yellow.png", pt);
	pt = {x: width*.55, y: height*.015}
	let green = loadImgBitmap("./res/green.png", pt);
	pt = {x: width*.71, y: height*.015}
	let purple = loadImgBitmap("./res/purple.png", pt);
	pt = {x: width*.87, y: height*.015}
	let orange = loadImgBitmap("./res/orange.png", pt);

	handleSelectEvt(red);
	handleSelectEvt(blue);
	handleSelectEvt(yellow);
	handleSelectEvt(green);
	handleSelectEvt(purple);
	handleSelectEvt(orange);

	// Protractor
	let image = new Image();
	image.src = "./res/protractWhiteMod2.png"
	image.id = "prot";
	let protBitmap = new createjs.Bitmap(image);
	protBitmap.setTransform(width*.05, height*.45, 
		scaleSelect*.85, scaleSelect*.85);

	handleSelectEvt(protBitmap);

	// Display the current legs angle
	drawAngleDisplay();

	// divider
	divider = new createjs.Shape();
	divider.graphics.beginFill("#FFFFFF")
		.drawRect(dividerLocX,0,5,window.innerHeight)


	stage.addChild(red, blue, yellow, green, purple, orange, protBitmap, divider);

	function loadImgBitmap(imgSrc, offset){
		let image = new Image();
		image.src = imgSrc;
		let bitmap = new createjs.Bitmap(image);
		bitmap.setTransform(offset.x, offset.y, scaleSelect*1.3, scaleSelect*1.3);
		return bitmap;
	}
}

function drawAngleDisplay() {
	// determine invisible hitbox
	let background = new createjs.Shape();
	background.graphics.beginStroke('#FFFFFF').setStrokeStyle(2);
	background.graphics.beginFill("#000000").drawRect(10, window.innerHeight*.725,130,60);
	angleDispCont = new createjs.Container();
	let angleMaskDisp = background.clone();
	let angleMaskHit = background.clone();
	let angleRevealTxt = new createjs.Text("Reveal Angle", "18px Balsamiq Sans", "#FFFFFF");
	angleRevealTxt.setTransform(75, window.innerHeight*.75);
	angleRevealTxt.textAlign ="center";
	angleDispCont.hitArea = angleMaskHit;
	angleDispCont.addChild(angleMaskDisp,angleRevealTxt);
	angleDsp = new createjs.Text("0 \u00B0", "42px Balsamiq Sans", "#FFFFFF");
	angleDsp.setTransform(70, window.innerHeight*.74);
	angleDsp.textAlign ="center"

	angleDispCont.on("click", function(evt) {
		if (angleDispCont.alpha) {
			angleDispCont.alpha = 0;
		} else {
			angleDispCont.alpha = 1;
		}
	});

	degSel5Cont = new createjs.Container();
	let degSel5 = new createjs.Shape();
	degSel5.graphics.beginStroke('#FFFFFF').setStrokeStyle(2);
	degSel5.graphics.beginFill("#000000").drawRect(150, window.innerHeight*.725,50,28);
	//let angleMaskDisp = degSel5.clone();
	let degSel5Txt = new createjs.Text("5 \u00B0", "18px Balsamiq Sans", "#FFFFFF");
	degSel5Txt.setTransform(175, window.innerHeight*.7325);
	degSel5Txt.textAlign ="center";
	degSel5Cont.addChild(degSel5, degSel5Txt);

	degSel5Cont.on("click", function(evt) {
		if (degSel5Cont.children[0].graphics._fill.style == "#000000") {
			//Activate 5 degree selector
			degSel5Cont.children[0].graphics._fill.style = "#0066AA"
			deg5Active = true;
			//Deactivate 2.5 degree selector
			degSel2p5Cont.children[0].graphics._fill.style = "#000000"
			deg2p5Active = false;
		} else {
			degSel5Cont.children[0].graphics._fill.style = "#000000"
			deg5Active = false;
		}
	});

	degSel2p5Cont = new createjs.Container();
	let degSel2p5 = new createjs.Shape();
	degSel2p5.graphics.beginStroke('#FFFFFF').setStrokeStyle(2);
	degSel2p5.graphics.beginFill("#000000").drawRect(150, window.innerHeight*.76,50,28);
	//let angleMaskDisp = degSel5.clone();
	let degSel2p5Txt = new createjs.Text("2.5 \u00B0", "18px Balsamiq Sans", "#FFFFFF");
	degSel2p5Txt.setTransform(175, window.innerHeight*.768);
	degSel2p5Txt.textAlign ="center";
	degSel2p5Cont.addChild(degSel2p5, degSel2p5Txt);

	degSel2p5Cont.on("click", function(evt) {
		if (degSel2p5Cont.children[0].graphics._fill.style == "#000000") {
			//Activate 2.5 degree selector
			degSel2p5Cont.children[0].graphics._fill.style = "#0066AA"
			deg2p5Active = true;
			//Deactivate 5 degree selector
			degSel5Cont.children[0].graphics._fill.style = "#000000"
			deg5Active = false;
		} else {
			degSel2p5Cont.children[0].graphics._fill.style = "#000000"
			deg2p5Active = false;
		}
	});
	

	stage.addChild(background,angleDsp,angleDispCont);
	stage.addChild(degSel5Cont);
	stage.addChild(degSel2p5Cont);
}



//---------------------------------------------------------------------
//
// TWEEN TO STAGE
//
//---------------------------------------------------------------------
function generateTween(obj){
	if (tweenRunningCount) {
		return;
	}
	tweenObj = obj.clone();

	let tweenXScale, tweenYScale;
	if (tweenObj.image.id == 'prot'){
		if (!stageProtActive) {
			tweenXScale = tweenYScale = scale*1.25;
			stageProtActive = true;
		} else { 
			return
		}
	} else {
		tweenXScale = tweenYScale = scale;
	}

	stage.addChild(tweenObj)
	stage.update();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", stage);
    tweenRunningCount++;
    createjs.Tween.get(tweenObj, { loop: false }, null, false)
	.to({ x: xTween, y: yTween, scaleX: tweenXScale, scaleY: tweenYScale}, 
		1000, createjs.Ease.get(2))
	.call(handleTweenComplete);
}

function handleTweenComplete() {
	tweenRunningCount--;
	var image = new Image();
	image.src = tweenObj.image.src;
	// Check if new object is protractor
	if (tweenObj.image.id == 'prot'){
		image.onload = createStageProt;
	} else {
		image.onload = handleImageLoad;
	}
	xTween = 0;
    yTween = 0;
	stage.removeChild(tweenObj);
}

function tick(event) {
	// this set makes it so the stage only re-renders when 
	// an event handler indicates a change has happened.
    if (update || tweenRunningCount > 0) {
        update = false; // only update once
        tweenStage.update(event);
    }
}

//---------------------------------------------------------------------
//
// CREATE PROTRACTOR
//
//---------------------------------------------------------------------
function createStageProt(event) {
	var image = event.target;
	var bitmap = new createjs.Bitmap(image);
	let width = bitmap.image.width*.5;
	let height = bitmap.image.height*.5;

	bitmap.setTransform(0, 0, .5, .5);
	
	stage.addChild(bitmap);
	stageProtActive = true;

	var midCircle = new createjs.Shape();
	midCircle.graphics.beginFill("#000000")
		.drawCircle(width*.5-1, height*.5, 15*scale);

	var bottomCircle = new createjs.Shape();
	bottomCircle.graphics.beginFill("#FFFFFF")
		.drawCircle(width, (width*.5)+12, 15*scale);
	bottomCircle.id = "bottom";
	var botHit = new createjs.Shape();
		botHit.graphics.beginFill("#000000")
			.drawCircle(width, (width*.5), 70*scale);
	bottomCircle.hitArea = botHit;

	// Create container for PNG and hitboxes
	var container = new createjs.Container();
	container.topInsetX = (width*.5);
	container.topInsetY = (width*.5);
	container.bottomInsetX = (width*.5);
	container.bottomInsetY = (height-(width*.5));

	// Add container to stage
	container.addChild(bitmap, bottomCircle, midCircle);
	container.type = "protractor";
	handleLegContainer(container);

	handleHingeHit(bottomCircle);
}

//---------------------------------------------------------------------
//
// CREATE LEGS
//
//---------------------------------------------------------------------
function handleImageLoad(event) {
	// Setup for importing resource PNG
	var image = event.target;
	var bitmap = new createjs.Bitmap(image);
	let width = bitmap.getBounds().width * scale;
	let height = bitmap.getBounds().height* scale;
	

	// Create hitbox circles
	var topCircle = new createjs.Shape();
	topCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5), (width*.5), 10*scale);
	topCircle.id = "top";
	var topHit = new createjs.Shape();
		topHit.graphics.beginFill("#000000")
			.drawCircle((width*.5), (width*.5), 40*scale);
	topCircle.hitArea = topHit;
	
	
	var bottomCircle = new createjs.Shape();
	bottomCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5), (height-(width*.5)), 10*scale);
	bottomCircle.id = "bottom";
	var botHit = new createjs.Shape();
		botHit.graphics.beginFill("#000000")
			.drawCircle((width*.5), (height-(width*.5)), 40*scale);
	bottomCircle.hitArea = botHit;
	
	// Create container for PNG and hitboxes
	var container = new createjs.Container();
	container.topInsetX = (width*.5);
	container.topInsetY = (width*.5);
	container.bottomInsetX = (width*.5);
	container.bottomInsetY = (height-(width*.5));

	// Add container to stage
	container.addChild(bitmap, topCircle, bottomCircle);
	handleLegContainer(container);
	
	bitmap.setTransform(0, 0, scale, scale);

	handleHingeHit(topCircle);
	handleHingeHit(bottomCircle);
	
}

//---------------------------------------------------------------
// 
//	Event handlers for left stage selector buttons
//
//-----------------------------------------------------------------
function handleSelectEvt(leg){
	leg.on("mousedown", function(evt) {
		
		leg.oldX = leg.x;
		leg.oldY = leg.y;
		// Store original location to calc xy dist traveled
		leg.offset = { x: leg.x - evt.stageX, y: leg.y - evt.stageY };
	});
	
	leg.on("pressmove",function(evt) {
		leg.x = evt.stageX + leg.offset.x;
		leg.y = evt.stageY + leg.offset.y;

		// redraw the stage to show the change:
		stage.update();   
	});

	leg.on("pressup", function(evt) {
		if (leg.x < dividerLocX*1.3) {
			if (Math.abs(leg.x-leg.oldX) < 5 && Math.abs(leg.y-leg.oldY) < 5) {
				xToStage = xTween = legToBoard*2;
				yToStage = yTween = legToBoard;
				generateTween(leg)
				leg.x = leg.oldX;
				leg.y = leg.oldY;
			} else {
				leg.x = leg.oldX;
				leg.y = leg.oldY;
			}
		} else {
			xToStage = xTween = leg.x;
			yToStage = yTween = leg.y;
			leg.x = leg.oldX;
			leg.y = leg.oldY;
			generateTween(leg)
		}
		
	});
}

//----------------------------------------------------------------
//
// This function enables dragger movement of leg objects
//
//-----------------------------------------------------------------
function handleLegContainer(dragger){

	stage.addChild(dragger);
	dragger.x = xToStage;
	dragger.y = yToStage;

	// Store node locations to container
	// updates on rotate complete - restoreDragger()
	let ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
	let ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
	dragger.GlblTop = ptTop;
	dragger.GlblBot = ptBot;
	// Save object to array
	stageNodeTracker.push(dragger);
	dragger.id = stageIdInc++;

	dragger.on("mousedown", function(evt) {
		// wont draw selector box if moving object on stage
		objectEventActive = true;
		// pause listener
		dragger._listeners.pressup = dragger.pressupStore;
		// reposition dragger to top
		stage.removeChild(dragger);
		stage.addChild(dragger);
		// Store original location to calc xy dist traveled
		dragger.offset = { x: dragger.x - evt.stageX, y: dragger.y - evt.stageY };
	});
	
	dragger.on("pressmove",function(evt) {
		// partial border detection, keep legs of selector stage
		if (evt.stageX < dividerLocX) {return}
		// pause listeners
		stage._listeners.handleStageMouseDown= null
		stage._listeners.handleStageMouseMove = null;
		// update dragger position on stage
		if (Math.abs(evt.stageX + dragger.offset.x) > 5 
		&& Math.abs(evt.stageY + dragger.offset.y) > 5){
			dragger.x = evt.stageX + dragger.offset.x;
			dragger.y = evt.stageY + dragger.offset.y;
		}
		// redraw the stage to show the change:
		stage.update();   
	});

	dragger.on("pressup", function(evt) {
		objectEventActive = false;
		// Update node trackers
		ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
		ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
		dragger.GlblTop = ptTop;
		dragger.GlblBot = ptBot;
		// Check stage objects and snap to node in range
		snapCollisionTest(dragger);
	});
	dragger.pressupStore = dragger._listeners.pressup;	
	//stage._listeners = stage.pauseListener;
}

//---------------------------------------------------------------------------------
//
//							COLLISION DETECTION
// 		Collision detection to snap pieces together based on nodes on board
//
//---------------------------------------------------------------------------------
function snapCollisionTest(dragger) {
	
	let DrgTop = {x: dragger.GlblTop.x, y: dragger.GlblTop.y}
	let DrgBot = {x: dragger.GlblBot.x, y: dragger.GlblBot.y}
	let hitTop, hitBot;
	// Disables multiple update dragger calls
	let alreadyMoved;
	// Range of snap
	let rng = 35 * scale;
	// Determine which nodes collide
	let topToTop, topToBot, botToTop, botToBot;
	// Check if current node on protractor, Necessary?
	let protNode = false;

	for (i = 0; i < stageNodeTracker.length; i++){
		if (stageNodeTracker[i].id != dragger.id){
			hitTop = {x: stageNodeTracker[i].GlblTop.x, y: stageNodeTracker[i].GlblTop.y}
			hitBot = {x: stageNodeTracker[i].GlblBot.x, y: stageNodeTracker[i].GlblBot.y}
			topToTop = {x: DrgTop.x-hitTop.x, y: DrgTop.y-hitTop.y};
			topToBot = {x: DrgTop.x-hitBot.x, y: DrgTop.y-hitBot.y};
			botToTop = {x: DrgBot.x-hitTop.x, y: DrgBot.y-hitTop.y};
			botToBot = {x: DrgBot.x-hitBot.x, y: DrgBot.y-hitBot.y};

			// eleminate top node on protracor for evaluation
			if (stageNodeTracker[i].type == "protractor"){
				hitTop.x = hitTop.y = 100;
			}
			// if two nodes connect within 10 px
			// snap to location of node found, evaluat angle, and exit loop
			if (Math.abs(topToTop.x) < rng && Math.abs(topToTop.y)< rng){
				//console.log("top-top collision")
				updateDragger(topToTop);
				evaluateAngle(hitTop, DrgBot, hitBot);
				alreadyMoved = true;
				//i = stageNodeTracker.length;
			}
			else if (Math.abs(topToBot.x) < rng && Math.abs(topToBot.y) < rng){
				//console.log("top-bot collision")
				updateDragger(topToBot);
				evaluateAngle(hitBot, DrgBot, hitTop);
				alreadyMoved = true;
				//i = stageNodeTracker.length;
			}
			else if (Math.abs(botToTop.x) < rng && Math.abs(botToTop.y)< rng){
				//console.log("bot-top collision")
				updateDragger(botToTop);
				evaluateAngle(hitTop, DrgTop, hitBot);
				alreadyMoved = true;
				//i = stageNodeTracker.length;
			}
			else if (Math.abs(botToBot.x) < rng && Math.abs(botToBot.y)< rng){
				//console.log("bot-bot collision")
				updateDragger(botToBot);
				evaluateAngle(hitBot, DrgTop, hitTop);
				alreadyMoved = true;
				//i = stageNodeTracker.length;
			}
		}
	}
	// reposition selected dragger to location of node found
	function updateDragger(pt){
		// Disables multiple update dragger calls
		if (alreadyMoved) {return;}
		// update acutal dragger location on screen by offset
		dragger.x += -pt.x;
		dragger.y += -pt.y;
		// update global node tracker variables
		dragger.GlblTop.x += -pt.x;
		dragger.GlblTop.y += -pt.y;
		dragger.GlblBot.x += -pt.x;
		dragger.GlblBot.y += -pt.y;
		// update parentFunction var for use in evaluateAngle
		DrgTop = {x: dragger.GlblTop.x, y: dragger.GlblTop.y}
		DrgBot = {x: dragger.GlblBot.x, y: dragger.GlblBot.y}
	}

	// determine the angle between the two legs
	// p1 = shared node, p2 dragger node, p3 adjustTo node
	function evaluateAngle(p1, p2, p3){
		pingPoint(p1);

		if (stageNodeTracker[i].type == "protractor" ||
			dragger.type == "protractor"){
				//console.log("Prot Stuff")
				// do protractor stuff?
		} else {
			// compute angle based on legs being snapped
			theta = Math.atan2(p3.y - p1.y, p3.x - p1.x) - 
					Math.atan2(p2.y - p1.y, p2.x - p1.x);
			// convert to degrees and absolute value
			let degree = Math.abs(theta * (180/Math.PI));
			// only show angle less than 180 deg
			if (degree > 180){
				degree = 360 - degree;
			}
			// Updates angle readout (constrain to .5 increments)
			angleDsp.text = Math.round(degree / .5) * .5+ " \u00B0";
			//angleDsp.text = Math.round(degree) + " \u00B0";
		}
	}

	function pingPoint(p1) {
		// disable protractor ping due to offset problem
		if (stageNodeTracker[i].type == "protractor") { return }
		
		tweenCircle = new createjs.Shape();
		tweenCircle.graphics.beginFill("#FFFFFF")
		.drawCircle(p1.x, p1.y, 10*scale);
		tweenCircle.alpha = 1;
		stage.addChild(tweenCircle);

		//console.log(tweenCircle)

		tweenRunningCount++;
    	createjs.Tween.get(tweenCircle, { loop: false }, null, false)
		.to({x: -p1.x*2, y: -p1.y*2, scaleX: 3, scaleY: 3}, 750, createjs.Ease.get(1))
		.call(handleTweenBubbleComp);
		tweenRunningCount++;
    	createjs.Tween.get(tweenCircle, { loop: false }, null, false)
		.to({alpha: 0}, 1500, createjs.Ease.get(1))
		.call(handleTweenBubbleComp);
		
	}

	function handleTweenBubbleComp() {
		tweenRunningCount--;
		stage.removeChild(tweenCircle);
	}
}

//-----------------------------------------------------------------
//
// Hitbox for "top" node on legs
//
//-----------------------------------------------------------------
function handleHingeHit(hitbox){

	let radOffset, radAngle, offset;
	let angle = 0;
	// hinge hit controlls move/rotation the entire leg container
	let dragger = hitbox.parent;
	// holds main container listeners to disable until rotation complete
	let pauseMousemove;

	hitbox.addEventListener("mousedown", function() {
		// wont draw selector box if moving object on stage
		objectEventActive = true;

		// pause event listener for moving object
		pauseMousemove = dragger._listeners
		dragger._listeners = null

		setRegPt(hitbox);

		// Determine initial offset, and take off shape rotation
		radOffset = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);
		offset = radOffset * (180 / Math.PI) - dragger.rotation;
	})

	hitbox.on("pressmove",function(evt) {
		// prevent rotation onto selector stage
		if (stage.mouseX < dividerLocX + 15){return}

		radAngle = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);
		angle = radAngle * (180 / Math.PI) - offset;

		if (deg5Active){
			dragger.rotation = Math.round(angle / 5) * 5
		} else if (deg2p5Active){
			dragger.rotation = Math.round(angle / 2.5) * 2.5
		} else {
			dragger.rotation = Number(angle).toFixed(1);
		}
	

		stage.update();   
	});

	hitbox.on("pressup", function(evt) {	
		objectEventActive = false;
		// restore registration and xy coords
		restoreDragger(hitbox);
		// Update node trackers
		ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
		ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
		dragger.GlblTop = ptTop;
		dragger.GlblBot = ptBot;
		snapCollisionTest(dragger)
		// restore listener for moving object
		dragger._listeners = pauseMousemove;
		dragger._listeners.pressup = null;

	});
}

//---------------------------------------------------------------------------
//
// Set Registration Point
// Update registration point of container to rotate around proper hinge
// 
//---------------------------------------------------------------------------
function setRegPt(hitbox){
	// Get dragger container for hitbox
	let dragger = hitbox.parent;
	// Compute global (stage) XY locations of hinge nodes
	let ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
	let ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
	// Compute local (container) XY locations of hinge nodes
	let topLoc = dragger.globalToLocal(ptTop.x,ptTop.y)
	let botLoc = dragger.globalToLocal(ptBot.x,ptBot.y)

	if (hitbox.id == "top"){
		// Transform offset to negate change in registration point
		dragger.x += ptBot.x - dragger.x;
		dragger.y += ptBot.y - dragger.y;
		// Modify registration point to opposite hinge node
		// This allows the object to be rotated around opposite node
		dragger.regX = botLoc.x;
		dragger.regY = botLoc.y;
	} else if  (hitbox.id == "bottom"){
		// Transform offset to negate change in registration point
		dragger.x += ptTop.x - dragger.x;
		dragger.y += ptTop.y - dragger.y;
		// Modify registration point to opposite hinge node
		// This allows the object to be rotated around opposite node
		dragger.regX = topLoc.x;
		dragger.regY = topLoc.y;
	}
}

//---------------------------------------------------------------------------
//
// Restore dragger pts
// 
//---------------------------------------------------------------------------
function restoreDragger(hitbox){
	// Get dragger container for hitbox
	let dragger = hitbox.parent;
	// Compute global (stage) XY locations of hinge nodes

	let ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
	let ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
	// Compute local (container) XY locations of hinge nodes
	let topLoc = dragger.globalToLocal(ptTop.x,ptTop.y)
	let botLoc = dragger.globalToLocal(ptBot.x,ptBot.y)

	let rad = dragger.rotation / (180 / Math.PI);
	let hypot = Math.sqrt(Math.pow(topLoc.x, 2)
						+Math.pow(topLoc.y, 2))

	// Updates location of top and bottom node to container
	// Init and update in handleLegContainer() 
	dragger.GlblTop = ptTop;
	dragger.GlblBot = ptBot;

	if (hitbox.id == "top"){	
		dragger.x = ptTop.x-(Math.cos(rad+(Math.PI/4))*hypot);
		dragger.y = ptTop.y-(Math.sin(rad+(Math.PI/4))*hypot);
		dragger.regX = 0;
		dragger.regY = 0;
	} else if  (hitbox.id == "bottom"){
		dragger.x = ptTop.x-(Math.cos(rad+(Math.PI/4))*hypot);
		dragger.y = ptTop.y-(Math.sin(rad+(Math.PI/4))*hypot);
		dragger.regX = 0;
		dragger.regY = 0;
	}
}




//-----------------------------------------------------------------
// Manages resize variables on window size change
//-----------------------------------------------------------------
function resizeUpdate(){
	windowSizeX = window.innerWidth;
	windowSizeY = window.innerHeight;
	
	xMainStage = mainStageElem.parentNode.offsetLeft + mainStageElem.offsetLeft;
	yMainStage = mainStageElem.parentNode.offsetTop + mainStageElem.offsetTop;

	canvas.width = windowSizeX*.895;
	canvas.height = windowSizeY*.795;

	// adjust divider height on resize
	if (divider != null){
		divider.graphics.command.h = canvas.height;
	}
}
