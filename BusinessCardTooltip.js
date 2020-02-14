var HIDE_DELAY = 500;

Ext.define('BusinessCardTooltip',
{
    extend: 'Ext.tip.ToolTip',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    style: 'background-color:white;box-shadow: rgb(136, 136, 136) 2px 2px 6px !important;',
    showDelay: TOOLTIP_SHOW_DELAY,
    quickShowInterval: 0, //nicht dokumentierter Schalter, default 250. Wenn der Tooltip angezeigt wird und man schnell auf eine andere Kachel geht, dann zeigt der den Tooltip sofort an und wartet nicht die showDelay-Zeit ab
    hideDelay: HIDE_DELAY,
    dismissDelay: 0,
    autoHide: true,
    trackMouse: false,
    cls: 'dialogWithArrow businessCardTooltip',
    mouseOffset: [5, 5],
    maxWidth: 600,
    minWidth: 400,

    listeners:
    {
        beforeshow: function (tip)
        {
            return tip.onBeforeShow();
        }
    },

    onBeforeShow: function ()
    {
        var tip = this;

        if (tip.isContextMenuVisible(tip))
        {
            return false;
        }
        if (tip.skipShow()) //es gab einen Fall, wo man mit dem Mauszeiger ausserhalb der Partnerleiste war, ExtJS aber der Meinung war, 
        {                   //man wäre über einer Kachel und wollte dann den Tooltip anzeigen
            return false;
        }
        if (tip.targetIsScrolling)
        {
            return false;
        }
        var contact = tip.getCurrentContact(tip);
        if (isValid(contact) && contact.isValid() && !contact.isOnlyANumber())
        {
            tip.setContact(contact);
            
            return true;
        }

        console.log("no valid contact", contact);
        return false;
    },

    disable: Ext.emptyFn,

    setContact: function (contact)
    {
        this.businessCardPanel.setContact(contact);
        this.tabPanel.setContact(contact);
        this.contactButtons.setContact(contact);
    },

    getIconForExpandOrCollapse: function (collapsed)
    {
        return collapsed ? "images/64/arrow_down.png" : "images/64/arrow_up.png";
    },

    skipShow: function ()
    {
        return false;
    },

    isContextMenuVisible: function () {
        return false;
    },

    getCurrentContact: function () {
        return this.contact;
    },

    hideTooltip: function ()
    {
        this.mouseIsOverTooltip = false;
        this.hide();
    },

    hide: function () 
    {
        if (this.destroyed) 
        {
            return;
        }
        if (this.hideDelayTimer)
        {
            return;
        }
        //Fall: DialogWithArrow ist sichtbar und man öffnet auf diesem ein Ext.menu.Menu. Wenn man dann auf ein menuItem klickt, würde sich der DialogWithArrow schliessen, dabei soll sich nur das Ext.menu.Menu schliessen
        if (this.isAnotherDialogVisibleWithHigherZIndex())
        {
            return;
        }
        if (this.mouseIsOverTooltip)
        {
            return;
        }

        this.callParent();

        this.destroy();
    },

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.businessCardPanel = Ext.create('BusinessCardPanel_NameAndPhoto',
            {
                style: { backgroundColor: COLOR_HOVER },
                margin: 0,
                padding: '5 0 5 5',
                parent: self,

                onChat: function (contact)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_openUserChat(contact);
                    self.hide();
                },

                onRoute: function (button, contact)
                {
                    new BusinessCardPanel().onRoute(button, contact);
                },

                onMap: function (button, contact)
                {
                    new BusinessCardPanel().onMap(button, contact);
                }
            });

        this.contactButtons = this.createButtons();
        
        var collapsed = this.loadCollapsedState();

        this.containerForButtons = Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            margin: '0 0 5 5',
            padding: '5 0 5 0',
            flex: 1,
            items:
            [
                this.contactButtons,
                Ext.create('Ext.Component', { flex: 1 }),
                this.collapseButton = Ext.create('ThinButton',
                {
                    margin: '0 0 0 25',
                    padding: '2 8',
                    scale: 'small',
                    collapsed: collapsed,
                    icon: this.getIconForExpandOrCollapse(collapsed),
                    listeners:
                    {
                        click: function ()
                        {
                            self.tabPanel.setVisible(this.collapsed);

                            this.collapsed = !this.collapsed;
                            self.saveCollapsedState(this.collapsed);
                            this.setIconSrc(self.getIconForExpandOrCollapse(this.collapsed));
                            this.mouseoverEvent(this);

                            self.preserveWidthOfExpandedTooltip(this.collapsed);
                        }
                    }
                })
            ]
        });
        this.tabPanel = Ext.create('BusinessCardPanel_DetailsTabPanel',
        {
            hidden: collapsed,
            addToParent: function ()
            {
                self.add(self.tabPanel);

                self.collapseButton.show();
            },

            removeFromParent: function ()
            {
                self.remove(self.tabPanel, false);

                self.collapseButton.hide();
            }
        });
        this.add(
        [
            this.businessCardPanel,
            this.containerForButtons
        ]);

        /*
        var targetEl = this.target.el || this.target;
        targetEl.on('mouseover', function ()
        {
            self.mouseIsOverTarget = true;
        });
        targetEl.on('mouseout', function ()
        {
            self.mouseIsOverTarget = false;
        });
        */
        this.on('boxready', function()
        {
            SESSION.addListener(this);

            this.preserveWidthOfExpandedTooltip(collapsed);

            this.el.on('mouseenter', function ()
            {
                this.mouseIsOverTooltip = true;
            }, this);

            this.el.on('mouseleave', function ()
            {
                this.mouseIsOverTooltip = false;

                //warum hier das hide selber anstoßen? Fall: man verläßt den tooltip mit der Maus und hovert den tooltip schnell wieder. dann wird das hide wegen this.mouseIsOverTooltip verhindert
                //wenn man dann aber wieder den tooltip verläßt, macht ExtJS nix, weil es selber das hide ja schon angestoßen hatte
                this.hideDelayTimer = setTimeout(() =>
                {
                    this.hideDelayTimer = null;    
                    this.hide();
                }, HIDE_DELAY);
            }, this);
        }, this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    //der Tooltip darf beim expanden breiter werden, soll aber bei collapse nicht schmaler werden (weil man dann mit dem Mauszeiger außerhalb des Tooltips landet und der deswegen verschwindet)
    preserveWidthOfExpandedTooltip: function (collapsed)
    {
        if (collapsed)
        {
            return;
        }
        
        this.setWidth(this.getWidth());
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.hide();
        }
    },

    isMouseOverTooltip: function ()
    {
        return this.mouseIsOverTooltip;
    },

    createButtons: function ()
    {
        return Ext.create("ContactButtons",
        {
            margin: '5 0 0 0',
            contact: this.contact,
            parent: this.businessCardPanel,
            hideButtonText: true
        });
    },

    loadCollapsedState: function ()
    {
        var collapsed = CLIENT_SETTINGS.getSetting("CONTACTS", "businessCardTooltip_infoCollapsed");
        if (isValid(collapsed))
        {
            return collapsed;
        }
        return true;
    },

    saveCollapsedState: function (flag)
    {
        CLIENT_SETTINGS.addSetting("CONTACTS", "businessCardTooltip_infoCollapsed", flag);
        CLIENT_SETTINGS.saveSettings();
    }
});

Ext.define('BusinessCardTooltipForPartnerList',
    {
        extend: 'BusinessCardTooltip',

        initComponent: function() {
            this.callParent();

            var self = this;

            //In der Partnerleiste wollen wir verhindern, dass ein Tooltip angezeigt wird, während man scrollt, das ist von ExtJS her möglich (Bug? Feature?)
            if (this.scrollContainer)
            {
                this.scrollContainer.on(
                {
                    el:
                    {
                        scroll: function () 
                            {
                            clearTimeout(self.timer);
                            self.targetIsScrolling = true;

                            if (self.isVisible())
                            {
                                self.hide();
                            }
                            
                            self.timer = setTimeout(function () 
                            {
                                self.targetIsScrolling = false;
                            }, 250);
                        }
                    }
                });
            }
        },

        isContextMenuVisible: function (tip)
        {
            var tile = this.getTile(tip);
            if (isValid(tile, "isContextMenuVisible"))
            {
                return tile.isContextMenuVisible();
            }
            return false;
        },
        
        getTile: function (tip)
        {
            var photo = Ext.get(tip.triggerElement);
            if (!isValid(photo))
            {
                return null;
            }
            var tileElement;
            if (photo.dom.className.indexOf(CLS_CONTACT_TILE) >= 0)
            {
                tileElement = photo;
            }
            else
            {
                tileElement = photo.up("." + CLS_CONTACT_TILE);
            }
            
            if (isValid(tileElement))
            {
                var tile = Ext.getCmp(tileElement.id);
                if (isValid(tile))
                {
                    return tile;
                }
            }
            return null;
        },

        skipShow: function ()
        {
            var tile = this.getTile(this);
            if (isValid(tile))
            {
                if (tile.mouseOverLineStateEl)
                {
                    return true;    
                }
            }
                
            return this.callParent(arguments);
        }
    });

Ext.define('BusinessCardTooltipForChatPanel',
{
    extend: 'BusinessCardTooltip',

    chatPanel: null,

    isContextMenuVisible: function (tip)
    {
        return false;
    },

    getCurrentContact: function (tip)
    {
        return this.contact;
    }
});

Ext.define('BusinessCardTooltipForTeamChatPanel',
{
    extend: 'BusinessCardTooltip',

    chatPanel: null,

    isContextMenuVisible: function (tip)
    {
        return false;
    },

    getCurrentContact: function (tip)
    {
        var link = Ext.getCmp(tip.triggerElement.id);
        if (isValid(link))
        {
            return link.contact;
        }
        return null;
    }
});


Ext.define('BusinessCardTooltipForEMailHeader',
{
    extend: 'BusinessCardTooltip',

    showContact: undefined,

    initComponent: function ()
    {
        this.callParent();
        this.update();
    },

    update: function ()
    {
        var self = this;
        var storageId = self.showContact.getStorageId();
        var entryId = self.showContact.getEntryId();

        if (isValidString(entryId) && isValidString(storageId))
        {
            SESSION.getContactByObject(entryId, storageId, function (result)
            {
                if (result.getReturnValue().getCode() === 0)
                {
                    self.contact = result.getContact();
                    self.setContact(self.contact);
                    self.show();
                }
            },
            function ()
            {
                self.show();
            });
        }
        else
        {
            this.contact = new www_caseris_de_CaesarSchema_Contact();
            this.contact.convertFromPhoneContact(this.showContact || this.email.sender);

            this.show();
        }

        if (isValid(this, 'email')&& !this.email.sender)
        {
            this.showContact.setEmail(this.email);
        }
    },

    onAfterRender: function ()
    {
        var self = this;

        self.getEl().on('mouseout', function (e)
        {
            self.mouseover = false;
        });

        self.getEl().on('mouseover', function ()
        {
            self.mouseover = true;
        });
    },

    canTooltipBeClosed: function ()
    {
        return !this.mouseover;
    }
});
