Ext.define('CTIAction_BlindTransfer',
{
    extend: 'CTIAction',

    callId: 0,

    runAction: function (contact, number)
    {
        this.beforeCTIAction();

        var successCallback = DEFAULT_SUCCESS_CALLBACK((response, callId, number, contact) =>
        {
            saveToTransferHistory(response, number, contact);
        }, null);
        var errorCallback = DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorTransfer"), null);

        SESSION.blindTransfer(this.callId, number, successCallback, errorCallback, contact);
    },

    getOKButtonText: function ()
    {
        return LANGUAGE.getString('blindTransfer');
    },

    getClientSettingsKeyForHistory: function ()
    {
        return KEY_TRANSFER_HISTORY;
    }
});


