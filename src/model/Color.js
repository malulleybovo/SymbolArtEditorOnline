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

class Color {

    static lowerBound = 0;
    static upperBound = 255;

    _r = 0;
    get r() { return this._r }
    set r(value) {
        if (this.isValid({ value: value })) this._r = value;
    }

    _g = 0;
    get g() { return this._g }
    set g(value) {
        if (this.isValid({ value: value })) this._g = value;
    }

    _b = 0;
    get b() { return this._b }
    set b(value) {
        if (this.isValid({ value: value })) this._b = value;
    }

    get hex() {
        return ('000000' + this.value.toString(16)).slice(-6);
    }

    get value() {
        return (this._r << 16) + (this._g << 8) + (this._b);
    }

    constructor({ r = null, g = null, b = null, hexValue = null } = {}) {
        if (Number.isSafeInteger(hexValue) && hexValue >= 0 && hexValue <= 0xffffff) {
            this.r = (hexValue >> 16) & 0xff;
            this.g = (hexValue >> 8) & 0xff;
            this.b = hexValue & 0xff;
        } else {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    isValid({ value = undefined } = {}) {
        if (typeof value === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        return typeof value === 'number'
            && Number.isInteger(value)
            && value >= Color.lowerBound
            && value <= Color.upperBound;
    }

}
