// Map camera, map scene
var mapcam, mapscn;
// Star particle geometry
var stars_system;

function makeMap () {
    mapscn = new THREE.Scene();
    mapcam = new THREE.OrthographicCamera(-50000, 50000,
                                          -50000, 50000,
                                          -6000, 6000);
    var stars_geometry = new THREE.Geometry();
    for (var i in stars)
        stars_geometry.vertices.push(new THREE.Vector3(stars[i].x,
                                                       stars[i].y,
                                                       stars[i].z));
    var stars_partmat = new THREE.ParticleBasicMaterial({ color: 0xffffff,
                                                          size: 1 });
    var stars_system = new THREE.ParticleSystem(stars_geometry,
                                                stars_partmat);
    mapscn.add(stars_system);
    mapscn.add(mapcam);
}

// expects SCREEN coordinates
function minimapClicked (x, y) {
    var mapdim = window.innerWidth/6,
        maptop = window.innerHeight - mapdim,
        mapleft = window.innerWidth - mapdim,
        mx = ((x - mapleft)/mapdim)*2.0-1,
        my = -((y - maptop)/mapdim)*2.0+1,
        gx = mx*50000, // galactic coordinates clicked
        gy = my*50000,
        i, dist,
        mindist2 = 10000000000,
        closeid;
    for (i in stars) {
        dist2 = (stars[i].x-gx)*(stars[i].x-gx) +
                (stars[i].y-gy)*(stars[i].y-gy);
        if (dist2 < mindist2) {
            mindist2 = dist2;
            closeid = i;
        }
    }
    // switch to system nearest to mouse click
    switchSystem(i);
    return;
}
