Ext.define('CurrentState_BuddyList',
{
    buddyList: [],

    constructor: function ()
    {
        SESSION.addVIPListener(this);
    },

    destroy: function ()
    {
        SESSION.removeVIPListener(this);

        this.callParent();
    },

    onGetBuddyListSuccess: function (response)
    {
        this.lastGetBuddyListResponse = response;
        if (response.getReturnValue().getCode() === 0)
        {
            this.buddyList = response.getContacts();
        }
    },

    onRemoveBuddySuccess : function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            for (var i = this.buddyList.length - 1; i >= 0; --i)
            {
                if (contact.equals(this.buddyList[i]))
                {
                    Ext.Array.remove(this.buddyList, this.buddyList[i]);
                }
            }

            this.removeContactFromFavourites(contact);
        }
    },

    onAddBuddySuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.buddyList.push(response.getContact());
        }
    },

    onGetFavouritesSuccess: function (response) {
        this.lastGetFavouritesResponse = response;
        if (response.getReturnValue().getCode() === 0) {
            this.favourites = response.getContacts();
        }
    },

    onRemoveFavouriteSuccess: function (response, contact) {
        if (response.getReturnValue().getCode() === 0)
        {
            this.removeContactFromFavourites(contact);
        }
    },

    removeContactFromFavourites: function (contact)
    {
        for (var i = this.favourites.length - 1; i >= 0; --i)
        {
            if (contact.equals(this.favourites[i]))
            {
                Ext.Array.remove(this.favourites, this.favourites[i]);
            }
        }
    },

    onAddFavouriteSuccess: function (response) {
        if (response.getReturnValue().getCode() === 0) {
            this.favourites.push(response.getContact());
        }
    },

    isBuddy: function (contact)
    {
        return this.isContactInList(contact, this.buddyList);
    },

    isFavourite: function (contact)
    {
        return this.isContactInList(contact, this.favourites);
    },

    isContactInList: function (contact, list) {
        var result = false;
        Ext.each(list, function (currentContact) {
            if (!isValid(currentContact)) {
                return;
            }

            if (contact.equals(currentContact)) {
                result = true;
            }
        });
        return result;
    },

    getBuddyList: function ()
    {
        return this.buddyList;
    },

    getFavourites: function () {
        return this.favourites;
    },

    updateGUID: function (contact)
    {
        Ext.each(this.buddyList, function (buddy)
        {
            if (!isValid(buddy))
            {
                return;
            }

            if (buddy.equals(contact))
            {
                contact.setGUID(buddy.getGUID());
            }
        });
    },

    isBuddyListLoading: function ()
    {
        return !isValid(this.lastGetBuddyListResponse);
    },

    isFavouritesLoading: function () {
        return !isValid(this.lastGetFavouritesResponse);
    },

    getFavoritesForNumber: function (number)
    {
        return this.getListEntriesForNumber(this.favourites, number);
    },

    getBuddiesForNumber: function (number) {
        return this.getListEntriesForNumber(this.buddyList, number);
    },

    getListEntriesForNumber: function (list, number) {
        var entries = [];
        Ext.each(list, function (currentContact) {
            if (!isValid(currentContact)) {
                return;
            }

            if (currentContact.hasNumber(number)) {
                entries.push(currentContact);
            }
        });
        return entries;
    }

});

var CURRENT_STATE_BUDDY_LIST = Ext.create('CurrentState_BuddyList', {});
