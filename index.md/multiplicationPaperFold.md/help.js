let currentTween;           // Track current step of tutorial
let tweenObj;               // Store stage rect (used for canceling stage timer)
let rect;                   // Cover stage to allow click progression of help

function handleHelp(buttonHelp){
	buttonHelp.onclick = function() {
        stage.removeChild(rect) // Remove stage shroud if it exists.
        
		rect = new createjs.Shape();
		rect.graphics.beginFill(darkBackground).
			drawRoundRect(0,0,window.innerWidth,window.innerHeight,5);
		rect.alpha = .8;
		rect.on("click", function (evt) {
			actionFinal();
		});

		action(1, "Welcome to Fraction Multiplication with Virtual Paper Folding! " + 
        "<br><br><a href=\"https://youtu.be/R2_ChzGNc6g\" target=\"_blank\" rel=\"noopener noreferrer\" colo=\"94c2fe\" >"+
        "Click here for the full tutorial</a>")

		stage.addChild(rect);

	}
}

function action(num, text){
	currentTween=num;
	stage.removeChild(rect)
	stage.addChild(rect)

	// Clear current Toast
	document.getElementById("snackbarTutorial").classList.remove("show")
	clearTimeout(toastTimeout)
	toastTutorial(text)
}

let currentToast;
let toastTimeout;
function toastTutorial(message) {
	currentToast = document.getElementById("snackbarTutorial");
	currentToast.innerHTML = message;
	currentToast.className = "show";
	toastTimeout = setTimeout(function(){ currentToast.className = 
		currentToast.className.replace("show", ""); }, 20000);
}

function actionFinal(){
	helpActive = false;
	stage.removeChild(rect)

    // Clear current Toast
	document.getElementById("snackbarTutorial").classList.remove("show")
	clearTimeout(toastTimeout)
}



