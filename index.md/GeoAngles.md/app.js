
function main() {

	stage = new createjs.Stage("canvas1");

		var circle = new createjs.Shape();
		circle.graphics.beginFill("#FF0000").drawCircle(0, 0, 50);
		circle.x = circle.y = 50;

		stage.addChild(circle);



}

/*
function handleImageLoad(event) {
	
	var image = event.target;
	var bitmap = new createjs.Bitmap(image);
	var container = new createjs.Container();
	stage.addChild(container);
	container.addChild(bitmap);

	console.log(bitmap);
	
			bitmap.x = 10;
			bitmap.y = 10;

}
*/