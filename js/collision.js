function orbitRadiusCheck(shipPosition) {

	//As of yet, all we need to do with collisions is
	//avoid the sun and avoid planets.

	//How much distance away from said object do we want?
	
	//----- Collisions against the Sun -----
	//True statement for scoping variables...
	if (true) {
		var sun = stars[CURRENT_LOCATION];
		var sunDist = shipPosition.clone(); 
		
		//check and see if the ship actually is heading towards the sun...
		var positionWithAcceleration = shipPosition.clone().add(shipPhys.acceleration);
		var trajectoryDist = positionWithAcceleration.clone(); 
		
		if (sunDist.length() < sun.radius*radiusMultiplier) {
			if (trajectoryDist.length() >= sun.radius*radiusMultiplier) {
				orbiting[0] = "none";
			}
			else {
				orbiting[0] = "sun";
				shipPhys.velocity.multiplyScalar(0.975);
				
				var angle = (new THREE.Vector3(1,0,0)).angleTo(shipPosition.clone().normalize());
				var angleDegrees = toDegrees(angle);
				orbiting[1] = new THREE.Vector3(0,0,0);
				
				if (angleDegrees >=0 && angleDegrees <= 180) { orbiting[2] = true; }
				else { orbiting[2] = false; }
				
				if ("sun" === goalObject) { travelling = false; }
			}
		}
	}
	
	//----- Collisions against Planets -----
	for (var i = 0; i < 7; i++) {
		if (scenePlanets["planet"+i] !== undefined)
		{
			var planet = scenePlanets["planet"+i];
			var planetExtended = grabObject("planet"+i)[1];
			var newShipPosition = shipPosition.clone().sub(planetExtended.position);
			//check and see if the ship actually is heading towards the planet...
			var positionWithAcceleration = newShipPosition.clone().add(shipPhys.acceleration);
			var trajectoryDist = positionWithAcceleration.clone().sub(planetExtended.position);
			var planetDist = newShipPosition.clone()
			
			
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
		}
	}
}

function doOrbitUpdate(ship) {
	

	
	var oldPosition = ship.position.clone();
	var orbitAmount = 0.005;
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

function redundantShipCheck(ship) {
	for (var i = 0; i < 7; i++) {
		if (scenePlanets["planet"+i] !== undefined)
		{
			var planet = scenePlanets["planet"+i];
			var planetExtended = grabObject("planet"+i)[1];
			var newShipPosition = planetExtended.position.clone().sub(ship.position);
			var planetDist = newShipPosition.clone();
			if (planetDist.length() < planet.radius*radiusMultiplier) {
				
				var adjusted = ship.position.clone().sub(planetExtended.position);
				adjusted.normalize();
				adjusted.multiplyScalar(planet.radius*radiusMultiplier);
				adjusted.add(planetExtended.position);
				ship.position = adjusted;
				
				console.log("Inside...");
			}
		}
	}
}
