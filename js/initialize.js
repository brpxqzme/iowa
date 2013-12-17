var init_load = false;
var changed = false;
// Sets up the scene.

//Starts in space

function populate() {

	for (var i = 0; i < sceneObjects.length; i++) {
		console.log("Loading: "+objectNames[i]+", "+sceneObjects[i]);
		scene.add(sceneObjects[i]);
	}
	
	//renderer.render(scene, camera);
}

function initSpace() {
	clearScene();
	
	material_depth = new THREE.MeshDepthMaterial();
	
	var ambient = new THREE.AmbientLight( 0xffffff );
	addToScene(ambient,"ambient light");
	var sphr1 = new THREE.Mesh(new THREE.SphereGeometry(0.5,8,8),new THREE.MeshPhongMaterial({ambient: 0x00FF00}));
	addToScene(sphr1,"target");
	
	var sphr2 = new THREE.Mesh(new THREE.SphereGeometry(8,8,8),new THREE.MeshPhongMaterial({ambient: 0xFF0000}));
	sphr2.translateX(2000.0);
	sphr2.translateY(-1);
	addToScene(sphr2,"obstacle");
	
	var sphr3 = new THREE.Mesh(new THREE.SphereGeometry(2,8,8),new THREE.MeshPhongMaterial({ambient: 0x0000FF}));
	sphr3.translateX(4000.0);
	sphr3.translateY(-1);
	addToScene(sphr3,"goal");
	
	
	
	//Need to set the active HDR before adding objects...
	setActiveHDR("resources/hdr/space/spacehdr-");
	importModel("resources/models/ship/roundedship","spaceship",50,0,-10);
	
}

function init() {
	//Add an hdr just so that any objects loaded with materials have an HDR
	//backbone to use and prevent errors...
	setActiveHDR("resources/hdr/space/spacehdr-");
	initSpace();
	renderSetup();
}
