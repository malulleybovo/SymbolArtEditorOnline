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

class Button3D extends THREE.Mesh {

    static State = Object.freeze({
        normal: 'normal',
        selected: 'selected'
    });
    
    static _geometry = new THREE.PlaneGeometry(1, 1);

    static _texturesInUse = {};
    static _materialsInUse = {};
    static _textureLoaderListeners = {};

    static _baseMaterial = new THREE.MeshBasicMaterial();

    _hasInitialized = false;

    _size = new Size({ width: 20, height: 20 });
    get size() { return this._size }
    set size(value) {
        if (!(value instanceof Size)) return;
        this._size = value;
        if (this._hasInitialized) this._update();
    }

    _backgroundColor = new Color();
    get backgroundColor() { return this._backgroundColor }
    set backgroundColor(value) {
        if (!(value instanceof Color)) return;
        this._backgroundColor = value;
        if (this._hasInitialized) this._update();
    }

    _alpha = 1;
    get alpha() { return this._alpha }
    set alpha(value) {
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) return;
        this._alpha = (value > 1) ? 1 : (value < 0) ? 0 : Number((value).toFixed(5));
        if (this._hasInitialized) this._update();
    }

    _state = Button3D.State.normal;
    get isSelected() { return this._state === Button3D.State.selected }
    set isSelected(value) {
        if (typeof value !== 'boolean') return;
        this._state = value ? Button3D.State.selected : Button3D.State.normal;
        if (this._hasInitialized) this._update();
    }

    _depthTest = true;
    get depthTest() { return this._depthTest }
    set depthTest(value) {
        if (typeof value !== 'boolean') return;
        this._depthTest = value;
    }

    _materialKeys = (() => {
        let dictionary = {};
        for (var key in Object.keys(Button3D.State)) {
            dictionary[`${Button3D.State[key]}`] = '';
        }
        return dictionary;
    })();

    _textureLocations = (() => {
        let dictionary = {};
        for (var key in Object.keys(Button3D.State)) {
            dictionary[`${Button3D.State[key]}`] = '';
        }
        return dictionary;
    })();

    _backgroundColors = (() => {
        let dictionary = {};
        for (var key in Object.keys(Button3D.State)) {
            dictionary[`${Button3D.State[key]}`] = new Color();
        }
        return dictionary;
    })();

    setTexture({ atLocation, backgroundColor, forState }) {
        if (typeof atLocation !== 'string' || typeof forState !== 'string') return;
        let currentMaterialKey = this._materialKeys[forState];
        let materialKey = `${atLocation}/${forState}/${backgroundColor.hex}/${this._alpha}/${this._depthTest ? 1 : 0}`;
        if (materialKey === currentMaterialKey) return;
        if (Button3D._materialsInUse[currentMaterialKey]) {
            Button3D._materialsInUse[currentMaterialKey].references -= 1;
            if (Button3D._materialsInUse[currentMaterialKey].references <= 0) {
                Button3D._materialsInUse[currentMaterialKey].material.dispose();
                delete Button3D._materialsInUse[currentMaterialKey];
            }
        }
        if (!Button3D._materialsInUse[materialKey]) {
            Button3D._materialsInUse[materialKey] = {
                references: 1,
                material: (() => {
                    let material = new THREE.MeshBasicMaterial({
                        transparent: true,
                        depthTest: this._depthTest
                    });
                    material.blending = THREE.CustomBlending;
                    material.blendSrc = THREE.OneFactor;
                    material.blendDst = THREE.OneMinusSrcAlphaFactor;
                    material.color.set(backgroundColor.value);
                    material.opacity = this._alpha;
                    return material;
                })()
            }
        } else {
            Button3D._materialsInUse[materialKey].references += 1;
        }
        this._materialKeys[forState] = materialKey;
        let textureLocation = atLocation;
        this._textureLocations[forState] = textureLocation;
        this._backgroundColors[forState] = backgroundColor;
        let materialObject = Button3D._materialsInUse[materialKey];
        if (Button3D._texturesInUse[textureLocation] || Button3D._textureLoaderListeners[textureLocation]) {
            if (Button3D._textureLoaderListeners[textureLocation]) {
                Button3D._textureLoaderListeners[textureLocation].push(materialObject);
            } else {
                materialObject.material.map = Button3D._texturesInUse[textureLocation];
                materialObject.material.needsUpdate = true;
            }
        } else {
            Button3D._textureLoaderListeners[textureLocation] = [materialObject];
            let loader = new THREE.TextureLoader();
            loader.load(textureLocation, (texture) => {
                Button3D._texturesInUse[textureLocation] = texture;
                let materialObjects = Button3D._textureLoaderListeners[textureLocation];
                for (var index in materialObjects) {
                    materialObjects[index].material.map = texture;
                    materialObjects[index].material.needsUpdate = true;
                }
                delete Button3D._textureLoaderListeners[textureLocation];
            });
        }
    }

    _update() {
        this.setTexture({ atLocation: this._textureLocations[this._state], backgroundColor: this._backgroundColors[this._state], forState: this._state });
        this.material = Button3D._materialsInUse[this._materialKeys[this._state]].material;
        this.scale.x = this._size.width;
        this.scale.y = this._size.height;
    }
    
    constructor({ textureLocation, backgroundColor, alpha = null, depthTest = null }) {
        super(Button3D._geometry, Button3D._baseMaterial);
        this.alpha = alpha;
        this._depthTest = depthTest;
        this.setTexture({ atLocation: textureLocation, backgroundColor: backgroundColor, forState: this._state });
        this._update();
        this._hasInitialized = true;
    }

}
