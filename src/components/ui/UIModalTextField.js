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

class UIModalTextField extends UIView {

    get viewPath() { return 'res/templates/modaltextfield.html' }

    _active = true;

    _title = null;
    set title(value) {
        if (typeof value !== 'string') return;
        this._title = value;
    }

    _initialText = '';
    set initialText(value) {
        if (typeof value !== 'string') return;
        this._initialText = value;
    }

    _onInput = null;
    set onInput(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onInput = value;
    }

    _onResult = null;
    set onResult(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onResult = value;
    }

    _header = (() => {
        this.didLoad(_ => {
            this._header = this.view.find('#textfieldtitle');
            this._header.text(this._title);
        });
    })();

    _textField = (() => {
        this.didLoad(_ => {
            this._textField = this.view.find('#textfield');
            this._textField.val(this._initialText);
            this._textField.on('input', () => {
                if (!this._active) return;
                if (this._onInput) {
                    let modifiedValue = this._onInput(this._textField.val());
                    if (typeof modifiedValue === 'string') {
                        this._textField.val(modifiedValue);
                    }
                }
            });
            this._textField.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this._textField[0],
                preventsDefault: false,
                onPointerDown: (event) => {
                    // to prevent propagation
                }, onPointerMove: (event) => {
                    // to prevent propagation
                }, onPointerUp: () => {
                    // to prevent propagation
                }
            });
        });
    })();

    _closeButton = (() => {
        this.didLoad(_ => {
            this._closeButton = this.view.find('#textfieldclosebutton');
            this._closeButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._closeButton[0], onTap: () => {
                    this._close();
                }
            });
        });
    })();

    get loaded() {
        return this._header instanceof jQuery
            && this._textField instanceof jQuery;
    }

    constructor({ title = null, initialText = null, onInput = null, onResult = null } = {}) {
        super();
        this.title = title;
        this.initialText = initialText;
        this.onInput = onInput;
        this.onResult = onResult;
        this.didLoad(_ => {
            this.view.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this.view[0],
                preventsDefault: false,
                onPointerDown: (event) => {
                    // to prevent propagation
                }, onPointerMove: (event) => {
                    // to prevent propagation
                }, onPointerUp: () => {
                    this._close();
                }
            });
        });
        this._open();
    }

    _open() {
        if (!this._active) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this._open();
            });
            return;
        }
        $('body').append(this.view);
        setTimeout(_ => {
            this.view.css('opacity', 1);
            this._textField.focus();
        }, 10);
    }

    _close() {
        if (!this._active) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this._close();
            });
            return;
        }
        this._active = false;
        this._textField.blur();
        if (this._onResult) {
            this._onResult(this._textField.val());
        }
        this.view.css('opacity', 0);
        setTimeout(_ => {
            this.view.remove();
        }, 200);
    }

}
