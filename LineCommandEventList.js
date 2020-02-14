Ext.define('LineCommandEventList',
{
    extend: 'BaseEventList',

    onLogin: function (response)
    {
        this.contact = response.getContact();
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getLineCommandEvents(), function (lineCommandEvent)
        {
            this.addEvent(lineCommandEvent.getGuid(), lineCommandEvent);
        }, this);
    }
});