var scene;
var camera, renderer;
var HDR_BG_MAP;
var HDR_REFRACTIVE;
var sceneObjects = [];
var objectNames = [];
var attachedLights = [];
var object;

var loads = [];
var changed = false;


function resetScene() {
	scene = new THREE.Scene();
	toLoad = 0;
}

function clearScene() { 
	scene = new THREE.Scene();
	sceneObjects.length=0;
	objectNames.length=0;
	attachedLights.length=0;
	loads.length = 0;
 }

function addToScene(thingToAdd,nameOfThing) { 
	//If the object already exists, then don't add it, but modify it.
	var position = objectNames.indexOf(nameOfThing);
	if (position === -1) {
		console.log("Pushing "+nameOfThing);
		sceneObjects.push(thingToAdd);
		objectNames.push(nameOfThing);
	}
	else {
		console.log("Updating "+nameOfThing);
		sceneObjects[position] = thingToAdd;	
	}
	changed = true;
}

function removeFromScene(nameOfThing) {
	var pos = objectNames.indexOf(nameOfThing);
	scene.remove(thingToRemove); 
}

function setActiveHDR(location) {
	//Environment maps, anyone?
	var urls = [
		location+'pos-x.png',
		location+'neg-x.png',
		location+'pos-y.png',
		location+'neg-y.png',
		location+'pos-z.png',
		location+'neg-z.png'
	];

	// wrap it up into the object that we need
	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	reflectionCube.format = THREE.RGBFormat;

	var refractionCube = new THREE.Texture( reflectionCube.image, new THREE.CubeRefractionMapping() );
	refractionCube.format = THREE.RGBFormat;
	
	var shader = THREE.ShaderLib[ "cube" ];
	shader.uniforms[ "tCube" ].value = reflectionCube;
	
	HDR_BG_MAP = reflectionCube;
	HDR_REFRACTIVE = refractionCube;
	
	var material = new THREE.ShaderMaterial( {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide

	} );
	
	//Update the skybox image...
	var skybox = new THREE.Mesh( new THREE.CubeGeometry( 4096, 4096, 4096 ), material );
	skybox.flipSided = true;
	//addToScene(skybox,"skybox");
}

function camPos(x,y,z) { camera.position.set(x,y,z); }
function camTarget(x,y,z) { camera.position.set(x,y,z); }



function renderSetup() {
	// Create a renderer
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 40000);
    camera.position.set(0,20,-10);
	addToScene(camera,"camera");
}

function importModel(path,name,x,y,z) {
	
	var loadlen = loads.length;
	loads.push(false);
	
	var loader = new THREE.OBJMTLLoader();
	loader.load(path+".obj",path+".mtl", function ( event ) {
		object = event;
		addToScene(object,name);
		loads[loadlen] = true;
		translateBy(name,x,y,z);
	} );
	
}    

function grabObject(nameOfThing) {
	var pos = objectNames.indexOf(nameOfThing);
	if (pos < 0) { return [false]; }
	else { return [pos,sceneObjects[pos]]; }
}