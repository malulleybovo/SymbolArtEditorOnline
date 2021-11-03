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

class UIAssetPicker extends UIView {

    get viewPath() { return 'res/templates/assetpicker.html' }

    _assetCatalogPath = 'res/assetCatalog.json';

    set assetSelectionEnabled(value) {
        if (typeof value !== 'boolean') return;
        this.didLoad(_ => {
            this._carousel.css('opacity', value ? 1 : 0.2);
            this._carousel.css('pointer-events', value ? '' : 'none');
            this._assetPreview.css('opacity', value ? 1 : 0);
            this._assetPreview.css('pointer-events', value ? '' : 'none');
        });
    }

    _backButton = (() => {
        this.didLoad(_ => {
            this._backButton = this.view.find('#backbutton');
            this.updateState();
            this._backButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._backButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.closeWindow;
                }
            });
        });
    })();

    _flipXButton = (() => {
        this.didLoad(_ => {
            this._flipXButton = this.view.find('#flipxbutton');
            this.updateState();
            this._flipXButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._flipXButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.layerFlipX;
                }
            });
        });
    })();

    _flipYButton = (() => {
        this.didLoad(_ => {
            this._flipYButton = this.view.find('#flipybutton');
            this.updateState();
            this._flipYButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._flipYButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.layerFlipY;
                }
            });
        });
    })();

    _rotateButton = (() => {
        this.didLoad(_ => {
            this._rotateButton = this.view.find('#rotatebutton');
            this.updateState();
            this._rotateButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._rotateButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.layerRotate90;
                }
            });
        });
    })();

    _assetPreview = (() => {
        this.didLoad(_ => {
            this._assetPreview = this.view.find('#assetpreview');
        });
    })();

    _carousel = (() => {
        this.didLoad(_ => {
            this._carousel = this.view.find('#carousel');
        });
    })();

    _onAssetsLoaded = null;
    set onAssetsLoaded(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onAssetsLoaded = value;
    }

    _onAssetChange = null;
    set onAssetChange(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onAssetChange = value;
    }

    _catalog = null;

    get loaded() {
        return this._backButton instanceof jQuery
            && this._assetPreview instanceof jQuery
            && this._carousel instanceof jQuery
            && this._catalog !== null
            && Object.values(this._catalog).filter(a => !a.uiAsset.loaded).length === 0;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('left', value ? '-282pt' : '5pt');
    }

    constructor({ onAssetChange = null, onAssetsLoaded = null } = { }) {
        super();
        this.onAssetsLoaded = onAssetsLoaded;
        this.onAssetChange = onAssetChange;
        $.ajax({
            type: 'GET',
            url: this._assetCatalogPath,
            success: (assetCatalog) => {
                this.didLoad(_ => {
                    this._catalog = {};
                    for (var index in assetCatalog) {
                        let filePath = 'res/' + assetCatalog[index];
                        let uiAsset = new UIAsset({ filePath: filePath });
                        uiAsset.append({ to: this._carousel });
                        uiAsset.onTap = (uiAsset) => {
                            this._assetSelected({ uiAsset: uiAsset });
                        }
                        this._catalog[filePath] = {
                            asset: new Asset({ filePath: filePath }),
                            uiAsset: uiAsset
                        }
                    }
                    if (this._onAssetsLoaded) {
                        this._onAssetsLoaded(Object.values(this._catalog).map(a => a.asset));
                    }
                });
            }
        });
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
                }
            });
        });
        ApplicationState.shared.add({
            onChangeViewModeListener: () => {
                this.updateState();
            },
            onChangeTriggerListener: () => {
                this.updateState();
            }
        });
    }

    _assetSelected({ uiAsset }) {
        this.didLoad(_ => {
            this._assetPreview.attr('src', uiAsset.assetFilePath);
            if (this._onAssetChange) {
                let selectedAsset = this._catalog[uiAsset.assetFilePath].asset;
                this._onAssetChange(selectedAsset);
            }
        });
    }

    has({ asset }) {
        if (!this.loaded || !this._catalog || !(asset instanceof Asset)) return;
        return Object.values(this._catalog).filter(a => a.asset.filePath === asset.filePath).length > 0;
    }

    update({ asset }) {
        if (!this.loaded) return;
        if (!(asset instanceof Asset) || !this._catalog[asset.filePath]) {
            this._assetPreview.attr('src', '');
            return;
        }
        this._assetSelected({ uiAsset: this._catalog[asset.filePath].uiAsset });
    }

    updateState() {
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                break;
            case ViewMode.layerEditorMode:
            case ViewMode.helperImageMode:
            default:
                this.isHidden = true;
                return;
        }
        switch (ApplicationState.shared.trigger) {
            case TriggerType.openAssetPicker:
                setTimeout(_ => {
                    ApplicationState.shared.trigger = TriggerType.none;
                }, 100);
                this.isHidden = false;
                break;
            case TriggerType.closeWindow:
                this.isHidden = true;
                break;
            default: break;
        }
    }

}
