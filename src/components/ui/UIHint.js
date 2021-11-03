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

class UIHint extends UIView {

    get viewPath() { return 'res/templates/hint.html' }
    
    get loaded() {
        return this.view instanceof jQuery
            && this.view[0] instanceof HTMLElement
            && this._hintText instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.didLoad(_ => {
            this._hintText.css('opacity', value ? '0' : '1');
        });
    }

    _listener = e => {
        this.isHidden = false;
        this.view.css('top', (e.clientY + 30) + 'px').css('left', e.clientX + 'px')
    };
    
    set text(value) {
        if (typeof value !== 'string') return;
        this.didLoad(_ => {
            this._hintText.text(value);
        });
    }

    _durationInMilliseconds = 2000;
    set durationInMilliseconds(value) {
        if (!Number.isSafeInteger(value)) return;
        this._durationInMilliseconds = value;
    }

    _hintText = (() => {
        this.didLoad(_ => {
            this._hintText = this.view.find('#hinttext');
        });
    })();

    constructor({ text = null, durationInMilliseconds = null } = { }) {
        super();
        this.text = text;
        this.durationInMilliseconds = durationInMilliseconds;
        this.append({ to: $('body') });
        this.didLoad(_ => {
            window.addEventListener('mousemove', this._listener)
            setTimeout(_ => {
                window.removeEventListener('mousemove', this._listener)
                this.isHidden = true;
                setTimeout(_ => {
                    this.view.remove();
                }, 200);
            }, this._durationInMilliseconds);
        });
    }

}
