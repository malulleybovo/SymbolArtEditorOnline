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

class SAMLFileUtils {
    
    static async parseIntoSymbolArt({ fileDataArrayBuffer }) {
        try {
            let rawFileContent = (new Uint8Array(fileDataArrayBuffer)).reduce((a, b) => a + String.fromCharCode(b), '');
            rawFileContent = rawFileContent.replace(/[\u0080-\uffff]/g, '');
            let rawHelperImageContent = /<overlay-img [^>]*>/.exec(rawFileContent);
            rawHelperImageContent = rawHelperImageContent === null ? null : rawHelperImageContent[0];
            rawFileContent = rawFileContent.replace(/<overlay-img [^>]*>/, '');
            let fileXmlContent = null;
            let helperImageXmlContent = null;
            if (window.DOMParser) {
                let parser = new DOMParser();
                fileXmlContent = parser.parseFromString(rawFileContent, 'text/xml');
                if (rawHelperImageContent) {
                    helperImageXmlContent = parser.parseFromString(rawHelperImageContent, 'text/xml');
                }
            } else {
                fileXmlContent = new ActiveXObject('Microsoft.XMLDOM');
                fileXmlContent.async = false;
                fileXmlContent.loadXML(rawFileContent);
                if (rawHelperImageContent) {
                    helperImageXmlContent = new ActiveXObject('Microsoft.XMLDOM');
                    helperImageXmlContent.async = false;
                    helperImageXmlContent.loadXML(rawHelperImageContent);
                }
            }
            if (fileXmlContent.children[0].nodeName !== 'sa') throw new Error();
            let symbolArt = await SAMLFileUtils._convertToSymbolArt({ fileXmlContent: fileXmlContent.children[0], helperImageXmlContent: helperImageXmlContent ? helperImageXmlContent.children[0] : null });
            return symbolArt;
        } catch (e) {
            return null;
        }
    }

    static async _convertToSymbolArt({ fileXmlContent, helperImageXmlContent }) {
        if (!fileXmlContent || fileXmlContent.nodeName !== 'sa') return null;
        let symbolArt = new SymbolArt();
        for (var key in fileXmlContent.attributes) {
            let name = fileXmlContent.attributes[key].nodeName;
            let value = fileXmlContent.attributes[key].nodeValue;
            switch (name) {
                case 'name':
                    symbolArt.root.name = value;
                    break;
                case 'visible':
                    symbolArt.root.isHidden = value === 'false';
                    break;
                case 'author':
                    symbolArt.authorId = parseInt(value);
                    break;
                case 'width':
                    symbolArt.type = SymbolArtType.from({ width: parseInt(value) });
                    break;
                case 'sound':
                    symbolArt.soundOption = new SoundOption({ index: parseInt(value) });
                    break;
                default: break;
            }
        }
        for (var index = fileXmlContent.children.length - 1; index >= 0; index--) {
            let xmlContent = fileXmlContent.children[index];
            switch (xmlContent.nodeName) {
                case 'g':
                    let layer = SAMLFileUtils._convertToContainer({ fileXmlContent: xmlContent });
                    if (layer instanceof Container) {
                        let layerStack = [layer];
                        while (layerStack.length > 0) {
                            let item = layerStack.pop();
                            if (item instanceof Symbol || symbolArt.root.canInsert({ sublayer: item })) {
                                symbolArt.root.add({ sublayer: item });
                            } else if (item instanceof Container) {
                                layerStack.push(...item.sublayers.reverse());
                            }
                        }
                    }
                    break;
                case 'layer':
                    let symbol = SAMLFileUtils._convertToSymbol({ fileXmlContent: xmlContent });
                    if (symbol instanceof Symbol) {
                        symbolArt.root.add({ sublayer: symbol });
                    }
                    break;
                default: break;
            }
        }
        if (helperImageXmlContent !== null && helperImageXmlContent.nodeName === 'overlay-img') {
            let rawSource = null, version = 1;
            let positionX = 0, positionY = 0, scale = 1, rotationAngle = 0, opacity = 1;
            for (var key in helperImageXmlContent.attributes) {
                let name = helperImageXmlContent.attributes[key].nodeName;
                let value = helperImageXmlContent.attributes[key].nodeValue;
                switch (name) {
                    case 'version':
                        version = Number.isSafeInteger(parseInt(value)) ? parseInt(value) : 1;
                        break;
                    case 'src':
                        rawSource = value;
                        break;
                    case 'pos-x':
                        positionX = parseFloat(value);
                        positionX = SymbolArt.viewableDimensions.width * (positionX - 960) / 576;
                        break;
                    case 'pos-y':
                        positionY = parseFloat(value);
                        positionY = -SymbolArt.viewableDimensions.height * (positionY - 480) / 288;
                        break;
                    case 'scale':
                        scale = parseFloat(value);
                        scale = scale * SymbolArt.scaling / 3;
                        break;
                    case 'rot':
                        rotationAngle = -parseFloat(value);
                        break;
                    case 'alpha':
                        opacity = parseFloat(value);
                        break;
                    case 'green-screen':
                        symbolArt.helperImage.greenScreenEnabled = value !== 'false';
                        break;
                    default: break;
                }
            }
            try {
                let utf8 = atob(rawSource.replace(/^data:.*;base64,/, ''));
                if (!(/[^\x00-\x7f]/.test(utf8))) throw new Error();
                await symbolArt.helperImage.setImage({ fromBase64EncodedString: rawSource });
                symbolArt.helperImage.positionX = positionX;
                symbolArt.helperImage.positionY = positionY;
                symbolArt.helperImage.scaleX = scale;
                symbolArt.helperImage.scaleY = scale;
                symbolArt.helperImage.rotationAngle = rotationAngle;
                symbolArt.helperImage.opacity = opacity;
            } catch (_) {
                symbolArt.helperImage.resetImage();
            }
        }
        return symbolArt;
    }

    static _convertToContainer({ fileXmlContent }) {
        if (!fileXmlContent || fileXmlContent.nodeName !== 'g') return null;
        let container = new Container();
        for (var key in fileXmlContent.attributes) {
            let name = fileXmlContent.attributes[key].nodeName;
            let value = fileXmlContent.attributes[key].nodeValue;
            switch (name) {
                case 'name':
                    container.name = value;
                    break;
                case 'visible':
                    container.isHidden = value === 'false';
                    break;
                default: break;
            }
        }
        for (var index = fileXmlContent.children.length - 1; index >= 0; index--) {
            let xmlContent = fileXmlContent.children[index];
            switch (xmlContent.nodeName) {
                case 'g':
                    let layer = SAMLFileUtils._convertToContainer({ fileXmlContent: xmlContent });
                    if (layer instanceof Container) {
                        let layerStack = [layer];
                        while (layerStack.length > 0) {
                            let item = layerStack.pop();
                            if (item instanceof Symbol || container.canInsert({ sublayer: item })) {
                                container.add({ sublayer: item });
                            } else if (item instanceof Container) {
                                layerStack.push(...item.sublayers.reverse());
                            }
                        }
                    }
                    break;
                case 'layer':
                    let symbol = SAMLFileUtils._convertToSymbol({ fileXmlContent: xmlContent });
                    if (symbol instanceof Symbol) {
                        container.add({ sublayer: symbol });
                    }
                    break;
                default: break;
            }
        }
        if (container.sublayers.length === 0) return null;
        return container;
    }

    static _convertToSymbol({ fileXmlContent }) {
        if (!fileXmlContent || fileXmlContent.nodeName !== 'layer') return null;
        let vertexAttributes = ['ltx', 'lty', 'lbx', 'lby', 'rtx', 'rty', 'rbx', 'rby'];
        for (var index in vertexAttributes) {
            if (!fileXmlContent.attributes[vertexAttributes[index]]) return null;
        }
        let origin = new Origin({
            x: SymbolArt.scaling * 0.25 * [0, 'ltx', 'lbx', 'rtx', 'rbx'].reduce((a, b) => a + parseInt(fileXmlContent.attributes[b].nodeValue)),
            y: -SymbolArt.scaling * 0.25 * [0, 'lty', 'lby', 'rty', 'rby'].reduce((a, b) => a + parseInt(fileXmlContent.attributes[b].nodeValue))
        });
        let symbol = new Symbol();
        symbol.frame.origin.set({ x: origin.x, y: origin.y });
        symbol.frame.vertexA.set({
            x: SymbolArt.scaling * parseInt(fileXmlContent.attributes['ltx'].nodeValue) - origin.x,
            y: -SymbolArt.scaling * parseInt(fileXmlContent.attributes['lty'].nodeValue) - origin.y,
        });
        symbol.frame.vertexB.set({
            x: SymbolArt.scaling * parseInt(fileXmlContent.attributes['rtx'].nodeValue) - origin.x,
            y: -SymbolArt.scaling * parseInt(fileXmlContent.attributes['rty'].nodeValue) - origin.y,
        });
        for (var key in fileXmlContent.attributes) {
            let name = fileXmlContent.attributes[key].nodeName;
            let value = fileXmlContent.attributes[key].nodeValue;
            switch (name) {
                case 'visible':
                    symbol.isHidden = value === 'false';
                    break;
                case 'type':
                    symbol.asset.index = parseInt(value);
                    break;
                case 'color':
                    symbol.color = new Color({ hexValue: parseInt('0x' + value.replace('#', '')) });
                    break;
                case 'alpha':
                    switch (parseFloat(value)) {
                        case 0:
                        case 225: // Backward-compatibility
                            symbol.opacity.index = 0; break;
                        case 0.247059:
                        case 193:
                            symbol.opacity.index = 1; break;
                        case 0.372549:
                        case 161:
                            symbol.opacity.index = 2; break;
                        case 0.498039:
                        case 129:
                            symbol.opacity.index = 3; break;
                        case 0.623529:
                        case 97:
                            symbol.opacity.index = 4; break;
                        case 0.74902:
                        case 65:
                            symbol.opacity.index = 5; break;
                        case 0.87451:
                        case 33:
                            symbol.opacity.index = 6; break;
                        case 1:
                            symbol.opacity.index = 7; break;
                    }
                    break;
                default: break;
            }
        }
        return symbol;
    }

    static exportAsBlob({ symbolArt }) {
        let xmlContent = SAMLFileUtils._convertFromSymbolArt({ symbolArt: symbolArt });
        if (xmlContent === null) return null;
        var blob = new Blob([xmlContent], { type: 'text/plain;charset=utf-8' });
        return blob;
    }

    static _convertFromSymbolArt({ symbolArt }) {
        if (!(symbolArt instanceof SymbolArt)) return null;
        let content = `<?xml version="1.0" encoding="utf-8"?>`;
        if (symbolArt.helperImage.imageData) {
            content += `<overlay-img src="${symbolArt.helperImage.imageData}" pos-x="${(symbolArt.helperImage.positionX * 576 / SymbolArt.viewableDimensions.width) + 960}" pos-y="${(symbolArt.helperImage.positionY * 288 / -SymbolArt.viewableDimensions.height) + 480}" scale="${symbolArt.helperImage.scaleX * 3 / SymbolArt.scaling}" rot="${-symbolArt.helperImage.rotationAngle}" alpha="${symbolArt.helperImage.opacity}" green-screen="${symbolArt.helperImage.greenScreenEnabled ? 'true' : 'false'}"/>`;
        }
        content += `<sa name="${symbolArt.root.name}" visible="${symbolArt.root.isHidden ? 'false' : 'true'}" version="1" author="${symbolArt.authorId}" width="${symbolArt.type.width}" height="${symbolArt.type.height}" sound="${symbolArt.soundOption.index}">`;
        let layers = symbolArt.root.sublayers;
        for (var index = layers.length - 1; index >= 0; index--) {
            let layer = layers[index];
            if (layer instanceof Container) {
                content += SAMLFileUtils._convertFromContainer({ container: layer });
            } else if (layer instanceof Symbol) {
                content += SAMLFileUtils._convertFromSymbol({ symbol: layer });
            }
        }
        content += `</sa>`;
        return content;
    }

    static _convertFromContainer({ container }) {
        if (!(container instanceof Container)) return ``;
        let content = `<g name="${container.name}" visible="${container.isHidden ? 'false' : 'true'}">`;
        let layers = container.sublayers;
        for (var index = layers.length - 1; index >= 0; index--) {
            let layer = layers[index];
            if (layer instanceof Container) {
                content += SAMLFileUtils._convertFromContainer({ container: layer });
            } else if (layer instanceof Symbol) {
                content += SAMLFileUtils._convertFromSymbol({ symbol: layer });
            }
        }
        content += `</g>`;
        return content;
    }

    static _convertFromSymbol({ symbol }) {
        if (!(symbol instanceof Symbol)) return ``;
        let frame = symbol.frame;
        let origin = frame.origin;
        let topLeftX = Math.round((frame.vertexA.x + origin.x) / SymbolArt.scaling);
        let topLeftY = Math.round((frame.vertexA.y + origin.y) / -SymbolArt.scaling);
        let topRightX = Math.round((frame.vertexB.x + origin.x) / SymbolArt.scaling);
        let topRightY = Math.round((frame.vertexB.y + origin.y) / -SymbolArt.scaling);
        let bottomRightX = Math.round((frame.vertexC.x + origin.x) / SymbolArt.scaling);
        let bottomRightY = Math.round((frame.vertexC.y + origin.y) / -SymbolArt.scaling);
        let bottomLeftX = Math.round((frame.vertexD.x + origin.x) / SymbolArt.scaling);
        let bottomLeftY = Math.round((frame.vertexD.y + origin.y) / -SymbolArt.scaling);
        let alpha = 0;
        switch (symbol.opacity.index) {
            case 0:
                alpha = 0; break;
            case 1:
                alpha = 0.247059; break;
            case 2:
                alpha = 0.372549; break;
            case 3:
                alpha = 0.498039; break;
            case 4:
                alpha = 0.623529; break;
            case 5:
                alpha = 0.74902; break;
            case 6:
                alpha = 0.87451; break;
            case 7:
                alpha = 1; break;
        }
        return `<layer name="${symbol.name}" visible="${symbol.isHidden ? 'false' : 'true'}" type="${symbol.asset.index}" color="#${symbol.color.hex}" alpha="${alpha}" ltx="${topLeftX}" lty="${topLeftY}" lbx="${bottomLeftX}" lby="${bottomLeftY}" rtx="${topRightX}" rty="${topRightY}" rbx="${bottomRightX}" rby="${bottomRightY}"/>`;
    }
    
}
