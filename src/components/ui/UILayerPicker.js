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

class UILayerPicker extends UIView {

    get viewPath() { return 'res/templates/layerpicker.html' }

    _listView = (() => {
        this.didLoad(_ => {
            this._listView = this.view.find('#listview');
            this.updateState();
        });
    })();

    _symbolCount = (() => {
        this.didLoad(_ => {
            this._symbolCount = this.view.find('#symbolcount');
            this.updateState();
        });
    })();

    _symbolTotal = (() => {
        this.didLoad(_ => {
            this._symbolTotal = this.view.find('#symboltotal');
            this.updateState();
        });
    })();

    _containerCount = (() => {
        this.didLoad(_ => {
            this._containerCount = this.view.find('#containercount');
            this.updateState();
        });
    })();

    _containerTotal = (() => {
        this.didLoad(_ => {
            this._containerTotal = this.view.find('#containertotal');
            this.updateState();
        });
    })();

    _layerSearchContainer = (() => {
        this.didLoad(_ => {
            this._layerSearchContainer = this.view.find('#layersearchcontainer');
        });
    })();

    _layerSearchTextField = (() => {
        this.didLoad(_ => {
            this._layerSearchTextField = this.view.find('#layersearchtextfield');
            if (mobileClient) {
                this._layerSearchTextField.helper = new UITextFieldHelper({
                    view: this._layerSearchTextField,
                    title: 'Search layer name:',
                    onInput: (value) => {
                        this._updateSearchBar();
                        return value;
                    }
                });
            }
            this.updateState();
            this._layerSearchTextField.on('input', () => {
                this._updateSearchBar();
            });
        });
    })();

    _searchButton = (() => {
        this.didLoad(_ => {
            this._searchButton = this.view.find('#searchbutton');
            this._searchButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._searchButton[0], onTap: () => {
                    if (this._layerSearchTextField.val().trim().length > 0) {
                        this._layerSearchTextField.val('');
                        this._updateSearchBar();
                    }
                }
            });
        });
    })();
    
    _onLayerSelected = null;
    set onLayerSelected(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onLayerSelected = value;
    }
    
    _onRenameTapped = null;
    set onRenameTapped(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onRenameTapped = value;
    }
    
    _onDeleteTapped = null;
    set onDeleteTapped(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onDeleteTapped = value;
    }
    
    _lastSelectedUuid = null;
    
    get loaded() {
        return this.view instanceof jQuery
            && this.view[0] instanceof HTMLElement
            && this._listView instanceof jQuery
            && this._symbolCount instanceof jQuery
            && this._symbolTotal instanceof jQuery
            && this._containerCount instanceof jQuery
            && this._containerTotal instanceof jQuery
            && this._layerSearchContainer instanceof jQuery
            && this._layerSearchTextField instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.didLoad(_ => {
            this.view.css('right', value ? ('-' + this.view.css('width')) : '0px');
        });
    }

    constructor({ onLayerSelected = null, onRenameTapped = null, onDeleteTapped = null } = { }) {
        super();
        this.onLayerSelected = onLayerSelected;
        this.onRenameTapped = onRenameTapped;
        this.onDeleteTapped = onDeleteTapped;
        this.didLoad(_ => {
            this.view.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this.view[0],
                preventsDefault: false,
                onPointerDown: (event) => {
                    // to prevent propagation
                }, onPointerMove: (event) => {
                    // to prevent propagation
                }, onPointerUp: (event) => {
                    // to prevent propagation
                }, onScroll: (event) => {
                    // to prevent propagation
                }, onKeyPress: (event) => {
                    return false;
                }
            });
        });
        ApplicationState.shared.add({
            onChangeViewModeListener: () => {
                this.updateState();
            }
        });
        this.updateState();
    }

    _uiLayers = [];

    updateWith({ container }) {
        if (!(container instanceof Container)) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this.updateWith({ container: container });
            });
            return;
        }
        let layers = [];
        container.reverseDepthFirstIterator(layer => {
            layers.push(layer);
        });
        let uiLayers = [];
        for (var index in layers) {
            let layer = layers[index];
            let matches = this._uiLayers.filter(a => a.identifier === layer.uuid);
            let uiLayer = null;
            if (matches[0]) {
                uiLayer = matches[0];
            } else {
                uiLayer = new UILayer();
            }
            uiLayer.name = layer.name.length === 0 ? (layer instanceof Container ? 'container' : 'symbol') : layer.name;
            uiLayer.identifier = layer.uuid;
            uiLayer.onTap = (uiLayer) => {
                if (this._onLayerSelected) {
                    this._onLayerSelected(uiLayer.identifier);
                }
            };
            uiLayer.level = layer.distanceFromRoot;
            uiLayer.collapsible = layer instanceof Container;
            if (layer instanceof Symbol) {
                uiLayer.previewAsset = layer.asset;
                uiLayer.previewAssetColor = layer.color;
            }
            uiLayer.onCollapseChanged = instance => {
                this._updateCollapsibles();
            };
            uiLayer.onRenameTapped = instance => {
                if (this._onRenameTapped) {
                    this._onRenameTapped(instance.identifier);
                }
            };
            uiLayer.onDeleteTapped = instance => {
                if (this._onDeleteTapped) {
                    this._onDeleteTapped(instance.identifier);
                }
            };
            uiLayers.push(uiLayer);
        }
        let requiresUpdate = false;
        for (var index in uiLayers) {
            if (this._uiLayers[index] !== uiLayers[index]) {
                requiresUpdate = true;
                break;
            }
        }
        if (!requiresUpdate) {
            for (var index in this._uiLayers) {
                if (this._uiLayers[index] !== uiLayers[index]) {
                    requiresUpdate = true;
                    break;
                }
            }
        }
        this._layerSearchTextField.val('');
        if (requiresUpdate) {
            this._uiLayers = uiLayers;
            this._listView.empty();
            for (var index in this._uiLayers) {
                this._uiLayers[index].append({ to: this._listView });
            }
            this._layerSearchContainer.css('display', '');
            if (uiLayers.length < 2) {
                this._layerSearchContainer.css('display', 'none');
            }
            setTimeout(_ => {
                this._updateCollapsibles();
            }, 10);
        } else {
            this._updateCollapsibles();
        }
        this.updateLimits();
    }
    
    _updateCollapsibles() {
        let collapsedAtLevel = -1;
        for (var index in this._uiLayers) {
            this._uiLayers[index].view.css('display', '');
            let searchKeys = this._layerSearchTextField.val().trim();
            if (searchKeys.length > 0) {
                if (!this._uiLayers[index].name.toUpperCase().includes(searchKeys.toUpperCase())) {
                    this._uiLayers[index].view.css('display', 'none');
                }
            } else {
                if (collapsedAtLevel >= 0) {
                    if (this._uiLayers[index].level > collapsedAtLevel) {
                        this._uiLayers[index].view.css('display', 'none');
                    } else {
                        collapsedAtLevel = -1;
                    }
                }
                if (this._uiLayers[index].collapsed) {
                    collapsedAtLevel = this._uiLayers[index].level;
                }
            }
        }
    }
    
    _updateSearchBar() {
        if (!this.loaded) {
            this.didLoad(_ => {
                this._updateSearchBar();
            });
            return;
        }
        let icon = this._searchButton.find('i');
        if (this._layerSearchTextField.val().trim().length > 0) {
            icon.removeClass('fa-search');
            icon.addClass('fa-times');
        } else {
            icon.removeClass('fa-times');
            icon.addClass('fa-search');
        }
        this._updateCollapsibles();
        this.select({ layerWithUuid: this._lastSelectedUuid });
    }

    updateLimits() {
        if (!this.loaded) {
            this.didLoad(_ => {
                this.updateLimits();
            });
            return;
        }
        this._symbolCount.text(`${UIApplication.shared.symbolArt.root.numberOfSymbols}`);
        this._symbolTotal.text(`${SymbolArt.maximumNumberOfSymbols}`);
        this._containerCount.text(`${UIApplication.shared.symbolArt.root.containers.length}`);
        this._containerTotal.text(`${SymbolArt.maximumNumberOfContainers}`);
    }

    updateState() {
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
            case ViewMode.layerEditorMode:
                this.isHidden = false;
                break;
            case ViewMode.helperImageMode:
            default:
                this.isHidden = true;
                return;
        }
    }
    
    select({ layerWithUuid }) {
        if (!this.loaded) {
            this.didLoad(_ => {
                this.select({ layerWithUuid: layerWithUuid });
            });
            return;
        }
        this._uiLayers.forEach(uiLayer => {
            uiLayer.selected = uiLayer.identifier === layerWithUuid;
        });
        this._lastSelectedUuid = layerWithUuid;
        this.scroll({ toLayerWithUuid: layerWithUuid });
    }
    
    scroll({ toLayerWithUuid }) {
        if (!this.loaded) {
            this.didLoad(_ => {
                this.scroll({ toLayerWithUuid: toLayerWithUuid });
            });
            return;
        }
        let uiLayer = this._uiLayers.filter(a => a.identifier === toLayerWithUuid)[0];
        if (uiLayer) {
            uiLayer.didLoad(_ => {
                uiLayer.view[0].scrollIntoView({ block: "nearest", inline: "nearest" });
            });
        }
    }

}
