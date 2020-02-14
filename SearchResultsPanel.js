getContactTemplateStringWithGrouping = function () {
    return '<tpl for=".">' +
                '<tpl if="' + CONTACT_GROUP_ENTRY + '">' +
                    '<div class="contact searchResultsAddressBookEntry">' +
                        '<div class="groupEntry">{[values.getProfileName()]} {' + CONTACT_NUMBER_HITS + '}</div>' +
                    '</div>' +
                '<tpl elseif="' + CONTACT_WAIT_CURSOR + '">' +
                    getWaitCursorTemplate('contact') +
                '<tpl elseif="isValidString(' + CONTACT_ERROR_MESSAGE + ')">' +
                    '<div class="contact errorMessage" ' + 
                    '<tpl if="xindex !== 1">' + 
                        'style="border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';"' +
                    '</tpl>' +
                    '>{' + CONTACT_ERROR_MESSAGE + '}</div>' +
                '<tpl else>' +
                    getContactTemplateString() +
               '</tpl>' +
            '</tpl>';
};


Ext.define('SearchResultsPanel',
{
    extend: 'ContactListPanel',
    hidden: true,
    overlayButtons: true,
    openContactOnSelect: true,
    placeHolder: '',
    addressBook: ALL_ADDRESS_BOOKS,
    deferEmptyText: true,
    searchNumbers: false,
    scrollable: 'vertical',

    initComponent: function ()
    {
        this.placeHolder = LANGUAGE.getString('noContactsFound');
        this.callParent();

        this.setStore(this.createStore());

        this.on('show', function ()
        {
            //self.setMinHeight(100);
        });
    },

    getTemplateString: function () 
    {
        return getContactTemplateStringWithGrouping();
    },

    getWatermarkImage: function () 
    {
        return "";
    },

    setAddressBook: function (addressBook) 
    {
        this.addressBook = addressBook;
    },

    onCancel: function ()
    {
        this.hide();

        this.searchResultsList.clearContacts();
        this.searchInfoPanel.reset();
    },
    
    startSearch: function (searchString, successfullSearchCallback, successfullCTIActionCallback)
    {
        var self = this;

        this.lastSearchString = searchString;

        this.clearContacts();
        this.onSearchStart(searchString);

        var args = arguments;

        setTimeout(function ()
        {
            SearchResultsPanel.superclass.startSearch.apply(self, args);
        }, 10);
    },

    createWaitCursorEntry: function (addressBook)
    {
        var waitCursorEntry = new www_caseris_de_CaesarSchema_Contact();
        waitCursorEntry.ignore = true;
        waitCursorEntry[CONTACT_WAIT_CURSOR] = true;
        this.setProfileNameForEntry(waitCursorEntry, addressBook);
        return waitCursorEntry;
    },

    replaceWaitCursorEntry: function (addressBook, newEntries)
    {
        var entries = Ext.isArray(newEntries) ? newEntries : [newEntries];
        var sortedEntries = Ext.Array.sort(entries, compareContactByDisplayNameWithLastNameFirst);
        
        var waitCursorEntry = this.getWaitCursorEntry(addressBook);
        this.getStore().insert(this.getStore().indexOf(waitCursorEntry), sortedEntries);
        this.getStore().remove(waitCursorEntry);
    },

    getWaitCursorEntry: function (addressBook)
    {
        var self = this;
        var result = null;
        this.getStore().each(function (entry, index)
        {
            if (entry.data[CONTACT_WAIT_CURSOR] && self.isEntryForAddressBook(entry, addressBook))
            {
                result = entry;
                return false;
            }
        });
        return result;
    },

    createErrorMessageEntry: function (errorMessage)
    {
        var errorMessageEntry = new www_caseris_de_CaesarSchema_Contact();
        errorMessageEntry.ignore = true;
        errorMessageEntry[CONTACT_ERROR_MESSAGE] = errorMessage;
        return errorMessageEntry;
    },

    createMessageEntry: function (message) {
        var errorMessageEntry = new www_caseris_de_CaesarSchema_Contact();
        errorMessageEntry.ignore = true;
        errorMessageEntry[CONTACT_MESSAGE] = message;
        return errorMessageEntry;
    },

    createGroupEntry: function (addressBook) 
    {
        var groupingEntry = new www_caseris_de_CaesarSchema_Contact();
        groupingEntry.ignore = true;
        this.setProfileNameForEntry(groupingEntry, addressBook);
        groupingEntry.groupEntry = true;
        return groupingEntry;
    },

    getGroupEntry: function (addressBook)
    {
        var result = null;
        this.getStore().each(function (entry)
        {
            if (entry.data.groupEntry && this.isEntryForAddressBook(entry, addressBook))
            {
                result = entry;
                return false;
            }
        }, this);
        return result;
    },

    deleteEntriesForAddressBook: function (addressBook)
    {
        var remainingEntries = [];
        this.getStore().each(function (entry)
        {
            if (!this.isEntryForAddressBook(entry, addressBook))
            {
                remainingEntries.push(entry);
            }
        }, this);

        var store = this.createStore();
        store.add(remainingEntries);

        this.bindStore(store); //warum nicht direkt aus dem Store löschen? Bug in ExtJS: wenn man direkt löscht, dann funktioniert u.U. anschließend die Tastaturbedienung nicht
    },

    createStore: function ()
    {
        return Ext.create('Ext.data.Store',
        {
            model: 'Contact'
        });
    },

    isEntryForAddressBook: function (entry, addressBook)
    {
        if (Ext.isString(addressBook))
        {
            return entry.data.addressBook === addressBook;
        }
        else
        {
            return entry.data.addressBook && entry.data.addressBook.getName() === addressBook.getName();
        }
    },

    setProfileNameForEntry: function (entry, addressBook)
    {
        entry.setProfileName(addressBook === LOCAL_CONTACTS ? LANGUAGE.getString("localContacts") : addressBook.getDisplayName());
        entry.addressBook = addressBook;
    },
    
    onSuccessfullSearch: function (toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIActionCallback, response)
    {
        var numberHits = 0;
        if (!isValid(response.getContacts()) || Ext.isEmpty(response.getContacts()))
        {
            this.deleteEntriesForAddressBook(addressBook);
        }
        else
        {
            if (response.getContacts().length === 1 && response.getContacts()[0].isGlobalInfo())
            {
                this.deleteEntriesForAddressBook(addressBook);

                this.globalInfoContact = response.getContacts()[0];
                
                if (new TelephoneNumber(toSearchFor).isMobileNumber())
                {
                    this.globalInfoContact.setMobilePhoneNumbers([toSearchFor]);
                }
                else
                {
                    this.globalInfoContact.setOfficePhoneNumbers([toSearchFor]);
                }
            }
            else
            {
                var lastContact = response.getContacts()[response.getContacts().length - 1];
                lastContact.isLastEntryInGroup = true;
                this.replaceWaitCursorEntry(addressBook, response.getContacts());
                var groupEntry = this.getGroupEntry(addressBook);
                if (isValid(groupEntry)) {
                    groupEntry.data[CONTACT_NUMBER_HITS] = "(" + LANGUAGE.getString("numberHits", response.getContacts().length) + ")";
                }
                numberHits = response.getContacts().length;
            }
        }

        this.results[addressBook.getName()] = numberHits;
        if (this.isSearchInAllAdressBooksFinishedWithNoHits())
        {
            if (isValid(this.globalInfoContact))
            {
                this.showGlobalInfoContact();
            }
            else if (isPhoneNumber(toSearchFor))
            {
                this.showPseudoContactForNumber(toSearchFor);
            }
            else
            {
                this.getStore().add(this.createErrorMessageEntry(LANGUAGE.getString("noHitsFor", Ext.String.htmlEncode(toSearchFor))));
            }
        }

        this.onSearchEnd(toSearchFor);

        if (this.isSearchInAllAdressBooksFinished())
        {
            this.globalInfoContact = null;

            this.onCompleteSearchFinished(toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIActionCallback, response);
        }
    },

    onCompleteSearchFinished: function (toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIActionCallback, response)
    {
        if (isValid(onSuccessfullSearchCallback))
        {
            onSuccessfullSearchCallback(response, addressBook);
        }
        if (this.isSearchInAllAdressBooksFinishedWithNoHitsOrError())
        {
            return;
        }
        this.focusAndSelectFirstContact();
    },

    showGlobalInfoContact: function ()
    {
        this.getStore().add(this.globalInfoContact);
        hideLoadingMask(this);
    },
        
    isSearchInAllAdressBooksFinishedWithNoHits: function ()
    {
        if (!this.isSearchInAllAdressBooksFinished())
        {
            return false;
        }
            
        var everyAddressBookHasZeroHits = true;
        Ext.iterate(this.results, function (key, value)
        {
            if (value !== 0)
            {
                everyAddressBookHasZeroHits = false;
            }
        });
        return everyAddressBookHasZeroHits;
    },

    isSearchInAllAdressBooksFinishedWithNoHitsOrError: function ()
    {
        if (!this.isSearchInAllAdressBooksFinished())
        {
            return false;
        }

        var everyAddressBookHasZeroHitsOrError = true;
        Ext.iterate(this.results, function (key, value)
        {
            if (value !== 0 && value !== -1)
            {
                everyAddressBookHasZeroHitsOrError = false;
            }
        });
        return everyAddressBookHasZeroHitsOrError;
    },

    isSearchInAllAdressBooksFinished: function ()
    {
        var searchFinished = true;
        Ext.iterate(this.results, function (key, value)
        {
            if (!isValid(value))
            {
                searchFinished = false;
            }
        });
        return searchFinished;
    },

    onUnsuccessfullSearch: function (toSearchFor, addressBook, errorText, response, onSuccessfullSearchCallback)
    {
        this.results[addressBook.getName()] = -1;
        if (isValid(response) && response.getReturnValue().getCode() === ProxyError.ErrorTooManyHits.value)
        {
            var groupEntry = this.getGroupEntry(addressBook);
            if (isValid(groupEntry))
            {
                groupEntry.data[CONTACT_NUMBER_HITS] = "(" + LANGUAGE.getString("numberHits", errorText) + ")";
            }
            this.replaceWaitCursorEntry(addressBook, this.createErrorMessageEntry(LANGUAGE.getString("constrainSearch")));
        }
        else
        {
            if (isValidString(errorText))
            {
                this.replaceWaitCursorEntry(addressBook, this.createErrorMessageEntry(errorText));
            }
            else
            {
                this.deleteEntriesForAddressBook(addressBook);
            }
        }
        
        if (this.isSearchInAllAdressBooksFinishedWithNoHits())
        {
            this.getStore().add(this.createErrorMessageEntry(LANGUAGE.getString("noHitsFor", Ext.String.htmlEncode(toSearchFor))));
        }

        this.onSearchEnd(toSearchFor);

        if (this.isSearchInAllAdressBooksFinished())
        {
            this.onCompleteSearchFinished(toSearchFor, addressBook, onSuccessfullSearchCallback, Ext.emptyFn, response);
        }
    },

    onSearchStart: function (searchString)
    {
        if (!isValidString(searchString))
        {
            return;
        }

        if (isPhoneNumber(searchString) && !this.searchNumbers)
        {
            return;
        }
        
        var addressBooks = CURRENT_STATE_DATA_CONNECT.getAddressBooksForName(this.addressBook);
        Ext.each(addressBooks, function (addressBook)
        {
            var store = this.getStore();
            store.add(this.createGroupEntry(addressBook));
            store.add(this.createWaitCursorEntry(addressBook));
        }, this);
    },

    onSearchEnd: function (searchString)
    {
        hideLoadingMask(this);
    }
});

Ext.define('SearchResultsPanelForDialogs',
{
    extend: 'SearchResultsPanel',

    openContactOnSelect: false,

    onCompleteSearchFinished: function()
    {
        this.callParent(arguments);

        //this.showOnlyTheFirstXRecords(6);
        //this.setMaxHeight(Math.max(this.getHeight() - 200, this.minHeight));
    }
});

Ext.define('SearchResultsPanelForCTIAction',
{
    extend: 'SearchResultsPanelForDialogs',

    getOverlayButtons: function (record, item)
    {
        var contact = record.data;
        if (contact.ignore) {
            return [];
        }
        var buttons = [this.getOverlayButtonForCTIAction(contact, item)];
        return buttons;
    },

    getOverlayButtonForCTIAction: function (contact, item)
    {
        if (!isValid(contact) || Ext.isEmpty(contact.getAllNumbers())) 
        {
            return null;
        }
        var allNumbers = new TelephoneNumbers(contact.getAllNumbers()).removeDuplicateNumbers();

        var self = this;
        return {
            shouldBeVisible: function () {
                return isValid(contact) && !Ext.isEmpty(allNumbers) && SESSION.isTelephonyAllowed();
            },
            imageUrl: this.getCTIActionImage(),
            tooltipText: this.getCTIActionTooltip(),
            clickListener: function ()
            {
                Ext.create('ChooseNumberContextMenu',
                {
                    contact: contact,
                    numberChosenCallback: function (contact, number)
                    {
                        if (!isValid(self.ctiAction))
                        {
                            console.log("SearchResultsPanelForCTIAction has no ctiAction!");
                            return;
                        }
                        self.ctiAction.number = number;
                        self.ctiAction.contact = contact;
                        
                        self.ctiAction.run();

                        self.ctiAction.number = "";
                        self.ctiAction.contact = null;
                    },
                    button: item
                });
            },
            numberToDial: allNumbers[0]
        };
    },

    onCTIAction: function (contact, number)
    {

    },

    getCTIActionImage: function ()
    {

    },

    getCTIActionTooltip: function () {

    }
});


Ext.define('SearchResultsPanelForTransfer',
{
    extend: 'SearchResultsPanelForCTIAction',

    getCTIActionImage: function ()
    {
        return 'images/64/' + ICON_TRANSFER_CALL + '.png';
    },

    getCTIActionTooltip: function ()
    {
        return LANGUAGE.getString("blindTransfer");
    }
});

Ext.define('SearchResultsPanelForNewCall',
{
    extend: 'SearchResultsPanelForCTIAction',

    getCTIActionImage: function () {
        return 'images/64/' + ICON_SECOND_CALL + '.png';
    },

    getCTIActionTooltip: function () {
        return LANGUAGE.getString("secondCall");
    }
});

Ext.define('SearchResultsPanelForConference',
{
    extend: 'SearchResultsPanelForCTIAction',

    getCTIActionImage: function () {
        return 'images/64/conference.png';
    },

    getCTIActionTooltip: function () {
        return LANGUAGE.getString("conference");
    }
});