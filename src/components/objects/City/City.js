import Building from "../Building/Building";
import * as THREE from 'three';

class City extends THREE.Group {
    constructor(parent) {
        super();

        this.CENTER = (global.params.citySize + 1) / 2;
        this.WIDTH = global.params.buildingWidth;
        const BUILD_PROB_0 = global.params.buildCondProb[0] * global.params.buildProb;
        const BUILD_PROB_1 = global.params.buildProb;

        // populate city data
        this.data = new Array(global.params.citySize);
        for (var i = 0; i < this.data.length; i++) {
            const a = new Array(global.params.citySize);
            for (var j = 0; j < a.length; j++) {
                if (i == this.CENTER && j == this.CENTER) {
                    a[j] = -1;
                    continue;
                }
                const p = Math.random();
                if (p < BUILD_PROB_0) a[j] = 0;
                else if (p < BUILD_PROB_1) a[j] = 1;
                else a[j] = -1;
            }
            this.data[i] = a;
        }

        // create building meshes
        const lo = Math.max(this.CENTER - global.params.visRange, 0);
        const hi = Math.min(this.CENTER + global.params.visRange, this.data.length - 1);
        for (var i = lo; i < hi; i++) {
            for (var j = lo; j < hi; j++) {
                if (this.data[i][j] >= 0) {
                    const b = new Building(this, this.data[i][j]);
                    this.add(b);
                    b.position.set((i - this.CENTER) * this.WIDTH, 
                                    global.params.buildingHeight[this.data[i][j]] / 2 + global.params.landY, 
                                    (j - this.CENTER) * this.WIDTH);
                    this.data[i][j] += global.params.numTypes; // 
                }
            }
        }

        parent.addToUpdateList(this);
    }

    update(state) {
        this.position.add(state.offset);
        const coord = state.displacement.divideScalar(this.WIDTH);

    }
}

export default City