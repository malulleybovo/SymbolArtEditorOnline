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

class HistoryState {

    static shared = new HistoryState();
    
    _history = [];
    _historyIndex = 0;
    _historyCapacity = 50;

    _cooldownInMilliseconds = 300;
    _onCooldown = false;

    get current() {
        return this._history[this._historyIndex];
    }

    get isAtMostRecentState() {
        return this._historyIndex === this._history.length - 1;
    }

    get isAtOldestState() {
        return this._historyIndex === 0;
    }
    
    _historyStarted = false;

    _onChangeStateListeners = [];
    _onHistoryStartListeners = [];

    add({ onChangeStateListener, onHistoryStartListener }) {
        if (typeof onChangeStateListener === 'function') {
            this._onChangeStateListeners.push(onChangeStateListener);
        } else if (typeof onHistoryStartListener === 'function') {
            this._onHistoryStartListeners.push(onHistoryStartListener);
        }
    }

    pushHistory({ data }) {
        this._history.splice(this._historyIndex + 1, this._history.length);
        this._history.splice(0, Math.max(0, this._history.length - this._historyCapacity));
        this._history.push(data);
        this._historyIndex = this._history.length - 1;
        for (var index in this._onChangeStateListeners) {
            this._onChangeStateListeners[index]();
        }
        if (!this._historyStarted && this._history.length > 1) {
            this._historyStarted = true;
            for (var index in this._onHistoryStartListeners) {
                this._onHistoryStartListeners[index]();
            }
        }
    }

    undo() {
        if (this._onCooldown) return null;
        if (ApplicationState.shared.interaction !== InteractionType.none) return null;
        let newIndex = Math.max(0, Math.min(this._history.length - 1,
            this._historyIndex - 1));
        if (this._historyIndex === newIndex) return null;
        this._historyIndex = newIndex;
        ApplicationState.shared.trigger = TriggerType.historyStateChanged;
        this._onCooldown = true;
        setTimeout(_ => {
            this._onCooldown = false;
        }, this._cooldownInMilliseconds);
        for (var index in this._onChangeStateListeners) {
            this._onChangeStateListeners[index]();
        }
        return this.current;
    }

    redo() {
        if (this._onCooldown) return null;
        if (ApplicationState.shared.interaction !== InteractionType.none) return null;
        let newIndex = Math.max(0, Math.min(this._history.length - 1,
            this._historyIndex + 1));
        if (this._historyIndex === newIndex) return null;
        this._historyIndex = newIndex;
        ApplicationState.shared.trigger = TriggerType.historyStateChanged;
        this._onCooldown = true;
        setTimeout(_ => {
            this._onCooldown = false;
        }, this._cooldownInMilliseconds);
        for (var index in this._onChangeStateListeners) {
            this._onChangeStateListeners[index]();
        }
        return this.current;
    }

}
