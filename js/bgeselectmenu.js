var BGESelectMenu = Class({
    initialize: function () {
        var defaultOpt = 3;

        // Initialize selectmenu
        this.selectmenu = new SelectMenu();
        this.selectmenu.setActiveMenu(1);

        var player = $('#player')[0];
        var bges = player.bges;

        // Setup options
        for (var i = 0; i < bges.length; i++) {
            this.selectmenu.addIconOption('./images/sound_icon.png', function () {
                // Audio source (BGE) changes to selected option
                var p = $('#player')[0];
                p.src = p.bges[this.index];
                p.play(); // Play sample
            });
        }

        // Set default audio source (BGE)
        defaultOpt = (defaultOpt >= 0 && defaultOpt < bges.length) ? defaultOpt : 0;
        this.selectmenu.setSelectedOption(defaultOpt);
        player.src = player.bges[defaultOpt];
    },
    toggle: function () {
        this.selectmenu.setActiveMenu(1);
        setTimeout(this.selectmenu.toggle, 100);
    }
});
