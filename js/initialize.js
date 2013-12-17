var init_load = false;
var changed = false;
//var MASTER_SEED = "testing";
var CURRENT_LOCATION = 0;

var scenePlanets = [];

function populate() {

	for (var i = 0; i < sceneObjects.length; i++) {
		console.log("Loading: "+objectNames[i]+", "+sceneObjects[i]);
		scene.add(sceneObjects[i]);
	}
}

function initSpace() {
	clearScene();
	setActiveHDR("resources/hdr/space/spacehdr-");
	importModel("resources/models/ship/roundedship","spaceship",50,0,-10);
	
	material_depth = new THREE.MeshDepthMaterial();
	
	var ambient = new THREE.AmbientLight( 0xffffff );
	addToScene(ambient,"ambient light");
	
	var sphr3 = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),new THREE.MeshPhongMaterial({ambient: 0x000000}));
	sphr3.translateX(4000.0);
	sphr3.translateY(-1);
	addToScene(sphr3,"goal");
	
	CURRENT_LOCATION = makeOnlyOneSystem();
	scenePlanets.length = 0;
	
	var sun = stars[CURRENT_LOCATION];
	var sunsphere = new THREE.Mesh(new THREE.SphereGeometry(sun.radius,64,64),new THREE.MeshPhongMaterial({ambient: sun.color}));
	addToScene(sunsphere,"sun");
	
	var sysplanets = stars[CURRENT_LOCATION].planets;
	for (var i = 0; i < sysplanets.length; ++i) {
		var planet = planets[sysplanets[i]];
		var planetSphere = new THREE.Mesh(new THREE.SphereGeometry(planet.radius,64,64),new THREE.MeshPhongMaterial({ambient: planet.color}));
		addToScene(planetSphere,"planet"+i);
		scenePlanets["planet"+i] = planets[sysplanets[i]];
		
		moveTo("planet"+i,planet.position.x*planet.orbit,0,planet.position.z*planet.orbit);
	}
	
	
	
	
	//Need to set the active HDR before adding objects...
	
	
	
}

function init() {
	//Add an hdr just so that any objects loaded with materials have an HDR
	//backbone to use and prevent errors...
	setActiveHDR("resources/hdr/space/spacehdr-");
	initSpace();
	renderSetup();
}


String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}