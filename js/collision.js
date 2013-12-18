function orbitRadiusCheck(shipPosition) {

	//As of yet, all we need to do with collisions is
	//avoid the sun and avoid planets.

	var origin = new THREE.Vector3(0,0,0);
	
	//How much distance away from said object do we want?
	var radiusMultiplier = 1.5;
	
	//----- Collisions against the Sun -----
	//True statement for scoping variables...
	if (true) {
		var sun = stars[CURRENT_LOCATION];
		var sunPos = origin.clone();
		var sunDist = sunPos.clone().sub(shipPosition);
		//check and see if the ship actually is heading towards the sun...
		var positionWithAcceleration = shipPosition.clone().add(shipPhys.acceleration);
		var trajectoryDist = sunPos.clone().sub(positionWithAcceleration);
		if (sunDist.length() < sun.radius*radiusMultiplier) {
			if (trajectoryDist.length() >= sun.radius*radiusMultiplier) {
				//shipPhys.velocity.multiplyScalar(0.0);
				orbiting[0] = "none";
			}
			else {
				orbiting[0] = "sun";
				shipPhys.velocity.multiplyScalar(0.975);
				
				var angle = (new THREE.Vector3(1,0,0)).angleTo(shipPosition.clone().normalize());
				var angleDegrees = toDegrees(angle);
				orbiting[1] = sun.position.clone();
				
				if (angleDegrees >=0 && angleDegrees <= 180) { orbiting[2] = true; }
				else { orbiting[2] = false; }
				
				if ("sun" === goalObject) { travelling = false; }
			}
		}
	}
	
	//----- Collisions against Planets -----
	var i = 0;
	while (scenePlanets["planet"+i] !== undefined)
	{
		var planet = scenePlanets["planet"+i];
		var planetExtended = grabObject("planet"+i)[1];
		var newShipPosition = planetExtended.position.clone().sub(shipPosition);
		//check and see if the ship actually is heading towards the planet...
		var positionWithAcceleration = newShipPosition.clone().add(shipPhys.acceleration);
		var trajectoryDist = planetExtended.position.clone().sub(positionWithAcceleration);
		var planetDist = origin.clone().sub(newShipPosition);
		
		
		if (("planet"+i) === goalObject && planetDist.length() < planet.radius*radiusMultiplier) {
			orbiting[0] = "planet"+i;
			orbiting[1] = planet.position.clone();
		
		}
		
		else if (planetDist.length() < planet.radius*radiusMultiplier) {
			if (trajectoryDist.length() >= planet.radius*radiusMultiplier) {
				shipPhys.velocity.multiplyScalar(0.0);
				orbiting[0] = "none";
			}
			else {
				orbiting[0] = "planet"+i;
				shipPhys.velocity.multiplyScalar(0.975);
			
				orbiting[1] = planet.position.clone();
				
				if (angleDegrees >=0 && angleDegrees <= 180) { orbiting[2] = true; }
				else { orbiting[2] = false; }
				
				if ("planet"+i === goalObject) { travelling = false; }
			}
		}

		//Hey I'm a moron for not incrementing loop variables and wondering why stuff didn't work!
		i++;
	}
}

function doOrbitUpdate(ship) {

	var oldPosition = ship.position.clone();
	var orbitAmount = 0.0025;
	var newShipPosition = ship.position.clone().sub(orbiting[1]);
	
	if (orbiting[2]) {
		newShipPosition.applyEuler(new THREE.Euler(0,-orbitAmount,0,'XYZ'));
	}
	else {
		newShipPosition.applyEuler(new THREE.Euler(0,orbitAmount,0,'XYZ'));
	}
	

	newShipPosition.add(orbiting[1]);
	ship.position = newShipPosition.clone();
	
	return (newShipPosition.clone().sub(oldPosition)).add(newShipPosition);
	
}
