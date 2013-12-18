function getPlanetForces(shipPosition) {

	//As of yet, all we need to do with collisions is
	//avoid the sun and avoid planets.
	
	var totalForce = new THREE.Vector3(0,0,0);
	var origin = new THREE.Vector3(0,0,0);
	
	//----- Collisions against the Sun -----
	//True statement for scoping variables...
	if (true) {
		var sun = stars[CURRENT_LOCATION];
		var sunPos = origin.clone();
		var sunDist = sunPos.clone().sub(shipPosition);
		var reverse = shipPosition.clone().sub(sunPos);
		if (sunDist.length() < sun.radius*2) {
			//Force the thing away from the sun.
			var normal = sunDist.clone().normalize();
			var angle = (normal.dot(shipPhys.velocity))/(normal.length()*shipPhys.velocity.length());
			
			var deflect = normal.clone().multiplyScalar((shipPhys.velocity.dot(normal))/(normal.dot(normal)));
			
			var proj = shipPhys.velocity.clone().sub(deflect);
			var newnormal = (proj.sub(deflect));
			
			//If the current acceleration isn't going to cause
			//the ship to crash into the object, don't adjust
			//its flight path.
			
			if (shipPhys.acceleration.angleTo(newnormal) > Math.PI/4) { 
				totalForce.add(newnormal.multiplyScalar(0.75));
			}
			else {
				totalForce.add(reverse).normalize();
			}	
		}
		
		while (shipPosition.length() < sun.radius+10) { 
			shipPosition.add(newnormal);
		}
		
	}
	
	//----- Collisions against Planets -----
	var sysplanets = stars[CURRENT_LOCATION].planets;
	var i = 0;
	while (scenePlanets["planet"+i] !== undefined)
	{
		var planet = scenePlanets["planet"+i];
		var planetExtended = grabObject("planet"+i)[1];
		var newShipPosition = planetExtended.position.clone().sub(shipPosition);
		//Normalize planet to be the center of the system
		var planetDist = origin.clone().sub(newShipPosition);
		var reverse = newShipPosition.clone().sub(origin);
		if (planetDist.length() < planet.radius*2) {
			if (goalObject == ("planet"+i)) {
			shipPhys.velocity.multiplyScalar(0.825);
			}
			//Force the thing away from the planet.
			var normal = planetDist.clone().normalize();
			var angle = (normal.dot(shipPhys.velocity))/(normal.length()*shipPhys.velocity.length());
			
			var deflect = normal.clone().multiplyScalar((shipPhys.velocity.dot(normal))/(normal.dot(normal)));
			
			var proj = shipPhys.velocity.clone().sub(deflect);
			var newnormal = (proj.sub(deflect));
			
			if (shipPhys.acceleration.angleTo(newnormal) > Math.PI/4) { 
				totalForce.add(newnormal.multiplyScalar(0.75));
			}
			else {
				totalForce.add(reverse).normalize();
			}	
		}
		while (newShipPosition.length() < planet.radius+10) { 
			shipPosition.add(newnormal.normalize());
			newShipPosition.add(newnormal.normalize());
		}
		i++;
	}
	return totalForce;
}
