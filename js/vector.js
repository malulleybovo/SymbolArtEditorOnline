var Vector = Class({
    initialize: function (x, y, z, w) {
        if (x !== undefined
            && y !== undefined
            && z !== undefined
            && w !== undefined) {
            if (x < 0) this.x = 0;
            else if (x <= 255) this.x = x;
            else this.x = 255;

            if (y < 0) this.y = 0;
            else if (y <= 255) this.y = y;
            else this.y = 255;

            if (z < 0) this.z = 0;
            else if (z <= 255) this.z = z;
            else this.z = 255;

            if (w < 0) this.w = 0;
            else if (w <= 7) this.w = w;
            else this.w = 7;
        }
        else {
            this.x = 255;
            this.y = 255;
            this.z = 255;
            this.w = 7;
        }
    }
});