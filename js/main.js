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

    CSSFileLink2 = document.createElement('link');
    CSSFileLink2.setAttribute('rel', 'stylesheet');
    CSSFileLink2.setAttribute('href', 'https://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css');
    HTMLHead.appendChild(CSSFileLink2);
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

    UI.fileHandler = $('<input type="file" class="hidden">');
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
        $('canvas')[0].editor.zoom = scale;
        $(list.selectedElem).parent().trigger('mousedown'); // Update editor box
    }).on("panzoomstart", function (e, panzoom, event, touches) {
        panZoomActive = true;
    }).on("panzoomend", function () {
        panZoomActive = false;
    }).on("panzoompan", function () {
        $(list.selectedElem).parent().trigger('mousedown'); // Update editor box
    });

    historyManager = new HistoryManager();
    historyManager
        .registerUndoAction('rename',
        function (ctx) { // UNDO rename
            ctx.elem.name = ctx.prevName;
            ctx.domElem.textContent = ctx.prevName;
        },
        function (ctx) { // REDO rename
            ctx.elem.name = ctx.newName;
            ctx.domElem.textContent = ctx.newName;
        });

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
