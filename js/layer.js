var Layer = Class({
    initialize: function (name, part, color, x, y, scale, rotation, vertices, alpha) {
        this.type = 'l';
        this.name = name;
        (part !== undefined) ? this.part = part : this.part = 241;
        (color !== undefined) ? this.color = color : this.color = 0xffffff;
        (scale !== undefined && scale.x !== undefined) ? this.scaleX = scale.x : this.scaleX = 1;
        (scale !== undefined && scale.y !== undefined) ? this.scaleY = scale.y : this.scaleY = 1;
        (x !== undefined) ? this.x = x : this.x = (1920 - (this.scaleX * 64)) / 2;
        (y !== undefined) ? this.y = y : this.y = (960 - (this.scaleY * 64)) / 2;
        (rotation !== undefined) ? this.rotation = rotation : this.rotation = 0;
        (vertices !== undefined) ? this.vertices = vertices : this.vertices = [0, 0, 64, 0, 0, 64, 64, 64];
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
        this.alpha = 0.121569;
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
            absVertices.push(this.x - origin.x + this.scaleX * this.vertices[i]);
            absVertices.push(this.y - origin.y + this.scaleY * this.vertices[i + 1]);
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
        var saml = '<layer name="' + this.name
            + '" visible="true" type="' + (this.part - 1)
            + '" color="#' + rgbToHex(color)
            + '" alpha="' + this.alpha
            + '" ltx="' + absVtx[2]
            + '" lty="' + absVtx[3]
            + '" lbx="' + absVtx[6]
            + '" lby="' + absVtx[7]
            + '" rtx="' + absVtx[0]
            + '" rty="' + absVtx[1]
            + '" rbx="' + absVtx[4]
            + '" rby="' + absVtx[5]
            + '"/>';
        return saml;

        function hexToRgb(hex) {
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