/*
const red_div = document.getElementById("red");
const blue_div = document.getElementById("blue");
const yellow_div = document.getElementById("yellow");
const green_div = document.getElementById("green");
const purple_div = document.getElementById("purple");
const orange_div = document.getElementById("orange");
const prot_div = document.getElementById("protractor");
const prot_img = document.getElementById("protImgSelect");
const header = document.querySelector('header');
*/

//const containter = 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");
const stageQuery = document.querySelector("#cavasDiv");


let xMainStage, yMainStage, 
	xSltStage, ySltStge,
	xProt, yProt, wProt, hProt;
let windowSizeX, windowSizeY;
let stage, selectorStage;
let tweenObj;

let divider;
let dividerLocX = window.innerWidth*.155;
let scale = .3;
let legToBoard = 150;
let stageProtActive = false;

let tweenRunningCount = 0;
let restoreLeg;
var xTween, yTween;
let xToStage, yToStage;

function main() {

	stage = new createjs.Stage("canvas");

	// get and update container sizes & locations
	window.addEventListener("resize", resizeUpdate);
	resizeUpdate();

	drawSelectorStage();

	/*
	xToStage = legToBoard*2;
	yToStage = legToBoard;
	var image = new Image();
	image.src = "./res/orange.png";
	image.onload = handleImageLoad;
	*/

	/*
	protHandler(prot_img);
	*/

	createjs.Ticker.framerate = 20;
	//createjs.Ticker.addEventListener("tick", stage);

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




//--------------------------------------------------------------------------------------------------------------
//
//							Functions
//
//--------------------------------------------------------------------------------------------------------------
function drawSelectorStage(){

	let width = 200;
	let height = 800;

	let pt = {x: width*.07, y: height*.05}
	let red = loadImgBitmap("./res/red.png", pt);
	pt = {x: width*.23, y: height*.05}
	let blue = loadImgBitmap("./res/blue.png", pt);
	pt = {x: width*.39, y: height*.05}
	let yellow = loadImgBitmap("./res/yellow.png", pt);
	pt = {x: width*.55, y: height*.05}
	let green = loadImgBitmap("./res/green.png", pt);
	pt = {x: width*.71, y: height*.05}
	let purple = loadImgBitmap("./res/purple.png", pt);
	pt = {x: width*.87, y: height*.05}
	let orange = loadImgBitmap("./res/orange.png", pt);

	handleSelectEvt(red);
	handleSelectEvt(blue);
	handleSelectEvt(yellow);
	handleSelectEvt(green);
	handleSelectEvt(purple);
	handleSelectEvt(orange);

	// Protractor
	let image = new Image();
	image.src = "./res/protractWhiteMod.png"
	image.id = "prot";
	let protBitmap = new createjs.Bitmap(image);
	protBitmap.setTransform(width*.05, height*.55, scale*.85, scale*.85);

	handleSelectEvt(protBitmap);
	

	// divider
	divider = new createjs.Shape();
	divider.graphics.beginFill("#FFFFFF")
		.drawRect(210,0,5,window.innerHeight)


	stage.addChild(red, blue, yellow, green, purple, orange, protBitmap, divider);

	function loadImgBitmap(imgSrc, offset){
		let image = new Image();
		image.src = imgSrc;
		let bitmap = new createjs.Bitmap(image);
		bitmap.setTransform(offset.x, offset.y, scale*1.3, scale*1.3);
		return bitmap;
	}
}

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
		if (leg.x < dividerLocX) {
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

//---------------------------------------------------------------------
// TWEEN TO STAGE
//---------------------------------------------------------------------
function generateTween(obj){
	tweenObj = obj.clone();

	let tweenXScale, tweenYScale;
	if (tweenObj.image.id == 'prot'){
		if (!stageProtActive) {
			yTween = xTween = window.innerHeight*.4
			tweenXScale = tweenYScale = scale*1.5;
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
		1000, createjs.Ease.get(1))
	.call(handleTweenComplete);
}

function handleTweenComplete() {
	tweenRunningCount--;
	var image = new Image();
	image.src = tweenObj.image.src;
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

//--------------------------------------------------------------------
// CREATE PROTRACTOR
//---------------------------------------------------------------------
function createStageProt(event) {
	var image = event.target;
	var bitmap = new createjs.Bitmap(image);
	let width = bitmap.image.width*.5;
	let height = bitmap.image.height*.4;

	bitmap.setTransform(0,0, .5, .5);
	
	stage.addChild(bitmap);
	stageProtActive = true;

	var midCircle = new createjs.Shape();
	midCircle.graphics.beginFill("#000000")
		.drawCircle(width*.5-1, height*.62, 15*scale);

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
	handleLegContainer(container);

	handleHingeHit(bottomCircle);
}

//--------------------------------------------------------------------
// CREATE LEGS
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
		.drawCircle((width*.5), (width*.5)-1, 10*scale);
	topCircle.id = "top";
	var topHit = new createjs.Shape();
		topHit.graphics.beginFill("#000000")
			.drawCircle((width*.5), (width*.5)-1, 40*scale);
	topCircle.hitArea = topHit;
	
	
	var bottomCircle = new createjs.Shape();
	bottomCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5+1), (height-(width*.5)+1), 10*scale);
	bottomCircle.id = "bottom";
	var botHit = new createjs.Shape();
		botHit.graphics.beginFill("#000000")
			.drawCircle((width*.5+1), (height-(width*.5)+1), 40*scale);
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
// This function enables dragger movement of leg objects
//-----------------------------------------------------------------
function handleLegContainer(dragger){

	stage.addChild(dragger);
	dragger.x = xToStage;
	dragger.y = yToStage;

	dragger.on("mousedown", function(evt) {
		dragger._listeners.pressup = dragger.pressupStore;

		// reposition dragger to top
		stage.removeChild(dragger);
		stage.addChild(dragger);
		// Store original location to calc xy dist traveled
		dragger.offset = { x: dragger.x - evt.stageX, y: dragger.y - evt.stageY };
	});
	
	dragger.on("pressmove",function(evt) {
		dragger.x = evt.stageX + dragger.offset.x;
		dragger.y = evt.stageY + dragger.offset.y;

		// redraw the stage to show the change:
		stage.update();   
	});

	dragger.on("pressup", function(evt) {
	});
	dragger.pressupStore = dragger._listeners.pressup;			
}



//-----------------------------------------------------------------
// Hitbox for "top" node on legs
//-----------------------------------------------------------------
function handleHingeHit(hitbox){

	let radOffset, radAngle, offset;
	let angle = 0;
	// hinge hit controlls move/rotation the entire leg container
	let dragger = hitbox.parent;
	// holds main container listeners to disable until rotation complete
	let pauseMousemove;

	hitbox.addEventListener("mousedown", function() {

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

		radAngle = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);
		angle = radAngle * (180 / Math.PI) - offset;
		dragger.rotation = angle;
		
		stage.update();   
	});

	hitbox.on("pressup", function(evt) {	
		// restore registration and xy coords
		restoreDragger(hitbox);
		// restore listener for moving object
		dragger._listeners = pauseMousemove;
		dragger._listeners.pressup = null;

	});
}

// setRegPt - Set Registration Point
// Update registration point of container to rotate around proper hinge
// 
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

// Restore dragger pts
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


	if (hitbox.id == "top"){	
		dragger.x = ptTop.x-(Math.cos(rad+(Math.PI/4))*hypot);
		dragger.y = ptTop.y-(Math.sin(rad+(Math.PI/4))*hypot);
		dragger.regX = 0;
		dragger.regY = 0;
		hitbox.xGlbl = topLoc.x;
		hitbox.yGlbl = topLoc.y;

	} else if  (hitbox.id == "bottom"){
		dragger.x = ptTop.x-(Math.cos(rad+(Math.PI/4))*hypot);
		dragger.y = ptTop.y-(Math.sin(rad+(Math.PI/4))*hypot);
		dragger.regX = 0;
		dragger.regY = 0;
		hitbox.xGlbl = botLoc.x;
		hitbox.yGlbl = botLoc.y;
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
