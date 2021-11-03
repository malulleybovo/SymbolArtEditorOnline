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

class UICollapsibleMenu extends UIView {

    get viewPath() { return 'res/templates/collapsiblemenu.html' }

    _importExportButton = (() => {
        this.didLoad(_ => {
            this._importExportButton = this.view.find('#importexportbutton');
            this._importExportButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._importExportButton[0], onTap: () => {
                    if (ApplicationState.shared.trigger !== TriggerType.openOptionsView)
                        ApplicationState.shared.trigger = TriggerType.openOptionsView;
                    else ApplicationState.shared.trigger = TriggerType.none;
                }
            });
        });
    })();

    _helperImageButton = (() => {
        this.didLoad(_ => {
            this._helperImageButton = this.view.find('#helperimagebutton');
            this._helperImageButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._helperImageButton[0], onTap: () => {
                    ApplicationState.shared.viewMode = ViewMode.helperImageMode;
                }
            });
        });
    })();

    _soundButton = (() => {
        this.didLoad(_ => {
            this._soundButton = this.view.find('#soundbutton');
            this._soundButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._soundButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.openSoundOptionsView;
                }
            });
        });
    })();

    _helpButton = (() => {
        this.didLoad(_ => {
            this._helpButton = this.view.find('#helpbutton');
            this._helpButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._helpButton[0], onTap: () => {
                    $('<a target="_blank" href="https://www.github.com/malulleybovo/SymbolArtEditorOnline/wiki"/>')[0].click();
                }
            });
        });
    })();

    get loaded() {
        return this._importExportButton instanceof jQuery
            && this._helperImageButton instanceof jQuery
            && this._soundButton instanceof jQuery;
    }

    constructor() {
        super();
        this.didLoad(_ => {
            this.collapse();
        });
    }

    collapse() {
        this.alpha = 0;
        this.marginTop = 0;
        this.isUserInteractionEnabled = false;
    }

    expand() {
        this.alpha = 1;
        this.marginTop = 16;
        this.isUserInteractionEnabled = true;
    }

    toggle() {
        this.alpha > 0 ? this.collapse() : this.expand();
    }

}
