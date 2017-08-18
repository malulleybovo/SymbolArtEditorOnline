var Editor = Class({
    initialize: function (parent, list) {
        EDITOR_SIZE = { x: 1920, y: 960 };
        CANVAS_PIXEL_SCALE = 3;
        this.zoom = window.innerWidth / (0.5 * EDITOR_SIZE.x); // = 1
        this.ZOOM_STEP = this.zoom / 8;
        this.ZOOM_MIN = this.zoom / 4;
        this.ZOOM_MAX = this.zoom * 4; // = 4.5
        this.MIN_VTX_VARIATION = 2 * CANVAS_PIXEL_SCALE;
        this.LAYER_HIGHLIGHT_FACTOR = 10.0;
        // Setting option for enabling assistance in doing purely vertical/horizontal changes in symbol
        this.disableSmallVtxChange = false;
        this.highlightedLayers = null;

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
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
        }).hide();
        var tr = $('<i class="fa fa-arrow-right fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
        tr[0].list = list;
        tr[0].editor = this;
        tr.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 1;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
        }).hide();
        var br = $('<i class="fa fa-arrow-down fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
        br[0].list = list;
        br[0].editor = this;
        br.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 2;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
        }).hide();
        var bl = $('<i class="fa fa-arrow-left fa-border edit-button corner-arrow no-highlight no-panning" ondragstart="return false;">');
        bl[0].list = list;
        bl[0].editor = this;
        bl.on('vmousedown', function () {
            if (!panZoomActive) {
                this.editor.currBtnDown = 3;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
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
        }).hide();
        var btn_resize = $('<i class="fa fa-expand fa-border edit-button no-highlight no-panning" ondragstart="return false;">');
        btn_resize[0].list = list;
        btn_resize[0].editor = this;
        btn_resize.on('vmousedown', function (e) {
            if (!panZoomActive) {
                this.editor.currBtnDown = 9;
                if (!this.editor.disableSmallVtxChange)
                    this.editor.origEditbtn = {
                        vtces: this.editor.layerCtrl.activeLayer.vertices.slice(0),
                        x: this.editor.layerCtrl.activeLayer.x,
                        y: this.editor.layerCtrl.activeLayer.y
                    };
            }
        }).on('vmousemove', function () {
        }).on('vmouseup', function () {
        }).hide();
        function diagStretch(index, clientPos, origValues) {
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
                if (Math.abs(layer.vertices[thisVerIndex] - origValues.vtces[thisVerIndex]) < editor.MIN_VTX_VARIATION) {
                    layer.vertices[thisVerIndex] = origValues.vtces[thisVerIndex];
                    layer.vertices[oppositeVerIndex] = origValues.vtces[oppositeVerIndex];
                }
                if (Math.abs(layer.vertices[thisVerIndex + 1] - origValues.vtces[thisVerIndex + 1]) < editor.MIN_VTX_VARIATION) {
                    layer.vertices[thisVerIndex + 1] = origValues.vtces[thisVerIndex + 1];
                    layer.vertices[oppositeVerIndex + 1] = origValues.vtces[oppositeVerIndex + 1];
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
        function resizeSymbol(clientPos, origValues) {
            let canvas = $('canvas');
            let canvasPos = canvas.offset();
            let editor = canvas[0].editor;
            let layer = list.selectedElem.parentNode.elem;
            let origVtces = origValues.vtces;
            let currVtces = layer.vertices;

            let relPos = { left: clientPos.left - canvasPos.left, top: clientPos.top - canvasPos.top };
            let dPosX = ((relPos.left / editor.zoom) - layer.x);
            let scalingFactor = (1 + dPosX / 100);
            if (scalingFactor < 0.1) scalingFactor = 0.1;
            for (var i = 0; i < 4; i++) {
                currVtces[2 * i] = roundPosition(origVtces[2 * i]
                    * scalingFactor);
                currVtces[2 * i + 1] = roundPosition(origVtces[2 * i + 1]
                    * scalingFactor);
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
            rotation: btn_rot,
            resize: btn_resize
        };

        $('body').on('vmousemove', function (e) {
            // Mouse Move for Button Control
            var buttons = $(this).find('.edit-button');
            if (!buttons.is(":visible")) return;

            var editor = $('canvas')[0].editor;
            let btnActive = editor.currBtnDown;
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
                    diagStretch(btnActive, pos, editor.origEditbtn);
                    break;
                case 2: // bottom right button
                case 3: // bottom left button
                    diagStretch(5 - btnActive, pos, editor.origEditbtn);
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
                case 9:
                    resizeSymbol(pos, editor.origEditbtn);
                    break;
                default:
                    break;
            }
            editor.refreshLayerEditBox();
        }).on('vmouseup', function (e) {
            var buttons = $(this).find('.edit-button');
            if (!buttons.is(":visible")) return;
            buttons.css('opacity', 1).css('cursor', 'default');

            let editor = $('canvas')[0].editor;
            let btnUsed = editor.currBtnDown;
            // Deactivate any edit box button that may have been used
            editor.currBtnDown = -1;

            let reshapeType;
            switch (btnUsed) {
                case 0: case 1: case 2: case 3:
                    reshapeType = 'Diagonally Stretched';
                case 4: case 5: case 6: case 7:
                    reshapeType = reshapeType || 'Side Stretched';
                case 8:
                    reshapeType = reshapeType || 'Rotated';
                case 9:
                    reshapeType = reshapeType || 'Resized';
                    let layer = list.selectedElem.parentNode.elem;
                    let vals = {
                        'layer': layer,
                        'origVals': {
                            vtces: editor.origEditbtn.vtces.slice(0),
                            x: editor.origEditbtn.x,
                            y: editor.origEditbtn.y
                        },
                        'newVals': {
                            vtces: layer.vertices.slice(0),
                            x: layer.x,
                            y: layer.y
                        }
                    };
                    let wasMeaningfulReshape = false;
                    if (vals.origVals.x != vals.newVals.x
                        || vals.origVals.y != vals.newVals.y)
                        wasMeaningfulReshape = true;
                    else {
                        for (var i = 0; i < vals.origVals.vtces.length; i++) {
                            if (vals.origVals.vtces[i] !== vals.newVals.vtces[i])
                                wasMeaningfulReshape = true;
                        }
                    }
                    if (wasMeaningfulReshape) {
                        historyManager.pushUndoAction('symbol_reshape', vals);
                        console.log('%c' + reshapeType + ' Symbol%c of layer "%s" in group "%s" at position "%i". '
                            + 'Vertices changed from %O to %O and position changed from (%i, %i) to (%i, %i).',
                            'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                            layer.parent.elems.indexOf(layer), vals.origVals.vtces, vals.newVals.vtces,
                            vals.origVals.x, vals.origVals.y, vals.newVals.x, vals.newVals.y);
                    }
                default:
                    break;
            }
        })
        $(window).resize(function () {
            let editor = $('canvas')[0].editor;
            let newScalingFactor = window.innerWidth / (0.5 * EDITOR_SIZE.x)
            editor.ZOOM_STEP = newScalingFactor / 8;
            editor.ZOOM_MIN = newScalingFactor / 4;
            editor.ZOOM_MAX = newScalingFactor * 4;
            if (editor.zoom < editor.ZOOM_MIN)
                editor.zoom = editor.ZOOM_MIN;
            else if (editor.zoom > editor.ZOOM_MAX)
                editor.zoom = editor.ZOOM_MAX;
            editor.updateSize();
        });

        // Initialize Layer Control
        this.layerCtrl = new LayerCtrl(this);
        this.layerCtrl.hide();

        $('body').append(this.editorBoxIcons.tl);
        $('body').append(this.editorBoxIcons.tr);
        $('body').append(this.editorBoxIcons.br);
        $('body').append(this.editorBoxIcons.bl);
        $('body').append(this.editorBoxIcons.left);
        $('body').append(this.editorBoxIcons.up);
        $('body').append(this.editorBoxIcons.right);
        $('body').append(this.editorBoxIcons.down);
        $('body').append(this.editorBoxIcons.rotation);
        $('body').append(this.editorBoxIcons.resize);
        //Add the canvas to the HTML document
        parent.appendChild(this.renderer.view);

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
    updateSize: function () {
        let scale = 'matrix(' + this.zoom + ', 0, 0, ' + this.zoom + ', '
                + (-EDITOR_SIZE.x / 2) + ', ' + (-EDITOR_SIZE.y / 2) + ')';
        $('canvas').parent().css('transform', scale);

        this.refreshLayerEditBox();
    },
    incrSize: function () {
        if (this.zoom + this.ZOOM_STEP <= this.ZOOM_MAX) {
            this.zoom += this.ZOOM_STEP;

            let scale = 'matrix(' + this.zoom + ', 0, 0, ' + this.zoom + ', '
                + (-EDITOR_SIZE.x / 2) + ', ' + (-EDITOR_SIZE.y / 2) + ')';
            $('canvas').parent().css('transform', scale);

            this.refreshLayerEditBox();
        }
    },
    decrSize: function () {
        if (this.zoom - this.ZOOM_STEP >= this.ZOOM_MIN) {
            this.zoom -= this.ZOOM_STEP;

            let scale = 'matrix(' + this.zoom + ', 0, 0, ' + this.zoom + ', '
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
        // Add layer at top
        return this.addLayerAt(layer, 0);
    },
    addLayerAt: function (layer, index) {
        // Check if valid index (there are length-1 layers in editor + SA Box)
        if (index < 0 || index > this.stage.children.length - 1) {
            console.error(
                '%cEditor (%O):%c Could not add layer %O to editor because'
                + 'provided index (%i) is invalid.',
                'color: #a6cd94', this, 'color: #d5d5d5', layer, index);
            return;
        }
        var quad = this.createLayer(layer);
        var layerData = { layer: layer, quad: quad };
        // Check if layer is at the bottom
        if (index === undefined || index == this.stage.children.length - 1) {
            // Add quad to bottom
            this.stage.addChildAt(quad, 0);
            // save layer data in top-down order (last index is the bottom)
            this.layers.push(layerData);
        }
        else {
            // Add quad to specified position (index [length-2] = top, index [0] = bottom)
            // (index [length-1] = SA Box) => should never change
            this.stage.addChildAt(quad, this.stage.children.length - 1 - index);
            // save layer data in top-down order (index 0 is the topmost)
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
                this.editor.hideLayerEditBox();
            }
        }).on('touchstart', function (evtData) {
            if (!panZoomActive && $('canvas')[0].editor.currBtnDown < 0) {
                this.isMoving = true;
                var newPosition = evtData.data.getLocalPosition(this.parent);
                this.origClickX = newPosition.x;
                this.origClickY = newPosition.y;
                this.origX = this.x;
                this.origY = this.y;
                this.editor.hideLayerEditBox();
            }
        });
        quad.on('mousemove', function (evtData) {
            if (this.isMoving) {
                this.x = this.origX + roundPosition(evtData.data.originalEvent.offsetX - this.origClickX);
                this.y = this.origY + roundPosition(evtData.data.originalEvent.offsetY - this.origClickY);
                this.editor.render();
                if (this.editor.highlightedLayers != null)
                    this.alpha /= this.editor.LAYER_HIGHLIGHT_FACTOR; // Void highlight just to update layer
                this.layerData.layer.update(this);
                if (this.editor.highlightedLayers != null)
                    this.alpha *= this.editor.LAYER_HIGHLIGHT_FACTOR; // Restore highlight if necessary
                this.editor.layerCtrl.update(this.layerData.layer);
            }
        }).on('touchmove', function (evtData) {
            // Check if moving the selected layer (only one layer active)
            if (!panZoomActive && this.isMoving) {
                var newPosition = evtData.data.getLocalPosition(this.parent);
                this.x = this.origX + roundPosition(newPosition.x - this.origClickX);
                this.y = this.origY + roundPosition(newPosition.y - this.origClickY);
                this.editor.render();
                if (this.editor.highlightedLayers != null)
                    this.alpha /= this.editor.LAYER_HIGHLIGHT_FACTOR; // Void highlight just to update layer
                this.layerData.layer.update(this);
                if (this.editor.highlightedLayers != null)
                    this.alpha *= this.editor.LAYER_HIGHLIGHT_FACTOR; // Restore highlight if necessary
                this.editor.layerCtrl.update(this.layerData.layer);
            }
        });
        quad.on('mouseup', function (evtData) {
            let layer = this.layerData.layer;
            if (this.isMoving // Save undoable action if moved symbol
                && (layer.x != this.origX || layer.y != this.origY)) {
                historyManager.pushUndoAction('symbol_move', {
                    'layer': layer,
                    'startX': this.origX,
                    'startY': this.origY,
                    'endX': layer.x,
                    'endY': layer.y
                });
                console.log('%cMoved Symbol%c of layer "%s" in group "%s" at position "%i" '
                    + 'from position (%i, %i) to (%i, %i).',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer),
                    this.origX, this.origY, layer.x, layer.y);
            }

            this.editor.showLayerEditBox();
            this.editor.refreshLayerEditBox();
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

            this.editor.showLayerEditBox();
            this.editor.refreshLayerEditBox();
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
        // Remove top layer in editor
        // (index = length-2 because SA Box, the topmost layer, is at length-1)
        this.stage.removeChildAt(this.stage.children.length - 2);
        // Remove top layer data (at index 0 due to top-down ordering)
        var layerData = this.layers[0];
        this.layers.splice(0, 1);
        // Hide because selected layer is not in editor anymore
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
        var idx = findWithAttr(this.layers, 'layer', layer);
        if (idx == -1) return;
        var quad = this.layers[idx].quad;
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

        if (this.highlightedLayers != null) {
            let startIdx = this.getLayerIndex(this.highlightedLayers[0]);
            if (startIdx >= 0 && startIdx < this.layers.length
                && idx >= startIdx && idx < startIdx + this.highlightedLayers[1]) {
                quad.alpha *= this.LAYER_HIGHLIGHT_FACTOR;
            }
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
        let foundQuad = false;
        for (var i = 0; i < this.layers.length; i++) {
            if (!foundQuad && this.layers[i].layer == layer) {
                // Make the selected interactive
                this.layers[i].quad.interactive = true;
                foundQuad = true; // First match found
            }
            else {
                // Disable interaction for all other unselected layers
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
        // Handlers for mousemove-based group motion
        let groupMoveMousedownHandler = function (e) {
            if (!panZoomActive
                && list.selectedElem.parentNode.elem.type == 'g') {
                this.mouseMoving = true;

                this.canvas = $('canvas')[0];
                this.editor = this.canvas.editor;
                this.lis = $(list.container).find('li');
                this.lisInGroup = $(list.selectedElem.parentNode.parentNode).find('li');
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
        }
        let groupMoveMousemoveHandler = function (e) {
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
                        layer.x = this.origX[i] + roundPosition(clickX - this.origClickX);
                        layer.y = this.origY[i] + roundPosition(clickY - this.origClickY);
                        if (!this.hasChangedGroupPos // Check to see if should push to history after done
                            && (layer.x != this.origX[i] || layer.y != this.origY[i])) {
                            this.hasChangedGroupPos = true;
                        }
                    }
                    else if (ev instanceof TouchEvent) { // Mobile device touch event
                        var clickX = (ev.touches[0].pageX - ev.touches[0].target.offsetLeft);
                        var clickY = (ev.touches[0].pageY - ev.touches[0].target.offsetTop);
                        layer.x = this.origX[i] + roundPosition(clickX - this.origClickX);
                        layer.y = this.origY[i] + roundPosition(clickY - this.origClickY);
                        if (!this.hasChangedGroupPos // Check to see if should push to history after done
                            && (layer.x != this.origX[i] || layer.y != this.origY[i])) {
                            this.hasChangedGroupPos = true;
                        }
                    }
                    this.editor.updateLayer(layer);
                }
                this.editor.render();
            }
        }
        let groupMoveMouseupHandler = function (e) {
            this.mouseMoving = false;
            if (this.hasChangedGroupPos) {
                this.hasChangedGroupPos = undefined;
                let endX = [];
                let endY = [];
                var layer;
                for (var i = this.firstIndex; i < this.lastIndex; i++) {
                    layer = this.editor.layers[i].layer;
                    endX[i] = layer.x;
                    endY[i] = layer.y;
                }

                historyManager.pushUndoAction('symbol_groupmove', {
                    'layers': this.editor.layers,
                    'startIdx': this.firstIndex,
                    'endIdx': this.lastIndex,
                    'startX': this.origX,
                    'startY': this.origY,
                    'endX': endX,
                    'endY': endY
                });
                console.log('%cMoved Group of Symbols%c in group "%s".',
                    'color: #2fa1d6', 'color: #f3f3f3', list.selectedElem.parentNode.elem.name);
                this.endX = undefined;
                this.endY = undefined;
            }
        }
        canvas.bind('vmousedown.saGroupMousedown', groupMoveMousedownHandler)
            .bind('vmousemove.saGroupMousemove', groupMoveMousemoveHandler)
            .bind('vmouseup.saGroupMouseup', groupMoveMouseupHandler);
    },
    disableGroupInteraction: function () {
        let canvas = $('canvas');

        canvas[0].movingFolder = undefined;

        canvas.unbind('vmousedown.saGroupMousedown')
            .unbind('vmousemove.saGroupMousemove')
            .unbind('vmouseup.saGroupMouseup');
    },
    setHighlightedLayers: function (startLayer, optionalLength) {
        if (this.highlightedLayers != null) {
            this.stopHighlightingLayers();
        }
        if (startLayer === undefined) return;
        let length =
            (optionalLength !== undefined && typeof optionalLength === 'number'
            && optionalLength <= this.layers.length) ?
            optionalLength : 1; // Inclusive
        this.highlightedLayers = [startLayer, length];
        this.stage.alpha = 1.0 / this.LAYER_HIGHLIGHT_FACTOR;
        let startIdx = this.getLayerIndex(startLayer);
        for (var i = startIdx; i < startIdx + length; i++) {
            if (this.layers[i])
                this.layers[i].quad.alpha *= this.LAYER_HIGHLIGHT_FACTOR;
        }
    },
    refreshHighlightedLayers: function () {
        if (this.highlightedLayers == null) return;
        let startIdx = this.getLayerIndex(this.highlightedLayers[0]);
        if (startIdx < 0 || startIdx >= this.layers.length) return;
        for (var i = startIdx; i < startIdx + this.highlightedLayers[1]; i++) {
            if (this.layers[i] && this.layers[i].quad.alpha <= 1)
                this.layers[i].quad.alpha *= this.LAYER_HIGHLIGHT_FACTOR;
        }
    },
    stopHighlightingLayers: function () {
        if (this.highlightedLayers == null) return;
        this.stage.alpha = 1.0;
        for (var i = 0; i < this.layers.length; i++) {
            // If layer is highlighted, it will have a higher alpha value then 1
            // in that case, reset its alpha value
            if (this.layers[i].quad.alpha > 1)
                this.layers[i].quad.alpha /= this.LAYER_HIGHLIGHT_FACTOR;
        }
        this.highlightedLayers = null;
    },
    hideInterface: function () {
        this.layerCtrl.hide();
        this.hideLayerEditBox();
    },
    showInterface: function () {
        if (this.selectedLayer == null
            || this.selectedLayer.visible == false) return;
        this.layerCtrl.show();
        this.showLayerEditBox();
    },
    changeLayerVisibility: function (bool, idx, optionalIdx) {
        if (bool === undefined || typeof bool !== 'boolean'
            || idx === undefined || typeof idx !== 'number'
            || idx < 0 || idx >= this.layers.length) return;
        let startIdx = idx;
        let endIdx =
            (optionalIdx !== undefined && typeof optionalIdx === 'number'
            && optionalIdx > idx && optionalIdx <= this.layers.length) ?
            optionalIdx : idx + 1; // Inclusive
        for (var i = startIdx; i < endIdx; i++) {
            if (this.layers[i])
                this.layers[i].layer.visible = bool;
                this.layers[i].quad.visible = bool;
        }
    },
    hideLayerEditBox: function () {
        this.editorBoxIcons.tl.hide();
        this.editorBoxIcons.tr.hide();
        this.editorBoxIcons.bl.hide();
        this.editorBoxIcons.br.hide();
        this.editorBoxIcons.left.hide();
        this.editorBoxIcons.up.hide();
        this.editorBoxIcons.right.hide();
        this.editorBoxIcons.down.hide();
        this.editorBoxIcons.rotation.hide();
        this.editorBoxIcons.resize.hide();
    },
    showLayerEditBox: function () {
        this.editorBoxIcons.tl.show();
        this.editorBoxIcons.tr.show();
        this.editorBoxIcons.bl.show();
        this.editorBoxIcons.br.show();
        this.editorBoxIcons.left.show();
        this.editorBoxIcons.up.show();
        this.editorBoxIcons.right.show();
        this.editorBoxIcons.down.show();
        this.editorBoxIcons.rotation.show();
        this.editorBoxIcons.resize.show();
    },
    refreshLayerEditBox: function () {
        if (this.selectedLayer == null
            || this.selectedLayer.visible == false) return;
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
        this.editorBoxIcons.resize.css('left', (basePosX - 11.3) + 'px')
            .css('top', (basePosY + 17.5) + 'px');
    },
    refreshLayerEditBoxButton: function (index) {
        if (this.selectedLayer == null
            || this.selectedLayer.visible == false) return;
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

        // Add SA Box to top layer
        this.stage.addChild(this.SABox);
        // Then add existing symbols below it
        refreshGroupDisplay(this.mainGroup, this);

        function refreshGroupDisplay(currGroup, editor) {
            // Add all layers inside group in bottom to top layer order
            for (var i = currGroup.elems.length - 1; i >= 0; i--) {
                let elem = currGroup.elems[i];
                if (elem.type == 'l') { // If a layer
                    // Add layer to the editor
                    // (at bottom layer of editor because of for-loop ordering)
                    let layerData = editor.addLayer(elem);
                    // Match quad visibility with layer info
                    layerData.quad.visible = elem.visible;
                    layerData.quad.interactive = false; // Default interactiveness is false
                }
                else if (elem.type == 'g') { // If a group
                    // Recursively add layers inside it
                    refreshGroupDisplay(elem, editor);
                }
            }
        }
    }
});

function roundPosition (val) {
    return Math.round(val / CANVAS_PIXEL_SCALE) * CANVAS_PIXEL_SCALE;
}