
var AlertManager = Class({
    initialize: function () {
        this.pendingAlerts = [];
        this.capacity = 40;

        this.alertBox = $('<div id="alertBox" class="no-highlight no-panning">');
        this.alertBox[0].obj = this;
        $('body').append(this.alertBox);
    },
    pushAlert: function (msg) {
        if (msg === undefined || typeof msg !== 'string') {
            console.log(
            '%cAlert Manager:%c Could not push alert because message %O is invalid.',
            'color: #a6cd94', 'color: #d5d5d5', msg);
            return;
        }
        msg = msg.trim();
        if (msg.length == 0 || !(/\S/.test(msg))) {
            console.log(
            '%cAlert Manager:%c Did not push alert because message %O is whitespace-only.',
            'color: #a6cd94', 'color: #d5d5d5', msg);
            return;
        }
        let alertBox = $('#alertBox');
        if (!alertBox[0]) return;
        let alertMan = alertBox[0].obj;
        alertMan.pendingAlerts.push(msg);
        alertMan.alertNext();
    },
    alertNext: function () {
        let alertBox = $('#alertBox');
        if (!alertBox[0]) return;
        if (alertBox.hasClass('alerting-msg')) return;
        let alertMan = alertBox[0].obj;
        if (alertMan.pendingAlerts.length <= 0
            || alertMan.pendingAlerts.length >= alertMan.capacity) {
            return; // Either full or empty
        }
        let nextMsg = alertMan.pendingAlerts.pop();
        alertBox.text(nextMsg);
        alertBox.addClass('alerting-msg');
        // 63: An average time (in milisec) per character read
        let timespan = nextMsg.length * 63;
        if (timespan < 1000) timespan = 1000;
        setTimeout(function () {
            let alertBox = $('#alertBox');
            if (!alertBox[0]) return;
            alertBox.removeClass('alerting-msg');
            let alertMan = alertBox[0].obj;
            setTimeout(alertMan.alertNext, 100);
        }, timespan);
    }
});