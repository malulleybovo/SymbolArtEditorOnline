var CONTEXT_MENU_ICON_LABELS = [
    "fa-edit",
    "fa-picture-o",
    "fa-folder-o",
    "fa-trash-o"
]

var contextMenuCallback = function (key, options, evt, selector) {
    selector = selector || this;
    switch (key) {
        case 'rename':
            selector[0].focusinCallback();
            break;
        case 'new layer':
            list.addElem("Layer " + layerNum, selector[0].parentFolder); layerNum++;
            break;
        case 'insert layer':
            var folder = selector[0].parentNode;
            if (selector[0].elem.type == 'g') {
                $(folder).collapsible('expand');
            }
            list.addElemAtEnd("Layer " + layerNum, folder); layerNum++;
            break;
        case 'append layer':
            list.addElemAtEnd("Layer " + layerNum, selector[0].parentFolder); layerNum++;
            break;
        case 'new group':
            list.addFolder("Group " + groupNum, selector[0].parentFolder); groupNum++;
            break;
        case 'insert group':
            var folder = selector[0].parentNode;
            if (selector[0].elem.type == 'g') {
                $(folder).collapsible('expand');
            }
            list.addFolderAtEnd("Group " + groupNum, folder); groupNum++;
            break;
        case 'append group':
            list.addFolderAtEnd("Group " + groupNum, selector[0].parentFolder); groupNum++;
            break;
        case 'remove':
            list.removeElem(selector[0].parentFolder);
            break;
        default:
            break;
    }
}

/* Symbol Art Main Folder Context Menu */
$(function () {
    $.contextMenu({
        selector: '.context-menu-symbol-art',
        callback: contextMenuCallback,
        items: {
            "rename": { name: "Rename", icon: CONTEXT_MENU_ICON_LABELS[0], accesskey: "r" },
            "sep1": "---------",
            "insert layer": { name: "Insert Layer", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "l" },
            "sep2": "---------",
            "insert group": { name: "Insert Group", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "g" }
        }
    });

    $('.context-menu-symbol-art').on('click', function (e) {
        console.log('clicked', this);
    })
});

/* Symbol Art Layer Context Menu */
$(function () {
    $.contextMenu({
        selector: '.context-menu-layer',
        callback: contextMenuCallback,
        items: {
            "rename": { name: "Rename", icon: CONTEXT_MENU_ICON_LABELS[0], accesskey: "r" },
            "sep1": "---------",
            "new layer": { name: "New Layer", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "n l" },
            "append layer": { name: "Append Layer", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "a l" },
            "sep2": "---------",
            "new group": { name: "New Group", icon: CONTEXT_MENU_ICON_LABELS[2] },
            "append group": { name: "Append Group", icon: CONTEXT_MENU_ICON_LABELS[2] },
            "sep3": "---------",
            "removal folder": {
                "name": "Remove",
                "items": {
                    "remove": { name: "Confirm" }
                }, icon: CONTEXT_MENU_ICON_LABELS[3]
            }
        }
    });

    $('.context-menu-layer').on('click', function (e) {
        console.log('clicked', this);
    })
});

/* Symbol Art Subfolder Context Menu */
$(function () {
    $.contextMenu({
        selector: '.context-menu-group',
        callback: contextMenuCallback,
        items: {
            "rename": { name: "Rename", icon: CONTEXT_MENU_ICON_LABELS[0], accesskey: "r" },
            "sep1": "---------",
            "new layer": { name: "New Layer", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "n l" },
            "insert layer": { name: "Insert Layer", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "n l" },
            "append layer": { name: "Append Layer", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "a l" },
            "sep2": "---------",
            "new group": { name: "New Group", icon: CONTEXT_MENU_ICON_LABELS[2] },
            "insert group": { name: "Insert Group", icon: CONTEXT_MENU_ICON_LABELS[2] },
            "append group": { name: "Append Group", icon: CONTEXT_MENU_ICON_LABELS[2] },
            "sep3": "---------",
            "removal folder": {
                "name": "Remove",
                "items": {
                    "remove": { name: "Confirm" }
                }, icon: CONTEXT_MENU_ICON_LABELS[3]
            }

        }
    });

    $('.context-menu-group').on('click', function (e) {
        console.log('clicked', this);
    })
});