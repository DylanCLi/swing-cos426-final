import { Group, AmbientLight, HemisphereLight, DirectionalLight } from 'three';

class Lights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);
        //        const sun = new DirectionalLight(0xfb9062, 1);

        const dir = new DirectionalLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0x191970, 1);
        const hemi = new HemisphereLight(0xffffbb, 0x080820, 2.3);
        dir.castShadow = true;

        dir.position.set(5, 10, 0);
        dir.target.position.set(0, 0, 0);

        this.add(
            ambi, 
            //hemi, 
            //dir
            );
    }
}

export default Lights;
