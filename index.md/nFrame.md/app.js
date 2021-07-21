//const containter 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");
const stageQuery = document.querySelector("#cavasDiv");

let stage;
// Base value
let baseVal = 3;
// Maximum base of program
const maxBase = 10;


// stage bound objects
let dividers = [];
// number of current stage containers (also used for current exponent tracking)
let divContainers = 1;
// Min and max divisions on the board
const minDiv = 1;
const maxDiv = 5;
// Current Max div (depends on current base value)
let activeMaxDiv = 5;
// Stores Boundary objects which track top left and bottom right points of divs
let divBounds;
let prevDivBounds;


// Banner Variables
let banners = [];
// height of stage division banners
const bannerHeight = 25;
// exponent character codes for 0,1,2,3,4
const superscript = ["\u2074","\u00B3","\u00B2","\u00B9","\u2070"];
const superscriptRev = ["\u2070","\u00B9","\u00B2","\u00B3","\u2074"];
const fontSize = 24;


// Node stage tracker (enables collision detection)
let stageNodeTracker = [];
// Node storage remembers nodes for stage containers not currently visible
let stageNodeStorage = [[],[],[],[],[]];
// Pixel size of each subNode object 
const nodeSize = 25;
// Largest subnodes in a container
const maxNodeGroup = 256;
// Color codes for container node color change
const colorSet = {blue: "#005586", red: "#d02237", yellow: "#d6ad4c", green: "#8ab546"}
let colors = [colorSet.blue,colorSet.red,colorSet.yellow,colorSet.green]
let visualSeperation = false;
const colorOffSet = {blue: "#1e8ac9", red: "#f44358", yellow: "#f5c759", green: "#abdb5f"}
let colorsOff = [colorOffSet.blue,colorOffSet.red,colorOffSet.yellow,colorOffSet.green]
//,yellow c8c03b


// draw select box variables
let stageSelectorBox;
let objectEventActive = false;
let selectedObjects = [];
let seperateToOnes = true;

// Delay on stage update on resize (1 second)
let resizeTimer = null;
const resizeWait = 1000;

// Column button variables
let buttonRemoveColumn;
let buttonAddColumn;
// Node container creation buttons
let add0, add1, add2, add3, add4;
let expButtons = [add0, add1, add2, add3, add4];
let expParent;


// Determine if tween is currently running on the stage
let tweenRunningCount = 0;
// Duration of node tween transition (ms)
const tweenDuration = 900;
// Shape object tween controll
let xTween;
let yTween;
// Node objects hidden during tween, reactivated on tween complete
let tweenHidden = [];


// Audio clip variables
let slideRunning = 0;
let trashRunning = 0;
const bloopSound = "res/sound/bloop.mp3";
const trashSound = "res/sound/trash.mp3";
const slideSound = "res/sound/slide.mp3";
const paintSound = "res/sound/clayChirp.mp3";

// User input regex for integer value
//const regInt = new RegExp('^[0-9]$');


//------------------------------------------------------
//
//		TODO:	
//				- 
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
	resizeUpdate();

	// create and initialize stage HTML buttom objects
	enableButtons();

	// Draw all stage elements
	drawStage();

	
	createjs.Ticker.framerate = 30;
	createjs.Ticker.addEventListener("tick", stage);
	
	// displays mouse location on stage, Development use only
	/*
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
	*/
	
}

/**
 * Class for divider bar positions
 */
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

/**
 * Class for storing point positions on stage
 */
class DivTracker {
	constructor(topX, topY, botX, botY) {
		this.topX = topX;
		this.topY = topY;
		this.botX = botX;
		this.botY = botY;
	}
}

//------------------------------------------------------------------------------
//
//							Functions
//
//------------------------------------------------------------------------------

//-----------------------------------------------------------------
// 
// Window Resize variable updates
//
//-----------------------------------------------------------------
function resizeUpdate(){
	if (resizeTimer == null) {
		resizeTimer = setTimeout(function(){ 
			resize();
			resizeTimer = null; 
		}, resizeWait);
	} 

	function resize() {
		windowSizeX = window.innerWidth;
	windowSizeY = window.innerHeight;

	canvas.height = mainStageElem.clientHeight;
	canvas.width = mainStageElem.clientWidth;

	if (dividers[0] != null) {
		let divContWidth = mainStageElem.clientWidth/divContainers
		let divTrack = [];
		for (let i = 1; i <= divContainers; i++) {
			// Adjust Dividers
			dividers[i-1].graphics.command.x = (divContWidth*i);
			dividers[i-1].graphics.command.h = mainStageElem.clientHeight;
			
			// Rebuild Banners
			stage.removeChild(banners[i-1]);
			banners[i-1] = buildBanner(i);
			banners[i-1].setTransform(i==1 ? 
				(divContWidth*(i-1)) : (divContWidth*(i-1)+5), 0);
			stage.addChild(banners[i-1]);

			let bound = new DivTracker(
				(i==1 ? (divContWidth*(i-1)) : (divContWidth*(i-1)+5)),0,
				(divContWidth*(i)),mainStageElem.clientHeight);
			divTrack[i-1] = bound;

		}
		prevDivBounds = divBounds;
		divBounds = new DivSection(divTrack);
		//stage.update();
	}
	updateNodePositions();
	}
}

//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 					 	DRAW STAGE OBJECTS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------

function drawStage(){
	let divContWidth = mainStageElem.clientWidth/divContainers;
	let divTrack = [];
	// divider
	for (let i = 1; i <= divContainers; i++) {
		dividers[i-1] = new createjs.Shape();
		dividers[i-1].graphics.beginFill("#FFFFFF").
			drawRect((divContWidth*i),0,5,mainStageElem.clientHeight);
		
		banners[i-1] = buildBanner(i);
		banners[i-1].setTransform(i==1 ? (divContWidth*(i-1)) : (divContWidth*(i-1)+5), 0);

		// Track boundaries for each stage division
		let bound = new DivTracker(
			(i==1 ? (divContWidth*(i-1)) : (divContWidth*(i-1)+5)),0,
			(divContWidth*(i)),mainStageElem.clientHeight);
		divTrack[i-1] = bound;

		stage.addChild(dividers[i-1], banners[i-1]);
		
	}
	prevDivBounds = divBounds
	divBounds = new DivSection(divTrack);
	manageExponentButtonState();
	updateNodePositions();
}

function buildBanner(i){
	let banner = new createjs.Container();

	let divContWidth = mainStageElem.clientWidth/divContainers;
	let shape = new createjs.Shape();
	shape.graphics.beginFill("#005586")
		.drawRect(	0,
					0,
					i==1 ? divContWidth : divContWidth-5,
					bannerHeight)

	// Calculate index offset for superscript values
	let j = (i-1)-(divContainers-5);
	let text = new createjs.Text(baseVal+superscript[j], 
		fontSize+"px Times New Roman", "#FFFFFF");
	text.textAlign ="center";
	text.x = (divContWidth)/2;
	text.y = 3;
	
	banner.addChild(shape, text);
	banner.bannerId = i
	return banner;
}

function removeDiv(lo, hi){
	for (let i = lo; i <= hi; i++) {
		stage.removeChild(dividers[i-1]);
	}
}

function makeRect(exponent) {
	let container = new createjs.Container();
	let col = -nodeSize;
	let row = 0;
	let mod = getDimension(exponent);

	for (let i = 0; i < Math.pow(baseVal, exponent); i++) {
		col = i%(mod[1]) == 0 ? col+nodeSize : col;
		row = i%(mod[1]) == 0 ? 0 : row+nodeSize ;
		let child = buildSubNode(col, row);
		child.row = row;
		child.col = col;
		container.addChild(child);

	}
	container.col = col;
	container.row = row;

	applyNodeHandlers(container)
	getContainerPlacement(container, exponent, mod);	
	updateNodeTracking(container, container.x, container.y, 
		container.x+col+nodeSize, container.y+row+nodeSize);
	stageNodeTracker.push(container);
	stage.addChild(container);
	container.color=0;
	return container;
}

// Single rectangle for stage object creation
function buildSubNode(col, row){
	let node = new createjs.Shape();
	node.graphics.beginStroke("white");
	node.graphics.setStrokeStyle(1);
	node.snapToPixel = true;
	node.graphics.beginFill(colorSet.blue).
		drawRoundRect(col, row, nodeSize, nodeSize, 5);
	return node;
}

// Single rectangle for tween transition
function makeSingleRect(x, y) {
	let container = new createjs.Container();
	let col = 0;
	let row = 0;
	let child = buildSubNode(0, 0);
	child.row = row;
	child.col = col;
	container.addChild(child);

	applyNodeHandlers(container);
	container.x = x;
	container.y = y;	
	updateNodeTracking(container, x, y, x+nodeSize, y+nodeSize);
	stageNodeTracker.push(container);
	stage.addChild(container);
	return container;
}


function getDimension(i){
	// if base^0 return 1
	if (i==0 || baseVal == 1) {return [1,1] }
	let width;
	// if openStage allow dimensions not constrained
	if (divContainers==1) { 
		width = divBounds.array[0].botX-divBounds.array[0].topX; 
	}
	
	else { width = divBounds.array[i].botX-divBounds.array[i].topX; }
	let nodeFitWidth = Math.floor(width/nodeSize);

	let factors = []
	for(let j = 1; j <= Math.pow(baseVal, i); j++) {
	    if(Math.pow(baseVal, i) % j == 0) {
	        factors.push(j);
	    }
	}
	let multipliers = [];
	for(let j = 0; j < factors.length; j++) {
	    for(let k = j; k < factors.length; k++) {
			if((factors[j]*factors[k]) == Math.pow(baseVal, i)) {
				multipliers.push([factors[j],factors[k]]);
			}
		}
	}
	let num = 0;
	for (let j = multipliers.length-1; j >= 0; j--) {
		if (multipliers[j][0] < nodeFitWidth) {
			num = multipliers[j];
			break;
		}
	}
	return num;
}

////////////////////////////////////////////////////////////////////////////////
//						Node Stage Position methods
////////////////////////////////////////////////////////////////////////////////
function getContainerPlacement(container, exponent, mod) {
	let minX,minY, maxX,maxY;
	if (divContainers == 1) {
		minX = 0;
		minY = bannerHeight;
		maxX = divBounds.array[0].botX-(nodeSize*(mod[0]+1));
		maxY = divBounds.array[0].botY-(nodeSize*(mod[1]+1));
	} else {
		minX = divBounds.array[exponent].topX;
		minY = divBounds.array[exponent].topY+bannerHeight;
		maxX = divBounds.array[exponent].botX-(nodeSize*(mod[0]+1));
		maxY = divBounds.array[exponent].botY-(nodeSize*(mod[1]+1));
	}

	container.x = Math.floor(Math.random() * (maxX - minX + 1) + minX);
	container.y = Math.floor(Math.random() * (maxY - minY + 1) + minY);
}

function getContainerUpdate(container, exponent, mod) {
	let minX, maxX;
	if (divContainers == 1 || baseVal == 1) {
		minX = 0;
		maxX = divBounds.array[0].botX-(nodeSize*(mod[0]+1));
	} else {
		minX = divBounds.array[exponent].topX;
		maxX = divBounds.array[exponent].botX-(nodeSize*(mod[0]+1));
	}

	let exp = exponent;
	if (container.prevExp != undefined) {
		exp = container.prevExp;
		container.prevExp = exponent;
		if (exp == exponent){ 
			container.prevExp = undefined; 
			exp = exponent;
		}
		if (exp == divContainers){
			exp--;
		}
	}

	let xTween = 0;
	let x = container.x;
	if (prevDivBounds.array[exponent] != null) {

		if (prevDivBounds.array[exp] == null) {
			exp = exponent;
		}
		if (prevDivBounds.array[exp] != null && 
			container.prevExp != undefined &&
			(container.x <= prevDivBounds.array[exp].topX ||
			container.x >= prevDivBounds.array[exp].botX) ) {
				let oldMod = getDimension(exp)
				let mx = prevDivBounds.array[exp].botX-(nodeSize*(oldMod[0]+1));
				let mn  = prevDivBounds.array[exp].topX;
				x = Math.floor(Math.random() * (mx - mn + 1) + mn);
				container.prevExp = undefined;
		} 
		
		let len = prevDivBounds.array[exp].botX - prevDivBounds.array[exp].topX
		let dist = x - prevDivBounds.array[exp].topX
		let ratio = dist/len
		let distNew = divBounds.array[exponent].botX-divBounds.array[exponent].topX
		xTween = minX + distNew*ratio
	} 
	tweenScoot(container, xTween, container.y)
}

// Update container stage postion tracking variables
function updateNodeTracking(cont, tlx, tly, brx, bry) {
	cont.loc = new DivTracker(tlx, tly, brx, bry);
}


//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   STAGE INTERACTIVITY FEATURES
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------

function updateNodePositions() {
	// if open stage restore all elements
	if (divContainers == 1) {
		stageNodeStorage.forEach( element => {
			restoreStoredNodes(element);
		})
	} 
	// else manage node elements visible or stored
	else {
		let restore = stageNodeStorage[divContainers-1]
		restoreStoredNodes(restore);
	
		let remove = []
		stageNodeTracker.forEach(element => {

			let exponent = Math.round(Math.log(element.children.length, baseVal));

			// is stage reduced below exponent value remove from stage
			if (exponent+1 > divContainers) {
				stage.removeChild(element);
				remove.push(element);
			} else {
				evaluatePostion(element, exponent);
				
			}

		});
		storeRemovedNodes(remove);
	}

	

	// 
	function restoreStoredNodes(restore){
		if (restore.length != 0) {
			while (restore.length != 0) {
				let node = restore.pop();
				stage.addChild(node[0]);
				stageNodeTracker.push(node[0])
			}	
		}
	}

	function storeRemovedNodes(remove){
		// Transfer from StageNodeTracker to stageNodeStorage
		for(let i = 0; i < remove.length; i++){
			let j = 0;
			// find and remove from active stage node tracker
			while (remove[i] != stageNodeTracker[j]) {
				j++;
				if (j >= stageNodeTracker.length &&
					stageNodeTracker[j] == undefined) { 
					j = -1;
					break 
				} 
			}
			if (j != -1) {
				let exponent = Math.round(Math.log(stageNodeTracker[j].children.length, baseVal));
				stageNodeStorage[exponent].push(stageNodeTracker.splice(j,1));
			}

			j = 0;
			// Find and remove from selected object tracking
			while (remove[i] != selectedObjects[j]) {
				j++;
				if (j >= selectedObjects.length &&
					selectedObjects[j] == undefined) { 
					j = -1;
					break 
				} 
			}
			if (j != -1) {
				deselectNode(selectedObjects[j]);
				selectedObjects.splice(j, 1);
			}
			
		}
	}

	function evaluatePostion(container, exponent){
		let col = -nodeSize;
		let row = 0;
		let mod = getDimension(exponent);
	
		for (let i = 0; i < Math.pow(baseVal, exponent); i++) {
			col = i%(mod[1]) == 0 ? col+nodeSize : col;
			row = i%(mod[1]) == 0 ? 0 : row+nodeSize ;
		}
	
		getContainerUpdate(container, exponent, mod);		
		updateNodeTracking(container, container.x, container.y, 
			container.x+col+nodeSize, container.y+row+nodeSize);
		
		return container;
	}
}

// Evaluate log of current baseVal
Math.log = (function() {
	var log = Math.log;
	return function(n, base) {
	  return log(n)/(base ? log(base) : 1);
	};
})();

function selectNode(node){
	//"#4287f5"
	node.shadow = new createjs.Shadow(colors[node.color], 0, 0, 30);
	selectedObjects.push(node);
	node.stageForDeselect = false;
}
function deselectNode(node){
	node.shadow = null;
}


function updateSelectedObjects(dragger) {
	// init case if storage array is empty, add to array
	if (selectedObjects.length == 0) {
		selectNode(dragger);
		return false;
	} 
	// Add to selected array if not already in array
	else {
		// if current dragger not in the array, set selected
		if (!selectedObjects.includes(dragger)){
			selectNode(dragger);
			return false;
		} else {
			// If click select (not multi-select), remove item clicked
			if (dragger.selectType != 1){
				deselectNode(dragger);
				let index;
				for (j = 0; j < selectedObjects.length; j++){
					if (selectedObjects[j] == dragger){
						index = j;
						break;
					} 
				}
				// Remove duplicate selections from the array
				selectedObjects.splice(index, 1);
			} 
			// if multi-select stage for deselect
			else {
				dragger.stageForDeselect = true;
			}
			return true;
		}
	}
}


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   BUTTON INTERACTIVITY
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function manageContainerButtonState() {
	if (divContainers >= getMaxDiv()) { disableAddColumn(); }
	else { enableAddColumn(); }
	if (divContainers <= minDiv) { disableRemoveColumn(); }
	else {enableRemoveColumn(); }
}

function manageExponentButtonState(){
	if (divContainers == 1) {
		updateStates(getMaxDiv(), maxDiv);
	} else {
		updateStates(divContainers, maxDiv);
	}
	function updateStates(min, max) {
		for (let i = 0; i < max; i++) {
			expParent.appendChild(expButtons[i])
			if (i < min) { expParent.appendChild(expButtons[i]) }
			else { 
				try {
					expParent.removeChild(expButtons[i]); 
				} catch (error) {
					
				}
				
			}
		}
	}
}

//----------------------------------------------------
//
//		Stage object selection box event hadlers
//
//----------------------------------------------------
function handleStageMouseDown(event) {
	if (!event.primary || tweenRunningCount > 0) { return; }
	// Store current stage mouse location
	oldPt = new createjs.Point(stage.mouseX, stage.mouseY);

	stage.addEventListener("stagemousemove", handleStageMouseMove);
}

function handleStageMouseMove(event) {
	// if dragger active or mouse out of bounds return
	if (!event.primary  || objectEventActive || tweenRunningCount > 0) { return; }
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
	if (!event.primary || tweenRunningCount > 0) { return; }

	stage.removeChild(stageSelectorBox)
	stage.removeEventListener("stagemousemove", handleStageMouseMove);
	
	// if dragger active or mouse out of bounds return
	if (objectEventActive ) { return; }
	let deselectAll = [];
	
	for (i = 0; i < stageNodeTracker.length; i++){
		hitTop = {x: stageNodeTracker[i].loc.topX, y: stageNodeTracker[i].loc.topY}
		hitBot = {x: stageNodeTracker[i].loc.botX, y: stageNodeTracker[i].loc.botY}

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
				deselectNode(selectedObjects[j]);
				selectedObjects.splice(j,1);
			} 
		} 
		// if partial deselect of currently selected
		else {
			for (j = 0; j < selectedObjects.length; j++){
				// deselect staged objects
				if (selectedObjects[j].stageForDeselect){
					deselectNode(selectedObjects[j]);
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

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   		NODE EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function applyNodeHandlers(node) {

    node.on("mousedown", function (evt) {
        // if tween is running disable
        if (tweenRunningCount > 0) { return }

		objectEventActive = true;
        // Stop selector box from displaying when moving object
        //stageObjectDragging = true;

		if (selectedObjects.includes(node)) {
			node.multiDrag = true;
			
			for (i = 0; i < selectedObjects.length; i++) {
				// Store offset of origin, move object from point selected
				selectedObjects[i].offset = { x: selectedObjects[i].x - evt.stageX, 
					y: selectedObjects[i].y - evt.stageY };
				// Store origin xy to determine test if click (check toggle selected)
				selectedObjects[i].oldX = this.x + (node.x-selectedObjects[i].x);
				selectedObjects[i].oldY = this.y + (node.y-selectedObjects[i].y);
			}
		} 
		// normal single drag
		else {
			node.multiDrag = false;
			// Store original location of object
			this.oldX = this.x;
			this.oldY = this.y;
			// Store offset of origin, move object from point selected
			this.offset = { x: this.x - evt.stageX, y: this.y - evt.stageY }
			this.parent.addChild(this);
		}
        
    });

    node.on("pressmove", function (evt) {
        // if tween is running or on grid disable
        if (tweenRunningCount > 0 ) { return }

		// On the move check for
        node.onTheMove = true;

		// If moving multiple stage items
		if (node.multiDrag) {
			for (i = 0; i < selectedObjects.length; i++) {
				selectedObjects[i].x = evt.stageX + selectedObjects[i].offset.x;
				selectedObjects[i].y = evt.stageY + selectedObjects[i].offset.y;
			}
		} 
		// Normal single drag
		else {
			// Move chip to location where pointer is located
			this.x = evt.stageX + this.offset.x;
			this.y = evt.stageY + this.offset.y;
		}
    });

    node.on("pressup", function (evt) {

        // if tween is running disable
        if (tweenRunningCount > 0 ) { return }

		if (node.multiDrag) {
			for (i = 0; i < selectedObjects.length; i++) {
				updateNodeTracking(selectedObjects[i], 
					selectedObjects[i].x, selectedObjects[i].y, 
					selectedObjects[i].x+selectedObjects[i].col+nodeSize, 
					selectedObjects[i].y+selectedObjects[i].row+nodeSize);
				selectedObjects[i].onTheMove = false;
			}
		} else {
			updateNodeTracking(node, node.x, node.y, 
				node.x+node.col+nodeSize, 
				node.y+node.row+nodeSize);
			node.onTheMove = false;
		}
		objectEventActive = false;
    });
}

function tweenScoot(node, xTween, yTween){
	if (slideRunning < 1 && trashRunning < 1) { PlaySound(slideSound,.4)}
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", stage);
	tweenRunningCount++;
	slideRunning++;
	createjs.Tween.get(node, { loop: false }, null, false)
		.to({ x: xTween, y: yTween }, tweenDuration, createjs.Ease.get(1))
		.call(handleTweenComplete);
}

// Track tween events
function handleTweenComplete(evt) {
	let x = evt._curQueueProps.x;
	let y = evt._curQueueProps.y;
	updateNodeTracking(evt.target, x, y, 
		x+evt.target.col+nodeSize, 
		y+evt.target.col+nodeSize);

	if (tweenHidden.length > 0) { 
		deleteSelected();
		for(let i = 0; i < tweenHidden.length; i++) {
			tweenHidden[i].alpha = 1;
		}
		tweenHidden = []; 
	}
	
    tweenRunningCount--;
	slideRunning--;
	trashRunning = 0;
}

function tick(evt) {
    // this set makes it so the stage only re-renders when an event handler indicates a change has happened.
    if (tweenRunningCount > 0) {
        stage.update(evt);
    }
}

//---------------------------------------------------------------------
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				DRAW BUTTONS AND STATIC STAGE ELEMENTS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
//---------------------------------------------------------------------

function enableButtons() {
	let buttonTrash = document.getElementById("button_trash");
	let buttonReset = document.getElementById("button_refresh");
	let buttonCombine = document.getElementById("button_combine");
	let buttonToggleSingle = document.getElementById("button_toggle_single")
	let buttonToggleGroup = document.getElementById("button_toggle_group")
	let buttonSeperate = document.getElementById("button_seperate");
	let buttonColumn = document.getElementById("button_column");
	let buttonPaint = document.getElementById("button_paint");
	let buttonToggleAssist = document.getElementById("button_toggle_assist")
	let buttonTogglePlain = document.getElementById("button_toggle_plain")
	buttonAddColumn = document.getElementById("button_add_col");
	buttonRemoveColumn = document.getElementById("button_remove_col");

	

	let buttonAdd = document.getElementById("button_add");
	for (let i = 0; i < activeMaxDiv; i++) {
		let id = "button_add_" + i;
		expButtons[i] = document.getElementById(id);
		expButtons[i].innerHTML = baseVal + superscriptRev[i]
		handleAddBlock(expButtons[i],i);
	}
	expParent = expButtons[0].parentNode;
	

	handleTrash(buttonTrash);
	handleReset(buttonReset);
	handleCombine(buttonCombine);
	handleToggleSingle(buttonToggleSingle, buttonToggleGroup);
	handleToggleGroup(buttonToggleGroup, buttonToggleSingle);
	handleSeperate(buttonSeperate);
	handleColumn(buttonColumn);
	handlePaint(buttonPaint);
	handleToggleAssist(buttonToggleAssist, buttonTogglePlain);
	handleTogglePlain(buttonTogglePlain, buttonToggleAssist);
	handleAddColumn(buttonAddColumn);
	handleRemoveColumn(buttonRemoveColumn);
	handleAdd(buttonAdd);
	
	buildHandleBase();
	
	disableRemoveColumn();

}

function handleToggleSingle(buttonToggleSingle, buttonToggleGroup){
	buttonToggleSingle.onclick = function(){
		seperateToOnes = !seperateToOnes;
		buttonToggleSingle.disabled = true;
		buttonToggleGroup.disabled = false;
		console.log(buttonToggleSingle)
	}
}
function handleToggleGroup(buttonToggleGroup, buttonToggleSingle){
	buttonToggleGroup.onclick = function(){
		seperateToOnes = !seperateToOnes;
		buttonToggleGroup.disabled = true;
		buttonToggleSingle.disabled = false;
		//buttonToggleSingle
	}
}



function handleToggleAssist(buttonToggleAssist, buttonTogglePlain){
	buttonToggleAssist.onclick = function(){
		visualSeperation = !visualSeperation;
		buttonToggleAssist.disabled = true;
		buttonTogglePlain.disabled = false;
	}
}
function handleTogglePlain(buttonTogglePlain, buttonToggleAssist){
	buttonTogglePlain.onclick = function(){
		visualSeperation = !visualSeperation;
		buttonTogglePlain.disabled = true;
		buttonToggleAssist.disabled = false;
	}
}

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   		BUTTON EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

function handleTrash(buttonTrash) {
	
	buttonTrash.onclick = function() {
		if (tweenRunningCount > 0 ) { return; }
		
		trashRunning++;
		PlaySound(trashSound, 1);
		deleteSelected();
	}
}

function deleteSelected() {
	// Track objects removed from stage
	let removed = [];
	// Remove selected objects from stage
	let len = selectedObjects.length;
	for (let i = 0; i < len; i++) {
		stage.removeChild(selectedObjects[i]);
		removed.push(selectedObjects[i]);
	}
	// Clear objects from 'selected' tracking
	len = removed.length;
	if (len > 0) {  
		
		for (let i = 0; i < len; i++) {
			clearSelectedObject(removed, i);
			clearStageNodeTracker(removed, i);
		}
	}

	function clearSelectedObject(removed, i) {
		let j = 0;
		while (removed[i] != selectedObjects[j]){ j++ }
		selectedObjects.splice(j, 1);
	}

	function clearStageNodeTracker(removed, i) {
		let j = 0;
		while (removed[i] != stageNodeTracker[j]){ j++ }
		stageNodeTracker.splice(j, 1);
	}
}

function handleReset(buttonReset) {
	buttonReset.onclick = function() {
		if (tweenRunningCount > 0 ) { return; }
		resetStage();
	}
	
}
function resetStage() {
	clear(dividers);
	clear(stageNodeTracker);
	
	dividers = [];
	selectedObjects = [];
	stageNodeTracker = [];
	stageNodeStorage = [[],[],[],[],[]];
	
	drawStage();
}
function clear(iterable) {
	iterable.forEach(element => {
		stage.removeChild(element);
	})
	iterable = [];
}


function handleCombine(buttonCombine) {
	//buttonCombine.on
	buttonCombine.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }
		let combine = [[],[],[],[],[]]
		let deselect = [];
		// determine if objects can combine
		for (let i = 0; i < selectedObjects.length; i++) {
			let node = selectedObjects[i]
			// Get current object exponent value
			let exponent  = Math.round(Math.log(node.children.length, baseVal));
			// Check if exponent+1 container can exist on the stage
			if (exponent < activeMaxDiv) {
				// if open
				if(divContainers == 1) {
					combine[exponent].push(node)
				} else if (exponent < divContainers-1){
					combine[exponent].push(node)
				} else { deselect.push(node) }
			} else { deselect.push(node) }
		}
		// deselect higher exponent 
		deselect.forEach( element => {
			let k = selectedObjects.indexOf(element)
			deselectNode(selectedObjects[k]);
			selectedObjects.splice(k,1);
		})
		
		// Loop through exponent storage
		for(let i = 0; i < combine.length; i++) {
			let newObject = [];
			let tweenNodes = [];
			let index = 0;
			// Check if selected nodes can be combined (correct number of nodes)
			if(combine[i].length != 0 && combine[i].length%baseVal == 0) {
				
				// build single tween nodes
				for(let j = 0; j < combine[i].length; j++) {
					tweenHidden.push(combine[i][j]);
					combine[i][j].alpha = 0;
					for(let k = 0; k < combine[i][j].children.length; k++) {
						let child = combine[i][j].children[k];
						let ptTop = child.localToGlobal(child.regX,child.regY);
						ptTop.x = ptTop.x+child.col;
						ptTop.y = ptTop.y+child.row;
						let tweenNode = makeSingleRect(ptTop.x, ptTop.y)
						updateColor(tweenNode, combine[i][j].color);
						updateSelectedObjects(tweenNode);
						tweenNode.shadow = new createjs.Shadow(colors[combine[i][j].color], 0, 0, 30);
						tweenNodes.push(tweenNode)
					}
				}
				// build new node
				let toMake = combine[i].length/baseVal;
				for(let j = 0; j < toMake; j++) {
					let x = combine[i][j*baseVal].x;
					let y = combine[i][j*baseVal].y;
					newObject[index] = buildNew(combine[i][0], i+1, x, y);
					newObject[index].color = combine[i][j*baseVal].color
					updateColor(newObject[index], combine[i][j*baseVal].color);
					index++;
				}
				for(let j = 0; j < newObject.length; j++) {
					for(let k = 0; k < newObject[j].children.length; k++) {
						let child = newObject[j].children[k];
						let ptTop = child.localToGlobal(child.regX,child.regY);
						ptTop.x = ptTop.x+child.col;
						ptTop.y = ptTop.y+child.row;
						let tween = tweenNodes.splice(0,1);

						tweenScoot(tween[0],ptTop.x,ptTop.y);
					}
				}
			} else{
				// deselect smaller exponent 
				for(let j = 0; j < combine[i].length; j++) {
					let k = selectedObjects.indexOf(combine[i][j])
					deselectNode(selectedObjects[k]);
					selectedObjects.splice(k,1);
				}
			}
		}
	}


	//let tweenHidden = [];
	function buildNew(node, exp, x, y) {
		// Build new object
		let object = makeRect(exp);
		// Hide during tween
		tweenHidden.push(object);
		object.alpha = 0;
		// Update color to previous node color
		object.color = node.color;
		updateColor(object, object.color);
		object.prevExp = exp-1;

		object.x=x;
		object.y=y;
		updateNodeTracking(object, object.x, object.y, 
			object.x+nodeSize, object.y+nodeSize);
		return object;
	}
}
/*

function disableCombine() {
	if (true) { buttonCombine.disabled = true; }
}

function enableCombine() {
	if (buttonCombine.disabled  && true) {
		buttonCombine.disabled = false;
	}
}
*/


function handleSeperate(buttonSeperate) {
	buttonSeperate.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }

		let toSeperate = []
		let singles = []
		// Only seperate nodes larger than one
		for (let i = 0; i < selectedObjects.length; i++) {
			if (selectedObjects[i].children.length > 1) {
				toSeperate.push(selectedObjects[i])
			} else {
				singles.push(selectedObjects[i]);
			}
		}
		// deselect single nodes
		for (let i = 0; i < singles.length; i++) {
			let j = selectedObjects.indexOf(singles[i])
			deselectNode(selectedObjects[j]);
			selectedObjects.splice(j,1);
		}

		for (let i = 0; i < toSeperate.length; i++) {
			let node = toSeperate[i];
			node.alpha = 0;
			let exponent = Math.round(Math.log(node.children.length, baseVal));
			
			// Seperate to ones or to next lower size
			let exp = 0;
			let size = node.children.length;
			
			if (!seperateToOnes) { 
				exp = exponent-1<0 ? 0 : exponent-1; 
				size = baseVal;
			} 

			let modX = nodeSize
			let modY = 0
			let prevX = 0;

			// build base ^ n single nodes for TWEEN EFFECT
			let tweenNodes = []
			let newLoc = [];
			for(let j = 0; j < node.children.length; j++) {
				let child = node.children[j];
				let ptTop = child.localToGlobal(child.regX,child.regY);
				ptTop.x = ptTop.x+child.col;
				ptTop.y = ptTop.y+child.row;
				tweenNodes[j] = makeSingleRect(ptTop.x, ptTop.y);
				updateColor(tweenNodes[j], toSeperate[i].color);
				updateSelectedObjects(tweenNodes[j]);
				tweenNodes[j].shadow = new createjs.Shadow(colors[node.color], 0, 0, 30);

				// Structured Decompose for Singles
				if (size == node.children.length) {
					modY = modY+nodeSize*.5;
					if(ptTop.x != prevX) { 
						modX = modX+nodeSize*.5;
						modY = 0;
					}
					newLoc.push({x: ptTop.x+(modX),y: ptTop.y+(modY)});
					prevX = ptTop.x;
				}
			}
			
			// build new objects for seperation
			let newObjects = [];
			let multiX = node.x;
			let multiY = node.y;
			for(let j = 0; j < size; j++) {
				// Build new object
				newObjects[j] = makeRect(exp);
				// Hide during tween
				tweenHidden.push(newObjects[j]);
				newObjects[j].alpha = 0;
				// Update color to previous node color
				newObjects[j].color = toSeperate[i].color;
				updateColor(newObjects[j], newObjects[j].color);

				newObjects[j].prevExp = exponent;
	
				// Structured Decompose for Singles node
				if (newLoc.length != 0) {
					newObjects[j].x = newLoc[j].x;
					newObjects[j].y = newLoc[j].y;	
					updateNodeTracking(newObjects[j], newLoc[j].x, newLoc[j].y, 
						newLoc[j].x+nodeSize, newLoc[j].y+nodeSize);
				} 
				// Structured Decompose for Multi-node containers
				else {
					let expon = divBounds.array[exp] != null ? exp : 0;
					let bound = divBounds.array[expon].botX - divBounds.array[expon].topX
					let offset = multiX+newObjects[j].col+(nodeSize*2)
		
					if (offset < bound){
						multiX += newObjects[j].col+(nodeSize*2)
					} else {
						multiY += newObjects[j].row+(nodeSize*2)
						multiX  = node.x;
					}
					
					newObjects[j].x = multiX;
					newObjects[j].y = multiY;	
					updateNodeTracking(newObjects[j], multiX, multiY, 
						multiX+newObjects[j].col+nodeSize, 
						multiY+newObjects[j].row+nodeSize);
				}
				
				// Tween tweenNodes to location of new object
				for(let k = 0; k < newObjects[j].children.length; k++) {
					let child = newObjects[j].children[k];
					let ptTop = child.localToGlobal(child.regX,child.regY);
					ptTop.x = ptTop.x+child.col;
					ptTop.y = ptTop.y+child.row;
					let tween = tweenNodes.splice(0,1);
					
					tweenScoot(tween[0],ptTop.x,ptTop.y);
				}
				
			} 

		}
	}
}

function handlePaint(buttonPaint) {
	buttonPaint.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }
		PlaySound(paintSound, .6)

		for (let i = 0; i < selectedObjects.length; i++) {
			let color = selectedObjects[i].color;
			color = selectedObjects[i].color = color>=3 ? 0 : ++color;
			let node = selectedObjects[i];
			updateColor(node, selectedObjects[i].color);
			selectedObjects[i].shadow = new createjs.Shadow(colors[color], 0, 0, 30);
		}
	}
}

// Update color and varies colors for exponent-1
function updateColor(node, color){
	let colorMod = colors[color]
	for(let j = 0; j < node.children.length; j++) {
		let exponent = Math.round(Math.log(node.children.length, baseVal));
		if (visualSeperation 
			&& node.children.length != 1 
			&& j%Math.pow(baseVal,exponent-1) == 0) {
			if (colorMod.includes(colors[color])) { colorMod = colorsOff[color] }
			else { colorMod = colors[color] }
		} 
		node.children[j].graphics._fill.style = colorMod;		
	}
}



function handleColumn(buttonColumn) {
	buttonColumn.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }

		let hi = divContainers;
		let updateToOpenStage = divContainers != 1;
		if (updateToOpenStage) {
			divContainers = 1;
			removeDiv(1,hi);
		}
		/*
		else { 
			let frame = prompt('How many frames?');

			//console.log(regInt.test(frame))
			// Validate user input 
			if (regInt.test(frame) &&
				frame != divContainers && 
				frame <= getMaxDiv() &&
				frame >= minDiv) {
				divContainers = frame;
				//console.log(divContainers)
				removeDiv(0,5);
			}
			//manageExponentButtonState(hi, divContainers);
		}
		*/
		drawStage();
		manageContainerButtonState();
	}
}

function openStage() {
	let hi = divContainers;
	let updateToOpenStage = divContainers != 1;
	if (updateToOpenStage) {
		divContainers = 1;
		removeDiv(1,hi);
	}
	//drawStage();
	manageContainerButtonState();
}

function handleAddColumn(buttonAddColumn) {
	buttonAddColumn.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }

		let update = (divContainers < activeMaxDiv);
		divContainers = update ? divContainers+1 : divContainers;

		disableAddColumn()
		if (update) { 
			//manageExponentButtonState(divContainers, divContainers);
			removeDiv(0, divContainers)
			drawStage() 
		}
		enableRemoveColumn();
	}
	//buttonAddColumn.addEventListener
}
function disableAddColumn() {
	if (divContainers == activeMaxDiv) {buttonAddColumn.disabled = true;}
}

function enableAddColumn() {
	if (buttonAddColumn.disabled && divContainers < activeMaxDiv) {
		buttonAddColumn.disabled = false;
	}
}

function handleRemoveColumn(buttonRemoveColumn) {
	//buttonRemoveColumn.innerHTML = getRemoveColumn();
	buttonRemoveColumn.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }

		let update = divContainers > minDiv ;
		divContainers = update ? divContainers-1 : divContainers;
		disableRemoveColumn();
		if (update) { 
			//manageExponentButtonState(divContainers+1, divContainers);
			removeDiv(0, divContainers+1);
			drawStage();
		}
		enableAddColumn();
	}
}

function disableRemoveColumn() {
	if (divContainers == minDiv) {buttonRemoveColumn.disabled = true;}
}

function enableRemoveColumn() {
	if (buttonRemoveColumn.disabled && divContainers > minDiv) {
		buttonRemoveColumn.disabled = false;
	}
}
/*
function getMinus() {
	let minus =  new createjs.Shape();
	minus.graphics.beginFill("#FFFFFF").drawRect(0,15,36,6);
	minus.cache(0, 0, 36, 36);
	var url = minus.getCacheDataURL();
	return "<img class=\"buttonImage\" src=" + url + ">";
}
*/

function handleAdd(buttonAdd){
	buttonAdd.innerHTML = getAdd();
}
function getAdd() {
	let plus =  new createjs.Shape();
	plus.graphics.beginFill("#FFFFFF").drawRect(15,0,6,36).drawRect(0,15,36,6)
	plus.cache(0, 0, 36, 36);
	var url = plus.getCacheDataURL();
	return "<img class=\"buttonImage\" src=" + url + ">";
}

function handleAddBlock(add, exponent) {
	add.onclick = function() {
		if (tweenRunningCount > 0 ) { return; }
		
		PlaySound(bloopSound, .8);

		if (divContainers == 1 || divBounds.array[exponent] != null) {
			makeRect(exponent)
		}
	}
}

function buildHandleBase() {
	for (let i = 1; i <= maxBase; i++) {
		let id = "button_base_" + i;
		let baseButton = document.getElementById(id);
		baseButton.id = i;
		//console.log(n.id)
		baseButton.onclick = function() {
			if (tweenRunningCount > 0 ) { return; }

			if (confirm("Are you sure you want to change base?" +
						"\n(this will clear the stage)")) {
				baseVal = baseButton.id;
				resetStage();
				openStage();

				// Find max exponent given base change
				activeMaxDiv = getMaxDiv();

				// Reset add container node button text to new base
				for (let i = 0; i < activeMaxDiv; i++) {
					expButtons[i].innerHTML = baseVal + superscriptRev[i]
				}
				drawStage();
			  } 
		}
	}
}

function getMaxDiv() {
	let exp = 4;
	while( Math.pow(baseVal,exp) >= maxNodeGroup ) { --exp; } 
	return exp+1;
}


function PlaySound(soundObj, volume) {
	var audio = new Audio(soundObj);
	audio.volume = volume;
	audio.play();
  }