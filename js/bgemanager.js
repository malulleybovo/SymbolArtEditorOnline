var BGEManager = Class({
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
    },
    toggleBGEMenu: function () {
        this.bgeselect.toggle();
    }
});