import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, Vector3, MathUtils } from 'three';
import { Hero, Land, Web, City } from 'objects';
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
            pivot: new THREE.Vector3(),
            offset: new THREE.Vector3(),
            swingNorm: null,
            netForce: new THREE.Vector3(),
            buildings: [],
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(global.params.skyColor);

        // Add meshes to scene
        const lights = new Lights();        
        const hero = new Hero(this);
        const land = new Land(this);
        const web = new Web(this); 
        const city = new City(this);

        // position
        hero.position.set(0,0,0);
        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, global.params.landY, 0);

        this.add(
            lights, 
            hero, 
            web,
            land,
            city);


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
        if (this.state.inWeb) {
            this.applyTension();
            // this.applyPull();
        }
        this.integrate();

        // camera offset
        //if (this.state.inWeb) 
        this.updateCamera();

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
        //let forward = this.state.offset.clone().multiplyScalar(-1).normalize(); 
        const forward = this.camera.position.clone().multiplyScalar(-1).normalize();
        const elevation = global.params.tanPhi;
        forward.setComponent(1, elevation).normalize().multiplyScalar(global.params.webLength);
        forward.applyAxisAngle(yAxis, angle);
        this.state.pivot = forward;
        // const zAxis = new THREE.Vector3(0,0,1);
        //const rotation = zAxis.angleTo(forward) + angle;
        //this.state.pivot = global.params.forwardPivot.clone().applyAxisAngle(yAxis, rotation);
    }

    updateCamera() {
        // average curr and new?
        // const currPos = this.camera.position.clone();
        let newPos = (this.state.offset.x == 0 && this.state.offset.z == 0) ?
                        new Vector3(0, 0, 1) :
                        new THREE.Vector3(this.state.offset.x, 0, this.state.offset.z);
        newPos.normalize().multiplyScalar(global.params.cameraOffset);
        this.camera.position.set(newPos.x, 0, newPos.z);
    }

    applyGravity() {
        let gravity = new THREE.Vector3(0, -global.params.GRAVITY * global.params.MASS, 0);
        this.state.netForce.add(gravity);
    }

    applyTension() {
        let tension = this.state.pivot.clone().normalize();
        const slackFactor = (Math.min(this.state.pivot.y, 0) * -1) + 1;
        tension.multiplyScalar(Math.abs(this.state.netForce.dot(tension)) / slackFactor);
        this.state.netForce.add(tension);
    }

    // to accelerate along swing
    applyPull() {
        let force = this.state.offset.clone().multiplyScalar(-1.1);
        this.state.netForce.add(force);
    }

    applyRelease() {
        this.state.inWeb = false;
        let force = new Vector3(-this.state.offset.x, Math.max(0, -this.state.offset.y), -this.state.offset.z);
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
            }

            // changed swing direction: abort web and redo calc
            else if (norm.dot(this.state.swingNorm) < 0.1) {
                this.state.swingNorm = null;
                this.state.netForce = new THREE.Vector3();
                this.applyGravity();
                this.applyRelease();
                this.integrate();
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
