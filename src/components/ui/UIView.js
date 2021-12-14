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

class UIView extends UUID {

    static _cache = {};

    get viewPath() { return '' }

    _view = $();
    get view() { return this._view }

    _onLoad = null;

    get isUserInteractionEnabled() {
        return this._view.css('pointer-events') !== 'none';
    }
    set isUserInteractionEnabled(value) {
        if (typeof value !== 'boolean') return;
        this._view.css('pointer-events', value ? 'all' : 'none');
    }

    get alpha() {
        return parseFloat(this._view.css('opacity'));
    }
    set alpha(value) {
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) return;
        this._view.css('opacity', value);
    }

    get marginTop() {
        return this._view[0] ? parseFloat(this._view[0].style['margin-top']) : 0;
    }
    set marginTop(value) {
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) return;
        this._view.css('margin-top', value + 'pt');
    }

    constructor() {
        super();
        if (UIView._cache[this.viewPath]) {
            this._onLoad = UIView._cache[this.viewPath];
            this._onLoad.then(view => {
                this._view = $(view);
                this._view.attr('id', this.uuidString);
            });
        } else {
            this._onLoad = $.ajax({
                type: 'GET',
                url: this.viewPath,
                success: (view) => {
                    this._view = $(view);
                    this._view.attr('id', this.uuidString);
                }
            });
            UIView._cache[this.viewPath] = this._onLoad;
        }
    }

    didLoad(handler) {
        if (this._view instanceof jQuery && this._view.length > 0) {
            setTimeout(_ => {
                handler(this._view[0]);
            });
            return;
        }
        this._onLoad.then(handler);
    }

    append({ to }) {
        if (!(to instanceof jQuery) || !(to[0] instanceof HTMLElement)) return;
        this.didLoad(_ => {
            $(to[0]).append(this._view);
        });
    }

    load({ uiView, onElementWithId }) {
        if (!(uiView instanceof UIView)
            || typeof onElementWithId !== 'string'
            || onElementWithId.length === 0) return;
        uiView.didLoad(_ => {
            this.didLoad(_ => {
                let $target = $(this.view.find('#' + onElementWithId)[0]);
                uiView.view.insertAfter($target);
                $target.remove();
            });
        });
    }
    
    remove() {
        this.didLoad(_ => {
            this.view.remove();
        });
    }

}
