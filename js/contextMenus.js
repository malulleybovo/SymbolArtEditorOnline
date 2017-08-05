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
            let id = selector[0].id;
            if (selector[0].tagName == 'H2') id = selector[0].parentNode.id;
            list.removeElem(id);
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
            "rename": { name: "1 Rename", icon: CONTEXT_MENU_ICON_LABELS[0], accesskey: "1" },
            "sep1": "---------",
            "insert layer": { name: "2 Add Layer Inside", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "2" },
            "sep2": "---------",
            "insert group": { name: "3 Add Group Inside", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "3" }
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
            "rename": { name: "1 Rename", icon: CONTEXT_MENU_ICON_LABELS[0], accesskey: "1" },
            "sep1": "---------",
            "new layer": { name: "2 Add Layer Here", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "2" },
            "append layer": { name: "3 Add Layer At End", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "3" },
            "sep2": "---------",
            "new group": { name: "4 Add Group Here", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "4" },
            "append group": { name: "5 Add Group At End", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "5" },
            "sep3": "---------",
            "removal folder": {
                "name": "6 Remove", accesskey: "6",
                "items": {
                    "remove": { name: "0 Confirm", accesskey: "0" }
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
            "rename": { name: "1 Rename", icon: CONTEXT_MENU_ICON_LABELS[0], accesskey: "1" },
            "sep1": "---------",
            "new layer": { name: "2 Add Layer Here", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "2" },
            "insert layer": { name: "3 Add Layer Inside", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "3" },
            "append layer": { name: "4 Add Layer At End", icon: CONTEXT_MENU_ICON_LABELS[1], accesskey: "4" },
            "sep2": "---------",
            "new group": { name: "5 Add Group Here", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "5" },
            "insert group": { name: "6 Add Group Inside", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "6" },
            "append group": { name: "7 Add Group At End", icon: CONTEXT_MENU_ICON_LABELS[2], accesskey: "7" },
            "sep3": "---------",
            "removal folder": {
                "name": "8 Remove", accesskey: "8",
                "items": {
                    "remove": { name: "0 Confirm", accesskey: "0" }
                }, icon: CONTEXT_MENU_ICON_LABELS[3]
            }

        }
    });

    $('.context-menu-group').on('click', function (e) {
        console.log('clicked', this);
    })
});