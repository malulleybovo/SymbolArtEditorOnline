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

class ApplicationState {

    static shared = new ApplicationState();

    _viewMode = ViewMode.symbolEditorMode;
    _onChangeViewModeListeners = [];
    get viewMode() { return this._viewMode }
    set viewMode(value) {
        if (this._changesEnabled
            && ViewMode.valid({ rawValue: value })
            && value !== this._viewMode) {
            this._viewMode = value;
            this.trigger = TriggerType.closeWindow;
            this.trigger = TriggerType.none;
            for (var index in this._onChangeViewModeListeners) {
                this._onChangeViewModeListeners[index]();
            }
        }
    }

    _trigger = TriggerType.none;
    _onChangeTriggerListeners = [];
    get trigger() { return this._trigger }
    set trigger(value) {
        if (this._changesEnabled
            && TriggerType.valid({ rawValue: value })
            && value !== this._trigger) {
            this._trigger = value;
            for (var index in this._onChangeTriggerListeners) {
                this._onChangeTriggerListeners[index]();
            }
        }
    }

    _interaction = InteractionType.none;
    _onChangeInteractionListeners = [];
    get interaction() { return this._interaction }
    set interaction(value) {
        if (this._changesEnabled
            && InteractionType.valid({ rawValue: value })
            && value !== this._interaction) {
            this._interaction = value;
            for (var index in this._onChangeInteractionListeners) {
                this._onChangeInteractionListeners[index]();
            }
        }
    }

    _changesEnabled = true;
    get changesEnabled() { return this._changesEnabled }
    set changesEnabled(value) {
        if (typeof value === 'boolean') this._changesEnabled = value;
    }

    add({ onChangeViewModeListener, onChangeTriggerListener, onChangeInteractionListener }) {
        if (typeof onChangeViewModeListener === 'function') {
            this._onChangeViewModeListeners.push(onChangeViewModeListener);
        }
        if (typeof onChangeTriggerListener === 'function') {
            this._onChangeTriggerListeners.push(onChangeTriggerListener);
        }
        if (typeof onChangeInteractionListener === 'function') {
            this._onChangeInteractionListeners.push(onChangeInteractionListener);
        }
    }

}
