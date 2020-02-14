Ext.define('CTIAction_Dial',
{
    extend: 'CTIAction',

    runAction: function (contact, number)
    {
        var self = this;

        if (!isValid(contact) && !isValidString(number))
        {
            return;
        }
        var successFunction = (response, number, contact) =>
        {
            this.fireSuccessfullCTIAction(response, number, contact);
            saveToDialHistory(response, number, contact);
        };

        this.beforeCTIAction();
        GLOBAL_EVENT_QUEUE.onGlobalEvent_DialForGroup(contact, number, this.groupId || -1, false, successFunction);
    },

    getOKButtonText: function ()
    {
        return LANGUAGE.getString('dial');
    },

    getClientSettingsKeyForHistory: function ()
    {
        return KEY_DIAL_HISTORY;
    }
});
