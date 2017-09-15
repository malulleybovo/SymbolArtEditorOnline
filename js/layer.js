var layerCount = 0;

var Layer = Class({
    initialize: function (name, part, color, x, y, scale, rotation, vertices, alpha, IDless) {
        this.type = 'l';
        this.name = name;
        var halfSize = 64 * 3 / 2;
        (part !== undefined) ? this.part = part : this.part = Layer.defaultSymbol;
        (color !== undefined) ? this.color = color : this.color = Layer.defaultColor;
        (scale !== undefined && scale.x !== undefined) ? this.scaleX = scale.x : this.scaleX = 1;
        (scale !== undefined && scale.y !== undefined) ? this.scaleY = scale.y : this.scaleY = 1;
        (x !== undefined) ? this.x = x : this.x = EDITOR_SIZE.x / 2;
        (y !== undefined) ? this.y = y : this.y = EDITOR_SIZE.y / 2;
        (rotation !== undefined) ? this.rotation = rotation : this.rotation = 0;
        (vertices !== undefined) ? this.vertices = vertices : this.vertices = [-halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize, halfSize, halfSize];
        (alpha !== undefined) ? this.alpha = alpha : this.alpha = 7;
        this.visible = true;
        if (!IDless) this.ID = ++layerCount;
    },
    update: function (quad) {
        this.color = quad.tint;
        this.x = quad.x;
        this.y = quad.y;
        this.scaleX = quad.scale.x;
        this.scaleY = quad.scale.y;
        this.rotation = quad.rotation;
        for (var i = 0; i < quad.vertices.length; i++) {
            this.vertices[i] = quad.vertices[i];
        }
        this.alpha = 0;
        switch (quad.alpha) {
            case 0.247059: this.alpha = 1; break;
            case 0.372549: this.alpha = 2; break;
            case 0.498039: this.alpha = 3; break;
            case 0.623529: this.alpha = 4; break;
            case 0.74902: this.alpha = 5; break;
            case 0.87451: this.alpha = 6; break;
            case 1: this.alpha = 7; break;
        }
    },
    pasteFrom: function (layerToPasteFrom) {
        if (layerToPasteFrom.type != 'l' || typeof layerToPasteFrom.name !== 'string'
            || typeof layerToPasteFrom.part !== 'number'
            || typeof layerToPasteFrom.color !== 'number'
            || typeof layerToPasteFrom.scaleX !== 'number'
            || typeof layerToPasteFrom.scaleY !== 'number'
            || typeof layerToPasteFrom.x !== 'number'
            || typeof layerToPasteFrom.y !== 'number'
            || typeof layerToPasteFrom.rotation !== 'number'
            || Object.prototype.toString.call(layerToPasteFrom.vertices) !== '[object Array]'
            || layerToPasteFrom.vertices.length != this.vertices.length
            || typeof layerToPasteFrom.alpha !== 'number'
            || typeof layerToPasteFrom.visible !== 'boolean') {
            console.log(
            '%cLayer:%c Could not paste to layer %O because info provided (%O) is invalid.',
            'color: #a6cd94', 'color: #d5d5d5', this, layerToPasteFrom);
            return;
        }
        this.name = layerToPasteFrom.name;
        this.part = layerToPasteFrom.part;
        this.color = layerToPasteFrom.color;
        this.scaleX = layerToPasteFrom.scaleX;
        this.scaleY = layerToPasteFrom.scaleY;
        this.x = layerToPasteFrom.x;
        this.y = layerToPasteFrom.y;
        this.rotation = layerToPasteFrom.rotation;
        this.alpha = layerToPasteFrom.alpha;
        this.visible = layerToPasteFrom.visible;
        for (var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = layerToPasteFrom.vertices[i];
        }
    },
    getAbsVertices: function () {
        var absVertices = [];
        var origin = {
            x: EDITOR_SIZE.x / 2, // = 1920 / 2
            y: EDITOR_SIZE.y / 2 // = 960 / 2
        };
        for (var i = 0; i < this.vertices.length; i += 2) {
            var vx = Math.round((this.x - origin.x + this.scaleX * this.vertices[i]) / CANVAS_PIXEL_SCALE);
            var vy = Math.round((this.y - origin.y + this.scaleY * this.vertices[i + 1]) / CANVAS_PIXEL_SCALE);
            absVertices.push(vx);
            absVertices.push(vy);
        }
        return absVertices;
    },
    toSAML: function (numTabs) { // numTabs not used
        var absVtx = this.getAbsVertices();
        var color = hexToRgb(Math.round(this.color).toString(16));
        color = {
            r: revertPseudoCubicSplineColor(color.r),
            g: revertPseudoCubicSplineColor(color.g),
            b: revertPseudoCubicSplineColor(color.b),
        }
        // Convert alpha so it is compatible with the third-party
        // .NET Symbol Art Editor desktop application (refer to README)
        var alphaVal = 1 + 32 * (7 - this.alpha);
        /* same as:
        switch (this.alpha) {
            case 0: alphaVal = 225; break;
            case 1: alphaVal = 193; break;
            case 2: alphaVal = 161; break;
            case 3: alphaVal = 129; break;
            case 4: alphaVal = 97; break;
            case 5: alphaVal = 65; break;
            case 6: alphaVal = 33; break;
            case 7: alphaVal = 1; break;
        }*/

        var newLine = '\n';
        for (var i = 0; i < numTabs; i++) {
            newLine += '\t';
        }

        var saml = newLine + '<layer name="' + this.name
             // -1 due to SAML parts format starting from 240 and not 241
            + '" visible="' + this.visible
            + '" type="' + (partsInfo.dataArray[this.part] - 1)
            + '" color="#' + rgbToHex(color)
            + '" alpha="' + alphaVal
            + '" ltx="' + absVtx[0]
            + '" lty="' + absVtx[1]
            + '" lbx="' + absVtx[4]
            + '" lby="' + absVtx[5]
            + '" rtx="' + absVtx[2]
            + '" rty="' + absVtx[3]
            + '" rbx="' + absVtx[6]
            + '" rby="' + absVtx[7]
            + '"/>';
        return saml;

        function hexToRgb(hex) {
            if (hex.length < 6) {
                var initialLen = hex.length;
                for (var i = 0; i < 6 - initialLen; i++) {
                    hex = '0' + hex;
                }
            }
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        function rgbToHex(color) {
            return componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
        }
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
    }
});
/* Static Fields */
Layer.defaultSymbol = 0;
Layer.defaultColor = 0xffffff;
/* Static Functions */
Layer.setDefaultSymbol = function (num) {
    if (num === undefined || typeof num !== 'number'
        || num < 0 || num >= partsInfo.dataArray.length) return;
    Layer.defaultSymbol = num;
}
Layer.setDefaultColor = function (hex) {
    if (hex === undefined || typeof hex !== 'number'
        || hex < 0 || hex >= 0xffffff) return;
    Layer.defaultColor = hex;
}