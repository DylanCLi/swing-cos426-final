import Building from "../Building/Building";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import MODEL from './scene.gltf';
require('./scene.bin');
require('./textures/lambert1_baseColor.jpeg');
require('./textures/lambert1_emissive.jpeg');
require('./textures/lambert1_metallicRoughness.png');
require('./textures/lambert1_normal.png');
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

var building;

class City extends THREE.Group {
    constructor(parent) {
        super();

        this.START = global.params.padding;
        this.END = global.params.citySize - global.params.padding - 1;
        this.MIDDLE = (global.params.citySize - 1) / 2;
        this.WIDTH = global.params.buildingWidth;
        this.data = new Array(global.params.citySize);

        this.meshWidth;
        this.meshHeight;
        
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            building = gltf.scene;
            const box = new THREE.Box3().setFromObject(building);
            this.meshWidth = box.max.x - box.min.x;
            this.meshHeight = (box.max.y - box.min.y);
            this.init(parent);
        }, undefined, (error) => {
            console.log(error);
        });
    }

    init(parent) {
        // populate city data
        const BUILD_PROB_0 = global.params.buildCondProb[0] * global.params.buildProb;
            const BUILD_PROB_1 = global.params.buildProb;
        for (var i = 0; i < this.data.length; i++) {
            const a = new Array(global.params.citySize);
            for (var j = 0; j < a.length; j++) {
                if (i == this.MIDDLE && j == this.START) {
                    a[j] = 0;
                    continue;
                } else if (i == this.MIDDLE && j == this.END) {
                    a[j] = 1;
                    continue;
                }
                const p = Math.random();
                if (p < BUILD_PROB_0) a[j] = 2;
                else if (p < BUILD_PROB_1) a[j] = 3;
                else a[j] = -1;
            }
            this.data[i] = a;
        }

        // create building meshes
        const lo = Math.max(this.START /*- global.params.visRange*/, 0);
        const hi = Math.min(this.START /*+ global.params.visRange*/, this.data.length - 1);
        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < this.data.length; j++) {
                if (this.data[i][j] >= 0) {
                    const b = new SkeletonUtils.clone(building);
                    // const b = new Building(this, this.data[i][j]);
                    //b.id = this.indexToID(i, j);
                    const coords = this.indexToCoords(i, j);
                    b.scale.set(this.WIDTH / this.meshWidth, 
                                global.params.buildingHeight[this.data[i][j]] / this.meshHeight,
                                this.WIDTH / this.meshWidth);
                    b.position.set(coords.x, 
                                   -global.params.initHeight, 
                                   coords.z);
                    var box = new THREE.Box3().setFromObject(b);
                    this.add(b);
                    
                    //this.data[i][j] += global.params.numTypes;
                }
            }
        }

        parent.addToUpdateList(this);
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
        return {
            i: Math.round(x / this.WIDTH + this.MIDDLE),
            j: Math.round(z / this.WIDTH + this.START),
        }
    }

    boundingBoxAt(i, j) {
        const height = global.params.buildingHeight[this.data[i][j]];
        return {
            min: {x: (i - this.MIDDLE - 0.5) * this.WIDTH, z: (j - this.START - 0.5) * this.WIDTH},
            max: {x: (i - this.MIDDLE + 0.5) * this.WIDTH, z: (j + this.START - 0.5) * this.WIDTH},
        }
    }

    update(state) {
        this.position.add(state.offset);
        const coord = state.displacement.divideScalar(this.WIDTH);

    }
}

export default City