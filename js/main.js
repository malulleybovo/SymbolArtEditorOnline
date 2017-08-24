////////////////////////////////////////////////////////////////////////////////
//
//  Project: Symbol Art Editor Online
//  Author: Arthur Malulley
//
////////////////////////////////////////////////////////////////////////////////

/***********************/
var APP_VER = '1.0.1';
/***********************/

var imgWidth = 176;
var c, ctx, alertBox, list;
var title, description;
var layerNum = 0;
var groupNum = 0;
$(document).delegate(".no-panning", "scrollstart", false);
var isMobile = false;
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;
// Quick Controls Variables
function initConsts() {
    title = "Symbol Art Editor Online";
    description = "Tap Button to Start";
    CANVAS_W = 192;
    CANVAS_W_STEP = 24;
    CANVAS_H = 96;
    CANVAS_H_STEP = 12;
    zoom = 1;

    mousedown = false;
}

window.onload = function () {
    initConsts();
    initDocument();
    initGlobalVars();
    initUI();
}

function initDocument() {
    document.title = title;

    // Get reference to head and body of the document
    HTMLHead = document.getElementsByTagName('head')[0];
    HTMLBody = document.getElementsByTagName('body')[0];

    $('body').on("contextmenu", function (e) {
        e.preventDefault();
    });

    // Create link to Google Material Icons
    GoogleMaterialIcons = document.createElement('link');
    GoogleMaterialIcons.setAttribute('rel', 'stylesheet');
    GoogleMaterialIcons.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    HTMLHead.appendChild(GoogleMaterialIcons);

}

function initGlobalVars() {
    UINodeList = {};
    duplicates = [];
}

function initUI() {
    document.onwheel = function (e) {
        e.preventDefault();
    }

    UI = [];

    UI.landing = $('.landing');

    addNode('Canvas Container', 'div', HTMLBody, 'button medium-text no-highlight cursor-pointer');
    UINodeList['Canvas Container'].id = 'canvascontainer';
    addNode('Canvas Box', 'div', UINodeList['Canvas Container'], 'canvas-box');

    // Initialize Interface
    list = new List("Layers", "Symbol Art", UINodeList['Canvas Box']);
    UINodeList['Canvas'] = list.editor.renderer.view;
    $(UINodeList['Canvas Container']).append(UINodeList['Canvas Box']);
    $(UINodeList['Canvas Box']).append(UINodeList['Canvas']);
    $('canvas')[0].editor.updateSize();

    UINodeList['Canvas'].onmousedown = function () {
        mousedown = true;
    }
    UINodeList['Canvas'].onmouseup = function () {
        mousedown = false;
    }
    UINodeList['Canvas'].onmouseover = function (e) {
        if (mousedown) {
            if (e.ctrlKey) {

            }
        }
    }
    $(UINodeList['Canvas']).click(function () {
        /* Uncomment to hide side bar upon focusing on canvas */
        //$(".sidebar.left").trigger("sidebar:close");
        //$(UINodeList['Canvas Button']).removeClass('selected');
        if (list.renamingLayer) {
            // isRenamingLayer is either undefined or the <input> of the renaming element
            $(list.renamingLayer).blur();
        }
    });
    UINodeList['Canvas Container'].onwheel = function (e) {
        e.preventDefault();
        //if (!e.ctrlKey) return;
        if (e.deltaY < 0) { // Zoom +
            list.editor.incrSize();
        }
        else { // Zoom -
            list.editor.decrSize();
        }
    }

    // Mobile Zooming Controller
    panZoomActive = false;
    $(UINodeList['Canvas Container']).panzoom({
        minScale: list.editor.ZOOM_MIN,
        maxScale: list.editor.ZOOM_MAX,
        increment: list.editor.ZOOM_STEP,
        which: 2,
        cursor: 'pointer',
        disableOneFingerPan: true
    }).on("panzoomzoom", function (e, panzoom, scale, opts) {
        e.stopImmediatePropagation();
        let editor = $('canvas')[0].editor;
        alert('zoom:' + editor.zoom + ' to ' + scale);
        editor.zoom = scale;
        editor.updateSize();
        $('canvas').trigger('vmouseup');
    }).on("panzoomstart", function (e, panzoom, event, touches) {
        editorToolbar.enableTool('resetPan');
        panZoomActive = true;
        $('canvas').trigger('vmouseup');
    }).on("panzoomend", function () {
        panZoomActive = false;
    }).on("panzoompan", function () {
        $('canvas')[0].editor.refreshLayerEditBox();
    });

    bgeManager = new BGEManager();

    // Initialize Toolbar Button
    editorToolbar = new Toolbar($('body')[0]);
    editorToolbar.addTool('undo', 'fa fa-undo', function () {
        if (!list.async.hasSynced) return;
        if ($('div.sp-container').is(':visible')) return;
        historyManager.undoAction();

        list.async.hasSynced = false;
        setTimeout(() => {
            list.async.hasSynced = true;
        }, 500);
    })
    editorToolbar.addTool('redo', 'fa fa-repeat', function () {
        if (!list.async.hasSynced) return;
        if ($('div.sp-container').is(':visible')) return;
        historyManager.redoAction();

        list.async.hasSynced = false;
        setTimeout(() => {
            list.async.hasSynced = true;
        }, 500);
    });
    editorToolbar.addTool('resetPan', 'fa fa-crosshairs', function () {
        $('#canvascontainer').panzoom('reset', {
            animate: false
        });
        editorToolbar.disableTool('resetPan');
        $('canvas')[0].editor.refreshLayerEditBox();
    });
    editorToolbar.addTool('hideUI', 'fa fa-eye-slash', function () {
        let editor = $('canvas')[0].editor;
        editor.disableInteraction();
        editor.hideInterface();
    });
    editorToolbar.addTool('sound', 'fa fa-music');
    editorToolbar.addMenuOptionToTool('sound', 'fa fa-th-large', function () {
        bgeManager.toggleBGEMenu();
    });
    editorToolbar.addMenuOptionToTool('sound', 'fa fa-play-circle-o', function () {
        $('#player')[0].play();
    });
    editorToolbar.addTool('save', 'fa fa-download', function () {
        var blob = new Blob([list.toSAML()], { type: "text/plain;charset=utf-8" });
        saveAs(blob, list.mainGroup.name + ".saml");
    });
    editorToolbar.setup(); // Ready the toolbar for use
    editorToolbar.disableTool('resetPan');
    editorToolbar.disableTool('undo');
    editorToolbar.disableTool('redo');

    historyManager = new HistoryManager();
    historyManager.onpush(function () {
        editorToolbar.enableTool('undo');
        editorToolbar.disableTool('redo');
    });
    historyManager.onchange(function () {
        if (historyManager.undoList.length <= 0)
            editorToolbar.disableTool('undo');
        else
            editorToolbar.enableTool('undo');
        if (historyManager.redoList.length <= 0)
            editorToolbar.disableTool('redo');
        else
            editorToolbar.enableTool('redo');
    });
    historyManager
        .registerUndoAction('rename',
        function (ctx) { // UNDO rename
            var $domLayer = $('#' + ctx.domElemID);
            let mainElem = $domLayer[0];
            if (!ctx.isLayer) {
                mainElem = $domLayer[0].firstChild;
            }
            mainElem.elem.name = ctx.prevName;
            let layerTextLink = mainElem.firstChild;
            $(layerTextLink).children('span:first').text(ctx.prevName);
        },
        function (ctx) { // REDO rename
            var $domLayer = $('#' + ctx.domElemID);
            let mainElem = $domLayer[0];
            if (!ctx.isLayer) {
                mainElem = $domLayer[0].firstChild;
            }
            mainElem.elem.name = ctx.newName;
            let layerTextLink = mainElem.firstChild;
            $(layerTextLink).children('span:first').text(ctx.newName);
        },
        ['domElemID', 'isLayer', 'prevName', 'newName']);
    historyManager
        .registerUndoAction('move',
        function (ctx) { // UNDO move
            var srcLayer = $('#' + ctx.srcLayerID),
                currLayerInSrc = $('#' + ctx.currLayerInSrcID);
            if (ctx.async.hasSynced) {
                if (ctx.emptyGroupException) {
                    var ulInDOMFolder = $(currLayerInSrc[0].lastChild.firstChild);
                    ulInDOMFolder.append('<li id="temporaryLI">');
                    currLayerInSrc = ulInDOMFolder;
                }
                // If destination is a folder (group), select header in destLayer (div)
                if (srcLayer[0].tagName == 'DIV') srcLayer = $(srcLayer[0].firstChild);
                if (currLayerInSrc[0].tagName == 'DIV') currLayerInSrc = $(currLayerInSrc[0].firstChild);
                list.move(srcLayer[0], currLayerInSrc[0], true, !ctx.isForward);
            }
            else {
                setTimeout(function () {
                    list.async.hasSynced = true;
                }, 1000);
                console.log('Cannot undo "move" until synchronized.');
                throw new Error();
            }
        },
        function (ctx) { // REDO move
            if (ctx.async.hasSynced) {
                var srcLayer = $('#' + ctx.srcLayerID),
                    destLayer = $('#' + ctx.destLayerID);
                // If destination is a folder (group), select header in destLayer (div)
                if (srcLayer[0].tagName == 'DIV') srcLayer = $(srcLayer[0].firstChild);
                if (destLayer[0].tagName == 'DIV') destLayer = $(destLayer[0].firstChild);
                list.move(srcLayer[0], destLayer[0], true, ctx.isForward);
            }
            else {
                setTimeout(function () {
                    list.async.hasSynced = true;
                }, 1000);
                console.log('Cannot redo "move" until synchronized.');
                throw new Error();
            }
        },
        ['async', 'srcLayerID', 'currLayerInSrcID', 'destLayerID', 'isForward', 'emptyGroupException']);
    historyManager
        .registerUndoAction('add',
        function (ctx) { // UNDO add
            ctx.subtree = list.extractSubtree(ctx.elemID);
            let parentDOM = ctx.subtree.parentDOM;
            $(parentDOM.firstChild).click();
            list.updateDOMGroupVisibility(list.mainFolder[0]);
            list.updateLayerCountDisplay();
        },
        function (ctx) { // REDO add
            list.insertSubtree(ctx.subtree);
            let elemDOM = ctx.subtree.subtreeDOM;
            if (elemDOM.tagName == 'DIV') // If Group, click header
                $(elemDOM.firstChild).click();
            else // If Layer, click it
                $(elemDOM).click();
            list.updateDOMGroupVisibility(list.mainFolder[0]);
            list.updateLayerCountDisplay();
        },
        ['elemID']);
    historyManager
        .registerUndoAction('remove',
        function (ctx) { // UNDO remove
            list.insertSubtree(ctx.subtree);
            let elemDOM = ctx.subtree.subtreeDOM;
            if (elemDOM.tagName == 'DIV') // If Group, click header
                $(elemDOM.firstChild).click();
            else // If Layer, click it
                $(elemDOM).click();
            list.updateDOMGroupVisibility(list.mainFolder[0]);
            list.updateLayerCountDisplay();
        },
        function (ctx) { // REDO remove
            ctx.subtree = list.extractSubtree(ctx.elemID);
            let parentDOM = ctx.subtree.parentDOM;
            $(parentDOM.firstChild).click();
            list.updateDOMGroupVisibility(list.mainFolder[0]);
            list.updateLayerCountDisplay();
        },
        ['elemID', 'subtree']);
    historyManager
        .registerUndoAction('symbol_change',
        function (ctx) { // UNDO symbol_partchange
            ctx.layer.part = ctx.prevPartNum;
            ctx.previewImg.src = partsInfo.path
                + partsInfo.dataArray[ctx.prevPartNum]
                + partsInfo.imgType;
            if (ctx.layer == list.selectedElem.parentNode.elem) {
                let selectmenu = $('#sidenav')[0].selectmenu;
                if (selectmenu.isMenuActive(0)) {
                    selectmenu.setSelectedOption(ctx.prevPartNum, 0);
                }
            }
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
        },
        function (ctx) { // REDO symbol_partchange
            ctx.layer.part = ctx.newPartNum;
            ctx.previewImg.src = partsInfo.path
                + partsInfo.dataArray[ctx.newPartNum]
                + partsInfo.imgType;
            if (ctx.layer == list.selectedElem.parentNode.elem) {
                let selectmenu = $('#sidenav')[0].selectmenu;
                if (selectmenu.isMenuActive(0)) {
                    selectmenu.setSelectedOption(ctx.newPartNum, 0);
                }
            }
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
        },
        ['layer', 'previewImg', 'prevPartNum', 'newPartNum']);
    historyManager
        .registerUndoAction('symbol_move',
        function (ctx) { // UNDO symbol_move
            ctx.layer.x = ctx.startX;
            ctx.layer.y = ctx.startY;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            editor.refreshLayerEditBox();
            editor.layerCtrl.update(ctx.layer);
        },
        function (ctx) { // REDO symbol_move
            ctx.layer.x = ctx.endX;
            ctx.layer.y = ctx.endY;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            editor.refreshLayerEditBox();
            editor.layerCtrl.update(ctx.layer);
        },
        ['layer', 'startX', 'startY', 'endX', 'endY']);
    historyManager
        .registerUndoAction('symbol_groupmove',
        function (ctx) { // UNDO symbol_groupmove
            let editor = $('canvas')[0].editor;
            for (var i = ctx.startIdx; i < ctx.endIdx; i++) {
                if (!ctx.layers[i]) continue;
                let layer = ctx.layers[i].layer;
                layer.x = ctx.startX[i - ctx.startIdx];
                layer.y = ctx.startY[i - ctx.startIdx];
                editor.updateLayer(layer);
            }
            editor.render();
            editor.refreshLayerEditBox();
        },
        function (ctx) { // REDO symbol_groupmove
            let editor = $('canvas')[0].editor;
            for (var i = ctx.startIdx; i < ctx.endIdx; i++) {
                if (!ctx.layers[i]) continue;
                let layer = ctx.layers[i].layer;
                layer.x = ctx.endX[i];
                layer.y = ctx.endY[i];
                editor.updateLayer(layer);
            }
            editor.render();
            editor.refreshLayerEditBox();
        },
        ['layers', 'startIdx', 'endIdx', 'startX', 'startY', 'endX', 'endY']);
    historyManager
        .registerUndoAction('symbol_reshape',
        function (ctx) { // UNDO symbol_reshape
            ctx.layer.vertices = ctx.origVals.vtces.slice(0);
            ctx.layer.x = ctx.origVals.x;
            ctx.layer.y = ctx.origVals.y;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            editor.refreshLayerEditBox();
            editor.layerCtrl.update(ctx.layer);
        },
        function (ctx) { // REDO symbol_reshape
            ctx.layer.vertices = ctx.newVals.vtces.slice(0);
            ctx.layer.x = ctx.newVals.x;
            ctx.layer.y = ctx.newVals.y;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            editor.refreshLayerEditBox();
            editor.layerCtrl.update(ctx.layer);
        },
        ['layer', 'origVals', 'newVals']);
    historyManager
        .registerUndoAction('symbol_recolor',
        function (ctx) { // UNDO symbol_recolor
            ctx.layer.color = ctx.oldColor;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            $('#colorSelector') // Update preview color on color picker
                .spectrum('set', '#' + Math.round(ctx.layer.color).toString(16));
        },
        function (ctx) { // REDO symbol_recolor
            ctx.layer.color = ctx.newColor;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            $('#colorSelector') // Update preview color on color picker
                .spectrum('set', '#' + Math.round(ctx.layer.color).toString(16));
        },
        ['layer', 'oldColor', 'newColor']);
    historyManager
        .registerUndoAction('symbol_changealpha',
        function (ctx) { // UNDO symbol_changealpha
            ctx.layer.alpha = ctx.oldAlpha;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            editor.layerCtrl.update(ctx.layer);
        },
        function (ctx) { // REDO symbol_changealpha
            ctx.layer.alpha = ctx.newAlpha;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
            editor.layerCtrl.update(ctx.layer);
        },
        ['layer', 'oldAlpha', 'newAlpha']);

    samlLoader = new SAMLLoader(list);

    UI.landing.image = $('<div class="landing-img">');

    UI.landing.version = $('<div class="landing-app-version">');
    UI.landing.version.text(APP_VER);

    UI.landing.help = $('<div class="landing-help">');
    UI.landing.help.append('<i class="fa fa-question">');
    UI.landing.help.click(function () {
        var win = window.open('https://github.com/malulleybovo/SymbolArtEditorOnline', '_blank');
        if (win) {
            win.focus();
        } else {
            alert('Please allow popups for this website to open help link.');
        }
    });

    UI.landing.menu = $('<div class="landing-menu">');

    let landingOnKeyPressCallback = function (e) {
        if (e.keyCode == 10 || e.keyCode == 13) {
            if (e.ctrlKey) // Ctrl + Enter = Open Symbol Art
                $(UI.landing.menu.loadAppButton).click();
            else // Enter = New Symbol Art
                $(UI.landing.menu.newAppButton).click();
        }
    }
    $(document).bind('keypress', landingOnKeyPressCallback);
    UI.landing.menu.newAppButton = $('<div>');
    UI.landing.menu.newAppButton.append($('<i class="fa fa-plus">'));
    UI.landing.menu.newAppButton.click(
        {
            landingOnKeyPressCallback: landingOnKeyPressCallback
        }, function (e) {
            list.setReady(true); // Ready the Layer Manager
            $(document).unbind('keypress', landingOnKeyPressCallback);
            UI.landing.animate({
                opacity: 0
            }, "slow", "linear", function () {
                UI.landing.remove();
            });
        });
    UI.landing.menu.append(UI.landing.menu.newAppButton);

    UI.landing.menu.loadAppButton = $('<div>');
    UI.landing.menu.loadAppButton.append($('<i class="fa fa-upload">'));
    UI.landing.menu.loadAppButton.click(function () {
        UI.fileHandler.click();
    });
    UI.landing.menu.append(UI.landing.menu.loadAppButton);

    UI.fileHandler = $('<input type="file" accept=".saml" class="hidden">');
    UI.fileHandler.change(function (e) {
        UI.landing.animate({
            opacity: 0
        }, "slow", "linear", function () {
            UI.landing.remove();
        });
        var reader = new FileReader();
        reader.onload = function (evt) {
            list.setReady(true); // Ready the Layer Manager
            $(document).unbind('keypress', landingOnKeyPressCallback);
            var text = evt.target.result;
            samlLoader.load(text);
            historyManager.clear();
            editorToolbar.disableTool('undo');
        }
        reader.readAsText(e.target.files[0]);
        reader.onerror = function (evt) {
            alert("Error reading file.");
        }
    });

    UI.landing.append(UI.landing.image);
    setInterval(function () {
        UI.landing.image.animate({
            opacity: 1
        });
    }, 100);
    setInterval(function () {
        UI.landing.image.addClass('landing-img-ready');
    }, 1000);
    UI.landing.append(UI.landing.version);
    UI.landing.append(UI.landing.help);
    UI.landing.append(UI.landing.menu);
    setInterval(function () {
        UI.landing.menu.animate({
            opacity: 1
        });
        UI.landing.help.animate({
            opacity: 1
        });
        UI.landing.version.animate({
            opacity: 1
        });
    }, 1000);

    function addNode(id, type, parentNode, CSSclass, innerText) {
        if (id === undefined) return;

        var newNode = document.createElement(type);
        if (CSSclass !== undefined) {
            newNode.className = CSSclass;
        }
        if (innerText !== undefined) {
            newNode.innerText = innerText;
        }
        UINodeList[id] = newNode;
        if (parentNode !== undefined) {
            parentNode.appendChild(newNode);
        }
    }
}

function createAlertBox() {
    alertBox = document.createElement("div");
    alertBox.className = "alert-box";
    HTMLBody.appendChild(alertBox);
}

function alertMessage(msg, time) {
    document.onkeypress = null;
    if (!HTMLBody.contains(alertBox)) {
        createAlertBox();
    }

    alertBox.innerText = msg;

    if (alertBox.timeout != null) {
        clearTimeout(alertBox.timeout);
    }

    alertBox.timeout = setTimeout(function () {
        HTMLBody.removeChild(alertBox);
    }, time);
}
