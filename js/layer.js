var Layer = Class({
    initialize: function (name, part, color, x, y, scale, rotation, vertices) {
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
    },
    update: function (quad) {
        this.part = quad.partNum;
        this.color = quad.tint;
        this.x = quad.x;
        this.y = quad.y;
        this.scaleX = quad.scale.x;
        this.scaleY = quad.scale.y;
        this.rotation = quad.rotation;
        for (var i = 0; i < quad.vertices.length; i++) {
            this.vertices[i] = quad.vertices[i];
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
        var color = hexToRgb(this.color.toString(16));
        color = {
            r: (color.r + 35 < 255) ? color.r + 35 : 255,
            g: (color.g + 35 < 255) ? color.g + 35 : 255,
            b: (color.b + 35 < 255) ? color.b + 35 : 255,
        }
        var saml = '<layer name="' + this.name
            + '" visible="true" type="' + (this.part - 1)
            + '" color="#' + rgbToHex(color)
            + '" alpha="' + 1
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