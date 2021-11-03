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

class Asset {
    
    _filePath = 'res/assets/241.png';
    get filePath() { return this._filePath }
    set filePath(value) {
        if (this.isValid({ filePath: value })) this._filePath = value;
    }

    get index() {
        return parseInt(this.filePath.replace(/[^0-9]/g, '')) - 1;
    }
    set index(value) {
        if (!Number.isSafeInteger(value)) return;
        this.filePath = 'res/assets/' + (value + 1) + '.png';
    }

    constructor({ filePath = null } = {}) {
        this.filePath = filePath;
    }

    isValid({ filePath = undefined } = {}) {
        if (typeof filePath === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        return typeof filePath === 'string';
    }
    
}
