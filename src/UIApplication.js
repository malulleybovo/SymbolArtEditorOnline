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

class UIApplication {

    static shared = (() => {
        $(document).ready(_ => {
            setTimeout(_ => {
                UIApplication.shared = new UIApplication();
            }, 500);
        });
        return null;
    })();
    
    _symbolArt = (() => {
        let symbolArt = new SymbolArt();
        symbolArt._onTypeChanged = _ => {
            this._updateSymbolDependencies();
        }
        HistoryState.shared.pushHistory({ data: symbolArt.clone() });
        return symbolArt;
    })();
    get symbolArt() { return this._symbolArt }
    set symbolArt(value) {
        if (!(value instanceof SymbolArt)) return;
        this._symbolArt = value;
        this._symbolArt._onTypeChanged = _ => {
            this._updateSymbolDependencies();
        }
        this._renderer.updateWith({ symbolArt: this._symbolArt });
        this._soundOptionsView.selectedSoundOption = this._symbolArt.soundOption.index;
    }

    _menu = new UIMenu();
    _actionBar = new UIActionBar();
    _colorPicker = new UIColorPicker({
        onColorChange: (originalColorInContainer, hexColor, opacity, lastInteraction) => {
            let hexValue = parseInt('0x' + hexColor);
            if (this._renderer.selectionGroup instanceof Symbol3D) {
                this._renderer.presenter.setColorForSelectedSymbol({ hexValue: hexValue, opacity: opacity, updatesHistory: lastInteraction });
            } else if (originalColorInContainer) {
                this._renderer.presenter.setColorForSelectedContainer({ originalColorInContainer: originalColorInContainer, hexValue: hexValue, opacity: opacity, updatesHistory: lastInteraction });
            }
            if (lastInteraction) {
                this._layerPicker.updateWith({ container: this._symbolArt.root });
            }
        },
        requestedEyeDropperColors: _ => {
            this._symbolArt.helperImage.imageColors().then(colors => {
                this._colorPicker.eyeDropperColors = this._symbolArt.root.symbolColors().concat(colors.map(a => {
                    return {
                        color: a,
                        opacity: new Opacity({ value: 1 })
                    }
                }));
            });
        }
    });
    _assetsLoaded = false;
    _assetPicker = new UIAssetPicker({
        onAssetsLoaded: (assets) => {
            Symbol3D.loadTextures({ forAssets: assets }).then(_ => {
                this._assetsLoaded = true;
            });;
        },
        onAssetChange: (selectedAsset) => {
            this._renderer.presenter.setAssetForSelectedSymbol({ asset: selectedAsset });
            this._layerPicker.updateWith({ container: this._symbolArt.root });
        }
    });
    _layerPicker = new UILayerPicker({
        onLayerSelected: (layerUuid) => {
            let layer3D = Layer3D.layersInUse[layerUuid];
            if (layer3D instanceof Layer3D) {
                this._renderer.setSelection({ layer3D: layer3D });
                this._renderer.panToSelection();
                SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
                ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
                HelperImageControls3D.shared.attach({ toHelperImage: null });
            }
        },
        onRenameTapped: layerUuid => {
            let layerToRename = null;
            this._symbolArt.root.depthFirstIterator(layer => {
                if (layer.uuid === layerUuid) {
                    layerToRename = layer;
                    return true;
                }
            });
            if (!(layerToRename instanceof Layer)) return;
            new UIModalTextField({
                title: 'Rename layer:', initialText: layerToRename.name,
                onInput: text => { },
                onResult: text => {
                    if (layerToRename.name == text) return;
                    layerToRename.name = text;
                    this._renderer.updateWith({ symbolArt: this._symbolArt });
                    HistoryState.shared.pushHistory({ data: this._symbolArt.clone() });
                }
            });
        },
        onDeleteTapped: layerUuid => {
            let layerToDelete = null;
            this._symbolArt.root.depthFirstIterator(layer => {
                if (layer.uuid === layerUuid) {
                    layerToDelete = layer;
                    return true;
                }
            });
            if (!(layerToDelete instanceof Layer) && layerToDelete.parent) return;
            layerToDelete.parent.remove({ sublayer: layerToDelete });
            this._renderer.updateWith({ symbolArt: this._symbolArt });
            HistoryState.shared.pushHistory({ data: this._symbolArt.clone() });
            SymbolControls3D.shared.attach({ toSymbol3D: this._renderer.selectionGroup });
            ContainerControls3D.shared.attach({ toContainer3D: this._renderer.selectionGroup });
            HelperImageControls3D.shared.attach({ toHelperImage: null });
        }
    });
    _helperImageSettings = new UIHelperImageSettings({
        onChange: (opacity, lastInteraction) => {
            this.symbolArt.helperImage.opacity = opacity;
            this._renderer.helperImage.updateWith({ helperImage: this.symbolArt.helperImage });
            if (lastInteraction) {
                HistoryState.shared.pushHistory({ data: this._symbolArt.clone() });
            }
        }
    });

    _copyrightView = new UICopyrightView();

    _optionsView = new UIOptionsView();
    _soundOptionsView = new UISoundOptionsView({
        onSoundOptionChanged: () => {
            let changed = this.symbolArt.soundOption.index !== this._soundOptionsView.selectedSoundOption;
            this.symbolArt.soundOption.index = this._soundOptionsView.selectedSoundOption;
            HistoryState.shared.pushHistory({ data: this._symbolArt.clone() });
        }
    });
    _helperImageOptionsView = new UIHelperImageOptionsView({
        onImageLoadedListener: (fileDataArrayBuffer, extension) => {
            this._symbolArt.helperImage.setImage({
                fromImageFileDataArrayBuffer: fileDataArrayBuffer,
                imageFileExtension: extension
            }).then(() => {
                this._renderer.helperImage.updateWith({
                    helperImage: this._symbolArt.helperImage
                });
                HistoryState.shared.pushHistory({ data: this._symbolArt.clone() });
            });
            this._renderer.helperImage.updateWith({
                helperImage: this._symbolArt.helperImage
            });
        }
    });

    _renderer = (() => {
        let renderer = new Renderer();
        renderer.onSymbolArtChanged = () => {
            this._layerPicker.updateWith({ container: this._symbolArt.root });
            setTimeout(_ => {
                this._layerPicker.select({ layerWithUuid: this._renderer.selectionUuid });
            }, 10);
        };
        renderer.onSelectionChanged = (selectionUuid) => {
            let selectionLayer = this._symbolArt.findLayer({ withUuidString: selectionUuid });
            let selectedLayer = selectionLayer instanceof Layer;
            let selectedSymbol = selectionLayer instanceof Symbol;
            this._actionBar.setNorthButton({ enabled: selectedLayer, forViewMode: ViewMode.symbolEditorMode });
            this._actionBar.setNorthEastButton({ enabled: selectedLayer, forViewMode: ViewMode.symbolEditorMode });
            this._actionBar.setEastButton({ enabled: selectedLayer, forViewMode: ViewMode.symbolEditorMode });
            this._assetPicker.assetSelectionEnabled = selectedSymbol;
            this._layerPicker.select({ layerWithUuid: selectionUuid });
            if (!selectedLayer) return;
            if (selectedSymbol) {
                this._assetPicker.update({
                    asset: selectionLayer.asset
                });
                this._colorPicker.updateColor({
                    fromHex: selectionLayer.color.hex,
                    opacityValue: selectionLayer.opacity.value
                });
            } else {
                this._colorPicker.showColorPalette({
                    list: selectionLayer.symbols
                });
            }
        };
        renderer.onFocusChanged = (state) => {
            this._actionBar.highlightEastButton({ state: state, forViewMode: ViewMode.symbolEditorMode });
        };
        renderer.onHelperImageTextureChanged = (imageData) => {
            let hasImage = imageData !== null;
            this._actionBar.setEastButton({ enabled: hasImage, forViewMode: ViewMode.helperImageMode });
            this._helperImageSettings.updateAlpha({ value: this.symbolArt.helperImage.opacity });
            this._helperImageSettings.updateGreenScreen({ state: this.symbolArt.helperImage.greenScreenEnabled });
        }
        renderer.onHelperImageFocusChanged = (state) => {
            this._actionBar.highlightNorthEastButton({ state: state, forViewMode: ViewMode.helperImageMode });
            this._helperImageSettings.updateHighlight({ state: state });
        };
        renderer.onHelperImageGreenScreenEnabledChanged = (state) => {
            this.symbolArt.helperImage.greenScreenEnabled = state;
            HistoryState.shared.pushHistory({ data: this._symbolArt.clone() });
            this._helperImageSettings.updateGreenScreen({ state: state });
        };
        return renderer;
    })();

    get percentageOfApplicationLoaded() {
        let subviews = Object.values(this).filter(a => a instanceof UIView);
        if (subviews.length === 0) return 1;
        let subviewsLoaded = subviews.filter(a => a.loaded);
        let count = subviews.length + 2;
        let current = subviewsLoaded.length;
        if (this._assetsLoaded) current += 1;
        if (Text3D.allGlyphSizesLoaded) current += 1;
        return current / count;
    }

    get loaded() {
        return Object.values(this).filter(a => a instanceof UIView && !a.loaded).length === 0
            && this._assetsLoaded && Text3D.allGlyphSizesLoaded;
    }

    constructor() {
        this._optionsView.prepareForFileDrop();
        $('#landing').css('opacity', 1);
        let launchPollingInterval = setInterval(_ => {
            $('#progressindicator')
                .css('opacity', 1)
                .css('right', 100 * (1 - this.percentageOfApplicationLoaded) + '%');
            if (!this.loaded) return;
            clearInterval(launchPollingInterval);
            setTimeout(_ => {
                this._didFinishLaunching();
                setTimeout(_ => {
                    $('#landing').css('opacity', 0);
                    setTimeout(_ => {
                        $('#landing').remove();
                    }, 200);
                }, 200);
            }, 600);
        }, 500);
        HistoryState.shared.add({
            onHistoryStartListener: _ => {
                $(window).on('beforeunload', event => {
                    let message = 'Progress may be lost. Do you really wish to leave?';
                    if (event && event.returnValue) {
                        event.returnValue = message;
                    }
                    return message;
                });
            }
        });
    }

    supports({ asset }) {
        return this._assetPicker.has({ asset: asset });
    }

    _updateSymbolDependencies() {
        Symbol3D.updateDimensions();
        Container3D.updateDimensions();
    }

    _didFinishLaunching() {
        if (!this.loaded) return;
        let $body = $('body');
        this._copyrightView.append({ to: $body });
        this._layerPicker.append({ to: $body });
        this._menu.append({ to: $body });
        this._actionBar.append({ to: $body });
        this._colorPicker.append({ to: $body });
        this._assetPicker.append({ to: $body });
        this._helperImageSettings.append({ to: $body });
        this._soundOptionsView.append({ to: $body });
        this._optionsView.append({ to: $body });
        this._helperImageOptionsView.append({ to: $body });
        this._renderer.updateWith({ symbolArt: this._symbolArt });
        this._copyrightView.didLoad(_ => {
            this._copyrightView.view.prependTo($('body'));
        });
        this._renderer.render();
        document.body.appendChild(this._renderer.domElement);
    }

}
