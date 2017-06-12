////////////////////////////////////////////////////////////////////////////////
//
//  Project: Binary State Parser
//  File: main.js
//  Executable file: binaryStateParser.html
//  Known Compatibility: Google Chrome
//  Author: Arthur Malulley Bovolim de Oliveira
//  Description: Website that takes is a local file, parses it as text, and
//      runs a checker that firstly detects if file content follows the right 
//      format (only 0s, 1s, and new line characters are allowed and all lines
//      have to have the same number of character, or 'bits') and then checks
//      if file content contains all possible combinations (or states) of 0s 
//      and 1s for a N-bit binary number (except 0), in which N is determined 
//      by the number of of characters, or bits, in the first number in file.
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
    title = "Symbol Art Editor";
    description = "Tap Button to Start";
    CANVAS_W = 192;
    CANVAS_W_STEP = 24;
    CANVAS_H = 96;
    CANVAS_H_STEP = 12;
    zoom = 1;

    mousedown = false;
}

/********************************************************
* 
* Function : convertToBKMAPP
* 
* Description : 
*      
* Parameters :
* 
* Return : 
* 
********************************************************/
function convertToBKMAPP(data) {
    var res = "";

    var urls = data.split('\n');
    for (var i = 0; i < urls.length - 1; i++) {
        var url = urls[i].trim();

        res += newBoxKey + "\n\r\n\r" + url + "\n\r\n\r";

    }
    console.log(res);
}

window.onload = function () {
    initDocument();
    initConsts();
    initGlobalVars();
    initUI();
}

function initDocument() {
    document.title = "Symbol Art Editor";

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
    list = new List("Layers", "Symbol Art", UINodeList['Canvas Box'],
        function (e) {
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
            if (this.elem.type == 'l') {
                elem = $(this);
                var myLayer = elem[0].elem;
                try {
                    var testMyLayer = myLayer.x;
                }
                catch (err) {
                    console.error('Selected layer was not found./n/t' + err.message);
                }
                var offset = $('canvas').offset();
                var basePosX = offset.left + editor.zoom * myLayer.x;
                var basePosY = offset.top + editor.zoom * myLayer.y;
                (editor.editorBoxIcons.tl.css('left', (basePosX + editor.zoom * myLayer.vertices[0] - 14.8) + 'px')
                    .css('top', (basePosY + editor.zoom * myLayer.vertices[1] - 22.8) + 'px'));
                (editor.editorBoxIcons.tr.css('left', (basePosX + editor.zoom * myLayer.vertices[2] - 54) + 'px')
                    .css('top', (basePosY + editor.zoom * myLayer.vertices[3] - 22.8) + 'px'));
                (editor.editorBoxIcons.bl.css('left', (basePosX + editor.zoom * myLayer.vertices[4] - 132.4) + 'px')
                    .css('top', (basePosY + editor.zoom * myLayer.vertices[5] - 22.8) + 'px'));
                (editor.editorBoxIcons.br.css('left', (basePosX + editor.zoom * myLayer.vertices[6] - 93.2) + 'px')
                    .css('top', (basePosY + editor.zoom * myLayer.vertices[7] - 22.8) + 'px'));
                
                editor.cPicker[0].selectedLayer = myLayer;
                editor.layerCtrl.update(myLayer);
                editor.cPicker[0].editor = editor;
                $('#colorSelector div').css('backgroundColor', '#' + myLayer.color.toString(16));

                editor.showInterface();
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
            elem[0].group.activeElem = index;
            console.log("Selected elem. \"" + elem[0].group.elems[elem[0].group.activeElem].name + "\" from group \"" + elem[0].group.name + "\"");
            switch (e.which) {
                case 1: // Left click
                    break;
                case 2: // Mid click
                    break;
                case 3: // Right click
                    break;
                default:
                    break;
            }
        }
    );
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
        disablePan: true
    }).on("panzoomzoom", function (e, panzoom, scale, opts) {
        e.stopImmediatePropagation();
        $('canvas')[0].editor.zoom = scale;
        $(list.selectedElem).parent().trigger('mousedown'); // Update editor box
    }).on("panzoomstart", function () {
        panZoomActive = true;
    }).on("panzoomend", function () {
        panZoomActive = false;
    });
    document.body.addEventListener("mousemove", allowMouseMove, true);
    function allowMouseMove(event) {
        if (panZoomActive) {
            event.stopPropagation();
        }
    }

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
