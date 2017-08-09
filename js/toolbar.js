var Toolbar = Class({
    initialize: function (domElem) {
        this.domElem = $('<div class="toolbar-holder no-panning">');
        this.toolList = {};
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
        newTool.append(newTool.icon);
        if (onClickCallback !== undefined) newTool.click(onClickCallback);
        this.toolList[name] = newTool;
        this.domElem.append(newTool);
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
    }
});