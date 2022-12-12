import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, Vector3, MathUtils } from 'three';
import { Building, Hero, Sky, Land, Web } from 'objects';
import { Lights } from 'lights';

class SeedScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();
        window.scene = this;

        this.camera = camera;

        // Init state
        this.state = {
            displacement: new THREE.Vector2(),
            inWeb: false,
            //forward: global.params.forwardPivot,
            pivot: new THREE.Vector3(),
            offset: new THREE.Vector3(),
            swingNorm: null,//new THREE.Vector3(),
            netForce: new THREE.Vector3(),
            buildings: [],
            updateList: [],
        };

        // coordinate of center and starting point
        const center = (global.params.citySize + 1) / 2;

        // populate city data
        const BUILD_PROB_0 = global.params.buildCondProb[0] * global.params.buildProb;
        const BUILD_PROB_1 = global.params.buildProb;
        this.city = new Array(global.params.citySize);//Array.from(Array(global.params.citySize), () => new Array(global.params.citySize));
        for (var i = 0; i < this.city.length; i++) {
            const a = new Array(global.params.citySize);
            for (var j = 0; j < a.length; j++) {
                if (i == center && j == center) {
                    a[j] = -1;
                    continue;
                }
                const p = Math.random();
                if (p < BUILD_PROB_0) a[j] = 0;
                else if (p < BUILD_PROB_1) a[j] = 1;
                else a[j] = -1;
            }
            this.city[i] = a;
        }

        // create building meshes
        const WIDTH = global.params.buildingWidth;
        const lo = Math.max(center - global.params.visRange, 0);
        const hi = Math.min(center + global.params.visRange, this.city.length - 1);
        for (var i = lo; i < hi; i++) {
            for (var j = lo; j < hi; j++) {
                if (this.city[i][j] >= 0) {
                    const b = new Building(this, this.city[i][j]);
                    this.add(b);
                    b.position.set((i - center) * WIDTH, 
                                    global.params.buildingHeight[this.city[i][j]] / 2 + global.params.landY, 
                                    (j - center) * WIDTH)
                }
            }
        }

        // Set background to a nice color
        this.background = new Color(global.params.skyColor);

        // Add meshes to scene
        const lights = new Lights();        
        const hero = new Hero(this);
        //const building = new Building(this);
        const sky = new Sky();
        const land = new Land(this);
        const web = new Web(this); 

        // position
        hero.position.set(0,0,0);
        // building.position.add(
        //     new THREE.Vector3(-5, global.params.landY + global.params.buildingHeight / 2, 5));
        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, global.params.landY, 0);

        this.add(
            lights, 
            //building, 
            hero, 
            //sky, 
            web,
            land);


        // event handlers
        window.addEventListener("keydown", this.handleEvents);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    addToTrash(object) {

    }

    update(timeStamp) {
        this.applyGravity();
        if (this.state.inWeb) this.applyTension();
        this.integrate();

        // camera offset
        if (this.state.inWeb) this.updateCamera();

        // Call update for each object in the updateList
        for (const obj of this.state.updateList) {
            obj.update(this.state);
        }
    }

    handleEvents(event) {
        // Ignore keypresses typed into a text box
        if (event.target.tagName === "INPUT") { return; }

        if (!this.scene.state.inWeb) {
            let angle = null;
            if (event.key == "q") {
                angle = global.params.leftRotate;
            }
            else if (event.key == "w") {
                angle = 0;
            }
            else if (event.key == "e") {
                angle = global.params.rightRotate;
            }

            if (angle != null) {
                this.scene.state.inWeb = true;
                this.scene.changePivot(angle);
            }
        } else if (event.key == " ") {
            this.scene.applyRelease();
        }
    }

    changePivot(angle) {
        const yAxis = new THREE.Vector3(0,1,0);
        const zAxis = new THREE.Vector3(0,0,1);
        let forward = this.camera.position.clone().multiplyScalar(-1).normalize();
        const rotation = zAxis.angleTo(forward) + angle;
        this.state.pivot = global.params.forwardPivot.clone().applyAxisAngle(yAxis, rotation);
    }

    updateCamera() {
        let newPos = new THREE.Vector3(this.state.offset.x, 0, this.state.offset.z);
        newPos.normalize().multiplyScalar(global.params.cameraOffset);
        this.camera.position.set(newPos.x, 0, newPos.z);
    }

    applyGravity() {
        let gravity = new THREE.Vector3(0, -global.params.GRAVITY * global.params.MASS, 0);
        this.state.netForce.add(gravity);
    }

    applyTension() {
        let tension = this.state.pivot.clone().normalize();
        tension.multiplyScalar(Math.abs(this.state.netForce.dot(tension)));
        this.state.netForce.add(tension);
    }

    applyRelease() {
        this.state.inWeb = false;
        let force = new Vector3(-this.state.offset.x, Math.max(0, -this.state.offset.y), -this.state.offset.y);
        force.normalize().multiplyScalar(global.params.STRENGTH);
        this.state.netForce.add(force);
    }

    integrate() {
        // verlet integration
        let x_prev = this.state.offset;
        let x_next = new THREE.Vector3();
        let a = this.state.netForce.multiplyScalar(
            Math.pow(global.params.TIMESTEP, 2) / global.params.MASS);

        x_next.sub(x_prev);
        x_next.add(a);

        // constrain web length
        if (this.state.inWeb) {
            let pivot_next = this.state.pivot.clone().sub(x_next);
            pivot_next.normalize().multiplyScalar(global.params.webLength);
            x_next = this.state.pivot.clone().sub(pivot_next);
        }

        x_next.multiplyScalar(-1);

        // only set swingnorm at beginning of swing
        if (this.state.inWeb) {
            const norm = x_next.clone().cross(this.state.pivot);
            if (this.state.swingNorm == null) {
                this.state.swingNorm = norm;
            } else if (norm.dot(this.state.swingNorm) < 0) {
                // changed swing direction abort web
                this.state.swingNorm = null;
                this.state.netForce = new THREE.Vector3();
                this.applyRelease();
                return;
            } 
        }

        const dispOffset = new THREE.Vector2(x_next.x, x_next.y);
        this.state.displacement.add(dispOffset);
        this.state.offset = x_next;
        this.state.netForce = new THREE.Vector3();
    }
}

export default SeedScene;
