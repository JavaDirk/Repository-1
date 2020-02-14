'use strict';
var WEB_RTC_NOTIFICATIONS = {};

var WebRtcAdapter = (function () {
    function onLogin(response, relogin) {
        //if (!relogin) { 
        if (WEBRTCAVAILABLE)
            WebRtc.initialize(SESSION._sessionID, configuration =>
            {
                if (window.CURRENT_STATE_CHATS)
                {
                    CURRENT_STATE_CHATS.setWebRtcConfiguration(configuration);
                }
                WebRtcForSip.initialize(SESSION._sessionID, configuration, DEVICEMANAGER);
            });
        //}
    }
    
    function onNewEvents(event) {
        if (isValid(event.getWebRtcMessages())) {
            var finishedGuids = event.getWebRtcMessages().map(function (soapWebMsg) {
                var data = JSON.parse(soapWebMsg.getData());
                if (WEB_RTC_NOTIFICATIONS[data.guid] && data.type === WebRtcMessageType.Finish) {
                    return data.guid;
                }
                else {
                    return null;
                }

            }).filter(function (n) {
                return n != null;
            });


            for (var i = 0; i < finishedGuids.length; i++) {
                var curGuid = finishedGuids[i];
                WEB_RTC_NOTIFICATIONS[curGuid].hide();
                delete WEB_RTC_NOTIFICATIONS[curGuid];
            }

            var webRtcInvitations = event.getWebRtcMessages().map(function (soapWebRtcMsg) {
                var webRtcMessage = {
                    data: soapWebRtcMsg.getData(),
                    guid: soapWebRtcMsg.getGuid(),
                    contact: soapWebRtcMsg.contact
                };
                var peer = WebRtc.checkInvitation(webRtcMessage);
                return {
                    msg: webRtcMessage,
                    peer: peer
                };
            }).filter(function (webRtcMsgData) {
                if (webRtcMsgData.peer) {
                    return true;
                }
                else {
                    return false;
                }
            });
            webRtcInvitations.forEach(function (webRtcInvitation) {

                if (WEBRTCAVAILABLE) {
                    if (webRtcInvitation.peer.IsAgent) {
                        var data = JSON.parse(webRtcInvitation.msg.data);
                        let contact = new www_caseris_de_CaesarSchema_Contact();
                        contact.setGUID(webRtcInvitation.msg.guid);
                        if (webRtcInvitation.peer.Name) {
                            var name = webRtcInvitation.peer.Name.split(' ');
                            if (name.length > 1) {
                                var firstName = '';
                                for (var namePart in name) {
                                    if (namePart != name.length - 1) 
                                    {
                                        firstName += ' ' + name[namePart];
                                    }
                                }
                                contact.setFirstName(firstName);
                                contact.setLastName(name[name.length - 1]);
                            }
                            else {
                                contact.setLastName(webRtcInvitation.peer.Name);
                            }
                        }

                        setTimeout(() =>
                            createWebRtcPanel(contact, data.contactInfo, webRtcInvitation.peer.MediaType),
                            0);
                    }
                    else {
                        var webRtcNotification = new WebRtcNotification({
                            webRtcId: webRtcInvitation.msg.guid,
                            contact: webRtcInvitation.msg.contact,
                            mediaType: webRtcInvitation.peer.MediaType
                        });

                        WEB_RTC_NOTIFICATIONS[webRtcInvitation.msg.guid] = webRtcNotification;
                    }
                }
                else {
                    WebRtc.initializationError(webRtcInvitation.msg.guid, WebRtcErrorType.Unavailable);
                }
            });
        }

        /**
        * 
        * @param {string} type 
        */
        function convertType(type) {
            switch (type) {
                case "RequestOffer":
                    return Caesar.RtcControlType.RequestOffer;
                case "Sdp":
                    return Caesar.RtcControlType.Sdp;
                case "IceCandidate":
                    return Caesar.RtcControlType.IceCandidate;
                case "CloseConnection":
                    return Caesar.RtcControlType.CloseConnection;
            }
        }

        if (isValid(event.getWebRtcForSipMessages())) {
            var sipRtcMsgs = event.getWebRtcForSipMessages().map((sipRtcMsg) =>
            {
                return {
                    type: convertType(sipRtcMsg.getType()),
                    payload: sipRtcMsg.getPayload()
                };
            });
            sipRtcMsgs.forEach(sipRtcMsg => WebRtcForSip.onEvent(sipRtcMsg));
        }
    }

    function createWebRtcPanel(contact, contactInfo, mediaType)
    {
        let contactFromChatOffer = CURRENT_STATE_CHATS.getContactFromChatOffer(contact.getGUID());
        
        var contactForNotification = contactFromChatOffer || contact;
        var panel = VIEWPORT.conversationsTabPanel.add(Ext.create('WebRtcPanel', {
            contact: contactForNotification,
            parentContainer: VIEWPORT.conversationsTabPanel,
            title: contactForNotification.getDisplayNameForLiveChat(LANGUAGE.getString("liveChat")).toUpperCase(),
            contactInfo: contactInfo
        }));

        panel.acceptWebRtcInvitation(mediaType, WebRtcInvitationType.AgentInvitationAccepted);

        VIEWPORT.conversationsTabPanel.setActiveTab(panel);

    }

    var webRtc = {
        onLogin: onLogin,
        onNewEvents: onNewEvents
    };

    SESSION.addVIPListener(webRtc);

    return webRtc;
})();

