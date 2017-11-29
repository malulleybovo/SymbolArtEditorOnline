const SymbolPicker = function () {
    $('canvas').bind('dblclick', function (e) {
        let editor = $('canvas')[0].editor;
        let layers = editor.layers;
        let pos = new PIXI.Point(e.offsetX, e.offsetY);
        console.log('Pick %o %o', pos.x, pos.y);
        let matches = 0;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].quad.containsPoint(pos)) {
                matches++;
                if (typeof SymbolPicker.lastMatch !== 'number'
                    || matches > SymbolPicker.lastMatch) {

                    let $layerDOM = $('#' + layers[i].layer.ID);
                    $layerDOM.filter("li");
                    console.log('Raycast on pos=%O: got symbol=%O from node=%O',
                        pos, layers[i].layer, $layerDOM);
                    $layerDOM.click();
                    list.scrollActiveIntoView();

                    SymbolPicker.tempX = e.offsetX;
                    SymbolPicker.tempY = e.offsetY;
                    SymbolPicker.lastMatch = matches;

                    $('canvas').bind('mousemove.symbolPicked', function (e) {
                        if (typeof SymbolPicker.tempX !== 'number'
                            || typeof SymbolPicker.tempY !== 'number'
                            || Math.abs(e.offsetX - SymbolPicker.tempX) > SymbolPicker.tolerance
                            || Math.abs(e.offsetY - SymbolPicker.tempY) > SymbolPicker.tolerance) {

                            SymbolPicker.tempX = undefined;
                            SymbolPicker.tempY = undefined;
                            SymbolPicker.lastMatch = undefined;
                            $('canvas').unbind('mousemove.symbolPicked');
                            console.log('Resetted symbol picker.')
                        }
                    });

                    break;
                }
            }
        }
    });
};

SymbolPicker.tolerance = 5;
Object.defineProperty(SymbolPicker, "tolerance", {
    writable: false
});
