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

        this.quadChangeCallback = function (val) {
            val = Math.round(val); // Make sure it is an integer
            this.object[this.oppositeIndex] = 64 - val;
            this.object[this.property] = val;
            var layerCtrl = $('#' + layerCtrlID)[0].layerCtrl;
            var editor = layerCtrl.editor;
            editor.updateLayer(layerCtrl.activeLayer);
            editor.render();
            $(window.list.selectedElem).parent().trigger('mousedown'); // Update vertex edit button pos
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
            .name('X').onChange(this.quadChangeCallback);
        this.posY = this.pos.add(this.activeLayer, 'y').step(1)
            .name('Y').onChange(this.quadChangeCallback);

        this.scale = this.gui.addFolder('scale');
        this.scaleX = this.scale.add(this.activeLayer, 'scaleX').min(1).step(0.1).listen();
        this.scaleY = this.scale.add(this.activeLayer, 'scaleY').min(1).step(0.1).listen();

        this.vertices = this.gui.addFolder('vertex sheer');
        this.sheer0x = this.vertices.add(this.activeLayer.vertices, '0').step(1)
            .name('\\ diag. X').onChange(this.quadChangeCallback);
        this.sheer0x.oppositeIndex = 6;
        this.sheer0y = this.vertices.add(this.activeLayer.vertices, '1').step(1)
            .name('\\ diag. Y').onChange(this.quadChangeCallback);
        this.sheer0y.oppositeIndex = 7;
        this.sheer1x = this.vertices.add(this.activeLayer.vertices, '4').step(1)
            .name('/ diag. X').onChange(this.quadChangeCallback);
        this.sheer1x.oppositeIndex = 2;
        this.sheer1y = this.vertices.add(this.activeLayer.vertices, '3').step(1)
            .name('/ diag. Y').onChange(this.quadChangeCallback);
        this.sheer1y.oppositeIndex = 5;

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
        this.sheer0x.object = this.activeLayer.vertices;
        this.sheer0y.object = this.activeLayer.vertices;
        this.sheer1y.object = this.activeLayer.vertices;
        this.sheer1x.object = this.activeLayer.vertices;

        this.updateDisplay();
    },
    updateDisplay: function () {
        this.part.updateDisplay();
        this.posX.updateDisplay();
        this.posY.updateDisplay();
        this.scaleX.updateDisplay();
        this.scaleY.updateDisplay();
        this.sheer0x.updateDisplay();
        this.sheer0y.updateDisplay();
        this.sheer1y.updateDisplay();
        this.sheer1x.updateDisplay();
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