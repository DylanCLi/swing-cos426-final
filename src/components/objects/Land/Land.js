import * as THREE from 'three';
import { CircleGeometry } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';

class Land extends THREE.Group {
    constructor() {
        // Call parent Group() constructor
        super();

        // const loader = new GLTFLoader();

        // this.name = 'land';

        // loader.load(MODEL, (gltf) => {
        //     this.add(gltf.scene);
        // });

        const landGeo = new THREE.PlaneGeometry(500, 500);
        const landMat = new THREE.MeshPhongMaterial();
        landMat.color.setHex(0xD3D3D3);
        const land = new THREE.Mesh(landGeo, landMat);
        land.receiveShadow = true;
        this.add(land);
    }
}

export default Land;
