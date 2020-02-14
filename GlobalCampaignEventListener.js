class GlobalCampaignEventListener extends GlobalEventListener
{
    constructor()
    {
        super();
        this.notifiers = {};
    }

    onNewEvents(response)
    {
        Ext.each(response.getCloseNotifierForCampaignEvents(), function (closeNotifierEvent)
        {
            this.hideNotifier(closeNotifierEvent.getCallRequestId());
        }, this);

        Ext.each(response.getCampaignCallRequests(), function (callRequest)
        {
            this.showNotifier(callRequest);
        }, this);

        Ext.each(response.getInitiateCampaignCall(), function (initiateEvent)
        {
            SESSION.makeCallForCampaign(initiateEvent.getCampaign(), (response) =>
            {
                if (response.getReturnValue().getCode() !== 0)
                {
                    showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            }, () =>
            {
                    showErrorMessage(LANGUAGE.getString("errorMakeCallForCampaign"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            });
        }, this);
    }

    showNotifier(callRequest)
    {
        var notification = Ext.create('CampaignNotification',
        {
            callRequest: callRequest,
            listeners:
            {
                hide: () =>
                {
                    this.hideNotifier(callRequest.getCallRequestId());
                }
            }
        });

        this.notifiers[callRequest.getCallRequestId()] = notification;
    }

    hideNotifier(campaignCallId)
    {
        var notifier = this.notifiers[campaignCallId];
        if (notifier)
        {
            notifier.hide();
        }
        
        delete this.notifiers[campaignCallId];
    }
}
