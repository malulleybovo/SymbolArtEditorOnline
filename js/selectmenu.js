var SelectMenu = Class({
    initialize: function () {
        var newMenu = {};
        newMenu.container = $('<div id="sidenav">');
        newMenu.container[0].selectmenu = this;

        newMenu.container.list = $('<div style="width: 170px;">');

        newMenu.closeButton = $('<a href="javascript:void(0)" class="closebtn">&times;</a>');
        newMenu.closeButton[0].selectmenu = this; // Attach refference to select menu
        newMenu.closeButton.click(function () { // Close menu function
            this.selectmenu.toggle();
        });

        newMenu.isOpen = false;
        newMenu.options = [];
        newMenu.selectedOption = null;

        newMenu.container.append(newMenu.closeButton);
        newMenu.container.append(newMenu.container.list);

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
            return 0;
        }
        return -1;
    },
    isMenuActive: function (index) {
        if (index >= 0 && index < SelectMenu.menus.length
            && SelectMenu.activeMenu !== undefined && SelectMenu.activeMenu == SelectMenu.menus[index]) {
            return true;
        }
        return false;
    },
    setSelectedOption: function (num) {
        if (SelectMenu.activeMenu.options.length <= num) return -1;
        if (SelectMenu.activeMenu.selectedOption != null) {
            SelectMenu.activeMenu.selectedOption.removeClass('img-highlight').addClass('img-no-highlight');
        }
        SelectMenu.activeMenu.selectedOption = SelectMenu.activeMenu.options[num];
        SelectMenu.activeMenu.selectedOption.removeClass('img-no-highlight').addClass('img-highlight');
        return 0;
    },
    addIconOption: function (url, handler, addonProperties) {
        url = url || "https://image.flaticon.com/teams/1-freepik.jpg";
        var newOption = $('<img src="' + url + '" style="width: 64px; height: 64px;" class="img-no-highlight ui-li-thumb">');
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
                prevSelected.removeClass('img-highlight').addClass('img-no-highlight');
            }
            var option = $(this);
            option.removeClass('img-no-highlight').addClass('img-highlight');
            menu.selectedOption = option;
            option[0].handler(); // Trigger option-specific function
        });
        SelectMenu.activeMenu.options.push(newOption);
        SelectMenu.activeMenu.container.list.append(newOption);
    },
    toggle: function () {
        SelectMenu.activeMenu.isOpen = !SelectMenu.activeMenu.isOpen;
        if (SelectMenu.activeMenu.isOpen) {
            $('#sidenav')[0].style.width = "170px";
        }
        else {
            $('#sidenav')[0].style.width = "0px";
        }
    }
});