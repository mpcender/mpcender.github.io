//const containter = 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");
const stageQuery = document.querySelector("#cavasDiv");

let stage;

// stage bound vars
let dividers = [];
let divContainers = 1;
let minDiv = 1;
let maxDiv = 5;
let divBounds;
let circleBumpers = [];

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

let pressTimer;

let bottomLeftCircle;
var regInt = new RegExp('^[0-9]$');

let buttonMinus;
let buttonPlus;


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


class DivSection {
	constructor(trackers) {
		let size = trackers.length-1;
		this.sup0 = size >= 0 ? trackers[size--] : null;
		this.sup1 = size >= 0 ? trackers[size--] : null;
		this.sup2 = size >= 0 ? trackers[size--] : null;
		this.sup3 = size >= 0 ? trackers[size--] : null;
		this.sup4 = size >= 0 ? trackers[size--] : null;
		this.array = [this.sup0, this.sup1, this.sup2, this.sup3, this.sup4];
	}

	size() {
		let count = 0;
		for(let i = 0; i < this.array.length; i++) {
			count = this.array[i] != null ? (count+1) : count;
		}
		return count;
	}
}

class DivTracker {
	constructor(topX, topY, botX, botY) {
		this.topX = topX;
		this.topY = topY;
		this.botX = botX;
		this.botY = botY;
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

	// DEMO
	removeDivBumpers();

	if (dividers[0] != null) {
		let space = mainStageElem.clientWidth/divContainers
		let divTrack = [];
		for (let i = 1; i <= divContainers; i++) {
			// Adjust Dividers
			dividers[i-1].graphics.command.x = (space*i);
			dividers[i-1].graphics.command.h = mainStageElem.clientHeight;
			
			// Rebuild Banners
			stage.removeChild(banners[i-1]);
			banners[i-1] = buildBanner(i);
			banners[i-1].setTransform(i==1 ? (space*(i-1)) : (space*(i-1)+5), 0);
			stage.addChild(banners[i-1]);

			let bound = new DivTracker(
				(i==1 ? (space*(i-1)) : (space*(i-1)+5)),0,
				(space*(i)),mainStageElem.clientHeight);
			divTrack[i-1] = bound;
			
			// DEMO
			divBumpers(bound, i);
		}
		divBounds = new DivSection(divTrack);
		//stage.update();
	}
}

function removeDivBumpers(){
	/*
	while (circleBumpers.length >1){
		stage.removeChild(circleBumpers.pop());
	}
	*/
}

function divBumpers(bound, i) {
	/*
	console.log("loop " + i + "\n")
	console.log("topLeft : " + bound.topX + "," + bound.topY + "\n");
	console.log("botRight: " + bound.botX + "," + bound.botY + "\n");

	circle1 = new createjs.Shape();
	circle1.graphics.beginFill("#FFF000").drawCircle(bound.topX, bound.topY, 10);
	circle2 = new createjs.Shape();
	circle2.graphics.beginFill("#FFF000").drawCircle(bound.botX, bound.botY, 10);
	stage.addChild(circle1,circle2);
	circleBumpers.push(circle1,circle2);
	circleBumpers.push(circle1);
	*/
}

//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				DRAW BUTTONS AND STATIC STAGE ELEMENTS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------

function enableButtons() {
	let buttonCombine = document.getElementById("button_combine");
	let buttonSeperate = document.getElementById("button_seperate");
	let buttonAddSingle = document.getElementById("button_add_single");
	let buttonAddMany = document.getElementById("button_add_many");
	let buttonColumn = document.getElementById("button_column");
	buttonPlus = document.getElementById("button_plus");
	buttonMinus = document.getElementById("button_minus");

	handleCombine(buttonCombine);
	handleSeperate(buttonSeperate);
	handleAddSingle(buttonAddSingle);
	handleAddMany(buttonAddMany);
	handleColumn(buttonColumn);
	handlePlus(buttonPlus);
	handleMinus(buttonMinus);
	disableMinus();

}

function handleCombine() {

}

function handleSeperate() {

}

function handleAddSingle() {

}

function handleAddMany(buttonAddMany) {
	buttonAddMany.onclick = function(){
		let cat = prompt('Hello world');
		console.log(cat)
	}
}

function handleColumn(buttonColumn) {
	buttonColumn.onclick = function(){
		let hi = divContainers;
		//console.log(hi)
		let updateToOpenStage = divContainers != 1;
		if (updateToOpenStage) {
			divContainers = 1;
			removeDiv(1,hi);
		}
		else { 
			let frame = prompt('How many frames?');
			
			console.log(regInt.test(frame))
			if (regInt.test(frame) &&
				frame != divContainers && 
				frame <= maxDiv &&
				frame >= minDiv) {
				divContainers = frame;
				console.log(divContainers)
				removeDiv(0,5);
			}
		}
		drawStage();
		manageContainerButtonState();
	}
}

function handlePlus(buttonPlus) {
	buttonPlus.innerHTML = getPlus();
	buttonPlus.onclick = function(){
		let update = (divContainers < maxDiv);
		divContainers = update ? ++divContainers : divContainers;
		
		disablePlus()
		if (update) { 
			removeDiv(0, divContainers)
			drawStage() 
		}
		enableMinus();
	}
	buttonPlus.addEventListener
	
	/* longpress implementation
	buttonPlus.onmousedown = function(){
		pressTimer = window.setTimeout(function() { 
			let frame = prompt('How many frames?'); 
			console.log(frame + " " + divContainers)
			console.log(frame != divContainers)
			if (frame != divContainers) {
				divContainers = frame;
				console.log(divContainers)
				removeDiv(0,5);
				drawStage();
			}
		},500);		
	}
	buttonPlus.onmouseup = function(){
		clearTimeout(pressTimer);
	}
	*/
}

function handleMinus(buttonMinus) {
	buttonMinus.innerHTML = getMinus();
	buttonMinus.onclick = function(){
		let update = divContainers > minDiv ;
		divContainers = update ? --divContainers : divContainers;
		disableMinus();
		if (update) { 
			removeDiv(0, divContainers+1);
			drawStage();
		}
		enablePlus();
	}
}

function getPlus() {
	let plus =  new createjs.Shape();
	plus.graphics.beginFill("#FFFFFF").drawRect(15,0,6,36).drawRect(0,15,36,6)
	plus.cache(0, 0, 36, 36);
	var url = plus.getCacheDataURL();
	return "<img class=\"buttonImage\" src=" + url + ">";
}

function disablePlus() {
	if (divContainers == maxDiv) {buttonPlus.disabled = true;}
}

function enablePlus() {
	if (buttonPlus.disabled && divContainers < maxDiv) {
		buttonPlus.disabled = false;
	}
}

function getMinus() {
	let minus =  new createjs.Shape();
	minus.graphics.beginFill("#FFFFFF").drawRect(0,15,36,6);
	minus.cache(0, 0, 36, 36);
	var url = minus.getCacheDataURL();
	return "<img class=\"buttonImage\" src=" + url + ">";
}

function disableMinus() {
	if (divContainers == minDiv) {buttonMinus.disabled = true;}
}

function enableMinus() {
	if (buttonMinus.disabled && divContainers > minDiv) {
		buttonMinus.disabled = false;
	}
}

function manageContainerButtonState() {
	if (divContainers >= maxDiv) { disablePlus(); }
	else { enablePlus(); }
	if (divContainers <= minDiv) { disableMinus(); }
	else {enableMinus(); }
}

function removeDiv(lo, hi){
	for (let i = lo; i <= hi; i++) {
		stage.removeChild(dividers[i-1]);
	}
}



//---------------------------------------------------------------------
//
// Draw selector buttons stage
//
//---------------------------------------------------------------------
function drawStage(){
	// DEMO
	removeDivBumpers();

	
	let space = mainStageElem.clientWidth/divContainers;
	let divTrack = [];
	// divider
	for (let i = 1; i <= divContainers; i++) {
		dividers[i-1] = new createjs.Shape();
		dividers[i-1].graphics.beginFill("#FFFFFF").
			drawRect((space*i),0,5,mainStageElem.clientHeight);
		
		banners[i-1] = buildBanner(i);
		banners[i-1].setTransform(i==1 ? (space*(i-1)) : (space*(i-1)+5), 0);

		// Track boundaries for each stage division
		let bound = new DivTracker(
			(i==1 ? (space*(i-1)) : (space*(i-1)+5)),0,
			(space*(i)),mainStageElem.clientHeight);
		divTrack[i-1] = bound;

		stage.addChild(dividers[i-1], banners[i-1]);
		
		// DEMO
		divBumpers(bound, i);
	}
	divBounds = new DivSection(divTrack);
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
	let stageMouseY = stage.mouseY;
	if (stageMouseY < (bannerHeight+2)){
		stageMouseY = bannerHeight+2; }

	stage.removeChild(stageSelectorBox)
	let shape = new createjs.Shape();
	shape.graphics.setStrokeDash([stroke * 2, stroke]).
		beginStroke("#FFFFFF").rect(oldPt.x, oldPt.y,
			stage.mouseX - oldPt.x, stageMouseY - oldPt.y);
	
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






