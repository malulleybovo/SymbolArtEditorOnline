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

class UIHelperImageSettings extends UIView {

    get viewPath() { return 'res/templates/helperimagesettings.html' }

    _onChange = null;
    set onChange(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onChange = value;
    }

    _backButton = (() => {
        this.didLoad(_ => {
            this._backButton = this.view.find('#backbutton');
            this.updateState();
            this._backButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._backButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.closeWindow;
                }
            });
        });
    })();

    _highlightSwitch = (() => {
        this.didLoad(_ => {
            this._highlightSwitch = this.view.find('#highlightswitch');
            this.updateState();
            this._highlightSwitch.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._highlightSwitch[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.focusHelperImage;
                }
            });
        });
    })();

    _highlightSwitchIndicator = (() => {
        this.didLoad(_ => {
            this._highlightSwitchIndicator = this.view.find('#highlightswitchindicator');
            this.updateState();
        });
    })();

    _greenScreenSwitch = (() => {
        this.didLoad(_ => {
            this._greenScreenSwitch = this.view.find('#greenscreenswitch');
            this.updateState();
            this._greenScreenSwitch.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._greenScreenSwitch[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.toggledHelperImageGreenScreen;
                }
            });
        });
    })();

    _greenScreenSwitchIndicator = (() => {
        this.didLoad(_ => {
            this._greenScreenSwitchIndicator = this.view.find('#greenscreenswitchindicator');
            this.updateState();
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

    get loaded() {
        return this._backButton instanceof jQuery
            && this._highlightSwitch instanceof jQuery
            && this._highlightSwitchIndicator instanceof jQuery
            && this._greenScreenSwitch instanceof jQuery
            && this._greenScreenSwitchIndicator instanceof jQuery
            && this._alphaContainer instanceof jQuery
            && this._alphaSlider instanceof jQuery
            && this._alphaSliderBar instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('left', value ? '-282pt' : '5pt');
    }
    
    _isHighlighted = false;
    _greenScreenEnabled = false;
    _opacity = 1;

    constructor({ onChange }) {
        super();
        this.onChange = onChange;
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
            case ViewMode.helperImageMode:
                break;
            case ViewMode.symbolEditorMode:
            case ViewMode.layerEditorMode:
            default:
                this.isHidden = true;
                return;
        }
        switch (ApplicationState.shared.trigger) {
            case TriggerType.openHelperImageSettings:
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

    updateHighlight({ state }) {
        if (typeof state !== 'boolean') return;
        if (!this.loaded) {
            this.didLoad(() => {
                this.updateHighlight({ state: state });
            });
            return;
        }
        this._isHighlighted = state;
        let padding = 0.5 * (this._highlightSwitch.height() - this._highlightSwitchIndicator.height());
        let left = padding + this._highlightSwitchIndicator.width();
        this._highlightSwitch.css('background', this._isHighlighted ? '#ff9e2c' : '');
        this._highlightSwitchIndicator.css('left', this._isHighlighted ? `${left}px` : `${padding}px`);
    }

    updateGreenScreen({ state }) {
        if (typeof state !== 'boolean') return;
        if (!this.loaded) {
            this.didLoad(() => {
                this.updateGreenScreen({ state: state });
            });
            return;
        }
        this._greenScreenEnabled = state;
        let padding = 0.5 * (this._greenScreenSwitch.height() - this._greenScreenSwitchIndicator.height());
        let left = padding + this._greenScreenSwitchIndicator.width();
        this._greenScreenSwitch.css('background', this._greenScreenEnabled ? '#ff9e2c' : '');
        this._greenScreenSwitchIndicator.css('left', this._greenScreenEnabled ? `${left}px` : `${padding}px`);
    }

    updateAlpha({ value }) {
        if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) return;
        if (!this.loaded) {
            this.didLoad(() => {
                this.updateAlpha({ value: value });
            });
            return;
        }
        this._opacity = Math.max(0, Math.min(1, value));
        this._updateAlphaSlider();
    }
    
    _updateAlpha({ fromAlphaSliderEvent, lastInteraction }) {
        let originInViewportSpace = this._alphaSlider.offset();
        let pointerCartesianCoordinateInLocalSpaceCenteredInSlider = {
            x: fromAlphaSliderEvent.clientX - originInViewportSpace.left,
            y: fromAlphaSliderEvent.clientY - originInViewportSpace.top,
        };
        let width = this._alphaSlider.width();
        let rawValue = pointerCartesianCoordinateInLocalSpaceCenteredInSlider.x / width
        this._opacity = Math.max(0, Math.min(1, rawValue));
        this._updateAlphaSlider();
        if (this._onChange) {
            this._onChange(this._opacity, lastInteraction);
        }
    }
    
    _updateAlphaSlider() {
        if (!this.loaded) {
            this.didLoad(() => {
                this._updateAlphaSlider();
            })
            return;
        }
        let alpha = this._opacity;
        if (typeof alpha !== 'number' || Number.isNaN(alpha) || !Number.isFinite(alpha)
            || alpha < 0 || alpha > 1) return;
        this._alphaSliderBar.css('width', Math.max(0, Math.min(100, alpha * 100)) + '%');
        let intensity = Math.round(alpha * 255);
        this._alphaSliderBar.css('background', `linear-gradient(to right, black, rgb(${intensity}, ${intensity}, ${intensity}))`);
    }
    
}
