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

        this.vertices = this.gui.addFolder('vertices');
        this.v0 = this.vertices.add(this.activeLayer.vertices, '0').step(1)
            .name('top left X').onChange(this.quadChangeCallback);
        this.v1 = this.vertices.add(this.activeLayer.vertices, '1').step(1)
            .name('top left Y').onChange(this.quadChangeCallback);
        this.v2 = this.vertices.add(this.activeLayer.vertices, '2').step(1)
            .name('top right X').onChange(this.quadChangeCallback);
        this.v3 = this.vertices.add(this.activeLayer.vertices, '3').step(1)
            .name('top left Y').onChange(this.quadChangeCallback);
        this.v4 = this.vertices.add(this.activeLayer.vertices, '4').step(1)
            .name('bottom left X').onChange(this.quadChangeCallback);
        this.v5 = this.vertices.add(this.activeLayer.vertices, '5').step(1)
            .name('bottom left Y').onChange(this.quadChangeCallback);
        this.v6 = this.vertices.add(this.activeLayer.vertices, '6').step(1)
            .name('bottom right X').onChange(this.quadChangeCallback);
        this.v7 = this.vertices.add(this.activeLayer.vertices, '7').step(1)
            .name('bottom right Y').onChange(this.quadChangeCallback);

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
        this.v0.object = this.activeLayer.vertices;
        this.v1.object = this.activeLayer.vertices;
        this.v2.object = this.activeLayer.vertices;
        this.v3.object = this.activeLayer.vertices;
        this.v4.object = this.activeLayer.vertices;
        this.v5.object = this.activeLayer.vertices;
        this.v6.object = this.activeLayer.vertices;
        this.v7.object = this.activeLayer.vertices;
    },
    hide: function () {
        $(this.gui.domElement).hide();
    },
    show: function () {
        $(this.gui.domElement).show();
    }
});