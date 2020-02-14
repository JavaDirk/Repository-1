Ext.define('MainContactsList',
{
    extend: 'Ext.Container',

    layout: 
    {
        type: 'vbox',
        align: 'stretch'
    },

    plugins:
    [
        {
            ptype: 'ContainerWithPersistentSize',
            clientSettingsKey: 'mainContactsList_width',
            initialSize: DEFAULT_WIDTH_FOR_LISTS
        }
    ],
    responsiveConfig:
    {
        small:
        {
            region: 'north',
            flex: 1
        },

        large:
        {
            region: 'west',
            flex: 0
        }
    },

    style: 'background-color: white',

    selectFirstItem: true,

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.add(Ext.create('Ext.Container',
        {
            style: 'background-color:' + PANEL_BACKGROUND_GREY,
            layout:
            {
                type: 'hbox',
                align: 'stretch',
                pack: 'center'
            },
            items:
            [
                Ext.create('RoundThinButton',
                {
                    iconName: 'add',
                    text: LANGUAGE.getString('newContact'),
                    listeners:
                    {
                        click: function ()
                        {
                            self.parent.onNewContact();
                        }
                    }
                })
                ],
            padding: '10 0'
        }));
        
        this.favorites = this.add(Ext.create('PersonalContactsListPanel',
        {
            padding: '0 0 0 0',
            parent: this.parent,
            selectFirstItem: this.selectFirstItem
        }));
    }
});

Ext.define(CLASS_MAIN_CONTACTS_PANEL,
{
    extend: 'Ext.Container',

    layout: 'border',

    flex: 1,

    selectFirstItem: true,

    initComponent: function ()
    {
        this.title = this.title || LANGUAGE.getString('contacts').toUpperCase();
        this.callParent();

        this.tabPanel = Ext.create('UniqueTabPanel',
        {
            region: 'center',
            flex: 1,
            border: false
        });

        this.contactList = this.add(Ext.create('MainContactsList',
            {
                region: 'west',
                split:
                {
                    size: SPLITTER_SIZE,
                    style: getStyleForSplitter(true)
                },
            parent: this,
            selectFirstItem: this.selectFirstItem
        }));
        
        this.add(this.tabPanel);

        this.on('boxready', function ()
        {
            GLOBAL_EVENT_QUEUE.addEventListener(this);
        }, this);
        this.on('destroy', function ()
        {
            GLOBAL_EVENT_QUEUE.removeEventListener(this);
        }, this);
    },

    onNewContact: function (number, contact)
    {
        var newContactsPanel = this.tabPanel.addItem(Ext.create('NewContactPanel',
        {
            number: number,
            contact: contact,
            closable: true
        }));
        newContactsPanel.focus();
    },

    onGlobalEvent_editContact: function (contact)
    {
        this.onEditContact(contact);
    },

    onEditContact: function (contact) 
    {
        var editContactPanel = this.tabPanel.addItem(Ext.create('EditContactPanel',
        {
            closable: true,
            contact: contact,
            parent: this.tabPanel
        }));
        editContactPanel.focus();
    },

    onShowDetails: function (contact)
    {
        var self = this;
        var panel = Ext.create('ContactPanel',
        {
            contact: contact,
            parent: this,

            getClassNameForButtons: function ()
            {
                return "PersonalContactButtons";
            },

            onEditContact: function (contact)
            {
                self.onEditContact(contact);
            }
        });
        
        var samePanel = this.tabPanel.addItem(panel, false);

        if (samePanel !== panel) {
            samePanel.setContact(contact);
        }
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    }
});