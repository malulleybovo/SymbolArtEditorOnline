var Toolbar = Class({
    initialize: function (domElem) {
        this.TOOL_OPTIONS_NUM = 0;
        this.wrapper = $('<div id="SAToolbar">');
        this.holder = $('<div class="toolbar-holder no-panning">');
        this.domElem = $('<div class="toolbar-container">');
        this.navigator = $('<div class="toolbar-nav">');
        this.wrapper.append(this.navigator);
        this.wrapper.append(this.holder);
        this.holder.append(this.domElem);
        this.toolList = {};
        this.toolListSize = 0;
        if (domElem instanceof Element) {
            $(domElem).append(this.wrapper);
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
            tool.options = $('<div id="toolbar-options'
                + this.TOOL_OPTIONS_NUM + '" class="hidden">');
            this.TOOL_OPTIONS_NUM++
            tool.append(tool.options);
        }
        let newOption = $('<a href="#" class="tool-item"></a>');
        newOption.icon = $('<i class="' + iconClassName
            + ' toolbaritem" style="text-shadow: none;margin-top: 2.5px;"></i>');
        newOption[0].isEnabled = true;
        newOption[0].onclickRef = onClickCallback;
        newOption.append(newOption.icon);
        newOption.on('click', onClickCallback);
        tool.options.append(newOption);
        return newOption;
    },
    setup: function () {
        for (var name in this.toolList) {
            if (this.toolList[name].options) {
                this.toolList[name].toolbar({
                    content: '#' + this.toolList[name].options[0].id,
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
                    let $currNav = $('i.toolbar-nav-i.fa-circle')
                            .removeClass('fa-circle').addClass('fa-circle-o');
                    if (e.swipestop.coords[0] - e.swipestart.coords[0] >= 0) {
                        $currNav.prev().removeClass('fa-circle-o').addClass('fa-circle');
                    }
                    else {
                        $currNav.next().removeClass('fa-circle-o').addClass('fa-circle');
                    }
                });
                $domContainer[0].hasBound = true;
            }
            $domContainer[0].currX = 0;
            let whiteSpaceX = maxW - (overflowW % maxW);
            if (whiteSpaceX < maxW) overflowW += whiteSpaceX;
            $domContainer[0].maxX = overflowW;
            $domContainer[0].stepX = maxW;
            $domContainer.css('width', maxW + overflowW);
            let $toolbarNav = $('.toolbar-nav');
            let extraPages = Math.floor((overflowW / maxW));
            if (maxW > 0 && extraPages > 0) {
                $toolbarNav.empty().append('<i class="toolbar-nav-i fa fa-circle">');
                for (var i = 0; i < extraPages; i++) {
                    $toolbarNav.append('<i class="toolbar-nav-i fa fa-circle-o">');
                }
            }
        }
        else {
            $domHolder.unbind('swipe');
            $domContainer[0].currX = undefined;
            $domContainer[0].hasBound = undefined;
            $domContainer.css('width', '');
            $('.toolbar-nav').css('width', '').empty();
        }
        $domContainer.css('transform', '');
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
    },
    enableOptionInTool: function (idx, toolName) {
        if (this.toolList[toolName] === undefined) return null;
        let tool = this.toolList[toolName];
        if (tool.options === undefined
            || tool.options[0].children[idx] === undefined
            || tool.options[0].children[idx].isEnabled) return null;
        let option = $(tool.options[0].children[idx]);
        let $classes = option.children(':first').attr('class').replace(/ /g, '.');
        let $domElem = $('.' + $classes).parent();
        option[0].isEnabled = true;
        $domElem.removeClass('toolbar-disabled-tool');
        $domElem.on('click', option[0].onclickRef);
    },
    disableOptionInTool: function (idx, toolName) {
        if (this.toolList[toolName] === undefined) return null;
        let tool = this.toolList[toolName];
        if (tool.options === undefined
            || tool.options[0].children[idx] === undefined
            || !tool.options[0].children[idx].isEnabled) return null;
        let option = $(tool.options[0].children[idx]);
        let classes = option.children(':first').attr('class').replace(/ /g, '.');
        let $domElem = $('.' + classes).parent();
        option[0].isEnabled = false;
        $domElem.addClass('toolbar-disabled-tool');
        $domElem.off();
    }
});