var IMAGE_ARROW_UP = 'images/arrow_up.png';

Ext.define(CLASS_CHANNEL_IMAGE,
{
    extend: 'Ext.Component',

    channel: null,

    parent: null,

    cls: 'channelImage',

    removeBubble: function ()
    {
        this.updateBubble(0);
    },

    updateBubble: function (badge)
    {
        if (this.data.number !== badge)
        {
            this.data.number = badge;
            this.update(this.data);
        }
    },

    initComponent: function ()
    {
        this.tpl =  '<div style="display:flex;cursor:pointer;padding:0 7px">' +
                        '<div style="font-size:13px;margin:11px 5px 10px 5px;">{name}</div>' +
                        '<tpl if="number &gt; 0">' +
                            '<div class="badge" style="margin-top:2px;">{number}</div>' +
                        '</tpl>' +
                    '</div>';

        this.data =
        {
            number: 0,
            name: this.channel.getText().toUpperCase()
        };

        this.callParent();

        var self = this;


        if (this.channel.needContactCenter() && !CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe())
        {
            this.hide();
        }

        this.on(
        {
            el:
            {
                click: function ()
                {
                    self.onClick();
                }
            }
        });

        SESSION.addListener(this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    onClick: function ()
    {
        var now = new Date();
        if (this.lastClick)
        {
            var diff = now.getTime() - this.lastClick.getTime();
            if (diff < 500)
            {
                return;
            }
        }

        GLOBAL_EVENT_QUEUE[this.getCallbackNameForGlobalEventQueue()](this.channel);
        
        this.removeBubble();

        this.lastClick = now;
    },

    getCallbackNameForGlobalEventQueue: function ()
    {
        return "onGlobalEvent_ChannelSelected";
    },

    onNewEvents: function (response)
    {
        if (this.shouldBeVisible()) 
        {
            this.show();
        }
        else 
        {
            this.hide();
        }
    },

    shouldBeVisible: function ()
    {
        if (this.channel.needContactCenter() && !CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe())
        {
            return false;
        }
        return true;
    }
});

Ext.define(CLASS_TELEPHONY_CHANNEL_IMAGE,
{
    extend: CLASS_CHANNEL_IMAGE,

    initComponent: function ()
    {
        this.callParent();
        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function ()
    {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);

        this.callParent();
    },

    onNewEvents: function (response)
    {
        if (isValid(response.getJournalEntries()) && !Ext.isEmpty(response.getJournalEntries()))
        {
            this.updateMissedCalls();
        }
    },

    onGetJournalSuccess: function (response)
    {
        this.updateMissedCalls();
    },

    updateMissedCalls: function ()
    {
        var count = CURRENT_STATE_JOURNAL.getCountMissedCalls();
        this.updateBubble(count);
    },

    getCallbackNameForGlobalEventQueue: function ()
    {
        return "onGlobalEvent_TelephoneChannelSelected";
    },

    onGlobalEvent_ResetMissedCalls: function()
    {
        SESSION.markAllJournalEntriesAsRead();
        this.updateBubble(0);
    }
});

Ext.define(CLASS_MAIL_CHANNEL_IMAGE,
{
    extend: CLASS_CHANNEL_IMAGE,

    initComponent: function ()
    {
        this.callParent();
        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    onNewEvents: function (response)
    {
        this.callParent(arguments);
        if (isValid(response, 'getMailMessagesEx()') && !Ext.isEmpty(response.getMailMessagesEx()))
        {
            this.updateMissedEmails();
        }

        if (isValid(response, 'getMailProcessingAvailability()'))
        {
            GLOBAL_EVENT_QUEUE.onGlobalEvent_MailProcessingChanged(response.getMailProcessingAvailability(), true);
        }
    },

    updateMissedEmails: function ()
    {
        var count = OPEN_REQUEST_STORE.data.length;
        this.updateBubble(count);
    },

    destroy: function ()
    {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);

        this.callParent();
    },

    onGlobalEvent_NumberMailMessagesChanged: function ()
    {
        var count = PARENT_REQUEST_STORE.getUnreadEmails();
        this.updateBubble(count);
    },

    onGlobalEvent_MailChannelSelected: function ()
    {
        this.updateBubble(0);
    },

    getCallbackNameForGlobalEventQueue: function ()
    {
        return "onGlobalEvent_MailChannelSelected";
    },

    shouldBeVisible: function ()
    {
        if (CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe() && CURRENT_STATE_CONTACT_CENTER.isMailDispatcherAvailable())
        {
            var mailGroups = CURRENT_STATE_CONTACT_CENTER.getAllMailGroups();
            return !Ext.isEmpty(mailGroups);
        }
        return false;
    }
});

Ext.define(CLASS_CHAT_CHANNEL_IMAGE,
{
    extend: CLASS_CHANNEL_IMAGE,

    initComponent: function () {
        this.callParent();
        GLOBAL_EVENT_QUEUE.addEventListener(this);
        SESSION.addListener(this);
    },

    destroy: function () {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        SESSION.removeListener(this);
        this.callParent();
    },

    onGlobalEvent_NumberChatMessagesChanged: function ()
    {
        var count = CURRENT_STATE_CHATS.getCountNewChatMessages();
        this.updateBubble(count);
    },

    getCallbackNameForGlobalEventQueue: function ()
    {
        return "onGlobalEvent_ChatChannelSelected";
    },

    onNewEvents: function (response)
    {
        if (MY_CONTACT.getRightChat() || CURRENT_STATE_CONTACT_CENTER.mayReceiveLiveChats())
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    }
});


Ext.define(CLASS_STATISTICS_CHANNEL_IMAGE,
{
    extend: CLASS_CHANNEL_IMAGE,

    getCallbackNameForGlobalEventQueue: function ()
    {
        return "onGlobalEvent_openStatistics";
    }
});

Ext.define('ChannelStatePanel',
{
    extend: 'Ext.Container',
    style: 'background-color:' + WHITE.toString(),

    layout:
    {
        type: 'hbox',
        pack: 'start'
    },

    images: {},
        
    initComponent: function ()
    {
        this.callParent();
        
        this.channels =
        [
            Ext.create(CLASS_CHANNEL_CALLS, {
            }),
            Ext.create(CLASS_CHANNEL_CONTACTS, {
            }),
            Ext.create(CLASS_CHANNEL_PARTNER_STRIP, {
            }),
            Ext.create(CLASS_CHANNEL_WEBCHATS, {
            }),
            Ext.create(CLASS_CHANNEL_EMAILS, {
            }),
            Ext.create(CLASS_CHANNEL_STATISTICS, {
            })
        ];
        
        var self = this;
        
        Ext.each(this.channels, function (channel)
        {
            if (!channel.isAllowedByTimioFeature())
            {
                return;
            }

            if (channel.getChannelImageClassName)
            {
                var channelImage = Ext.create(channel.getChannelImageClassName(),
                {
                    channel: channel,
                    parent: self
                });

                self.images[channel.getPanelClassName()] = channelImage;
                self.add(channelImage);
            }
            else
            {
                self.add(channel);
            }
        });
    },

    onTabChange: function (newCard, oldCard, classNameNewCard)
    {
        var className = classNameNewCard || getClassName(newCard);
        var image = this.images[className];

       
    },

    removeTriangleFromAllChannels: function ()
    {
      
    },

    convertChannelsToMenuItems: function ()
    {
        var result = [];
        Ext.each(this.channels, function (channel)
        {
            result.push(channel.convertToMenuItem());
        }, this);
        return result;
    }
});