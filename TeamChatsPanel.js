Ext.define('Ext.layout.container.Null', {
    alias: ['layout.null', 'layout.nullcontainer'],
    extend: 'Ext.layout.container.Container',
    type: 'nullcontainer',

    reserveScrollbar: false,
    managePadding: false,
    manageOverflow: false,
    needsItemSize: false,
    setsItemSize: false,

    renderTpl: [
        '{%this.renderBody(out,values)%}'
    ]
});

Ext.define('TeamChatRoom',
{
    extend: 'Ext.data.Model',
    fields:
    [
        { name: 'DisplayName', type: 'string' },
        { name: 'Description', type: 'string' },
        { name: 'Type', type: 'string' },
        { name: 'numberNewChatMessages', type: 'number', doNotCopy: true },
        { name: 'waitMessage', type: 'boolean' },
        { name: 'errorMessage', type: 'string' },
        { name: 'ActivationStatus', type: 'string' },
        { name: 'Deleted', type: 'boolean', defaultValue: false },
        { name: 'subscribeSuccess', type: 'boolean', defaultValue: true , doNotCopy: true},
        { name: 'freshlyAdded', type: 'boolean', defaultValue: false },
        { name: 'teamchatroom' },
        { name: 'lastMessage', type: 'string' , doNotCopy: true },
        { name: 'chatDateAsDate', type: 'date', doNotCopy: true },
        { name: 'senderName', type: 'string', doNotCopy: true }
    ]
});

Ext.define('TeamChatStore',
{
    extend: 'Ext.data.Store',

    model: 'TeamChatRoom',
    sorters:
    [
        {
            sorterFn: compareChatByLastMessageDate,
            direction: 'ASC'
        }
    ]
});

function getTemplateForTeamChat()
{
    return new Ext.XTemplate('<tpl for=".">' +
                        '<tpl if="waitMessage">' +
                            getWaitCursorTemplate('overviewContact') +
                        '<tpl elseif="isValidString(errorMessage)">' +
                            '<div class="overviewContact">{errorMessage}</div>' +
                        '<tpl else>' +
                        '<div class="overviewContact" chatGuid="{guid}" style="padding:' + VIEWS_PADDING + ';display:flex;border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';">' +
                            '<div class="' + CLASS_CONTACT_PHOTO + '" style="height:' + PhotoSizes.Default.height + 'px;width:' + PhotoSizes.Default.width + 'px;"></div>' +
                            '<div class="hideForOverlayButtons" style="flex:1;flex-direction: column;margin:0px 5px 0 15px">' +
                                '<div style="display:flex;">' +
                                    '<div class="eclipsedText" style="{[values.getStyleForFirstRow()]}">{[values.getFirstRow()]}</div>' +
                                    '<tpl if="this.wasSubscribeSuccessfull(values)">' +
                                        '<tpl if="numberNewChatMessages &gt; 0 && values.isDeleted() === false">' +
                                            '<div class="badge innerLabel hideForOverlayButtons" style="margin-top:3px">{numberNewChatMessages}</div>' +
                                        '</tpl>' +
                                    '<tpl else>' +
                                        '<div class="badge innerLabel hideForOverlayButtons unsuccessfullSubscribe " style="" title="' + LANGUAGE.getString("tooltipSubscribeNotSuccessful") + '">?</div>' +
                                    '</tpl>' +
                                '</div>' +
                                '<div style="display:flex">'+
                                    '<tpl if="isValidString(values.senderName)">' +
                                        '<div style="font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_MAIN_2 + ';margin-right:5px">{senderName}:</div>' +
                                    '</tpl>' +
                                    '<div class="eclipsedText" style="' + TEMPLATE_STYLE_TEXT('{[values.getSecondRow()]}', '0') + ';flex:1;">{[values.getSecondRow()]}</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="showForOverlayButtons" style="margin-left:5px;display:none;flex:1"></div>' +
                        '</tpl>' +
                        '</div>' +
                 '</tpl>',
    {
        wasSubscribeSuccessfull: function (teamChatRoom)
        {
            return teamChatRoom.subscribeSuccess;
        }
    });
}


Ext.define('TeamChatsListPanel',
{
    extend: 'BaseChatsPanel',

    panelClassName: 'TeamChatPanel',

    teamChatRoomsLoaded: false,

    plugins:
    [
        {
            ptype: 'TeamChatViewWithPhotos'
        }
    ],
    
    initComponent: function ()
    {
        this.tpl = getTemplateForTeamChat();

        this.callParent();

        this.setStore(Ext.create('TeamChatStore',
        {

        }));

        if (this.isDataAlreadyLoaded())
        {
            this.onDataLoadedSuccessfully();
        }
        else
        {
            this.getStore().add(this.createWaitCursorEntry());
        }

        this.on('boxready', function (view) {

            view.getEl().on('click', function (event, node)
            {
                event.stopEvent();

                var record = event.record;
                if (isValid(record))
                {
                    record.set('subscribeSuccess', true); //damit das Fragezeichen kurz verschwindet und der Benutzer auch das Gefühl hat, dass das Klicken etwas auslöst
                    SESSION.subscribeTeamChatRoom(record.data.getGuid());
                }

            }, null, { delegate: 'div.unsuccessfullSubscribe' });
        });
    },

    getClientSettingsKey: function ()
    {
        return CURRENT_STATE_CHATS.clientSettingsKeyForTeamChats;
    },

    isDataAlreadyLoaded: function ()
    {
        return CURRENT_STATE_CHATS.isTeamChatRoomsLoaded();
    },

    onGetTeamChatRoomsSuccess: function (response)
    {
        this.onDataLoaded(response);
    },

    onDataLoaded: function(response)
    {
        Ext.batchLayouts(function ()
        {
            this.removeWaitCursorEntry();
            if (response.getReturnValue().getCode() === 0)
            {
                this.onDataLoadedSuccessfully();
            }
        }, this);
    },

    onDataLoadedSuccessfully: function ()
    {
        this.teamChatRoomsLoaded = true;
        this.loadChosenTeamChats();

        if (!this.storeListenersAdded)
        {
            var self = this;
            var updateFunction = function (store, records)
            {
                self.saveChosenTeamChats(records);
            };
            this.getStore().on('add', updateFunction);
            this.getStore().on('remove', updateFunction);

            this.storeListenersAdded = true;
        }
    },

    onGetTeamChatRoomsException: function ()
    {
        this.removeWaitCursorEntry();
    },

    saveChosenTeamChats: function (addedRecords)
    {
        if (addedRecords && addedRecords.length > 0)
        {
            if (addedRecords[0].data.waitMessage)
            {
                return;
            }
        }

        var allTeamChats = [];
        this.getStore().each(function (record)
        {
            if (record.data.waitMessage)
            {
                return;
            }
            allTeamChats.push(record.data);
        });
        CLIENT_SETTINGS.addSetting("CHAT", this.getClientSettingsKey(), allTeamChats);
        CLIENT_SETTINGS.saveSettings();
    },

    loadChosenTeamChats: function ()
    {
        var self = this;
        var chosenTeamChatRooms = CURRENT_STATE_CHATS.getChosenTeamChatRooms(this.getClientSettingsKey());
        if (this.getStore().getCount() === 0) 
        {
            this.getStore().add(chosenTeamChatRooms);
            return;
        }

        Ext.each(chosenTeamChatRooms, function (teamChatRoom) 
        {
            self.getStore().each(function (record) 
            {
                if (record.data.getGuid() === teamChatRoom.getGuid()) 
                {
                    self.copyAllFields(record, teamChatRoom);
                }
            });
        });
    },

    copyAllFields: function (targetRecord, sourceChatRoom)
    {
        targetRecord.beginEdit();
        var fields = targetRecord.getFields();
        Ext.each(fields, function (field) 
        {
            if (field.name === 'id' || field.doNotCopy)
            {
                return;
            }
            
            targetRecord.set(field.name, sourceChatRoom[field.name]);
        }, this);
        targetRecord.endEdit();
    },
    
    onAddTeamChat: function (newTeamChat)
    {
        newTeamChat.freshlyAdded = true;
        this.getStore().add(newTeamChat);

        SESSION.subscribeTeamChatRoom(newTeamChat.getGuid());
        
        this.openChatPanel(newTeamChat);
    },

    deleteEntry: function (record, item)
    {
        this.deleteFromStore(record);

        SESSION.unsubscribeTeamChatRoom(record.data.getGuid());
    },

    openChat: function (record, item)
    {
        if (record.data.waitMessage)
        {
            return;
        }

        record.set('numberNewChatMessages', 0);
        CURRENT_STATE_CHATS.setNumberNewMessagesForTeamRoomOrBlackBoard(record.data.getGuid(), 0);

        if (record.data.isDeleted())
        {
            this.createConfirmButton(item, record, LANGUAGE.getString("chatroomWasDeleted"), (record, item) =>
            {
                this.deleteFromStore(record);
            });
        }
        else
        {
            this.openChatPanel(record.data);
        }
    },

    openChatPanel: function (teamChat)
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openTeamChat(teamChat);
    },

    onDoubleClick: function (view, record, item, index, event, opts)
    {
        this.openChat(record, item);
    },

    getActions: function (record, item)
    {
        return new TeamChatActions(record, item, this);
    },

    onDeleteTeamChatHistorySuccess: function (response, guid)
    {
        var record = this.getRecordByGuid(guid);
        if (isValid(record))
        {
            if (response.getReturnValue().getCode() === 0)
            {
                this.resetNumberNewMessages(record);
            }
            else
            {
                showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            }
            this.refreshNode(record); //läßt den roten confirmButton verschwinden
        }
    },

    onDeleteTeamChatHistoryException: function (guid)
    {
        var record = this.getRecordByGuid(guid);
        if (isValid(record))
        {
            showErrorMessage(LANGUAGE.getString("errorDeleteTeamChat"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            this.refreshNode(record); //läßt den roten confirmButton verschwinden
        }
    },

    saveAllTeamChats: function ()
    {
        var allRecords = this.getAllRecords();
        this.saveChosenTeamChats(allRecords);
    },

    getAllRecords: function ()
    {
        var records = [];
        this.getStore().each(function (record)
        {
            records.push(record);
        });
        return records;
    },

    onNewEvents: function (response) {
        var self = this;

        if (isValid(response.getTeamChats()))
        {
            if (isValid(response.getTeamChats().getTeamChatInfos()))
            {
                var teamChatInfos = response.getTeamChats().getTeamChatInfos();
                Ext.each(teamChatInfos, function (teamChatInfo)
                {
                    if (isValid(teamChatInfo.getMessages()))
                    {
                        var contacts = response.getTeamChats().getContacts();
                        self.addChat(teamChatInfo.getMessages(), teamChatInfo.getChatReceiver().getGuid(), contacts);
                    }
                });
            }
        }

        if (isValid(response.getChangedChatRooms()))
        {
            Ext.each(response.getChangedChatRooms().getChangedInfos(), function (changeInfo)
            {
                var foundRecord = self.getRecordByGuid(changeInfo.getChatReceiver().getGuid());
                if (isValid(foundRecord))
                {
                    var alteredChatRoom;
                    Ext.each(response.getChangedChatRooms().getChatRoomInfos(), function (chatRoom)
                    {
                        if (chatRoom.getGuid() === changeInfo.getChatReceiver().getGuid())
                        {
                            alteredChatRoom = chatRoom;
                        }
                    });
                    if (isValid(alteredChatRoom))
                    {
                        if (changeInfo.getReason() === "Deleted")
                        {
                            foundRecord.data.setDeleted(true);
                            foundRecord.set('Deleted', true);
                        }
                        else if (changeInfo.getReason() === "Altered")
                        {
                            self.copyAllFields(foundRecord, alteredChatRoom);
                        }
                        if (!alteredChatRoom.isMemberInRoom(MY_CONTACT.getGUID()))
                        {
                            self.deleteEntry(foundRecord);
                        }
                    }
                }
            });
        }
    },

    onGetChatRoomDetailsSuccess: function (response, guid) 
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var foundRecord = this.getRecordByGuid(guid);
            if (isValid(foundRecord))
            {
                this.copyAllFields(foundRecord, response.getChatRoomDetails().getChatRoomInfo());
            }
        }
    },

    onSubscribeTeamChatRoomSuccess: function (response, teamChatGuid)
    {
        var foundRecord = this.getRecordByGuid(teamChatGuid);
        if (!isValid(foundRecord))
        {
            return;
        }
        if (response.getReturnValue().getCode() === 0) {
            //freshlyAdded bedeutet, dass hier gerade ein neuer teamChat hinzugefügt wurd und dessen Panel auch gleichzeitig aufgemacht wird
            //daher soll hier keine Bubble erscheinen
            if (foundRecord.data.freshlyAdded) {
                foundRecord.data.freshlyAdded = false;
            }
            else
            {
                var number = CURRENT_STATE_CHATS.setNumberNewMessagesForTeamRoomOrBlackBoard(teamChatGuid, response.getNewMessages());
                foundRecord.set('numberNewChatMessages', number); //warum number und nicht auch response.getNewMessages? CURRENT_STATE_CHATS prüft noch, ob der Raum deaktiviert ist und gibt dann ne 0 zurück
                foundRecord.set('subscribeSuccess', true);
            }
            var lastMessage = response.getLastMessage();
            if (lastMessage)
            {
                this.updateLastMessageAndDate(foundRecord, lastMessage, response.SenderName);
            }
        }
        else
        {
            foundRecord.set('subscribeSuccess', false);
        }
    },

    onSubscribeTeamChatRoomException: function (teamChatGuid)
    {
        var foundRecord = this.getRecordByGuid(teamChatGuid);
        if (isValid(foundRecord))
        {
            foundRecord.set('subscribeSuccess', false);
        }
    },

    addChat: function (chatMessages, teamChatGuid, contacts)
    {
        var foundRecord = this.getRecordByGuid(teamChatGuid);
        if (isValid(foundRecord))
        {
            if (!Ext.isEmpty(chatMessages))
            {
                var lastMessage = chatMessages[chatMessages.length - 1];
                var contact = Ext.Array.findBy(contacts, function (contact)
                {
                    return contact.getGUID() === lastMessage.getSenderGuid();
                }, this);
                this.updateLastMessageAndDate(foundRecord, lastMessage, contact.getFullName());
            }
            
            if (CURRENT_STATE_CHATS.isTeamChatActive(teamChatGuid))
            {
                return;
            }
            foundRecord.set('numberNewChatMessages', foundRecord.data.numberNewChatMessages + chatMessages.length);
            CURRENT_STATE_CHATS.addNumberNewMessagesForTeamRoomOrBlackBoard(teamChatGuid, chatMessages.length);
        }
    },

    getRecordsByGuid: function (guid)
    {
        var result = [];
        this.getStore().each(function (record)
        {
            if (!record.data.waitMessage && record.data.getGuid() === guid)
            {
                result.push(record);
            }
        });
        return result;
    },

    onGlobalEvent_TeamChatActive: function (teamChat)
    {
        var foundRecord = this.getRecordByGuid(teamChat.getGuid());
        if (isValid(foundRecord))
        {
            this.resetNumberNewMessages(foundRecord);
        }
    },

    onEnterTeamChatRoomSuccess: function (response, guid)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var foundRecord = this.getRecordByGuid(guid);
            if (isValid(foundRecord))
            {
                this.resetNumberNewMessages(foundRecord);
            }
        }
    },

    selectEntryForFocusedChatPanel: function (panel) {
        var self = this;
        var teamChat = panel.teamChat;
        this.getStore().each(function (record, index) {
            if (record.data.equals(teamChat)) {
                self.getSelectionModel().select(index);
            }
        });
    },

    resetNumberNewMessages: function (record)
    {
        record.set('numberNewChatMessages', 0);
        CURRENT_STATE_CHATS.setNumberNewMessagesForTeamRoomOrBlackBoard(record.data.getGuid(), 0);
    },

    onSendTeamChatMessageSuccess: function (response, records, chatReceiver, chosenFiles)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            return;
        }
        
        var message = response.getMessageEx();
        if (!message)
        {
            return;
        }
        var foundRecord = this.getRecordByGuid(chatReceiver.getGuid());
        if (!foundRecord)
        {
            return;
        }

        this.updateLastMessageAndDate(foundRecord, message, MY_CONTACT.getFullName());
    },

    resetLastMessageAndDate: function (record)
    {
        this.updateLastMessageAndDate(record, null, "");
    },

    updateLastMessageAndDate: function (record, lastMessage, senderName)
    {
        record.beginEdit();
        record.set('lastMessage', this.getTextFromLastChatMessage(lastMessage));
        record.set('senderName', senderName);
        record.set('chatDateAsDate', lastMessage ? new Date(lastMessage.getTime()) : undefined);
        record.endEdit();
    },

    getTextFromLastChatMessage: function (lastMessage)
    {
        return lastMessage ? lastMessage.getText() : "";
    },

    onGlobalEvent_NewLastTeamChatMessage: function (message, teamChatRoom, contact)
    {
        this.getStore().each(function (entry)
        {
            if (entry.data.getGuid() !== teamChatRoom.getGuid())
            {
                return;
            }

            if (isValid(message))
            {
                this.updateLastMessageAndDate(entry, message, contact.getFullName());
            }
            else
            {
                this.resetLastMessageAndDate(entry);
            }
        }, this);
    },
});

Ext.define('TeamChatsPanel',
{
    extend: 'Ext.Container',

    flex: 1,

    initComponent: function ()
    {
        this.callParent();

        this.list = this.add(Ext.create('TeamChatsListPanel',
        {

        }));
    },

    onAddTeamChat: function (newTeamChat)
    {
        this.list.onAddTeamChat(newTeamChat);
    },

    getNumberNewMessages: function ()
    {
        return this.list.getNumberNewMessages();
    },

    openFirstChatWithUnreadMessages: function ()
    {
        return this.list.openFirstChatWithUnreadMessages();
    },

    openFirstChat: function ()
    {
        return this.list.openFirstChat();
    }
});

Ext.define('BlackBoardsListPanel',
{
    extend: 'TeamChatsListPanel',

    panelClassName: 'BlackBoardPanel',

    getTextFromLastChatMessage: function (lastMessage)
    {
        if (!lastMessage)
        {
            return "";
        }
        return lastMessage.getText().split('\n')[0];
    },

    getClientSettingsKey: function ()
    {
        return CURRENT_STATE_CHATS.clientSettingsKeyForBlackBoards;
    },

    isDataAlreadyLoaded: function ()
    {
        return CURRENT_STATE_CHATS.isBlackBoardsLoaded();
    },

    openChatPanel: function (blackBoard) {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openBlackBoard(blackBoard);
    },

    onGetBlackBoardsSuccess: function (response)
    {
        this.onDataLoaded(response);
    },

    onGetBlackBoardsException: function () {
        this.removeWaitCursorEntry();
    },

    onGetTeamChatRoomsSuccess: Ext.emptyFn,

    onGetTeamChatRoomsException: Ext.emptyFn
});

Ext.define('BlackBoardsPanel',
{
    extend: 'Ext.Container',

    flex: 1,

    initComponent: function () {
        this.callParent();

        this.list = this.add(Ext.create('BlackBoardsListPanel',
        {

        }));
    },

    onAddTeamChat: function (newTeamChat) {
        this.list.onAddTeamChat(newTeamChat);
    },

    getNumberNewMessages: function ()
    {
        return this.list.getNumberNewMessages();
    },

    openFirstChatWithUnreadMessages: function ()
    {
        return this.list.openFirstChatWithUnreadMessages();
    },

    openFirstChat: function ()
    {
        return this.list.openFirstChat();
    }
});