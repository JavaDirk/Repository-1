/**
 * Created by martens on 05.05.2015.
 */
Ext.define('LiveChatNotification', {
    extend: 'ChatNotification',
    defaultImage: {},
    autoClose: false,
    title: '',
    icon: 'chat',

    plugins:
    [
        {
            ptype: 'PlaySoundsInfinitelyPlugin'
        },
        {
            ptype: 'LiveChatPlugin'
        }
    ],

    initComponent: function ()
    {
        this.callParent();

        this.chatId = this.chatOffer.getChatId();
        this.mainMessage = this.chatOffer.getMessage();
        this.secondInformation = this.chatOffer.getSubject();

        var secondRow = '';
        if (isValid(this.chatOffer, "getGroup().getName()"))
        {
            var groupName = this.chatOffer.getGroup().getName();

            secondRow += new ACDCallInfoPanel().createKeyValueLine(LANGUAGE.getString("group"), Ext.String.htmlEncode(groupName));
        }

        if (isValidString(this.chatOffer.getMessage()))
        {
            secondRow += new ACDCallInfoPanel().createKeyValueLine(LANGUAGE.getString("message"), Ext.String.htmlEncode(this.chatOffer.getMessage()));
        }
        
        this.additionalInformationContainer.setSecondRowText(secondRow);
        this.additionalInformationContainer.updateUI();
    },

    /*
    createTitle: function ()
    {
        return LANGUAGE.getString("liveChatRequest");
    },*/

    isTimioFeatureAllowed: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.LiveChat);
    },

    onClickedStartChat: function ()
    {
        this.hide();

        var contact = this.contact;
        var chatId = this.chatId;

        Ext.asap(function () 
        {
            SESSION.acceptChat(chatId, contact);

            GLOBAL_EVENT_QUEUE.onGlobalEvent_openLiveChat(contact);
        }, this);
    },

    onClickedCancelChat: function ()
    {
        var self = this;
        self.hide();
        Ext.asap(function () {
            var doneFct = function () {
                console.log("Deny chat success");
            };

            var failFct = function () {
                console.log("Deny chat failed");
            };

            SESSION.denyChat(self.chatId, doneFct, failFct);
        });
    },

    getTextForAcceptButton: function ()
    {
        return LANGUAGE.getString('startChat');
    },

    getTextForDeclineButton: function ()
    {
        return LANGUAGE.getString('decline');
    },

    showMainMessage: function ()
    {
        if (!isValidString(this.mainMessage))
        {
            return;
        }
        var acdCallInfoPanel = new ACDCallInfoPanel();
        var line = acdCallInfoPanel.createKeyValueLine(LANGUAGE.getString("message"), this.mainMessage);

        this.additionalInformationContainer.setFirstRowText(line, false);
        this.additionalInformationContainer.updateUI();
    }
});