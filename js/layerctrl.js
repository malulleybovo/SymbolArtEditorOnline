var LayerCtrl = Class({
    initialize: function (editor, layer) {
        layerCtrlID = 'layerCtrl';

        this.editor = editor;
        if (layer == undefined) layer = new Layer();
        this.activeLayer = layer;

        this.gui = new dat.GUI({ autoPlace: false });
        this.gui.domElement.id = layerCtrlID;
        this.gui.domElement.layerCtrl = this;
        $(this.gui.domElement).addClass("no-panning");

        $('body').append(this.gui.domElement);

        this.functions = {
            trigger: function () { },
            move: function () {
                var layer = this.layerCtrl.activeLayer;
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
            },
            horizFlip: function () {
                this.object.flip(0, this.layerCtrl.activeLayer.vertices);
                this.object.update(this.layerCtrl);
            },
            vertFlip: function () {
                this.object.flip(1, this.layerCtrl.activeLayer.vertices);
                this.object.update(this.layerCtrl);
            },
            flip: function (typeNum, v) {
                var scale;
                switch (typeNum) {
                    case 0: // Horizontal Flip
                        scale = [-1, 1];
                        break;
                    case 1: // Vertical Flip
                        scale = [1, -1];
                        break;
                    default:
                        return;
                }
                /*for (var i = 0; i < 2; i++) {
                    var oldIndex = step * i;
                    var newIndex = (oldIndex + dist) % v.length;
                    var temp = v[newIndex];
                    v[newIndex] = v[oldIndex]; v[oldIndex] = temp;
                    temp = v[newIndex + 1];
                    v[newIndex + 1] = v[oldIndex + 1]; v[oldIndex + 1] = temp;
                }//*/
                for (var i = 0; i < 4; i++) {
                    v[2 * i] *= scale[0];
                    v[2 * i + 1] *= scale[1];
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
                var v1, v2;
                switch (that.diagNum) {
                    case 0:
                        v1 = 0; v2 = 6;
                        break;
                    case 1:
                        v1 = 2; v2 = 4;
                        break;
                    default:
                        return;
                }
                var v = that.layerCtrl.activeLayer.vertices;
                var vOffset = 0;
                if (!that.isHoriz) vOffset++;
                if (v[v1 + vOffset] <= v[v2 + vOffset]) amount = -amount;
                v[v1 + vOffset] += amount;
                v[v2 + vOffset] -= amount;
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
                switch (that.sideNum) {
                    case 0:
                        vtx_i = [0, 4, 2, 6];
                    case 1:
                        vtx_i = vtx_i || [2, 6, 0, 4];
                        testV = 2; 
                        break;
                    case 2:
                        vtx_i = [0, 2, 4, 6];
                    case 3:
                        vtx_i = vtx_i || [4, 6, 0, 2];
                        testV = 4;
                        break;
                    case 4: // Shear Top Side
                        vtx_i = [0, 2, 4, 6];
                    case 5: // Shear Right Side
                        vtx_i = vtx_i || [2, 6, 0, 4];
                    case 6: // Shear Left Side
                        vtx_i = vtx_i || [4, 0, 2, 6];
                    case 7: // Shear Bottom Side
                        vtx_i = vtx_i || [6, 4, 0, 2];
                        arbiterV = vtx_i[0];
                        testV = vtx_i[1];
                        break;
                    default:
                        return;
                }
                var v = that.layerCtrl.activeLayer.vertices;
                var ang = Math.atan((v[arbiterV + 1] - v[testV + 1]) / (v[arbiterV] - v[testV]));
                if (!isNaN(ang) && (ang < Math.PI / 3 && ang > -Math.PI / 3)) {
                    if (that.sideNum < 4 && v[testV] <= v[arbiterV]) {
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
                    if (that.sideNum < 4 && v[testV + 1] <= v[arbiterV + 1]) {
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
            },
            update: function (layerCtrl) {
                var editor = layerCtrl.editor;
                editor.updateLayer(layerCtrl.activeLayer);
                editor.render();
                $(window.list.selectedElem).parent().trigger('mousedown'); // Update vertex edit button pos
            }
        }

        this.partselectmenu = new PartSelectMenu(this);
        this.partManager = {
            part: function () {
                this.menu.toggle();
            },
            menu: this.partselectmenu
        };
        this.part = this.gui.add(this.partManager, 'part');

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

        this.scale = this.gui.addFolder('scale');
        this.scaleX = this.scale.add(this.activeLayer, 'scaleX').min(1).step(0.1).listen();
        this.scaleY = this.scale.add(this.activeLayer, 'scaleY').min(1).step(0.1).listen();

        this.flipsFolder = this.gui.addFolder('flip symbol');

        this.horizFlip = this.flipsFolder.add(this.functions, 'trigger')
            .name('horizontal').onChange(this.functions.horizFlip);
        this.horizFlip.layerCtrl = this;
        this.horizFlip = this.flipsFolder.add(this.functions, 'trigger')
            .name('vertical').onChange(this.functions.vertFlip);
        this.horizFlip.layerCtrl = this;

        this.vStretchFolder = this.gui.addFolder('diagonal stretch');

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

        this.sideStretchFolder = this.gui.addFolder('side stretch');

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

        this.sideShearFolder = this.gui.addFolder('side shear');

        this.sideShearLPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2190 Right/Down').onChange(this.functions.sideStretchMore);
        this.sideShearLPlus.layerCtrl = this; this.sideShearLPlus.sideNum = 6;
        this.sideShearLMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2190 Left/Up').onChange(this.functions.sideStretchLess);
        this.sideShearLMinus.layerCtrl = this; this.sideShearLMinus.sideNum = 6;
        this.sideShearRPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2192 Right/Down').onChange(this.functions.sideStretchLess);
        this.sideShearRPlus.layerCtrl = this; this.sideShearRPlus.sideNum = 5;
        this.sideShearRMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2192 Left/Up').onChange(this.functions.sideStretchMore);
        this.sideShearRMinus.layerCtrl = this; this.sideShearRMinus.sideNum = 5;
        this.sideShearUPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2191 Right/Down').onChange(this.functions.sideStretchMore);
        this.sideShearUPlus.layerCtrl = this; this.sideShearUPlus.sideNum = 4;
        this.sideShearUMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2191 Left/Up').onChange(this.functions.sideStretchLess);
        this.sideShearUMinus.layerCtrl = this; this.sideShearUMinus.sideNum = 4;
        this.sideShearDPlus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2193 Right/Down').onChange(this.functions.sideStretchLess);
        this.sideShearDPlus.layerCtrl = this; this.sideShearDPlus.sideNum = 7;
        this.sideShearDMinus = this.sideShearFolder.add(this.functions, 'trigger')
            .name('\u2193 Left/Up').onChange(this.functions.sideStretchMore);
        this.sideShearDMinus.layerCtrl = this; this.sideShearDMinus.sideNum = 7;

        this.rotation = this.gui.add(this.activeLayer, 'rotation').min(0).step(0.1).listen();
        this.alpha = this.gui.add(this.activeLayer, 'alpha').min(0).step(1).max(7).listen();
    },
    update: function (layer) {
        this.activeLayer = layer;
        this.partselectmenu.update(this.activeLayer.part);
        this.scaleX.object = this.activeLayer;
        this.scaleY.object = this.activeLayer;
        this.rotation.object = this.activeLayer;
        this.alpha.object = this.activeLayer;

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
        $(this.gui.domElement).hide();
    },
    show: function () {
        $(this.gui.domElement).show();
    }
});