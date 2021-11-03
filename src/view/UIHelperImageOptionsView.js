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

class UIHelperImageOptionsView extends UIView {

    get viewPath() { return 'res/templates/helperimageoptionsview.html' }
    
    _onImageLoadedListener = null;
    set onImageLoadedListener(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onImageLoadedListener = value;
    }

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

    _importImageFromDeviceButton = (() => {
        this.didLoad(_ => {
            this._importImageFromDeviceButton = this.view.find('#importimagefromdevicebutton');
            this.updateState();
            this._importImageFromDeviceButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._importImageFromDeviceButton[0], onTap: () => {
                    this._requestToImportImageFromDevice();
                }
            });
        });
    })();
    
    get loaded() {
        return this._closeButton instanceof jQuery
            && this._importImageFromDeviceButton instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('top', value ? '-50px' : '0');
        this.view.css('opacity', value ? '0' : '0.95');
        this.view.css('pointer-events', value ? 'none' : '');
    }

    constructor({ onImageLoadedListener = undefined } = {}) {
        super();
        this.onImageLoadedListener = onImageLoadedListener;
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
    }

    updateState() {
        this.didLoad(_ => {
            switch (ApplicationState.shared.trigger) {
                case TriggerType.openHelperImageOptionsView:
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

    _requestToImportImageFromDevice() {
        FileUtils.requestToImportFile({
            withSupportedExtension: ['jpg', 'jpeg', 'svg', 'gif', 'bmp', 'webp', 'ico', 'png'],
            onSuccess: (fileDataArrayBuffer, extension) => {
                if (this._onImageLoadedListener) {
                    this._onImageLoadedListener(fileDataArrayBuffer, extension);
                }
                ApplicationState.shared.trigger = TriggerType.closeWindow;
            },
            onFailure: () => {
                alert('Oops, it seems like this file isn\'t supported... Make sure to use a valid .sar or .saml file.');
            }
        });
    }

}
