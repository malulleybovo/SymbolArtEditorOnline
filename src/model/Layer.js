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

class Layer extends Identifiable {

    _name = '';
    get name() { return this._name }
    set name(value) {
        if (this.isValid({ name: value }))
            this._name = value.substr(0, 40);
    }
    
    _parent = null;
    get parent() { return this._parent }
    set parent(value) {
        if (this.isValid({ parent: value })) {
            this._parent = value;
            this.updateDistanceFromRoot();
        }
    }

    _distanceFromRoot = 0;
    get distanceFromRoot() { return this._distanceFromRoot }

    get hasParent() {
        return this._parent != null;
    }

    constructor({ name = null, parent = null } = {}) {
        super();
        this.name = name;
        this.parent = parent;
    }

    isValid({ name = undefined, parent = undefined } = {}) {
        if (typeof name === 'undefined' && typeof parent === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (typeof name !== 'undefined') {
            valid = typeof name === 'string';
        }
        if (valid && typeof parent !== 'undefined') {
            valid = parent === null || parent instanceof Container;
        }
        return valid;
    }

    updateDistanceFromRoot() {
        this._distanceFromRoot = this._parent instanceof Layer ? (this._parent.distanceFromRoot + 1) : 0;
    }

    lowestCommonAncestor({ withLayer }) {
        if (!(withLayer instanceof Layer)) {
            return null;
        }
        let ancestors = [];
        let ancestor = this;
        while (ancestor instanceof Layer) {
            ancestors.push(ancestor);
            ancestor = ancestor.parent;
        }
        ancestor = withLayer;
        while (ancestor instanceof Layer) {
            if (ancestors.includes(ancestor)) {
                return ancestor;
            }
            ancestor = ancestor.parent;
        }
        return null;
    }

}
