// Solar system data generation
// When I say ID, I mean some kind of int GUID. Not a normal 128-bit GUID so
// much, just a unique int within this game.
// Note that the named arrays are there to be nice (and maybe cache-coherent
// on some level). They could just as easily all gone in one array.
// Also note that these can only be treated as sparse, associative hashes;
// DO NOT attempt to use .length on these in any meaningful way!
var ids = []; // IDs in use (key: ID, value: array)
var stars = []; // star systems by id
                // at present, just the ones we need, but in the end,
                // should contain all the visitable (and/or visible?) ones
var planets = []; // planets cache by id
//var gates = []; // warp gates cache by id

// JS nullity testing
function exists (arg) {
    return typeof arg !== "undefined" && arg !== null;
}

// pass it the ID, the array its data is stored in, and the object to store
function addid (id, store, object) {
    // there is a potential of ID conflict but at this point it's not
    // worth worrying about. Anyway, here's how we "handle" the problem:
    if (exists(ids[id])) {
        delid(id); // hope it's not your star or anything!
        console.log("WARNING: reused ID " + id);
    }
    ids[id] = store;
    store[id] = object;
}

// generically access data by ID
function getbyid (id) {
    if (exists(ids[id]))
        return ids[id][id];
    // else implicitly undefined
}

// remove object from cache
// obviously, the garbage collector will have no idea to delete things like
// abandoned planets and the like, but that's not our present concern
function delid (id) {
    delete ids[id][id];
    delete ids[id];
}

// sample solar system
function makeOnlyOneSystem () {
    var rng = Prng(2); // bad seed, but let's see what we are doing at least
    return genSystem(rng);
}

function makeManySystems (n) {
    var rng = Prng(44); // this seed is arbitrary
    if (!exists(n)) n = 10000;
    for (var i = 0; i < n-1; ++i)
        genSystem(rng);
    // leave one for questioning
    var id = genSystem(rng);

    // TODO: assign places in galaxy to make pretty

    return id;
}

// solar system creator
function genSystem (rng) {
    var id = rng.randInt();
    addid(id, stars, makeStar(id, rng));
    return id;
}

// make a star system using the supplied RNG
function makeStar (id, rng) {
    if (exists(getbyid(id))) return; // ayyy, it's already cached
    // randomish (bright) color of star
    var color = new THREE.Color();
    color.setRGB(0.8 + rng.randFlt()*0.2, 0.9, 0.8 + rng.randFlt()*0.2);
    // based on size of sun in km + wild guess at attractive stdev.
    //var radius = rng.randGauss(700000, 50000);
	var radius = rng.randGauss(2000, 142);

    var name = getName(id);

    // generate planets
    var planetids = [];
	var nplanets = rng.randInt()%5+2;
    var outerorbit = radius*2;
    for (var i = 0; i < nplanets; ++i) {
        // generate id and planet
        var pid = rng.randInt();
        planetids.push(pid);
        addid(pid, planets, makePlanet(pid, rng));
        // put its orbit further out to prevent awkward collisions
        var oldorbit = planets[pid].orbit;
        planets[pid].orbit += outerorbit;
        outerorbit += oldorbit;
        // make it so we can find the star from the planet, too
        planets[pid].star = id;
    }

    return { name: name,
             color: color,
             radius: radius,
             planets: planetids };
}

function makePlanet (id, rng) {
    var name = getName(id);
    // ugly rainbow eyeball-stab planets for now?
    var color = new THREE.Color();
    color.setRGB(rng.randFlt(), rng.randFlt(), 0.8 + rng.randFlt()*0.2);
    // well, an earthlike planet at least
    //var radius = rng.randGauss(6371, 600);
	var radius = rng.randGauss(200, 20);
    // compressed space... probably needs adjustment for aesthetics
    //var orbit = rng.randGauss(300000, 10000);
	 var orbit = rng.randGauss(4250, 145);
    // add orientation (in revolution) and speed of revolution as desired
	
	var startingPosition = rng.randFlt();
	var position = new THREE.Vector3(Math.sin(startingPosition),0,Math.cos(startingPosition));
    var orientation = null;
    var revspeed = null;
    return { name: name,
             color: color,
             radius: radius,
             orbit: orbit,
             orientation: orientation,
             revspeed: revspeed,
			 position: position };
}
