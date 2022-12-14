import Building from "../Building/Building";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import BUILDING_MODEL from './building/scene.gltf';
require('./building/scene.bin');
require('./building/textures/lambert1_baseColor.jpeg');
require('./building/textures/lambert1_emissive.jpeg');
require('./building/textures/lambert1_metallicRoughness.png');
require('./building/textures/lambert1_normal.png');

import PAVEMENT_MODEL from './pavement/scene.gltf';
require('./pavement/scene.bin');
require('./pavement/textures/zamkova_dlazba_DiffuseMap_baseColor.jpeg');
require('./pavement/textures/zamkova_dlazba_DiffuseMap_metallicRoughness.png');
require('./pavement/textures/zamkova_dlazba_DiffuseMap_normal.jpeg');

import CLOCK_MODEL from './bigben/scene.gltf';
require('./bigben/scene.bin');
require('./bigben/textures/Material_51_baseColor.png');
require('./bigben/textures/Material_52_baseColor.png');

// import CLOCK_MODEL from './clock_tower_big_ben/scene.gltf';
// require('./clock_tower_big_ben/scene.bin');
// require('./clock_tower_big_ben/textures/Standard_13_baseColor.jpeg');

// import CLOCK_MODEL from './big_ben/scene.gltf';
// require('./big_ben/scene.bin');
// require('./big_ben/textures/Material.007_baseColor.png');
// require('./big_ben/textures/Material.013_baseColor.png');
// require('./big_ben/textures/Material.014_baseColor.png');
// require('./big_ben/textures/Material.015_baseColor.png');
// require('./big_ben/textures/Material.016_baseColor.png');
// require('./big_ben/textures/PRINCIPAL_baseColor.png');
// require('./big_ben/textures/PRINCIPAL.001_baseColor.png');

// import CLOCK_MODEL from './clocktower/scene.gltf';
// require('./clocktower/scene.bin');
// require('./clocktower/textures/bottom_diffuse.png');
// require('./clocktower/textures/bottom_normal.png');
// require('./clocktower/textures/brick_orange_diffuse.png');
// require('./clocktower/textures/brick_orange_middle_diffuse.png');
// require('./clocktower/textures/brick_orange_middle_normal.png');
// require('./clocktower/textures/brick_orange_normal.png');
// require('./clocktower/textures/material_diffuse.png');
// require('./clocktower/textures/material_normal.png');

import LIGHT_MODEL from './streetlight/scene.gltf';
require('./streetlight/scene.bin');

import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Box3, Vector3 } from "three";

var building;
var pavement;
var streetlight;
//var clockTower;
const loader = new GLTFLoader();
const light1 = new THREE.PointLight(0xfceea7, 5, 20, 10);
const light2 = new THREE.PointLight(0xfceea7, 5, 20, 10);

class City extends THREE.Group {
    constructor(parent) {
        super();

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
        
        this.loadClock();
        this.loadBuilding();
        light1.position.set(0, -global.params.initHeight - 5, 0);
        light2.position.set(0, -global.params.initHeight - 5, 0);
        this.add(light1);
        this.add(light2);
    }

    loadBuilding() {
        loader.load(BUILDING_MODEL, (gltf) => {
            building = gltf.scene;
            const box = new THREE.Box3().setFromObject(building);
            this.buildingMeshWidth = box.max.x - box.min.x;
            this.buildingMeshHeight = box.max.y - box.min.y;
            this.loadPavement();
        });
    }

    loadPavement() {
        loader.load(PAVEMENT_MODEL, (gltf) => {
            pavement = gltf.scene;
            const box = new THREE.Box3().setFromObject(pavement);
            this.pavementMeshWidth = box.max.x - box.min.x;
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
        const BUILD_PROB_0 = global.params.buildCondProb[0] * global.params.buildProb;
            const BUILD_PROB_1 = global.params.buildProb;
        for (var i = 0; i < this.data.length; i++) {
            const a = new Array(global.params.citySize);
            for (var j = 0; j < a.length; j++) {
                if (i == this.MIDDLE && j == this.START) {
                    a[j] = global.params.numBuildTypes;
                } else if (i == this.MIDDLE && j == this.END) {
                    a[j] = global.params.numDefaultTypes;
                } else if (Math.abs(i - this.MIDDLE) <= 2  && (Math.abs(j - this.START) <= 2 || Math.abs(j - this.END) <= 2)) {
                    a[j] = global.params.numBuildTypes;
                } else {
                    const p = Math.random();
                    if (p < BUILD_PROB_0) a[j] = 1;
                    else if (p < BUILD_PROB_1) a[j] = 2;
                    else a[j] = global.params.numBuildTypes;
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
                // starting square
                if (this.data[i][j] == 0) {
                    light.position.set(coords.x, -global.params.initHeight, coords.z);
                    this.add(light);
                }
                // default building square
                if (this.data[i][j] >= 0 && this.data[i][j] < global.params.numDefaultTypes) {
                    const b = new SkeletonUtils.clone(building);
                    b.scale.set(this.WIDTH / this.buildingMeshWidth, 
                                global.params.objHeight[this.data[i][j]] / this.buildingMeshHeight,
                                this.WIDTH / this.buildingMeshWidth);
                    b.position.set(coords.x, -global.params.initHeight, coords.z);
                    this.add(b);
                } 
                // clock tower square
                else if (this.data[i][j] == global.params.numDefaultTypes) {
                    const p = new SkeletonUtils.clone(pavement);
                    p.scale.set(this.WIDTH / this.pavementMeshWidth, 1, this.WIDTH / this.pavementMeshWidth);
                    p.position.set(coords.x, -global.params.initHeight, coords.z);
                    this.add(p);
                }

                // street light square
                else {
                    //if (Math.abs(i - this.MIDDLE) <= 1  && (Math.abs(j - this.START) <= 1 || Math.abs(j - this.END) <= 1)) {                    
                        const sl = new SkeletonUtils.clone(streetlight);
                        sl.scale.set(1, global.params.objHeight[this.data[i][j]] / this.lightMeshHeight, 1);
                        sl.position.set(coords.x, -global.params.initHeight, coords.z);
                        this.add(sl);
                    //}

                    const p = new SkeletonUtils.clone(pavement);
                    p.scale.set(this.WIDTH / this.pavementMeshWidth, 1, this.WIDTH / this.pavementMeshWidth);
                    p.position.set(coords.x, -global.params.initHeight, coords.z);
                    this.add(p);
                }
            }
        }

        this.parent.state.started = true;
        this.parent.addToUpdateList(this);
    }

    indexToName(i, j) {
        return String(i) + "_" + String(j);
    }

    indexToCoords(i, j) {
        return {
            x: (i - this.MIDDLE) * this.WIDTH,
            z: (j - this.START) * this.WIDTH,
        }
    }

    coordsToIndex(x, z) {
        const i = Math.round(x / this.WIDTH + this.MIDDLE);
        const j = Math.round(z / this.WIDTH + this.START);
        if (i < 0 || i >= this.data.length || j < 0 || j >= this.data[i].length) return null;
        return {
            i: i,
            j: j,
        }
    }

    boundingBoxAt(i, j) {
        const height = (this.data[i][j] >= 0 && this.data[i][j] < global.params.numBuildTypes) ?
                        global.params.objHeight[this.data[i][j]] :
                        0;
        const bbox = new Box3()
        bbox.min.set((i - this.MIDDLE - 0.5) * this.WIDTH, 0, (j - this.START - 0.5) * this.WIDTH);
        bbox.max.set((i - this.MIDDLE + 0.5) * this.WIDTH, height, (j - this.START + 0.5) * this.WIDTH);
        return bbox;
    }

    update(state) {
        this.position.add(state.offset);
        const index = this.coordsToIndex(state.displacement.x, state.displacement.z);
        if (this.lightIndex.i != index.i || this.lightIndex.j != index.j) {
            const coords = this.indexToCoords(index.i, index.j);
            light1.position.set(coords.x + 0.2, 
                global.params.objHeight[global.params.numBuildTypes] - 0.5 - global.params.initHeight,
                coords.z + 0.2);
            light2.position.set(coords.x - 0.2, 
                global.params.objHeight[global.params.numBuildTypes] - 0.5 - global.params.initHeight,
                coords.z - 0.2);
            this.lightIndex = index;            
        }
    }
}

export default City