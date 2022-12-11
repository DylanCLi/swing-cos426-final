import * as THREE from 'three';
import { SceneParams } from '../../../params';

class Building extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            //mesh: new THREE.Mesh(buildGeo),
        };

        // add meshes to group
        const buildGeo = SceneParams.buildingGeo;
        const buildMat = SceneParams.buildingMat;
        buildMat.color.setHex(SceneParams.buildingColor);
        const building = new THREE.Mesh(buildGeo, buildMat);
        building.receiveShadow = true;
        building.castShadow = true;
        this.add(building);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(state) {
        this.position.add(state.offset);
        // const old = this.state.mesh.position;
        // this.state.mesh.position.set(old.x, old.y, old.z)
    }
}

export default Building;
