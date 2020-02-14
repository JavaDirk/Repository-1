Ext.define('BrowserNotification',
{
    extend: 'Ext.Component',

    title: '',
    body: '',
    icon: '',
    tag: '',

    initComponent: function ()
    {
        this.callParent();

        if (!this.isPossible())
        {
            return;
        }
        
        if (Notification.permission === "granted")
        {
            this.createNotification();
        }
        else if (Notification.permission !== 'denied') 
        {
            var self = this;
            Notification.requestPermission(function (permission)
            {
                if (permission === "granted") 
                {
                    self.createNotification();
                }
            });
        }
    },

    createNotification: function ()
    {
        if (!this.isPossible())
        {
            return;
        }
        if (!isValidString(this.title) && !isValidString(this.body) && !isValidString(this.body))
        {
            return;
        }

        var config = {
            requireInteraction: true,
            body: this.body,
            icon: this.icon,
            tag: this.tag
        };
        if (this.tag)
        {
            config.renotify = true;
        }
        if (this.notification)
        {
            this.notification.close();
        }
        this.notification = new Notification(this.title, config);

        var self = this;
        this.notification.onclick = function ()
        {
            self.onClick();
        };

        window.onfocus = function ()
        {
            self.destroy();
        };
    },

    onClick: function ()
    {
        window.focus();

        this.destroy();
    },

    destroy: function ()
    {
        if (isValid(this.notification))
        {
            try
            {
                this.notification.close();
            }
            catch (exception) //für Edge nötig
            {
                console.error(exception);
            }
        }
        this.callParent();
    },

    isPossible: function ()
    {
        return window.hasOwnProperty("Notification") && TIMIO_SETTINGS.getShowBrowserNotifications();
    },

    requestBrowserNotificationPermission: function ()
    {
        if (this.isPossible())
        {
            if (Notification.permission !== 'denied')
            {
                Notification.requestPermission(function (permission)
                {

                });
            }
        }
    }
});

Ext.define('BrowserNotificationForCall',
{
    extend: 'BrowserNotification',

    callId: null,

    initComponent: function ()
    {
        SESSION.addListener(this);

        this.tag = this.callId;

        this.updateBodyAndTitle();

        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        if (lastCallEvent && lastCallEvent.isOffering())
        {
            this.callParent();
        }
    },

    updateBodyAndTitle: function ()
    {
        this.title = "";

        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        if (lastCallEvent)
        {
            if (lastCallEvent.isNumberNotKnown())
            {
                //"Rufnummer unterdrückt" ist als Text zu lang für den Titel, daher wird er nur im Body angezeigt
                this.body = LANGUAGE.getString("suppressedNumber");
                if (lastCallEvent.isIdle())
                {
                    this.title = LANGUAGE.getString("callStateEnd");
                }
            }
            else
            {
                //in der BrowserNotification sollen diesselben INfos angezeigt werden wie im CallPanel
                //daher verwenden wir diese Komponente, um uns die entsprechenden Infos zu holen
                var callerPanel = Ext.create('CallerPanel',
                {
                    contact: lastCallEvent.getCaller(),
                    initialCallEvent: lastCallEvent,
                    selectedNumber: lastCallEvent.getDisplayNumber()
                    });
                var possibleValues = callerPanel.getPossibleValues();
                if (lastCallEvent.isIdle() || lastCallEvent.isDisconnected())
                {
                    this.icon = IMAGE_LIBRARY.getImage("phone_hangUp", 64, COLOR_OVERLAY_BUTTON);
                    this.title = LANGUAGE.getString("callStateEnd");
                    this.body = getFirstValidString(possibleValues);
                    if (isValidString(getSecondValidString(possibleValues)))
                    {
                        this.body += ", " + getSecondValidString(possibleValues);
                    }
                }
                else
                {
                    this.title += getFirstValidString(possibleValues);
                    this.body = getSecondValidString(possibleValues);
                }
                
                callerPanel.destroy();
            }
        }
    },

    onNewEvents: function (response)
    {
        if (response.OwnerCalls)
        {
            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            if (lastCallEvent)
            {
                if (lastCallEvent.isOffering())
                {
                    this.updateBodyAndTitle();
                    this.createNotification();
                }
                else
                {
                    this.destroy();
                }
            }
        }
    },
        
    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    onClick: function ()
    {
        this.callParent();

        if (this.initialEvent)
        {
            GLOBAL_EVENT_QUEUE.onGlobalEvent_Answer(this.contact, this.initialEvent);
        }
    }
});

new BrowserNotification().requestBrowserNotificationPermission();