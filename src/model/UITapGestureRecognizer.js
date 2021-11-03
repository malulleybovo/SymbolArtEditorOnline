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

class UITapGestureRecognizer {

    _target = null;
    get target() { return this._target }
    set target(value) {
        if (!(value instanceof HTMLElement)) return;
        this.detach();
        this._target = value;
        this.attach();
    }

    _onTap = null;
    set onTap(value) {
        if (typeof value !== 'function') return;
        this._onTap = value;
    }
    
    constructor({ targetHtmlElement = null, onTap = null }) {
        this.target = targetHtmlElement;
        this.onTap = onTap;
    }

    detach() {
        if (!(this._target instanceof HTMLElement)) return;
        this._target.removeEventListener('pointerdown', (e) => this.interactionStarted(e), false);
        this._target.removeEventListener('pointermove', (e) => this.interactionChanged(e), false);
        this._target.removeEventListener('pointerup', (e) => this.interactionEnded(e), false);
        this._target.removeEventListener('pointerout', (e) => this.interactionEnded(e), false);
        this._target.removeEventListener('pointerleave', (e) => this.interactionEnded(e), false);
        this._target.removeEventListener('pointercancel', (e) => this.interactionEnded(e), false);
        this._target.removeEventListener('lostpointercapture', (e) => this.interactionEnded(e), false);
    }

    attach() {
        if (!(this._target instanceof HTMLElement)) return;
        this._target.addEventListener('pointerdown', (e) => this.interactionStarted(e), false);
        this._target.addEventListener('pointermove', (e) => this.interactionChanged(e), false);
        this._target.addEventListener('pointerup', (e) => this.interactionEnded(e), false);
        this._target.addEventListener('pointerout', (e) => this.interactionCanceled(e), false);
        this._target.addEventListener('pointerleave', (e) => this.interactionCanceled(e), false);
        this._target.addEventListener('pointercancel', (e) => this.interactionCanceled(e), false);
        this._target.addEventListener('lostpointercapture', (e) => this.interactionCanceled(e), false);
    }

    interactionStarted(event) {
        if (!event) return;
        event.preventDefault();
        event.stopPropagation();
        this._initialEvent = event;
    }

    interactionChanged(event) {
        if (!event) return;
        event.preventDefault();
        event.stopPropagation();
    }

    interactionEnded(event) {
        if (!event) {
            this._initialEvent = null;
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (typeof this._onTap === 'function' && this._initialEvent
            && Math.abs(this._initialEvent.clientX - event.clientX) < 10
            && Math.abs(this._initialEvent.clientY - event.clientY) < 10
            && Math.abs(this._initialEvent.timeStamp - event.timeStamp) < 500) {
            this._onTap();
        }
        this._initialEvent = null;
    }

    interactionCanceled(event) {
        this._initialEvent = null;
        if (!event) return;
        event.preventDefault();
        event.stopPropagation();
    }
    
}
