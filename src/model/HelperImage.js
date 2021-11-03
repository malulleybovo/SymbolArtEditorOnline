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

class HelperImage {

    _positionX = 0;
    get positionX() { return this._positionX }
    set positionX(value) {
        if (!this.isValid({ number: value })) return;
        this._positionX = value;
    }

    _positionY = 0;
    get positionY() { return this._positionY }
    set positionY(value) {
        if (!this.isValid({ number: value })) return;
        this._positionY = value;
    }

    _minimumSize = 50;
    get minimumScaleFactor() {
        return this._minimumSize / Math.min(this._imageWidth, this._imageHeight);
    }

    _maximumSize = 2000;
    get maximumScaleFactor() {
        return this._maximumSize / Math.max(this._imageWidth, this._imageHeight);
    }

    _scaleX = 1;
    get scaleX() { return this._scaleX }
    set scaleX(value) {
        if (!this.isValid({ number: value })) return;
        this._scaleX = Math.max(this.minimumScaleFactor, Math.min(this.maximumScaleFactor, value));
    }

    _scaleY = 1;
    get scaleY() { return this._scaleY }
    set scaleY(value) {
        if (!this.isValid({ number: value })) return;
        this._scaleY = Math.max(this.minimumScaleFactor, Math.min(this.maximumScaleFactor, value));
    }

    _rotationAngle = 0;
    get rotationAngle() { return this._rotationAngle }
    set rotationAngle(value) {
        if (!this.isValid({ number: value })) return;
        this._rotationAngle = value;
    }

    _imageColors = null;
    _imageWidth = this._minimumSize;
    _imageHeight = this._minimumSize;
    _imageData = null;
    get imageData() { return this._imageData }

    _opacity = 1;
    get opacity() { return this._opacity }
    set opacity(value) {
        if (!this.isValid({ number: value })) return;
        this._opacity = Math.max(0, Math.min(1, value));
    }

    _greenScreenEnabled = false;
    get greenScreenEnabled() { return this._greenScreenEnabled }
    set greenScreenEnabled(value) {
        if (this.isValid({ greenScreenEnabled: value })) this._greenScreenEnabled = value;
    }

    resetImage() {
        this._imageData = null;
        this.positionX = 0;
        this.positionY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotationAngle = 0;
    }

    async setImage({ fromImageFileDataArrayBuffer, imageFileExtension, fromBase64EncodedString }) {
        if (fromImageFileDataArrayBuffer instanceof ArrayBuffer
            && ['jpg', 'jpeg', 'svg', 'gif', 'bmp', 'webp', 'ico', 'png'].includes(imageFileExtension)) {
            let binary = '';
            let bytes = new Uint8Array(fromImageFileDataArrayBuffer);
            let bufferLength = bytes.byteLength;
            for (var i = 0; i < bufferLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            let encodedData = window.btoa(binary);
            if (imageFileExtension === 'svg') imageFileExtension = 'svg+xml';
            this._imageData = 'data:image/' + imageFileExtension + ';base64,' + encodedData;
        } else if (typeof fromBase64EncodedString === 'string'
            && /^data:image\/((jpg)|(jpeg)|(svg\+xml)|(gif)|(bmp)|(webp)|(ico)|(png));base64,/.test(fromBase64EncodedString)) {
            this._imageData = fromBase64EncodedString;
        } else {
            return new Promise((resolve, reject) => {
                reject();
            });
        }
        this._imageWidth = this._minimumSize;
        this._imageHeight = this._minimumSize;
        this.positionX = 0;
        this.positionY = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this.rotationAngle = 0;
        let promise = new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = () => {
                this._imageWidth = image.width;
                this._imageHeight = image.height;
                let defaultSize = 200;
                let scale;
                if (Math.max(image.width, image.height) <= defaultSize) {
                    scale = defaultSize / Math.max(image.width, image.height);
                } else if (image.width >= image.height) {
                    scale = defaultSize / image.width;
                } else {
                    scale = defaultSize / image.height;
                }
                this.scaleX = scale;
                this.scaleY = scale;
                resolve();
            };
            image.src = this._imageData;
        });
        this._imageColors = null;
        return promise;
    }

    async imageColors() {
        let promise = new Promise((resolve, reject) => {
            if (this._imageColors !== null) {
                resolve(this._imageColors);
                return;
            }
            if (this._imageData === null) {
                resolve([]);
                return;
            }
            this._imageColors = [];
            let image = new Image();
            image.onload = _ => {
                let canvas = document.createElement('canvas');
                let widthRatio = (SymbolArt.viewableDimensions.width / SymbolArt.scaling) / image.width;
                let heightRatio = (SymbolArt.viewableDimensions.height / SymbolArt.scaling) / image.height;
                let ratio = Math.min(widthRatio, heightRatio);
                canvas.width = ratio * image.width;
                canvas.height = ratio * image.height;
                let context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width / ratio, canvas.height / ratio, 0, 0, canvas.width, canvas.height);
                let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                let colorSet = new Set();
                let colors = [];
                for (var i = 0; imageData.data && i < imageData.data.length - 3; i += 4) {
                    let id = `${SARFileUtils.inGameColorTo6BitColorMap[imageData.data[i]]} ${SARFileUtils.inGameColorTo6BitColorMap[imageData.data[i + 1]]} ${SARFileUtils.inGameColorTo6BitColorMap[imageData.data[i + 2]]}`;
                    if (!colorSet.has(id) && imageData.data[i + 3] > 25) {
                        colorSet.add(id);
                        colors.push(new Color({
                            r: imageData.data[i],
                            g: imageData.data[i + 1],
                            b: imageData.data[i + 2]
                        }));
                    }
                }
                let maximumDifference = 0;
                while (colors.length > 100 && maximumDifference < 200) {
                    maximumDifference += 10;
                    let mainColors = [];
                    let skippedIndices = [];
                    for (var i = 0; i < colors.length; i++) {
                        if (skippedIndices.includes(i)) continue;
                        let r = colors[i].r;
                        let g = colors[i].g;
                        let b = colors[i].b;
                        let number = 1;
                        for (var j = i + 1; j < colors.length; j++) {
                            if (skippedIndices.includes(j)) continue;
                            let difference = Math.cbrt(
                                Math.pow(colors[i].r - colors[j].r, 2)
                                + Math.pow(colors[i].g - colors[j].g, 2)
                                + Math.pow(colors[i].b - colors[j].b, 2));
                            if (difference < maximumDifference) {
                                r += colors[j].r;
                                g += colors[j].g;
                                b += colors[j].b;
                                number += 1;
                                skippedIndices.push(j);
                            }
                        }
                        colors[i].r = Math.round(r / number);
                        colors[i].g = Math.round(g / number);
                        colors[i].b = Math.round(b / number);
                        mainColors.push(colors[i]);
                    }
                    colors = mainColors;
                }
                this._imageColors = colors;
                resolve(colors);
            };
            image.src = this._imageData;
        });
        return promise;
    }

    isValid({ greenScreenEnabled = undefined, number = undefined } = {}) {
        if (typeof greenScreenEnabled === 'undefined' && typeof number === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof greenScreenEnabled !== 'undefined')
            valid = typeof greenScreenEnabled === 'boolean';
        if (valid && typeof number !== 'undefined')
            valid = typeof number === 'number'
                && !Number.isNaN(number)
                && Number.isFinite(number);
        return valid;
    }

    set({ fromHelperImage }) {
        if (!(fromHelperImage instanceof HelperImage)) return;
        this._imageHeight = fromHelperImage._imageHeight;
        this._imageWidth = fromHelperImage._imageWidth;
        this.positionX = fromHelperImage.positionX;
        this.positionY = fromHelperImage.positionY;
        this.scaleX = fromHelperImage.scaleX;
        this.scaleY = fromHelperImage.scaleY;
        this.rotationAngle = fromHelperImage.rotationAngle;
        this._imageData = fromHelperImage.imageData;
        this.opacity = fromHelperImage.opacity;
        this.greenScreenEnabled = fromHelperImage.greenScreenEnabled;
    }

}
