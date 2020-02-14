Ext.define('ColleaguesListPanel',
{
    extend: 'ContactListPanel',

    deferEmptyText: true,

    initComponent: function ()
    {
        this.addressBook = new www_caseris_de_CaesarSchema_Addressbook();
        this.addressBook.setName('[internal]');
        
        this.callParent();

        this.title = LANGUAGE.getString('colleagues').toUpperCase();
    },

    getDataForFirstRow: function (contact)
    {
        if (contact.isGlobalInfo())
        {
            var possibleValues = this.getPossibleValuesForGlobalInfoContact(contact);
            return getFirstValidString(possibleValues);
        }
        return contact.getFullName(true);
    },
    getDataForSecondRow: function (contact)
    {
        if (contact.isGlobalInfo())
        {
            var possibleValues = this.getPossibleValuesForGlobalInfoContact(contact);
            return getSecondValidString(possibleValues);
        }
        return contact.getDepartment();
    },
    getDataForThirdRow: function (contact)
    {
        if (contact.isGlobalInfo())
        {
            var possibleValues = this.getPossibleValuesForGlobalInfoContact(contact);
            return getThirdValidString(possibleValues);
        }
        return contact.getPresenceStateText();
    },

    getWatermarkImage: function ()
    {
        return IMAGE_LIBRARY.getImage("user", 64, COLOR_WATERMARK);
    },

    startSearch: function (toSearchFor, onSuccessfullSearchCallback, onSuccessfullCTIAction)
    {
        if (!isValidString(toSearchFor))
        {
            return;
        }
        this.clearContacts();
        showBlackLoadingMask(this);
        
        this.callParent(arguments);
    },

    onSuccessfullSearch: function (toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIAction, response)
    {
        this.callParent(arguments);
        
        this.parent.onSuccessfullSearch(toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIAction, response);

        //TODO: Sollte dieser Codeblock nicht eher in ContactListPanel?
        if (Ext.isEmpty(response.getContacts()) && isPhoneNumber(toSearchFor))
        {
            this.showPseudoContactForNumber(toSearchFor);
        }
    },

    onUnsuccessfullSearch: function (toSearchFor, addressBook, errorText, response, onSuccessfullSearchCallback)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorTooManyHits.value)
        {
            errorText = LANGUAGE.getString("numberHits", LANGUAGE.getString("tooManyHits")) + ".";
        }
        this.callParent(arguments);

        //this.setMinHeight(0);

        this.parent.onUnsuccessfullSearch(toSearchFor, addressBook, errorText, response, onSuccessfullSearchCallback);
    }
});

Ext.define('ColleaguesListPanelForChat',
{
    extend: 'ColleaguesListPanel',

    minHeight: 82,

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('colleagues').toUpperCase();

        this.on('selectionchange', this.onSelectionChanged, this);
    },

    onSuccessfullSearch: function (toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIAction, response)
    {
        var filteredContacts = this.filterSearch(response.getContacts());
        response.setContacts(filteredContacts);

        this.callParent(arguments);

        this.showOnlyTheFirstXRecords(6);
    },

    onSelectionChanged: function (view, selected)
    {
        this.parent.onSelectionChanged(view, selected);
    },

    getOverlayButtons: function (record, item)
    {
        var contactActions = this.getActions(record, item);
        var chatAction = contactActions.getChatAction();
        chatAction.clickListener = () =>
        {
            this.openChat(record.data, item);
        };
        return [chatAction];
    },

    onSingleClick: function (view, record, item, index, event, opts)
    {
        
    },

    onContactSelected: function (record, item)
    {
        this.openChat(record.data, item);
    },

    openChat: function (contact, item)
    {
        this.parent.openChat(contact);
    },

    getSelectedContact: function ()
    {
        var selection = this.getSelectionModel().getSelection();
        if (selection.length > 0) {
            return selection[0].data;
        }
        return null;
    },

    filterSearch: function (contacts)
    {
        contacts = contacts || [];
        return Ext.Array.filter(contacts, function (contact)
        {
            return this.isChattable(contact);
        }, this);
    },

    isChattable: function (contact)
    {
        return contact.isChattable();
    }
});

Ext.define('ColleaguesListPanelForVideoCall',
{
    extend: 'ColleaguesListPanelForChat',

    initComponent: function ()
    {
        this.callParent();

        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function ()
    {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        this.callParent();
    },

    onGlobalEvent_openVideoChat: function (contact)
    {
        this.parent.hideDialog();
    },

    getOverlayButtons: function (record, item)
    {
        var contactActions = this.getActions(record, item);
        return [contactActions.getVideoCallAction()];
    },

    isChattable: function (contact)
    {
        return contact.isVideoChattable();
    }
});

Ext.define('ColleaguesPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    title: LANGUAGE.getString('colleagues').toUpperCase(),

    listPanelClassName: 'ColleaguesListPanel',

    backgroundColorForSubComponents: WHITE,
    marginForSearchPanel: '10 5 0 5',

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('colleagues').toUpperCase();

        this.listPanel = Ext.create(this.listPanelClassName,
        {
            margin: '-1 0 0 0',
            parent: this,
            clearSearch: function ()
            {
                self.clearSearch();
            }
        });

        var self = this;
        this.searchPanel = Ext.create('SearchPanel',
        {
            margin: this.marginForSearchPanel,
            contactListPanel: this.listPanel,
            clientSettingsKey: KEY_SEARCH_COLLEAGUES_HISTORY,
            clearComboBoxOnSuccess: true,
            backgroundColorForSubComponents: this.backgroundColorForSubComponents,
            onClearButtonPressed: function ()
            {
                self.clearSearch();
            }
        });

        this.add(
        [
            this.searchPanel,
            Ext.create('Ext.Component', //diese Component wird nur gebraucht, um den obersten borderTop der Liste zu verdecken. Dadurch braucht man keine Logik, wann man einen Trennstrich zwischen den Kontakten braucht
            {
                height: 5,
                style: 'z-index:1;background-color:' + this.backgroundColorForSubComponents
            }),
            this.listPanel
        ]);
    },

    clearSearch: function ()
    {
        this.listPanel.clearContacts();

        this.focus();
    },

    focus: function ()
    {
        this.callParent();

        this.searchPanel.focus();
    },

    onSuccessfullSearch: function (toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIAction, response)
    {

    },

    onUnsuccessfullSearch: function (toSearchFor, addressBook, errorText, response)
    {

    },

    hideDialog: function ()
    {
        if (isValid(this.parent, "hideDialog")) 
        {
            this.parent.hideDialog();
        }
    },
    
    getSelectedContact: function ()
    {
        return this.listPanel.getSelectedContact();
    },

    onSelectionChanged: function (view, selected)
    {

    },

    showError: function (text)
    {
        showErrorMessage(text, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    openChat: function (contact)
    {
        this.parent.openChat(contact);
    }
});