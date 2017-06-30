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
                this.layerCtrl.functions.update(this.layerCtrl);
            },
            diagStretchMore: function () {
                this.object.diagStretch(this, 1);
                this.object.update(this.layerCtrl);
            },
            diagStretchLess: function () {
                this.object.diagStretch(this, -1);
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
                this.object.sideStretch(this, 1);
                this.object.update(this.layerCtrl);
            },
            sideStretchLess: function () {
                this.object.sideStretch(this, -1);
                this.object.update(this.layerCtrl);
            },
            sideStretch: function (that, amount) {
                var arbiterV = 0;
                var testV;
                var v1, v2;
                switch (that.sideNum) {
                    case 0:
                    case 1:
                        v1 = 2 * that.sideNum; v2 = v1 + 4;
                        testV = 2; 
                        break;
                    case 2:
                    case 3:
                        v1 = 4 * (that.sideNum - 2); v2 = v1 + 2;
                        testV = 4;
                        break;
                    default:
                        return;
                }
                var v = that.layerCtrl.activeLayer.vertices;
                var ang = Math.atan((v[arbiterV + 1] - v[testV + 1]) / (v[arbiterV] - v[testV]));
                if (ang < Math.PI / 3 && ang > -Math.PI / 3) {
                    if (v[testV] <= v[arbiterV]) {
                        v[v1] -= amount;
                        v[v2] -= amount;
                    }
                    else {
                        v[v1] += amount;
                        v[v2] += amount;
                    }
                }
                if (ang > Math.PI / 6 || ang < -Math.PI / 6) {
                    if (v[testV + 1] <= v[arbiterV + 1]) {
                        v[v1 + 1] -= amount;
                        v[v2 + 1] -= amount;
                    }
                    else {
                        v[v1 + 1] += amount;
                        v[v2 + 1] += amount;
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

        this.pos = this.gui.addFolder('position');
        this.posX = this.pos.add(this.activeLayer, 'x').step(1)
            .name('X').onChange(this.functions.move);
        this.posX.layerCtrl = this;
        this.posY = this.pos.add(this.activeLayer, 'y').step(1)
            .name('Y').onChange(this.functions.move);
        this.posY.layerCtrl = this;

        this.scale = this.gui.addFolder('scale');
        this.scaleX = this.scale.add(this.activeLayer, 'scaleX').min(1).step(0.1).listen();
        this.scaleY = this.scale.add(this.activeLayer, 'scaleY').min(1).step(0.1).listen();

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

        this.rotation = this.gui.add(this.activeLayer, 'rotation').min(0).step(0.1).listen();
        this.alpha = this.gui.add(this.activeLayer, 'alpha').min(0).step(1).max(7).listen();
    },
    update: function (layer) {
        this.activeLayer = layer;
        this.partselectmenu.update(this.activeLayer.part);
        this.posX.object = this.activeLayer;
        this.posY.object = this.activeLayer;
        this.scaleX.object = this.activeLayer;
        this.scaleY.object = this.activeLayer;
        this.rotation.object = this.activeLayer;
        this.alpha.object = this.activeLayer;

        this.updateDisplay();
    },
    updateDisplay: function () {
        this.part.updateDisplay();
        this.posX.updateDisplay();
        this.posY.updateDisplay();
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