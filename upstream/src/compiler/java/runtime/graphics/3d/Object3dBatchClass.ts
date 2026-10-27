import * as THREE from 'three';
import { CallbackParameter } from "../../../../common/interpreter/CallbackParameter";
import { Thread } from "../../../../common/interpreter/Thread";
import { JRC } from "../../../language/JavaRuntimeLibraryComments";
import { LibraryDeclarations } from "../../../module/libraries/DeclareType";
import { ObjectClass } from "../../system/javalang/ObjectClassStringClass";
import { Mesh3dClass } from "./Mesh3dClass";
import { BatchedObject3dClass } from './BatchedObject3dClass';
import { Object3dClass } from './Object3dClass';
import { Material3dClass } from './materials/Material3dClass';
import type { Matrix4Class } from './Matrix4Class';
import type { Vector3Class } from './Vector3Class';

export class Object3dBatchClass extends Object3dClass {

    static __javaDeclarations: LibraryDeclarations = [
        { type: "declaration", signature: "class Object3dBatch extends Object3d", comment: JRC.Object3dBatchClassComment },
        { type: "method", signature: "Object3dBatch(Mesh3d template, int maxInstanceCount)", java: Object3dBatchClass.prototype._cj$_constructor_$Object3dBatch$Mesh3d$int, comment: JRC.Object3dBatchConstructorComment },
        { type: "method", signature: "BatchedObject3d createInstance()", native: Object3dBatchClass.prototype.createInstance, comment: JRC.Object3dBatchCreateInstanceComment },
        { type: "method", signature: "void setOpacity(float opacity)", native: Object3dBatchClass.prototype.setOpacity, comment: JRC.Object3dBatchSetOpacityComment },

        { type: "method", signature: "void move(double x,double y,double z)", native: Object3dBatchClass.prototype.move },
        { type: "method", signature: "final void move(Vector3 v)", native: Object3dBatchClass.prototype.vmove },
        { type: "method", signature: "void moveTo(double x,double y,double z)", native: Object3dBatchClass.prototype.moveTo },
        { type: "method", signature: "final void moveTo(Vector3 p)", native: Object3dBatchClass.prototype.vmoveTo },

        { type: "method", signature: "void rotateX(double angleDeg)", native: Object3dBatchClass.prototype.rotateX },
        { type: "method", signature: "void rotateY(double angleDeg)", native: Object3dBatchClass.prototype.rotateY },
        { type: "method", signature: "void rotateZ(double angleDeg)", native: Object3dBatchClass.prototype.rotateZ },

        { type: "method", signature: "final void scaleX(double scale)", native: Object3dBatchClass.prototype.scaleX },
        { type: "method", signature: "final void scaleY(double scale)", native: Object3dBatchClass.prototype.scaleY },
        { type: "method", signature: "final void scaleZ(double scale)", native: Object3dBatchClass.prototype.scaleZ },
        { type: "method", signature: "final void scale(Vector3 v)", native: Object3dBatchClass.prototype.vscale },
        { type: "method", signature: "final void scale(double d)", native: Object3dBatchClass.prototype.scaleDouble },

        { type: "method", signature: "final void applyMatrix4(Matrix4 matrix)", native: Object3dBatchClass.prototype.applyMatrix4 },

        { type: "method", signature: "void destroy()", native: Object3dBatchClass.prototype.destroy },
    ];

    batchedMesh: THREE.BatchedMesh;
    geometryID: number;
    template: Mesh3dClass;
    material: Material3dClass;
    opacity: number = 1.0;

    _cj$_constructor_$Object3dBatch$Mesh3d$int(t: Thread, callback: CallbackParameter, template: Mesh3dClass, maxInstanceCount: number) {
        t.s.push(this);

        this.template = template;
        let maxVertexCount: number = template._geometry.attributes.position.count * 8;
        this.material = template.material
        this.batchedMesh = new THREE.BatchedMesh(maxInstanceCount, maxVertexCount, maxVertexCount * 2,
            this.material.getMaterialAndIncreaseUsageCounter());
        this.batchedMesh.sortObjects = true;
        this.batchedMesh.frustumCulled = false;

        this.template.mesh.updateMatrixWorld(true);

        this.geometryID = this.batchedMesh.addGeometry(template._geometry.clone());

        this.template.world3d.scene.add(this.batchedMesh);

        if (callback) callback();
    }

    setColorableMaterial() {
        if (this.material) {
            this.material.destroyIfNotUsedByOtherMesh();
            this.material = null;
            this.batchedMesh.material = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: this.opacity,
                color: 0xffffff,
            });
            this.batchedMesh.material.needsUpdate = true;
        }
    }

    setOpacity(opacity: number) {
        this.opacity = opacity;
        if (this.batchedMesh.material instanceof THREE.MeshBasicMaterial) {
            this.batchedMesh.material.opacity = opacity;
            this.batchedMesh.material.needsUpdate = true;
        }
    }

    createInstance(): Object3dClass {
        let instanceID = this.batchedMesh.addInstance(this.geometryID);
        let matrix = this.template.mesh.matrix.clone();
        this.batchedMesh.setMatrixAt(instanceID, matrix);


        let object = new BatchedObject3dClass(this.batchedMesh, instanceID, matrix,
            this.template.mesh.position.clone(), this);

        return object;
    }

    destroy() {
        this.batchedMesh.dispose();
        this.template.material.destroyIfNotUsedByOtherMesh();
    }

        move(x: number, y: number, z: number): void {
            this.batchedMesh.position.add(new THREE.Vector3(x, y, z));
        }
    
        moveTo(x: number, y: number, z: number): void {
            this.batchedMesh.position.set(x, y, z);
        }
    
        rotateX(angleDeg: number): void {
            this.batchedMesh.rotateX(angleDeg / 180 * Math.PI);
        }
        rotateY(angleDeg: number): void {
            this.batchedMesh.rotateY(angleDeg / 180 * Math.PI);
        }
        rotateZ(angleDeg: number): void {
            this.batchedMesh.rotateZ(angleDeg / 180 * Math.PI);
        }
    
    
        scaleX(factor: number): void {
            this.batchedMesh.scale.x *= factor;
        }
    
        scaleY(factor: number): void {
            this.batchedMesh.scale.y *= factor;
        }
    
        scaleZ(factor: number): void {
            this.batchedMesh.scale.z *= factor;
        }
    
    
        applyMatrix4(matrix4: Matrix4Class) {
            this.batchedMesh.applyMatrix4(matrix4.m);
        }
    
        vscale(factor: Vector3Class) {
            this.batchedMesh.scale.copy(factor.v);
        }
    
        scaleDouble(factor: number) {
            this.batchedMesh.scale.multiplyScalar(factor);
        }
    
} 