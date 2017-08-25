var CONTEXT_MENU_ICONS = {
    'rename': 'fa-edit',
    'addlayer': 'fa-picture-o',
    'addgroup': 'fa-folder-o',
    'move': 'fa-unsorted',
    'copy': 'fa-copy',
    'paste': 'fa-paste',
    'hideshow': 'fa-eye-slash',
    'remove': 'fa-trash-o'
};

var contextMenuCallback = function (key, options, evt, selector) {
    selector = selector || this;
    selector.click(); // Select the layer/group before editting
    switch (key) {
        case 'rename':
            list.rename(selector[0]);
            break;
        case 'new layer':
            list.addElem("Symbol " + layerNum, selector[0].parentFolder); layerNum++;
            break;
        case 'insert layer':
            var folder = selector[0].parentNode;
            if (selector[0].elem.type == 'g') {
                $(folder).collapsible('expand');
            }
            list.addElemAtEnd("Symbol " + layerNum, folder); layerNum++;
            break;
        case 'append layer':
            list.addElemAtEnd("Symbol " + layerNum, selector[0].parentFolder); layerNum++;
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
        case 'picktomove':
            list.changeMovingElem(selector[0]);
            break;
        case 'moveselectedhere':
            selector.trigger('drop');
            break;
        case 'copy':
            list.copyElem(selector[0]);
            break;
        case 'paste':
            list.pasteOnElem(selector[0]);
            break;
        case 'hideshow':
            list.toggleElemVisibility(selector[0]);
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
            "rename": { name: "1 Rename", icon: CONTEXT_MENU_ICONS.rename, accesskey: "1" },
            "sep1": "---------",
            "insert layer": { name: "2 Add Symbol Inside", icon: CONTEXT_MENU_ICONS.addlayer, accesskey: "2" },
            "sep2": "---------",
            "insert group": { name: "3 Add Group Inside", icon: CONTEXT_MENU_ICONS.addgroup, accesskey: "3" }
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
            "rename": { name: "1 Rename", icon: CONTEXT_MENU_ICONS.rename, accesskey: "1" },
            "sep1": "---------",
            "new layer": { name: "2 Add Symbol Here", icon: CONTEXT_MENU_ICONS.addlayer, accesskey: "2" },
            "append layer": { name: "3 Add Symbol At End", icon: CONTEXT_MENU_ICONS.addlayer, accesskey: "3" },
            "sep2": "---------",
            "new group": { name: "4 Add Group Here", icon: CONTEXT_MENU_ICONS.addgroup, accesskey: "4" },
            "append group": { name: "5 Add Group At End", icon: CONTEXT_MENU_ICONS.addgroup, accesskey: "5" },
            "sep3": "---------",
            "picktomove": { name: "9 Pick to Move", icon: CONTEXT_MENU_ICONS.move, accesskey: "9" },
            "moveselectedhere": { name: "0 Move Your Pick Here", icon: CONTEXT_MENU_ICONS.move, accesskey: "0" },
            "sep4": "---------",
            "hideshow": { name: "Hide/Show", icon: CONTEXT_MENU_ICONS.hideshow, accesskey: "h" },
            "copy": { name: "Copy", icon: CONTEXT_MENU_ICONS.copy, accesskey: "c" },
            "paste": { name: "Paste", icon: CONTEXT_MENU_ICONS.paste, accesskey: "p" },
            "sep5": "---------",
            "removal folder": {
                "name": "Remove", accesskey: "r",
                "items": {
                    "remove": { name: "Confirm" }
                }, icon: CONTEXT_MENU_ICONS.remove
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
            "rename": { name: "1 Rename", icon: CONTEXT_MENU_ICONS.rename, accesskey: "1" },
            "sep1": "---------",
            "new layer": { name: "2 Add Symbol Here", icon: CONTEXT_MENU_ICONS.addlayer, accesskey: "2" },
            "append layer": { name: "3 Add Symbol At End", icon: CONTEXT_MENU_ICONS.addlayer, accesskey: "3" },
            "sep2": "---------",
            "new group": { name: "4 Add Group Here", icon: CONTEXT_MENU_ICONS.addgroup, accesskey: "4" },
            "append group": { name: "5 Add Group At End", icon: CONTEXT_MENU_ICONS.addgroup, accesskey: "5" },
            "sep3": "---------",
            "insert layer": { name: "6 Add Symbol Inside", icon: CONTEXT_MENU_ICONS.addlayer, accesskey: "6" },
            "insert group": { name: "7 Add Group Inside", icon: CONTEXT_MENU_ICONS.addgroup, accesskey: "7" },
            "sep4": "---------",
            "picktomove": { name: "9 Pick to Move", icon: CONTEXT_MENU_ICONS.move, accesskey: "9" },
            "moveselectedhere": { name: "0 Move Your Pick Here", icon: CONTEXT_MENU_ICONS.move, accesskey: "0" },
            "sep5": "---------",
            "hideshow": { name: "Hide/Show", icon: CONTEXT_MENU_ICONS.hideshow, accesskey: "h" },
            "copy": { name: "Copy", icon: CONTEXT_MENU_ICONS.copy, accesskey: "c" },
            "paste": { name: "Paste", icon: CONTEXT_MENU_ICONS.paste, accesskey: "p" },
            "sep6": "---------",
            "removal folder": {
                "name": "Remove", accesskey: "r",
                "items": {
                    "remove": { name: "Confirm" }
                }, icon: CONTEXT_MENU_ICONS.remove
            }

        }
    });

    $('.context-menu-group').on('click', function (e) {
        console.log('clicked', this);
    })
});