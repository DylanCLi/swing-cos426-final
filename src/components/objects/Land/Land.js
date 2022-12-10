import * as THREE from 'three';
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

        const landGeo = new THREE.PlaneGeometry(10000, 10000);
        const landMat = new THREE.MeshToonMaterial();
        //landMat.color.setHex(0xD3D3D3);
        const land = new THREE.Mesh(landGeo);
        land.material.color.setHex(0xD3D3D3);
        this.add(land);
    }
}

export default Land;
