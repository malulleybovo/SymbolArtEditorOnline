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

class UIColorPreview extends UIView {

    get viewPath() { return 'res/templates/colorpreview.html' }

    _onTap = null;
    get onTap() { return this._onTap }
    set onTap(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onTap = value;
    }

    _opacityView = (() => {
        this.didLoad(_ => {
            this._opacityView = this.view.find('#colorpreviewopacity');
        });
    })();

    _useCountView = (() => {
        this.didLoad(_ => {
            this._useCountView = this.view.find('#colorpreviewusecount');
        });
    })();

    get loaded() {
        return this.view instanceof jQuery
            && this._opacityView instanceof jQuery
            && this._useCountView instanceof jQuery;
    }

    _color = new Color();
    get color() { return this._color }
    set color(value) {
        if (!(value instanceof Color)) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this.color = value;
            });
            return;
        }
        this._color = value;
        this.view.css('background', '#' + value.hex);
    }

    _opacity = new Opacity();
    get opacity() { return this._opacity }
    set opacity(value) {
        if (!(value instanceof Opacity)) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this.opacity = value;
            });
            return;
        }
        this._opacity = value;
        if (this._opacity.index === Opacity.upperBound) {
            this._opacityView.css('opacity', 0);
        } else {
            let intensity = Math.min(Color.upperBound, Math.max(Color.lowerBound, Math.round(255 * this._opacity.value)));
            let color = new Color({
                r: intensity,
                g: intensity,
                b: intensity
            });
            this._opacityView.css('background', '#' + color.hex);
            this._opacityView.css('opacity', 1);
        }
    }

    _layerUuids = [];
    get layerUuids() { return this._layerUuids }
    set layerUuids(value) {
        if (!Array.isArray(value) || value.filter(a => typeof a !== 'string').length !== 0) return;
        if (!this.loaded) {
            this.didLoad(_ => {
                this.layerUuids = value;
            });
            return;
        }
        this._layerUuids = value;
        this._useCountView.css('visibility', value.length === 0 ? 'hidden' : '');
        this._useCountView.siblings().css('visibility', value.length === 0 ? 'hidden' : '');
        this._useCountView.text(value.length);
    }

    constructor({ color = null, opacity = null, layerUuids = null, onTap = null } = {}) {
        super();
        this.color = color;
        this.opacity = opacity;
        this.layerUuids = layerUuids;
        this.onTap = onTap;
        this.didLoad(_ => {
            this.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this.view[0], onTap: () => {
                    if (this._onTap) {
                        this._onTap(this);
                    }
                }
            });
        });
    }

}
