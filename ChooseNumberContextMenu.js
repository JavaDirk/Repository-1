Ext.define('ChooseNumberContextMenu',
{
    extend: 'CustomMenu',

    contact: null,
    journalEntry: null,
    
    numberChosenCallback: null,

    button: null,

    alwaysOnTop: true,

    highlightFirstMenuItem: false,

    ignoreCallbackDuringInitialization: false,

    initComponent: function ()
    {
        this.insertItems = [];

        if (!isValid(this.contact) && !isValid(this.journalEntry))
        {
            this.showError(LANGUAGE.getString("contactWithoutNumber"));
            return;
        }

        var allNumbers = this.collectAllNumbers();
        if (allNumbers.length === 0)
        {
            this.showError(LANGUAGE.getString("contactWithoutNumber"));
            return;
        }

        if (allNumbers.length === 1 && !this.ignoreCallbackDuringInitialization)
        {
            this.executeCallback(allNumbers[0]);
        }
        else
        {
            this.insertItems.push(this.createMenuItemsForOfficePhoneNumbers());
            this.insertItems.push(this.createMenuItemsForMobilePhoneNumbers());
            this.insertItems.push(this.createMenuItemsForHomePhoneNumbers());
            this.insertItems.push(this.createMenuItemsForAdditionalPhoneNumbers());

            this.callParent();

            this.showBy(this.button);
            this.focus();
        }
    },

    collectAllNumbers: function ()
    {
        return this.mergeNumbers(this.contact.getAllNumbers(), this.collectNumbersFromJournalEntry());
    },

    mergeNumbers: function (numbers1, numbers2)
    {
        var result = Ext.Array.merge(numbers1, numbers2);
        return new TelephoneNumbers(result).removeDuplicateNumbers();
    },

    collectNumbersFromJournalEntry: function ()
    {
        return this.journalEntry ? this.journalEntry.getAllNumbers() : [];
    },

    getMobileNumbersFromJournalEntry: function ()
    {
        var journalEntryNumbers = this.collectNumbersFromJournalEntry();
        return Ext.Array.filter(journalEntryNumbers, function (number)
        {
            return new TelephoneNumber(number).isMobileNumber();
        });
    },

    getOfficeNumbersFromJournalEntry: function ()
    {
        var journalEntryNumbers = this.collectNumbersFromJournalEntry();
        var mobileNumbers = this.getMobileNumbersFromJournalEntry();

        return Ext.Array.difference(journalEntryNumbers, mobileNumbers);
    },

    showError: function (text)
    {
        showInfoMessage(text, 5);
    },

    createMenuItemsForOfficePhoneNumbers: function ()
    {
        var contactOfficePhoneNumbers = [];
        if (isValid(this.contact, "getOfficePhoneNumbers()"))
        {
            contactOfficePhoneNumbers = this.contact.getOfficePhoneNumbers();
        }
        var journalEntryOfficePhoneNumbers = this.getOfficeNumbersFromJournalEntry();
        
        var officePhoneNumbers = this.mergeNumbers(contactOfficePhoneNumbers, journalEntryOfficePhoneNumbers);
        return this.createMenuItems(officePhoneNumbers, IMAGE_LIBRARY.getImage('phone', 64, DARK_GREY));
    },

    createMenuItemsForMobilePhoneNumbers: function ()
    {
        var contactMobilePhoneNumbers = [];
        if (isValid(this.contact, "getMobilePhoneNumbers()"))
        {
            contactMobilePhoneNumbers = this.contact.getMobilePhoneNumbers();
        }
        var journalEntryMobilePhoneNumbers = this.getMobileNumbersFromJournalEntry();
        
        var mobilePhoneNumbers = this.mergeNumbers(contactMobilePhoneNumbers, journalEntryMobilePhoneNumbers);
        
        return this.createMenuItems(mobilePhoneNumbers, IMAGE_LIBRARY.getImage('mobile', 64, DARK_GREY));
    },

    createMenuItemsForHomePhoneNumbers: function ()
    {
        if (!isValid(this.contact, "getHomePhoneNumbers()"))
        {
            return [];
        }
        return this.createMenuItems(this.contact.getHomePhoneNumbers(), IMAGE_LIBRARY.getImage('home', 64, DARK_GREY));
    },

    createMenuItemsForAdditionalPhoneNumbers: function ()
    {
        return this.createMenuItems(this.contact.getAdditionalNumbers(), IMAGE_LIBRARY.getImage('phone', 64, DARK_GREY));
    },

    createMenuItems: function (numbers, icon)
    {
        var result = [];
        var self = this;
        Ext.each(numbers, function (number)
        {
            var menuItem = {
                icon: icon,
                text: number,
                cls: 'menuItem',
                handler: function ()
                {
                    self.executeCallback(number);
                }
            };
            
            result.push(menuItem);
        });
        return result;
    },

    executeCallback: function (number)
    {
        if (isValid(this.numberChosenCallback))
        {
            this.numberChosenCallback(this.contact, number);
        }
    }
});