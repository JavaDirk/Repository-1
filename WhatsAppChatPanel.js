Ext.define('WhatsAppChatHeader',
{
    extend: 'LiveChatHeader',

    createImage: function ()
    {
        return Ext.create('WhatsAppImage',
        {
            contact: this.contact
        });
    },

    getName: function ()
    {
        return Ext.String.htmlEncode(this.contact.getDisplayNameForLiveChat()) + " - WhatsApp";
    }
});

Ext.define('WhatsAppMessagesPanel',
{
    extend: 'LiveChatMessagesPanel',

    plugins:
    [
        {
            ptype: 'WhatsAppViewWithPhotos'
        }
    ]
});

Ext.define('WhatsAppChatPanel', {
    extend: 'LiveChatPanel',

    needFinishChat: false,

    listeners:
    {
        beforeclose: function (liveChatPanel) 
        {
            var liveChats = liveChatPanel.liveChats;
            var lastLiveChat = liveChats[liveChats.length - 1];
            if (CURRENT_STATE_CHATS.isLiveChatFinished(lastLiveChat.liveChatId))
            {
                return true;
            }
            liveChatPanel.showConfirmationForFinishChat();
            return false;
        }
    },

    initComponent: function ()
    {
        this.titleIconBlack = this.titleIconBlack || IMAGE_LIBRARY.getImage('whatsapp', 64, COLOR_TAB_ICON_NORMAL);
        this.titleIconWhite = this.titleIconWhite || IMAGE_LIBRARY.getImage('whatsapp', 64, COLOR_TAB_ICON_SELECTED);

        this.callParent();
    },

    createHeader: function ()
    {
        var header = Ext.create('WhatsAppChatHeader',
            {
                parent: this,
                contact: this.contact,
                chatIds: this.chatIds,
                chatOffers: this.chatOffers
            });
        return header;
    },

    createChatMessagesPanel: function ()
    {
        return Ext.create('WhatsAppMessagesPanel', {
            margin: '0 0 0 0',
            flex: 1,
            contact: this.contact,
            liveChats: this.liveChats,
            chatIds: this.chatIds,
            parent: this,
            showDeleteButton: false
        });
    },

    getSendChatAliveMessages: function ()
    {
        return false;
    }
});