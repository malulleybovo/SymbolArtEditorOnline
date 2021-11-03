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

class Container3D extends Layer3D {

    static containerSpacing = 0.1 * SymbolArt.usableDimensions.width;
    static symbolSpacing = 0.2 * SymbolArt.usableDimensions.width;
    static depthSpacing = 0.1 * SymbolArt.usableDimensions.height;

    static planeGeometry = new THREE.PlaneGeometry(1, 1);
    static edgesGeometry = new THREE.EdgesGeometry(Container3D.planeGeometry);

    static updateDimensions() {
        Container3D.containerSpacing = 0.1 * SymbolArt.usableDimensions.width;
        Container3D.symbolSpacing = 0.2 * SymbolArt.usableDimensions.width;
        Container3D.depthSpacing = 0.1 * SymbolArt.usableDimensions.height;
    }

    _outline = (() => {
        let outline = new THREE.LineSegments(Container3D.edgesGeometry, Layer3D.outlineMaterial);
        outline.position.z = 0.005;
        return outline;
    })();

    _nameText = (() => {
        let nameText = new Text3D();
        nameText.whiteSpace = 'nowrap';
        nameText.sync();
        return nameText;
    })();
    get nameText() { return this._nameText }

    _copyButton = (() => {
        let mesh = new Button3D({ textureLocation: 'res/clone.png', backgroundColor: new Color({ hexValue: 0x808080 }) });
        mesh.position.x = -0.5 * mesh.size.width;
        mesh.position.y = -2.5 - 0.5 * mesh.size.height;
        return mesh;
    })();
    get copyButton() { return this._copyButton }

    _hideShowButton = (() => {
        let hideButtonMesh = new Button3D({ textureLocation: 'res/eyeOpen.png', backgroundColor: new Color({ hexValue: 0x808080 }) });
        hideButtonMesh.setTexture({ atLocation: 'res/eyeClosed.png', backgroundColor: new Color({ hexValue: 0xCA3433 }), forState: Button3D.State.selected });
        hideButtonMesh.position.x = -0.5 * hideButtonMesh.size.width;
        hideButtonMesh.position.y = -2.5 - 0.5 * hideButtonMesh.size.height;
        return hideButtonMesh;
    })();
    get hideShowButton() { return this._hideShowButton }

    _uiGroup = (() => {
        let uiGroup = new THREE.Group();
        uiGroup.position.x = -0.5; // negative X side of parent mesh due to parent scale
        uiGroup.position.y = 0.5; // positive Y side of parent mesh due to parent scale (left edge in world space)
        uiGroup.position.z = -0.1;
        uiGroup.rotation.y = -0.5 * Math.PI;
        uiGroup.rotation.z = -0.5 * Math.PI;
        uiGroup.add(this._nameText);
        uiGroup.add(this._copyButton);
        uiGroup.add(this._hideShowButton);
        return uiGroup;
    })();

    _plane = (() => {
        let plane = new THREE.Mesh(Container3D.planeGeometry, Layer3D.backgroundMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.scale.x = SymbolArt.usableDimensions.width;
        plane.scale.y = 0;
        plane.add(this._outline);
        plane.add(this._uiGroup);
        this.add(plane);
        return plane;
    })()
    get plane() { return this._plane }

    _sublayers = [];
    get sublayers() { return this._sublayers }

    get layerUuid() { return this._plane.userData.layerUuid }
    get contentLength() { return this._plane.scale.y }
    get contentCenter() {
        let center = new THREE.Vector2();
        for (var index in this._sublayers) {
            center.add(this._sublayers[index].contentCenter);
        }
        center.divideScalar(this._sublayers.length);
        return center;
    }

    get isSelected() { return this._outline.material === Layer3D.selectedOutlineMaterial }
    set isSelected(value) {
        if (typeof value !== 'boolean') return;
        this._outline.material = value ? Layer3D.selectedOutlineMaterial : Layer3D.outlineMaterial;
        for (var index in this._sublayers) {
            this._sublayers[index].isSelected = value;
        }
    }

    set previewable(value) {
        if (typeof value !== 'boolean') return;
        for (var index in this._sublayers) {
            if (this._sublayers[index] instanceof Container3D
                || this._sublayers[index] instanceof Symbol3D) {
                this._sublayers[index].previewable = value;
            }
        }
    }
    
    constructor({ representingContainer }) {
        super();
        if (!(representingContainer instanceof Container))
            throw new TypeError(`Expected "representingContainer" of type Container but got "${representingContainer.constructor.name}"`);
        Layer3D.layersInUse[representingContainer.uuid] = this;
        this.update({ using: representingContainer });
    }

    changedFocus() {
        for (var index in this._sublayers) {
            this._sublayers[index].isFocused = this._isFocused;
        }
    }

    update({ using, forAnimation = false }) {
        if (!(using instanceof Container)) return { contentLength: 0, animations: [] };
        let animations = [];
        let sublayerNewPositions = [];
        let sublayers = [];
        let contentLength = Container3D.containerSpacing;
        for (var index in using.sublayers) {
            let layer = using.sublayers[index];
            if (layer instanceof Container, layer.numberOfSymbols > 0) {
                let sublayer = Layer3D.layersInUse[layer.uuid];
                let innerContentLength = 0;
                if (sublayer instanceof Container3D) {
                    let innerChanges = sublayer.update({ using: layer, forAnimation: forAnimation });
                    if (forAnimation) {
                        animations.push(...innerChanges.animations);
                        innerContentLength = innerChanges.contentLength;
                    } else {
                        innerContentLength = sublayer.contentLength;
                    }
                } else {
                    if (sublayer && sublayer.free) sublayer.free();
                    delete Layer3D.layersInUse[layer.uuid];
                    sublayer = new Container3D({ representingContainer: layer });
                    innerContentLength = sublayer.contentLength;
                }
                if (sublayers.length > 0) {
                    contentLength += Container3D.containerSpacing;
                }
                sublayerNewPositions.push(contentLength + innerContentLength / 2);
                sublayers.push(sublayer);
                contentLength += innerContentLength;
            } else if (layer instanceof Symbol) {
                let sublayer = Layer3D.layersInUse[layer.uuid];
                if (sublayer instanceof Symbol3D) {
                    sublayer.update({ using: layer });
                } else {
                    if (sublayer && sublayer.free) sublayer.free();
                    delete Layer3D.layersInUse[layer.uuid];
                    sublayer = new Symbol3D({ representingSymbol: layer });
                }
                if (sublayers.length > 0) {
                    if (sublayers[sublayers.length - 1] instanceof Container3D) contentLength += Container3D.containerSpacing;
                    else contentLength += Container3D.symbolSpacing;
                }
                sublayerNewPositions.push(contentLength);
                sublayers.push(sublayer);
            }
        }
        contentLength += Container3D.containerSpacing;

        let containerNewDepth = -Container3D.depthSpacing * using.depth - SymbolArt.usableDimensions.height / 2;

        if (forAnimation && this._plane.position.y !== containerNewDepth) {
            animations.push(new Animation3D({
                mesh: this._plane,
                targetPositionY: containerNewDepth
            }));
        } else {
            this._plane.position.y = containerNewDepth;
        }

        if (forAnimation && this._plane.scale.y !== contentLength) {
            animations.push(new Animation3D({
                mesh: this._plane,
                targetScaleY: contentLength
            }));
        } else {
            this._plane.scale.y = contentLength;
        }

        this._plane.userData.layerUuid = using.uuid;
        for (var index in this._sublayers) {
            this.remove(this._sublayers[index]);
        }
        this._sublayers = sublayers;
        for (var index in this._sublayers) {
            if (forAnimation && this._sublayers[index].position.z !== sublayerNewPositions[index] - contentLength / 2) {
                animations.push(new Animation3D({
                    mesh: this._sublayers[index],
                    targetPositionZ: sublayerNewPositions[index] - contentLength / 2
                }));
            } else {
                this._sublayers[index].position.z = sublayerNewPositions[index] - contentLength / 2;
            }
            this.add(this._sublayers[index]);
        }
        
        this._uiGroup.scale.z = 1 / this._plane.scale.x; // local Z-axis is aligned with parent X-axis after rotation
        this._uiGroup.scale.x = 1 / contentLength; // local X-axis is aligned with parent Y-axis after rotation

        this._nameText.color = using.name.length === 0 ? 0x808080 : 0xffffff;
        this._nameText.maxWidth = Math.max(0, contentLength - 10 - this._copyButton.size.width - 10 - this._hideShowButton.size.width);

        let rawText;
        if (using.name.length === 0) rawText = 'rename';
        else rawText = using.name;
        this._nameText.text = this._nameText.textThatFits({ lines: 1, lineWidth: this._nameText.maxWidth, using: rawText });

        this._copyButton.position.x = contentLength - 1.5 * this._copyButton.size.width - 10;
        this._copyButton.visible = using.hasParent;
        this._hideShowButton.position.x = contentLength - 0.5 * this._hideShowButton.size.width;
        this._hideShowButton.isSelected = using.isHidden;
        this._hideShowButton.visible = using.hasParent;

        return { contentLength: contentLength, animations: animations };
    }
    
    free() {
        super.free();
    }

}
