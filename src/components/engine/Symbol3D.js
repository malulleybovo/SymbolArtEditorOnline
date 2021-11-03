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

class Symbol3D extends Layer3D {

    static channel = 2;
    static previewChannel = 4;

    static _outlineGeometry = new THREE.PlaneGeometry(SymbolArt.usableDimensions.width, SymbolArt.usableDimensions.height);
    static _outlineEdges = new THREE.EdgesGeometry(Symbol3D._outlineGeometry);

    static _texturesInUse = {};
    static _materialsInUse = {};
    static _unfocusedMaterials = {};
    static _textureLoaderListeners = {};

    static updateDimensions() {
        Symbol3D._outlineGeometry.dispose();
        Symbol3D._outlineGeometry = new THREE.PlaneGeometry(SymbolArt.usableDimensions.width, SymbolArt.usableDimensions.height);
        Symbol3D._outlineEdges.dispose();
        Symbol3D._outlineEdges = new THREE.EdgesGeometry(Symbol3D._outlineGeometry);
    }

    _plane = (() => {
        let plane = new THREE.Mesh(Symbol3D._outlineGeometry, Layer3D.backgroundMaterial);
        plane.position.z = -0.02;
        return plane;
    })();
    get plane() { return this._plane }

    _outline = (() => {
        let outline = new THREE.LineSegments(Symbol3D._outlineEdges, Layer3D.outlineMaterial);
        outline.position.z = 0.005;
        return outline;
    })();

    _shape = null;
    get shape() { return this._shape }

    _shapeOutline = null;

    _copyButton = (() => {
        let mesh = new Button3D({ textureLocation: 'res/clone.png', backgroundColor: new Color({ hexValue: 0x808080 }) });
        mesh.position.x = -0.5 * mesh.size.width;
        mesh.position.y = -0.5 * SymbolArt.usableDimensions.height - 0.5 * mesh.size.height - 10;
        mesh.position.z = -0.5 * mesh.size.width - 5;
        mesh.rotation.y = -0.5 * Math.PI;
        return mesh;
    })();
    get copyButton() { return this._copyButton }

    _hideShowButton = (() => {
        let mesh = new Button3D({ textureLocation: 'res/eyeOpen.png', backgroundColor: new Color({ hexValue: 0x808080 }) });
        mesh.setTexture({ atLocation: 'res/eyeClosed.png', backgroundColor: new Color({ hexValue: 0xCA3433 }), forState: Button3D.State.selected });
        mesh.position.x = -0.5 * mesh.size.width;
        mesh.position.y = -0.5 * SymbolArt.usableDimensions.height - 0.5 * mesh.size.height - 10;
        mesh.position.z = 0.5 * mesh.size.width + 5;
        mesh.rotation.y = -0.5 * Math.PI;
        return mesh;
    })();
    get hideShowButton() { return this._hideShowButton }

    _materialKey = '';

    get layerUuid() { return this._plane.userData.layerUuid }
    get contentCenter() {
        return new THREE.Vector2(this._shape.position.x, this._shape.position.y);
    }

    get isSelected() { return this._outline.material === Layer3D.selectedOutlineMaterial }
    set isSelected(value) {
        if (typeof value !== 'boolean') return;
        this._outline.material = value ? Layer3D.selectedOutlineMaterial : Layer3D.outlineMaterial;
    }

    set previewable(value) {
        if (typeof value !== 'boolean') return;
        if (value) this._shape.layers.enable(Symbol3D.previewChannel);
        else this._shape.layers.disable(Symbol3D.previewChannel);
    }

    set isFocused(value) {
        let wasFocused = this._isFocused;
        super.isFocused = value;
        if (wasFocused && !this._isFocused) {
            if (!Symbol3D._unfocusedMaterials[this._materialKey]) {
                let clone = this._shape.material.clone();
                clone.opacity /= 4;
                Symbol3D._unfocusedMaterials[this._materialKey] = {
                    references: [this],
                    material: clone
                }
            } else if (!Symbol3D._unfocusedMaterials[this._materialKey].references.includes(this)) {
                Symbol3D._unfocusedMaterials[this._materialKey].references.push(this);
            }
            this._shape.material = Symbol3D._unfocusedMaterials[this._materialKey].material;
        } else if (this._isFocused && Symbol3D._materialsInUse[this._materialKey]
            && this._shape.material !== Symbol3D._materialsInUse[this._materialKey].material) {
            if (Symbol3D._unfocusedMaterials[this._materialKey]
                && Symbol3D._unfocusedMaterials[this._materialKey].references.includes(this)) {
                Symbol3D._unfocusedMaterials[this._materialKey].references = Symbol3D._unfocusedMaterials[this._materialKey].references.filter(a => a !== this);
                setTimeout(_ => {
                    if (!this._isFocused || !Symbol3D._unfocusedMaterials[this._materialKey]) return;
                    if (Symbol3D._unfocusedMaterials[this._materialKey].references.length === 0) {
                        Symbol3D._unfocusedMaterials[this._materialKey].material.dispose();
                        delete Symbol3D._unfocusedMaterials[this._materialKey];
                    }
                }, 1000);
            }
            this._shape.material = Symbol3D._materialsInUse[this._materialKey].material;
        }
    }

    constructor({ representingSymbol }) {
        super();
        if (!(representingSymbol instanceof Symbol))
            throw new TypeError(`Expected "representingSymbol" of type Symbol but got "${representingSymbol.constructor.name}"`);
        Layer3D.layersInUse[representingSymbol.uuid] = this;

        this._plane.userData.layerUuid = representingSymbol.uuid;
        this._plane.add(this._outline);
        this.add(this._plane);
        this.add(this._copyButton);
        this.add(this._hideShowButton);
        
        let symbolShape = new THREE.Shape([
            new THREE.Vector2(-1, 1),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, -1),
            new THREE.Vector2(-1, -1)
        ]);
        let symbolGeometry = new THREE.ShapeGeometry(symbolShape);
        let symbolEdges = new THREE.EdgesGeometry(symbolGeometry);
        this._shapeOutline = new THREE.LineSegments(symbolEdges, Layer3D.outlineMaterial);
        this._shapeOutline.position.z = 0.025;
        this._plane.add(this._shapeOutline);

        this._registerMaterialIfNeeded({ asset: representingSymbol.asset, color: representingSymbol.color, opacity: representingSymbol.opacity });
        this._shape = new THREE.Mesh(symbolGeometry, Symbol3D._materialsInUse[this._materialKey].material);
        this.previewable = true;
        this.update({ using: representingSymbol });
        this.add(this._shape);
    }

    _registerMaterialIfNeeded({ asset, color, opacity }) {
        if (!(color instanceof Color) || !(opacity instanceof Opacity)
            || !(asset instanceof Asset)) return;
        let currentMaterialKey = this._materialKey;
        let materialKey = `${asset.filePath}/${color.hex}/${opacity.index}`;
        if (materialKey === currentMaterialKey) return;
        if (Symbol3D._materialsInUse[currentMaterialKey]) {
            Symbol3D._materialsInUse[currentMaterialKey].references = Symbol3D._materialsInUse[currentMaterialKey].references.filter(a => a !== this);
            if (Symbol3D._materialsInUse[currentMaterialKey].references.length === 0) {
                Symbol3D._materialsInUse[currentMaterialKey].material.dispose();
                delete Symbol3D._materialsInUse[currentMaterialKey];
            }
        }
        if (!Symbol3D._materialsInUse[materialKey]) {
            Symbol3D._materialsInUse[materialKey] = {
                references: [this],
                material: new THREE.MeshBasicMaterial({
                    color: color.value,
                    transparent: true,
                    side: THREE.DoubleSide,
                    opacity: opacity.value
                })
            }
        } else if (!Symbol3D._materialsInUse[materialKey].references.includes(this)) {
            Symbol3D._materialsInUse[materialKey].references.push(this);
        }
        let materialObject = Symbol3D._materialsInUse[materialKey];
        Symbol3D.loadTexture({ forAsset: asset }).then((texture) => {
            materialObject.material.map = texture;
            materialObject.material.needsUpdate = true;
        });
        this._materialKey = materialKey;
    }

    static async loadTextures({ forAssets }) {
        if (!Array.isArray(forAssets)) return;
        let assets = forAssets.filter(a => a instanceof Asset);
        let promises = assets.map(asset => Symbol3D.loadTexture({ forAsset: asset }));
        await Promise.all(promises);
    }

    static async loadTexture({ forAsset }) {
        if (!(forAsset instanceof Asset)) return;
        let textureLocation = forAsset.filePath;
        return new Promise((resolve, reject) => {
            if (Symbol3D._texturesInUse[textureLocation]) {
                resolve(Symbol3D._texturesInUse[textureLocation]);
            } else if (Symbol3D._textureLoaderListeners[textureLocation]) {
                Symbol3D._textureLoaderListeners[textureLocation].push(resolve);
            } else {
                Symbol3D._textureLoaderListeners[textureLocation] = [resolve];
                let loader = new THREE.TextureLoader();
                loader.load(textureLocation, (texture) => {
                    Symbol3D._texturesInUse[textureLocation] = texture;
                    let listeners = Symbol3D._textureLoaderListeners[textureLocation];
                    for (var index in listeners) {
                        listeners[index](texture);
                    }
                    delete Symbol3D._textureLoaderListeners[textureLocation];
                });
            }
        });
    }

    _changeMaterial({ asset, color, opacity }) {
        if (!(color instanceof Color) || !(opacity instanceof Opacity)
            || !(asset instanceof Asset)) return;
        this._registerMaterialIfNeeded({ asset: asset, color: color, opacity: opacity });
        this._shape.material = Symbol3D._materialsInUse[this._materialKey].material;
    }

    update({ using }) {
        if (!(using instanceof Symbol)) return;
        let frame = using.frame;
        let points = [
            new THREE.Vector3(frame.vertexA.x, frame.vertexA.y, 0),
            new THREE.Vector3(frame.vertexB.x, frame.vertexB.y, 0),
            new THREE.Vector3(frame.vertexC.x, frame.vertexC.y, 0),
            new THREE.Vector3(frame.vertexD.x, frame.vertexD.y, 0)
        ];
        this._shape.position.x = frame.origin.x;
        this._shape.position.y = frame.origin.y;
        this._shape.geometry.setFromPoints(points);
        this._shape.geometry.attributes.position.needsUpdate = true;
        this._shape.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
            0, 1, 1, 1, 1, 0, 0, 0
        ]), 2));
        this._shape.geometry.attributes.uv.needsUpdate = true;
        this._shape.geometry.computeBoundingBox();
        this._shape.geometry.computeBoundingSphere();
        this._shape.visible = !using.isHidden;
        this._changeMaterial({ asset: using.asset, color: using.color, opacity: using.opacity });
        let edgePoints = [
            points[1], points[0],
            points[0], points[3],
            points[3], points[2],
            points[2], points[1]
        ];
        this._shapeOutline.position.x = frame.origin.x;
        this._shapeOutline.position.y = frame.origin.y;
        this._shapeOutline.geometry.setFromPoints(edgePoints);
        this._shapeOutline.geometry.attributes.position.needsUpdate = true;
        this._shapeOutline.geometry.computeBoundingBox();
        this._shapeOutline.geometry.computeBoundingSphere();
        let controls = this._shape.children.filter(a => a instanceof SymbolControls3D)[0];
        if (controls) {
            controls.attach({ toSymbol3D: this });
        }
        this._hideShowButton.isSelected = using.isHidden;
    }
    
    free() {
        super.free();
        let currentMaterialKey = this._materialKey;
        if (Symbol3D._materialsInUse[currentMaterialKey]) {
            Symbol3D._materialsInUse[currentMaterialKey].references = Symbol3D._materialsInUse[currentMaterialKey].references.filter(a => a !== this);
            if (Symbol3D._materialsInUse[currentMaterialKey].references.length === 0) {
                Symbol3D._materialsInUse[currentMaterialKey].material.dispose();
                delete Symbol3D._materialsInUse[currentMaterialKey];
            }
        }
        this._shape.geometry.dispose();
        this._shapeOutline.geometry.dispose();
    }

}
