Ext.define('WebRtcLiveNotification', {
    extend: 'WebRtcNotification',
    contact: undefined,
    showOpenContact: false,

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
        this.webRtcId = this.contact.getGUID();
        this.mainMessage = this.chatOffer.getMessage();
        this.mediaType = this.chatOffer.getMediaType();
        this.chatId = this.chatOffer.getChatId();

        this.acceptFunction = function (me)
        {
            WebRtcSignaling.liveAccept(SESSION._sessionID, me.chatId);
            sessionStorage["agentWebRtcId"] = me.chatId;
        };

        this.cancelFunction = function (me)
        {
            WebRtcSignaling.liveDeny(SESSION._sessionID, me.chatId);
        };

        this.mediaType = this.mediaType === "Video" ? WebRtcMediaType.Video : WebRtcMediaType.Audio;

        this.title = LANGUAGE.getString(this.mediaType === WebRtcMediaType.Video ? 'newVideoSession' : 'newAudioSession');
        this.icon = this.mediaType === WebRtcMediaType.Video ? 'video' : 'microphone';

        if (isValid(this.chatOffer, "getGroup().getName()"))
        {
            var groupName = this.chatOffer.getGroup().getName();

            var acdCallInfoPanel = new ACDCallInfoPanel();
            this.mainMessage = acdCallInfoPanel.createKeyValueLine(LANGUAGE.getString("group"), groupName);
            this.messageForBrowserNotification = LANGUAGE.getString("group") + ": " + groupName;
        }

        this.callParent();

        this.openSetupPage.hide(); //wenn Christian den Bug gefixt hat, kann der Button für die Vorschaltseite auch wieder eingeblendet werden
    },

    isTimioFeatureAllowed: function ()
    {
        switch (this.mediaType)
        {
            case WebRtcMediaType.Video:
            case WebRtcMediaType.Audio:
                return SESSION.areFeaturesAllowed([TimioFeature.WebRtcIncoming, TimioFeature.LiveChat]);
            case WebRtcMediaType.Chat:
                return SESSION.isFeatureAllowed(TimioFeature.LiveChat);
            default:
                console.log("WebRtcLiveNotification: unknown mediaType!", this);
                return false;
        }
        
    }
});
