import * as THREE from 'three';
import { World3dClass } from "./World3dClass";

type Axis = {
    vector: THREE.Vector3,
    vector2: THREE.Vector3,
    color: number,
    caption: string,
    textureIndex: number,
    arrowHelper?: THREE.ArrowHelper,
    sprite?: THREE.Sprite
}

export class CoordinateSystemHelper3d {

    axes: Axis[] = [
        {
            vector: new THREE.Vector3(1, 0, 0),
            vector2: new THREE.Vector3(0, -1, 0),
            color: 0xff0000,
            caption: "x",
            textureIndex: 0
        },
        {
            vector: new THREE.Vector3(0, 1, 0),
            vector2: new THREE.Vector3(-1, 0, 0),
            color: 0x00ff00,
            caption: "y",
            textureIndex: 1
        },
        {
            vector: new THREE.Vector3(0, 0, 1),
            vector2: new THREE.Vector3(-1, 0, 0),
            color: 0x2020ff,
            caption: "z",
            textureIndex: 2
        },
    ]

    constructor(private world3d: World3dClass) {

    }


    show(): CoordinateSystemHelper3d {
        let origin = new THREE.Vector3(0, 0, 0);

        if (!this.axes[0].arrowHelper) {

            for (let axis of this.axes) {
                const texture = this.world3d.textureManager3d.getSpritesheetBasedTexture("standard_textures", axis.textureIndex);
                const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff, transparent: true });
                axis.sprite = new THREE.Sprite(material);
                axis.sprite.scale.set(0.2, 0.2, 0.2);
                axis.sprite.position.add(axis.vector.clone().multiplyScalar(0.8));
                axis.sprite.position.add(axis.vector2.clone().multiplyScalar(0.25));

                axis.arrowHelper = new THREE.ArrowHelper(axis.vector, origin, 1, axis.color, undefined, 0.08);

                this.world3d.scene.add(axis.sprite, axis.arrowHelper);
            }
        }

        for (let axis of this.axes) {
            this.world3d.scene.add(axis.arrowHelper!);
        }

        return this;
    }

    hide(){
        for(let axis of this.axes){
            this.world3d.scene.remove(axis.sprite, axis.arrowHelper);
        }
    }


}