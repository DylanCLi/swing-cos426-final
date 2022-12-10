import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, Vector3 } from 'three';
import { Building, Hero, Sky } from 'objects';
import { BasicLights } from 'lights';
import Land from '../objects/Land/Land';

class SeedScene extends Scene {
    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            position: new Vector3(1,1,1),
            //gui: new Dat.GUI(), // Create GUI for scene
            //rotationSpeed: 0,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0xe0d6ff);

        // Add meshes to scene
        const groundGeo = new THREE.PlaneGeometry()
 
        // const buildGeo = new THREE.BoxGeometry(1,1,10);
        // const building = new THREE.Mesh(buildGeo);
        // building.position.set(this.position.x,this.position.y,this.position.z);
        // let buildings = [];
        // buildings.push(building);
        const hero = new Hero(this, camera);
        const building = new Building(this);
        const lights = new BasicLights();
        const sky = new Sky();
        const land = new Land();
        this.add(lights, building, hero, sky, land);
        
        hero.position.add(new THREE.Vector3(0, 5, 5));
        building.position.add(new THREE.Vector3(0, 0, 10));
        land.rotation.set(Math.PI / -2, 0, 0);
        land.position.set(0, 0, 0);
        // land.position.set(0,0,0);
        // land.position.

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
