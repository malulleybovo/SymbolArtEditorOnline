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
 * This file contains modified code authored and made publicly 
 * available by HybridEidolon (https://github.com/HybridEidolon)
 * at https://github.com/HybridEidolon/saredit
 */

class SARFileUtils {

    static _headerType = 'sar';
    static _compressedFlag = 0x84;
    static _uncompressedFlag = 0x04;
    static _encryptionKeyArrayBuffer = Uint8Array.of(0x09, 0x07, 0xc1, 0x2b).buffer;
    static _blowfishEncryptionContext = new BlowfishCrypto({ encryptionKeyArrayBuffer: SARFileUtils._encryptionKeyArrayBuffer });

    static _6BitColorToInGameColorMap = [
        0, 1, 3, 4, 5, 7, 8, 10,
        12, 14, 18, 18, 20, 22, 24, 27,
        29, 32, 35, 38, 41, 44, 47, 50,
        53, 56, 60, 63, 67, 71, 75, 79,
        83, 87, 91, 95, 100, 104, 109, 114,
        118, 123, 128, 133, 138, 144, 149, 155,
        160, 166, 171, 177, 183, 189, 195, 202,
        208, 214, 221, 227, 234, 241, 248, 255
    ]
    static inGameColorTo6BitColorMap = (() => {
        let map = [];
        for (var i = 0; i <= 255; i++) {
            let exactMatch = SARFileUtils._6BitColorToInGameColorMap.indexOf(i);
            if (Number.isSafeInteger(exactMatch) && exactMatch >= 0
                && exactMatch < SARFileUtils._6BitColorToInGameColorMap.length) {
                map.push(exactMatch);
                continue;
            }
            let lowerMatches = SARFileUtils._6BitColorToInGameColorMap.filter(a => a < i);
            let higherMatches = SARFileUtils._6BitColorToInGameColorMap.filter(a => a > i);
            let lowerMatch = lowerMatches[lowerMatches.length - 1];
            let higherMatch = higherMatches[0];
            if (!Number.isSafeInteger(lowerMatch)) lowerMatch = i;
            if (!Number.isSafeInteger(higherMatch)) higherMatch = Infinity;
            if (Math.abs(lowerMatch - i) < Math.abs(higherMatch - i)) {
                map.push(SARFileUtils._6BitColorToInGameColorMap.indexOf(lowerMatch));
            } else {
                map.push(SARFileUtils._6BitColorToInGameColorMap.indexOf(higherMatch));
            }
        }
        return map;
    })();
    
    static parseIntoSymbolArt({ fileDataArrayBuffer }) {
        try {
            let byteArray = new Uint8Array(fileDataArrayBuffer);
            let numberOfBytesInFile = fileDataArrayBuffer.byteLength;
            let numberOfBytesInHeaderSection = 4;
            let isFileFormattedCorretly = byteArray[0] === SARFileUtils._headerType.charCodeAt(0)
                && byteArray[1] === SARFileUtils._headerType.charCodeAt(1)
                && byteArray[2] === SARFileUtils._headerType.charCodeAt(2);
            let flag = byteArray[3];
            let isFlagValid = flag === SARFileUtils._compressedFlag || flag === SARFileUtils._uncompressedFlag;
            if (!isFileFormattedCorretly) {
                return null;
            }
            if (!isFlagValid) {
                return null;
            }
            byteArray = byteArray.slice(numberOfBytesInHeaderSection, numberOfBytesInFile);
            SARFileUtils._blowfishEncryptionContext.decrypt({ arrayBuffer: byteArray.buffer });
            let decryptedFileDataArrayBuffer = byteArray.buffer;
            if (flag === SARFileUtils._compressedFlag) {
                // Byte wise XOR by 0x95 of input from after flag bit 
                // to the maximum multiple of 8 bytes on input
                byteArray = byteArray.map(function (currVal, idx, arr) {
                    return arr[idx] ^ 0x95;
                });
                decryptedFileDataArrayBuffer = PRSFileCompressor.decompressFileData({
                    fileDataArrayBuffer: byteArray.buffer
                });
            }
            let cursor = new Cursor(decryptedFileDataArrayBuffer);
            let fileContent = cursor.parse();
            let symbolArt = SARFileUtils._convertToSymbolArt({ fileContent: fileContent });
            return symbolArt;
        } catch (e) {
            return null;
        }
    }

    static _convertToSymbolArt({ fileContent }) {
        if (!fileContent) return null;
        let soundOption = new SoundOption({ index: fileContent.soundEffect });
        let symbolArtType = null;
        switch (fileContent.sizeWidth) {
            case SymbolArtType.symbolArt.width:
                symbolArtType = SymbolArtType.symbolArt;
                break;
            case SymbolArtType.allianceFlag.width:
                symbolArtType = SymbolArtType.allianceFlag;
                break;
        }
        let symbolArt = new SymbolArt({
            type: symbolArtType,
            soundOption: soundOption,
            authorId: fileContent.authorId
        });
        symbolArt.root.name = fileContent.name;
        for (var i = fileContent.layers.length - 1; i >= 0; i--) {
            let layer = fileContent.layers[i];
            let vertices = layer.points;
            let properties = layer.props;
            let symbol = new Symbol();
            let topLeftOrigin = new Origin({
                x: Math.round(SymbolArt.scaling * 0.25 * (vertices.topLeft.x + vertices.topRight.x + vertices.bottomRight.x + vertices.bottomLeft.x)),
                y: Math.round(SymbolArt.scaling * 0.25 * (vertices.topLeft.y + vertices.topRight.y + vertices.bottomRight.y + vertices.bottomLeft.y))
            });
            let centerOrigin = new Origin({
                x: topLeftOrigin.x - 2 * Math.round(0.25 * SymbolArt.usableDimensions.width),
                y: -topLeftOrigin.y + 2 * Math.round(0.25 * SymbolArt.usableDimensions.height)
            });
            symbol.frame.origin = centerOrigin;
            symbol.frame.vertexA.set({
                x: SymbolArt.scaling * vertices.topLeft.x - topLeftOrigin.x,
                y: -(SymbolArt.scaling * vertices.topLeft.y - topLeftOrigin.y)
            });
            symbol.frame.vertexB.set({
                x: SymbolArt.scaling * vertices.topRight.x - topLeftOrigin.x,
                y: -(SymbolArt.scaling * vertices.topRight.y - topLeftOrigin.y)
            });
            symbol.color.r = SARFileUtils._6BitColorToInGameColorMap[Math.round(properties.colorR)];
            symbol.color.g = SARFileUtils._6BitColorToInGameColorMap[Math.round(properties.colorG)];
            symbol.color.b = SARFileUtils._6BitColorToInGameColorMap[Math.round(properties.colorB)];
            symbol.asset.index = properties.textureIndex;
            symbol.opacity.index = properties.transparency;
            symbol.isHidden = !properties.visible;
            if (UIApplication.shared.supports({ asset: symbol.asset })) {
                symbolArt.root.add({ sublayer: symbol });
            }
        }
        return symbolArt;
    }

    static exportAsBlob({ symbolArt }) {
        let packedData = SARFileUtils._convertFromSymbolArt({ symbolArt: symbolArt });
        let fileDataBufferArray = SARFileUtils._convertToFileDataBufferArray({ packedData: packedData });
        if (fileDataBufferArray === null) return null;
        SARFileUtils._blowfishEncryptionContext.encrypt({ arrayBuffer: fileDataBufferArray.buffer });
        let identifier = new Uint8Array(4);
        identifier[0] = SARFileUtils._headerType.charCodeAt(0);
        identifier[1] = SARFileUtils._headerType.charCodeAt(1);
        identifier[2] = SARFileUtils._headerType.charCodeAt(2);
        identifier[3] = SARFileUtils._uncompressedFlag;
        var blob = new Blob([identifier, fileDataBufferArray]);
        return blob;
    }

    static _convertFromSymbolArt({ symbolArt }) {
        if (!(symbolArt instanceof SymbolArt)) return null;
        let symbols = symbolArt.root.symbols;
        let fileContent = {
            authorId: symbolArt.authorId & 0xFFFFFFFF,
            layerCount: symbols.length & 0xFF,
            layers: symbols.map(symbol => {
                let topLeftOrigin = new Origin({
                    x: symbol.frame.origin.x + 0.5 * SymbolArt.usableDimensions.width,
                    y: -symbol.frame.origin.y + 0.5 * SymbolArt.usableDimensions.height
                });
                return {
                    points: {
                        bottomLeft: {
                            x: Math.round((symbol.frame.vertexD.x + topLeftOrigin.x) / SymbolArt.scaling),
                            y: Math.round((-symbol.frame.vertexD.y + topLeftOrigin.y) / SymbolArt.scaling)
                        },
                        bottomRight: {
                            x: Math.round((symbol.frame.vertexC.x + topLeftOrigin.x) / SymbolArt.scaling),
                            y: Math.round((-symbol.frame.vertexC.y + topLeftOrigin.y) / SymbolArt.scaling)
                        },
                        topLeft: {
                            x: Math.round((symbol.frame.vertexA.x + topLeftOrigin.x) / SymbolArt.scaling),
                            y: Math.round((-symbol.frame.vertexA.y + topLeftOrigin.y) / SymbolArt.scaling)
                        },
                        topRight: {
                            x: Math.round((symbol.frame.vertexB.x + topLeftOrigin.x) / SymbolArt.scaling),
                            y: Math.round((-symbol.frame.vertexB.y + topLeftOrigin.y) / SymbolArt.scaling)
                        }
                    },
                    props: {
                        colorR: SARFileUtils.inGameColorTo6BitColorMap[symbol.color.r],
                        colorG: SARFileUtils.inGameColorTo6BitColorMap[symbol.color.g],
                        colorB: SARFileUtils.inGameColorTo6BitColorMap[symbol.color.b],
                        colorX: 0,
                        colorY: 0,
                        colorZ: 0,
                        textureIndex: symbol.asset.index,
                        transparency: symbol.opacity.index,
                        visible: !symbol.isHidden
                    }
                }
            }).slice(0, 0xFF).reverse(),
            name: symbolArt.root.name.substr(0, 20),
            sizeHeight: symbolArt.type.height,
            sizeWidth: symbolArt.type.width,
            soundEffect: symbolArt.soundOption.index & 0xFF
        }
        return fileContent;
    }

    static _convertToFileDataBufferArray({ packedData }) {
        try {
            if (packedData === undefined
                || !Number.isSafeInteger(packedData.authorId)
                || !Number.isSafeInteger(packedData.layerCount)
                || !Number.isSafeInteger(packedData.sizeHeight)
                || !Number.isSafeInteger(packedData.sizeWidth)
                || !Number.isSafeInteger(packedData.soundEffect)
                || !Array.isArray(packedData.layers)
                || typeof packedData.name !== 'string'
                || packedData.layers.length !== packedData.layerCount) {
                return null;
            }
            let uint8arr = new Uint8Array(
                8 + (16 * packedData.layerCount) + (2 * packedData.name.length) // In Bytes
            );
            let pos = 0;
            uint8arr[pos++] = packedData.authorId & 0xFF;
            uint8arr[pos++] = (packedData.authorId >> 8) & 0xFF;
            uint8arr[pos++] = (packedData.authorId >> 16) & 0xFF;
            uint8arr[pos++] = (packedData.authorId >> 24) & 0xFF;
            uint8arr[pos++] = packedData.layerCount & 0xFF;
            uint8arr[pos++] = packedData.sizeHeight & 0xFF;
            uint8arr[pos++] = packedData.sizeWidth & 0xFF;
            uint8arr[pos++] = packedData.soundEffect & 0xFF;
            for (var i = 0; i < packedData.layers.length; i++) {
                let layer = packedData.layers[i];
                let vertices = layer.points;
                let properties = layer.props;
                uint8arr[pos++] = vertices.topLeft.x & 0xFF;
                uint8arr[pos++] = vertices.topLeft.y & 0xFF;
                uint8arr[pos++] = vertices.bottomLeft.x & 0xFF;
                uint8arr[pos++] = vertices.bottomLeft.y & 0xFF;
                uint8arr[pos++] = vertices.topRight.x & 0xFF;
                uint8arr[pos++] = vertices.topRight.y & 0xFF;
                uint8arr[pos++] = vertices.bottomRight.x & 0xFF;
                uint8arr[pos++] = vertices.bottomRight.y & 0xFF;
                // Write condensed 32 bit layer properties
                uint8arr[pos++] = ((properties.colorG & 0x3) << 6) | properties.colorR;
                uint8arr[pos++] = ((properties.colorB & 0xF) << 4) | ((properties.colorG >> 2) & 0xF);
                uint8arr[pos++] = ((properties.textureIndex & 0x7) << 5) | (properties.transparency << 2) | ((properties.colorB >> 4) & 0x3);
                uint8arr[pos++] = ((properties.visible ? 0 : 1) << 7) | ((properties.textureIndex >> 3) & 0x7F);
                // Write condensed 32 bit color X, Y, Z
                uint8arr[pos++] = ((properties.colorY & 0x3) << 6) | properties.colorX;
                uint8arr[pos++] = ((properties.colorZ & 0xF) << 4) | ((properties.colorY >> 2) & 0xF);
                uint8arr[pos++] = ((properties.colorZ >> 4) & 0x3);
                uint8arr[pos++] = 0;
            }
            // Write Symbol Art name using UTF-16
            for (var i = 0; i < packedData.name.length; i++) {
                let charCode = packedData.name.charCodeAt(i);
                // Write lowerByte
                uint8arr[pos++] = charCode & 0xFF;
                // Write upperByte
                uint8arr[pos++] = (charCode >> 8) & 0xFF;
            }
            return uint8arr;
        } catch (error) {
            return null;
        }
    }

}

class Cursor {

    static _baseRegistry = {
        'u8': cursor => cursor.readUint8(),
        'u16': cursor => cursor.readUint16(false),
        'u32': cursor => cursor.readUint32(false),
        'u16le': cursor => cursor.readUint16(true),
        'u32le': cursor => cursor.readUint32(true),
        'i8': cursor => cursor.readInt8(),
        'i16': cursor => cursor.readInt16(false),
        'i32': cursor => cursor.readInt32(false),
        'i16le': cursor => cursor.readInt16(true),
        'i32le': cursor => cursor.readInt32(true),
        'f32': cursor => cursor.readFloat32(false),
        'f64': cursor => cursor.readFloat64(false),
        'f32le': cursor => cursor.readFloat32(true),
        'f64le': cursor => cursor.readFloat64(true),
    };

    static _pointSchema = {
        x: 'u8',
        y: 'u8',
    };
    
    static _layerSchema = {
        points: {
            topLeft: Cursor._pointSchema,
            bottomLeft: Cursor._pointSchema,
            topRight: Cursor._pointSchema,
            bottomRight: Cursor._pointSchema,
        },
        props: (cursor, registry) => {
            let val1 = Cursor.parseAttribute({ cursor: cursor, schema: 'u32le', registry: registry });
            let val2 = Cursor.parseAttribute({ cursor: cursor, schema: 'u32le', registry: registry });

            let visible = (val1 >> 31) & 1 > 0 ? false : true;
            let textureIndex = (val1 >> 21) & 1023;
            let transparency = (val1 >> 18) & 7;
            let colorR = (val1 >> 0) & 63;
            let colorG = (val1 >> 6) & 63;
            let colorB = (val1 >> 12) & 63;

            let colorX = (val2 >> 0) & 63;
            let colorY = (val2 >> 6) & 63;
            let colorZ = (val2 >> 12) & 63;

            return {
                visible,
                textureIndex,
                transparency,
                colorR,
                colorG,
                colorB,
                colorX,
                colorY,
                colorZ,
            };
        },
    };
    
    static _schema = (cursor, registry) => {
        let authorId = Cursor.parseAttribute({ cursor: cursor, schema: 'u32le', registry: registry });
        let layerCount = Cursor.parseAttribute({ cursor: cursor, schema: 'u8', registry: registry });
        let sizeHeight = Cursor.parseAttribute({ cursor: cursor, schema: 'u8', registry: registry });
        let sizeWidth = Cursor.parseAttribute({ cursor: cursor, schema: 'u8', registry: registry });
        let soundEffect = Cursor.parseAttribute({ cursor: cursor, schema: 'u8', registry: registry });
        let layers = [];

        for (let i = 0; i < layerCount; i++) {
            layers.push(Cursor.parseAttribute({ cursor: cursor, schema: Cursor._layerSchema, registry: registry }));
        }

        let name = [];
        // Read rest of buffer into Symbol Art name
        let startPos = cursor.pos;
        for (let i = 0; i < (cursor.dataView.byteLength - startPos) / 2; i++) {
            try {
                let c = Cursor.parseAttribute({ cursor: cursor, schema: 'u16le', registry: registry });
                name.push(c);
            } catch (e) {
                break;
            }
        }

        let decoder = new TextDecoder('utf-16');
        let dataView = new DataView(Uint16Array.from(name).buffer);
        name = decoder.decode(dataView);

        return {
            authorId,
            layerCount,
            sizeHeight,
            sizeWidth,
            soundEffect,
            layers,
            name,
        };
    };

    /**
     * Goes through a schema object and fill its data in order based on cursor and registry
     */
    static parseAttribute({ cursor, schema, registry }) {
        switch (typeof schema) {
            case 'string': { // For positions, name, and other properties
                // References a schema/parser in the registry
                return Cursor.parseAttribute({ cursor: cursor, schema: registry[schema], registry: registry });
            }
            case 'function': { // For color
                // Cursor parse function
                return schema(cursor, registry);
            }
            case 'object': { // For the object itself and position 2D vectors
                // Schema object. Parse every attribute.
                let parsedObject = {};
                for (let k of Object.keys(schema)) {
                    let v = schema[k];
                    let value = Cursor.parseAttribute({ cursor: cursor, schema: v, registry: registry });
                    parsedObject[k] = value;
                }
                return parsedObject;
            }
        }
    }

    constructor(buffer) {
        this.buffer = buffer || new ArrayBuffer(64);
        this.dataView = new DataView(this.buffer);
        this.pos = 0;
        this.bitCounter = 0;
        this.bitValue = 0;
    }

    parse() {
        let registry = [Cursor._baseRegistry].concat([]).reduce((a, v) => Object.assign(a, v), {});
        return Cursor.parseAttribute({ cursor: this, schema: Cursor._schema, registry: registry });
    }

    _extendIfNeeded(adding) {
        if (this.pos + adding > this.buffer.byteLength) {
            let newBuffer = new ArrayBuffer(this.buffer.byteLength * 2);
            let newBufferDataView = new DataView(newBuffer);
            for (let i = 0; i < this.buffer.byteLength; i++) {
                newBufferDataView.setUint8(i, this.dataView.getUint8(i));
            }
            this.buffer = newBuffer;
            this.dataView = newBufferDataView;
        }
    }

    readBit() {
        if (this.bitCounter === 0) {
            this.bitValue = this.dataView.getUint8(this.pos);
            this.seek(1);
            this.bitCounter = 8;
        }

        let bit = this.bitValue & 1;
        this.bitCounter -= 1;
        this.bitValue = this.bitValue >>> 1;
        return bit;
    }

    readUint8() {
        let ret = this.dataView.getUint8(this.pos);
        this.seek(1);
        return ret;
    }

    readUint16(le) {
        let ret = this.dataView.getUint16(this.pos, le === true ? true : false);
        this.seek(2);
        return ret;
    }

    readUint32(le) {
        let ret = this.dataView.getUint32(this.pos, le === true ? true : false);
        this.seek(4);
        return ret;
    }

    readInt8() {
        let ret = this.dataView.getInt8(this.pos);
        this.seek(1);
        return ret;
    }

    readInt16(le) {
        let ret = this.dataView.getInt16(this.pos, le === true ? true : false);
        this.seek(2);
        return ret;
    }

    readInt32(le) {
        let ret = this.dataView.getInt32(this.pos, le === true ? true : false);
        this.seek(4);
        return ret;
    }

    readFloat32(le) {
        let ret = this.dataView.getFloat32(this.pos, le === true ? true : false);
        this.seek(4);
        return ret;
    }

    readFloat64(le) {
        let ret = this.dataView.getFloat64(this.pos, le === true ? true : false);
        this.seek(8);
        return ret;
    }

    writeUint8(v) {
        this._extendIfNeeded(1);
        this.dataView.setUint8(this.pos, v);
        this.seek(1);
    }

    writeUint16(v, le) {
        this._extendIfNeeded(2);
        this.dataView.setUint16(this.pos, v, le === true ? true : false);
        this.seek(2);
    }

    writeUint32(v, le) {
        this._extendIfNeeded(4);
        this.dataView.setUint32(this.pos, v, le === true ? true : false);
        this.seek(4);
    }

    writeInt8(v) {
        this._extendIfNeeded(1);
        this.dataView.setInt8(this.pos, v);
        this.seek(1);
    }

    writeInt16(v, le) {
        this._extendIfNeeded(2);
        this.dataView.setInt16(this.pos, v, le === true ? true : false);
        this.seek(2);
    }

    writeInt32(v, le) {
        this._extendIfNeeded(4);
        this.dataView.setInt32(this.pos, v, le === true ? true : false);
        this.seek(4);
    }

    writeFloat32(v, le) {
        this._extendIfNeeded(4);
        this.dataView.setFloat32(this.pos, v, le === true ? true : false);
        this.seek(4);
    }

    writeFloat64(v, le) {
        this._extendIfNeeded(8);
        this.dataView.setFloat64(this.pos, v, le === true ? true : false);
        this.seek(8);
    }

    seek(offset) {
        if (this.pos + offset > this.buffer.byteLength || this.pos + offset < 0) {
            throw new Error(`invalid seek to ${this.pos + offset} (by ${offset}) on buffer of length ${this.buffer.byteLength}`);
        }
        this.pos += offset;
    }

}
