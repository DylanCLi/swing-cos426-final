import * as THREE from 'three'

/* Modified from params.js in Assignment 5 */ 
class Params {

    // Variables for simulation state; can be interactively changed in GUI
    // These are their default values:
    constructor() {
        // ====================================================================
        //                     Physical Constants
        // ====================================================================
        // Damping coefficient for integration
        this.DAMPING = 0.0;
    
        // Mass of hero
        this.MASS = 0.1;
    
        // Acceleration due to gravity, scaled up experimentally for effect.
        this.GRAVITY = 9.8;

        // Release strength
        this.STRENGTH = 15.0;
    
        // The timestep (or deltaT used in integration of the equations of motion)
        this.TIMESTEP = 18 / 1000;
    
        // Similar to coefficient of friction
        // 0 = frictionless, 1 = objects sticks in place
        this.friction = 0.9;

        this.EPS = 0.000001;
    
        // ====================================================================
        //                      Physical Setup
        // ====================================================================
        // initial height of land
        this.initHeight = 70;
        
        // length of web
        this.webLength = 20;

        // angle to rotate to web shoot left or right
        this.leftRotate = Math.PI / 6;
        this.rightRotate = -Math.PI / 6;

        // rise over run of initial web shot
        this.tanPhi = 3/4;

        // ====================================================================
        //              Rendering properties of the scene
        // ====================================================================
        // distance of camera behind hero
        this.cameraOffset = 40;

        // max rotation of camera per frame
        this.maxAngleOffset = Math.PI / 200;
        
        // colors
        this.buildingColor = 0x4066e0;
        this.landColor = 0x000000;
        this.heroColor = 0xff4f58;
        this.skyColor = 0xe000053;
        this.webColor = 0xFFFFFF;

        // ====================================================================
        //                      City Setup 
        // ====================================================================
        // number of types of buildings
        this.numTypes = 4;

        // dimensions
        this.buildingWidth = 15;
        this.buildingHeight = [ this.initHeight, this.initHeight, 30, 50 ];
        
        // probability of building on a city grid
        this.buildProb = 0.2;

        // probability of building being of type _
        this.buildCondProb = [ 0.5, 0.5 ];
        this.buildProb1 = this.buildProb * this.buildCondProb[0];

        // dimensions of city grid
        this.citySize = 51;

        // padding around destination and start
        this.padding = 3;

        // number of grids away to render
        this.visRange = 25;

        // ====================================================================
        //                 Geometries and Materials
        // ====================================================================
        this.buildingGeo = [
            new THREE.BoxGeometry(this.buildingWidth, this.buildingHeight[0], this.buildingWidth),
            new THREE.BoxGeometry(this.buildingWidth, this.buildingHeight[1], this.buildingWidth),
            new THREE.BoxGeometry(this.buildingWidth, this.buildingHeight[2], this.buildingWidth),
            new THREE.BoxGeometry(this.buildingWidth, this.buildingHeight[3], this.buildingWidth)
        ];
        this.buildingMat = new THREE.MeshPhongMaterial();
        this.buildingMat.transparent = true;
    }
  
    // (Re)define all the properties that are derived from others
    // To be called on page reload, after URL params are read in.
    update() {
      this.export();
    }
  
    export() {
      /*
      for (let key in this) {
         window[key] = this[key];
      }
      */
    }
  }
  global.params = new Params();
  // var DefaultParams = new Params();
  export var SceneParams = new Params();
  
  /*
  Params.restoreDefaults = function() {
    for (let k of Object.keys(DefaultParams)) {
      this[k] = DefaultParams[k];
    }
    Params.storeToURL();
    Scene.update();
    Sim.update();
  }
  
  // https://html-online.com/articles/get-url-parameters-javascript/
  Params.getURLParams = function() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }
  
  // gets rid of the ".0000000001" etc when stringifying floats
  // from http://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
  Params.stripFloatError = function(number) {
    if (number && number.toPrecision) {
      return parseFloat(number.toPrecision(12));
    } else {
      return number;
    }
  }
  
  // Find any changes to the URL, and apply those changes to SceneParams
  Params.loadFromURL = function() {
    let params = Params.getURLParams();
    for (let key in params) {
      let v = params[key];
      let defaultType = typeof(DefaultParams[key]);
      if (defaultType == "number") {
        v = Number(v);
      } else if (defaultType == "boolean") {
        v = (v == "true");
      }
      SceneParams[key] = v;
    }
  }
  
  // URL encode the keys and values in the dictionary
  https://stackoverflow.com/questions/7045065/how-do-i-turn-a-javascript-dictionary-into-an-encoded-url-string
  Params.urlEncode = function(params) {
    for (let k in params) {
      let v = params[k];
      if (typeof(v) === "number") params[k] = Params.stripFloatError(v);
    }
  
    let data = Object.entries(params);
    // encode every parameter (unpack list into 2 variables)
    data = data.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    // combine into string
    let query = data.join('&');
    return `?${query}`;
  }
  
  // Find any changes to SceneParams, and apply those changes to the URL.
  Params.storeToURL = function() {
    let params = {};
  
    // Find all non-default scene parameters
    for (let key in SceneParams) {
      // Don't try to put functions in the url
      if (typeof(SceneParams[key]) == "function") continue;
  
      // Don't put derived types in the url
      if (key === "xSegs" || key == "ySegs") continue;
  
      // Put all other types into the url
      if (SceneParams[key] !== DefaultParams[key]) {
        params[key] = SceneParams[key];
      }
    }
  
    // Change the URL.
    window.history.pushState("", "", Params.urlEncode(params));
  }
  
  // Set all color parameters to ints, converting from hex strings if needed
  Params.repairColors = function() {
    for (let def of GuiConfig.defs) {
      if (def.type !== "color") {
        continue;
      }
  
      let param = def.param;
      let v = SceneParams[param];
      if (typeof(v) == typeof("")) {
        v = v.replace("#", "0x");
        SceneParams[param] = parseInt(v);
      }
    }
  }*/
  