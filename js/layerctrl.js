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
            sheer: function () {
                this.layerCtrl.activeLayer.vertices[this.v1]--;
                this.layerCtrl.activeLayer.vertices[this.v2]++;
                this.object.update(this.layerCtrl);
            },
            sideStretchMore: function () {
                this.layerCtrl.activeLayer.vertices[this.v1]++;
                this.layerCtrl.activeLayer.vertices[this.v2]++;
                this.object.update(this.layerCtrl);
            },
            sideStretchLess: function () {
                this.layerCtrl.activeLayer.vertices[this.v1]--;
                this.layerCtrl.activeLayer.vertices[this.v2]--;
                this.object.update(this.layerCtrl);
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
            .name('\u2196 \u2198 X+').onChange(this.functions.sheer);
        this.vStretch1plus.layerCtrl = this; this.vStretch1plus.v1 = 0; this.vStretch1plus.v2 = 6;
        this.vStretch1minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 X-').onChange(this.functions.sheer);
        this.vStretch1minus.layerCtrl = this; this.vStretch1minus.v1 = 6; this.vStretch1minus.v2 = 0;

        this.vStretch2plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 Y+').onChange(this.functions.sheer);
        this.vStretch2plus.layerCtrl = this; this.vStretch2plus.v1 = 1; this.vStretch2plus.v2 = 7;
        this.vStretch2minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2196 \u2198 Y-').onChange(this.functions.sheer);
        this.vStretch2minus.layerCtrl = this; this.vStretch2minus.v1 = 7; this.vStretch2minus.v2 = 1;

        this.vStretch3plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 X+').onChange(this.functions.sheer);
        this.vStretch3plus.layerCtrl = this; this.vStretch3plus.v1 = 4; this.vStretch3plus.v2 = 2;
        this.vStretch3minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 X-').onChange(this.functions.sheer);
        this.vStretch3minus.layerCtrl = this; this.vStretch3minus.v1 = 2; this.vStretch3minus.v2 = 4;

        this.vStretch4plus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 Y+').onChange(this.functions.sheer);
        this.vStretch4plus.layerCtrl = this; this.vStretch4plus.v1 = 3; this.vStretch4plus.v2 = 5;
        this.vStretch4minus = this.vStretchFolder.add(this.functions, 'trigger')
            .name('\u2199 \u2197 Y-').onChange(this.functions.sheer);
        this.vStretch4minus.layerCtrl = this; this.vStretch4minus.v1 = 5; this.vStretch4minus.v2 = 3;

        this.sideStretchFolder = this.gui.addFolder('side stretch');

        this.sideStretchLPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('left+').onChange(this.functions.sideStretchLess);
        this.sideStretchLPlus.layerCtrl = this; this.sideStretchLPlus.v1 = 0; this.sideStretchLPlus.v2 = 4;
        this.sideStretchLMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('left-').onChange(this.functions.sideStretchMore);
        this.sideStretchLMinus.layerCtrl = this; this.sideStretchLMinus.v1 = 0; this.sideStretchLMinus.v2 = 4;

        this.sideStretchRPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('right+').onChange(this.functions.sideStretchMore);
        this.sideStretchRPlus.layerCtrl = this; this.sideStretchRPlus.v1 = 2; this.sideStretchRPlus.v2 = 6;
        this.sideStretchRMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('right-').onChange(this.functions.sideStretchLess);
        this.sideStretchRMinus.layerCtrl = this; this.sideStretchRMinus.v1 = 2; this.sideStretchRMinus.v2 = 6;

        this.sideStretchUPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('up+').onChange(this.functions.sideStretchLess);
        this.sideStretchUPlus.layerCtrl = this; this.sideStretchUPlus.v1 = 1; this.sideStretchUPlus.v2 = 3;
        this.sideStretchUMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('up-').onChange(this.functions.sideStretchMore);
        this.sideStretchUMinus.layerCtrl = this; this.sideStretchUMinus.v1 = 1; this.sideStretchUMinus.v2 = 3;

        this.sideStretchDPlus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('down+').onChange(this.functions.sideStretchMore);
        this.sideStretchDPlus.layerCtrl = this; this.sideStretchDPlus.v1 = 5; this.sideStretchDPlus.v2 = 7;
        this.sideStretchDMinus = this.sideStretchFolder.add(this.functions, 'trigger')
            .name('down-').onChange(this.functions.sideStretchLess);
        this.sideStretchDMinus.layerCtrl = this; this.sideStretchDMinus.v1 = 5; this.sideStretchDMinus.v2 = 7;

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