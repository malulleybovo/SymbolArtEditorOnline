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

class Point {
    
    _x = 0;
    get x() { return this._x }

    _y = 0;
    get y() { return this._y }

    _unit = 1;
    get unit() { return this._unit }
    set unit(value) {
        if (Number.isSafeInteger(value) && value > 0) this._unit = value;
    }

    _unitOffsetX = 0;
    get unitOffsetX() { return this._unitOffsetX }
    set unitOffsetX(value) {
        if (Number.isSafeInteger(value)) this._unitOffsetX = value;
    }

    _unitOffsetY = 0;
    get unitOffsetY() { return this._unitOffsetY }
    set unitOffsetY(value) {
        if (Number.isSafeInteger(value)) this._unitOffsetY = value;
    }

    get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    _onChanged = null;
    set onChanged(listener) {
        if (typeof listener === 'function') this._onChanged = listener;
    }

    constructor({ unit = null, unitOffsetX = null, unitOffsetY = null, x = null, y = null } = {}) {
        this.unit = unit;
        this.unitOffsetX = unitOffsetX;
        this.unitOffsetY = unitOffsetY;
        this.set({ x: x, y: y });
    }

    isValid({ x = undefined, y = undefined } = {}) {
        if (typeof x === 'undefined' && typeof y === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof x !== 'undefined') {
            valid = typeof x === 'number';
        }
        if (valid && typeof y !== 'undefined') {
            valid = typeof y === 'number';
        }
        return valid;
    }

    set({ x = undefined, y = undefined, eventsEnabled = true }) {
        if (typeof x === 'undefined' && typeof y === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let hasChanged = false;
        if (typeof x !== 'undefined' && this.isValid({ x: x })) {
            let newX = this._unit * Math.round((x - this._unitOffsetX) / this._unit) + this._unitOffsetX;
            if (this._x != newX) {
                this._x = newX;
                hasChanged = true;
            }
        }
        if (typeof y !== 'undefined' && this.isValid({ y: y })) {
            let newY = this._unit * Math.round((y - this._unitOffsetY) / this._unit) + this._unitOffsetY;
            if (this._y != newY) {
                this._y = newY;
                hasChanged = true;
            }
        }
        if (eventsEnabled && hasChanged && typeof this._onChanged === 'function') this._onChanged();
    }

    getX({ fromDesiredX }) {
        if (!this.isValid({ x: fromDesiredX })) return null;
        return this._unit * Math.round((fromDesiredX - this._unitOffsetX) / this._unit) + this._unitOffsetX;
    }

    getY({ fromDesiredY }) {
        if (!this.isValid({ y: fromDesiredY })) return null;
        return this._unit * Math.round((fromDesiredY - this._unitOffsetY) / this._unit) + this._unitOffsetY;
    }

    distanceTo({ point = undefined } = {}) {
        if (typeof point === 'undefined' || !(point instanceof Point))
            throw new SyntaxError('function expects at least one parameter');
        return new Size({ width: Math.abs(point.x - this.x), height: Math.abs(point.y - this.y) });
    }

    distanceFrom({ point = undefined } = {}) {
        if (typeof point === 'undefined' || !(point instanceof Point))
            throw new SyntaxError('function expects at least one parameter');
        return new Size({ width: Math.abs(this.x - point.x), height: Math.abs(this.y - point.y) });
    }

    clone() {
        return new Point({ unit: this._unit, unitOffsetX: this._unitOffsetX, unitOffsetY: this._unitOffsetY, x: this._x, y: this._y });
    }

}
