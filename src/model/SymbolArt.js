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

class SymbolArt {

    static scaling = 2;
    static boundingBox = new Size({ width: 254 * SymbolArt.scaling, height: 254 * SymbolArt.scaling });

    static viewableDimensions = new Size({ width: 191 * SymbolArt.scaling, height: 95 * SymbolArt.scaling });

    static usableDimensions = new Size({ width: 254 * SymbolArt.scaling, height: 254 * SymbolArt.scaling });

    static maximumNumberOfSymbols = 225;
    static maximumNumberOfContainers = 100;

    _onTypeChanged = null;
    set onTypeChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onTypeChanged = value;
    }

    _type = SymbolArtType.symbolArt;
    get type() { return this._type }
    set type(value) {
        if (SymbolArtType.valid({ rawValue: value })) {
            this._type = value;
            let shouldUpdateDimensions = false;
            switch (this._type) {
                case SymbolArtType.symbolArt:
                    shouldUpdateDimensions = SymbolArt.viewableDimensions.width !== 191 * SymbolArt.scaling;
                    SymbolArt.viewableDimensions = new Size({ width: 191 * SymbolArt.scaling, height: 95 * SymbolArt.scaling });
                    break;
                case SymbolArtType.allianceFlag:
                    shouldUpdateDimensions = SymbolArt.viewableDimensions.width !== 31 * SymbolArt.scaling;
                    SymbolArt.viewableDimensions = new Size({ width: 31 * SymbolArt.scaling, height: 31 * SymbolArt.scaling });
                    break;
            }
            if (shouldUpdateDimensions && this._onTypeChanged) {
                this._onTypeChanged();
            }
        }
    }

    _authorId = 0;
    get authorId() { return this._authorId }
    set authorId(value) {
        if (this.isValid({ authorId: value })) this._authorId = value;
    }

    _soundOption = new SoundOption();
    get soundOption() { return this._soundOption }
    set soundOption(value) {
        if (this.isValid({ soundOption: value })) this._soundOption = value;
    }

    _helperImage = new HelperImage();
    get helperImage() { return this._helperImage }

    _root = new Container({ name: 'Untitled' });
    get root() { return this._root }

    constructor({ type = null, authorId = null, soundOption = null, helperImage = null } = {}) {
        this.type = type;
        this.authorId = authorId;
        this.soundOption = soundOption;
        this.helperImage.set({
            fromHelperImage: helperImage
        });
    }

    isValid({ soundOption = undefined, authorId = undefined } = {}) {
        if (typeof soundOption === 'undefined' && typeof authorId === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        let valid = true;
        if (valid && typeof soundOption !== 'undefined')
            valid = soundOption instanceof SoundOption;
        if (valid && typeof authorId !== 'undefined')
            valid = typeof authorId === 'number' && Number.isSafeInteger(authorId)
                && authorId >= 0;
        return valid;
    }

    findLayer({ withUuidString } = {}) {
        if (typeof withUuidString === 'undefined')
            throw new SyntaxError('function expects at least one parameter');
        if (typeof withUuidString !== 'string') return null;
        if (withUuidString === this._root.uuid) return this._root;
        return this._root.getSublayer({ withUuidString: withUuidString });
    }

    clone() {
        let clone = new SymbolArt({
            type: this.type,
            authorId: this.authorId,
            soundOption: this.soundOption,
            helperImage: this.helperImage
        });
        clone._root = this.root.clone();
        return clone;
    }

}
