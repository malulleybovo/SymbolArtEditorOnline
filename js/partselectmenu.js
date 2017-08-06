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

                historyManager.pushUndoAction('symbol_change', {
                    'layer': layer,
                    'prevPartNum': layer.part,
                    'newPartNum': this.index
                });
                console.log('%cChanged Symbol%c of layer "%s" in group "%s" at position "%i".',
                    'color: #2fa1d6', 'color: #f3f3f3', layer.name, layer.parent.name,
                    layer.parent.elems.indexOf(layer));

                layer.part = this.index;

                let editor = $('canvas')[0].editor;
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
        this.selectmenu.setSelectedOption(partNum, 0);
        //console.log('Not Implemented: PartSelectMenu.update(partNum)');
    },
    toggle: function () {
        this.selectmenu.setActiveMenu(0);
        setTimeout(this.selectmenu.toggle, 100);
    },
    isActive: function () {
        return this.selectmenu.isMenuActive(0);
    },
    isOpen: function () {
        return this.selectmenu.isOpen(0);
    },
    hide: function () {
        this.selectmenu.hide(0);
    },
    show: function () {
        this.selectmenu.show(0);
    }
});