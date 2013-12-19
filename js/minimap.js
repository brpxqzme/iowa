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

// expects global mouse {x, y} filled normalized to SCREEN, not minimap
function minimapClicked () {
    return; // stub
}
