import * as THREE from 'three';
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { Object3dClass } from "./Object3dClass";
import { Matrix4Class } from './Matrix4Class';
import { Vector3Class } from './Vector3Class';
import { Object3dBatchClass } from './Object3dBatchClass';

export class BatchedObject3dClass extends Object3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class BatchedObject3d extends Object3d", comment: JRC.BatchedObject3dClassComment },
        { type: "method", signature: "private BatchedObject3d()", native: BatchedObject3dClass.prototype._constructor },

        { type: "method", signature: "void move(double x,double y,double z)", native: BatchedObject3dClass.prototype.move },
        { type: "method", signature: "final void move(Vector3 v)", native: BatchedObject3dClass.prototype.vmove },
        { type: "method", signature: "void moveTo(double x,double y,double z)", native: BatchedObject3dClass.prototype.moveTo },
        { type: "method", signature: "final void moveTo(Vector3 p)", native: BatchedObject3dClass.prototype.vmoveTo },

        { type: "method", signature: "void rotateX(double angleDeg)", native: BatchedObject3dClass.prototype.rotateX },
        { type: "method", signature: "void rotateY(double angleDeg)", native: BatchedObject3dClass.prototype.rotateY },
        { type: "method", signature: "void rotateZ(double angleDeg)", native: BatchedObject3dClass.prototype.rotateZ },

        { type: "method", signature: "final void scaleX(double scale)", native: BatchedObject3dClass.prototype.scaleX },
        { type: "method", signature: "final void scaleY(double scale)", native: BatchedObject3dClass.prototype.scaleY },
        { type: "method", signature: "final void scaleZ(double scale)", native: BatchedObject3dClass.prototype.scaleZ },
        { type: "method", signature: "final void scale(Vector3 v)", native: BatchedObject3dClass.prototype.vscale },
        { type: "method", signature: "final void scale(double d)", native: BatchedObject3dClass.prototype.scaleDouble },

        { type: "method", signature: "final void applyMatrix4(Matrix4 matrix)", native: BatchedObject3dClass.prototype.applyMatrix4 },

        { type: "method", signature: "void setVisible(boolean isVisible)", native: BatchedObject3dClass.prototype.setVisible },
        
        { type: "method", signature: "void setColor(int color)", native: BatchedObject3dClass.prototype.setColor },


        { type: "method", signature: "void destroy()", native: BatchedObject3dClass.prototype.destroy },
        { type: "method", signature: "boolean isDestroyed()", native: BatchedObject3dClass.prototype._isDestroyed },


    ];

    isDestroyed: boolean = false;

    constructor(private batchedMesh: THREE.BatchedMesh, private instanceIndex: number, 
        private matrix4: THREE.Matrix4, private position: THREE.Vector3, 
        private batchObject3d: Object3dBatchClass
    ) {
        super();
    }

    move(x: number, y: number, z: number): void {
        this.position.add(new THREE.Vector3(x, y, z));
        this.matrix4 = new THREE.Matrix4().makeTranslation(x, y, z).multiply(this.matrix4);
        if (this.cameraLookingAtThisObject) this.cameraLookingAtThisObject.adjustViewingDirection();
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    moveTo(x: number, y: number, z: number): void {
        let delta = new THREE.Vector3(x, y, z).sub(this.position);
        this.position.set(x, y, z);
        this.matrix4 = new THREE.Matrix4().makeTranslation(delta.x, delta.y, delta.z).multiply(this.matrix4);
        if (this.cameraLookingAtThisObject) this.cameraLookingAtThisObject.adjustViewingDirection();
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    rotateX(angleDeg: number): void {
        this.matrix4 = new THREE.Matrix4().makeRotationX(angleDeg / 180 * Math.PI).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }
    rotateY(angleDeg: number): void {
        this.matrix4 = new THREE.Matrix4().makeRotationY(angleDeg / 180 * Math.PI).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }
    rotateZ(angleDeg: number): void {
        this.matrix4 = new THREE.Matrix4().makeRotationZ(angleDeg / 180 * Math.PI).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }


    scaleX(factor: number): void {
        this.matrix4 = new THREE.Matrix4().makeScale(factor, 1, 1).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    scaleY(factor: number): void {
        this.matrix4 = new THREE.Matrix4().makeScale(1, factor, 1).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    scaleZ(factor: number): void {
        this.matrix4 = new THREE.Matrix4().makeScale(1, 1, factor).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    applyMatrix4(matrix4: Matrix4Class) {
        this.matrix4 = new THREE.Matrix4().multiply(matrix4.m).multiply(this.matrix4);
        this.position.applyMatrix4(matrix4.m);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    vscale(factor: Vector3Class) {
        this.matrix4 = new THREE.Matrix4().makeScale(factor.v.x, factor.v.y, factor.v.z).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    scaleDouble(factor: number) {
        this.matrix4 = new THREE.Matrix4().makeScale(factor, factor, factor).multiply(this.matrix4);
        this.batchedMesh.setMatrixAt(this.instanceIndex, this.matrix4);
    }

    destroy() {
        if(!this.isDestroyed) {
            this.isDestroyed = true;
            //@ts-ignore
            this.batchedMesh.deleteInstance(this.instanceIndex);
        }
    }

    _isDestroyed(): boolean {
        return this.isDestroyed;
    }

    setVisible(isVisible: boolean) {
        this.batchedMesh.setVisibleAt(this.instanceIndex, isVisible);
    }

    setColor(color: number) {
        this.batchObject3d.setColorableMaterial();
        this.batchedMesh.setColorAt(this.instanceIndex, new THREE.Color(color));
    }

}