Ext.define('UniqueTabPanel',
{
    extend: 'Ext.tab.Panel',

    initComponent: function ()
    {
        this.callParent();

        this.tabChangeListeners = [];

        this.on('tabchange', function (tabPanel, newCard, oldCard, eOpts)
        {
            if (isValid(oldCard))
            {
                oldCard.tab.setIcon(oldCard.titleIconBlack);
            }
            newCard.tab.setIcon(newCard.titleIconBlack);

            newCard.tab.on(
            {
                el:
                {
                    contextmenu: function ()
                    {
                        var insertItems =
                        [
                            {
                                text: LANGUAGE.getString("close"),
                                handler: function () {
                                    tabPanel.removeItem(newCard, true, false);
                                }
                            },
                            {
                                text: LANGUAGE.getString("closeAllTabs"),
                                handler: function () {
                                    tabPanel.reverseEach(function (item) 
                                    {
                                        tabPanel.removeItem(item, true, false);
                                    });
                                }
                            },
                            {
                                text: LANGUAGE.getString("closeOtherTabs"),
                                handler: function () {
                                    tabPanel.setActiveTab(newCard);
                                    tabPanel.reverseEach(function (item)
                                    {
                                        if (item !== newCard) 
                                        {
                                            tabPanel.removeItem(item, true, false);
                                        }
                                    });
                                }
                            }
                        ];
                        if (newCard && newCard.getAdditionalTabContextMenuItems)
                        {
                            insertItems = insertItems.concat(newCard.getAdditionalTabContextMenuItems());
                        }
                        var contextMenu = Ext.create('CustomMenu',
                        {
                            insertItems: insertItems
                        });
                        contextMenu.showBy(newCard.tab);
                    }
                }
            });
                

            if (isValid(newCard.onTabFocus))
            {
                newCard.onTabFocus(tabPanel, newCard, oldCard, eOpts);
            }

            if (isValid(oldCard) && isValid(oldCard.onTabBlur))
            {
                oldCard.onTabBlur(tabPanel, newCard, oldCard, eOpts);
            }

            tabPanel.tabChangeListeners.forEach(function (listener)
            {
                listener.onTabChange(newCard, oldCard);
            });
        });
    },

    addTabChangeListener: function (listener) {
        this.tabChangeListeners.push(listener);
    },

    addItem: function (panel, deleteSamePanel, blink)
    {
        return this.insertItem(this.items.items.length, panel, deleteSamePanel, blink);
    },

    insertItem : function (position, panel, deleteSamePanel, blink)
    {
        panel.closable = isValid(panel.closable) ? panel.closable : true;
        if (panel.isEqualToThisPanel)
        {
            var samePanel = null;
            this.each(function (item)
            {
                if (panel.isEqualToThisPanel(item))
                {
                    samePanel = item;
                }
            });
            if (samePanel)
            {
                if (deleteSamePanel)
                {
                    this.remove(samePanel);
                }
                else
                {
                    if (!samePanel.tab.active)
                    {
                        this.setActiveTab(samePanel);
                    }
                    samePanel.focus();
                    return samePanel;
                }
            }
        }

        panel.title = isValidString(panel.title) ? panel.title.toUpperCase() : "";
        panel.title = Ext.String.htmlEncode(panel.title);
        panel.parent = this;
        panel.on('boxready', function ()
        {
            panel.tab.setIcon(panel.titleIconBlack);

            panel.el.setVisibilityMode(Ext.dom.Element.DISPLAY);
        });

        this.insert(position, panel);
        if (blink)
        {
            this.blinkTab(panel, -1);
            if (this.items.items.length === 1)
            {
                this.setActiveTab(panel);
            }
            else if (this.items.items.length > 1)
            {
                //wir "klicken" programmatisch auf das neue Panel und dann wieder zurück, damit ExtJS gezwungen wird, das .tab zu erstellen (damit können wir ein Icon im Tab anzeigen)
                var activeTab = this.getActiveTab();
                this.setActiveTab(panel);
                this.setActiveTab(activeTab);
            }
        }
        else
        {
            this.setActiveTab(panel);
        }

        return panel;
    },

    blinkTab : function (panel, maxRunCount)
    {
        if (!isValid(panel))
        {
            return;
        }

        var tab = panel.tab;

        if (!tab || tab._blinking)
        {
            return;
        }

        tab._blinking = true;

        var oldBackgroundColor = '';
        if (isValid(tab, 'el'))
        {
            oldBackgroundColor = tab.el.getColor('background-color', 'ffffff', '');
        }
        var task = Ext.util.TaskManager.start(
        {
            scope: this,
            interval: 1200,
            run: function ()
            {
                if (tab._blinking === false || (maxRunCount !== -1 && task.taskRunCount === maxRunCount) || (isValid(panel.shouldTabStopBlinking) && panel.shouldTabStopBlinking()))
                {
                    Ext.util.TaskManager.stop(task);
                    tab._blinking = false;
                    return;
                }

                if (isValid(tab, 'el'))
                {
                    tab.el.animate(
                    {
                        to:
                        {
                            backgroundColor: COLOR_HIGHLIGHTING
                        },
                        duration: 600
                    }).animate(
                    {
                        to:
                        {
                            backgroundColor: oldBackgroundColor
                        },
                        duration: 600,
                        listeners:
                        {
                            afteranimate: function ()
                            {
                                tab.el.dom.style.backgroundColor = '';
                            }
                        }
                    });
                }
            }
        });

        var stopBlink = function ()
        {
            tab._blinking = false;
            Ext.util.TaskManager.stop(task);
            
            tab.un('activate', stopBlink, this);
            if (tab.el)
            {
                tab.el.stopAnimation();
                tab.el.dom.style.backgroundColor = '';

                tab.mun(tab.el, 'click', stopBlink, this);
            }
        };

        tab.on('activate', stopBlink, this, { single: true });
        if (tab.el)
        {
            tab.mon(tab.el, 'click', stopBlink, this, { single: true });
        }
    },

    removeItem: function (panel, destroyPanel, skipConfirm)
    {
        if (Ext.isFunction(panel.confirmRemove)) {
            if (!skipConfirm && !panel.confirmRemove()) {
                return;
            }
        }
        this.remove(panel, destroyPanel);
    }
});
