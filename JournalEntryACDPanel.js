Ext.define('JournalEntryACDPanel', {
    extend: 'JournalEntryPanel',
    agent: undefined,
    callConversationItem: null,
    showGroup: false,
    showNotice: false,
    initComponent: function ()
    {
        this.callParent();

        this.trashIcon.hide();
    },

    createBusinessCardPanelAndButtons: function ()
    {
        if (!isValid(this.callConversationItem))
        {
            return null;
        }

        if (!isValid(this.agent))
        {
            return null;
        }


        if (this.agent && this.agent.typeMarker === "www_caseris_de_CaesarSchema_Agent")
        {
            var contact = new www_caseris_de_CaesarSchema_Contact();
            contact.convertFromAgent(this.agent);
            this.agent = contact;
        }

        var container = Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            }
        });

        container.add(this.createLine(window.innerWidth));
        container.add(this.createLabel(LANGUAGE.getString("from") + ":"));

        if (this.callConversationItem.getCallDirection() === CallDirection.In.value)
        {
            container.add(this.callParent());

            container.add(this.createLine(window.innerWidth));
            container.add(this.createLabel(LANGUAGE.getString("toCalledPerson") + ":"));
        }

        var numbers = this.agent.getAllNumbers();
        var number = "";
        if (numbers.length > 0)
        {
            number = numbers[0];
        }
        var addressInfo = new www_caseris_de_CaesarSchema_CTIContact();
        addressInfo.setNumber(number);
        addressInfo.setName(this.agent.getName());
        this.businessCardPanel = container.add(this.createBusinessCardPanel(this.agent, addressInfo, this.journalEntry.getACDInfo().getGroup(), this.journalEntry));

        container.add(Ext.create('ContactButtonsForJournalEntryPanel',
        {
            parent: this,
            contact: this.agent,
            journalEntry: this.journalEntry
        }));

        if (this.callConversationItem.getCallDirection() === CallDirection.Out.value)
        {
            container.add(this.createLine(window.innerWidth));
            container.add(this.createLabel(LANGUAGE.getString("toCalledPerson") + ":"));

            container.add(this.callParent());
        }
        return container;
    }
});