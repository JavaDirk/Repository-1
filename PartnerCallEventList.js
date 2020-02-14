Ext.define('PartnerCallEventList',
{
    extend: 'CallEventList',

    onNewEvents: function (response)
    {
        Ext.each(response.getPartnerCalls(), function (callEvent)
        {
            this.saveDateForLineTime(callEvent);
            this.addEvent(callEvent.getOwner(), callEvent);

            if (callEvent.isIdle())
            {
                this.deleteEvent(callEvent.getOwner());
            }
        }, this);
    },

    getLastCallEventForGUID: function (guid)
    {
        if (!isValidString(guid))
        {
            return null;
        }
        return this.events[guid];
    }
});