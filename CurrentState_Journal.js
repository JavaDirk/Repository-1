var JournalState =
{
    ServerNotAvailable: { value: 0 },
    Loading: { value: 1 },
    Loaded: { value: 2 }
};

Ext.define('CurrentState_Journal',
{
    journal: null,

    newJournalEntries: [], //hier werden journalEntries gespeichert, die via getEvents kommen, bevor das Journal geladen werden konnte

    constructor: function ()
    {
        SESSION.addVIPListener(this);

        if (window.GLOBAL_EVENT_QUEUE)
        {
            GLOBAL_EVENT_QUEUE.addEventListener(this);
        }

        this.journalState = JournalState.ServerNotAvailable;
    },

    destroy: function ()
    {
        SESSION.removeVIPListener(this);
        if (window.GLOBAL_EVENT_QUEUE)
        {
            GLOBAL_EVENT_QUEUE.removeEventListener(this);
        }
        
        this.callParent();
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.reset();
        }
    },

    reset: function ()
    {
        this.journal = null;
        this.newJournalEntries = [];
        this.journalState = JournalState.ServerNotAvailable;
    },

    onNewEvents: function (response)
    {
        var self = this;

        if (response.getCtiWebServiceAvailability() === Caesar.CtiWebServiceAvailability[Caesar.CtiWebServiceAvailability.Available])
        {
            this.journalState = JournalState.Loading;
            SESSION.getJournal();
        }

        if (isValid(response.getJournalEntries()))
        {
            Ext.each(response.getJournalEntries(), function (journalEntry)
            {
                if (isValid(self.journal))
                {
                    self.addToJournal(journalEntry);
                }
                else
                {
                    // dies ist z.B. der Fall, dass wir einen JournalEintrag bekommen, bevor das Journal geladen wurde
                    self.newJournalEntries.push(journalEntry);
                }

                var bodyText = CLIENT_SETTINGS.getSetting('JOURNAL', CLIENT_SETTINGS_KEY_NOTICE_TEXT_FOR_CALL_ID + journalEntry.getCallId());
                if (isValidString(bodyText))
                {
                    self.saveNoteInJournalEntry(journalEntry, bodyText);
                }
            });
        }
    },
    
    onGetJournalSuccess: function (response)
    {
        this.journalState = JournalState.Loaded;
        
        if (response.getReturnValue().getCode() === 0)
        {
            this.journal = response.getJournalEntries();
            var self = this;

            if (isValid(this.newJournalEntries))
            {
                Ext.each(this.newJournalEntries, function (journalEntry)
                {
                    self.addToJournal(journalEntry);
                });
                this.newJournalEntries = [];
            }

            var clientSettingsKeysForNoticeTexts = CLIENT_SETTINGS.getKeysWithPrefix("JOURNAL", CLIENT_SETTINGS_KEY_NOTICE_TEXT_FOR_CALL_ID);
            Ext.each(clientSettingsKeysForNoticeTexts, function (key)
            {
                var bodyText = CLIENT_SETTINGS.getSetting("JOURNAL", key);
                if (!isValidString(bodyText))
                {
                    return;
                }
                
                var callId = Number(key.replace(CLIENT_SETTINGS_KEY_NOTICE_TEXT_FOR_CALL_ID, ""));

                Ext.each(self.journal, function (journalEntry)
                {
                    if (journalEntry.getCallId() === callId)
                    {
                        self.saveNoteInJournalEntry(journalEntry, bodyText);
                    }
                });
            });
        }
    },

    onGetJournalException: function ()
    {
        this.journalState = JournalState.Loaded;
    },

    saveNoteInJournalEntry: function (journalEntry, text, initiatorPanel)
    {
        var notice = journalEntry.getNotice() || new www_caseris_de_CaesarSchema_CTINotice();
        notice.setBody(text);

        journalEntry.setNotice(notice);

        SESSION.updateJournalEntry(journalEntry, initiatorPanel);
    },

    onUpdateJournalEntrySuccess: function (response, updatedJournalEntry, initiatorPanel)
    {
        this.onUpdateJournalEntriesSuccess(response, [updatedJournalEntry]);

        if (response.getReturnValue().getCode() !== 0)  
        {
            if (initiatorPanel && initiatorPanel.destroyed)
            {
                showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            }
        }
    },

    onUpdateJournalEntryException: function (journalEntry, initiatorPanel)
    {
        if (initiatorPanel && initiatorPanel.destroyed) {
            showErrorMessage(LANGUAGE.getString("errorUpdateJournalEntry"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    onUpdateJournalEntriesSuccess: function (response, updatedJournalEntries) {
        if (response.getReturnValue().getCode() === 0)
        {
            var self = this;
            Ext.each(updatedJournalEntries, function (updatedJournalEntry)
            {
                CLIENT_SETTINGS.removeSetting("JOURNAL", CLIENT_SETTINGS_KEY_NOTICE_TEXT_FOR_CALL_ID + updatedJournalEntry.getCallId());

                Ext.each(self.journal, function (journalEntry, index) {
                    if (journalEntry.equals(updatedJournalEntry)) {
                        Ext.Array.replace(self.journal, index, 1, [updatedJournalEntry]);
                    }
                });
            });
            CLIENT_SETTINGS.saveSettings();
        }
    },

    onDeleteJournalEntrySuccess: function (response, journalID)
    {
        var position = -1;
        Ext.each(this.journal, function (journalEntry, index)
        {
            if (journalEntry.getJournalId().equals(journalID))
            {
                position = index;
                return false;
            }
        });

        Ext.Array.removeAt(this.journal, position);
    },

    getJournal: function (filterFunction)
    {
        if (!isValid(this.journal))
        {
            return [];
        }
        var result = Ext.Array.filter(this.journal, filterFunction);
        return result;
    },

    addToJournal: function (newJournalEntry)
    {
        if (!isValid(this.journal))
        {
            return;
        }
        var self = this;
        Ext.each(this.journal, function (journalEntry, index)
        {
            if(journalEntry.equals(newJournalEntry))
            {
                Ext.Array.removeAt(self.journal, index);
                return false;
            }
        });
        Ext.Array.insert(this.journal, 0, [newJournalEntry]);
    },

    getJournalState: function ()
    {
        return this.journalState;
    },

    getCountMissedCalls: function ()
    {
        var countMissedCalls = 0;
        Ext.each(this.journal, function (journalEntry)
        {
            if (journalEntry.getWasRead())
            {
                return false;
            }
            if (journalEntry.isMissedCall())
            {
                countMissedCalls += 1;
            }
            return true;
        });
        return countMissedCalls;
    },

    onGlobalEvent_TelephoneChannelSelected: function ()
    {
        SESSION.markAllJournalEntriesAsRead();
    },

    /*
    onMarkJournalEntriesAsReadSuccess: function (response, journalIDs)
    {
        var self = this;

        if(response.getReturnValue().getCode() === 0)
        {
            Ext.each(self.journal, function (journalEntry)
            {
                Ext.each(journalIDs, function (entry)
                {
                    var id = journalEntry.getJournalId();
                    if(id.getEntryId() === entry.getEntryId() && id.getStorageId() === entry.getStorageId())
                    {
                        journalEntry.setWasRead(true);
                    }
                });
            });
        }
    },
    */
    onMarkAllJournalEntriesAsReadSuccess: function (response) {
        if (response.getReturnValue().getCode() === 0) {
            Ext.each(this.journal, function (journalEntry) {
                journalEntry.setWasRead(true);
            });
        }
    },

    onAddBuddySuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.updateJournalEntriesForNewContact(response.getContact());
        }
    },

    onEditBuddySuccess: function (response, formerGUID)
    {
        if (response.getReturnValue().getCode() === 0) {
            this.updateJournalEntriesForNewContact(response.getContact());
        }
    },

    updateJournalEntriesForNewContact: function (contact)
    {
        var numbers = contact.getAllNumbers();
        if (Ext.isEmpty(numbers))
        {
            return;
        }
        var journalEntriesToUpdate = [];
        Ext.each(this.journal, function (journalEntry)
        {
            if (isValid(journalEntry.getResolvedAddressInfo()) && journalEntry.getResolvedAddressInfo().isRealContact())
            {
                return;
            }
            Ext.each(numbers, function (number)
            {
                if (journalEntry.isForThisNumber(number))
                {
                    journalEntry.setResolvedAddressInfo(contact);
                    var addressInfo = contact.convertToCTIContact(journalEntry.getAddressInfo().getNumber());
                    journalEntry.setAddressInfo(addressInfo);
                    journalEntriesToUpdate.push(journalEntry);
                }
            });
        });
        SESSION.updateJournalEntries(journalEntriesToUpdate);
    }
});

var CURRENT_STATE_JOURNAL = Ext.create('CurrentState_Journal', {});