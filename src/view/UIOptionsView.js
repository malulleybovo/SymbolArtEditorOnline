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

class UIOptionsView extends UIView {

    get viewPath() { return 'res/templates/optionsview.html' }

    _closeButton = (() => {
        this.didLoad(_ => {
            this._closeButton = this.view.find('#closebutton');
            this.updateState();
            this._closeButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._closeButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.closeWindow;
                }
            });
        });
    })();

    _symbolArtTypeButton = (() => {
        this.didLoad(_ => {
            this._symbolArtTypeButton = this.view.find('#symbolarttypebutton');
            this.updateState();
            this._symbolArtTypeButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._symbolArtTypeButton[0], onTap: () => {
                    if (UIApplication.shared.symbolArt.type === SymbolArtType.symbolArt)
                        return;
                    UIApplication.shared.symbolArt.type = SymbolArtType.symbolArt;
                    UIApplication.shared.symbolArt = UIApplication.shared.symbolArt; // Trigger update
                    HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                }
            });
        });
    })();

    _allianceFlagTypeButton = (() => {
        this.didLoad(_ => {
            this._allianceFlagTypeButton = this.view.find('#allianceflagtypebutton');
            this.updateState();
            this._allianceFlagTypeButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._allianceFlagTypeButton[0], onTap: () => {
                    if (UIApplication.shared.symbolArt.type === SymbolArtType.allianceFlag)
                        return;
                    UIApplication.shared.symbolArt.type = SymbolArtType.allianceFlag;
                    UIApplication.shared.symbolArt = UIApplication.shared.symbolArt; // Trigger update
                    HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
                }
            });
        });
    })();

    _sarImportButton = (() => {
        this.didLoad(_ => {
            this._sarImportButton = this.view.find('#sarimportbutton');
            this.updateState();
            this._sarImportButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._sarImportButton[0], onTap: () => {
                    this._requestToImportFile();
                }
            });
        });
    })();

    _sarExportButton = (() => {
        this.didLoad(_ => {
            this._sarExportButton = this.view.find('#sarexportbutton');
            this.updateState();
            this._sarExportButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._sarExportButton[0], onTap: () => {
                    this._requestToExportFileAsSAR();
                }
            });
        });
    })();

    _samlImportButton = (() => {
        this.didLoad(_ => {
            this._samlImportButton = this.view.find('#samlimportbutton');
            this.updateState();
            this._samlImportButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._samlImportButton[0], onTap: () => {
                    this._requestToImportFile();
                }
            });
        });
    })();

    _samlExportButton = (() => {
        this.didLoad(_ => {
            this._samlExportButton = this.view.find('#samlexportbutton');
            this.updateState();
            this._samlExportButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._samlExportButton[0], onTap: () => {
                    this._requestToExportFileAsSAML();
                }
            });
        });
    })();

    _pngExportButton = (() => {
        this.didLoad(_ => {
            this._pngExportButton = this.view.find('#pngexportbutton');
            this.updateState();
            this._pngExportButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._pngExportButton[0], onTap: () => {
                    this._requestToExportAsPng();
                }
            });
        });
    })();

    _importAsComponentButton = (() => {
        this.didLoad(_ => {
            this._importAsComponentButton = this.view.find('#importascomponentbutton');
            this.updateState();
            this._importAsComponentButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._importAsComponentButton[0], onTap: () => {
                    this._requestToImportFile({ asComponent: true });
                }
            });
        });
    })();

    get loaded() {
        return this._closeButton instanceof jQuery
            && this._symbolArtTypeButton instanceof jQuery
            && this._allianceFlagTypeButton instanceof jQuery
            && this._sarImportButton instanceof jQuery
            && this._sarExportButton instanceof jQuery
            && this._samlExportButton instanceof jQuery
            && this._samlExportButton instanceof jQuery
            && this._importAsComponentButton instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('top', value ? '-50px' : '0');
        this.view.css('opacity', value ? '0' : '0.95');
        this.view.css('pointer-events', value ? 'none' : '');
    }

    constructor() {
        super();
        this.didLoad(_ => {
            this.isHidden = true;
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
        HistoryState.shared.add({
            onChangeStateListener: () => {
                this.updateState();
            }
        });
    }

    updateState() {
        this.didLoad(_ => {
            this._symbolArtTypeButton.css('background-color', UIApplication.shared.symbolArt.type === SymbolArtType.symbolArt ? '#ff9e2c' : 'white');
            this._allianceFlagTypeButton.css('background-color', UIApplication.shared.symbolArt.type === SymbolArtType.allianceFlag ? '#ff9e2c' : 'white');
            switch (ApplicationState.shared.trigger) {
                case TriggerType.openOptionsView:
                    setTimeout(_ => {
                        ApplicationState.shared.trigger = TriggerType.none;
                    }, 250);
                    this.isHidden = false;
                    break;
                case TriggerType.closeWindow:
                    this.isHidden = true;
                    break;
                default: break;
            }
        });
    }

    _requestToImportFile({ asComponent = false } = {}) {
        FileUtils.requestToImportFile({
            withSupportedExtension: ['sar', 'saml', 'sar.txt', 'saml.txt'],
            onSuccess: (fileDataArrayBuffer, extension) => {
                this._processFileData({ fileDataArrayBuffer: fileDataArrayBuffer, extension: extension, asComponent: asComponent });
            },
            onFailure: () => {
                alert('Oops, it seems like this file isn\'t supported... Make sure to use a valid .sar or .saml file.');
            }
        });
    }

    prepareForFileDrop() {
        FileUtils.prepareForFileDrop({
            withSupportedExtension: ['sar', 'saml', 'sar.txt', 'saml.txt'],
            onSuccess: (fileDataArrayBuffer, extension) => {
                this._processFileData({ fileDataArrayBuffer: fileDataArrayBuffer, extension: extension, asComponent: false });
            },
            onFailure: (extension) => {
                this._processFileFailure({ withExtension: extension });
            }
        });
    }

    _processFileData({ fileDataArrayBuffer, extension, asComponent }) {
        if (!this.loaded) {
            this.didLoad(_ => {
                this._processFileData({ fileDataArrayBuffer: fileDataArrayBuffer, extension: extension, asComponent: asComponent });
            });
            return;
        }
        if (!UIApplication.shared.loaded) {
            setTimeout(_ => {
                this._processFileData({ fileDataArrayBuffer: fileDataArrayBuffer, extension: extension, asComponent: asComponent });
            }, 200);
            return;
        }
        switch (extension) {
            case 'sar':
            case 'sar.txt':
                this._openSARFile({ fileDataArrayBuffer: fileDataArrayBuffer, asComponent: asComponent });
                ApplicationState.shared.trigger = TriggerType.closeWindow;
                break;
            case 'saml':
            case 'saml.txt':
                this._openSAMLFile({ fileDataArrayBuffer: fileDataArrayBuffer, asComponent: asComponent });
                ApplicationState.shared.trigger = TriggerType.closeWindow;
                break;
            default: break;
        }
    }

    _processFileFailure({ withExtension = null } = {}) {
        let isImage = ['jpg', 'jpeg', 'svg', 'gif', 'bmp', 'webp', 'ico', 'png'].includes(withExtension);
        if (!isImage) {
            alert('Oops, it seems like this file isn\'t supported... Make sure to use a valid .sar or .saml file.');
            return;
        }
        if (!UIApplication.shared.loaded) {
            setTimeout(_ => {
                this._processFileFailure({ withExtension: withExtension });
            }, 200);
            return;
        }
        ApplicationState.shared.viewMode = ViewMode.helperImageMode;
        ApplicationState.shared.trigger = TriggerType.closeWindow;
        setTimeout(_ => {
            ApplicationState.shared.trigger = TriggerType.openHelperImageOptionsView;
        });
    }

    _openSARFile({ fileDataArrayBuffer, asComponent = false }) {
        let symbolArt = SARFileUtils.parseIntoSymbolArt({ fileDataArrayBuffer: fileDataArrayBuffer });
        this._updateSymbolArtFromImport({ symbolArt: symbolArt, asComponent: asComponent });
    }

    _openSAMLFile({ fileDataArrayBuffer, asComponent = false }) {
        SAMLFileUtils.parseIntoSymbolArt({ fileDataArrayBuffer: fileDataArrayBuffer })
            .then(symbolArt => {
                this._updateSymbolArtFromImport({ symbolArt: symbolArt, asComponent: asComponent });
            });
    }

    _updateSymbolArtFromImport({ symbolArt, asComponent = false }) {
        if (!(symbolArt instanceof SymbolArt)) return;
        if (asComponent) {
            if (UIApplication.shared.symbolArt.root.canInsert({ sublayer: symbolArt.root })) {
                UIApplication.shared.symbolArt.root.add({ sublayer: symbolArt.root });
                UIApplication.shared.symbolArt = UIApplication.shared.symbolArt; // Force refresh
                HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
            } else {
                alert('Oops, this Symbol Art could not be added into the project because it would exceed the allowed limits.');
            }
        } else {
            UIApplication.shared.symbolArt = symbolArt;
            HistoryState.shared.pushHistory({ data: UIApplication.shared.symbolArt.clone() });
        }
    }

    _requestToExportFileAsSAR() {
        let fileDataBlob = SARFileUtils.exportAsBlob({ symbolArt: UIApplication.shared.symbolArt });
        if (!fileDataBlob) return;
        let fileUrl = URL.createObjectURL(fileDataBlob);
        let link = $('<a>');
        link[0].href = fileUrl;
        link[0].download = 'symbolArt.sar';
        link[0].click();
    }

    _requestToExportFileAsSAML() {
        let fileDataBlob = SAMLFileUtils.exportAsBlob({ symbolArt: UIApplication.shared.symbolArt });
        if (!fileDataBlob) return;
        let fileUrl = URL.createObjectURL(fileDataBlob);
        let link = $('<a>');
        link[0].href = fileUrl;
        link[0].download = 'symbolArtProject.saml';
        link[0].click();
    }

    _requestToExportAsPng() {
        UIApplication.shared.imageBlob().then(blob => {
            let fileUrl = URL.createObjectURL(blob);
            let link = $('<a>');
            link[0].href = fileUrl;
            link[0].download = 'symbolArtPreview.png';
            link[0].click();
        });
    }

}
