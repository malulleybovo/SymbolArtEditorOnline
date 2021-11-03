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

class UIContainerPicker extends UIView {

    get viewPath() { return 'res/templates/containerpicker.html' }

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
    
    _onContainerSelected = null;
    set onContainerSelected(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onContainerSelected = value;
    }
    
    get loaded() {
        return this.view instanceof jQuery
            && this.view[0] instanceof HTMLElement
            && this._listView instanceof jQuery
            && this._symbolCount instanceof jQuery
            && this._symbolTotal instanceof jQuery
            && this._containerCount instanceof jQuery
            && this._containerTotal instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.didLoad(_ => {
            this.view.css('right', value ? '-200px' : '0px');
        });
    }

    constructor({ onContainerSelected = null } = { }) {
        super();
        this.onContainerSelected = onContainerSelected;
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

    _uiContainers = [];

    updateWith({ containers }) {
        if (!(Array.isArray(containers))) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this.updateWith({ containers: containers });
            });
            return;
        }
        let uiContainers = [];
        for (var index in containers) {
            let container = containers[index];
            if (!(container instanceof Container)) continue;
            let matches = this._uiContainers.filter(a => a.identifier === container.uuid);
            let uiContainer = null;
            if (matches[0]) {
                uiContainer = matches[0];
            } else {
                uiContainer = new UIContainer();
            }
            uiContainer.name = container.name.length === 0 ? 'container' : container.name;
            uiContainer.identifier = container.uuid;
            uiContainer.onTap = (uiContainer) => {
                if (this._onContainerSelected) {
                    this._onContainerSelected(uiContainer.identifier);
                }
            };
            uiContainers.push(uiContainer);
        }
        let requiresUpdate = false;
        for (var index in uiContainers) {
            if (this._uiContainers[index] !== uiContainers[index]) {
                requiresUpdate = true;
                break;
            }
        }
        if (!requiresUpdate) {
            for (var index in this._uiContainers) {
                if (this._uiContainers[index] !== uiContainers[index]) {
                    requiresUpdate = true;
                    break;
                }
            }
        }
        if (requiresUpdate) {
            this._listView.empty();
            this._uiContainers = uiContainers;
            for (var index in this._uiContainers) {
                this._uiContainers[index].append({ to: this._listView });
            }
        }
        this.updateLimits();
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
            case ViewMode.layerEditorMode:
                this.isHidden = false;
                break;
            case ViewMode.symbolEditorMode:
            case ViewMode.helperImageMode:
            default:
                this.isHidden = true;
                return;
        }
    }

}
