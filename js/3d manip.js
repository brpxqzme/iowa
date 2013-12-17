function translateBy(nameOfThing,x,y,z) {
	
	var pos = objectNames.indexOf(nameOfThing);
	if (pos >= 0) {
		sceneObjects[pos].translateX(x);
		sceneObjects[pos].translateY(y);
		sceneObjects[pos].translateZ(z);
	}
}

function moveTo(nameOfThing,x,y,z) {
	
	var pos = objectNames.indexOf(nameOfThing);
	if (pos >= 0) {
		sceneObjects[pos].position = new THREE.Vector3(x,y,z);
	}
}

function rotateTo(nameOfThing,trackMe) {
	var pos1 = objectNames.indexOf(nameOfThing);
	if (pos1 >= 0) {
		var pos2 = objectNames.indexOf(trackMe);
		if (pos2 >= 0) {
			sceneObjects[pos1].lookAt(sceneObjects[pos2].position);
		}
	}
}

function trackObject(nameOfThing,vecTo) {
	var pos1 = objectNames.indexOf(nameOfThing);
	if (pos1 >= 0) {
		sceneObjects[pos1].lookAt(vecTo)
	}
}