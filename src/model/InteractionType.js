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

class InteractionType {

    static none = 0;
    static panning = 1;
    static movingLayerWillBegin = 2;
    static movingLayerDidBegin = 3;
    static movingLayerDidEnd = 4;
    static addingLayerWillBegin = 5;
    static addingLayerDidBegin = 6;
    static addingLayerDidEnd = 7;
    static removingLayer = 8;
    static groupingLayers = 9;
    static togglingViewMode = 10;
    static updatingEditor = 11;
    static reshapingSymbolWillBegin = 12;
    static reshapingSymbolDidBegin = 13;
    static reshapingHelperImageWillBegin = 14;
    static reshapingHelperImageDidBegin = 15;
    static reshapingContainerWillBegin = 16;
    static reshapingContainerDidBegin = 17;

    static valid({ rawValue }) {
        switch (rawValue) {
            case InteractionType.none:
            case InteractionType.panning:
            case InteractionType.movingLayerWillBegin:
            case InteractionType.movingLayerDidBegin:
            case InteractionType.movingLayerDidEnd:
            case InteractionType.addingLayerWillBegin:
            case InteractionType.addingLayerDidBegin:
            case InteractionType.addingLayerDidEnd:
            case InteractionType.removingLayer:
            case InteractionType.groupingLayers:
            case InteractionType.togglingViewMode:
            case InteractionType.updatingEditor:
            case InteractionType.reshapingSymbolWillBegin:
            case InteractionType.reshapingSymbolDidBegin:
            case InteractionType.reshapingHelperImageWillBegin:
            case InteractionType.reshapingHelperImageDidBegin:
            case InteractionType.reshapingContainerWillBegin:
            case InteractionType.reshapingContainerDidBegin:
                return true;
            default:
                return false;
        }
    }

}
