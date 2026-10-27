import * as THREE from 'three';
import { World3dClass } from '../3d/World3dClass';
import { RobotWorldClass } from './RobotWorldClass';

type TextureData = {
    key: string,
    path: string,
}

type CubeColor = "rot" | "gelb" | "grün" | "blau";

export class RobotCubeFactory {

    world3d: World3dClass;

    farben: string[] = ["rot", "gelb", "grün", "blau"];

    farbeToColorInfoMap: { [farbe: string]: number } = {
        "rot": 0xff0000,
        "gelb": 0xffff00,
        "grün": 0x00ff00,
        "blau": 0x0000ff
    }

    farbeToMarkerMaterialMap: Map<string, THREE.Material> = new Map();
    farbeToBrickMaterialMap: Map<string, THREE.Material> = new Map();

    constructor(private robotWorld: RobotWorldClass){
        this.world3d = robotWorld.world3d;
    }

    async init() {

        for(let i = 0; i < this.farben.length; i++){
            this.farbeToBrickMaterialMap.set(this.farben[i], new THREE.MeshLambertMaterial({
                map: this.world3d.textureManager3d.getSpritesheetBasedTexture("robot", 4 + i),
                side: THREE.DoubleSide
            }));
            this.farbeToMarkerMaterialMap.set(this.farben[i], new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.farbeToColorInfoMap[this.farben[i]])
            }))
        }

    }

    private grassCubeGeometry: THREE.BoxGeometry;
    private getGrassCubeGeometry() {
        if(!this.grassCubeGeometry){
            this.grassCubeGeometry = new THREE.BoxGeometry(1, 1, 1);

            let uvCoordinates = [
                [2, 2], [3, 2], [2, 1], [3, 1],  // right side
                [0, 2], [1, 2], [0, 1], [1, 1],  // left side
                [1, 3], [2, 3], [1, 2], [2, 2], // top
                [1, 1], [2, 1], [1, 0], [2, 0], // bottom
                [1, 2], [2, 2], [1, 1], [2, 1],  // front
                [3, 2], [4, 2], [3, 1], [4, 1],  // back
            ];
            for (let i = 0; i < uvCoordinates.length; i++) {
                this.grassCubeGeometry.attributes.uv.setXY(i, uvCoordinates[i][0] / 4, uvCoordinates[i][1]/3)
            }
            this.grassCubeGeometry.attributes.uv.needsUpdate = true;
        }
        return this.grassCubeGeometry.clone();
    }

    private brickGeometry: THREE.BoxGeometry;
    private getBrickGeometry() {
        if(!this.brickGeometry){
            this.brickGeometry = new THREE.BoxGeometry(1, 0.5, 1);

            let uvCoordinates = [
                [1, 1], [2, 1], [1, 0.5], [2, 0.5],  // right side
                [1, 1], [2, 1], [1, 0.5], [2, 0.5],  // left side
                [2, 1], [3, 1], [2, 0], [3, 0], // top
                [0, 1], [1, 1], [0, 0], [1, 0], // bottom
                [1, 1], [2, 1], [1, 0.5], [2, 0.5],  // front
                [1, 1], [2, 1], [1, 0.5], [2, 0.5],  // back
            ];
            for (let i = 0; i < uvCoordinates.length; i++) {
                this.brickGeometry.attributes.uv.setXY(i, uvCoordinates[i][0] / 3, uvCoordinates[i][1])
            }
            this.brickGeometry.attributes.uv.needsUpdate = true;
        }
        return this.brickGeometry.clone();
    }

    getGrassCube() {

        const material = new THREE.MeshLambertMaterial({
            map: this.world3d.textureManager3d.getSpritesheetBasedTexture("robot", 0),
            side: THREE.DoubleSide
        });

        const cube = new THREE.Mesh(this.getGrassCubeGeometry(), material);
        this.world3d.scene.add(cube);
        return cube;
    }

    getBrick(farbe, x: number, y: number, z: number){
        let brick = new THREE.Mesh(this.getBrickGeometry(), this.farbeToBrickMaterialMap.get(farbe));
        brick.translateX(-this.robotWorld.maxX/2 + x - 1);
        brick.translateZ(-this.robotWorld.maxY/2 + y - 1);
        brick.translateY(0.75 + z/2);
        brick.userData["farbe"] = farbe;
        this.world3d.scene.add(brick);
        return brick;
    }

    getMarker(farbe, x: number, y: number, z: number): THREE.Mesh{
        let geometry = new THREE.BoxGeometry(1, 0.1, 1);
        let marker = new THREE.Mesh(geometry, this.farbeToMarkerMaterialMap.get(farbe));
        marker.translateX(-this.robotWorld.maxX/2 + x - 1);
        marker.translateZ(-this.robotWorld.maxY/2 + y - 1);
        marker.translateY(0.55 + z/2);
        marker.userData["farbe"] = farbe;
        marker.userData["z"] = z;
        this.world3d.scene.add(marker);
        return marker;
    }

    getGrassPlane(x: number, y: number){
        for(let i = 0; i < x; i++){
            for(let j = 0; j < y; j++){
                let cube = this.getGrassCube();
                cube.geometry.translate(i - x/2, 0, j - y/2);
            }
        }
    }

    public initNorthArrow() {
        const geometry = new THREE.PlaneGeometry(6, 1);
        geometry.rotateY(-Math.PI/2);
        geometry.rotateZ(-Math.PI/2);
        geometry.translate(-this.robotWorld.maxX/2 - 1.5, 0, -this.robotWorld.maxY/2 + 2.5)
        const material = new THREE.MeshBasicMaterial({
            map: this.world3d.textureManager3d.getSpritesheetBasedTexture("robot", 11),
            side: THREE.DoubleSide,
            transparent: true
        });
        const plane = new THREE.Mesh(geometry, material);
        this.world3d.scene.add(plane);
    }


}

