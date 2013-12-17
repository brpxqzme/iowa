// Renders the scene and updates the render as needed.*


function processEvents() {
	if (keyboard[65]) {
		traveling=true;
		goalObject = "goal";
		totalDist = grabObject("spaceship")[1].position.clone().sub(grabObject(goalObject)[1].position);
		
	}
	if (keyboard[83]) traveling=false;
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
