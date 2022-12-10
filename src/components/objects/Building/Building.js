import * as THREE from 'three';

class Building extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            //mesh: new THREE.Mesh(buildGeo),
        };

        // add meshes to group
        const buildGeo = new THREE.BoxGeometry(1,10,1);
        const building = new THREE.Mesh(buildGeo);
        this.add(building);

        // Add self to parent's update list
        // parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // const old = this.state.mesh.position;
        // this.state.mesh.position.set(old.x, old.y, old.z)
    }
}

export default Building;
