import * as THREE from 'three';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { init_fonts } from '../../text/pages';

import CLOUD_MODEL from './cloud/scene.gltf';
require('./cloud/scene.bin');

var cloud;
const loader = new GLTFLoader();

class Clouds extends THREE.Group {
    constructor(parent) {
        super();

        this.parent = parent;
        this.center = new THREE.Vector3();

        this.loadObject();
    }

    init() {
        const STEP = global.params.buildingWidth * 10;
        const LIMIT = global.params.buildingWidth * (global.params.citySize - 1) / 2;
        var x = -LIMIT;
        var z = -LIMIT;

        while (x < LIMIT) {
            while (z < LIMIT) {
                z += (Math.random() + 1) * STEP;
                const c = SkeletonUtils.clone(cloud);
                c.position.set(x - this.center.x, 0, z - this.center.z);
                
                this.add(c);
            }

            x += (Math.random() + 1) * STEP;
            z = - LIMIT;
        }

        const box = new Box3().setFromObject(this);

        this.parent.addToUpdateList(this);
    }

    loadObject() {
        loader.load(CLOUD_MODEL, (gltf) => {
            cloud = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(cloud);
            bbox.getCenter(this.center);
            this.init();
        })
    }

    update(state) {
        this.position.add(state.offset);
    }
}

export default Clouds