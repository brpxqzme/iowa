// Renders the scene and updates the render as needed.*


function processEvents() {

	//Choose planet destination via numbers (not numpad).
	if (keyboard[49] && goalObject != "planet0") {
		goalObject = "planet0";
		console.log("Switching destination to planet "+0+": "+scenePlanets["planet0"].name);
	}
	
	if (keyboard[50] && goalObject != "planet1") {
		goalObject = "planet1";
		console.log("Switching destination to planet "+1+": "+scenePlanets["planet1"].name);
	}
	
	if (keyboard[51] && goalObject != "planet2") {
		if (!(scenePlanets["planet2"] !== undefined)) { return; }
		goalObject = "planet2";
		console.log("Switching destination to planet "+2+": "+scenePlanets["planet2"].name);
	}
	
	if (keyboard[52] && goalObject != "planet3") {
		if (!(scenePlanets["planet3"] !== undefined)) { return; }
		goalObject = "planet3";
		console.log("Switching destination to planet "+3+": "+scenePlanets["planet3"].name);
	}
	
	if (keyboard[53] && goalObject != "planet4") {
		if (!(scenePlanets["planet4"] !== undefined)) { return; }
		goalObject = "planet4";
		console.log("Switching destination to planet "+4+": "+scenePlanets["planet4"].name);
	}
	
	if (keyboard[54] && goalObject != "planet5") {
		if (!(scenePlanets["planet5"] !== undefined)) { return; }
		goalObject = "planet5";
		console.log("Switching destination to planet "+5+": "+scenePlanets["planet5"].name);
	}
	
	if (keyboard[45] && goalObject != "planet6") {
		if (!(scenePlanets["planet6"] !== undefined)) { return; }
		goalObject = "planet6";
		console.log("Switching destination to planet "+6+": "+scenePlanets["planet6"].name);
	}
	
	if (keyboard[46] && goalObject != "planet7") {
		if (!(scenePlanets["planet7"] !== undefined)) { return; }
		goalObject = "planet7";
		console.log("Switching destination to planet "+7+": "+scenePlanets["planet7"].name);
	}
	
	//Start travelling.
	if (keyboard[65]) {
		travelling=true;	
		console.log("Starting journey.");
	}
	//Stop Travelling
	if (keyboard[83]) {
		travelling=false;
		console.log("Stopping journey.");
	}
}

function animate() {
	
	if (changed || loads.indexOf(false) != -1) {
		populate();
		changed = false;
	}
	
	processEvents();
	solve();
	
	requestAnimationFrame(animate);

	// Render the scene.
	renderer.render( scene, camera );
	//controls.update();
}
