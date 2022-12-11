import * as THREE from 'three';
import { SceneParams } from '../../../params';

class Web extends THREE.Group {
    constructor(parent) {
        // Call parent Group() constructor
        super();

        this.web = {
            geo: new THREE.BufferGeometry(),
            mat: new THREE.MeshPhongMaterial(),
            line: null,
        }

        // Init state
        this.state = {
            inWeb: parent.state.inWeb,
        };

        // add meshes to group
        const points = [new THREE.Vector3(), parent.state.pivot];
        this.web.geo.setFromPoints(points);
        this.web.mat.color = SceneParams.webColor;
        this.web.line = new THREE.Line(this.web.geo, this.web.mat);
        
        if (this.state.inWeb) this.add(this.web.line);

        // Add self to parent's update list
        parent.addToUpdateList(this);
    }

    update(state) {
        if (state.inWeb) {
            state.pivot.add(state.offset);
            this.web.geo.setFromPoints([new THREE.Vector3(), state.pivot]);
            // this.web.geo.computeBoundingBox();
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
