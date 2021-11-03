/**
 * Symbol Art Editor
 * 
 * @author malulleybovo (since 2021)
 * @license GNU General Public License v3.0
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2021  Arthur Malulley B. de O.
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

class FileUtils {

    static _busy = false;

    static _onFocusListener = () => {
        FileUtils._busy = false;
        $(document).off('focus', FileUtils._onFocusListener);
    }

    static requestToImportFile({ withSupportedExtension = [], onSuccess, onFailure }) {
        if (FileUtils._busy) return;
        if (!Array.isArray(withSupportedExtension)) {
            onFailure();
            return;
        }
        FileUtils._busy = true;
        setTimeout(_ => {
            FileUtils._busy = false;
        }, 1000);
        withSupportedExtension = withSupportedExtension
            .filter(a => typeof a === 'string')
            .map(a => {
                return a.startsWith('.') ? a.toLowerCase() : ('.' + a.toLowerCase())
            });
        let fileInput = $(`<input type="file" class="hidden">`);
        fileInput.attr('accept', withSupportedExtension.reduce((a, b) => a + ',' + b));
        $(document).on('focus', FileUtils._onFocusListener);
        fileInput.change((event) => {
            if (!event || !event.target
                || !event.target.files
                || !event.target.files[0]
                || !event.target.files[0].name) {
                FileUtils._busy = false;
                onFailure();
                return;
            }
            let fileData = event.target.files[0];
            let extension = fileData.name.split('.').slice(1).reduce((a, b) => (a ? a : '') + '.' + b).toLowerCase();
            if (!withSupportedExtension.includes('.' + extension)) {
                FileUtils._busy = false;
                onFailure();
                return;
            }
            let reader = new FileReader();
            reader.onloadend = (event) => {
                FileUtils._busy = false;
                let fileDataArrayBuffer = event.target.result;
                onSuccess(fileDataArrayBuffer, extension);
            }
            reader.readAsArrayBuffer(fileData);
            reader.onerror = (event) => {
                FileUtils._busy = false;
                onFailure();
            }
        });
        fileInput.click();
    }

    static prepareForFileDrop({ withSupportedExtension = [], onSuccess, onFailure }) {
        $("html").on("dragover", event => {
            event.preventDefault();
            event.stopPropagation();
        });
        $("html").on("drop", event => {
            event.preventDefault();
            event.stopPropagation();
            if (FileUtils._busy) return;
            if (!Array.isArray(withSupportedExtension)) {
                onFailure();
                return;
            }
            withSupportedExtension = withSupportedExtension
                .filter(a => typeof a === 'string')
                .map(a => {
                    return a.startsWith('.') ? a.toLowerCase() : ('.' + a.toLowerCase())
                });
            let dataTransfer = event.dataTransfer || event.originalEvent.dataTransfer;
            if (!dataTransfer) {
                onFailure();
                return;
            }
            let fileData = null;
            if (dataTransfer.items) {
                for (var i = 0; i < dataTransfer.items.length; i++) {
                    if (dataTransfer.items[i].kind === 'file') {
                        fileData = dataTransfer.items[i].getAsFile();
                        break;
                    }
                }
            } else if (dataTransfer.files) {
                for (var i = 0; i < dataTransfer.files.length; i++) {
                    fileData = dataTransfer.files[i];
                    break;
                }
            }
            if (!(fileData instanceof File)) {
                onFailure();
                return;
            }
            let extension = fileData.name.split('.').slice(1).reduce((a, b) => (a ? a : '') + '.' + b).toLowerCase();
            if (!withSupportedExtension.includes('.' + extension)) {
                onFailure(extension);
                return;
            }
            FileUtils._busy = true;
            let reader = new FileReader();
            reader.onloadend = (event) => {
                FileUtils._busy = false;
                let fileDataArrayBuffer = event.target.result;
                onSuccess(fileDataArrayBuffer, extension);
            }
            reader.readAsArrayBuffer(fileData);
            reader.onerror = (event) => {
                FileUtils._busy = false;
                onFailure();
            }
        });
    }

}
