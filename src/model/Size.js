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

class Size {
    
    _width = 0;
    get width() { return this._width }
    set width(value) {
        if (this.isValid({ width: value })) this._width = value;
    }

    _height = 0;
    get height() { return this._height }
    set height(value) {
        if (this.isValid({ height: value })) this._height = value;
    }

    get diagonalLength() {
        return Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2));
    }

    constructor({ width = null, height = null } = {}) {
        this.width = width;
        this.height = height;
    }

    isValid({ width = undefined, height = undefined } = {}) {
        if (typeof width === 'undefined' && typeof height === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof width !== 'undefined') {
            valid = typeof width === 'number'
                && Number.isInteger(width)
                && width >= 0;
        }
        if (valid && typeof height !== 'undefined') {
            valid = typeof height === 'number'
                && Number.isInteger(height)
                && height >= 0;
        }
        return valid;
    }

}
