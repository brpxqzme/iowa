var shipViewToggle = [true,1.0];
var travelling = false;
var goalObject = "planet0";

var shipPhys = 
{
	maxThrust: 0.05, //can be adjusted when we have upgradable ships.
	maxVel: 5,
	velocity: new THREE.Vector3(0,0,0),
	acceleration: new THREE.Vector3(0,0,0),
	force: new THREE.Vector3(0,0,0),
	mass: 100
};

var camPhys = 
{
	maxThrust: 0.25, //can be adjusted when we have upgradable ships.
	maxVel: 6,
	velocity: new THREE.Vector3(0,0,0),
	acceleration: new THREE.Vector3(0,0,0),
	force: new THREE.Vector3(0,0,0),
	mass: 1
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
	
	var arbitraryHeight = (1+Math.random()*5)+17.5;
	//The camera will try to switch between a side view, back view, and other side view of the ship.	
	//------------------------------------------------------------
	//View from right side.
	rhs1 = new THREE.Vector3(-35,5,-15); //bl
	rhs2 = new THREE.Vector3(15,5,-15); //br
	rhs3 = new THREE.Vector3(0,5,10);  //top
	//------------------------------------------------------------
	//View from left side.
	lhs1 = new THREE.Vector3(0,5,-5);  //bl
	lhs2 = new THREE.Vector3(50,5,-5); //br
	lhs3 = new THREE.Vector3(0,5,5); //top
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
		shipViewToggle[1] += toggleAmount/3;
		if (shipViewToggle[1] > 1.0) {
			shipViewToggle[1] = 1.0;
			shipViewToggle[0] = false;
		}
	}
	else {
		shipViewToggle[1] -= toggleAmount/5;
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

	
	if (camera.position.distanceTo(center) < area/2) {
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
		radius += scenePlanets[goalObject].radius;
	}
	
	ship = ship[1];
	goal = goal[1];
	
	//Prevent wonky angle rotation when objects are on top of each other...
	if (goal.position.clone().sub(ship.position).length() < radius) return;
	
	//If the ship is not travelling, let it come to a stop.
	if (!travelling) { 
		var vel_len = shipPhys.velocity.length();
		if (vel_len == 0.0) {}
		else if (vel_len > 0.1) {
			shipPhys.velocity.multiplyScalar(0.5);
		}
		else {
			shipPhys.velocity.multiplyScalar(0);
		}
		ship.position = ship.position.add(shipPhys.velocity);
		return;
	}
	
	shipPhys.acceleration = shipPathing(goal.position,radius+512);
	shipPhys.velocity.add(shipPhys.acceleration);

	while (shipPhys.velocity.length() > shipPhys.maxVel) { shipPhys.velocity.multiplyScalar(0.98); }
	
	//shipPhys.acceleration = getPlanetForces(ship[1]);

	
	ship.position = ship.position.add(shipPhys.velocity);
	if (shipPhys.acceleration.length() < 0.005 && shipPhys.velocity.length() < 0.005) return;
	var tquat = ship.quaternion.clone();
	ship.lookAt(ship.position.clone().add(shipPhys.velocity).add(shipPhys.acceleration.multiplyScalar(48.0)));
	
	ship.quaternion.slerp(tquat,0.925);
	//ship[1].quaternion.slerp(tquat,0.970988-14.5258*shipPhys.maxThrust);
}

function camUpdate() {
	
	camPhys.acceleration = cameraPathing(16);
	camPhys.velocity.add(camPhys.acceleration);
	
	camera.position = camera.position.add(camPhys.velocity);
	camera.lookAt(grabObject("spaceship")[1].position);

}

function toRadians(degs) {
	return degs*0.0174532925;
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