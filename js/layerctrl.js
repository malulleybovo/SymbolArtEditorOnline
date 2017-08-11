var LayerCtrl = Class({
    initialize: function (editor, layer) {
        layerCtrlID = 'layerCtrl';

        this.editor = editor;
        if (layer == undefined) layer = new Layer();
        this.activeLayer = layer;

        this.gui = new dat.GUI({ autoPlace: false });
        this.gui.domElement.id = layerCtrlID;
        this.gui.domElement.layerCtrl = this;
        $(this.gui.domElement).addClass("no-panning no-highlight");

        $('body').append(this.gui.domElement);

        this.functions = {
            trigger: function () { },
            move: function () {
                let layer = this.layerCtrl.activeLayer;
                var v = layer.vertices;

                let lastAction = historyManager.undoList[historyManager.undoList.length - 1]
                let thisTime = (new Date()).getTime();
                let timeBetweenStretches;
                if (this.timeOfLastStretch === undefined
                    || lastAction.ID != this.stretchIDinHistory)
                    timeBetweenStretches = thisTime;
                else
                    timeBetweenStretches = thisTime - this.timeOfLastStretch;
                this.timeOfLastStretch = thisTime;
                // If it has been more than 300 sec since last call
                if (timeBetweenStretches >= 500
                    || lastAction.ID != this.stretchIDinHistory) {
                    // Save the original symbol values
                    this.origVals = {
                        vtces: v.slice(0),
                        x: layer.x,
                        y: layer.y
                    };
                }

                switch (this.motionType) {
                    case 0:
                        layer.x += CANVAS_PIXEL_SCALE; break;
                    case 1:
                        layer.x -= CANVAS_PIXEL_SCALE; break;
                    case 2:
                        layer.y += CANVAS_PIXEL_SCALE; break;
                    case 3:
                        layer.y -= CANVAS_PIXEL_SCALE; break;
                }
                this.layerCtrl.functions.update(this.layerCtrl);

                let newVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                if (timeBetweenStretches >= 500
                    || lastAction.ID != this.stretchIDinHistory) {
                    historyManager.pushUndoAction('symbol_reshape', {
                        layer: layer,
                        origVals: this.origVals,
                        newVals: newVals
                    });
                    this.stretchIDinHistory = historyManager.pushID;
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
                let layer = this.layerCtrl.activeLayer;
                let origVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                this.object.flip(0, layer.vertices);
                this.object.update(this.layerCtrl);
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
                let layer = this.layerCtrl.activeLayer;
                let origVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                this.object.flip(1, layer.vertices);
                this.object.update(this.layerCtrl);
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
            diagStretchMore: function () {
                this.object.diagStretch(this, CANVAS_PIXEL_SCALE);
                this.object.update(this.layerCtrl);
            },
            diagStretchLess: function () {
                this.object.diagStretch(this, -CANVAS_PIXEL_SCALE);
                this.object.update(this.layerCtrl);
            },
            diagStretch: function (that, amount) {
                var v1, v2, reshapeType;
                switch (that.diagNum) {
                    case 0:
                        v1 = 0; v2 = 6; reshapeType = '\u2196 \u2198';
                        break;
                    case 1:
                        v1 = 2; v2 = 4; reshapeType = '\u2199 \u2197';
                        break;
                    default:
                        return;
                }
                let layer = that.layerCtrl.activeLayer;
                var v = layer.vertices;

                let lastAction = historyManager.undoList[historyManager.undoList.length - 1]
                let thisTime = (new Date()).getTime();
                let timeBetweenStretches;
                if (that.timeOfLastStretch === undefined
                    || lastAction.ID != that.stretchIDinHistory)
                    timeBetweenStretches = thisTime;
                else 
                    timeBetweenStretches = thisTime - that.timeOfLastStretch;
                that.timeOfLastStretch = thisTime;
                // If it has been more than 300 sec since last call
                if (timeBetweenStretches >= 500
                    || lastAction.ID != that.stretchIDinHistory) {
                    // Save the original symbol values
                    that.origVals = {
                        vtces: v.slice(0),
                        x: layer.x,
                        y: layer.y
                    };
                }

                var vOffset = 0;
                if (!that.isHoriz) vOffset++;
                if (v[v1 + vOffset] <= v[v2 + vOffset]) amount = -amount;
                v[v1 + vOffset] += amount;
                v[v2 + vOffset] -= amount;

                let newVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                if (timeBetweenStretches >= 500
                    || lastAction.ID != that.stretchIDinHistory) {
                    historyManager.pushUndoAction('symbol_reshape', {
                        layer: layer,
                        origVals: that.origVals,
                        newVals: newVals
                    });
                    that.stretchIDinHistory = historyManager.pushID;
                    console.log('%c' + reshapeType + ' Finely Diagonally Stretched Symbol%c of layer "%s" in group "%s" at position "%i". '
                        + 'Vertices changed from %O to %O and position changed from (%i, %i) to (%i, %i).',
                        'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                        layer.parent.elems.indexOf(layer), that.origVals.vtces, newVals.vtces,
                        that.origVals.x, that.origVals.y, newVals.x, newVals.y);
                }
                else {
                    lastAction.params.newVals = newVals;
                }
            },
            sideStretchMore: function () {
                this.object.sideStretch(this, CANVAS_PIXEL_SCALE);
                this.object.update(this.layerCtrl);
            },
            sideStretchLess: function () {
                this.object.sideStretch(this, -CANVAS_PIXEL_SCALE);
                this.object.update(this.layerCtrl);
            },
            sideStretch: function (that, amount) {
                var arbiterV = 0;
                var testV;
                var vtx_i = undefined;
                // isLeftOrTop purely modifies boolean expressions in shearing to save code space
                // idxOffset purely tweaks the indices used in shearing to save code space
                var isLeftOrTop, idxOffset;
                let reshapeType;
                let layer = that.layerCtrl.activeLayer;
                var v = layer.vertices;
                switch (that.sideNum) {
                    case 0:
                        vtx_i = [0, 4, 2, 6];
                        reshapeType = 'Finely Stretched Left Side';
                    case 1:
                        vtx_i = vtx_i || [2, 6, 0, 4];
                        testV = 2;
                        reshapeType = reshapeType || 'Finely Stretched Right Side';
                        break;
                    case 2:
                        vtx_i = [0, 2, 4, 6];
                        reshapeType = reshapeType || 'Finely Stretched Top Side';
                    case 3:
                        vtx_i = vtx_i || [4, 6, 0, 2];
                        testV = 4;
                        reshapeType = reshapeType || 'Finely Stretched Bottom Side';
                        break;
                    case 4: // Shear Top Side
                        isLeftOrTop = true; idxOffset = 1;
                        reshapeType = reshapeType || 'Finely Sheared Top Side';
                    case 5: // Shear Right Side
                        if (isLeftOrTop === undefined) isLeftOrTop = false;
                        if (idxOffset === undefined) idxOffset = 0;
                        reshapeType = reshapeType || 'Finely Sheared Right Side';
                    case 6: // Shear Left Side
                        if (isLeftOrTop === undefined) isLeftOrTop = true;
                        if (idxOffset === undefined) idxOffset = 0;
                        reshapeType = reshapeType || 'Finely Sheared Left Side';
                    case 7: // Shear Bottom Side
                        if (isLeftOrTop === undefined) isLeftOrTop = false;
                        if (idxOffset === undefined) idxOffset = 1;
                        reshapeType = reshapeType || 'Finely Sheared Bottom Side';
                        var posivites = [], negatives = [], testBool;
                        // Out of all 4 vertices, put the indices of the 2 with positive X in one 
                        // array and the indices of the other two in another array
                        for (var i = 0; i < v.length; i += 2) {
                            testBool = v[i + idxOffset] >= 0;
                            if (isLeftOrTop) testBool = !testBool;
                            if (testBool && posivites.length < 2) {
                                posivites.push(i);
                            }
                            else negatives.push(i);
                        }
                        // sort the two arrays obtained based on isLeftOrTop and idxOffset
                        testBool = v[posivites[0] + idxOffset] <= v[posivites[1] + idxOffset];
                        if (isLeftOrTop) testBool = !testBool;
                        if (testBool) {
                            var temp = posivites[1];
                            posivites[1] = posivites[0];
                            posivites[0] = temp;
                        }
                        testBool = v[negatives[0] + idxOffset] <= v[negatives[1] + idxOffset];
                        if (isLeftOrTop) testBool = !testBool;
                        if (testBool) {
                            var temp = negatives[1];
                            negatives[1] = negatives[0];
                            negatives[0] = temp;
                        }
                        // Account for exceptional cases when symbol looks like:
                        //   //  \\      /|  |\
                        //  // or \\ or // or \\  and such. (tricky !)
                        // //      \\  |/      \|
                        var slope = (v[posivites[1] + 1 - idxOffset] - v[posivites[0] + 1 - idxOffset]) / (v[posivites[1] + idxOffset] - v[posivites[0] + idxOffset]);
                        if ((v[posivites[0] + 1 - idxOffset] * v[posivites[1] + 1 - idxOffset]) > 0
                            && ((v[posivites[0] + idxOffset] * v[posivites[1] + idxOffset]) < 0 || (slope < 1 && slope > -1))) {
                            var temp = posivites[1];
                            posivites[1] = negatives[0];
                            negatives[0] = temp;
                        }
                        // Make sure sorting order is maintained because positives array contains 
                        // indices of vertices that will shear
                        testBool = v[posivites[0] + 1 - idxOffset] < v[posivites[1] + 1 - idxOffset];
                        if (isLeftOrTop) testBool = !testBool;
                        if (testBool) {
                            var temp = posivites[1];
                            posivites[1] = posivites[0];
                            posivites[0] = temp;
                        }
                        // Assign values for subsequent shearing
                        vtx_i = vtx_i || [posivites[0], posivites[1], negatives[0], negatives[1]];
                        arbiterV = vtx_i[0];
                        testV = vtx_i[1];
                        break;
                    default:
                        return;
                }
                let lastAction = historyManager.undoList[historyManager.undoList.length - 1]
                let thisTime = (new Date()).getTime();
                let timeBetweenStretches;
                if (that.timeOfLastStretch === undefined
                    || lastAction.ID != that.stretchIDinHistory)
                    timeBetweenStretches = thisTime;
                else
                    timeBetweenStretches = thisTime - that.timeOfLastStretch;
                that.timeOfLastStretch = thisTime;
                // If it has been more than 300 sec since last call
                if (timeBetweenStretches >= 500
                    || lastAction.ID != that.stretchIDinHistory) {
                    // Save the original symbol values
                    that.origVals = {
                        vtces: v.slice(0),
                        x: layer.x,
                        y: layer.y
                    };
                }

                var ang = Math.atan((v[arbiterV + 1] - v[testV + 1]) / (v[arbiterV] - v[testV]));
                if (!isNaN(ang) && (ang < Math.PI / 3 && ang > -Math.PI / 3)) {
                    if (v[testV] <= v[arbiterV]) {
                        that.layerCtrl.activeLayer.x -= amount / 2;
                        v[vtx_i[0]] -= amount / 2; v[vtx_i[1]] -= amount / 2;
                        v[vtx_i[2]] += amount / 2; v[vtx_i[3]] += amount / 2;
                    }
                    else {
                        that.layerCtrl.activeLayer.x += amount / 2;
                        v[vtx_i[0]] += amount / 2; v[vtx_i[1]] += amount / 2;
                        v[vtx_i[2]] -= amount / 2; v[vtx_i[3]] -= amount / 2;
                    }
                }
                if (!isNaN(ang) && (ang > Math.PI / 6 || ang < -Math.PI / 6)) {
                    if ( v[testV + 1] <= v[arbiterV + 1]) {
                        that.layerCtrl.activeLayer.y -= amount / 2;
                        v[vtx_i[0] + 1] -= amount / 2; v[vtx_i[1] + 1] -= amount / 2;
                        v[vtx_i[2] + 1] += amount / 2; v[vtx_i[3] + 1] += amount / 2;
                    }
                    else {
                        that.layerCtrl.activeLayer.y += amount / 2;
                        v[vtx_i[0] + 1] += amount / 2; v[vtx_i[1] + 1] += amount / 2;
                        v[vtx_i[2] + 1] -= amount / 2; v[vtx_i[3] + 1] -= amount / 2;
                    }
                }

                let newVals = {
                    vtces: layer.vertices.slice(0),
                    x: layer.x,
                    y: layer.y
                };
                if (timeBetweenStretches >= 500
                    || lastAction.ID != that.stretchIDinHistory) {
                    historyManager.pushUndoAction('symbol_reshape', {
                        layer: layer,
                        origVals: that.origVals,
                        newVals: newVals
                    });
                    that.stretchIDinHistory = historyManager.pushID;
                    console.log('%c' + reshapeType + ' of Symbol%c of layer "%s" in group "%s" at position "%i". '
                        + 'Vertices changed from %O to %O and position changed from (%i, %i) to (%i, %i).',
                        'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                        layer.parent.elems.indexOf(layer), that.origVals.vtces, newVals.vtces,
                        that.origVals.x, that.origVals.y, newVals.x, newVals.y);
                }
                else {
                    lastAction.params.newVals = newVals;
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

        this.fineActions = this.gui.addFolder('fine actions');

        this.pos = this.fineActions.addFolder('move');
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

        this.scale = this.fineActions.addFolder('scale');
        this.scaleX = this.scale.add(this.activeLayer, 'scaleX').min(1).step(0.1).listen();
        this.scaleY = this.scale.add(this.activeLayer, 'scaleY').min(1).step(0.1).listen();

        this.vStretchFolder = this.fineActions.addFolder('diagonal stretch');

        this.vStretch1plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 Horiz+').onChange(this.functions.diagStretchMore);
        this.vStretch1plus.layerCtrl = this; this.vStretch1plus.diagNum = 0; this.vStretch1plus.isHoriz = true;
        this.vStretch1minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 Horiz-').onChange(this.functions.diagStretchLess);
        this.vStretch1minus.layerCtrl = this; this.vStretch1minus.diagNum = 0; this.vStretch1minus.isHoriz = true;

        this.vStretch2plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 Vert+').onChange(this.functions.diagStretchMore);
        this.vStretch2plus.layerCtrl = this; this.vStretch2plus.diagNum = 0; this.vStretch2plus.isHoriz = false;
        this.vStretch2minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 Vert-').onChange(this.functions.diagStretchLess);
        this.vStretch2minus.layerCtrl = this; this.vStretch2minus.diagNum = 0; this.vStretch2minus.isHoriz = false;

        this.vStretch3plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 Horiz+').onChange(this.functions.diagStretchMore);
        this.vStretch3plus.layerCtrl = this; this.vStretch3plus.diagNum = 1; this.vStretch3plus.isHoriz = true;
        this.vStretch3minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 Horiz-').onChange(this.functions.diagStretchLess);
        this.vStretch3minus.layerCtrl = this; this.vStretch3minus.diagNum = 1; this.vStretch3minus.isHoriz = true;

        this.vStretch4plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 Vert+').onChange(this.functions.diagStretchMore);
        this.vStretch4plus.layerCtrl = this; this.vStretch4plus.diagNum = 1; this.vStretch4plus.isHoriz = false;
        this.vStretch4minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 Vert-').onChange(this.functions.diagStretchLess);
        this.vStretch4minus.layerCtrl = this; this.vStretch4minus.diagNum = 1; this.vStretch4minus.isHoriz = false;

        this.sideStretchFolder = this.fineActions.addFolder('side stretch');

        this.sideStretchLPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2190 +').onChange(this.functions.sideStretchLess);
        this.sideStretchLPlus.layerCtrl = this; this.sideStretchLPlus.sideNum = 0;
        this.sideStretchLMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2190 -').onChange(this.functions.sideStretchMore);
        this.sideStretchLMinus.layerCtrl = this; this.sideStretchLMinus.sideNum = 0;

        this.sideStretchRPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2192 +').onChange(this.functions.sideStretchMore);
        this.sideStretchRPlus.layerCtrl = this; this.sideStretchRPlus.sideNum = 1;
        this.sideStretchRMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2192 -').onChange(this.functions.sideStretchLess);
        this.sideStretchRMinus.layerCtrl = this; this.sideStretchRMinus.sideNum = 1;

        this.sideStretchUPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2191 +').onChange(this.functions.sideStretchLess);
        this.sideStretchUPlus.layerCtrl = this; this.sideStretchUPlus.sideNum = 2;
        this.sideStretchUMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2191 -').onChange(this.functions.sideStretchMore);
        this.sideStretchUMinus.layerCtrl = this; this.sideStretchUMinus.sideNum = 2;

        this.sideStretchDPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2193 +').onChange(this.functions.sideStretchMore);
        this.sideStretchDPlus.layerCtrl = this; this.sideStretchDPlus.sideNum = 3;
        this.sideStretchDMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('\u2193 -').onChange(this.functions.sideStretchLess);
        this.sideStretchDMinus.layerCtrl = this; this.sideStretchDMinus.sideNum = 3;

        this.sideShearFolder = this.fineActions.addFolder('side shear');

        this.sideShearLPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('left upward').onChange(this.functions.sideStretchLess);
        this.sideShearLPlus.layerCtrl = this; this.sideShearLPlus.sideNum = 6;
        this.sideShearLMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('left downward').onChange(this.functions.sideStretchMore);
        this.sideShearLMinus.layerCtrl = this; this.sideShearLMinus.sideNum = 6;
        this.sideShearRPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('right upward').onChange(this.functions.sideStretchMore);
        this.sideShearRPlus.layerCtrl = this; this.sideShearRPlus.sideNum = 5;
        this.sideShearRMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('right downward').onChange(this.functions.sideStretchLess);
        this.sideShearRMinus.layerCtrl = this; this.sideShearRMinus.sideNum = 5;
        this.sideShearUPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('top rightward').onChange(this.functions.sideStretchMore);
        this.sideShearUPlus.layerCtrl = this; this.sideShearUPlus.sideNum = 4;
        this.sideShearUMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('top leftward').onChange(this.functions.sideStretchLess);
        this.sideShearUMinus.layerCtrl = this; this.sideShearUMinus.sideNum = 4;
        this.sideShearDPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('bottom rightward').onChange(this.functions.sideStretchLess);
        this.sideShearDPlus.layerCtrl = this; this.sideShearDPlus.sideNum = 7;
        this.sideShearDMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('bottom leftward').onChange(this.functions.sideStretchMore);
        this.sideShearDMinus.layerCtrl = this; this.sideShearDMinus.sideNum = 7;

        this.rotation = this.fineActions.add(this.activeLayer, 'rotation').min(0).step(0.1).listen();
        
        $(this.gui.domElement).addClass('fade');
        $('.sp-replacer').addClass('fade fadeOut');
    },
    update: function (layer) {
        this.activeLayer = layer;
        this.partselectmenu.update(this.activeLayer.part);
        this.scaleX.object = this.activeLayer;
        this.scaleY.object = this.activeLayer;
        this.rotation.object = this.activeLayer;
        this.alpha.object.alpha = this.activeLayer.alpha;

        this.updateDisplay();
    },
    updateDisplay: function () {
        this.part.updateDisplay();
        this.scaleX.updateDisplay();
        this.scaleY.updateDisplay();
        this.rotation.updateDisplay();
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