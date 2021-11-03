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

class SelectionRectangle3D extends THREE.Group {

    _edgesMaterial = (() => {
        let material = Layer3D.selectedOutlineMaterial.clone();
        material.opacity = 0.9;
        material.depthTest = false;
        return material;
    })();

    _backgroundPlaneMaterial = (() => {
        let material = Layer3D.selectedOutlineMaterial.clone();
        material.opacity = 0.1;
        material.depthTest = false;
        return material;
    })();

    _edges = (() => {
        let edgesMesh = new THREE.LineSegments(
            Container3D.edgesGeometry,
            this._edgesMaterial);
        edgesMesh.renderOrder = 200;
        return edgesMesh;
    })();

    _backgroundPlane = (() => {
        let planeMesh = new THREE.Mesh(
            Container3D.planeGeometry,
            this._backgroundPlaneMaterial);
        planeMesh.renderOrder = 100;
        return planeMesh;
    })();

    constructor() {
        super();
        this.add(this._edges);
        this.add(this._backgroundPlane);
    }

    select({ fromPosition, toPosition }) {
        if (!(fromPosition instanceof THREE.Vector3) || !(toPosition instanceof THREE.Vector3)) {
            return false;
        }
        let width = Math.abs(toPosition.x - fromPosition.x);
        let height = Math.abs(toPosition.y - fromPosition.y);
        let centerX = Math.min(toPosition.x, fromPosition.x) + width / 2;
        let centerY = Math.min(toPosition.y, fromPosition.y) + height / 2;
        this.position.x = centerX;
        this.position.y = centerY;
        this.scale.x = width;
        this.scale.y = height;
        return true;
    }

    free() {
        this._edgesMaterial.dispose();
        this._backgroundPlaneMaterial.dispose();
    }

}
