
var GroupEditBox = Class({
    initialize: function (group) {
        if (group === undefined) return;
        this.group = group;
        this.dx = 0;
        this.dy = 0;
        this.colorShift = '#bf4040';
        this.setupController();
        this.lockColorChanges = false;
        this.lastFilterUsed = null;

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
            let filtersFolder = GroupEditBox.ctrller.addFolder('adjust colors');
            let correctionFolder = filtersFolder.addFolder('color correction');
            GroupEditBox.hueCtrl = correctionFolder.add({
                hue: 0,
                isFirstChange: true
            }, 'hue').min(0).step(1).max(360).name('hue (degrees)')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    if (GroupEditBox.lastFilterUsed !== 'hsl') {
                        GroupEditBox.lastFilterUsed = 'hsl';
                        groupMoving.origColor = [];
                        for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                            let layer = editor.layers[i].layer;
                            groupMoving.origColor.push(layer.color);
                        }
                        GroupEditBox.lockColorChanges = true;
                        GroupEditBox.redCtrl.setValue(0);
                        GroupEditBox.greenCtrl.setValue(0);
                        GroupEditBox.blueCtrl.setValue(0);
                        GroupEditBox.lockColorChanges = false;
                    }
                    let changedH = false;
                    var prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let origHslColor = rgbToHsl({
                            r: (oldColor >> 16) & 0xFF,
                            g: (oldColor >> 8) & 0xFF,
                            b: oldColor & 0xFF
                        });
                        let hslColor = rgbToHsl({
                            r: (layer.color >> 16) & 0xFF,
                            g: (layer.color >> 8) & 0xFF,
                            b: layer.color & 0xFF
                        });
                        let rawHue = (360 * origHslColor.h + val) % 360;
                        let h = Math.min(1, Math.max(0, rawHue / 360));
                        let rawS = 100 * origHslColor.s + GroupEditBox.satCtrl.object.saturation;
                        let s = Math.min(1, Math.max(0, rawS / 100));
                        let rawL = 100 * origHslColor.l + GroupEditBox.lightCtrl.object.lightness;
                        let l = Math.min(0.99, Math.max(0.01, rawL / 100));
                        changedH = changedH || Math.abs(h - origHslColor.h) > 0.00000001;
                        let newCol = hslToRgb({ h: h, s: s, l: l });
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (newCol.r << 16) | (newCol.g << 8) | (newCol.b);
                        editor.updateLayer(layer);
                    }
                    groupMoving.changedH = changedH;
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.changedH || !groupMoving.prevColors) return;
                    groupMoving.changedH = undefined;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cChanged Group Color Hue%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            $(GroupEditBox.hueCtrl.domElement).find('input').addClass('shows-value');
            GroupEditBox.satCtrl = correctionFolder.add({
                saturation: 0,
                isFirstChange: true
            }, 'saturation').min(-100).step(1).max(100).name('saturation (%)')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    if (GroupEditBox.lastFilterUsed !== 'hsl') {
                        GroupEditBox.lastFilterUsed = 'hsl';
                        groupMoving.origColor = [];
                        for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                            let layer = editor.layers[i].layer;
                            groupMoving.origColor.push(layer.color);
                        }
                        GroupEditBox.lockColorChanges = true;
                        GroupEditBox.redCtrl.setValue(0);
                        GroupEditBox.greenCtrl.setValue(0);
                        GroupEditBox.blueCtrl.setValue(0);
                        GroupEditBox.lockColorChanges = false;
                    }
                    let changedS = false;
                    let prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let origHslColor = rgbToHsl({
                            r: (oldColor >> 16) & 0xFF,
                            g: (oldColor >> 8) & 0xFF,
                            b: oldColor & 0xFF
                        });
                        let hslColor = rgbToHsl({
                            r: (layer.color >> 16) & 0xFF,
                            g: (layer.color >> 8) & 0xFF,
                            b: layer.color & 0xFF
                        });
                        let rawHue = (360 * origHslColor.h + GroupEditBox.hueCtrl.object.hue) % 360;
                        let h = Math.min(1, Math.max(0, rawHue / 360));
                        let rawS = 100 * origHslColor.s + val;
                        let s = Math.min(1, Math.max(0, rawS / 100));
                        let rawL = 100 * origHslColor.l + GroupEditBox.lightCtrl.object.lightness;
                        let l = Math.min(0.99, Math.max(0.01, rawL / 100));
                        changedS = changedS || Math.abs(s - origHslColor.s) > 0.00000001;
                        let newCol = hslToRgb({ h: h, s: s, l: l });
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (newCol.r << 16) | (newCol.g << 8) | (newCol.b);
                        editor.updateLayer(layer);
                    }
                    groupMoving.changedS = changedS;
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.changedS || !groupMoving.prevColors) return;
                    groupMoving.changedS = undefined;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cChanged Group Color Saturation%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            $(GroupEditBox.satCtrl.domElement).find('input').addClass('shows-value');
            GroupEditBox.lightCtrl = correctionFolder.add({
                lightness: 0,
                isFirstChange: true
            }, 'lightness').min(-100).step(1).max(100).name('lightness (%)')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    if (GroupEditBox.lastFilterUsed !== 'hsl') {
                        GroupEditBox.lastFilterUsed = 'hsl';
                        groupMoving.origColor = [];
                        for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                            let layer = editor.layers[i].layer;
                            groupMoving.origColor.push(layer.color);
                        }
                        GroupEditBox.lockColorChanges = true;
                        GroupEditBox.redCtrl.setValue(0);
                        GroupEditBox.greenCtrl.setValue(0);
                        GroupEditBox.blueCtrl.setValue(0);
                        GroupEditBox.lockColorChanges = false;
                    }
                    let changedL = false;
                    let prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let origHslColor = rgbToHsl({
                            r: (oldColor >> 16) & 0xFF,
                            g: (oldColor >> 8) & 0xFF,
                            b: oldColor & 0xFF
                        });
                        let hslColor = rgbToHsl({
                            r: (layer.color >> 16) & 0xFF,
                            g: (layer.color >> 8) & 0xFF,
                            b: layer.color & 0xFF
                        });
                        let rawHue = (360 * origHslColor.h + GroupEditBox.hueCtrl.object.hue) % 360;
                        let h = Math.min(1, Math.max(0, rawHue / 360));
                        let rawS = 100 * origHslColor.s + GroupEditBox.satCtrl.object.saturation;
                        let s = Math.min(1, Math.max(0, rawS / 100));
                        let rawL = 100 * origHslColor.l + val;
                        let l = Math.min(0.99, Math.max(0.01, rawL / 100));
                        changedL = changedL || Math.abs(l - origHslColor.l) > 0.00000001;
                        let newCol = hslToRgb({ h: hslColor.h, s: hslColor.s, l: l });
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (newCol.r << 16) | (newCol.g << 8) | (newCol.b);
                        editor.updateLayer(layer);
                    }
                    groupMoving.changedL = changedL;
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.changedL || !groupMoving.prevColors) return;
                    groupMoving.changedL = undefined;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cChanged Group Color Lightness%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            $(GroupEditBox.lightCtrl.domElement).find('input').addClass('shows-value');
            correctionFolder.add({
                apply: function () {
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    GroupEditBox.lastFilterUsed = null;
                    GroupEditBox.lockColorChanges = true;
                    GroupEditBox.hueCtrl.setValue(0);
                    GroupEditBox.satCtrl.setValue(0);
                    GroupEditBox.lightCtrl.setValue(0);
                    GroupEditBox.lockColorChanges = false;
                }
            }, 'apply').name('apply and reset');
            let colorChannelFolder = filtersFolder.addFolder('color channels');
            GroupEditBox.redCtrl = colorChannelFolder.add({
                red: 0,
                isFirstChange: true
            }, 'red').min(-100).step(1).max(100).name('+red (%)')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    if (GroupEditBox.lastFilterUsed !== 'rgb') {
                        GroupEditBox.lastFilterUsed = 'rgb';
                        groupMoving.origColor = [];
                        for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                            let layer = editor.layers[i].layer;
                            groupMoving.origColor.push(layer.color);
                        }
                        GroupEditBox.lockColorChanges = true;
                        GroupEditBox.hueCtrl.setValue(0);
                        GroupEditBox.satCtrl.setValue(0);
                        GroupEditBox.lightCtrl.setValue(0);
                        GroupEditBox.lockColorChanges = false;
                    }
                    let changedR = false;
                    let prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let rawR = ((oldColor & 0xFF0000) >> 16) + 255 * val / 100;
                        let r = Math.min(1, Math.max(0, rawR / 255));
                        let rawG = ((oldColor & 0xFF00) >> 8) + 255 * GroupEditBox.greenCtrl.object.green / 100;
                        let g = Math.min(1, Math.max(0, rawG / 255));
                        let rawB = (oldColor & 0xFF) + 255 * GroupEditBox.blueCtrl.object.blue / 100;
                        let b = Math.min(1, Math.max(0, rawB / 255));
                        changedR = changedR || Math.abs(255 * r - ((oldColor & 0xFF0000) >> 16)) > 0.00000001;
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (255 * r << 16) | (255 * g << 8) | (255 * b);
                        editor.updateLayer(layer);
                    }
                    groupMoving.changedR = changedR;
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.changedR || !groupMoving.prevColors) return;
                    groupMoving.changedR = undefined;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cChanged Group Color Red Channel%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            $(GroupEditBox.redCtrl.domElement).find('input').addClass('shows-value');
            GroupEditBox.greenCtrl = colorChannelFolder.add({
                green: 0,
                isFirstChange: true
            }, 'green').min(-100).step(1).max(100).name('+green (%)')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    if (GroupEditBox.lastFilterUsed !== 'rgb') {
                        GroupEditBox.lastFilterUsed = 'rgb';
                        groupMoving.origColor = [];
                        for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                            let layer = editor.layers[i].layer;
                            groupMoving.origColor.push(layer.color);
                        }
                        GroupEditBox.lockColorChanges = true;
                        GroupEditBox.hueCtrl.setValue(0);
                        GroupEditBox.satCtrl.setValue(0);
                        GroupEditBox.lightCtrl.setValue(0);
                        GroupEditBox.lockColorChanges = false;
                    }
                    let changedG = false;
                    let prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let rawR = ((oldColor & 0xFF0000) >> 16) + 255 * GroupEditBox.redCtrl.object.red / 100;
                        let r = Math.min(1, Math.max(0, rawR / 255));
                        let rawG = ((oldColor & 0xFF00) >> 8) + 255 * val / 100;
                        let g = Math.min(1, Math.max(0, rawG / 255));
                        let rawB = (oldColor & 0xFF) + 255 * GroupEditBox.blueCtrl.object.blue / 100;
                        let b = Math.min(1, Math.max(0, rawB / 255));
                        changedG = changedG || Math.abs(255 * g - ((oldColor & 0xFF00) >> 8)) > 0.00000001;
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (255 * r << 16) | (255 * g << 8) | (255 * b);
                        editor.updateLayer(layer);
                    }
                    groupMoving.changedG = changedG;
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.changedG || !groupMoving.prevColors) return;
                    groupMoving.changedG = undefined;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cChanged Group Color Green Channel%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            $(GroupEditBox.greenCtrl.domElement).find('input').addClass('shows-value');
            GroupEditBox.blueCtrl = colorChannelFolder.add({
                blue: 0,
                isFirstChange: true
            }, 'blue').min(-100).step(1).max(100).name('+blue (%)')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    if (GroupEditBox.lastFilterUsed !== 'rgb') {
                        GroupEditBox.lastFilterUsed = 'rgb';
                        groupMoving.origColor = [];
                        for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                            let layer = editor.layers[i].layer;
                            groupMoving.origColor.push(layer.color);
                        }
                        GroupEditBox.lockColorChanges = true;
                        GroupEditBox.hueCtrl.setValue(0);
                        GroupEditBox.satCtrl.setValue(0);
                        GroupEditBox.lightCtrl.setValue(0);
                        GroupEditBox.lockColorChanges = false;
                    }
                    let changedB = false;
                    let prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let rawR = ((oldColor & 0xFF0000) >> 16) + 255 * GroupEditBox.redCtrl.object.red / 100;
                        let r = Math.min(1, Math.max(0, rawR / 255));
                        let rawG = ((oldColor & 0xFF00) >> 8) + 255 * GroupEditBox.greenCtrl.object.green / 100;
                        let g = Math.min(1, Math.max(0, rawG / 255));
                        let rawB = (oldColor & 0xFF) + 255 * val / 100;
                        let b = Math.min(1, Math.max(0, rawB / 255));
                        changedB = changedB || Math.abs(255 * b - (oldColor & 0xFF)) > 0.00000001;
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (255 * r << 16) | (255 * g << 8) | (255 * b);
                        editor.updateLayer(layer);
                    }
                    groupMoving.changedB = changedB;
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.changedB || !groupMoving.prevColors) return;
                    groupMoving.changedB = undefined;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cChanged Group Color Blue Channel%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            $(GroupEditBox.blueCtrl.domElement).find('input').addClass('shows-value');
            colorChannelFolder.add({
                apply: function () {
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    GroupEditBox.lastFilterUsed = null;
                    GroupEditBox.lockColorChanges = true;
                    GroupEditBox.redCtrl.setValue(0);
                    GroupEditBox.greenCtrl.setValue(0);
                    GroupEditBox.blueCtrl.setValue(0);
                    GroupEditBox.lockColorChanges = false;
                }
            }, 'apply').name('apply and reset');
            let setColorFolder = filtersFolder.addFolder('set color');
            GroupEditBox.setColorData = {
                color: '#FFFFFF',
                replacesColor: false,
                isFirstChange: true
            };
            setColorFolder.addColor(GroupEditBox.setColorData, 'color').name('color')
                .onChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (this.object.isFirstChange) {
                        this.object.isFirstChange = false;
                    }
                    let prevColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        let oldColor = groupMoving.origColor[i - groupMoving.firstIdx];
                        let origHslColor = rgbToHsl({
                            r: (oldColor >> 16) & 0xFF,
                            g: (oldColor >> 8) & 0xFF,
                            b: oldColor & 0xFF
                        });
                        let rawColor = parseInt(val.substring(1, val.length), 16);
                        let invColor = editor.applyInverseBSCFilter({
                            r: ((rawColor >> 16) & 0xFF) / 255,
                            g: ((rawColor >> 8) & 0xFF) / 255,
                            b: (rawColor & 0xFF) / 255,
                            a: 1
                        }, 0.7, 0.9, 2.12, true);
                        let hslColor = rgbToHsl({
                            r: invColor.r * 255,
                            g: invColor.g * 255,
                            b: invColor.b * 255
                        });
                        // Changes hue and saturation to that of the color chosen.
                        // Keeps lightness to retain the shape of the image, or
                        // changes it depending on the replaceColor option.
                        let factorL = (GroupEditBox.setColorData.replacesColor ? hslColor.l : origHslColor.l);
                        let newCol = hslToRgb({ h: hslColor.h, s: hslColor.s, l: factorL });
                        if (!groupMoving.prevColors) prevColors.push(layer.color);
                        layer.color = (newCol.r << 16) | (newCol.g << 8) | (newCol.b);
                        editor.updateLayer(layer);
                    }
                    if (!groupMoving.prevColors) {
                        groupMoving.prevColors = prevColors;
                    }
                    editor.render();
                })
                .onFinishChange(function (val) {
                    if (GroupEditBox.lockColorChanges) return;
                    this.object.isFirstChange = true;
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    if (!groupMoving.prevColors) return;
                    var newColors = [];
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        newColors.push(editor.layers[i].layer.color);
                    }
                    // Save group recolor so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouprecolor', {
                        'startIdx': groupMoving.firstIdx,
                        'endIdx': groupMoving.lastIdx,
                        'origColors': groupMoving.prevColors,
                        'newColors': newColors
                    });
                    console.log('%cSet Group Color%c. Symbols '
                        + 'modified are %o. Original colors are %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1),
                        groupMoving.prevColors);
                    groupMoving.prevColors = undefined;
                    this.updateDisplay();
                });
            setColorFolder.add(GroupEditBox.setColorData, 'replacesColor').name('replace color');
            let flipFolder = GroupEditBox.ctrller.addFolder('flip');
            flipFolder.add({
                horizontal: function () {
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    editor.updateGroupEditBoxSize();
                    let groupXpos_x2 = (groupMoving.maxXCoord + groupMoving.minXCoord);
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        layer.x = groupXpos_x2 - layer.x;
                        for (var j = 0; j < 4; j++) {
                            layer.vertices[2 * j] *= -1;
                        }
                        editor.updateLayer(layer);
                    }
                    editor.render();
                    // Save group flip so it can be reverted later
                    historyManager.pushUndoAction('symbol_grouphorizontalflip', {
                        'groupXpos_x2': groupXpos_x2,
                        'firstIdx': groupMoving.firstIdx,
                        'lastIdx': groupMoving.lastIdx
                    });
                    console.log('%cHorizontally Flipped%c Symbol Group %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1));
                }
            }, 'horizontal');
            flipFolder.add({
                vertical: function () {
                    let editor = $('canvas')[0].editor;
                    let groupMoving = editor.groupMoving;
                    editor.updateGroupEditBoxSize();
                    let groupYpos_x2 = (groupMoving.maxYCoord + groupMoving.minYCoord);
                    for (var i = groupMoving.firstIdx; i < groupMoving.lastIdx; i++) {
                        let layer = editor.layers[i].layer;
                        layer.y = groupYpos_x2 - layer.y;
                        for (var j = 0; j < 4; j++) {
                            layer.vertices[2 * j + 1] *= -1;
                        }
                        editor.updateLayer(layer);
                    }
                    editor.render();
                    // Save group flip so it can be reverted later
                    historyManager.pushUndoAction('symbol_groupverticalflip', {
                        'groupYpos_x2': groupYpos_x2,
                        'firstIdx': groupMoving.firstIdx,
                        'lastIdx': groupMoving.lastIdx
                    });
                    console.log('%cVertically Flipped%c Symbol Group %o.',
                        'color: #2fa1d6', 'color: #f3f3f3',
                        editor.layers.slice(groupMoving.firstIdx, groupMoving.lastIdx + 1));
                }
            }, 'vertical');
            $(GroupEditBox.ctrller.domElement).addClass("top-right no-panning no-highlight fade");
            $('body').append(GroupEditBox.ctrller.domElement);
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
GroupEditBox.ctrller;
/* Static Functions */
GroupEditBox.show = function () {
    if (!$('#groupEditBox')[0]) { // Ignore if edit box is already displaying
        $('.canvas-box').append(GroupEditBox.container);
        $('#colorSelector2').spectrum('set', '#bf4040');
        $(GroupEditBox.ctrller.domElement).removeClass("fadeOut");
        GroupEditBox.hueCtrl.setValue(0);
        GroupEditBox.satCtrl.setValue(0);
        GroupEditBox.lightCtrl.setValue(0);
    }
    let partmenu = $('canvas')[0].editor.layerCtrl.partselectmenu;
    if (partmenu.isActive() && partmenu.isOpen()) {
        partmenu.toggle();
    }
}
GroupEditBox.hide = function () {
    if (!$('#groupEditBox')[0]) return; // Ignore if edit box is not displaying
    GroupEditBox.container.detach();
    $(GroupEditBox.ctrller.domElement).addClass("fadeOut");
}
GroupEditBox.isVisible = function () {
    let box = $('#groupEditBox')[0];
    if (box) return true;
    else return false;
}

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