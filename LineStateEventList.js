Ext.define('LineStateEventList',
{
    extend: 'BaseEventList',

    onLogin: function (response)
    {
        this.contact = response.getContact();
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getLineStateEvents(), function (lineStateEvent)
        {
            this.addEvent(lineStateEvent.getGuid(), lineStateEvent);
        }, this);
    },

    isMyLineStateOKOrBusy: function ()
    {
        return this.isMyLineStateOK() || this.isMyLineStateBusy();
    },

    isMyLineStateOK: function ()
    {
        return this.isMyLineState(["", "InService"]);
    },

    isLineStateOK: function (guid)
    {
        return this.isLineState(["", "InService"], guid);
    },

    isMyLineStateBusy: function ()
    {
        return this.isMyLineState("Busy");
    },

    isLineStateBusy: function (guid)
    {
        return this.isLineState("Busy", guid);
    },

    isMyLineState: function (lineStates)
    {
        if (isValid(this, "contact.getGUID"))
        {
            return this.isLineState(lineStates, this.contact.getGUID());
        }
        return true;
    },

    isLineState: function (lineStates, guid)
    {
        if (!Ext.isArray(lineStates))
        {
            lineStates = [lineStates];
        }
        var currentLineState = this.getLineState(guid);
        return Ext.Array.contains(lineStates, currentLineState);
    },

    getLineState: function (guid)
    {
        var lineStateEvent = this.getEvent(guid);
        if (isValid(lineStateEvent))
        {
            return lineStateEvent.getLineState();
        }
        return "";
    }
});