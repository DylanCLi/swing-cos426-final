import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import MODEL from './scene.gltf';
// require('./scene.bin');
// require('./textures/lambert1_baseColor.jpeg');
// require('./textures/lambert1_emissive.jpeg');
// require('./textures/lambert1_metallicRoughness.png');
// require('./textures/lambert1_normal.png');

class Building extends THREE.Group {
    constructor(parent, type) {
        // invalid building type
        if (type < 0 || type >= global.params.numBuildTypes) return;

        // Call parent Group() constructor
        super();

        // Init state
        // this.state = {
        //     mesh: new THREE.Mesh(buildGeo),
        // };
        // var b;
        // const loader = new GLTFLoader();
        // loader.load(MODEL, (gltf) => {
        //     b = gltf.scene;
        //     this.add(gltf.scene);
        // });

        // add meshes to group
        let buildGeo = global.params.buildingGeo[type];
        let buildMat = global.params.buildingMat;

        buildMat.color.setHex(global.params.buildingColor);

        const building = new THREE.Mesh(buildGeo, buildMat);
        building.receiveShadow = true;
        building.castShadow = true;
        // this.add(building);

        // Add self to parent's update list
        // parent.addToUpdateList(this);
    }

    update(state) {
        this.position.add(state.offset);
        // const old = this.state.mesh.position;
        // this.state.mesh.position.set(old.x, old.y, old.z)
    }
}

export default Building;
