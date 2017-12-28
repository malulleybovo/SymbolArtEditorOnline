
function gotoNextElem() {
    let test = list.selectedElem.parentNode;
    if (test.tagName == 'H2') test = test.parentNode;
    let next = $(test).next();
    if (next.length == 0) return;

    if (next[0].tagName == 'DIV') next = $(next[0].firstChild);
    next.click();
    list.scrollActiveIntoView();
}

function gotoPrevElem() {
    let test = list.selectedElem.parentNode;
    if (test.tagName == 'H2') test = test.parentNode;
    let next = $(test).prev();
    if (next.length == 0) return;

    if (next[0].tagName == 'DIV') next = $(next[0].firstChild);
    next.click();
    list.scrollActiveIntoView();
}

function goIntoFolder() {
    let test = list.selectedElem.parentNode;
    if (test.tagName == 'H2') test = test.parentNode;
    let next = $(test);
    if (next.length == 0) return;

    if (next[0].tagName != 'DIV') return;
    if (next.hasClass('ui-collapsible-collapsed')) $(next[0].firstChild).click();
    next = $(next.find('.ui-listview')[0]);
    if (next.length == 0) return;
    next = $(next[0].firstChild);
    if (next.length == 0) return;
    if (next[0].tagName == 'DIV') {
        next = $(next[0].firstChild);
        if (next.length == 0 || next[0].tagName != 'H2') return;
    }
    next.click();
    list.scrollActiveIntoView();
}

function goOutOfFolder() {
    let test = list.selectedElem.parentNode;
    if (test.tagName == 'H2') test = test.parentNode;
    let next = $(test).parent().parent().parent();
    if (next.length == 0 || next[0].tagName != 'DIV') return;
    else next = $(next[0].firstChild);
    if (next.length == 0 || next[0].tagName != 'H2') return;
    next.click();
    list.scrollActiveIntoView();
}

function setupLayerManKeyNavigator() {
    $('body').bind('keydown',
        function (e) {
            switch (e.keyCode) {
                case 37: goOutOfFolder(); break;
                case 38: gotoPrevElem(); break;
                case 39: goIntoFolder(); break;
                case 40: gotoNextElem(); break;
            }
        });
}