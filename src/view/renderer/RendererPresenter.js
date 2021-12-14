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

class RendererPresenter extends InputDevice {

    _renderer = null;

    _symbolBeingAdded = null;
    _symbolObjectBeingAdded = null;
    _copiedLayer = null;

    _symbolBeingModified = null;
    _initialHelperImageProperties = null;
    _rotationControlInitialPosition = null;
    _selectionBorderSymbols = null;

    _initialSelectionPosition = null;
    _initialCameraPosition = null;
    get frontLayerPositionOffset() {
        return this._renderer.mainGroup.worldToLocal(new THREE.Vector3(0, 0, 1)).multiplyScalar(1.2 * SymbolArt.usableDimensions.width);
    }

    _edgeMotionInterval = null;
    _isInCornerMinusX = false;
    _isInCornerPlusX = false;
    _isInCornerMinusY = false;
    _isInCornerPlusY = false;

    _lastLongTouchMovedEvent = null;

    _previousRayScreenPositionInSymbolEditorMode = null;
    _previousRayScreenPositionInSymbolEditorModeTimeout = null;

    _pinchingPreviousPosition = null;

    get _edgeMotionSpeed() { return 0.1 * SymbolArt.usableDimensions.width };

    constructor({ renderer }) {
        super();
        this._renderer = renderer instanceof Renderer ? renderer : null;
        ApplicationState.shared.add({
            onChangeViewModeListener: () => {
                ApplicationState.shared.trigger = TriggerType.none;
                this._renderer.viewModeStateUpdated();
                this._updateSymbolColorGuess();
            },
            onChangeTriggerListener: () => {
                if (ApplicationState.shared.trigger === TriggerType.historyStateChanged) {
                    ApplicationState.shared.trigger = TriggerType.closeWindow;
                    ApplicationState.shared.trigger = TriggerType.none;
                    UIApplication.shared.symbolArt = HistoryState.shared.current.clone();
                    this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
                    this._renderer.helperImage.updateWith({ helperImage: UIApplication.shared.symbolArt.helperImage });
                    if (ApplicationState.shared.viewMode === ViewMode.helperImageMode) {
                        SymbolControls3D.shared.attach({ toSymbol3D: null });
                        ContainerControls3D.shared.attach({ toContainer3D: null });
                        HelperImageControls3D.shared.attach({ toHelperImage: this._renderer.helperImage });
                    } else {
                        SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                        ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                        HelperImageControls3D.shared.attach({ toHelperImage: null });
                    }
                }
                if (ApplicationState.shared.trigger === TriggerType.layerFlipX) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    this.flipHorizontallySelectedLayer();
                }
                if (ApplicationState.shared.trigger === TriggerType.layerFlipY) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    this.flipVerticallySelectedLayer();
                }
                if (ApplicationState.shared.trigger === TriggerType.layerRotate90) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    this.rotate90DegreesSelectedLayer();
                }
                if (ApplicationState.shared.trigger === TriggerType.discardHelperImage) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    UIApplication.shared.symbolArt.helperImage.resetImage();
                    this._renderer.helperImage.updateWith({
                        helperImage: UIApplication.shared.symbolArt.helperImage
                    });
                    HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                }
                if (ApplicationState.shared.trigger === TriggerType.focusSelection) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    this._renderer.focusSelection({ state: !this._renderer.isFocusingSelection });
                } else {
                    this._renderer.focusSelection({ state: this._renderer.isFocusingSelection });
                }
                if (ApplicationState.shared.trigger === TriggerType.focusHelperImage) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    this._renderer.helperImage.isFocused = !this._renderer.helperImage.isFocused;
                }
                if (ApplicationState.shared.trigger === TriggerType.toggledHelperImageGreenScreen) {
                    ApplicationState.shared.trigger = TriggerType.none;
                    this._renderer.helperImage.greenScreenEnabled = !this._renderer.helperImage.greenScreenEnabled;
                }
            },
            onChangeInteractionListener: _ => {
                if (ApplicationState.shared.interaction === InteractionType.enablingTapHoldFeature) {
                    ApplicationState.shared.interaction = InteractionType.none;
                    this.longTouchesWithoutDelay = false;
                }
                if (ApplicationState.shared.interaction === InteractionType.disablingTapHoldFeature) {
                    ApplicationState.shared.interaction = InteractionType.none;
                    this.longTouchesWithoutDelay = true;
                }
            }
        });
    }
    
    tapped(event) {
        if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode
            && ApplicationState.shared.interaction === InteractionType.willCloneCurrentSelection) {
            let layerToClone = UIApplication.shared.symbolArt.findLayer({ withUuidString: this._renderer.selectionUuid });
            let worldPosition = this.worldVector(event);
            let newLayer = null;
            if (layerToClone instanceof Layer && layerToClone.parent instanceof Container) {
                newLayer = layerToClone.clone({ retainUuid: false });
                let container = layerToClone.parent;
                let index = container.indexOf({ sublayer: layerToClone }) + 1;
                container.add({ sublayer: newLayer, atIndex: index });
            } else {
                newLayer = new Symbol();
                let container = UIApplication.shared.symbolArt.root;
                container.add({ sublayer: newLayer });
            }
            if (newLayer instanceof Symbol) {
                let x = newLayer.frame.origin.x + SymbolArt.scaling * Math.round((worldPosition.x - newLayer.frame.origin.x) / SymbolArt.scaling);
                let y = newLayer.frame.origin.y + SymbolArt.scaling * Math.round((worldPosition.y - newLayer.frame.origin.y) / SymbolArt.scaling);
                newLayer.frame.origin = new Origin({ x: x, y: y });
            } else if (newLayer instanceof Container) {
                newLayer.origin = new Origin({ x: worldPosition.x, y: worldPosition.y });
            }
            ApplicationState.shared.interaction = InteractionType.none;
            this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
            this._renderer.setSelection({ layer3D: Object.values(Layer3D.layersInUse).filter(a => a.layerUuid === newLayer.uuid)[0] });
            SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
            ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
            HelperImageControls3D.shared.attach({ toHelperImage: null });
            HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
        } else if (ApplicationState.shared.interaction !== InteractionType.none) return;
        if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode) {
            this._renderer.touched({ screenPosition: this.normalizedVector(event), hitsLayers: true, hitsControls: false });
            if (this._renderer.selectionUuid) {
                if (ApplicationState.shared.trigger === TriggerType.layerDeletion) {
                    this.deleteSelection();
                    return;
                }
                ApplicationState.shared.trigger = TriggerType.none;
            }
            this._updateSymbolColorGuess();
        }
    }
    
    touchBegan(event, count) {
        if (count > 1) return;
        this._initialEvent = event;
        if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode
            && ApplicationState.shared.interaction === InteractionType.none
            && event.button === 0) {
            this._renderer.touched({ screenPosition: this.normalizedVector(event), hitsLayers: false, hitsControls: true });
            if (SymbolControls3D.shared.activeControl) {
                ApplicationState.shared.interaction = InteractionType.reshapingSymbolWillBegin;
                let layer = null;
                if (this._renderer.selectionGroup) {
                    layer = UIApplication.shared.symbolArt.root.getSublayer({ withUuidString: this._renderer.selectionGroup.layerUuid });
                    let clone = layer.clone();
                    this._symbolBeingModified = {
                        reference: layer,
                        cloneOfOriginal: clone
                    };
                    this._rotationControlInitialPosition = SymbolControls3D.shared.rotationControlPosition.clone();
                }
            } else if (ContainerControls3D.shared.activeControl) {
                ApplicationState.shared.interaction = InteractionType.reshapingContainerWillBegin;
                let layer = null;
                if (this._renderer.selectionGroup) {
                    layer = UIApplication.shared.symbolArt.root.getSublayer({ withUuidString: this._renderer.selectionGroup.layerUuid });
                    let clone = layer.clone();
                    this._symbolBeingModified = {
                        reference: layer,
                        cloneOfOriginal: clone
                    };
                    this._rotationControlInitialPosition = ContainerControls3D.shared.rotationControlPosition.clone();
                    this._controlsInitialSize = ContainerControls3D.shared.containerBox.getSize(new THREE.Vector3());
                    let cloneSymbols = clone.symbols;
                    if (!cloneSymbols[0]) return;
                    let topMostSymbol = cloneSymbols[0];
                    let leftMostSymbol = cloneSymbols[0];
                    let bottomMostSymbol = cloneSymbols[0];
                    let rightMostSymbol = cloneSymbols[0];
                    for (var index in cloneSymbols) {
                        if (cloneSymbols[index].frame.minimumX < leftMostSymbol.frame.minimumX)
                            leftMostSymbol = cloneSymbols[index];
                        if (cloneSymbols[index].frame.maximumX > rightMostSymbol.frame.maximumX)
                            rightMostSymbol = cloneSymbols[index];
                        if (cloneSymbols[index].frame.minimumY < bottomMostSymbol.frame.minimumY)
                            bottomMostSymbol = cloneSymbols[index];
                        if (cloneSymbols[index].frame.maximumY > topMostSymbol.frame.maximumY)
                            topMostSymbol = cloneSymbols[index];
                    }
                    this._selectionBorderSymbols = [topMostSymbol, leftMostSymbol, bottomMostSymbol, rightMostSymbol];
                }
            }
        } else if (ApplicationState.shared.viewMode === ViewMode.helperImageMode
            && ApplicationState.shared.interaction === InteractionType.none) {
            this._renderer.touched({ screenPosition: this.normalizedVector(event), hitsLayers: false, hitsControls: true });
            if (HelperImageControls3D.shared.activeControl) {
                ApplicationState.shared.interaction = InteractionType.reshapingHelperImageWillBegin;
                this._initialHelperImageProperties = {
                    position: this._renderer.helperImage.imagePosition.clone(),
                    scale: this._renderer.helperImage.imageScale.clone()
                }
            }
        }
    }

    touchMoved(event) {
        if (this._initialEvent === null) return;
        let previousWorldPosition = this.worldVector(this._initialEvent);
        let currentWorldPosition = this.worldVector(event);
        if (ApplicationState.shared.interaction === InteractionType.reshapingSymbolWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingSymbolDidBegin) {
            ApplicationState.shared.interaction = InteractionType.reshapingSymbolDidBegin;
            let eventInLocalSpace = null;
            if (this._renderer.selectionGroup) {
                let previousEventInLocalSpace = this._renderer.selectionGroup.worldToLocal(previousWorldPosition);
                let currentEventInLocalSpace = this._renderer.selectionGroup.worldToLocal(currentWorldPosition);
                eventInLocalSpace = currentEventInLocalSpace.sub(previousEventInLocalSpace);
            }
            let clone = this._symbolBeingModified ? this._symbolBeingModified.cloneOfOriginal : null;
            switch (eventInLocalSpace && this._symbolBeingModified ? SymbolControls3D.shared.activeWhich : -1) {
                case SymbolControls3D.Type.rotate:
                    let initialTheta = Math.atan2(this._rotationControlInitialPosition.y, this._rotationControlInitialPosition.x);
                    let theta = Math.atan2(this._rotationControlInitialPosition.y + eventInLocalSpace.y, eventInLocalSpace.x + this._rotationControlInitialPosition.x) - initialTheta;
                    if (clone.isValidRotation({ angleInRadians: theta })) {
                        let sinTheta = Math.sin(theta);
                        let cosTheta = Math.cos(theta);
                        let vertices = ['vertexA', 'vertexB', 'vertexC', 'vertexD'];
                        for (var index in vertices) {
                            let vertex = vertices[index];
                            this._symbolBeingModified.reference.frame[vertex].set({
                                x: cosTheta * clone.frame[vertex].x - sinTheta * clone.frame[vertex].y,
                                y: sinTheta * clone.frame[vertex].x + cosTheta * clone.frame[vertex].y
                            });
                        }
                        this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                        SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                    }
                    break;
                case SymbolControls3D.Type.resize:
                    let amount = this._initialEvent.clientY - event.clientY;
                    amount /= (clone.frame.topLeftVertex.y + clone.frame.topRightVertex.y) / 2;
                    amount += 1;
                    amount = clone.getValidScalingFactor({ fromFactor: amount });
                    this._symbolBeingModified.reference.frame.vertexA.set({ x: clone.frame.vertexA.x * amount, y: clone.frame.vertexA.y * amount });
                    this._symbolBeingModified.reference.frame.vertexB.set({ x: clone.frame.vertexB.x * amount, y: clone.frame.vertexB.y * amount });
                    this._symbolBeingModified.reference.frame.vertexC.set({ x: clone.frame.vertexC.x * amount, y: clone.frame.vertexC.y * amount });
                    this._symbolBeingModified.reference.frame.vertexD.set({ x: clone.frame.vertexD.x * amount, y: clone.frame.vertexD.y * amount });
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                    break;
                case SymbolControls3D.Type.top:
                    var verticesToModify = verticesToModify || ['vertexA', 'vertexB'];
                case SymbolControls3D.Type.right:
                    var verticesToModify = verticesToModify || ['vertexB', 'vertexC'];
                case SymbolControls3D.Type.bottom:
                    var verticesToModify = verticesToModify || ['vertexC', 'vertexD'];
                case SymbolControls3D.Type.left:
                    var verticesToModify = verticesToModify || ['vertexD', 'vertexA'];
                    let positions = clone.getSideVertexPositions({
                        vertex1X: clone.frame[verticesToModify[0]].x + 0.5 * eventInLocalSpace.x,
                        vertex1Y: clone.frame[verticesToModify[0]].y + 0.5 * eventInLocalSpace.y,
                        vertex1: verticesToModify[0],
                        vertex2: verticesToModify[1]
                    });
                    if (!positions) break;
                    this._symbolBeingModified.reference.frame.origin.set({
                        x: clone.frame.origin.x + (positions[verticesToModify[0]].x - clone.frame[verticesToModify[0]].x),
                        y: clone.frame.origin.y + (positions[verticesToModify[0]].y - clone.frame[verticesToModify[0]].y)
                    });
                    this._symbolBeingModified.reference.frame[verticesToModify[0]].set(
                        positions[verticesToModify[0]]
                    );
                    this._symbolBeingModified.reference.frame[verticesToModify[1]].set(
                        positions[verticesToModify[1]]
                    );
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                    break;
                case SymbolControls3D.Type.topLeft:
                    var verticesToModify = verticesToModify || ['vertexA'];
                case SymbolControls3D.Type.topRight:
                    var verticesToModify = verticesToModify || ['vertexB'];
                case SymbolControls3D.Type.bottomRight:
                    var verticesToModify = verticesToModify || ['vertexC'];
                case SymbolControls3D.Type.bottomLeft:
                    var verticesToModify = verticesToModify || ['vertexD'];
                    let v = verticesToModify[0];
                    this._symbolBeingModified.reference.frame[v].set(
                        clone.getVertexPositionThatDoesNotCollideFromDesiredPosition({
                            x: clone.frame[v].x + eventInLocalSpace.x,
                            y: clone.frame[v].y + eventInLocalSpace.y,
                            forVertex: v
                        })
                    );
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                    break;
                case SymbolControls3D.Type.move:
                    this._symbolBeingModified.reference.setOrigin({
                        x: clone.frame.origin.x + SymbolArt.scaling * Math.round(eventInLocalSpace.x / SymbolArt.scaling),
                        y: clone.frame.origin.y + SymbolArt.scaling * Math.round(eventInLocalSpace.y / SymbolArt.scaling)
                    });
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                    break;
                default: break;
            }
        } else if (ApplicationState.shared.interaction === InteractionType.reshapingContainerWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingContainerDidBegin) {
            ApplicationState.shared.interaction = InteractionType.reshapingContainerDidBegin;
            let eventInLocalSpace = null;
            if (this._renderer.selectionGroup) {
                let previousEventInLocalSpace = this._renderer.selectionGroup.worldToLocal(previousWorldPosition);
                let currentEventInLocalSpace = this._renderer.selectionGroup.worldToLocal(currentWorldPosition);
                eventInLocalSpace = currentEventInLocalSpace.sub(previousEventInLocalSpace);
            }
            let clone = this._symbolBeingModified ? this._symbolBeingModified.cloneOfOriginal : null;
            let cloneSymbols = clone.symbols;
            let symbols, center;
            switch (eventInLocalSpace && this._symbolBeingModified ? ContainerControls3D.shared.activeWhich : -1) {
                case ContainerControls3D.Type.rotate:
                    let initialTheta = Math.atan2(this._rotationControlInitialPosition.y, this._rotationControlInitialPosition.x);
                    let theta = Math.atan2(this._rotationControlInitialPosition.y + eventInLocalSpace.y, eventInLocalSpace.x + this._rotationControlInitialPosition.x) - initialTheta;
                    symbols = this._symbolBeingModified.reference.symbols;
                    center = new Origin();
                    if (cloneSymbols.length > 0) {
                        center.set({
                            x: 0.5 * (Math.min(...cloneSymbols.map(a => a.frame.minimumX)) + Math.max(...cloneSymbols.map(a => a.frame.maximumX))),
                            y: 0.5 * (Math.min(...cloneSymbols.map(a => a.frame.minimumY)) + Math.max(...cloneSymbols.map(a => a.frame.maximumY)))
                        });
                    }
                    for (var index in cloneSymbols) {
                        if (!cloneSymbols[index].isValidRotation({ angleInRadians: theta, aroundAxis: center })) {
                            symbols = [];
                            break;
                        }
                    }
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);
                    for (var index in symbols) {
                        let frame = symbols[index].frame;
                        let cloneFrame = cloneSymbols[index].frame;
                        let originX = cloneFrame.origin.x - center.x;
                        let originY = cloneFrame.origin.y - center.y;
                        frame.origin.set({
                            x: cosTheta * originX - sinTheta * originY + center.x,
                            y: sinTheta * originX + cosTheta * originY + center.y
                        });
                        let vertices = ['vertexA', 'vertexB', 'vertexC', 'vertexD'];
                        for (var key in vertices) {
                            let vertex = vertices[key];
                            frame[vertex].set({
                                x: cosTheta * cloneFrame[vertex].x - sinTheta * cloneFrame[vertex].y,
                                y: sinTheta * cloneFrame[vertex].x + cosTheta * cloneFrame[vertex].y
                            });
                        }
                    }
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                    break;
                case ContainerControls3D.Type.resize:
                    var scalesX = true;
                    var scalesY = true;
                    var amount = amount !== undefined ? amount : (this._initialEvent.clientY - event.clientY) / (0.65 * this._controlsInitialSize.y * this._renderer.zoom);
                case ContainerControls3D.Type.top:
                    var scalesX = scalesX !== undefined ? scalesX : false;
                    var scalesY = scalesY !== undefined ? scalesY : true;
                    var amount = amount !== undefined ? amount : (this._initialEvent.clientY - event.clientY) / (0.65 * this._controlsInitialSize.y * this._renderer.zoom);
                case ContainerControls3D.Type.right:
                    var scalesX = scalesX !== undefined ? scalesX : true;
                    var scalesY = scalesY !== undefined ? scalesY : false;
                    var amount = amount !== undefined ? amount : -(this._initialEvent.clientX - event.clientX) / (0.65 * this._controlsInitialSize.x * this._renderer.zoom);
                case ContainerControls3D.Type.bottom:
                    var scalesX = scalesX !== undefined ? scalesX : false;
                    var scalesY = scalesY !== undefined ? scalesY : true;
                    var amount = amount !== undefined ? amount : -(this._initialEvent.clientY - event.clientY) / (0.65 * this._controlsInitialSize.y * this._renderer.zoom);
                case ContainerControls3D.Type.left:
                    var scalesX = scalesX !== undefined ? scalesX : true;
                    var scalesY = scalesY !== undefined ? scalesY : false;
                    var amount = amount !== undefined ? amount : (this._initialEvent.clientX - event.clientX) / (0.65 * this._controlsInitialSize.x * this._renderer.zoom);
                    amount += 1;
                    let amountThatFits = { x: amount, y: amount };
                    symbols = this._symbolBeingModified.reference.symbols;
                    center = new Origin();
                    if (cloneSymbols.length > 0) {
                        center.set({
                            x: 0.5 * (Math.min(...cloneSymbols.map(a => a.frame.minimumX)) + Math.max(...cloneSymbols.map(a => a.frame.maximumX))),
                            y: 0.5 * (Math.min(...cloneSymbols.map(a => a.frame.minimumY)) + Math.max(...cloneSymbols.map(a => a.frame.maximumY)))
                        });
                    }
                    for (var index in cloneSymbols) {
                        let localAmount = cloneSymbols[index].getValidScalingFactor({
                            fromFactor: amount, usesX: scalesX, usesY: scalesY,
                            relativeToOrigin: center
                        });
                        if (amount > 1) {
                            amountThatFits.x = Math.min(amountThatFits.x, localAmount);
                            amountThatFits.y = Math.min(amountThatFits.y, localAmount);
                        } else {
                            amountThatFits.x = Math.max(amountThatFits.x, localAmount);
                            amountThatFits.y = Math.max(amountThatFits.y, localAmount);
                        }
                    }
                    let amountX = scalesX ? amountThatFits.x : 1;
                    let amountY = scalesY ? amountThatFits.y : 1;
                    for (var index in symbols) {
                        let frame = symbols[index].frame;
                        let cloneFrame = cloneSymbols[index].frame;
                        frame.vertexA.set({ x: cloneFrame.vertexA.x * amountX, y: cloneFrame.vertexA.y * amountY });
                        frame.vertexB.set({ x: cloneFrame.vertexB.x * amountX, y: cloneFrame.vertexB.y * amountY });
                        frame.vertexC.set({ x: cloneFrame.vertexC.x * amountX, y: cloneFrame.vertexC.y * amountY });
                        frame.vertexD.set({ x: cloneFrame.vertexD.x * amountX, y: cloneFrame.vertexD.y * amountY });
                        frame.origin.set({
                            x: center.x + (cloneFrame.origin.x - center.x) * amountX,
                            y: center.y + (cloneFrame.origin.y - center.y) * amountY
                        });
                    }
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                    break;
                case ContainerControls3D.Type.move:
                    symbols = this._symbolBeingModified.reference.symbols;
                    let correctionX = 0;
                    let correctionXSign = 1;
                    let correctionY = 0;
                    let correctionYSign = 1;
                    for (var index in this._selectionBorderSymbols) {
                        let expectedX = this._selectionBorderSymbols[index].frame.origin.x + SymbolArt.scaling * Math.round(eventInLocalSpace.x / SymbolArt.scaling);
                        let expectedY = this._selectionBorderSymbols[index].frame.origin.y + SymbolArt.scaling * Math.round(eventInLocalSpace.y / SymbolArt.scaling);
                        let origin = this._selectionBorderSymbols[index].calculateOriginFrom({
                            x: expectedX,
                            y: expectedY
                        });
                        if (correctionX < Math.abs(origin.x - expectedX)) {
                            correctionX = Math.abs(origin.x - expectedX);
                            correctionXSign = Math.round((origin.x - expectedX) / correctionX);
                        }
                        if (correctionY < Math.abs(origin.y - expectedY)) {
                            correctionY = Math.abs(origin.y - expectedY);
                            correctionYSign = Math.round((origin.y - expectedY) / correctionY);
                        }
                    }
                    for (var index in symbols) {
                        symbols[index].setOrigin({
                            x: cloneSymbols[index].frame.origin.x + SymbolArt.scaling * Math.round(eventInLocalSpace.x / SymbolArt.scaling) + correctionXSign * correctionX,
                            y: cloneSymbols[index].frame.origin.y + SymbolArt.scaling * Math.round(eventInLocalSpace.y / SymbolArt.scaling) + correctionYSign * correctionY
                        });
                    }
                    this._renderer.selectionGroup.update({ using: this._symbolBeingModified.reference });
                    ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                    break;
                default: break;
            }
        } else if (ApplicationState.shared.interaction === InteractionType.reshapingHelperImageWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingHelperImageDidBegin) {
            ApplicationState.shared.interaction = InteractionType.reshapingHelperImageDidBegin;
            let eventInWorldSpace = currentWorldPosition.clone().sub(previousWorldPosition);
            switch (HelperImageControls3D.shared.activeWhich) {
                case HelperImageControls3D.Type.rotate:
                    let theta = Math.atan2(currentWorldPosition.y - this._initialHelperImageProperties.position.y, currentWorldPosition.x - this._initialHelperImageProperties.position.x) - 0.5 * Math.PI;
                    UIApplication.shared.symbolArt.helperImage.rotationAngle = theta;
                    this._renderer.helperImage.updateWith({ helperImage: UIApplication.shared.symbolArt.helperImage });
                    HelperImageControls3D.shared.attach({ toHelperImage: this._renderer.helperImage });
                    break;
                case HelperImageControls3D.Type.resize:
                    let amount = this._initialEvent.clientY - event.clientY;
                    amount /= this._renderer.helperImage.textureHeight / (2 * this._renderer.helperImage.scale.y);
                    UIApplication.shared.symbolArt.helperImage.scaleX = this._initialHelperImageProperties.scale.x + amount;
                    UIApplication.shared.symbolArt.helperImage.scaleY = this._initialHelperImageProperties.scale.y + amount;
                    this._renderer.helperImage.updateWith({ helperImage: UIApplication.shared.symbolArt.helperImage });
                    HelperImageControls3D.shared.attach({ toHelperImage: this._renderer.helperImage });
                    break;
                case HelperImageControls3D.Type.move:
                    let newX = this._initialHelperImageProperties.position.x + eventInWorldSpace.x;
                    newX = Math.max(-1000, Math.min(1000, newX));
                    UIApplication.shared.symbolArt.helperImage.positionX = newX;
                    let newY = this._initialHelperImageProperties.position.y + eventInWorldSpace.y;
                    newY = Math.max(-1000, Math.min(1000, newY));
                    UIApplication.shared.symbolArt.helperImage.positionY = newY;
                    this._renderer.helperImage.updateWith({ helperImage: UIApplication.shared.symbolArt.helperImage });
                    HelperImageControls3D.shared.attach({ toHelperImage: this._renderer.helperImage });
                    break;
                default: break;
            }
        } else if (ApplicationState.shared.interaction === InteractionType.none
            || ApplicationState.shared.interaction === InteractionType.panning) {
            ApplicationState.shared.interaction = InteractionType.panning;
            this._renderer.moveCameraBy({
                x: previousWorldPosition.x - currentWorldPosition.x,
                y: previousWorldPosition.y - currentWorldPosition.y
            });
            this._initialEvent = event;
        }
    }

    touchEnded(event) {
        if (ApplicationState.shared.interaction === InteractionType.reshapingSymbolDidBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingContainerDidBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingHelperImageDidBegin) {
            HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
        }
        if (ApplicationState.shared.interaction === InteractionType.panning
            || ApplicationState.shared.interaction === InteractionType.reshapingSymbolWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingSymbolDidBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingContainerWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingContainerDidBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingHelperImageWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingHelperImageDidBegin) {
            ApplicationState.shared.interaction = InteractionType.none;
        }
    }

    longTouchBegan(event) {
        if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode && ApplicationState.shared.interaction === InteractionType.none) {
            if (ApplicationState.shared.trigger === TriggerType.groupLayers) {
                ApplicationState.shared.trigger = TriggerType.none;
                let eventInWorldSpace = this.worldVector(event);
                this._renderer.placeSelectionRectangle({
                    fromPosition: eventInWorldSpace,
                    toPosition: eventInWorldSpace
                });
                this._initialSelectionPosition = this._renderer.selectionRectangle.position.clone();
                ApplicationState.shared.interaction = InteractionType.groupingLayers;
                return;
            }
            let eventPositionInWorldSpace = this.worldVector(event);
            let mainGroupBoundingBox = new THREE.Box3().setFromObject(this._renderer.mainGroup);
            let padding = 20;
            let isTouchWithinMainGroup = eventPositionInWorldSpace.x > mainGroupBoundingBox.min.x - padding
                && eventPositionInWorldSpace.y > mainGroupBoundingBox.min.y - padding
                && eventPositionInWorldSpace.x < mainGroupBoundingBox.max.x + padding
                && eventPositionInWorldSpace.y < mainGroupBoundingBox.max.y + padding
            if (this._copiedLayer && (ApplicationState.shared.trigger === TriggerType.layerCopyPaste || (ApplicationState.shared.trigger !== TriggerType.layerAddition &&!isTouchWithinMainGroup))) {
                ApplicationState.shared.trigger = TriggerType.none;
                ApplicationState.shared.interaction = InteractionType.addingLayerWillBegin;
                let copiedLayer = this._copiedLayer
                this.cleanTemporarySymbol();
                this._symbolBeingAdded = copiedLayer;
                if (this._symbolBeingAdded instanceof Symbol) {
                    this._symbolObjectBeingAdded = new Symbol3D({ representingSymbol: this._symbolBeingAdded });
                } else {
                    this._symbolObjectBeingAdded = new Container3D({ representingContainer: this._symbolBeingAdded });
                }
                this._symbolObjectBeingAdded.position.y = 10000;
                this._renderer.mainGroup.add(this._symbolObjectBeingAdded);
                this._renderer.setSelection({ layer3D: this._symbolObjectBeingAdded });
            } else if (ApplicationState.shared.trigger === TriggerType.layerAddition || !isTouchWithinMainGroup) {
                ApplicationState.shared.interaction = InteractionType.addingLayerWillBegin;
                this.cleanTemporarySymbol();
                this._symbolBeingAdded = new Symbol({
                    origin: new Origin(),
                    sizeOfDiagonalAC: new Size({
                        width: Math.round(0.5 * SymbolArt.viewableDimensions.height),
                        height: Math.round(0.5 * SymbolArt.viewableDimensions.height)
                    }),
                    sizeOfDiagonalBD: new Size({
                        width: Math.round(0.5 * SymbolArt.viewableDimensions.height),
                        height: Math.round(0.5 * SymbolArt.viewableDimensions.height)
                    }),
                    color: new Color({
                        hexValue: this._colorValueOfRecentSymbol === null ?
                            0xffffff : this._colorValueOfRecentSymbol
                    })
                });
                this._symbolObjectBeingAdded = new Symbol3D({ representingSymbol: this._symbolBeingAdded });
                this._symbolObjectBeingAdded.position.y = 10000;
                this._renderer.mainGroup.add(this._symbolObjectBeingAdded);
                this._renderer.setSelection({ layer3D: this._symbolObjectBeingAdded });
            } else {
                this.tapped(event);
                ApplicationState.shared.interaction = InteractionType.movingLayerWillBegin;
            }

            if (this._renderer.selectionGroup !== null) {
                ApplicationState.shared.trigger = TriggerType.none;
                this._renderer.add({
                    animation: new Animation3D({
                        mesh: this._renderer.mainGroup,
                        targetRotationY: 0.49 * Math.PI,
                        completion: () => {
                            if ((ApplicationState.shared.interaction !== InteractionType.movingLayerWillBegin && ApplicationState.shared.interaction !== InteractionType.addingLayerWillBegin) || this._renderer.selectionGroup === null) return;
                            this._renderer.selectionGroup.previewable = false;
                            let contentLength = this._renderer.selectionGroup.contentLength || Container3D.symbolSpacing;
                            let eventPositionInWorldSpace = this.worldVector(event);
                            eventPositionInWorldSpace.z = 0;
                            this._initialSelectionPosition = this._renderer.selectionGroup.worldToLocal(eventPositionInWorldSpace);
                            this._initialSelectionPosition.projectOnPlane(new THREE.Vector3(1, 0, 0));
                            this._initialSelectionPosition.add(this.frontLayerPositionOffset);
                            this._initialSelectionPosition.add(this._renderer.selectionGroup.position.clone());
                            this._initialCameraPosition = this._renderer.cameraPosition;
                            let zoomScale = this._renderer.zoom < 1 ? 1 : this._renderer.zoom;
                            if (ApplicationState.shared.interaction === InteractionType.addingLayerWillBegin) {
                                this._renderer.selectionGroup.position.x = this._initialSelectionPosition.x;
                                this._renderer.selectionGroup.position.y = this._initialSelectionPosition.y;
                                this._renderer.selectionGroup.position.z = this._initialSelectionPosition.z;
                                this._renderer.selectionGroup.scale.x = 0.001;
                                this._renderer.selectionGroup.scale.y = 0.001;
                                this._renderer.selectionGroup.scale.z = 0.001;
                            }
                            this._renderer.add({
                                animation: new Animation3D({
                                    mesh: this._renderer.selectionGroup,
                                    targetPositionX: this._initialSelectionPosition.x,
                                    targetPositionY: this._initialSelectionPosition.y,
                                    targetPositionZ: this._initialSelectionPosition.z,
                                    targetScaleX: Container3D.symbolSpacing / (contentLength * zoomScale),
                                    targetScaleY: Container3D.symbolSpacing / (contentLength * zoomScale),
                                    targetScaleZ: Container3D.symbolSpacing / (contentLength * zoomScale),
                                    completion: () => {
                                        if (ApplicationState.shared.interaction === InteractionType.movingLayerWillBegin) {
                                            ApplicationState.shared.interaction = InteractionType.movingLayerDidBegin;
                                        } else if (ApplicationState.shared.interaction === InteractionType.addingLayerWillBegin) {
                                            ApplicationState.shared.interaction = InteractionType.addingLayerDidBegin;
                                        }
                                    }
                                })
                            });
                        }
                    })
                });
            }
        }
        if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode) {
            ApplicationState.shared.interaction = InteractionType.none;
            let currentRayScreenPositionInSymbolEditorMode = this.normalizedVector(event);
            let previousRayScreenPositionInSymbolEditorMode = null;
            if (this._previousRayScreenPositionInSymbolEditorMode) {
                previousRayScreenPositionInSymbolEditorMode = this._previousRayScreenPositionInSymbolEditorMode;
            }
            this._renderer.setSelectionFromRay({
                screenPosition: currentRayScreenPositionInSymbolEditorMode,
                previousScreenPosition: previousRayScreenPositionInSymbolEditorMode
            });
            this._previousRayScreenPositionInSymbolEditorMode = currentRayScreenPositionInSymbolEditorMode;
            clearTimeout(this._previousRayScreenPositionInSymbolEditorModeTimeout);
            this._previousRayScreenPositionInSymbolEditorModeTimeout = setTimeout(_ => {
                this._previousRayScreenPositionInSymbolEditorMode = null;
                this._previousRayScreenPositionInSymbolEditorModeTimeout = null;
            }, 6000);
            SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
            ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
            if (!(this._renderer.selectionGroup instanceof THREE.Object3D)) {
                // Flick close window if deselected to close anything open
                ApplicationState.shared.trigger = TriggerType.closeWindow;
                ApplicationState.shared.trigger = TriggerType.none;
            }
        }
    }

    longTouchMoved(event) {
        this._lastLongTouchMovedEvent = event;
        if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode && (ApplicationState.shared.interaction === InteractionType.movingLayerDidBegin || ApplicationState.shared.interaction === InteractionType.addingLayerDidBegin || ApplicationState.shared.interaction === InteractionType.groupingLayers)) {
            // Edge motion while drag dropping
            this._isInCornerMinusX = event.clientX < 0.1 * window.innerWidth;
            this._isInCornerPlusX = event.clientX > 0.9 * window.innerWidth;
            this._isInCornerMinusY = event.clientY < 0.1 * window.innerHeight;
            this._isInCornerPlusY = event.clientY > 0.9 * window.innerHeight;
            if (this._isInCornerMinusX || this._isInCornerPlusX
                || this._isInCornerMinusY || this._isInCornerPlusY) {
                if (this._edgeMotionInterval === null) {
                    this._edgeMotionInterval = setInterval(() => {
                        if (this._isInCornerMinusX) this._renderer.moveCameraBy({ x: -this._renderer.minimumZoom * this._edgeMotionSpeed / this._renderer.zoom, ignoresSelection: false });
                        else if (this._isInCornerPlusX) this._renderer.moveCameraBy({ x: this._renderer.minimumZoom * this._edgeMotionSpeed / this._renderer.zoom, ignoresSelection: false });
                        if (this._isInCornerMinusY) this._renderer.moveCameraBy({ y: this._renderer.minimumZoom * this._edgeMotionSpeed / this._renderer.zoom, ignoresSelection: false });
                        else if (this._isInCornerPlusY) this._renderer.moveCameraBy({ y: -this._renderer.minimumZoom * this._edgeMotionSpeed / this._renderer.zoom, ignoresSelection: false });
                        this.longTouchMoved(this._lastLongTouchMovedEvent);
                    }, 20);
                }
            } else if (this._edgeMotionInterval !== null) {
                clearInterval(this._edgeMotionInterval);
                this._edgeMotionInterval = null;
            }
            if (ApplicationState.shared.interaction === InteractionType.groupingLayers) {
                if (this._initialSelectionPosition !== null) {
                    let eventInWorldSpace = this.worldVector(event);
                    this._renderer.placeSelectionRectangle({
                        fromPosition: this._initialSelectionPosition,
                        toPosition: eventInWorldSpace
                    });
                }
                return;
            }
            if (this._renderer.selectionGroup !== null) {
                let displacementVector = this.worldVector(event).sub(this.worldVector(this._initialEvent));
                this._renderer.selectionGroup.position.y = this._initialSelectionPosition.y + (this._renderer.cameraPosition.y - this._initialCameraPosition.y) + displacementVector.y;
                this._renderer.selectionGroup.position.z = this._initialSelectionPosition.z + (this._renderer.cameraPosition.x - this._initialCameraPosition.x + displacementVector.x);
            } else {
                this.touchMoved(event);
            }
        } else {
            this.touchMoved(event);
        }
    }

    longTouchEnded(event) {
        clearInterval(this._edgeMotionInterval);
        this._edgeMotionInterval = null;
        // group addition
        if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode
            && ApplicationState.shared.interaction === InteractionType.groupingLayers) {
            ApplicationState.shared.interaction = InteractionType.none;
            let containedObjects = this._renderer.objectsContainedInBox({ containingBox: new THREE.Box3().setFromObject(this._renderer.selectionRectangle) });
            let layers = containedObjects.map(a => UIApplication.shared.symbolArt.root.getSublayer({ withUuidString: a.layerUuid }));
            if (layers.length > 0) {
                let commonAncestor = layers[0].parent;
                if (layers.length > 1) {
                    commonAncestor = layers[0].lowestCommonAncestor({ withLayer: layers[layers.length - 1] });
                }
                let wouldExceedNestingLimit = layers.filter(a => commonAncestor.distanceFromRoot + 1 + (a.depth ? a.depth : 0) >= Container.maximumDepth).length > 0;
                let wouldExceedContainerCount = UIApplication.shared.symbolArt.root.containers.length === SymbolArt.maximumNumberOfContainers;
                if (commonAncestor instanceof Container && !wouldExceedNestingLimit && !wouldExceedContainerCount) {
                    let indexOfAddition = commonAncestor.indexOf({ sublayer: layers[0] });
                    if (indexOfAddition === null) {
                        indexOfAddition = commonAncestor.indexOf({ sublayer: layers[0], recursive: true });
                        if (indexOfAddition !== null) indexOfAddition += 1;
                    }
                    if (indexOfAddition !== null) {
                        let container = new Container();
                        for (var index in layers) {
                            container.add({ sublayer: layers[index] });
                        }
                        commonAncestor.add({ sublayer: container, atIndex: indexOfAddition });
                        this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
                        HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                    }
                }
            }
            this._renderer.placeSelectionRectangle({
                fromPosition: null,
                toPosition: null
            });
            return;
        }
        // Layer move and layer addition
        if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode && (ApplicationState.shared.interaction === InteractionType.movingLayerDidBegin || ApplicationState.shared.interaction === InteractionType.movingLayerWillBegin || ApplicationState.shared.interaction === InteractionType.addingLayerDidBegin || ApplicationState.shared.interaction === InteractionType.addingLayerWillBegin)) {
            if (this._renderer.selectionGroup !== null) {
                let actionCanceled = true;
                if (ApplicationState.shared.interaction === InteractionType.movingLayerDidBegin || ApplicationState.shared.interaction === InteractionType.addingLayerDidBegin) {
                    this._renderer.selectionGroup.position.sub(this.frontLayerPositionOffset);
                    let selectionWorldPosition = this._renderer.selectionGroup.getWorldPosition(new THREE.Vector3());
                    this._renderer.selectionGroup.position.add(this.frontLayerPositionOffset);
                    let mainGroupWorldPosition = this._renderer.mainGroup.getWorldPosition(new THREE.Vector3());
                    let localPosition = this._renderer.mainGroup.worldToLocal(selectionWorldPosition.sub(mainGroupWorldPosition));
                    let closestDropLocation = this._renderer.closestTo({ position: localPosition });
                    if (closestDropLocation
                        && closestDropLocation.object
                        && closestDropLocation.object.layerUuid) {
                        let selectionUuid = this._renderer.selectionUuid;
                        let targetUuid = closestDropLocation.object.layerUuid;
                        let targetIndex = closestDropLocation.index;
                        let selectionLayer = null;
                        if (ApplicationState.shared.interaction === InteractionType.movingLayerDidBegin) {
                            selectionLayer = UIApplication.shared.symbolArt.findLayer({ withUuidString: selectionUuid });
                        } else if (ApplicationState.shared.interaction === InteractionType.addingLayerDidBegin && this._symbolBeingAdded !== null) {
                            selectionLayer = this._symbolBeingAdded;
                        }
                        let targetLayer = UIApplication.shared.symbolArt.findLayer({ withUuidString: targetUuid });
                        if (selectionLayer !== null && targetLayer !== null && selectionLayer !== targetLayer
                            && targetLayer instanceof Container && targetLayer.sublayers[targetIndex] !== selectionLayer
                            && (selectionLayer instanceof Symbol || !selectionLayer.contains({ sublayer: targetLayer }))
                            && targetLayer.canInsert({ sublayer: selectionLayer })) {
                            targetLayer.add({ sublayer: selectionLayer, atIndex: targetIndex });
                            this._renderer.selectionGroup.position.set(0, 0, this._renderer.selectionGroup.position.z);
                            this._renderer.selectionGroup.scale.set(1, 1, 1);
                            actionCanceled = false;
                        }
                    }
                }
                let isAdding = false;
                if (ApplicationState.shared.interaction === InteractionType.movingLayerWillBegin || ApplicationState.shared.interaction === InteractionType.movingLayerDidBegin) {
                    ApplicationState.shared.interaction = InteractionType.movingLayerDidEnd;
                } else if (ApplicationState.shared.interaction === InteractionType.addingLayerWillBegin || ApplicationState.shared.interaction === InteractionType.addingLayerDidBegin) {
                    ApplicationState.shared.interaction = InteractionType.addingLayerDidEnd;
                    isAdding = true;
                }
                if (actionCanceled) {
                    this._renderer.add({
                        animation: new Animation3D({
                            mesh: this._renderer.selectionGroup,
                            targetPositionX: isAdding ? null : this._renderer.selectionOriginalPosition.x,
                            targetPositionY: isAdding ? null : this._renderer.selectionOriginalPosition.y,
                            targetPositionZ: isAdding ? null : this._renderer.selectionOriginalPosition.z,
                            targetScaleX: isAdding ? 0.001 : 1,
                            targetScaleY: isAdding ? 0.001 : 1,
                            targetScaleZ: isAdding ? 0.001 : 1,
                            completion: () => {
                                this._renderer.add({
                                    animation: new Animation3D({
                                        mesh: this._renderer.mainGroup,
                                        targetRotationY: 1.4,
                                        completion: () => {
                                            ApplicationState.shared.interaction = InteractionType.none;
                                            this._renderer.rootLayer.previewable = true;
                                            this.cleanTemporarySymbol();
                                        }
                                    })
                                });
                            }
                        })
                    });
                } else {
                    this._renderer.add({
                        animation: new Animation3D({
                            mesh: this._renderer.mainGroup,
                            targetRotationY: 1.4,
                            completion: () => {
                                ApplicationState.shared.interaction = InteractionType.none;
                                this._renderer.rootLayer.previewable = true;
                                this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
                                this.cleanTemporarySymbol({ hasAddedSymbol: true });
                                HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                            }
                        })
                    });
                }
            } else {
                ApplicationState.shared.interaction = InteractionType.movingLayerDidEnd;
                this._renderer.add({
                    animation: new Animation3D({
                        mesh: this._renderer.mainGroup,
                        targetRotationY: 1.4,
                        completion: () => {
                            ApplicationState.shared.interaction = InteractionType.none;
                            this._renderer.rootLayer.previewable = true;
                            this.cleanTemporarySymbol();
                            if (ApplicationState.shared.interaction === InteractionType.movingLayerDidBegin || ApplicationState.shared.interaction === InteractionType.addingLayerDidBegin) {
                                HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                            }
                        }
                    })
                });
            }
        }
    }

    pinchingBegan(pinchCenter, displacement) {
        this._pinchingPreviousPosition = null;
        this.pinchingMoved(pinchCenter, displacement);
    }

    pinchingMoved(pinchCenter, displacement) {
        if (ApplicationState.shared.interaction === InteractionType.panning
            || ApplicationState.shared.interaction === InteractionType.reshapingSymbolWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingHelperImageWillBegin
            || ApplicationState.shared.interaction === InteractionType.reshapingContainerWillBegin) {
            ApplicationState.shared.interaction === InteractionType.none;
        } else if (ApplicationState.shared.interaction !== InteractionType.none) return;
        let factor = 1 + (displacement / Math.min(window.innerHeight, window.innerWidth));
        if ((factor > 1 && this._renderer.zoom === this._renderer.maximumZoom)
            || (factor < 1 && this._renderer.zoom === this._renderer.minimumZoom)) {
            factor = 1;
        }
        let eventWorldPositionBeforeZoom = this.worldVector(pinchCenter);
        this._renderer.zoom *= factor;
        let eventWorldPositionAfterZoom = this.worldVector(pinchCenter);
        let offset = { x: 0, y: 0 };
        if (this._pinchingPreviousPosition !== null) {
            let previousEventWorldPositionAfterZoom = this.worldVector(this._pinchingPreviousPosition);
            offset.x -= eventWorldPositionAfterZoom.x - previousEventWorldPositionAfterZoom.x;
            offset.y -= eventWorldPositionAfterZoom.y - previousEventWorldPositionAfterZoom.y;
        }
        this._renderer.moveCameraBy({
            x: eventWorldPositionBeforeZoom.x - eventWorldPositionAfterZoom.x + offset.x,
            y: eventWorldPositionBeforeZoom.y - eventWorldPositionAfterZoom.y + offset.y
        });
        this._pinchingPreviousPosition = pinchCenter;
    }

    normalizedVector(event) {
        return new THREE.Vector2(
            2 * event.clientX / window.innerWidth - 1,
            -2 * event.clientY / window.innerHeight + 1
        )
    }

    worldVector(event) {
        let normalizedPosition = this.normalizedVector(event);
        return new THREE.Vector3(normalizedPosition.x, normalizedPosition.y, -1).unproject(this._renderer.camera);
    }

    scrolled(event) {
        if (!event || typeof event.clientX !== 'number'
            || typeof event.clientY !== 'number'
            || typeof event.deltaY !== 'number'
            || Number.isNaN(event.deltaY)
            || !Number.isFinite(event.deltaY)
            || Math.abs(event.deltaY) < 1) return;
        if (ApplicationState.shared.interaction !== InteractionType.none) return;
        let factor = 1;
        if (event.deltaY > 0) {
            if (this._renderer.zoom === this._renderer.maximumZoom) return;
            factor = 1.05;
        } else {
            if (this._renderer.zoom === this._renderer.minimumZoom) return;
            factor = 0.95;
        }
        let eventWorldPositionBeforeZoom = this.worldVector(event)
        this._renderer.zoom *= factor;
        let eventWorldPositionAfterZoom = this.worldVector(event)
        this._renderer.moveCameraBy({
            x: eventWorldPositionBeforeZoom.x - eventWorldPositionAfterZoom.x,
            y: eventWorldPositionBeforeZoom.y - eventWorldPositionAfterZoom.y
        });
    }

    willPressKey(event) {
        if ((event.ctrlKey || event.metaKey) && (event.code === 'Equal' || event.keyCode === 187)) {
            event.preventDefault();
            this._renderer.zoom *= 1.05;
        } else if ((event.ctrlKey || event.metaKey) && (event.code === 'Minus' || event.keyCode === 189)) {
            event.preventDefault();
            this._renderer.zoom *= 0.95;
        } else {
            if (!this.longTouchesWithoutDelay && (event.key === "Shift" || event.keyCode === 16)) {
                ApplicationState.shared.interaction = InteractionType.disablingTapHoldFeature;
            } else if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode && (event.key === "Control" || event.keyCode === 17) && ApplicationState.shared.interaction !== InteractionType.willCloneCurrentSelection) {
                ApplicationState.shared.interaction = InteractionType.willCloneCurrentSelection;
            } else if (ApplicationState.shared.interaction === InteractionType.willCloneCurrentSelection && !(event.key === "Control" || event.keyCode === 17)) {
                ApplicationState.shared.interaction = InteractionType.none;
            }
        }
    }

    pressedKey(event) {
        if (ApplicationState.shared.interaction === InteractionType.willCloneCurrentSelection) {
            ApplicationState.shared.interaction = InteractionType.none;
        }
        if (this.longTouchesWithoutDelay && (event.key === "Shift" || event.keyCode === 16)) {
            ApplicationState.shared.interaction = InteractionType.enablingTapHoldFeature;
        }
        if (!event || ApplicationState.shared.interaction !== InteractionType.none || this._renderer.hasOngoingAnimations) return;
        if (event.code === 'Space' || event.keyCode === 32) {
            ApplicationState.shared.trigger = TriggerType.none;
            this._renderer.toggleViewMode();
        } else if (event.code === 'Delete' || event.keyCode === 46) {
            ApplicationState.shared.trigger = TriggerType.none;
            this.deleteSelection();
        } else if (event.code === 'KeyV' || event.keyCode === 86 || event.keyCode === 118) {
            ApplicationState.shared.trigger = TriggerType.focusSelection;
        } else if (event.code === 'KeyB' || event.keyCode === 66 || event.keyCode === 98) {
            ApplicationState.shared.trigger = TriggerType.focusHelperImage;
        } else if (event.code === 'KeyG' || event.keyCode === 71 || event.keyCode === 103) {
            ApplicationState.shared.trigger = TriggerType.toggledHelperImageGreenScreen;
        } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && (event.code === 'KeyZ' || event.keyCode === 90)) {
            HistoryState.shared.undo();
        } else if (((event.ctrlKey || event.metaKey) && (event.code === 'KeyY' || event.keyCode === 89))
            || ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.code === 'KeyZ' || event.keyCode === 90))) {
            HistoryState.shared.redo();
        } else if (event.code === 'ArrowUp' || event.keyCode === 38) {
            this._selectNextLayer();
        } else if (event.code === 'ArrowDown' || event.keyCode === 40) {
            this._selectPreviousLayer();
        }
    }

    cleanTemporarySymbol({ hasAddedSymbol = false } = {}) {
        if (this._symbolObjectBeingAdded !== null) {
            if (this._renderer.selectionGroup === this._symbolObjectBeingAdded) this._renderer.setSelection({ layer3D: null });
            if (this._symbolObjectBeingAdded !== null)
                this._symbolObjectBeingAdded.previewable = true;
            this._renderer.mainGroup.remove(this._symbolObjectBeingAdded);
            if (!hasAddedSymbol) this._symbolObjectBeingAdded.free();
            this._symbolObjectBeingAdded = null;
            this._symbolBeingAdded = null;
        }
        this._copiedLayer = null;
    }

    deleteSelection() {
        if (!UIApplication.shared.symbolArt) return;
        if (ApplicationState.shared.viewMode !== ViewMode.layerEditorMode) return;
        if (ApplicationState.shared.interaction !== InteractionType.none) return;
        if (!this._renderer.selectionGroup) return;
        let selectionLayer = UIApplication.shared.symbolArt.findLayer({ withUuidString: this._renderer.selectionUuid });
        if (!selectionLayer) return;
        if (selectionLayer === UIApplication.shared.symbolArt.root) return;
        ApplicationState.shared.trigger = TriggerType.none;
        ApplicationState.shared.interaction = InteractionType.removingLayer;
        let selectionWorldPosition = this._renderer.selectionGroup.getWorldPosition(new THREE.Vector3());
        let positionInScreenSpace = selectionWorldPosition.clone().project(this._renderer.camera);
        if (Math.abs(positionInScreenSpace.x) > 1 || Math.abs(positionInScreenSpace.y) > 1) {
            this._renderer.add({
                animation: new Animation3D({
                    mesh: this._renderer.camera,
                    targetPositionX: selectionWorldPosition.x,
                    targetPositionY: selectionWorldPosition.y,
                    completion: () => {
                        this._renderer.selectionGroup.previewable = false;
                        this._renderer.add({
                            animation: new Animation3D({
                                mesh: this._renderer.selectionGroup,
                                targetScaleX: 0.001,
                                targetScaleY: 0.001,
                                targetScaleZ: 0.001,
                                delayInFrames: 15,
                                completion: () => {
                                    selectionLayer.parent.remove({ sublayer: selectionLayer });
                                    ApplicationState.shared.interaction = InteractionType.none;
                                    this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
                                    HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                                }
                            })
                        });
                    }
                })
            });
        } else {
            this._renderer.selectionGroup.previewable = false;
            this._renderer.add({
                animation: new Animation3D({
                    mesh: this._renderer.selectionGroup,
                    targetScaleX: 0.001,
                    targetScaleY: 0.001,
                    targetScaleZ: 0.001,
                    completion: () => {
                        selectionLayer.parent.remove({ sublayer: selectionLayer });
                        ApplicationState.shared.interaction = InteractionType.none;
                        this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
                        HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                    }
                })
            });
        }
    }

    setColorForSelectedSymbol({ hexValue, opacity, updatesHistory = true }) {
        if (!(this._renderer.selectionGroup instanceof Symbol3D)
            || !this._renderer.selectionUuid
            || typeof hexValue !== 'number'
            || !Number.isSafeInteger(hexValue)
            || hexValue < 0 || hexValue > 0xffffff
            || !(opacity instanceof Opacity)) return;
        let selectionSymbol3D = this._renderer.selectionGroup;
        let selectionUuid = this._renderer.selectionUuid;
        let selectionLayer = UIApplication.shared.symbolArt.findLayer({ withUuidString: selectionUuid });
        if (!(selectionLayer instanceof Symbol)) return;
        if (!updatesHistory
            && selectionLayer.color.value === hexValue
            && selectionLayer.opacity.index === opacity.index) {
            return;
        }
        selectionLayer.color = new Color({ hexValue: hexValue });
        selectionLayer.opacity = opacity;
        selectionSymbol3D.update({ using: selectionLayer });
        if (updatesHistory) {
            HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
        }
    }

    setColorForSelectedContainer({ originalColorInContainer, hexValue, opacity, updatesHistory = true }) {
        if (!(this._renderer.selectionGroup instanceof Container3D)
            || !originalColorInContainer
            || !(originalColorInContainer.color instanceof Color)
            || !(originalColorInContainer.opacity instanceof Opacity)
            || !Array.isArray(originalColorInContainer.layerUuids)
            || !this._renderer.selectionUuid
            || typeof hexValue !== 'number'
            || !Number.isSafeInteger(hexValue)
            || hexValue < 0 || hexValue > 0xffffff
            || !(opacity instanceof Opacity)) return;
        let selectionContainer3D = this._renderer.selectionGroup;
        let selectionUuid = this._renderer.selectionUuid;
        let selectionLayer = UIApplication.shared.symbolArt.findLayer({ withUuidString: selectionUuid });
        if (!(selectionLayer instanceof Container)) return;
        if (!updatesHistory
            && originalColorInContainer.color.value === hexValue
            && originalColorInContainer.opacity.index === opacity.index) {
            return;
        }
        let symbols = selectionLayer.symbols.filter(a =>
            originalColorInContainer.layerUuids.includes(a.uuid));
        symbols.forEach(a => {
            a.color = new Color({ hexValue: hexValue });
            a.opacity = opacity;
        });
        selectionContainer3D.update({ using: selectionLayer });
        if (updatesHistory) {
            HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
        }
    }

    setAssetForSelectedSymbol({ asset }) {
        if (!(this._renderer.selectionGroup instanceof Symbol3D)
            || !this._renderer.selectionUuid
            || !(asset instanceof Asset)) return;
        let selectionSymbol3D = this._renderer.selectionGroup;
        let selectionUuid = this._renderer.selectionUuid;
        let selectionLayer = UIApplication.shared.symbolArt.findLayer({ withUuidString: selectionUuid });
        if (!(selectionLayer instanceof Symbol)) return;
        if (selectionLayer.asset.filePath === asset.filePath) return;
        selectionLayer.asset = asset;
        selectionSymbol3D.update({ using: selectionLayer });
        HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
    }

    toggleHideShow({ forLayer3D }) {
        if (!(forLayer3D instanceof Layer3D)) return;
        let layer = UIApplication.shared.symbolArt.findLayer({ withUuidString: forLayer3D.layerUuid });
        if (layer instanceof Layer) {
            layer.isHidden = !layer.isHidden;
            this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
            HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
        }
    }

    requestedLayerCopy({ layer3D }) {
        if (!(layer3D instanceof Layer3D)) {
            this._copiedLayer = null;
            return;
        }
        let layer = UIApplication.shared.symbolArt.root.getSublayer({ withUuidString: layer3D.layerUuid });
        if (!layer) {
            this._copiedLayer = null;
            return;
        }
        this._copiedLayer = layer.clone({ retainUuid: false });
        ApplicationState.shared.trigger = TriggerType.layerCopyPaste;
    }

    requestedContainerRenaming({ layer3D }) {
        if (!(layer3D instanceof Layer3D)) {
            return;
        }
        let uuid = layer3D.layerUuid;
        let layer = uuid !== UIApplication.shared.symbolArt.root.uuid ?
            UIApplication.shared.symbolArt.root.getSublayer({ withUuidString: uuid }) :
            UIApplication.shared.symbolArt.root;
        if (!(layer instanceof Container)) {
            return;
        }
        new UIModalTextField({
            title: 'Rename container:', initialText: layer.name,
            onInput: text => { },
            onResult: text => {
                if (layer.name == text) return;
                layer.name = text;
                this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
                HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
            }
        });
    }

    flipHorizontallySelectedLayer() {
        if (this._renderer.selectionGroup === null) return;
        let selectedLayer = UIApplication.shared.symbolArt.root.getSublayer({
            withUuidString: this._renderer.selectionGroup.layerUuid
        });
        let center;
        let symbols;
        if (selectedLayer instanceof Symbol) {
            center = selectedLayer.frame.origin;
            symbols = [selectedLayer];
        } else if (selectedLayer instanceof Container) {
            symbols = selectedLayer.symbols;
            let minX = Math.min(...symbols.map(a => a.frame.minimumX));
            let maxX = Math.max(...symbols.map(a => a.frame.maximumX));
            let minY = Math.min(...symbols.map(a => a.frame.minimumY));
            let maxY = Math.max(...symbols.map(a => a.frame.maximumY));
            center = {
                x: 0.5 * (minX + maxX),
                y: 0.5 * (minY + maxY)
            };
        } else {
            return;
        }
        for (var index in symbols) {
            symbols[index].flipHorizontally();
            symbols[index].frame.origin.set({
                x: 2 * center.x - symbols[index].frame.origin.x,
                y: symbols[index].frame.origin.y
            });
        }
        this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
        SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
        ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
        HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
    }

    flipVerticallySelectedLayer() {
        if (this._renderer.selectionGroup === null) return;
        let selectedLayer = UIApplication.shared.symbolArt.root.getSublayer({
            withUuidString: this._renderer.selectionGroup.layerUuid
        });
        let center;
        let symbols;
        if (selectedLayer instanceof Symbol) {
            center = selectedLayer.frame.origin;
            symbols = [selectedLayer];
        } else if (selectedLayer instanceof Container) {
            symbols = selectedLayer.symbols;
            let minX = Math.min(...symbols.map(a => a.frame.minimumX));
            let maxX = Math.max(...symbols.map(a => a.frame.maximumX));
            let minY = Math.min(...symbols.map(a => a.frame.minimumY));
            let maxY = Math.max(...symbols.map(a => a.frame.maximumY));
            center = {
                x: 0.5 * (minX + maxX),
                y: 0.5 * (minY + maxY)
            };
        } else {
            return;
        }
        for (var index in symbols) {
            symbols[index].flipVertically();
            symbols[index].frame.origin.set({
                x: symbols[index].frame.origin.x,
                y: 2 * center.y - symbols[index].frame.origin.y
            });
        }
        this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
        SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
        ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
        HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
    }

    rotate90DegreesSelectedLayer() {
        if (this._renderer.selectionGroup === null) return;
        let selectedLayer = UIApplication.shared.symbolArt.root.getSublayer({
            withUuidString: this._renderer.selectionGroup.layerUuid
        });
        let center;
        let symbols;
        if (selectedLayer instanceof Symbol) {
            center = selectedLayer.frame.origin;
            symbols = [selectedLayer];
        } else if (selectedLayer instanceof Container) {
            symbols = selectedLayer.symbols;
            let minX = Math.min(...symbols.map(a => a.frame.minimumX));
            let maxX = Math.max(...symbols.map(a => a.frame.maximumX));
            let minY = Math.min(...symbols.map(a => a.frame.minimumY));
            let maxY = Math.max(...symbols.map(a => a.frame.maximumY));
            center = {
                x: 0.5 * (minX + maxX),
                y: 0.5 * (minY + maxY)
            };
        } else {
            return;
        }
        for (var index in symbols) {
            symbols[index].rotate90DegreesClockwise();
            symbols[index].frame.origin.set({
                x: center.x + (symbols[index].frame.origin.y - center.y),
                y: center.y - (symbols[index].frame.origin.x - center.x)
            });
        }
        this._renderer.updateWith({ symbolArt: UIApplication.shared.symbolArt });
        SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
        ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
        HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
    }

    _updateSymbolColorGuess() {
        if (this._renderer.selectionGroup instanceof Symbol3D) {
            let symbol = UIApplication.shared.symbolArt.root.getSublayer({ withUuidString: this._renderer.selectionGroup.layerUuid });
            if (symbol instanceof Symbol) {
                this._colorValueOfRecentSymbol = symbol.color.value;
            }
        }
    }
    
    _selectNextLayer() {
        let foundCurrentlySelected = false;
        let layers = [];
        UIApplication.shared.symbolArt.root.reverseDepthFirstIterator(layer => {
            layers.push(layer);
        });
        for (var index = layers.length - 1; index >= 0; index--) {
            let layer = layers[index];
            if (foundCurrentlySelected) {
                this._renderer.setSelection({ layer3D: Object.values(Layer3D.layersInUse).filter(a => a.layerUuid === layer.uuid)[0] });
                SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                HelperImageControls3D.shared.attach({ toHelperImage: null });
                break;
            }
            if (layer.uuid === this._renderer.selectionUuid) {
                foundCurrentlySelected = true;
            }
        }
    }
    
    _selectPreviousLayer() {
        let foundCurrentlySelected = false;
        UIApplication.shared.symbolArt.root.reverseDepthFirstIterator(layer => {
            if (foundCurrentlySelected) {
                this._renderer.setSelection({ layer3D: Object.values(Layer3D.layersInUse).filter(a => a.layerUuid === layer.uuid)[0] });
                SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                HelperImageControls3D.shared.attach({ toHelperImage: null });
                return true;
            }
            if (layer.uuid === this._renderer.selectionUuid) {
                foundCurrentlySelected = true;
            }
        });
    }

}
