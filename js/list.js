var groupID = 0;
var layerID = 0;
var LAYER_NAME_REGEX = /^[!-~\u3001-\u303F\u3041-\u3096\u3099-\u30FF\u3400-\u4DB5\u4E00-\u9FE6\uFF01-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\uFFE0-\uFFE6\uFFE8-\uFFEE][ -~\u3000-\u303F\u3041-\u3096\u3099-\u30FF\u3400-\u4DB5\u4E00-\u9FE6\uFF01-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\uFFE0-\uFFE6\uFFE8-\uFFEE]*$/;
var SAConfig = {
    version: 1, // Symbol Art Version (not application version)
    authorID: 0 // Player ID
}

var list;

var List = Class({
    initialize: function (headerName, groupName, editorContainer) {
        if (list !== undefined) return;
        list = this;
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

        this.mainGroup = new Group(groupName);
        this.editor = new Editor(editorContainer, this);

        this.header = $('<div data-role="header" class="layerman-header ui-header ui-bar-inherit">');
        this.header.append(
            '<h1 class="ui-title no-panning no-highlight cursor-default">'
            + headerName + ' (<span id="layerCountDisplay">0</span> / '
            + MAX_NUM_LAYERS + ')</h1>');


        this.container = $('<div data-role="main" class="ui-content">');
        this.page.append(this.header);
        this.page.append(this.container);
        // For Copy/Paste Purposes
        this.copiedInfo = null;

        this.movingElem = null;
        this.selectedElem = null;
        this.changeSelectedElem = function (elem) {
            if (elem.tagName == "A" || elem.tagName == "H2") {
                if (this.selectedElem != null && this.selectedElem != elem
                    && this.selectedElem.parentNode.tagName == 'H2') {
                    this.selectedElem.parentNode.parentNode.isFirstClick = true;
                }
                if (this.selectedElem != null) $(this.selectedElem).removeClass('elem-selected');
                $(elem).addClass('elem-selected');
                this.selectedElem = elem;
            }
        };

        // Create Toggle Button
        this.toggleButton = $('<i id="canvasctrlbutton" class="material-icons button layer1 no-highlight cursor-pointer no-panning">&#xE8EF;</i>');
        this.toggleButton[0].hasScrolled = false;
        this.toggleButton[0].prevScrollPos = 0;
        this.toggleButton.click(function () {
            let $layerMan = $("#canvasctrl");
            if (list.selectedElem && list.selectedElem != null
                && $('#canvasctrl').css('left') != '0px') {
                $layerMan.scrollTop(0);
                list.selectedElem.scrollIntoView();
                let newHeight = list.selectedElem.getBoundingClientRect().top;
                let newScroll = $layerMan.scrollTop();
                if (newHeight < window.innerHeight / 2)
                    $layerMan.scrollTop(newScroll - window.innerHeight / 2);
                else
                    $layerMan.scrollTop(newScroll + window.innerHeight / 2);
            }
            $(".sidebar.left").trigger("sidebar:toggle");
        });
        $(HTMLBody).append(this.toggleButton);
        document.onkeydown = function (e) {
            if (e.ctrlKey && (e.key === 'z' || e.key === 'y')) {
                e.preventDefault();
            }
            if (list.renamingLayer || !list.ready) return;
            if (e.key === 'Enter') { // Enter
               $('#canvasctrlbutton').click();
            }
            else if (e.key === 'Tab') {
                e.preventDefault(); // Disable TAB
            }
            else if (e.key == ' ') { // Space = Triggers active element highlight
                let editor = $('canvas')[0].editor;
                if (editor.highlightedLayers !== null) { // Have already triggered
                    return;
                }

                var elem = list.selectedElem.parentNode.elem;
                if (elem.type == 'l') {
                    editor.setHighlightedLayers(elem);
                }
                else if (elem.type == 'g' && elem.elems.length > 0) {
                    let $lisInGroup = $(list.selectedElem.parentNode.parentNode).find('li');
                    let length = $lisInGroup.length;
                    let firstLayerElem = ($lisInGroup[0]) ? $lisInGroup[0].elem : undefined;
                    editor.setHighlightedLayers(firstLayerElem, length);
                }
                list.editor.render();
            }
            else if (!e.ctrlKey) return;
            /* Control + Key Commands */
            if (e.key === 's') { // Ctrl + S = Save
                e.preventDefault();
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
            if (list.renamingLayer || !list.ready) return;
            if (e.keyCode == 32) { // Space = Wraps up active element highlight
                let editor = $('canvas')[0].editor;
                if (editor.highlightedLayers !== null) {
                    editor.stopHighlightingLayers();
                    editor.render();
                }
            }
        }

        this.elemMousedownEvtHandler = function () {
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
            let elem = $(this);
            let group = elem[0].group;
            if (this.elem.type == 'l') {
                var myLayer = elem[0].elem;
                try {
                    var testMyLayer = myLayer.x;
                }
                catch (err) {
                    console.error('Selected layer was not found./n/t' + err.message);
                }

                $('#colorSelector').spectrum('hide');
                editor.selectedLayer = myLayer;
                editor.layerCtrl.update(myLayer);
                var layerColor = Math.round(editor.selectedLayer.color);
                $('#colorSelector')
                    .spectrum('set', '#' + layerColor.toString(16));

                if (editor.highlightedLayers != null) {
                    editor.setHighlightedLayers(myLayer);
                    editor.render();
                }

                editor.hideInterface(); // To hide if layer is hidden
                editor.showInterface(); // To show if layer is visible
                editor.refreshLayerEditBox();
                editor.disableGroupInteraction();
                editor.enableInteraction(myLayer);
            }
            else if (this.elem.type == 'g') {
                elem = elem.parent();
                editor.hideInterface();
                editor.disableInteraction();
                if (!elem.hasClass('symbol-hidden')) { // Interaction only when visible
                    editor.enableGroupInteraction(this.elem);
                    editor.overlayImg.toggleController(false);
                }
                
                if (editor.highlightedLayers != null) {
                    var $lisInGroup = $(elem[0]).find('li');
                    var length = $lisInGroup.length;
                    let firstLayerElem = ($lisInGroup[0]) ? $lisInGroup[0].elem : undefined;
                    editor.setHighlightedLayers(firstLayerElem, length);
                    editor.render();
                }
            }
            else {
                return; // Something bad happened
            }
            var index = elem.index();
            if (group != undefined) {
                group.activeElem = index;
                console.log("Selected elem. \"" + group.elems[group.activeElem].name 
                    + "\" from group \"" + group.name + "\"");
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
            let listview = $('<ul data-role="listview" data-divider-theme="b">');
            var menuType = 'SubGroupMenu';
            header[0].group = group;
            header[0].elem = group.elems[group.activeElem];
            header[0].parentFolder = folder; // Get reference to collapsible
            header.click(this.elemMousedownEvtHandler);
            header.on("swiperight", function () {
                $(this).contextMenu();
            });
            // Show menu when #myDiv is clicked
            header.on('click', function (e) {
                list.changeSelectedElem(this.firstChild);
            });
            groupFolder[0].isFirstClick = true;
            $(groupFolder).on('collapsibleexpand', function (e) {
                e.stopPropagation();
            }).on('collapsiblecollapse', function (e) {
                e.stopPropagation();
                if (groupFolder[0].isFirstClick) {
                    $(this).children(':first').click();
                    groupFolder[0].isFirstClick = false;
                }
                else
                    groupFolder[0].isFirstClick = true;
            });
            groupFolder.append(listview);
            groupFolder[0].list = listview;
            groupFolder[0].group = group;
            groupFolder[0].subGroup = subGroup;

            // For purposes of moving elements
            header.draggable({
                cursor: "move",
                helper: function (e) {
                    let domElem = e.currentTarget;
                    if (!domElem.elem) return;
                    let name = domElem.elem.name;
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
                list.changeMovingElem(this);
                try {
                    $('.drag-ghost').css('margin-left', (event.offsetX));
                    $('.drag-ghost').css('margin-top', (event.offsetY));
                }
                catch (err) { };
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
                list.moveSelectedElemTo(this);
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
            let $liImg = $('<img class="elem-symbol-preview">');
            li.append($liATag);
            $liATag.append($liName);
            $liATag.append($liImg);
            li[0].group = group;
            li[0].parentFolder = folder;
            li[0].elem = group.elems[group.activeElem];
            li.click(this.elemMousedownEvtHandler);
            // Show menu when right clicked
            li.on('click', function (e) {
                list.changeSelectedElem(this.firstChild);
            });
            li.on("swiperight", function () {
                $(this).contextMenu();
            });

            li[0].textbox = false;

            // For purposes of moving elements
            li.draggable({
                cursor: "move",
                helper: function (e) {
                    let domElem = e.currentTarget;
                    if (!domElem.elem) return;
                    let name = domElem.elem.name;
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
                list.changeMovingElem(this);
                try {
                    $('.drag-ghost').css('margin-left', (event.offsetX));
                    $('.drag-ghost').css('margin-top', (event.offsetY));
                }
                catch (err) {};
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
                list.moveSelectedElemTo(this);
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
    updateLayerCountDisplay: function () {
        let $cntHeader = $('#layerCountDisplay');
        $cntHeader.text(this.editor.layers.length);
    },
    rename: function (domElem) {
        if (!list.ready) return;
        $(domElem).addClass('renamingDOMElem');
        setTimeout(function () {
            var parent = $('.renamingDOMElem');
            parent.removeClass('renamingDOMElem');
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
                list.renamingLayer = input;
                input.keydown(function (e) { // Update contents of layer/group
                    e.stopPropagation();
                    var elem = $(this);
                    var parent = elem.parent().parent();
                    if (parent[0].textbox) {
                        if (e.keyCode == 13) { // Enter Key
                            let newName = elem.val().trim();
                            if (LAYER_NAME_REGEX.test(newName)
                                && newName != parent[0].elem.name) { // Validade new name and check if it changed
                                var prevElem = $(elem[0].prevNode); // Retrieve prev display DOM elem
                                prevElem.children('span:first').text(newName); // Update name of elem in node

                                let savedDOMElem = parent;
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
                                this.blur();
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
                    list.renamingLayer = undefined;
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
        }, 100);
    },
    moveSelectedElemTo: function (destElem) {
        if (list.movingElem === null || list.movingElem === undefined
            || !(list.movingElem instanceof Element)
            || list.movingElem == destElem) return;
        let movingSrcElem = list.movingElem;
        if (movingSrcElem.tagName == 'H2') movingSrcElem = movingSrcElem.parentNode;
        let movingDestElem = destElem;
        if (movingDestElem.tagName == 'H2') movingDestElem = movingDestElem.parentNode;

        /* Check if moving upward or downward */
        let src = $(movingSrcElem), dest = $(movingDestElem);
        src.addClass('layerCurrentlyMoving');
        dest.addClass('layerCurrentlyMoving');
        let $movingLayers = $('.layerCurrentlyMoving');
        var isForwardMove = true;
        if ($movingLayers[0] == dest[0]) isForwardMove = false;
        src.removeClass('layerCurrentlyMoving');
        dest.removeClass('layerCurrentlyMoving');

        /* Get layer that will now occupy the position of the moved layer */
        let currLayerInSrc;
        if (list.movingElem.group == destElem.group
            && !isForwardMove) currLayerInSrc = src.prev()[0];
        else {
            let nxtLayer = src.next();
            if (nxtLayer.hasClass('drag-ghost'))
                nxtLayer = nxtLayer.next();
            currLayerInSrc = nxtLayer[0];
        }
        // Check for exception where layer moved is the only layer in its group
        let emptyGroupException = false;
        if (currLayerInSrc === undefined) {
            // Get the parent folder and indicate that this is an exception
            currLayerInSrc = src.parent().parent().parent()[0];
            emptyGroupException = true;
        }

        let isForward = list.move(list.movingElem, destElem);

        // Save undoable action for move
        historyManager.pushUndoAction('move', {
            'srcLayerID': movingSrcElem.id,
            'currLayerInSrcID': currLayerInSrc.id,
            'destLayerID': movingDestElem.id,
            'isForward': isForward,
            'async': list.async,
            'emptyGroupException': emptyGroupException
        });
    },
    move: function (srcElem, destElem, noLog, isForwardMove) {
        if (!this.ready) return;
        if (!this.async.hasSynced
            || srcElem == destElem) return;
        // Check if trying to nest a group somewhere inside itself
        if (srcElem.elem.type == 'g' && $.contains(srcElem.parentNode, destElem)) {
            alertManager.pushAlert('Cannot move group inside itself');
            return;
        }
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
            editor.refreshHighlightedLayers();
            editor.render();
            list.updateDOMGroupVisibility(list.mainFolder[0]);
            $(srcElem).click();

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
    addFolder: function (name, folder, forcedID, notSaveHistory) {
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
            if (index <= 0) {
                $(parentNode.firstChild).prepend(groupFolder);
            }
            else {
                groupFolder.insertAfter(parentNode.firstChild.children[group.activeElem - 1]);
            }
        }

        $(folder).trigger('create');
        
        groupFolder.children(":eq(0)").focusin().click();
        this.updateDOMGroupVisibility(this.mainFolder[0]);

        if (forcedID === undefined && !notSaveHistory) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': groupFolder[0].id
            });
        }

        let headerNode = groupFolder[0].firstChild;
        console.log('%cAdded%c group "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', headerNode.elem.name, headerNode.group.name,
            headerNode.group.elems.indexOf(headerNode.elem));

        return groupFolder;
    },
    addFolderAtEnd: function (name, folder, forcedID, notSaveHistory) {
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
        if (!isLoadingSAML) this.updateDOMGroupVisibility(this.mainFolder[0]);

        if (forcedID === undefined && !notSaveHistory) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': groupFolder[0].id
            });
        }

        let headerNode = groupFolder[0].firstChild;
        console.log('%cAdded%c group "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', headerNode.elem.name, headerNode.group.name,
            headerNode.group.elems.indexOf(headerNode.elem));

        return groupFolder;
    },
    addElem: function (name, folder, forcedID, notSaveHistory) {
        if (!this.ready) return null;
        if (this.editor.isFull()) {
            console.log(
            '%cLayer Manager:%c Could not add layer because editor is full (%i/%i).',
            'color: #a6cd94', 'color: #d5d5d5', this.editor.layers.length, MAX_NUM_LAYERS);
            alertManager.pushAlert('Cannot add layer because Symbol Art is full.');
            return null;
        }
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        var layer = subGroup.addLayer(name);
        var li = this.createLayerNode(name, subGroup, folder, forcedID);
        li.children().find('img')[0].src = partsInfo.path + partsInfo.dataArray[layer.part] + partsInfo.imgType;
        if (parentNode.firstChild.children.length == 0) {
            $(parentNode.firstChild).append(li);
        }
        else {
            var index = subGroup.activeElem;
            if (index <= 0) {
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
        this.updateDOMGroupVisibility(this.mainFolder[0]);

        if (forcedID === undefined && !notSaveHistory) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': li[0].id
            });
        }

        console.log('%cAdded%c layer "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', li[0].elem.name, li[0].group.name,
            li[0].group.elems.indexOf(li[0].elem));

        this.updateLayerCountDisplay();
        return li;
    },
    addElemAtEnd: function (name, folder, forcedID, notSaveHistory) {
        if (!this.ready) return null;
        if (this.editor.isFull()) {
            console.log(
            '%cLayer Manager:%c Could not add layer because editor is full (%i/%i).',
            'color: #a6cd94', 'color: #d5d5d5', this.editor.layers.length, MAX_NUM_LAYERS);
            alertManager.pushAlert('Cannot add layer because Symbol Art is full.');
            return null;
        }
        if (folder === undefined) folder = this.container[0].firstChild;
        var parentNode = folder.children[1]; // Get list of node elems from folder

        var group = folder.group;
        if (group === undefined) group = this.mainGroup;
        var subGroup = folder.subGroup;
        if (subGroup === undefined) subGroup = this.mainGroup;

        var layer = subGroup.addLayerAtEnd(name);
        var li = this.createLayerNode(name, subGroup, folder, forcedID);
        li.children().find('img')[0].src = partsInfo.path + partsInfo.dataArray[layer.part] + partsInfo.imgType;
        $(parentNode.firstChild).append(li);

        $(folder).trigger('create');

        var lis = $(this.container).find('li');
        var index = lis.index(li);
        this.editor.addLayerAt(layer, index);
        this.editor.render();

        li.focusin();
        li.click();
        if (!isLoadingSAML) this.updateDOMGroupVisibility(this.mainFolder[0]);

        if (forcedID === undefined && !notSaveHistory) {
            // Save undoable action for add
            historyManager.pushUndoAction('add', {
                'elemID': li[0].id
            });
        }

        console.log('%cAdded%c layer "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', 'color: #f3f3f3', li[0].elem.name, li[0].group.name,
            li[0].group.elems.indexOf(li[0].elem));

        this.updateLayerCountDisplay();
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
            $(parentDOM.firstChild).click();
            this.updateDOMGroupVisibility(this.mainFolder[0]);

            console.log('%cRemoved%c layer "%s" in group "%s" at position "%i".',
                'color: #2fa1d6', 'color: #f3f3f3', removedSubtree.dataElem.name,
                removedSubtree.dataGroup.name, removedSubtree.indexInGroup);
            this.updateLayerCountDisplay();
        }
    },
    copyElem: function (domElem) {
        if (domElem === undefined || !(domElem instanceof Element)) {
            console.warn(
            '%cLayer Manager (%O):%c Could not copy provided element %O.',
            'color: #a6cd94', this, 'color: #d5d5d5', domElem);
            return;
        }
        let info = null;
        if (domElem.tagName == 'LI') info = {
            subtree: domElem.elem,
            type: 'l',
        };
        else if (domElem.tagName == 'H2') info = {
            subtree: domElem.elem,
            type: 'g',
        };
        else if (domElem.tagName == 'DIV') {
            if (domElem.children[0] !== undefined
                && domElem.children[0].tagName == 'H2')
                info = {
                    subtree: domElem.children[0].elem,
                    type: 'g',
                };
        }
        if (info === undefined || info == null) {
            console.warn(
            '%cLayer Manager (%O):%c Could not copy provided element %O '
            + 'because no layer/group information could be found in it '
            + '(info obtained: %O).',
            'color: #a6cd94', this, 'color: #d5d5d5', domElem, info);
            return;
        }
        var numCopiedLayers = 0;
        info.subtree = copySubtree(info.subtree);
        info.layerCnt = numCopiedLayers;
        list.copiedInfo = info;
        if (info.type == 'l')
            alertManager.pushAlert('Copied Symbol');
        else if (info.type == 'g')
            alertManager.pushAlert('Copied Group');
        /* Takes a snapshot of the layer subtree at root subtree */
        function copySubtree(subtree, parent) {
            let elem;
            if (subtree.type == 'l') {
                elem = new Layer('', undefined, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, true);
                elem.pasteFrom(subtree);
                if (parent !== undefined && parent.type == 'g') {
                    elem.parent = parent;
                }
                numCopiedLayers++;
            }
            else if (subtree.type == 'g') {
                elem = new Group(subtree.name, true);
                if (parent !== undefined && parent.type == 'g') {
                    elem.parent = parent;
                }
                elem.visible = subtree.visible;
                for (var i = 0; i < subtree.elems.length; i++) {
                    elem.elems.push(
                        copySubtree(subtree.elems[i], elem)
                        );
                }
            }
            return elem;
        }
    },
    pasteOnElem: function (domElem, dataElem) {
        if (domElem === undefined || !(domElem instanceof Element)
            || !(/^(LI|H2|DIV)$/.test(domElem.tagName))) {
            console.warn(
            '%cLayer Manager (%O):%c Could not paste on provided element %O.',
            'color: #a6cd94', this, 'color: #d5d5d5', domElem);
            return;
        }
        if (list.copiedInfo === undefined) {
            console.warn(
            '%cLayer Manager (%O):%c Could not paste because no valid copied info was found.',
            'color: #a6cd94', this, 'color: #d5d5d5', list.copiedInfo);
            return;
        }
        if (list.copiedInfo == null) {
            console.log(
            '%cLayer Manager:%c Could not paste because nothing was copied.',
            'color: #a6cd94', 'color: #d5d5d5');
            return;
        }
        if (list.editor.layers.length + list.copiedInfo.layerCnt >= MAX_NUM_LAYERS) {
            console.log(
            '%cLayer Manager:%c Could not paste to element %O '
            + 'because editor layer capacity would be exceeded (%i / %i).',
            'color: #a6cd94', 'color: #d5d5d5', domElem, list.copiedInfo.layerCnt,
            MAX_NUM_LAYERS);
            alertManager.pushAlert('Cannot paste because Symbol Art would exceed layer limit.');
            return;
        }
        let selector;
        if (/^(LI|H2)$/.test(domElem.tagName)) {
            selector = $(domElem);
        }
        else if (/^(DIV)$/.test(domElem.tagName)) {
            selector = $(domElem.firstChild);
        }
        selector.click(); // Select the layer/group before editting
        let toPaste = dataElem || list.copiedInfo.subtree;

        // Temporarily disable normal logging for loading purposes
        let savedConsoleLogCallback = console.log;
        console.log = function () { }
        try {
            if (toPaste.type == 'l') {
                let $li = list.addElem(toPaste.name, selector[0].parentFolder,
                    undefined, true);
                $li[0].elem.pasteFrom(toPaste);
                $li.find('img')[0].src = partsInfo.path
                    + partsInfo.dataArray[toPaste.part] + partsInfo.imgType;
                list.editor.refreshDisplay();
                list.editor.refreshLayerEditBox();
                list.editor.render();
                $li.click();
                // Restore normal logging functionality
                console.log = savedConsoleLogCallback;
                // Save Action
                historyManager.pushUndoAction('paste', {
                    'elemID': $li[0].id
                });
                console.log('%cPasted%c layer %O in group %O at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', $li[0].elem, $li[0].elem.parent,
                    $li[0].elem.parent.elems.indexOf($li[0].elem));
                alertManager.pushAlert('Pasted symbol');
            }
            else if (toPaste.type == 'g') {
                let $div = list.addFolder(toPaste.name, selector[0].parentFolder,
                    undefined, true);
                let $h2 = $div[0].firstChild;
                let group = $h2.elem;
                group.name = toPaste.name;
                group.visible = toPaste.visible;
                for (var i = 0; i < toPaste.elems.length; i++) {
                    pasteSubtree($div[0], toPaste.elems[i]);
                }
                list.editor.refreshDisplay();
                list.editor.render();
                $h2.click();
                // Restore normal logging functionality
                console.log = savedConsoleLogCallback;
                // Save Action
                historyManager.pushUndoAction('paste', {
                    'elemID': $div[0].id
                });
                console.log('%cPasted%c group %O in group %O at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', group, group.parent,
                    group.parent.elems.indexOf(group));
                alertManager.pushAlert('Pasted group');
            }
        }
        catch (e) {
            // Restore normal logging functionality
            console.log = savedConsoleLogCallback;
            throw e;
        }

        function pasteSubtree(domElem, dataElem) {
            let selector;
            if (/^(H2)$/.test(domElem.tagName)) {
                selector = $(domElem);
            }
            else if (/^(DIV)$/.test(domElem.tagName)) {
                selector = $(domElem.firstChild);
            }
            selector.click(); // Select the layer/group before editting
            let toPaste = dataElem || list.copiedInfo.subtree;
            if (toPaste.type == 'l') {
                let $li;
                $li = list.addElemAtEnd(toPaste.name, selector.parent()[0],
                    undefined, true);
                $li[0].elem.pasteFrom(toPaste);
                $li.find('img')[0].src = partsInfo.path
                    + partsInfo.dataArray[toPaste.part] + partsInfo.imgType;
            }
            else if (toPaste.type == 'g') {
                let $div;
                $div = list.addFolderAtEnd(toPaste.name, selector.parent()[0],
                    undefined, true);
                let $h2 = $div[0].firstChild;
                let group = $h2.elem;
                group.name = toPaste.name;
                group.visible = toPaste.visible;
                for (var i = 0; i < toPaste.elems.length; i++) {
                    pasteSubtree($div[0], toPaste.elems[i]);
                }
            }
        }
    },
    /**
     * Toggles the visibility of the layers/groups within domElem as well as 
     * the domElem layer/group given
     * @param {Number} domElem - the root element (H2 or LI) of changes
     * @return {Boolean} the new visibility state
     */
    toggleElemVisibility: function (domElem) {
        let $hideshowRoot = $(domElem);
        if (domElem.tagName == 'H2') $hideshowRoot = $hideshowRoot.parent();
        let editor = $('canvas')[0].editor;
        editor.hideInterface(); // To hide if elem is hidden
        let isVisibleNow = !(domElem.elem.visible); // Toggle visibility
        // Toggle: if isVisibleNow is true, make it visible. Otherwise, hide it.
        list.changeElemVisibility(isVisibleNow, domElem);
        // Update visibility of all elements that may be impacted by the change made
        this.updateDOMGroupVisibility(this.mainFolder[0]);

        if (domElem.tagName == 'LI') // To show if elem is a visible layer
            editor.showInterface();
        let layer = domElem.elem;
        let type = (isVisibleNow) ? 'Showed' : 'Hid';
        console.log('%c%s%c layer/group "%s" in group "%s" at position "%i".',
            'color: #2fa1d6', type, 'color: #f3f3f3', layer.name,
            layer.parent.name, layer.parent.elems.indexOf(layer));
        return isVisibleNow;
    },
    /**
     * Changes the visibility of all layers* within domElem (layer or group) as  
     * specified by bool parameter.
     * @param {Boolean} bool - the new visibility state
     * @param {Element} domElem - the root element (H2 or LI) of the changes
     * @return {jQuery Selector} selector containing all changed LI Elements (layers)
     */
    changeElemVisibility: function (bool, domElem) {
        if (bool === undefined || typeof bool !== 'boolean') return;
        let editor = $('canvas')[0].editor;
        let elem = domElem.elem; // Get data elem (layer or group)
        let $changedElems;
        if (elem.type == 'l') { // If a layer
            let $lis = $(list.container).find('li'); // Find layers
            let firstIndex = $lis.index(domElem);
            editor.changeLayerVisibility(bool, firstIndex);
            editor.render();
            $changedElems = $(domElem);
        }
        else if (elem.type == 'g') { // If a group
            let $lis = $(list.container).find('li'); // Find all layers
            // Find layers in the specified group
            let $lisInGroup = $(domElem.parentNode).find('li');
            elem.visible = bool; // Update visibility of this group
            if ($lisInGroup.length > 0) {
                let firstIndex = $lis.index($lisInGroup[0]);
                let lastIndex = firstIndex + $lisInGroup.length;
                editor.changeLayerVisibility(bool, firstIndex, lastIndex);
                editor.render();
            }
            $changedElems = $lisInGroup;
        }
        return $changedElems;
    },
    /**
     * Updates the visibility state of every layer/group within domGroup as well 
     * as the provided domElem. It does not modify layer visibility but it modifies 
     * group visibility based on visibility state of its children. It applies CSS to 
     * indicate all hidden layer/groups in the subtree with root domElem in layer manager.
     * @param {Element} domElem - the root element (DIV) of the update
     */
    updateDOMGroupVisibility: function (domGroup) {
        if (domGroup === undefined || !(domGroup instanceof Element)
            || domGroup.tagName !== 'DIV' || domGroup.children.length < 2
            || domGroup.children[0].tagName !== 'H2' || domGroup.children[0].elem === undefined)
            return;
        let group = domGroup.children[0].elem; // Get group data
        if (group.elems === undefined) return; // Check if really is a group
        // Get first child in group
        if (domGroup.children[1].firstChild === undefined
            || domGroup.children[1].firstChild.tagName != 'UL') return;
        let $currDOMGroupChild = $(domGroup.children[1].firstChild.children).first();
        // Only change visibility of this group if it contains children
        if (group.elems.length > 0) group.visible = false;
        // Update visibility of every descendant of this group
        for (var i = 0; i < group.elems.length; i++) {
            let currChildElem = group.elems[i];
            if (currChildElem.type == 'l') { // If a layer
                // Update visibility
                $currDOMGroupChild.removeClass('symbol-hidden');
                if (!currChildElem.visible) $currDOMGroupChild.addClass('symbol-hidden');
            }
            else if (currChildElem.type == 'g') { // If a group
                // Recursive to solve for subgroup
                this.updateDOMGroupVisibility($currDOMGroupChild[0]);
            }
            // Make group visible if it contains at least 1 visible child. Otherwise, hide it.
            if (currChildElem.visible) group.visible = true;
            $currDOMGroupChild = $currDOMGroupChild.next();
        }
        // Update visibility of this group
        $(domGroup).removeClass('symbol-hidden');
        if (!group.visible) $(domGroup).addClass('symbol-hidden');
    },
    setupGroupAsMain: function (group) {
        if (!this.ready) return;
        var groupFolder = $('<div data-role="collapsible" id="' + groupID + '">'); groupID++;
        var header = $('<h2 onmousedown="return false" class="context-menu-symbol-art">');
        let $headerName = $('<span>' + group.name + '</span>');
        header.append($headerName);
        groupFolder.append(header);
        var listview = $('<ul data-role="listview" data-divider-theme="b">');
        var menuType = 'MainGroupMenu';
        header[0].elem = group;
        header[0].list = this;
        header.click(this.elemMousedownEvtHandler);
        header.on("swiperight", function () {
            $(this).contextMenu();
        });
        header.on('click', function (e) {
            this.list.changeSelectedElem(this.firstChild);
        });
        // Open menu when clicked, close when clicked twice while selected
        groupFolder[0].isFirstClick = true;
        $(groupFolder).on('collapsibleexpand', function (e) {
            e.stopPropagation();
        }).on('collapsiblecollapse', function (e) {
            e.stopPropagation();
            if (groupFolder[0].isFirstClick) {
                $(this).children(':first').click();
                groupFolder[0].isFirstClick = false;
            }
            else
                groupFolder[0].isFirstClick = true;
        });
        groupFolder.append(listview);
        groupFolder[0].list = listview;
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
        // Get file header info
        var saml = '<?xml version="1.0" encoding="utf-8"?>\n'
            + this.editor.overlayImg.toSAML()
            + '\n<sa name="' + this.mainGroup.name
            + '" visible="true" version="' + SAConfig.version
            + '" author="' + SAConfig.authorID
            + '" width="192" height="96" sound="' + $('#player')[0].manager.currBGE + '">';
        // Get Layer/Group info
        for (var i = 0; i < this.mainGroup.elems.length; i++) {
            var elem = this.mainGroup.elems[i];
            saml += elem.toSAML(1); // for elem = group/layer
        }
        saml += '\n</sa>';
        return saml;
    }
});