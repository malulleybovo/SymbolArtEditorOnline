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

class Symbol extends Layer {

    static minimumSize = 4;
    static maximumSize = 2 * 191;

    _frame = new Parallelogram({
        sizeOfDiagonalAC: new Size({
            width: 100,
            height: 100
        }),
        sizeOfDiagonalBD: new Size({
            width: 100,
            height: 100
        })
    });
    get frame() { return this._frame }

    _opacity = new Opacity();
    get opacity() { return this._opacity }
    set opacity(value) {
        if (!this.isValid({ opacity: value })) return;
        this._opacity.index = value.index;
    }

    _isHidden = false;
    get isHidden() { return this._isHidden }
    set isHidden(value) {
        if (this.isValid({ isHidden: value })) this._isHidden = value;
    }

    _asset = new Asset();
    get asset() { return this._asset }
    set asset(value) {
        if (!this.isValid({ asset: value })) return;
        this._asset.filePath = value.filePath;
    }

    _color = new Color();
    get color() { return this._color }
    set color(value) {
        if (!this.isValid({ color: value })) return;
        this._color.r = value.r;
        this._color.g = value.g;
        this._color.b = value.b;
    }

    constructor({ name = null, parallelogram = null, origin = null, sizeOfDiagonalAC = null, sizeOfDiagonalBD = null, opacity = null, isHidden = null, asset = null, color = null } = {}) {
        super();
        if (parallelogram instanceof Parallelogram) {
            this._frame = new Parallelogram({ parallelogram: parallelogram });
        } else if (origin instanceof Origin && sizeOfDiagonalAC instanceof Size && sizeOfDiagonalBD instanceof Size) {
            this._frame = new Parallelogram({ origin: origin, sizeOfDiagonalAC: sizeOfDiagonalAC, sizeOfDiagonalBD: sizeOfDiagonalBD });
        }
        this.name = name;
        this.opacity = opacity;
        this.isHidden = isHidden;
        this.asset = asset;
        this.color = color;
    }

    isValid({ isHidden = undefined, opacity = undefined, asset = undefined, color = undefined, name = undefined, parent = undefined } = {}) {
        if (typeof isHidden === 'undefined' && typeof opacity === 'undefined' && typeof asset === 'undefined' && typeof color === 'undefined' && name === 'undefined' && parent === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof name !== 'undefined')
            valid = super.isValid({ name: name });
        if (valid && typeof parent !== 'undefined')
            valid = super.isValid({ parent: parent });
        if (valid && typeof isHidden !== 'undefined')
            valid = typeof isHidden === 'boolean';
        if (valid && typeof opacity !== 'undefined')
            valid = opacity instanceof Opacity;
        if (valid && typeof asset !== 'undefined')
            valid = asset instanceof Asset;
        if (valid && typeof color !== 'undefined')
            valid = color instanceof Color;
        return valid;
    }

    clone({ retainUuid = true } = { }) {
        let clone = new Symbol({
            origin: new Origin({ x: this.frame.origin.x, y: this.frame.origin.y }),
            sizeOfDiagonalAC: this.frame.sizeOfDiagonalAC,
            sizeOfDiagonalBD: this.frame.sizeOfDiagonalBD,
            opacity: new Opacity({ index: this.opacity.index }),
            isHidden: this.isHidden,
            asset: new Asset({ filePath: this.asset.filePath }),
            color: new Color({ hexValue: this.color.value })
        });
        if (retainUuid) {
            clone._uuid = this._uuid;
        }
        clone.frame.vertexA.set({ x: this.frame.vertexA.x, y: this.frame.vertexA.y });
        clone.frame.vertexB.set({ x: this.frame.vertexB.x, y: this.frame.vertexB.y });
        clone.frame.vertexC.set({ x: this.frame.vertexC.x, y: this.frame.vertexC.y });
        clone.frame.vertexD.set({ x: this.frame.vertexD.x, y: this.frame.vertexD.y });
        return clone;
    }

    isValidRotation({ angleInRadians, aroundAxis = this.frame.origin }) {
        if (typeof angleInRadians !== 'number' || Number.isNaN(angleInRadians)
            || !Number.isFinite(angleInRadians) || !(aroundAxis instanceof Point))
            return false;
        let sinTheta = Math.sin(angleInRadians);
        let cosTheta = Math.cos(angleInRadians);
        let vertices = ['vertexA', 'vertexB', 'vertexC', 'vertexD'];
        let positions = [];
        for (var index in vertices) {
            let vertex = vertices[index];
            let position = this.frame[vertex].clone();
            position.set({
                x: cosTheta * this.frame[vertex].x - sinTheta * this.frame[vertex].y,
                y: sinTheta * this.frame[vertex].x + cosTheta * this.frame[vertex].y
            });
            positions.push(position);
        }
        let axisToOrigin = {
            x: this.frame.origin.x - aroundAxis.x,
            y: this.frame.origin.y - aroundAxis.y
        };
        axisToOrigin = {
            x: cosTheta * axisToOrigin.x - sinTheta * axisToOrigin.y,
            y: sinTheta * axisToOrigin.x + cosTheta * axisToOrigin.y
        };
        if (Math.abs(aroundAxis.x + axisToOrigin.x + Math.min(...positions.map(a => a.x))) > 0.5 * SymbolArt.boundingBox.width
            || Math.abs(aroundAxis.x + axisToOrigin.x + Math.max(...positions.map(a => a.x))) > 0.5 * SymbolArt.boundingBox.width
            || Math.abs(aroundAxis.y + axisToOrigin.y + Math.min(...positions.map(a => a.y))) > 0.5 * SymbolArt.boundingBox.height
            || Math.abs(aroundAxis.y + axisToOrigin.y + Math.max(...positions.map(a => a.y))) > 0.5 * SymbolArt.boundingBox.height) {
            return false;
        }
        for (var i = 0; i < positions.length; i++) {
            if (Math.abs(Math.round(positions[i].x)) > 0.5 * Symbol.maximumSize
                || Math.abs(Math.round(positions[i].y)) > 0.5 * Symbol.maximumSize) {
                return false;
            }
            for (var j = i + 1; j < positions.length; j++) {
                if (Math.abs(Math.round(positions[i].x - positions[j].x)) < Symbol.minimumSize
                    && Math.abs(Math.round(positions[i].y - positions[j].y)) < Symbol.minimumSize) {
                    return false;
                }
            }
        }
        return true;
    }

    getValidScalingFactor({ fromFactor, usesX = true, usesY = true, relativeToOrigin = null }) {
        if (typeof fromFactor !== 'number' || Number.isNaN(fromFactor) || !Number.isFinite(fromFactor) || !(relativeToOrigin instanceof Origin || relativeToOrigin == null)) return 1;
        let minimumScalingFactor;
        let vertices = [this.frame.vertexA, this.frame.vertexB, this.frame.vertexC, this.frame.vertexD];
        let minimumDistance = Infinity;
        let offset = 0;
        if (usesX && usesY) {
            for (var i = 0; i < vertices.length; i++) {
                for (var j = 1; j < vertices.length && i != j; j++) {
                    let dx = Math.abs(vertices[i].x - vertices[j].x) + 2 * vertices[j].unitOffsetX;
                    let dy = Math.abs(vertices[i].y - vertices[j].y) + 2 * vertices[j].unitOffsetY;
                    if (dx < Symbol.minimumSize && dy >= Symbol.minimumSize) {
                        minimumDistance = Math.min(minimumDistance, dy);
                        offset = 2 * vertices[j].unitOffsetY;
                    } else if (dy < Symbol.minimumSize && dx >= Symbol.minimumSize) {
                        minimumDistance = Math.min(minimumDistance, dx);
                        offset = 2 * vertices[j].unitOffsetX;
                    } else {
                        minimumDistance = Math.min(minimumDistance, Math.max(dx, dy));
                        offset = dx > dy ? 2 * vertices[j].unitOffsetX : 2 * vertices[j].unitOffsetY;
                    }
                }
            }
            minimumScalingFactor = (Symbol.minimumSize + offset) / minimumDistance;
        } else if (usesX) {
            for (var i = 0; i < vertices.length; i++) {
                for (var j = 1; j < vertices.length && i != j; j++) {
                    let dx = Math.abs(vertices[i].x - vertices[j].x) + 2 * vertices[j].unitOffsetX;
                    let dy = Math.abs(vertices[i].y - vertices[j].y) + 2 * vertices[j].unitOffsetY;
                    if (dx < Symbol.minimumSize && dy >= Symbol.minimumSize) {
                        // dy already holds the minimum size constraint
                    } else if (dy < Symbol.minimumSize && dx >= Symbol.minimumSize) {
                        minimumDistance = Math.min(minimumDistance, dx);
                        offset = 2 * vertices[j].unitOffsetX;
                    } else if (dx >= dy) {
                        minimumDistance = Math.min(minimumDistance, dx);
                        offset = 2 * vertices[j].unitOffsetX;
                    }
                }
            }
            if (Number.isFinite(minimumDistance))
                minimumScalingFactor = (Symbol.minimumSize + offset) / minimumDistance;
            else minimumScalingFactor = 0;
        } else {
            for (var i = 0; i < vertices.length; i++) {
                for (var j = 1; j < vertices.length && i != j; j++) {
                    let dx = Math.abs(vertices[i].x - vertices[j].x) + 2 * vertices[j].unitOffsetX;
                    let dy = Math.abs(vertices[i].y - vertices[j].y) + 2 * vertices[j].unitOffsetY;
                    if (dx < Symbol.minimumSize && dy >= Symbol.minimumSize) {
                        minimumDistance = Math.min(minimumDistance, dy);
                        offset = 2 * vertices[j].unitOffsetY;
                    } else if (dy < Symbol.minimumSize && dx >= Symbol.minimumSize) {
                        // dx already holds the minimum size constraint
                    } else if (dy >= dx) {
                        minimumDistance = Math.min(minimumDistance, dy);
                        offset = 2 * vertices[j].unitOffsetY;
                    }
                }
            }
            if (Number.isFinite(minimumDistance))
                minimumScalingFactor = (Symbol.minimumSize + offset) / minimumDistance;
            else minimumScalingFactor = 0;
        }
        if (fromFactor < minimumScalingFactor) return minimumScalingFactor;
        let maximumScalingFactor;
        let origin = relativeToOrigin ? relativeToOrigin : this.frame.origin;
        if (usesX && usesY)
            maximumScalingFactor = Math.min(
                0.5 * Symbol.maximumSize / Math.max(Math.abs(this.frame.vertexA.x), Math.abs(this.frame.vertexB.x), Math.abs(this.frame.vertexA.y), Math.abs(this.frame.vertexB.y)),
                (Math.floor(0.5 * SymbolArt.boundingBox.width) - Math.abs(origin.x)) / Math.abs(Math.round((origin.x < 0 ? this.frame.minimumX : this.frame.maximumX) - origin.x)),
                (Math.floor(0.5 * SymbolArt.boundingBox.height) - Math.abs(origin.y)) / Math.abs(Math.round((origin.y < 0 ? this.frame.minimumY : this.frame.maximumY) - origin.y)));
        else if (usesX)
            maximumScalingFactor = Math.min(
                0.5 * Symbol.maximumSize / Math.max(Math.abs(this.frame.vertexA.x), Math.abs(this.frame.vertexB.x)),
                (Math.floor(0.5 * SymbolArt.boundingBox.width) - Math.abs(origin.x)) / Math.abs(Math.round((origin.x < 0 ? this.frame.minimumX : this.frame.maximumX) - origin.x)));
        else maximumScalingFactor = Math.min(
            0.5 * Symbol.maximumSize / Math.max(Math.abs(this.frame.vertexA.y), Math.abs(this.frame.vertexB.y)),
            (Math.floor(0.5 * SymbolArt.boundingBox.height) - Math.abs(origin.y)) / Math.abs(Math.round((origin.y < 0 ? this.frame.minimumY : this.frame.maximumY) - origin.y)));
        if (fromFactor > maximumScalingFactor)
            return maximumScalingFactor;
        return fromFactor;
    }

    getSideVertexPositions({ vertex1X, vertex1Y, vertex1, vertex2 }) {
        if (typeof vertex1X !== 'number' || Number.isNaN(vertex1X) || !Number.isFinite(vertex1X)
            || typeof vertex1Y !== 'number' || Number.isNaN(vertex1Y) || !Number.isFinite(vertex1Y)
            || !['vertexA', 'vertexB', 'vertexC', 'vertexD'].includes(vertex1)
            || !['vertexA', 'vertexB', 'vertexC', 'vertexD'].includes(vertex2))
            return null;
        let v1 = this.frame[vertex1];
        let v2 = this.frame[vertex2];
        let adjacentVertices = [];
        switch (vertex1) {
            case 'vertexA':
            case 'vertexC':
                adjacentVertices = ['vertexB', 'vertexD'].filter(a => a !== vertex2);
                break;
            case 'vertexB':
            case 'vertexD':
                adjacentVertices = ['vertexA', 'vertexC'].filter(a => a !== vertex2);
                break;
        }
        vertex1X = Math.round(vertex1X);
        vertex1Y = Math.round(vertex1Y);
        for (var index in adjacentVertices) {
            let vertex = this.frame[adjacentVertices[index]];
            // 2 times since the stretch is halved on both sides to simplify origin position calculation
            let deltaX = Math.abs(vertex.x - 2 * Math.round(vertex1X) + v1.x);
            let deltaY = Math.abs(vertex.y - 2 * Math.round(vertex1Y) + v1.y);
            if (deltaX > Symbol.maximumSize) vertex1X = v1.x + (Math.round(vertex1X) < vertex.x ? -1 : 1) * 0.5 * (Symbol.maximumSize - Math.abs(vertex.x) - Math.abs(v1.x));
            if (deltaY > Symbol.maximumSize) vertex1Y = v1.y + (Math.round(vertex1Y) < vertex.y ? -1 : 1) * 0.5 * (Symbol.maximumSize - Math.abs(vertex.y) - Math.abs(v1.y));
        }
        let vertex2X = vertex1X + v2.x - v1.x;
        let vertex2Y = vertex1Y + v2.y - v1.y;
        let dx = vertex1X - v1.x;
        let dy = vertex1Y - v1.y;
        // outer constraint (origin + delta since the origin changes with the stretch)
        if (Math.abs(this._frame.origin.x + vertex1X + dx) > Math.floor(0.5 * SymbolArt.boundingBox.width)
            || Math.abs(this._frame.origin.x + vertex2X + dx) > Math.floor(0.5 * SymbolArt.boundingBox.width)) {
            if (Math.abs(this._frame.origin.x + vertex1X + dx) > Math.abs(this._frame.origin.x + vertex2X + dx)) {
                let x = 0.5 * (Math.floor(0.5 * SymbolArt.boundingBox.width) * vertex1X / Math.abs(vertex1X) - this._frame.origin.x + v1.x);
                vertex2X += x - vertex1X;
                vertex1X = x;
            } else {
                let x = 0.5 * (Math.floor(0.5 * SymbolArt.boundingBox.width) * vertex2X / Math.abs(vertex2X) - this._frame.origin.x + v2.x);
                vertex1X += x - vertex2X;
                vertex2X = x;
            }
        }
        if (Math.abs(this._frame.origin.y + vertex1Y + dy) > Math.floor(0.5 * SymbolArt.boundingBox.height)
            || Math.abs(this._frame.origin.y + vertex2Y + dy) > Math.floor(0.5 * SymbolArt.boundingBox.height)) {
            if (Math.abs(this._frame.origin.y + vertex1Y + dy) > Math.abs(this._frame.origin.y + vertex2Y + dy)) {
                let y = 0.5 * (Math.floor(0.5 * SymbolArt.boundingBox.height) * vertex1Y / Math.abs(vertex1Y) - this._frame.origin.y + v1.y);
                vertex2Y += y - vertex1Y;
                vertex1Y = y;
            } else {
                let y = 0.5 * (Math.floor(0.5 * SymbolArt.boundingBox.height) * vertex2Y / Math.abs(vertex2Y) - this._frame.origin.y + v2.y);
                vertex1Y += y - vertex2Y;
                vertex2Y = y;
            }
        }
        if (Math.abs(Math.round(vertex1X + vertex2X)) < Symbol.minimumSize
            && Math.abs(Math.round(vertex1Y + vertex2Y)) < Symbol.minimumSize) {
            let offsetXFromMinimumSize = 0.5 * (Symbol.minimumSize - Math.abs(vertex1X + vertex2X));
            offsetXFromMinimumSize = offsetXFromMinimumSize * (vertex1X > -vertex2X ? 1 : -1);
            let offsetYFromMinimumSize = 0.5 * (Symbol.minimumSize - Math.abs(vertex1Y + vertex2Y));
            offsetYFromMinimumSize = offsetYFromMinimumSize * (vertex1Y > -vertex2Y ? 1 : -1);
            let snappingPosition = this.getSnappingLocationIfCollides(-vertex2X - offsetXFromMinimumSize, -vertex2Y - offsetYFromMinimumSize, -vertex1X - offsetXFromMinimumSize, -vertex1Y - offsetYFromMinimumSize, vertex2X, vertex2Y, Symbol.minimumSize);
            dx = snappingPosition.x - vertex2X;
            dy = snappingPosition.y - vertex2Y;
            vertex2X = snappingPosition.x;
            vertex2Y = snappingPosition.y;
            vertex1X = vertex1X + dx;
            vertex1Y = vertex1Y + dy;
        } else if (Math.abs(Math.round(2 * vertex1X)) < Symbol.minimumSize
            && Math.abs(Math.round(2 * vertex1Y)) < Symbol.minimumSize) {
            let new1X = Math.abs(Math.round(2 * vertex1X)) < Symbol.minimumSize ? Symbol.minimumSize * (vertex1X > 0 ? 0.5 : -0.5) : vertex1X;
            let new1Y = Math.abs(Math.round(2 * vertex1Y)) < Symbol.minimumSize ? Symbol.minimumSize * (vertex1Y > 0 ? 0.5 : -0.5) : vertex1Y;
            let new2X = vertex2X + new1X - vertex1X;
            let new2Y = vertex2Y + new1Y - vertex1Y;
            let snappingPosition = this.getSnappingLocationIfCollides(-new2X, -new2Y, -new1X, -new1Y, vertex1X, vertex1Y, Symbol.minimumSize);
            dx = snappingPosition.x - vertex1X;
            dy = snappingPosition.y - vertex1Y;
            vertex1X = snappingPosition.x;
            vertex1Y = snappingPosition.y;
            vertex2X = vertex2X + dx;
            vertex2Y = vertex2Y + dy;
        } else if (Math.abs(Math.round(2 * vertex2X)) < Symbol.minimumSize
            && Math.abs(Math.round(2 * vertex2Y)) < Symbol.minimumSize) {
            let new2X = Math.abs(Math.round(2 * vertex2X)) < Symbol.minimumSize ? Symbol.minimumSize * (vertex2X > 0 ? 0.5 : -0.5) : vertex2X;
            let new2Y = Math.abs(Math.round(2 * vertex2Y)) < Symbol.minimumSize ? Symbol.minimumSize * (vertex2Y > 0 ? 0.5 : -0.5) : vertex2Y;
            let new1X = vertex1X + new2X - vertex2X;
            let new1Y = vertex1Y + new2Y - vertex2Y;
            let snappingPosition = this.getSnappingLocationIfCollides(-new1X, -new1Y, -new2X, -new2Y, vertex2X, vertex2Y, Symbol.minimumSize);
            dx = snappingPosition.x - vertex2X;
            dy = snappingPosition.y - vertex2Y;
            vertex2X = snappingPosition.x;
            vertex2Y = snappingPosition.y;
            vertex1X = vertex1X + dx;
            vertex1Y = vertex1Y + dy;
        }
        let result = {};
        result[vertex1] = {
            x: vertex1X,
            y: vertex1Y
        };
        result[vertex2] = {
            x: vertex2X,
            y: vertex2Y
        };
        // check both inner and outer constraint violation
        if (Math.abs(this._frame.origin.x + vertex1X + vertex1X - v1.x) > Math.floor(0.5 * SymbolArt.boundingBox.width)
            || Math.abs(this._frame.origin.x + vertex2X + vertex2X - v2.x) > Math.floor(0.5 * SymbolArt.boundingBox.width)
            || Math.abs(this._frame.origin.y + vertex1Y + vertex1Y - v1.y) > Math.floor(0.5 * SymbolArt.boundingBox.height)
            || Math.abs(this._frame.origin.y + vertex2Y + vertex2Y - v2.y) > Math.floor(0.5 * SymbolArt.boundingBox.height)) {
            return null;
        }
        return result;
    }

    /**
     * Gets a position that does not break the constraints of the frame
     * (vertices cannot collide with one another).
     * @param {number} x desired vertex position x
     * @param {number} y desired vertex position y
     * @param {number} forVertex name of the frame vertex variable
     */
    getVertexPositionThatDoesNotCollideFromDesiredPosition({ x, y, forVertex }) {
        if (typeof x !== 'number' || Number.isNaN(x) || !Number.isFinite(x)
            || typeof y !== 'number' || Number.isNaN(y) || !Number.isFinite(y)
            || !['vertexA', 'vertexB', 'vertexC', 'vertexD'].includes(forVertex))
            return { x: null, y: null };
        let adjacentVertices = [];
        switch (forVertex) {
            case 'vertexA':
            case 'vertexC':
                adjacentVertices = ['vertexB', 'vertexD'];
                break;
            case 'vertexB':
            case 'vertexD':
                adjacentVertices = ['vertexA', 'vertexC'];
                break;
        }
        x = this.frame[forVertex].getX({ fromDesiredX: x });
        y = this.frame[forVertex].getY({ fromDesiredY: y });
        // inner constraint maximum size
        for (var index in adjacentVertices) {
            let vertex = this.frame[adjacentVertices[index]];
            let deltaX = Math.abs(vertex.x - Math.round(x));
            let deltaY = Math.abs(vertex.y - Math.round(y));
            if (deltaX > Symbol.maximumSize) x = vertex.x + (Math.round(x) < vertex.x ? -1 : 1) * Symbol.maximumSize;
            if (deltaY > Symbol.maximumSize) y = vertex.y + (Math.round(y) < vertex.y ? -1 : 1) * Symbol.maximumSize;
        }
        // outer constraint
        if (Math.abs(this._frame.origin.x + x) > Math.floor(0.5 * SymbolArt.boundingBox.width))
            x = Math.floor(0.5 * SymbolArt.boundingBox.width) * x / Math.abs(x) - this._frame.origin.x;
        if (Math.abs(this._frame.origin.x - x) > Math.floor(0.5 * SymbolArt.boundingBox.width))
            x = Math.floor(0.5 * SymbolArt.boundingBox.width) * x / Math.abs(x) + this._frame.origin.x;
        if (Math.abs(this._frame.origin.y + y) > Math.floor(0.5 * SymbolArt.boundingBox.height))
            y = Math.floor(0.5 * SymbolArt.boundingBox.height) * y / Math.abs(y) - this._frame.origin.y;
        if (Math.abs(this._frame.origin.y - y) > Math.floor(0.5 * SymbolArt.boundingBox.height))
            y = Math.floor(0.5 * SymbolArt.boundingBox.height) * y / Math.abs(y) + this._frame.origin.y;
        let conflictingVertices = [];
        if (Math.abs(Math.round(x)) < 0.5 * Symbol.minimumSize
            && Math.abs(Math.round(y)) < 0.5 * Symbol.minimumSize) {
            let vertex = this.frame[adjacentVertices[0]];
            let distance = vertex.length;
            // pass fictitious vertex along line BD, nearly at Origin, with half minimumSize,
            // to accurately check collision against the counterpart of the vertex passed in.
            conflictingVertices.push({ x: 0.001 * vertex.x / distance, y: 0.001 * vertex.y / distance, halfSize: 0.5 * Symbol.minimumSize });
        }
        // inner constraint minimum size
        for (var index in adjacentVertices) {
            let vertex = this.frame[adjacentVertices[index]];
            let deltaX = Math.abs(vertex.x - Math.round(x));
            let deltaY = Math.abs(vertex.y - Math.round(y));
            if (deltaX < Symbol.minimumSize
                && deltaY < Symbol.minimumSize) {
                conflictingVertices.push(vertex);
            }
        }
        let farthestSnappingLocation = null;
        let distanceToFarthestSnappingLocation = 0;
        for (var index in conflictingVertices) {
            let conflictingVertex = conflictingVertices[index];
            let snappingLocation = this.getSnappingLocationIfCollides(0, 0, conflictingVertex.x, conflictingVertex.y, x, y, conflictingVertex.halfSize || Symbol.minimumSize);
            if (!snappingLocation) continue;
            let distance = Math.sqrt(Math.pow(snappingLocation.x - x, 2) + Math.pow(snappingLocation.y - y, 2));
            if (!farthestSnappingLocation) {
                farthestSnappingLocation = snappingLocation;
                distanceToFarthestSnappingLocation = distance;
                continue;
            }
            if (distance > distanceToFarthestSnappingLocation) {
                distanceToFarthestSnappingLocation = distance;
                farthestSnappingLocation = snappingLocation;
            }
        }
        if (farthestSnappingLocation) {
            let correctedX = this.frame[forVertex].getX({ fromDesiredX: farthestSnappingLocation.x });
            if (Math.abs(correctedX) < Math.abs(farthestSnappingLocation.x))
                farthestSnappingLocation.x = correctedX + this.frame[forVertex].unit * (correctedX < 0 ? -1 : 1);
            let correctedY = this.frame[forVertex].getY({ fromDesiredY: farthestSnappingLocation.y });
            if (Math.abs(correctedY) < Math.abs(farthestSnappingLocation.y))
                farthestSnappingLocation.y = correctedY + this.frame[forVertex].unit * (correctedY < 0 ? -1 : 1);
        }
        if (farthestSnappingLocation) {
            // x,y and snapping point violates inner constraint maximum size
            for (var index in adjacentVertices) {
                let vertex = this.frame[adjacentVertices[index]];
                let deltaX = Math.abs(vertex.x - Math.round(farthestSnappingLocation.x));
                let deltaY = Math.abs(vertex.y - Math.round(farthestSnappingLocation.y));
                if (deltaX > Symbol.maximumSize || deltaY > Symbol.maximumSize)
                    return { x: null, y: null };
            }
        }
        // check both inner and outer constraint violation
        if (farthestSnappingLocation
            && (Math.abs(this._frame.origin.x + farthestSnappingLocation.x) > Math.floor(0.5 * SymbolArt.boundingBox.width)
                || Math.abs(this._frame.origin.x - farthestSnappingLocation.x) > Math.floor(0.5 * SymbolArt.boundingBox.width)
                || Math.abs(this._frame.origin.y + farthestSnappingLocation.y) > Math.floor(0.5 * SymbolArt.boundingBox.height)
                || Math.abs(this._frame.origin.y - farthestSnappingLocation.y) > Math.floor(0.5 * SymbolArt.boundingBox.height)))
            return { x: null, y: null };
        return farthestSnappingLocation ? farthestSnappingLocation : { x: x, y: y };
    }

    /**
     * Detects if a point C collides with point B given a size of the collision box
     * and a reference point A to snap point C (if collides) to the nearest position
     * that does not collide with B and lies on line normal to line AB passing through C.
     * Refer to documentation folder for more information.
     * @param {number} ax x component of point A
     * @param {number} ay y component of point A
     * @param {number} bx x component of point B
     * @param {number} by y component of point B
     * @param {number} cx x component of point C
     * @param {number} cy y component of point C
     * @param {number} s half the side length of the collision box 
     */
    getSnappingLocationIfCollides(ax, ay, bx, by, cx, cy, s) {
        let n = -(bx - ax) / (by - ay);
        let isHorizontalLine = by === ay;
        let xIntersectionAtTopBound = cx + (isHorizontalLine ? 0 : ((by + s - cy) / n));
        let yIntersectionAtTopBound = by + s;
        let xIntersectionAtBottomBound = cx + (isHorizontalLine ? 0 : ((by - s - cy) / n));
        let yIntersectionAtBottomBound = by - s;
        let xIntersectionAtRightBound = bx + s;
        let yIntersectionAtRightBound = cy + n * (bx - cx + s);
        let xIntersectionAtLeftbound = bx - s;
        let yIntersectionAtLeftBound = cy + n * (bx - cx - s);
        let closestIntersection = null;
        let distanceToClosestIntersection = Infinity;
        if (bx - s <= xIntersectionAtTopBound && xIntersectionAtTopBound <= bx + s) {
            let distance = Math.sqrt(Math.pow(xIntersectionAtTopBound - cx, 2) + Math.pow(yIntersectionAtTopBound - cy, 2));
            if (distance < distanceToClosestIntersection) {
                closestIntersection = { x: xIntersectionAtTopBound, y: yIntersectionAtTopBound };
                distanceToClosestIntersection = distance;
            }
        }
        if (bx - s <= xIntersectionAtBottomBound && xIntersectionAtBottomBound <= bx + s) {
            let distance = Math.sqrt(Math.pow(xIntersectionAtBottomBound - cx, 2) + Math.pow(yIntersectionAtBottomBound - cy, 2));
            if (distance < distanceToClosestIntersection) {
                closestIntersection = { x: xIntersectionAtBottomBound, y: yIntersectionAtBottomBound };
                distanceToClosestIntersection = distance;
            }
        }
        if (by - s <= yIntersectionAtRightBound && yIntersectionAtRightBound <= by + s) {
            let distance = Math.sqrt(Math.pow(xIntersectionAtRightBound - cx, 2) + Math.pow(yIntersectionAtRightBound - cy, 2));
            if (distance < distanceToClosestIntersection) {
                closestIntersection = { x: xIntersectionAtRightBound, y: yIntersectionAtRightBound };
                distanceToClosestIntersection = distance;
            }
        }
        if (by - s <= yIntersectionAtLeftBound && yIntersectionAtLeftBound <= by + s) {
            let distance = Math.sqrt(Math.pow(xIntersectionAtLeftbound - cx, 2) + Math.pow(yIntersectionAtLeftBound - cy, 2));
            if (distance < distanceToClosestIntersection) {
                closestIntersection = { x: xIntersectionAtLeftbound, y: yIntersectionAtLeftBound };
                distanceToClosestIntersection = distance;
            }
        }
        return closestIntersection;
    }

    calculateOriginFrom({ x, y }) {
        if (typeof x !== 'number' || Number.isNaN(x) || !Number.isFinite(x)
            || typeof y !== 'number' || Number.isNaN(y) || !Number.isFinite(y))
            return;
        let originDisplacement = {
            x: x - this._frame.origin.x,
            y: y - this._frame.origin.y,
        };
        let symbolArtBoundingBox = SymbolArt.boundingBox;
        let boundingBox = this._frame.boundingBox;
        let newOrigin = {};
        if (originDisplacement.x >= 0) {
            let limit = Math.floor(0.5 * symbolArtBoundingBox.width);
            let halfSize = Math.round(0.5 * boundingBox.width);
            if (x + halfSize > limit)
                newOrigin.x = limit - halfSize;
            else newOrigin.x = x;
        } else {
            let limit = -Math.floor(0.5 * symbolArtBoundingBox.width);
            let halfSize = Math.round(0.5 * boundingBox.width);
            if (x - halfSize < limit)
                newOrigin.x = limit + halfSize;
            else newOrigin.x = x;
        }
        if (originDisplacement.y >= 0) {
            let limit = Math.floor(0.5 * symbolArtBoundingBox.height);
            let halfSize = Math.round(0.5 * boundingBox.height);
            if (y + halfSize > limit)
                newOrigin.y = limit - halfSize;
            else newOrigin.y = y;
        } else {
            let limit = -Math.floor(0.5 * symbolArtBoundingBox.height);
            let halfSize = Math.round(0.5 * boundingBox.height);
            if (y - halfSize < limit)
                newOrigin.y = limit + halfSize;
            else newOrigin.y = y;
        }
        return newOrigin;
    }

    setOrigin({ x, y }) {
        if (typeof x !== 'number' || Number.isNaN(x) || !Number.isFinite(x)
            || typeof y !== 'number' || Number.isNaN(y) || !Number.isFinite(y))
            return;
        let newOrigin = this.calculateOriginFrom({ x: x, y: y });
        this._frame.origin.set({
            x: newOrigin.x,
            y: newOrigin.y
        });
    }

    flipHorizontally() {
        this._frame.vertexA.set({
            x: -this._frame.vertexA.x,
            y: this._frame.vertexA.y
        });
        this._frame.vertexB.set({
            x: -this._frame.vertexB.x,
            y: this._frame.vertexB.y
        });
    }

    flipVertically() {
        this._frame.vertexA.set({
            x: this._frame.vertexA.x,
            y: -this._frame.vertexA.y
        });
        this._frame.vertexB.set({
            x: this._frame.vertexB.x,
            y: -this._frame.vertexB.y
        });
    }

    rotate90DegreesClockwise() {
        let topLeft = this._frame.topLeftVertex;
        let topRight = this._frame.topRightVertex;
        topLeft.set({
            x: topLeft.y,
            y: -topLeft.x
        });
        topRight.set({
            x: topRight.y,
            y: -topRight.x
        });
    }

}
