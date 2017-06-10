var groupID = 0;
var layerID = 0;

var List = Class({
    initialize: function (headerName, groupName, editorContainer, elemMousedownCallback) {
        // Initialize Canvas Control
        this.page = $(document.getElementById('canvasctrl'));

        // Initialize Side Bar
        $(".sidebar.left").sidebar().trigger("sidebar:close");

        this.mainFolder;
        this.mainGroup = new Group(groupName);
        Ps.initialize(this.page[0], {
            wheelSpeed: 0.2,
            wheelPropagation: false,
            minScrollbarLength: 20
        });

        this.editor = new Editor(editorContainer, this);

        this.header = $('<div data-role="header" class="ui-header ui-bar-inherit">');
        this.header.append('<h1 class="ui-title">' + headerName + '</h1>');

        this.container = $('<div data-role="main" class="ui-content">');
        this.page.append(this.header);
        this.page.append(this.container);

        this.movingElem = null;
        this.selectedElem = null;
        this.changeSelectedElem = function (tag) {
            if (tag.tagName == "A" || tag.tagName == "H2") {
                if (this.selectedElem != null) $(this.selectedElem).css("filter", "brightness(100%)");
                $(tag).css("filter", "brightness(80%)");
                this.selectedElem = tag;
            }
        };

        // Create Toggle Button
        this.toggleButton = $('<i id="canvasctrlbutton" class="material-icons button layer1 no-highlight cursor-pointer">&#xE8EF;</i>');
        this.toggleButton.click(function () {
            $(".sidebar.left").trigger("sidebar:toggle");
            var $this = $(this);
            if ($this.hasClass('selected')) {
                $this.removeClass('selected');
            }
            else {
                $this.addClass('selected');
            }
        });
        $(HTMLBody).append(this.toggleButton);
        document.onkeypress = function (e) {
            if (e.keyCode == 13) { // Enter
                $('#canvasctrlbutton').click();
            }
            if (e.keyCode == 113) { // Q
                console.log(list.toSAML());
            }
        }
        document.onkeydown = function (e) {
            if (e.keyCode == 9) {
                e.preventDefault(); // Disable TAB
            }
            if (e.keyCode == 32) { // Triggers active element highlight
                var canvas = $('canvas')[0];
                if (canvas.isHighlightActive !== undefined) { // Have already triggered
                    return;
                }

                var list = canvas.list;
                var elem = list.selectedElem.parentNode.elem;
                list.editor.stage.alpha = 0.1;
                if (elem.type == 'l') {
                    var quad = list.editor.layers[list.editor.getLayerIndex(elem)].quad;
                    canvas.quadOnTop = quad;
                    quad.alpha += 10.0;
                }
                else if (elem.type == 'g' && elem.elems.length > 0) {
                    var lis = $(list.container).find('li');
                    var lisInGroup = $(list.selectedElem.parentNode.parentNode).find('li');
                    var firstIndex = lis.index(lisInGroup[0]);
                    var lastIndex = firstIndex + lisInGroup.length;
                    canvas.quadsOnTop = [];
                    if (firstIndex == -1) return; // Group is empty
                    for (var i = firstIndex; i < lastIndex; i++) {
                        quad = list.editor.layers[i].quad;
                        quad.alpha += 10.0;
                        canvas.quadsOnTop.push(quad);
                    }
                }
                canvas.isHighlightActive = true;
                list.editor.render();
            }
        }
        document.onkeyup = function (e) {
            if (e.keyCode == 32) { // Wraps up active element highlight
                var canvas = $('canvas')[0];
                if (canvas.isHighlightActive) {
                    var list = canvas.list;
                    var elem = list.selectedElem.parentNode.elem;

                    list.editor.stage.alpha = 1.0;
                    if (elem.type == 'l') {
                        canvas.quadOnTop.alpha -= 10.0;
                    }
                    else if (elem.type == 'g') {
                        var quad;
                        for (var i = canvas.quadsOnTop.length - 1; i >= 0; i--) {
                            quad = canvas.quadsOnTop[i];
                            canvas.quadsOnTop.pop();
                            quad.alpha -= 10.0;
                        }
                    }
                    canvas.isHighlightActive = undefined;
                    list.editor.render();
                }
            }
        }

        this.elemMousedownCallback = elemMousedownCallback;
        this.createGroupNode = function (name, subGroup, group, parentGroup, folder) {
            var groupFolder = $('<div data-role="collapsible" id="' + groupID + '">'); groupID++;
            var header = $('<h2 class="context-menu-group">' + name + '</h2>');
            groupFolder.append(header);
            var list = $('<ul data-role="listview" data-divider-theme="b">');
            list.css('margin-left', '1px');
            var menuType = 'SubGroupMenu';
            header[0].group = group;
            header[0].elem = group.elems[group.activeElem];
            header[0].parentFolder = folder; // Get reference to collapsible
            $(header).mousedown(this.elemMousedownCallback);
            header.on("swiperight", function () {
                $(this).contextMenu();
            });
            // Show menu when #myDiv is clicked
            header[0].list = this;
            header[0].focusinCallback = this.rename;
            header.focusin(function (e) {
                this.list.changeSelectedElem(this.firstChild);
            });
            groupFolder[0].isOpen = false;
            $(groupFolder).on('collapsibleexpand', function (e) {
                e.stopPropagation();
                groupFolder[0].isOpen = true;

            }).on('collapsiblecollapse', function (e) {
                e.stopPropagation();
                groupFolder[0].isOpen = false;
            });
            groupFolder.append(list);
            groupFolder[0].list = list;
            groupFolder[0].group = group;
            groupFolder[0].subGroup = subGroup;

            // For purposes of moving elements
            header.on("dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).addClass('dragging');
            });

            header.on("dragstart", function (event) {
                event.stopPropagation();
                $(this).addClass('dragging');
                this.list.movingElem = this;
            });
            header.on("dragleave", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).removeClass('dragging');
            });
            header.on("drop", function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.list.move(this.list.movingElem, this);
            });

            return groupFolder;
        };
        this.createLayerNode = function (name, group, folder) {
            var li = $('<li class="context-menu-layer" class="ui-draggable ui-draggable-handle">');
            li.append('<a href="#" data-role="button" data-transition="pop" style="text-shadow:none;">' + name + '</a>');
            li[0].group = group;
            li[0].parentFolder = folder;
            li[0].elem = group.elems[group.activeElem];
            li[0].list = this;
            $(li).mousedown(this.elemMousedownCallback);
            // Show menu when right clicked
            li.focusin(function (e) {
                this.list.changeSelectedElem(this.firstChild);
            });
            li.on("swiperight", function () {
                $(this).contextMenu();
            });

            li[0].textbox = false;
            li[0].focusinCallback = this.rename;

            // For purposes of moving elements
            li.on("dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).addClass('dragging');
            });

            li.on("dragstart", function (event) {
                event.stopPropagation();
                $(this).addClass('dragging');
                this.list.movingElem = this;
            });
            li.on("dragleave", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).removeClass('dragging');
            });
            li.on("drop", function(event) {
                event.preventDefault();  
                event.stopPropagation();
                this.list.move(this.list.movingElem, this);
            });

            return li;
        };

        $('canvas')[0].list = this;

        this.displayGroup(this.mainGroup, this.container);
        this.container.trigger('create');
    },
    rename: function () {
        var parent = $(this);
        var elem = parent.children(":first");
        if (!parent[0].textbox) {
            var input = $('<input />', {
                'type': 'text',
                'name': 'aname',
                'value': parent[0].elem.name
            });
            input[0].prevValue = parent[0].elem.name;
            input[0].prevNode = elem[0];
            if (parent[0].elem.type == 'g') { parent.parent().collapsible("option", "collapsed", true); }
            input.keypress(function (e) { // Update contents of layer/group
                e.stopPropagation();
                var elem = $(this);
                var parent = elem.parent().parent();
                if (parent[0].textbox) {
                    if (e.keyCode == 13) { // Enter Key
                        if (/^[a-z|A-Z|0-9].*[a-z|A-Z|0-9]$|^[a-z|A-Z|0-9]$/.test(elem.val())) { // Validade new name
                            var prevElem = $(elem[0].prevNode); // Retrieve prev display DOM elem
                            prevElem.text(elem.val()); // Update name of elem in node
                            parent.append(prevElem);
                            console.log("Changing layer name from \"" + parent[0].elem.name + "\" to \"" + prevElem.text() + "\"");
                            parent[0].elem.name = prevElem.text();
                            parent[0].textbox = false;
                            elem.remove();
                            parent.trigger('create');
                            prevElem.focus();
                        }
                        else {
                            this.blur();
                        }
                    }
                    else if (e.keyCode == 27) { // Esc Key
                        this.blur();
                    }
                }
            });
            input.blur(function (e) { // Abort changes on layer/group
                e.stopPropagation();
                var elem = $(this);
                var parent = elem.parent().parent();
                if (parent[0].textbox) {
                    var prevElem = $(elem[0].prevNode); // Retrieve prev display DOM elem
                    parent.append(prevElem);
                    parent[0].textbox = false;
                    elem.remove();
                    parent.trigger('create');
                }
            });
            var disableClicks = function (e) {
                e.stopPropagation();
            };
            input.click(disableClicks);
            input.mousedown(disableClicks);

            parent.append(input);
            parent[0].textbox = true;
            elem.remove();
            parent.trigger('create');
            input.focus().select();
        }
    },
    move: function (srcElem, destElem) {
        if (srcElem == destElem) return;
        var cssclass = 'testingFirstDOMElem';
        var src;
        var layersToMove = [];
        if (srcElem.elem.type == 'l') {
            src = $(srcElem);
            layersToMove.push(this.editor.removeLayer(srcElem.elem));
        }
        else if (srcElem.elem.type == 'g') {
            src = $(srcElem).parent();
            for (var i in srcElem.elem.elems) {
                layersToMove.push(this.editor.removeLayer(srcElem.elem.elems[i]));
            }
        }
        src.addClass(cssclass);

        var dest;
        if (destElem.elem.type == 'l') {
            dest = $(destElem);
        }
        else if (destElem.elem.type == 'g') {
            dest = $(destElem).parent();
        }
        dest.addClass(cssclass);

        // Data movement
        var srcIndex = src.index();
        srcElem.group.elems.splice(srcIndex, 1);

        var destIndex = dest.index();
        var firstElem = $('.' + cssclass + ':first');
        var isForward = true;
        if (firstElem[0] == dest[0]) { // if moving element UP/BACKWARD in the list
            isForward = false;
            if (destIndex < 0) destIndex = 0;
        }

        src.removeClass(cssclass);
        dest.removeClass(cssclass);

        if (isForward && destElem.group != srcElem.group) destIndex++;

        destElem.group.elems.splice(destIndex, 0, srcElem.elem);
        console.log("Moved from index " + srcIndex + " to index " + destIndex);
        srcElem.group = destElem.group;
        srcElem.elem.parent = destElem.group;
        srcElem.parentFolder = destElem.parentFolder;

        if (!isForward && destIndex > 0) {
            dest = dest.prev();
        }

        // DOM element movement animation
        var $this = dest,
                    callback = function () {

                        if (destIndex > 0) {
                            src.insertAfter($this);
                        }
                        else {
                            var t = dest.parent();
                            dest.parent().prepend(src);
                        }

                        var lis;
                        var index;
                        var editor;
                        if (srcElem.elem.type == 'l') {
                            lis = $(this.list.container).find('li');
                            index = lis.index(srcElem);
                            editor = this.list.editor;
                        }
                        else {
                            lis = $(this.firstChild.list.container).find('li');
                            var lisInSrc = $(srcElem.parentNode).find('li');
                            index = lis.index(lisInSrc[0]);
                            editor = this.firstChild.list.editor;
                        }
                        if (index >= 0) {
                            for (var i = layersToMove.length - 1; i >= 0; i--) {
                                editor.addLayerAt(layersToMove[i].layer, index);
                            }
                        }
                        editor.render();
                    };
        src.slideUp(150, callback).slideDown(150, function () {
            src.mousedown();
        });

    },
    addFolder: function (name, folder) {
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var parentGroup = folder.group;
        if (parentGroup === undefined) parentGroup = this.mainGroup;
        var group = folder.subGroup;
        if (group === undefined) group = this.mainGroup;

        var subGroup = group.addSubGroup(name);
        var groupFolder = this.createGroupNode(name, subGroup, group, parentGroup, folder);
        if (parentNode.firstChild.children.length == 0) {
            $(parentNode.firstChild).append(groupFolder);
        }
        else {
            var index = group.activeElem;
            if (index == 0) {
                $(parentNode.firstChild).prepend(groupFolder);
            }
            else {
                groupFolder.insertAfter(parentNode.firstChild.children[group.activeElem - 1]);
            }
        }

        $(folder).trigger('create');
    },
    addFolderAtEnd: function (name, folder) {
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var parentGroup = folder.group;
        if (parentGroup === undefined) parentGroup = this.mainGroup;
        var group = folder.subGroup;
        if (group === undefined) group = this.mainGroup;

        var subGroup = group.addSubGroupAtEnd(name);
        var groupFolder = this.createGroupNode(name, subGroup, group, parentGroup, folder);
        $(parentNode.firstChild).append(groupFolder);

        $(folder).trigger('create');
    },
    addElem: function (name, folder) {
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        var layer = subGroup.addLayer(name);
        var li = this.createLayerNode(name, subGroup, folder);
        if (parentNode.firstChild.children.length == 0) {
            $(parentNode.firstChild).append(li);
        }
        else {
            var index = subGroup.activeElem;
            if (index == 0) {
                $(parentNode.firstChild).prepend(li);
            }
            else {
                li.insertAfter(parentNode.firstChild.children[subGroup.activeElem - 1]);
            }
        }

        $(folder).trigger('create');

        var lis = $(this.container).find('li');
        var index = lis.index(li);
        this.editor.addLayerAt(layer, index);
        this.editor.render();

        li.focusin();
        li.mousedown();

        return li;
    },
    addElemAtEnd: function (name, folder) {
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        var layer = subGroup.addLayerAtEnd(name);
        var li = this.createLayerNode(name, subGroup, folder);
        $(parentNode.firstChild).append(li);

        $(folder).trigger('create');

        var lis = $(this.container).find('li');
        var index = lis.index(li);
        this.editor.addLayerAt(layer, index);
        this.editor.render();

        return li;
    },
    removeElem: function (folder) {
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        $(parentNode.firstChild.children[subGroup.activeElem]).remove();

        var elem = subGroup.remLayer();

        $(folder).trigger('create');

        if (elem.type == 'l') {
            this.editor.removeLayer(elem);
        }
        else if (elem.type == 'g') {
            removeGroupFromEditor(elem, this.editor);
        }
        this.editor.render();

        // Function to recursively delete all quads in editor pertaining to the removed group
        function removeGroupFromEditor(group, editor) {
            for (var i = 0; i < group.elems.length; i++) {
                var elem = group.elems[i];
                if (elem.type == 'l') {
                    editor.removeLayer(elem);
                }
                else if (elem.type == 'g') {
                    removeGroupFromEditor(elem, editor);
                }
            }
        }
    },
    displayGroup: function (group, parentFolder, parentGroup, index) {
        var contextMenuType = "group";
        if (group === undefined) group = this.mainGroup;
        if (index === undefined) contextMenuType = "symbol-art";
        var groupFolder = $('<div data-role="collapsible" id="' + groupID + '">'); groupID++;
        var header = $('<h2 class="context-menu-' + contextMenuType + '">' + group.name + '</h2>');
        groupFolder.append(header);
        var list = $('<ul data-role="listview" data-divider-theme="b">');
        var menuType;
        if (parentGroup !== undefined && index !== undefined) {
            header[0].group = parentGroup;
            header[0].elem = parentGroup.elems[index];
            header[0].parentFolder = parentFolder[0].parentNode; // Get reference to collapsible
            $(header).mousedown(this.elemMousedownCallback);
            menuType = 'SubGroupMenu';
        }
        else {
            header[0].elem = group;
            menuType = 'MainGroupMenu';
        }
        header[0].focusinCallback = this.rename;
        header.on("swiperight", function () {
            $(this).contextMenu();
        });
        // Show menu when #myDiv is clicked
        groupFolder[0].isOpen = false;
        $(groupFolder).on('collapsibleexpand', function (e) {
            e.stopPropagation();
            groupFolder[0].isOpen = true;

        }).on('collapsiblecollapse', function (e) {
            e.stopPropagation();
            groupFolder[0].isOpen = false;
        });
        parentFolder.append(groupFolder);
        groupFolder.append(list);
        groupFolder[0].list = list;
        groupFolder[0].group = group;

        for (var i = 0; i < group.elems.length; i++) {
            if (group.elems[i].type == 'g') {
                this.displayGroup(group.elems[i], groupFolder[0].list, group, i);
            }
            else if (group.elems[i].type = 'l') {
                var li = $('<li class="context-menu-layer" id="' + layerID + '">'); layerID++;
                li.append('<a href="#popupBasic" data-rel="popup" data-role="button" data-inline="true" data-transition="pop">' + group.elems[i].name + '</a>');
                li[0].group = group;
                li[0].parentFolder = groupFolder[0];
                li[0].elem = group.elems[i];
                $(li).mousedown(this.elemMousedownCallback);
                li.on("swiperight", function () {
                    $(this).contextMenu();
                });
                // Show menu when #myDiv is clicked
                list.append(li);
            }
        }
    },
    toSAML: function () {
        var saml = '<?xml version="1.0" encoding="utf-8"?>\n<sa name="' + this.mainGroup.name + '" visible="true" version="4" author="0" width="192" height="96" sound="0">';
        for (var i = 0; i < this.mainGroup.elems.length; i++) {
            var elem = this.mainGroup.elems[i];
            saml += '\n\r\t' + elem.toSAML(1); // for elem = group/layer
        }
        saml += '\n\r</sa>';
        return saml;
    }
});