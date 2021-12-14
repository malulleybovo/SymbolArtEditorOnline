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

class UILayer extends UIView {

    get viewPath() { return 'res/templates/layer.html' }

    _onTap = null;
    get onTap() { return this._onTap }
    set onTap(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onTap = value;
    }

    get name() {
        if (!this.loaded) return '';
        return this._textView.text();
    }
    set name(value) {
        if (typeof value === 'string') {
            this.didLoad(_ => {
                this._textView.text(value);
            });
        }
    }

    _identifier = null;
    get identifier() {
        return this._identifier;
    }
    set identifier(value) {
        if (typeof value === 'string') {
            this._identifier = value;
        }
    }
    
    set previewAsset(value) {
        if (value instanceof Asset) {
            this.didLoad(_ => {
                this._symbolPreview.find('image').attr('href', value.filePath);
            });
        }
    }
    
    set previewAssetColor(value) {
        if (value instanceof Color) {
            this.didLoad(_ => {
                let hsv = value.hsv;
                this._symbolPreview.find('feColorMatrix').attr(
                    'values', 
                    (value.r / Color.upperBound) + ' 0 0 0 0 0 ' 
                    + (value.g / Color.upperBound) + ' 0 0 0 0 0 '
                    + (value.b / Color.upperBound) + ' 0 0 0 0 0 1 0');
            });
        }
    }
    
    _level = 0;
    get level() {
        return this._level;
    }
    set level(value) {
        if (Number.isSafeInteger(value)) {
            this._level = value;
            this.updateState();
        }
    }

    _collapsible = true;
    get collapsible() {
        return this._collapsible;
    }
    set collapsible(value) {
        if (typeof value === 'boolean') {
            this._collapsible = value;
            this.updateState();
        }
    }

    _collapsed = false;
    get collapsed() {
        return this._collapsed;
    }

    _onCollapseChanged = null;
    set onCollapseChanged(value) {
        if (typeof value === 'function') {
            this._onCollapseChanged = value;
        }
    }

    _selected = false;
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (typeof value === 'boolean') {
            this._selected = value;
            this.updateState();
        }
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

    get loaded() {
        return this.view instanceof jQuery
            && this.view[0] instanceof HTMLElement
            && this._textView instanceof jQuery
            && this._collapseButton instanceof jQuery
            && this._symbolPreview instanceof jQuery
            && this._renameButton instanceof jQuery
            && this._deleteButton instanceof jQuery;
    }

    _collapseButton = (() => {
        this.didLoad(_ => {
            this._collapseButton = this.view.find('#collapsebutton');
            this._collapseButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._collapseButton[0], onTap: () => {
                    this._collapsed = !this._collapsed;
                    this._collapseButton.css('background', this._collapsed ? '#101010' : 'white');
                    let icon = this._collapseButton.find('i');
                    if (this._collapsed) {
                        icon.removeClass('fa-angle-down');
                        icon.addClass('fa-angle-up');
                    } else {
                        icon.removeClass('fa-angle-up');
                        icon.addClass('fa-angle-down');
                    }
                    if (this._onCollapseChanged) {
                        this._onCollapseChanged(this);
                    }
                }
            });
        });
    })();
    
    _symbolPreview = (() => {
        this.didLoad(_ => {
            this._symbolPreview = this.view.find('#symbolpreview');
        });
    })();
    
    _textView = (() => {
        this.didLoad(_ => {
            this._textView = this.view.find('#textview');
        });
    })();
    
    _renameButton = (() => {
        this.didLoad(_ => {
            this._renameButton = this.view.find('#renamebutton');
            this._renameButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._renameButton[0], onTap: () => {
                    if (this._onRenameTapped) {
                        this._onRenameTapped(this);
                    }
                }
            });
        });
    })();
    
    _deleteButton = (() => {
        this.didLoad(_ => {
            this._deleteButton = this.view.find('#deletebutton');
            this._deleteButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._deleteButton[0], onTap: () => {
                    if (this._onDeleteTapped) {
                        this._onDeleteTapped(this);
                    }
                }
            });
        });
    })();
    
    constructor({ filePath = null } = {}) {
        super();
        let path = filePath;
        this.didLoad(_ => {
            if (mobileClient) this.view.css('margin-right', '8px');
            this.view.attr('src', path);
            this.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this.view[0], onTap: () => {
                    if (this._onTap) {
                        this._onTap(this);
                    }
                }
            });
            this.view.find('#placeholderid').attr('id', this.uuidString + '-assetpreview');
            this.view.find('image').attr('filter', 'url(#' + this.uuidString + '-assetpreview)');
        });
    }
    
    updateState() {
        if (!this.loaded) {
            this.didLoad(_ => {
                this.updateState();
            });
            return;
        }
        this._textView.css('color', this._selected ? '#ff9e2c' : '');
        this._collapseButton.css('visibility', this._collapsible ? '' : 'hidden');
        this._symbolPreview.css('visibility', this._collapsible ? 'hidden' : '');
        this.view.css('margin-left', (this._level * 12) + 'px');
    }

}
