Ext.define('MediaList',
{
    extend: 'Ext.view.View',

    overItemCls: 'viewOnHover',
    selectedItemCls: 'selectedEntry',
    border: false,

    style: 'background-color:' + MEDIA_LIST_BACKGROUND_COLOR,
    flex: 1,
    scrollable: 'vertical',

    initComponent: function ()
    {
        this.tpl = this.getTemplate();
        this.store = Ext.create('Ext.data.Store',
            {
                model: 'ChatEntry'
            });

        this.itemSelector = 'div.chatMessage';
        this.callParent();

        this.on('boxready', function ()
        {
            this.onExpand();
        }, this);

        this.on('destroy', function ()
        {
            SESSION.removeListener(this);

            if (this.loadPreviousMessagesButton)
            {
                this.loadPreviousMessagesButton.destroy();
            }
        }, this);
    },

    onExpand: function ()
    {
        this.startLoading();

        this.getEl().on('click', function (event, node)
        {
            var record = event.record;
            if (!isValid(record))
            {
                return;
            }

            this.onClick(record.data);
        }, this);
    },

    startLoading: function ()
    {
        SESSION.addListener(this);
        this.loadMediaList();

        showBlackLoadingMask(this);
    },

    loadMediaList: function (lastMessageId)
    {
        this.loadMediaListForGuid(this.getGuid(), lastMessageId);
    },

    //@override
    loadMediaListForGuid: function (guid, lastMessageId)
    {
        
    },

    onNewMediaUploaded: function (record)
    {
        this.getStore().add(record.data.originalMessage);
        this.scrollToBottom();
    },

    onGetMediaListSuccess: function (response, guid, lastMessageId)
    {
        if (!this.isForMyGuid(guid))
        {
            return;
        }

        hideLoadingMask(this);

        if (response.getReturnValue().getCode() === 0)
        {
            this.lastGetMediaListResponse = response;

            var messages = response.getMessages(this.getGuid());
            this.getStore().insert(0, messages);
            
            if (Ext.isEmpty(messages))
            {
                this.setEmptyText(LANGUAGE.getString("noMediaAvailable"));
            }
            if (!isValidString(lastMessageId))
            {
                this.scrollToBottom();
            }

            if (!this.loadPreviousMessagesButton)
            {
                this.addLoadPreviousMessagesButton(response);
            }
        }
        else
        {
            this.setEmptyText(response.getReturnValue().getDescription());
        }
    },

    onGetMediaListException: function (guid, lastMessageId)
    {
        if (!this.isForMyGuid(guid))
        {
            return;
        }

        hideLoadingMask(this);
        this.setEmptyText(LANGUAGE.getString("errorGetMediaList"));
    },

    scrollToBottom: function ()
    {
        Ext.asap(() =>
        {
            this.scroll('b', Infinity);
        }, this);
    },

    scroll: function (direction, numberPixel)
    {
        if (!this.isStateOk())
        {
            return;
        }
        
        this.getEl().scroll(direction, numberPixel);
    },

    addLoadPreviousMessagesButton: function (response)
    {
        if (this.loadPreviousMessagesButton)
        {
            this.loadPreviousMessagesButton.destroy();
        }
        this.createLoadPreviousMessagesButton(response);
    },

    //@override
    createLoadPreviousMessagesButton: function ()
    {
        
    },

    getLastKnownMessageId: function ()
    {
        var record = this.getStore().getAt(0);
        if (isValid(record))
        {
            return record.data.getMessageId();
        }
        return "";
    },
    
    setEmptyText: function (text)
    {
        this.callParent(['<div style="display:flex;flex:1;justify-content:center;">' + text + '</div>']);
    },

    //@override
    onClick: function (chatMessage)
    {

    },
    
    getTemplate: function ()
    {
        return new ChatTemplate(
                    '<div class="loadPreviousMessagesButton" style="display:flex;justify-content:center;"></div>' +
                    '<tpl for=".">' +
                        '<div class="chatMessage" style="display:flex;flex-direction:column;flex:1;padding:0 5px 10px 0px">' +
                            '<div style="display:flex;flex-direction:row;padding-left:5px">' +
                                '<div style="">{[this.getFullDateAsString(values)]}</div>' +
                                '<div style="align-self:center;flex:1;height:1px;margin:0 5px 0 15px;background-color:' + BORDER_GREY + '"></div>' +
                            '</div>' +
                            '<tpl if="values.getAttachments() && values.getAttachments().length &gt; 0">' +
                                '<div class="chatAttachments" style="flex-direction:column">' +
                                    '<tpl for="values.getAttachments()">' +
                                        '<div style="margin-bottom:5px;display:flex;flex-direction:row;align-items:center;padding-left:5px;cursor:pointer">' +
                                            HTML_FOR_ATTACHMENT +
                                            '<div style="flex:1;margin-left:10px;word-break:break-all">{[this.getFileName(values)]}</div>'+
                                            '<div style="margin:0 10px 0 5px">{[this.getDisplayFileSize(values)]}</div>'+
                                        '</div>' +
                                    '</tpl>' +
                                '</div>' +
                            '</tpl>' +
                        '</div>' +
                '</tpl>',
            {
                parentView: this,

                getFullDateAsString: function (chatMessage)
                {
                    var date = new Date(chatMessage.getTime());
                    return formatDateString(date) + " " + formatTimeString(date);
                }
            });
    },

    refresh: function ()
    {
        this.callParent(arguments);

        this.addLoadPreviousMessagesButton(this.lastGetMediaListResponse);
    },

    isForMyGuid: function (guid)
    {
        return this.getGuid() === guid;
    },

    //@override
    getGuid: function ()
    {

    },

    onNewEvents: function (response)
    {
        var messages = this.getChatMessages(response);
        var messagesWithAttachments = Ext.Array.filter(messages, function (message)
        {
            return !Ext.isEmpty(message.getAttachments());
        }, this);
        if (Ext.isEmpty(messagesWithAttachments))
        {
            return;
        }

        var scrollbarAtBottom = this.isScrollbarAtBottom();

        this.getStore().add(messagesWithAttachments);

        if (scrollbarAtBottom)
        {
            Ext.asap(() =>
            {
                this.scrollToBottom();
            }, this);
        }
    },

    isScrollbarAtBottom: function ()
    {
        if (!this.isStateOk())
        {
            return false;
        }

        return this.el.dom.offsetHeight + this.el.dom.scrollTop === this.el.dom.scrollHeight;
    }
});

Ext.define('MediaListForUserChat',
{
    extend: 'MediaList',

    loadMediaListForGuid: function (guid, lastMessageId)
    {
        SESSION.getMediaListForUserChat(guid, lastMessageId);
    },

    onGetMediaListForUserChatSuccess: function(response, guid, lastMessageId)
    {
        this.onGetMediaListSuccess(response, guid, lastMessageId);
    },

    onGetMediaListForUserChatException: function (guid, lastMessageId)
    {
        this.onGetMediaListException(guid, lastMessageId);
    },

    getGuid: function ()
    {
        return this.contact.getGUID();
    },

    createLoadPreviousMessagesButton: function (response)
    {
        this.loadPreviousMessagesButton = Ext.create('LoadPreviousMessagesButtonForMediaListUserChat',
        {
            margin: '5 0 10 0',
            parent: this,
            contact: this.contact,
            response: response
        });
    },

    getChatMessages: function (response)
    {
        if (Ext.isEmpty(response.getChats()))
        {
            return [];
        }
        var chatsForMe = Ext.Array.filter(response.getChats(), function (chat)
        {
            return this.isForMyGuid(chat.getContact().getGUID());
        }, this);

        var allMessagesForMe = chatsForMe.map(function (chat)
        {
            return chat.getMessages();
        });
        return Ext.Array.flatten(allMessagesForMe);
    }
});


Ext.define('MediaListForTeamChat',
{
    extend: 'MediaList',

    loadMediaListForGuid: function (guid, lastMessageId)
    {
        SESSION.getMediaListForTeamChat(guid, lastMessageId);
    },

    onGetMediaListForTeamChatSuccess: function(response, guid, lastMessageId)
    {
        this.onGetMediaListSuccess(response, guid, lastMessageId);
    },

    onGetMediaListForTeamChatException: function(guid, lastMessageId)
    {
        this.onGetMediaListException(guid, lastMessageId);
    },

    getGuid: function ()
    {
        return this.teamChat.getGuid();
    },

    createLoadPreviousMessagesButton: function (response)
    {
        this.loadPreviousMessagesButton = Ext.create('LoadPreviousMessagesButtonForMediaListTeamChat',
        {
            margin: '5 0 10 0',
            parent: this,
            teamChat: this.teamChat,
            response: response
        });
    },

    getChatMessages: function (response)
    {
        var result = [];
        Ext.each(response.getTeamChats(), function (teamChat)
        {
            var teamChatHistory = new TeamChatHistory(teamChat, this.getGuid());
            result = result.concat(teamChatHistory.getMessages());
        }, this);
        return result;
    }
});
