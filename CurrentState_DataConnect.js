Ext.define('CurrentState_DataConnect',
{
    addressBooks: [],

    constructor: function ()
    {
        SESSION.addVIPListener(this);
    },

    destroy: function ()
    {
        this.stopTimerForGettingAddressBooks();
        SESSION.removeVIPListener(this);

        this.callParent();
    },

    onLogin: function (response, relogin)
    {
        SESSION.getAddressbooks();
    },

    onGetAddressbooksSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0 && response.getAddressbooks())
        {
            this.addressBooks = response.getAddressbooks();
            this.stopTimerForGettingAddressBooks();
        }
        else
        {
            this.addressBooks = this.addressBooks || [];
            this.startTimerForGettingAddressBooks();
        }
    },

    onGetAddressbooksException: function ()
    {
        this.addressBooks = this.addressBooks || [];
        this.startTimerForGettingAddressBooks();
    },

    startTimerForGettingAddressBooks: function ()
    {
        if (isValid(this.timer))
        {
            return;
        }

        this.timer = Ext.util.TaskManager.start(
        {
            scope: this,
            interval: 30000,
            run: function ()
            {
                SESSION.getAddressbooks();
            }
        });
    },

    stopTimerForGettingAddressBooks: function ()
    {
        if (isValid(this.timer))
        {
            Ext.util.TaskManager.stop(this.timer);
        }
    },
    
    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.stopTimerForGettingAddressBooks();
        }
    },

    getAddressBooks: function ()
    {
        var addressBooks = Ext.clone(this.addressBooks);
        var localContacts = new www_caseris_de_CaesarSchema_Addressbook();
        localContacts.setName(LOCAL_CONTACTS);
        localContacts.getDisplayName = function ()
        {
            return LANGUAGE.getString("localContacts");
        };
        addressBooks.push(localContacts);
        return addressBooks;
    },

    getAddressBooksForName: function (addressBookName)
    {
        var addressBooks = this.getAddressBooks();
        var foundAddressBooks = Ext.Array.filter(addressBooks, function (addressBook)
        {
            return addressBookName === ALL_ADDRESS_BOOKS || addressBookName === addressBook.getName();
        }, this);
        if (!Ext.isEmpty(foundAddressBooks))
        {
            return foundAddressBooks;
        }
        return [addressBookName];
    },

    doesAddressBookExist: function (addressBookAsString)
    {
        var found = false;
        Ext.each(this.addressBooks, function (currentAddressBook)
        {
            if (addressBookAsString === currentAddressBook.getName())
            {
                found = true;
            }
        });
        return found;
    }
});

var CURRENT_STATE_DATA_CONNECT = Ext.create('CurrentState_DataConnect', {});