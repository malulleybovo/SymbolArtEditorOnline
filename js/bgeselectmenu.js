var BGESelectMenu = Class({
    initialize: function (defaultNum) {
        this.defaultOpt = defaultNum;

        // Initialize selectmenu
        this.selectmenu = new SelectMenu();
        this.selectmenu.setActiveMenu(1);

        var player = $('#player')[0];
        var bges = player.bges;

        // Setup options
        for (var i = 0; i < bges.length; i++) {
            this.selectmenu.addIconOption('./images/sound_icon.png', this.setActiveBGE);
        }

        // Set default audio source (BGE)
        this.defaultOpt = (this.defaultOpt >= 0 && this.defaultOpt < bges.length) ? this.defaultOpt : 0;
        this.selectmenu.setSelectedOption(this.defaultOpt);
        player.src = player.bges[this.defaultOpt];
    },
    setActiveBGE: function (index) {
        // Audio source (BGE) changes to selected option
        let p = $('#player')[0];
        p.src = p.bges[index];
        p.manager.currBGE = index;
        p.play(); // Play sample
    },
    toggle: function () {
        this.selectmenu.setActiveMenu(1);
        setTimeout(this.selectmenu.toggle, 100);
    }
});
