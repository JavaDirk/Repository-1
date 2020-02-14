var ID_ERROR_MESSAGE_LINE_STATE_EVENT = "errorLineStateEventOutOfService";
class GlobalCallEventListener extends GlobalEventListener
{
    onNewEvents(response)
    {
        if (response.getOwnerCalls())
        {
            console.log(response.getOwnerCalls());
        }
        Ext.each(response.getOwnerCalls(), function (ownerCallEvent)
        {
            if (ownerCallEvent.isOffering() && ownerCallEvent.getCallEventReason() === "Cti")
            {
                if (CURRENT_STATE_CALL.isIdle(ownerCallEvent.getCallId())) //kann passieren, wenn ein Schwall an CallEvents kommt, weil die Server gerade Hänger hatten
                {                                                         //dann kommt ein GetEvents zurück mit mehreren CallEvents und das letzte ist idle
                    return;
                }

                if (this.isCallNotificationAlreadyVisible(ownerCallEvent.getCallId()))
                {
                    return;
                }

                Ext.create(SESSION.isSIPMode() ? 'InCallNotificationForSIP' : 'InCallNotification',
                {
                    initialEvent: ownerCallEvent
                });
            }
        }, this);

        if (isValid(response.getLineStateEvents()))
        {
            if (CURRENT_STATE_CALL.isMyLineStateOKOrBusy()) 
            {
                removeErrorMessage(ID_ERROR_MESSAGE_LINE_STATE_EVENT);
            }
            else 
            {
                Ext.each(response.getLineStateEvents(), function (lineStateEvent) 
                {
                    if (lineStateEvent.Guid === MY_CONTACT.getGUID()) 
                    {
                        if (isValidString(lineStateEvent.ErrorText)) 
                        {
                            showErrorMessage(lineStateEvent.ErrorText, null, ID_ERROR_MESSAGE_LINE_STATE_EVENT);
                        }
                        else 
                        {
                            showErrorMessage(LANGUAGE.getString("lineStateOutOfService", LANGUAGE.getString(SESSION.isSIPMode() ? "softphone" : 'telephony')), null, ID_ERROR_MESSAGE_LINE_STATE_EVENT);
                        }
                    }
                }, this);
            }
        }
    }

    isCallNotificationAlreadyVisible(callId)
    {
        var callNotifications = Ext.Array.filter(NOTIFICATION_WINDOW, function (notification)
        {
            return notification.callId === callId;
        }, this);
        return !Ext.isEmpty(callNotifications);
    }
}