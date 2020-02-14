/**
 * Created by martens on 05.05.2015.
 */
Ext.define('ChatNotification', {
    extend: 'NotificationDialog',
    defaultImage: {},
    autoClose: false,
    title: '',
    icon: 'chat',
    updateMessage: function (message) {

    },
    initComponent: function ()
    {
        this.title = this.createTitle();

        this.callParent();

        this.informationContainer = this.add(this.createInformationContainer());

        this.additionalInformationContainer = this.add(Ext.create('AdditionalInformationContainer',
        {
            
            }));

        this.updateChat(this.chat);
        /*mainMessage: message,
            mainMessageContainsHTMLCode: mainMessageContainsHTMLCode,
            messageForBrowserNotification: messageForBrowserNotification || message
            */
        this.showMainMessage();

        this.actionContainer = this.add(new Ext.Container({
            layout:
            {
                type: 'hbox',
                align: 'middle'
            },
            margin: '10 10 0 10'
        }));

        this.addButtons();
        
        Ext.asap(function () 
        {
            if (this.isTimioFeatureAllowed())
            {
                this.show();
            }
        }, this);

        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function ()
    {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        this.callParent();
    },

    isTimioFeatureAllowed: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.Chat);
    },

    onGlobalEvent_openUserChat: function (contact)
    {
        if (contact && contact.equals(this.contact))
        {
            this.hide();
        }
    },

    addButtons: function ()
    {
        this.actionContainer.add(this.createButtonsForLeftSide());

        this.actionContainer.add(new Ext.Container(
        {
            flex: 1
        }));

        this.actionContainer.add(this.createButtonsForRightSide());
    },

    createButtonsForLeftSide: function ()
    {
        return [];
    },

    createButtonsForRightSide: function ()
    {
        var self = this;
        var startChat = Ext.create('AcceptButton',
            {
                text: this.getTextForAcceptButton(),
                handler: function ()
                {
                    self.onClickedStartChat();
                }
            });

        var cancelChat = Ext.create('DeclineButton',
            {
                text: this.getTextForDeclineButton(),
                handler: function ()
                {
                    self.onClickedCancelChat();
                },
                margin: '0 5 0 0'
            });

        return [cancelChat, startChat];
    },

    getTextForAcceptButton: function ()
    {
        return LANGUAGE.getString('show');
    },

    getTextForDeclineButton: function ()
    {
        return LANGUAGE.getString('ignore');
    },

    createTitle: function ()
    {
        return LANGUAGE.getString("newChatMessage");
    },

    createInformationContainer: function ()
    {
        return Ext.create('InformationContainer',
        {
            contact: this.contact
        });
    },

    onClickedStartChat: function ()
    {
        var self = this;
        self.hide();

        var contact = this.contact;
        Ext.asap(function () {
            GLOBAL_EVENT_QUEUE.onGlobalEvent_openUserChat(contact);
        });
    },

    onClickedCancelChat: function ()
    {
        this.hide();
    },

    updateChat: function (chat)
    {
        if (!isValid(chat))
        {
            return;
        }
        var messages = chat.getMessages();
        
        var lastIncomingMessage;
        Ext.each(messages, function (message)
        {
            if (message.getDirection() === ChatDirection.In.value) 
            {
                lastIncomingMessage = message;
            }
        });
        if (!isValid(lastIncomingMessage))
        {
            return;
        }
        
        var messageForNotification = lastIncomingMessage.getText();
        var messageForBrowserNotification = lastIncomingMessage.getText();
        var mainMessageContainsHTMLCode = false;
        if (isValid(lastIncomingMessage, 'getAttachments()'))
        {
            messageForBrowserNotification = lastIncomingMessage.getPreviewTextForAttachments();
            messageForNotification = '<div style="display:flex;flex-direction:row">' +
                                        '<img style="margin-top:2px;flex:0 0 16px;height:16px; width: 16px;" src="' + IMAGE_LIBRARY.getImage('paperclip', 64, COLOR_ACD_CALL_PANEL_LABEL_FOR_INTERNAL_CALLS) + '" />' +
                                        '<span style="font-size:13px;">' + messageForBrowserNotification + '</span>' +
                                    '</div>';
            mainMessageContainsHTMLCode = true;
        }
        this.updateLastMessage(messageForNotification, mainMessageContainsHTMLCode);

    },

    updateLastMessage: function (newMessage, mainMessageContainsHTMLCode)
    {
        this.mainMessage = newMessage;
        if (isValid(mainMessageContainsHTMLCode))
        {
            this.mainMessageContainsHTMLCode = mainMessageContainsHTMLCode;
        }
        this.showMainMessage();
    },

    showMainMessage: function()
    {
        this.additionalInformationContainer.setFirstRowText(this.mainMessage, !this.mainMessageContainsHTMLCode);
        this.additionalInformationContainer.updateUI();
    },

    createBrowserNotification: function ()
    {
        if (!isValid(this.contact))
        {
            return null;
        }

        return Ext.create('BrowserNotification',
        {
            title: LANGUAGE.getString("chatRequestBy", this.contact.getDisplayNameForLiveChat()),
            body: this.messageForBrowserNotification || this.mainMessage || "",
            icon: IMAGE_LIBRARY.getImage(this.icon, 64, WHITE),
            contact: this.contact
        });
    }
});