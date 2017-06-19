
var HistoryManager = Class({
    initialize: function () {
        this.undoActions = {};
        this.undoList = [];
        this.redoList = [];
    },
    registerUndoAction: function (actionName, undoCallback, redoCallback, externalProperties) {
        if (actionName === undefined || typeof actionName !== 'string') console.warn(
            'History Manager (' + this + '): Undoable action could not be registered because "'
            + actionName + '" is an invalid name. It must be of type string.');
        else if (undoCallback === undefined || typeof undoCallback !== 'function') console.warn(
            'History Manager (' + this + '): Undoable action of name "' + actionName
            + '" could not be registered because undoCallback function provided ('
            + undoCallback + ') is invalid.');
        else if (redoCallback === undefined || typeof redoCallback !== 'function') console.warn(
            'History Manager (' + this + '): Undoable action of name "' + actionName
            + '" could not be registered because redoCallback function provided ('
            + redoCallback + ') is invalid.');
        else {
            externalProperties = externalProperties || {}; // Make it an object if undefined
            if (externalProperties === null || typeof externalProperties !== 'object') console.warn(
                'History Manager (' + this + '): Undoable action of name "' + actionName
                + '" could not be registered because externalProperties provided ('
                + externalProperties + ') is invalid. It must be a non-null object or undefined.');
            else {
                if (this.undoActions[actionName] !== undefined) {
                    console.log(
                        'History Manager (' + this + '): Undoable action of name "' + actionName
                        + '" has been overriden. Please be sure this is what was expected.');
                }
                this.undoActions[actionName] = {
                    'undoCallback': undoCallback,
                    'redoCallback': redoCallback,
                    'extern': externalProperties
                };
            }
        }
    },
    pushUndoAction: function (actionName, savedParams) {
        if (this.undoActions[actionName] !== undefined) { // Validate action
            savedParams = savedParams || {}; // Make it an object if undefined
            if (typeof savedParams === 'object') {
                this.undoList.push({
                    'actionName': actionName,
                    'params': savedParams
                });
                this.redoList = [];
            }
        }
        else console.warn(
            'History Manager (' + this + '): Requested undoable action "'
            + actionName + '" could not be pushed because it is undefined.');
    },
    undoAction: function () {
        if (this.undoList.length > 0) {
            var undo = this.undoList.pop();
            this.redoList.push(undo);
            var action = this.undoActions[undo.actionName];
            action.undoCallback(undo.params);
        }
    },
    redoAction: function () {
        if (this.redoList.length > 0) {
            var redo = this.redoList.pop();
            this.undoList.push(redo);
            var action = this.undoActions[redo.actionName];
            action.redoCallback(redo.params);
        }
    }
});