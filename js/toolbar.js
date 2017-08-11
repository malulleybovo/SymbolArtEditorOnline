var Toolbar = Class({
    initialize: function (domElem) {
        this.domElem = $('<div class="toolbar-holder no-panning">');
        this.toolList = {};
        this.toolListSize = 0;
        if (domElem instanceof Element) {
            $(domElem).append(this.domElem);
        }
        else console.warn('%cToolbar (%O):%c Could not append toolbar to given DOM element %O.',
            'color: #a6cd94', this, 'color: #d5d5d5', domElem);
    },
    addTool: function (name, iconClassName, onClickCallback) {
        if (this.toolList[name] !== undefined) return null;
        let newTool;
        newTool = $('<div data-toolbar="content-option" class="btn-toolbar toolbarbtn no-panning">');
        newTool.icon = $('<i class="' + iconClassName
            + '" style="text-shadow: none;margin-top: 2.5px;">');
        newTool.onclickRef = onClickCallback;
        newTool.isEnabled = true;
        newTool.append(newTool.icon);
        if (onClickCallback !== undefined) newTool.on('click', onClickCallback);
        this.toolList[name] = newTool;
        this.toolListSize++;
        this.domElem.append(newTool);
        this.updateUI();
        return newTool;
    },
    addMenuOptionToTool: function (name, iconClassName, onClickCallback) {
        if (this.toolList[name] === undefined) return null;
        let tool = this.toolList[name];
        if (tool.options === undefined) {
            tool.options = $('<div id="toolbar-options" class="hidden">');
            this.domElem.append(tool.options);
        }
        let newOption = $('<a href="#" class="tool-item"></a>');
        newOption.icon = $('<i class="' + iconClassName
            + ' toolbaritem" style="text-shadow: none;margin-top: 2.5px;"></i>');
        newOption.append(newOption.icon);
        newOption.click(onClickCallback);
        tool.options.append(newOption);
        return newOption;
    },
    setup: function () {
        for (var name in this.toolList) {
            if (this.toolList[name].options) {
                this.toolList[name].toolbar({
                    content: '#toolbar-options',
                });
            }
        }
    },
    updateUI: function () {
        let tools = [];
        for (var name in this.toolList) {
            tools.push(name);
        }
        this.toolList[tools[0]]
            .addClass('toolbar-first')
            .removeClass('toolbar-last');
        for (var i = 1; i < tools.length - 1; i++) {
            this.toolList[tools[i]]
                .removeClass('toolbar-first')
                .removeClass('toolbar-last');
        }
        this.toolList[tools[tools.length - 1]]
            .removeClass('toolbarfirst')
            .addClass('toolbar-last');
        this.domElem.css('width', 42 * this.toolListSize);
    },
    enableTool: function (name) {
        if (this.toolList[name] === undefined) return null;
        let tool = this.toolList[name];
        if (tool.isEnabled) return null;
        tool.isEnabled = true;
        tool.removeClass('toolbar-disabled-tool');
        if (tool.onclickRef !== undefined) tool.on('click', tool.onclickRef);
    },
    disableTool: function (name) {
        if (this.toolList[name] === undefined) return null;
        let tool = this.toolList[name];
        if (!tool.isEnabled) return null;
        tool.isEnabled = false;
        tool.addClass('toolbar-disabled-tool');
        if (tool.onclickRef !== undefined) tool.off();
    }
});