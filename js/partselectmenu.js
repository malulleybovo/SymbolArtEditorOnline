var PartSelectMenu = Class({
    initialize: function (control) {
        var defaultOpt = 0;
        this.layerCtrl = control;

        // Initialize selectmenu
        this.selectmenu = new SelectMenu();
        this.selectmenu.setActiveMenu(0);

        // Setup options
        for (var i in partsInfo.dataArray) {
            this.selectmenu.addIconOption(partsInfo.path + partsInfo.dataArray[i] + partsInfo.imgType, function () {
                // TODO - assign selected part to the layer being editted
                var layer = this.layerCtrl.activeLayer;
                layer.part = this.index;

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
        if (this.selectmenu.isMenuActive(0)) {
            this.selectmenu.setSelectedOption(partNum);
        }
        //console.log('Not Implemented: PartSelectMenu.update(partNum)');
    },
    toggle: function () {
        this.selectmenu.setActiveMenu(0);
        this.selectmenu.toggle();
    }
});