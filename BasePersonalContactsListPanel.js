Ext.define('BasePersonalContactsListPanel',
{
    extend: 'ContactListPanel',

    startSearch: function (toSearchFor, onSuccessfullSearchCallback) {
        this.clearContacts();

        if (isValidString(toSearchFor)) 
        {
            this.placeHolder = LANGUAGE.getString('noHitsFor', Ext.String.htmlEncode(toSearchFor));
            this.setEmptyText(this.placeHolder);

            if (isPhoneNumber(toSearchFor)) 
            {
                this.filterByNumber(toSearchFor);

                if (this.getStore().getCount() === 0) 
                {
                    this.showPseudoContactForNumber(toSearchFor);
                }
            }
            else 
            {
                this.filterByName(toSearchFor);
            }

            if (this.getStore().getCount() > 0)
            {
                onSuccessfullSearchCallback();

                this.focusAndSelectFirstContact();
            }
            else
            {
                this.onNoHitsFound();
            }
        }
    },

    //@override
    onNoHitsFound: function ()
    {

    },

    filterByNumber: function (value) 
    {
        this.getStore().filterBy(function (record, id) 
        {
            if (record.data.pseudoContact)
            {
                return true;
            }
            var numbers = new TelephoneNumbers(record.data.getAllNumbers());
            return numbers.contains(value);
        });
    },

    filterByName: function (value) {
        this.getStore().filterBy(function (record, id) {
            return record.data.matches(value);
        });
    },

    clearContacts: function () {
        this.deletePseudoContact();
        this.getStore().clearFilter();
    },

    showContacts: function (contacts) {
        this.getStore().add(contacts);

        this.focusAndSelectFirstContact();
    },

    onEditBuddySuccess: function (response, formerGUID) {
        if (response.getReturnValue().getCode() === 0) {
            var position = this.getStore().findBy(function (record, id) {
                return record.data.getGUID() === formerGUID;
            });
            if (position >= 0) {
                this.getStore().removeAt(position);
                this.getStore().add(response.getContact());
            }
        }
    },

    removeContactFromStore: function(contact)
    {
        var self = this;
        var position = this.getStore().findBy(function (record, id)
        {
            return record.data.equals(contact);
        });
        if (position >= 0)
        {
            var record = this.getStore().getAt(position);
            var node = self.getNode(record);
            animateDeleteEntry(node, function ()
            {
                self.getStore().remove(record);
            });
        }
    }
});