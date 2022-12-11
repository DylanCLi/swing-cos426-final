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
            inWeb: false,
            // theta_prev: 0,
            // theta: 0,
            forward: global.params.forwardPivot,
            pivot: new THREE.Vector3(),
            offset: new THREE.Vector3(),
            netForce: new THREE.Vector3(),
            buildings: [],
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(global.params.skyColor);

        // Add meshes to scene
        const lights = new Lights();        
        const hero = new Hero(this);
        const building = new Building(this);
        const sky = new Sky();
        const land = new Land(this);
        const web = new Web(this); 

        // position
        hero.position.set(0,0,0);
        building.position.add(
            new THREE.Vector3(-5, global.params.landY + global.params.buildingHeight / 2, 5));
        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, global.params.landY, 0);

        this.add(
            lights, 
            building, 
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
        this.applyForces();
        this.integrate();

        // camera offset
        if (this.state.inWeb) {
            let newCam = new THREE.Vector3(this.state.offset.x, 0, this.state.offset.z);
            newCam.normalize().multiplyScalar(global.params.cameraOffset);
            this.camera.position.set(newCam.x, 0, newCam.z);
            // let xzOffset = new THREE.Vector3(-this.state.offset.x, 0, -this.state.offset.z);
            // let zAxis = new this.camera.position;
            // let rotation = zAxis.angleTo(xzOffset);
            // this.camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), rotation);
            // let camOffset = new THREE.Vector3(this.state.offset.x, 0, this.state.offset.z);
            // camOffset.normalize().multiplyScalar(global.params.cameraOffset);
            // this.camera.position.set(camOffset.x, 0, camOffset.z);
        }

        // Call update for each object in the updateList
        for (const obj of this.state.updateList) {
            obj.update(this.state);
        }
    }

    handleEvents(event) {
        // Ignore keypresses typed into a text box
        if (event.target.tagName === "INPUT") { return; }

        let angle = null;
        if (event.key == "q") {
            angle = global.params.leftRotate;
            // this.scene.state.pivot = global.params.leftPivot;
            this.scene.state.inWeb = true;
        }
        else if (event.key == "w") {
            angle = 0;
            // this.scene.state.pivot = global.params.forwardPivot;
            this.scene.state.inWeb = true;
        }
        else if (event.key == "e") {
            angle = global.params.rightRotate;
            // this.scene.state.pivot = global.params.rightPivot;
            this.scene.state.inWeb = true;
        } else if (event.key == " ") {
            this.scene.state.inWeb = false;
        }

        // change pivot
        if (this.scene.state.inWeb) {
            const yAxis = new THREE.Vector3(0,1,0);
            const zAxis = new THREE.Vector3(0,0,1);
            let forward = this.scene.camera.position.clone().multiplyScalar(-1).normalize();
            const rotation = zAxis.angleTo(forward) + angle;
            this.scene.state.pivot = global.params.forwardPivot.clone().applyAxisAngle(yAxis, rotation);

            //this.scene.state.pivot = this.scene.camera.position.clone().applyAxisAngle(yAxis, angle);
            //this.scene.camera.position.applyAxisAngle(yAxis, angle);
        }
    }

    applyReleaseForce() {

    }

    applyForces() {
        // gravity
        let gravity = new THREE.Vector3(0, -global.params.GRAVITY * global.params.MASS, 0);
        this.state.netForce.add(gravity);

        // tension
        if (this.state.inWeb) {
            let tension = this.state.pivot.clone().normalize();
            tension.multiplyScalar(Math.abs(gravity.dot(tension)));
            //tension.add(new Vector3(0,0.1,0));
            this.state.netForce.add(tension);
            console.log(this.state.netForce.y);
        }

        // web release

        // spring
        if (this.state.inWeb) {
            // const dist = this.state.pivot.distanceToSquared();
            // if (dist > Math.pow(SceneParams.webLength, 2)) {
            //     //tension.
            // }
        }
    }

    integrate() {
        // if (this.state.inWeb) {
        //     const theta_prev = this.state.theta_prev;
        //     const theta_curr = this.state.theta;

        //     const alpha = this.state.netForce.length() / global.params.MOMENT;
        //     const theta_next = 2* theta_curr - theta_prev + alpha * Math.pow(global.params.TIMESTEP, 2);
        // }

        // verlet integration
        let x_prev = this.state.offset;
        let x_next = new THREE.Vector3();
        let a = this.state.netForce.multiplyScalar(
            Math.pow(global.params.TIMESTEP, 2) / global.params.MASS);

        x_next.sub(x_prev);
        x_next.add(a);

        this.state.netForce = new THREE.Vector3();

        // constrain web length
        if (this.state.inWeb) {
            let pivot_next = this.state.pivot.clone().sub(x_next);
            pivot_next.normalize().multiplyScalar(global.params.webLength);
            x_next = this.state.pivot.clone().sub(pivot_next);
        }

        //this.state.offset.cross()
        //if (this.state)
        
        this.state.offset = x_next.multiplyScalar(-1);
    }
}

export default SeedScene;
