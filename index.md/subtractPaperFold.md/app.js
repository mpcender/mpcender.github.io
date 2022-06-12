//const containter 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");

let stage;

let banner;
// height of stage division banners
const bannerHeight = 30;
const fontSize = 24;
const minHeight = 650;
const minWidth = 800;


// Node stage tracker (enables collision detection)
let stageNodeTracker = [];

// draw select box variables
let stageSelectorBox;
let objectEventActive = false;
let selectedObjects = [];

// Delay on stage update on resize (1 second)
let resizeTimer = null;
const resizeWait = 1000;

// Determine if tween is currently running on the stage
let tweenRunningCount = 0;
// Duration of node tween transition (ms)
const tweenDuration = 900;
// Shape object tween controll
let xTween;
let yTween;
// Node objects hidden during tween, reactivated on tween complete
let tweenHidden = [];

// Pixel size of each subNode object 
const nodeSize = 25;
const nodeShadowSize = 40;
const nodeOpacity = .6;
const borderThickness = 1.5;
// Largest subnodes in a container
const maxNodeGroup = 256;


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

let positivePaper;
let negativePaper;

let button_find_diff;
let button_repartition;

let stageBlocks;
let posIndex;
let negIndex;

let arrowButtonContainer;
let arrows= [];

function main() {
	stage = new createjs.Stage("canvas");
	stageBlocks = [];
	//stage.enableMouseOver(10);

	//isMobileDevice = isTouchDevice();

	// Enable touch input
	createjs.Touch.enable(stage);

	// initialize - used for selecting, group-move, and delete
	stageNodeTracker = new Array();

	// Draw all stage elements
	drawStage();

	// get and update container sizes & locations
	resizeUpdate();
	window.onresize = resizeUpdate;
	//

	// create and initialize stage HTML buttom objects
	enableButtons();
	
	
	createjs.Ticker.framerate = 30;
	createjs.Ticker.addEventListener("tick", stage);

	// displays mouse location on stage, Development use only
	let distxDOM = document.getElementById("distx")
	let distyDOM = document.getElementById("disty")
	distxDOM.style.color = distyDOM.style.color = "white";
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
	clearTimeout(resizeTimer);
    resize();
	resizeTimer = setTimeout(function() {
        resize();
    }, 100);
	

	function resize() {
		windowSizeX = window.innerWidth;
		windowSizeY = window.innerHeight;
		
		canvas.height = mainStageElem.clientHeight;
		canvas.width = mainStageElem.clientWidth;

		// Rebuild Banner
		if (banner != null){
			banner.children[0].graphics.command.w = canvas.width;
			banner.children[1].x = canvas.width/2;

			let s = .55;
			if (window.innerWidth < 1500) {
				s = window.innerWidth < 800 ? (4/15) : window.innerWidth/3000;
			} 

			// Evaluate window constrained new xy for paper size
			let x = window.innerWidth*s > minWidth*s ? window.innerWidth*s : minWidth*s;
			let y = window.innerHeight*s > minHeight*s ? window.innerHeight*s: minHeight*s;
			//console.log("xy = [" + (mainStageElem.clientWidth/2) + "," + (mainStageElem.clientHeight/2) + "]")
			positivePaper.resizePaper(x > y ? y : x, 
				mainStageElem.clientWidth*.23, 
				mainStageElem.clientHeight*.50);
			negativePaper.resizePaper(x > y ? y : x, 
				mainStageElem.clientWidth*.73, 
				mainStageElem.clientHeight*.50);
			resizeArrows();
		}

		// Remove generated blocks from stage on resize.
		stageBlocks.forEach(node => {
			/*
			node.graphics.command.h = 
			node.graphics.command.w = 
			node.graphics.command.x = 
			node.graphics.command.y = 
			*/
			stage.removeChild(node);
		});
		stageBlocks = [];
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
	banner = buildBanner();
	stage.addChild(banner);
	positivePaper = new PaperPositive({x: 400, y: 400}, mainStageElem.clientWidth*.25, mainStageElem.clientHeight*.50);
	negativePaper = new PaperNegative({x: 400, y: 400}, mainStageElem.clientWidth*.75, mainStageElem.clientHeight*.50);
	
	buildArrowButtons()
                
	//buildPaper({x: 550, y: 550}, mainStageElem.clientWidth/2, mainStageElem.clientHeight/2);
}




function buildBanner(){
	let banner = new createjs.Container();

	let shape = new createjs.Shape();
	shape.graphics.beginFill(bannerBorderColor)
		.drawRect(	0,
					0,
					mainStageElem.clientWidth,
					bannerHeight)

	let text = new createjs.Text("Fraction Subtraction", 
	fontSize+"px Balsamiq Sans", bannerFontColor);;
	text.textAlign ="center";
	
	text.x = (mainStageElem.clientWidth)/2;
	text.y = (bannerHeight-fontSize)/2;
	
	banner.addChild(shape, text);
	return banner;
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

	let button_define	= document.getElementById("button_define");
	button_repartition = document.getElementById("button_repartition");
	button_find_diff = document.getElementById("button_difference");
	let button_display	= document.getElementById("button_display");

	let buttonHelp = document.getElementById("button_help");
	let buttonReset = document.getElementById("button_refresh");

	handleDefine(button_define);
	handleRepartition(button_repartition);
	handleDifference(button_find_diff);
	handlePaper(button_display);

	handleHelp(buttonHelp);
	handleReset(buttonReset);


	button_find_diff.disabled = true;
	disableArrow();
}


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   		BUTTON EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function updateFractionDisplay(lnum, lden, rnum, rden){
	document.getElementById("leftNum").value = lnum;
	document.getElementById("leftDen").value = lden;
	document.getElementById("rightNum").value = rnum;
	document.getElementById("rightDen").value = rden;
	
}



function handleDefine(button_define){
	// initial setup
	updateFractionDisplay(0,1,0,1);

	button_define.onclick = function() {
		stageBlocks.forEach(node => {
			stage.removeChild(node);
		});
		stageBlocks = [];
		// Get user entered values
		let posNum = document.getElementById("leftNum").value;
		let posDen = document.getElementById("leftDen").value;
		let negNum = document.getElementById("rightNum").value;
		let negDen = document.getElementById("rightDen").value;

		// Update respective grids
		positivePaper.defineGrid(posNum, posDen);
		negativePaper.defineGrid(negNum, negDen);

		button_repartition.disabled = false;
		button_find_diff.disabled = true;
		disableArrow();
	}
}


function handleRepartition(button_repartition){
	button_repartition.onclick = function() {
		
		if (positivePaper.getRow() == negativePaper.getRow() 
			&& positivePaper.getCol() == negativePaper.getCol() ) { return; }

		// Generate approriate grid		
		positivePaper.setRow(negativePaper.getRow());
		negativePaper.setCol(positivePaper.getCol());

		// Generate individual tiles
		posTile = tileGen(positivePaper, positivePaper.getRow(), positivePaper.getFillVal());
		negTile = tileGen(negativePaper, negativePaper.getFillVal(), negativePaper.getCol());
		stageBlocks = posTile.concat(negTile);

		// Reset sliders
		positivePaper.resetSliders();
		negativePaper.resetSliders();

		positivePaper.disableInput();
		negativePaper.disableInput();

		button_find_diff.disabled = false;
		button_repartition.disabled = true;
		enableArrow();
	}
}


function handleDifference(button_find_diff) {
	button_find_diff.onclick = function() {
		button_find_diff.disabled = true;
		swarm();
		disableArrow();
	}
}

function swarm() {
	posIndex = posTile.length-1;
	negIndex = negTile.length-1;

	//console.log(positivePaper.getValue() + "  " +  negativePaper.getValue());
	
	if (positivePaper.getValue() >= negativePaper.getValue() ){
		let collision = negIndex+1;
		for (let i = 0; i < collision; i++) {
			tweenSwarm(negTile[negIndex--], posTile[posIndex--]);
		}
	} else {
		let collision = posIndex+1;
		for (let i = 0; i < collision; i++) {
			tweenSwarm(posTile[posIndex--], negTile[negIndex--]);
		}
	}
}

function tweenSwarm(nodeA, nodeB){
	if ( typeof nodeA  == 'undefined' || typeof nodeB == 'undefined') { return; }

	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", stage);
	tweenRunningCount++;
	slideRunning++;

	ptA = { x: nodeA.graphics.command.x, y: nodeA.graphics.command.y};
	ptB = { x: nodeB.graphics.command.x, y: nodeB.graphics.command.y};
	nodeA.mutDes = nodeB;

	createjs.Tween.get(nodeA, { loop: false }, null, false)
		.to({ 
			x: -(ptA.x-ptB.x), 
			y: -(ptA.y-ptB.y), }, 800, createjs.Ease.get(1))
		.to({alpha:0}, 200)
		.call(handleSwarmComplete);
}

function handleSwarmComplete(evt) {
	tweenRunningCount--;
	slideRunning--;

	stage.removeChild(evt.target.mutDes);
	stage.removeChild(evt.target);
	stageBlocks = stageBlocks.filter(b => b != evt.target.mutDes);
	stageBlocks = stageBlocks.filter(b => b != evt.target);

	posTile = posTile.filter(b => b != evt.target.mutDes);
	posTile = posTile.filter(b => b != evt.target);
	negTile = negTile.filter(b => b != evt.target.mutDes);
	negTile = negTile.filter(b => b != evt.target);
	
	positivePaper.decrementNumerator();
	negativePaper.decrementNumerator();

	if (negTile.length == 0 || posTile.length == 0) { 
		disableArrow(); 
		button_find_diff.disabled = true;
	}
}


function tweenScoot(node, xTween, yTween){
	console.log(node);

	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.addEventListener("tick", stage);
	tweenRunningCount++;
	slideRunning++;

	createjs.Tween.get(node, { loop: false }, null, false)
		.to({ x: xTween, y: yTween }, tweenDuration, createjs.Ease.get(1))
        .to({alpha:0}, 500)
		.to({ x: 0, y: 0 }, 500)
		.to({alpha:.25}, 500)
		.call(handleTweenComplete);
}



function tileGen(node, row, col) {
	let w = (node.getPaperSize().x-(node.getCol())) / node.getCol();
	let h = (node.getPaperSize().y-(node.getRow())) / node.getRow();
	let pt = node.getCover().localToGlobal(0, 0);
	
	let tiles = [];
	let inc = 0;
	for (let i = 0; i < row; i++) {
		for (let j = 0; j < col; j++) {
			tiles[inc] = new createjs.Shape();
			tiles[inc].graphics.beginFill(node.getColor()).drawRect(
				pt.x+j*w+j*1.5, pt.y+i*h+i, w, h
			);
			tiles[inc].alpha = .25;
			stage.addChild(tiles[inc]);
			inc++;
		}
	}
	console.log(tiles)

	return tiles;
}

function tick(evt) {
    // this set makes it so the stage only re-renders when an event handler 
	// indicates a change has happened.
    if (tweenRunningCount > 0) {
        stage.update(evt);
    }
}

function handleTweenComplete(evt) {
    tweenRunningCount--;
	slideRunning--;
}



function handlePaper(button_display) {
	button_display.onclick = function() {
		positivePaper.toggleFractionPositive();
		negativePaper.toggleFractionNegative();
	}
}



function handleReset(buttonReset) {
	buttonReset.onclick = function() {
		if (tweenRunningCount > 0 ) { return; }
		resetStage();
	}
	
}
function resetStage() {
	main();
}

/*
function clear(iterable) {
	iterable.forEach(element => {
		stage.removeChild(element);
	})
}
*/

function PlaySound(soundObj, volume) {
	soundObj.volume = volume;
	soundObj.play();
}

function buildArrowButtons() {
	arrowButtonContainer = new createjs.Container();

	let doubleRight = new createjs.Container();
	let drHit = createHit(0,0,120,70);
	drHit.addEventListener("click", function(event) { 
		if (tweenRunningCount > 0 ) {return;}
		posIndex = posTile.length-1;
		negIndex = negTile.length-1;
		let collision = posTile.length;
		console.log("POS->NEG COLLISIONS " + collision)
		for (let i = 0; i < collision; i++) {
			tweenSwarm(posTile[posIndex--], negTile[negIndex--]);
		}	
    });
	doubleRight.addChild(
		drHit, 
		drawArrow(7, 35, 0, 50, "#0048ff"),
		drawArrow(60, 35, 0, 50, "#0048ff"));

	let singleRight = new createjs.Container();
	let srHit = createHit(0,85,120,70);
	srHit.addEventListener("click", function(event) { 
		if (tweenRunningCount > 0 ) {return;}
        // single pos to neg
		console.log((posTile.length-1) + "," +  (negTile.length-1));
		tweenSwarm(posTile[posTile.length-1], negTile[negTile.length-1]);
    });
	singleRight.addChild(srHit, drawArrow(24, 120, 0, 75, "#0048ff"));

	let doubleLeft = new createjs.Container();
	let dlHit = createHit(0,200,120,70);
	dlHit.addEventListener("click", function(event) { 
		if (tweenRunningCount > 0 ) {return;}
		posIndex = posTile.length-1;
		negIndex = negTile.length-1;
		let collision = negTile.length;
		for (let i = 0; i < collision; i++) {
			tweenSwarm(negTile[negIndex--], posTile[posIndex--]);
		}
        
    });
	doubleLeft.addChild(
		dlHit, 
		drawArrow(57, 235, 180, 50, "#ff1b10"),
		drawArrow(110, 235, 180, 50, "#ff1b1b"));

	let singleLeft = new createjs.Container();
	let slHit = createHit(0,285,120,70);
	slHit.addEventListener("click", function(event) { 
		if (tweenRunningCount > 0 ) {return;}
        // single neg to pos
		tweenSwarm(negTile[negTile.length-1], posTile[posTile.length-1]);
    });
	singleLeft.addChild(slHit, drawArrow(95, 320, 180, 75, "#ff1b1b"));

	arrows = [doubleRight, singleRight, doubleLeft, singleLeft];
	resizeArrows();
	arrowButtonContainer.addChild(doubleRight, singleRight, doubleLeft, singleLeft);
	stage.addChild(arrowButtonContainer);
}

function createHit(x,y,w,l) {
	let hit = new createjs.Shape();
    hit.graphics.beginFill(bannerBorderColor)
		.drawRoundRectComplex(x,y,w,l,5,5,5,5);
    hit.alpha = .2;
	hit.source = this;
	return hit
}


function resizeArrows() {
	let w = mainStageElem.clientWidth;
	let h = mainStageElem.clientHeight;

	arrowButtonContainer.setTransform(w*.45-(25),h*.30);
}

function disableArrow() {
	arrows[0].visible = false;
	arrows[1].visible = false;
	arrows[2].visible = false;
	arrows[3].visible = false;
}
 
function enableArrow() {
	arrows[0].visible = true;
	arrows[1].visible = true;
	arrows[2].visible = true;
	arrows[3].visible = true;
}

function drawArrow(x, y, rot, size, color) {
	var LINE_RADIUS = 15; // the short radius of the "line box"
	var ARROWHEAD_RADIUS = 30; // the arrowhead radius;
	var ARROWHEAD_DEPTH = 30;
	var arrowSize = size;

    var arrow = new createjs.Shape();
    arrow.graphics.s(color)
            .f(color)
            .mt(0, 0)
            .lt(0, LINE_RADIUS)
            .lt(arrowSize - ARROWHEAD_DEPTH, LINE_RADIUS)
            .lt(arrowSize - ARROWHEAD_DEPTH, ARROWHEAD_RADIUS)
            .lt(arrowSize, 0)
            .lt(arrowSize - ARROWHEAD_DEPTH, -ARROWHEAD_RADIUS)
            .lt(arrowSize - ARROWHEAD_DEPTH, -LINE_RADIUS)
            .lt(0, -LINE_RADIUS)
            .lt(0, 0)
            .es();
    arrow.x = x;
    arrow.y = y;
    arrow.alpha = .5;
    arrow.rotation = rot;
	return arrow;
}


function toastAlert(message) {
    currentToast = document.getElementById("toast");
    currentToast.innerHTML = "<br>"+message+"<br><br>";
    currentToast.className = "show";
    toastTimeout = setTimeout(function(){ currentToast.className = 
    	currentToast.className.replace("show", ""); }, 4000);
}