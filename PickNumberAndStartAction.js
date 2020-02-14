Ext.define('PickNumberAndStartAction',
{
    extend: 'Ext.Component',

    initComponent: function ()
    {
        this.callParent();
    },

    run: function ()
    {
        var inputs = [this.errorMessageBoxTarget, this.searchResultsPanel, this.comboBox, this.button, this.noInputCallback];
        Ext.each(inputs, function (input)
        {
            if (!isValid(input))
            {
                console.log("PickNumberAndStartAction:: not all input field valid!");
                return;
            }
        });

        if (isValid(this.ctiAction))
        {
            this.comboBox.setCTIAction(this.ctiAction);
        }

        var number = Ext.String.trim(this.comboBox.getRawValue());
        if (isValid(this.searchResultsPanel.getSelectedContact()))
        {
            this.startActionForSelectedContact();
        }
        else if (isValidString(number))
        {
            this.comboBox.onStartSearch(number);
        }
        else
        {
            this.noInputCallback();
        }
    },

    startActionForSelectedContact: function ()
    {
        if (isValid(this.ctiAction))
        {
            this.comboBox.setCTIAction(this.ctiAction);
        }

        var selectedContact = this.searchResultsPanel.getSelectedContact().data;
        if (selectedContact.getCountTelephoneNumbers() === 0)
        {
            this.showError(LANGUAGE.getString('contactWithoutNumber'));
        }
        else if (selectedContact.getCountTelephoneNumbers() === 1)
        {
            this.startAction(selectedContact.getAllNumbers()[0], selectedContact);
        }
        else
        {
            var self = this;
            Ext.create('ChooseNumberContextMenu',
            {
                contact: selectedContact,
                numberChosenCallback: function (contact, number)
                {
                    self.startAction(number, contact);
                },
                button: this.button,
                showError: function (text)
                {
                    self.showError(text);
                }
            });
        }
    },

    startAction: function (value, contact)
    {
        if (!this.ctiAction)
        {
            console.log("PickNumberAndStartAction::startAction: no ctiAction defined!", this);
            return;
        }
        this.ctiAction.number = value || this.comboBox.getRawValue();
        this.ctiAction.contact = contact;
        this.ctiAction.run();
    },

    showError: function (text)
    {
        showWarningMessage(text);
    }
});
