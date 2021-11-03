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

class Text3D extends TROIKA.Text {

    static fontFilePath = 'res/fonts/font.woff';

    static fontSize = 22;

    static glyphSizeByUnicodeCharCode = (() => {
        let glyphsToPreload = 'abcdefghijklmnopqrstuvwxyzQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
        $.ajax({
            type: 'GET',
            url: 'res/glyphSizesByUnicodeCharacterCode.json',
            success: (jsonObject) => {
                Text3D.glyphSizeByUnicodeCharCode = jsonObject;
                TROIKA.preloadFont(
                    {
                        font: Text3D.fontFilePath,
                        characters: glyphsToPreload
                    },
                    () => { }
                )
            },
            error: () => {
                TROIKA.preloadFont(
                    {
                        font: Text3D.fontFilePath,
                        characters: glyphsToPreload
                    },
                    () => {
                        Text3D.loadGlyphsSizes();
                    }
                )
            }
        });
        return {};
    })();
    static glyphCount = 22203;
    static get allGlyphSizesLoaded() {
        return Object.keys(Text3D.glyphSizeByUnicodeCharCode).length >= Text3D.glyphCount;
    }
    static loadGlyphsSizes({ startingAtIndex = 0 } = { }) {
        if (!Number.isSafeInteger(startingAtIndex)) return;
        let numberOfLoadedItems = 0;
        let count = Math.min(Text3D.glyphCount, startingAtIndex + 980);
        for (var i = startingAtIndex; i < count; i++) {
            let testText = new Text3D();
            testText.fontSize = Text3D.fontSize;
            let charCode = i;
            testText.text = String.fromCharCode(i);
            testText.sync(_ => {
                let box = testText.geometry.boundingBox;
                Text3D.glyphSizeByUnicodeCharCode[charCode] = {
                    width: Math.abs(box.max.x - box.min.x),
                    height: Math.abs(box.max.y - box.min.y)
                };
                testText.geometry.dispose();
                testText.material.dispose();
                numberOfLoadedItems += 1;
                if (numberOfLoadedItems >= count - startingAtIndex && !Text3D.allGlyphSizesLoaded) {
                    Text3D.loadGlyphsSizes({ startingAtIndex: count });
                }
            });
        }
    }
    
    constructor() {
        super();
        this.font = Text3D.fontFilePath;
        this.fontSize = Text3D.fontSize;
    }

    widthOf({ text, fromIndex = 0, upToIndex = Infinity }) {
        if (typeof text !== 'string'
            || typeof fromIndex !== 'number'
            || Number.isNaN(fromIndex)
            || typeof upToIndex !== 'number'
            || Number.isNaN(upToIndex)) return 0;
        let width = 0;
        for (var index = fromIndex; index < upToIndex && index < text.length; index++) {
            let char = text[index];
            let glyphSize = Text3D.glyphSizeByUnicodeCharCode[char.charCodeAt(0)];
            if (glyphSize && !Number.isNaN(glyphSize.width) && Number.isFinite(glyphSize.width)) {
                width += glyphSize.width;
            } else {
                width += 20;
            }
        }
        return width;
    }

    numberOfCharactersThatFit({ width = 0, inWord = '', fromIndex = 0, upToIndex = Infinity }) {
        if (typeof inWord !== 'string'
            || typeof width !== 'number'
            || Number.isNaN(width)
            || !Number.isInteger(fromIndex)
            || Number.isNaN(fromIndex)
            || !(Number.isInteger(upToIndex) || !Number.isFinite(upToIndex))
            || Number.isNaN(upToIndex)) return 0;
        if (fromIndex < 0) fromIndex = 0;
        if (upToIndex > inWord.length) upToIndex = inWord.length;
        if (fromIndex >= upToIndex) return upToIndex;
        let pivot = Math.floor((upToIndex - 1 + fromIndex) / 2);
        if (this.widthOf({ text: inWord, fromIndex: 0, upToIndex: pivot + 1 }) > width) {
            return this.numberOfCharactersThatFit({ width: width, inWord: inWord, fromIndex: fromIndex, upToIndex: pivot });
        } else {
            return this.numberOfCharactersThatFit({ width: width, inWord: inWord, fromIndex: pivot + 1, upToIndex: upToIndex });
        }
    }

    textThatFits({ lines = 1, lineWidth = Infinity, using = '' }) {
        if (Number.isNaN(lines) || lines < 1 || typeof using !== 'string') return 0;
        let text = using.trim();
        let words = text.split(' ');
        let widthOfSpace = this.widthOf({ text: ' ' });
        let widthOfEllipsis = this.widthOf({ text: '...' });
        let ewq321 = 0;
        let wordLengths = [];
        for (var index in words) {
            let wordLength = (index > 0 ? 1 : 0) + words[index].length;
            let wordWidth = this.widthOf({ text: words[index] });
            if (wordWidth > lineWidth) {
                let charactersUsed = 0;
                while (charactersUsed < words[index].length) {
                    let charactersLeft = words[index].substr(charactersUsed);
                    let numberOfCharactersThatFit = this.numberOfCharactersThatFit({ width: lineWidth, inWord: charactersLeft });
                    wordLengths.push({
                        startIndex: ewq321,
                        endIndex: ewq321 + numberOfCharactersThatFit,
                        width: (numberOfCharactersThatFit < charactersLeft.length) ? lineWidth : this.widthOf({ text: charactersLeft })
                    });
                    charactersUsed += numberOfCharactersThatFit;
                    ewq321 += numberOfCharactersThatFit;
                }
            } else {
                wordLengths.push({
                    startIndex: ewq321,
                    endIndex: ewq321 + wordLength,
                    width: (index > 0 ? widthOfSpace : 0) + wordWidth
                });
                ewq321 += wordLength;
            }
        }
        let lineLengths = [{
            startIndex: 0,
            endIndex: 0,
            width: 0
        }];
        for (var index in wordLengths) {
            if (lineLengths[lineLengths.length - 1].width + wordLengths[index].width > lineWidth && lineLengths.length < lines) {
                lineLengths.push({
                    startIndex: wordLengths[index].startIndex,
                    endIndex: wordLengths[index].endIndex,
                    width: wordLengths[index].width
                });
            } else {
                lineLengths[lineLengths.length - 1].width += wordLengths[index].width;
                lineLengths[lineLengths.length - 1].endIndex = wordLengths[index].endIndex;
            }
        }
        if (lineLengths.length < lines) {
            return text.substr(0, lineLengths[lineLengths.length - 1].endIndex);
        }
        if (lineLengths.length === lines && lineLengths[lines - 1].width <= lineWidth) {
            return text.substr(0, lineLengths[lines - 1].endIndex);
        }
        let textInLastLine = text.substr(lineLengths[lineLengths.length - 1].startIndex, lineLengths[lineLengths.length - 1].endIndex);
        let numberOfCharactersThatFitLastLine = this.numberOfCharactersThatFit({ width: lineWidth - widthOfEllipsis, inWord: textInLastLine });
        if (numberOfCharactersThatFitLastLine === textInLastLine.length) {
            return text.substr(0, lineLengths[lineLengths.length - 1].endIndex);
        } else {
            return text.substr(0, lineLengths[lineLengths.length - 1].startIndex + numberOfCharactersThatFitLastLine) + '...';
        }
    }

}
