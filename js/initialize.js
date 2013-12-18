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
	//importModel("resources/models/sphere/sphere","spaceship",0,0,0);
	
	material_depth = new THREE.MeshDepthMaterial();
	
	var ambient = new THREE.AmbientLight( 0xffffff );
	addToScene(ambient,"ambient light");
	
	var sphr3 = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),new THREE.MeshPhongMaterial({ambient: 0x000000}));
	sphr3.translateX(4000.0);
	sphr3.translateY(-1);
	addToScene(sphr3,"goal");
	
	CURRENT_LOCATION = makeManySystems();
    notify("You begin your travels in the " + stars[CURRENT_LOCATION].name +
           " system, headed for planet " +
           planets[stars[CURRENT_LOCATION].planets[0]].name + ".");
	scenePlanets.length = 0;
	
	//---------- Adding the sun to the scene --------------------
	var sun = stars[CURRENT_LOCATION];
	
			var tex = generateSunTexture(CURRENT_LOCATION,2048);
		var sunsphere = 
			
			new THREE.Mesh(new THREE.SphereGeometry(sun.radius,128,128),
			new THREE.MeshPhongMaterial({  map: tex, specularmap: tex, ambient: 0xe7e7e7, bumpMap: tex, bumpScale:0.33 }));
	
	addToScene(sunsphere,"sun");
	
	var sunlight = new THREE.PointLight( sun.color, 2, 50000 );
	sunlight.position.set( 0, 0, 0 );
	sunlight.castShadow = true;
	sunlight.shadowMapWidth = 512;
	sunlight.shadowMapHeight = 512;
	sunlight.shadowCameraNear = 500;
	sunlight.shadowCameraFar = 8000;
	sunlight.shadowCameraFov = 30;
	addToScene(sunlight,"sunlight");
	
	// ----------- Adding the planets to the scene ----------------
	var sysplanets = stars[CURRENT_LOCATION].planets;
	for (var i = 0; i < sysplanets.length; ++i) {
		var planet = planets[sysplanets[i]];
		
		
		var tex = generateDataTexture(CURRENT_LOCATION,planet.name,1024);
		var planetSphere = 
			
			new THREE.Mesh(new THREE.SphereGeometry(planet.radius,128,128),
			new THREE.MeshPhongMaterial({  map: tex, specularmap: tex, ambient: 0xe7e7e7, bumpMap: tex, bumpScale:0.33 }));
		
		
		addToScene(planetSphere,"planet"+i);
		scenePlanets["planet"+i] = planets[sysplanets[i]];
		
		moveTo("planet"+i,planet.position.x*planet.orbit,0,planet.position.z*planet.orbit);
	}
	
	// --------- Adding the ship to the scene ---------------------
	importModel("resources/models/ship/roundedship","spaceship",sun.radius*3,0,sun.radius*-3);
	
	// --------- Modifying camera settings in the scene -----------
    camera.position.set(sun.radius*3+5,0+25,sun.radius*-3-25);
	
	
	
	//Need to set the active HDR before adding objects...
	
	
	
}

function init() {
	//Add an hdr just so that any objects loaded with materials have an HDR
	//backbone to use and prevent errors...
	setActiveHDR("resources/hdr/space/spacehdr-");
	renderSetup();
	initSpace();
	
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


function pixelCoord(x,y,edgesize) {
	return (3*x)+(3*y*edgesize);
}

function getPlanetType(seed) {
		
	
	var type = Math.abs(seed)%6;
	
	var chigh = [], cmid = [], clow = [];
	var thigh, tmid;
	
	var oct=4;
	var pers = 0.5;

	switch (type) {
		case 0: //Icy
			chigh = [0.1, 0.8, 0.9];
			cmid = [0.1, 0.7, 0.8];
			clow = [0.0, 0.1, 0.35];
			
			thigh = 0.875;
			tmid =  0.275;
			break;
		case 1: //Rocky
			chigh = [0.85, 0.89, 0.91];
			cmid = [0.705, 0.7, 0.585];
			clow = [0.375, 0.34, 0.5];
			
			thigh = 0.875;
			tmid =  0.43;
			break;
		case 2: //Earthlike
			//using the cutoff between mid and low to differentiate land and sea.
			chigh = [0.8, 0.75, 0.4];
			cmid = [0.25, 0.25, 0.15];
			clow = [0.3, 0.5, 0.705];
			
			thigh = 0.875;
			tmid =  0.625;
			break;
		case 3: //Lava Planet
			//The high and mid have really high thresholds for the appearance of lava.
			chigh = [1.0, 1.0, 0.55];
			cmid = [0.9, 0.3, 0.2];
			clow = [0.2, 0.1, 0.1];
			
			thigh = 0.8625;
			tmid =  0.75;
			break;
		case 4: //Gas Blue/Green
			chigh = [0.9, 1.0, 1.0];
			cmid = [0.435, 0.625, 1.0];
			clow = [0.1, 0.075, 0.4];
			
			thigh = 0.9;
			tmid =  0.25;
			break;
		case 5:  //Gas Red/Yellow
			chigh = [1.0, 1.0, 0.95];
			cmid = [0.875, 0.255, 0.825];
			clow = [0.3, 0.095, 0.125];
			
			thigh = 0.9;
			tmid =  0.25;
			break;
	}

	return { colorFilter: { high: chigh, mid: cmid, low: clow }, thresholds: { high: thigh, mid: tmid }, octaves:oct, persistence:pers };
}

function processPixel(value,typeInfo) {
	
	var pixel = new THREE.Vector3(value,value,value);
	
	if (value < typeInfo.thresholds.mid) {
		pixel.x *= typeInfo.colorFilter.low[0];
		pixel.y *= typeInfo.colorFilter.low[1];
		pixel.z *= typeInfo.colorFilter.low[2];
	}
	else if (value < typeInfo.thresholds.high) {
		pixel.x *= typeInfo.colorFilter.mid[0];
		pixel.y *= typeInfo.colorFilter.mid[1];
		pixel.z *= typeInfo.colorFilter.mid[2];
	}
	else {
		pixel.x *= typeInfo.colorFilter.high[0];
		pixel.y *= typeInfo.colorFilter.high[1];
		pixel.z *= typeInfo.colorFilter.high[2];
	}

	return pixel;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function smoothNoise(pixelArray,useArray,octaveOn,edgesize) {
	
	var period = Math.pow(2,octaveOn);
	var freq = 1/period;
	
	for (var x = 0; x < edgesize; x++) {
		var horiz1 = Math.floor((Math.floor(x)/period)*period);
		var horiz2 = Math.floor(((horiz1 + period)*octaveOn)%edgesize);
		var horizcombined = (x-horiz1)*freq;
		
		for (var y = 0; y < edgesize; y++) {
			var vert1 = Math.floor((Math.floor(y)/period)*period);
			var	vert2 = Math.floor(((vert1 + period)*octaveOn)%edgesize);
			var vertcombined = (y-vert1)*freq;
						
			var top = cosInt(pixelArray[horiz1][vert1],pixelArray[horiz2][vert1],horizcombined);
			
			var bottom = cosInt(pixelArray[horiz1][vert2],pixelArray[horiz2][vert2],horizcombined);
			
			useArray[x][y] = cosInt(top,bottom,vertcombined);
		}
	}	
}

function perlinNoise(seed,octaves,persistence,edgesize,sunhax) {

	if (sunhax === undefined) { sunhax = false; }
	var pixel = createArray(edgesize,edgesize);
	var m = new MersenneTwister(seed);
	
	//White noise.
	for (var x=0; x < edgesize; x++) {
		for (var y = 0; y < edgesize; y++) {
			pixel[x][y] = (m.random()*2)-1;
		}
	}

	var amp = 1;
	var totalAmp = 0;
	for (var octave = 0; octave < octaves; octave++) {
		var smooth = createArray(edgesize,edgesize);
		smoothNoise(pixel,smooth,octave,edgesize);
		for (var x=0; x < edgesize; x++) {
			for (var y = 0; y < edgesize; y++) {
				if (sunhax)
					pixel[x][y] += smooth[x][y];
				else 
					pixel[x][y] += smooth[x][y]*amp;
			}
		}
		amp *= persistence;
		totalAmp += amp;
	}
	
	
	for (var x=0; x < edgesize; x++) {
		for (var y = 0; y < edgesize; y++) {
			pixel[x][y] = ((pixel[x][y]+1)/2)*totalAmp;
		}
	}
	
	return pixel;
	
}

function generateDataTexture( ID_seed, name_seed, edgesize ) {


	var planetSeed = ID_seed+31*name_seed.hashCode();
	var typeInfo = getPlanetType(planetSeed);
	var size = edgesize * edgesize;
	var data = new Float32Array( 3 * size );
		
				
	var pixel = perlinNoise(planetSeed,typeInfo.octaves,typeInfo.persistence,edgesize);

	for (var x=0; x < edgesize; x++) {
		for (var y = 0; y < edgesize; y++) {
			var value = pixel[x][y];
			var rgb = processPixel(value,typeInfo);
			var i = pixelCoord(x,y,edgesize);
			data[ i ]  = rgb.x;
			data[ i + 1 ] = rgb.y;
			data[ i + 2 ] = rgb.z;
		}
	}
	
	var texture = new THREE.DataTexture( data, edgesize, edgesize, THREE.RGBFormat,THREE.FloatType );
	texture.needsUpdate = true;

	return texture;
	
}

function generateSunTexture( ID_seed, edgesize ) {


	var planetSeed = ID_seed;
	var typeInfo = getPlanetType(3)
	var size = edgesize * edgesize;
	var data = new Float32Array( 3 * size );
		
				
	var pixel = perlinNoise(planetSeed,typeInfo.octaves,typeInfo.persistence,edgesize,true);

	for (var x=0; x < edgesize; x++) {
		for (var y = 0; y < edgesize; y++) {
			var value = pixel[x][y];
			var rgb = processPixel(value,typeInfo);
			var i = pixelCoord(x,y,edgesize);
			data[ i ]  = rgb.x;
			data[ i + 1 ] = rgb.y;
			data[ i + 2 ] = rgb.z;
		}
	}
	
	var texture = new THREE.DataTexture( data, edgesize, edgesize, THREE.RGBFormat,THREE.FloatType );
	texture.needsUpdate = true;

	return texture;
	
}
