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

class HelperImageControls3D extends THREE.Group {

    static channel = 3;

    static _renderOrder = 1000;

    static Type = {
        rotate: 0,
        resize: 1,
        move: 2
    }

    static shared = new HelperImageControls3D();

    _objectAttached = null;

    _rotateControl = new Button3D({ textureLocation: 'res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });
    get rotationControlPosition() { return this._rotateControl.position }

    _resizeControl = new Button3D({ textureLocation: 'res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topLeftControl = new Button3D({ textureLocation: 'res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topRightControl = new Button3D({ textureLocation: 'res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomRightControl = new Button3D({ textureLocation: 'res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomLeftControl = new Button3D({ textureLocation: 'res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });
    
    get controls() {
        let controls = [
            this._rotateControl,
            this._resizeControl,
            this._topLeftControl,
            this._topRightControl,
            this._bottomLeftControl,
            this._bottomRightControl
        ];
        if (this._objectAttached instanceof THREE.Object3D) {
            controls.push(this._objectAttached);
        }
        return controls;
    }

    _activeControl = null;
    get activeControl() { return this._activeControl }
    set activeControl(value) {
        if (!this.controls.includes(value)) {
            this._activeControl = null;
            return;
        }
        this._activeControl = value;
    }

    get activeWhich() {
        if (this._activeControl === null) return null;
        if (this._activeControl === this._rotateControl) {
            return HelperImageControls3D.Type.rotate;
        } else if (this._activeControl === this._resizeControl) {
            return HelperImageControls3D.Type.resize;
        } else if (this._activeControl === this._objectAttached) {
            return HelperImageControls3D.Type.move;
        }
        return null;
    }

    _controlSize = new Size({ width: 25, height: 25 });

    constructor() {
        super();
        this.renderOrder = HelperImageControls3D._renderOrder;
        this.controls.forEach(a => {
            a.layers.set(HelperImageControls3D.channel);
            this.add(a);
        });
    }

    attach({ toHelperImage }) {
        if (!(toHelperImage instanceof HelperImage3D)) {
            this._objectAttached = null;
            this.removeFromParent();
            return;
        }
        this._objectAttached = toHelperImage.imageView;
        this.layoutIfNeeded();
        toHelperImage.imageContainer.add(this);
    }

    layoutIfNeeded() {
        if (this._objectAttached === null) return;
        let vertexBuffer = this._objectAttached.geometry.attributes.position.array;
        let scale = this._objectAttached.scale;
        let topX = scale.x * 0.5 * (vertexBuffer[3] + vertexBuffer[0]);
        let topY = scale.y * 0.5 * (vertexBuffer[4] + vertexBuffer[1]);
        let v = new THREE.Vector2(topX, topY);
        v.normalize();
        this._resizeControl.position.x = 0;
        this._resizeControl.position.y = 0;
        this._rotateControl.position.x = topX + 40 * v.x;
        this._rotateControl.position.y = topY + 40 * v.y;
        this._topLeftControl.position.x = scale.x * vertexBuffer[0];
        this._topLeftControl.position.y = scale.y * vertexBuffer[1];
        this._topRightControl.position.x = scale.x * vertexBuffer[3];
        this._topRightControl.position.y = scale.y * vertexBuffer[4];
        this._bottomRightControl.position.x = scale.x * vertexBuffer[6];
        this._bottomRightControl.position.y = scale.y * vertexBuffer[7];
        this._bottomLeftControl.position.x = scale.x * vertexBuffer[9];
        this._bottomLeftControl.position.y = scale.y * vertexBuffer[10];
    }

    setScaling({ factor }) {
        if (typeof factor !== 'number' || Number.isNaN(factor) || !Number.isFinite(factor)) return;
        let size = new Size({
            width: Math.round(this._controlSize.width * factor),
            height: Math.round(this._controlSize.height * factor)
        });
        this.controls.forEach(a => {
            a.size = size;
        });
    }

}
