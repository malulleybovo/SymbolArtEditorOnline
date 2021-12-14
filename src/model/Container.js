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

class Container extends Layer {

    static maximumDepth = 5;
    
    get origin() {
        let x = 0;
        let y = 0;
        let origins = this.symbols.map(a => a.frame.origin);
        for (var index in origins) {
            let origin = origins[index];
            x += origin.x;
            y += origin.y;
        }
        x /= origins.length;
        y /= origins.length;
        return new Origin({ x: x, y: y });
    }
    set origin(value) {
        if (!(value instanceof Origin)) return;
        let currentOrigin = this.origin;
        let dx = SymbolArt.scaling * Math.round((value.x - currentOrigin.x) / SymbolArt.scaling);
        let dy = SymbolArt.scaling * Math.round((value.y - currentOrigin.y) / SymbolArt.scaling);
        let frames = this.symbols.map(a => a.frame);
        for (var index in frames) {
            let origin = frames[index].origin;
            frames[index].origin = new Origin({
                x: origin.x + SymbolArt.scaling * Math.round(dx / SymbolArt.scaling),
                y: origin.y + SymbolArt.scaling * Math.round(dy / SymbolArt.scaling)
            });
        }
    }

    get boundingBox() {
        let minimumX = 0, minimumY = 0, maximumX = 0, maximumY = 0;
        let symbols = this.symbols;
        for (var index in symbols) {
            let symbol = symbols[index];
            if (index === 0) {
                minimumX = symbol.frame.minimumX;
                minimumY = symbol.frame.minimumY;
                maximumX = symbol.frame.maximumX;
                maximumY = symbol.frame.maximumY;
                continue;
            }
            minimumX = Math.min(minimumX, symbol.frame.minimumX);
            minimumY = Math.min(minimumY, symbol.frame.minimumY);
            maximumX = Math.max(maximumX, symbol.frame.maximumX);
            maximumY = Math.max(maximumY, symbol.frame.maximumY);
        }
        return new Size({
            width: maximumX - minimumX,
            height: maximumY - minimumY
        });
    }

    get isHidden() {
        if (this._sublayers.length === 0) return false;
        for (var index in this._sublayers) {
            let sublayer = this._sublayers[index];
            if (sublayer instanceof Symbol && !sublayer.isHidden) {
                return false;
            } else if (sublayer instanceof Container && !sublayer.isHidden) {
                return false;
            }
        }
        return true;
    }
    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        for (var index in this._sublayers) {
            let sublayer = this._sublayers[index];
            if (sublayer instanceof Symbol) {
                sublayer.isHidden = value;
            } else if (sublayer instanceof Container) {
                sublayer.isHidden = value;
            }
        }
    }

    _sublayers = [];
    get sublayers() { return this._sublayers.slice(0) }

    _numberOfSymbols = 0;
    get numberOfSymbols() { return this._numberOfSymbols }

    _depth = 0;
    get depth() { return this._depth }

    get symbols() {
        let symbols = [];
        this.depthFirstIterator(layer => {
            if (layer instanceof Symbol) symbols.push(layer);
        });
        return symbols;
    }

    get containers() {
        let containers = [];
        this.depthFirstIterator(layer => {
            if (layer instanceof Container) containers.push(layer);
        });
        return containers;
    }

    constructor({ name = null, sublayers = [] } = {}) {
        super();
        this.name = name;
        if (Array.isArray(sublayers)) {
            for (var index in sublayers) {
                this.add({ sublayer: sublayers[index] });
            }
        }
    }

    add({ sublayer = undefined, atIndex = this._sublayers.length } = {}) {
        if (typeof sublayer === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        if (!(sublayer instanceof Layer))
            throw new TypeError('sublayer expected a Layer but received: ' + sublayer);
        if (typeof atIndex !== 'number' || !Number.isInteger(atIndex))
            throw new TypeError('atIndex expected an integer value but received: ' + typeof atIndex);
        if (!this.canInsert({ sublayer: sublayer })) return;
        if (atIndex < 0) atIndex = 0;
        if (atIndex > this._sublayers.length) atIndex = this._sublayers.length;
        if (sublayer.parent instanceof Container) {
            sublayer.parent.remove({ sublayer: sublayer, deletesIfBecomesEmpty: this !== sublayer.parent });
        }
        sublayer.parent = this;
        this._sublayers.splice(atIndex, 0, sublayer);
        this.updateNumberOfSymbols();
        this.updateDepth();
    }

    remove({ sublayer = undefined, sublayerWithUuidString = undefined, sublayerAtIndex = undefined, deletesIfBecomesEmpty = true } = {}) {
        if (typeof sublayer === 'undefined' && typeof sublayerWithUuidString === 'undefined' && typeof sublayerAtIndex === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let index = null;
        if (typeof sublayer !== 'undefined' || typeof sublayerWithUuidString !== 'undefined') {
            index = this.indexOf({ sublayer: sublayer, sublayerWithUuidString: sublayerWithUuidString });
        } else if (typeof sublayerAtIndex !== 'undefined') {
            index = sublayerAtIndex;
        }
        if (!Number.isInteger(index) || index < 0 || index >= this._sublayers.length)
            return null;
        let layer = this._sublayers.splice(index, 1)[0];
        layer.parent = null;
        this.updateDepth();
        if (deletesIfBecomesEmpty
            && this._sublayers.length === 0
            && this.parent instanceof Container) {
            this.parent.remove({ sublayer: this });
        }
        this.updateNumberOfSymbols();
        return layer;
    }

    getSublayer({ atIndex = undefined, withUuidString = undefined } = {}) {
        if (typeof atIndex === 'undefined' && typeof withUuidString === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        if (typeof atIndex !== 'undefined') {
            if (typeof atIndex !== 'number' || !Number.isInteger(atIndex))
                throw new TypeError('atIndex expected an integer value but received: ' + typeof atIndex);
            if (atIndex < 0 || atIndex >= this._sublayers.length)
                throw new RangeError('expected an index in range [0, ' + (this._sublayers.length - 1) + '] but received: ' + atIndex);
            return this._sublayers[atIndex];
        } else if (typeof withUuidString !== 'undefined') {
            let sublayer = null;
            this.depthFirstIterator(layer => {
                if (layer.uuid === withUuidString) {
                    sublayer = layer;
                    return true;
                }
            });
            return sublayer;
        }
        return null;
    }

    indexOf({ sublayer = undefined, sublayerWithUuidString = undefined, recursive = false } = {}) {
        if (typeof sublayer === 'undefined' && typeof sublayerWithUuidString === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        for (var index in this._sublayers) {
            let layer = this._sublayers[index];
            if (sublayer instanceof Layer && layer === sublayer)
                return parseInt(index);
            else if (typeof sublayerWithUuidString === 'string' && layer.uuidString === sublayerWithUuidString)
                return parseInt(index);
            else if (recursive && layer instanceof Container
                && layer.contains({ sublayer: sublayer })) {
                return parseInt(index);
            }
        }
        return null;
    }

    depthFirstIterator(callback) {
        for (var index in this._sublayers) {
            let sublayer = this._sublayers[index];
            if (sublayer instanceof Symbol) {
                let shouldBreak = callback(sublayer);
                if (shouldBreak) return true;
            } else if (sublayer instanceof Container) {
                let shouldBreak = callback(sublayer);
                if (shouldBreak) return true;
                shouldBreak = sublayer.depthFirstIterator(callback);
                if (shouldBreak) return true;
            }
        }
    }
    
    reverseDepthFirstIterator(callback) {
        for (var index = this._sublayers.length - 1; index >= 0; index--) {
            let sublayer = this._sublayers[index];
            if (sublayer instanceof Symbol) {
                let shouldBreak = callback(sublayer);
                if (shouldBreak) return true;
            } else if (sublayer instanceof Container) {
                let shouldBreak = callback(sublayer);
                if (shouldBreak) return true;
                shouldBreak = sublayer.reverseDepthFirstIterator(callback);
                if (shouldBreak) return true;
            }
        }
    }

    contains({ sublayer = undefined } = {}) {
        if (typeof sublayer === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        if (!(sublayer instanceof Symbol || sublayer instanceof Container)) return false;
        let contains = false;
        this.depthFirstIterator((layer) => {
            contains = contains || sublayer === layer;
            if (contains) return true;
        });
        return contains;
    }

    updateNumberOfSymbols() {
        let numberOfSymbols = this._sublayers
            .map(a => a instanceof Container ? a.numberOfSymbols : 1)
            .reduce((a, b) => a + b, 0);
        if (numberOfSymbols !== this._numberOfSymbols) {
            this._numberOfSymbols = numberOfSymbols;
            if (this.parent instanceof Container) {
                this.parent.updateNumberOfSymbols();
            }
        }
    }

    updateDepth() {
        let updatedDepth = Math.max(...(this._sublayers.map(a => a instanceof Container ? a.depth : 0))) + 1;
        if (this._sublayers.length === 0) updatedDepth = 1;
        if (updatedDepth !== this._depth) {
            this._depth = updatedDepth;
            if (this.parent instanceof Container) {
                this.parent.updateDepth();
            }
        }
    }

    isValid({ sublayer = undefined, name = undefined, parent = undefined } = {}) {
        if (typeof sublayer === 'undefined' && typeof name === 'undefined' && typeof parent === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (sublayer instanceof Symbol) {
            valid = !this.contains({ sublayer: sublayer });
        } else if (sublayer instanceof Container) {
            valid = !this.contains({ sublayer: sublayer })
                && !sublayer.contains({ sublayer: this });
        }
        if (valid && typeof name !== 'undefined')
            valid = super.isValid({ name: name });
        if (valid && typeof parent !== 'undefined')
            valid = super.isValid({ parent: parent });
        return valid;
    }

    updateDistanceFromRoot() {
        super.updateDistanceFromRoot();
        this.depthFirstIterator(layer => layer.updateDistanceFromRoot());
    }

    canInsert({ sublayer }) {
        if (!(sublayer instanceof Layer)) return false;
        let layerDepth = sublayer instanceof Container ? sublayer.depth : 0;
        if (layerDepth + 1 + this.distanceFromRoot > Container.maximumDepth) return false;
        let current = this;
        while (current.parent instanceof Container) {
            current = current.parent;
        }
        let allContainers = current.containers;
        let currentSymbolCount = current.symbols.filter(a => a !== sublayer).length;
        if (allContainers.includes(sublayer)) {
            currentSymbolCount -= sublayer.symbols.length;
            allContainers = allContainers.filter(a => a !== sublayer);
        }
        let currentContainerCount = allContainers.length;
        let symbolCount = sublayer instanceof Container ? sublayer.symbols.length : 1;
        if (currentSymbolCount + symbolCount > SymbolArt.maximumNumberOfSymbols) return false;
        let containerCount = sublayer instanceof Container ? (1 + sublayer.containers.length) : 0;
        if (currentContainerCount + containerCount > SymbolArt.maximumNumberOfContainers) return false;
        return true;
    }

    symbolColors() {
        let symbols = this.symbols;
        let colorSet = new Set();
        let colors = [];
        for (var i = 0; i < symbols.length; i++) {
            let id = `${symbols[i].color.hex} ${symbols[i].opacity.index}`;
            if (!colorSet.has(id)) {
                colorSet.add(id);
                colors.push({
                    color: new Color({ hexValue: symbols[i].color.value }),
                    opacity: new Opacity({ index: symbols[i].opacity.index })
                })
            }
        }
        return colors;
    }

    clone({ retainUuid = true } = { }) {
        let clone = new Container({
            name: this.name,
            sublayers: this.sublayers.map(sublayer => sublayer.clone({ retainUuid: retainUuid }))
        });
        if (retainUuid) {
            clone._uuid = this._uuid;
        }
        return clone;
    }

}