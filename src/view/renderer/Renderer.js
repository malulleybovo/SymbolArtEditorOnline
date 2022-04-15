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

class Renderer {
    
    get maximumZoom() {
        return 15 * 2 * Math.abs(this._camera.right) * this._zoom / window.innerWidth
    }
    get minimumZoom() {
        return 0.2 * 2 * Math.abs(this._camera.right) * this._zoom / window.innerWidth
    }

    _presenter = null;
    get presenter() { return this._presenter }

    _onSymbolArtChanged = null;
    set onSymbolArtChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onSymbolArtChanged = value;
    }

    _onSelectionChanged = null;
    set onSelectionChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onSelectionChanged = value;
    }
    
    _onFocusChanged = null;
    set onFocusChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onFocusChanged = value;
    }

    _onHelperImageTextureChanged = null;
    set onHelperImageTextureChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onHelperImageTextureChanged = value;
        if (this._onHelperImageTextureChanged) {
            this._onHelperImageTextureChanged(this.helperImage.imageMaterial.map === null ?
                null : this.helperImage.imageMaterial.map.image.src);
        }
    }

    _onHelperImageFocusChanged = null;
    set onHelperImageFocusChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onHelperImageFocusChanged = value;
    }

    _onHelperImageGreenScreenEnabledChanged = null;
    set onHelperImageGreenScreenEnabledChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onHelperImageGreenScreenEnabledChanged = value;
    }

    _isFocusingSelection = false;
    get isFocusingSelection() { return this._isFocusingSelection }

    _zoom = 1;
    get zoom() { return this._zoom }
    set zoom(value) {
        if (!this.isValid({ zoom: value })) return;
        value = Math.min(this.maximumZoom, Math.max(this.minimumZoom, value));
        if (this._zoom === value) return;
        this._zoom = value;
        this.resizeRendererAndCamera();
    }

    _camera = (() => {
        let camera = new THREE.OrthographicCamera(-1, 1, -1, 1, 0.1, 1);
        camera.layers.enable(Symbol3D.channel);
        camera.layers.enable(SymbolControls3D.channel);
        return camera;
    })();
    get camera() { return this._camera }
    get cameraPosition() {
        return this._camera.position.clone();
    }

    _previewCamera = (() => {
        let camera = new THREE.OrthographicCamera(-1, 1, -1, 1, 0.1, 1);
        camera.layers.disableAll();
        camera.layers.set(Symbol3D.previewChannel);
        return camera;
    })();

    _ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);

    _scene = (() => {
        let scene = new THREE.Scene();
        scene.background = new THREE.Color(0x3c3c3c);
        return scene;
    })();

    _helperImage = (() => {
        let helperImage = new HelperImage3D();
        helperImage.onChangeTexture = (imageData) => {
            if (this._onHelperImageTextureChanged) {
                this._onHelperImageTextureChanged(imageData)
            }
        };
        helperImage.onChangeGeometry = () => {
            HelperImageControls3D.shared.layoutIfNeeded();
        };
        helperImage.onChangeFocus = (state) => {
            if (this._onHelperImageFocusChanged) {
                this._onHelperImageFocusChanged(state);
            }
        };
        helperImage.onChangeGreenScreenEnabled = (state) => {
            if (this._onHelperImageGreenScreenEnabledChanged) {
                this._onHelperImageGreenScreenEnabledChanged(state);
            }
        };
        return helperImage;
    })();r
    get helperImage() { return this._helperImage }

    _mainGroup = new THREE.Group();
    get mainGroup() { return this._mainGroup }
    get rootLayer() {
        return this._mainGroup.children.length > 0 ?
            this._mainGroup.children[0] :
            null;
    }
    
    _selectedMesh = null;
    _selectionGroupOriginalPosition = null;
    get selectionGroup() {
        if (this._selectedMesh === null) return null;
        if (!(this._selectedMesh.parent instanceof Layer3D)) return null;
        return this._selectedMesh.parent;
    }
    get selectionPlane() {
        if (!this.selectionGroup) return null;
        return this.selectionGroup.plane;
    }
    get selectionUuid() {
        if (!this.selectionGroup) return null;
        return this.selectionGroup.layerUuid;
    }
    get selectionOriginalPosition() { return this._selectionGroupOriginalPosition }

    _selectableMeshes = [];
    _selectableMeshesInSymbolEditorMode = [];
    _selectableButtons = [];

    _selectionRectangle = new SelectionRectangle3D();
    get selectionRectangle() { return this._selectionRectangle }

    _symbolArtDelimiter = new Frame3D({
        outerBorderSize: new Size({
            width: 5 * SymbolArt.usableDimensions.width,
            height: 5 * SymbolArt.usableDimensions.height
        }),
        innerBorderSize: SymbolArt.viewableDimensions
    });

    _previewSymbolArtDelimiter = (() => {
        let frame = new Frame3D({
            outerBorderSize: new Size({
                width: 5 * SymbolArt.usableDimensions.width,
                height: 5 * SymbolArt.usableDimensions.height
            }),
            innerBorderSize: SymbolArt.viewableDimensions
        });
        frame.position.z = -10;
        frame.edges.layers.set(Symbol3D.previewChannel);
        return frame;
    })();

    _ongoingAnimations = [];
    get hasOngoingAnimations() { return this._ongoingAnimations.length > 0 }

    _engine = (() => {
        let renderer = new THREE.WebGLRenderer({ powerPreference: 'high-performance', antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        this._scene.add(this._ambientLight);
        this._scene.add(this._helperImage);
        this._scene.add(this._mainGroup);
        this._scene.add(this._symbolArtDelimiter);
        this._previewCamera.add(this._previewSymbolArtDelimiter);
        return renderer;
    })();
    get domElement() {
        return this._engine.domElement;
    }

    _raycaster = (() => {
        let raycaster = new THREE.Raycaster();
        raycaster.layers.enable(Symbol3D.channel);
        raycaster.layers.enable(SymbolControls3D.channel);
        raycaster.layers.enable(HelperImageControls3D.channel);
        return raycaster;
    })();
    
    constructor() {
        window.addEventListener('resize', (event) => {
            this.viewportResized({ event: event });
        }, true);
        this.resizeRendererAndCamera();
        this._presenter = new RendererPresenter({ renderer: this });
    }

    viewModeStateUpdated() {
        if (ApplicationState.shared.interaction !== InteractionType.none) return;
        ApplicationState.shared.interaction = InteractionType.togglingViewMode;
        if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode
            || ApplicationState.shared.viewMode === ViewMode.helperImageMode) {
            this.rotateMainGroupAroundX({
                toValue: 0,
                duration: 5,
                completion: () => {
                    this.rotateMainGroupAroundY({
                        toValue: 0,
                        duration: 10,
                        completion: () => {
                            if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode) {
                                this._camera.layers.disable(HelperImageControls3D.channel);
                                this._camera.layers.enable(SymbolControls3D.channel);
                                SymbolControls3D.shared.attach({ toSymbol3D: this.selectionGroup });
                                ContainerControls3D.shared.attach({ toContainer3D: this.selectionGroup });
                                HelperImageControls3D.shared.attach({ toHelperImage: null });
                            } else if (ApplicationState.shared.viewMode === ViewMode.helperImageMode) {
                                this._camera.layers.disable(SymbolControls3D.channel);
                                this._camera.layers.enable(HelperImageControls3D.channel);
                                SymbolControls3D.shared.attach({ toSymbol3D: null });
                                ContainerControls3D.shared.attach({ toContainer3D: null });
                                HelperImageControls3D.shared.attach({ toHelperImage: this.helperImage });
                            }
                            this.add({
                                animation: new Animation3D({
                                    material: this._symbolArtDelimiter.outlineMaterial,
                                    opacity: 1,
                                    duration: 5
                                })
                            });
                            this.add({
                                animation: new Animation3D({
                                    material: Frame3D.material,
                                    opacity: 1,
                                    duration: 5,
                                    completion: () => {
                                        this._helperImage.visible = true;
                                        this._selectableMeshes.forEach(a => { a.visible = false });
                                        ApplicationState.shared.interaction = InteractionType.none;
                                    }
                                })
                            });
                        }
                    });
                }
            });
            this.add({ animation: new Animation3D({ material: Layer3D.backgroundMaterial, opacity: 0 }) });
            this.add({ animation: new Animation3D({ material: Layer3D.outlineMaterial, opacity: 0 }) });
            this.add({ animation: new Animation3D({ material: Layer3D.selectedOutlineMaterial, opacity: 0 }) });
            if (ApplicationState.shared.viewMode === ViewMode.helperImageMode) {
                this.setSelection({ layer3D: null });
            }
        } else {
            this._helperImage.visible = false;
            this.add({
                animation: new Animation3D({
                    material: this._symbolArtDelimiter.outlineMaterial,
                    opacity: 0,
                    duration: 5
                })
            });
            this.add({
                animation: new Animation3D({
                    material: Frame3D.material,
                    opacity: 0,
                    durationInFrames: 5,
                    completion: () => {
                        this._camera.layers.disable(SymbolControls3D.channel);
                        SymbolControls3D.shared.attach({ toSymbol3D: null });
                        this._camera.layers.disable(ContainerControls3D.channel);
                        ContainerControls3D.shared.attach({ toContainer3D: null });
                        this._camera.layers.disable(HelperImageControls3D.channel);
                        HelperImageControls3D.shared.attach({ toHelperImage: null });
                        this.rotateMainGroupAroundY({
                            toValue: 1.4,
                            duration: 10,
                            completion: () => {
                                this.rotateMainGroupAroundX({
                                    toValue: 0.05,
                                    duration: 5,
                                    completion: () => {
                                        ApplicationState.shared.interaction = InteractionType.none;
                                    }
                                });
                            }
                        });
                    }
                })
            });
            this._selectableMeshes.forEach(a => { a.visible = true });
            this.add({ animation: new Animation3D({ material: Layer3D.backgroundMaterial, opacity: 1 }) });
            this.add({ animation: new Animation3D({ material: Layer3D.outlineMaterial, opacity: 1 }) });
            this.add({ animation: new Animation3D({ material: Layer3D.selectedOutlineMaterial, opacity: 1 }) });
        }
        this.panToSelection({ changingViewMode: true });
    }

    toggleViewMode() {
        if (ApplicationState.shared.interaction !== InteractionType.none) return;
        let previousViewMode = ApplicationState.shared.viewMode;
        if (ApplicationState.shared.viewMode !== ViewMode.symbolEditorMode) {
            ApplicationState.shared.viewMode = ViewMode.symbolEditorMode;
            this._engine.autoClear = true;
        } else {
            ApplicationState.shared.viewMode = ViewMode.layerEditorMode;
            this._engine.autoClear = false;
        }
        this.viewModeStateUpdated();
    }

    panToSelection({ changingViewMode = false } = { }) {
        let targetX = 0;
        let targetY = 0;
        if (this.selectionGroup) {
            if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode) {
                let selectionWorldPosition = this.selectionGroup.getWorldPosition(new THREE.Vector3());
                if (changingViewMode) {
                    selectionWorldPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), 1.4);
                    selectionWorldPosition.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.05);
                }
                targetX = selectionWorldPosition ? selectionWorldPosition.x : 0;
                targetY = selectionWorldPosition ? selectionWorldPosition.y : 0;
            } else if (ApplicationState.shared.viewMode === ViewMode.symbolEditorMode) {
                targetX = 0;
                targetY = 0;
            }
        }
        this.add({
            animation: new Animation3D({
                mesh: this._camera,
                targetPositionX: targetX,
                targetPositionY: targetY,
            })
        });
    }

    rotateMainGroupAroundX({ toValue, duration = Animation3D.defaultNumberOfFrames, completion }) {
        this.add({
            animation: new Animation3D({
                mesh: this._mainGroup,
                targetRotationX: toValue,
                durationInFrames: duration,
                completion: completion
            })
        });
    }

    rotateMainGroupAroundY({ toValue, duration = 15, completion }) {
        this.add({
            animation: new Animation3D({
                mesh: this._mainGroup,
                targetRotationY: toValue,
                durationInFrames: duration,
                completion: completion
            })
        });
    }

    moveCameraTo({ x = undefined, y = undefined, ignoresSelection = false } = {}) {
        let mainGroupBoundingBox = null;
        if (this.selectionGroup) {
            let currentSelectionPosition = this.selectionGroup.position.clone();
            if (!ignoresSelection) this.selectionGroup.position.copy(this._selectionGroupOriginalPosition);
            mainGroupBoundingBox = new THREE.Box3().setFromObject(this._mainGroup);
            if (!ignoresSelection) this.selectionGroup.position.copy(currentSelectionPosition);
        } else {
            mainGroupBoundingBox = new THREE.Box3().setFromObject(this._mainGroup);
        }
        let percentage = 1;
        if (typeof x === 'number' && !Number.isNaN(x) && Number.isFinite(x)) {
            if (x < percentage * (mainGroupBoundingBox.min.x + this._camera.left)) {
                this._camera.position.x = percentage * (mainGroupBoundingBox.min.x + this._camera.left);
            } else if (x > percentage * (mainGroupBoundingBox.max.x + this._camera.right)) {
                this._camera.position.x = percentage * (mainGroupBoundingBox.max.x + this._camera.right);
            } else this._camera.position.x = x;
        }
        if (typeof y === 'number' && !Number.isNaN(y) && Number.isFinite(y)) {
            if (y < percentage * (mainGroupBoundingBox.min.y + this._camera.bottom)) {
                this._camera.position.y = percentage * (mainGroupBoundingBox.min.y + this._camera.bottom);
            } else if (y > percentage * (mainGroupBoundingBox.max.y + this._camera.top)) {
                this._camera.position.y = percentage * (mainGroupBoundingBox.max.y + this._camera.top);
            } else this._camera.position.y = y;
        }
    }

    moveCameraBy({ x = undefined, y = undefined, ignoresSelection = true } = {}) {
        this.moveCameraTo({
            x: this._camera.position.x + x,
            y: this._camera.position.y + y,
            ignoresSelection: ignoresSelection
        });
    }
    
    render() {
        requestAnimationFrame(() => { this.render() });
        if (this._ongoingAnimations.length > 0) {
            let needsCleaning = false;
            for (var index in this._ongoingAnimations) {
                this._ongoingAnimations[index].animateOneFrame();
                needsCleaning = needsCleaning || this._ongoingAnimations[index].completed;
            }
            if (needsCleaning) {
                this._ongoingAnimations = this._ongoingAnimations.filter(a => !a.completed);
            }
        }
        if (ApplicationState.shared.viewMode === ViewMode.layerEditorMode) {
            this._engine.clear();
            this._engine.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this._engine.setScissor(0, 0, window.innerWidth, window.innerHeight);
            this._engine.setScissorTest(true);
            this._engine.render(this._scene, this._camera);
            this._engine.clearDepth();

            this._engine.setViewport(window.innerWidth - 0.5 * SymbolArt.viewableDimensions.width, window.innerHeight - 0.5 * SymbolArt.viewableDimensions.height, 0.5 * SymbolArt.viewableDimensions.width, 0.5 * SymbolArt.viewableDimensions.height);
            this._engine.setScissor(window.innerWidth - 0.5 * SymbolArt.viewableDimensions.width, window.innerHeight - 0.5 * SymbolArt.viewableDimensions.height, 0.5 * SymbolArt.viewableDimensions.width, 0.5 * SymbolArt.viewableDimensions.height);
            this._engine.setScissorTest(true);
            this._engine.render(this._scene, this._previewCamera);
        } else {
            this._engine.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this._engine.setScissor(0, 0, window.innerWidth, window.innerHeight);
            this._engine.setScissorTest(true);
            this._engine.render(this._scene, this._camera);
        }
    }

    resizeRendererAndCamera() {
        let scaleX = 1.4;
        let scaleY = 1.4;
        if (window.innerWidth > window.innerHeight) {
            scaleX *= window.innerWidth / window.innerHeight;
        } else {
            scaleY *= window.innerHeight / window.innerWidth;
        }
        this._camera.left = -SymbolArt.usableDimensions.width * scaleX / (2 * this._zoom);
        this._camera.right = SymbolArt.usableDimensions.width * scaleX / (2 * this._zoom);
        this._camera.top = SymbolArt.usableDimensions.height * scaleY / (2 * this._zoom);
        this._camera.bottom = -SymbolArt.usableDimensions.height * scaleY / (2 * this._zoom);
        this._camera.far = this.maximumZoom * Math.max(Container3D.containerSpacing, Container3D.symbolSpacing) * (SymbolArt.maximumNumberOfSymbols + 5);
        this._camera.position.z = 0.5 * this._camera.far;
        this._camera.updateProjectionMatrix();

        this._previewCamera.left = - SymbolArt.viewableDimensions.width / 2;
        this._previewCamera.right = 2 + SymbolArt.viewableDimensions.width / 2;
        this._previewCamera.top = SymbolArt.viewableDimensions.height / 2;
        this._previewCamera.bottom = -2 - SymbolArt.viewableDimensions.height / 2;
        this._previewCamera.far = this._camera.far;
        this._previewCamera.position.z = this._camera.position.z;
        this._previewCamera.updateProjectionMatrix();

        this._helperImage.position.z = -0.5 * this._camera.far + 10;
        let controlScaling = 2 * Math.abs(this._camera.right) / window.innerWidth;
        SymbolControls3D.shared.setScaling({ factor: controlScaling });
        ContainerControls3D.shared.setScaling({ factor: controlScaling });
        HelperImageControls3D.shared.setScaling({ factor: controlScaling });
        
        this._engine.setSize(window.innerWidth, window.innerHeight);
        this.zoom = this.zoom;
    }

    viewportResized({ event = undefined } = {}) {
        this.resizeRendererAndCamera();
    }

    add({ animation = null }) {
        if (typeof animation === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        if (!this.isValid({ animation: animation })) return;
        this._ongoingAnimations.push(animation);
    }

    isValid({ zoom = undefined, animation = undefined, number = undefined } = {}) {
        if (typeof zoom === 'undefined' && typeof animation === 'undefined' && typeof number === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof zoom !== 'undefined') {
            return typeof zoom === 'number';
        }
        if (valid && typeof animation !== 'undefined') {
            valid = animation instanceof Animation3D;
        }
        if (valid && typeof number !== 'undefined') {
            valid = typeof number === 'number';
        }
        return valid;
    }

    touched({ screenPosition, hitsLayers = true, hitsControls = true } = {}) {
        if (!(screenPosition instanceof THREE.Vector2)) {
            this.setSelection({ layer3D: null });
            return;
        }
        this._raycaster.setFromCamera(screenPosition, this._camera);
        if (hitsControls) {
            let intersectedControls = this._raycaster.intersectObjects(SymbolControls3D.shared.controls.filter(a => a instanceof Button3D));
            if (intersectedControls.length === 0)
                intersectedControls = this._raycaster.intersectObjects(SymbolControls3D.shared.controls.filter(a => !(a instanceof Button3D)));
            SymbolControls3D.shared.activeControl = intersectedControls.length > 0 ? intersectedControls[0].object : null;
            ContainerControls3D.shared.activeControl = null;
            HelperImageControls3D.shared.activeControl = null;
            if (SymbolControls3D.shared.activeWhich === null) {
                let intersectedControls = this._raycaster.intersectObjects(ContainerControls3D.shared.controls.filter(a => a instanceof Button3D));
                if (intersectedControls.length === 0)
                    intersectedControls = this._raycaster.intersectObjects(ContainerControls3D.shared.controls.filter(a => !(a instanceof Button3D)));
                ContainerControls3D.shared.activeControl = intersectedControls.length > 0 ? intersectedControls[0].object : null;
                if (ContainerControls3D.shared.activeWhich === null) {
                    let intersectedControls = this._raycaster.intersectObjects(HelperImageControls3D.shared.controls.filter(a => a instanceof Button3D));
                    if (intersectedControls.length === 0)
                        intersectedControls = this._raycaster.intersectObjects(HelperImageControls3D.shared.controls.filter(a => !(a instanceof Button3D)));
                    HelperImageControls3D.shared.activeControl = intersectedControls.length > 0 ? intersectedControls[0].object : null;
                }
            }
        }
        if (hitsLayers) {
            let intersectedObjects = this._raycaster.intersectObjects(this._selectableMeshes);
            let plane = intersectedObjects.length > 0 ? intersectedObjects[0].object : null;
            this.setSelection({
                layer3D: plane instanceof THREE.Object3D ? plane.parent : null
            });
            if (plane === null) {
                intersectedObjects = this._raycaster.intersectObjects(this._selectableButtons);
                let button3D = intersectedObjects.length > 0 ? intersectedObjects[0].object : null;
                let actions = [
                    {
                        checker: a => a.hideShowButton === button3D,
                        result: layer3D => {
                            this._presenter.toggleHideShow({ forLayer3D: layer3D });
                        }
                    },
                    {
                        checker: a => a.copyButton === button3D,
                        result: layer3D => {
                            this.presenter.requestedLayerCopy({ layer3D: layer3D });
                        }
                    },
                    {
                        checker: a => a.nameText === button3D,
                        result: layer3D => {
                            this.presenter.requestedContainerRenaming({ layer3D: layer3D });
                        }
                    },
                ]
                let layers = Object.values(Layer3D.layersInUse)
                    .concat(this.rootLayer ? [this.rootLayer] : []);
                for (var index in actions) {
                    let layer3D = layers.filter(actions[index].checker)[0];
                    if (layer3D) {
                        actions[index].result(layer3D);
                    }
                }
            }
        }
    }

    setSelectionFromRay({ screenPosition, previousScreenPosition }) {
        if (!(screenPosition instanceof THREE.Vector2)) {
            this.setSelection({ layer3D: null });
            return;
        }
        this._raycaster.setFromCamera(screenPosition, this._camera);
        let intersectedObjects = this._raycaster.intersectObjects(this._selectableMeshesInSymbolEditorMode);
        let plane = null;
        intersectedObjects = intersectedObjects.sort((a, b) => {
            return a.point.distanceTo(a.object.getWorldPosition(new THREE.Vector3()))
                - b.point.distanceTo(b.object.getWorldPosition(new THREE.Vector3()));
        });
        if (previousScreenPosition instanceof THREE.Vector2
            && previousScreenPosition.distanceTo(screenPosition) < 0.1
            && this.selectionGroup !== null) {
            let indexOfSelection = intersectedObjects.map(a => a.object).indexOf(this.selectionGroup.shape);
            if (Number.isSafeInteger(indexOfSelection) && indexOfSelection >= 0) {
                indexOfSelection = (indexOfSelection + 1) % intersectedObjects.length;
                plane = intersectedObjects[indexOfSelection].object;
            }
        }
        if (!(plane instanceof THREE.Object3D)) {
            plane = intersectedObjects.length > 0 ? intersectedObjects[0].object : null;
        }
        this.setSelection({
            layer3D: plane instanceof THREE.Object3D ? plane.parent : null
        });
    }

    setSelection({ layer3D }) {
        if (this.selectionGroup) {
            this.selectionGroup.isSelected = false;
        }
        this._selectedMesh = layer3D instanceof Layer3D ? layer3D.plane : null;
        this._selectionGroupOriginalPosition = this.selectionGroup ? this.selectionGroup.position.clone() : null;
        if (this.selectionGroup) {
            this.selectionGroup.isSelected = true;
        }
        this.focusSelection({ state: this._isFocusingSelection });
        if (this._onSelectionChanged) {
            let selectionUuid = this.selectionUuid;
            this._onSelectionChanged(selectionUuid);
        }
    }

    closestTo({ position, current = this.rootLayer, startIndex = 0, endIndex = this.rootLayer.sublayers.length - 1, offset = 0, ignoresSelectedObjects = true }) {
        if (!(position instanceof THREE.Vector3) || !(current instanceof THREE.Object3D)
            || startIndex < 0 || endIndex >= current.sublayers.length) return null;
        // Ignores if too far above or below
        if (position.y > SymbolArt.usableDimensions.height || position.y < -SymbolArt.usableDimensions.height) return null;
        // Ignores if too far right or left
        if (position.z < -(SymbolArt.usableDimensions.height / 2) - this.rootLayer.contentLength / 2) return null;
        if (position.z > (SymbolArt.usableDimensions.height / 2) + this.rootLayer.contentLength / 2) return null;
        if (endIndex < startIndex) {
            return {
                object: current,
                index: startIndex
            };
        }
        let midChildIndex = Math.floor((endIndex + startIndex) / 2);
        let midChild = current.sublayers[midChildIndex];
        if (!(midChild instanceof THREE.Object3D)) return null;
        let contentLength = midChild.contentLength || 0;
        let margin = (contentLength > 0 ? Container3D.containerSpacing : Container3D.symbolSpacing) / 2;
        let midChildZ = offset;
        if (ignoresSelectedObjects && this.selectionGroup && this.selectionGroup === midChild) {
            midChildZ += this._selectionGroupOriginalPosition.z;
        } else {
            midChildZ += midChild.position.z;
        }
        if (position.z >= midChildZ - margin - contentLength / 2
            && position.z <= midChildZ + margin + contentLength / 2) {
            if (ignoresSelectedObjects && current.isSelected) {
                return null;
            }
            if (midChild instanceof Symbol3D) {
                // position closest to symbol object
                return {
                    object: current,
                    index: midChildIndex + (position.z > (midChildZ + margin) ? 1 : 0)
                };
            } else if (position.z < midChildZ - contentLength / 2
                || position.z > midChildZ + contentLength / 2) {
                // position closest to midChild but not within it
                return {
                    object: current,
                    index: midChildIndex + (position.z > midChildZ ? 1 : 0)
                };
            } else if (Math.abs(position.z - midChildZ + contentLength / 2) < 1) {
                // position closest to bottom of midChild sublayers
                return {
                    object: midChild,
                    index: 1
                };
            } else if (Math.abs(position.z - midChildZ - contentLength / 2) < 1) {
                // position closest to top of midChild sublayers
                return {
                    object: midChild,
                    index: midChild.sublayers.length
                };
            } else {
                // position within midChild
                return this.closestTo({ position: position, current: midChild, startIndex: 0, endIndex: midChild.sublayers.length - 1, offset: midChildZ, ignoresSelectedObjects: ignoresSelectedObjects });
            }
        } else if (position.z < midChildZ - margin - contentLength / 2) {
            // position before midChild
            return this.closestTo({ position: position, current: current, startIndex: startIndex, endIndex: midChildIndex - 1, offset: offset, ignoresSelectedObjects: ignoresSelectedObjects });
        } else {
            // position after midChild
            return this.closestTo({ position: position, current: current, startIndex: midChildIndex + 1, endIndex: endIndex, offset: offset, ignoresSelectedObjects: ignoresSelectedObjects });
        }
    }

    updateWith({ symbolArt }) {
        if (!(symbolArt instanceof SymbolArt) || ApplicationState.shared.interaction !== InteractionType.none) return;
        this.resizeRendererAndCamera();
        this._symbolArtDelimiter.updateBorders({
            outerBorderSize: new Size({
                width: 5 * SymbolArt.usableDimensions.width,
                height: 5 * SymbolArt.usableDimensions.height
            }),
            innerBorderSize: SymbolArt.viewableDimensions
        });
        this._previewSymbolArtDelimiter.updateBorders({
            outerBorderSize: new Size({
                width: 5 * SymbolArt.usableDimensions.width,
                height: 5 * SymbolArt.usableDimensions.height
            }),
            innerBorderSize: SymbolArt.viewableDimensions
        });
        let selectionUuid = this.selectionUuid;
        this.setSelection({ layer3D: null });
        this._selectableMeshes = [];
        this._selectableMeshesInSymbolEditorMode = [];
        if (this.rootLayer) {
            ApplicationState.shared.interaction = InteractionType.updatingEditor;
            let changes = this.rootLayer.update({ using: symbolArt.root, forAnimation: true });
            for (var index in changes.animations) {
                this.add({ animation: changes.animations[index] })
            }
            this.add({
                animation: new Animation3D({
                    completion: () => {
                        ApplicationState.shared.interaction = InteractionType.none;
                    }
                })
            })
        } else {
            let symbolArt3DModel = new Container3D({ representingContainer: symbolArt.root });
            this._mainGroup.clear();
            this._mainGroup.add(symbolArt3DModel);
            this._mainGroup.add(this._previewCamera);
        }
        Layer3D.freeUnusedLayers({ usingSymbolArt: symbolArt });
        let layers = Object.values(Layer3D.layersInUse);
        this._selectableMeshes = layers.map(a => a.plane);
        this._selectableMeshes.forEach(a => a.visible = ApplicationState.shared.viewMode === ViewMode.layerEditorMode);
        this._selectableMeshesInSymbolEditorMode = layers.map(a => a.shape).filter(a => !!a);
        this._selectableButtons = layers.map(a => a.hideShowButton)
            .concat(layers.map(a => a.copyButton))
            .concat(layers.filter(a => a instanceof Container3D).map(a => a.nameText))
            .concat(this.rootLayer ? [this.rootLayer.nameText] : []);
        this.setSelection({ layer3D: layers.filter(a => a.layerUuid === selectionUuid)[0] });
        this.helperImage.updateWith({ helperImage: symbolArt.helperImage });
        if (this._onSymbolArtChanged) {
            this._onSymbolArtChanged();
        }
    }
    
    placeSelectionRectangle({ fromPosition, toPosition }) {
        let hasSelected = this._selectionRectangle.select({
            fromPosition: fromPosition, toPosition: toPosition
        });
        if (hasSelected) {
            this._scene.add(this._selectionRectangle);
        } else {
            this._selectionRectangle.removeFromParent();
        }
    }

    objectsContainedInBox({ object = this.rootLayer, containingBox = null }) {
        if (!(object instanceof Layer3D) || !(containingBox instanceof THREE.Box3)) return [];
        let containees = [];
        let fullyContained = true;
        if (object instanceof Container3D) {
            for (var index in object.sublayers) {
                let sublayer = object.sublayers[index];
                let box = new THREE.Box3().setFromObject(sublayer);
                if (box.min.x >= containingBox.min.x
                    && box.max.x <= containingBox.max.x) {
                    containees.push(sublayer);
                } else {
                    let nestedContainees = this.objectsContainedInBox({ object: sublayer, containingBox: containingBox });
                    containees.push(...nestedContainees);
                    fullyContained = fullyContained && nestedContainees.length === 1 && nestedContainees[0] === sublayer;
                }
            }
            if (fullyContained) {
                if (object !== this.rootLayer
                    && object !== this._mainGroup
                    && object !== this._scene) {
                    return [object];
                } else {
                    return [];
                }
            }
        }
        return containees;
    }

    focusSelection({ state }) {
        if (typeof state !== 'boolean') return;
        this._isFocusingSelection = state;
        if (this.selectionGroup === null) {
            this._isFocusingSelection = false;
        }
        for (var key in Layer3D.layersInUse) {
            Layer3D.layersInUse[key].isFocused = !this._isFocusingSelection;
        }
        if (this._isFocusingSelection && this.selectionGroup) {
            this.selectionGroup.isFocused = this._isFocusingSelection;
        }
        if (this._onFocusChanged) {
            this._onFocusChanged(this._isFocusingSelection);
        }
    }

    async pngData() {
        return new Promise((resolve, reject) => {
            this._previewSymbolArtDelimiter.outlineMaterial.visible = false;
            try {
                let width = SymbolArt.viewableDimensions.width;
                let height = SymbolArt.viewableDimensions.height;
                if (width > height && width > window.innerWidth) {
                    height = height * window.innerWidth / width;
                    width = window.innerWidth;
                } else if (width < height && height > window.innerHeight) {
                    width = width * window.innerHeight / height;
                    height = window.innerHeight;
                }
                this._engine.clear();
                this._engine.setViewport(0, window.innerHeight - height, width, height);
                this._engine.setScissor(0, window.innerHeight - height, width, height);
                this._engine.render(this._scene, this._previewCamera);
                let snapshot = this._engine.domElement.toDataURL();
                let previewImage = new Image();
                previewImage.crossOrigin = 'anonymous';
                previewImage.onload = async _ => {
                    let previewCanvas = document.createElement('canvas');
                    let context = previewCanvas.getContext('2d');
                    previewCanvas.width = width;
                    previewCanvas.height = height;
                    context.drawImage(previewImage, 0, 0, width, height, 0, 0, width, height);
                    let pngData = previewCanvas.toDataURL();
                    resolve(pngData);
                };
                previewImage.onerror = _ => {
                    reject();
                }
                previewImage.src = snapshot;
            } catch (e) {
                this._previewSymbolArtDelimiter.outlineMaterial.visible = true;
                reject();
            }
        });
    }

}
