var LayerCtrl = Class({
    initialize: function (editor, layer) {
        layerCtrlID = 'layerCtrl';

        this.editor = editor;
        if (layer == undefined) layer = null;
        this.activeLayer = layer;

        this.gui = new dat.GUI({ autoPlace: false });
        this.gui.domElement.id = layerCtrlID;
        this.gui.domElement.layerCtrl = this;
        $(this.gui.domElement).addClass("no-panning no-highlight");

        $('body').append(this.gui.domElement);

        this.functions = {
            layerCtrl: this,
            trigger: function () { },
            move: function () {
                let layer = this.object.layerCtrl.activeLayer;
                var v = layer.vertices;

                let lastAction = historyManager.undoList[historyManager.undoList.length - 1]
                let thisTime = (new Date()).getTime();
                let timeBetweenMoves;
                if (this.timeOfLastMove === undefined
                    || lastAction.ID != this.moveIDinHistory)
                    timeBetweenMoves = thisTime;
                else
                    timeBetweenMoves = thisTime - this.timeOfLastMove;
                this.timeOfLastMove = thisTime;
                // If it has been more than 300 sec since last call
                if (timeBetweenMoves >= 500
                    || lastAction.ID != this.moveIDinHistory) {
                    // Save the original symbol values
                    this.origVals = {
                        vtces: v.slice(0),
                        x: layer.x,
                        y: layer.y
                    };
                }

                switch (this.motionType) {
                    case 0:
                        if (layer.x + CANVAS_PIXEL_SCALE - (EDITOR_SIZE.x / 2)
                            + Math.max(v[0], v[2], v[4], v[6])
                            <= BOUNDING_BOX.maxPosVal) {
                            layer.x += CANVAS_PIXEL_SCALE;
                        }
                        break;
                    case 1:
                        if (layer.x - CANVAS_PIXEL_SCALE - (EDITOR_SIZE.x / 2)
                            + Math.min(v[0], v[2], v[4], v[6])
                            >= BOUNDING_BOX.maxNegVal) {
                            layer.x -= CANVAS_PIXEL_SCALE;
                        }
                        break;
                    case 2:
                        if (layer.y + CANVAS_PIXEL_SCALE - (EDITOR_SIZE.y / 2)
                            + Math.max(v[1], v[3], v[5], v[7])
                            <= BOUNDING_BOX.maxPosVal) {
                            layer.y += CANVAS_PIXEL_SCALE;
                        }
                        break;
                    case 3:
                        if (layer.y - CANVAS_PIXEL_SCALE - (EDITOR_SIZE.y / 2)
                            + Math.min(v[1], v[3], v[5], v[7])
                            >= BOUNDING_BOX.maxNegVal) {
                            layer.y -= CANVAS_PIXEL_SCALE;
                        }
                        break;
                }
                this.object.update(this.object.layerCtrl);

                let newVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                if (timeBetweenMoves >= 500
                    || lastAction.ID != this.moveIDinHistory) {
                    historyManager.pushUndoAction('symbol_reshape', {
                        layer: layer,
                        origVals: this.origVals,
                        newVals: newVals
                    });
                    this.moveIDinHistory = historyManager.pushID;
                    console.log('%cFinely Moved Symbol%c of layer "%s" in group "%s" at position "%i". '
                        + 'Vertices changed from %O to %O and position changed from (%i, %i) to (%i, %i).',
                        'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                        layer.parent.elems.indexOf(layer), this.origVals.vtces, newVals.vtces,
                        this.origVals.x, this.origVals.y, newVals.x, newVals.y);
                }
                else {
                    lastAction.params.newVals = newVals;
                }
            },
            horizFlip: function () {
                let layer = this.object.layerCtrl.activeLayer;
                let origVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                this.object.flip(0, layer.vertices);
                this.object.update(this.object.layerCtrl);
                historyManager.pushUndoAction('symbol_reshape', {
                    layer: layer,
                    origVals: origVals,
                    newVals: {
                        vtces: layer.vertices.slice(0),
                        x: layer.x,
                        y: layer.y
                    }
                });
                console.log('%cHorizontally Flipped Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));
            },
            vertFlip: function () {
                let layer = this.object.layerCtrl.activeLayer;
                let origVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                this.object.flip(1, layer.vertices);
                this.object.update(this.object.layerCtrl);
                historyManager.pushUndoAction('symbol_reshape', {
                    layer: layer,
                    origVals: origVals,
                    newVals: {
                        vtces: layer.vertices.slice(0),
                        x: layer.x,
                        y: layer.y
                    }
                });
                console.log('%cVertically Flipped Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));
            },
            flip: function (typeNum, v) {
                var scale;
                switch (typeNum) {
                    case 0: // Horizontal Flip
                        scale = [-1, 1]; break;
                    case 1: // Vertical Flip
                        scale = [1, -1]; break;
                    default:
                        return;
                }
                for (var i = 0; i < 4; i++) {
                    v[2 * i] *= scale[0]; v[2 * i + 1] *= scale[1];
                }
            },
            update: function (layerCtrl) {
                let editor = layerCtrl.editor;
                editor.updateLayer(layerCtrl.activeLayer);
                editor.render();
                editor.refreshLayerEditBox();
            }
        }

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
            clickoutFiresChange: true,
            beforeShow: function (color) {
                this.layer = $('canvas')[0].editor.selectedLayer;
                this.colorBeforeChange = this.layer.color;
            },
            change: function (color) { updateColor(color); },
            move: function (color) { updateColor(color); },
            hide: function (color) {
                let newColor = updateColor(color);
                if (newColor != this.colorBeforeChange) {
                    Layer.setDefaultColor(newColor);
                    historyManager.pushUndoAction('symbol_recolor', {
                        'layer': this.layer,
                        'oldColor': this.colorBeforeChange,
                        'newColor': newColor
                    });
                    console.log(
                        '%cRecolored Symbol%c of layer "%s" in group "%s" at position "%i" from #%s to #%s.',
                        'color: #2fa1d6', 'color: #f3f3f3', this.layer.name, this.layer.parent.name,
                        this.layer.parent.elems.indexOf(this.layer),
                        this.colorBeforeChange.toString(16), newColor.toString(16));
                }
            }
        });
        $('.sp-replacer').css('transition', '0.1s ease-in-out').addClass('no-panning');
        $('.sp-container').addClass('no-panning');
        function updateColor(color) {
            let canvas = $('canvas')[0];
            let newColor = null;
            if (canvas.editor === undefined) console.error(
                "Editor canvas could not be found and thus, color picker could not interact with the editor.");
            else {
                let editor = canvas.editor;
                if (editor.selectedLayer !== undefined) {
                    if (editor.selectedLayer != null) {
                        newColor = Math.round(parseInt('0x' + color.toHex()));
                        editor.selectedLayer.color = newColor;
                        editor.updateLayer(editor.selectedLayer);
                        editor.render();
                    }
                }
                else console.warn(
                    "No currently selected layer is defined. Could not update color picker.");
            }
            return newColor;
        }

        this.partselectmenu = new PartSelectMenu(this);
        this.partManager = {
            part: function () {
                this.menu.toggle();
            },
            menu: this.partselectmenu
        };
        this.part = this.gui.add(this.partManager, 'part')
            .name('symbol type');

        var layerAlphaHolder = { alpha: 7, isFirstChange: true };
        this.alpha = this.gui.add(layerAlphaHolder, 'alpha').min(0).step(1).max(7).listen()
            .name('transparency')
            .onChange(function (value) {
                let editor = $('canvas')[0].editor;
                this.layer = editor.layerCtrl.activeLayer;
                if (this.object.isFirstChange) {
                    this.initialAlpha = this.layer.alpha;
                    this.object.isFirstChange = false;
                }
                this.layer.alpha = value;
                editor.updateLayer(this.layer);
                editor.render();
            })
            .onFinishChange(function (value) {
                if (this.layer.alpha != this.initialAlpha) {
                    historyManager.pushUndoAction('symbol_changealpha', {
                        'layer': this.layer,
                        'oldAlpha': this.initialAlpha,
                        'newAlpha': this.layer.alpha
                    });
                    console.log(
                        '%cChanged Symbol Transparency%c of layer "%s" in group "%s" at position "%i" from %i to %i.',
                        'color: #2fa1d6', 'color: #f3f3f3', this.layer.name, this.layer.parent.name,
                        this.layer.parent.elems.indexOf(this.layer), this.initialAlpha, this.layer.alpha);
                }
                this.object.isFirstChange = true;
                this.initialAlpha = -1;
                this.layer = null;
            });

        this.flipsFolder = this.gui.addFolder('flip');
        this.horizFlip = this.flipsFolder.add(this.functions, 'trigger')
            .name('horizontal').onChange(this.functions.horizFlip);
        this.horizFlip.layerCtrl = this;
        this.horizFlip = this.flipsFolder.add(this.functions, 'trigger')
            .name('vertical').onChange(this.functions.vertFlip);
        this.horizFlip.layerCtrl = this;

        this.pos = this.gui.addFolder('move');
        this.posYMinus = this.pos.add(this.functions, 'trigger')
            .name('upward').onChange(this.functions.move);
        this.posYMinus.layerCtrl = this; this.posYMinus.motionType = 3;
        this.posXPlus = this.pos.add(this.functions, 'trigger')
            .name('rightward').onChange(this.functions.move);
        this.posXPlus.layerCtrl = this; this.posXPlus.motionType = 0;
        this.posXMinus = this.pos.add(this.functions, 'trigger')
            .name('leftward').onChange(this.functions.move);
        this.posXMinus.layerCtrl = this; this.posXMinus.motionType = 1;
        this.posYPlus = this.pos.add(this.functions, 'trigger')
            .name('downward').onChange(this.functions.move);
        this.posYPlus.layerCtrl = this; this.posYPlus.motionType = 2;

        $(this.gui.domElement).addClass('fade');
        $('.sp-replacer').addClass('fade fadeOut');
    },
    update: function (layer) {
        this.activeLayer = layer;
        this.partselectmenu.update(this.activeLayer.part);
        this.alpha.object.alpha = this.activeLayer.alpha;

        this.updateDisplay();
    },
    updateDisplay: function () {
        this.alpha.updateDisplay();
    },
    hide: function () {
        this.partselectmenu.hide();
        $(this.gui.domElement).addClass('fadeOut');
        $('.sp-replacer').addClass('fadeOut');
    },
    show: function () {
        this.partselectmenu.show();
        $(this.gui.domElement).removeClass('fadeOut');
        $('.sp-replacer').removeClass('fadeOut');
    },
    forceClose: function () {
        let layerCtrlBtn = $('div .close-button');
        if (layerCtrlBtn[0].innerText == 'Close Controls')
            layerCtrlBtn.click();
    }
});