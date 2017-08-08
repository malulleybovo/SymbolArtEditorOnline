
var HistoryManager = Class({
    initialize: function () {
        this.historyStackSize = 100;
        this.undoActions = {};
        this.undoList = [];
        this.redoList = [];
        this.pushID = 0;
    },
    registerUndoAction: function (actionName, undoCallback, redoCallback, reqParams, externalProperties) {
        if (actionName === undefined || typeof actionName !== 'string') console.warn(
            '%cHistory Manager (%O):%c Undoable action could not be registered because '
            + '"%O" is an invalid name. It must be of type string.',
            'color: #a6cd94', this, 'color: #d5d5d5', actionName);
        else if (undoCallback === undefined || typeof undoCallback !== 'function') console.warn(
            '%cHistory Manager (%O):%c Undoable action of name "' + actionName
            + '" could not be registered because undoCallback function provided (%O) is invalid.',
            'color: #a6cd94', this, 'color: #d5d5d5', undoCallback);
        else if (redoCallback === undefined || typeof redoCallback !== 'function') console.warn(
            '%cHistory Manager (%O):%c Undoable action of name "' + actionName
            + '" could not be registered because redoCallback function provided (%O) is invalid.',
            'color: #a6cd94', this, 'color: #d5d5d5', redoCallback);
        else {
            reqParams = reqParams || []; // Make it a list if undefined
            for (var i = 0; i < reqParams.length; i++) {
                if (reqParams[i] === null || typeof reqParams[i] !== 'string') {
                    console.warn(
                    '%cHistory Manager (%O):%c Undoable action of name "' + actionName
                    + '" could not be registered because the reqParams value provided (%O) is not a string.',
                    'color: #a6cd94', this, 'color: #d5d5d5', reqParams[i]);
                    return;
                }
            }
            externalProperties = externalProperties || {}; // Make it an object if undefined
            if (externalProperties === null || typeof externalProperties !== 'object') console.warn(
                '%cHistory Manager (%O):%c Undoable action of name "' + actionName
                + '" could not be registered because externalProperties provided (%O) is invalid. '
                + 'It must be a non-null object or undefined.',
                'color: #a6cd94', this, 'color: #d5d5d5', externalProperties);
            else {
                if (this.undoActions[actionName] !== undefined) {
                    console.log(
                        '%cHistory Manager (%O):%c Undoable action of name "' + actionName
                        + '" has been overriden. Please be sure this is what was expected.',
                        'color: #a6cd94', this, 'color: #d5d5d5');
                }
                this.undoActions[actionName] = {
                    'undoCallback': undoCallback,
                    'redoCallback': redoCallback,
                    'extern': externalProperties,
                    'reqParams': reqParams
                };
            }
        }
    },
    pushUndoAction: function (actionName, savedParams) {
        if (this.undoActions[actionName] !== undefined) { // Validate action
            savedParams = savedParams || {}; // Make it an object if undefined
            var checks = 0;
            for (var prop in savedParams) {
                if (this.undoActions[actionName].reqParams.includes(prop)) {
                    checks++;
                }
            }
            if (checks != this.undoActions[actionName].reqParams.length) {
                console.warn(
                    '%cHistory Manager (%O):%c Requested undoable action "' + actionName
                    + '" could not be pushed because it was not provided all required parameters: ['
                    + this.undoActions[actionName].reqParams + '].',
                    'color: #a6cd94', this, 'color: #d5d5d5');
                return;
            }
            if (typeof savedParams === 'object') {
                if (this.undoList.length >= this.historyStackSize) {
                    console.log(
                        '%cHistory Manager:%c History stack is full. Discarding oldest action saved.',
                        'color: #a6cd94', 'color: #d5d5d5');
                    this.undoList.shift();
                }
                this.pushID++;
                this.undoList.push({
                    'ID': this.pushID,
                    'actionName': actionName,
                    'params': savedParams
                });
                this.redoList = [];
            }
        }
        else console.warn(
            '%cHistory Manager (%O):%c Requested undoable action "' + actionName
            + '" could not be pushed because it is undefined.',
            'color: #a6cd94', this, 'color: #d5d5d5');
    },
    undoAction: function () {
        if (this.undoList.length > 0) {
            var undo = this.undoList.pop();
            this.redoList.push(undo);
            var action = this.undoActions[undo.actionName];
            try {
                action.undoCallback(undo.params);
                console.log('%cHistory Manager:%c Undid ' + undo.actionName + ' action.',
                    'color: #a6cd94', 'color: #d5d5d5');
            }
            catch (err) {
                console.log('%cHistory Manager (%O):%c Could not undo ' + undo.actionName
                    + ' action. Reverting attempt . . .\nError:',
                    'color: #a6cd94', this, 'color: #d5d5d5');
                console.log(err);
                this.undoList.push(this.redoList.pop());
            }
        }
    },
    redoAction: function () {
        if (this.redoList.length > 0) {
            var redo = this.redoList.pop();
            this.undoList.push(redo);
            var action = this.undoActions[redo.actionName];
            try {
                action.redoCallback(redo.params);
                console.log('%cHistory Manager:%c Redid ' + redo.actionName + ' action.',
                    'color: #a6cd94', 'color: #d5d5d5');
            }
            catch (err) {
                console.log('%cHistory Manager (%O):%c Could not redo ' + redo.actionName
                    + ' action. Reverting attempt . . .\nError:',
                    'color: #a6cd94', this, 'color: #d5d5d5');
                console.log(err);
                this.redoList.push(this.undoList.pop());
            }
        }
    },
    clear: function () {
        this.undoList = [];
        this.redoList = [];
    }
});