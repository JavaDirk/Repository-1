Ext.define('CTIAction',
{
    extend: 'Ext.Component',

    beforeCTIAction: Ext.emptyFn,

    contact : null,
    number : "",
    addressBook: ALL_ADDRESS_BOOKS,

    searchResultsPanel: null,
    panelToHide: null,

    initComponent: function ()
    {
        this.callParent();

        this.callbacksForSuccessfullCTIAction = [];
        this.callbacksForSuccessfullSearch = [];
    },

    addCallbackForSuccessfullCTIAction: function (callback)
    {
        this.callbacksForSuccessfullCTIAction.push(callback);
    },

    addCallbackForSuccessfullSearch: function (callback)
    {
        this.callbacksForSuccessfullSearch.push(callback);
    },

    fireSuccessfullCTIAction: function ()
    {
        if (Ext.isEmpty(this.callbacksForSuccessfullCTIAction))
        {
            DEFAULT_SUCCESS_CALLBACK().apply(this, arguments);
            return;
        }
        Ext.each(this.callbacksForSuccessfullCTIAction, function (callback)
        {
            callback.apply(this, arguments);
        }, this);
    },

    fireSuccessfullSearch: function ()
    {
        if (Ext.isEmpty(this.callbacksForSuccessfullSearch))
        {
            DEFAULT_SUCCESS_CALLBACK().apply(this, arguments);
            return;
        }
        Ext.each(this.callbacksForSuccessfullSearch, function (callback)
        {
            callback.apply(this, arguments);
        }, this);
    },

    run: function ()
    {
        if (!isValidString(this.number))
        {
            console.log("CTIAction::run: No number given!");
            return;
        }

        var number = Ext.String.trim(this.number);
        this.number = this.replaceInvalidSpaces(number);

        this.runAction(this.contact, this.extractNumber(this.number));
    },

    isResolveNecessary: function ()
    {
        return !isPhoneNumber(this.number) && !this.isNameAndNumber(this.number);
    },

    replaceInvalidSpaces: function (number)
    {
        var result = number;
        result = result.replace("\u00A0", ""); // TB 8073
        result = result.replace("\u0096", ""); // TB 8078
        result = result.replace("\u0097", ""); // TB 8078
        return result;
    },

    extractNumber: function (toCheck)
    {
        var pos = toCheck.indexOf(" [");
        var pos2 = toCheck.indexOf(']');
        if (pos > 0 && pos2 > 0 && (pos + 2 < pos2))
        {
            return toCheck.substring(pos + 2, pos2);
        }
        return toCheck;
    },

    extractName: function (toCheck)
    {
        var pos = toCheck.indexOf(" [");
        if (pos > 0)
        {
            return toCheck.substring(0, pos);
        }
        return "";
    },

    isNameAndNumber: function (toCheck)
    {
        var number = this.extractNumber(toCheck);
        if (number === toCheck)
        {
            return false;
        }
            
        return isPhoneNumber(number);
    },

    isNumber: function (toCheck)
    {
        return isPhoneNumber(toCheck);
    },

    runAction: Ext.emptyFn,

    getClientSettingsKeyForHistory: function ()
    {
        return "";
    }
});

