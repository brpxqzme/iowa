// Renders the scene and updates the render as needed.*


function processEvents() {

        //Choose planet destination via numbers (not numpad).
        if (keyboard[49] && goalObject != "planet0") {
                goalObject = "planet0";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet0"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[50] && goalObject != "planet1") {
                goalObject = "planet1";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet1"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[51] && goalObject != "planet2") {
                if (!(scenePlanets["planet2"] !== undefined)) { return; }
                goalObject = "planet2";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet2"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[52] && goalObject != "planet3") {
                if (!(scenePlanets["planet3"] !== undefined)) { return; }
                goalObject = "planet3";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet3"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[53] && goalObject != "planet4") {
                if (!(scenePlanets["planet4"] !== undefined)) { return; }
                goalObject = "planet4";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet4"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[54] && goalObject != "planet5") {
                if (!(scenePlanets["planet5"] !== undefined)) { return; }
                goalObject = "planet5";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet5"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[45] && goalObject != "planet6") {
                if (!(scenePlanets["planet6"] !== undefined)) { return; }
                goalObject = "planet6";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet6"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        if (keyboard[46] && goalObject != "planet7") {
                if (!(scenePlanets["planet7"] !== undefined)) { return; }
                goalObject = "planet7";
                                travelling=true;  
        notify("Heading for "+scenePlanets["planet7"].name+", "+stars[CURRENT_LOCATION].name+" system.");
        }
        
        //Start travelling.
        if (keyboard[65]) {
			if (orbiting[0] === goalObject) { return; }
                travelling=true;        
                console.log("Starting journey.");
        }
        //Stop Travelling
        if (keyboard[83]) {
			if (!travelling) return;
                travelling=false;
                console.log("Stopping journey.");
        }
                
                 //Camera overhead view toggle ON
        if (keyboard[79]) {
                camToggle=true;        
        }
        //Camera overhead view toggle OFF
        if (keyboard[80]) {
                camToggle=false;
        }
}

function animate() {
        
        if (changed || loads.indexOf(false) != -1) {
                populate();
                changed = false;
        }
        
        processEvents();
        solve();
        
        requestAnimationFrame(animate);

    // some people have HiDPI displays. WE LIVE IN THE FUTURE
    var pixelaspect = window.devicePixelRatio;
    if (typeof pixelaspect === "undefined") pixelaspect = 1;
    var PIXELS_WIDTH = window.innerWidth * pixelaspect,
        PIXELS_HEIGHT = window.innerHeight * pixelaspect,
        MAIN_WIDTH = Math.floor(5/6 * PIXELS_WIDTH),
        TEXT_WIDTH = PIXELS_WIDTH - MAIN_WIDTH;
        TEXT_HEIGHT = Math.floor(PIXELS_HEIGHT * 0.5);

        // Main scene renderer.
    renderer.setViewport(0, 0, MAIN_WIDTH, PIXELS_HEIGHT);
    renderer.render(scene, camera);

    // Minimap
    renderer.setViewport(MAIN_WIDTH + 1, 0, TEXT_WIDTH, TEXT_WIDTH);
    renderer.render(mapscn, mapcam);

    // Viewport behind text div (just in case it's needed).
    //renderer.setViewport(MAIN_WIDTH + 1, TEXT_HEIGHT+1,
    //                     TEXT_WIDTH, PIXELS_HEIGHT - TEXT_HEIGHT);
        //controls.update();
}
