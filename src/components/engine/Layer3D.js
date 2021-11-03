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

class Layer3D extends THREE.Group {

    static backgroundMaterial = new THREE.MeshBasicMaterial({
        color: 0x3c3c3c,
        transparent: true
    });

    static outlineMaterial = new THREE.LineBasicMaterial({
        color: 0x808080,
        transparent: true
    });

    static selectedOutlineMaterial = new THREE.LineBasicMaterial({
        color: 0xff9e2c,
        transparent: true
    });

    static layersInUse = {};

    get layerUuid() { return '' }

    _isFocused = true;
    get isFocused() { return this._isFocused }
    set isFocused(value) {
        if (typeof value === 'boolean' && this._isFocused !== value) {
            this._isFocused = value;
            this.changedFocus();
        }
    }

    constructor() {
        super();
    }

    static freeUnusedLayers({ usingSymbolArt }) {
        let uuidsInUse = [];
        usingSymbolArt.root.depthFirstIterator(layer => {
            uuidsInUse.push(layer.uuid);
        });
        let uuidsInMemory = Object.keys(Layer3D.layersInUse);
        let uuidsToBeFreed = uuidsInMemory.filter(a => !uuidsInUse.includes(a));
        for (var index in uuidsToBeFreed) {
            if (Layer3D.layersInUse[uuidsToBeFreed[index]] && Layer3D.layersInUse[uuidsToBeFreed[index]].free) {
                Layer3D.layersInUse[uuidsToBeFreed[index]].free();
            }
            delete Layer3D.layersInUse[uuidsToBeFreed[index]];
        }
    }

    changedFocus() { }

    update({ using }) { }

    free() {
        delete Layer3D.layersInUse[this.layerUuid];
    }

}
