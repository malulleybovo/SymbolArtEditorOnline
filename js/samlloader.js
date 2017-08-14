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
        // Temporarily disable normal logging for loading purposes
        let savedConsoleLogCallback = console.log;
        console.log = function () { }

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
        this.editor.hideInterface();

        $(mainFolder).children(':first').click().click();

        // Restore normal logging functionality
        console.log = savedConsoleLogCallback;
        return isValid;
    },
    setupElem: function (node, tag, type) {
        // Get all key="value" pairs in tag
        var pairs = tag.match(/([A-Z|a-z][A-Z|a-z|0-9|_]*[A-Z|a-z|0-9]*="[^"|\n]+")+/g);
        var rawVtces = [];
        for (var i = 0; i < pairs.length; i++) {
            var keyValue = pairs[i].split('=');
            var key = keyValue[0];
            var value = keyValue[1].match(/([^"|\n]+)/)[0].trim();

            switch (key) {
                case 'name':
                    if (!LAYER_NAME_REGEX.test(value)) {
                        console.warn(
                            '%cSAML Loader (%O):%c Layer/group element %O contains an invalid name.'
                            + ' Please rename it soon.',
                            'color: #a6cd94', this, 'color: #d5d5d5', node.elem);
                    }
                    // Use Valid or Invalid Info (wont affect much)
                    if (type == 'layer') {
                        node.elem.name = value;
                        $(node).find('span:first').text(value); // Update name of elem in node
                    }
                    else if (type == 'g' || type == 'sa') {
                        node.firstChild.elem.name = value;
                        $(node).find('span:first').text(value); // Update name of elem in node
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
                            console.warn(
                                '%cSAML Loader (%O):%c Symbol Art uses an invalid sound effect (BGE "%i").'
                                + ' Setting to default BGE.',
                                'color: #a6cd94', this, 'color: #d5d5d5', value);
                            value = 0;
                        }
                        let bgeMan = $('#player')[0].manager.bgeselect;
                        bgeMan.setActiveBGE(value);
                        bgeMan.selectmenu.setSelectedOption(value, 1);
                    }
                    break;
                case 'type':
                    if (type == 'layer') {
                        value = parseInt(value);
                        // +1 due to SAML parts format starting from 240 and not 241
                        var partIdx = partsInfo.dataArray.indexOf((value + 1).toString());
                        if (value === undefined || !this.editor.parts[partIdx]) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O uses an invalid symbol number "%i".'
                                + ' Using default symbol (symbol number 0).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value);
                            break; // Keep default
                        }
                        node.elem.part = partIdx;
                        $(node).find('img')[0].src = partsInfo.path
                            + partsInfo.dataArray[partIdx] + partsInfo.imgType;
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
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid transparency value "%i".'
                                + ' Using default value (1).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value);
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
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid top-left vertex X value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[0]);
                            break;
                        }
                        rawVtces[0] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'lty':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid top-left vertex Y value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[1]);
                            break;
                        }
                        rawVtces[1] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'lbx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid bottom-left vertex X value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[4]);
                            break;
                        }
                        rawVtces[4] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'lby':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid bottom-left vertex Y value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[5]);
                            break;
                        }
                        rawVtces[5] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'rtx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid top-right vertex X value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[2]);
                            break;
                        }
                        rawVtces[2] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'rty':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid top-right vertex Y value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[3]);
                            break;
                        }
                        rawVtces[3] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'rbx':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid bottom-right vertex X value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[6]);
                            break;
                        }
                        rawVtces[6] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
                case 'rby':
                    if (type == 'layer') {
                        value = parseInt(value);
                        if (value === undefined) {
                            // Invalid Input
                            console.warn(
                                '%cSAML Loader (%O):%c Layer/group element %O has invalid bottom-right vertex Y value "%i".'
                                + ' Using default value (%i).',
                                'color: #a6cd94', this, 'color: #d5d5d5', node.elem, value, rawVtces[7]);
                            break;
                        }
                        rawVtces[7] = (value) * CANVAS_PIXEL_SCALE;
                    }
                    break;
            }

        }
        if (rawVtces.length == 8) {
            var x = roundPosition(rawVtces[0] + rawVtces[6]) / 2;
            var y = roundPosition(rawVtces[1] + rawVtces[7]) / 2;
            node.elem.x += x; node.elem.y += y;
            for (var i = 0; i < rawVtces.length; i += 2) {
                node.elem.vertices[i] = rawVtces[i] - x;
                node.elem.vertices[i + 1] = rawVtces[i + 1] - y;
            }
            if (!isValidQuad(node.elem.vertices)) {
                console.warn(
                    '%cSAML Loader (%O):%c Layer/group element %O has an invalid shape "%O"'
                    + ' because it is not a parallelogram. '
                    + 'Top/bottom sides OR left/right sides are not equal in length.',
                    'color: #a6cd94', this, 'color: #d5d5d5', node.elem, rawVtces);
            }
        }
        if (type == 'layer') {
            this.editor.updateLayer(node.elem);
            this.editor.disableInteraction(node.elem);
        }

        function isValidQuad (v) {
            // Valid only if top/botom AND left/right sides are equal in length
            return (
                v[0] == -v[6] && v[1] == -v[7]
                && v[2] == -v[4] && v[3] == -v[5]
                );
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