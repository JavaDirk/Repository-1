Ext.define('LoadPreviousMessagesButton',
{
    extend: 'RoundThinButton',

    iconName: 'reload',
    color: WHITE,
    cls: [HIGHLIGHTED_ROUND_THIN_BUTTON, ROUND_THIN_BUTTON],
    scale: 'medium',
    isFirstButton: true,
    hidden: true,

    firstMessageId: "",

    initComponent: function ()
    {
        this.text = this.text || LANGUAGE.getString("loadPreviousMessages");
        this.renderTo = this.getParentElement();

        this.callParent();

        if (this.response)
        {
            this.updateVisibilityAndFirstMessageId(this.response);
        }

        this.on('click', function ()
        {
            this.showLoadingMask();

            this.loadPreviousMessages();
        }, this);

        SESSION.addListener(this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    getParentElement: function ()
    {
        return this.parent.el.down('.loadPreviousMessagesButton');
    },

    getFirstMessageId: function (response)
    {
        var messages = response.getMessages(this.getGuid());
        if (Ext.isEmpty(messages))
        {
            return;
        }
        var firstMessage = messages[0];
        return firstMessage.getMessageId();
    },

    updateVisibility: function (response)
    {
        this.setVisible(response.arePreviousMessagesAvailable());
    },

    //@override
    loadPreviousMessages: function ()
    {
        
    },

    onGetChatHistorySuccess: function (response, guid, lastKnownMessageId)
    {
        if (!this.isForRightGuid(guid))
        {
            return;
        }

        this.hideLoadingMask();

        if (response.getReturnValue().getCode() === 0)
        {
            this.updateVisibilityAndFirstMessageId(response);
        }
    },

    onGetChatHistoryException: function (guid)
    {
        if (!this.isForRightGuid(guid))
        {
            return;
        }

        this.hideLoadingMask();
    },

    updateVisibilityAndFirstMessageId: function (response)
    {
        this.firstMessageId = this.getFirstMessageId(response);

        this.updateVisibility(response);
    },

    isForRightGuid: function (guid)
    {
        return guid === this.getGuid();
    }
});

Ext.define('LoadPreviousMessagesButtonForUserChat',
{
    extend: 'LoadPreviousMessagesButton',

    contact: null,
    parent: null,

    loadPreviousMessages: function ()
    {
        SESSION.getChatHistoryForUser(this.contact.getGUID(), this.firstMessageId);
    },

    onGetChatHistoryForUserSuccess: function (response, guid, lastKnownMessageId)
    {
        this.onGetChatHistorySuccess(response, guid, lastKnownMessageId);
    },

    onGetChatHistoryForUserException: function (guid)
    {
        this.onGetChatHistoryException(guid);
    },

    getGuid: function ()
    {
        return this.contact.getGUID();
    },

    onDeleteChatHistorySuccess: function (response, GUID, item)
    {
        if (response.getReturnValue().getCode() === 0 && GUID === this.getGuid())
        {
            this.hide();
        }
    }
});

Ext.define('LoadPreviousMessagesButtonForMediaListUserChat',
{
    extend: 'LoadPreviousMessagesButtonForUserChat',

    initComponent: function ()
    {
        this.text = LANGUAGE.getString("loadPreviousMedia");
        this.callParent();
    },

    loadPreviousMessages: function ()
    {
        SESSION.getMediaListForUserChat(this.getGuid(), this.firstMessageId);
    },

    onGetMediaListForUserChatSuccess: function (response, guid, lastKnownMessageId)
    {
        this.onGetChatHistorySuccess(response, guid, lastKnownMessageId);
    },

    onGetMediaListForUserChatException: function (guid)
    {
        this.onGetChatHistoryException(guid);
    },

    onGetChatHistoryForUserSuccess: function (response, guid, lastKnownMessageId)
    {
        
    },

    onGetChatHistoryForUserException: function (guid)
    {
        
    }
});

Ext.define('LoadPreviousMessagesButtonForTeamChat',
{
    extend: 'LoadPreviousMessagesButton',

    teamChat: null,
    parent: null,

    loadPreviousMessages: function ()
    {
        SESSION.getTeamChatRoomHistory(this.getGuid(), this.firstMessageId);
    },

    onGetTeamChatRoomHistorySuccess: function (response, guid, lastKnownMessageId)
    {
        this.onGetChatHistorySuccess(response, guid, lastKnownMessageId);
    },

    onGetTeamChatRoomHistoryException: function (guid)
    {
        this.onGetChatHistoryException(guid);
    },

    getGuid: function ()
    {
        return this.teamChat.getGuid();
    },

    onDeleteTeamChatHistorySuccess: function (response, guid)
    {
        if (response.getReturnValue().getCode() === 0 && guid === this.getGuid())
        {
            this.hide();
        }
    }
});

Ext.define('LoadPreviousMessagesButtonForMediaListTeamChat',
{
    extend: 'LoadPreviousMessagesButtonForTeamChat',

    initComponent: function ()
    {
        this.text = LANGUAGE.getString("loadPreviousMedia");
        this.callParent();
    },

    loadPreviousMessages: function ()
    {
        SESSION.getMediaListForTeamChat(this.getGuid(), this.firstMessageId);
    },

    onGetMediaListForTeamChatSuccess: function (response, guid, lastKnownMessageId)
    {
        this.onGetChatHistorySuccess(response, guid, lastKnownMessageId);
    },

    onGetMediaListForTeamChatException: function (guid)
    {
        this.onGetChatHistoryException(guid);
    },

    onGetTeamChatRoomHistorySuccess: function (response, guid, lastKnownMessageId)
    {
    
    },

    onGetTeamChatRoomHistoryException: function (guid)
    {
    
    }
});
