function getPlanetForces(ship) {

	var force = new THREE.Vector3(0,0,0);

	var obstacle = grabObject("obstacle")[1].position.clone();
	var dist = obstacle.clone();
	obstacle.x = obstacle.x + Math.random();
	obstacle.y = obstacle.y + Math.random();
	obstacle.z = obstacle.x + Math.random();
	dist.sub(ship.position);
	if (dist.length() < /*arbitrary radius, will use planet radius when implementing it.*/ 150) {
		var reverses = ship.position.clone();
		reverses.sub(obstacle);
		reverses.normalize().multiplyScalar(0.25);
		force.add(reverses);
	}
	return force;
}

function sphereBounds(position,radius) {
	var u,d,l,r;
	u = position.clone();
	u.z = u.z + radius;
	
	d = position.clone();
	d.z = d.z - radius;
	
	l = position.clone();
	l.x = l.x - radius;
	
	r = position.clone();
	r.x = r.x + radius;

	return { up:u,down:d,left:l,right:r };
}

function lineLineIntersection(vec1,vec2,vec3,vec4) {
	//note that in 3d, the y is height and we ignore that, so
	//we only need to know the x and z.
	var p0_x = vec1.x;
	var p0_y = vec1.z;
	var p1_x = vec2.x;
	var p1_y = vec2.z;
	var p2_x = vec3.x;
	var p2_y = vec3.z;
	var p3_x = vec4.x;
	var p3_y = vec4.z;
	
	var s1_x = p1_x - p0_x;
	var s1_y = p1_y - p0_y;
	var s2_x = p3_x - p2_x;
	var s2_y = p3_y - p2_y;

	var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
	
	var t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

	//Do some quick hax detection for parallel by offsetting the slope of a line.
	//It won't detect the collision exactly on the turn it happens always, but it
	//should detect collisions within a few frames at most.
	
	var para = false;
	
	if (s === 0.0) {
	
		//Just for giggles, let's see if this actually causes a legitimate
		//intersection by changing the slope of the lines trivially.
		
		if (s1_x >= s2_x) {	s1_x = s1_x +1; s2_x = s2_x -1; }
		else {	s1_x = s1_x -1; s2_x = s2_x +1; }
		
		if (s1_y >= s2_y) {	s1_y = s1_y +1; s2_y = s2_y -1; }
		else {	s1_y = s1_y -1; s2_y = s2_y +1; }

		s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
		t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

		para = true;
		
	}

	if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
		var intX = p0_x + (t * s1_x);
		var intY = p0_y + (t * s1_y);
		//
		return [intX,intY,para];
	}
	return [false];
}