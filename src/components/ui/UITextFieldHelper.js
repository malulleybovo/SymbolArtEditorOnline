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

class UITextFieldHelper extends UUID {

    _view = null;

    _title = null;
    set title(value) {
        if (typeof value !== 'string') return;
        this._title = value;
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

    _triggerView = (() => {
        let view = $('<div style="width: 100%;height: 100%;position: relative;"></div>');
        view.gestureRecognizer = new UIGestureRecognizer({
            targetHtmlElement: view[0], onPointerDown: (event) => {
                // to prevent propagation
            }, onPointerMove: (event) => {
                // to prevent propagation
            }, onPointerUp: () => {
                this._showModal();
            }
        });
        return view;
    })();

    _modalTextField = null;

    constructor({ view, title = null, onInput = null, onResult = null }) {
        if (!(view instanceof jQuery) || !(view[0] instanceof HTMLElement) || view[0].nodeName.toUpperCase() !== 'INPUT') {
            throw new TypeError('"view" expected type jQuery but got ' + view.constructor.name);
        }
        super();
        this._view = view;
        this.title = title;
        this.onInput = onInput;
        this.onResult = onResult;
        view[0].disabled = true;
        this._triggerView.insertAfter($(view[0]));
    }

    _showModal() {
        if (this._modalTextField instanceof UIModalTextField) return;
        this._modalTextField = new UIModalTextField({
            title: this._title,
            initialText: this._view.val(),
            onInput: this._onInput,
            onResult: (value) => {
                if (this._onResult) {
                    this._onResult(value);
                }
                this._modalTextField = null;
            }
        });
    }

}
