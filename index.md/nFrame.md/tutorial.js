////////////////////////////////////////////////////////////////////////////////
//
//							   HELP TUTORIAL (Basic)
//
////////////////////////////////////////////////////////////////////////////////

let currentTween;           // Track current step of tutorial
let tweenObj;               // Store stage rect (used for canceling stage timer)
let arrow;                  // Drawn arrow object for guided tour
let rect;                   // Cover stage to allow click progression of help
let helpActive = false;     // used to cancel help if active
let helpToastTime = 20000;  // Duration of Toast (Match time with CSS snackbar)

function handleHelp(buttonHelp){
	buttonHelp.onclick = function() {
        
		if(helpActive) {
			actionFinal();
			tweenObj.setPaused(true);
			document.getElementById("snackbar").classList.remove("show")
			clearTimeout(toastTimeout)
			return;
		}
		helpActive = true;
        
		rect = new createjs.Shape();
		rect.graphics.beginFill(darkBackground).
			drawRoundRect(0,0,window.innerWidth,window.innerHeight,5);
		rect.alpha = .8;
		rect.on("click", function (evt) {
			tweenObj.setPaused(true);
			if (currentTween==0) { action2(); }
			else if (currentTween==1) { action3(); }
			else if (currentTween==2) { action4(); }
			else if (currentTween==3) { action5(); }
			else if (currentTween==4) { action6(); }
			else if (currentTween==5) { action7(); }
			else if (currentTween==6) { action8(); }
			else if (currentTween==7) { action9(); }
			else if (currentTween==8) { action10(); }
			else if (currentTween==9) { action11(); }
			else if (currentTween==10) { action12(); }
			else if (currentTween==11) { action13(); }
			else if (currentTween==12) { action14(); }
			else if (currentTween==13) { actionFinal(); }
			//actions[currentTween+1]
		});



		stage.addChild(rect);

		let loc = document.getElementById("button_n").getBoundingClientRect();
		arrow = makeArrow(loc.x+loc.width/2, loc.top-loc.height-75);
		createjs.Tween.get(arrow).to({alpha:1}, 500);
		tweenObj = createjs.Tween.get(rect).to({alpha:.5}, helpToastTime).call(action2);
		currentTween=0;
		toast("The base change button allows you to change the base number " +
		"that you will be working with. <br><br>This program allows the selection " 
		+ "of bases between 2 and 10"+
		"<br><br>(click on the stage for the next hint)"+
		"<br>(click the help button again to quit help)")

	}
}
function action(num, element, next, text){
	currentTween=num;
	stage.removeChild(rect, arrow)
	stage.addChild(rect, arrow)

	// Clear current Toast
	document.getElementById("snackbar").classList.remove("show")
	clearTimeout(toastTimeout)

	loc = document.getElementById(element).getBoundingClientRect();
	createjs.Tween.get(arrow).to({x:loc.x+loc.width/2-10, y:loc.top-loc.height-75}, 500);
	tweenObj = createjs.Tween.get(rect).to({alpha:.5}, helpToastTime).call(next);
	toast(text)
}

function action2(){
	action(1, "button_add_block", action3, 
	"The \"ADD BLOCK\" button allows you to add blocks to the stage")
}
function action3(){
	action(2, "button_combine", action4, 
	"The \"COMBINE\" button allows you to combine blocks <br><br>"
	+ "The blocks will only combine when a correct number of blocks are" 
	+ " currently selected.")
}
function action4(){
	action(3, "button_group", action5, 
	"The \"SPLIT GROUP\" button allows you to seperate blocks " +
	 "into the next smallest grouping of blocks")
}
function action5(){
	action(4, "button_single", action6, 
	"The \"SPLIT ONES\" button allows you to seperate blocks " +
	"into ones, breaking the entire block to its lowest units")
}
function action6(){
	action(5, "button_paint", action7, 
	"The \"PAINTBRUSH\" button allows you to change the color of the blocks " +
	"that are currently selected")
}
function action7(){
	currentTween=6;
	loc = document.getElementById("button_paint").getBoundingClientRect();
	createjs.Tween.get(arrow).to({x:loc.x+loc.width/2-10, y:loc.top-loc.height-140}, 500);
	tweenObj = createjs.Tween.get(rect).to({alpha:.5}, helpToastTime).call(action8);
	toast("Hovering over the Paintbrush button will reveal additional options"+
	"<br><br>The \"2-TONE\" will color the blocks in two shades to help show the " +
	"the seperation of values within the block.<br><br> This change is applied to all" +
	" blocks on the stage" )
}
function action8(){
	currentTween=7;
	loc = document.getElementById("button_paint").getBoundingClientRect();
	createjs.Tween.get(arrow).to({x:loc.x+loc.width/2-10, y:loc.top-loc.height-140}, 500);
	tweenObj = createjs.Tween.get(rect).to({alpha:.5}, helpToastTime).call(action9);
	toast("The \"PLAIN\" button will color each block in a solid color" + 
	"<br><br> This change is applied to all blocks on the stage")
}
function action9(){
	action(8, "button_sort_column", action10, 
	"The \"SORT TO COLUMN\" button will automatically sort all blocks currently" +
	" on the stage to columns")
}
function action10(){
	action(9, "button_column", action11, 
	"The \"OPEN STAGE\" button will remove all columns from the stage" +
	" allowing an open space to work with blocks of any size")
}
function action11(){
	action(10, "button_add_col", action12, 
	"The \"ADD COLUMN\" button add one column for the next magnitude or " +
	"\"place\" value")
}
function action12(){
	action(11, "button_remove_col", action13, 
	"The \"REMOVE COLUMN\" button will remove one column of the highest " +
	"magnitude or \"place\" value")
}
function action13(){
	action(12, "button_trash", action14, 
	"The \"TRASH\" button will remove all currently selected blocks from" +
	" the stage")
}
function action14(){
	action(13, "button_refresh", actionFinal, 
	"The \"REFRESH\" button will reset the board")
}

function actionFinal(){
	helpActive = false;
	stage.removeChild(rect)
	stage.removeChild(arrow)
}

function makeArrow(x,y){
    var arrow = new createjs.Shape();
    var arrowSize = 100;
    var arrowRotation = 90;
	let LINE_RADIUS = 10;
	let ARROWHEAD_DEPTH = 30;
	let ARROWHEAD_RADIUS = 25;
    arrow.graphics.s("white")
            .f("white")
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
    arrow.x = x-5;
    arrow.y = y;
    arrow.alpha = 1;
    arrow.rotation = arrowRotation;
	arrow.alpha = 0;
    stage.addChild(arrow);
	return arrow;
}


/*
////////////////////////////////////////////////////////////////////////////////
//
//							   HELP TUTORIAL (advanced)
//
////////////////////////////////////////////////////////////////////////////////

let currentTween;
let tweenObj;
let arrow;
let rect;
let helpActive = false;
let time = 20500;

//let actions = {action2, action3, action4, action5, action6}

function handleHelp(buttonHelp){
	buttonHelp.onclick = function() {
		if(helpActive) {
			actionFinal();
			tweenObj.setPaused(true);
			document.getElementById("snackbar").classList.remove("show")
			clearTimeout(toastTimeout)
			return;
		}
		helpActive = true;
		rect = new createjs.Shape();
		rect.graphics.beginFill(darkBackground).
			drawRoundRect(0,0,window.innerWidth,window.innerHeight,5);
		rect.alpha = .8;
		handleHelpStage(rect);
		
		stage.addChild(rect);
		action0continue = false;
		action0text = "The base change button allows you to change the base "
+ "number that you will be working with. This program allows the "
+ "selection of bases between 2 and 10"+
"<br><br>&#8226; click the \"help\" button again to quit</h5>" +
"<br><br>Go ahead and select base 4 from the \"Base Change\" button";
	action1text = "The \"ADD BLOCK\" button allows you to add blocks to the stage" +
"<br><br>Lets add a 4"+superscript[2]+" block to the stage"
		action2_5text = "You can also select blocks indiviually by clicking on "
		+ "them<br><br>Click the stage to progress"

	let loc = document.getElementById("button_n").getBoundingClientRect();
	arrow = makeArrow(loc.x+loc.width/2, loc.top-loc.height-75);
	tweenObj = createjs.Tween.get(arrow).to({alpha:1}, 500);
	tweenObj = createjs.Tween.get(rect).to({alpha:.5}, time).call(action0_5);
		action0();
		
	}
}

function handleHelpStage(rect){
	rect.on("click", function (evt) {
		if (tweenRunningCount > 0 ) { return; }
		tweenObj.setPaused(true);
		console.log(currentTween)
		if (!action0continue) { return; }
		else if (currentTween==0) { action0_5(); }
		else if (currentTween==0.5) { action1(); }
		else if (!action2continue) { return; }
		else if (currentTween==1) { action2(); }
		else if (currentTween==2) { action2_5(); }
		else if (currentTween==2 && tutorialSelected == undefined) { action2_5();}
		else if (currentTween==2.5) { action3(); }
		else if (currentTween==9) { action10(); }
		else if (currentTween==10) { action11(); }
		else if (currentTween==11) { action12(); }
		else if (currentTween==12) { action13(); }
		else if (currentTween==13) { action14(); }
		else if (currentTween==14) { actionFinal(); }
		//actions[currentTween+1]
	});
}

function action(num, next, x, y, rot, text){
	currentTween=num;
	stage.removeChild(rect, arrow)
	stage.addChild(rect, arrow)

	// Clear current Toast
	tweenObj.setPaused(true);
	document.getElementById("snackbar").classList.remove("show")
	clearTimeout(toastTimeout)
	if (currentToast != undefined){
		currentToast.className = currentToast.className.replace("show", "");
	}
	
	  
	tweenObj = createjs.Tween.get(arrow).to({x:x, y:y, rotation:rot}, 500);
	tweenObj = createjs.Tween.get(rect).to({alpha:.5}, time).call(next);
	toast(text)
}

let action0text;
let action0continue = false;
function action0(){
	let loc = document.getElementById("button_n").getBoundingClientRect();

	action(0, action0_5, loc.x+loc.width/2, loc.top-loc.height-75, 90, 
		action0text);
}

// Change Base
function action0_5(){
	if (!action0continue) { action0(); return; }
	action(0.5, action1, window.innerWidth/2, 150, -90,
		"Great Job! You should now see \"Base 4\" at the top of the stage" +
		"<br><br>Click the stage to progress");
}


let action1text;
function action1(){
	let loc = document.getElementById("button_add_block").getBoundingClientRect();
	action(1, action2, loc.x+loc.width/2-10, loc.top-loc.height-75, 90, 
		action1text);
}

// Add Block
let action2text = "";
let action2continue = false;
function action2(){
	if (!action2continue) { action1(); }
	let loc = document.getElementById("button_add_block").getBoundingClientRect();
	action(2, action2_5, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	action2text);
}

// Select Box
let tutorialSelected;
let action2_5text;
function action2_5(){
	if (selectedObjects.length != 1) { action2(); return; }
	let loc = document.getElementById("button_add_block").getBoundingClientRect();
	action(2.5, action3, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
		action2_5text)
	tutorialSelected = selectedObjects[0];
	stage.removeChild(tutorialSelected)
	stage.addChild(tutorialSelected)

	
}

function action3(){
	if (tutorialSelected == undefined) { action2_5() }
	if (selectedObjects == 0) { selectNode(tutorialSelected) }
	rect.removeAllEventListeners("click");
	rect.on("click", function (evt) { 
		if (tweenRunningCount > 0 ) { return; }
		if (selectedObjects.length >= 4){
			action4();
		}
	});

	let loc = document.getElementById("button_group").getBoundingClientRect()
	action(3, action3, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"SPLIT GROUP\" button allows you to seperate blocks " +
	 "into the next smallest grouping of blocks <br><br>" + 
	"With your block selected, split your block to groups of 4" + superscript[3])

	stage.removeChild(tutorialSelected)
	stage.addChild(tutorialSelected)

	
	
}

function action4(){
	if (selectedObjects < 4) { 
		document.getElementById("snackbar").classList.remove("show")
		clearTimeout(toastTimeout)
		toast("Make sure to select the blocks on screen");
		action3();
	} 
	stage.removeChild(tutorialSelected)
	rect.removeAllEventListeners("click");
	rect.on("click", function (evt) { 
		if (tweenRunningCount > 0 ) { return; }
		if (selectedObjects.length >= 16){
			action5();
		}
	});
	
	let loc = document.getElementById("button_single").getBoundingClientRect();
	action(4, action4, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"SPLIT ONES\" button allows you to seperate blocks " +
	"into ones, breaking the entire block to its lowest units<br><br>" + 
	"With your blocks selected, split everything to ones")

	helpPersistentSelect()
}

function action5(){
	if (selectedObjects.length < 16) { 
		document.getElementById("snackbar").classList.remove("show")
		clearTimeout(toastTimeout)
		toast("Make sure to select the blocks on the stage") 
		action4();
		return;
	} 

	let loc = document.getElementById("button_combine").getBoundingClientRect();
	action(5, action5, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"COMBINE\" button allows you to combine blocks <br><br>"
	+ "The blocks will only combine when a correct number of blocks are" 
	+ " currently selected. <br><br> Go ahead and combine the ones on the stage.")
	helpPersistentSelect();
}
function action6(){
	rect.removeAllEventListeners("click");
	rect.on("click", function (evt) { 
		if (tweenRunningCount > 0 ) { return; }
		helpPersistentSelect();
	});
	let loc = document.getElementById("button_paint").getBoundingClientRect();
	action(6, action6, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"PAINTBRUSH\" button allows you to change the color of the blocks " +
	"that are currently selected <br><br> Click the Paintbrush  button"+
	" to change the color of selected pieces.")
}
function action7(){
	let loc = document.getElementById("button_paint").getBoundingClientRect();
	action(7, action7, loc.x+loc.width/2-10, loc.top-loc.height-140, 90,
	"The \"2-TONE\" will color the blocks in two shades to help show the " +
	"the seperation of values within the block");
	helpPersistentSelect();
}
function action8(){
	let loc = document.getElementById("button_paint").getBoundingClientRect();
	action(8, action8, loc.x+loc.width/2-10, loc.top-loc.height-140, 90,
	"The \"PLAIN\" button will color each block in a solid color");
	helpPersistentSelect();
}
function action9(){
	rect.removeAllEventListeners("click");
	handleHelpStage(rect);
	let loc = document.getElementById("button_sort_column").getBoundingClientRect();
	action(9, action10, loc.x+loc.width/2-10, loc.top-loc.height-75, 90, 
	"The \"SORT TO COLUMN\" button will automatically sort all blocks currently" +
	" on the stage to columns" +
	"<br><br><h4 style=\"color:Grey;\">&#8226; click anywhere on the stage to progress</h4>")
}
function action10(){
	let loc = document.getElementById("button_column").getBoundingClientRect();
	action(10, action11, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"OPEN STAGE\" button will remove all columns from the stage" +
	" allowing an open space to work with blocks of any size"+
	"<br><br><h5 style=\"color:Grey;\">&#8226; click anywhere on the stage to progress</h4>")
}
function action11(){
	let loc = document.getElementById("button_add_col").getBoundingClientRect();
	action(11, action12, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"ADD COLUMN\" button adds one column for the next magnitude or " +
	"\"place\" value<br><br> Click this a few times to add some extra columns"+
	"<br><br><h4 style=\"color:Grey;\">&#8226; click anywhere on the stage to progress</h4>")
}
function action12(){
	let loc = document.getElementById("button_remove_col").getBoundingClientRect();
	action(12, action13, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"REMOVE COLUMN\" button will remove one column of the highest " +
	"magnitude or \"place\" value"+
	"<br><br><h4 style=\"color:Grey;\">&#8226; click anywhere on the stage to progress</h4>")
}
function action13(){
	let loc = document.getElementById("button_trash").getBoundingClientRect();
	action(13, action14, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"TRASH\" button will remove all currently selected blocks from" +
	" the stage"+
	"<br><br><h4 style=\"color:Grey;\">&#8226; click anywhere on the stage to progress")
}
function action14(){
	let loc = document.getElementById("button_refresh").getBoundingClientRect();
	action(14, actionFinal, loc.x+loc.width/2-10, loc.top-loc.height-75, 90,
	"The \"REFRESH\" button will reset the board"+
	"<br><br><h4 style=\"color:Grey;\">&#8226; click anywhere on the stage to "
	+"progress</h4><br><br>"+
	"Now you have the basics down. <br><br>Have fun and happy learning!")
}

function actionFinal(){
	helpActive = false;
	stage.removeChild(rect)
	stage.removeChild(arrow)
	// Clear current Toast
	document.getElementById("snackbar").classList.remove("show")
	clearTimeout(toastTimeout)
	//toast()

	action0continue = false;
	action2continue = false;
}

function makeArrow(x,y){
    var arrow = new createjs.Shape();
    var arrowSize = 100;
    var arrowRotation = 90;
	let LINE_RADIUS = 10;
	let ARROWHEAD_DEPTH = 30;
	let ARROWHEAD_RADIUS = 25;
    arrow.graphics.s("white")
            .f("white")
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
    arrow.x = x-5;
    arrow.y = y;
    arrow.alpha = 1;
    arrow.rotation = arrowRotation;
	arrow.alpha = 0;
    stage.addChild(arrow);
	return arrow;
}

function helpPersistentSelect(){
	let nodes = [];
	for(i=0; i < stage.children.length; i++){
		if (stage.children[i].row != undefined) {
			nodes.push(stage.children[i])
		}
	}
	nodes.forEach( node => {
		stage.removeChild(node)
		stage.addChild(node)
		if(node.shadow == undefined || node.shadow == null){
			selectNode(node)
		}
	})
}

*/