var groupCount = 0;

var Group = Class({
    initialize: function (name) {
        this.type = 'g';
        this.name = name;
        this.elems = [];
        this.activeElem = -1;
        this.parent = null;
        this.visible = true;
        this.ID = ++groupCount;
    },
    addSubGroup: function (name) {
        var newGroup = null;
        if (this.elems[this.activeElem]) {
            newGroup = new Group(name);
            newGroup.parent = this;
            this.elems.splice(this.activeElem, 0, newGroup);
        }
        else if (this.elems.length == 0) {
            this.addSubGroupAtEnd(name);
        }
        return newGroup;
    },
    remSubGroup: function () {
        var remGroup = null;
        if (this.elems[this.activeElem]) {
            remGroup = this.elems[this.activeElem];
            this.elems.splice(this.activeElem, 1);
            if (!this.elems[this.activeElem]) this.activeElem = this.elems.length - 1;
        }
        return remGroup;
    },
    addSubGroupAtEnd: function (name) {
        var newGroup = new Group(name);
        newGroup.parent = this;
        this.activeElem = this.elems.length;
        this.elems.push(newGroup);
        return newGroup;
    },
    addLayer: function (name, part, color, x, y, scale, rotation, vertices) {
        var newLayer = null;
        if (this.elems[this.activeElem]) {
            newLayer = new Layer(name, part, color, x, y, scale, rotation, vertices);
            newLayer.parent = this;
            this.elems.splice(this.activeElem, 0, newLayer);
        }
        else if (this.elems.length == 0) {
            this.addLayerAtEnd(name);
        }
        return newLayer;
    },
    remLayer: function () {
        var remLayer = null;
        if (this.elems[this.activeElem]) {
            remLayer = this.elems[this.activeElem];
            this.elems.splice(this.activeElem, 1);
            if (!this.elems[this.activeElem]) this.activeElem = this.elems.length - 1;
        }
        return remLayer;
    },
    addLayerAtEnd: function (name, part, color, x, y, scale, rotation, vertices) {
        var newLayer = new Layer(name, part, color, x, y, scale, rotation, vertices);
        newLayer.parent = this;
        this.activeElem = this.elems.length;
        this.elems.push(newLayer);
        return newLayer;
    },
    moveElem: function (src, dest) {
        var success = 0;
        if (this.elems[src] && this.elems[dest] && src != dest) {
            var srcElem = this.elems[src];
            this.elems.splice(src, 1);
            this.elems.splice(dest, 0, srcElem);
            success = 1;
        }
        return success;
    },
    toSAML: function (numTabs) {
        if (numTabs === undefined) numTabs = 0;

        var newLine = '\n\r';
        for (var i = 0; i < numTabs; i++) {
            newLine += '\t';
        }

        var saml = '<g name="' + this.name + '" visible="true">';
        for (var i = 0; i < this.elems.length; i++) {
            var elem = this.elems[i];
            saml += newLine + '\t' + elem.toSAML(++numTabs); // for elem = group/layer
        }
        saml += newLine + '</g>';
        return saml;
    }
});