import * as THREE from 'three'

/* Modified from params.js in Assignment 5 */ 
class Params {

    // Variables for simulation state; can be interactively changed in GUI
    // These are their default values:
    constructor() {
        this.scene;
        // ====================================================================
        //                     Physical Constants
        // ====================================================================
        // Damping coefficient for integration
        this.DAMPING = 0.0;
    
        // Mass of hero
        this.MASS = 0.1;
    
        // Acceleration due to gravity, scaled up experimentally for effect.
        this.GRAVITY = 8.0;

        // Release strength
        this.STRENGTH = 15.0;
    
        // The timestep (or deltaT used in integration of the equations of motion)
        this.TIMESTEP = 30 / 1000;
    
        // Similar to coefficient of friction
        // 0 = frictionless, 1 = objects sticks in place
        this.friction = 0.9;

        this.EPS = 0.000001;
    
        // ====================================================================
        //                      Physical Setup
        // ====================================================================
        // initial height of land
        this.initHeight = 80;
        
        // length of web
        this.webLength = 20;

        // angle to rotate to web shoot left or right
        this.leftRotate = Math.PI / 6;
        this.rightRotate = -Math.PI / 6;

        // rise over run of initial web shot
        this.tanPhi = 3/4;

        // ====================================================================
        //                 Rendering properties of the scene
        // ====================================================================
        // distance of camera behind hero
        this.cameraOffset = 20;

        // max rotation of camera per frame
        this.maxAngleOffset = Math.PI / 150;
        
        // colors
        this.buildingColor = 0x4066e0;
        this.landColor = 0x050505;
        this.ambientColor = 0x191970;
        this.heroColor = 0xff4f58;
        this.skyColor = 0xe000053;
        this.webColor = 0xFFFFFF;

        // ====================================================================
        //                          City Setup 
        // ====================================================================
        // dimensions of city grid (must be odd)
        this.citySize = 51;
        
        // number of types of buildings
        this.numDefaultTypes = 4;
        this.numBuildTypes = 5;

        // dimensions
        this.buildingWidth = 20;
        this.objHeight = [ 0, 50, 60, 70, this.initHeight, 10 ];
        
        // probability of building on a city grid
        this.buildProbCenter = 0.1;

        this.buildProbEdge = 0.1;

        // probability of building being of type _
        this.buildCondProb = [ 0.2, 0.2, 0.6 ];
        this.buildProb1 = this.buildCondProb[0];
        this.buildProb2 = this.buildProb1 + this.buildCondProb[1];
        this.buildProb3 = this.buildProb2 + this.buildCondProb[2];

        // padding around destination and start
        this.padding = 3;

        // number of grids away to render
        this.visRange = 25;

        // ====================================================================
        //                          Hero Dimensions
        // ====================================================================   
        this.HEIGHT = 1;
    }
  }

  global.params = new Params();
  export var SceneParams = new Params();

  