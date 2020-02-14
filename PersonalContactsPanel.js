Ext.define('PersonalContactsListPanel',
{
    extend: 'BasePersonalContactsListPanel',

    placeHolder: '',

    confirmDeleteText: LANGUAGE.getString('removePersonalContact'),

    selectFirstItem: true,

    initComponent: function () {
        this.placeHolder = LANGUAGE.getString("personalContactsPlaceholder");
        this.callParent();

        this.emptyText = '<div style="color:' + COLOR_SUBTITLE + '">' + this.placeHolder + '</div>';

        this.getStore().add(CURRENT_STATE_BUDDY_LIST.getBuddyList());

        if (this.selectFirstItem)
        {
            this.selectFirstContact();
        }

        var self = this;
        this.on('boxready', function () {
            if (CURRENT_STATE_BUDDY_LIST.isBuddyListLoading()) {
                showBlackLoadingMask(self);
            }
        });
    },
    
    selectFirstContact: function ()
    {
        if (this.getStore().getCount() > 0)
        {
            this.getSelectionModel().select(0);
            var record = this.getStore().getAt(0);
            this.parent.onShowDetails(record.data);
        }
        
    },

    onGetBuddyListSuccess: function (response)
    {
        hideLoadingMask(this);

        var store = this.getStore();
        store.removeAll();
        this.refresh();

        if (response.getReturnValue().getCode() === 0)
        {
            store.add(response.getContacts());
            this.getSelectionModel().setStore(store);
            this.selectFirstContact();
        }
        else
        {
            this.setEmptyText(response.getReturnValue().getDescription());
        }
    },

    onGetBuddyListException: function () {
        hideLoadingMask(this);

        var store = this.getStore();
        store.removeAll();
        this.refresh();

        this.setEmptyText(LANGUAGE.getString("errorGetBuddyList"));
    },

    onAddBuddySuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var contact = response.getContact();
            var addedRecords = this.getStore().add(contact);
            
            this.getSelectionModel().select(addedRecords);
            this.onContactSelected(addedRecords[0]);
        }
    },
    
    onAddBuddyException: function ()
    {
        showErrorMessage(LANGUAGE.getString("errorAddBuddy"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onRemoveBuddySuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.removeContactFromStore(contact);
        }
        else
        {
            showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    onRemoveBuddyException: function () {
        showErrorMessage(LANGUAGE.getString("errorRemoveBuddy"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    deleteEntry: function (record)
    {
        SESSION.removeBuddy(record.data);
    },

    showConfirmationDialogForRemoveFromFavorite: function ()
    {
        return true;
    },

    getActions: function (record, item)
    {
        return new ContactActionsForPersonalContacts(record, item, this);
    },
    
    getWatermarkImage: function ()
    {
        return "";
    },

    onSingleClick: function (view, record, item, index, event, opts)
    {
        this.onShowDetails(record.data);
    },

    onContactSelected: function (record, item) {
        this.onShowDetails(record.data);
    },

    onShowDetails: function (contact)
    {
        this.parent.onShowDetails(contact);
    },

    onEditContact: function (contact)
    {
        this.parent.onEditContact(contact);
    }
});
