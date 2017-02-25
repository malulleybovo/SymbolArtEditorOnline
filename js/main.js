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
    $('body').append(UI.landing);

    UI.landing.menu = $('<div class="landing-menu">');
    UI.landing.append(UI.landing.menu);

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

    addNode('Canvas Container', 'div', HTMLBody, 'button medium-text no-highlight cursor-pointer');
    UINodeList['Canvas Container'].id = 'canvascontainer';
    addNode('Canvas Box', 'div', UINodeList['Canvas Container'], 'canvas-box');

    // Initialize Interface
    list = new List("Layers", "Symbol Art", UINodeList['Canvas Box'],
        function (action, el, pos) {
            switch (action) {
                case 'rename':
                    el[0].focusinCallback();
                    break;
                case 'addlayer':
                    list.addElem("Layer " + layerNum, el[0].parentFolder); layerNum++;
                    break;
                case 'insertlayer':
                    var folder = el[0].parentNode;
                    if (el[0].elem.type == 'g') {
                        $(folder).collapsible('expand');
                    }
                    list.addElemAtEnd("Layer " + layerNum, folder); layerNum++;
                    break;
                case 'addlayeratend':
                    list.addElemAtEnd("Layer " + layerNum, el[0].parentFolder); layerNum++;
                    break;
                case 'addgroup':
                    list.addFolder("Group " + groupNum, el[0].parentFolder); groupNum++;
                    break;
                case 'insertgroup':
                    var folder = el[0].parentNode;
                    if (el[0].elem.type == 'g') {
                        $(folder).collapsible('expand');
                    }
                    list.addFolderAtEnd("Group " + groupNum, folder); groupNum++;
                    break;
                case 'addgroupatend':
                    list.addFolderAtEnd("Group " + groupNum, el[0].parentFolder); groupNum++;
                    break;
                case 'remove':
                    list.removeElem(el[0].parentFolder);
                    break;
                default:
                    break;
            }
        },
        function (e) {
            var elem;
            if (this.elem.type == 'l') {
                elem = $(this);
                var offset = $(UINodeList['Canvas']).offset();
                var cont = $(UINodeList['Canvas Container']);
                var basePosX = offset.left + list.editor.zoom * elem[0].elem.x;
                var basePosY = offset.top + list.editor.zoom * elem[0].elem.y;
                (list.editor.editorBoxIcons.tl.css('left', (basePosX + list.editor.zoom * elem[0].elem.vertices[0] - 14.8) + 'px').css('top', (basePosY + list.editor.zoom * elem[0].elem.vertices[1] - 22.8) + 'px'));
                (list.editor.editorBoxIcons.tr.css('left', (basePosX + list.editor.zoom * elem[0].elem.vertices[2] - 54) + 'px').css('top', (basePosY + list.editor.zoom * elem[0].elem.vertices[3] - 22.8) + 'px'));
                (list.editor.editorBoxIcons.bl.css('left', (basePosX + list.editor.zoom * elem[0].elem.vertices[4] - 132.4) + 'px').css('top', (basePosY + list.editor.zoom * elem[0].elem.vertices[5] - 22.8) + 'px'));
                (list.editor.editorBoxIcons.br.css('left', (basePosX + list.editor.zoom * elem[0].elem.vertices[6] - 93.2) + 'px').css('top', (basePosY + list.editor.zoom * elem[0].elem.vertices[7] - 22.8) + 'px'));
                
                list.editor.cPicker[0].selectedLayer = elem[0].elem;
                list.editor.layerCtrl.update(elem[0].elem);
                list.editor.cPicker[0].editor = list.editor;
                $('#colorSelector div').css('backgroundColor', '#' + elem[0].elem.color.toString(16));

                list.editor.showInterface();
                list.editor.disableGroupInteraction();
                list.editor.enableInteraction(elem[0].elem);
            }
            else if (this.elem.type == 'g') {
                elem = $(this.parentNode);
                var cont = $(UINodeList['Canvas Container']);
                list.editor.hideInterface();
                list.editor.disableInteraction();
                list.editor.enableGroupInteraction(this.elem);

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
        if (!e.ctrlKey) return;
        if (e.deltaY < 0) { // Zoom +
            list.editor.incrSize();
        }
        else { // Zoom -
            list.editor.decrSize();
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
