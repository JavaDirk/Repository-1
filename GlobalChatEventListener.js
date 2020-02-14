class GlobalChatEventListener extends GlobalEventListener
{
    onNewEvents(response)
    {
        Ext.each(response.getChats(), function (chat)
        {
            this.showNotificationForIncomingChat(chat);
        }, this);

        Ext.each(response.getTeamChats(), function (teamChat)
        {
            Ext.each(teamChat.getTeamChatInfos(), function (teamChatInfo)
            {
                if (this.shouldNotificationForTeamChatRoomBeShown(teamChatInfo))
                {
                    var notificationDialog = this.getNotificationForTeamChatRoom(teamChatInfo);
                    if (isValid(notificationDialog))
                    {
                        notificationDialog.updateNotification(teamChatInfo);
                    }
                    else
                    {
                        this.showNotificationForTeamChatRoom(teamChatInfo);
                    }
                }
            }, this);

        }, this);

        if (isValid(response, "getControlEvents().getControlEventChatOffer()"))
        {
            var chatOffer = response.getControlEvents().getControlEventChatOffer();

            var offeredContact = chatOffer.getContact();
            var contact = new www_caseris_de_CaesarSchema_Contact();
            contact.convertFromChatContact(offeredContact);

            this.showNotificationForChatOffer(chatOffer, contact);
        }
    }

    showNotificationForChatOffer(chatOffer, contact)
    {
        Ext.create(this.getNotificationClassName(chatOffer),
            {
                contact: contact,
                chatOffer: chatOffer
            });
    }

    getNotificationClassName(chatOffer)
    {
        switch (chatOffer.getMediaType())
        {
            case "Video":
            case "Audio":
                switch (chatOffer.getConsultationType())
                {
                    case "Invitation":
                        return "WebRtcLiveNotificationForInvitation";
                    default:
                        return "WebRtcLiveNotification";
                }
            case "WhatsApp":
                return "WhatsAppNotification";

            default:
                return 'LiveChatNotification';
        }
    }

    showNotificationForIncomingChat(chat)
    {
        var contact = chat.getContact();
        if (CURRENT_STATE_CHATS.isLiveChatContact(contact))
        {
            if (!CURRENT_STATE_CHATS.isChatPanelVisibleForContact(contact))
            {
                //geht hier um WhatsApp: Beim Schließen des LiveChatPanels wird evtl. kein FinishSession aufgerufen, also können noch normale Nachrichten kommen. 
                //Damit der Agent das auch mitbekommt, öffnen wir das LiveChatPanel wieder
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openLiveChat(contact); 
                new PlaySoundsInfinitelyPlugin({ soundFile: "Notifications/message.wav" }).playSound();
            }
            return;
        }
        if (CURRENT_STATE_CHATS.isChatPanelVisibleForContact(contact))
        {
            return;
        }

        if (this.myStateIsDontDisturb())
        {
            return;
        }

        var chatNotification = this.getChatNotification(contact);
        if (chatNotification)
        {
            chatNotification.updateChat(chat);
        }
        else
        {
            this.createChatNotification(contact, chat);
        }
    }

    isChatNotificationAlreadyVisible(contact)
    {
        return !!this.getChatNotification(contact);
    }

    getChatNotification(contact)
    {
        return this.getNotificationBy(function (notification)
        {
            return contact.equals(notification.contact);
        });
    }

    myStateIsDontDisturb()
    {
        var presenceState = MY_CONTACT.getPresenceState();
        return presenceState === PresenceState.DnD.value && CURRENT_STATE_CHATS.refuseChatRequest;
    }

    createChatNotification(contact, chat)
    {
        Ext.create('ChatNotification',
            {
                contact: contact,
                chat: chat
            });
    }

    shouldNotificationForTeamChatRoomBeShown(teamChatInfo)
    {
        var room = CURRENT_STATE_CHATS.getTeamChatRoomOrBlackBoardForGuid(teamChatInfo.getChatReceiver().getGuid());
        if (isValid(room))
        {
            if (CURRENT_STATE_CHATS.isTeamChatPanelVisible(room))
            {
                return false;
            }
            return room.getShowNotification();
        }
        return true;
    }

    showNotificationForTeamChatRoom(teamChatInfo)
    {
        var room = CURRENT_STATE_CHATS.getTeamChatRoomOrBlackBoardForGuid(teamChatInfo.getChatReceiver().getGuid());

        Ext.create(CURRENT_STATE_CHATS.isBlackBoard(room) ? 'BlackBoardNotification' : 'TeamChatNotification',
            {
                teamChatRoom: room,
                teamChatInfo: teamChatInfo
            });
    }

    getNotificationForTeamChatRoom(teamChatInfo)
    {
        var room = CURRENT_STATE_CHATS.getTeamChatRoomOrBlackBoardForGuid(teamChatInfo.getChatReceiver().getGuid());
        if (!isValid(room))
        {
            return null;
        }

        return this.getNotificationBy(function (notification)
        {
            return notification.teamChatRoom === room;
        });
    }

    getNotificationBy(callback)
    {
        var notifications = Ext.Array.filter(NOTIFICATION_WINDOW, callback, this);
        if (Ext.isEmpty(notifications))
        {
            return null;
        }
        return notifications[0];
    }
}