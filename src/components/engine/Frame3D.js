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

class Frame3D extends THREE.Group {
    
    static material = new THREE.MeshBasicMaterial({
        color: 0x3c3c3c,
        transparent: true,
        depthTest: false
    });

    outlineMaterial = new THREE.LineBasicMaterial({
        color: 0x808080,
        transparent: true,
        depthTest: false
    });

    _topBorder = new THREE.Mesh(Container3D.planeGeometry, Frame3D.material);

    _leftBorder = new THREE.Mesh(Container3D.planeGeometry, Frame3D.material);

    _bottomBorder = new THREE.Mesh(Container3D.planeGeometry, Frame3D.material);

    _rightBorder = new THREE.Mesh(Container3D.planeGeometry, Frame3D.material);

    _edges = new THREE.LineSegments(Container3D.edgesGeometry, this.outlineMaterial);
    get edges() { return this._edges }
    
    constructor({ outerBorderSize, innerBorderSize }) {
        super();
        if (!(outerBorderSize instanceof Size))
            throw new TypeError(`Expected "outerBorderSize" of type Size but got ${outerBorderSize.constructor.name}`);
        if (!(innerBorderSize instanceof Size))
            throw new TypeError(`Expected "innerBorderSize" of type Size but got ${outerBorderSize.constructor.name}`);
        this.renderOrder = 100;
        this._edges.renderOrder = 200;
        this.add(this._topBorder);
        this.add(this._bottomBorder);
        this.add(this._leftBorder);
        this.add(this._rightBorder);
        this.add(this._edges);
        this.updateBorders({ outerBorderSize: outerBorderSize, innerBorderSize: innerBorderSize });
    }

    updateBorders({ outerBorderSize, innerBorderSize }) {
        if (!(outerBorderSize instanceof Size)) return;
        if (!(innerBorderSize instanceof Size)) return;
        let outerWidth = outerBorderSize.width;
        let outerHeight = outerBorderSize.height;
        let innerWidth = outerWidth < innerBorderSize.width ? outerWidth : innerBorderSize.width;
        let innerHeight = outerHeight < innerBorderSize.height ? outerHeight : innerBorderSize.height;

        let needsOffsetX = Math.round(innerBorderSize.width / SymbolArt.scaling) % 2 === 1;
        let needsOffsetY = Math.round(innerBorderSize.height / SymbolArt.scaling) % 2 === 1;
        let offsetX = needsOffsetX ? 1 : 0;
        let offsetY = needsOffsetY ? -1 : 0;

        this._topBorder.scale.x = outerWidth;
        this._topBorder.scale.y = 0.5 * (outerHeight - innerHeight);
        this._topBorder.position.y = 0.5 * (this._topBorder.scale.y + innerHeight) + offsetY;

        this._bottomBorder.scale.x = outerWidth;
        this._bottomBorder.scale.y = 0.5 * (outerHeight - innerHeight);
        this._bottomBorder.position.y = -0.5 * (this._bottomBorder.scale.y + innerHeight) + offsetY;

        this._leftBorder.scale.y = outerHeight;
        this._leftBorder.scale.x = 0.5 * (outerWidth - innerWidth);
        this._leftBorder.position.x = -0.5 * (this._leftBorder.scale.x + innerWidth) + offsetX;

        this._rightBorder.scale.y = outerHeight;
        this._rightBorder.scale.x = 0.5 * (outerWidth - innerWidth);
        this._rightBorder.position.x = 0.5 * (this._rightBorder.scale.x + innerWidth) + offsetX;

        this._edges.scale.x = innerWidth + 0.2; // Offset due to edge thickness
        this._edges.scale.y = innerHeight + 0.2;
        this._edges.position.x = offsetX;
        this._edges.position.y = offsetY;
    }

}
