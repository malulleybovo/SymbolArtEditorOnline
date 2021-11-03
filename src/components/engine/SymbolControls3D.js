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

class SymbolControls3D extends THREE.Group {

    static channel = 3;

    static _renderOrder = 1000;

    static Type = {
        rotate: 0,
        resize: 1,
        topLeft: 2,
        top: 3,
        topRight: 4,
        right: 5,
        bottomRight: 6,
        bottom: 7,
        bottomLeft: 8,
        left: 9,
        move: 10
    }

    static shared = new SymbolControls3D();

    _shapeAttached = null;

    _rotateControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });
    get rotationControlPosition() { return this._rotateControl.position }

    _resizeControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topLeftControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topRightControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _rightControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomRightControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomLeftControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _leftControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    get controls() {
        let controls = [
            this._rotateControl,
            this._resizeControl,
            this._topLeftControl,
            this._topControl,
            this._topRightControl,
            this._rightControl,
            this._bottomRightControl,
            this._bottomControl,
            this._bottomLeftControl,
            this._leftControl
        ];
        if (this._shapeAttached instanceof THREE.Object3D) {
            controls.push(this._shapeAttached);
        }
        return controls;
    }

    _activeControl = null;
    get activeControl() { return this._activeControl }
    set activeControl(value) {
        if (!(this.parent instanceof THREE.Object3D) ||
            !(this._shapeAttached instanceof THREE.Object3D) ||
            !this.controls.includes(value)) {
            this._activeControl = null;
            return;
        }
        this._activeControl = value;
    }

    get activeWhich() {
        if (this._activeControl === null) return null;
        if (this._activeControl === this._rotateControl) {
            return SymbolControls3D.Type.rotate;
        } else if (this._activeControl === this._resizeControl) {
            return SymbolControls3D.Type.resize;
        } else if (this._activeControl === this._topLeftControl) {
            return SymbolControls3D.Type.topLeft;
        } else if (this._activeControl === this._topControl) {
            return SymbolControls3D.Type.top;
        } else if (this._activeControl === this._topRightControl) {
            return SymbolControls3D.Type.topRight;
        } else if (this._activeControl === this._rightControl) {
            return SymbolControls3D.Type.right;
        } else if (this._activeControl === this._bottomRightControl) {
            return SymbolControls3D.Type.bottomRight;
        } else if (this._activeControl === this._bottomControl) {
            return SymbolControls3D.Type.bottom;
        } else if (this._activeControl === this._bottomLeftControl) {
            return SymbolControls3D.Type.bottomLeft;
        } else if (this._activeControl === this._leftControl) {
            return SymbolControls3D.Type.left;
        } else if (this._activeControl === this._shapeAttached) {
            return SymbolControls3D.Type.move;
        }
        return null;
    }

    _controlSize = new Size({ width: 25, height: 25 });

    constructor() {
        super();
        this.renderOrder = SymbolControls3D._renderOrder;
        this.controls.forEach(a => {
            a.layers.set(SymbolControls3D.channel);
            this.add(a);
        });
    }

    attach({ toSymbol3D }) {
        if (!(toSymbol3D instanceof Symbol3D)) {
            this._shapeAttached = null;
            this._activeControl = null;
            this.removeFromParent();
            return;
        }
        let shape = toSymbol3D.shape;
        let vertexBuffer = shape.geometry.attributes.position.array;

        this._shapeAttached = shape;
        this.position.x = shape.position.x;
        this.position.y = shape.position.y;

        this._topLeftControl.position.x = vertexBuffer[0];
        this._topLeftControl.position.y = vertexBuffer[1];
        this._topControl.position.x = 0.5 * (vertexBuffer[3] + vertexBuffer[0]);
        this._topControl.position.y = 0.5 * (vertexBuffer[4] + vertexBuffer[1]);
        this._topRightControl.position.x = vertexBuffer[3];
        this._topRightControl.position.y = vertexBuffer[4];
        this._rightControl.position.x = 0.5 * (vertexBuffer[3] + vertexBuffer[6]);
        this._rightControl.position.y = 0.5 * (vertexBuffer[4] + vertexBuffer[7]);
        this._bottomRightControl.position.x = vertexBuffer[6];
        this._bottomRightControl.position.y = vertexBuffer[7];
        this._bottomControl.position.x = 0.5 * (vertexBuffer[6] + vertexBuffer[9]);
        this._bottomControl.position.y = 0.5 * (vertexBuffer[7] + vertexBuffer[10]);
        this._bottomLeftControl.position.x = vertexBuffer[9];
        this._bottomLeftControl.position.y = vertexBuffer[10];
        this._leftControl.position.x = 0.5 * (vertexBuffer[9] + vertexBuffer[0]);
        this._leftControl.position.y = 0.5 * (vertexBuffer[10] + vertexBuffer[1]);

        let v = new THREE.Vector2(this._topControl.position.x, this._topControl.position.y);
        v.normalize();
        this._resizeControl.position.x = 0;
        this._resizeControl.position.y = 0;
        this._rotateControl.position.x = this._topControl.position.x + 40 * v.x;
        this._rotateControl.position.y = this._topControl.position.y + 40 * v.y;

        toSymbol3D.add(this);
    }

    setScaling({ factor }) {
        if (typeof factor !== 'number' || Number.isNaN(factor) || !Number.isFinite(factor)) return;
        let size = new Size({
            width: Math.round(this._controlSize.width * factor),
            height: Math.round(this._controlSize.height * factor)
        });
        this.controls.forEach(a => {
            if (a instanceof Button3D) a.size = size;
        });
    }

}
