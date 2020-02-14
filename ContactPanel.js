Ext.define('ContactButtons',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'column'
    },

    contact: null,

    showCallButton: true,

    hideButtonText: false,

    initComponent: function ()
    {
        this.callParent();

        this.createButtons();
    },

    createButtons: function ()
    {
        this.contactActions = this.createContactActions();
        var buttons;
        if (this.hideButtonText)
        {
            buttons = this.contactActions.getActionsAsIconButtons();
        }
        else
        {
            buttons = this.contactActions.getActionsAsButtons();
        }
        this.add(buttons);
    },

    createContactActions: function ()
    {
        var actions = new ContactPanelActions(this.contact, this.journalEntry, this, this.showCallButton);
        actions.hideButtonText = this.hideButtonText;
        return actions;
    },

    setContact: function (contact)
    {
        if (this.contact && contact)
        {
            if (this.contact.equals(contact))
            {
                return;
            }
        }

        var noButtonsYet = !this.contact;
        this.contact = contact;

        if (noButtonsYet)
        {
            this.createButtons();
        }
        else
        {
            this.contactActions.setContact(contact);
            this.updateVisibilityOfAllButtons();
        }
    },

    updateVisibilityOfAllButtons: function ()
    {
        this.each(function (button)
        {
            if (button.shouldBeVisible)
            {
                button.setVisible(button.shouldBeVisible());
            }
        }, this);

        this.updateLayout(); //ist nur deswegen nötig, falls z.B. anfangs der ChatButton sichtbar war und sich selber unsichtbar macht - dann würde ohne updateLayout eine Lücke in der Zeile bleiben
    },

    setActions: function (actions)
    {
        if (!Ext.isEmpty(actions))
        {
            Ext.each(actions, function (action)
            {
                action.contactPanel = this.parent;
                action.contact = this.contact;
            }, this);

            this.add(Ext.create('ActionSplitButton',
            {
                actions: actions
            }));
        }
    },

    onRoute: function (clickedButton, contact)
    {
        this.parent.onRoute(clickedButton, contact);
    },

    onMap: function (clickedButton, contact)
    {
        this.parent.onMap(clickedButton, contact);
    }
});

Ext.define('PersonalContactButtons',
{
    extend: 'ContactButtons',

    createContactActions: function ()
    {
        var record =
        {
            data: this.contact
        };
        return new ContactActionsForPersonalContacts(record, null, this);
    },

    onEditContact: function (contact)
    {
        this.parent.onEditContact(contact);
    },

    createConfirmDeleteButton: function ()
    {
        this.parent.insert(0, Ext.create('ConfirmationComponent',
        {
            yesCallback: () =>
            {
                SESSION.removeBuddy(this.contact);
            },
            noCallback: function ()
            {

            },
            errorMessageText: LANGUAGE.getString("removePersonalContact"),
            errorType: ErrorType.Warning,
            borderWidth: 1,
            margin: '5'
        }));
    }
});

Ext.define('ContactPanel',
{
    extend: 'Ext.Container',

    contact: null,

    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    scrollable: 'vertical',

    //flex: 1,

    initComponent: function ()
    {
        this.callParent();

        this.titleIconWhite = IMAGE_LIBRARY.getImage('user', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage('user', 64, COLOR_TAB_ICON_NORMAL);

        this.title = this.contact.getDisplayName().toUpperCase();

        this.createComponents();
        
        SESSION.addListener(this);
    },

    createComponents: function ()
    {
        this.suspendLayout = true;

        if (this.rendered)
        {
            this.removeAll();
        }

        this.title = this.contact.getDisplayName().toUpperCase();

        this.businessCardPanel = Ext.create('BusinessCardPanel',
        {
            margin: '5 0 0 5',
            contact: this.contact,
            parent: this
        });
        
        this.buttons = Ext.create(this.getClassNameForButtons(),
        {
            margin: '15 0 0 5',
            parent: this,
            contact: this.contact
        });
        this.buttons.setActions(ACTIONS.getActionsForContactPanel());

        this.journalPanel = Ext.create('ContactJournalPanel',
        {
            margin: '5 0 0 5',
            contact: this.contact,
            title: LANGUAGE.getString("history").toUpperCase(),
            parent: this.parent
        });

        this.tabPanel = Ext.create('UniqueTabPanel',
        {
            flex: 1,
            margin: '15 0 0 0',
            border: false
        });
        this.tabPanel.add(this.journalPanel);

        this.tabPanel.setActiveTab(this.journalPanel);
        this.journalPanel.focus();
        
        this.add([this.businessCardPanel, this.buttons, this.tabPanel]);

        this.suspendLayout = false;
        this.updateLayout();
    },

    getClassNameForButtons: function ()
    {
        return "ContactButtons";
    },

    setContact: function (contact)
    {
        this.contact = contact;

        
        this.createComponents();

        if (isValid(this.tab))
        {
            this.tab.setText(Ext.String.htmlEncode(this.title));
        }
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    },

    onChat: function ()
    {
        if (!isValid(this.chatPanel))
        {
            var self = this;
            this.chatPanel = Ext.create('ChatPanel',
            {
                titleIsContactName: false,
                closable: true,
                listeners:
                {
                    close: function ()
                    {
                        self.chatPanel = null;
                    }
                }
            });
            this.chatPanel.setContact(this.contact);
            this.tabPanel.add(this.chatPanel);
        }
        this.tabPanel.setActiveTab(this.chatPanel);
        this.chatPanel.focus();
    },

    onRoute: function (clickedButton, contact)
    {
        if (!isGoogleMapsApiLoaded)
        {
            return;
        }
        var mapsPanel = Ext.create('GoogleMapsPanel',
        {
            contact: contact,
            title: LANGUAGE.getString("route").toUpperCase(),
            displayRoute: true
        });
        this.tabPanel.addItem(mapsPanel);
        //this.tabPanel.setActiveTab(mapsPanel);
    },

    onMap: function (clickedButton, contact)
    {
        if (!isGoogleMapsApiLoaded)
        {
            return;
        }
        var mapsPanel = Ext.create('GoogleMapsPanel',
        {
            contact: contact,
            title: LANGUAGE.getString("map").toUpperCase(),
            displayRoute: false
        });
        this.tabPanel.addItem(mapsPanel);
        //this.tabPanel.setActiveTab(mapsPanel);
    },

    addButton: function (button)
    {
        this.buttons.addButton(button);
    },

    onEditBuddySuccess: function (response, formerGUID)
    {
        if (response.getReturnValue().getCode() !== 0 || formerGUID !== this.contact.getGUID())
        {
            return;
        }
        
        this.contact = response.getContact();

        if (this.tab)
        {
            this.tab.setText(Ext.String.htmlEncode(this.contact.getDisplayName().toUpperCase()));
        }
        
        this.businessCardPanel.setContact(this.contact);
        this.buttons.setContact(this.contact);
    },

    onRemoveBuddySuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0 && this.contact.equals(contact))
        {
            if (isValid(this.parent, "removeItem"))
            {
                this.parent.removeItem(this);
            }
        }
    },

    onEditContact: function (contact)
    {
        
    },

    openURL: function (url)
    {
        var iframe = Ext.create('IFrame',
        {
            url: url,
            title: url,
            isEqualToThisPanel: function (panel)
            {
                return getClassName(this) === getClassName(panel);
            }
        });
        this.tabPanel.addItem(iframe);
    }
});
