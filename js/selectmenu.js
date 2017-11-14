var SelectMenu = Class({
    initialize: function () {
        var newMenu = {};
        newMenu.container = $('<div id="sidenav" class="no-highlight cursor-pointer no-panning fade">');
        newMenu.container[0].selectmenu = this;
        newMenu.width = '170px';

        newMenu.container.list = $('<div class="menu" style="width: ' + newMenu.width + ';">');

        newMenu.closeButton = $('<div class="closebtn">&times;</a>');
        newMenu.closeButton[0].selectmenu = this; // Attach refference to select menu
        newMenu.closeButton.click(function () { // Close menu function
            this.selectmenu.toggle();
        });

        newMenu.isOpen = false;
        newMenu.options = [];
        newMenu.selectedOption = null;

        newMenu.container.append(newMenu.closeButton);
        newMenu.container.append(newMenu.container.list);
        Ps.initialize(newMenu.container[0], {
            wheelSpeed: 0.2,
            wrapContent: false,
            wheelPropagation: false,
            minScrollbarLength: 20
        });

        SelectMenu.menus = SelectMenu.menus || [];
        SelectMenu.menus.push(newMenu);

        this.setActiveMenu(SelectMenu.menus.length - 1);
    },
    setActiveMenu: function (index) {
        if (index >= 0 && index < SelectMenu.menus.length) {
            if (SelectMenu.activeMenu !== undefined && SelectMenu.activeMenu != SelectMenu.menus[index]) {
                // Close menu currently being used
                if (SelectMenu.activeMenu.isOpen) {
                    this.toggle();
                }
                $('#sidenav').detach();
            }

            // Open selected menu
            SelectMenu.activeMenu = SelectMenu.menus[index];
            $('body').prepend(SelectMenu.activeMenu.container);
            return SelectMenu.activeMenu;
        }
        return null;
    },
    isMenuActive: function (index) {
        if (index >= 0 && index < SelectMenu.menus.length
            && SelectMenu.activeMenu !== undefined && SelectMenu.activeMenu == SelectMenu.menus[index]) {
            return true;
        }
        return false;
    },
    setSelectedOption: function (num, menuIndex) {
        var menu = SelectMenu.menus[menuIndex] || SelectMenu.activeMenu;
        if (menu.options.length <= num) return -1;
        if (menu.selectedOption != null) {
            menu.selectedOption.removeClass('img-highlight');
        }
        menu.selectedOption = menu.options[num];
        menu.selectedOption.addClass('img-highlight');
        return 0;
    },
    addIconOption: function (url, handler, addonProperties) {
        url = url || "https://image.flaticon.com/teams/1-freepik.jpg";
        var newOption = $('<img src="' + url + '" class="img-base ui-li-thumb">');
        newOption[0].handler = handler || function () { }; // specific function/action for a given option
        newOption[0].index = SelectMenu.activeMenu.options.length;

        if (addonProperties !== undefined) {
            // Add custom properties passed in by caller
            var keys = Object.keys(addonProperties);
            for (var i = 0; i < keys.length; i++) {
                var propName = keys[i];
                newOption[0][propName] = addonProperties[propName];
            }
        }

        newOption.click(function () {
            var menu = SelectMenu.activeMenu;
            var prevSelected = menu.selectedOption;
            if (prevSelected) {
                prevSelected.removeClass('img-highlight');
            }
            var option = $(this);
            option.addClass('img-highlight');
            menu.selectedOption = option;
            option[0].handler(option[0].index); // Trigger option-specific function
        });
        SelectMenu.activeMenu.options.push(newOption);
        SelectMenu.activeMenu.container.list.append(newOption);
    },
    toggle: function () {
        SelectMenu.activeMenu.isOpen = !SelectMenu.activeMenu.isOpen;
        var container = $('#sidenav');
        if (SelectMenu.activeMenu.isOpen) {
            container[0].style.width = SelectMenu.activeMenu.width;
            container.find('.closebtn')[0].style.transform = 'translate(0%, 0%)';
            $('#layerColorPicker').css('transform', 'translate(-' + SelectMenu.activeMenu.width + ', 0)')
                .addClass('may-be-off-screen');
            $('.top-right').css('transform', 'translate(-' + SelectMenu.activeMenu.width + ', 0)')
                .addClass('may-be-off-screen');
        }
        else {
            container[0].style.width = "0px";
            container.find('.closebtn')[0].style.transform = 'translate(300%, 0%)';
            $('#layerColorPicker').css('transform', 'translate(0, 0)')
                .removeClass('may-be-off-screen');
            $('.top-right').css('transform', 'translate(0, 0)')
                .removeClass('may-be-off-screen');
        }
    },
    isOpen: function (index) {
        return (index >= 0 && index < SelectMenu.menus.length
            && SelectMenu.menus[index].isOpen);
    },
    hide: function (index) {
        if (index >= 0 && index < SelectMenu.menus.length) {
            SelectMenu.menus[index].container.addClass('fadeOut');
        }
    },
    show: function (index) {
        if (index >= 0 && index < SelectMenu.menus.length) {
            SelectMenu.menus[index].container.removeClass('fadeOut');
        }
    }
});