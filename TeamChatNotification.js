Ext.define('TeamChatNotification', {
    extend: 'ChatNotification',

    teamChatRoom: null,

    icon: 'chats',

    numberNewMessages: 1,

    initComponent: function ()
    {
        this.mainMessage = this.messageForBrowserNotification = this.createMessage();
        this.callParent();
    },
    
    createTitle: function ()
    {
        return LANGUAGE.getString("newTeamChatMessage");
    },
    
    createInformationContainer: function ()
    {
        return Ext.create('InformationContainerForTeamChat',
            {
                teamChatRoom: this.teamChatRoom
            });
    },

    createButtonsForLeftSide: function ()
    {
        return [];
    },

    onClickedStartChat: function ()
    {
        var self = this;
        self.hide();

        var teamChatRoom = self.teamChatRoom;
        Ext.asap(function ()
        {
            GLOBAL_EVENT_QUEUE.onGlobalEvent_openTeamChatOrBlackBoard(teamChatRoom);
        });
    },


    createBrowserNotification: function ()
    {
        if (!isValid(this.teamChatRoom))
        {
            return null;
        }

        return Ext.create('BrowserNotification',
            {
                title: LANGUAGE.getString("teamChat"),
                body: this.messageForBrowserNotification || this.mainMessage || "",
                icon: IMAGE_LIBRARY.getImage(this.icon, 64, WHITE)
            });
    },

    updateNotification: function ()
    {
        this.numberNewMessages++;

        this.mainMessage = this.createMessage();
        
        this.showMainMessage();

        var self = this;
        Ext.asap(function ()
        {
            self.playSound();
        });
    },

    createMessage: function()
    {
        if (this.numberNewMessages === 1)
        {
            if (isValid(this.teamChatInfo))
            {
                var messages = this.teamChatInfo.getMessages();
                if (messages.length === 1)
                {
                    return messages[0].getText();
                }
                return LANGUAGE.getString("newTeamChatMessagesArrived", messages.length);
            }
        }
        else
        {
            return LANGUAGE.getString("newTeamChatMessagesArrived", this.numberNewMessages);
        }
    },

    onGlobalEvent_openTeamChat: function (teamChat)
    {
        if (teamChat.getGuid() === this.teamChatRoom.getGuid())
        {
            this.hide();
        }
    }
});