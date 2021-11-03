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

class HelperImage3D extends THREE.Group {

    _onChangeTexture = null;
    set onChangeTexture(listener) {
        if (typeof listener === 'function' || listener === null)
            this._onChangeTexture = listener;
    }

    _onChangeGeometry = null;
    set onChangeGeometry(listener) {
        if (typeof listener === 'function' || listener === null)
            this._onChangeGeometry = listener;
    }

    _onChangeFocus = null;
    set onChangeFocus(listener) {
        if (typeof listener === 'function' || listener === null)
            this._onChangeFocus = listener;
    }

    _onChangeGreenScreenEnabled = null;
    set onChangeGreenScreenEnabled(listener) {
        if (typeof listener === 'function' || listener === null)
            this._onChangeGreenScreenEnabled = listener;
    }

    _imageMaterialOpacityCache = 1;
    _isFocused = false;
    get isFocused() { return this._isFocused }
    set isFocused(value) {
        if (typeof value === 'boolean' && this._isFocused !== value) {
            this._isFocused = value;
            if (this._onChangeFocus) {
                this._onChangeFocus(value);
            }
        }
    }
    
    get greenScreenEnabled() { return this._greenScreenView.visible }
    set greenScreenEnabled(value) {
        if (typeof value === 'boolean' && this._greenScreenEnabled !== value) {
            this._greenScreenView.visible = value;
            if (this._onChangeGreenScreenEnabled) {
                this._onChangeGreenScreenEnabled(value);
            }
        }
    }

    get textureWidth() {
        if (!(this._imageView.material.map instanceof THREE.Texture)) return 2;
        return this._imageView.material.map.image.width;
    }

    get textureHeight() {
        if (!(this._imageView.material.map instanceof THREE.Texture)) return 2;
        return this._imageView.material.map.image.height;
    }

    _greenScreenView = (() => {
        let mesh = new THREE.Mesh(
            new THREE.ShapeGeometry(new THREE.Shape([
                new THREE.Vector2(-1, 1),
                new THREE.Vector2(1, 1),
                new THREE.Vector2(1, -1),
                new THREE.Vector2(-1, -1)
            ])),
            new THREE.MeshBasicMaterial({
                transparent: true,
                side: THREE.DoubleSide,
                color: 0x00B140
            })
        );
        mesh.position.z = -10;
        mesh.scale.x = 500;
        mesh.scale.y = 500;
        mesh.visible = false;
        return mesh;
    })();

    _imageContainer = (() => {
        let group = new THREE.Group();
        group.visible = false;
        return group;
    })();

    _imageView = new THREE.Mesh(
        new THREE.ShapeGeometry(new THREE.Shape([
            new THREE.Vector2(-0.5, 0.5),
            new THREE.Vector2(0.5, 0.5),
            new THREE.Vector2(0.5, -0.5),
            new THREE.Vector2(-0.5, -0.5)
        ])),
        new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            blendSrcAlpha: THREE.OneFactor,
            blendDstAlpha: THREE.OneMinusSrcAlphaFactor
        })
    );
    get imageContainer() { return this._imageContainer }
    get imageView() { return this._imageView }
    get imagePosition() { return this._imageContainer.position }
    get imageScale() { return this._imageView.scale }
    get imageRotation() { return this._imageContainer.rotation }
    get imageGeometry() { return this._imageView.geometry }
    get imageMaterial() { return this._imageView.material }

    constructor() {
        super();
        this.add(this._greenScreenView);
        this.add(this._imageContainer);
        this._imageContainer.add(this._imageView);
        this._imageView.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            if (this._isFocused) {
                this._imageMaterialOpacityCache = material.opacity;
                material.opacity = 1;
            }
            material.depthTest = !this._isFocused;
            this._imageView.renderOrder = this._isFocused ? 200 : 0;
        };
        this._imageView.onAfterRender = (renderer, scene, camera, geometry, material, group) => {
            material.opacity = this._imageMaterialOpacityCache;
        };
    }

    updateWith({ helperImage }) {
        if (!(helperImage instanceof HelperImage)) return;
        this._imageContainer.position.x = helperImage.positionX;
        this._imageContainer.position.y = helperImage.positionY;
        this.imageScale.x = helperImage.scaleX;
        this.imageScale.y = helperImage.scaleY;
        this._imageContainer.rotation.z = helperImage.rotationAngle;
        this.imageMaterial.opacity = helperImage.opacity;
        this._imageMaterialOpacityCache = this.imageMaterial.opacity;
        this._greenScreenView.visible = helperImage.greenScreenEnabled;
        if (this.imageMaterial.map !== null
            && helperImage.imageData === this.imageMaterial.map.image.src) {
            if (this._onChangeTexture) {
                this._onChangeTexture(this.imageMaterial.map.image.src);
            }
            return;
        }
        if (this._onChangeTexture) {
            this._onChangeTexture(helperImage.imageData);
        }
        this.discardTexture();
        if (helperImage.imageData) {
            let loader = new THREE.TextureLoader();
            loader.load(helperImage.imageData, (texture) => {
                let image = texture.image;
                let width = image.width;
                let height = image.height;
                let points = [
                    new THREE.Vector3(-0.5 * width, 0.5 * height, 0),
                    new THREE.Vector3(0.5 * width, 0.5 * height, 0),
                    new THREE.Vector3(0.5 * width, -0.5 * height, 0),
                    new THREE.Vector3(-0.5 * width, -0.5 * height, 0)
                ];
                this.imageGeometry.setFromPoints(points);
                this.imageGeometry.attributes.position.needsUpdate = true;
                this.imageGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
                    0, 1, 1, 1, 1, 0, 0, 0
                ]), 2));
                this.imageGeometry.attributes.uv.needsUpdate = true;
                this.imageGeometry.computeBoundingBox();
                this.imageGeometry.computeBoundingSphere();
                this.imageMaterial.map = texture;
                this.imageMaterial.needsUpdate = true;
                this._imageContainer.visible = true;
                if (this._onChangeGeometry) {
                    this._onChangeGeometry();
                }
            });
        }
    }

    discardTexture() {
        if (this.imageMaterial.map instanceof THREE.Texture) {
            this.imageMaterial.map.dispose();
        }
        this.imageMaterial.map = null;
        this.imageMaterial.needsUpdate = true;
        this._imageContainer.visible = false;
    }
    
    free() {
        this.imageGeometry.dispose();
        this.imageMaterial.dispose();
    }

}
