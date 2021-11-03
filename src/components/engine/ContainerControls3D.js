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

class ContainerControls3D extends THREE.Group {

    static channel = 3;

    static _renderOrder = 1000;

    static Type = {
        rotate: 0,
        resize: 1,
        top: 3,
        right: 5,
        bottom: 7,
        left: 9,
        move: 10
    }

    static shared = new ContainerControls3D();

    _shapesAttached = null;
    _containerBox = null;
    get containerBox() { return this._containerBox }

    _rotateControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });
    get rotationControlPosition() { return this._rotateControl.position }

    _resizeControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topLeftControl = new Button3D({ textureLocation: '../res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _topRightControl = new Button3D({ textureLocation: '../res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _rightControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomRightControl = new Button3D({ textureLocation: '../res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomControl = new Button3D({ textureLocation: '../res/dot.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

    _bottomLeftControl = new Button3D({ textureLocation: '../res/dotAlter.png', backgroundColor: new Color({ hexValue: 0xf2f2f2 }), depthTest: false });

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
        if (this._shapesAttached !== null) {
            controls.push(...this._shapesAttached);
        }
        return controls;
    }

    _activeControl = null;
    get activeControl() { return this._activeControl }
    set activeControl(value) {
        if (!(this.parent instanceof THREE.Object3D) ||
            this._shapesAttached === null ||
            !this.controls.includes(value)) {
            this._activeControl = null;
            return;
        }
        this._activeControl = value;
    }

    get activeWhich() {
        if (this._activeControl === null) return null;
        if (this._activeControl === this._rotateControl) {
            return ContainerControls3D.Type.rotate;
        } else if (this._activeControl === this._resizeControl) {
            return ContainerControls3D.Type.resize;
        } else if (this._activeControl === this._topControl) {
            return ContainerControls3D.Type.top;
        } else if (this._activeControl === this._rightControl) {
            return ContainerControls3D.Type.right;
        } else if (this._activeControl === this._bottomControl) {
            return ContainerControls3D.Type.bottom;
        } else if (this._activeControl === this._leftControl) {
            return ContainerControls3D.Type.left;
        } else if (this._shapesAttached !== null && this._shapesAttached.includes(this._activeControl)) {
            return ContainerControls3D.Type.move;
        }
        return null;
    }

    _controlSize = new Size({ width: 25, height: 25 });

    constructor() {
        super();
        this.renderOrder = ContainerControls3D._renderOrder;
        this.controls.forEach(a => {
            a.layers.set(ContainerControls3D.channel);
            this.add(a);
        });
    }

    attach({ toContainer3D }) {
        if (!(toContainer3D instanceof Container3D)) {
            this._shapesAttached = null;
            this._activeControl = null;
            this.removeFromParent();
            return;
        }

        let sublayers = toContainer3D.sublayers.slice(0);
        let containerBox = null;
        let symbolsInUse = [];
        while (sublayers.length > 0) {
            let sublayer = sublayers.shift();
            if (sublayer instanceof Container3D) {
                sublayers.push(...sublayer.sublayers);
            } else if (sublayer instanceof Symbol3D) {
                symbolsInUse.push(sublayer);
                let box = new THREE.Box3().setFromObject(sublayer.shape);
                if (containerBox === null) {
                    containerBox = box;
                } else {
                    containerBox = containerBox.union(box);
                }
            }
        }

        this._containerBox = containerBox;
        this._shapesAttached = symbolsInUse.map(a => a.shape);
        this.position.x = 0.5 * (containerBox.max.x + containerBox.min.x);
        this.position.y = 0.5 * (containerBox.max.y + containerBox.min.y);

        this._topLeftControl.position.x = containerBox.min.x - this.position.x;
        this._topLeftControl.position.y = containerBox.max.y - this.position.y;
        this._topControl.position.x = 0.5 * (containerBox.max.x + containerBox.min.x) - this.position.x;
        this._topControl.position.y = containerBox.max.y - this.position.y;
        this._topRightControl.position.x = containerBox.max.x - this.position.x;
        this._topRightControl.position.y = containerBox.max.y - this.position.y;
        this._rightControl.position.x = containerBox.max.x - this.position.x;
        this._rightControl.position.y = 0.5 * (containerBox.max.y + containerBox.min.y) - this.position.y;
        this._bottomRightControl.position.x = containerBox.max.x - this.position.x;
        this._bottomRightControl.position.y = containerBox.min.y - this.position.y;
        this._bottomControl.position.x = 0.5 * (containerBox.max.x + containerBox.min.x) - this.position.x;
        this._bottomControl.position.y = containerBox.min.y - this.position.y;
        this._bottomLeftControl.position.x = containerBox.min.x - this.position.x;
        this._bottomLeftControl.position.y = containerBox.min.y - this.position.y;
        this._leftControl.position.x = containerBox.min.x - this.position.x;
        this._leftControl.position.y = 0.5 * (containerBox.max.y + containerBox.min.y) - this.position.y;

        let v = new THREE.Vector2(this._topControl.position.x, this._topControl.position.y);
        v.normalize();
        this._resizeControl.position.x = 0;
        this._resizeControl.position.y = 0;
        this._rotateControl.position.x = this._topControl.position.x + 40 * v.x;
        this._rotateControl.position.y = this._topControl.position.y + 40 * v.y;

        toContainer3D.add(this);
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
