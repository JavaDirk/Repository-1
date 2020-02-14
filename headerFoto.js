Ext.define('HeaderFoto', {
    extend: 'Photo',
    
    margin: '0 30 0 0',
    style: 'cursor: pointer',
    
    size: PhotoSizes.Tiny,

    initial: true,

    showAgentState: ShowAgentState.showNever,

    showNameTooltip: false,

    getBorderWidthForPresenceState: function ()
    {
        return 1;
    },

    getPositionForStates: function () {
        return "position:absolute;bottom:-1px;right:-1px";
    },

    getAgentIdForContact: function()
    {
        return -1;
    },

    setContact: function(contact)
    {
        this.callParent(arguments);

        this.el.dom.style.border = '1px solid white';
    },

    dialog: {},
    createMenu: function () 
    {
        var self = this;
        var menu = new Ext.Container(
        {
            layout:
            {
                type: 'hbox',
                pack: 'start'
            },
            margin: '10 5 10 0'
        });

        menu.add(new FileUploadPhoto({
            style: 'cursor: pointer',
            margin: '0 15 0 10',
            contact: MY_CONTACT,
            filePicker: {},
            listeners:
            {
                el:
                {
                    click: function (event)
                    {
                        changeUserImage(self, function ()
                        {
                            self.dialog.hide();
                        });
                    }
                }
            }
        }));

        menu.add(Ext.create('PresenceStateMenu',
        {
            parent: this,
            hideDialog: function ()
            {
                if (self.dialog.xtype)
                {
                    self.dialog.hide();
                }
            }
        }));
        return menu;
    },

    createPresenceStateCheckItem: function (presenceState)
    {
        var self = this;
        var currentPresenceState = getEnumForPresenceState(MY_CONTACT.getPresenceState());
        return new PresenceStateCheckItem({
            presenceState: presenceState,
            checked: presenceState === currentPresenceState,
            listeners:
            {
                click: function ()
                {
                    self.hideDialog();
                }
            }
        });
    },

    hideDialog: function ()
    {
        if (this.dialog.xtype)
        {
            this.dialog.hide();
        }
    },

    initComponent: function ()
    {
        this.callParent();

        var self = this;

        
        this.on(
            {
                boxready: function ()
                {
                    
                },
                el:
                    {
                        mouseover: function ()
                        {
                            self.timeout = setTimeout(function ()
                            {
                                if (isValid(self.dialog, "isVisible()") && self.dialog.isVisible())
                                {
                                    return;
                                }
                                self.businessCardTooltip = Ext.create('BusinessCardTooltip',
                                {
                                    mouseIsOverTarget: true, //muss man initial setzen, weil man ja schon im mouseover-Fall ist
                                    target: self,
                                    defaultAlign: 'bc-tc',
                                    contact: MY_CONTACT,
                                    listeners:
                                    {
                                        hide: function ()
                                        {
                                            this.destroy();
                                        }
                                    }
                                });
                                self.businessCardTooltip.showBy(self);
                            }, TOOLTIP_SHOW_DELAY);
                        }, 
                        mouseout: function ()
                        {
                            clearTimeout(self.timeout);
                        },
                click: function (event) 
                {
                    if (self.businessCardTooltip)
                    {
                        self.businessCardTooltip.hide();
                    }
                    if (self.dialog.xtype)
                    {
                        self.hideDialog();
                    }
                    else
                    {
                        self.dialog = new SimpleDialog({
                            items: [self.createMenu()],
                            target: self.el,
                            listeners: 
                            {
                                hide: function ()
                                {
                                    self.dialog = {};
                                }
                            }
                        });
                        self.dialog.show();
                    }
                }
            }

        });
    },

    onNewEvents: function (response)
    {
        if (this.initial)
        {
            //headerFoto wird direkt nach dem Login erzeugt, zu dem Zeitpunkt wissen wir noch nichts über den initialen Telefonstatus
            //deswegen warten wir auf das initiale GetEvents und gucken nach, ob wir die Präsenz ändern müssen
            if (CURRENT_STATE_CALL.isOnPhone(this.contact.getGUID()))
            {
                this.updatePresenceStateAndAgentState();
            }
            this.initial = false;
        }

        this.callParent(arguments);
    }
});
