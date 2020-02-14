Ext.define('RequestStore',
{
    extend: 'Ext.data.Store',
    
    listeners:
    {
        add: function (store, records, index)
        {
            this.onAdd(records, index);
        },
    
        remove: function (store, records, index)
        {
            this.onRemove(records, index);
        }
    },

    constructor: function ()
    {
        this.callParent();

        var self = this;
        this.setSorters([{
            direction: 'DESC',
            sorterFn: function (record1, record2)
            {
                return self.sortRequestFunction(record1, record2);
            }
        }]);

        SESSION.addVIPListener(this);
        REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(this);

        this.createArrivedDateUpdateIntervall();
    },

    onAdd: function (records, index)
    {
        this.requestCount = this.getRequestCount();

        GLOBAL_EVENT_QUEUE.onGlobalEvent_EmailsAdded(this);

        if (this.data.length === records.length)
        {
            this.selectEmail(this.getValidatedIndex(0));
        }
    },

    onRemove: function (records, indexRemovedRecords)
    {
        this.requestCount = this.getRequestCount();

        GLOBAL_EVENT_QUEUE.onGlobalEvent_EmailsAdded(this);

        if (this.data.length > 0)
        {
            var index = -1;
            if (records[0].data.isRequest)
            {
                index = this.getValidatedIndex(indexRemovedRecords);
            }
            else
            {
                index = this.getStoreIndexForFullId(records[0].data.fullId);
                if (index === -1) 
                {
                    //Fall: im Eingang liegt eine Antwort (aber nicht der Request dazu), wenn diese entfernt wird, wird kein Request gefunden, dann müssen wir eine andere mail selektieren
                    //anderer Fall: im Entwürfe-Ordner. Dort gibt es nie requests
                    index = this.getValidatedIndex(indexRemovedRecords);
                }
            }

            if (index !== -1)
            {
                this.selectEmail(index);
                return;
            }
        }
        
        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_displayNoEmailsView(this);
    },

    sortRequestFunction: function (record1, record2)
    {
        if (record1.data.isRequest && record2.data.isRequest)
        {
            return this.compareRequests(record1, record2);
        }
        
        if (record1.data.isRequest !== record2.data.isRequest)
        {
            if (record1.data.isRequest)
            {
                return this.compareRequestAndConversationItem(record1, record2);
            }

            return -1 * this.compareRequestAndConversationItem(record2, record1);
        }

        return this.compareConversationItems(record1, record2);
    },

    compareRequests: function (record1, record2)
    {
        return this.compareDescending(record1, record2);
    },

    compareConversationItems: function (conversationItem1, conversationItem2)
    {
        if (conversationItem1.data.fullId === conversationItem2.data.fullId)
        {
            return this.compareAscending(conversationItem1, conversationItem2);
        }
        return this.compareRequests(conversationItem1.data.request, conversationItem2.data.request);
    },

    compareRequestAndConversationItem: function (request, conversationItem)
    {
        if (request.data.fullId === conversationItem.data.fullId)
        {
            return 1;
        }
        return this.compareRequests(request, conversationItem.data.request);
    },

    compareDescending: function (record1, record2)
    {
        var request1 = record1.data ? record1.data : record1;
        var request2 = record2.data ? record2.data : record2;

        var date1 = new Date(request1.date);
        var date2 = new Date(request2.date);

        if (date1.getTime() === date2.getTime())
        {
            var mailId1 = request1.mailId;
            var mailId2 = request2.mailId;
            return mailId1 < mailId2 ? 1 : (mailId1 === mailId2 ? 0 : -1);
        }
        return date1 > date2 ? 1 : -1; //Anfragen werden umgekehrt chronologisch sortiert
    },

    compareAscending: function (record1, record2)
    {
        return -1 * this.compareDescending(record1, record2);
    },

    getValidatedIndex: function (index)
    {
        if (index >= this.data.length)
        {
            return this.data.length - 1;
        }

        return index;
    },

    getMainRequestByFullId: function (fullId)
    {
        for (var i = 0; i < this.data.length; i++)
        {
            var curEmail = this.data.getAt(i).data;

            if (curEmail.isRequest && curEmail.fullId === fullId)
            {
                return curEmail;
            }
        }

        return undefined;
    },

    selectEmail: function (index)
    {
        Ext.asap(() =>
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_setActiveEmail(index, this);
        }, this);
    },

    createArrivedDateUpdateIntervall: function ()
    {
        var self = this;

        var updateArrivedAsString = function ()
        {
            self.suspendEvents();
            self.getRange().forEach(record => record.set('arrivedAsString', self.getArrivedAsString(record.data.arrived)));
            self.resumeEvents();
            if (self.requestOverview)
            {
                self.requestOverview.refresh();
            }
        };

        this.arrivedDateUpdateIntervall = setInterval(updateArrivedAsString, 60000);
    },

    getArrivedAsString: function (date)
    {
        return (new DateTime(date)).getDifferenceDate(new Date());
    },

    removeArrivedDateUpdateIntervall: function ()
    {
        if (this.arrivedDateUpdateIntervall)
        {
            clearInterval(this.arrivedDateUpdateIntervall);
        }
    },

    // Prüft alle Stati, die als bearbeitet interpretiert werden
    isEmailWorked: function (email)
    {
        var state = email.originalState;

        if (state === emailState.Answered.value || state === emailState.Worked.value || state === emailState.Spam.value || state === emailState.Forwarded.value)
        {
            return true;
        }

        return false;
    },

    getRequestCount: function ()
    {
        var emailCount = 0;

        for (var i = 0; i < this.data.length; i++)
        {
            var curItem = this.data.getAt(i).data;

            if (curItem.isRequest)
            {
                emailCount++;
            }
        }

        return emailCount;
    },

    getLastAgent: function (curMail)
    {
        var agentIds = curMail.getAgentIds();
        var agentName = LANGUAGE.getString('noAgent');
        var curAgent;

        if (agentIds.length > 0 && isValid(CURRENT_STATE_CONTACT_CENTER.getAgent(agentIds[0]), 'getContact()'))
        {
            curAgent = CURRENT_STATE_CONTACT_CENTER.getAgent(agentIds[0]).getContact();
        }

        return curAgent;
    },

    // Prüft ob der gemeldete State der E-Mail gültig ist
    isValidEmail: function (email)
    {
        if (email.originalState === emailState.Canceled.value || email.originalState === emailState.Undefined.value)
        {
            return false;
        }

        return true;
    },

    getStoreConversationItemsForEmail: function (email)
    {
        var conversationItems = [];

        for (var i = 0; i < this.data.length; i++)
        {
            var curStoreEntry = this.data.getAt(i);
            var curEmail = curStoreEntry.data;

            if (parseInt(curEmail.mailId) !== parseInt(email.mailId) && curEmail.fullId === email.fullId)
            {
                conversationItems.push(curStoreEntry);
            }
        }

        return conversationItems;
    },

    // Prüft ob die E-Mail relevant für die jeweilige Ansicht ist
    needStoreEmail: function ()
    {
        return true;
    },

    getInboundOrOutboundMailType: function (email)
    {
        if (email.emailDirection)
        {
            return;
        }

        if (email.getType() === MailType.Outbound.value || email.getType() === MailType.AutoAnswer.value || email.getType() === MailType.Answer.value || email.getState() === emailState.Error.value)
        {
            return MailType.Outbound.value;
        }
        else if (email.getType() === MailType.Copy.value || email.getType() === MailType.Query.value)
        {
            return MailType.Unknown.value;
        }
        else
        {
            return MailType.Inbound.value;
        }
    },

    getShortGuid: function (guid)
    {
        if (!isValidString(guid))
        {
            return guid;
        }
        for (var j = 1; j < guid.length; j++)
        {
            if (guid[j] === "0" && guid[j + 1] === "0")
            {
                continue;
            }
            else if (guid[j] === '0' && guid[j + 1] !== '0')
            {
                guid = guid.substring(j + 1);
                break;
            }
            else
            {
                guid = guid.substring(j);
                break;
            }
        }

        if (guid === "")
        {
            guid = '0';
        }

        return guid;
    },

    // Wenn eine E-Mail angeklickt wurde muss diese auf gelesen gesetzt werden
    markEmailAsReadIfNeeded: function (email)
    {
        if (email.read === emailState.Unread.value)
        {
            SESSION.mailMarkRead(email.mailId, readEmailState.Read.value, function () { }, function () { });

            var curRecord = this.getRecordForMailId(email.mailId);

            if (curRecord)
            {
                curRecord.set('read', readEmailState.Read.value);
            }
        }
    },

    convertAttachments: function (email)
    {
        var attachments = [];

        if (email.getAttachmentsEx())
        {
            attachments = email.getAttachmentsEx();
        }

        return attachments;
    },

    convertAgent: function (email)
    {
        var curAgent;

        if (isValid(email, 'getAgentIds()'))
        {
            curAgent = this.getLastAgent(email);
        }

        return curAgent;
    },

    convertReceiver: function (email)
    {
        var receivers = [];

        if (isValid(email, 'getReceivers()'))
        {
            Ext.each(email.getReceivers(), function (receiver)
            {
                receivers.push(this.encodeContactInformation(receiver));
            }, this);
        }

        if (receivers.length === 0)
        {
            return this.convertEMailAddressInPhoneContacts(email.getTo());
        }

        return receivers;
    },

    convertCCReceiver: function (email)
    {
        return this.convertEMailAddressInPhoneContacts(email.getCC());
    },

    convertBCCReceiver: function (email)
    {
        return this.convertEMailAddressInPhoneContacts(email.getBCC());
    },

    convertEMailAddressInPhoneContacts: function (emailAddresses)
    {
        var contacts = [];
        new EmailAddresses(emailAddresses).each(function (emailAddress)
        {
            var contact = new www_caseris_de_CaesarSchema_PhoneContact();
            contact.setEmail(emailAddress.getCompleteEmailAddress());
            contact.setName(emailAddress.getDisplayName());

            contacts.push(contact);
        }, this);
        return contacts;
    },

    convertEmailAddress: function (email)
    {
        var emailAddress = email.getFrom();

        if (isValid(email, 'getSender().getEmail()'))
        {
            emailAddress = email.getSender().getEmail();
        }

        return emailAddress;
    },

    encodeContactInformation: function (contact)
    {
        if (contact.getName())
        {
            contact.setName(/*Ext.String.htmlEncode*/(contact.getName()));
        }

        if (!contact.getName())
        {
            contact.setName(new EmailAddress(contact.getEmail()).getDisplayName());
        }

        if (contact.getEmail())
        {
            contact.setEmail(contact.getEmail());
        }

        return contact;
    },

    // Konvertiert die E-Mail in ein JSON-Objekt um die Zugriffe zu erleichtern
    convertEmail: function (email, isConversationItem)
    {
        var curAgent = this.convertAgent(email);
        var attachments = this.convertAttachments(email);
        var receivers = this.convertReceiver(email);
        var ccReceivers = this.convertCCReceiver(email);
        var bccReceivers = this.convertBCCReceiver(email);
        var emailAddress = Ext.String.htmlEncode(this.convertEmailAddress(email));

        if (!isValidString(email.getSender().getEmail()))
        {
            email.getSender().setEmail(email.getFrom());
        }
        

        var conversation = [];
        var isClickable = false;

        if (isValid(email, 'getConversation()'))
        {
            conversation = email.getConversation();
            isClickable = true;
        }

        var emailObject =
        {
            receivers: receivers,
            ccReceivers: ccReceivers,
            bccReceivers: bccReceivers,
            emailDirection: this.getInboundOrOutboundMailType(email),
            historyUrl: email.getURLHistory(),
            escalationDate: email.getNextEscalation(),
            isClickable: isClickable,
            isExpanded: false,
            conversation: conversation,
            curWorkingAgent: curAgent,
            mailId: email.getMailId(),
            shortId: this.getShortGuid(email.getTicketId()),
            fullId: email.getTicketId(),
            email: emailAddress,
            name: email.getSender().getName() || emailAddress,
            subject: email.getSubject(),
            arrived: email.getReceived(),
            type: email.getType(),
            state: email.getState(),
            date: email.getCreated(),
            sender: this.encodeContactInformation(email.getSender()),
            attachments: attachments,
            urlBody: email.getURLBody() + '&FontFamily=arial&FontSize=13px&lang=' + urlLanguage[MY_CONTACT.getLanguage()].value,
            urlPrint: email.getURLPrint(),
            urlSource: email.getURLSource(),
            remark: email.getRemark(),
            escalationColor: email.getEscalationLevel(),
            groupId: email.getGroupId(),
            read: email.getRead(),
            originalState: email.getState(),
            arrivedAsString: this.getArrivedAsString(email.getReceived()),
            CC: email.getCC(),
            BCC: email.getBCC(),
            originalTo: email.getTo(),
            isRequest: true
        };

        return emailObject;
    },

    convertConversationItem: function (conversationItem, parentRequest)
    {
        var curAgent = this.convertAgent(conversationItem);
        var attachments = this.convertAttachments(conversationItem);
        var emailDirection = this.getInboundOrOutboundMailType(conversationItem);
        var receivers = this.convertReceiver(conversationItem);
        var emailAddress = Ext.String.htmlEncode(this.convertEmailAddress(conversationItem));

        if (!isValidString(conversationItem.getSender().getEmail()))
        {
            conversationItem.getSender().setEmail(emailAddress);
        }

        var emailObject =
            {
                receivers: receivers,
                emailDirection: emailDirection,
                curWorkingAgent: curAgent,
                mailId: conversationItem.getMailId(),
                shortId: this.getShortGuid(conversationItem.getTicketId()),
                fullId: conversationItem.getTicketId(),
                email: emailAddress,
                name: conversationItem.getSender().getName() || emailAddress,
                subject: conversationItem.getSubject(),
                arrived: conversationItem.getReceived(),
                type: conversationItem.getType(),
                state: conversationItem.getState(),
                date: conversationItem.getCreated(),
                sender: conversationItem.getSender(),
                attachments: attachments,
                urlBody: conversationItem.getURLBody() + '&FontFamily=arial&FontSize=13px&lang=' + urlLanguage[MY_CONTACT.getLanguage()].value,
                urlPrint: conversationItem.getURLPrint(),
                urlSource: conversationItem.getURLSource(),
                remark: conversationItem.getRemark(),
                groupId: conversationItem.getGroupId(),
                read: conversationItem.getRead(),
                originalState: conversationItem.getState(),
                referenceMailId: conversationItem.getReferenceMailId(),
                conversation: [],
                isRequest: false,
                request: parentRequest
            };

        return emailObject;
    },

    // Durchläuft alle gemeldeten E-mail und prüft ob die für die jeweilige Ansicht von Interesse sind
    checkEmails: function (emails)
    {
        var checkEmails = [];

        Ext.batchLayouts(function ()
        {
            Ext.iterate(emails, function (email)
            {
                email = this.convertEmail(email);

                if (this.isValidEmail(email))
                {
                    if (this.needStoreEmail(email))
                    {
                        checkEmails.push(email);
                    }
                    else if (this.getStoreIndexForFullId(email.fullId) >= 0)
                    {
                        this.removeEmail(email);
                    }
                }
                else
                {
                    this.removeEmail(email);
                }

            }, this);

            if (checkEmails.length > 0)
            {
                this.addEmails(checkEmails);
            }
        }, this);
    },

    // Prüft ob die E-mail aktualisiert oder hinzugefügt werden muss
    addEmails: function (emails)
    {
        var newEmails = [];
        Ext.iterate(emails, function (email)
        {
            if (this.getStoreIndexForMailId(email.mailId) < 0)
            {
                newEmails.push(email);
            }
            else
            {
                this.updateEmail(email);
            }
        }, this);

        this.add(newEmails);
    },

    checkIfEmailChanged: function (email, originalEmail)
    {
        if (email.mailId !== originalEmail.mailId || email.originalState !== originalEmail.originalState ||
            email.attachments.length !== originalEmail.attachments.length || email.type !== originalEmail.type)
        {
            return true;
        }

        return false;
    },

    // Aktualisiert eine E-Mail falls sie neu gemeldet wurde
    updateEmail: function (email)
    {
        var curStoreEmail = this.getStoreEntryForFullId(email.fullId);
        var originalStoreIndex = this.getStoreIndexForFullId(curStoreEmail.fullId) + 1;
        var isExpanded = curStoreEmail.isExpanded;

        // Prüfen ob die Anfrage aufgeklappt ist
        if (curStoreEmail.isExpanded)
        {
            var conversation = Ext.clone(email.conversation);
            Ext.iterate(conversation, function (conversationItem, index)
            {
                conversationItem = this.convertConversationItem(conversationItem, email);

                var conversationItemIndex = this.getStoreIndexForMailId(conversationItem.mailId);
                var storeConversationItem = this.getRecordForMailId(conversationItem.mailId);

                // Falls das conversationItem sich an einer anderen Stelle befindet oder noch gar nicht im store vorhanden ist
                if (conversationItemIndex < 0)
                {
                    this.add(conversationItem);
                }
                else if (storeConversationItem)
                {
                    if (this.checkIfEmailChanged(conversationItem, storeConversationItem.data))
                    {
                        storeConversationItem.set(conversationItem);
                    }
                    
                    REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_updateViewIfNeeded(conversationItem, this);
                }

            }, this);
        }

        // Falls ein Konversations-Item entfernt wurde dieses aus dem store entfernen
        if (curStoreEmail.isClickable && email.conversation && curStoreEmail.conversation && email.conversation.length < curStoreEmail.conversation.length)
        {
            var storeConversation = Ext.clone(curStoreEmail.conversation);

            Ext.iterate(storeConversation, function (conversationItem)
            {
                conversationItem = this.convertEmail(conversationItem);

                if (!this.checkConversationItemExists(email, conversationItem))
                {
                    // removeEmail?
                    this.removeConversationItem(conversationItem);
                }
            }, this);
        }

        var record = this.getRecordForMailId(email.mailId);

        if (record)
        {
            email.request = curStoreEmail.request;
            record.set(email);

            if (email.isClickable)
            {
                record.set('isExpanded', isExpanded);
            }
        }
        
    },

    // Wird benötigt um den gelöschten record zu finden (siehe updateEmail)
    checkConversationItemExists: function (email, item)
    {
        var conversation = Ext.clone(email.conversation);
        var contains = false;

        Ext.iterate(conversation, function (conversationItem)
        {
            conversationItem = this.convertConversationItem(conversationItem, email);

            if (parseInt(conversationItem.mailId) === parseInt(item.mailId))
            {
                contains = true;
            }
        }, this);

        return contains;
    },

    removeEmail: function (email)
    {
        var curRecord = this.getRecordForFullId(email.fullId);

        if (curRecord && curRecord.data.isExpanded)
        {
            this.removeConversationForEmail(curRecord.data);
        }

        var record = this.getRecordForFullId(email.fullId);
        this.removeStoreEntry(record);
    },

    removeConversationItem: function (conversationItem)
    {
        var record = this.getRecordForMailId(conversationItem.mailId);
        this.removeStoreEntry(record);
    },

    removeStoreEntry: function (entry)
    {
        this.remove(entry);
    },

    removeStoreEntries: function (entries)
    {
        this.remove(entries);
    },

    getStoreEntryByProperty: function (property, value)
    {
        var storeIndex = this.getStoreIndexByProperty(property, value);

        if (storeIndex >= 0)
        {
            return this.data.getAt(storeIndex).data;
        }

        return undefined;
    },

    getRecordByProperty: function (property, value)
    {
        var storeIndex = this.getStoreIndexByProperty(property, value);

        if (storeIndex >= 0)
        {
            return this.data.getAt(storeIndex);
        }

        return undefined;
    },

    // Gibt das Daten-Objekt zur passenden fullId zurück
    getStoreEntryForFullId: function (fullId)
    {
        return this.getStoreEntryByProperty('fullId', fullId);
    },

    // Gibt das Daten-Objekt zur passenden mailId zurück
    getStoreEntryForMailId: function (mailId)
    {
        return this.getStoreEntryByProperty('mailId', mailId);
    },

    // Gibt den record zur passenden fullId zurück
    getRecordForFullId: function (fullId)
    {
        return this.getRecordByProperty('fullId', fullId);
    },

    // Gibt den record zur passenden mailId zurück
    getRecordForMailId: function (mailId)
    {
        return this.getRecordByProperty('mailId', mailId);
    },

    getMailForMailId: function (mailId)
    {
        var mail;
        this.each(function (record)
        {
            if (record.data.mailId === mailId)
            {
                mail = record.data;
                return false;
            }
            Ext.each(record.data.conversation, function (conversationItem)
            {
                if (conversationItem.MailId === mailId)
                {

                    mail = this.convertConversationItem(conversationItem);
                    return false;
                }
            }, this);
        }, this);
        return mail;
    },

    getStoreIndexByProperty: function (property, value)
    {
        // => FindBy kann hier nicht verwendet werden, da es sich um einen buffered store handelt, somit muss über den ganzen store iteriert werden
        for (var i = 0; i < this.data.length; i++)
        {
            var curItem = this.data.getAt(i).data;
            var searchId = curItem[property];

            if (searchId === value)
            {
                return i;
            }
        }

        return -1;
    },

    getConversationItemsForFullId: function (fullId)
    {
        var recordsWithFullId = this.getRecordsForFullId(fullId);
        return Ext.Array.filter(recordsWithFullId, function (record)
        {
            return !record.data.isRequest;
        });
    },

    getRecordsForFullId: function (fullId)
    {
        return this.getRecordsByProperty('fullId', fullId);
    },

    getRecordsByProperty: function (property, value)
    {
        // => FindBy kann hier nicht verwendet werden, da es sich um einen buffered store handelt, somit muss über den ganzen store iteriert werden
        var result = [];
        this.each(function (record)
        {
            if (record.data && record.data[property] === value)
            {
                result.push(record);
            }
        }, this);
        return result;
    },

    // Gibt den index der gesuchten fullId zurück 
    getStoreIndexForFullId: function (fullId)
    {
        return this.getStoreIndexByProperty('fullId', fullId);
    },

    // Gibt den index der gesuchten mailId zurück 
    getStoreIndexForMailId: function (mailId)
    {
        return this.getStoreIndexByProperty('mailId', parseInt(mailId));
    },

    

    // Fügt die Konversation für eine Anfrage ein
    addConversationForEmail: function (email)
    {
        var conversation = email.conversation;
        var conversationItems = [];

        Ext.batchLayouts(function ()
        {
            Ext.iterate(conversation, function (conversationItem, index)
            {
                conversationItems.push(this.convertConversationItem(conversationItem, email));
            }, this);

            this.add(conversationItems);

            var record = this.getRecordForMailId(email.mailId);

            if (record)
            {
                record.set('isExpanded', true);
            }
        }, this);
    },

    // Löscht die Konversation für eine Anfrage ein
    removeConversationForEmail: function (email)
    {
        Ext.batchLayouts(function ()
        {
            var conversationItemsForFullId = this.getConversationItemsForFullId(email.fullId);
            this.removeStoreEntries(conversationItemsForFullId);

            var record = this.getRecordForMailId(email.mailId);
            if (record)
            {
                record.set('isExpanded', false);
            }
        }, this);
    },

    destroy: function ()
    {
        SESSION.removeVIPListener(this);
        REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(this);

        this.removeArrivedDateUpdateIntervall();

        this.callParent();
    },

    onNewEvents: function (response)
    {
        if (response.getMailMessagesEx && response.getMailMessagesEx())
        {
            this.checkEmails(response.getMailMessagesEx());
        }
    },

    isParentStore: function ()
    {
        return getClassName(this) === "ParentRequestStore";
    },

    isSearchStore: function ()
    {
        return getClassName(this) === "SearchRequestStore";
    },

    isDraftStore: function ()
    {
        return getClassName(this) === "DraftRequestStore";
    },

    isEditStore: function ()
    {
        return getClassName(this) === "EditRequestStore";
    },

    isOpenStore: function ()
    {
        return getClassName(this) === "OpenRequestStore";
    },

    getName: function ()
    {
        return "";
    }
});

Ext.define('OpenRequestStore',
{
    extend: 'RequestStore',

    isConversationItem: function (email)
    {
        if (email.originalState === emailState.Reply3rdParty.value || email.originalState === emailState.Reanswer.value || email.originalState === emailState.Reply.value)
        {
            return true;
        }

        return false;
    },

    needStoreEmail: function (email)
    {
        // Abfrage für eine Anfrage
        if (email.state === emailState.Assigned.value)
        {
            return true;
        }
        // Abfrage für Rückantworten
        else if (email.originalState === emailState.Reply3rdParty.value || email.originalState === emailState.Reanswer.value || email.originalState === emailState.Reply.value)
        {
            // Es sind nur E-Mails mit dem Status Read und Unread interessant
            if (email.read !== readEmailState.Acknowledged.value && email.emailDirection === MailType.Inbound.value)
            {
                return true;
            }
        }

        return false;
    },

    checkEmails: function (emails)
    {
        var newEmails = [];

        Ext.iterate(emails, function (email)
        {
            email = this.convertEmail(email);

            if (this.isValidEmail(email) && this.needStoreEmail(email))
            {
                newEmails.push(email);
            }
            else
            {
                this.removeEmail(email);
            }
        }, this);

        this.addEmails(newEmails);
    },

    addEmails: function (emails)
    {
        Ext.iterate(emails, function (email)
        {
            if (this.getStoreIndexForMailId(email.mailId) < 0)
            {
                this.removeStoreEntries(this.getConversationItemsForFullId(email.fullId));
                this.add(email);
            }
            else
            {
                this.updateEmail(email);
            }

        }, this);
    },

    addUnreadReanswers: function (email)
    {
        var conversation = Ext.clone(email.conversation);
        var newConversationItems = [];

        Ext.iterate(conversation, function (conversationItem)
        {
            var curConversationItem = this.convertEmail(conversationItem);

            if (this.needStoreEmail(curConversationItem) && this.getStoreIndexForMailId(curConversationItem.mailId) < 0)
            {
                newConversationItems.push(curConversationItem);
            }
        }, this);

        if (newConversationItems.length > 0)
        {
            this.add(newConversationItems);
        }
    },

    getAcknowlegedStoreConversationItemsForEmail: function (email)
    {
        var conversationItems = [];

        var conversation = Ext.clone(email.conversation);

        Ext.iterate(conversation, function (conversationItem)
        {
            conversationItem = this.convertEmail(conversationItem);

            if (conversationItem.read === readEmailState.Acknowledged.value && this.getStoreIndexForMailId(conversationItem.mailId) >= 0)
            {
                conversationItems.push(this.getRecordForMailId(conversationItem.mailId));
            }

        }, this);

        return conversationItems;
    },

    removeEmail: function (email)
    {
        var curRecord = this.getRecordForFullId(email.fullId);

        if (curRecord && curRecord.data.isExpanded)
        {
            this.removeConversationForEmail(email);
        }

        var emailStoreIndex = this.getStoreIndexForFullId(email.fullId);

        // Falls nur noch Rückantworten im Posteingang sind und die Anfrage mir weggenommen oder als 'Bearbeitet' markiert wurde => Alle Rückantworten löschen  
        if (curRecord && this.isConversationItem(curRecord.data))
        {
            if (!this.isValidEmail(email) || this.isEmailWorked(email) || !this.needStoreEmail(email))
            {
                var removeItems = this.getAcknowlegedStoreConversationItemsForEmail(email);

                this.removeStoreEntries(removeItems);
            }
            
        }
        // Falls sich die gesamte Anfrage im Posteingang befindet => Die Anfrage löschen und ggf. alle ungelesenen Rückantworten hinzufügen
        else
        {
            this.callParent([email]);
        }

        if (this.isValidEmail(email) && !this.isEmailWorked(email))
        {
            this.addUnreadReanswers(email);
        }

        
    },

    constructor: function ()
    {
        this.callParent();
    },

    getName: function ()
    {
        return LANGUAGE.getString('incoming');
    }
});

Ext.define('EditRequestStore',
{
    extend: 'RequestStore',

    needStoreEmail: function (email)
    {
        var state = email.originalState;

        if (!this.isEmailWorked(email) && state !== emailState.Assigned.value)
        {
            return true;
        }

        return false;
    },

    constructor: function ()
    {
        this.callParent();
    },

    getName: function ()
    {
        return LANGUAGE.getString('inProgress');
    }
});

Ext.define('TodayRequestStore',
{
    extend: 'RequestStore',

    needStoreEmail: function (email)
    {
        var escalationColor = email.escalationColor.toLowerCase();

        if (!this.isEmailWorked(email) && escalationColor === RequestEscalationLevel.Low.value)
        {
            var differenceInMilliSeconds = new Date(email.escalationDate).getTime() - new Date(email.arrived).getTime();
            
            if (differenceInMilliSeconds < ONE_DAY)
            {
                return true;
            }
        }

        return false;
    },

    constructor: function ()
    {
        this.callParent();
    },

    getName: function ()
    {
        return LANGUAGE.getString('workToday');
    }
});

Ext.define('OverdueRequestStore',
{
    extend: 'RequestStore',

    needStoreEmail: function (email)
    {
        var escalationColor = email.escalationColor.toLowerCase();

        if (!this.isEmailWorked(email) && escalationColor !== RequestEscalationLevel.Low.value)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    constructor: function ()
    {
        this.callParent();
    },

    getName: function ()
    {
        return LANGUAGE.getString('overdue');
    }
});

Ext.define('WorkedRequestStore',
{
    extend: 'RequestStore',

    createArrivedDateUpdateIntervall: Ext.emptyFn,

    needStoreEmail: function (email)
    {
        return this.isEmailWorked(email);
    },

    constructor: function ()
    {
        this.callParent();
    },

    getName: function ()
    {
        return LANGUAGE.getString('worked');
    }
});

Ext.define('DraftRequestStore',
{
    extend: 'RequestStore',

    createArrivedDateUpdateIntervall: Ext.emptyFn,

    getRequestCount: function ()
    {
        return this.data.length;
    },

    needStoreEmail: function (email)
    {
        if (email.originalState === emailState.Draft.value)
        {
            return true;
        }

        return false;
    },

    checkIfDraftsForEmailExists: function (email)
    {
        var drafts = this.getDraftsByFullId(email.fullId);

        var conversation = Ext.clone(email.conversation);
        var removeDrafts = [];

        var draftsInConversation = this.getDraftsForConversation(Ext.clone(email.conversation));

        Ext.iterate(drafts, function (draft)
        {
            var containsDraft = false;

            Ext.iterate(draftsInConversation, function (conversationItem)
            {
                if (parseInt(conversationItem.mailId) === parseInt(draft.mailId))
                {
                    containsDraft = true;
                }
            }, this);

            if (!containsDraft)
            {
                removeDrafts.push(draft);
            }

        }, this);

        this.removeDrafts(removeDrafts);
    },

    getDraftsForConversation: function (conversation)
    {
        var drafts = [];

        Ext.iterate(conversation, function (conversationItem)
        {
            conversationItem = this.convertEmail(conversationItem);

            if (this.needStoreEmail(conversationItem))
            {
                drafts.push(conversationItem);
            }
        }, this);

        return drafts;
    },

    getDraftsByFullId: function (fullId)
    {
        var drafts = [];

        for (var i = 0; i < this.data.length; i++)
        {
            var curDraft = this.data.getAt(i).data;

            if (curDraft.fullId === fullId)
            {
                drafts.push(curDraft);
            }
        }

        return drafts;
    },

    removeDraftsForEmail: function (email)
    {
        this.removeDrafts(this.getDraftsByFullId(email.fullId));
    },

    checkEmails: function (emails)
    {
        Ext.batchLayouts(function ()
        {
            var drafts = [];
            var removeDrafts = [];

            Ext.iterate(emails, function (email)
            {
                email = this.convertEmail(email);

                if (email.conversation.length > 0)
                {
                    var conversation = Ext.clone(email.conversation);

                    Ext.iterate(conversation, function (conversationItem)
                    {
                        conversationItem = this.convertConversationItem(conversationItem, email);

                        if (!this.isValidEmail(email)) 
                        {
                            this.removeDraftsForEmail(email);
                        }
                        else if (this.needStoreEmail(conversationItem))
                        {
                            drafts.push(conversationItem);
                        }
                    }, this);
                }

                this.checkIfDraftsForEmailExists(email);

            }, this);

            if (drafts.length > 0)
            {
                this.addEmails(drafts);
            }

        }, this);
    },

    removeDrafts: function (drafts)
    {
        var draftRecords = [];

        Ext.iterate(drafts, function (draft)
        {
            draftRecords.push(this.getRecordForMailId(draft.mailId));
        }, this);

        this.removeStoreEntries(draftRecords);
    },

    removeEmail: function (email)
    {
        var removeItems = this.getStoreConversationItemsForEmail(email);

        Ext.iterate(removeItems, function (item)
        {
            this.removeStoreEntry(item);
        }, this);
    },

    constructor: function ()
    {
        this.callParent();
    },

    getName: function ()
    {
        return LANGUAGE.getString('drafts');
    }
});

Ext.define('SearchRequestStore',
{
    extend: 'RequestStore',

    isFlatSearch: false,

    createArrivedDateUpdateIntervall: Ext.emptyFn,

    removeEmail: Ext.emptyFn,

    removeConversationItem: function ()
    {
        return;
    },

    updateEmail: function (email)
    {
        return email;
    },

    onNewEvents: Ext.emptyFn,

    checkEmails: function (emails, isFlatSearch)
    {
        this.isFlatSearch = isFlatSearch;

        Ext.batchLayouts(function ()
        {
            this.removeAll(true);

            var convertedEmails = [];

            Ext.iterate(emails, function (email)
            {
                convertedEmails.push(this.convertEmail(email));
            }, this);

            this.add(convertedEmails);

        }, this);
        
    },

    constructor: function ()
    {
        this.callParent();
    }
});

Ext.define('ParentRequestStore',
{
    extend: 'RequestStore',

    createArrivedDateUpdateIntervall: Ext.emptyFn,

    listeners:
    {
        add: Ext.emptyFn,
        remove: Ext.emptyFn
    },

    constructor: function ()
    {
        this.callParent();
    }
});