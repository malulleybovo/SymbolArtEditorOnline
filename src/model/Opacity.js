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

class Opacity {

    static lowerBound = 0;
    static upperBound = 7;

    _index = 7;
    get index() { return this._index }
    set index(value) {
        if (this.isValid({ index: value })) this._index = value;
    }
    
    get value() {
        switch (this._index) {
            case 0: return 0.0392156863;
            case 1: return 0.105882353;
            case 2: return 0.196078431;
            case 3: return 0.309803922;
            case 4: return 0.447058824;
            case 5: return 0.607843137;
            case 6: return 0.792156863;
            case 7: return 1;
        }
    }
    set value(value) {
        if (this.isValid({ float: value })) {
            let opacity = Math.max(0, Math.min(1, value));
            let possibleValues = [0.0392156863, 0.105882353, 0.196078431, 0.309803922, 0.447058824, 0.607843137, 0.792156863, 1];
            let minimumDifference = Infinity;
            let index = 7;
            for (var i = 0; i < possibleValues.length; i++) {
                let difference = Math.abs(opacity - possibleValues[i]);
                if (difference < minimumDifference) {
                    minimumDifference = difference;
                    index = i;
                }
            }
            this.index = index;
        }
    }

    constructor({ index = null, value = null } = {}) {
        if (value !== null) {
            this.value = value;
        } else {
            this.index = index;
        }
    }

    isValid({ index = undefined, float = undefined } = {}) {
        if (typeof index === 'undefined' && typeof float === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = false;
        if (index !== undefined) {
            valid = valid || (typeof index === 'number'
                && Number.isInteger(index)
                && index >= Opacity.lowerBound
                && index <= Opacity.upperBound);
        }
        if (float !== undefined) {
            valid = valid || (typeof float === 'number'
                && !Number.isNaN(float)
                && Number.isFinite(float));
        }
        return valid;
    }

}
