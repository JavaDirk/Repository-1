Ext.define('ComboBoxWithHistory',
{
    extend: 'Ext.Component',

    backgroundColorForSubComponents: WHITE,

    childEls: ['inputEl', 'clearButtonEl', 'addressBookEl'],

    showAddressBookButton: false,

    style:
    {
        'border-bottom': FIELDS_BORDER_BOTTOM
    },

    height: 22,

    initComponent: function ()
    {
        this.renderTpl = '<div style="display:flex;flex:1;">' +
                            '<div id="{id}-addressBookEl" data-ref="addressBookEl" style="display:flex;align-items:center;padding-left:5px;"></div>' +
                            '<input id="{id}-inputEl" data-ref="inputEl" autocomplete="off" class="doNotResize" style="font-size:' + FONT_SIZE_SUBTITLE + 'px;flex:1;border:none;margin-left:5px" placeholder="' + LANGUAGE.getString('nameOrNumber') + '"></input>' +
                            '<div id="{id}-clearButtonEl" data-ref="clearButtonEl" style="margin-right:5px;cursor:pointer;align-self:center;width:16px;height:16px;background-size:14px 14px;background-repeat:no-repeat;background-image:url(' + IMAGE_LIBRARY.getImage("delete", 64, COLOR_MAIN_GREY) + ')"></div>' +
                        '</div>';
        this.callParent();

        this.on('boxready', function ()
        {
            SESSION.addListener(this);

            if (this.showAddressBookButton)
            {
                this.selectAddressBookButton = Ext.create('AddressBookSelectorButton',
                {
                    renderTo: this.addressBookEl,
                    parent: this
                });

                this.loadCurrentAddressBook();
            }
            
            this.autoCompletion = this.createAutoCompletion(this.inputEl.dom);

            if (isValidString(this.placeholderText))
            {
                this.inputEl.dom.placeholder = this.placeholderText;
            }
            this.inputEl.dom.oninput = () =>
            {
                this.autoCompletion.display();
            };
            this.inputEl.dom.onkeydown = (event) =>
            {
                this.autoCompletion.keyHandler(event);

                if (event.keyCode === 27)
                {
                    this.onClear();
                }
            };

            this.clearButtonEl.on('click', () =>
            {
                this.onClear();
            });

            this.inputEl.on('focus', function ()
            {
                this.el.dom.style.borderColor = COLOR_BORDER_FOCUS;
            }, this);

            this.inputEl.on('blur', function ()
            {
                this.el.dom.style.borderColor = COLOR_BORDER;
            }, this);
        }, this);

        ComboBoxWithHistory.instances.push(this);
    },

    destroy: function ()
    {
        Ext.Array.remove(ComboBoxWithHistory.instances, this);

        SESSION.removeListener(this);
        this.callParent();
    },

    createAutoCompletion: function (inputEl)
    {
        var startActionCallback = (number) =>
        {
            var value = number || inputEl.value;
            this.onEnter(value);
        };
        var autoCompletion = new AutoCompletion(inputEl, "AUTO_COMPLETION", this.clientSettingsKey, true, startActionCallback, LANGUAGE.getString('dialNumber'), LANGUAGE.getString('searchFor'), startActionCallback);

        autoCompletion.setIconForSearch(IMAGE_LIBRARY.getImage("search", 64, COLOR_MAIN_GREY));
        autoCompletion.setIconForDial(IMAGE_LIBRARY.getImage("phone", 64, COLOR_MAIN_GREY));
        autoCompletion.setTextDial(this.textForAutoCompletion_dial);
        autoCompletion.setMaxLength(TIMIO_SETTINGS.getNumberEntries());
        return autoCompletion;
    },

    clearHistory: function ()
    {
        if (this.autoCompletion)
        {
            this.autoCompletion.reset();
        }
    },

    setEmptyText: function (text)
    {
        if (this.isStateOk())
        {
            this.inputEl.dom.placeholder = text;
        }
        else
        {
            this.placeholderText = text;
        }
    },

    onEnter: function (toSearch)
    {
        this.startAction(toSearch);
    },

    reset: function ()
    {
        if (this.isStateOk())
        {
            this.inputEl.dom.value = "";
        }
    },

    onClear: function ()
    {
        this.reset();
        if (isValid(this.onClearButtonPressed))
        {
            this.onClearButtonPressed();
        }
        this.focus();
    },

    getSelectionStart: function ()
    {
        var inputElement = this.inputEl.dom;
        return inputElement.selectionStart;
    },

    getSelectionEnd: function ()
    {
        var inputElement = this.inputEl.dom;
        return inputElement.selectionEnd;
    },

    addCharacter: function (character)
    {
        var value = this.inputEl.dom.value;

        var start = this.getSelectionStart();
        var end = this.getSelectionEnd();
        if (start === end)
        {
            this.inputEl.dom.value = value ? value + character : character;
        }
        else
        {
            if (isValidString(value))
            {
                //schneide den markierten text aus dem String heraus und fügt an dessen Stelle den character ein
                value = value.substr(0, start) + character + value.substr(end);
            }
            this.inputEl.dom.value = value;
        }

        Ext.asap(function ()
        {
            this.inputEl.dom.focus();
            this.moveCursorToEnd();
        }, this);
    },

    moveCursorToEnd: function ()
    {
        var length = this.inputEl.dom.value.length;
        this.inputEl.dom.selectionStart = length;
        this.inputEl.dom.selectionEnd = length;
    },

    markSearchString: function ()
    {
        if (!this.isStateOk())
        {
            return;
        }

        this.inputEl.dom.select();
    },

    getRawValue: function ()
    {
        if (!this.isStateOk())
        {
            return "";
        }
        return this.inputEl.dom.value;
    },

    setRawValue: function (value)
    {
        if (!this.isStateOk())
        {
            return;
        }
        this.inputEl.dom.value = value;
    },

    saveCurrentAddressBook: function ()
    {
        CLIENT_SETTINGS.addSetting("SEARCH", this.clientSettingsKeyForCurrentAddressBook, this.currentAddressBook);
        CLIENT_SETTINGS.addSetting("SEARCH", this.clientSettingsKeyForCurrentAddressBook + "_displayName", this.addressBookDisplayName);
        CLIENT_SETTINGS.saveSettings();
    },

    loadCurrentAddressBook: function ()
    {
        var addressBook = CLIENT_SETTINGS.getSetting("SEARCH", this.clientSettingsKeyForCurrentAddressBook);
        this.addressBookDisplayName = CLIENT_SETTINGS.getSetting("SEARCH", this.clientSettingsKeyForCurrentAddressBook + "_displayName");
        
        this.setAddressBook(addressBook || ALL_ADDRESS_BOOKS);
    },

    onNewAddressBookChosen: function (addressBookName, addressBookDisplayName)
    {
        this.addressBookDisplayName = addressBookDisplayName;

        this.setAddressBook(addressBookName);
        if (this.isAddressBookValid(addressBookName))
        {
            this.startSearch(addressBookName);
        }
    },

    setAddressBook: function (newAddressBook)
    {
        if (this.currentAddressBook === newAddressBook)
        {
            return;
        }

        this.currentAddressBook = newAddressBook;
        this.saveCurrentAddressBook();
        this.updateEmptyText();
        this.focus();
    },

    isAddressBookValid: function (addressBook)
    {
        return addressBook === ALL_ADDRESS_BOOKS || addressBook === LOCAL_CONTACTS || CURRENT_STATE_DATA_CONNECT.doesAddressBookExist(addressBook.getName ? addressBook.getName() : addressBook);
    },

    //@override
    startSearch: function (addressBook)
    {

    },

    getAddressBook: function ()
    {
        return this.currentAddressBook;
    },

    onGetAddressbooksSuccess: function (response)
    {
        if (this.showAddressBookButton)
        {
            this.loadCurrentAddressBook();
        }
    },

    onGetAddressbooksException: function ()
    {

    },

    updateEmptyText: function ()
    {
        this.setEmptyText(this.getPlaceholder());
    },

    getPlaceholder: function ()
    {
        var addressBookName;
        if (isValidString(this.addressBookDisplayName))
        {
            addressBookName = this.addressBookDisplayName;
            if (addressBookName === LANGUAGE.getString("allAddressBooks"))
            {
                addressBookName = LANGUAGE.getString("allAddressBooks2");
            }
        }
        else
        {
            addressBookName = this.currentAddressBook;
            if (this.currentAddressBook === ALL_ADDRESS_BOOKS)
            {
                addressBookName = LANGUAGE.getString('allAddressBooks2');
            }
            if (this.currentAddressBook === LOCAL_CONTACTS)
            {
                addressBookName = LANGUAGE.getString('localContacts');
            }
        }
        
        return LANGUAGE.getString('searchIn', addressBookName);
    },

    focus: function ()
    {
        if (this.isStateOk())
        {
            this.inputEl.dom.focus();
        }
    },

    onSuccessfullSearchFinished: function ()
    {
        if (this.clearOnSuccess)
        {
            this.reset();
        }
    },

    setCTIAction: function (ctiAction)
    {
        this.ctiAction = ctiAction;

        if (this.clientSettingsKey !== ctiAction.getClientSettingsKeyForHistory())
        {
            this.clientSettingsKey = ctiAction.getClientSettingsKeyForHistory();
            if (this.isStateOk())
            {
                this.autoCompletion = this.createAutoCompletion(this.inputEl.dom);
            }
        }
    },

    onSaveSettingsSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.autoCompletion.setMaxLength(TIMIO_SETTINGS.getNumberEntries());
        }
    }
});

Ext.define('ComboBoxWithHistoryForSearch',
{
    extend: 'ComboBoxWithHistory',

    initComponent: function ()
    {
        this.callParent();

        this.on('boxready', function ()
        {
            this.autoCompletion.setTextDial(LANGUAGE.getString("searchContactWithNumber"));
            this.autoCompletion.setIconForDial(IMAGE_LIBRARY.getImage("search", 64, COLOR_MAIN_GREY));
        }, this);
    }
});

Ext.define('ComboBoxWithHistoryForCTIAction',
{
    extend: 'ComboBoxWithHistory'
});

ComboBoxWithHistory.instances = [];