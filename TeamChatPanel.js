Ext.define('TeamChatHeader',
{
    extend: 'ChatHeader',

    showTyping: false,

    mixins: ['BusinessCard_ShowHideBehaviour'],

    createImage: function ()
    {
        var avatarImageUrl, borderColor;
        if (this.teamChat && this.teamChat.getImageUrl()) {
            avatarImageUrl = this.teamChat.getImageUrl();
            borderColor = 'transparent';
        }
        else {
            avatarImageUrl = this.teamChat.getSmallImage();
            borderColor = COLOR_DARK_AVATAR;
        }

        return Ext.create('TeamChatFoto',
        {
            width: 52,
            height: 52,
            avatarImageUrl: avatarImageUrl,
            borderColor: borderColor,
            showPresenceState: false,
            showAgentState: ShowAgentState.showNever,
            teamChat: this.teamChat
        });
    },

    getName: function ()
    {
        return this.teamChat.getDisplayName() + " - " + this.getChatRoomType();
    },

    getChatRoomType: function ()
    {
        return LANGUAGE.getString("chatRoom");
    },

    createContactInformation: function ()
    {
        var result = [];
        this.descriptionLabel =Ext.create('Ext.form.Label',
        {
            text: this.teamChat.getDescription(),
            style: 'color:' + COLOR_TEXT + ';font-size: ' + FONT_SIZE_TEXT + 'px',
            margin: '0 0 10 0'
        });
        result.push(this.descriptionLabel);
        result.push(this.createModeratorsRow());
        result = Ext.Array.clean(result);
        return result;
    },

    createModeratorsRow: function ()
    {
        if (this.teamChat.getModeratorsCount() <= 0)
        {
            return null;
        }
        
        var moderatorGuids = Ext.pluck(this.teamChat.getModerators(), "Guid");
        this.moderatorsRow = this.createRowForAdminsOrModerators(LANGUAGE.getString("moderator"), LANGUAGE.getString("moderators"), moderatorGuids);
        return this.moderatorsRow;
    },

    createRowForAdminsOrModerators: function (labelTextSingular, labelTextPlural, contactGuids)
    {
        var container = Ext.create('Ext.Container',
        {
            layout: {type: 'column'},
            flex: 1,
            maxHeight: 45, //drei Zeilen
            scrollable: true
        });
        
        var label = contactGuids.length === 1 ? labelTextSingular : labelTextPlural;
        container.add(Ext.create('Ext.form.Label',
        {
            style: 'font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_TEXT,
            text: label + ": ",
            margin: '0 5 0 0'
        }));

        if (isValid(contactGuids))
        {
            Ext.each(contactGuids, function (contactGuid, index)
            {
                var contact = this.getTeamRoomContact(contactGuid);
                if (!isValid(contact))
                {
                    return;
                }

                if (index !== 0)
                {
                    container.add(Ext.create('Ext.form.Label',
                    {
                        margin: '0 5',
                        text: "|",
                        style: 'color:' + BORDER_GREY
                    }));
                }
                container.add(Ext.create('Label',
                {
                    fontSize: FONT_SIZE_TEXT,
                    text: contact.getDisplayName(),
                    contact: contact,
                    listeners:
                    {
                        boxready: (label) =>
                        {
                            label.el.on('mouseenter', this.onMouseEnterModeratorOrAdmin, this);
                            label.el.on('mouseleave', this.onMouseLeaveModeratorOrAdmin, this);
                            label.el.on('contextMenu', this.onContextMenuModeratorOrAdmin, this);
                        }
                    }
                }));
            }, this);
        }
        return container;
    },


    onMouseEnterModeratorOrAdmin: function (event, item)
    {
        var tooltip = Ext.create('BusinessCardTooltipForTeamChatPanel',
        {
            defaultAlign: 'tl-c',
            chatPanel: this
        });
        this.onMouseEnter(item, tooltip);
    },

    onMouseLeaveModeratorOrAdmin: function (event, item)
    {
        this.onMouseLeave(item);
    },

    onContextMenuModeratorOrAdmin: function (item)
    {
        this.onContextMenu(item);
    },

    getTeamRoomContact: function (guid)
    {
        var result;
        Ext.each(this.contacts, function (contact)
        {
            if (contact.getGUID() === guid)
            {
                result = contact;
                return false;
            }
        });
        return result;
    },

    createButtons: function ()
    {
        return [];
    },

    setChatRoom: function (teamChat)
    {
        this.teamChat = teamChat;

        this.nameLabel.setText(this.getName());
        this.descriptionLabel.setText(this.teamChat.getDescription());

        //jetzt haben wir auch die Kontakte für die Moderatoren, Admins und Member
        this.leftContainer.remove(this.moderatorsRow);
        this.contactInformation = this.leftContainer.add(this.createModeratorsRow());
    }
});

Ext.define('ContactListPanelForTeamChat',
{
    extend: 'ContactListPanel',

    flex: undefined,

    style: 'background-color:' + WHITE,

    initComponent: function ()
    {
        this.callParent();

        this.getStore().on('datachanged', this.updateCounter, this);
        
        this.on('boxready', function () 
        {
            if (this.showWaitCursorForContactList())
            {
                showBlackLoadingMask(this);
                setTimeout(() =>
                {
                    if (isValid(this))
                    {
                        hideLoadingMask(this);
                    }
                }, 1500);
            }
        }, this);
    },

    getTemplateString: function ()
    {
        return  '<tpl for=".">' + getContactTemplateString() + '</tpl>';
    },

    updateCounter: function ()
    {
        var count = this.getStore().getCount();
        this.updateSubscriberCounter(count);
    },  

    updateSubscriberCounter: function (count)
    {
        this.count = count || this.count;

        if (!isValid(this, "parentPanel.getHeader()"))
        {
            return;
        }
        if (isStateOk(this.parentPanel.getHeader()))
        {
            var text = LANGUAGE.getString("subscribers");
            if (Ext.isNumber(this.count))
            {
                text += ": " + this.count;
            }
            this.parentPanel.setHeaderTitleText(text);
        }
        else
        {
            Ext.asap(function ()
            {
                this.updateSubscriberCounter(count);
            }, this);
        }
    },

    showWaitCursorForContactList: function ()
    {
        return this.isEmpty() && this.teamChat.getActivationStatus() === "Activated";
    },

    getActions: function (record, item)
    {
        return new TeamChatContactActions(record.data);
    },
    
    onContactSelected: function (record, item)
    {
        
    },

    onNewEvents: function (response)
    {
        this.callParent(arguments);

        if (isValid(response.getTeamUsers())) {
            this.onTeamUsers(response.getTeamUsers());
        }
    },

    onEnterTeamChatRoomSuccess: function (response, guid)
    {
        if (this.teamChat.getGuid() !== guid || this.teamChat.getActivationStatus() === "Deactivated")
        {
            return;
        }

        if (response.getReturnValue().getCode() === 0)
        {
            this.getChatRoomSubscribers();
        }
    },

    getChatRoomSubscribers: function ()
    {
        var self = this;
        SESSION.getTeamChatRoomSubscribers(this.teamChat.getGuid(), function (response) {
            if (response.getReturnValue().getCode() === 0) {
                self.onEnteredUsers(response.getEnteredUsers());
            }
            else {
                hideLoadingMask(self);
                self.showError(response.getReturnValue().getDescription());
            }
        }, function () {
            hideLoadingMask(self);
            self.showError(LANGUAGE.getString("errorGetTeamChatRoomSubscribers"));
        });
    },

    onEnteredUsers: function (response) {
        if (!isValid(response))
        {
            hideLoadingMask(this);
            return;
        }
        var self = this;
        var contacts = isValid(response.getContacts()) ? response.getContacts() : [];

        if (isValid(response.getEnteredUserInfos())) {
            var enteredUserInfos = response.getEnteredUserInfos();
            Ext.each(enteredUserInfos, function (enteredUserInfo) {
                if (enteredUserInfo.getChatReceiver().getGuid() === self.teamChat.getGuid()) {
                    if (isValid(enteredUserInfo.getGuids())) {
                        Ext.each(enteredUserInfo.getGuids(), function (guid) {
                            var contact = self.getContact(guid, contacts);
                            if (isValid(contact)) {
                                self.addContactToContactList(contact, true);
                            }
                        });
                    }
                }
            });
        }
    },

    onTeamUsers: function (teamUsers) {
        var self = this;
        var contacts = isValid(teamUsers.getContacts()) ? teamUsers.getContacts() : [];

        Ext.each(teamUsers.getTeamUserInfos(), function (teamUserInfo) {
            if (teamUserInfo.getChatReceiver().getGuid() === self.teamChat.getGuid())
            {
                Ext.each(teamUserInfo.getEnteredGuids(), function (guid) {
                    var contact = self.getContact(guid, contacts);
                    if (isValid(contact)) {
                        self.addContactToContactList(contact, false);
                    }
                });
                    
                Ext.each(teamUserInfo.getLeftGuids(), function (guid) {
                    var contact = self.getContact(guid, contacts);
                    if (isValid(contact)) {
                        self.removeContactFromContactList(contact);
                    }
                });
            }
        });
    },

    getContact: function (guid, contacts)
    {
        return this.parent.getContact(guid, contacts);
    },

    addContactToContactList: function (contact, initial) {
        hideLoadingMask(this);

        var index = this.getStoreIndexForContact(contact);
        if (index >= 0) {
            return;
        }
        this.getStore().add(contact);
    },
    
    removeContactFromContactList: function (contact) {
        var index = this.getStoreIndexForContact(contact);
        if (index >= 0) {
            this.getStore().removeAt(index);
        }
    },

    getStoreIndexForContact: function (contact) {
        return this.getStore().findBy(function (record) {
            return record.data.equals(contact);
        });
    },

    getWatermarkImage: function () {
        return "";
    },

    onTeamChatRoomChanged: function (newTeamChatRoom, newContacts)
    {

    },

    clear: function()
    {
        this.getStore().removeAll();
        this.updateCounter();
    }
});

Ext.define('TeamChatMessagesPanel',
{
    extend: 'BaseChatMessagesPanel',

    plugins:
    [
        {
            ptype: 'ContactViewWithPhotos',
            showPresenceState: false,
            showAgentState: ShowAgentState.showNever
        }
        ],

    initComponent: function ()
    {
        this.callParent();

        if (this.teamChat.getActivationStatus() === "Deactivated")
        {
            this.showError(LANGUAGE.getString("teamChatRoomWasDeactivated"));
        }
    },

    destroy: function ()
    {
        if (this.loadPreviousMessagesButton)
        {
            this.loadPreviousMessagesButton.destroy();
        }
        this.callParent();
    },

    getMessageId: function (record)
    {
        return record ? record.data.chatMessageId : "";
    },

    deleteMessage: function (record, messageId, recordsToRemove, wasLastMessage)
    {
        var self = this;
        var index = this.getStore().indexOf(record);
        this.getStore().remove(record);
        
        var showErrorFunction = function (message)
        {
            self.getStore().insert(index, record);

            self.parent.showErrorBeforeChatArea(message, ErrorType.Error, DEFAULT_TIMEOUT_ERROR_MESSAGES);
        };

        SESSION.deleteTeamChatMessages(this.teamChat.getGuid(), [messageId], function (response)
        {
            if (response.getReturnValue().getCode() === 0)
            {
                var lastRecord = self.getStore().getAt(self.getStore().getCount() - 1);
                GLOBAL_EVENT_QUEUE.onGlobalEvent_NewLastTeamChatMessage(isValid(lastRecord, "data.originalMessage") ? lastRecord.data.originalMessage : null, self.teamChat, lastRecord ? lastRecord.data.contact : null);
                
            }
            else
            {
                showErrorFunction(response.getReturnValue().getDescription());
            }
        }, function ()
            {
                showErrorFunction(LANGUAGE.getString("errorDeleteTeamChatMessage"));
            });
    },
    
    onTeamChatRoomChanged: function (newTeamChatRoom, newContacts)
    {
        //kann ja sein, dass wir jetzt Moderator sind oder nicht mehr Moderator => delete-Button anzeigen oder eben gerade nicht

        var IamModerator = CURRENT_STATE_CHATS.amIModeratorInRoom(newTeamChatRoom);
        this.showDeleteButton = IamModerator;

        this.tpl = this.getTemplate();
        this.refresh();
    },

    isPanelActive: function ()
    {
        return CURRENT_STATE_CHATS.isTeamChatActive(this.teamChat.getGuid());
    },

    onNewEvents: function (response)
    {
        this.callParent(arguments);

        if (isValid(response.getTeamChats()))
        {
            var isForMe = this.fillChatView(response.getTeamChats(), '', this.getStore().getCount());
            if (isForMe)
            {
                this.parent.letTabBlinkIfNotActive();
            }
        }
    },

    convertChatHistory: function (chatHistoryPromProxy)
    {
        return new TeamChatHistory(chatHistoryPromProxy, this.teamChat.getGuid());
    },

    onTabFocus: function ()
    {
        if (this.newMessagesArrivedWhileInactive)
        {
            requestAnimationFrame(() =>
            {
                this.scrollToLastMessage();
            }, this);
        }
        this.newMessagesArrivedWhileInactive = false;
    },

    convertChatMessageToModel: function (chatMessageEx, contacts)
    {
        var contact = this.parent.getContact(chatMessageEx.getSenderGuid(), contacts);
        var model = this.callParent([chatMessageEx, [contact]]);

        model.chatMessageId = chatMessageEx.getId();
        model.validFrom = isValidString(chatMessageEx.getUtcValidFrom()) ? new Date(chatMessageEx.getUtcValidFrom()) : undefined;
        model.validTo = isValidString(chatMessageEx.getUtcValidTo()) ? new Date(chatMessageEx.getUtcValidTo()) : undefined;
        return model;
    },

    getTeamChatRoomHistory: function (lastKnownMessageId)
    {
        SESSION.getTeamChatRoomHistory(this.teamChat.getGuid(), lastKnownMessageId);
    },

    onGetTeamChatRoomHistorySuccess: function (response, guid, lastKnownMessageId)
    {
        this.onGetChatHistorySuccess(response, guid, lastKnownMessageId);
    },

    onGetTeamChatRoomHistoryException: function (guid, lastKnownMessageId)
    {
        this.onGetChatHistoryException(guid);
    },

    getGuid: function ()
    {
        return this.teamChat.getGuid();
    },

    onEnterTeamChatRoomSuccess: function (response, guid)
    {
        if (this.teamChat.getGuid() !== guid)
        {
            return;
        }

        if (response.getReturnValue().getCode() === 0)
        {
            this.getTeamChatRoomHistory();
        }
    },

    createLoadPreviousMessagesButton: function (response)
    {
        if (this.loadPreviousMessagesButton)
        {
            this.loadPreviousMessagesButton.destroy();
        }
        this.loadPreviousMessagesButton = Ext.create('LoadPreviousMessagesButtonForTeamChat',
        {
            margin: '15 0 0 0',
            parent: this,
            teamChat: this.teamChat,
            response: response
        });
    }
});

Ext.define('TeamChatPanel',
{
    extend: 'ChatPanel',

    showEnteredUsers: true,

    initComponent: function ()
    {
        if (!isValid(this.teamChat))
        {
            console.warn("TeamChatPanel: no this.teamChat given!");
            return;
        }

        this.titleIconBlack = IMAGE_LIBRARY.getImage(this.teamChat.getImageName(), 64, COLOR_TAB_ICON_NORMAL);
        this.titleIconWhite = IMAGE_LIBRARY.getImage(this.teamChat.getImageName(), 64, COLOR_TAB_ICON_SELECTED);

        this.callParent();

        this.setChatRoom(this.teamChat);

        this.on('beforeclose', function () {
            SESSION.leaveTeamChatRoom(this.teamChat.getGuid());
        }, this);

        this.on('boxready', function ()
        {
            CURRENT_STATE_CHATS.addTeamChatPanel(this);

            SESSION.getChatRoomDetails(this.teamChat.getGuid());

            SESSION.enterTeamChatRoom(this.teamChat.getGuid());
        }, this);

        this.on('destroy', function ()
        {
            CURRENT_STATE_CHATS.removeTeamChatPanel(this);
        }, this);
    },

    getContact: function (guid, contacts)
    {
        var foundContact;
        Ext.each(contacts, function (contact)
        {
            if (contact.getGUID() === guid)
            {
                foundContact = contact;
                return false;
            }
        });
        return foundContact;
    },
    
    onGetChatRoomDetailsSuccess: function (response, guid)
    {
        if (this.teamChat.getGuid() !== guid)
        {
            return;
        }
        if (response.getReturnValue().getCode() === 0) {
            var contacts = isValid(response.getChatRoomDetails().getContacts()) ? response.getChatRoomDetails().getContacts() : [];
            this.onTeamChatRoomChanged(response.getChatRoomDetails().getChatRoomInfo(), contacts);
        }
        else if (response.getReturnValue().getCode() === ProxyError.ErrorChatRoomDoesNotExist.value) {
            this.showError(response.getReturnValue().getDescription());
        }
    },

    onGetChatRoomDetailsException: function () {

    },
    
    onTeamChatRoomChanged: function (newTeamChatRoom, newContacts)
    {
        this.header.contacts = newContacts;
        this.header.setChatRoom(newTeamChatRoom);

        //this.contactList.onTeamChatRoomChanged(newTeamChatRoom, newContacts);
        this.chatContainer.onTeamChatRoomChanged(newTeamChatRoom, newContacts);

        this.teamChat = newTeamChatRoom;
        this.updateChatInputContainer();

        this.setTitle();
    },

    createHeader: function () {
        var header = Ext.create('TeamChatHeader',
        {
            parent: this,
            teamChat: this.teamChat,
            contacts: this.contacts
        });
        return header;
    },

    createChatView: function ()
    {
        this.callParent();

        if (this.showEnteredUsers)
        {
            this.contactList = Ext.create('ContactListPanelForTeamChat',
            {
                teamChat: this.teamChat,
                parent: this,
                width: 300,
                margin: "0 0 0 " + MARGIN_BETWEEN_COMPONENTS,
                setParentPanel: function(parentPanel)
                {
                    this.parentPanel = parentPanel;

                    this.updateSubscriberCounter();
                }
            });
            this.body.add(this.createWrappingPanel(this.contactList, LANGUAGE.getString("subscribers"), 'teamChatPanel_subscribers_width'));
        }
    },

    getClientSettingsKeyForMediaList: function ()
    {
        return 'teamChatPanel_mediaList_width';
    },

    createMediaList: function ()
    {
        return Ext.create('MediaListForTeamChat',
        {
            teamChat: this.teamChat,
            width: DEFAULT_WIDTH_FOR_LISTS,
            margin: '0 0 0 ' + MARGIN_BETWEEN_COMPONENTS,
            onClick: (chatMessage) =>
            {
                this.chatContainer.scrollToMessage(chatMessage);
            }
        });
    },

    setChatRoom: function (teamChat, initial)
    {
        if (!isValid(teamChat)) {
            return;
        }

        this.lastStoreItem = null;

        if (this.rendered)
        {
            this.removeAll();          
        }
        
        this.teamChat = teamChat;

        this.setTitle();

        this.createChatView();

        hideLoadingMask(this.chatContainer);
    },

    setTitle: function ()
    {
        if (this.titleIsContactName) {
            this.title = this.teamChat.getDisplayName().toUpperCase();
        }

        if (isValid(this.tab)) {
            this.tab.setText(Ext.String.htmlEncode(this.title));
        }
    },
    
    showWaitCursorForChatContainer: function ()
    {
        return this.chatContainer.isEmpty() && this.teamChat.getActivationStatus() === "Activated";
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && this.teamChat.equals(panel.teamChat);
    },

    onNewEvents: function (response)
    {
        this.callParent(arguments);

        if (isValid(response.getChangedChatRooms()))
        {
            Ext.each(response.getChangedChatRooms().getChangedInfos(), function (changeInfo)
            {
                if (this.teamChat.getGuid() !== changeInfo.getChatReceiver().getGuid())
                {
                    return;
                }
                
                if (changeInfo.getReason() === "Altered")
                {
                    var alteredChatRoom;
                    Ext.each(response.getChangedChatRooms().getChatRoomInfos(), function (chatRoom)
                    {
                        if (chatRoom.getGuid() === changeInfo.getChatReceiver().getGuid())
                        {
                            alteredChatRoom = chatRoom;
                        }
                    });
                    if (!isValid(alteredChatRoom))
                    {
                        return;
                    }
                    
                    if (this.teamChat.getActivationStatus() === "Deactivated" && alteredChatRoom.getActivationStatus() === "Activated")
                    {
                        this.reload();
                    }
                    else if (this.teamChat.getActivationStatus() === "Activated" && alteredChatRoom.getActivationStatus() === "Deactivated")
                    {
                        this.chatContainer.showError(LANGUAGE.getString("teamChatRoomWasDeactivated"));
                        this.chatContainer.removeAll();
                        this.contactList.clear();
                    }

                    if (!alteredChatRoom.isMemberInRoom(MY_CONTACT.getGUID()))
                    {
                        this.parent.removeItem(this);
                        return;
                    }
                    var contacts;
                    if (isValid(response, "getChangedChatRooms().getContacts()"))
                    {
                        contacts = response.getChangedChatRooms().getContacts();
                    }
                    this.onTeamChatRoomChanged(alteredChatRoom, contacts);
                }
                else if (changeInfo.getReason() === "Deleted")
                {
                    this.parent.removeItem(this);
                }
            }, this);
        }
    },

    reload: function()
    {
        this.callParent();

        if (isValid(this.contactList))
        {
            showBlackLoadingMask(this.contactList);
        }
        SESSION.enterTeamChatRoom(this.teamChat.getGuid());
    },
        
    sendMessageToServer: function (text, files, validFrom, validTo, record)
    {
        var attachments = this.convertFilesToAttachments(files);
        SESSION.sendTeamChatMessage(this.teamChat.getGuid(), "Text", text, attachments, validFrom, validTo, record);
    },

    onSendTeamChatMessageSuccess: function (response, records, chatReceiver, chosenFiles)
    {   
        if (response.getReturnValue().getCode() === 0)
        {
            Ext.each(records, function (record)
            {
                record.set('fullDate', new Date(response.getMessageEx().getUtcTime()));
                record.set('chatMessageId', response.getMessageEx().getId());
                record.data.originalMessage = response.getMessageEx();

                this.uploadAttachments(record, response, chosenFiles);
            }, this);
        }
        else
        {
            this.onSendTeamMessageFailed(response.getReturnValue().getDescription(), record);
        }
    },

    getMessageFromResponse: function (response)
    {
        return response ? response.getMessageEx() : null;
    },

    onSendTeamChatMessageException: function (record) 
    {
        this.onSendTeamMessageFailed(LANGUAGE.getString("errorSendChatMessage"), record);
    },

    onSendTeamMessageFailed: function (errorText, record)
    {
        if (isValid(record))
        {
            record.set('error', true);
        }
        this.showErrorAfterChatArea(errorText, ErrorType.Error, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onEnterTeamChatRoomSuccess: function (response, guid)
    {
        if (this.teamChat.getGuid() !== guid)
        {
            return;
        }

        if (response.getReturnValue().getCode() !== 0 && response.getReturnValue().getCode() !== ProxyError.ErrorTeamChatDeactivated.value)
        {
            this.showError(response.getReturnValue().getDescription());
        }
    },

    onEnterTeamChatRoomException: function (guid)
    {
        if (this.teamChat.getGuid() === guid)
        {
            this.showError(LANGUAGE.getString("errorEnterTeamChatRoom"));
        }
    },

    showError: function (errorText)
    {
        if (isValid(this.contactList))
        {
            hideLoadingMask(this.contactList);
        }
        
        hideLoadingMask(this.chatContainer);

        if (CURRENT_STATE_CHATS.isChatServerAvailable())
        {
            this.callParent(arguments);
        }
    },

    onUnsubscribeTeamChatRoomSuccess: function (response, id)
    {
        if (response.getReturnValue().getCode() === 0 && id === this.teamChat.getGuid())
        {
            this.parent.removeItem(this);
        }
    },

    onTabFocus: function ()
    {
        CURRENT_STATE_CHATS.setActiveTeamChatPanel(this.teamChat.getGuid());
        GLOBAL_EVENT_QUEUE.onGlobalEvent_TeamChatActive(this.teamChat);

        this.chatContainer.onTabFocus();
    },

    onTabBlur: function ()
    {
        CURRENT_STATE_CHATS.removeActiveTeamChatPanel(this.teamChat.getGuid());
    },

    isWritingDisallowed: function ()
    {
        return this.isReadOnly || this.teamChat.getActivationStatus() !== "Activated";
    },

    confirmRemove: function ()
    {
        SESSION.leaveTeamChatRoom(this.teamChat.getGuid());
        return true;
    },

    onDeleteTeamChatHistorySuccess: function (response, guid)
    {
        if (response.getReturnValue().getCode() === 0 && guid === this.teamChat.getGuid())
        {
            /*
            laut PQ soll hier gar nix passieren
            this.chatContainer.removeAll();
            self.showErrorAfterChatArea(LANGUAGE.getString("historyDeletedByModerator"), ErrorType.Error, DEFAULT_TIMEOUT_ERROR_MESSAGES);
            */
        }
    },

    createChatMessagesPanel: function ()
    {
        var self = this;
        var IamModerator = CURRENT_STATE_CHATS.amIModerator(this.teamChat.getGuid());
        return Ext.create('TeamChatMessagesPanel', {
            margin: '0 0 0 0',
            flex: 1,
            contact: this.contact,
            teamChat: this.teamChat,
            showDeleteButton: IamModerator,
            parent: this,
            onNewMediaUploaded: function (record)
            {
                self.mediaList.onNewMediaUploaded(record);
            }
        });
    }
});


