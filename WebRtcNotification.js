/**
 * Created by martens on 05.05.2015.
 */
Ext.define('WebRtcNotification', {
    extend: 'NotificationDialog',

    defaultImage: {},
    autoClose: false,
    isWebRtc: true,
    iconColor: NEW_GREY,
    showOpenContact: true,

    plugins:
        [
            {
                ptype: 'PlaySoundsInfinitelyPlugin'
            }
        ],

    updateMessage: function (message)
    {

    },

    initComponent: function ()
    {
        WebRtcMediaType.Video.title = LANGUAGE.getString("newVideoSession");
        WebRtcMediaType.Video.titleForBrowserNotification = LANGUAGE.getString("videoChatRequestBy");
        WebRtcMediaType.Video.icon = 'video';

        WebRtcMediaType.Audio.title = LANGUAGE.getString("newAudioSession");
        WebRtcMediaType.Audio.titleForBrowserNotification = LANGUAGE.getString("audioChatRequestBy");
        WebRtcMediaType.Audio.icon = 'microphone';

        WebRtcMediaType.DesktopSharing.title = LANGUAGE.getString("newDesktopSharingSession");
        WebRtcMediaType.DesktopSharing.titleForBrowserNotification = LANGUAGE.getString("desktopSharingRequestBy");
        WebRtcMediaType.DesktopSharing.icon = 'monitor';

        this.title = this.title || this.mediaType.title;
        this.icon = this.mediaType.icon;

        this.callParent();

        SESSION.addListener(this);

        if (!this.acceptFunction)
        {
            this.acceptFunction = function (notification, showSetupPage) 
            {
                var contact = this.contact;
                var mediaType = this.mediaType;
                Ext.asap(function () 
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_acceptWebRtc(contact, mediaType, showSetupPage);
                }, this);
            };
        }

        if (!this.cancelFunction)
        {
            this.cancelFunction = function ()
            {
                var guid = this.contact.GUID;
                Ext.asap(function ()
                {
                    WebRtc.reject(guid);
                }, this);
            };
        }

        this.informationContainer = this.add(this.createInformationContainer());

        this.additionalInformationContainer = this.add(Ext.create('AdditionalInformationContainer',
            {

            }));

        this.showMainMessage();

        this.actionContainer = this.add(new Ext.Container(
            {
                layout:
                {
                    type: 'hbox',
                    align: 'middle'
                },
                margin: '10 10 0 10'
            }));

        var startChat = Ext.create('AcceptButton',
            {
                handler: function ()
                {
                    NOTIFICATION_WINDOW.filter(function (notification)
                    {
                        return notification.isWebRtc;
                    }).forEach(function (webRtcNofication)
                    {
                        webRtcNofication.hide();
                        if (webRtcNofication.contact.GUID !== this.contact.GUID)
                        {
                            WebRtc.initializationError(webRtcNofication.contact.GUID, WebRtcErrorType.Busy);
                        }
                    }.bind(this));

                    this.acceptFunction(this);
                }.bind(this)
            });

        this.openSetupPage = Ext.create('RoundThinButton',
            {
                scale: 'small',
                minWidth: 90,
                text: LANGUAGE.getString('openSetupPage'),
                handler: function ()
                {
                    NOTIFICATION_WINDOW.filter(function (notification)
                    {
                        return notification.isWebRtc;
                    }).forEach(function (webRtcNofication)
                    {
                        webRtcNofication.hide();
                        if (webRtcNofication.contact.GUID !== this.contact.GUID)
                        {
                            WebRtc.initializationError(webRtcNofication.contact.GUID, WebRtcErrorType.Busy);
                        }
                    }.bind(this));

                    this.acceptFunction(this, true);
                }.bind(this)
            });

        var cancelChat = Ext.create('DeclineButton',
            {
                handler: function ()
                {
                    this.hide();
                    this.cancelFunction(this);
                }.bind(this),
                margin: '0 5 0 0'
            });

        if (this.mediaType === WebRtcMediaType.Video)
        {
            this.actionContainer.add(this.openSetupPage);
        }

        this.actionContainer.add(new Ext.Container(
            {
                flex: 1
            }));

        this.actionContainer.add([cancelChat, startChat]);

        WebRtc.invitationArrived(this.contact.GUID);

        Ext.asap(function () 
        {
            if (this.isTimioFeatureAllowed())
            {
                this.show();
            }
        }, this);
    },

    isTimioFeatureAllowed: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.WebRtcIncoming);
    },

    createInformationContainer: function ()
    {
        return Ext.create('InformationContainerForWebRTC',
            {
                contact: this.contact,
                mediaType: this.mediaType
            });
    },

    showMainMessage: function ()
    {
        if (isValidString(this.mainMessage))
        {
            this.additionalInformationContainer.setFirstRowText(this.mainMessage);
            if (this.chatOffer && this.chatOffer.getGroup() && isValidString(this.chatOffer.getExtraData()))
            {
                var acdCallInfoPanel = new ACDCallInfoPanel();
                var keyValuePairs = acdCallInfoPanel.splitIntoKeyValuePairs(this.chatOffer.getExtraData());
                if (keyValuePairs)
                {
                    var text = "";
                    Ext.each(keyValuePairs, function (pair)
                    {
                        text += acdCallInfoPanel.createKeyValueLine(pair.key, pair.value);
                    }, this);

                    this.additionalInformationContainer.setSecondRowText(text);
                }

            }
            this.additionalInformationContainer.updateUI();
            this.additionalInformationContainer.show();
        }
        else
        {
            this.additionalInformationContainer.hide();
        }
    },

    createBrowserNotification: function ()
    {
        if (!isValid(this.contact))
        {
            return null;
        }

        var stringName = this.mediaType.titleForBrowserNotification;
        return Ext.create('BrowserNotification',
            {
                title: LANGUAGE.getString(stringName, this.contact.getDisplayName()),
                body: this.messageForBrowserNotification || this.mainMessage || "",
                icon: IMAGE_LIBRARY.getImage(this.icon, 64, WHITE),
                contact: this.contact
            });
    }
});