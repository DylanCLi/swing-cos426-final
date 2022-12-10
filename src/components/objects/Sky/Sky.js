import * as THREE from 'three';

class Sky extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            //mesh: new THREE.Mesh(buildGeo),
        };

        const skyGeo = new THREE.BoxGeometry(10000, 10000, 10000);
        const sky = new THREE.Mesh(skyGeo);
        this.add(sky);

        // Add self to parent's update list
        // parent.addToUpdateList(this);
    }

    update(timeStamp) {
        // const old = this.state.mesh.position;
        // this.state.mesh.position.set(old.x, old.y, old.z)
    }
}

export default Sky;
