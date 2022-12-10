import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, Vector3, Light, DirectionalLight } from 'three';
import { Building, Hero, Sky, Land } from 'objects';
import { Lights } from 'lights';

class SeedScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0xe0d6ff);

        // Add meshes to scene
        const lights = new Lights();        
        const hero = new Hero(this, camera);
        const building = new Building(this);
        const sky = new Sky();
        const land = new Land();
        const environment = new THREE.Group();
        environment.add(building)        
        // position
        hero.position.add(new THREE.Vector3(0, 5, 5));
        building.position.add(new THREE.Vector3(-2, 5, 10));
        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, 0, 0);

        this.add(
            lights, 
            building, 
            hero, 
            sky, 
            land);


        // Populate GUI
        //this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        //this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
