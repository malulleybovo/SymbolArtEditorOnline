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

class UISoundOptionsView extends UIView {

    get viewPath() { return 'res/templates/soundoptionsview.html' }

    _audioCatalogPath = 'res/audioCatalog.json';

    _onSoundOptionChanged = null;
    set onSoundOptionChanged(value) {
        if (typeof value !== 'function' && value !== null) return;
        this._onSoundOptionChanged = value;
    }

    _selectedSoundOption = 0;
    get selectedSoundOption() { return this._selectedSoundOption }
    set selectedSoundOption(value) {
        if (Number.isSafeInteger(value) && value >= 0) {
            this._selectedSoundOption = value;
            this.updateState();
        }
    }

    _closeButton = (() => {
        this.didLoad(_ => {
            this._closeButton = this.view.find('#closebutton');
            this.updateState();
            this._closeButton.gestureRecognizer = new UITapGestureRecognizer({
                targetHtmlElement: this._closeButton[0], onTap: () => {
                    ApplicationState.shared.trigger = TriggerType.closeWindow;
                }
            });
        });
    })();

    _soundButtons = (() => {
        this.didLoad(_ => {
            this._soundButtons = [];
            let index = 1;
            while (index < 30) {
                let button = this.view.find('#sound' + index);
                if (!button[0]) break;
                let soundIndex = index;
                button.gestureRecognizer = new UITapGestureRecognizer({
                    targetHtmlElement: button[0], onTap: () => {
                        if (this.selectedSoundOption === soundIndex) {
                            this.selectedSoundOption = 0;
                        } else {
                            this.selectedSoundOption = soundIndex;
                            this._playSelectedSound();
                        }
                    }
                });
                index += 1;
                this._soundButtons.push(button);
            }
            this.updateState();
        });
        return this._soundButtons || [];
    })();

    _catalog = null;
    
    get loaded() {
        return this._closeButton instanceof jQuery
            && this._soundButtons.length > 0
            && Array.isArray(this._catalog);
    }

    get isHidden() { return this.view.css('opacity') === '0' }
    set isHidden(value) {
        if (typeof value !== 'boolean') return;
        this.view.css('top', value ? '-50px' : '0');
        this.view.css('opacity', value ? '0' : '0.95');
        this.view.css('pointer-events', value ? 'none' : '');
    }

    constructor({ onSoundOptionChanged = null } = { }) {
        super();
        this.onSoundOptionChanged = onSoundOptionChanged;
        $.ajax({
            type: 'GET',
            url: this._audioCatalogPath,
            success: (audioCatalog) => {
                this.didLoad(_ => {
                    this._catalog = [];
                    for (var index in audioCatalog) {
                        let filePath = 'res/' + audioCatalog[index];
                        this._catalog.push(filePath);
                    }
                });
            }
        });
        this.didLoad(_ => {
            this.isHidden = true;
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
        this.didLoad(_ => {
            switch (ApplicationState.shared.trigger) {
                case TriggerType.openSoundOptionsView:
                    setTimeout(_ => {
                        ApplicationState.shared.trigger = TriggerType.none;
                    }, 250);
                    this.isHidden = false;
                    this._initialSoundOption = this._selectedSoundOption;
                    break;
                case TriggerType.closeWindow:
                    if (!this.isHidden && this._onSoundOptionChanged && this._initialSoundOption !== this._selectedSoundOption) {
                        this._initialSoundOption = this._selectedSoundOption;
                        this._onSoundOptionChanged(this._selectedSoundOption);
                    }
                    this.isHidden = true;
                    break;
                default: break;
            }
            for (var index in this._soundButtons) {
                let button = this._soundButtons[index];
                let isSelected = (parseInt(index) + 1) === this.selectedSoundOption;
                button.css('background', isSelected ? '#ff9e2c' : 'white');
            }
        });
    }

    _playSelectedSound() {
        if (!this.loaded) {
            this.didLoad(_ => {
                this._playSelectedSound();
            });
            return;
        }
        let index = this._selectedSoundOption;
        if (this._catalog && this._catalog[index]
            && typeof this._catalog[index] === 'string'
            && this._catalog[index].length !== 0) {
            let audioPlayer = $('<audio preload="auto">');
            audioPlayer[0].src = this._catalog[index];
            audioPlayer[0].play();
        }
    }
    
}
