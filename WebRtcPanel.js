Ext.define('WebRtcPanel', {
    extend: 'Ext.Container',
    layout: { type: 'vbox', pack: 'start', align: 'stretch'},
    mainContainer: {},
    closable: true,
    contact: {},
    invitationType: WebRtcInvitationType.None,
    startContainer: undefined,
    showSetupPage: false,

    acceptWebRtcInvitation: function (mediaType, invitationType)
    {
        this.mediaType = mediaType;

        this.invitationType = invitationType || WebRtcInvitationType.None;
        this.initializeContainer();
    },
    videoInvitationFunction: function ()
    {
        this.invitationType = WebRtcInvitationType.Invitation;
        this.mediaType = WebRtcMediaType.Video;
        this.initializeContainer();
    },

    videoAgentInvitationFunction: function ()
    {
        this.invitationType = WebRtcInvitationType.AgentInvitationAccepted;
        this.mediaType = WebRtcMediaType.Video;

        this.initializeContainer();
    },

    audioInvitationFunction: function ()
    {
        this.invitationType = WebRtcInvitationType.Invitation;
        this.mediaType = WebRtcMediaType.Audio;

        this.initializeContainer();
    },

    audioAgentInvitationFunction: function ()
    {
        this.invitationType = WebRtcInvitationType.AgentInvitationAccepted;
        this.mediaType = WebRtcMediaType.Audio;

        this.initializeContainer();
    },
    dialog: {},
            
    listeners: {
        boxready: function () {
        },

        resize: function ()
        {
            if (this.webRtc)
            {
                this.webRtc.onResize();
            }
        },

        destroy: function ()
        {
            if (this.webRtc)
            {
                this.webRtc.onCloseWindow();
            }
            if (this.agentChatId)
            {
                WebRtcSignaling.liveFinish(SESSION._sessionID, this.agentChatId);
            }
        }
    },

    closePanel: function (text)
    {
        var self = this;

        var yesCallBack = function ()
        {
            self.parentContainer.remove(self);
        };

        this.messageBox(text, undefined, yesCallBack);
    },

    onNewEvents: function (event)
    {
        if (this.webRtc && event.getWebRtcMessages())
        {
            Ext.each(event.getWebRtcMessages(), function (webRtcMessage)
            {
                this.webRtc.onEvent({
                    guid: webRtcMessage.getGuid(),
                    data: webRtcMessage.getData()
                });
            }.bind(this));
        }
    },

    messageBox: function (text, panelClosing, hideCallback, alignment)
    {
        if (!hideCallback)
        {
            hideCallback = function () { };
        }

        // Falls das Panel geschlossen werden soll, soll zuerst die Box angezeigt werden und im callback dann erst das Fenster zu gehen
        if (panelClosing)
        {
            this.closePanel(text);
            return;
        }
            

        var errorComponent = this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '10 10 0 10',
            errorMessageText: text,
            errorType: ErrorType.Warning,
            borderWidth: 1
        }));
        errorComponent.on('removed', function ()
        {
            hideCallback();
        });
        
    },

    sendWebRtcMessage: function (data)
    {
        return WebRtcSignaling.send(SESSION._sessionID, this.contact.GUID, data);
    },

    initializationError: async function (data)
    {
        await WebRtc.initializationError(this.contact.GUID, data);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    initializeContainer: function () 
    {
        this.tabConfig = {
            icon: this.titleIconBlack,
            tooltip: this.mediaType === WebRtcMediaType.Audio ? LANGUAGE.getString("audioCall") : LANGUAGE.getString('videoCall')
        };

        this.titleIconWhite = IMAGE_LIBRARY.getImage(this.mediaType === WebRtcMediaType.Audio ? 'microphone' : 'video', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage(this.mediaType === WebRtcMediaType.Audio ? 'microphone' : 'video', 64, COLOR_TAB_ICON_NORMAL);

        if (this.invitationType === WebRtcInvitationType.AgentInvitationAccepted)
        {
            this.agentChatId = sessionStorage["agentWebRtcId"];
        }

        this.removeAll();
        this.mainContainer = this.add(new Ext.Component({
            flex: 1,
            html: '<div class="webRtc"></div>',
            listeners: {
                boxready: (webRtcContainer) => 
                {
                    try
                    {
                        let webRtcContent = webRtcContainer.el.dom.getElementsByClassName('webRtc')[0];

                        SvgInjector.injectSvgs();

                        let externalInvitation;
                        if (isValid(this.agentChatId))
                        {
                            let chatOffer = CURRENT_STATE_CHATS.getChatOffer(this.agentChatId);
                            if (!isValid(chatOffer, "getGroup()"))
                            {
                                externalInvitation = chatOffer.getExtraData();
                            }
                        }

                        let webRtcSessionConfiguration =
                        {
                            externalInvitation: externalInvitation,
                            userName: MY_CONTACT.getDisplayName(),
                            userGuid: MY_CONTACT.GUID,
                            peerName: this.contact.getDisplayNameForLiveChat(),
                            peerGuid: this.contact.getGUID(),
                            peerImage: this.contact.getImageUrl(),
                            invitationType: this.invitationType,
                            mediaType: this.mediaType,
                            webRtcContent: webRtcContent,
                            webRtcHost:
                            {
                                sendWebRtcMessage: this.sendWebRtcMessage.bind(this),
                                initializationError: this.initializationError.bind(this),
                                messageBox: this.messageBox.bind(this),
                                close: function () { }
                            },
                            clientInfo: this.contactInfo,
                            language: LANGUAGE.getLanguage(),
                            displaySetup: this.showSetupPage || false
                        };

                        this.webRtc = new WebRtcSession(webRtcSessionConfiguration);
                    }
                    catch (error)
                    {
                        alert(error);
                        console.error(error);
                    }
                }
            }
        }));
    },

    initComponent: function ()
    {
        this.callParent();

        SESSION.addListener(this);
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && this.contact && panel.contact && this.contact.equals(panel.contact);
    }
});