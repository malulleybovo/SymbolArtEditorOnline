var Toolbar = Class({
    initialize: function () {
        this.player = $('<audio id="player" src="sound/Help!.wav" preload="auto"></audio>');
        this.player[0].bges = [ // list of playable sounds
            'sound/Silent.wav', // sound 0
            'sound/Silent.wav', // sound 1
            'sound/General.wav', // sound 2
            'sound/Joy.wav', // sound 3
            'sound/Anger.wav', // sound 4
            'sound/Sorrow.wav', // sound 5
            'sound/Anxiety.wav', // sound 6
            'sound/Surprise.wav', // sound 7
            'sound/Question.wav', // sound 8
            'sound/Help!.wav', // sound 9
            'sound/Whistle.wav', // sound 10
            'sound/Shyness.wav', // sound 11
            'sound/Decivise.wav' // sound 12
        ];
        $(HTMLBody).prepend(this.player);

        // Initialize BGE Select Menu
        this.bgeselect = new BGESelectMenu();

        // Initialize Toolbar Button
        this.btn = $('<div data-toolbar="content-option" class="btn-toolbar toolbarbtn">');
        this.btn.icon = $('<i class="fa fa-music" style="text-shadow: none;margin-top: 2.5px;">');
        this.btn.append(this.btn.icon);

        // Initialize Toolbar Options
        this.options = $('<div id="toolbar-options" class="hidden">');
        this.options.playbackBtn = $('<a href="#" class="tool-item"></a>');
        this.options.playbackBtn.icon = $('<i class="fa fa-volume-up toolbaritem" style="text-shadow: none;margin-top: 2.5px;"></i>');
        this.options.playbackBtn.append(this.options.playbackBtn.icon);
        this.options.playbackBtn.click(function () {
            $('#player')[0].play();
        });
        this.options.bgeSelect = $('<a href="#" class="tool-item"></a>');
        this.options.bgeSelect.icon = $('<i class="fa fa-th-large toolbaritem" style="text-shadow: none;margin-top: 2.5px;"></i>');
        this.options.bgeSelect.append(this.options.bgeSelect.icon);
        $('body')[0].bgemanager = this; // Attach refference to manager
        this.options.bgeSelect.click(function () {
            $('body')[0].bgemanager.toggleBGEMenu();
        });

        $('body').append(this.btn);
        $('body').append(this.options);
        this.options.append(this.options.bgeSelect);
        this.options.append(this.options.playbackBtn);

        this.btn.toolbar({
            content: '#toolbar-options',
        });
    },
    toggleBGEMenu: function () {
        this.bgeselect.toggle();
    }
});