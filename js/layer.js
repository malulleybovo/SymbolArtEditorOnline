var Layer = Class({
    initialize: function (name, part, color, x, y, scale, rotation, vertices, alpha) {
        this.type = 'l';
        this.name = name;
        var halfSize = 64 * 3 / 2;
        (part !== undefined) ? this.part = part : this.part = 0;
        (color !== undefined) ? this.color = color : this.color = 0xffffff;
        (scale !== undefined && scale.x !== undefined) ? this.scaleX = scale.x : this.scaleX = 1;
        (scale !== undefined && scale.y !== undefined) ? this.scaleY = scale.y : this.scaleY = 1;
        (x !== undefined) ? this.x = x : this.x = EDITOR_SIZE.x / 2;
        (y !== undefined) ? this.y = y : this.y = EDITOR_SIZE.y / 2;
        (rotation !== undefined) ? this.rotation = rotation : this.rotation = 0;
        (vertices !== undefined) ? this.vertices = vertices : this.vertices = [-halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize, halfSize, halfSize];
        (alpha !== undefined) ? this.alpha = alpha : this.alpha = 7;
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
    getAbsVertices: function () {
        var absVertices = [];
        var origin = {
            x: 960, // = 1920 / 2
            y: 480 // = 960 / 2
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
            r: (color.r + 35 < 255) ? color.r + 35 : 255,
            g: (color.g + 35 < 255) ? color.g + 35 : 255,
            b: (color.b + 35 < 255) ? color.b + 35 : 255,
        }
        var alphaVal = 0.121569;
        switch (this.alpha) {
            case 1: alphaVal = 0.247059; break;
            case 2: alphaVal = 0.372549; break;
            case 3: alphaVal = 0.498039; break;
            case 4: alphaVal = 0.623529; break;
            case 5: alphaVal = 0.74902; break;
            case 6: alphaVal = 0.87451; break;
            case 7: alphaVal = 1; break;
        }
        var saml = '<layer name="' + this.name
             // -1 due to SAML parts format starting from 240 and not 241
            + '" visible="true" type="' + (partsInfo.dataArray[this.part] - 1)
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