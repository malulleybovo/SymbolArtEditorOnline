var PartSelectMenu = Class({
    initialize: function (control) {
        var defaultOpt = 0;
        this.layerCtrl = control;

        // Initialize selectmenu
        this.selectmenu = new SelectMenu();
        this.selectmenu.setActiveMenu(0);

        // Setup options
        for (var i = 0; i < 3; i++) {
            this.selectmenu.addIconOption('./images/' + (241 + i) + '.png', function () {
                // TODO - assign selected part to the layer being editted
                var layer = this.layerCtrl.activeLayer;
                layer.part = 241 + this.index;

                var editor = this.layerCtrl.editor;
                editor.updateLayer(layer);
                editor.render();
                //console.log('Not Implemented: PartSelectMenu list item onclick');
            },
            {
                layerCtrl: control
            });
        }

        // Set default audio source (BGE)
        this.selectmenu.setSelectedOption(defaultOpt);
    },
    update: function (partNum) {
        // TODO - update selection in list of options based on partNum
        this.selectmenu.setSelectedOption(partNum - 241); // TODO change - 241
        //console.log('Not Implemented: PartSelectMenu.update(partNum)');
    },
    toggle: function () {
        this.selectmenu.setActiveMenu(0);
        this.selectmenu.toggle();
    }
});