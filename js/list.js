var groupID = 0;
var layerID = 0;

var List = Class({
    initialize: function (headerName, groupName, editorContainer) {
        // Initialize Canvas Control
        this.page = $(document.getElementById('canvasctrl'));
        this.async = {
            hasSynced: true
        };
        // Set to true for initialization. It is set to false at end of initialization
        this.ready = true;

        // Initialize Side Bar
        $(".sidebar.left").sidebar().trigger("sidebar:close");

        Ps.initialize(this.page[0], {
            wheelSpeed: 0.2,
            wheelPropagation: false,
            minScrollbarLength: 20
        });

        this.header = $('<div data-role="header" class="ui-header ui-bar-inherit">');
        this.header.append('<h1 class="ui-title">' + headerName + '</h1>');

        this.container = $('<div data-role="main" class="ui-content">');
        this.page.append(this.header);
        this.page.append(this.container);

        this.mainGroup = new Group(groupName);

        this.editor = new Editor(editorContainer, this);

        this.movingElem = null;
        this.selectedElem = null;
        this.changeSelectedElem = function (elem) {
            if (elem.tagName == "A" || elem.tagName == "H2") {
                if (this.selectedElem != null) $(this.selectedElem).css("filter", "invert(0%)");
                $(elem).css("filter", "invert(100%)");
                this.selectedElem = elem;
            }
        };

        // Create Toggle Button
        this.toggleButton = $('<i id="canvasctrlbutton" class="material-icons button layer1 no-highlight cursor-pointer no-panning">&#xE8EF;</i>');
        this.toggleButton.click(function () {
            $(".sidebar.left").trigger("sidebar:toggle");
        });
        $(HTMLBody).append(this.toggleButton);
        document.onkeydown = function (e) {
            if (e.ctrlKey && (e.key === 'z' || e.key === 'y')) {
                e.preventDefault();
            }
            if (list.isRenamingLayer || !list.ready) return;
            if (e.key === 'Enter') { // Enter
               $('#canvasctrlbutton').click();
            }
            else if (e.key === 'Tab') {
                e.preventDefault(); // Disable TAB
            }
            else if (e.key == ' ') { // Triggers active element highlight
                var canvas = $('canvas')[0];
                if (canvas.isHighlightActive !== undefined) { // Have already triggered
                    return;
                }

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
            else if (!e.ctrlKey) return;
            /* Control + Key Commands */
            if (e.key === 's') { // Ctrl + S = Save
                editorToolbar.toolList.save.click();
            }
            else if (e.key === 'z') { // Ctrl + Z = Undo
                editorToolbar.toolList.undo.click();
            }
            else if (e.key === 'y') { // Ctrl + Y = Redo
                editorToolbar.toolList.redo.click();
            }
        }
        document.onkeyup = function (e) {
            if (list.isRenamingLayer || !list.ready) return;
            if (e.keyCode == 32) { // Wraps up active element highlight
                var canvas = $('canvas')[0];
                if (canvas.isHighlightActive) {
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

        this.elemMousedownEvtHandler = function () {
            var elem;
            var canvas = $('canvas')[0];
            var editor;
            try {
                editor = canvas.editor;
            }
            catch (err) {
                console.error('Canvas could not be found. It may not have been correctly initialized./n/t' + err.message);
            }
            try {
                var testEditor = editor.zoom;
            }
            catch (err) {
                console.error('No editor attached to canvas. It may not have been correctly initialized./n/t' + err.message);
            }
            editor.selectedLayer = null;
            if (this.elem.type == 'l') {
                elem = $(this);
                var myLayer = elem[0].elem;
                try {
                    var testMyLayer = myLayer.x;
                }
                catch (err) {
                    console.error('Selected layer was not found./n/t' + err.message);
                }

                editor.selectedLayer = myLayer;
                editor.layerCtrl.update(myLayer);
                var layerColor = Math.round(editor.selectedLayer.color);
                $('#colorSelector')
                    .spectrum('hide')
                    .spectrum('set', '#' + layerColor.toString(16));

                editor.showInterface();
                editor.refreshLayerEditBox();
                editor.disableGroupInteraction();
                editor.enableInteraction(myLayer);
            }
            else if (this.elem.type == 'g') {
                elem = $(this.parentNode);
                editor.hideInterface();
                editor.disableInteraction();
                editor.enableGroupInteraction(this.elem);

            }
            else {
                return; // Something bad happened
            }
            var index = elem.index();
            if (elem[0].group != undefined) {
                elem[0].group.activeElem = index;
                console.log("Selected elem. \"" + elem[0].group.elems[elem[0].group.activeElem].name + "\" from group \"" + elem[0].group.name + "\"");
            }
            else {
                console.log('Selected symbol art.');
            }
        };
        this.createGroupNode = function (name, subGroup, group, parentGroup, folder, forcedID) {
            var id = groupID;
            if (forcedID !== undefined) { id = forcedID; }
            var groupFolder = $('<div data-role="collapsible" id="' + id + '">');
            if (forcedID === undefined) groupID++;
            var header = $('<h2 class="context-menu-group">');
            let $headerName = $('<span>' + name + '</span>');
            header.append($headerName);
            groupFolder.append(header);
            var list = $('<ul data-role="listview" data-divider-theme="b">');
            list.css('margin-left', '1px');
            var menuType = 'SubGroupMenu';
            header[0].group = group;
            header[0].elem = group.elems[group.activeElem];
            header[0].parentFolder = folder; // Get reference to collapsible
            $(header).mousedown(this.elemMousedownEvtHandler);
            header.click(this.elemMousedownEvtHandler);
            header.on("swiperight", function () {
                $(this).contextMenu();
            });
            // Show menu when #myDiv is clicked
            header[0].list = this;
            header[0].focusinCallback = this.rename;
            header.on('click', function (e) {
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
            header.draggable({
                cursor: "move",
                helper: function (e) {
                    let name = e.currentTarget.elem.name;
                    let c0nt = $(e.currentTarget).contents();
                    return $("<div class='drag-ghost'>" + name + "</div>");
                }
            }).droppable();
            header.on("dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).addClass('dragging');
            });
            header.on("dragstart", function (event) {
                event.stopPropagation();
                $(this).addClass('dragging');
                this.list.changeMovingElem(this);
            });
            header.on("dragleave", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).removeClass('dragging');
            });
            header.on("drop", function (event) {
                if (event !== undefined) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                let movingElem = this.list.movingElem;
                if (movingElem.tagName == 'H2') movingElem = movingElem.parentNode;

                /* Check if moving upward or downward */
                let src = $(movingElem), dest = $(this.parentNode);
                src.addClass('layerCurrentlyMoving');
                dest.addClass('layerCurrentlyMoving');
                let $movingLayers = $('.layerCurrentlyMoving');
                var isForwardMove = true;
                if ($movingLayers[0] == dest[0]) isForwardMove = false;
                src.removeClass('layerCurrentlyMoving');
                dest.removeClass('layerCurrentlyMoving');

                /* Get layer that will now occupy the position of the moved layer */
                let currLayerInSrc;
                if (movingElem.group == this.parentNode.group
                    && !isForwardMove) currLayerInSrc = src.prev()[0];
                else currLayerInSrc = src.next()[0];
                // Check for exception where layer moved is the only layer in its group
                let emptyGroupException = false;
                if (currLayerInSrc === undefined) {
                    // Get the parent folder and indicate that this is an exception
                    currLayerInSrc = src.parent().parent().parent()[0];
                    emptyGroupException = true;
                }

                let isForward = this.list.move(this.list.movingElem, this);
                
                // Save undoable action for move
                historyManager.pushUndoAction('move', {
                    'srcLayerID': movingElem.id,
                    'currLayerInSrcID': currLayerInSrc.id,
                    'destLayerID': this.parentNode.id,
                    'isForward': isForward,
                    'async': this.list.async,
                    'emptyGroupException': emptyGroupException
                });
            });

            // Function to recursively delete all quads in editor pertaining to the removed group
            this.removeGroupFromEditor = function (group, editor) {
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

            return groupFolder;
        };
        this.createLayerNode = function (name, group, folder, forcedID) {
            var id = groupID;
            if (forcedID !== undefined) { id = forcedID; }
            var li = $('<li id="' + id + '" class="context-menu-layer" data-mini="true">');
            if (forcedID === undefined) groupID++;
            let $liATag = $('<a data-mini="true" data-role="button" data-transition="pop" style="text-shadow:none;">');
            let $liName = $('<span>' + name + '</span>');
            li.append($liATag);
            $liATag.append($liName);
            li[0].group = group;
            li[0].parentFolder = folder;
            li[0].elem = group.elems[group.activeElem];
            li[0].list = this;
            $(li).mousedown(this.elemMousedownEvtHandler);
            li.click(this.elemMousedownEvtHandler);
            // Show menu when right clicked
            li.on('click', function (e) {
                this.list.changeSelectedElem(this.firstChild);
            });
            li.on("swiperight", function () {
                $(this).contextMenu();
            });

            li[0].textbox = false;
            li[0].focusinCallback = this.rename;

            // For purposes of moving elements
            li.draggable({
                cursor: "move",
                helper: function (e) {
                    let name = e.currentTarget.elem.name;
                    return $("<div class='drag-ghost'>" + name + "</div>");
                }
            }).droppable();
            li.on("dragover", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).addClass('dragging');
            });

            li.on("dragstart", function (event) {
                event.stopPropagation();
                $(this).addClass('dragging');
                this.list.changeMovingElem(this);
            });
            li.on("dragleave", function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).removeClass('dragging');
            });
            li.on("drop", function (event) {
                if (event !== undefined) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                let movingElem = this.list.movingElem;
                if (movingElem.tagName == 'H2') movingElem = movingElem.parentNode;

                /* Check if moving upward or downward */
                let src = $(movingElem), dest = $(this);
                src.addClass('layerCurrentlyMoving');
                dest.addClass('layerCurrentlyMoving');
                let $movingLayers = $('.layerCurrentlyMoving');
                var isForwardMove = true;
                if ($movingLayers[0] == dest[0]) isForwardMove = false;
                src.removeClass('layerCurrentlyMoving');
                dest.removeClass('layerCurrentlyMoving');

                /* Get layer that will now occupy the position of the moved layer */
                let currLayerInSrc;
                if (movingElem.group == this.group
                    && !isForwardMove) currLayerInSrc = src.prev()[0];
                else currLayerInSrc = src.next()[0];
                // Check for exception where layer moved is the only layer in its group
                let emptyGroupException = false;
                if (currLayerInSrc === undefined) {
                    // Get the parent folder and indicate that this is an exception
                    currLayerInSrc = src.parent().parent().parent()[0];
                    emptyGroupException = true;
                }

                let isForward = this.list.move(this.list.movingElem, this);

                // Save undoable action for move
                historyManager.pushUndoAction('move', {
                    'srcLayerID': movingElem.id,
                    'currLayerInSrcID': currLayerInSrc.id,
                    'destLayerID': this.id,
                    'isForward': isForward,
                    'async': this.list.async,
                    'emptyGroupException': emptyGroupException
                });
            });

            return li;
        };

        $('canvas')[0].list = this;
        this.mainFolder = this.setupGroupAsMain(this.mainGroup);
        this.container.append(this.mainFolder);
        this.container.trigger('create');

        this.ready = false;
    },
    setReady: function (val) {
        if (val === true || val === false) this.ready = val;
    },
    rename: function () {
        if (!this.ready) return;
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
            list.isRenamingLayer = true;
            input.keypress(function (e) { // Update contents of layer/group
                e.stopPropagation();
                var elem = $(this);
                var parent = elem.parent().parent();
                if (parent[0].textbox) {
                    if (e.keyCode == 13) { // Enter Key
                        let newName = elem.val();
                        if (/^[a-z|A-Z|0-9].*[a-z|A-Z|0-9]$|^[a-z|A-Z|0-9]$/.test(newName)) { // Validade new name
                            var prevElem = $(elem[0].prevNode); // Retrieve prev display DOM elem
                            prevElem.children('span:first').text(newName); // Update name of elem in node
                            parent.append(prevElem);

                            let savedDOMElem = prevElem.parent();
                            let isLayer = true;
                            // If renaming a group, move from header to its parent that contains the ID
                            if (savedDOMElem[0].tagName == 'H2') {
                                savedDOMElem = savedDOMElem.parent();
                                isLayer = false;
                            }
                            // Save undoable action for this rename
                            historyManager.pushUndoAction('rename', {
                                'prevName': parent[0].elem.name,
                                'newName': newName,
                                'domElemID': savedDOMElem[0].id,
                                'isLayer': isLayer
                            });

                            if (parent[0].group != this.mainGroup) {
                                console.log('%cRenamed%c layer "%s" from group "%s" to "%s".',
                                    'color: #2fa1d6', 'color: #f3f3f3', parent[0].elem.name,
                                    parent[0].group.name, newName);
                            }
                            else {
                                console.log('%cRenamed%c symbol art from "%s" to "%s".',
                                    'color: #2fa1d6', 'color: #f3f3f3', parent[0].elem.name, newName);
                            }
                            parent[0].elem.name = newName;
                            parent[0].textbox = false;
                            elem.remove();
                            parent.trigger('create');
                            prevElem.focus();
                            list.isRenamingLayer = undefined;
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
    move: function (srcElem, destElem, noLog, isForwardMove) {
        if (!this.ready) return;
        if (!this.async.hasSynced
            || srcElem == destElem) return;
        var src;

        /* Select layers in editor to move */
        var layersToMove = [];
        if (srcElem.elem.type == 'l') {
            src = $(srcElem);
            layersToMove.push($('canvas')[0].editor.removeLayer(srcElem.elem));
        }
        else if (srcElem.elem.type == 'g') {
            src = $(srcElem).parent();
            for (var i in srcElem.elem.elems) {
                layersToMove.push($('canvas')[0].editor.removeLayer(srcElem.elem.elems[i]));
            }
        }

        /* Get corrent DOM node with embedded layer information */
        var dest;
        if (destElem.tagName == 'UL') {
            dest = $(destElem.parentNode.parentNode.firstChild);
        }
        else {
            if (destElem.elem.type == 'l') {
                dest = $(destElem);
            }
            else if (destElem.elem.type == 'g') {
                dest = $(destElem).parent();
            }
        }

        /* Check if moving upward or downward */
        if (isForwardMove === undefined) {
            src.addClass('layerCurrentlyMoving');
            dest.addClass('layerCurrentlyMoving');
            let $movingLayers = $('.layerCurrentlyMoving');
            isForwardMove = true;
            if ($movingLayers[0] == dest[0]) isForwardMove = false;
            src.removeClass('layerCurrentlyMoving');
            dest.removeClass('layerCurrentlyMoving');
        }

        var srcIndex = src.index(), destIndex = dest.index();
        // Preventive error checking
        if (srcIndex < 0) throw new Error(
            'List.move(): Source layer index was not found.');
        if (destIndex < 0) throw new Error(
            'List.move(): Target layer index was not found.');
        if (srcElem.group.elems[srcIndex] != srcElem.elem) throw new Error(
            'List.move(): Source layer index does not match index in data.');
        if (destElem.tagName != 'UL' // Doesn't apply to the UL exceptional case
            && destElem.group.elems[destIndex] != destElem.elem) throw new Error(
            'List.move(): Target layer index does not match index in data.');

        var callback = function () {
            var editor = $('canvas')[0].editor;

            /* DOM element movement animation */
            // Check special case when target is the list and not a layer
            if (destElem.tagName == 'UL') {
                let tempLI = $('#temporaryLI');
                src.insertAfter(tempLI);
                $('#temporaryLI').remove();
            }
            else {
                $('#temporaryLI').remove();
                if (srcElem.group == destElem.group 
                    && isForwardMove) src.insertAfter(dest);
                else src.insertBefore(dest);
            }

            /* Data movement */
            let srcOrigGroup = srcElem.group;
            srcElem.group.elems.splice(srcIndex, 1);

            // Get up-to-date index of target layer after changing the source
            let newSrcIndex = src.index();

            if (destElem.tagName == 'UL') {
                let headerNode = dest[0];
                headerNode.elem.elems.push(srcElem.elem);
                srcElem.group = headerNode.elem;
                srcElem.elem.parent = headerNode.elem;
                srcElem.parentFolder = headerNode.parentNode;
                destElem = headerNode; // For logging purposes
            }
            else {
                destElem.group.elems.splice(newSrcIndex, 0, srcElem.elem);
                srcElem.group = destElem.group;
                srcElem.elem.parent = destElem.group;
                srcElem.parentFolder = destElem.parentFolder;
            }

            editor.refreshDisplay();
            editor.render();

            /* Logging */
            if (noLog === undefined) {
                let msg = '%cMoved%c layer/group "%s" from index %i of group "%s" to index %i of group "%s"';
                if (isForwardMove) console.log(msg + ' after layer/group "%s".',
                        'color: #2fa1d6', 'color: #f3f3f3', srcElem.elem.name, srcIndex,
                        srcOrigGroup.name, newSrcIndex, destElem.group.name, destElem.elem.name);
                else console.log(msg + ' before layer/group "%s".',
                        'color: #2fa1d6', 'color: #f3f3f3', srcElem.elem.name, srcIndex,
                        srcOrigGroup.name, newSrcIndex, destElem.group.name, destElem.elem.name);
            }
        };

        this.async.hasSynced = false;
        console.log('%cWaiting for application to sync again after moving layers.', 'color: #aaa');
        src.slideUp(100, callback).slideDown(100, function () {
            src.click();
            list.async.hasSynced = true;
            console.log('%cApplication synced again after moving layers.', 'color: #aaa');
        });

        return isForwardMove;
    },
    changeMovingElem: function (elem) {
        if (!this.ready) return;
        $(this.movingElem).children(':first').children().remove('i');
        this.movingElem = elem;
        $(elem).children(':first').append('<i class="fa fa-check-square-o moving-checkbox">');
    },
    addFolder: function (name, folder, forcedID) {
        if (!this.ready) return;
        if (!this.async.hasSynced) return;
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var parentGroup = folder.group;
        if (parentGroup === undefined) parentGroup = this.mainGroup;
        var group = folder.subGroup;
        if (group === undefined) group = this.mainGroup;

        var subGroup = group.addSubGroup(name);
        var groupFolder = this.createGroupNode(name, subGroup, group, parentGroup, folder, forcedID);
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
        
        groupFolder.children(":eq(0)").focusin().click();

        if (forcedID === undefined) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': groupFolder[0].id
            });
        }

        let headerNode = groupFolder[0].firstChild;
        console.log('%cAdded%c group "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', headerNode.elem.name, headerNode.group.name,
            headerNode.group.elems.indexOf(headerNode.elem));
    },
    addFolderAtEnd: function (name, folder, forcedID) {
        if (!this.ready) return;
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var parentGroup = folder.group;
        if (parentGroup === undefined) parentGroup = this.mainGroup;
        var group = folder.subGroup;
        if (group === undefined) group = this.mainGroup;

        var subGroup = group.addSubGroupAtEnd(name);
        var groupFolder = this.createGroupNode(name, subGroup, group, parentGroup, folder, forcedID);
        $(parentNode.firstChild).append(groupFolder);

        $(folder).trigger('create');

        groupFolder.children(":eq(0)").focusin().click();

        if (forcedID === undefined) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': groupFolder[0].id
            });
        }

        let headerNode = groupFolder[0].firstChild;
        console.log('%cAdded%c group "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', headerNode.elem.name, headerNode.group.name,
            headerNode.group.elems.indexOf(headerNode.elem));
    },
    addElem: function (name, folder, forcedID) {
        if (!this.ready) return;
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        var layer = subGroup.addLayer(name);
        var li = this.createLayerNode(name, subGroup, folder, forcedID);
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
        li.click();

        if (forcedID === undefined) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': li[0].id
            });
        }

        console.log('%cAdded%c layer "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', li[0].elem.name, li[0].group.name,
            li[0].group.elems.indexOf(li[0].elem));

        return li;
    },
    addElemAtEnd: function (name, folder, forcedID) {
        if (!this.ready) return;
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        var layer = subGroup.addLayerAtEnd(name);
        var li = this.createLayerNode(name, subGroup, folder, forcedID);
        $(parentNode.firstChild).append(li);

        $(folder).trigger('create');

        var lis = $(this.container).find('li');
        var index = lis.index(li);
        this.editor.addLayerAt(layer, index);
        this.editor.render();

        li.focusin();
        li.click();

        if (forcedID === undefined) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': li[0].id
            });
        }

        console.log('%cAdded%c layer "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', li[0].elem.name, li[0].group.name,
            li[0].group.elems.indexOf(li[0].elem));

        return li;
    },
    removeElem: function (id) {
        if (!this.ready) return;
        let removedSubtree = null;
        if (typeof id === 'string') removedSubtree = this.extractSubtree(id);
        if (removedSubtree == null) {
            console.err('List (%O): Could not remove branch with id %i.', this, id);
        }
        else {
            // Save undoable action for remove
            historyManager.pushUndoAction('remove', {
                'elemID': id,
                'subtree': removedSubtree
            });

            // Change editor focus to the folder of the removed branch
            let parentDOM = removedSubtree.parentDOM;
            $(parentDOM.firstChild).click().click();

            console.log('%cRemoved%c layer "%s" in group "%s" at position "%i".',
                'color: #2fa1d6', 'color: #f3f3f3', removedSubtree.dataElem.name,
                removedSubtree.dataGroup.name, removedSubtree.indexInGroup);
        }
    },
    setupGroupAsMain: function (group) {
        if (!this.ready) return;
        var groupFolder = $('<div data-role="collapsible" id="' + groupID + '">'); groupID++;
        var header = $('<h2 onmousedown="return false" class="context-menu-symbol-art">' + group.name + '</h2>');
        groupFolder.append(header);
        var list = $('<ul data-role="listview" data-divider-theme="b">');
        var menuType = 'MainGroupMenu';
        header[0].elem = group;
        header[0].list = this;
        header[0].focusinCallback = this.rename;
        header.mousedown(this.elemMousedownEvtHandler);
        header.click(this.elemMousedownEvtHandler);
        header.on("swiperight", function () {
            $(this).contextMenu();
        });
        header.on('click', function (e) {
            this.list.changeSelectedElem(this.firstChild);
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
        groupFolder.append(list);
        groupFolder[0].list = list;
        return groupFolder;
    },
    extractSubtree: function (id) {
        if (!this.ready) return;
        /* Validate parameter */
        if (id === undefined || id < 0 || id > groupID) return null;

        /* get references from application */
        let $holder = $('#' + id);
        let $elem = $holder;
        if ($elem.length == 0) return null;
        let isLayer = true;
        if ($elem[0].tagName == 'DIV') {
            isLayer = false;
            $elem = $($elem[0].firstChild);
        }
        let dataElem = $elem[0].elem;
        let parentFolderID = $holder.parent().parent().parent()[0].id;

        /* extract data from application */
        // remove DOM subtree
        $holder.detach();
        // remove data
        let dataGroup = dataElem.parent;
        let indexInGroup = dataGroup.elems.indexOf(dataElem);
        if (indexInGroup > -1) {
            dataGroup.elems.splice(indexInGroup, 1);
        }
        else return null;

        this.editor.refreshDisplay();
        this.editor.render();

        return {
            subtreeDOMid: id,
            parentDOMid: parentFolderID,
            subtreeDOM: $holder[0],
            parentDOM: $elem[0].parentFolder,
            isLayer: isLayer,
            indexInGroup: indexInGroup,
            dataGroup: dataGroup,
            dataElem: dataElem
        }
    },
    insertSubtree: function (extr) {
        if (!this.ready) return;
        /* Validate parameter */
        if (extr.subtreeDOMid === undefined || extr.parentDOMid === undefined
            || extr.subtreeDOM === undefined || extr.parentDOM === undefined
            || extr.isLayer === undefined || extr.indexInGroup === undefined
            || extr.dataGroup === undefined || extr.dataElem === undefined) return -1;

        /* insert subtree into application */
        // insert DOM subtree
        let $parentFolder = $('#' + extr.parentDOMid);
        if ($parentFolder[0] != extr.parentDOM) return -2;
        let $parentDOMList = $($parentFolder[0].children[1].firstChild);
        if (extr.indexInGroup <= 0) { // Check if inserting at first position
            $parentDOMList.prepend(extr.subtreeDOM);
        }
        else { // If not, add at the specified index
            $parentDOMList.children().eq(extr.indexInGroup - 1).after(extr.subtreeDOM);
        }
        // insert data
        if (extr.indexInGroup > -1) {
            extr.dataGroup.elems.splice(extr.indexInGroup, 0, extr.dataElem);
        }

        this.editor.refreshDisplay();
        this.editor.render();

        return 0;
    },
    toSAML: function () {
        if (!this.ready) return;
        var saml = '<?xml version="1.0" encoding="utf-8"?>\n<sa name="' + this.mainGroup.name + '" visible="true" version="4" author="0" width="192" height="96" sound="0">';
        for (var i = 0; i < this.mainGroup.elems.length; i++) {
            var elem = this.mainGroup.elems[i];
            saml += '\n\r\t' + elem.toSAML(1); // for elem = group/layer
        }
        saml += '\n\r</sa>';
        return saml;
    }
});