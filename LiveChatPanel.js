Ext.define('LiveChatHeader',
{
    extend: 'ChatHeader',
    
    showTyping: false,

    createImage: function ()
    {
        return Ext.create('Photo',
        {
            avatarColor: COLOR_AVATAR_IMAGE_FOR_LIVE_CHAT,
            contact: this.contact
        });
    },

    createContactInformation: function ()
    {
        var container = Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'column'
            }
        });

        var leftContainer = container.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '0 15 0 0'
        }));

        container.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            }
        }));


        if (this.contact.getCompany() && isValidString(this.contact.getCompany()))
        {
            leftContainer.add(this.createKeyValueRow(LANGUAGE.getString("company") + ": ", this.contact.getCompany(), undefined, 75));
        }
        var lastChatOffer = this.chatOffers[this.chatOffers.length - 1];
        var groupName = lastChatOffer.getGroup().getName();
        if (isValidString(groupName)) {
            leftContainer.add(this.createKeyValueRow(LANGUAGE.getString("group") + ': ', groupName, undefined, 75));
        }

        var subject = lastChatOffer.getSubject();
        if (isValidString(subject))
        {
            leftContainer.add(this.createKeyValueRow(LANGUAGE.getString("subject") + ": ", subject, undefined, 75));
        }

        var requestURL = lastChatOffer.getRequestURL();
        if (isValidString(requestURL))
        {
            leftContainer.add(this.createKeyValueRow(LANGUAGE.getString("website") + ": ", requestURL, function ()
            {
                window.open(requestURL, '_blank');
            }, 75));
        }

        return container;
    },

    createKeyValueRow: function (key, value, clickListener, width)
    {
        var row = new Ext.Container({
            layout: { type: 'hbox', pack: 'start', align: 'stretch' },
            margin: '2 5 0 0'
        });


        row.add(new Ext.form.Label({
            text: key,
            style: 'color:' + NEW_GREY,
            margin: '0 5 0 0',
            width: width
        }));

        if (isValid(clickListener))
        {
            row.add(new Link({
                margin: '0 25 0 0',
                text: value,
                listeners: {
                    el: {
                        click: clickListener
                    }
                }
            }));
        }
        else
        {
            row.add(new Ext.form.Label({
                margin: '0 25 0 0',
                text: value,
                style: 'color:' + BLACK
            }));
        }
        

        return row;
    }
});

Ext.define('LiveChatMessagesPanel',
{
    extend: 'ChatMessagesPanel',

    showDateSplitter: false,

    plugins:
    [
        {
            ptype: 'LiveChatViewWithPhotos'
        }
    ],

    initComponent: function ()
    {
        this.callParent();

        Ext.reverseEach(this.liveChats, function (liveChat, index)
        {            
            this.fillChatView(liveChat);

            if (index !== 0 && length !== 0)
            {
                this.addSeparator(0);
            }
        }, this);
        
        /*
        this.insertMessage(0,
        {
            fullDate: new Date(),
            systemMessage: true,
            text: LANGUAGE.getString("liveChatEnterText", this.getName(), this.getStartTime())
        });
        */
    },

    addSeparator: function (position)
    {
        this.getStore().insert(position, { separatorMessage: true});
    },

    addAllChats: function (messages, contact)
    {
        this.callParent(arguments);

        /*
        if (isValid(this.liveChat))
        {
            if (this.liveChat.isFinishedBy === LiveChatFinishReason.Agent)
            {
                this.closeConversationByMe();
            }
            else if (this.liveChat.isFinishedBy === LiveChatFinishReason.Customer)
            {
                this.closeConversationByCustomer();
            }
            else if (this.liveChat.isFinishedBy === LiveChatFinishReason.ConnectionLost)
            {
                this.closeConversationByConnectionLost();
            }
        }
        */
    },

    closeConversationByMe: function ()
    {
        this.closeConversation(LANGUAGE.getString('liveChatFinishedByMe', this.getEndTime()));
    },

    closeConversationByCustomer: function ()
    {
        this.closeConversation(LANGUAGE.getString('liveChatFinishedByCustomer', this.getName(), this.getEndTime()));
    },

    closeConversationByConnectionLost: function ()
    {
        this.closeConversation(LANGUAGE.getString('liveChatFinishedByNetwork', this.getEndTime()));
    },

    closeConversation: function (text)
    {
        if (this.conversationFinished)
        {
            return;
        }
        this.add(
        {
            fullDate: new Date(),
            systemMessage: true,
            text: text
        });

        this.parent.closeConversation();

        this.conversationFinished = true;
    },
    /*
    getStartTime: function ()
    {
        return this.getTime("startDateTime");
    },

    getEndTime: function ()
    {
        return this.getTime("endDateTime");
    },

    getTime: function (dateTimeName)
    {
        var date = new Date();
        if (isValid(this, "liveChat." + dateTimeName))
        {
            date = this.liveChat[dateTimeName];
        }
        return formatTimeString(date);
    },

    onConnectionLost: function ()
    {
        this.closeConversationByConnectionLost();
    },
    */

    onNewEvents: function (response)
    {
        this.callParent(arguments);
        /*
        if (isValid(response.getControlEvents()))
        {
            if (isValid(response.getControlEvents().getControlEventChatFinish()))
            {
                if (this.chatId === response.getControlEvents().getControlEventChatFinish().getChatId())
                {
                    this.closeConversationByCustomer();
                }
            }
        }
        */
    },

    getLiveChatHistory: function ()
    {
        return CURRENT_STATE_CHATS.getLiveChat(this.contact.getGUID());
    },

    convertChatHistory: function (chatHistoryPromProxy)
    {
        return new LiveChatHistory(chatHistoryPromProxy, this.contact);
    },

    addChatOffer: function (chatOffer)
    {
        this.addSeparator(this.getStore().getCount());

        var liveChat = CURRENT_STATE_CHATS.getLastLiveChatByChatId(chatOffer.getChatId());
        this.fillChatView(liveChat, '', this.getStore().getCount());
    },

    setContact: function (contact)
    {
        this.contact = contact;
    }
});

Ext.define('LiveChatPanel', {
    extend: 'ChatPanel',

    needFinishChat: true,
    titleIsContactName: false,

    chatIds: undefined,
    chatOffers: undefined,

    listeners:
    {
        beforeclose: function (liveChatPanel) 
        {
            if (liveChatPanel.needFinishChat)
            {
                liveChatPanel.finishAllOpenLiveChats();
            }
        }
    },

    initComponent: function ()
    {
        this.titleIconBlack = this.titleIconBlack || IMAGE_LIBRARY.getImage('chats', 64, COLOR_TAB_ICON_NORMAL);
        this.titleIconWhite = this.titleIconWhite || IMAGE_LIBRARY.getImage('chats', 64, COLOR_TAB_ICON_SELECTED);

        this.callParent();

        this.saveCurrentDate();

        CURRENT_STATE_CHATS.addChatPanel(this);
    },

    destroy: function ()
    {
        CURRENT_STATE_CHATS.removeChatPanel(this);

        this.callParent();
    },

    finishAllOpenLiveChats: function ()
    {
        Ext.each(this.chatIds, function (chatId)
        {
            if (!CURRENT_STATE_CHATS.isLiveChatFinished(chatId))
            {
                SESSION.finishChat(chatId, this.contact);
            }

        }, this);
    },

    createChatMessagesPanel: function ()
    {
        return Ext.create('LiveChatMessagesPanel', {
            margin: '0 0 0 0',
            flex: 1,
            contact: this.contact,
            liveChats: this.liveChats,
            chatIds: this.chatIds,
            parent: this,
            showDeleteButton: false
        });
    },

    createHeader: function ()
    {
        var header = Ext.create('LiveChatHeader',
            {
                parent: this,
                contact: this.contact,
                chatIds: this.chatIds,
                chatOffers: this.chatOffers
            });
        return header;
    },

    createMediaListPanel: function ()
    {

    },

    closeConversation: function ()
    {
        if (isValid(this.chatInputContainer))
        {
            this.chatInputContainer.hide();
        }

        this.needFinishChat = false;

        this.header.stopTimer();
    },

    onFinishChatSuccess: function (response)
    {
        console.log("Finished chat success");
    },

    onFinishChatException: function ()
    {
        console.log("Finished chat exception");
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && this.contact && panel.contact && this.contact.isEqualForLiveChat(panel.contact);// this.chatId === panel.chatId;
    },

    isWritingDisallowed: function ()
    {
        if (isValid(this.liveChats)) 
        {
            var lastLiveChat = this.liveChats[this.liveChats.length - 1];
            if (isValid(lastLiveChat, "isFinishedBy"))
            {
                return true;
            }
        }

        return false;
    },

    getLocalStorageKeyForCurrentDate: function ()
    {
        if (!isValid(this.contact))
        {
            return null;
        }
        return "CurrentDate_" + this.contact.getGUID();
    },

    saveCurrentDate: function ()
    {
        var now = new Date();
        SESSION_STORAGE.setItem(this.getLocalStorageKeyForCurrentDate(), now);
    },

    showWaitCursorForChatContainer: function ()
    {
        return false;
    },

    confirmRemove: function ()
    {
        if (!this.needFinishChat)
        {
            return true;
        }
        this.showConfirmationForFinishChat();
        return false;
    },

    showConfirmationForFinishChat: function ()
    {
        this.insert(0, Ext.create('ConfirmationComponent',
            {
                yesCallback: () =>
                {
                    this.finishAllOpenLiveChats();

                    if (this.parent)
                    {
                        this.parent.remove(this);
                    }
                },
                noCallback: () =>
                {
                    if (this.parent)
                    {
                        this.parent.remove(this);
                    }
                },
                cancelCallback: Ext.emptyFn,
                yesButtonText: LANGUAGE.getString("finishLiveChat"),
                noButtonText: LANGUAGE.getString("continueLiveChatLater"),
                errorMessageText: LANGUAGE.getString("cancelLiveChat", this.contact.getDisplayName()),
                borderWidth: 1,
                margin: '10 5 10 0'
            }));
    },

    updateVisibilityOfAttachmentsButton: function ()
    {
        this.attachmentsButton.setVisible(false);
    },

    onPaste: function (e)
    {

    },

    reload: function ()
    {

    },

    updateChatServerAvailability: function (initial)
    {

    },

    addChatOffer: function (chatOffer)
    {
        var liveChat = CURRENT_STATE_CHATS.getLastLiveChatByChatId(chatOffer.getChatId());
        var foundLiveChat;
        Ext.each(this.liveChats, function (liveChat)
        {
            if (chatOffer.getChatId() === liveChat.liveChatId)
            {
                foundLiveChat = liveChat;
                return false;
            }
        }, this);
        if (foundLiveChat)
        {
            return;
        }

        this.liveChats.push(liveChat);

        this.updateChatInputContainer();

        this.contact = liveChat.getContact();

        CURRENT_STATE_CHATS.setActiveChatPanel(this.contact);

        Ext.asap(() =>
        {
            this.focus();
        }, this);

        this.chatContainer.setContact(this.contact);
        this.chatContainer.addChatOffer(chatOffer);
    },

    getNumberBlinkingTab: function ()
    {
        return -1; //unendlich
    }
});

