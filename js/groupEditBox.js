
var GroupEditBox = Class({
    initialize: function (group) {
        if (group === undefined) return;
        this.group = group;
        this.dx = 0;
        this.dy = 0;
        this.colorShift = '#bf4040';
        this.setupController();

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
        let canvas = $('canvas');
        let editor = canvas[0].editor;
        let inverseScale = 'scale(' + (1 / editor.zoom) + ',' + (1 / editor.zoom) + ')';
        GroupEditBox.btns.topL.css('left', ((this.group.minXCoord + this.dx) - 11.3) + 'px')
            .css('top', ((this.group.minYCoord + this.dy) - 12.5) + 'px')
            .css('transform', inverseScale);
        GroupEditBox.btns.topR.css('left', ((this.group.maxXCoord + this.dx) - 11.3) + 'px')
            .css('top', ((this.group.minYCoord + this.dy) - 12.5) + 'px')
            .css('transform', inverseScale);
        GroupEditBox.btns.botL.css('left', ((this.group.minXCoord + this.dx) - 11.3) + 'px')
            .css('top', ((this.group.maxYCoord + this.dy) - 12.5) + 'px')
            .css('transform', inverseScale);
        GroupEditBox.btns.botR.css('left', ((this.group.maxXCoord + this.dx) - 11.3) + 'px')
            .css('top', ((this.group.maxYCoord + this.dy) - 12.5) + 'px')
            .css('transform', inverseScale);
    },
    setupController: function () {
        if (GroupEditBox.ctrller === undefined) {
            GroupEditBox.ctrller = new dat.GUI({ autoPlace: false });
            GroupEditBox.ctrller.add({
                transparency: 0,
                isFirstChange: true
            }, 'transparency').min(-7).step(1).max(7)
                .onChange(function (val) {
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let newAlpha = val + groupMoving.origAlpha[i - groupMoving.firstIdx];
                        if (newAlpha > 7) newAlpha = 7;
                        else if (newAlpha < 0) newAlpha = 0;
                        layer.alpha = newAlpha;
                        editor.updateLayer(layer);
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    let shouldSave = false;
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        if (editor.layers[i].layer.alpha != editor.groupMoving.origAlpha[i]) {
                            shouldSave = true;
                            break;
                        }
                    }
                    if (!shouldSave) return;
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_groupchangealpha', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origAlphas': groupMoving.origAlpha
                    });
                    // Update origColor with up to date colors from layers
                    groupMoving.origAlpha = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        layer = editor.layers[i].layer;
                        groupMoving.origAlpha.push(layer.alpha);
                    }
                    console.log('%cChanged Group Transparency%c by %i. Symbols '
                        + 'modified are %o. Original alpha values are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3', this.object.transparency,
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.origAlpha);
                    this.object.transparency = 0;
                    this.updateDisplay();
                });
            $(GroupEditBox.ctrller.domElement).addClass("top-right no-panning no-highlight fade");
            $('body').append(GroupEditBox.ctrller.domElement);
        }
        if (GroupEditBox.cPicker !== undefined) return;
        // Color Picker
        GroupEditBox.cPicker = $('<input type="text" id="colorSelector2" style="width:0; height:0; position:fixed; bottom:0; right:0;" />');
        $('body').append(GroupEditBox.cPicker);
        GroupEditBox.cPicker.spectrum({
            color: "#bf4040",
            showInput: true,
            showInitial: true,
            localStorageKey: "spectrum.homepage",
            showPalette: true,
            palette: [],
            replacerClassName: 'group-picker-replacer',
            containerClassName: 'group-picker-container',
            preferredFormat: "hex",
            clickoutFiresChange: true,
            beforeShow: function (color) {
                let editor = $('canvas')[0].editor;
            },
            change: function (color) { updateColor(color); },
            move: function (color) { updateColor(color); },
            hide: function (color) {
                let editor = $('canvas')[0].editor;
                updateColor(color);
                let groupMoving = editor.groupMoving;
                let shouldSave = false;
                for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                    if (editor.layers[i].layer.color != editor.groupMoving.origColor[i]) {
                        shouldSave = true;
                        break;
                    }
                }
                if (!shouldSave) return;
                // Save group recolor so it can be reverted later
                historyManager.pushUndoAction('symbol_grouprecolor', {
                    'startIdx': groupMoving.firstIdx,
                    'endIdx': groupMoving.lastIdx,
                    'origColors': groupMoving.origColor
                });
                console.log('%cChanged Group Hue, Saturation, and Vibrance%c. Symbols '
                    + 'modified are %o. Original colors are %o.',
                    'color: #2fa1d6', 'color: #f3f3f3',
                    editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                    groupMoving.origColor);
                // Update origColor with up to date colors from layers
                groupMoving.origColor = [];
                for (i; i < groupMoving.lastIdx; i++) {
                    layer = editor.layers[i].layer;
                    groupMoving.origColor.push(layer.color);
                }
                // Reset picker color to the ZERO mark (0 hue, 100% saturation and luminance)
                $('#colorSelector2').spectrum('set', '#bf4040');
            }
        });
        $('.group-picker-replacer').attr('id', 'groupColorPicker');
        $('#groupColorPicker').css('transition', '0.1s ease-in-out').addClass('no-panning fade fadeOut');
        $('.sp-container').addClass('no-panning');
        function updateColor(val) {
            let editor = $('canvas')[0].editor;
            let groupMoving = editor.groupMoving;
            if (groupMoving === undefined) return;

            this.tint = {
                r: val._r,
                g: val._g,
                b: val._b
            };
            this.tint = rgbToHsl(this.tint);

            for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                layer = editor.layers[i].layer;
                color = editor.groupMoving.origColor[i];
                color = rgbToHsl({ r: (color >> 16) & 0xFF, g: (color >> 8) & 0xFF, b: color & 0xFF });
                let h = (this.tint.h + color.h) % 1;
                let s = (2 * this.tint.s * color.s);
                let l = (2 * this.tint.l * color.l);
                if (s > 1) s = 1;
                if (s < 0) s = 0;
                if (l > 1) l = 1;
                if (l < 0) l = 0;
                let newCol = hslToRgb({ h: h, s: s, l: l });
                layer.color = (newCol.r << 16) | (newCol.g << 8) | (newCol.b);
                editor.updateLayer(layer);
            }

            editor.render();

            return val;

            function rgbToHsl(col) {
                col.r /= 255, col.g /= 255, col.b /= 255;

                let max = Math.max(col.r, col.g, col.b),
                    min = Math.min(col.r, col.g, col.b);
                let h, s, l = (max + min) / 2;

                if (max == min) {
                    h = s = 0; // achromatic
                } else {
                    let d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                    switch (max) {
                        case col.r: h = (col.g - col.b) / d + (col.g < col.b ? 6 : 0); break;
                        case col.g: h = (col.b - col.r) / d + 2; break;
                        case col.b: h = (col.r - col.g) / d + 4; break;
                    }

                    h /= 6;
                }

                return {
                    h: h,
                    s: s,
                    l: l
                };
            }
            function hslToRgb(col) {
                var r, g, b;

                if (col.s == 0) {
                    r = g = b = col.l * 255; // achromatic
                } else {
                    function hue2rgb(p, q, t) {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1 / 6) return p + (q - p) * 6 * t;
                        if (t < 1 / 2) return q;
                        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                        return p;
                    }

                    var q = col.l < 0.5 ? col.l * (1 + col.s) : col.l + col.s - col.l * col.s;
                    var p = 2 * col.l - q;

                    r = Math.round(hue2rgb(p, q, col.h + 1 / 3) * 255);
                    if (r > 255) r = 255;
                    else if (r < 0) r = 0;
                    g = Math.round(hue2rgb(p, q, col.h) * 255);
                    if (g > 255) g = 255;
                    else if (g < 0) g = 0;
                    b = Math.round(hue2rgb(p, q, col.h - 1 / 3) * 255);
                    if (b > 255) b = 255;
                    else if (b < 0) b = 0;
                }

                return {
                    r: r,
                    g: g,
                    b: b
                };
            }
        }
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
GroupEditBox.cPicker;
GroupEditBox.ctrller;
/* Static Functions */
GroupEditBox.show = function () {
    if ($('#groupEditBox')[0]) return; // Ignore if edit box is already displaying
    $('.canvas-box').append(GroupEditBox.container);
    $('#colorSelector2').spectrum('set', '#bf4040');
    $('#groupColorPicker').removeClass('fadeOut');
    $(GroupEditBox.ctrller.domElement).removeClass("fadeOut");
}
GroupEditBox.hide = function () {
    if (!$('#groupEditBox')[0]) return; // Ignore if edit box is not displaying
    GroupEditBox.container.detach();
    $('#groupColorPicker').addClass('fadeOut');
    $(GroupEditBox.ctrller.domElement).addClass("fadeOut");
}
GroupEditBox.isVisible = function () {
    let box = $('#groupEditBox')[0];
    if (box) return true;
    else return false;
}