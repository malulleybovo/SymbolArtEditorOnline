/**
 * Symbol Art Editor
 * 
 * @author malulleybovo (since 2021)
 * @license GNU General Public License v3.0
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2021  Arthur Malulley B. de O.
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

class Animation3D extends Identifiable {

    static defaultNumberOfFrames = 10;

    _mesh = null;
    get mesh() { return this._mesh }
    set mesh(value) {
        if (!this.isValid({ mesh: value })) return;
        this._mesh = value;
    }

    _material = null;
    get material() { return this._material }
    set material(value) {
        if (!this.isValid({ material: value })) return;
        this._material = value;
    }

    _targetPositionX = null;
    get targetPositionX() { return this._targetPositionX }
    set targetPositionX(value) {
        if (!this.isValid({ number: value })) return;
        this._targetPositionX = value;
    }

    _targetPositionY = null;
    get targetPositionY() { return this._targetPositionY }
    set targetPositionY(value) {
        if (!this.isValid({ number: value })) return;
        this._targetPositionY = value;
    }

    _targetPositionZ = null;
    get targetPositionZ() { return this._targetPositionZ }
    set targetPositionZ(value) {
        if (!this.isValid({ number: value })) return;
        this._targetPositionZ = value;
    }

    _targetScaleX = null;
    get targetScaleX() { return this._targetScaleX }
    set targetScaleX(value) {
        if (!this.isValid({ number: value })) return;
        this._targetScaleX = value;
    }

    _targetScaleY = null;
    get targetScaleY() { return this._targetScaleY }
    set targetScaleY(value) {
        if (!this.isValid({ number: value })) return;
        this._targetScaleY = value;
    }

    _targetScaleZ = null;
    get targetScaleZ() { return this._targetScaleZ }
    set targetScaleZ(value) {
        if (!this.isValid({ number: value })) return;
        this._targetScaleZ = value;
    }


    _targetRotationX = null;
    get targetRotationX() { return this._targetRotationX }
    set targetRotationX(value) {
        if (!this.isValid({ number: value })) return;
        this._targetRotationX = value;
    }

    _targetRotationY = null;
    get targetRotationY() { return this._targetRotationY }
    set targetRotationY(value) {
        if (!this.isValid({ number: value })) return;
        this._targetRotationY = value;
    }

    _targetRotationZ = null;
    get targetRotationZ() { return this._targetRotationZ }
    set targetRotationZ(value) {
        if (!this.isValid({ number: value })) return;
        this._targetRotationZ = value;
    }

    _opacity = null;
    get opacity() { return this._opacity }
    set opacity(value) {
        if (!this.isValid({ number: value })) return;
        this._opacity = value;
    }

    _durationInFrames = Animation3D.defaultNumberOfFrames;
    _framesLeft = Animation3D.defaultNumberOfFrames;
    get durationInFrames() { return this._durationInFrames }
    set durationInFrames(value) {
        if (!this.isValid({ duration: value })) return;
        this._durationInFrames = value;
        this._framesLeft = value;
    }

    _delayInFrames = 0;
    get delayInFrames() { return this._delayInFrames }
    set delayInFrames(value) {
        if (!this.isValid({ duration: value })) return;
        this._delayInFrames = value;
    }

    _completion = null;
    get completion() { return this._completion }
    set completion(value) {
        if (value === null || typeof value === 'function') this._completion = value;
    }

    get completed() { return this._framesLeft <= 0 }

    constructor({ mesh = null, material = null, targetPositionX = null, targetPositionY = null, targetPositionZ = null, targetScaleX = null, targetScaleY = null, targetScaleZ = null, targetRotationX = null, targetRotationY = null, targetRotationZ = null, opacity = null, durationInFrames = null, delayInFrames = null, completion = null }) {
        super();
        this.mesh = mesh;
        this.material = material;
        this.targetPositionX = targetPositionX;
        this.targetPositionY = targetPositionY;
        this.targetPositionZ = targetPositionZ;
        this.targetScaleX = targetScaleX;
        this.targetScaleY = targetScaleY;
        this.targetScaleZ = targetScaleZ;
        this.targetRotationX = targetRotationX;
        this.targetRotationY = targetRotationY;
        this.targetRotationZ = targetRotationZ;
        this.opacity = opacity;
        this.durationInFrames = durationInFrames;
        this.delayInFrames = delayInFrames;
        this.completion = completion;
    }

    isValid({ mesh = undefined, material = undefined, number = undefined, duration = undefined } = {}) {
        if (typeof mesh === 'undefined' && typeof material === 'undefined' && typeof number === 'undefined' && typeof duration === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (typeof mesh !== 'undefined') {
            valid = mesh instanceof THREE.Object3D;
        }
        if (valid && typeof material !== 'undefined') {
            valid = material instanceof THREE.Material;
        }
        if (valid && typeof number !== 'undefined') {
            valid = typeof number === 'number';
        }
        if (valid && typeof duration !== 'undefined') {
            valid = typeof duration === 'number'
                && Number.isInteger(duration)
                && duration > 0;
        }
        return valid;
    }

    animateOneFrame() {
        if (this._durationInFrames <= 0 || this._framesLeft <= 0) {
            this._framesLeft = 0;
            return;
        }
        if (this._delayInFrames > 1) {
            this._delayInFrames -= 1;
            return;
        }
        this._framesLeft -= 1;
        if (this._material != null) {
            if (this._opacity !== null) {
                if (this._framesLeft === 0) this._material.opacity = this._opacity
                else this._material.opacity += (this._opacity - this._material.opacity) / this._framesLeft;
            }
        }
        if (this._mesh !== null) {
            if (this._targetPositionX !== null) {
                if (this._framesLeft === 0) this._mesh.position.x = this._targetPositionX;
                else this._mesh.position.x += (this._targetPositionX - this._mesh.position.x) / this._framesLeft;
            }
            if (this._targetPositionY !== null) {
                if (this._framesLeft === 0) this._mesh.position.y = this._targetPositionY;
                else this._mesh.position.y += (this._targetPositionY - this._mesh.position.y) / this._framesLeft;
            }
            if (this._targetPositionZ !== null) {
                if (this._framesLeft === 0) this._mesh.position.z = this._targetPositionZ;
                else this._mesh.position.z += (this._targetPositionZ - this._mesh.position.z) / this._framesLeft;
            }
            if (this._targetScaleX !== null) {
                if (this._framesLeft === 0) this._mesh.scale.x = this._targetScaleX
                else this._mesh.scale.x += (this._targetScaleX - this._mesh.scale.x) / this._framesLeft;
            }
            if (this._targetScaleY !== null) {
                if (this._framesLeft === 0) this._mesh.scale.y = this._targetScaleY
                else this._mesh.scale.y += (this._targetScaleY - this._mesh.scale.y) / this._framesLeft;
            }
            if (this._targetScaleZ !== null) {
                if (this._framesLeft === 0) this._mesh.scale.z = this._targetScaleZ
                else this._mesh.scale.z += (this._targetScaleZ - this._mesh.scale.z) / this._framesLeft;
            }
            if (this._targetRotationX !== null) {
                if (this._framesLeft === 0) this._mesh.rotation.x = this._targetRotationX
                else this._mesh.rotation.x += (this._targetRotationX - this._mesh.rotation.x) / this._framesLeft;
            }
            if (this._targetRotationY !== null) {
                if (this._framesLeft === 0) this._mesh.rotation.y = this._targetRotationY
                else this._mesh.rotation.y += (this._targetRotationY - this._mesh.rotation.y) / this._framesLeft;
            }
            if (this._targetRotationZ !== null) {
                if (this._framesLeft === 0) this._mesh.rotation.z = this._targetRotationZ
                else this._mesh.rotation.z += (this._targetRotationZ - this._mesh.rotation.z) / this._framesLeft;
            }
        }
        if (this._framesLeft === 0 && typeof this._completion === 'function') {
            this._completion();
            this._completion = null;
        }
    }

}
