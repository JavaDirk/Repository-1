Ext.define('CurrentState_Chats',
{
    lastGetLastChatMessagesResponse: null,
    liveChats: [],
    teamChatRooms: null,
    blackBoards: null,
    chatPanels: [],
    chatOffers: {},
    teamChatPanels: [],
    chatTextBlocks: null,
    activeChatGuid: "",
    activeTeamChatGuid: "",
    clientSettingsKeyForTeamChats: 'chosenTeamChatRoomsWithoutBlackBoards',
    clientSettingsKeyForBlackBoards: 'chosenBlackBoards',
    
    numberNewMessagesForUserChat: {},
    numberNewMessagesForLiveChat: {},
    numberNewMessagesForTeamRoomOrBlackBoard: {},

    chatRoomDetails: {},

    lastChatMessages: {},
    
    constructor: function () {
        SESSION.addVIPListener(this);
        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function () {
        SESSION.removeVIPListener(this);
        GLOBAL_EVENT_QUEUE.removeEventListener(this);

        this.callParent();
    },

    onLogin: function (response, relogin)
    {
        SESSION.getPresenceStateConfiguration();
        SESSION.loadChatTextBlocks();
    },

    setWebRtcConfiguration: function (configuration)
    {
        this.webRtcConfiguration = configuration;

        GLOBAL_EVENT_QUEUE.onGlobalEvent_newWebRtcConfiguration(configuration);
    },

    areStunServerConfigured: function ()
    {
        if (isValid(this.webRtcConfiguration))
        {
            var stunConfiguration = this.webRtcConfiguration.iceServers;
            return !Ext.isEmpty(stunConfiguration);
        }
        return false;
    },
    
    onGetPresenceStateConfigurationSuccess: function(response)
    {
        if(response.getReturnValue().getCode() === 0)
        {
            this.refuseChatRequest = response.getRefuseChatRequest();
        }
    },

    onSetPresenceStateConfigurationSuccess: function (response, present, absent, pause, dontDisturb, offline, disableChat)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.refuseChatRequest = disableChat;
        }
    },

    onGetTeamChatRoomsSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0 && isValid(response.getChatRoomInfos())) {
            if (!isValid(this.teamChatRooms))// == initialer Fall
            {
                var self = this;
                setTimeout(function () {
                    self.getDetailsForChosenTeamChatRooms();
                }, 100);
            }
            this.teamChatRooms = this.teamChatRooms || {};

            Ext.each(response.getChatRoomInfos(), function (chatRoomInfo)
            {
                this.teamChatRooms[chatRoomInfo.getGuid()] = chatRoomInfo;
            }, this);

            this.subscribeChosenTeamChatRooms();
        }
    },
    
    onGetBlackBoardsSuccess: function (response) 
    {
        if (response.getReturnValue().getCode() === 0 && isValid(response.getBlackboardInfos())) 
        {
            this.blackBoards = this.blackBoards || {};

            Ext.each(response.getBlackboardInfos(), function (chatRoomInfo)
            {
                this.blackBoards[chatRoomInfo.getGuid()] = chatRoomInfo;
            }, this);

            this.subscribeChosenBlackBoards();
        }
    },
    
    subscribeChosenTeamChatRooms: function ()
    {
        this.subscribeToTeamChatOrBlackBoard(this.clientSettingsKeyForTeamChats);
    },

    subscribeChosenBlackBoards: function ()
    {
        this.subscribeToTeamChatOrBlackBoard(this.clientSettingsKeyForBlackBoards);
    },

    subscribeToTeamChatOrBlackBoard: function (clientSettingsKey)
    {
        Ext.each(this.getChosenTeamChatRooms(clientSettingsKey), function (chatRoom)
        {
            SESSION.subscribeTeamChatRoom(chatRoom.getGuid());
        });
    },
    
    onSubscribeTeamChatRoomSuccess: function (response, guid)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.lastChatMessages[guid] = response.getLastMessage();
        }
    },

    getDetailsForChosenTeamChatRooms: function () 
    {
        var self = this;
        Ext.each([this.clientSettingsKeyForTeamChats, this.clientSettingsKeyForBlackBoards], function (clientSettingsKey) {
            Ext.each(self.getChosenTeamChatRooms(clientSettingsKey), function (chatRoom)
            {
                SESSION.getChatRoomDetails(chatRoom.getGuid());
            });
        });
    },

    onGetChatRoomDetailsSuccess: function (response, guid)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.chatRoomDetails[guid] = response.getChatRoomDetails();
        }
    },

    amIModerator: function (teamChatGuid)
    {
        var chatRoomDetails = this.chatRoomDetails[teamChatGuid];
        if (!isValid(chatRoomDetails))
        {
            return false;
        }
        return this.amIModeratorInRoom(chatRoomDetails.getChatRoomInfo());
    },

    amIModeratorInRoom: function (chatRoomDetails)
    {
        if (!isValid(chatRoomDetails))
        {
            return false;
        }
        var IamModerator = false;
        Ext.each(chatRoomDetails.getModerators(), function (moderator)
        {
            if (moderator.getGuid() === MY_CONTACT.getGUID())
            {
                IamModerator = true;
            }
        });
        
        return IamModerator;
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            this.reset();
        }
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getChats(), function (chat)
        {
            this.addChat(chat);
        }, this);
        
        if (isValid(response.getControlEvents()))
        {
            if (isValid(response.getControlEvents().getControlEventChatFinish()))
            {
                var chatFinishEvent = response.getControlEvents().getControlEventChatFinish();
                this.saveFinishReasonAndEndDate(chatFinishEvent);
            }
            if (isValid(response.getControlEvents().getControlEventChatOffer()))
            {
                var chatOffer = response.getControlEvents().getControlEventChatOffer();

                this.chatOffers[chatOffer.getChatId()] = chatOffer;
                chatOffer.startDateTime = new Date();

                var contact = this.convertChatOfferContact2Contact(chatOffer);

                if (chatOffer.getMediaType() === "Chat" || chatOffer.getMediaType() === "WhatsApp")
                {
                    //damit die Nachricht aus dem ChatOffer auch noch beim einem späteren Öffnen des LiveChats zu sehen ist, speichern wir die,
                    //als wäre sie eine ganz normale Nachricht des Kunden gewesen
                    var chatMessage = this.convertChatOfferMessageToChatMessage(chatOffer);

                    if (isValidString(chatOffer.getMessage()))
                    {
                        this.liveChats.push(this.convertToChat(chatMessage, contact, chatOffer.getChatId()));
                    }
                    else
                    {
                        this.liveChats.push(this.convertToChat(null, contact, chatOffer.getChatId()));
                    }
                }
            }
        }

        if (isValidString(response.getChatServerAvailability()))
        {
            this.chatServerAvailability = response.getChatServerAvailability();
            if (this.isChatServerAvailable())
            {
                SESSION.getTeamChatRooms();
                SESSION.getBlackBoards();

                SESSION.getLastChatMessages();
            }
        }

        if (response.getReturnValue().getCode() === 0)
        {
            var chatConfiguration = response.getChatConfiguration();
            if (isValid(chatConfiguration))
            {
                this.chatConfiguration = chatConfiguration;
            }
        }
    },

    saveFinishReasonAndEndDate: function (chatFinishEvent)
    {
        if (!isValid(chatFinishEvent))
        {
            return;
        }

        var liveChat = this.getLastLiveChatByChatId(chatFinishEvent.getChatId());
        if (!liveChat)
        {
            return;
        }
        if (liveChat.accepted)
        {
            if (!isValid(liveChat.isFinishedBy))
            {
                liveChat.isFinishedBy = LiveChatFinishReason.Customer;
            }
            liveChat.endDateTime = new Date();
        }
        else
        {
            this.deleteLiveChats(chatFinishEvent.getChatId());
        }
    },

    deleteLiveChats: function (chatId)
    {
        this.liveChats = Ext.Array.filter(this.liveChats, function (liveChat)
        {
            return chatId !== liveChat.liveChatId;
        });
    },

    onAcceptChatSuccess: function (response, chatId, contact)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            return;
        }
        var liveChat = this.getLastLiveChatByChatId(chatId);
        if (!liveChat)
        {
            return;
        }
        liveChat.accepted = true;
    },

    convertChatOfferMessageToChatMessage: function (chatOffer)
    {
        if (!isValid(chatOffer))
        {
            return null;
        }
        var chatMessage = new www_caseris_de_CaesarSchema_ChatMessage();
        chatMessage.setText(chatOffer.getMessage());
        chatMessage.setDirection("In");
        chatMessage.setStatus("Delivered");
        chatMessage.setTime(new Date());
        return chatMessage;
    },

    getChatOffer: function (chatId)
    {
        return this.chatOffers[chatId];
    },

    getChatOffersByContact: function (contact)
    {
        return Ext.Array.filter(Object.values(this.chatOffers), function (chatOffer)
        {
            var offeredContact = this.convertChatOfferContact2Contact(chatOffer);
            return contact.isEqualForLiveChat(offeredContact);
        }, this);
    },

    convertChatOfferContact2Contact: function (chatOffer)
    {
        var offeredContact = chatOffer.getContact();
        var contact = new www_caseris_de_CaesarSchema_Contact();
        contact.convertFromChatContact(offeredContact);
        return contact;
    },

    getContactFromChatOffer: function (guid)
    {
        var contact = new www_caseris_de_CaesarSchema_Contact();
        contact.setGUID(guid);
        let chatOffers = this.getChatOffersByContact(contact);
        if (Ext.isEmpty(chatOffers))
        {
            return null;
        }
        var chatOffer = chatOffers[chatOffers.length - 1];
        let contactFromChatOffer;
        if (chatOffer && chatOffer.getContact())
        {
            contactFromChatOffer = this.convertChatOfferContact2Contact(chatOffer);
        }
        return contactFromChatOffer;
    },


    isChatServerAvailable: function()
    {
        return this.chatServerAvailability === "Available" || this.chatServerAvailability === 1;
    },

    isChatAllowedAndPossible: function ()
    {
        return this.isChatServerAvailable() && MY_CONTACT.getRightChat() && SESSION.isFeatureAllowed(TimioFeature.Chat);
    },

    onSendChatMessageSuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var message = response.getMessage();
            
            this.addChat(this.convertToChat(message, contact));
        }
    },

    convertToChat: function (message, contact, liveChatId)
    {
        var chat = new www_caseris_de_CaesarSchema_Chat();
        if (isValid(liveChatId))
        {
            chat.liveChatId = liveChatId;
        }
        chat.setContact(contact);
        chat.setMessages([message]);
        chat.startDateTime = new Date();
        
        return chat;
    },

    onGetLastChatMessagesSuccess: function (response)
    {
        var self = this;
        this.lastGetLastChatMessagesResponse = response;
                
        if (response.getReturnValue().getCode() === 0)
        {
            var chats = response.getLastMessages();

            Ext.each(chats, function (chat)
            {
                self.addLastChatMessage(chat);
            });
        }
    },

    onGetLastChatMessagesException: function (error)
    {
        console.log(error);
    },
    
    isUserChatsLoaded: function ()
    {
        return isValid(this.lastGetLastChatMessagesResponse);
    },

    getLastResponseForGetLastChatMessages: function ()
    {
        return this.lastGetLastChatMessagesResponse;
    },
        
    reset: function ()
    {
        this.lastChatMessages = {};
        this.liveChats = [];
        this.teamChatRooms = null;
        this.blackBoards = null;
        this.chatPanels = [];
        this.teamChatPanels = [];

        this.activeChatGuid = "";
        this.activeTeamChatGuid = "";

        this.numberNewMessagesForUserChat = {};
        this.numberNewMessagesForLiveChat = {};
        this.numberNewMessagesForTeamRoomOrBlackBoard = {};

        this.chatRoomDetails = {};

        this.lastGetLastChatMessagesResponse = null;
        this.webRtcConfiguration = null;

        this.chatOffers = {};

        this.chatTextBlocks = [];
    },

    addChat: function (chat)
    {
        if (this.isLiveChat(chat))
        {
            this.addLiveChat(chat);
        }
    },

    isLiveChat: function (chat)
    {
        if (!isValid(chat, "getContact().getGUID()"))
        {
            return false;
        }

        var contact = chat.getContact();
        return this.isLiveChatContact(contact);
    },

    isLiveChatContact: function (contact) 
    {
        return !!this.getLiveChatByGuid(contact.getGUID());
    },

    getLiveChatByGuid: function (guid)
    {
        var result = Ext.Array.filter(this.liveChats, function (liveChat)
        {
            return liveChat.getContact() && liveChat.getContact().getGUID() === guid && isValidString(guid);
        }, this);
        return result[0];
    },

    addLiveChat: function (chat)
    {
        if (!isValid(chat))
        {
            return;
        }
        var contact = chat.getContact();
        var messages = chat.getMessages();

        var chatsForContact = this.getLiveChat(contact.getGUID());
        if (isValid(chatsForContact))
        {
            var oldChats = chatsForContact.getMessages();
            Ext.each(messages, function (message)
            {
                oldChats.push(message);
            });
        }
        else
        {
            this.liveChats.push(chat);
        }
    },
    
    addLastChatMessage: function (chat)
    {
        if (!isValid(chat))
        {
            return;
        }

        var contact = chat.getContact();
        
        this.lastChatMessages[contact.getGUID()] = chat;
    },

    getLastChatMessage: function (guid)
    {
        return this.lastChatMessages[guid];
    },
    
    isLastMessageLoading: function ()
    {
        return !isValid(this.lastGetLastChatMessagesResponse);
    },

    setActiveTeamChatPanel: function (teamChatGuid)
    {
        this.activeTeamChatGuid = teamChatGuid;
    },

    removeActiveTeamChatPanel: function (teamChatGuid)
    {
        //die Überprüfung muss sein, wenn man im ConversationsTabPanel von einem TeamChat zu einem anderen wechselt. zuerst würde der neue seine Guid eintragen und erst dann der alte die entfernen, was falsch wäre
        if (this.activeTeamChatGuid === teamChatGuid)
        {
            this.activeTeamChatGuid = "";
        }
    },

    isTeamChatActive: function (teamChatGuid)
    {
        return this.activeTeamChatGuid === teamChatGuid;
    },

    setActiveChatPanel: function (contact)
    {
        this.activeChatGuid = contact.getGUID();
    },

    removeActiveChatPanel: function (contact)
    {
        if (this.activeChatGuid === contact.getGUID())
        {
            this.activeChatGuid = "";
        }
    },

    isChatPanelActive: function (guid)
    {
        return this.activeChatGuid === guid;
    },

    addChatPanel: function (panel) {
        this.chatPanels.push(panel);
    },

    removeChatPanel: function (panel) {
        Ext.Array.remove(this.chatPanels, panel);
    },

    addTeamChatPanel: function (panel)
    {
        this.teamChatPanels.push(panel);
    },

    removeTeamChatPanel: function (panel)
    {
        Ext.Array.remove(this.teamChatPanels, panel);
    },

    isTeamChatPanelVisible: function (teamChat)
    {
        if (!isValid(teamChat))
        {
            return false;
        }
        var result = false;
        Ext.each(this.teamChatPanels, function (teamChatPanel)
        {
            if (teamChatPanel.teamChat && teamChatPanel.teamChat.equals(teamChat))
            {
                result = true;
            }
        });
        return result;
    },

    isChatPanelVisibleForContact: function (contact) 
    {
        if (!isValid(contact)) 
        {
            return false;
        }
        var result = false;
        Ext.each(this.chatPanels, function (chatPanel) {
            if (chatPanel.contact && chatPanel.contact.equals(contact)) {
                result = true;
            }
        });
        return result;
    },

    getLiveChat: function (guid) 
    {
        return this.getLiveChatByGuid(guid);
    },

    getLastLiveChatByChatId: function (chatId)
    {
        var liveChats = this.getLiveChatsByChatId(chatId);
        if (Ext.isEmpty(liveChats))
        {
            return null;
        }
        return liveChats[liveChats.length - 1];
    },

    getLiveChatsByChatId: function (chatId)
    {
        return this.liveChats.filter(function (liveChat)
        {
            return liveChat.liveChatId === chatId;
        });
    },

    isLiveChatFinished: function (chatId)
    {
        var liveChat = this.getLastLiveChatByChatId(chatId);
        return liveChat && liveChat.isFinishedBy;
    },

    onFinishChatSuccess: function (response, chatId, contact)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            return;
        }
        
        if (this.isLiveChatFinished(chatId))
        {
            return;
        }

        var liveChat = this.getLastLiveChatByChatId(chatId);
        if (isValid(liveChat))
        {
            liveChat.isFinishedBy = LiveChatFinishReason.Agent;
            liveChat.endDateTime = new Date();
        }
    },

    onConnectionLost: function ()
    {
        this.finishAllOpenLiveChats();
    },

    onBeforeUnload: function ()
    {
        this.finishAllOpenLiveChats();
    },

    finishAllOpenLiveChats: function ()
    {
        Ext.each(this.liveChats, function (liveChat)
        {
            if (!isValid(liveChat.isFinishedBy))
            {
                liveChat.isFinishedBy = LiveChatFinishReason.ConnectionLost;
            }
            liveChat.endDateTime = new Date();
        });
    },

    getTeamChatRooms: function ()
    {
        if (isValid(this, "teamChatRooms"))
        {
            return Object.values(this.teamChatRooms);
        }
        return [];
    },

    updateTeamChatRoom: function (teamChatRoom)
    {
        if (!teamChatRoom)
        {
            return;
        }
        this.teamChatRooms[teamChatRoom.getGuid()] = teamChatRoom;
    },

    updateBlackBoard: function (blackBoard)
    {
        if (!blackBoard)
        {
            return;
        }
        this.blackBoards[blackBoard.getGuid()] = blackBoard;
    },

    isTeamChatRoomsLoaded: function ()
    {
        return isValid(this.teamChatRooms);
    },

    getBlackBoards: function () 
    {
        if (isValid(this, "blackBoards")) 
        {
            return Object.values(this.blackBoards);
        }
        return [];
    },

    isBlackBoardsLoaded: function ()
    {
        return isValid(this.blackBoards);
    },

    getTeamChatRoomOrBlackBoardForGuid: function (guid)
    {
        var result;
        var filterForGuidFunction = function (teamChatRoom)
        {
            if (guid === teamChatRoom.getGuid())
            {
                result = teamChatRoom;
            }
        }; 
        var teamChatRooms = this.getTeamChatRooms();
        Ext.each(teamChatRooms, filterForGuidFunction);
        var blackBoards = this.getBlackBoards();
        Ext.each(blackBoards, filterForGuidFunction);
        return result;
    },

    isBlackBoard: function (teamChatRoom)
    {
        if (!isValid(teamChatRoom))
        {
            return false;
        }
        var guid = teamChatRoom.getGuid();
        var blackBoards = this.getBlackBoards();
        var result;
        Ext.each(blackBoards, function (blackBoard)
        {
            if (guid === blackBoard.getGuid())
            {
                result = blackBoard;
            }
        });
        return !!result;
    },

    getChosenTeamChatRooms: function (clientSettingsKey)
    {
        clientSettingsKey = clientSettingsKey || "chosenTeamChatRooms";
        var self = this;
        var result = [];
        var teamChatRoomsInJSON = CLIENT_SETTINGS.getSetting("CHAT", clientSettingsKey) || []; //inJSON meint hier, dass die gespeicherten Objekte reine JSON-Objekte sind, ohne die ganzen Methoden eines Chatraums, deshalb wird das hier noch umgewandelt
        Ext.each(teamChatRoomsInJSON, function (teamChatRoomInJSON)
        {
            var teamChatRoom = self.getTeamChatRoomOrBlackBoardForGuid(teamChatRoomInJSON.Guid || teamChatRoomInJSON._Guid);
            if (!isValid(teamChatRoom))
            {
                teamChatRoom = new www_caseris_de_CaesarSchema_ChatRoomInfo();
                Ext.apply(teamChatRoom, teamChatRoomInJSON);
                teamChatRoom.setDeleted(true);
            }
            result.push(teamChatRoom);
        });
        return result;
    },

    getChoosableTeamChatRooms: function ()
    {
        return this.getChoosableRooms(this.clientSettingsKeyForTeamChats, this.getTeamChatRooms());
    },

    getChoosableBlackBoards: function ()
    {
        return this.getChoosableRooms(this.clientSettingsKeyForBlackBoards, this.getBlackBoards());
    },

    getChoosableRooms: function (clientSettingsKey, teamChatRooms)
    {
        var choosableTeamChatRooms = [];
        var chosenTeamChatRoom = this.getChosenTeamChatRooms(clientSettingsKey);
        var chosenTeamChatRoomGUIDS = Ext.Array.pluck(chosenTeamChatRoom, "Guid");
        
        Ext.each(teamChatRooms, function (teamChatRoom) {
            if (Ext.Array.contains(chosenTeamChatRoomGUIDS, teamChatRoom.getGuid())) {
                return;
            }
            choosableTeamChatRooms.push(teamChatRoom);
        });
        
        return choosableTeamChatRooms;
    },
    
    onGlobalEvent_openTeamChat: function (teamChat)
    {
        
    },

    getCountNewChatMessages: function ()
    {
        var count = 0;
        var counters = [];

        if (SESSION.isFeatureAllowed(TimioFeature.Chat))
        {
            counters.push(this.numberNewMessagesForUserChat);
            counters.push(this.numberNewMessagesForTeamRoomOrBlackBoard);
        }

        if (SESSION.isFeatureAllowed(TimioFeature.LiveChat))
        {
            counters.push(this.numberNewMessagesForLiveChat);
        }
        
        Ext.each(counters, function (counter)
        {
            Ext.iterate(counter, function (guid, number)
            {
                count += number;
            });
        });
        
        return count;
    },

    setNumberNewMessagesForUserChat: function (guid, number)
    {
        this.numberNewMessagesForUserChat[guid] = number;

        GLOBAL_EVENT_QUEUE.onGlobalEvent_NumberChatMessagesChanged();
    },

    setNumberNewMessagesForLiveChat: function (guid, number)
    {
        this.numberNewMessagesForLiveChat[guid] = number;

        GLOBAL_EVENT_QUEUE.onGlobalEvent_NumberChatMessagesChanged();
    },

    setNumberNewMessagesForTeamRoomOrBlackBoard: function (guid, number)
    {
        var teamChatRoomOrBlackBoard = this.getTeamChatRoomOrBlackBoardForGuid(guid);
        if (isValid(teamChatRoomOrBlackBoard) && teamChatRoomOrBlackBoard.getActivationStatus() === "Deactivated")
        {
            number = 0;
        }
        this.numberNewMessagesForTeamRoomOrBlackBoard[guid] = number;

        GLOBAL_EVENT_QUEUE.onGlobalEvent_NumberChatMessagesChanged();

        return number;
    },

    addNumberNewMessagesForUserChat: function (guid, number)
    {
        if (this.isChatPanelActive(guid))
        {
            return;
        }
        var currentNumber = this.numberNewMessagesForUserChat[guid] || 0;
        this.numberNewMessagesForUserChat[guid] = currentNumber + number;
        
        GLOBAL_EVENT_QUEUE.onGlobalEvent_NumberChatMessagesChanged();
    },

    addNumberNewMessagesForLiveChat: function (guid, number)
    {
        if (this.isChatPanelActive(guid))
        {
            return;
        }
        var currentNumber = this.numberNewMessagesForLiveChat[guid] || 0;
        this.numberNewMessagesForLiveChat[guid] = currentNumber + number;

        GLOBAL_EVENT_QUEUE.onGlobalEvent_NumberChatMessagesChanged();
    },

    addNumberNewMessagesForTeamRoomOrBlackBoard: function (guid, number)
    {
        if (this.isTeamChatActive(guid))
        {
            return;
        }
        var currentNumber = this.numberNewMessagesForTeamRoomOrBlackBoard[guid] || 0;
        this.numberNewMessagesForTeamRoomOrBlackBoard[guid] = currentNumber + number;

        GLOBAL_EVENT_QUEUE.onGlobalEvent_NumberChatMessagesChanged();
    },

    onGlobalEvent_ChatChannelSelected: function ()
    {
        this.numberNewMessagesForUserChat = {};
        this.numberNewMessagesForLiveChat = {};
        this.numberNewMessagesForTeamRoomOrBlackBoard = {};
    },

    getChatConfiguration: function ()
    {
        return this.chatConfiguration;
    },

    onLoadChatTextBlocksSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.chatTextBlocks = response.ChatTextBlocks || [];
            this.sortChatTextBlocksByCategory();
        }
        else
        {
            showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    sortChatTextBlocksByCategory: function ()
    {
        this.chatTextBlocks = Ext.Array.sort(this.chatTextBlocks, function (textBlock1, textBlock2)
        {
            var category1 = textBlock1.Category;
            var category2 = textBlock2.Category;

            return category1.localeCompare(category2);
        });
    },

    onLoadChatTextBlocksException: function ()
    {
        showWarningMessage(LANGUAGE.getString("errorLoadChatTextBlocks"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onAddChatTextBlockSuccess: function (response, textBlock)
    {
        if (response.returnValue.Code === 0)
        {
            textBlock.Id = response.Id;
            this.chatTextBlocks = this.chatTextBlocks || [];
            this.chatTextBlocks.push(textBlock);

            this.sortChatTextBlocksByCategory();
        }
    },

    onUpdateChatTextBlockSuccess: function (response, editedTextBlock)
    {
        if (response.returnValue.Code === 0)
        {
            var index = this.getIndexForChatTextBlock(editedTextBlock);
            if (index !== -1)
            {
                this.chatTextBlocks[index] = editedTextBlock;
            }

            this.sortChatTextBlocksByCategory();
        }
    },

    onDeleteChatTextBlockSuccess: function (response, record)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var index = this.getIndexForChatTextBlock(record.data);
            if (index !== -1)
            {
                Ext.Array.removeAt(this.chatTextBlocks, index);
            }
        }
    },

    getIndexForChatTextBlock: function (editTextBlock)
    {
        if (!isValidString(editTextBlock.Id))
        {
            return -1;
        }
        var foundIndex = -1;
        Ext.each(this.chatTextBlocks, function (textBlock, index)
        {
            if (textBlock.Id === editTextBlock.Id)
            {
                foundIndex = index;
                return false;
            }
        });
        return foundIndex;
    },

    getChatTextBlocks: function ()
    {
        return this.chatTextBlocks;
    },

    getCategories: function () 
    {
        var categories = [];
        if (this.chatTextBlocks) 
        {
            this.chatTextBlocks.forEach(function (TextBlock)
            {
                if (!categories.includes(TextBlock.Category))
                {
                    categories.push(TextBlock.Category);
                }
            });
        }

        return categories;
    },

    doesCategoryExist: function (category)
    {
        var categories = this.getCategories();
        if (Ext.isEmpty(categories) && category === "")
        {
            return true;
        }
        return Ext.Array.contains(this.getCategories(), category);
    }
});

var CURRENT_STATE_CHATS = Ext.create('CurrentState_Chats', {});