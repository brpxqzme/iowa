var keyboard = {};
var textdiv;

function addEvent(node, name, func) {
	if (node.addEventListener) {
		node.addEventListener(name, func, false);
	} else if (node.attachEvent) {
		node.attachEvent(name, func);
	}
}

function addKeyboardEvents() {
	addEvent(document, "keydown", function (e) {
		keyboard[e.keyCode] = true;
	});

	addEvent(document, "keyup", function (e) {
		keyboard[e.keyCode] = false;
	});

}

function initTextDiv () {
    textdiv = document.createElement("div");
    textdiv.style.position = "absolute";
    textdiv.innerHTML = "Welcome to space.<br>";
    textdiv.style.top = "0px";
    textdiv.style.left = Math.ceil(window.innerWidth*5/6)+1 + "px";
    textdiv.style.padding = "4px";
    textdiv.style.color = "green";
    textdiv.style.overflow = "auto";
    textdiv.style.width = Math.floor(window.innerWidth/6) + "px";
    textdiv.style.height = "50%";
}

function addResizeEvent () {
    document.body.appendChild(textdiv);
    addEvent(window, "resize", function () {
        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight,
            ASPECT = (SCREEN_WIDTH * 5/6) / SCREEN_HEIGHT;
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        camera.aspect = ASPECT;
        camera.updateProjectionMatrix();
        textdiv.style.width = Math.floor(SCREEN_WIDTH/6) + "px";
    });
}

(function() {
  var run;

  run = function() {
	addKeyboardEvents();
    initTextDiv();
    addResizeEvent();
    init();
    return animate();
  };

  window.run = run;

}).call(this);
