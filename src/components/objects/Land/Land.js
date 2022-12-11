import * as THREE from 'three';
import { CircleGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';
import { SceneParams } from '../../../params';

class Land extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // add mesh
        const landGeo = new THREE.PlaneGeometry(500, 500);
        const landMat = new THREE.MeshPhongMaterial();
        landMat.color.setHex(SceneParams.landColor);
        const land = new THREE.Mesh(landGeo, landMat);
        land.receiveShadow = true;
        this.add(land);

        parent.addToUpdateList(this);
    }

    update(state) {
        this.position.add(new THREE.Vector3(0, state.offset.y, 0));
    }
}

export default Land;
