////////////////////////////////////////////////////////////////////////////////
//
//  Project: Symbol Art Editor Online
//  Author: Arthur Malulley
//
////////////////////////////////////////////////////////////////////////////////
var imgWidth = 176;
var c, ctx, alertBox, list;
var title, description;
var layerNum = 0;
var groupNum = 0;
$(document).delegate(".no-panning", "scrollstart", false);
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

    // Create link to stylesheet
    CSSFileLink = document.createElement('link');
    CSSFileLink.setAttribute('rel', 'stylesheet');
    CSSFileLink.setAttribute('type', 'text/css');
    CSSFileLink.setAttribute('href', 'css/style.css');
    HTMLHead.appendChild(CSSFileLink);

    // Create link to Google Material Icons
    GoogleMaterialIcons = document.createElement('link');
    GoogleMaterialIcons.setAttribute('rel', 'stylesheet');
    GoogleMaterialIcons.setAttribute('href', 'https://fonts.googleapis.com/icon?family=Material+Icons');
    HTMLHead.appendChild(GoogleMaterialIcons);

}

function initGlobalVars() {
    UINodeList = {};
    duplicates = [];
    ZOOM_MAX = 5; ZOOM_MIN = 1; ZOOM_STEP = 0.4;
}

function initUI() {
    document.onwheel = function (e) {
        e.preventDefault();
    }

    UI = [];

    UI.landing = $('<div class="landing">');
    
    UI.landing.image = $('<div class="landing-img">');
    
    UI.landing.menu = $('<div class="landing-menu">');

    UI.landing.menu.newAppButton = $('<div>');
    UI.landing.menu.newAppButton.append($('<i class="fa fa-plus">'));
    UI.landing.menu.newAppButton.click(function (e) {
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
            var text = evt.target.result;
            samlLoader.load(text);
            console.clear();
            historyManager.clear();
        }
        reader.readAsText(e.target.files[0]);
        reader.onerror = function (evt) {
            alert("Error reading file.");
        }
    });

    $('body').append(UI.landing);
    UI.landing.append(UI.landing.image);
    setInterval(function () {
        UI.landing.image.addClass('landing-img-ready');
    }, 500);
    UI.landing.append(UI.landing.menu);
    setInterval(function () {
        UI.landing.menu.animate({
            opacity: 1
        });
    }, 1000);

    addNode('Canvas Container', 'div', HTMLBody, 'button medium-text no-highlight cursor-pointer');
    UINodeList['Canvas Container'].id = 'canvascontainer';
    addNode('Canvas Box', 'div', UINodeList['Canvas Container'], 'canvas-box');

    // Initialize Interface
    list = new List("Layers", "Symbol Art", UINodeList['Canvas Box']);
    UINodeList['Canvas'] = list.editor.renderer.view;
    $(UINodeList['Canvas Container']).append(UINodeList['Canvas Box']);
    $(UINodeList['Canvas Box']).append(UINodeList['Canvas']);

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
        minScale: this.ZOOM_MIN,
        maxScale: this.ZOOM_MAX,
        increment: this.ZOOM_STEP,
        which: 2,
        cursor: 'pointer',
        disableOneFingerPan: true
    }).on("panzoomzoom", function (e, panzoom, scale, opts) {
        e.stopImmediatePropagation();
        let editor = $('canvas')[0].editor;
        editor.zoom = scale;
        editor.refreshLayerEditBox();
    }).on("panzoomstart", function (e, panzoom, event, touches) {
        panZoomActive = true;
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
        historyManager.undoAction();

        list.async.hasSynced = false;
        setTimeout(() => {
            list.async.hasSynced = true;
        }, 500);
    })
    editorToolbar.addTool('redo', 'fa fa-repeat', function () {
        if (!list.async.hasSynced) return;
        historyManager.redoAction();

        list.async.hasSynced = false;
        setTimeout(() => {
            list.async.hasSynced = true;
        }, 500);
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
    editorToolbar.addMenuOptionToTool('sound', 'fa fa-volume-up', function () {
        $('#player')[0].play();
    });
    editorToolbar.addTool('save', 'fa fa-download', function () {
        var blob = new Blob([list.toSAML()], { type: "text/plain;charset=utf-8" });
        saveAs(blob, list.mainGroup.name + ".saml");
    });
    editorToolbar.setup(); // Ready the toolbar for use

    historyManager = new HistoryManager();
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
            layerTextLink.textContent = ctx.prevName;
        },
        function (ctx) { // REDO rename
            var $domLayer = $('#' + ctx.domElemID);
            let mainElem = $domLayer[0];
            if (!ctx.isLayer) {
                mainElem = $domLayer[0].firstChild;
            }
            mainElem.elem.name = ctx.newName;
            let layerTextLink = mainElem.firstChild;
            layerTextLink.textContent = ctx.newName;
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
            $(parentDOM.firstChild).click().click();
        },
        function (ctx) { // REDO add
            list.insertSubtree(ctx.subtree);
            let elemDOM = ctx.subtree.subtreeDOM;
            if (elemDOM.tagName == 'DIV') // If Group, click header
                $(elemDOM.firstChild).click().click();
            else // If Layer, click it
                $(elemDOM).click();
        },
        ['elemID']);
    historyManager
        .registerUndoAction('remove',
        function (ctx) { // UNDO remove
            list.insertSubtree(ctx.subtree);
            let elemDOM = ctx.subtree.subtreeDOM;
            if (elemDOM.tagName == 'DIV') // If Group, click header
                $(elemDOM.firstChild).click().click();
            else // If Layer, click it
                $(elemDOM).click();
        },
        function (ctx) { // REDO remove
            ctx.subtree = list.extractSubtree(ctx.elemID);
            let parentDOM = ctx.subtree.parentDOM;
            $(parentDOM.firstChild).click().click();
        },
        ['elemID', 'subtree']);
    historyManager
        .registerUndoAction('symbol_change',
        function (ctx) { // UNDO symbol_partchange
            ctx.layer.part = ctx.prevPartNum;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
        },
        function (ctx) { // REDO symbol_partchange
            ctx.layer.part = ctx.newPartNum;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
        },
        ['layer', 'prevPartNum', 'newPartNum']);
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
        },
        function (ctx) { // REDO symbol_recolor
            ctx.layer.color = ctx.newColor;
            let editor = $('canvas')[0].editor;
            editor.updateLayer(ctx.layer);
            editor.render();
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
