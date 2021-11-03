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

class UIActionBar extends UIView {

    get viewPath() { return 'res/templates/actionbar.html' }

    _centerButton = (() => {
        this.didLoad(_ => {
            this._centerButton = this.view.find('#centerbutton');
            this.updateState();
            this._centerButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._centerButton[0], onTap: () => {
                    this.toggleActionBar();
                }
            });
        });
    })();

    _northButton = (() => {
        this.didLoad(_ => {
            this._northButton = this.view.find('#northbutton');
            this._northButton.enabledState = {};
            this._northButton.enabledState[ViewMode.symbolEditorMode] = true;
            this._northButton.enabledState[ViewMode.layerEditorMode] = true;
            this._northButton.enabledState[ViewMode.helperImageMode] = true;
            this._northButton.highlightState = {};
            this._northButton.highlightState[ViewMode.symbolEditorMode] = false;
            this._northButton.highlightState[ViewMode.layerEditorMode] = false;
            this._northButton.highlightState[ViewMode.helperImageMode] = false;
            this.updateState();
            this._northButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._northButton[0], onTap: () => {
                    this.onTapNorthButton();
                }
            });
        });
    })();

    _northEastButton = (() => {
        this.didLoad(_ => {
            this._northEastButton = this.view.find('#northeastbutton');
            this._northEastButton.enabledState = {};
            this._northEastButton.enabledState[ViewMode.symbolEditorMode] = true;
            this._northEastButton.enabledState[ViewMode.layerEditorMode] = true;
            this._northEastButton.enabledState[ViewMode.helperImageMode] = true;
            this._northEastButton.highlightState = {};
            this._northEastButton.highlightState[ViewMode.symbolEditorMode] = false;
            this._northEastButton.highlightState[ViewMode.layerEditorMode] = false;
            this._northEastButton.highlightState[ViewMode.helperImageMode] = false;
            this.updateState();
            this._northEastButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._northEastButton[0], onTap: () => {
                    this.onTapNorthEastButton();
                }
            });
        });
    })();

    _eastButton = (() => {
        this.didLoad(_ => {
            this._eastButton = this.view.find('#eastbutton');
            this._eastButton.enabledState = {};
            this._eastButton.enabledState[ViewMode.symbolEditorMode] = true;
            this._eastButton.enabledState[ViewMode.layerEditorMode] = true;
            this._eastButton.enabledState[ViewMode.helperImageMode] = true;
            this._eastButton.highlightState = {};
            this._eastButton.highlightState[ViewMode.symbolEditorMode] = false;
            this._eastButton.highlightState[ViewMode.layerEditorMode] = false;
            this._eastButton.highlightState[ViewMode.helperImageMode] = false;
            this.updateState();
            this._eastButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._eastButton[0], onTap: () => {
                    this.onTapEastButton();
                }
            });
        });
    })();

    get loaded() {
        return this._centerButton instanceof jQuery
            && this._northButton instanceof jQuery
            && this._northEastButton instanceof jQuery
            && this._eastButton instanceof jQuery;
    }

    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('left', value ? '-120pt' : '10pt');
    }

    _previousViewMode = null;

    _maximumNumberOfHintsShownForAddition = 3;
    _maximumNumberOfHintsShownForCopying = 3;
    _maximumNumberOfHintsShownForGrouping = 3;

    constructor() {
        super();
        ApplicationState.shared.add({
            onChangeViewModeListener: () => {
                this.updateState();
            },
            onChangeTriggerListener: () => {
                this.updateState();
                if (ApplicationState.shared.trigger === TriggerType.layerAddition
                    && this._maximumNumberOfHintsShownForAddition > 0) {
                    this._maximumNumberOfHintsShownForAddition -= 1;
                    new UIHint({ text: 'TAP & HOLD' });
                }
                if (ApplicationState.shared.trigger === TriggerType.layerCopyPaste
                    && this._maximumNumberOfHintsShownForCopying > 0) {
                    this._maximumNumberOfHintsShownForCopying -= 1;
                    new UIHint({ text: 'TAP & HOLD' });
                }
                if (ApplicationState.shared.trigger === TriggerType.groupLayers
                    && this._maximumNumberOfHintsShownForGrouping > 0) {
                    this._maximumNumberOfHintsShownForGrouping -= 1;
                    new UIHint({ text: 'TAP & HOLD & DRAG' });
                }
            }
        });
    }

    setNorthButton({ enabled, forViewMode }) {
        if (typeof enabled !== 'boolean'
            || !ViewMode.valid({ rawValue: forViewMode })) return;
        let mode = forViewMode;
        let newState = enabled;
        this.didLoad(() => {
            this._northButton.enabledState[mode] = newState;
            this.updateState();
        });
    }

    setNorthEastButton({ enabled, forViewMode }) {
        if (typeof enabled !== 'boolean'
            || !ViewMode.valid({ rawValue: forViewMode })) return;
        let mode = forViewMode;
        let newState = enabled;
        this.didLoad(() => {
            this._northEastButton.enabledState[mode] = newState;
            this.updateState();
        });
    }

    setEastButton({ enabled, forViewMode }) {
        if (typeof enabled !== 'boolean'
            || !ViewMode.valid({ rawValue: forViewMode })) return;
        let mode = forViewMode;
        let newState = enabled;
        this.didLoad(() => {
            this._eastButton.enabledState[mode] = newState;
            this.updateState();
        });
    }

    highlightNorthButton({ state, forViewMode }) {
        if (typeof state !== 'boolean'
            || !ViewMode.valid({ rawValue: forViewMode })) return;
        if (!this.loaded) {
            this.didLoad(() => {
                this.highlightNorthButton({ state: state, forViewMode: forViewMode });
            });
            return;
        }
        if (this._northButton.highlightState[forViewMode] === state) return;
        this._northButton.highlightState[forViewMode] = state;
        this.updateState();
    }

    highlightNorthEastButton({ state, forViewMode }) {
        if (typeof state !== 'boolean'
            || !ViewMode.valid({ rawValue: forViewMode })) return;
        if (!this.loaded) {
            this.didLoad(() => {
                this.highlightNorthEastButton({ state: state, forViewMode: forViewMode });
            });
            return;
        }
        if (this._northEastButton.highlightState[forViewMode] === state) return;
        this._northEastButton.highlightState[forViewMode] = state;
        this.updateState();
    }

    highlightEastButton({ state, forViewMode }) {
        if (typeof state !== 'boolean'
            || !ViewMode.valid({ rawValue: forViewMode })) return;
        if (!this.loaded) {
            this.didLoad(() => {
                this.highlightEastButton({ state: state, forViewMode: forViewMode });
            });
            return;
        }
        if (this._eastButton.highlightState[forViewMode] === state) return;
        this._eastButton.highlightState[forViewMode] = state;
        this.updateState();
    }

    resetHighlightState({ forViewMode }) {
        if (!ViewMode.valid({ rawValue: forViewMode })) return;
        let viewMode = forViewMode;
        this.didLoad(() => {
            let buttons = [this._northButton, this._northEastButton, this._eastButton];
            for (var index in buttons) {
                buttons[index].highlightState[viewMode] = false;
            }
        });
    }

    onTapNorthButton() {
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                ApplicationState.shared.trigger = TriggerType.openAssetPicker;
                break;
            case ViewMode.layerEditorMode:
                ApplicationState.shared.trigger = (ApplicationState.shared.trigger === TriggerType.layerAddition || ApplicationState.shared.trigger === TriggerType.layerCopyPaste) ? TriggerType.none : TriggerType.layerAddition;
                break;
            case ViewMode.helperImageMode:
                ApplicationState.shared.trigger = TriggerType.openHelperImageOptionsView;
                break;
            default: break;
        }
    }

    onTapNorthEastButton() {
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                ApplicationState.shared.trigger = TriggerType.openColorPicker;
                break;
            case ViewMode.layerEditorMode:
                ApplicationState.shared.trigger = ApplicationState.shared.trigger === TriggerType.groupLayers ? TriggerType.none : TriggerType.groupLayers;
                break;
            case ViewMode.helperImageMode:
                ApplicationState.shared.trigger = TriggerType.openHelperImageSettings;
                break;
            default: break;
        }
    }

    onTapEastButton() {
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                ApplicationState.shared.trigger = TriggerType.focusSelection;
                break;
            case ViewMode.layerEditorMode:
                ApplicationState.shared.trigger = ApplicationState.shared.trigger === TriggerType.layerDeletion ? TriggerType.none : TriggerType.layerDeletion;
                break;
            case ViewMode.helperImageMode:
                ApplicationState.shared.trigger = TriggerType.discardHelperImage;
                break;
            default: break;
        }
    }

    updateEnabledState() {
        if (!this.loaded) return;
        let viewMode = ApplicationState.shared.viewMode;
        let buttons = [this._northButton, this._northEastButton, this._eastButton];
        for (var index in buttons) {
            let enabled = buttons[index].enabledState[viewMode];
            buttons[index].css('opacity', enabled ? 1 : 0.25);
            buttons[index].css('pointer-events', enabled ? '' : 'none');
        }
    }

    updateHighlightState() {
        if (!this.loaded) return;
        let viewMode = ApplicationState.shared.viewMode;
        let buttons = [this._northButton, this._northEastButton, this._eastButton];
        for (var index in buttons) {
            let enabled = buttons[index].highlightState[viewMode];
            let currentColor = buttons[index].css('color');
            buttons[index].css('color', enabled ? '#ff9e2c' : (currentColor === '#ff9e2c' || currentColor === 'rgb(255, 158, 44)' ? '' : currentColor));
        }
    }

    showSymbolEditorActionBar() {
        if (!this.loaded) return;
        this._centerButton.find('i').removeClass().addClass('fas fa-vector-square fa-fw');
        this._northButton.removeClass().addClass('fas fa-shapes fa-fw');
        this._northEastButton.removeClass().addClass('fas fa-palette fa-fw');
        this._eastButton.removeClass().addClass('fas fa-low-vision fa-fw');
        this.updateEnabledState();
        this.updateHighlightState();
    }

    showLayerEditorActionBar() {
        if (!this.loaded) return;
        this._centerButton.find('i').removeClass().addClass('fas fa-layer-group fa-fw');
        this._northButton.removeClass().addClass('fas fa-plus fa-fw');
        this._northEastButton.removeClass().addClass('fas fa-object-group fa-fw');
        this._eastButton.removeClass().addClass('fas fa-trash fa-fw');
        this.updateEnabledState();
        this.updateHighlightState();
    }

    showHelperImageActionBar() {
        if (!this.loaded) return;
        this._centerButton.find('i').removeClass().addClass('fas fa-image fa-fw');
        this._northButton.removeClass().addClass('fas fa-plus fa-fw');
        this._northEastButton.removeClass().addClass('fas fa-cog fa-fw');
        this._eastButton.removeClass().addClass('fas fa-trash fa-fw');
        this.updateEnabledState();
        this.updateHighlightState();
    }

    updateState() {
        if (!this.loaded) {
            this.didLoad(_ => {
                this.updateState();
            });
            return;
        }
        this.resetHighlightState({ forViewMode: ViewMode.layerEditorMode });
        if (this._previousViewMode !== ApplicationState.shared.viewMode) {
            this._previousViewMode = ApplicationState.shared.viewMode;
            this._centerButton.css('transform', 'scale(0.95)');
            setTimeout(_ => {
                this._centerButton.css('transform', '');
            }, 100);
        }
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                this.showSymbolEditorActionBar();
                break;
            case ViewMode.layerEditorMode:
                this.showLayerEditorActionBar();
                this.isHidden = false;
                break;
            case ViewMode.helperImageMode:
                this.showHelperImageActionBar();
                break;
            default: break;
        }
        switch (ApplicationState.shared.trigger) {
            case TriggerType.closeWindow:
                setTimeout(_ => {
                    ApplicationState.shared.trigger = TriggerType.none;
                }, 100);
                this.isHidden = false;
                break;
            case TriggerType.openColorPicker:
            case TriggerType.openAssetPicker:
            case TriggerType.openHelperImageSettings:
                this.isHidden = true;
                break;
            case TriggerType.layerAddition:
            case TriggerType.layerCopyPaste:
                this.highlightNorthButton({ state: true, forViewMode: ViewMode.layerEditorMode });
                break;
            case TriggerType.groupLayers:
                this.highlightNorthEastButton({ state: true, forViewMode: ViewMode.layerEditorMode });
                break;
            case TriggerType.layerDeletion:
                this.highlightEastButton({ state: true, forViewMode: ViewMode.layerEditorMode });
                break;
            default: break
        }
    }

    toggleActionBar() {
        if (ApplicationState.shared.interaction !== InteractionType.none) return;
        ApplicationState.shared.trigger = TriggerType.none;
        switch (ApplicationState.shared.viewMode) {
            case ViewMode.symbolEditorMode:
                ApplicationState.shared.viewMode = ViewMode.layerEditorMode;
                break;
            case ViewMode.layerEditorMode:
                ApplicationState.shared.viewMode = ViewMode.symbolEditorMode;
                break;
            case ViewMode.helperImageMode:
                ApplicationState.shared.viewMode = ViewMode.symbolEditorMode;
                break;
            default: break;
        }
        this.updateState();
    }

}
