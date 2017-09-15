
var GroupEditBox = Class({
    initialize: function (group) {
        if (group === undefined) return;
        this.group = group;
        this.dx = 0;
        this.dy = 0;
        GroupEditBox.show();
    },
    displace: function (dx, dy) {
        if (dx === undefined || typeof dx !== 'number'
            || dy === undefined || typeof dy !== 'number') return;
        this.dx = dx;
        this.dy = dy;
        this.updateUI();
    },
    updateUI: function () {
        if (this.group === undefined) return;
        if (!$('#groupEditBox')[0]) return; // Ignore if edit box is not displaying
        let canvas = $('canvas');
        let editor = canvas[0].editor;
        let offset = canvas.offset();
        GroupEditBox.btns.topL.css('left', (offset.left + editor.zoom * (this.group.minXCoord + this.dx) - 11.3) + 'px')
            .css('top', (offset.top + editor.zoom * (this.group.minYCoord + this.dy) - 12.5) + 'px');
        GroupEditBox.btns.topR.css('left', (offset.left + editor.zoom * (this.group.maxXCoord + this.dx) - 11.3) + 'px')
            .css('top', (offset.top + editor.zoom * (this.group.minYCoord + this.dy) - 12.5) + 'px');
        GroupEditBox.btns.botL.css('left', (offset.left + editor.zoom * (this.group.minXCoord + this.dx) - 11.3) + 'px')
            .css('top', (offset.top + editor.zoom * (this.group.maxYCoord + this.dy) - 12.5) + 'px');
        GroupEditBox.btns.botR.css('left', (offset.left + editor.zoom * (this.group.maxXCoord + this.dx) - 11.3) + 'px')
            .css('top', (offset.top + editor.zoom * (this.group.maxYCoord + this.dy) - 12.5) + 'px');
    }
});
/* Static Fields */
GroupEditBox.btns = {
    topL: $('<i class="fa fa-circle-o fa-border edit-button no-highlight no-panning" ondragstart="return false;">'),
    topR: $('<i class="fa fa-circle-o fa-border edit-button no-highlight no-panning" ondragstart="return false;">'),
    botL: $('<i class="fa fa-circle-o fa-border edit-button no-highlight no-panning" ondragstart="return false;">'),
    botR: $('<i class="fa fa-circle-o fa-border edit-button no-highlight no-panning" ondragstart="return false;">')

}
GroupEditBox.container = $('<div id="groupEditBox">');
GroupEditBox.container
    .append(GroupEditBox.btns.topL)
    .append(GroupEditBox.btns.topR)
    .append(GroupEditBox.btns.botL)
    .append(GroupEditBox.btns.botR);
/* Static Functions */
GroupEditBox.show = function () {
    if ($('#groupEditBox')[0]) return; // Ignore if edit box is already displaying
    $('body').append(GroupEditBox.container);
}
GroupEditBox.hide = function () {
    if (!$('#groupEditBox')[0]) return; // Ignore if edit box is not displaying
    GroupEditBox.container.detach();
}
GroupEditBox.isVisible = function () {
    let box = $('#groupEditBox')[0];
    if (box) return true;
    else return false;
}