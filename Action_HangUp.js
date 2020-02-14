Ext.define('Action_HangUp',
{
    extend: 'Action_Call',

    run: function ()
    {
        var callId = isValid(this.callPanel) ? this.callPanel.callId : this.lastCallEvent.callId;
        SESSION.hangUp(callId, DEFAULT_SUCCESS_CALLBACK(Ext.emptyFn, Ext.emptyFn), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorHangUp"), Ext.emptyFn));
    },

    getIconName: function ()
    {
        return "phone_hangUp";
    }
});