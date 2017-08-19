var Toolbar = Class({
    initialize: function (domElem) {
        this.holder = $('<div class="toolbar-holder no-panning">');
        this.domElem = $('<div class="toolbar-container">');
        this.holder.append(this.domElem);
        this.toolList = {};
        this.toolListSize = 0;
        if (domElem instanceof Element) {
            $(domElem).append(this.holder);
        }
        else console.warn('%cToolbar (%O):%c Could not append toolbar to given DOM element %O.',
            'color: #a6cd94', this, 'color: #d5d5d5', domElem);
        if (window.addEventListener) {
            window.addEventListener('resize', this.updateUI, true);
        }
        else if (window.attachEvent) {
            window.attachEvent('onresize', this.updateUI);
        }
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
            tool.append(tool.options);
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
        let $domHolder = $('.toolbar-holder');
        if ($domHolder.length <= 0) return;
        let $domContainer = $domHolder.children(':first');
        if ($domContainer.length <= 0) return;
        let numChildren = $domContainer.children().length;
        let newWidth = 40 * numChildren;
        if (newWidth > 40 && newWidth >= window.innerWidth - 120) {
            let maxW = 40 * Math.floor((window.innerWidth - 120) / 40);
            let overflowW = newWidth - maxW;
            newWidth = maxW;
            if (!$domContainer[0].hasBound) {
                $domHolder.bind('swipe', function (e) {
                    let $domHolder = $('.toolbar-holder');
                    if ($domHolder.length <= 0) return;
                    let $domContainer = $domHolder.children(':first');
                    if ($domContainer.length <= 0) return;
                    let newX;
                    if (e.swipestop.coords[0] - e.swipestart.coords[0] >= 0)
                        newX = ($domContainer[0].currX + $domContainer[0].stepX);
                    else
                        newX = ($domContainer[0].currX - $domContainer[0].stepX);
                    if (newX > 0 || newX < -$domContainer[0].maxX) return;
                    $domContainer[0].currX = newX;
                    $domContainer.css('transform', 'matrix(1, 0, 0, 1, '
                        + $domContainer[0].currX + ', 0)');
                });
                $domContainer[0].currX = 0;
                $domContainer[0].hasBound = true;
            }
            let whiteSpaceX = maxW - (overflowW % maxW);
            if (whiteSpaceX < maxW) overflowW += whiteSpaceX;
            $domContainer[0].maxX = overflowW;
            $domContainer[0].stepX = maxW;
            $domContainer.css('width', maxW + overflowW);
        }
        else {
            $domHolder.unbind('swipe');
            $domContainer[0].currX = undefined;
            $domContainer[0].hasBound = undefined;
            $domContainer.css('width', '');
            $domContainer.css('transform', '');
        }
        $domHolder.css('width', newWidth);
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