
const red_div = document.getElementById("red");
const blue_div = document.getElementById("blue");
const yellow_div = document.getElementById("yellow");
const green_div = document.getElementById("green");
const purple_div = document.getElementById("purple");
const orange_div = document.getElementById("orange");
const prot_div = document.getElementById("protractor");
const prot_img = document.getElementById("protImgSelect");

const mainStageElem = document.getElementById("cavasDiv");
const canvas = document.getElementById("canvas");
const header = document.querySelector('header');
const selStage = document.getElementById('selectStage');

let xMainStage, yMainStage, xProt, yProt, wProt, hProt;
let windowSizeX, windowSizeY;
let rotation = 15;
let scale = .3;
let legToBoard = 150;

function main() {

	stage = new createjs.Stage("canvas");
	//console.log(stage);

	
	manifest = [
        {src: "red.png", id: "red"},
        {src: "blue.png", id: "blue"},
        {src: "yellow.png", id: "yellow"},
		{src: "green.png", id: "green"},
		{src: "purple.png", id: "purple"},
        {src: "orange.png", id: "orange"}
    ];
	loader = new createjs.LoadQueue(false);
	loader.loadManifest(manifest, true, "./res/");
	
	createjs.Touch.enable(stage);
	

	// get and update container sizes & locations
	window.addEventListener("resize", resizeUpdate);
	resizeUpdate();
	
	red_div.addEventListener('click', function() {
		var image = new Image();
		image.src = "./res/red.png";
		image.onload = handleImageLoad;		
	})
	blue_div.addEventListener('click', function() {
		var image = new Image();
		image.src = "./res/blue.png";
		image.onload = handleImageLoad;
	})
	yellow_div.addEventListener('click', function() {
		var image = new Image();
		image.src = "./res/yellow.png";
		image.onload = handleImageLoad;
	})
	green_div.addEventListener('click', function() {
		var image = new Image();
		image.src = "./res/green.png";
		image.onload = handleImageLoad;
	})
	purple_div.addEventListener('click', function() {
		var image = new Image();
		image.src = "./res/purple.png";
		image.onload = handleImageLoad;
	})
	orange_div.addEventListener('click', function() {
		var image = new Image();
		image.src = "./res/orange.png";
		image.onload = handleImageLoad;
	})

	var image = new Image();
	image.src = "./res/orange.png";
	image.onload = handleImageLoad;

	protHandler(prot_img);

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
//							TESTING
//
//--------------------------------------------------------------------------------------------------------------


function handleImageLoad(event) {
	

	// Setup for importing resource PNG
	var image = event.target;
	var bitmap = new createjs.Bitmap(image);
	let width = bitmap.getBounds().width * scale;
	let height = bitmap.getBounds().height* scale;

	// Creat/e hitbox circles
	var topCircle = new createjs.Shape();
	topCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5), (width*.5)-1, 10*scale);
	var topHit = new createjs.Shape();
		topHit.graphics.beginFill("#000000")
			.drawCircle((width*.5), (width*.5)-1, 40*scale);
	topCircle.hitArea = topHit;
	
	topCircle.id = "top";
	
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
	dragger.x = dragger.y = legToBoard;

	dragger.on("mousedown", function(evt) {
		dragger._listeners.pressup = dragger.pressupStore;

		// reposition dragger to top
		stage.removeChild(dragger);
		stage.addChild(dragger);
		// Store original location to calc xy dist traveled
		dragger.offset = { x: dragger.x - evt.stageX, y: dragger.y - evt.stageY };
	});
	
	dragger.on("pressmove",function(evt) {
		console.log("dragger pressmove")
		dragger.x = evt.stageX + dragger.offset.x;
		dragger.y = evt.stageY + dragger.offset.y;

		// redraw the stage to show the change:
		stage.update();   
	});

	dragger.on("pressup", function(evt) {
		console.log("dragger pressup");
	});
	dragger.pressupStore = dragger._listeners.pressup;			
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
	/*
	console.log(dragger.x,dragger.y)
	let ptDrag = dragger.localToGlobal(dragger.x,dragger.y);
	console.log(ptDrag.x,ptDrag.y)
	*/
	let ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
	let ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
	// Compute local (container) XY locations of hinge nodes
	let topLoc = dragger.globalToLocal(ptTop.x,ptTop.y)
	let botLoc = dragger.globalToLocal(ptBot.x,ptBot.y)

	let rad = dragger.rotation / (180 / Math.PI);
	let hypot = Math.sqrt(Math.pow(topLoc.x, 2)
						+Math.pow(topLoc.y, 2))

	//---------------------------------------------------------
	//
	// 		TODO: Find proper correction offset from ptTop
	//		to fix minor adjustment after rotating object
	//
	//---------------------------------------------------------

	if (hitbox.id == "top"){	
		console.log(dragger.rotation)
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
		
		restoreDragger(hitbox)

		/*
		//hitbox.getObjectUnderPoint(hitbox.xGlbl, hitbox.yGlbl, 0)
		console.log("Objects under")
		console.log(hitbox.xGlbl, hitbox.yGlbl)
		console.log(dragger.getObjectsUnderPoint(hitbox.xGlbl, hitbox.yGlbl, 0))
		*/
		dragger._listeners = pauseMousemove
		dragger._listeners.pressup = null;

	});
}


























//-----------------------------------------------------------------
// Manages resize variables on window size change
//-----------------------------------------------------------------
function resizeUpdate(){
	windowSizeX = window.innerWidth;
	windowSizeY = window.innerHeight;

	// Protractor movement stuff..
	xMainStage = mainStageElem.parentNode.offsetLeft + mainStageElem.offsetLeft;
	yMainStage = mainStageElem.parentNode.offsetTop +mainStageElem.offsetTop;
	xProt = prot_div.parentNode.parentNode.offsetLeft + 
		prot_div.parentNode.offsetLeft + prot_div.offsetLeft;
	yProt = prot_div.parentNode.parentNode.offsetLeft + 
		prot_div.parentNode.offsetTop + prot_div.offsetTop;
	wProt = prot_img.clientWidth;
	hProt = prot_img.clientHeight;

	// Main canvas size
	canvas.width = windowSizeX*.635;
	canvas.height = windowSizeY*.795;
}

function protHandler(prot) {
	prot.onmousedown = function(event) {
		// determine proper shift based on bound of parent
		let shiftX = xProt + (wProt*.5);
		let shiftY = yProt - (hProt) + header.clientHeight;
		moveAt(event.pageX, event.pageY);

	// moves the prot at (pageX, pageY) coordinates
	// taking initial shifts into account
	function moveAt(pageX, pageY) {	
		prot.style.left = pageX - shiftX +'px';
		prot.style.top = pageY - shiftY + 'px';

		// resize when moved to stage
		if (pageX > xMainStage  && pageY > yMainStage) {
			prot_img.style.transform= "scale(1.5)";
		} else {
			prot_img.style.transform= "scale(1)";
		}
	}
	
	function onMouseMove(event) {
		moveAt(event.pageX, event.pageY);
	}
	
	// move the prot on mousemove
	document.addEventListener('mousemove', onMouseMove);
	
	// drop the prot, remove unneeded handlers
	prot.onmouseup = function() {
		document.removeEventListener('mousemove', onMouseMove);
		prot.onmouseup = null;
	};

	};
	prot.ondragstart = function() {
		return false;
	};
}