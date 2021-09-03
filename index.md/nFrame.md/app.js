//const containter 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");

let stage;
// Base value
let baseVal = 3;
// Maximum base of program
const minBase = 2;
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
const bannerHeight = 30;
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
const nodeShadowSize = 40;
const nodeOpacity = .6;
const borderThickness = 1.5;
// Largest subnodes in a container
const maxNodeGroup = 256;

// In place does not update placement of node to corresponding column
let inPlaceCompose = false;
let inPlaceDecompose = false;

// draw select box variables
let stageSelectorBox;
let objectEventActive = false;
let selectedObjects = [];
let seperateToOnes = true;

// Delay on stage update on resize (1 second)
let resizeTimer = null;
const resizeWait = 1000;

// Column button variables
let buttonSortColumn;
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


// COLOR Properties
let style = getComputedStyle(document.body)
let mainBlue = style.getPropertyValue("--main_blue");
let border = style.getPropertyValue("--border");
let buttonText = style.getPropertyValue("--button_text");
let darkBackground = style.getPropertyValue("--dark_background");
//let buttonGrey = style.getPropertyValue("--button_grey");
//let buttonShadow = style.getPropertyValue("--button_grey_shadow");
//let disabledButton = style.getPropertyValue("--disabled_grey");

// Color codes for container node color change
// Import CSS node color propery values			
let colors = [	style.getPropertyValue("--blue_node").replaceAll("\"", ""),
				style.getPropertyValue("--red_node").replaceAll("\"", ""),
				style.getPropertyValue("--yellow_node").replaceAll("\"", ""),
				style.getPropertyValue("--green_node").replaceAll("\"", "")];
let colorsOff = [style.getPropertyValue("--blue_offset_node").replaceAll("\"", ""),
				style.getPropertyValue("--red_offset_node").replaceAll("\"", ""),
				style.getPropertyValue("--yellow_offset_node").replaceAll("\"", ""),
				style.getPropertyValue("--green_offset_node").replaceAll("\"", "")]
let shadowColors = ["#69a5ff", "#ff6b7d", "#ffd46e", "#caff75"];
let bannerBorderColor = border;
let bannerFontColor = buttonText;
// Toggle color seperation of node blocks
let visualSeperation = false;
let currentColor = 0;

// AUDIO clip variables
let slideRunning = 0;
let trashRunning = 0;
const bloopSound = new Audio("res/sound/bloop.mp3");
const trashSound = new Audio("res/sound/trash.mp3");
const slideSound = new Audio("res/sound/slide.mp3");
const paintSound = new Audio("res/sound/clayChirp.mp3");

// User input regex for integer value
//const regInt = new RegExp('^[0-9]$');


// Dropup buttons
let buttonToggleAssist;
let buttonTogglePlain; 




//------------------------------------------------------
//
//		TODO:	
//				- 
//

/* Detect touchscreen devices
let isMobileDevice;
function isTouchDevice() {
	return (('ontouchstart' in window) ||
	   (navigator.maxTouchPoints > 0) ||
	   (navigator.msMaxTouchPoints > 0));
}
*/

function main() {
	stage = new createjs.Stage("canvas");

	//isMobileDevice = isTouchDevice();

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
		dividers[i-1].graphics.beginFill(bannerBorderColor).
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
	prevDivBounds = divBounds;
	divBounds = new DivSection(divTrack);
	manageExponentButtonState();
	updateNodePositions();
}

function buildBanner(i){
	let banner = new createjs.Container();

	let divContWidth = mainStageElem.clientWidth/divContainers;
	let shape = new createjs.Shape();
	shape.graphics.beginFill(bannerBorderColor)
		.drawRect(	0,
					0,
					i==1 ? divContWidth : divContWidth-5,
					bannerHeight)

	// Calculate index offset for superscript values
	let j = (i-1)-(divContainers-5);
	let text;
	
	// Display "Base N" on open stage
	if (divContainers <= 1) {
		text = new createjs.Text("Base " + baseVal, 
			fontSize+"px Balsamiq Sans", bannerFontColor);
	} 
	// Display N^k on column view
	else {
		text = new createjs.Text(baseVal+superscript[j], 
			fontSize+"px Balsamiq Sans", bannerFontColor);
	}
	text.textAlign ="center";
	
	text.x = (divContWidth)/2;
	text.y = (bannerHeight-fontSize)/2;
	
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
	container.setBounds(0, 0, col+nodeSize, row+nodeSize);

	container.addChild(buildBorder(col, row));

	applyNodeHandlers(container)
	getContainerPlacement(container, exponent, mod);	
	
	stageNodeTracker.push(container);
	stage.addChild(container);
	updateColor(container, currentColor)
	//container.color=0;
	return container;
}

// Single rectangle for stage object creation
function buildSubNode(col, row){
	let node = new createjs.Shape();
	node.graphics.beginStroke("white");
	node.graphics.setStrokeStyle(borderThickness);
	node.snapToPixel = true;
	node.graphics.beginFill(colors[0]).
		drawRoundRect(col, row, nodeSize, nodeSize, 5);
	return node;
}

function buildBorder(col, row){
	let node = new createjs.Shape();
	node.graphics.beginStroke(darkBackground);
	node.shadow = new createjs.Shadow(darkBackground, 0, 0, 5);
	//node.alpha = .7
	node.graphics.setStrokeStyle(4);
	node.snapToPixel = true;
	node.graphics.
		drawRoundRect(-4, -4, col+nodeSize+8, row+nodeSize+8, 5);
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
	container.setBounds(0, 0, nodeSize, nodeSize);
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

	let spacing = nodeSize;
	if (exponent == 0 && divContainers != 1) { spacing = (nodeSize*.25); } 
	
	container.x = minX+spacing;
	container.y = minY+spacing;
	updateNodeTracking(container, container.x, container.y, 
		container.x+container.col+nodeSize, container.y+container.row+nodeSize);
	container.setBounds(0, 0, container.col+nodeSize, container.row+nodeSize);
	let pt = nodeCollisionUpdate(container);

	// While collision detected
	while (pt.x != 0 || pt.y != 0) {
		container.y = pt.yPrev+nodeSize+spacing;
		if (container.y > maxY) {
			container.y = minY+spacing;
			container.x += spacing;
			
		}
		updateNodeTracking(container, container.x, container.y, 
			container.x+container.col+nodeSize, container.y+container.row+nodeSize);
		pt = nodeCollisionUpdate(container);
	}

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

	let xTween = 0;
	let x = container.x;
	
	// If node object is currently active on stage
	if (prevDivBounds.array[exponent] != null) {
		// Track location in current frame to match to new frame
		let len = prevDivBounds.array[exp].botX - 
			(prevDivBounds.array[exp].topX+container.col+nodeSize)
		let dist = x - prevDivBounds.array[exp].topX
		let ratio = dist/len
		let distNew;
		distNew = divBounds.array[exponent].botX-
			(divBounds.array[exponent].topX+container.col+nodeSize)
		xTween = minX + distNew*ratio 
	} 
	// If node object is not active (in stageNodeStorage)
	else {
		// if node object is already in correct boundary, dont move
		if (divContainers == (exp+1) && divBounds.array[exponent].topX 
			&& x+container.col+nodeSize < divBounds.array[exponent].botX) {
			xTween = x;	
		} 
		// node object requires move to correct column
		else {
			let len = window.windowSizeX
			let dist = x
			let ratio = dist/len
			
			let distNew = divBounds.array[exp].botX-divBounds.array[exp].topX
			
			xTween = divContainers == (exp+1) ? 
				distNew*ratio+nodeSize : 
				divBounds.array[exp+1].botX+distNew*ratio+nodeSize
		}
	}
	
	tweenScoot(container, xTween, container.y);

}

// Update container stage postion tracking variables
function updateNodeTracking(cont, tlx, tly, brx, bry) {
	cont.loc = new DivTracker(tlx, tly, brx, bry);
}

/**
 * TODO
 * @param  container 
 * @returns 
 */
function nodeCollisionUpdate(container) {
	for(let i = 0; i < stageNodeTracker.length; i++){
		
		// skip self
		if (stageNodeTracker[i] == container) { continue; } 
		else {
			let offset = intersect(container, stageNodeTracker[i]);
			if (offset.x != 0 || offset.y != 0){	
				offset.xPrev = stageNodeTracker[i].x
				offset.yPrev = stageNodeTracker[i].y+stageNodeTracker[i].row
				return offset
			}
		}
		
	}
	return {x: 0, y: 0};
}

function intersect(r1, r2) {
    var leftMost = (r1.loc.topX < r2.loc.topX) ? r1 : r2;
    var rightMost = (r1.x > r2.x) ? r1 : r2;
    var upMost = (r1.loc.topY < r2.loc.topY) ? r1 : r2;
    var downMost = (r1.loc.topY > r2.loc.topY) ? r1 : r2;

	var upperLeft = [rightMost.loc.topX, downMost.loc.topY];
    var upperRight = [leftMost.loc.topX + leftMost._bounds.width, downMost.loc.topY];
    var lowerLeft = [rightMost.loc.topX, upMost.loc.topY + upMost._bounds.height];
    var lowerRight = [leftMost.loc.topX + leftMost._bounds.width, upMost.loc.topY + upMost._bounds.height];
    
    var width = upperRight[0] - upperLeft[0];
    var height = lowerLeft[1] - upperLeft[1];
    
    if (width < 0 || height < 0) {
        width = 0;
        height = 0;
    }
    if (r1.loc.topY < r2.loc.topY) {
		height =  -1*height;
	}
    var r = {x: 0, y:height}
    
    return r;
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
			
			let exponent = Math.round(Math.log(element.children.length-1, baseVal));
			
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
				let exponent = Math.round(Math.log(stageNodeTracker[j].children.length-1, baseVal));
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
	let color = colors[node.color];
	if (node.children.length <= 2) { color = shadowColors[node.color]; }
	node.shadow = new createjs.Shadow(color, 0, 0, nodeShadowSize);
	node.alpha = nodeOpacity;
	selectedObjects.push(node);
	node.stageForDeselect = false;
}
function deselectNode(node){
	node.shadow = null;
	node.alpha = 1;
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
// 				         BUTTON STATE
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function manageContainerButtonState() {
	if (divContainers >= getMaxDiv()) { disableAddColumn(); }
	else { enableAddColumn(); }
	if (divContainers <= minDiv) { 
		disableRemoveColumn();
		inPlaceCompose = true;
		inPlaceDecompose = true; 
	}
	else { enableRemoveColumn(); }
	toggleSortColumn();
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

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   STAGE SELECTOR BOX EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function handleStageMouseDown(event) {
	if (stageEventInvalid(event)) { return; }
	if (objectEventActive) { return; }
	// Store current stage mouse location
	oldPt = new createjs.Point(stage.mouseX, stage.mouseY);

	stage.addEventListener("stagemousemove", handleStageMouseMove);
}

function handleStageMouseMove(event) {
	// Select objects / remove selectorBox if off banner
	/*
	if (stage.mouseY < bannerHeight) { 
		multiSelectEvent(event);
	}
	*/
	// if dragger active or mouse out of bounds return
	if (stageEventInvalid(event)) { return; }
	if (objectEventActive) { return; }
	let stroke = 10;

	// Enable boundary on drawing selector box on selector stage
	let stageMouseY = stage.mouseY;
	if (stageMouseY < (bannerHeight+2)){
		stageMouseY = bannerHeight+2; }

	stage.removeChild(stageSelectorBox)
	let shape = new createjs.Shape();
	shape.graphics.setStrokeDash([stroke * 2, stroke]).
		beginStroke(bannerFontColor).rect(oldPt.x, oldPt.y,
			stage.mouseX - oldPt.x, stageMouseY - oldPt.y);
	
	stageSelectorBox = shape;
    stage.addChild(stageSelectorBox);
}


function handleStageMouseUp(event) {
	if (stageEventInvalid(event)) { return; }
	multiSelectEvent(event);
}

function multiSelectEvent(event) {
	stage.removeChild(stageSelectorBox)
	stage.removeEventListener("stagemousemove", handleStageMouseMove);
	
	// if dragger active or mouse out of bounds return
	if (objectEventActive) { return; }
	let deselectAll = [];

	// If stage click (not drag) deselect all stage objects
	if (oldPt.x == stage.mouseX && oldPt.y == stage.mouseY){
		for (j = selectedObjects.length-1; j >= 0; j--){
			deselectNode(selectedObjects[j]);
			selectedObjects.splice(j,1);
		} 
	}
	
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

// Determine if stage selector is valid event
function stageEventInvalid(event) {
	return (!event.primary || tweenRunningCount > 0 || stage.mouseY < bannerHeight);
} 

//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   		NODE EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function applyNodeHandlers(node) {

	node.on("click", function (evt) {
		
		//updateSelectedObjects(node);

		//node.shadow = new createjs.Shadow(colors[node.color], 0, 0, nodeShadowSize);
	});

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

		// If object did not move select/deselect
		if (!node.onTheMove) { 
			if (selectedObjects.includes(node)) {
				deselectNode(node)
				selectedObjects.splice(selectedObjects.indexOf(node), 1);
			} else {
				selectNode(node)
			}
		}

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
	if (!baseChangeActive) {
		if (slideRunning < 1 && trashRunning < 1) { PlaySound(slideSound,.4)}
		createjs.Ticker.timingMode = createjs.Ticker.RAF;
		createjs.Ticker.addEventListener("tick", stage);
		tweenRunningCount++;
		slideRunning++;
		createjs.Tween.get(node, { loop: false }, null, false)
			.to({ x: xTween, y: yTween }, tweenDuration, createjs.Ease.get(1))
			.call(handleTweenComplete);
	} else {
		handleBaseChange(node, xTween, yTween)
	}
}

// Track tween events
function handleTweenComplete(evt) {
	let x = evt._curQueueProps.x;
	let y = evt._curQueueProps.y;

	updateNodeTracking(evt.target, x, y, 
		x+evt.target.col+nodeSize, 
		y+evt.target.row+nodeSize);

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

function handleBaseChange(node, x, y) {
	updateNodeTracking(node, x, y, 
		x+node.col+nodeSize, 
		y+node.row+nodeSize);

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
	//let buttonAddBlock = document.getElementById("button_add_block");

	let buttonCombine = document.getElementById("button_combine");
	let buttonSingle = document.getElementById("button_single")
	let buttonGroup = document.getElementById("button_group")
	let buttonPaint = document.getElementById("button_paint");
	buttonToggleAssist = document.getElementById("button_toggle_assist")
	buttonTogglePlain = document.getElementById("button_toggle_plain")
	buttonTogglePlain.disabled = true;

	buttonSortColumn = document.getElementById("button_sort_column");
	let buttonColumn = document.getElementById("button_column");
	buttonAddColumn = document.getElementById("button_add_col");
	buttonRemoveColumn = document.getElementById("button_remove_col");

	let buttonHelp = document.getElementById("button_help");
	let buttonTrash = document.getElementById("button_trash");
	let buttonReset = document.getElementById("button_refresh");

	
	for (let i = 0; i < activeMaxDiv; i++) {
		let id = "button_add_" + i;
		expButtons[i] = document.getElementById(id);
		expButtons[i].innerHTML = baseVal + superscriptRev[i]
		handleAddBlock(expButtons[i],i);
	}
	expParent = expButtons[0].parentNode;

	handleCombine(buttonCombine);
	handleSeperate(buttonSingle);
	handleSeperate(buttonGroup);
	handlePaint(buttonPaint);
	handleToggleAssist(buttonToggleAssist, buttonTogglePlain);
	handleTogglePlain(buttonTogglePlain, buttonToggleAssist);
	
	handleSortColumn(buttonSortColumn);
	handleColumn(buttonColumn);
	handleAddColumn(buttonAddColumn);
	handleRemoveColumn(buttonRemoveColumn);
	
	handleHelp(buttonHelp);
	handleTrash(buttonTrash);
	handleReset(buttonReset);
	
	buildHandleBase();
	disableRemoveColumn();
}

function handleToggleAssist(){
	buttonToggleAssist.onclick = function(){
		visualSeperation = !visualSeperation;
		buttonToggleAssist.disabled = true;
		buttonTogglePlain.disabled = false;
		buttonToggleAssist.style.display = 'none';
		buttonTogglePlain.style.display = 'none';
		repaintSelected(stage.children, false);

		//if (helpActive && currentTween==7) {action8();}
	}
}
function handleTogglePlain(){
	buttonTogglePlain.onclick = function(){
		visualSeperation = !visualSeperation;
		buttonTogglePlain.disabled = true;
		buttonToggleAssist.disabled = false;
		buttonToggleAssist.style.display = 'none';
		buttonTogglePlain.style.display = 'none';
		repaintSelected(stage.children, false);

		//if (helpActive && currentTween==8) {action9();}
	}
}

function paintMouseover(){
	buttonToggleAssist.style.display = '';
	buttonTogglePlain.style.display = '';
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
		toggleSortColumn()
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
	
	openStage()
	manageContainerButtonState()
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
			let exponent  = Math.round(Math.log(node.children.length-1, baseVal));
			// Check if exponent+1 container can exist on the stage
			if (exponent+1 < activeMaxDiv) {
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
					for(let k = 0; k < combine[i][j].children.length-1; k++) {
						let child = combine[i][j].children[k];
						let ptTop = child.localToGlobal(child.regX,child.regY);
						ptTop.x = ptTop.x+child.col;
						ptTop.y = ptTop.y+child.row;
						let tweenNode = makeSingleRect(ptTop.x, ptTop.y)
						updateColor(tweenNode, combine[i][j].color);
						tweenNode.children[0].graphics._fill.style = colors[combine[i][j].color];
						updateSelectedObjects(tweenNode);
						tweenNode.shadow = new createjs.Shadow(shadowColors[combine[i][j].color], 0, 0, nodeShadowSize);
						tweenNodes.push(tweenNode)
					}
				}
				// build new node
				let toMake = combine[i].length/baseVal;
				let exponent  = i+1;
				for(let j = 0; j < toMake; j++) {
					newObject[index] = buildNew(combine[i][0], exponent);
					index++;
				}

				// Evaluate location for tween nodes to translate to
				for(let j = 0; j < newObject.length; j++) {
					for(let k = 0; k < newObject[j].children.length-1; k++) {
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
		toggleSortColumn();
		/*
		if (helpActive && currentTween==5) { 
			console.log(selectedObjects)
			action6(); 
		}
		*/
	}

	function buildNew(node, exp) {
		// Build new object
		let object = makeRect(exp);
		
		/*
		if (inPlaceCompose) {
			object.x=x;
			object.y=y;
			updateNodeTracking(object, object.x, object.y, 
				object.x+object.col+nodeSize, object.y+object.row+nodeSize);
		}
		*/
		object.setBounds(0, 0, object.col+nodeSize, object.row+nodeSize);

		// Hide during tween
		tweenHidden.push(object);
		object.alpha = 0;
		// Update color to previous node color
		object.color = node.color;
		updateColor(object, object.color);
		//object.prevExp = exp-1;

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
let currentToast;
let toastTimeout;
function toastTutorial(message) {
	currentToast = document.getElementById("snackbarTutorial");
	currentToast.innerHTML = message;
	currentToast.className = "show";
	toastTimeout = setTimeout(function(){ currentToast.className = 
		currentToast.className.replace("show", ""); }, time-500);
}
function toast(message) {
	currentToast = document.getElementById("toast");
	currentToast.innerHTML = message; //+ "<br><br>" + buttonAddColumn.outerHTML;
	currentToast.className = "show";
	toastTimeout = setTimeout(function(){ currentToast.className = 
		currentToast.className.replace("show", ""); }, 4500-500);
}


function handleSeperate(buttonSeperate) {
	buttonSeperate.onclick = function(){
		seperateObjects(buttonSeperate.id);
		
	}
}

function seperateObjects(buttonID){
	
	if (tweenRunningCount > 0 ) { return; }
	let selectedMax = 0;  // toggleSortColumn - selected blocks
	let totalMax = 0; // // toggleSortColumn - total blocks
	
	// determines which button is being pressed
	if(buttonID == "button_single") {
		seperateToOnes = true;
	} else {
		seperateToOnes = false;
	}

	let toSeperate = []
	let singles = []
	// Only seperate nodes larger than one
	for (let i = 0; i < selectedObjects.length; i++) {
		if (selectedObjects[i].children.length-1 > 1) {
			toSeperate.push(selectedObjects[i])
			// toggleSortColumn - count number of max size blocks
			let n = selectedObjects[i].children.length-1;
			if ((Math.round(Math.log(n, baseVal)))+1 == divContainers) { 
				selectedMax++; 
			} // end toggleSortColumn
		} else {
			singles.push(selectedObjects[i]);
		}
	}
	// toggleSortColumn - check number of max size blocks on stage 
	stageNodeTracker.forEach( node => {
		let n = node.children.length-1;
		if ((Math.round(Math.log(n, baseVal)))+1 == divContainers) { 
			totalMax++; 
		}
	})
	// if all max objects are being seperated, enable SortColumn
	if (selectedMax == totalMax) { 
		buttonSortColumn.disabled = false; 
	}// end toggleSortColumn

	// deselect single nodes
	for (let i = 0; i < singles.length; i++) {
		let j = selectedObjects.indexOf(singles[i])
		deselectNode(selectedObjects[j]);
		selectedObjects.splice(j,1);
	}
	for (let i = 0; i < toSeperate.length; i++) {
		let node = toSeperate[i];
		let exponent = Math.round(Math.log(node.children.length-1, baseVal));
		// Prevent node expansion beyond window bounds
		/*
		console.log(!inPlaceDecompose && 
			(node.x+(node.col+nodeSize)*1.5 > (canvas.width) ||
			node.y+(node.row+nodeSize)*1.5 > (canvas.height-bannerHeight)))
		if (!inPlaceDecompose && 
			(node.x+(node.col+nodeSize)*1.5 > (canvas.width) ||
			node.y+(node.row+nodeSize)*1.5 > (canvas.height-bannerHeight))) {
			toastTutorial("The " + exponent + superscriptRev[exponent] + 
				" node will go out of bounds")
			let j = selectedObjects.indexOf(node)
			deselectNode(selectedObjects[j]);
			selectedObjects.splice(j,1);
			continue;
		} else if (inPlaceDecompose) {
			// Stage bound limit toast??
		}
		*/
		node.alpha = 0;
		
		
		// Seperate to ones or to next lower size
		let exp = 0;
		let size = node.children.length-1;
		
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
		for(let j = 0; j < node.children.length-1; j++) {
			let child = node.children[j];
			let ptTop = child.localToGlobal(child.regX,child.regY);
			ptTop.x = ptTop.x+child.col;
			ptTop.y = ptTop.y+child.row;
			tweenNodes[j] = makeSingleRect(ptTop.x, ptTop.y);
			updateColor(tweenNodes[j], toSeperate[i].color);
			updateSelectedObjects(tweenNodes[j]);
			tweenNodes[j].children[0].graphics._fill.style = colors[toSeperate[i].color];
			tweenNodes[j].shadow = new createjs.Shadow(shadowColors[node.color], 0, 0, nodeShadowSize);
			// Structured Decompose for Singles
			if (size == node.children.length-1) {
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
			//newObjects[j].prevExp = exponent;

			// IN PLACE DECOMPOSE
			// Structured Decompose for Singles node
			if (inPlaceDecompose){ 
			if (newLoc.length != 0) {
				newObjects[j].x = newLoc[j].x;
				newObjects[j].y = newLoc[j].y;	
				updateNodeTracking(newObjects[j], newLoc[j].x, newLoc[j].y, 
					newLoc[j].x+nodeSize, newLoc[j].y+nodeSize);
			} 
			// Structured Decompose for Multi-node containers
			else {
				let expon = divBounds.array[exp] != null ? exp : 0;
				let mod = baseVal/3+exp;
				if (exp%2 == 0){
					let offset = multiY+newObjects[j].row+(nodeSize*mod)+(newObjects[j].row+nodeSize)
					let bound = divBounds.array[expon].botY - divBounds.array[expon].topY
					if (offset < bound){
						multiY += newObjects[j].row+(nodeSize*mod)
					} else {
						multiX += newObjects[j].col+(nodeSize*mod)*3
						multiY = node.y;
					}
				} else {
					let offset = multiX+newObjects[j].col+(nodeSize*mod)+(newObjects[j].col+nodeSize)
					let bound = divBounds.array[expon].botX - divBounds.array[expon].topX
					if (offset < bound){
						multiX += newObjects[j].col+(nodeSize*mod)
					} else {
						multiY += newObjects[j].row+(nodeSize*mod)
						multiX  = node.x;
					}
				}
				newObjects[j].x = multiX;
				newObjects[j].y = multiY;	
				updateNodeTracking(newObjects[j], multiX, multiY, 
					multiX+newObjects[j].col+nodeSize, 
					multiY+newObjects[j].row+nodeSize);
				
			}
			}
			
			// Tween tweenNodes to location of new object
			for(let k = 0; k < newObjects[j].children.length-1; k++) {
				let child = newObjects[j].children[k];
				let ptTop = child.localToGlobal(child.regX,child.regY);
				child.setBounds(0, 0, nodeSize, nodeSize);
				updateNodeTracking(child, ptTop.x, ptTop.y, 
					ptTop.x+child.col+nodeSize, ptTop.y+child.row+nodeSize);
				ptTop.x = ptTop.x+child.col;
				ptTop.y = ptTop.y+child.row;
				let tween = tweenNodes.splice(0,1);
				
				tweenScoot(tween[0],ptTop.x,ptTop.y);
			}
		} 
		/*
		if (helpActive) {
			document.getElementById("snackbar").classList.remove("show")
			clearTimeout(toastTimeout)
			toastTutorial("Great, now click and drag to select the new blocks on the screen")
		}
		*/
	}
}

function handlePaint(buttonPaint) {
	buttonPaint.onclick = function(){
		repaintSelected(selectedObjects, true);

		//if (helpActive && currentTween==6) {action7();}
	}
}

function repaintSelected(objects, nextColor){
	if (tweenRunningCount > 0 ) { return; }
	PlaySound(paintSound, .6)

	for (let i = 0; i < objects.length; i++) {
		if (objects[i]._listeners == null || objects[i].color == undefined) { 
			continue;
		}
		
		let color;
		color = objects[i].color;
		if (nextColor) {
			color = objects[i].color = color>=3 ? 0 : ++color;

			let shadowColor = colors[color];
			if (objects[i].children.length <= 2) { shadowColor = shadowColors[color]; }
			objects[i].shadow = new createjs.Shadow(shadowColor, 0, 0, nodeShadowSize);
		}
		// Objects current color
		updateColor(objects[i], objects[i].color);
	}
}

// Update color and varies colors for exponent-1
function updateColor(node, color){
	let colorMod = colors[color]
	for(let j = 0; j < node.children.length-1; j++) {
		let exponent = Math.round(Math.log(node.children.length-1, baseVal));
		if (visualSeperation 
			&& node.children.length-1 != 1 
			&& j%Math.pow(baseVal,exponent-1) == 0) {
			if (colorMod.includes(colors[color])) { colorMod = colorsOff[color] }
			else { colorMod = colors[color] }
		} 
		node.children[j].graphics._fill.style = colorMod;
	}
	node.color = color
}

function handleSortColumn(buttonSortColumn){
	buttonSortColumn.onclick = function(){
		if (tweenRunningCount > 0 ) { return; }
		sortColumns();
		toggleSortColumn();
	}
}

function sortColumns(){
	//Determine largest Block on stage
	let largest = 0;
	for(i=0;i<stage.children.length;i++){
		if (stage.children[i].row == undefined) { continue; }
		let exp = Math.round(Math.log(stage.children[i].children.length-1 , baseVal));
		largest = largest < exp ? exp : largest;	
	}
	divContainers = largest+1;
	inPlaceCompose = false;
	inPlaceDecompose = false; 
	
	removeDiv(0,5);
	drawStage();
	manageContainerButtonState();
}


function toggleSortColumn() {
	//console.log(divContainers + " " + stageNodeTracker.length);
	// if open stage enable button
	if (divContainers == 1) {
		buttonSortColumn.disabled = false;
		return;
	}
	for (i=0; i < stageNodeTracker.length; i++){
		let node = stageNodeTracker[i]
		let exp = Math.round(Math.log(node.children.length-1 , baseVal));
		console.log(exp+1 + " " + divContainers)
		if (exp+1 < divContainers) { 
			buttonSortColumn.disabled = false;
		} else {
			buttonSortColumn.disabled = true;
			break;
		}
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
			inPlaceCompose = false;
			inPlaceDecompose = false;
			removeDiv(0, divContainers)
			drawStage(); 
		}
		enableRemoveColumn();
		toggleSortColumn();
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
		toggleSortColumn()
	}
}

function disableRemoveColumn() {
	if (divContainers == minDiv) { 
		buttonRemoveColumn.disabled = true;
		inPlaceCompose = true;
		inPlaceDecompose = true;
	}
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

function getAdd() {
	let plus =  new createjs.Shape();
	plus.graphics.beginFill(bannerFontColor).drawRect(15,0,6,36).drawRect(0,15,36,6)
	plus.cache(0, 0, 36, 36);
	var url = plus.getCacheDataURL();
	return "<img class=\"buttonImage\" src=" + url + ">";
}

// Javascript draw button icon
function handleAdd(buttonAddBlock){
	buttonAddBlock.innerHTML = "Add Blocks"
	//buttonAdd.innerHTML = getAdd();
}

*/



function handleAddBlock(add, exponent) {
	add.onclick = function() {
		if (tweenRunningCount > 0 ) { return; }
		// Check for sort column button toggle
		if (divContainers != 1 && exponent+1 == divContainers) { 
			buttonSortColumn.disabled = true; 
		}
		/*
		if(helpActive && currentTween == 1) {
			console.log(add.id == "button_add_2")
			if (add.id == "button_add_2"){
				action2text = "Awesome, now click on the stage and drag your "
				+"mouse over the block to select it" +
				"<br><br><h5>The block will glow when selected</h5>";
				action2continue = true;
				action2();
			} else{
				action1text = "You'll need to hover your mouse over the " +
				"\"Add Block\" button and click 4" +superscript[2];
				action1();
				return;
			}
		}
		*/
		
		PlaySound(bloopSound, .8);
		if (divContainers == 1 || divBounds.array[exponent] != null) {
			makeRect(exponent)
		}
	}
}

// disable tween transitions
let baseChangeActive = false; // On baseChange, skip tween animation onComplete
function buildHandleBase() {
	for (let i = minBase; i <= maxBase; i++) {
		let id = "button_base_" + i;
		let baseButton = document.getElementById(id);
		baseButton.id = i;
		baseButton.onclick = function() {
			if (tweenRunningCount > 0 ) { return; }

			// HELP bar
			/*
			if(helpActive){
				tweenObj.setPaused(true);
				if (baseButton.id == 4) {
					action0continue = true;
					action0_5();
				} else {
					action0text = "You'll need to hover your mouse over the " +
					"\"Base Change\" button and click 4. <br>Then click \"OK\"";
					action0();
					return;
				}
			}
			*/

			if (confirm("Are you sure you want to change base?" +
			"\n\n \"Ok\" changes base. \"Cancel\"  keeps the current base.")) {
				if (confirm("Would to like to keep the blocks currently on the" +
				" stage" + " \n\n \"Ok\" to keep blocks.  \"Cancel\"  clears stage.")) {
					baseChangeActive = true;
					openStage();
					//sortColumns();
					stageNodeTracker.forEach( node => {
						if(node.shadow == null || node.shadow == undefined){
							selectNode(node)
						}
					});
					stageNodeStorage = [[],[],[],[],[]];
					seperateObjects("button_single");
					
					baseChangeActive = false;
				} else {
					resetStage();
				}
				baseVal = baseButton.id;
				drawStage();

				// Find max exponent given base change
				activeMaxDiv = getMaxDiv();

				// Reset add container node button text to new base
				for (let i = 0; i < activeMaxDiv; i++) {
					expButtons[i].innerHTML = baseVal + superscriptRev[i]
				}
				//drawStage();
			} 
			/*
			else if (helpActive){
				action0continue = false;
				action0text = "You'll need to hover your mouse over the " +
					"\"Base Change\" button and click 4. <br>Then click \"OK\"";
				action0();
			}
			*/
			baseChangeActive = false;
		}
	}
}

function getMaxDiv() {
	let exp = 4;
	while( Math.pow(baseVal,exp) >= maxNodeGroup ) { --exp; } 
	// Frank request: Prevent 5^3 and 6^3 blocks
	if (baseVal == 5 || baseVal == 6){ return exp; }
	else{ return exp+1; }
	
}

function PlaySound(soundObj, volume) {
	soundObj.volume = volume;
	soundObj.play();
}


