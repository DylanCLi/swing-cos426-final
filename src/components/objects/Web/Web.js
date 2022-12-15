import * as THREE from 'three';
import { SceneParams } from '../../../params';

class Web extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();
        this.scene = parent;
        this.web = {
            geo: new THREE.BufferGeometry(),
            mat: new THREE.MeshBasicMaterial(),
            line: null,
        }

        // Init state
        this.state = {
            inWeb: parent.state.inWeb,
        };

        // add meshes to group
        const points = [parent.state.pivot.clone().multiplyScalar(0.005), parent.state.pivot];
        this.web.geo.setFromPoints(points);
        this.web.mat.color = SceneParams.webColor;
        this.web.line = new THREE.Line(this.web.geo);
        
        if (this.state.inWeb) this.add(this.web.line);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(state) {
        if (state.inWeb) {
            state.pivot.add(state.offset);
            this.web.geo.setFromPoints([state.pivot.clone().multiplyScalar(0.005), state.pivot]);
            if (!this.state.inWeb) {
                this.add(this.web.line);
                this.state.inWeb = true;
            } 
        } else if (this.state.inWeb) {
            this.remove(this.web.line);
            this.state.inWeb = false;
        }
    }
}

export default Web;
