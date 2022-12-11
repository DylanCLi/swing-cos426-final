import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, Vector3, Light, DirectionalLight } from 'three';
import { Building, Hero, Sky, Land, Web } from 'objects';
import { Lights } from 'lights';
import { SceneParams } from '../../params';

class SeedScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();
        window.scene = this;

        // Init state
        this.state = {
            inWeb: false,
            pivot: new THREE.Vector3(),
            offset: new THREE.Vector3(),
            netForce: new THREE.Vector3(),
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(SceneParams.skyColor);

        // Add meshes to scene
        const lights = new Lights();        
        const hero = new Hero(this, camera);
        const building = new Building(this);
        const sky = new Sky();
        const land = new Land();
        const web = new Web(this);
        const environment = new THREE.Group();
        environment.add(building)  

        // position
        hero.position.set(0,0,0);
        building.position.add(new THREE.Vector3(-2, 0, 5));
        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, -5, 0);

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

    handleEvents(event) {
        // Ignore keypresses typed into a text box
        if (event.target.tagName === "INPUT") { return; }

        // vectors for position of web pivot relative to hero position
        const keyMap = {
            Q: new THREE.Vector3(3, 20, 5),
            W: new THREE.Vector3(0, 20, 6),
            E: new THREE.Vector3(-3, 20, 5),
        }

        if (event.key == "q") {
            this.scene.state.pivot = keyMap.Q;
            this.scene.state.inWeb = true;
        }
        else if (event.key == "w") {
            this.scene.state.pivot = keyMap.W;
            this.scene.state.inWeb = true;
        }
        else if (event.key == "e") {
            this.scene.state.pivot = keyMap.E;
            this.scene.state.inWeb = true;
        }

    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    addToTrash(object) {

    }

    update(timeStamp) {
        this.applyForces();
        this.integrate();

        // Call update for each object in the updateList
        for (const obj of this.state.updateList) {
            obj.update(this.state);
        }
    }

    applyForces() {
        // gravity


        // tension
    }

    integrate() {
        let x_prev = this.state.offset;
        let x_next = new THREE.Vector3();
        let a = this.state.netForce.multiplyScalar(
            Math.pow(SceneParams.TIMESTEP, 2) / SceneParams.MASS);

        x_next.sub(x_prev);
        x_next.multiplyScalar(1 - SceneParams.DAMPING);
        x_next.add(a);

        this.state.netForce = new THREE.Vector3();
        this.state.offset = x_next.multiplyScalar(-1);
    }
}

export default SeedScene;
