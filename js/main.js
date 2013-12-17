var keyboard = {};

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

(function() {
  var run;

  run = function() {
	addKeyboardEvents();
    init();
    return animate();
  };

  window.run = run;

}).call(this);
