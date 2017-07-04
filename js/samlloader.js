/**
 * Creates a <tt>.SAML<tt> file loader that allows parsing and loading 
 * <tt>.SAML<tt> files into the app editor.
 * @class SAMLLoader
 * @param {List} list The .SAML file to be parsed.
 */
var SAMLLoader = Class({
    initialize: function (list) {
        // TODO
        this.list = list;
        this.editor = list.editor;
    },
    /**
     * Loads the contents of a <tt>.SAML<tt> string into the editor.
     * @memberof SAMLLoader
     * @param {String} SAMLText The .SAML string to be parsed.
     * @returns {void}
     */
    load: function (SAMLText) {
        // TODO
        var xmlTags = SAMLText.match(/<\?xml([ ]+[A-Z|a-z][A-Z|a-z|0-9|_]*[A-Z|a-z|0-9]*="[^"|\n]+")*[ ]*\?>/g);
        if (xmlTags == null || xmlTags.length <= 0) {
            // No xml tag found
        }
        else {
            // Found an xml tag
            // TODO
        }

        var mainFolder = this.list.container[0].firstChild;
        var currFolder = mainFolder;

        // Get all tags found in string
        var tags = SAMLText.match(/<[^\n|<]*>/g);
        var nestingLvl = 0;
        var isValid = false;
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            if (isValid && /<layer>|<layer [^\n|<]*>/.test(tag)) { // if <layer>
                contextMenuCallback('insert layer', null, null, $(currFolder.firstChild));
                var newLayerNode = currFolder.lastChild.firstChild.lastChild;
                this.setupElem(newLayerNode, tag, 'layer');
            }
            else if (isValid && /<g>|<g [^\n|<]*>/.test(tag)) { // if <g>
                contextMenuCallback('insert group', null, null, $(currFolder.firstChild));
                currFolder = currFolder.lastChild.firstChild.lastChild;
                this.setupElem(currFolder, tag, 'g');
                nestingLvl++;
            }
            else if (isValid && /<\/([a-z|A-Z]+[0-9]?)>/.test(tag)) {
                if (/<\/g>/.test(tag)) { // if </g>
                    if (nestingLvl > 0) {
                        currFolder = currFolder.parentNode.parentNode.parentNode;
                        nestingLvl--;
                    }
                }
                else if (/<\/sa>/.test(tag)) { // if </sa>
                    break;
                }
            }
            else if (/<sa>|<sa [^\n|<]*>/.test(tag)) {
                this.setupElem(mainFolder, tag, 'sa');
                isValid = true;
            }
        }

        if (!isValid || nestingLvl > 0) alert('Loaded file is malformed, it may not be compatible.');

        this.editor.render();

        return isValid;
    },
    setupElem: function (node, tag, type) {
        // Get all key="value" pairs in tag
        var pairs = tag.match(/([A-Z|a-z][A-Z|a-z|0-9|_]*[A-Z|a-z|0-9]*="[^"|\n]+")+/g);
        for (var i = 0; i < pairs.length; i++) {
            var keyValue = pairs[i].split('=');
            var key = keyValue[0];
            var value = keyValue[1].match(/([^"|\n]+)/)[0].trim();

            switch (key) {
                case 'name':
                    if (true) {
                        // Valid Info
                        if (type == 'layer') {
                            node.elem.name = value;
                            node.firstChild.innerText = value;
                        }
                        else if (type == 'g' || type == 'sa') {
                            node.firstChild.elem.name = value;
                            node.firstChild.firstChild.innerText = value;
                        }
                    }
                    break;
                case 'visible':
                    if (type == 'layer') {
                        // TODO
                    }
                    else if (type == 'g' || type == 'sa') {
                        // TODO
                    }
                    break;
                case 'version':
                    if (type == 'sa') {
                        // TODO
                    }
                    break;
                case 'author':
                    if (type == 'sa') {
                        // TODO
                    }
                    break;
                case 'width':
                    if (type == 'sa') {
                        // TODO
                    }
                    break;
                case 'height':
                    if (type == 'sa') {
                        // TODO
                    }
                    break;
                case 'sound':
                    if (type == 'sa') {
                        value = parseInt(value);
                        if (value === undefined || value < 0 || value >= $('#player')[0].bges.length) {
                            value = 0;
                        }
                        // TODO - implement setting bge of application after deciding where this info is stored
                    }
                    break;
                case 'type':
                    if (type == 'layer') {
                        value = parseInt(value);
                        // +1 due to SAML parts format starting from 240 and not 241
                        var partIdx = partsInfo.dataArray.indexOf((value + 1).toString());
                        if (value === undefined || !this.editor.parts[partIdx]) {
                            // Invalid Input
                            break;
                        }
                        node.elem.part = partIdx;
                    }
                    break;
                case 'color':
                    if (type == 'layer') {
                        value = value.match(/([0-9|a-f|A-F]{3,6})/)[0];
                        var color = hexToRgb(value);
                        color = {
                            r: (color.r - 35 >= 0) ? color.r - 35 : 0,
                            g: (color.g - 35 >= 0) ? color.g - 35 : 0,
                            b: (color.b - 35 >= 0) ? color.b - 35 : 0,
                        }
                        value = parseInt('0x' + rgbToHex(color));
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.color = value;
                    }
                    break;
                case 'alpha':
                    if (type == 'layer') {
                        value = parseFloat(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }

                        node.elem.alpha = 0;
                        switch (value) {
                            case 0.247059: node.elem.alpha = 1; break;
                            case 0.372549: node.elem.alpha = 2; break;
                            case 0.498039: node.elem.alpha = 3; break;
                            case 0.623529: node.elem.alpha = 4; break;
                            case 0.74902: node.elem.alpha = 5; break;
                            case 0.87451: node.elem.alpha = 6; break;
                            case 1: node.elem.alpha = 7; break;
                        }
                    }
                    break;
                case 'ltx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[0] = value + 32;
                    }
                    break;
                case 'lty':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[1] = value + 32;
                    }
                    break;
                case 'lbx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[4] = value + 32;
                    }
                    break;
                case 'lby':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[5] = value + 32;
                    }
                    break;
                case 'rtx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[2] = value + 32;
                    }
                    break;
                case 'rty':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[3] = value + 32;
                    }
                    break;
                case 'rbx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[6] = value + 32;
                    }
                    break;
                case 'rby':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            break;
                        }
                        node.elem.vertices[7] = value + 32;
                    }
                    break;
            }

        }
        if (type == 'layer') {
            this.editor.updateLayer(node.elem);
            this.editor.disableInteraction(node.elem);
        }

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