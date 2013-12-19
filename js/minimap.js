// Map camera, map scene
var mapcam, mapscn;
// Star particle geometry
var stars_system;
// particle highlighting current location
var map_highlight;

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
    stars_system = new THREE.ParticleSystem(stars_geometry,
                                            stars_partmat);
    var hi_geo = new THREE.Geometry();
    hi_geo.vertices.push(new THREE.Vector3(stars[CURRENT_LOCATION].x,
                                           stars[CURRENT_LOCATION].y,
                                           5999));
    var hi_partmat = new THREE.ParticleBasicMaterial({ color: 0xaa0000,
                                                       size: 300 });
    map_highlight = new THREE.ParticleSystem(hi_geo, hi_partmat);
    mapscn.add(map_highlight);
    mapscn.add(stars_system);
    mapscn.add(mapcam);
}

// expects SCREEN coordinates
function minimapClicked (x, y) {
    var mapdim = window.innerWidth/6,
        maptop = window.innerHeight - mapdim,
        mapleft = window.innerWidth - mapdim,
        mx = ((x - mapleft)/mapdim)*2.0-1, // map coordinates clicked
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
    map_highlight.geometry.vertices[0].x = stars[i].x;
    map_highlight.geometry.vertices[0].y = stars[i].y;
    map_highlight.geometry.verticesNeedUpdate = true;
    // switch to system nearest to mouse click
    switchSystem(i);
    return;
}
