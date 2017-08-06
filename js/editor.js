var Editor = Class({
    initialize: function (parent, list) {
        EDITOR_SIZE = { x: 1920, y: 960 };
        CANVAS_PIXEL_SCALE = 3;
        this.ZOOM_STEP = 0.35;
        this.ZOOM_MIN = 0.3;
        this.ZOOM_MAX = this.ZOOM_MIN + 12 * this.ZOOM_STEP; // = 4.5
        this.zoom = this.ZOOM_MIN + 2 * this.ZOOM_STEP; // = 1
        this.MIN_VTX_VARIATION = 2 * CANVAS_PIXEL_SCALE;
        this.disableSmallVtxChange = false;

        this.list = list;
        this.mainGroup = list.mainGroup;

        //Create the renderer
        this.renderer = PIXI.autoDetectRenderer(EDITOR_SIZE.x, EDITOR_SIZE.y, { transparent: true });

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
        var tl = $('<i class="fa fa-arrow-up fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
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
        var tr = $('<i class="fa fa-arrow-right fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
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
        var br = $('<i class="fa fa-arrow-down fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
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
        var bl = $('<i class="fa fa-arrow-left fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
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
        var btn_l = $('<i class="fa fa-arrow-left fa-border edit-button no-highlight no-panning" ondragstart="return false;">');
        btn_l[0].list = list;
        btn_l[0].editor = this;
        btn_l.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 4;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_u = $('<i class="fa fa-arrow-up fa-border edit-button no-highlight no-panning" ondragstart="return false;">');
        btn_u[0].list = list;
        btn_u[0].editor = this;
        btn_u.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 5;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_r = $('<i class="fa fa-arrow-right fa-border edit-button no-highlight no-panning" ondragstart="return false;">');
        btn_r[0].list = list;
        btn_r[0].editor = this;
        btn_r.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 6;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_d = $('<i class="fa fa-arrow-down fa-border edit-button no-highlight no-panning" ondragstart="false">');
        btn_d[0].list = list;
        btn_d[0].editor = this;
        btn_d.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 7;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
            this.editor.currBtnDown = -1;
        }).hide();
        var btn_rot = $('<i class="fa fa-repeat fa-border edit-button no-highlight no-panning" ondragstart="return false;">');
        btn_rot[0].list = list;
        btn_rot[0].editor = this;
        btn_rot.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 8;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
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
                x: roundPosition((relPos.left / editor.zoom) - layer.x - layer.vertices[thisVerIndex]),
                y: roundPosition((relPos.top / editor.zoom) - layer.y - layer.vertices[thisVerIndex + 1])
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
        function sideStretch(index, clientPos, origValues) {
            var corner1Index, corner2Index, vi3, vi4;
            var isHorizontal;
            switch (index) {
                case 0: corner1Index = 0; corner2Index = 4; vi3 = 2; vi4 = 6; break; // left
                case 1: corner1Index = 0; corner2Index = 2; vi3 = 4; vi4 = 6; break; // up
                case 2: corner1Index = 2; corner2Index = 6; vi3 = 0; vi4 = 4; break; // right
                case 3: corner1Index = 4; corner2Index = 6; vi3 = 0; vi4 = 2; break; // down
                default:
                    return;
            }
            var canvas = $('canvas');
            var canvasPos = canvas.offset();
            var editor = canvas[0].editor;
            var layer = list.selectedElem.parentNode.elem;

            var relPos = { left: clientPos.left - canvasPos.left, top: clientPos.top - canvasPos.top };
            var dPos = {
                x: roundPosition(((relPos.left / editor.zoom) - layer.x
                    - ((layer.vertices[corner1Index] + layer.vertices[corner2Index]) / 2))) / 2,
                y: roundPosition(((relPos.top / editor.zoom) - layer.y
                    - ((layer.vertices[corner1Index + 1] + layer.vertices[corner2Index + 1]) / 2))) / 2
            };

            layer.x += dPos.x;
            layer.y += dPos.y;
            layer.vertices[corner1Index] += dPos.x;
            layer.vertices[corner2Index] += dPos.x;
            layer.vertices[corner1Index + 1] += dPos.y;
            layer.vertices[corner2Index + 1] += dPos.y;
            layer.vertices[vi3] -= dPos.x;
            layer.vertices[vi4] -= dPos.x;
            layer.vertices[vi3 + 1] -= dPos.y;
            layer.vertices[vi4 + 1] -= dPos.y;
            if (!editor.disableSmallVtxChange) {
                if (Math.abs((layer.vertices[corner1Index] + layer.x) 
                    - (origValues.vtces[corner1Index] + origValues.x)) 
                    < editor.MIN_VTX_VARIATION) {

                    layer.x = origValues.x;
                    layer.vertices[corner1Index] = origValues.vtces[corner1Index];
                    layer.vertices[corner2Index] = origValues.vtces[corner2Index];
                    layer.vertices[vi3] = origValues.vtces[vi3];
                    layer.vertices[vi4] = origValues.vtces[vi4];
                }
                if (Math.abs((layer.vertices[corner1Index + 1] + layer.y)
                    - (origValues.vtces[corner1Index + 1] + origValues.y))
                    < editor.MIN_VTX_VARIATION) {

                    layer.y = origValues.y;
                    layer.vertices[corner1Index + 1] = origValues.vtces[corner1Index + 1];
                    layer.vertices[corner2Index + 1] = origValues.vtces[corner2Index + 1];
                    layer.vertices[vi3 + 1] = origValues.vtces[vi3 + 1];
                    layer.vertices[vi4 + 1] = origValues.vtces[vi4 + 1];
                }
            }

            editor.updateLayer(layer);
            editor.render();
        }
        function rotate(clientPos, origValues) {
            var canvas = $('canvas');
            var canvasPos = canvas.offset();
            var editor = canvas[0].editor;
            var layer = list.selectedElem.parentNode.elem;

            var relPos = { left: clientPos.left - canvasPos.left, top: clientPos.top - canvasPos.top };
            var dPos = {
                x: ((relPos.left / editor.zoom) - layer.x),
                y: ((relPos.top / editor.zoom) - layer.y)
            };
            var ang = Math.asin(dPos.x / Math.sqrt((dPos.x * dPos.x) + (dPos.y * dPos.y)));
            var v = origValues.vtces;
            if (dPos.y > 0) ang = Math.PI - ang;
            var sin = Math.sin(ang), cos = Math.cos(ang);
            for (var i = 0; i < v.length; i += 2) {
                var x = cos * v[i] - sin * v[i + 1], y = sin * v[i] + cos * v[i + 1];
                layer.vertices[i] = roundPosition(x); layer.vertices[i + 1] = roundPosition(y);
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
            down: btn_d,
            rotation: btn_rot
        };

        $('body').on('vmousemove', function (e) {
            // Mouse Move for Button Control
            var buttons = $(this).find('.edit-button');
            if (!buttons.is(":visible")) return;

            var editor = $('canvas')[0].editor;
            var btnActive = editor.currBtnDown;
            // Check if should proceed
            if (btnActive < 0) {
                return; // Avoids useless computation
            }
            buttons.css('opacity', 0.2).css('cursor', 'none');

            var pos = {
                left: Math.round(e.clientX),
                top: Math.round(e.clientY)
            }
            switch (btnActive) {
                case 0: // top left button
                case 1: // top right button
                    diagStretch(btnActive, pos, editor.origEditbtnPos);
                    break;
                case 2: // bottom right button
                case 3: // bottom left button
                    diagStretch(5 - btnActive, pos, editor.origEditbtnPos);
                    break;
                case 4: // left button
                case 5: // top button
                case 6: // right button
                case 7: // bottom button
                    sideStretch(btnActive - 4, pos, editor.origEditbtn);
                    break;
                case 8:
                    rotate(pos, editor.origEditbtn);
                    break;
                default:
                    break;
            }
            $('canvas')[0].editor.refreshLayerEditBox();
        }).on('vmouseup', function (e) {
            var buttons = $(this).find('.edit-button');
            if (!buttons.is(":visible")) return;
            buttons.css('opacity', 1).css('cursor', 'default');

            let editor = $('canvas')[0].editor;
            if (editor.currBtnDown == 8) {
                let layer = list.selectedElem.parentNode.elem;
                historyManager.pushUndoAction('symbol_rotate', {
                    'layer': layer,
                    'origVtces': editor.origEditbtn.vtces.slice(0),
                    'vtcesAfterRot': layer.vertices.slice(0)
                });
                console.log('%cRotated Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));
            }

            // Deactivate any edit box button that may have been used
            editor.currBtnDown = -1;
        })
        $(window).resize(function () {
            $('canvas')[0].editor.refreshLayerEditBox();
        });

        // Initialize Layer Control
        this.layerCtrl = new LayerCtrl(this);
        this.layerCtrl.hide();

        this.layerCtrl.alpha.editor = this;
        this.layerCtrl.alpha.onChange(function () {
            var editor = $('canvas')[0].editor;
            editor.updateLayer($('#' + layerCtrlID)[0].layerCtrl.activeLayer);
            editor.render();
        });


        $('body').append(this.editorBoxIcons.tl);
        $('body').append(this.editorBoxIcons.tr);
        $('body').append(this.editorBoxIcons.br);
        $('body').append(this.editorBoxIcons.bl);
        $('body').append(this.editorBoxIcons.left);
        $('body').append(this.editorBoxIcons.up);
        $('body').append(this.editorBoxIcons.right);
        $('body').append(this.editorBoxIcons.down);
        $('body').append(this.editorBoxIcons.rotation);
        //Add the canvas to the HTML document
        parent.appendChild(this.renderer.view);

        // Add Toolbar
        this.toolbar = new Toolbar();

        $('canvas').addClass('editor-canvas-border');
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
        if (Math.round(this.zoom * 100) < this.ZOOM_MAX * 100) {
            this.zoom += this.ZOOM_STEP;

            var scale = 'matrix(' + this.zoom + ', 0, 0, ' + this.zoom + ', '
                + (-EDITOR_SIZE.x / 2) + ', ' + (-EDITOR_SIZE.y / 2) + ')';
            $('canvas').parent().css('transform', scale);

            this.refreshLayerEditBox();
        }
    },
    decrSize: function () {
        if (Math.round(this.zoom * 100) > this.ZOOM_MIN * 100) {
            this.zoom -= this.ZOOM_STEP;

            var scale = 'matrix(' + this.zoom + ', 0, 0, ' + this.zoom + ', '
                + (-EDITOR_SIZE.x / 2) + ', ' + (-EDITOR_SIZE.y / 2) + ')';
            $('canvas').parent().css('transform', scale);

            this.refreshLayerEditBox();
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
                this.x = this.origX + roundPosition(evtData.data.originalEvent.offsetX - this.origClickX);
                this.y = this.origY + roundPosition(evtData.data.originalEvent.offsetY - this.origClickY);
                this.editor.render();
                this.layerData.layer.update(this);
                this.editor.refreshLayerEditBox();
                this.editor.layerCtrl.update(this.layerData.layer);
            }
        }).on('touchmove', function (evtData) {
            if (!panZoomActive && this.isMoving) {
                var newPosition = evtData.data.getLocalPosition(this.parent);
                this.x = this.origX + roundPosition(newPosition.x - this.origClickX);
                this.y = this.origY + roundPosition(newPosition.y - this.origClickY);
                this.editor.render();
                this.layerData.layer.update(this);
                this.editor.refreshLayerEditBox();
                this.editor.layerCtrl.update(this.layerData.layer);
            }
        });
        quad.on('mouseup', function (evtData) {
            if (this.isMoving) { // Save undoable action if moved symbol
                let layer = this.layerData.layer;
                historyManager.pushUndoAction('symbol_move', {
                    'layer': layer,
                    'startX': this.origX,
                    'startY': this.origY,
                    'endX': layer.x,
                    'endY': layer.y
                });
                console.log('%cMoved Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));
            }

            this.isMoving = false;
            delete this.origClickX;
            delete this.origClickY;
            delete this.origX;
            delete this.origY;
        }).on('touchend', function (evtData) {
            if (this.isMoving) { // Save undoable action if moved symbol
                let layer = this.layerData.layer;
                historyManager.pushUndoAction('symbol_move', {
                    'layer': layer,
                    'startX': this.origX,
                    'startY': this.origY,
                    'endX': layer.x,
                    'endY': layer.y
                });
                console.log('%cMoved Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));
            }

            this.isMoving = false;
            delete this.origClickX;
            delete this.origClickY;
            delete this.origX;
            delete this.origY;
        }).on('touchendoutside', function (evtData) {
            if (this.isMoving) { // Save undoable action if moved symbol
                let layer = this.layerData.layer;
                historyManager.pushUndoAction('symbol_move', {
                    'layer': layer,
                    'startX': this.origX,
                    'startY': this.origY,
                    'endX': layer.x,
                    'endY': layer.y
                });
                console.log('%cMoved Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));
            }

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
                        layer.x = roundPosition(this.origX[i] + (clickX - this.origClickX));
                        layer.y = roundPosition(this.origY[i] + (clickY - this.origClickY));
                    }
                    else if (ev instanceof TouchEvent) { // Mobile device touch event
                        var clickX = (ev.touches[0].pageX - ev.touches[0].target.offsetLeft);
                        var clickY = (ev.touches[0].pageY - ev.touches[0].target.offsetTop);
                        layer.x = roundPosition(this.origX[i] + ((clickX - this.origClickX) / this.editor.zoom));
                        layer.y = roundPosition(this.origY[i] + ((clickY - this.origClickY) / this.editor.zoom));
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
        this.editorBoxIcons.rotation.hide();
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
        this.editorBoxIcons.rotation.show();
    },
    refreshLayerEditBox: function () {
        if (this.editorBoxIcons.tl.is(':hidden')) return; // Ignore if UI is hidden
        var offset = $('canvas').offset();
        var basePosX = offset.left + this.zoom * this.selectedLayer.x;
        var basePosY = offset.top + this.zoom * this.selectedLayer.y;
        var v = this.selectedLayer.vertices;
        this.editorBoxIcons.tl.css('left', (basePosX + this.zoom * v[0] - 11.3) + 'px')
            .css('top', (basePosY + this.zoom * v[1] - 12.5) + 'px');
        this.editorBoxIcons.tr.css('left', (basePosX + this.zoom * v[2] - 11.3) + 'px')
            .css('top', (basePosY + this.zoom * v[3] - 12.5) + 'px');
        this.editorBoxIcons.bl.css('left', (basePosX + this.zoom * v[4] - 11.3) + 'px')
            .css('top', (basePosY + this.zoom * v[5] - 12.5) + 'px');
        this.editorBoxIcons.br.css('left', (basePosX + this.zoom * v[6] - 11.3) + 'px')
            .css('top', (basePosY + this.zoom * v[7] - 12.5) + 'px');

        this.editorBoxIcons.left.css('left', (basePosX + (this.zoom * (v[0] + v[4])) / 2 - 11.3) + 'px')
            .css('top', (basePosY + (this.zoom * (v[1] + v[5])) / 2 - 12.5) + 'px');
        this.editorBoxIcons.up.css('left', (basePosX + (this.zoom * (v[0] + v[2])) / 2 - 11.3) + 'px')
            .css('top', (basePosY + (this.zoom * (v[1] + v[3])) / 2 - 12.5) + 'px');
        this.editorBoxIcons.right.css('left', (basePosX + (this.zoom * (v[2] + v[6])) / 2 - 11.3) + 'px')
            .css('top', (basePosY + (this.zoom * (v[3] + v[7])) / 2 - 12.5) + 'px');
        this.editorBoxIcons.down.css('left', (basePosX + (this.zoom * (v[4] + v[6])) / 2 - 11.3) + 'px')
            .css('top', (basePosY + (this.zoom * (v[5] + v[7])) / 2 - 12.5) + 'px');

        this.editorBoxIcons.rotation.css('left', (basePosX - 11.3) + 'px')
            .css('top', (basePosY - 42.5) + 'px');
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
    },
    refreshDisplay: function () {
        this.stage.removeChildren();
        this.layers = [];

        refreshGroupDisplay(this.mainGroup, this);
        this.stage.addChild(this.SABox);

        function refreshGroupDisplay(currGroup, editor) {
            for (var i = currGroup.elems.length - 1; i >= 0; i--) {
                let elem = currGroup.elems[i];
                if (elem.type == 'l') {
                    let layerData = editor.addLayer(elem);
                    layerData.quad.interactive = false;
                }
                else if (elem.type == 'g') {
                    refreshGroupDisplay(elem, editor);
                }
            }
        }
    }
});

function roundPosition (val) {
    return Math.round(val / CANVAS_PIXEL_SCALE) * CANVAS_PIXEL_SCALE;
}