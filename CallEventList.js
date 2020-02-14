Ext.define('CallEventList',
{
    extend: 'BaseEventList',

    onNewEvents: function (response)
    {
        Ext.each(response.getOwnerCalls(), function (callEvent)
        {
            this.saveDateForLineTime(callEvent);
            this.addEvent(callEvent.getCallId(), callEvent);
        }, this);
    },

    saveDateForLineTime: function (callEvent)
    {
        var previousCallEvent = this.getEvent(callEvent.getCallId());
        if (isValid(previousCallEvent, "lineTimeDate"))
        {
            callEvent.lineTimeDate = previousCallEvent.lineTimeDate;
            return;
        }
        if (callEvent.isConnected() || callEvent.isOnHold() || callEvent.isConferenced()) 
        {
            var lineTimeDate = new Date();
            lineTimeDate.setSeconds(lineTimeDate.getSeconds() - callEvent.getLineTime());

            callEvent.lineTimeDate = lineTimeDate;
        }
    },

    getLastCallEventForGUID: function (guid)
    {
        var lastCallEvent;
        if (!isValidString(guid))
        {
            return null;
        }

        Ext.iterate(this.events, function (callId, event)
        {
            if (event.getOwner() === guid)
            {
                lastCallEvent = event;
            }
        });
        return lastCallEvent;
    }
});