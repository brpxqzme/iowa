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

function switchSystem(ID) {
	CURRENT_LOCATION = ID;
	notify("You have arrived at the " + stars[CURRENT_LOCATION].name +
	" system, headed for planet " +
	planets[stars[CURRENT_LOCATION].planets[0]].name + ".");
	
	setupScene(ID,true);
	
}

function setupScene(ID,setShip) {
	CURRENT_LOCATION = ID;
	//No need to reload the ship each time we do this, that's horrible overhead.
	if (setShip !== undefined && setShip) {
		var ship = grabObject("spaceship")[1].clone(); 
	} else { setShip = false; }
	
	setActiveHDR("resources/hdr/space/spacehdr-");
	clearScene();
	
	if (setShip) { addToScene(ship,"spaceship"); }
	
	addToScene(camera,"camera");
	var ambient = new THREE.AmbientLight( 0xffffff );
	addToScene(ambient,"ambient light");
	
	var sphr3 = new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),new THREE.MeshPhongMaterial({ambient: 0x000000}));
        sphr3.translateX(4000.0);
        sphr3.translateY(-1);
		sphr3.visible = false;
        addToScene(sphr3,"goal");
		   
	makeMap();
	
	   

	var sun = stars[CURRENT_LOCATION];
        
	var tex = generateSunTexture(CURRENT_LOCATION,1024);
	var sunsphere =		
		new THREE.Mesh(new THREE.SphereGeometry(sun.radius,128,128),
		new THREE.MeshPhongMaterial({  map: tex, specularmap: tex, ambient: 0xe7e7e7, bumpMap: tex, bumpScale:0.33 }));
	
	addToScene(sunsphere,"sun");
	
	var sunlight = new THREE.PointLight( sun.color, 2, 50000 );
	sunlight.position.set( 0, 0, 0 );
	sunlight.castShadow = true;
	sunlight.shadowMapWidth = 512;	sunlight.shadowMapHeight = 512;
	sunlight.shadowCameraNear = 500;
	sunlight.shadowCameraFar = 8000;
	sunlight.shadowCameraFov = 30;
	addToScene(sunlight,"sunlight");
	
	var sysplanets = stars[CURRENT_LOCATION].planets;
	for (var i = 0; i < sysplanets.length; ++i) {
		var planet = planets[sysplanets[i]];
		
		var tex = generateDataTexture(CURRENT_LOCATION,planet.name,512);
		var planetSphere = 
				
				new THREE.Mesh(new THREE.SphereGeometry(planet.radius,128,128),
				new THREE.MeshPhongMaterial({  map: tex, specularmap: tex, ambient: 0xe7e7e7, bumpMap: tex, bumpScale:0.33 }));
		
		
		addToScene(planetSphere,"planet"+i);
		scenePlanets["planet"+i] = planets[sysplanets[i]];
		
		moveTo("planet"+i,planet.position.x*planet.orbit,0,planet.position.z*planet.orbit);
	}
	if (setShip) { grabObject("spaceship")[1].position = new THREE.Vector3(sun.radius*3,25,sun.radius*-3); }
	camera.position.set(sun.radius*3,25,sun.radius*-3);
	
	//...Stars!?
    var stars_geometry = new THREE.Geometry();
    for (var i in stars) 
		stars_geometry.vertices.push(new THREE.Vector3(stars[i].x*12,stars[i].y*12,stars[i].z*12));
    var stars_partmat = new THREE.ParticleBasicMaterial({ color: 0xffffff, ambient:0xffffff, size: 4 });
    var stars_system = new THREE.ParticleSystem(stars_geometry,stars_partmat);								
	scene.add(stars_system);
	
	changed = true;
	
	goalObject = "planet0";
	
}

function initSpace() {
	clearScene();
	
	setActiveHDR("resources/hdr/space/spacehdr-");


	CURRENT_LOCATION = makeManySystems();
	notify("You begin your travels in the " + stars[CURRENT_LOCATION].name +
	" system, headed for planet " +
	planets[stars[CURRENT_LOCATION].planets[0]].name + ".");
	makeMap();

	// --------- Adding the ship to the scene ---------------------
	
	setupScene(CURRENT_LOCATION,false);
	importModel("resources/models/ship/roundedship","spaceship",stars[CURRENT_LOCATION].radius*3,25,stars[CURRENT_LOCATION].radius*-3);     
	
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
                        chigh = [0.925, 0.66, 0.25];
                        cmid = [0.875, 0.255, 0.25];
                        clow = [0.3, 0.095, 0.125];
                        
                        thigh = 0.925;
                        tmid =  0.4;
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

/*function smoothNoise(pixelArray,useArray,octaveOn,edgesize) {
        
        var period = Math.pow(2,octaveOn);
        var freq = 1/period;
        
        for (var x = 0; x < edgesize; x+= edgesize / (octaveOn+1)) {
                var horiz1 = Math.floor((Math.floor(x)/period)*period);
                var horiz2 = Math.floor(((horiz1 + period))%edgesize);
                var horizcombined = (x-horiz1)*freq;
                
                for (var y = 0; y < edgesize; y+=edgesize / (octaveOn+1)) {
                        var vert1 = Math.floor((Math.floor(y)/period)*period);
                        var        vert2 = Math.floor(((vert1 + period))%edgesize);
                        var vertcombined = (y-vert1)*freq;
                                                
                        var top = cosInt(pixelArray[horiz1][vert1],pixelArray[horiz2][vert1],horizcombined);
                        
                        var bottom = cosInt(pixelArray[horiz1][vert2],pixelArray[horiz2][vert2],horizcombined);
                        
						for (var tx = 0; tx < edgesize / (octaveOn+1); tx++) {
							console.log(tx);
							for (var ty = 0; ty < edgesize / (octaveOn+1); ty++) {
								useArray[(tx+x)%edgesize][(ty+y)%edgesize] = cosInt(top,bottom,vertcombined);
							}
						}
                        
                }
        }        
}*/

function quickSmooth(pixels,smooth,octaveOn,edgesize) {
	
	var jump = Math.floor(edgesize/(octaveOn+1));
	
	for (var x = 0; x < edgesize; x=x+jump) {
		for (var y = 0; y < edgesize; y=y+jump) {
		
			var value = 0;
			
			for (var a = 0; a < jump; a++) {
				for (var b = 0; b < jump; b++) {
					value += pixels[(x+a)%edgesize][(y+b)%edgesize];
				}
			}
			value /= jump*jump;
			for (var a = 0; a < jump; a++) {
				for (var b = 0; b < jump; b++) {
					smooth[(x+a)%edgesize][(y+b)%edgesize] = value;
				}
			}
		}
	}
}

function perlinNoise(seed,octaves,persistence,edgesize,sunhax,typeInfo) {

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
                quickSmooth(pixel,smooth,octave,edgesize);
                for (var x=0; x < edgesize; x++) {
                        for (var y = 0; y < edgesize; y++) {
                                if (sunhax)
                                        pixel[x][y] += cosInt(smooth[x][y],0.333,0.5);
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
                
                                
        var pixel = perlinNoise(planetSeed,typeInfo.octaves,typeInfo.persistence,edgesize,false,typeInfo);

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
                
                                
        var pixel = perlinNoise(planetSeed,typeInfo.octaves,typeInfo.persistence,edgesize,true,typeInfo);

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
