if ('function' === typeof importScripts)
{
    importScripts('cxf-utils.js');
    importScripts('CaesarProxy.js');
    importScripts('ProxyAccess.js');
    importScripts('ProxyTypeDefinitions.js');
    
    self.addEventListener('message', function (e)
    {
        if (e.data && e.data.sessionId)
        {
            self._sessionID = e.data.sessionId;
            getEvents();
        } else if (e.data && e.data.visibilityState)
        {
            self.visibilityState = e.data.visibilityState;
        }
    }, false);



    function getEvents()
    {
        var self = this;
        Caesar.Access.startEventProcessing(this._sessionID, function (response)
        {
            onGetEventsSuccess(response);

        }, function (error)
            {
                if (error.status == 200)
                {
                    onGetEventsSuccess(error);
                }
                else
                {
                    onGetEventsException();
                }
            });
    };

    function onGetEventsSuccess(response)
    {
        this.callNotifications = this.callNotifications || {};

        if (response && response.OwnerCalls)
        {
            for (var i = 0; i < response.OwnerCalls.length; ++i)
            {
                var ownerCall = response.OwnerCalls[i];

                if (this.callNotifications[ownerCall.CallId])
                {
                    if (ownerCall.CallState === Caesar.CallState.Idle)
                    {
                        this.callNotifications[ownerCall.CallId].close();
                    }
                    else if (ownerCall.CallEventReason === Caesar.CallEventReason.Resolved)
                    {
                        var notification = new Notification("Anruf von", { body: ownerCall.Caller.Name + " [" + ownerCall.Number + "]" + "\r\nHier klicken, um anzunehmen", icon: "images/64/phone.png", tag: ownerCall.CallId });
                        notification.onclick = function (event)
                        {
                            var promise = Caesar.Access.cti_Answer(self._sessionID, ownerCall.CallId);
                            promise.then(function (response) { }, function () { });
                            notification.close();
                        }
                        this.callNotifications[ownerCall.CallId] = notification;
                    }
                }
                else
                {
                    if (ownerCall.CallState === Caesar.CallState.Offering)
                    {
                        if (self.visibilityState === 'hidden')
                        {
                            var notification = new Notification("Anruf von", { body: ownerCall.Number + "\r\nHier klicken, um anzunehmen", icon: "images/64/phone.png", tag: ownerCall.CallId });
                            notification.onclick = function (event)
                            {
                                var promise = Caesar.Access.cti_Answer(self._sessionID, ownerCall.CallId);
                                promise.then(function (response) { }, function () { });
                                notification.close();
                            }
                            this.callNotifications[ownerCall.CallId] = notification;
                        }
                    }
                }
                
            }
            postMessage({ type: 'onGetEventsSuccess', response: response });
        }
    };

    function onGetEventsException()
    {
        postMessage({ type: 'onGetEventsException' });
    };
}