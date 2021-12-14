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

class UIMenu extends UIView {

    get viewPath() { return 'res/templates/menu.html' }

    _tapHoldEnabled = true;

    _collapsibleMenu = new UICollapsibleMenu();

    _ellipsisButton = (() => {
        this.didLoad(_ => {
            this._ellipsisButton = this.view.find('#ellipsisbutton');
            this._ellipsisButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._ellipsisButton[0], onTap: () => {
                    this._collapsibleMenu.toggle();
                }
            });
        });
    })();
    
    _tapHoldToggleButton = (() => {
        this.didLoad(_ => {
            this._tapHoldToggleButton = this.view.find('#tapholdtogglebutton');
            this._tapHoldToggleButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._tapHoldToggleButton[0], onTap: () => {
                    if (!this._tapHoldEnabled) {
                        ApplicationState.shared.interaction = InteractionType.enablingTapHoldFeature;
                    } else {
                        ApplicationState.shared.interaction = InteractionType.disablingTapHoldFeature;
                    }
                }
            });
        });
    })();

    _undoButton = (() => {
        this.didLoad(_ => {
            this._undoButton = this.view.find('#undobutton');
            this._undoButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._undoButton[0], onTap: () => {
                    HistoryState.shared.undo();
                }
            });
        });
    })();

    _redoButton = (() => {
        this.didLoad(_ => {
            this._redoButton = this.view.find('#redobutton');
            this._redoButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._redoButton[0], onTap: () => {
                    HistoryState.shared.redo();
                }
            });
        });
    })();

    _symbolArtTypeLabel = (() => {
        this.didLoad(_ => {
            this._symbolArtTypeLabel = this.view.find('#symbolarttypelabel');
        });
    })();

    get loaded() {
        return this._collapsibleMenu.loaded
            && this._ellipsisButton instanceof jQuery
            && this._undoButton instanceof jQuery
            && this._redoButton instanceof jQuery
            && this._symbolArtTypeLabel instanceof jQuery;
    }

    constructor() {
        super();
        this.load({ uiView: this._collapsibleMenu, onElementWithId: 'collapsiblemenu' });
        this.updateState();
        ApplicationState.shared.add({
            onChangeViewModeListener: () => {
                this.updateState();
            },
            onChangeInteractionListener: () => {
                if (ApplicationState.shared.interaction === InteractionType.enablingTapHoldFeature) {
                    this._tapHoldEnabled = true;
                    this.updateState();
                }
                if (ApplicationState.shared.interaction === InteractionType.disablingTapHoldFeature) {
                    this._tapHoldEnabled = false;
                    this.updateState();
                }
            }
        });
        HistoryState.shared.add({
            onChangeStateListener: () => {
                this.updateState();
            }
        });
        $(window).resize(() => {
            this.didLoad(_ => {
                this.updateState();
            });
        });
    }

    updateState() {
        this.didLoad(_ => {
            this._undoButton.css('opacity', HistoryState.shared.isAtOldestState ? '0.5' : '1');
            this._redoButton.css('opacity', HistoryState.shared.isAtMostRecentState ? '0.5' : '1');
            this._symbolArtTypeLabel.text(UIApplication.shared.symbolArt.type === SymbolArtType.symbolArt ? 'SYMBOL ART' : 'TEAM FLAG');
            this._symbolArtTypeLabel.css('opacity', window.innerWidth < 460 && ApplicationState.shared.viewMode === ViewMode.layerEditorMode ? '0' : '');
            this._tapHoldToggleButton.css('color', this._tapHoldEnabled ? 'white' : '#ff9e2c');
        });
    }

}
