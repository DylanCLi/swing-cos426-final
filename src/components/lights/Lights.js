import { Group, AmbientLight, HemisphereLight, DirectionalLight } from 'three';

class Lights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const ambi = new AmbientLight(global.params.ambientColor, 3);

        //const hemi = new HemisphereLight(global.params.skyColor, 1);

        this.add(
            ambi
            //hemi
            );
    }
}

export default Lights;
