//const containter = 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");
const stageQuery = document.querySelector("#cavasDiv");

let stage;

// stage bound vars
let dividers = [];
let divContainers = 5;
// Banner Variables
let banners = [];
let nVal = 3;
let bannerHeight = 25;
let superscript = ["\u2074","\u00B3","\u00B2","\u00B9","\u2070"];

// Node stage tracker (enables collision detection)
let stageNodeTracker;

// draw select box variables
let stageSelectorBox;
let objectEventActive = false;
let selectedObjects = [];


let bottomLeftCircle;

//------------------------------------------------------
//
//		TODO:	
//				- trash button invisible until items selected (Hover tool )
//				- work on getting zoom offset working (Very Complicated!!)
//				- one set of numbers, inverted prot
//				- set leg bounds
//
//		Complete
//				- add delete button delete removes all object in stageNodeTracker
//				- drag onto board - remove tween
//				- Move all selected objects as one 
//				- Modify selector to select all, add new only deselect 
//					if no new is found? (slight bugs) (lag on mouseUp)
//				- protractor always top of board
//


function main() {
	stage = new createjs.Stage("canvas");

	// Selector Box
	stage.addEventListener("stagemousedown", handleStageMouseDown);
	stage.addEventListener("stagemouseup", handleStageMouseUp);

	// Enable touch input
	createjs.Touch.enable(stage);

	// initialize - used for selecting, group-move, and delete
	stageNodeTracker = new Array();

	// get and update container sizes & locations
	window.onresize = resizeUpdate;
	//window.addEventListener("resize", resizeUpdate);
	resizeUpdate();

	// Draw all stage elements
	drawStage();
	
	createjs.Ticker.framerate = 30;
	createjs.Ticker.addEventListener("tick", stage);

	enableButtons();
	
	
	// displays mouse location on stage, Development use only
	let distxDOM = document.getElementById("distx")
	let distyDOM = document.getElementById("disty")
	distxDOM.style.color = distyDOM.style.color = "black";
	createjs.Ticker.addEventListener("tick", function(){
		if (stage.mouseY >= bannerHeight) {
			stage.update(); 
			var distX = stage.mouseX
			var distY = stage.mouseY
			distxDOM.innerHTML = "Dist x: " + distX.toString();
			distyDOM.innerHTML = "Dist y: " +distY.toString();
		}
		
	});
	
}

function enableButtons() {
	let button1DOM = document.getElementById("button_1");
	button1DOM.onclick = function(){
		prompt('Hello world');
	}
}

//--------------------------------------------------------------------------------------
//
//							Functions
//
//--------------------------------------------------------------------------------------
// Leg to stage 
// - drawSelectorStage() 	- Loads img to XY for selector stage
// - generateTween() 		- Tween img to stage loc
// - handleTweenComplete() 	- Reset tween vars, call generate stage obj
// - handleImageLoad() 		- Generates stage object with nodes


//-----------------------------------------------------------------
// 
// Window Resize variable updates
//
//-----------------------------------------------------------------
function resizeUpdate(){
	windowSizeX = window.innerWidth;
	windowSizeY = window.innerHeight;

	canvas.height = mainStageElem.clientHeight;
	canvas.width = mainStageElem.clientWidth;

	if (bottomLeftCircle != null) {
		bottomLeftCircle.graphics.command.y = mainStageElem.clientHeight;
	}

	if (dividers[0] != null) {
		let space = mainStageElem.clientWidth/divContainers
		for (let i = 1; i <= divContainers; i++) {
			// Adjust Dividers
			dividers[i-1].graphics.command.x = (space*i);
			dividers[i-1].graphics.command.h = mainStageElem.clientHeight;
			banners[i-1].setTransform(i==1 ? (space*(i-1)) : (space*(i-1)+5), 0);
			banners[i-1].children[0].graphics.command.w =i==1 ? space : space-5;
			banners[i-1].children[1].x = (space)/2;
		}
		stage.update();
	}
}

//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				DRAW BUTTONS AND STATIC STAGE ELEMENTS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------


//---------------------------------------------------------------------
//
// Draw selector buttons stage
//
//---------------------------------------------------------------------
function drawStage(){
	let space = mainStageElem.clientWidth/divContainers;
	// divider
	for (let i = 1; i <= divContainers; i++) {
		dividers[i-1] = new createjs.Shape();
		dividers[i-1].graphics.beginFill("#FFFFFF").
			drawRect((space*i),0,5,mainStageElem.clientHeight);
		
		banners[i-1] = buildBanner(i);
		banners[i-1].setTransform(i==1 ? (space*(i-1)) : (space*(i-1)+5), 0);
		
		stage.addChild(dividers[i-1], banners[i-1]);
	}

	var topLeftCircle = new createjs.Shape();
	topLeftCircle.graphics.beginFill("#FFF000")
		.drawCircle(0, 0, 10);
	bottomLeftCircle = new createjs.Shape();
	bottomLeftCircle.graphics.beginFill("#FFF000")
		.drawCircle(0, mainStageElem.clientHeight, 10);
	stage.addChild(topLeftCircle, bottomLeftCircle);
}

function buildBanner(i){
	let banner = new createjs.Container();

	let space = mainStageElem.clientWidth/divContainers;
	let shape = new createjs.Shape();
	shape.graphics.beginFill("#005586")
		.drawRect(	0,
					0,
					i==1 ? space : space-5,
					bannerHeight)

	// Calculate index offset for superscript values
	let j = (i-1)-(divContainers-5);
	let text = new createjs.Text(nVal+superscript[j], "22px Times New Roman", "#FFFFFF");
	text.textAlign ="center";
	text.x = (space)/2;
	text.y = 3;
	
	banner.addChild(shape, text);
	banner.bannerId = i
	return banner;
}



//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 					 	DRAW STAGE OBJECTS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------



//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   STAGE INTERACTIVITY FEATURES
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------


//----------------------------------------------------
//
//		Stage object selection box event hadlers
//
//----------------------------------------------------
function handleStageMouseDown(event) {
	if (!event.primary) { return; }
	// Store current stage mouse location
	oldPt = new createjs.Point(stage.mouseX, stage.mouseY);

	stage.addEventListener("stagemousemove", handleStageMouseMove);
}

function handleStageMouseMove(event) {
	// if dragger active or mouse out of bounds return
	if (!event.primary  || objectEventActive) { return; }
	let stroke = 10;

	// Enable boundary on drawing selector box on selector stage
	let stageMouseX = stage.mouseX;

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
	
	// if dragger active or mouse out of bounds return
	if (objectEventActive ) { return; }
	let deselectAll = [];
	
	for (i = 0; i < stageNodeTracker.length; i++){
		hitTop = {x: stageNodeTracker[i].GlblTop.x, y: stageNodeTracker[i].GlblTop.y}
		hitBot = {x: stageNodeTracker[i].GlblBot.x, y: stageNodeTracker[i].GlblBot.y}
		
		//if (stageNodeTracker[i].type == "protractor") { continue }

		// Find lower and upper bounds
		let boundX, boundY;
		if (stage.mouseX<oldPt.x){
			boundX = {lower: stage.mouseX, upper: oldPt.x};
		} else {
			boundX = {lower: oldPt.x, upper: stage.mouseX};
		}
		if (stage.mouseY<oldPt.y){
			boundY = {lower: stage.mouseY, upper: oldPt.y};
		} else {
			boundY = {lower: oldPt.y, upper: stage.mouseY};
		}
		
		// Check if either node is within bounds of selector box
		if (hitTop.x > boundX.lower && hitTop.x < boundX.upper 
			&& hitTop.y > boundY.lower && hitTop.y < boundY.upper ||
			hitBot.x > boundX.lower && hitBot.x < boundX.upper 
			&& hitBot.y > boundY.lower && hitBot.y < boundY.upper) {
			
				// 1 indicates this is a multi-select event
			stageNodeTracker[i].selectType = 1
			// deselect stores if item need to be removed
			// update adds item to array or stages for deselect
			deselectAll.push(updateSelectedObjects(stageNodeTracker[i]));
		}
	}
	// if all objects selected are staged for deselection
	if (deselectAll.includes(true) && !deselectAll.includes(false)){
		// if ALL selected objects are included in current selection
		if (deselectAll.length == selectedObjects.length) {
			for (j = selectedObjects.length-1; j >= 0; j--){
				selectedObjects[j].shadow = null;
				selectedObjects.pop();
			} 
		} 
		// if partial deselect of currently selected
		else {
			for (j = 0; j < selectedObjects.length; j++){
				// deselect staged objects
				if (selectedObjects[j].stageForDeselect){
					selectedObjects[j].shadow = null;
					selectedObjects.splice(j, 1);
					j--;
				} 
			}
		}
	}
}


//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   		SEPERATE EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------






