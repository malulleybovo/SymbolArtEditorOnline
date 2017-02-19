var LayerCtrl = Class({
    initialize: function (editor, layer) {
        this.editor = editor;
        if (layer == undefined) layer = new Layer();
        this.activeLayer = layer;

        this.gui = new dat.GUI({ autoPlace: false });
        this.gui.domElement.id = ('layerCtrl');
        this.gui.domElement.layerCtrl = this;

        $('body').append(this.gui.domElement);

        this.partselectmenu = new PartSelectMenu(this);
        this.partManager = {
            part: function () {
                this.menu.toggle();
            },
            menu: this.partselectmenu
        };
        this.part = this.gui.add(this.partManager, 'part');

        this.pos = this.gui.addFolder('position');
        this.posX = this.pos.add(this.activeLayer, 'x').step(0.5).listen();
        this.posY = this.pos.add(this.activeLayer, 'y').step(0.5).listen();

        this.scale = this.gui.addFolder('scale');
        this.scaleX = this.scale.add(this.activeLayer, 'scaleX').min(1).step(0.1).listen();
        this.scaleY = this.scale.add(this.activeLayer, 'scaleY').min(1).step(0.1).listen();

        this.vertices = this.gui.addFolder('vertices');
        this.v0 = this.vertices.add(this.activeLayer.vertices, '0').step(1).listen();
        this.v1 = this.vertices.add(this.activeLayer.vertices, '1').step(1).listen();
        this.v2 = this.vertices.add(this.activeLayer.vertices, '2').step(1).listen();
        this.v3 = this.vertices.add(this.activeLayer.vertices, '3').step(1).listen();
        this.v4 = this.vertices.add(this.activeLayer.vertices, '4').step(1).listen();
        this.v5 = this.vertices.add(this.activeLayer.vertices, '5').step(1).listen();
        this.v6 = this.vertices.add(this.activeLayer.vertices, '6').step(1).listen();
        this.v7 = this.vertices.add(this.activeLayer.vertices, '7').step(1).listen();

        this.rotation = this.gui.add(this.activeLayer, 'rotation').min(0).step(0.1).listen();
        this.rotation = this.gui.add(this.activeLayer, 'alpha').min(0).step(1).max(7).listen();
    },
    update: function (layer) {
        this.activeLayer = layer;
        this.partselectmenu.update(this.activeLayer.part);
        this.posX.object = this.activeLayer;
        this.posY.object = this.activeLayer;
        this.scaleX.object = this.activeLayer;
        this.scaleY.object = this.activeLayer;
        this.rotation.object = this.activeLayer;
        this.rotation.object = this.activeLayer;
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