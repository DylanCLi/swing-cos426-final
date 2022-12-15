import * as THREE from 'three';
import { CircleGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import MODEL from './land.gltf';

class Land extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        const LENGTH = (global.params.citySize * 2 + 1) * global.params.buildingWidth;

        // add mesh
        const landGeo = new THREE.PlaneGeometry(LENGTH, LENGTH);
        const landMat = new THREE.MeshPhongMaterial();
        landMat.color.setHex(global.params.landColor);
        const land = new THREE.Mesh(landGeo, landMat);
        land.receiveShadow = true;
        this.add(land);

        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, -global.params.initHeight, 0);

        parent.addToUpdateList(this);
    }

    update(state) {
        this.position.add(new THREE.Vector3(0, state.offset.y, 0));
    }
}

export default Land;
