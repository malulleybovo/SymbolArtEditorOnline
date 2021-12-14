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

class UIColorPicker extends UIView {

    get viewPath() { return 'res/templates/colorpicker.html' }

    _backButton = (() => {
        this.didLoad(_ => {
            this._backButton = this.view.find('#backbutton');
            this.updateState();
            this._backButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._backButton[0], onTap: () => {
                    if (this._eyeDropperOpen) {
                        this._eyeDropperOpen = false;
                    } else if (this._colorPalette.length > 0 && this._contentView.css('visibility') !== 'hidden') {
                        this._colorPaletteOpen = true;
                    } else {
                        ApplicationState.shared.trigger = TriggerType.closeWindow;
                    }
                }
            });
        });
    })();

    _colorEyeDropper = (() => {
        this.didLoad(_ => {
            this._colorEyeDropper = this.view.find('#coloreyedropper');
            this._colorEyeDropper.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._colorEyeDropper[0], onTap: () => {
                    if (this._requestedEyeDropperColors) {
                        this._requestedEyeDropperColors();
                    }
                    if (this._eyeDropperOpen) {
                        this._eyeDropperOpen = false;
                        return;
                    }
                    this._eyeDropperOpen = true;
                }
            });
        });
    })();

    _colorPreview = (() => {
        this.didLoad(_ => {
            this._colorPreview = this.view.find('#colorpreview');
            this._colorPreview.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._colorPreview[0], onTap: () => {
                    navigator.clipboard.writeText('#' + this._colorHexTextField.val());
                    this._copyHexIndicator.css('transform', 'scale(0.9)');
                    setTimeout(_ => {
                        this._copyHexIndicator.css('transform', '');
                    }, 100);
                }
            });
        });
    })();

    _copyHexIndicator = (() => {
        this.didLoad(_ => {
            this._copyHexIndicator = this.view.find('#copyhexindicator');
        });
    })();

    _colorWheelContainer = (() => {
        this.didLoad(_ => {
            this._colorWheelContainer = this.view.find('#colorwheelcontainer');
            this.updateState();
            this._colorWheelContainer.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this._colorWheelContainer[0], onPointerDown: (event) => {
                    this._updateColor({ fromColorWheelEvent: event, lastInteraction: false });
                }, onPointerMove: (event) => {
                    this._updateColor({ fromColorWheelEvent: event, lastInteraction: false });
                }, onPointerUp: () => {
                    this._updateColor({ fromColorWheelEvent: event, lastInteraction: true });
                }
            });
        });
    })();

    _colorWheel = (() => {
        this.didLoad(_ => {
            this._colorWheel = this.view.find('#colorwheel');
            this.updateState();
        });
    })();

    _colorWheelCrosshair = (() => {
        this.didLoad(_ => {
            this._colorWheelCrosshair = this.view.find('#colorwheelcrosshair');
        });
    })();

    _colorHexTextField = (() => {
        this.didLoad(_ => {
            this._colorHexTextField = this.view.find('#colorhextextfield');
            if (mobileClient) {
                this._colorHexTextField.helper = new UITextFieldHelper({
                    view: this._colorHexTextField,
                    title: 'Color HEX value:',
                    onInput: (value) => {
                        this._updateColorHex({ fromText: value });
                        this._updateColor({ fromText: value, lastInteraction: true });
                        return this._colorHexTextField.val();
                    }
                });
            }
            this.updateState();
            this._colorHexTextField.on('input', () => {
                this._updateColorHex({ fromText: this._colorHexTextField.val() });
                this._updateColor({ fromText: this._colorHexTextField.val(), lastInteraction: true });
            });
        });
    })();

    _colorValueContainer = (() => {
        this.didLoad(_ => {
            this._colorValueContainer = this.view.find('#colorvaluecontainer');
            this.updateState();
            this._colorValueContainer.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this._colorValueContainer[0], onPointerDown: (event) => {
                    this._updateColor({ fromValueSliderEvent: event, lastInteraction: false });
                }, onPointerMove: (event) => {
                    this._updateColor({ fromValueSliderEvent: event, lastInteraction: false });
                }, onPointerUp: () => {
                    this._updateColor({ fromValueSliderEvent: event, lastInteraction: true });
                }
            });
        });
    })();

    _colorValueSlider = (() => {
        this.didLoad(_ => {
            this._colorValueSlider = this.view.find('#colorvalueslider');
            this.updateState();
        });
    })();

    _colorValueSliderBar = (() => {
        this.didLoad(_ => {
            this._colorValueSliderBar = this.view.find('#colorvaluesliderbar');
        });
    })();

    _alphaContainer = (() => {
        this.didLoad(_ => {
            this._alphaContainer = this.view.find('#alphaslidercontainer');
            this.updateState();
            this._alphaContainer.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this._alphaContainer[0], onPointerDown: (event) => {
                    this._updateAlpha({ fromAlphaSliderEvent: event, lastInteraction: false });
                }, onPointerMove: (event) => {
                    this._updateAlpha({ fromAlphaSliderEvent: event, lastInteraction: false });
                }, onPointerUp: () => {
                    this._updateAlpha({ fromAlphaSliderEvent: event, lastInteraction: true });
                }
            });
        });
    })();

    _alphaSlider = (() => {
        this.didLoad(_ => {
            this._alphaSlider = this.view.find('#alphaslider');
            this.updateState();
        });
    })();

    _alphaSliderBar = (() => {
        this.didLoad(_ => {
            this._alphaSliderBar = this.view.find('#alphasliderbar');
        });
    })();

    _contentView = (() => {
        this.didLoad(_ => {
            this._contentView = this.view.find('#colorpickercontent');
        });
    })();

    _colorPaletteList = (() => {
        this.didLoad(_ => {
            this._colorPaletteList = this.view.find('#colorpalettelist');
        });
    })();

    _colorSwapIcon = (() => {
        this.didLoad(_ => {
            this._colorSwapIcon = this.view.find('#colorswapicon');
        });
    })();

    _colorEyeDropperList = (() => {
        this.didLoad(_ => {
            this._colorEyeDropperList = this.view.find('#coloreyedropperlist');
        });
    })();

    get loaded() {
        return this._backButton instanceof jQuery
            && this._colorEyeDropper instanceof jQuery
            && this._colorPreview instanceof jQuery
            && this._copyHexIndicator instanceof jQuery
            && this._colorWheelContainer instanceof jQuery
            && this._colorWheel instanceof jQuery
            && this._colorWheelCrosshair instanceof jQuery
            && this._colorHexTextField instanceof jQuery
            && this._colorValueSlider instanceof jQuery
            && this._colorValueSliderBar instanceof jQuery
            && this._alphaContainer instanceof jQuery
            && this._alphaSlider instanceof jQuery
            && this._alphaSliderBar instanceof jQuery
            && this._contentView instanceof jQuery
            && this._colorPaletteList instanceof jQuery
            && this._colorSwapIcon instanceof jQuery
            && this._colorEyeDropperList instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('left', value ? '-282pt' : '5pt');
        if (!value) {
            this.didLoad(() => {
                this._update();
            });
        } else {
            this.didLoad(() => {
                this._colorHexTextField.blur();
            });
        }
    }

    _onColorChange = null;
    set onColorChange(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onColorChange = value;
    }

    _requestedEyeDropperColors = null;
    set requestedEyeDropperColors(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._requestedEyeDropperColors = value;
    }

    _colorPalette = [];
    _selectedColorFromPalette = null;
    _hsvColor = { hue: 0.5, saturation: 0.75, value: 0.5 };
    _opacity = new Opacity({ value: 1 });
    
    set _colorPaletteOpen(value) {
        if (typeof value !== 'boolean') return;
        if (value) {
            [this._contentView, this._colorPreview, this._copyHexIndicator, this._colorEyeDropper, this._colorEyeDropperList].forEach(a => {
                a.css('visibility', 'hidden');
            });
            [this._colorPaletteList, this._colorSwapIcon].forEach(a => {
                a.css('visibility', '');
            });
        } else {
            [this._colorPaletteList, this._colorSwapIcon, this._colorEyeDropperList].forEach(a => {
                a.css('visibility', 'hidden');
            });
            [this._contentView, this._colorPreview, this._copyHexIndicator, this._colorEyeDropper].forEach(a => {
                a.css('visibility', '');
            });
        }
    }

    get _eyeDropperOpen() {
        return this._colorEyeDropperList.css('visibility') !== 'hidden';
    }
    set _eyeDropperOpen(value) {
        if (typeof value !== 'boolean') return;
        if (value) {
            [this._contentView, this._colorPreview, this._copyHexIndicator, this._colorPaletteList, this._colorSwapIcon].forEach(a => {
                a.css('visibility', 'hidden');
            });
            [this._colorEyeDropperList, this._colorEyeDropper].forEach(a => {
                a.css('visibility', '');
            });
            this._colorEyeDropper.css('color', '#ff9e2c');
        } else {
            [this._colorPaletteList, this._colorSwapIcon, this._colorEyeDropperList].forEach(a => {
                a.css('visibility', 'hidden');
            });
            [this._contentView, this._colorPreview, this._copyHexIndicator, this._colorEyeDropper].forEach(a => {
                a.css('visibility', '');
            });
            this._colorEyeDropper.css('color', '');
        }
    }

    _eyeDropperColorPreviews = [];

    _eyeDropperColors = []
    get eyeDropperColors() { return this._eyeDropperColors }
    set eyeDropperColors(value) {
        if (!Array.isArray(value)) return;
        let updatedList = value.filter(a => a && a.color instanceof Color && a.opacity instanceof Opacity);
        let differs = updatedList.length !== this._eyeDropperColors.length;
        for (var i = 0; !differs && i < updatedList.length; i++) {
            if (this._eyeDropperColors[i].color.value !== updatedList[i].color.value
                || this._eyeDropperColors[i].opacity.index !== updatedList[i].opacity.index) {
                differs = true;
                break;
            }
        }
        if (differs) {
            this._eyeDropperColors = updatedList;
            this.showEyeDropperList();
        }
    }

    constructor({ onColorChange = null, requestedEyeDropperColors = null } = { }) {
        super();
        this.onColorChange = onColorChange;
        this.requestedEyeDropperColors = requestedEyeDropperColors;
        (new UIColorPreview()); // preload component
        this.didLoad(_ => {
            this.view.gestureRecognizer = new UIGestureRecognizer({
                targetHtmlElement: this.view[0],
                preventsDefault: false,
                onPointerDown: (event) => {
                    // to prevent propagation
                }, onPointerMove: (event) => {
                    // to prevent propagation
                }, onPointerUp: (event) => {
                    // to prevent propagation
                }, onScroll: (event) => {
                    // to prevent propagation
                }
            });
        });
        ApplicationState.shared.add({
            onChangeViewModeListener: () => {
                this.updateState();
            },
            onChangeTriggerListener: () => {
                this.updateState();
            }
        });
    }

    updateState() {
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                break;
            case ViewMode.layerEditorMode:
            case ViewMode.helperImageMode:
            default:
                this.isHidden = true;
                return;
        }
        switch (ApplicationState.shared.trigger) {
            case TriggerType.openColorPicker:
                setTimeout(_ => {
                    ApplicationState.shared.trigger = TriggerType.none;
                }, 100);
                this.isHidden = false;
                break;
            case TriggerType.closeWindow:
                this.isHidden = true;
                break;
            default: break;
        }
    }

    showColorPalette({ list }) {
        if (!Array.isArray(list) || list.length === 0 || list.filter(a => !(a instanceof Symbol)).length !== 0) return;
        this._colorPaletteOpen = true;
        let occurrences = {};
        list.forEach(a => {
            if (occurrences[`${a.color.value}/${a.opacity.index}`]) {
                occurrences[`${a.color.value}/${a.opacity.index}`].layerUuids.push(a.uuid);
            } else {
                occurrences[`${a.color.value}/${a.opacity.index}`] = {
                    layerUuids: [a.uuid],
                    item: a
                }
            }
        });
        this._colorPaletteList.empty();
        this._colorPalette.forEach(a => a.remove());
        this._colorPalette = [];
        Object.values(occurrences).forEach(a => {
            let subview = new UIColorPreview({
                color: a.item.color,
                opacity: a.item.opacity,
                layerUuids: a.layerUuids,
                onTap: sender => {
                    this._selectedColorFromPalette = sender;
                    this.updateColor({
                        fromHex: sender.color.hex,
                        opacityValue: sender.opacity.value,
                        clearsColorPalette: false
                    });
                }
            });
            this._colorPalette.push(subview);
            subview.append({ to: this._colorPaletteList });
        });
    }

    showEyeDropperList() {
        let list = this._eyeDropperColors;
        if (list.length === 0) return;
        this._colorEyeDropperList.empty();
        for (var index in list) {
            let item = list[index];
            let subview;
            if (this._eyeDropperColorPreviews[index]) {
                subview = this._eyeDropperColorPreviews[index];
                subview.color = item.color;
                subview.opacity = item.opacity;
            } else {
                subview = new UIColorPreview({
                    color: item.color,
                    opacity: item.opacity,
                    layerUuids: [],
                    onTap: sender => {
                        this._updateColor({ fromText: sender.color.hex, lastInteraction: true });
                    }
                });
                this._eyeDropperColorPreviews.push(subview);
            }
            subview.append({ to: this._colorEyeDropperList });
        }
    }

    updateColor({ fromHex, opacityValue, clearsColorPalette = true }) {
        if (clearsColorPalette) {
            this._selectedColorFromPalette = null;
            this._colorPalette = [];
            this._colorPaletteList.empty();
        }
        [this._contentView, this._colorPreview, this._copyHexIndicator, this._colorEyeDropper].forEach(a => {
            a.css('visibility', '');
        });
        [this._colorPaletteList, this._colorSwapIcon, this._colorEyeDropperList].forEach(a => {
            a.css('visibility', 'hidden');
        });
        this._colorEyeDropper.css('color', '');
        this._opacity.value = opacityValue;
        this._updateAlphaSlider();
        this._updateColor({ fromText: fromHex, lastInteraction: false });
    }

    _updateColor({ fromColorWheelEvent, fromText, fromValueSliderEvent, lastInteraction }) {
        if (fromColorWheelEvent instanceof Event) {
            let originInViewportSpace = this._colorWheelContainer.offset();
            let areaHalfSize = 0.5 * parseFloat(this._colorWheelContainer.width());
            let colorWheelHalfSize = 0.5 * parseFloat(this._colorWheelContainer.find('img').width());
            let crosshairHalfSize = 0.5 * parseFloat(this._colorWheelCrosshair.outerWidth());
            let pointerCartesianCoordinateInLocalSpaceCenteredInColorWheel = {
                x: fromColorWheelEvent.clientX - originInViewportSpace.left - areaHalfSize,
                y: fromColorWheelEvent.clientY - originInViewportSpace.top - areaHalfSize,
            };
            let distanceFromOrigin = Math.sqrt(
                Math.pow(pointerCartesianCoordinateInLocalSpaceCenteredInColorWheel.x, 2) +
                Math.pow(pointerCartesianCoordinateInLocalSpaceCenteredInColorWheel.y, 2));
            let pointerPolarCoordinateInLocalSpaceCenteredInColorWheel = {
                radius: distanceFromOrigin > colorWheelHalfSize ? colorWheelHalfSize : distanceFromOrigin,
                theta: Math.atan2(pointerCartesianCoordinateInLocalSpaceCenteredInColorWheel.y, pointerCartesianCoordinateInLocalSpaceCenteredInColorWheel.x)
            };
            let hue = pointerPolarCoordinateInLocalSpaceCenteredInColorWheel.theta / (2 * Math.PI);
            if (hue < 0) hue = -hue;
            else hue = 1 - hue;
            let saturation = pointerPolarCoordinateInLocalSpaceCenteredInColorWheel.radius / colorWheelHalfSize;
            this._hsvColor = {
                hue: hue,
                saturation: saturation,
                value: this._hsvColor.value
            };
        } else if (typeof fromText === 'string') {
            let text = fromText;
            text = text.toUpperCase();
            text = text.replace(/[^A-F0-9]/g, '');
            text = text.substr(0, 6);
            if (!/^[A-F0-9]{6}$/.test(text)) return;
            this._hsvColor = this.convertToHsv({
                r: parseInt('0x' + text.substr(0, 2)),
                g: parseInt('0x' + text.substr(2, 2)),
                b: parseInt('0x' + text.substr(4, 2))
            });
        } else if (fromValueSliderEvent instanceof Event) {
            let originInViewportSpace = this._colorValueSlider.offset();
            let pointerCartesianCoordinateInLocalSpaceCenteredInSlider = {
                x: fromValueSliderEvent.clientX - originInViewportSpace.left,
                y: fromValueSliderEvent.clientY - originInViewportSpace.top,
            };
            let width = this._colorValueSlider.width();
            let rawValue = pointerCartesianCoordinateInLocalSpaceCenteredInSlider.x / width;
            this._hsvColor.value = Math.max(0, Math.min(1, rawValue));
        } else {
            return;
        }
        this._update();
        if (this._onColorChange) {
            let hexColor = this._colorHexTextField.val();
            this._onColorChange(this._selectedColorFromPalette, hexColor, this._opacity, lastInteraction);
            if (lastInteraction && this._selectedColorFromPalette && this._colorPalette) {
                this._selectedColorFromPalette.color = new Color({ hexValue: parseInt('0x' + hexColor) });
                this._selectedColorFromPalette.opacity = new Opacity({ index: this._opacity.index });
            }
        }
    }

    _updateAlpha({ fromAlphaSliderEvent, lastInteraction }) {
        let originInViewportSpace = this._alphaSlider.offset();
        let pointerCartesianCoordinateInLocalSpaceCenteredInSlider = {
            x: fromAlphaSliderEvent.clientX - originInViewportSpace.left,
            y: fromAlphaSliderEvent.clientY - originInViewportSpace.top,
        };
        let width = this._alphaSlider.width();
        let rawValue = pointerCartesianCoordinateInLocalSpaceCenteredInSlider.x / width;
        let index = Math.max(0, Math.min(1, rawValue)) * (Opacity.upperBound - Opacity.lowerBound) + Opacity.lowerBound;
        this._opacity.index = Math.round(index);
        this._updateAlphaSlider();
        if (this._onColorChange) {
            let hexColor = this._colorHexTextField.val();
            this._onColorChange(this._selectedColorFromPalette, hexColor, this._opacity, lastInteraction);
            if (lastInteraction && this._selectedColorFromPalette && this._colorPalette) {
                this._selectedColorFromPalette.color = new Color({ hexValue: parseInt('0x' + hexColor) });
                this._selectedColorFromPalette.opacity = new Opacity({ index: this._opacity.index });
            }
        }
    }

    _update() {
        this._updateCrosshair({ hue: this._hsvColor.hue, saturation: this._hsvColor.saturation, value: this._hsvColor.value });
        let rgbColor = this.convertToRgb({ hue: this._hsvColor.hue, saturation: this._hsvColor.saturation, value: this._hsvColor.value });
        let hexColor = this.convertToHex({ r: rgbColor.r, g: rgbColor.g, b: rgbColor.b });
        this._updateColorHex({ fromText: hexColor });
        this._updateColorValueSlider({ hue: this._hsvColor.hue, saturation: this._hsvColor.saturation, value: this._hsvColor.value });
        this._updateColorPreview();
        this._updateAlphaSlider();
    }

    _updateCrosshair({ hue, saturation, value }) {
        if (typeof hue !== 'number' || Number.isNaN(hue)
            || !Number.isFinite(hue) || hue < 0 || hue > 1
            || typeof saturation !== 'number' || Number.isNaN(saturation)
            || !Number.isFinite(saturation) || saturation < 0 || saturation > 1) return;
        let areaHalfSize = 0.5 * parseFloat(this._colorWheelContainer.width());
        let colorWheelHalfSize = 0.5 * parseFloat(this._colorWheelContainer.find('img').width());
        let crosshairHalfSize = 0.5 * parseFloat(this._colorWheelCrosshair.outerWidth());
        let theta = -hue * 2 * Math.PI;
        let radius = saturation * colorWheelHalfSize;
        let rectifiedCartesianCoordinate = {
            x: Math.cos(theta) * radius,
            y: Math.sin(theta) * radius
        }
        this._colorWheelCrosshair.css('left', (areaHalfSize - crosshairHalfSize + rectifiedCartesianCoordinate.x) + 'px');
        this._colorWheelCrosshair.css('top', (areaHalfSize - crosshairHalfSize + rectifiedCartesianCoordinate.y) + 'px');
        this._colorWheel.css('filter', `brightness(${value})`);
    }

    _updateColorHex({ fromText }) {
        let text = fromText;
        if (typeof text !== 'string') return;
        text = text.toUpperCase();
        text = text.replace(/[^A-F0-9]/g, '');
        text = text.substr(0, 6);
        this._colorHexTextField.val(text);
    }

    _updateColorValueSlider({ hue, saturation, value }) {
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) return;
        this._colorValueSliderBar.css('width', Math.max(0, Math.min(100, value * 100)) + '%');
        let rgbColor = this.convertToRgb({ hue: this._hsvColor.hue, saturation: this._hsvColor.saturation, value: this._hsvColor.value });
        this._colorValueSliderBar.css('background', `linear-gradient(to right, black, rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}))`);
    }

    _updateColorPreview() {
        let hexText = this._colorHexTextField.val();
        this._colorPreview.css('color', '#' + hexText);
        let value = (Math.round((this._hsvColor.value > 0.5 ? 0.3 : 0.7) * 16) % 16).toString(16);
        this._copyHexIndicator.css('color', `#${value}${value}${value}`);
    }

    _updateAlphaSlider() {
        let alpha = (this._opacity.index - Opacity.lowerBound) / (Opacity.upperBound - Opacity.lowerBound);
        if (typeof alpha !== 'number' || Number.isNaN(alpha) || !Number.isFinite(alpha)
            || alpha < 0 || alpha > 1) return;
        this._alphaSliderBar.css('width', Math.max(0, Math.min(100, alpha * 100)) + '%');
        let intensity = Math.round(alpha * 255);
        this._alphaSliderBar.css('background', `linear-gradient(to right, black, rgb(${intensity}, ${intensity}, ${intensity}))`);
    }

    convertToRgb({ hue, saturation, value }) {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(hue * 6);
        f = hue * 6 - i;
        p = value * (1 - saturation);
        q = value * (1 - f * saturation);
        t = value * (1 - (1 - f) * saturation);
        switch (i % 6) {
            case 0: r = value, g = t, b = p; break;
            case 1: r = q, g = value, b = p; break;
            case 2: r = p, g = value, b = t; break;
            case 3: r = p, g = q, b = value; break;
            case 4: r = t, g = p, b = value; break;
            case 5: r = value, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    convertToHsv({ r, g, b }) {
        let max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;
        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }
        return {
            hue: h,
            saturation: s,
            value: v
        };
    }

    convertToHex({ r, g, b }) {
        let value = (Math.min(255, Math.max(0, Math.round(r))) << 16)
            + (Math.min(255, Math.max(0, Math.round(g))) << 8)
            + (Math.min(255, Math.max(0, Math.round(b))))
        return ('000000' + value.toString(16)).slice(-6).toUpperCase();
    }

}
