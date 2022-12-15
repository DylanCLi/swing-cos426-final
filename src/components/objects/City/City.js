import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import BUILDING_MODEL from './building/scene.gltf';
require('./building/scene.bin');
require('./building/textures/lambert1_baseColor.jpeg');
require('./building/textures/lambert1_emissive.jpeg');
require('./building/textures/lambert1_metallicRoughness.png');
require('./building/textures/lambert1_normal.png');

import CLOCK_MODEL from './bigben/scene.gltf';
require('./bigben/scene.bin');
require('./bigben/textures/Material_51_baseColor.png');
require('./bigben/textures/Material_52_baseColor.png');

import LIGHT_MODEL from './streetlight/scene.gltf';
require('./streetlight/scene.bin');

import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Box3 } from "three";

var building;
var pavement;
var streetlight;
//var clockTower;
const loader = new GLTFLoader();
const light1 = new THREE.PointLight(0xf3d265, 2, 60, 8);
const light2 = new THREE.PointLight(0xf3d265, 2, 60, 8);

class City extends THREE.Group {
    constructor(parent) {
        super();

        this.isLoaded = false;

        this.START = global.params.padding;
        this.END = global.params.citySize - global.params.padding - 1;
        this.MIDDLE = (global.params.citySize - 1) / 2;
        this.WIDTH = global.params.buildingWidth;
        this.data = new Array(global.params.citySize);
        this.parent = parent;

        this.buildingMeshWidth;
        this.buildingMeshHeight;
        this.pavementMeshWidth;
        this.clockMeshWidth;
        this.clockMeshHeight;
        this.lightMeshHeight;

        this.lightIndex = {i: this.MIDDLE, j: this.START};
        
        this.loadObjects();
        light1.position.set(0, -global.params.initHeight - 5, 0);
        light2.position.set(0, -global.params.initHeight - 5, 0);
        this.add(light1);
        this.add(light2);
    }

    loadObjects() {
        this.loadClock();
        this.loadBuilding();
    }

    loadBuilding() {
        loader.load(BUILDING_MODEL, (gltf) => {
            building = gltf.scene;
            const box = new THREE.Box3().setFromObject(building);
            this.buildingMeshWidth = box.max.x - box.min.x;
            this.buildingMeshHeight = box.max.y - box.min.y;
            this.loadLight();
        });
    }

    loadLight() {
        loader.load(LIGHT_MODEL, (gltf) => {
            streetlight = gltf.scene;
            const box = new THREE.Box3().setFromObject(streetlight);
            this.lightMeshHeight = box.max.y - box.min.y;
            this.init();
        });
    }

    loadClock() {
        loader.load(CLOCK_MODEL, (gltf) => {
            const clockTower = gltf.scene;
            const box = new THREE.Box3().setFromObject(clockTower);
            this.clockMeshWidth = box.max.x - box.min.x;
            this.clockMeshHeight = box.max.y - box.min.y;

            const coords = this.indexToCoords(this.MIDDLE, this.END);
            const scale = this.WIDTH / this.clockMeshWidth;
            clockTower.scale.set(scale, scale, scale);
                                //global.params.objHeight[global.params.numDefaultTypes] / this.clockMeshHeight,
                                //this.WIDTH / this.clockMeshWidth);
            const box2 = new THREE.Box3().setFromObject(clockTower);
            const center = box2.getCenter(new THREE.Vector3());
            clockTower.position.set(coords.x - center.x, 
                -global.params.initHeight - box2.min.y,//+ global.params.objHeight[global.params.numDefaultTypes] / 2, 
                coords.z - center.z);
            
            this.add(clockTower);
        });
    }

    init() {
        // populate city data
        const BUILD_PROB_CENTER = global.params.buildProbCenter;
        const BUILD_PROB_1 = global.params.buildProb1;
        const BUILD_PROB_2 = global.params.buildProb2;
        const BUILD_PROB_3 = global.params.buildProb3;
        const PROB_SLOPE = (global.params.buildProbEdge - global.params.buildProbCenter) / ((this.data.length - 1) / 2);
        for (var i = 0; i < this.data.length; i++) {
            const a = new Array(global.params.citySize);
            const PROB_OFFSET = Math.abs(i - this.MIDDLE) * PROB_SLOPE;
            for (var j = 0; j < a.length; j++) {
                // start
                if (i == this.MIDDLE && j == this.START) {
                    a[j] = 0;
                } 
                
                // end
                else if (i == this.MIDDLE && j == this.END) {
                    a[j] = global.params.numDefaultTypes;
                } 
                
                // near start or end
                else if (Math.abs(i - this.MIDDLE) <= 3  && (Math.abs(j - this.START) <= 3 || Math.abs(j - this.END) <= 3)) {
                    a[j] = global.params.numBuildTypes;
                } 

                // middle lane blocker
                else if (i == this.MIDDLE && j == this.MIDDLE) a[j] = 3;
                
                // normal building / pavement streetlight
                else {
                    const p = Math.random();
                    if (p < (BUILD_PROB_CENTER + PROB_OFFSET) * BUILD_PROB_1) a[j] = 1; // default 1
                    else if (p < (BUILD_PROB_CENTER + PROB_OFFSET) * BUILD_PROB_2) a[j] = 2; //default 2
                    else if (p < (BUILD_PROB_CENTER + PROB_OFFSET) * BUILD_PROB_3) a[j] = 3;
                    else a[j] = global.params.numBuildTypes; // streetlight
                }
            }
            this.data[i] = a;
        }

        // create meshes
        const lo = Math.max(this.START /*- global.params.visRange*/, 0);
        const hi = Math.min(this.START /*+ global.params.visRange*/, this.data.length - 1);
        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < this.data.length; j++) {
                const coords = this.indexToCoords(i, j);
                // default building square
                if (this.data[i][j] > 0 && this.data[i][j] < global.params.numDefaultTypes) {
                    const b = new SkeletonUtils.clone(building);
                    b.scale.set(this.WIDTH / this.buildingMeshWidth, 
                                global.params.objHeight[this.data[i][j]] / this.buildingMeshHeight,
                                this.WIDTH / this.buildingMeshWidth);
                    b.position.set(coords.x, -global.params.initHeight, coords.z);
                    this.add(b);
                } 
                // street light square
                else if (this.data[i][j] != 0) {
                    const sl = new SkeletonUtils.clone(streetlight);
                    sl.scale.set(1, global.params.objHeight[this.data[i][j]] / this.lightMeshHeight, 1);
                    sl.position.set(coords.x, -global.params.initHeight, coords.z);
                    this.add(sl);
                }
            }
        }

        this.isLoaded = true;
        this.parent.addToUpdateList(this);
    }

    indexToCoords(i, j) {
        if (!this.inBounds(i, j)) return null;
        return {
            x: (i - this.MIDDLE) * this.WIDTH,
            z: (j - this.START) * this.WIDTH,
        }
    }

    coordsToIndex(x, z) {
        if (!this.isLoaded) return null;
        const i = Math.round(x / this.WIDTH + this.MIDDLE);
        const j = Math.round(z / this.WIDTH + this.START);
        if (!this.inBounds(i, j)) return null;
        return {
            i: i,
            j: j,
        }
    }

    boundingBoxAt(i, j) {
        if (!this.isLoaded) return null;
        if (this.inBounds(i, j) && this.data[i][j] == global.params.numBuildTypes) return null;

        const height = global.params.objHeight[this.data[i][j]];
        const bbox = new Box3()
        bbox.min.set((i - this.MIDDLE - 0.5) * this.WIDTH, 0, (j - this.START - 0.5) * this.WIDTH);
        bbox.max.set((i - this.MIDDLE + 0.5) * this.WIDTH, height, (j - this.START + 0.5) * this.WIDTH);
        return bbox;
    }

    inBounds(i, j) {
        if (i < 0 || j < 0 || i >= this.data.length || j >= this.data.length) return false;
        else return true;
    }

    update(state) {
        if (!this.isLoaded) return null;
        this.position.add(state.offset);
        const index = this.coordsToIndex(state.displacement.x, state.displacement.z);
        if (index == null) return;
        if (this.lightIndex.i != index.i || this.lightIndex.j != index.j) {
            const coords = this.indexToCoords(index.i, index.j);
            if (coords == null) return null;
            light1.position.set(coords.x + 0.3, 
                global.params.objHeight[global.params.numBuildTypes] - 0.5 - global.params.initHeight,
                coords.z + 0.3);
            light2.position.set(coords.x - 0.3, 
                global.params.objHeight[global.params.numBuildTypes] - 0.5 - global.params.initHeight,
                coords.z - 0.3);
            this.lightIndex = index;            
        }
    }
}

export default City