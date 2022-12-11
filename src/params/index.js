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

      // Moment of intertia of hero
      this.MOMENT = this.MASS * this.webLength * this.webLength;
  
      // Acceleration due to gravity, scaled up experimentally for effect.
      this.GRAVITY = 9.8;
  
      // The timestep (or deltaT used in integration of the equations of motion)
      // Smaller values result in a more stable simulation, but becomes slower.
      // This value was found experimentally to work well in this simulation.
      this.TIMESTEP = 18 / 1000;
  
      // Similar to coefficient of friction
      // 0 = frictionless, 1 = objects sticks in place
      this.friction = 0.9;
  
      // ====================================================================
      //              Physical Setup
      // ====================================================================
      this.landY = -20;
      this.buildingHeight = 30;
      
      this.webLength = 10;

      this.leftRotate = Math.PI / 4;
      this.leftPivot = new THREE.Vector3(3, 5, 5);
      this.leftPivot.normalize().multiplyScalar(10);

      this.forwardPivot = new THREE.Vector3(0, 5, 6);
      this.forwardPivot.normalize().multiplyScalar(10);

      this.rightRotate = -Math.PI / 4;
      this.rightPivot = new THREE.Vector3(-3, 5, 5);
      this.rightPivot.normalize().multiplyScalar(10);

      // ====================================================================
      //              Rendering properties of the scene
      // ====================================================================
      this.cameraOffset = 40;
      
      this.buildingColor = 0x4066e0;
      this.landColor = 0xD3D3D3;
      this.heroColor = 0xff4f58;
      this.skyColor = 0xe0d6ff;
      this.webColor = 0x000000;

      // ====================================================================
      //                 Geometries and Materials
      // ====================================================================
      this.buildingGeo = new THREE.BoxGeometry(5, this.buildingHeight, 5);
      this.buildingMat = new THREE.MeshPhongMaterial();
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
  