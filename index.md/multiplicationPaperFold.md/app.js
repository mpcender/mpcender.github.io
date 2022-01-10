//const containter 
const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");

let isMobileDevice;
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

let mainPaper;

function isTouchDevice() {
	return (('ontouchstart' in window) ||
	   (navigator.maxTouchPoints > 0) ||
	   (navigator.msMaxTouchPoints > 0));
}

function main() {
	stage = new createjs.Stage("canvas");
	stage.enableMouseOver(10);

	isMobileDevice = isTouchDevice();

	// Enable touch input
	createjs.Touch.enable(stage);

	// initialize - used for selecting, group-move, and delete
	stageNodeTracker = new Array();

	// Draw all stage elements
	drawStage();

	// get and update container sizes & locations
	window.onresize = resizeUpdate;
	resizeUpdate();

	// create and initialize stage HTML buttom objects
	enableButtons();
	
	
	createjs.Ticker.framerate = 30;
	createjs.Ticker.addEventListener("tick", stage);

	
	if (isMobileDevice){
		console.log("Touch device detected")
		window.addEventListener("click", function(event) {
			minimizeDropupButtonMenus();
		});
	}
	

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

			// Evaluate window constrained new xy for paper size
			let x = window.innerWidth*.70 > minWidth*.70 ? window.innerWidth*.70 : minWidth*.70;
			let y = window.innerHeight*.70 > minHeight*.70 ? window.innerHeight*.70: minHeight*.70;
			//console.log("xy = [" + (mainStageElem.clientWidth/2) + "," + (mainStageElem.clientHeight/2) + "]")
			mainPaper.resizePaper(x > y ? y : x, 
				mainStageElem.clientWidth*.50, 
				mainStageElem.clientHeight*.50);
		}
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
	mainPaper = new Grid({x: 600, y: 600}, mainStageElem.clientWidth/2, mainStageElem.clientHeight/2);
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

	let text = new createjs.Text("Paper Folding", 
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
let rowNum = document.getElementById("rNum");

function enableButtons() {
	//let buttonAddBlock = document.getElementById("button_add_block");
	let button_show_unit= document.getElementById("button_show_unit");
	let button_unit		= document.getElementById("button_unit");
	let rUp = document.getElementById("rUp");
	let rDown = document.getElementById("rDown");
	let cUp = document.getElementById("cUp");
	let cDown = document.getElementById("cDown");

	let button_define	= document.getElementById("button_define");
	let button_product	= document.getElementById("button_product");
	let button_display	= document.getElementById("button_display");

	let buttonHelp = document.getElementById("button_help");
	let buttonReset = document.getElementById("button_refresh");

	handleHelp(buttonHelp);
	handlePaper(button_display);
	handleReset(buttonReset);
	handleDefine(button_define);
	handleUnit(button_unit);

	button_show_unit.onclick = function(){
		mainPaper.revealUnit();
	}

	button_product.onclick = function() {
		mainPaper.findProduct();
	}


	let rUnitNum = document.getElementById("rUnitNum");
	let cUnitNum = document.getElementById("cUnitNum");
	rUp.onclick = function() {
		if (rUnitNum.value == mainPaper.getMaxUnit()) { return; }
		rUnitNum.value = parseInt(rUnitNum.value)+1;
		mainPaper.updateGridSections(cUnitNum.value, rUnitNum.value, true);
	}
	rDown.onclick = function() {
		if (rUnitNum.value == 1) { return; }
		rUnitNum.value = parseInt(rUnitNum.value)-1;
		mainPaper.updateGridSections(cUnitNum.value, rUnitNum.value, true);
	}
	cUp.onclick = function() {
		if (cUnitNum.value == mainPaper.getMaxUnit()) { return; }
		cUnitNum.value = parseInt(cUnitNum.value)+1;
		mainPaper.updateGridSections(cUnitNum.value, rUnitNum.value, true);
	}
	cDown.onclick = function() {
		if (cUnitNum.value == 1) { return; }
		cUnitNum.value = parseInt(cUnitNum.value)-1;
		mainPaper.updateGridSections(cUnitNum.value, rUnitNum.value, true);
	}
}

function handleUnit(button_unit){
	let rUnitNum = document.getElementById("rUnitNum");
	let cUnitNum = document.getElementById("cUnitNum");
	enableHandlers(rUnitNum);
	enableHandlers(cUnitNum);

	button_unit.onclick = function() {
		mainPaper.updateGridSections(cUnitNum.value, rUnitNum.value, true);
	}

	function define(){
		document.getElementById("dropup_unit").className = "dropup-unit";
		mainPaper.updateGridSections(cUnitNum.value, rUnitNum.value,  true);
	}
	
	function enableHandlers(element){
		element.value = 1;
		enablePersistentEntryPopupOnClick(element);
		enableEnterOnEntryFields(element);
	}

	function enablePersistentEntryPopupOnClick(element){
		element.onclick = function() {
			document.getElementById("dropup_unit").className = "dropup-unit-disabled";
		}
	}
	// Allows clicking "ENTER" to submit text entry units.
	function enableEnterOnEntryFields(id){
		// Execute a function when the user releases a key on the keyboard
		id.addEventListener("keyup", function(event) {
			// Number 13 is the "Enter" key on the keyboard
			if (event.keyCode === 13) {
				document.getElementById("dropup_unit").className = "dropup-unit";
				define();
			}
			if (event.keyCode === 27) {
				document.getElementById("dropup_unit").className = "dropup-unit";
			}
		});
	}
}

function handleDefine(button_define) {
	let rNum = document.getElementById("rNum");
	let rDen = document.getElementById("rDen");
	let cNum = document.getElementById("cNum");
	let cDen = document.getElementById("cDen");
	enableHandlers(rNum);
	enableHandlers(rDen);
	enableHandlers(cNum);
	enableHandlers(cDen);
	
	// Set max text entry (with arrow keys) to paper object max Div
	rNum.max = rDen.max = cNum.max = cDen.max = mainPaper.getMaxDiv();
  
	button_define.onclick = function() {
		define();
	}

	function define(){
		document.getElementById("dropup_fraction").className = "dropup-fraction";
	  	mainPaper.updateStageFractions(rNum.value, rDen.value, cNum.value, cDen.value);
	}
	
	function enableHandlers(element){
		enablePersistentFracEntryPopupOnClick(element);
		enableEnterOnEntryFields(element);
	}

	function enablePersistentFracEntryPopupOnClick(element){
		element.onclick = function() {
			document.getElementById("dropup_fraction").className = "dropup-fraction-disabled";
			
		}
	}
	// Allows clicking "ENTER" to submit text entry fractions.
	function enableEnterOnEntryFields(id){
		// Execute a function when the user releases a key on the keyboard
		id.addEventListener("keyup", function(event) {
			// Number 13 is the "Enter" key on the keyboard
			if (event.keyCode === 13) {
				define();
			}
			if (event.keyCode === 27) {
				document.getElementById("dropup_fraction").className = "dropup-fraction";
			}
		});
	}
}

function minimizeDropupButtonMenus() {
	document.getElementById("dropup_unit").className = "dropup-unit";
	document.getElementById("dropup_fraction").className = "dropup-fraction";
}


//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// 				   		BUTTON EVENT HANDLERS
//
//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

function handleReset(buttonReset) {
	buttonReset.onclick = function() {
		if (tweenRunningCount > 0 ) { return; }
		resetStage();
	}
	
}
function resetStage() {
	main();
}

function clear(iterable) {
	iterable.forEach(element => {
		stage.removeChild(element);
	})
	//iterable = [];
}

function handlePaper(button_display) {
	button_display.onclick = function() {
		mainPaper.toggleFraction();
	}
}

function handleGrid(gridButton, size){
	button_display.onclick = function() {
		//mainPaper.resizePaper;
	}
}


function PlaySound(soundObj, volume) {
	soundObj.volume = volume;
	soundObj.play();
}


