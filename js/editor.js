var Editor = Class({
    initialize: function (parent, list) {
        this.zoom = 1;
        this.ZOOM_STEP = 0.4;
        this.ZOOM_MAX = 5;
        this.ZOOM_MIN = 1;
        this.MIN_VTX_VARIATION = 3;
        this.disableSmallVtxChange = false;

        this.list = list;

        //Create the renderer
        this.renderer = PIXI.autoDetectRenderer(1920, 960, { transparent: true });
        this.renderer.backgroundColor = 0xb8d1d6;

        //Create a container object called the `this.stage`
        this.stage = new PIXI.Container();
        this.layers = [];
        this.parts = [];

        this.selectedLayer = null;

        for (var i in partsInfo.dataArray) {
            this.parts[i] = new PIXI.Texture(new PIXI.BaseTexture(LoadedImageFiles[partsInfo.dataArray[i] + partsInfo.imgType]));
        }

        this.SABox = new PIXI.mesh.NineSlicePlane(new PIXI.Texture(new PIXI.BaseTexture(LoadedImageFiles["SABoxSprite.png"])), 2, 2, 2, 2);
        this.SABox.height = 960;
        this.SABox.width = 1920;
        this.stage.addChild(this.SABox);

        // Buttons
        this.currBtnDown = -1;
        var tl = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-u-l ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        tl[0].list = list;
        tl[0].editor = this;
        tl.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 0;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var tr = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-u-r ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        tr[0].list = list;
        tr[0].editor = this;
        tr.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 1;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var br = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-d-r ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        br[0].list = list;
        br[0].editor = this;
        br.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 2;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var bl = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-d-l ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        bl[0].list = list;
        bl[0].editor = this;
        bl.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 3;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_l = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-l ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        btn_l[0].list = list;
        btn_l[0].editor = this;
        btn_l.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 4;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_u = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        btn_u[0].list = list;
        btn_u[0].editor = this;
        btn_u.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 5;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_r = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-r ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        btn_r[0].list = list;
        btn_r[0].editor = this;
        btn_r.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 6;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_d = $('<button class="ui-nodisc-icon ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-arrow-d ui-btn-icon-notext ui-btn-inline editor-box-icon no-panning">');
        btn_d[0].list = list;
        btn_d[0].editor = this;
        btn_d.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 7;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtnPos = this.editor.layerCtrl.activeLayer.vertices.slice(0);
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        function diagStretch(index, clientPos, origVtxs) {
            var canvas = $('canvas');
            var canvasPos = canvas.offset();
            var editor = canvas[0].editor;
            var relPos = { left: clientPos.left - canvasPos.left, top: clientPos.top - canvasPos.top };
            var layer = list.selectedElem.parentNode.elem;

            var thisVerIndex = 2 * index, oppositeVerIndex = 6 - 2 * index;

            var dPos = {
                x: Math.round((relPos.left / editor.zoom) - layer.x) - layer.vertices[thisVerIndex],
                y: Math.round((relPos.top / editor.zoom) - layer.y) - layer.vertices[thisVerIndex + 1]
            }
            layer.vertices[thisVerIndex] += dPos.x;
            layer.vertices[thisVerIndex + 1] += dPos.y;
            layer.vertices[oppositeVerIndex] -= dPos.x;
            layer.vertices[oppositeVerIndex + 1] -= dPos.y;
            if (!editor.disableSmallVtxChange) {
                if (Math.abs(layer.vertices[thisVerIndex] - origVtxs[thisVerIndex]) < editor.MIN_VTX_VARIATION) {
                    layer.vertices[thisVerIndex] = origVtxs[thisVerIndex];
                    layer.vertices[oppositeVerIndex] = origVtxs[oppositeVerIndex];
                }
                if (Math.abs(layer.vertices[thisVerIndex + 1] - origVtxs[thisVerIndex + 1]) < editor.MIN_VTX_VARIATION) {
                    layer.vertices[thisVerIndex + 1] = origVtxs[thisVerIndex + 1];
                    layer.vertices[oppositeVerIndex + 1] = origVtxs[oppositeVerIndex + 1];
                }
            }

            editor.updateLayer(layer);
            editor.render();
        }
        function sideStretch(index, clientPos, origVtxs) {
            var corner1Index, corner2Index;
            var isHorizontal;
            switch (index) {
                case 0: corner1Index = 0; corner2Index = 4; break; // left
                case 1: corner1Index = 0; corner2Index = 2; break; // up
                case 2: corner1Index = 2; corner2Index = 6; break; // right
                case 3: corner1Index = 4; corner2Index = 6; break; // down
                default:
                    return;
            }
            var canvas = $('canvas');
            var canvasPos = canvas.offset();
            var editor = canvas[0].editor;
            var layer = list.selectedElem.parentNode.elem;

            var relPos = { left: clientPos.left - canvasPos.left, top: clientPos.top - canvasPos.top };
            var dPos = {
                x: Math.round((relPos.left / editor.zoom) - layer.x)
                    - ((layer.vertices[corner1Index] + layer.vertices[corner2Index]) / 2),
                y: Math.round((relPos.top / editor.zoom) - layer.y)
                    - ((layer.vertices[corner1Index + 1] + layer.vertices[corner2Index + 1]) / 2)
            };

            layer.vertices[corner1Index] += dPos.x;
            layer.vertices[corner2Index] += dPos.x;
            layer.vertices[corner1Index + 1] += dPos.y;
            layer.vertices[corner2Index + 1] += dPos.y;
            if (!editor.disableSmallVtxChange) {
                if (Math.abs(layer.vertices[corner1Index] - origVtxs[corner1Index]) < editor.MIN_VTX_VARIATION) {
                    layer.vertices[corner1Index] = origVtxs[corner1Index];
                    layer.vertices[corner2Index] = origVtxs[corner2Index];
                }
                if (Math.abs(layer.vertices[corner1Index + 1] - origVtxs[corner1Index + 1]) < editor.MIN_VTX_VARIATION) {
                    layer.vertices[corner1Index + 1] = origVtxs[corner1Index + 1];
                    layer.vertices[corner2Index + 1] = origVtxs[corner2Index + 1];
                }
            }

            editor.updateLayer(layer);
            editor.render();
        }
        this.editorBoxIcons = {
            tl: tl,
            tr: tr,
            br: br,
            bl: bl,
            left: btn_l,
            up: btn_u,
            right: btn_r,
            down: btn_d
        };

        $('body').on('vmousemove', function (e) {
            // Mouse Move for Button Control
            var buttons = $(this).find('button.editor-box-icon');
            if (!buttons.is(":visible")) return;

            var editor = $('canvas')[0].editor;
            var btnActive = editor.currBtnDown;
            // Check if should proceed
            if (btnActive < 0) {
                return; // Avoids useless computation
            }
            var origEditbtnPos = editor.origEditbtnPos;

            var pos = {
                left: Math.round(e.clientX),
                top: Math.round(e.clientY)
            }
            switch (btnActive) {
                case 0: // top left button
                case 1: // top right button
                    diagStretch(btnActive, pos, origEditbtnPos);
                    break;
                case 2: // bottom right button
                case 3: // bottom left button
                    diagStretch(5 - btnActive, pos, origEditbtnPos);
                    break;
                case 4: // left button
                case 5: // top button
                case 6: // right button
                case 7: // bottom button
                    sideStretch(btnActive - 4, pos, origEditbtnPos);
                    break;
                default:
                    break;
            }
            $('canvas')[0].editor.refreshLayerEditBox();
        }).on('vmouseup', function (e) {
            var buttons = $(this).find('button.editor-box-icon');
            if (!buttons.is(":visible")) return;
            // Deactivate any edit box button that may have been used
            $('canvas')[0].editor.currBtnDown = -1;
        })
        $(window).resize(function () {
            $(this.list.selectedElem).parent().trigger('mousedown'); // Update editor box
        });

        // Initialize Layer Control
        this.layerCtrl = new LayerCtrl(this);
        this.layerCtrl.hide();

        this.layerCtrl.alpha.editor = this;
        this.layerCtrl.alpha.onChange(function () {
            var editor = $('canvas')[0].editor;
            editor.updateLayer($('#' + layerCtrlID)[0].layerCtrl.activeLayer);
            editor.render();
            $(window.list.selectedElem).parent().trigger('mousedown'); // Update vertex edit button pos
        });

        // Color Picker
        this.cPicker = $('<input type="text" id="colorSelector" style="width:0; height:0; position:fixed; bottom:0; right:0;" />');
        $('body').append(this.cPicker);
        this.cPicker.spectrum({
            color: "#fffffff",
            showInput: true,
            showInitial: true,
            localStorageKey: "spectrum.homepage",
            showPalette: true,
            palette: [],
            replacerClassName: 'sa-color-picker-replacer',
            containerClassName: 'sa-color-picker-container',
            preferredFormat: "hex",
            clickoutFiresChange: false,
            change: function (color) { updateColor(color); },
            move: function (color) { updateColor(color); }
        });
        $('.sp-replacer').hide();
        function updateColor(color) {
            var canvas = $('canvas')[0];
            if (canvas.editor === undefined) console.error(
                "Editor canvas could not be found and thus, color picker could not interact with the editor.");
            else {
                var editor = canvas.editor;
                if (editor.selectedLayer !== undefined) {
                    if (editor.selectedLayer != null) {
                        var newColor = Math.round(parseInt('0x' + color.toHex()));
                        editor.selectedLayer.color = newColor;
                        editor.updateLayer(editor.selectedLayer);
                        editor.render();
                    }
                }
                else console.warn(
                    "No currently selected layer is defined. Could not update color picker.");
            }
        }


        $('body').append(this.editorBoxIcons.tl);
        $('body').append(this.editorBoxIcons.tr);
        $('body').append(this.editorBoxIcons.br);
        $('body').append(this.editorBoxIcons.bl);
        $('body').append(this.editorBoxIcons.left);
        $('body').append(this.editorBoxIcons.up);
        $('body').append(this.editorBoxIcons.right);
        $('body').append(this.editorBoxIcons.down);
        //Add the canvas to the HTML document
        parent.appendChild(this.renderer.view);

        // Add Toolbar
        this.toolbar = new Toolbar();

        $('canvas')[0].editor = this;

        this.render();
    },
    resize: function (w, h) {
        this.renderer.resize(w, h);
    },
    render: function () {
        //Tell the `this.renderer` to `render` the `this.stage`
        this.renderer.render(this.stage);
    },
    incrSize: function () {
        if (this.zoom < this.ZOOM_MAX) {
            this.zoom += this.ZOOM_STEP;

            var scale = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            $('canvas').css('transform', scale);

            $(this.list.selectedElem).parent().trigger('mousedown'); // Update editor box
        }
    },
    decrSize: function () {
        if (this.zoom > this.ZOOM_MIN) {
            this.zoom -= this.ZOOM_STEP;

            var scale = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            $('canvas').css('transform', scale);

            $(this.list.selectedElem).parent().trigger('mousedown'); // Update editor box
        }
    },
    createLayer: function (layer) {

        var quad = new PIXI.mesh.Plane(
          this.parts[layer.part], 2, 2
        );
        quad.tint = layer.color;
        quad.x = layer.x;
        quad.y = layer.y;
        quad.scale.x = layer.scaleX;
        quad.scale.y = layer.scaleY;
        quad.rotation = layer.rotation;
        for (var i = 0; i < quad.vertices.length; i++) {
            if (i % 2) quad.vertices[i] -= quad.x;
            else quad.vertices[i] -= quad.y;
        }
        return quad;
    },
    addLayer: function (layer) {
        return this.addLayerAt(layer);
    },
    addLayerAt: function (layer, index) {
        var quad = this.createLayer(layer);
        var layerData = { layer: layer, quad: quad };
        if (index === undefined || index == this.stage.children.length) {
            this.stage.addChild(quad);
            this.layers.push(layerData);
        }
        else {
            this.stage.addChildAt(quad, this.stage.children.length - 1 - index);
            this.layers.splice(index, 0, layerData);
        }
        this.updateLayer(layer);
        quad.editor = this;
        quad.layerData = layerData;
        quad.interactive = true;
        quad.on('mousedown', function (evtData) {
            if ($('canvas')[0].editor.currBtnDown < 0) {
                this.isMoving = true;
                this.origClickX = evtData.data.originalEvent.offsetX;
                this.origClickY = evtData.data.originalEvent.offsetY;
                this.origX = this.x;
                this.origY = this.y;
            }
        }).on('touchstart', function (evtData) {
            if (!panZoomActive && $('canvas')[0].editor.currBtnDown < 0) {
                this.isMoving = true;
                var newPosition = evtData.data.getLocalPosition(this.parent);
                this.origClickX = newPosition.x;
                this.origClickY = newPosition.y;
                this.origX = this.x;
                this.origY = this.y;
            }
        });
        quad.on('mousemove', function (evtData) {
            if (this.isMoving) {
                this.layerData.layer;
                this.x = Math.round(evtData.data.originalEvent.offsetX - (this.origClickX - this.origX));
                this.y = Math.round(evtData.data.originalEvent.offsetY - (this.origClickY - this.origY));
                this.editor.render();
                this.layerData.layer.update(this);
                var layerCtrl = $('#' + layerCtrlID)[0].layerCtrl;
                layerCtrl.posX.updateDisplay();
                layerCtrl.posY.updateDisplay();
                $(this.editor.list.selectedElem).parent().trigger('mousedown'); // Update editor box
            }
        }).on('touchmove', function (evtData) {
            if (!panZoomActive && this.isMoving) {
                this.layerData.layer;
                var newPosition = evtData.data.getLocalPosition(this.parent);
                this.x = Math.round(newPosition.x - (this.origClickX - this.origX));
                this.y = Math.round(newPosition.y - (this.origClickY - this.origY));
                this.editor.render();
                this.layerData.layer.update(this);
                var layerCtrl = $('#' + layerCtrlID)[0].layerCtrl;
                layerCtrl.posX.updateDisplay();
                layerCtrl.posY.updateDisplay();
                $(this.editor.list.selectedElem).parent().trigger('mousedown'); // Update editor box
            }
        });
        quad.on('mouseup', function (evtData) {
            this.isMoving = false;
            delete this.origClickX;
            delete this.origClickY;
            delete this.origX;
            delete this.origY;
        }).on('touchend', function (evtData) {
            this.isMoving = false;
            delete this.origClickX;
            delete this.origClickY;
            delete this.origX;
            delete this.origY;
        }).on('touchendoutside', function (evtData) {
            this.isMoving = false;
            delete this.origClickX;
            delete this.origClickY;
            delete this.origX;
            delete this.origY;
        });
        this.layerCtrl.update(layerData.layer);
        return layerData;
    },
    removeLayer: function (layer) {
        var index = findWithAttr(this.layers, 'layer', layer);
        if (index == -1) return;

        this.stage.removeChildAt(this.stage.children.length - 2 - index);
        var layerData = this.layers[index];
        this.layers.splice(index, 1);

        this.hideInterface();

        return layerData;

        function findWithAttr(array, attr, value) {
            for (var i = 0; i < array.length; i += 1) {
                var t = array[i][attr];
                if (array[i][attr] === value) {
                    return i;
                }
            }
            return -1;
        }
    },
    removeLayerAtTop: function () {
        this.stage.removeChildAt(0);
        var layerData = this.layers[0];
        this.layers.splice(0, 1);

        this.hideInterface();

        return layerData;
    },
    getLayerIndex: function (layer) {
        for (var i = 0; i < this.layers.length; i += 1) {
            var t = this.layers[i].layer;
            if (this.layers[i].layer === layer) {
                return i;
            }
        }
        return -1;
    },
    updateLayer: function (layer) {
        var i = findWithAttr(this.layers, 'layer', layer);
        if (i == -1) return;
        var quad = this.layers[i].quad;
        quad.texture = this.parts[layer.part];
        quad.tint = layer.color;
        quad.x = layer.x;
        quad.y = layer.y;
        quad.scale.x = layer.scaleX;
        quad.scale.y = layer.scaleY;
        quad.rotation = layer.rotation;
        for (var i = 0; i < layer.vertices.length; i++) {
            quad.vertices[i] = layer.vertices[i];
        }

        switch (layer.alpha) {
            case 0: quad.alpha = 0.121569; break;
            case 1: quad.alpha = 0.247059; break;
            case 2: quad.alpha = 0.372549; break;
            case 3: quad.alpha = 0.498039; break;
            case 4: quad.alpha = 0.623529; break;
            case 5: quad.alpha = 0.74902; break;
            case 6: quad.alpha = 0.87451; break;
            case 7: quad.alpha = 1; break;
        }

        function findWithAttr(array, attr, value) {
            for (var i = 0; i < array.length; i += 1) {
                var t = array[i][attr];
                if (array[i][attr] === value) {
                    return i;
                }
            }
            return -1;
        }
    },
    enableInteraction: function (layer) {
        var quad = null;
        for (var i = 0; i < this.layers.length; i++) {
            if (quad == null && this.layers[i].layer == layer) {
                this.layers[i].quad.interactive = true;
                quad = this.layers[i].quad.interactive;
            }
            else {
                this.layers[i].quad.interactive = false;
            }
        }
    },
    disableInteraction: function (layer) {
        var quad = null;
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].quad.interactive = false;
        }
    },
    enableGroupInteraction: function (folder) {
        var canvas = $('canvas');

        canvas[0].movingFolder = folder;

        canvas.unbind().on('vmousedown', function (e) {
            if (!panZoomActive
                && $('canvas')[0].list.selectedElem.parentNode.elem.type == 'g') {
                this.mouseMoving = true;

                this.canvas = $('canvas')[0];
                this.list = this.canvas.list;
                this.editor = this.canvas.editor;
                this.lis = $(this.list.container).find('li');
                this.lisInGroup = $(this.list.selectedElem.parentNode.parentNode).find('li');
                this.firstIndex = this.lis.index(this.lisInGroup[0]);
                this.lastIndex = this.firstIndex + this.lisInGroup.length;

                var ev = e.originalEvent.originalEvent;
                if (ev instanceof MouseEvent) { // Desktop mouse event
                    this.origClickX = e.originalEvent.offsetX;
                    this.origClickY = e.originalEvent.offsetY;
                }
                else if (ev instanceof TouchEvent) { // Mobile device touch event
                    this.origClickX = (ev.touches[0].pageX - ev.touches[0].target.offsetLeft);
                    this.origClickY = (ev.touches[0].pageY - ev.touches[0].target.offsetTop);
                }
                this.origX = [];
                this.origY = [];
                var layer;
                for (var i = this.firstIndex; i < this.lastIndex; i++) {
                    layer = this.editor.layers[i].layer;
                    this.origX[i] = layer.x;
                    this.origY[i] = layer.y;
                }
            }
        }).on('vmousemove', function (e) {
            if (!panZoomActive
                && this.mouseMoving) {
                if (this.firstIndex == -1) return;
                var layer;
                for (var i = this.firstIndex; i < this.lastIndex; i++) {
                    layer = this.editor.layers[i].layer;
                    var ev = e.originalEvent.originalEvent;
                    if (ev instanceof MouseEvent) { // Desktop mouse event
                        var clickX = e.originalEvent.offsetX;
                        var clickY = e.originalEvent.offsetY;
                        layer.x = Math.round(this.origX[i] + (clickX - this.origClickX));
                        layer.y = Math.round(this.origY[i] + (clickY - this.origClickY));
                    }
                    else if (ev instanceof TouchEvent) { // Mobile device touch event
                        var clickX = (ev.touches[0].pageX - ev.touches[0].target.offsetLeft);
                        var clickY = (ev.touches[0].pageY - ev.touches[0].target.offsetTop);
                        layer.x = Math.round(this.origX[i] + ((clickX - this.origClickX) / this.editor.zoom));
                        layer.y = Math.round(this.origY[i] + ((clickY - this.origClickY) / this.editor.zoom));
                    }
                    this.editor.updateLayer(layer);
                }
                this.editor.render();
            }
        }).on('vmouseup', function (e) {
            this.mouseMoving = false;
        });
    },
    disableGroupInteraction: function () {
        var canvas = $('canvas');

        canvas[0].movingFolder = undefined;

        canvas.on('vmousedown', function () { }).on('vmousemove', function () { }).on('vmouseup', function () { });
    },
    hideInterface: function () {
        this.layerCtrl.hide();
        this.editorBoxIcons.tl.hide();
        this.editorBoxIcons.tr.hide();
        this.editorBoxIcons.bl.hide();
        this.editorBoxIcons.br.hide();
        this.editorBoxIcons.left.hide();
        this.editorBoxIcons.up.hide();
        this.editorBoxIcons.right.hide();
        this.editorBoxIcons.down.hide();
        $('.sp-replacer').hide();
    },
    showInterface: function () {
        this.layerCtrl.show();
        this.editorBoxIcons.tl.show();
        this.editorBoxIcons.tr.show();
        this.editorBoxIcons.bl.show();
        this.editorBoxIcons.br.show();
        this.editorBoxIcons.left.show();
        this.editorBoxIcons.up.show();
        this.editorBoxIcons.right.show();
        this.editorBoxIcons.down.show();
        $('.sp-replacer').show();
    },
    refreshLayerEditBox: function () {
        var offset = $('canvas').offset();
        var basePosX = offset.left + this.zoom * this.selectedLayer.x;
        var basePosY = offset.top + this.zoom * this.selectedLayer.y;
        var v = this.selectedLayer.vertices;
        this.editorBoxIcons.tl.css('left', (basePosX + this.zoom * v[0] - 14.8) + 'px')
            .css('top', (basePosY + this.zoom * v[1] - 22.8) + 'px');
        this.editorBoxIcons.tr.css('left', (basePosX + this.zoom * v[2] - 54) + 'px')
            .css('top', (basePosY + this.zoom * v[3] - 22.8) + 'px');
        this.editorBoxIcons.bl.css('left', (basePosX + this.zoom * v[4] - 134) + 'px')
            .css('top', (basePosY + this.zoom * v[5] - 22.8) + 'px');
        this.editorBoxIcons.br.css('left', (basePosX + this.zoom * v[6] - 93.2) + 'px')
            .css('top', (basePosY + this.zoom * v[7] - 22.8) + 'px');

        this.editorBoxIcons.left.css('left', (basePosX + (this.zoom * (v[0] + v[4]) - 350) / 2) + 'px')
            .css('top', (basePosY + (this.zoom * (v[1] + v[5])) / 2 - 22.8) + 'px');
        this.editorBoxIcons.up.css('left', (basePosX + (this.zoom * (v[0] + v[2]) - 430) / 2) + 'px')
            .css('top', (basePosY + (this.zoom * (v[1] + v[3])) / 2 - 22.8) + 'px');
        this.editorBoxIcons.right.css('left', (basePosX + (this.zoom * (v[2] + v[6]) - 508) / 2) + 'px')
            .css('top', (basePosY + (this.zoom * (v[3] + v[7])) / 2 - 22.8) + 'px');
        this.editorBoxIcons.down.css('left', (basePosX + (this.zoom * (v[4] + v[6]) - 590) / 2) + 'px')
            .css('top', (basePosY + (this.zoom * (v[5] + v[7])) / 2 - 22.8) + 'px');
    },
    refreshLayerEditBoxButton: function (index) {
        var sel = {};
        sel.index = 2 * index;
        switch (index) {
            case 0:
                sel.obj = this.editorBoxIcons.tl; sel.offset = 14.8;
                break;
            case 1:
                sel.obj = this.editorBoxIcons.tr; sel.offset = 54;
                break;
            case 2:
                sel.obj = this.editorBoxIcons.bl; sel.offset = 134;
                break;
            case 3:
                sel.obj = this.editorBoxIcons.br; sel.offset = 93.2;
                break;
            default:
                console.warn(
                    'Editor.refreshLayerEditBoxButton: Could not refresh edit box button of index "'
                    + index + '".');
                return;
        }

        var offset = $('canvas').offset();
        var posX = offset.left
            + this.zoom * (this.selectedLayer.x + this.selectedLayer.vertices[sel.index])
            - sel.offset;
        var posY = offset.top
            + this.zoom * (this.selectedLayer.y + this.selectedLayer.vertices[sel.index + 1])
            - 22.8;
        sel.obj.css('left', posX + 'px')
            .css('top', posY + 'px');
    }
});