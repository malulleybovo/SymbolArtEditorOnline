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

class UIGestureRecognizer {

    _target = null;
    get target() { return this._target }
    set target(value) {
        if (!(value instanceof HTMLElement)) return;
        this.detach();
        this._target = value;
        this.attach();
    }

    _preventsDefault = true;
    get preventsDefault() { return this._preventsDefault }
    set preventsDefault(value) {
        if (typeof value !== 'boolean') return;
        this._preventsDefault = value;
    }

    _onPointerDown = null;
    set onPointerDown(value) {
        if (typeof value !== 'function') return;
        this._onPointerDown = value;
    }

    _onPointerMove = null;
    set onPointerMove(value) {
        if (typeof value !== 'function') return;
        this._onPointerMove = value;
    }

    _onPointerUp = null;
    set onPointerUp(value) {
        if (typeof value !== 'function') return;
        this._onPointerUp = value;
    }

    _onScroll = null;
    set onScroll(value) {
        if (typeof value !== 'function') return;
        this._onScroll = value;
    }

    _onKeyPress = null;
    set onKeyPress(value) {
        if (typeof value !== 'function') return;
        this._onKeyPress = value;
    }
    
    constructor({ targetHtmlElement = null, preventsDefault = null, onPointerDown = null, onPointerMove = null, onPointerUp = null, onScroll = null, onKeyPress = null }) {
        this.target = targetHtmlElement;
        this.preventsDefault = preventsDefault;
        this.onPointerDown = onPointerDown;
        this.onPointerMove = onPointerMove;
        this.onPointerUp = onPointerUp;
        this.onScroll = onScroll
        this.onKeyPress = onKeyPress
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
        this._target.removeEventListener('scroll', (e) => this.scrolled(e), false);
        this._target.removeEventListener('wheel', (e) => this.scrolled(e), false);
        this._target.removeEventListener('keyup', (e) => this.pressedKey(e), false);
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
        this._target.addEventListener('scroll', (e) => this.scrolled(e), false);
        this._target.addEventListener('wheel', (e) => this.scrolled(e), false);
        this._target.addEventListener('keyup', (e) => this.pressedKey(e), false);
    }

    interactionStarted(event) {
        if (!event || !this._onPointerDown) return;
        if (this._preventsDefault) event.preventDefault();
        event.stopPropagation();
        this._initialEvent = event;
        this._onPointerDown(event);
    }

    interactionChanged(event) {
        if (!event || !this._onPointerMove) return;
        if (this._preventsDefault) event.preventDefault();
        event.stopPropagation();
        if (this._initialEvent) {
            this._onPointerMove(event);
        }
    }

    interactionEnded(event) {
        if (!event || !this._onPointerUp) {
            this._initialEvent = null;
            return;
        }
        if (this._preventsDefault) event.preventDefault();
        event.stopPropagation();
        this._onPointerUp(event);
        this._initialEvent = null;
    }

    interactionCanceled(event) {
        if (!event || !this._onPointerUp) {
            this._initialEvent = null;
            return;
        }
        if (this._preventsDefault) event.preventDefault();
        event.stopPropagation();
        if (this._initialEvent) {
            this._onPointerUp(event);
        }
        this._initialEvent = null;
    }

    scrolled(event) {
        if (!event || !this._onScroll) return;
        event.stopPropagation();
        this._onScroll(event);
    }

    pressedKey(event) {
        if (!event) return;
        event.stopPropagation();
        if (this._onKeyPress) {
            return this._onKeyPress(event);
        }
    }
    
}
