Ext.define('SearchPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'hbox'
    },
    
    currentAddressBook: ALL_ADDRESS_BOOKS,

    clearComboBoxOnSuccess: false,

    backgroundColorForSubComponents: WHITE,

    cls: 'searchPanelWithAddressBookChooser',

    classNameForComboBox: 'ComboBoxWithHistoryForSearch',

    clientSettingsKeyForCurrentAddressBook: 'SearchPanelWithAddressBookChooser_CurrentAddressBook',

    showAddressBookButton: false,

    initComponent: function ()
    {
        this.textForAutoCompletion_dial = this.textForAutoCompletion_dial || LANGUAGE.getString("dialNumber");
        this.callParent();

        var self = this;

        if (!isValidString(this.clientSettingsKey))
        {
            console.warn('SearchPanel with no clientSettingsKey!!');
        }

        this.comboBox = Ext.create(this.classNameForComboBox,
        {
            parent: this,
            flex: 1,
            textForAutoCompletion_dial: this.textForAutoCompletion_dial,
            clientSettingsKey: this.clientSettingsKey,
            clientSettingsKeyForCurrentAddressBook: this.clientSettingsKeyForCurrentAddressBook,
            clearOnSuccess: this.clearComboBoxOnSuccess,
            ctiAction: this.ctiAction,
            backgroundColorForSubComponents: this.backgroundColorForSubComponents,
            showAddressBookButton: this.showAddressBookButton,
            onEnter: function (toSearch)
            {
                self.onEnter(toSearch);
                
                self.onStartSearch(toSearch);
            },
            
            onClearButtonPressed: function ()
            {
                if (self.onClearButtonPressed)
                {
                    self.onClearButtonPressed();
                }
            },

            startSearch: function (addressBook)
            {
                if (!isValid(self.contactListPanel))
                {
                    return;
                }

                self.contactListPanel.setAddressBook(addressBook);
                self.contactListPanel.clearContacts();
                self.contactListPanel.startSearch(self.comboBox.getRawValue());
            }
        });
        this.add(this.comboBox);

        this.updateEmptyText();

        if (this.contactListPanel)
        {
            this.contactListPanel.onStartAction = (record, number) => //jemand hat in der Trefferliste auf einen OverlayButton gedrückt (z.B. eMail, Chat etc)
            {
                if (!record.data || record.data.pseudoContact || !record.data.isValid())
                {
                    return;
                }
                saveToHistory(null, number, record.data, this.clientSettingsKey);
            };
        }
        
        this.on('focus', function ()
        {
            self.comboBox.focus();
        });
    },
    
    onStartSearch: function (toSearch)
    {
        var currentAddressBook = this.comboBox.getAddressBook();
        this.addressBooks = CURRENT_STATE_DATA_CONNECT.getAddressBooksForName(currentAddressBook);
        if (Ext.isEmpty(this.addressBooks) && !isPhoneNumber(toSearch))
        {
            showErrorMessage(LANGUAGE.getString("noAddressBooks"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            return;
        }

        if (!isValid(this.contactListPanel))
        {
            return;
        }

        if (currentAddressBook)
        {
            this.contactListPanel.addressBook = currentAddressBook;
        }
        

        if (isValid(this.ctiAction))
        {
            this.ctiAction.addressBook = this.currentAddressBook;
            this.contactListPanel.ctiAction = this.ctiAction;
        }

        if (!isValidString(toSearch)) 
        {
            this.onClearButtonPressed();
        }

        Ext.batchLayouts(function () 
        {
            return this.contactListPanel.startSearch(toSearch, (response, addressBook) =>
            {
                //Suche is dann erfolgreich, wenn es keine response gibt (Favoriten, da wird nur gefiltert) oder es Kontakte in der response drin sind
                var isSuccessFullSearch = !response || (response.getReturnValue().getCode() === 0 && !Ext.isEmpty(response.getContacts()));
                if (isSuccessFullSearch)
                {
                    this.comboBox.onSuccessfullSearchFinished();
                }
                else
                {
                    Ext.asap(() =>
                    {
                        this.comboBox.markSearchString();
                        this.comboBox.focus();
                    }, this);
                }
            }, () =>
            {
                this.comboBox.reset();
            });
        }, this); 
    },
    
    updateEmptyText: function ()
    {
        this.comboBox.setEmptyText(this.getPlaceholder());
    },

    getPlaceholder: function ()
    {
        if (isValid(this.contactListPanel) && isValidString(this.contactListPanel.title))
        {
            return LANGUAGE.getString('searchIn', this.contactListPanel.title);
        }
        return "";
    },

    setCTIAction: function (action)
    {
        this.ctiAction = action;
        this.comboBox.setCTIAction(action);
    },

    focus: function ()
    {
        if (this.comboBox.rendered)
        {
            //das focus event nach hinten verschieben machen wir deshalb, um das Problem zu lösen, wenn man ein SearchPanel in einem Dialog hat:
            // wenn man dort einen Eintrag aus der Combobox-Liste ausgewählt hat, kam es zu einem Maximum call stack exceeded error
            var self = this;
            Ext.asap(function () {
                self.comboBox.focus();
            });
            
        }
    },

    markSearchString: function ()
    {
        this.comboBox.markSearchString();
    },
    
    
    onEnter: function (toSearch)
    {

    },
    
    setRawValue: function (value)
    {
        this.comboBox.setRawValue(value);
    },

    getRawValue: function ()
    {
        return this.comboBox.getRawValue();
    },

    addCharacter: function (character)
    {
        return this.comboBox.addCharacter(character);
    },

    startAction: function (value, contact)
    {
        this.comboBox.startAction(value, contact);
    },

    reset: function ()
    {
        this.comboBox.reset();
    }
});
