var CLIENT_SETTINGS_KEY_FOR_MIGRATED_USER_CHATS = "contactForPersonalChatsWereMigrated";
var CLIENT_SETTINGS_KEY_FOR_CHOSEN_CONTACTS_FOR_USER_CHATS = "chosenContactsForPersonalChats";

Ext.define('ChatContact',
{
    extend: 'Ext.data.Model',
    fields:
    [
        { name: 'userName', type: 'string' },
        { name: 'chatDate', type: 'string' },
        { name: 'chatDateAsDate', type: 'date' },
        { name: 'userImage', type: 'string' },
        { name: 'lastMessage', type: 'string' },
        { name: 'allMessages', type: 'string' },
        { name: 'bubble', type: 'string' },
        { name: 'guid', type: 'string' },
        { name: 'contact' },
        { name: 'attachments' },
        { name: 'direction', type: 'string' },
        { name: 'isWhatsApp', type: 'boolean'}
    ]
});

var getTemplateForContact = function ()
{
    return '<tpl for=".">' +
                        '<tpl if="waitMessage">' +
                            getWaitCursorTemplate('overviewContact') +
                        '<tpl elseif="errorMessage">' +
                            '<div class="overviewContact errorMessage">{lastMessage}</div>' +
                        '<tpl else>' +
                            '<div class="overviewContact" chatGuid="{guid}" style="padding:' + VIEWS_PADDING + ';display:flex;border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';">' +
                                '<div class="' + CLASS_CONTACT_PHOTO + '" style="height:' + PhotoSizes.Default.height + 'px;width:' + PhotoSizes.Default.width + 'px;"></div>' +
                                '<div class="hideForOverlayButtons" style="flex:1;flex-direction: column;margin:0 0 0 15px">' +
                                    '<div style="display:flex;">' +
                                        '<div class="eclipsedText" style="' + TEMPLATE_STYLE_TITLE() + ';flex: 1;">{userName:htmlEncode}</div>' +
                                        '<div class="eclipsedText hideForOverlayButtons" style="padding-top:2px;margin-right:5px;' + TEMPLATE_STYLE_TEXT('{chatDate}', '0') + '">{chatDate}</div>' +
                                    '</div>' +
                                    '<div style="display:flex;justify-content:center; ' + TEMPLATE_STYLE_TEXT('{lastMessage}', '0') + '">' +
                                    '<tpl if="this.lastMessageIsFromMe(values)">' +
                                        '<div style="margin-right:5px;color:' + COLOR_MAIN_2 + '">' + LANGUAGE.getString("you") + ':</div>' +
                                    '</tpl>' +
                                    '<tpl if="this.areAttachmentsAvailable(values)">' +
                                        '<div style="margin-top:1px;width:16px;height:16px;background-size:16px 16px;background-image:url({[this.getImageForAttachments()]})"></div>' +
                                        '<div class="eclipsedText" style="flex:1;color:' + COLOR_TEXT + '">{[this.getTextForAttachments(values)]}</div>' +
                                    '<tpl else>' +
                                        '<div class="eclipsedText" style="flex:1">' +
                                            '<tpl if="isValidString(values.lastMessage)">' +
                                                '{lastMessage:htmlEncode}' +
                                            '<tpl else>' +
                                                LANGUAGE.getString("noMessage") +
                                            '</tpl>' +
                                        '</div>' +
                                    '</tpl>' +
                                        
                                        '<tpl if="numberNewChatMessages &gt; 0">' +
                                            '<div class="badge innerLabel hideForOverlayButtons" style="">{numberNewChatMessages}</div>' +
                                        '</tpl>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="showForOverlayButtons" style="margin-left:5px;display:none;flex:1"></div>' +
                            '</div>' +
                    '</tpl>' +
        '</tpl>';
};

Ext.define('BaseChatsPanel',
{
    extend: 'BaseViewPanel',

    confirmDeleteButtonText: LANGUAGE.getString('removeFromList') + "?",

    initComponent: function () 
    {
        this.tpl = this.tpl || new Ext.XTemplate(getTemplateForContact(),
        {
            getDataForFirstRow: function (contact)
            {
                return Ext.String.htmlEncode(contact.getDisplayName());
            },

            getDataForSecondRow: function (contact)
            {

            },

            getDataForThirdRow: function (contact)
            {

            },

            getImageForAttachments: function ()
            {
                return IMAGE_LIBRARY.getImage("paperclip", 64, NEW_GREY);
            },

            getTextForAttachments: function (values)
            {
                if (values.attachments.length <= 0)
                {
                    return '';
                }

                var chatMessage = new www_caseris_de_CaesarSchema_ChatMessage();
                chatMessage.setAttachments(values.attachments);
                chatMessage.setText(values.lastMessage);

                return chatMessage.getPreviewTextForAttachments();
            },

            areAttachmentsAvailable: function (values)
            {
                if (values.attachments && values.attachments.length > 0)
                {
                    return true;
                }
                return false;
            },

            lastMessageIsFromMe: function (values)
            {
                if (values.direction === "Out")
                {
                    return true;
                }
                return false;
            }
        });


        this.callParent();

        this.setStore(Ext.create('Ext.data.Store',
        {
            model: 'ChatContact',
            sorters: this.getSorters()
        }));

        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function () {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);

        this.callParent();
    },

    getActions: function (record, item)
    {
        return new UserChatActions(record, item, this);
    },

    deleteEntry: function (record, item)
    {
        this.resetRecord(record);

        SESSION.deleteChatHistory(this.getContactOutOfRecord(record).getGUID(), item);

        this.resetNumberNewMessages(record);
    },

    resetRecord: function (record)
    {
        if (!isValid(record))
        {
            return;
        }
        this.updateRecord(record, null, null, 0);
    },

    updateRecord: function (record, chatMessage, chatDate, numberNewChatMessage)
    {
        record.beginEdit();
        record.set('lastMessage', chatMessage ? chatMessage.getText() : "");
        record.set('direction', chatMessage ? chatMessage.getDirection() : "");
        record.set('chatDate', this.formatDate(chatDate));
        record.set('chatDateAsDate', chatDate);
        if (!isValid(record, "data.isWhatsApp"))
        {
            record.set('isWhatsApp', chatMessage ? chatMessage.isWhatsApp : false);
        }
        record.set('attachments', chatMessage ? chatMessage.getAttachments() : null);
        if (isValid(numberNewChatMessage))
        {
            record.set('numberNewChatMessages', numberNewChatMessage);
            var contact = record.contact || record.data.contact;
            if (isValid(contact))
            {
                this.setNumberNewMessagesInCurrentState(contact, numberNewChatMessage);
            }
            
        }
        record.endEdit();
    },

    deleteFromStore: function (record)
    {
        this.getStore().remove(record);

        this.resetNumberNewMessages(record);
    },

    updateChatContact: function (record)
    {
        
    },
    itemSelector: 'div.overviewContact',
    openContactOnSelect: true,
    overlayButtons: true,
    selectedItemCls: 'selectedEntry',
    curChatPanel: {},

    formatDate: function (date)
    {
        if (!Ext.isDate(date))
        {
            return "";
        }
        if (isToday(date))
        {
            return formatTimeString(date);
        }
        return formatDateString(date, true);
    },
    
    filterStoreByOwnGUID: function (record)
    {
        return record.data.guid === MY_CONTACT.getGUID();
    },

    getContactOutOfRecord: function (record)
    {
        return isValid(record, "data.contact") ? record.data.contact : null;
    },

    getSorters: function ()
    {
        return [
            {
                sorterFn: compareChatByLastMessageDate,
                direction: 'ASC'
            }
        ];
    },

    onContactSelected: function (record, item)
    {
        
    },

    updateStore: function (message, contact)
    {
        if (!isValid(contact, "equals"))
        {
            console.log("contact is not defined", self, message, contact);
            return;
        }
        if (!message)
        {
            return;
        }
        var self = this;
        var found = false;
        this.getStore().each(function (storeEntry)
        {
            if (!isValid(storeEntry, "data.contact"))
            {
                console.log("data.contact is not defined", self, storeEntry, message, contact);
                return;
            }
            
            if (self.areContactsEqual(storeEntry.data.contact, contact))
            {
                var chatDate = new Date(message.getTime());
                var numberNewMessages;
                if (message.getDirection() === ChatDirection.In.value)
                {
                    numberNewMessages = CURRENT_STATE_CHATS.isChatPanelActive(contact.getGUID()) ? 0 : storeEntry.data.numberNewChatMessages + 1;
                    
                    self.addNumberNewMessagesInCurrentState(contact, 1);
                    
                }
                self.updateRecord(storeEntry, message, chatDate, numberNewMessages);
                found = true;
            }
        });
        if (!found)
        {
            self.addNumberNewMessagesInCurrentState(contact, 1);
            
            var contactChat = this.convertToContactChat(contact, message, 1);
            this.store.add(contactChat);
        }
    },

    areContactsEqual: function (contact1, contact2)
    {
        if (isValid(contact1, "equals"))
        {
            return contact1.equals(contact2);
        }
        return false;
    },

    addNumberNewMessagesInCurrentState: function (contact, number)
    {
        CURRENT_STATE_CHATS.addNumberNewMessagesForUserChat(contact.getGUID(), number);
    },

    setNumberNewMessagesInCurrentState: function (contact, number)
    {
        CURRENT_STATE_CHATS.setNumberNewMessagesForUserChat(contact.getGUID(), number);
    },

    convertToContactChat: function (contact, lastMessage, numberNewMessages)
    {
        var chatContact = {
            userName: contact.getDisplayNameForLiveChat(this.getStringForUnknownUser()),
            contact: contact,
            numberNewChatMessages: 0,
            lastMessage: "",
            chatDate: null,
            beginEdit: Ext.emptyFn,
            endEdit: Ext.emptyFn,
            set: function (key, value)
            {
                this[key] = value;
            }
        };

        this.addLastMessageToContactChat(chatContact, lastMessage, numberNewMessages);
        return chatContact;
    },

    getStringForUnknownUser: function()
    {
        return LANGUAGE.getString('unknownUser');
    },

    addLastMessageToContactChat: function (chatContact, lastMessage, numberNewMessages)
    {
        if (isValid(lastMessage))
        {
            var date = new Date(lastMessage.getTime());

            this.updateRecord(chatContact, lastMessage, date, numberNewMessages);
        }
        else
        {
            this.updateRecord(chatContact, null, null, numberNewMessages);
        }
    },

    onNewEvents: function (response) 
    {
        this.callParent(arguments);

        Ext.each(response.getChats(), function (chat)
        {
            if (this.isRightChatType(chat))
            {
                var contact = chat.getContact();
                var lastMessage = this.getLastMessage(chat);
                    
                this.updateStore(lastMessage, contact);
            }
        }, this);
    },

    getLastMessage: function (chats) {
        if (isValid(chats)) {
            var messages = chats.getMessages();
            if (messages.length > 0) {
                return messages[messages.length - 1];
            }
        }
        return null;
    },
    
    selectContact: function (self, record, item, index, event, opts)
    {
        this.openChat(record, item);   
    },

    onGlobalEvent_ConversationTabFocus: function (panel)
    {    
        if (getClassName(panel) === this.panelClassName)
        {
            this.selectEntryForFocusedChatPanel(panel);
        }
        else
        {
            var allChatPanelClassNames = ["TeamChatPanel", "BlackBoardPanel", "LiveChatPanel", "UserChatPanel"];
            Ext.Array.remove(allChatPanelClassNames, this.panelClassName);
            if (Ext.Array.contains(allChatPanelClassNames, getClassName(panel)))
            {
                this.getSelectionModel().deselectAll();
            }
        }
    },

    selectEntryForFocusedChatPanel: function (panel)
    {
        var self = this;
        var contact = panel.contact;
        this.getStore().each(function (record, index)
        {
            var contactFromRecord = self.getContactOutOfRecord(record);
            if (contactFromRecord && contactFromRecord.equals(contact))
            {
                self.getSelectionModel().select(index);
            }
        });
    },

    getNumberNewMessages: function ()
    {
        var summedNumber = 0;
        this.getStore().each(function (record)
        {
            summedNumber += record.data.numberNewChatMessages;
        });
        return summedNumber;
    },

    resetNumberNewMessages: Ext.emptyFn,

    onDoubleClick: function (view, record, item, index, event, opts)
    {
        this.openChat(record, item);
    },

    openFirstChatWithUnreadMessages: function ()
    {
        this.getStore().each(function (record)
        {
            if (record.data.numberNewChatMessages > 0)
            {
                this.openChat(record);
                return false;
            }
        }, this);
    },

    openFirstChat: function ()
    {
        if (this.getStore().getCount() === 0)
        {
            return false;
        }
        this.getStore().each(function (record)
        {
            this.openChat(record);
            return false;
        }, this);
        return true;
    }
});

Ext.define('BaseChatsPanelForSingleAndLiveChats',
{
    extend: 'BaseChatsPanel',

    plugins:
    [
        {
            ptype: 'ContactViewWithPhotos'
        }
    ],
            
    onGlobalEvent_ChatActive: function (contact) {
        this.resetNumberNewChatMessagesForContact(contact);
    },

    resetNumberNewChatMessagesForContact: function (contact)
    {
        var record = this.getRecordByGuid(contact.getGUID());
        if (isValid(record))
        {
            this.resetNumberNewMessages(record);
        }
    }
});


Ext.define('UserChatsPanel', {
    extend: 'BaseChatsPanelForSingleAndLiveChats',

    panelClassName: 'UserChatPanel',

    initComponent: function ()
    {
        this.callParent();

        if (CURRENT_STATE_CHATS.isUserChatsLoaded())
        {
            console.log("isUserChatsLoaded = true!");
            this.onGetLastChatMessagesSuccess(CURRENT_STATE_CHATS.getLastResponseForGetLastChatMessages());
        }
        else
        {
            this.getStore().add(this.createWaitCursorEntry());
        }
    },

    setNewPresenceStateAndText: function (guid, state, text)
    {

    },

    onDeleteUserChatMessagesSuccess: function (response, recordsToRemove, messageIds)
    {

    },

    onGetLastChatMessagesSuccess: function (response, guids)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            SESSION.getUnreadMessagesCounts();
        }
        else
        {
            this.showErrorMessage(response.getReturnValue().getDescription());
        }
    },

    onGetLastChatMessagesException: function ()
    {
        this.showErrorMessage(LANGUAGE.getString("errorGetChatHistory"));
    },

    showErrorMessage: function (text)
    {
        var errorMessage =
            {
                errorMessage: true,
                lastMessage: text
            };
        this.getStore().removeAll();
        this.getStore().add(errorMessage);
    },

    onGlobalEvent_NewLastChatMessage: function (message, contact)
    {
        var self = this;
        this.getStore().each(function (entry)
        {
            if (entry.data.contact.getGUID() === contact.getGUID())
            {
                if (isValid(message))
                {
                    var date = new Date(message.getTime());

                    self.updateRecord(entry, message, date, 0);
                }
                else
                {
                    self.updateRecord(entry, null);
                }
            }
        });
    },

    //TODO: eigentlich müsste die Methode aufgesplittet werden und zwar in den Teil, der eigentlich in den onGetLastMessages gehört und in den anderen
    onGetUnreadMessagesCountsSuccess: function (response)
    {
        var unreadMessages = response.getUnreadMessagesCounts();

        //wir zeigen im ChatOverview alle die an, die der Benutzer in seiner Liste gepflegt hat (logisch) und auch die, 
        //die ihm während er offline war, geschrieben haben
        var numberUnreadMessages = 0;
        var chosenChatContacts = this.loadUserChatsFromClientSettings();
        Ext.each(unreadMessages, function (unreadMessage)
        {
            if (unreadMessage.getCount() <= 0)
            {
                return;
            }
            numberUnreadMessages++;

            var contact = unreadMessage.getContact();
            var found = false;
            Ext.each(chosenChatContacts, function (chatContact)
            {
                if (chatContact.GUID === contact.GUID)
                {
                    found = true;
                    return false;
                }
            });
            if (!found)
            {
                chosenChatContacts.push(unreadMessage.getContact());
            }
        });

        this.removeStoreListeners();
        this.getStore().removeAll();
        this.refresh();

        var contactsToAdd = [];
        Ext.each(chosenChatContacts, function (chatContact)
        {
            var contactChat;
            var chatHistory = CURRENT_STATE_CHATS.getLastChatMessage(chatContact.GUID);

            if (isValid(chatHistory))
            {
                var contact = chatHistory.getContact();

                var lastMessage = chatHistory.getMessage();

                var count = 0;

                Ext.each(unreadMessages, function(unreadMessage)
                {
                    if (unreadMessage.getContact().getGUID() === contact.getGUID())
                    {
                        count = unreadMessage.getCount();
                        return false;
                    }
                }, this);
                contactChat = this.convertToContactChat(contact, lastMessage, count);
            }
            else
            {
                contactChat = this.convertToContactChat(chatContact, null, 0);
            }

            if (!this.isAlreadyInStore(contactChat))
            {
                contactsToAdd.push(contactChat);
            }
        }, this);
        this.getStore().add(contactsToAdd);

        this.addStoreListeners();
        if (numberUnreadMessages > 0)
        {
            this.saveUserChatsInClientSettings();
        }
    },

    onGetUnreadMessagesCountsException: function ()
    {
        this.showErrorMessage(LANGUAGE.getString("errorGetChatHistory"));
    },

    addToStore: function (chatContact)
    {
        if (!this.isAlreadyInStore(chatContact))
        {
            this.getStore().add(chatContact);
        }
    },

    isAlreadyInStore: function (chatContact)
    {
        var record = this.getRecordByGuid(chatContact.contact.getGUID());
        return isValid(record);
    },
        
    addStoreListeners: function ()
    {
        if (this.storeListenersAdded)
        {
            return;
        }

        var updateFunction = this.getStoreUpdateFunction();
        this.getStore().on('add', updateFunction);
        this.getStore().on('remove', updateFunction);

        this.storeListenersAdded = true;
    },

    removeStoreListeners: function ()
    {
        var updateFunction = this.getStoreUpdateFunction();
        this.getStore().removeListener('add', updateFunction);
        this.getStore().removeListener('remove', updateFunction);

        this.storeListenersAdded = false;
    },

    getStoreUpdateFunction: function ()
    {
        if (!isValid(this.storeUpdateFunction))
        {
            var self = this;

            this.storeUpdateFunction = function (store, records)
            {
                console.log("storeUpdateFunction triggered:", store, records);
                if (records && records.length > 0)
                {
                    if (records[0].data.waitMessage || records[0].data.errorMessage)
                    {
                        return;
                    }
                }
                self.saveUserChatsInClientSettings();
            };
        }
        return this.storeUpdateFunction;
    },

    onGetChatHistoryException: function ()
    {
        this.removeWaitCursorEntry();
    },

    onSendChatMessageSuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            if (!CURRENT_STATE_CHATS.isLiveChatContact(contact))
            {
                var message = response.getMessage();
                this.updateStore(message, contact);
            }
        }
    },

    isRightChatType: function (chat)
    {
        return !CURRENT_STATE_CHATS.isLiveChat(chat);
    },

    onGlobalEvent_openUserChat: function (contact)
    {
        var record = this.getRecordByGuid(contact.getGUID());
        if (!isValid(record))
        {
            var lastMessage = CURRENT_STATE_CHATS.getLastChatMessage(contact.getGUID());
            var contactChat = this.convertToContactChat(contact, isValid(lastMessage) ? lastMessage.getMessage() : null, 0);
            this.addToStore(contactChat);
        }
        this.resetNumberNewChatMessagesForContact(contact);
    },

    openChat: function (record, item)
    {
        var contact = this.getContactOutOfRecord(record);
        if (!isValid(contact))
        {
            return;
        }
        record.set('numberNewChatMessages', 0);
        CURRENT_STATE_CHATS.setNumberNewMessagesForUserChat(contact.getGUID(), 0);

        GLOBAL_EVENT_QUEUE.onGlobalEvent_openUserChat(contact);
    },

    getRecordsByGuid: function (guid)
    {
        var self = this;
        var foundRecords = [];
        this.getStore().each(function (record)
        {
            if (isValid(record))
            {
                var contact = self.getContactOutOfRecord(record);
                if (isValid(contact) && contact.getGUID() === guid)
                {
                    foundRecords.push(record);
                }
            }
        });
        return foundRecords;
    },

    saveUserChatsInClientSettings: function ()
    {
        var self = this;
        var contacts = {};
        this.getStore().each(function (record)
        {
            var contact = self.getContactOutOfRecord(record);
            if (isValid(contact, "getGUID"))
            {
                contacts[contact.getGUID()] = contact;
            }
            
        });
        this.saveContactsInClientSettings(Object.values(contacts), true);
    },

    resetNumberNewMessages: function (record)
    {
        record.set('numberNewChatMessages', 0);
        CURRENT_STATE_CHATS.setNumberNewMessagesForUserChat(this.getContactOutOfRecord(record).getGUID(), 0);
    },

    saveContactsInClientSettings: function (contacts, invokeSaveSettings) {
        CLIENT_SETTINGS.addSetting("CHAT", CLIENT_SETTINGS_KEY_FOR_CHOSEN_CONTACTS_FOR_USER_CHATS, contacts);
        if (invokeSaveSettings) {
            CLIENT_SETTINGS.saveSettings();
        }
    },

    loadUserChatsFromClientSettings: function () {
        //Einmalig werden die chats aus der chatHistory in die clientSettings migriert
        var contacts = [];
        var contactsAsJSON;
        var migrated = CLIENT_SETTINGS.getSetting("CHAT", CLIENT_SETTINGS_KEY_FOR_MIGRATED_USER_CHATS);

        if (migrated) {
            contactsAsJSON = CLIENT_SETTINGS.getSetting("CHAT", CLIENT_SETTINGS_KEY_FOR_CHOSEN_CONTACTS_FOR_USER_CHATS);
            Ext.each(contactsAsJSON, function (contactAsJSON) {
                var contact = new www_caseris_de_CaesarSchema_Contact();
                contact.deserialize(contactAsJSON);

                contacts.push(contact);
            });
        }
        else
        {
            //wenn noch nicht migriert wurde
            SESSION.getChatHistory();
        }

        return contacts;
    },

    onGetChatHistorySuccess: function (response)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            return;
        }

        var contacts = [];
        Ext.each(response.getCTIChats(), function (chat)
        {
            contacts.push(chat.getContact());
        });
            
        this.saveContactsInClientSettings(contacts, false);

        CLIENT_SETTINGS.addSetting("CHAT", CLIENT_SETTINGS_KEY_FOR_MIGRATED_USER_CHATS, true);
        CLIENT_SETTINGS.saveSettings();

        if (!Ext.isEmpty(contacts))
        {
            showInfoMessage(LANGUAGE.getString("chatContactsWereMigrated"));
        }
    }
});

Ext.define('LiveChatsPanel',
{
    extend: 'BaseChatsPanelForSingleAndLiveChats',

    panelClassName: 'LiveChatPanel',

    deferEmptyText: false,

    plugins:
    [
        {
            ptype: 'LiveChatOverviewWithPhotos'
        }
    ],

    initComponent: function ()
    {
        this.callParent();

        this.setEmptyText(LANGUAGE.getString("noLiveChats"));
    },

    getActions: function (record, item)
    {
        return new LiveChatActions(record, item, this);
    },

    getStringForUnknownUser: function () 
    {
        return LANGUAGE.getString('unknownUser');
    },
    
    isRightChatType: function (chat)
    {
        return CURRENT_STATE_CHATS.isLiveChat(chat);
    },

    onSendChatMessageSuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            if (CURRENT_STATE_CHATS.isLiveChatContact(contact))
            {
                var message = response.getMessage();
                this.updateStore(message, contact);
            }
        }
    },

    openChat: function (record, item)
    {
        record.set('numberNewChatMessages', 0);
        CURRENT_STATE_CHATS.setNumberNewMessagesForUserChat(this.getContactOutOfRecord(record).getGUID(), 0);
        var contact = this.getContactOutOfRecord(record);
        if (!contact)
        {
            return;
        }
        
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openLiveChat(contact);
    },

    onFinishChatSuccess: function (response, chatId, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var record;
            if (!isValid(this.getStore()))
            {
                return;
            }
            this.getStore().each(function (entry)
            {
                if (entry.data.chatId === chatId)
                {
                    record = entry;
                }
            });
            if (isValid(record))
            {
                this.deleteFromStore(record);
            }
        }
    },

    onFinishChatException: function ()
    {
        
    },

    onAcceptChatSuccess: function (response, chatId, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.setVisible(true);

            var liveChat = CURRENT_STATE_CHATS.getLiveChat(contact.getGUID());
            if (isValid(liveChat))
            {
                Ext.each(liveChat.getMessages(), function (message)
                {
                    if (message)
                    {
                        var chatOffer = CURRENT_STATE_CHATS.getChatOffer(chatId);
                        message.isWhatsApp = chatOffer.getMediaType() === "WhatsApp";
                    }
                    this.updateStore(message, liveChat.getContact());

                    GLOBAL_EVENT_QUEUE.onGlobalEvent_ChatActive(liveChat.getContact());
                }, this);
            }
        }
    },


    
    deleteEntry: function (record, item)
    {
        this.callParent(arguments);

        if (this.getStore().getCount() === 0)
        {
            this.hide();
        }
    },
    
    resetNumberNewMessages: function (record)
    {
        record.set('numberNewChatMessages', 0);
        CURRENT_STATE_CHATS.setNumberNewMessagesForLiveChat(this.getContactOutOfRecord(record).getGUID(), 0);
    },

    addNumberNewMessagesInCurrentState: function (contact, number) {
        CURRENT_STATE_CHATS.addNumberNewMessagesForLiveChat(contact.getGUID(), number);
    },

    setNumberNewMessagesInCurrentState: function (contact, number)
    {
        CURRENT_STATE_CHATS.setNumberNewMessagesForLiveChat(contact.getGUID(), number);
    },

    getRecordsByGuid: function (guid)
    {
        var result = [];
        this.getStore().each(function (entry)
        {
            if (entry.data.contact.getGUID() === guid)
            {
                result.push(entry);
            }
        });
        return result;
    },

    areContactsEqual: function (contact1, contact2)
    {
        if (!isValid(contact1) || !isValid(contact2))
        {
            return;
        }

        return contact1.isEqualForLiveChat(contact2);
    }
});
