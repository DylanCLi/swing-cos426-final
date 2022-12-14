import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { Scene, Color, Vector3, MathUtils, Vector2 } from 'three';
import { Hero, Land, Web, City } from 'objects';
import { Lights } from 'lights';

class SeedScene extends Scene {
    constructor(camera, renderer) {
        // Call parent Scene() constructor
        super();

        window.scene = this;
        this.camera = camera;
        this.renderer = renderer;

        // Init state
        this.state = {
            started: false,
            stuck: false,
            stuckNorm: new Vector3(),
            displacement: new THREE.Vector3(0, global.params.initHeight, 0),
            inWeb: false,
            webDir: "",
            pivot: new THREE.Vector3(),
            offset: new THREE.Vector3(),
            swingNorm: null,
            netForce: new THREE.Vector3(),
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(global.params.skyColor);

        // Add meshes to scene
        this.hero = new Hero(this);
        this.city = new City(this);
        const lights = new Lights();        
        const land = new Land(this);
        const web = new Web(this); 

        // position
        //hero.position.set(0,0,0);
        land.rotation.set(Math.PI / -2, 0, 0);
        const offset = 0//((global.params.citySize - 1) / 2 - global.params.padding) * global.params.buildingWidth;
        land.position.set(0, -global.params.initHeight, offset);

        this.add(
            lights, 
            this.hero, 
            web,
            land,
            this.city,
        );

        // event handlers
        window.addEventListener("keydown", this.handleEvents);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        if (!this.state.started) return;
        if (!this.state.stuck) this.applyGravity();
        if (this.state.inWeb) {
            this.applyTension();
            // this.applyPull();
        }
        this.integrate();

        // camera offset
        if (this.state.inWeb) this.updateCamera();

        // const blocker = this.checkViewBlock();
        // if (blocker != null) {
        //     const build = this.renderer.getObjectByID(this.city.indexToID(blocker.i, blocker.j));
        //     build.opacity = 0.2;
        // }

        // Call update for each object in the updateList
        for (const obj of this.state.updateList) {
            obj.update(this.state);
        }

        var norm = this.handleCollision(norm);
        if (norm != null) {
            if (norm.y == 0)this.hero.lookAt(norm);
            this.state.stuck = true;
            this.state.stuckNorm = norm;
            this.state.inWeb = false;
            this.state.offset = new Vector3();
        }
        
    }

    handleCollision(norm) {
        // ground
        if (this.hero.handleCollision(this.state.displacement.y)) return new Vector3(0, 1, 0);

        // building
        const center = this.city.coordsToIndex(this.state.displacement.x, this.state.displacement.z);
        if (center == null) return center;
        const indices = [center];
        const s = [-1, 0, 1];
        for (var x = 0; x < s.length; x++) {
            for (var z = 0; z < s.length; z++) {
                if ((x != 0 || z != 0)) {
                    const offset = this.city.coordsToIndex(
                        this.state.displacement.x + global.params.HEIGHT * s[x],
                        this.state.displacement.z + global.params.HEIGHT * s[z]);
                    if (offset == null) continue;
                    if (center.i != offset.i || center.j != offset.j) indices.push(offset);
                }
            }
        }
        for (let index of indices) {
            if (this.city.data[index.i][index.j] < 0 || this.city.data[index.i][index.j] >= global.params.numBuildTypes) continue;
            const bbox = this.city.boundingBoxAt(index.i, index.j);
            bbox.min.sub(this.state.displacement);
            bbox.max.sub(this.state.displacement);
            if (this.hero.handleCollision(undefined,bbox)) {

                return new Vector3(center.i - index.i, 0, center.j - index.j).normalize();
            }
        }
    }

    handleEvents(event) {
        // Ignore keypresses typed into a text box
        if (event.target.tagName === "INPUT") { return; }

        if (!this.scene.state.started) {
            if (event.key == " ") {
                this.scene.state.started = true;
            }
        }

        if (!this.scene.state.inWeb) {
            let angle = null;
            let dir = "";
            if (event.key == "q") {
                angle = global.params.leftRotate;
                dir = "left";
            }
            else if (event.key == "w") {
                angle = 0;
                dir = "forw";
            }
            else if (event.key == "e") {
                angle = global.params.rightRotate;
                dir = "right"
            }

            if (angle != null) {
                this.scene.state.inWeb = true;
                this.scene.changePivot(angle, dir);
            }
        } else if (event.key == " ") {
            this.scene.applyRelease();
        }
    }

    changePivot(angle, dir) {
        const yAxis = new THREE.Vector3(0,1,0);
        //let forward = this.state.offset.clone().multiplyScalar(-1).normalize(); 
        const forward = this.camera.position.clone().multiplyScalar(-1).normalize();
        const elevation = global.params.tanPhi;
        forward.setComponent(1, elevation).normalize().multiplyScalar(global.params.webLength);
        forward.applyAxisAngle(yAxis, angle);
        this.state.pivot = forward;
        this.state.webDir = dir;
        // const zAxis = new THREE.Vector3(0,0,1);
        //const rotation = zAxis.angleTo(forward) + angle;
        //this.state.pivot = global.params.forwardPivot.clone().applyAxisAngle(yAxis, rotation);
    }

    updateCamera() {
        if (this.state.offset.x == 0 && this.state.offset.z == 0) {
            this.camera.position.set(0, 0, global.params.cameraOffset);
        } else {
            const forward = new Vector2(this.state.offset.x, this.state.offset.z);
            const curr = new Vector2(this.camera.position.x, this.camera.position.z);
            let angle = curr.angle() - forward.angle();
            if (angle > Math.PI) angle -= Math.PI * 2;
            else if (angle < -Math.PI) angle += Math.PI * 2;
            const sign = angle > 0 ? 1 : -1;

            if (this.state.webDir == "left" && sign != 1) return;
            if (this.state.webDir == "right" && sign != -1) return;

            if (Math.abs(angle) > global.params.maxAngleOffset) {
                angle = global.params.maxAngleOffset * sign;
            }
            this.camera.position.applyAxisAngle(new Vector3(0,1,0), angle);
        }
    }

    checkViewBlock() {
        const coords1 = this.city.coordsToIndex(this.state.displacement.x, this.state.displacement.z);
        const coords2 = this.city.coordsToIndex(this.state.displacement.x + this.camera.position.x, 
            this.state.displacement.z + this.camera.position.z);

        for (var i = Math.min(coords1.i, coords2.i); i <= Math.max(coords1.i, coords2.i); i++) {
            for (var j = Math.min(coords1.j, coords2.j); j <= Math.max(coords1.j, coords2.j); j++) {
                if (this.data[i][j] >= 0) {
                    const h = global.params.objHeight[this.data[i][j]];
                    if (this.camera.position.y > h) continue;
                    const box = this.city.boundingBoxAt(i, j);
                    const points = [{x: box.min.x, z: box.min.z},
                                    {x: box.min.x, z: box.max.z},
                                    {x: box.max.x, z: box.max.z},
                                    {x: box.max.x, z: box.min.z}];
                    if (this.intersectsWithLine(points[0], points[1], coords1, coords2)) return {i: i, j: j};
                    if (this.intersectsWithLine(points[1], points[2], coords1, coords2)) return {i: i, j: j};
                    if (this.intersectsWithLine(points[3], points[2], coords1, coords2)) return {i: i, j: j};
                    if (this.intersectsWithLine(points[0], points[3], coords1, coords2)) return {i: i, j: j};
                }
            }
        }
    }

    intersectsWithLine(lineMin, lineMax, pMin, pMax) {
        const EPS = global.params.EPS;
        if (Math.abs(lineMin.x - lineMax.x) < EPS) {
            const xDist = pMax.x - pMin.x;
            const z = pMin.z * (pMax.x - lineMin.x) / xDist + pMax.z * (lineMin.x - pMin.x) / xDist;
            if (z < (lineMax.z + EPS) && z > (lineMin.z - EPS)) return true;
        } else {
            const zDist = pMax.z - pMin.z;
            const x = pMin.x * (pMax.z - lineMin.z) / zDist + pMax.x * (lineMin.z - pMin.z) / zDist;
            if (x < (lineMax.x + EPS) && x > (lineMin.x - EPS)) return true;
        }

        return false;
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
        this.state.webDir = "";
        let force = new Vector3(-this.state.offset.x, 0/*Math.max(0, -this.state.offset.y * 0.1)*/, -this.state.offset.z);
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

        // only set swingnorm at beginning of swing
        if (this.state.inWeb) {
            const norm = x_next.clone().multiplyScalar(-1).cross(this.state.pivot);

            if (this.state.swingNorm == null) {
                this.state.swingNorm = norm;
            }

            // changed swing direction: abort web and redo calc
            else if (norm.dot(this.state.swingNorm) < 0.05 || this.state.pivot.y < 0.1) {
                this.state.swingNorm = null;
                this.state.netForce = new THREE.Vector3();
                this.applyGravity();
                this.applyRelease();
                this.integrate();
                return;
            } 
        }

        this.state.displacement.add(x_next);
        this.state.offset = x_next.multiplyScalar(-1);
        this.state.netForce = new THREE.Vector3();
    }
}

export default SeedScene;
