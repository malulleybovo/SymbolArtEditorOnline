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

class InputDevice {
    
    _originalTouchEvent = null;
    _activeEventState = 0;

    _activeTouchEvents = [];

    _tapDuration = 500;
    _tapTimeout = null;

    _longTapDuration = 750;
    _longTapTimeout = null;

    _longStart = false;
    get longStart() { return this._longStart }

    _previousPinchLength = -1;

    _minimumNumberOfPointsToTriggerMotion = 10;

    constructor() {
        window.addEventListener('pointerdown', (e) => this._interactionStarted(e), false);
        window.addEventListener('pointermove', (e) => this._interactionChanged(e), false);
        window.addEventListener('pointerup', (e) => this._interactionEnded(e), false);
        window.addEventListener('pointerout', (e) => this._interactionEnded(e), false);
        window.addEventListener('pointerleave', (e) => this._interactionEnded(e), false);
        window.addEventListener('pointercancel', (e) => this._interactionEnded(e), false);
        window.addEventListener('lostpointercapture', (e) => this._interactionEnded(e), false);
        window.addEventListener('blur', (e) => this._interactionEnded(e), false);
        window.addEventListener('scroll', (e) => this._scrolled(e), false);
        window.addEventListener('wheel', (e) => this._scrolled(e), false);
        window.addEventListener('keydown', (e) => this._willPressKey(e), false);
        window.addEventListener('keyup', (e) => this._pressedKey(e), false);
    }

    _interactionStarted(event) {
        if (!UIApplication.shared.loaded) return;
        if (this._activeTouchEvents.length >= 2) return;
        if (this._activeTouchEvents.filter(e => e.pointerId === event.pointerId).length > 0) return;
        this._activeTouchEvents.push(event);
        this._previousPinchLength = -1;
        this._activeEventState = this._activeTouchEvents.length === 1 ? 1 : 3;
        if (this._activeTouchEvents.length === 1) {
            this._originalTouchEvent = event;
            this._activeEventTime = new Date();
            if (this._tapTimeout !== null) {
                clearTimeout(this._tapTimeout);
            }
            this._tapTimeout = setTimeout(() => {
                this._tapTimeout = null;
            }, this._tapDuration);
            this._longStart = false;
            if (this._longTapTimeout !== null) {
                clearTimeout(this._longTapTimeout);
            }
            let longEvent = event
            this._longTapTimeout = setTimeout(() => {
                this._longTapTimeout = null;
                this._longStart = true;
                this.longTouchBegan(longEvent);
            }, this._longTapDuration);
        }
        this.touchBegan(event, this._activeTouchEvents.length);
    }

    _interactionChanged(event) {
        if (!UIApplication.shared.loaded) return;
        for (var index in this._activeTouchEvents) {
            if (event.pointerId === this._activeTouchEvents[index].pointerId) {
                this._activeTouchEvents[index] = event;
                break;
            }
        }
        if (this._activeTouchEvents.length === 1) {
            if (this._activeEventState !== 1 && this._activeEventState !== 2) {
                return;
            }
            this._activeEventState = 2;
            if (!(Math.abs(this._originalTouchEvent.clientX - event.clientX) < this._minimumNumberOfPointsToTriggerMotion
                && Math.abs(this._originalTouchEvent.clientY - event.clientY) < this._minimumNumberOfPointsToTriggerMotion
                && this._longTapTimeout !== null)) {
                if (this._longTapTimeout !== null) {
                    clearTimeout(this._longTapTimeout);
                    this._longTapTimeout = null;
                    this._longStart = false;
                }
                if (this._longStart) {
                    this.longTouchMoved(event);
                } else {
                    this.touchMoved(event);
                }
            }
            if (event.clientY < 0 || event.clientX < 0 || (event.clientX > window.innerWidth || event.clientY > window.innerHeight)) {
                this._interactionEnded(event);
            }
        } else if (this._activeTouchEvents.length === 2 && !this._longStart) {
            if (this._longTapTimeout !== null) {
                clearTimeout(this._longTapTimeout);
            }
            let pinchLength = Math.sqrt(
                Math.pow(this._activeTouchEvents[0].clientX - this._activeTouchEvents[1].clientX, 2)
                + Math.pow(this._activeTouchEvents[0].clientY - this._activeTouchEvents[1].clientY, 2)
            );
            let pinchCenter = {
                clientX: 0.5 * (this._activeTouchEvents[0].clientX + this._activeTouchEvents[1].clientX),
                clientY: 0.5 * (this._activeTouchEvents[0].clientY + this._activeTouchEvents[1].clientY)
            }
            if (this._previousPinchLength > 0 && pinchLength !== this._previousPinchLength) {
                this.pinchingMoved(pinchCenter, pinchLength - this._previousPinchLength);
            } else {
                this.pinchingBegan(pinchCenter, 0);
            }
            this._previousPinchLength = pinchLength;
        }
    }

    _interactionEnded(event) {
        if (!UIApplication.shared.loaded) return;
        if (event && event.type === 'blur') {
            this._activeTouchEvents = [];
        }
        for (var index in this._activeTouchEvents) {
            if (event.pointerId === this._activeTouchEvents[index].pointerId) {
                this._activeTouchEvents.splice(index, 1);
            }
        }
        if (this._activeTouchEvents.length > 0 || this._activeEventState === 0) {
            return;
        }
        if (Math.abs(this._originalTouchEvent.clientX - event.clientX) < this._minimumNumberOfPointsToTriggerMotion
            && Math.abs(this._originalTouchEvent.clientY - event.clientY) < this._minimumNumberOfPointsToTriggerMotion
            && this._tapTimeout !== null) {
            this.tapped(event);
        }
        this._activeEventState = 0;
        this._originalTouchEvent = null;
        if (this._longStart) {
            this.longTouchEnded(event);
        } else {
            this.touchEnded(event);
        }
        if (this._longTapTimeout !== null) {
            clearTimeout(this._longTapTimeout);
            this._longTapTimeout = null;
            this._longStart = false;
        }
    }

    _scrolled(event) {
        if (!UIApplication.shared.loaded) return;
        this.scrolled(event);
    }

    _willPressKey(event) {
        if (!UIApplication.shared.loaded) return;
        this.willPressKey(event);
    }

    _pressedKey(event) {
        if (!UIApplication.shared.loaded) return;
        this.pressedKey(event);
    }

    tapped(event) { }

    touchBegan(event, count) { }

    touchMoved(event) { }

    touchEnded(event) { }

    longTouchBegan(event) { }

    longTouchMoved(event) { }

    longTouchEnded(event) { }

    scrolled(event) { }

    pinchingBegan(length) { }

    pinchingMoved(length) { }

    willPressKey(event) { }

    pressedKey(event) { }

}
