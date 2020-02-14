Ext.define('CTIAction_Diversion',
{
    extend: 'CTIAction',

    lineId: 0,

    runAction: function (contact, number)
    {
        this.beforeCTIAction();

        SESSION.addListener(this);
        SESSION.setCallDiversion(number, contact, this.lineId);
    },

    destroy: function ()
    {
        
        this.callParent();
    },

    onSetCallDiversionSuccess: function (response, destination, contact)
    {
        saveToCallDiversionHistory(response, destination, contact);
        SESSION.removeListener(this);
    },

    onSetCallDiversionException: function (destination, contact)
    {
        this.exceptionCallback(LANGUAGE.getString("errorSetDiversion"));
        SESSION.removeListener(this);
    },

    getOKButtonText: function ()
    {
        return LANGUAGE.getString('setCallDiversion');
    },

    getClientSettingsKeyForHistory: function ()
    {
        return KEY_CALL_DIVERSION_HISTORY;
    }
});
