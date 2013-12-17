var shipViewToggle = [true,1.0];
var totalDist = new THREE.Vector3(0,0,0);
var traveling = false;

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


function shipPathing(toWhere,radius) {
	var ship = grabObject("spaceship")[1];
		
	var dist = toWhere.clone().sub(ship.position);
	//dist.normalize();
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
	mhs1 = new THREE.Vector3(-25,20,-35); //bl
	mhs2 = new THREE.Vector3(25,20,-35); //br
	mhs3 = new THREE.Vector3(0,20,10);  //top
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
	var goal = grabObject("goal")[1].position;
	if (ship[0] && traveling)
	{
		//Update target position...
		
		//Prevent wonky angle rotation when objects are on top of each other...
		if (goal.clone().sub(ship[1].position).length() < 8) return;
		shipPhys.acceleration = getPlanetForces(ship[1]);
		shipPhys.acceleration.add(shipPathing(goal,totalDist.length()/10));
		shipPhys.velocity.add(shipPhys.acceleration);
		
		while (shipPhys.velocity.length() > shipPhys.maxVel) { shipPhys.velocity.multiplyScalar(0.98); }
		
		ship[1].position = ship[1].position.add(shipPhys.velocity);
		if (shipPhys.acceleration.length() < 0.005 && shipPhys.velocity.length() < 0.005) return;
		var tquat = ship[1].quaternion.clone();
		ship[1].lookAt(ship[1].position.clone().add(shipPhys.velocity).add(shipPhys.acceleration.multiplyScalar(48.0)));
		
		ship[1].quaternion.slerp(tquat,0.925);
		//ship[1].quaternion.slerp(tquat,0.970988-14.5258*shipPhys.maxThrust);
		
		
		console.log(goal.clone().sub(ship[1].position).length());
	}
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