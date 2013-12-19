//First variable determines if the second number recieves addition or subtraction,
//second determines the interpolation time between the camera positions.
var shipViewToggle = [true,1.0];

//The orbiting distance.
var radiusMultiplier = 1.5;

//Object we are heading to
var goalObject = "planet0";

//Object we are orbiting, and the center of orbit, as well as if the direction it is
//orbiting is positive (angle+20 or angle-20, for instance, when determining next orbit position)
var orbiting = ["none",new THREE.Vector3(0,0,0),false];

//If we're using an overhead camera view or the normal ship camera view
var camToggle = false;

//If the ship is travelling or not
var travelling = true;

var shipPhys = 
{
	maxThrust: 10, //can be adjusted when we have upgradable ships.
	maxVel: 100,
	velocity: new THREE.Vector3(0,0,0),
	acceleration: new THREE.Vector3(0,0,0),
	mass: 100
};

var camPhys = 
{
	maxThrust: 0.1, //can be adjusted when we have upgradable ships.
	velocity: new THREE.Vector3(0,0,0),
	acceleration: new THREE.Vector3(0,0,0),
	lastLookAt: new THREE.Vector3(0,0,0),
};

//Stuff for the camera to freely roam away from the spaceship...


function solve() {

	//Don't update if all our stuff isn't loaded.
	if (loads.indexOf(false) != -1) { return; }
	
	shipUpdate();
	camUpdate();
}

function travelTo(object,pointInSpace) {
	
	//You can travel to an arbitrary point in space.  Why not?
	if (pointInSpace) {
		moveTo("goal",object.x,object.y,object.z);
		goalObject = "goal";
	}
	else {
		goalObject = object;
	}
}


function shipPathing(toWhere,radius) {
	var ship = grabObject("spaceship")[1];
		
	var dist = toWhere.clone().sub(ship.position);
	while (dist.length() > shipPhys.maxThrust) {
		dist.multiplyScalar(0.975);
	}
	
	//Apply brakes if we're close to the center.
	//We're not spaceballs -- we do break for somebody!
	if (toWhere.distanceTo(ship.position) < radius) {
		shipPhys.velocity.multiplyScalar(0.975);
		dist.multiplyScalar(Math.max(0.25,toWhere.distanceTo(ship.position)/radius));
	}
	
	if (toWhere.clone().sub(ship.position).length() < toWhere.clone().sub(ship.position.clone().add(shipPhys.velocity).add(dist)).length()) {
		shipPhys.velocity.multiplyScalar(0.5);
	}
	
	return dist;
	
}

function cameraPathing() {
	
	//Use the ship itself to generate coordinates the camera can be located at.
	var ship = grabObject("spaceship")[1];
	
	//The camera will try to switch between a side view, back view, and other side view of the ship.	
	//------------------------------------------------------------
	//View from right side.
	rhs1 = new THREE.Vector3(-35,5,-15); //bl
	rhs2 = new THREE.Vector3(15,5,-15); //br
	rhs3 = new THREE.Vector3(0,5,10);  //top
	//------------------------------------------------------------
	//View from left side.
	lhs1 = new THREE.Vector3(15,5,-5);  //bl
	lhs2 = new THREE.Vector3(50,5,-5); //br
	lhs3 = new THREE.Vector3(15,5,5); //top
	//------------------------------------------------------------
	//View from back side.
	mhs1 = new THREE.Vector3(-25,-5,-35); //bl
	mhs2 = new THREE.Vector3(25,-5,-35); //br
	mhs3 = new THREE.Vector3(0,-5,10);  //top
	//------------------------------------------------------------
	//Find which views to interpolate...
	
	var t1,t2,t3;
	
	
	if (shipViewToggle[1] >= 0.0) {
		t1 = cosIntVec(mhs1,rhs1,shipViewToggle[1]).clone();
		t2 = cosIntVec(mhs2,rhs2,shipViewToggle[1]).clone();
		t3 = cosIntVec(mhs3,rhs3,shipViewToggle[1]).clone();
	}
	else {
		t1 = cosIntVec(lhs1,mhs1,shipViewToggle[1]+1.0).clone();
		t2 = cosIntVec(lhs2,mhs2,shipViewToggle[1]+1.0).clone();
		t3 = cosIntVec(lhs3,mhs3,shipViewToggle[1]+1.0).clone();
	}
	
	var toggleAmount = 0.01;
	
	if (shipViewToggle[0]) {
		shipViewToggle[1] += toggleAmount/2;
		if (shipViewToggle[1] > 1.0) {
			shipViewToggle[1] = 1.0;
			shipViewToggle[0] = false;
		}
	}
	else {
		shipViewToggle[1] -= toggleAmount/4;
		if (shipViewToggle[1] < -1.0) {
			shipViewToggle[1] = -1.0;
			shipViewToggle[0] = true;
		}
	}
	
	
	t1.applyQuaternion(ship.quaternion);
	t1.add(ship.position);
	
	t2.applyQuaternion(ship.quaternion);
	t2.add(ship.position);
	
	t3.applyQuaternion(ship.quaternion);
	t3.add(ship.position);
	
	var center = new THREE.Vector3(
		(t1.x+t2.x+t3.x)/3,
		(t1.y+t2.y+t3.y)/3,
		(t1.z+t2.z+t3.z)/3);
	
	var dist = center.clone().sub(camera.position);
	dist.multiplyScalar(camPhys.maxThrust);

	var a,b,c,s,area;
	a = t1.distanceTo(t2);
	b = t2.distanceTo(t3);
	c = t3.distanceTo(t1);
	var s = (a+b+c)/2
	var area = Math.sqrt(s*(s-a)*(s-b)*(s-c));

	
	if (camera.position.distanceTo(center) < area*3) {
		dist.multiplyScalar(0.333);
		camPhys.velocity.multiplyScalar(0.666);
	}
	
	return dist;
}

function shipUpdate() {	

	var ship = grabObject("spaceship");
	var goal = grabObject(goalObject);
	if (!goal[0] || !ship[0]) return;
	
	var sizeOfShip = 32;
	var radius = sizeOfShip;
	if (goalObject.indexOf("planet") != -1) {
		radius += scenePlanets[goalObject].radius*radiusMultiplier;
	}
	
	ship = ship[1];
	goal = goal[1];
	
	var t = travelling;
	
		//Allow the ship to rotate planets when it's hit the target.
	if (goal.position.clone().sub(ship.position).length() < radius*3) {
		shipPhys.velocity.multiplyScalar(0.66);
	}
	if (goal.position.clone().sub(ship.position).length() < radius)  { 
		travelling = false;
		orbiting[0] = goalObject;
		orbiting[1] = goal.position;
		orbiting[2] = true;
	}
	else {
		//Redundancy to ensure that the orbiting doesn't cause the ship to not be able to go anywhere else.
		orbiting[0] = "none";
		orbiting[1] = goal.position;
		orbiting[2] = true;
	}
	
	
	//Just check and see where the ship /would/ be heading, so we can ignore the orbit if necessary.
	shipPhys.acceleration = shipPathing(goal.position,radius+1024);
	orbitRadiusCheck(ship.position);
	
	//If the ship is not travelling, let it come to a stop.
	if (!travelling && orbiting[0] === "none") { 
		//Ship is stopping in the middle of space.
		var vel_len = shipPhys.velocity.length();
		if (vel_len == 0.0) {}
		else if (vel_len > 0.1) {
			shipPhys.velocity.multiplyScalar(0.5);
		}
		else {
			shipPhys.velocity.multiplyScalar(0);
		}
		ship.position = ship.position.add(shipPhys.velocity);
	}
	//
	else if (orbiting[0] !== "none") {
		var lookAtMe = doOrbitUpdate(ship);
		ship.lookAt(lookAtMe);
	
	}
	else {
		//travelling and not orbiting -- can use force-based trajectories.
		shipPhys.velocity.add(shipPhys.acceleration);
		while (shipPhys.velocity.length() > shipPhys.maxVel) { shipPhys.velocity.multiplyScalar(0.98); }
		
		ship.position = ship.position.add(shipPhys.velocity);
		if (shipPhys.acceleration.length() < 0.005 && shipPhys.velocity.length() < 0.005) return;
		var tquat = ship.quaternion.clone();
		
		ship.lookAt(ship.position.clone().add(shipPhys.velocity).add(shipPhys.acceleration));
		ship.quaternion.slerp(tquat,0.9);
	}
	
	//So the ship doesn't fly into planets...
	redundantShipCheck(ship);
	
	//console.log(ship.position.distanceTo(goal.position));
	
	if (t && !travelling) { notify("You have reached your destination."); }
	

}

function camUpdate() {
	
	var ship = grabObject("spaceship");
	
	var interpolatedLookAt = cosIntVec(ship[1].position,camPhys.lastLookAt,0.5);
	camPhys.lastLookAt = ship[1].position.clone();
	
	if (camToggle) {
		if (ship[0]) {
			camera.position = ship[1].position.clone().add(new THREE.Vector3(0,300,50));
			camera.lookAt((ship[1].position.clone().add(camPhys.lastLookAt)).multiplyScalar(0.5));
			camera.lookAt(interpolatedLookAt);
		}
	}
	else {
		camPhys.acceleration = cameraPathing(16);
		camPhys.velocity.add(camPhys.acceleration);
		camera.position = camera.position.add(camPhys.velocity);
		camera.lookAt(interpolatedLookAt);
		
	}
	

}

function toRadians(degs) {
	return degs*0.0174532925;
}

function toDegrees(rads) {
	return rads*57.2957795;
}

//Cosine interpolation of a vector's components individually.
function cosIntVec(vStart,vEnd,time) {
	var point = new THREE.Vector3(0,0,0);
	point.x = cosInt(vStart.x,vEnd.x,time);
	point.y = cosInt(vStart.y,vEnd.y,time);
	point.z = cosInt(vStart.z,vEnd.z,time);
	return point;
}

//The actual interpolation function itself.
function cosInt(start,end,time) {
	var t2 = (1.0-Math.cos(time*Math.PI))/2.0;
	return (start*(1.0-t2)+t2*end);
}
