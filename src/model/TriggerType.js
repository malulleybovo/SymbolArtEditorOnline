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

class TriggerType {

    static none = 0;
    static layerAddition = 1;
    static layerDeletion = 2;
    static groupLayers = 3;
    static closeWindow = 4;
    static openColorPicker = 5;
    static openAssetPicker = 6;
    static openOptionsView = 7;
    static historyStateChanged = 8;
    static focusSelection = 9;
    static openHelperImageOptionsView = 10;
    static discardHelperImage = 11;
    static focusHelperImage = 12;
    static openHelperImageSettings = 13;
    static toggledHelperImageGreenScreen = 14;
    static openSoundOptionsView = 15;
    static layerCopyPaste = 16;
    static layerFlipX = 17;
    static layerFlipY = 18;
    static layerRotate90 = 19;

    static valid({ rawValue }) {
        switch (rawValue) {
            case TriggerType.none:
            case TriggerType.layerAddition:
            case TriggerType.layerDeletion:
            case TriggerType.groupLayers:
            case TriggerType.closeWindow:
            case TriggerType.openColorPicker:
            case TriggerType.openAssetPicker:
            case TriggerType.openOptionsView:
            case TriggerType.historyStateChanged:
            case TriggerType.focusSelection:
            case TriggerType.openHelperImageOptionsView:
            case TriggerType.discardHelperImage:
            case TriggerType.focusHelperImage:
            case TriggerType.openHelperImageSettings:
            case TriggerType.toggledHelperImageGreenScreen:
            case TriggerType.openSoundOptionsView:
            case TriggerType.layerCopyPaste:
            case TriggerType.layerFlipX:
            case TriggerType.layerFlipY:
            case TriggerType.layerRotate90:
                return true;
            default:
                return false;
        }
    }

}
