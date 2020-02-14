var templateStringForContactJournalPanel = 
    '<div class="journalEntry" style="padding:' + VIEWS_PADDING + ';display:flex;cursor:pointer;border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';">' +
        '<div style="display:flex;flex-direction:column;align-self:center;margin:0px 0px 0 0px;">' +
            '{[this.getAvatarImage(values)]}' +
        '</div>' +
        '<div class="hideForOverlayButtons" style="display:flex;flex-direction:row;flex:1;">' +
            '<div style="display:flex;flex-direction:column;justify-content:space-around;height:calc(100% - 8px);margin:4px 0;align-items:center;width:42px">' +
                '<tpl if="isValidString(values.getFormImageIfAvailable())">' +
                    '<div style="width:16px;height:16px;margin-top:5px;background-image:url({[values.getFormImageIfAvailable()]});background-size:16px" ></div>' +
                '<tpl elseif="isValidString(values.getNoticeImageIfAvailable())">' +
                    '<div style="width:16px;height:16px;margin-top:5px;background-image:url({[values.getNoticeImageIfAvailable()]});background-size:16px" ></div>' +
                '</tpl>' +
                '<tpl if="isValidString(values.getSpeakerImageIfAvailable())">' +
                    '<div style="width:16px;height:16px;background-image:url({[values.getSpeakerImageIfAvailable()]});background-size:16px" ></div>' +
                '</tpl>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;flex:1;min-width:0;align-self:center">' +
                '<div class="eclipsedText" style="' + TEMPLATE_STYLE_TITLE() + '">{[Ext.String.htmlEncode(this.getDataForFirstRow(values))]}</div>' +
                '<div class="eclipsedText" style="' + TEMPLATE_STYLE_SUBTITLE(0) + ';color:{[this.getColorForSecondRow(values)]};">{[Ext.String.htmlEncode(this.getDataForSecondRow(values))]}</div>' +
            '</div>' +
        '</div>' +
        '<div class="hideForOverlayButtons" style="align-self:center;margin:0 5px 0 3px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_SUBTITLE.toString() + '">{[values.getTime()]}</div>' +
    '</div>';

Ext.define('ContactJournalListPanel',
{
    extend: 'BaseJournalPanel',

    itemSelector: 'div.journalEntry',

    title: LANGUAGE.getString("history").toUpperCase(),
    
    contact: null,

    initial: true,

    initComponent: function ()
    {
        this.tpl =  new Ext.XTemplate(
            '<tpl for=".">',
                '<tpl if="values.groupEntry">',
                    '<div class="groupEntry journalEntry" style="padding-left:5px">{text}</div>',
                '<tpl else>',
                    templateStringForContactJournalPanel,
                '</tpl>',
            '</tpl>',
            {
                getDataForFirstRow: function (values)
                {
                    return values.getNumber();
                },

                getDataForSecondRow: function (values)
                {
                    return values.getCallSuccessText();
                },

                getColorForSecondRow: function (values)
                {
                    return values.getCallSuccessColor();
                },

                getAvatarImage: function (values)
                {
                    return createAvatar(values.getCallDirectionImageWithPhone(), NEW_GREY);
                }
            }
        );
        this.callParent();
    },

    getJournalFilterFunction: function ()
    {
        var self = this;
        return function (journalEntry)
        {
            if (isValid(self.contact))
            {
                if (self.contact.equals(journalEntry.getResolvedAddressInfo()))
                {
                    return true;
                }

                var found = false;
                Ext.each(self.contact.getAllNumbers(), function (number)
                {
                    if (journalEntry.isForThisNumber(number))
                    {
                        found = true;
                    }
                });
                if (found)
                {
                    return true;
                }
            }
            
            if (isValidString(self.number))
            {
                return journalEntry.isForThisNumber(self.number);
            }

            return false;
        };
    },

    setContact: function (contact)
    {
        if (isValid(contact) && isValid(this.contact) && contact.equals(this.contact))
        {
            return false;
        }

        if (!isValid(contact) && !isValid(this.contact))
        {
            return false;
        }
            
        this.contact = contact;
        return true;
    },

    setNumber: function (number)
    {
        if (number === this.number)
        {
            return false;
        }

        this.number = number;
        return true;
    },

    onGetJournalSuccess: function ()
    {
        this.callParent();

        if (this.destroyed || !isValid(this.getStore())) {
            return;
        }

        this.parent.onJournalLoaded(this.getStore().getCount());

        if (this.getStore().getCount() === 0)
        {    
            return;
        }

        if (this.initial)
        {
            this.selectFirst();
            this.initial = false;
        }
    },

    selectFirst: function ()
    {
        var selection = this.getSelectionModel().getSelection();
        if (Ext.isEmpty(selection)) {
            this.getSelectionModel().select(1);
            selection = this.getSelectionModel().getSelection();
        }
        this.onSingleClick(this, selection[0]);
    },

    getActions: function (record, item)
    {
        return new ContactJournalActions(record.data, record, item, this);
    },

    onSingleClick: function (view, record, item, index, event, opts)
    {
        this.selectContact(this, record, item, index, event, opts);
    },

    selectContact: function (self, record, item, index, event, opts)
    {
        this.parent.selectContact(this, record, item, index, event, opts);
    }
});

Ext.define('ContactJournalPanel',
{
    extend: 'Ext.Container',

    layout: 
    {
        type: 'hbox',
        align: 'stretch'
    },

    responsiveConfig: SWITCH_LAYOUT,

    style: 'background-color:white',

    scrollable: 'vertical',
    
    initComponent: function ()
    {
        this.callParent();
        
        this.listPanel = this.insert(0, Ext.create('ContactJournalListPanel',
        {
            contact: this.contact,
            parent: this,
            responsiveConfig:
            {
                small:
                {
                    flex: 1
                },
                large:
                {
                    flex: 0,
                    width: DEFAULT_WIDTH_FOR_LISTS
                }
            }
        }));
        
        this.insert(1, Ext.create('BarSeparator',
        {
            
        }));
    },

    selectContact: function (list, record, item, index, event, opts)
    {
        this.openDetailsPanel(record.data);
    },

    openDetailsPanel: function (journalEntry)
    {
        if (!isValid(journalEntry) || journalEntry.groupEntry)
        {
            return;
        }

        if (isValid(this.detailsPanel))
        {
            this.remove(this.detailsPanel);
        }
        
        this.detailsPanel = this.add(Ext.create('JournalEntryPanel',
        {
            flex: 1,
            showCallButton: false,
            journalEntry: journalEntry,
            parent: this,
            showContact: function ()
            {
                return false;
            }
        }));
    },

    removeItem: function (panel)
    {
        this.remove(panel);
        this.listPanel.selectFirst();
    },

    setContactAndNumber: function (contact, number)
    {
        if (this.listPanel.setContact(contact) || this.listPanel.setNumber(number))
        {
            this.listPanel.onGetJournalSuccess();
        }
    },

    onJournalLoaded: function (count)
    {

    }
});