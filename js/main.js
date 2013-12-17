﻿var keyboard = {};

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

function addResizeEvent () {
    addEvent(window, "resize", function () {
        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight,
            ASPECT = (SCREEN_WIDTH * 5/6) / SCREEN_HEIGHT;
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        camera.aspect = ASPECT;
        camera.updateProjectionMatrix();
    });
}

(function() {
  var run;

  run = function() {
	addKeyboardEvents();
    addResizeEvent();
    init();
    return animate();
  };

  window.run = run;

}).call(this);
