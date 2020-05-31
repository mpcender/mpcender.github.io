
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
	image.onload = handleTESTImageLoad;

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


function handleTESTImageLoad(event) {
	

	// Setup for importing resource PNG
	var image = event.target;
	var bitmap = new createjs.Bitmap(image);
	let width = bitmap.getBounds().width * scale;
	let height = bitmap.getBounds().height* scale;

	// Creat/e hitbox circles
	var topCircle = new createjs.Shape();
	topCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5), (width*.5)-1, 10*scale);
	
	topCircle.id = "top";
	
	var bottomCircle = new createjs.Shape();
	bottomCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5+1), (height-(width*.5)+1), 10*scale);
	bottomCircle.id = "bottom";
	
	// Create container for PNG and hitboxes
	var container = new createjs.Container();
	container.topInsetX = (width*.5);
	container.topInsetY = (width*.5)-1;
	container.bottomInsetX = (width*.5+1);
	container.bottomInsetY = (height-(width*.5)+1);

	// Add container to stage
	container.addChild(bitmap, topCircle, bottomCircle);
	handleTESTLegContainer(container);
	
	bitmap.setTransform(0, 0, scale, scale);

	handleHingeHit(topCircle);
	handleHingeHit(bottomCircle);
	
}

//---------------------------------------------------------------
// This function enables dragger movement of leg objects
//-----------------------------------------------------------------
function handleTESTLegContainer(dragger){

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


//////////////////

function setRegPt(hitbox){
	let dragger = hitbox.parent;
	let ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
	let ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
	let topLoc = dragger.globalToLocal(ptTop.x,ptTop.y)
	let botLoc = dragger.globalToLocal(ptBot.x,ptBot.y)
	console.log("dragX: " + dragger.x, "dragX: " + dragger.y)
	console.log(ptTop.x,ptTop.y,ptBot.x,ptBot.y)
	let rad = dragger.rotation / (180 / Math.PI);
	let dist = Math.sqrt(Math.pow(ptTop.x-ptBot.x, 2)
						+Math.pow(ptTop.y-ptBot.y, 2))
	//console.log(dist)
	
	if (hitbox.id == "top"){
		console.log("TOP")		
		dragger.oldX = dragger.x;
		dragger.oldY = dragger.y;
		dragger.x += botLoc.x;
		dragger.y += botLoc.y
		dragger.regX = botLoc.x;
		dragger.regY = botLoc.y;
		console.log(dragger.regX,dragger.regY)

	} else if  (hitbox.id == "bottom"){
		console.log("BOTTOM")
		dragger.oldX = dragger.x;
		dragger.oldY = dragger.y;
		dragger.x += topLoc.x;
		dragger.y += topLoc.y
		dragger.regX = topLoc.x;
		dragger.regY = topLoc.y;
	}
}

function restoreDragger(hitbox){
	let dragger = hitbox.parent;
	let ptTop = dragger.localToGlobal(dragger.topInsetX,dragger.topInsetY);
	let ptBot = dragger.localToGlobal(dragger.bottomInsetX,dragger.bottomInsetY);
	let topLoc = dragger.globalToLocal(ptTop.x,ptTop.y)
	let botLoc = dragger.globalToLocal(ptBot.x,ptBot.y)
	let rad = (dragger.rotation+90) / (180 / Math.PI);
	//console.log("ROTATION: " + (dragger.rotation+90));
	let dist = Math.sqrt(Math.pow(ptTop.x-ptBot.x, 2)
						+Math.pow(ptTop.y-ptBot.y, 2))
						
	
	if (hitbox.id == "top"){
		//console.log("TOP")		
		//dragger.x += -botLoc.x-(Math.cos(rad)*dist);
		dragger.x += -botLoc.x;
		dragger.y += -botLoc.y;
		dragger.regX = 0;
		dragger.regY = 0;

	} else if  (hitbox.id == "bottom"){
		//console.log("BOTTOM")
		dragger.x = dragger.oldX;
		dragger.y = dragger.oldY
		dragger.regX = 0;
		dragger.regY = 0;
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
		////console.log("mousedown top");

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
		////console.log("pressmove top");
		// Returns the stage xy point of the bottom hinge

		radAngle = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);
		angle = radAngle * (180 / Math.PI) - offset;
		dragger.rotation = angle;
		////console.log(dragger.rotation+90)
		
		
		stage.update();   
	});

	hitbox.on("pressup", function(evt) {
		////console.log("pressup top");
		
		dragger._listeners = pauseMousemove
		dragger._listeners.pressup = null;
		restoreDragger(hitbox)

		////console.log(dragger.rotation)
		///console.log(dragger.x, dragger.y)

		//dragger.trackerObj.setRotation(angle);

		//let resetMovePts = dragger.trackerObj.disableTopRotate();

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






































//--------------------------------------------------------------------------------------------------------------
//
//							OLD CODE
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
	
	
	/* DRAWS WHITE DOTS FOR REFERENCE POINT VISUAL AID
	var aCircle = new createjs.Shape();
		aCircle.graphics.beginFill("#ffffff")
			.drawCircle((width*.5-.5), (width*.5)-1, 1);
	var bCircle = new createjs.Shape();
		bCircle.graphics.beginFill("#ff0000")
			.drawCircle((width*.5+.5), (height-(width*.5)+1), 1);
	*/
	
	
	var bottomCircle = new createjs.Shape();
	bottomCircle.graphics.beginFill("#000000")
		.drawCircle((width*.5+1), (height-(width*.5)+1), 10*scale);
	
		

	// Create container for PNG and hitboxes
	var container = new createjs.Container();

	// Add container to stage
	container.addChild(bitmap, topCircle, bottomCircle);
	handleLegContainer(container);
	
	bitmap.setTransform(0, 0, scale, scale);

	// Handlers
	/*
	topCircle.globlX = legToBoard;
	topCircle.globlY = legToBoard;
	bottomCircle.globlX = legToBoard;
	bottomCircle.globlY = legToBoard;
	*/
	handleTopHit(topCircle);
	handleBottomHit(bottomCircle);
	
}


function updateDraggerCoords(dragger, x, y, regX, regY) {
	dragger.x = x;
	dragger.y = y;
	dragger.regX = regX;
	dragger.regY = regY;
}

//---------------------------------------------------------------
// This function enables dragger movement of leg objects
//-----------------------------------------------------------------
function handleLegContainer(leg){
	let width = leg.children[0].getBounds().width * scale;
	let height = leg.children[0].getBounds().height * scale;

	var dragger = new createjs.Container();
	dragger.addChild(leg);
	stage.addChild(dragger);
	dragger.x = dragger.y = legToBoard;

	let topXAdj = width*.5-.5;
	let topYAdj = (width*.5)-1;
	let botXAdj = (width*.5+.5);
	let botYAdj = (height-(width*.5)+1);
	
	let originX = legToBoard;
	let originY = legToBoard;
	let topX = legToBoard+topXAdj;
	let topY = legToBoard+topYAdj;
	let bottomX = legToBoard+botXAdj;
	let bottomY = legToBoard+botYAdj;

	let rotation = dragger.rotation;
	let oldX, oldY;
	let dragClone;

	let legObj = new Leg(originX,originY,topX,topY,bottomX,bottomY,rotation);
	legObj.setOffsets(topXAdj, topYAdj, botXAdj, botYAdj);
	dragger.trackerObj = legObj;


	dragger.on("mousedown", function(evt) {
		dragger._listeners.pressup = dragger.pressupStore;

		// reposition dragger to top
		stage.removeChild(dragger);
		stage.addChild(dragger);
		
		// calculate regX, regY and x,y
		let movePts = dragger.trackerObj.enableMove();
		updateDraggerCoords(dragger, movePts[0], movePts[1], movePts[2], movePts[3]);

		// Store original location to calc xy dist traveled
		oldX = dragger.x;
		oldY = dragger.y;	
	});
	
	dragger.on("pressmove",function(evt) {
		console.log("dragger pressmove")

				dragger.x = evt.stageX;
				dragger.y = evt.stageY;
				console.log(evt.stageX, evt.stageY)
				
				// redraw the stage to show the change:
				stage.update();   
	});

	dragger.on("pressup", function(evt) {
		console.log("dragger pressup");
		
		let adjX = dragger.x - oldX;
		let adjY = dragger.y - oldY;

		let resetMovePts = dragger.trackerObj.disableMove(adjX, adjY);
		console.log("RESET")
		console.log(resetMovePts)
		updateDraggerCoords(dragger, resetMovePts[0], resetMovePts[1], resetMovePts[2], resetMovePts[3]);
	});

	

	dragger.pressupStore = dragger._listeners.pressup;
			
}


//-----------------------------------------------------------------
// Hitbox for "top" node on legs
//-----------------------------------------------------------------
function handleTopHit(hitbox){
	let radOffset, radAngle, offset;
	let angle = 0;
	let dragger = hitbox.parent.parent;
	let pauseMousemove;
	//console.log(hitbox.parent.parent)

	hitbox.addEventListener("mousedown", function() {
		console.log("mousedown top");

		// pause event listener for moving object
		pauseMousemove = dragger._listeners
		dragger._listeners = null

		console.log(dragger)
		let rotRef = dragger.trackerObj.enableTopRotate();
		dragger.x = rotRef[0];
		dragger.y = rotRef[1];
		dragger.regX = rotRef[2];
		dragger.regY = rotRef[3];

		
		console.log(dragger)
		// Determine initial offset, and take off shape rotation
		radOffset = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);
		offset = radOffset * (180 / Math.PI) - dragger.rotation;
		

	})

	hitbox.on("pressmove",function(evt) {
		console.log("pressmove top");

		radAngle = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);

  		angle = radAngle * (180 / Math.PI) - offset;
		  dragger.rotation = angle;
		
		stage.update();   
	});

	hitbox.on("pressup", function(evt) {
		console.log("pressup top");
		
		dragger._listeners = pauseMousemove
		hitbox.parent.parent._listeners.pressup = null;

		//(this.rotation-(this.rotation%5))

		//dragger.rotation = dragger.trackerObj.setRotation(angle);
		dragger.trackerObj.setRotation(angle);

		let resetMovePts = dragger.trackerObj.disableTopRotate();

	});
}

//-----------------------------------------------------------------
// Hitbox for "bottom" node on legs
//-----------------------------------------------------------------
function handleBottomHit(hitbox){
	let radOffset, radAngle, offset;
	let angle = 0;
	let dragger = hitbox.parent.parent;
	let pauseMousemove;
	//console.log(hitbox.parent.parent)

	hitbox.addEventListener("mousedown", function() {
		console.log("mousedown top");

		// pause event listener for moving object
		pauseMousemove = dragger._listeners
		dragger._listeners = null

		console.log(dragger)
		let rotRef = dragger.trackerObj.enableBottomRotate();
		dragger.x = rotRef[0];
		dragger.y = rotRef[1];
		dragger.regX = rotRef[2];
		dragger.regY = rotRef[3];

		
		console.log(dragger)
		// Determine initial offset, and take off shape rotation
		radOffset = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);
		offset = radOffset * (180 / Math.PI) - dragger.rotation;
		

	})

	hitbox.on("pressmove",function(evt) {
		console.log("pressmove top");

		radAngle = Math.atan2(stage.mouseY - dragger.y,
			stage.mouseX - dragger.x);

  		angle = radAngle * (180 / Math.PI) - offset;
		  dragger.rotation = angle;
		
		stage.update();   
	});

	hitbox.on("pressup", function(evt) {
		console.log("pressup top");
		
		dragger._listeners = pauseMousemove
		hitbox.parent.parent._listeners.pressup = null;

		//(this.rotation-(this.rotation%5))

		//dragger.rotation = dragger.trackerObj.setRotation(angle);
		dragger.trackerObj.setRotation(angle);

		let resetMovePts = dragger.trackerObj.disableBottomRotate();
		

		


	});
}