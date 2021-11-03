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

class Parallelogram {
    
    _origin = new Origin();
    get origin() { return this._origin }
    set origin(value) {
        if (!this.isValid({ origin: value })) return;
        this._origin.set({ x: value.x, y: value.y, eventsEnabled: true });
    }

    _vertexA = new Point({ unit: SymbolArt.scaling });
    get vertexA() { return this._vertexA }
    set vertexA(value) {
        if (!this.isValid({ vertex: value })) return;
        this._vertexA.set({ x: value.x, y: value.y, eventsEnabled: false });
        this._vertexC.set({ x: -value.x, y: -value.y, eventsEnabled: false });
        this._sizeOfDiagonalAC.width = Math.abs(this._vertexC.x - this._vertexA.x);
        this._sizeOfDiagonalAC.height = Math.abs(this._vertexC.y - this._vertexA.y);
        this.updateFrame();
    }

    _vertexB = new Point({ unit: SymbolArt.scaling });
    get vertexB() { return this._vertexB }
    set vertexB(value) {
        if (!this.isValid({ vertex: value })) return;
        this._vertexB.set({ x: value.x, y: value.y, eventsEnabled: false });
        this._vertexD.set({ x: -value.x, y: -value.y, eventsEnabled: false });
        this._sizeOfDiagonalBD.width = Math.abs(this._vertexD.x - this._vertexB.x);
        this._sizeOfDiagonalBD.height = Math.abs(this._vertexD.y - this._vertexB.y);
        this.updateFrame();
    }

    _vertexC = new Point({ unit: SymbolArt.scaling });
    get vertexC() { return this._vertexC }
    set vertexC(value) {
        if (!this.isValid({ vertex: value })) return;
        this._vertexC.set({ x: value.x, y: value.y, eventsEnabled: false });
        this._vertexA.set({ x: -value.x, y: -value.y, eventsEnabled: false });
        this._sizeOfDiagonalAC.width = Math.abs(this._vertexC.x - this._vertexA.x);
        this._sizeOfDiagonalAC.height = Math.abs(this._vertexC.y - this._vertexA.y);
        this.updateFrame();
    }

    _vertexD = new Point({ unit: SymbolArt.scaling });
    get vertexD() { return this._vertexD }
    set vertexD(value) {
        if (!this.isValid({ vertex: value })) return;
        this._vertexD.set({ x: value.x, y: value.y, eventsEnabled: false });
        this._vertexB.set({ x: -value.x, y: -value.y, eventsEnabled: false });
        this._sizeOfDiagonalBD.width = Math.abs(this._vertexD.x - this._vertexB.x);
        this._sizeOfDiagonalBD.height = Math.abs(this._vertexD.y - this._vertexB.y);
        this.updateFrame();
    }

    _topLeftVertex = this._vertexA;
    get topLeftVertex() { return this._topLeftVertex }

    _topRightVertex = this._vertexB;
    get topRightVertex() { return this._topRightVertex }

    _bottomLeftVertex = this._vertexD;
    get bottomLeftVertex() { return this._bottomLeftVertex }

    _bottomRightVertex = this._vertexC;
    get bottomRightVertex() { return this._bottomRightVertex }

    _sizeOfDiagonalAC = new Size();
    get sizeOfDiagonalAC() { return this._sizeOfDiagonalAC }
    set sizeOfDiagonalAC(value) {
        if (!this.isValid({ sizeOfDiagonal: value })) return;
        let halfWidth = Math.round(value.width / 2);
        if ((halfWidth - this._vertexA.unitOffsetX) % this._vertexA.unit !== 0)
            halfWidth += this._vertexA.unit - ((halfWidth - this._vertexA.unitOffsetX) % this._vertexA.unit);
        let halfHeight = Math.round(value.height / 2);
        if ((halfHeight - this._vertexA.unitOffsetY) % this._vertexA.unit !== 0)
            halfHeight += this._vertexA.unit - ((halfHeight - this._vertexA.unitOffsetY) % this._vertexA.unit);
        this._sizeOfDiagonalAC.width = Math.round(2 * halfWidth);
        this._sizeOfDiagonalAC.height = Math.round(2 * halfHeight);
        this._vertexA.set({ x: -halfWidth, y: halfHeight, eventsEnabled: false });
        this._vertexC.set({ x: halfWidth, y: -halfHeight, eventsEnabled: false });
    }

    _sizeOfDiagonalBD = new Size();
    get sizeOfDiagonalBD() { return this._sizeOfDiagonalBD }
    set sizeOfDiagonalBD(value) {
        if (!this.isValid({ sizeOfDiagonal: value })) return;
        let halfWidth = Math.round(value.width / 2);
        if ((halfWidth - this._vertexB.unitOffsetX) % this._vertexB.unit !== 0)
            halfWidth += this._vertexB.unit - ((halfWidth - this._vertexB.unitOffsetX) % this._vertexB.unit);
        let halfHeight = Math.round(value.height / 2);
        if ((halfHeight - this._vertexB.unitOffsetY) % this._vertexB.unit !== 0)
            halfHeight += this._vertexB.unit - ((halfHeight - this._vertexB.unitOffsetY) % this._vertexB.unit);
        this._sizeOfDiagonalBD.width = Math.round(2 * halfWidth);
        this._sizeOfDiagonalBD.height = Math.round(2 * halfHeight);
        this._vertexB.set({ x: halfWidth, y: halfHeight, eventsEnabled: false });
        this._vertexD.set({ x: -halfWidth, y: -halfHeight, eventsEnabled: false });
    }

    get boundingBox() {
        let sizeOfDiagonalAC = this.sizeOfDiagonalAC;
        let sizeOfDiagonalBD = this.sizeOfDiagonalBD;
        return new Size({
            width: Math.max(sizeOfDiagonalAC.width, sizeOfDiagonalBD.width),
            height: Math.max(sizeOfDiagonalAC.height, sizeOfDiagonalBD.height)
        });
    }

    get minimumX() { return this._origin.x - Math.floor(this.boundingBox.width / 2) }
    get maximumX() { return this._origin.x + Math.floor(this.boundingBox.width / 2) }
    get minimumY() { return this._origin.y - Math.floor(this.boundingBox.height / 2) }
    get maximumY() { return this._origin.y + Math.floor(this.boundingBox.height / 2) }

    constructor({ parallelogram = null, origin = null, sizeOfDiagonalAC = null, sizeOfDiagonalBD = null } = {}) {
        this.origin.onChanged = () => {
            let unitOffsetX = Math.abs(this.origin.x) % 2;
            this.vertexA.unitOffsetX = unitOffsetX;
            this.vertexB.unitOffsetX = unitOffsetX;
            this.vertexC.unitOffsetX = unitOffsetX;
            this.vertexD.unitOffsetX = unitOffsetX;
            let unitOffsetY = Math.abs(this.origin.y) % 2;
            this.vertexA.unitOffsetY = unitOffsetY;
            this.vertexB.unitOffsetY = unitOffsetY;
            this.vertexC.unitOffsetY = unitOffsetY;
            this.vertexD.unitOffsetY = unitOffsetY;
            this.vertexA = this.vertexA;
            this.vertexB = this.vertexB;
        }
        this.vertexA.onChanged = () => { this.vertexA = this.vertexA };
        this.vertexB.onChanged = () => { this.vertexB = this.vertexB };
        this.vertexC.onChanged = () => { this.vertexC = this.vertexC };
        this.vertexD.onChanged = () => { this.vertexD = this.vertexD };
        if (parallelogram instanceof Parallelogram) {
            this.origin = parallelogram.origin;
            this.sizeOfDiagonalAC = parallelogram.sizeOfDiagonalAC;
            this.sizeOfDiagonalBD = parallelogram.sizeOfDiagonalBD;
        } else {
            this.origin = origin;
            this.sizeOfDiagonalAC = sizeOfDiagonalAC;
            this.sizeOfDiagonalBD = sizeOfDiagonalBD;
        }
    }

    isValid({ vertex = undefined, origin = undefined, sizeOfDiagonal = undefined } = {}) {
        if (typeof vertex === 'undefined' && typeof origin === 'undefined' && typeof sizeOfDiagonal === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof vertex !== 'undefined') {
            valid = vertex instanceof Point;
        }
        if (valid && typeof origin !== 'undefined') {
            valid = origin instanceof Origin;
        }
        if (valid && typeof sizeOfDiagonal !== 'undefined') {
            valid = sizeOfDiagonal instanceof Size;
        }
        return valid;
    }

    updateFrame() {
        let positiveACVertex = this._vertexA.y >= 0 ? this._vertexA : this._vertexC;
        let negativeACVertex = this._vertexA.y >= 0 ? this._vertexC : this._vertexA;
        let positiveBDVertex = this._vertexB.y >= 0 ? this._vertexB : this._vertexD;
        let negativeBDVertex = this._vertexB.y >= 0 ? this._vertexD : this._vertexB;
        if (positiveACVertex.x >= positiveBDVertex.x) {
            this._topRightVertex = positiveACVertex;
            this._bottomLeftVertex = negativeACVertex;
            this._topLeftVertex = positiveBDVertex;
            this._bottomRightVertex = negativeBDVertex;
        } else {
            this._topRightVertex = positiveBDVertex;
            this._bottomLeftVertex = negativeBDVertex;
            this._topLeftVertex = positiveACVertex;
            this._bottomRightVertex = negativeACVertex;
        }
    }

}
