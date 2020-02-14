/**
 * Created by jebing on 19.12.2014.
 */
Ext.define('ContactsPanel',
{
    extend: 'Ext.tab.Panel',

    plugins:
    [
        {
            ptype: 'ContainerWithPersistentSize',
            clientSettingsKey: 'contactsPanel_width',
            initialSize: DEFAULT_WIDTH_FOR_LISTS,
            initialCollapsedState: 'collapsed'
        }
    ],
    
    border: false,
    style: 'background-color: white',
    cls: 'tabPanelWithBigIcons',

    //begin collapsible
    header: { hidden: true },
    collapsible: true,
    deferredRender: false,
    
    getReExpander: function (direction)
    {
        return this.getTabBar(); //hier sagt man, was zu sehen sein soll, wenn das Panel collapsed ist
    },
    listeners:
    {
        beforecollapse: function (me)
        {
            me.setTabPosition('left');
        },
        beforeexpand: function (me)
        {
            me.setTabPosition('top');    
        },
        expand: function (me)
        {
            me.getTabBar().show(); //wenn man das nicht macht, dann ist nach dem expanden die tabBar nicht zu sehen
        }
    },
    
    //end collapsible

    responsiveConfig:
    {
        'small': { sizeType: 'small' },
        'large': { sizeType: 'large' }
    },

    initComponent: function ()
    {
        this.callParent();

        this.collapseMode = 'header';//keine Ahnung, warum man das hier setzen muss oder von aussen, aber direkt als Attribut der Klasse funktioniert nicht *amKopfKratz*

        this.on('tabchange', function (tabPanel, newCard, oldCard, eOpts)
        {
            tabPanel.onTabChange(newCard, oldCard);
        });

        this.createSubComponents();
        
        var self = this;
        this.on('boxready', function ()
        {
            var allPanels = self.getAllPanels();
            self.each(function (panel)
            {
                panel.tab.setIcon(panel.titleIconBlack);
                panel.tab.el.dom.style.padding = '1px 5px 0.8em 5px';
                /*panel.tab.on('mouseover', function ()
                {
                    if (!panel.tab.active)
                    {
                        panel.tab.setIcon(panel.titleIconWhite);
                    }
                });
                panel.tab.on('mouseout', function ()
                {
                    if (!panel.tab.active)
                    {
                        panel.tab.setIcon(panel.titleIconBlack);
                    }
                });*/
            });

            self.reverseEach(function (panel)
            {
                self.setActiveTab(panel);
            });
        });

        this.tabChangeListeners = [];

        SESSION.addListener(this);
        GLOBAL_EVENT_QUEUE.addEventListener(this);

        this.on(
        {
            el:
            {
                click: function (event, iconElement) {
                    if (self.collapsed) 
                    {
                        if (self.sizeType === 'large')
                        {
                            self.expand();
                        }
                        else
                        {
                            if (!isValid(Ext.get(iconElement), "component.card"))
                            {
                                return;
                            }
                            var panel = Ext.get(iconElement).component.card;
                            GLOBAL_EVENT_QUEUE.onGlobalEvent_openMainPanel(Ext.create(getClassName(panel),
                            {
                                title: panel.titleText
                            }));
                        }
                    }
                }
            }
        });
    },

    createSubComponents: function ()
    {
        this.telephonyPanel = Ext.create(CLASS_MAIN_CALL_PANEL,
            {
                titleText: LANGUAGE.getString("telephony")
            });

        this.favoritesPanel = Ext.create('FavoritesPanel',
            {
                titleText: LANGUAGE.getString("favorites")
            });
        this.searchPanel = Ext.create('SearchTabPanel',
            {
                titleText: LANGUAGE.getString("search")
            });

        this.journalPanel = Ext.create('GlobalJournalContainer',
            {
                titleText: LANGUAGE.getString("journal")
            });

        this.chatPanel = Ext.create(CLASS_MAIN_CHAT_PANEL,
            {
                titleText: LANGUAGE.getString("chat")
            });

        var panelsToAdd = Ext.Array.filter(this.getAllPanels(), function (panel)
        {
            return !panel.hidden;
        });
        this.add(panelsToAdd);
    },

    destroy: function ()
    {
        this.callParent();

        SESSION.removeListener(this);
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
    },

    setSizeType: function (sizeType)
    {
        if (sizeType === 'small' && this.sizeType === 'large')
        {
            this.collapse();
        }
        this.sizeType = sizeType;
        
    },

    getAllPanels: function ()
    {
        var subComponents = [this.telephonyPanel, this.favoritesPanel, this.searchPanel, this.journalPanel, this.chatPanel];
        return subComponents;
    },

    addTabChangeListener: function (listener)
    {
        this.tabChangeListeners.push(listener);
    },

    onGlobalEvent_TelephoneChannelSelected: function (channel)
    {
        this.expand();
        this.setActiveTab(this.journalPanel);
        
        /*
        if (isValid(this.journalPanel, "tab.el"))
        {
            this.journalPanel.tab.el.highlight(COLOR_HIGHLIGHTING).highlight(COLOR_HIGHLIGHTING);
        }
        */
        this.journalPanel.showMissedCalls();
    },

    onGlobalEvent_SearchChannelSelected: function (channel)
    {
        this.expand();
        this.setActiveTab(this.searchPanel);
    },

    onGlobalEvent_ChatChannelSelected: function (channel)
    {
        this.expand();
        this.setActiveTab(this.chatPanel);
        /*
        if (isValid(this.chatPanel, "tab.el"))
        {
            this.chatPanel.tab.el.highlight(COLOR_HIGHLIGHTING).highlight(COLOR_HIGHLIGHTING);
        }
        */
    },

    setActiveTab: function (tab)
    {
        this.callParent(arguments);

        var card = tab;
        if (!Ext.isObject(card) || card.isComponent)
        {
            card = this.getComponent(card);
        }

        card.focus();
    },

    onTabChange: function (newCard, oldCard)
    {
        if (isValid(oldCard))
        {
            //oldCard.tab.setIcon(oldCard.titleIconBlack);
            if (oldCard.onTabBlur)
            {
                oldCard.onTabBlur();
            }
        }
        //newCard.tab.setIcon(newCard.titleIconWhite);
        if (newCard.onTabFocus)
        {
            newCard.onTabFocus();
        }
        
        this.tabChangeListeners.forEach(function (listener)
        {
            listener.onTabChange(newCard, oldCard, getClassName(newCard));
        });
        newCard.focus();
    },

    onNewEvents: function (response)
    {
        if (MY_CONTACT.getRightChat() || CURRENT_STATE_CONTACT_CENTER.mayReceiveLiveChats())
        {
            if (!this.contains(this.chatPanel))
            {
                this.add(this.chatPanel);    
            }
        }
        else
        {
            if (this.contains(this.chatPanel))
            {
                this.remove(this.chatPanel, false);
            }
        }
    }
});