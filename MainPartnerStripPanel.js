Ext.define(CLASS_MAIN_PARTNER_STRIP_PANEL, {
    extend: 'Ext.Container',
    style: 'background-color: ' + PANEL_BACKGROUND_GREY,
    groupContainer: {},
    autoDestroy: true,
    scrollable: 'vertical',
    renderNoView: false,
    myTenantGroups: {},
    groupPanels: [],
    hideMode: 'display',
    groupTextBox: {},
    cls: 'partnerStripPanel',

    mixins: ['BusinessCard_ShowHideBehaviour'],

    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    listeners:
    {
        beforeclose: function (event)
        {
            event.saveGroupSettings();
        }
    },
    destroy: function ()
    {
        this.el.dom.style.display = 'none'; //ist nur deswegen nötig, wenn die Partnerleiste alleiniges Tab ist
        Ext.asap(function ()
        {
            this.removeAllListeners();

            MainPartnerStripPanel.superclass.destroy.apply(this);
        }, this);
    },

    removeAllListeners: function ()
    {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        SESSION.removeListener(this);
    },

    onGlobalEvent_OnPartnerListReady: function ()
    {
        this.afterPanelsInserted();
    },

    isInTabMode: function ()
    {
        return this.displayViewType === 'tab';
    },

    initComponent: function ()
    {
        this.callParent();
        
        this.displayViewType = CLIENT_SETTINGS.getSetting('PARTNERS', 'displayView');
        
        this.on('boxready', function ()
        {
            GLOBAL_EVENT_QUEUE.addEventListener(this);
            SESSION.addListener(this);

            this.createSubComponents();
        }, this);
    },

    createSubComponents: function ()
    {
        if (this.groupsLoading)
        {
            return;
        }

        if (!this.renderNoView)
        {
            showDarkBlueLoadingMask(this);
        }
        var self = this;

        this.removeAll();

        this.createGroupContainer();

        this.groupPanels = [];

        var acdGroups = [];
        Ext.iterate(CURRENT_STATE_CONTACT_CENTER.Groups, function (groupId, curGroup)
        {
            var acdGroup = new www_caseris_de_CaesarSchema_PartnerListGroup();

            acdGroup.setId(curGroup.getId());
            acdGroup.setSource(SOURCE_CONTACT_CENTER);
            acdGroup.setName(curGroup.getName());
            acdGroup.setPosition(0);
            acdGroup.setAcdId(Number(curGroup.getId()));

            acdGroups.push(acdGroup);
        });

        if (acdGroups.length > 0)
        {
            Ext.batchLayouts(function ()
            {
                Ext.each(acdGroups, function (acdGroup)
                {
                    self.createGroupPanel(acdGroup);
                });
            });
        }

        if (SESSION.isCtiWebServiceAvailable())
        {
            this.getGroupsTimer = setTimeout(function () { console.log("Could not get Partner list groups in 30 sec"); }, 30000);
            this.groupsLoading = true;
            SESSION.getGroups(function (result)
            {
                clearTimeout(self.getGroupsTimer);
                if (result.getReturnValue().getCode() !== 0)
                {
                    self.groupsLoading = false;
                    self.showError(result.getReturnValue().getDescription(), ErrorType.Error);
                    hideLoadingMask(self);
                    return;
                }

                var groups = Ext.Array.filter(result.getGroups() || [], function (group)
                {
                    var isAcdGroup = group.getSource() === SOURCE_CONTACT_CENTER || group.getAcdId() > 0;
                    return !isAcdGroup;
                });

                Ext.batchLayouts(function ()
                {
                    Ext.each(groups, function (group)
                    {
                        self.createGroupPanel(group);
                    });
                    self.afterPanelsInserted();
                    self.groupsLoading = false;
                });

            }, function (error)
                {
                    self.groupsLoading = false;

                    self.showError(LANGUAGE.getString("errorGetGroups"), ErrorType.Error);
                    hideLoadingMask(self);
                    if (acdGroups.length === 0)
                    {
                        self.showNewGroupButtonForEmptyPartnerList();
                    }
                });
        }
        else if(!this.isStartPage)
        {
            this.showError(LANGUAGE.getString("partnerListIsLoadedLater"), ErrorType.Info);
            hideLoadingMask(this);
        }
        
        var displayView = CLIENT_SETTINGS.getSetting('PARTNERS', 'displayView');

        if (!displayView)
        {
            CLIENT_SETTINGS.addSetting('PARTNERS', 'displayView', 'panel');
            CLIENT_SETTINGS.saveSettings();
        }

        this.createNewGroupButtonForEmptyPartnerList();
    },

    createNewGroupButtonForEmptyPartnerList: function ()
    {
        var self = this;
        this.newGroupButton = this.add(new RoundThinButton({
            scale: 'medium',
            hidden: true,
            text: LANGUAGE.getString('newGroup'),
            iconName: 'add',
            width: 150,
            listeners:
            {
                click: function ()
                {
                    self.createNewGroupDialog();
                }
            }
        }));
    },

    updateVisibilityOfNewGroupButtonForEmptyPartnerList: function ()
    {
        if(this.groupContainer.isEmpty())
        {
            if (!isLoadingMaskVisible(this)) //warum noch diese Prüfung? Fall: PL als Startseite, AgentConfiguration kommt vor getGroups (oder umngekehrt), dann sind loadMask und Button gleichzeitig zu sehen
            {
                return this.showNewGroupButtonForEmptyPartnerList();
            }
        }
        else
        {
            return this.hideNewGroupButtonForEmptyPartnerList();
        }
        return false;
    },

    showNewGroupButtonForEmptyPartnerList: function ()
    {
        if (this.newGroupButton.isVisible())
        {
            return false;
        }
        this.newGroupButton.setVisible(true);
        this.groupContainer.setVisible(false);
        this.setLayout(
        {
            type: 'vbox',
            align: 'center',
            pack: 'center'
            });
        return true;
    },

    hideNewGroupButtonForEmptyPartnerList: function ()
    {
        if (!this.newGroupButton.isVisible())
        {
            return false;
        }
        this.newGroupButton.setVisible(false);
        this.groupContainer.setVisible(true);
        this.setLayout(
        {
            type: 'vbox',
            align: 'stretch',
            pack: 'start'
            });
        return true;
    },
  
    createGroupContainer: function (afterrenderFct)
    {
        var self = this;

        if (!CLIENT_SETTINGS.getSetting('PARTNERS', 'displayView'))
        {
            CLIENT_SETTINGS.addSetting('PARTNERS', 'displayView', 'panel');
        }

        if (this.isTabView())
        {
            this.groupContainer = this.add(new Ext.tab.Panel(
            {
                tabPosition: 'left',
                defaults:
                {
                    textAlign: 'left'
                },
                width: 200,
                tabRotation: 0,
                autoScroll: true,
                deferredRender: false,
                flex: 1,
                border: false,
                cls: 'notVisible',
                listeners:
                {
                    boxready: function (event)
                    {
                        event.body.dom.style.background = 'transparent';

                        if (afterrenderFct)
                        {
                            self.groupContainer.removeCls('notVisible');
                            setTimeout(function ()
                            {
                                afterrenderFct();
                                
                                
                            }, 100);
                        }
                        //Wozu ist das nötig?
                        //Fall: Partnerleiste wird im laufenden Betrieb auf Tab-Darstellung umgeschaltet
                        //dann wird das farbige Icon nur beim aktiven Tab dargestellt
                        setTimeout(function ()
                        {
                            Ext.reverseEach(self.groupPanels, function (groupPanel)
                            {
                                event.setActiveTab(groupPanel);
                            });
                        }, 100);
                    }
                }
            }));
        }
        else
        {
            this.groupContainer = this.add(new Ext.Container({
                
                border: false,
                cls: 'notVisible',
                scrollable: 'vertical',
                flex: 1,
                margin: '0 0 0 5',
                listeners:
                {
                    boxready: function (event)
                    {
                        self.curScrollPosition = 0;

                        if (afterrenderFct)
                        {
                            self.groupContainer.removeCls('notVisible');

                            self.afterPanelsInserted();

                        }
                    }
                }
            }));
        }
    },

    createGroupPanel: function (partnerListGroup)
    {
        var self = this;

        var getGroupJSONByTitle = function (group)
        {
            var groupJSON = CLIENT_SETTINGS.getSetting('PARTNERS', 'groupJSON');

            if (groupJSON)
            {
                for (var i = 0; i < groupJSON.length; i++)
                {
                    var title = Ext.String.htmlEncode(group.title);
                    if (groupJSON[i].title === title || Ext.String.htmlEncode(groupJSON[i].title) === title)
                    {
                        return groupJSON[i];
                    }
                }
            }
            return undefined;
        };

        var groupJSON = getGroupJSONByTitle(partnerListGroup);
        var collapsed = false;
        var viewType = 'normal';

        if (groupJSON)
        {
            if (groupJSON.collapsed === undefined)
            {
                collapsed = true;
            }
            else
            {
                collapsed = groupValuesAsJSON.collapsed;
            }

            if (isValidString(groupValuesAsJSON.viewType))
            {
                viewType = groupValuesAsJSON.viewType;
            }
            else
            {
                viewType = 'normal';
            }
        }

        var className = "PartnerBoard.GroupPanel_Simple";
        if (partnerListGroup.getSource() === SOURCE_CONTACT_CENTER)
        {
            className = 'PartnerBoard.GroupPanel_ACD';
        }
        if (isValid(partnerListGroup.tenantId))
        {
            className = 'PartnerBoard.GroupPanel_Tenant';
        }

        var groupPanel = Ext.create(className, {
            group: partnerListGroup,
            collapsed: collapsed,
            parentContainer: self,
            memberList: [],
            viewType: viewType,
            groupSettings: undefined,
            scrollable: this.isTabView() ? 'vertical' : 'horizontal',
            originalCollapsedState: collapsed
        });

        self.groupPanels.push(groupPanel);
        
        groupPanel.initializeGroup();

        return groupPanel;
    },

    getSavedValuesForGroup: function(partnerlistGroup)
    {
        var result;
        var groupSettings = CLIENT_SETTINGS.getSetting('PARTNERS', 'groupSettings');
        Ext.each(groupSettings, function (groupSettingsForOneGroup)
        {
            if (groupSettingsForOneGroup.id === partnerlistGroup.getId())
            {
                result = groupSettingsForOneGroup;
                return false;
            }
        });
        return result;
    },

    removeGroup: function (group)
    {
        Ext.Array.remove(this.groupPanels, group);
    },

    saveGroupSettings: function ()
    {
        var groupsJSON = [];
        var self = this;

        for (var i = 0; i < self.groupPanels.length; i++)
        {
            if (self.groupPanels[i])
            {
                groupsJSON[i] = self.groupPanels[i].getGroupSettingsJSON();
                self.groupPanels[i].groupSettings = groupsJSON[i];
            }
        }

        CLIENT_SETTINGS.addSetting('PARTNERS', 'groupSettings', groupsJSON);
        CLIENT_SETTINGS.saveSettings();
    },

    changeGroupCollapse: function (collapse)
    {
        var self = this;
        Ext.batchLayouts(function ()
        {
            Ext.each(self.groupPanels, function (groupPanel)
            {
                if (collapse)
                {
                    groupPanel.minimizeContainer();
                }
                else
                {
                    groupPanel.expandContainer();
                }
            });
        });
        
        this.saveGroupSettings();
    },

    changeGroupViewStyle: function (newView)
    {
        var self = this;
        
        this.groupStyleView = newView;

        Ext.batchLayouts(function ()
        {
            Ext.each(self.groupPanels, function(groupPanel)
            {
                groupPanel.setViewType(newView);
            });
        });
        
        CLIENT_SETTINGS.addSetting('PARTNERS', 'contactView', newView);
        CLIENT_SETTINGS.saveSettings();
    },

    createNewGroupDialog: function ()
    {
        var self = this;

        this.newGroupDialog = new NewGroupDialog(
        {
            onCreateNewGroup: function (name, tenantId)
            {
                self.onCreateNewGroup(name, tenantId); 
            }
        });
    },

    onCreateNewGroup: function (name, tenantId)
    {
        var self = this;
        Ext.asap(function ()
        {

            var isTenantGroup = isValid(tenantId);

            var partnerListGroup = new www_caseris_de_CaesarSchema_PartnerListGroup();
            partnerListGroup.setName(name);
            partnerListGroup.setPosition(0);
            partnerListGroup.setSource(SOURCE_APPLICATION);
            if (isTenantGroup)
            {
                partnerListGroup.tenantId = tenantId;
            }

            var checkGroupsExists = function (tenantId)
            {
                for (var i = 0; i < self.groupPanels.length; i++)
                {
                    if (self.groupPanels[i] && tenantId)
                    {
                        if (self.groupPanels[i].titleText === name)
                        {
                            return true;
                        }
                    }
                }

                return false;
            };

            if (checkGroupsExists(partnerListGroup.tenantId))
            {
                self.showError(LANGUAGE.getString('partnerBoardGroupAlreadyExists', name), ErrorType.Info, DEFAULT_TIMEOUT_ERROR_MESSAGES);
            }
            else
            {
                Ext.batchLayouts(function ()
                {
                    var createdGroupPanel = self.createGroupPanel(partnerListGroup);
                    createdGroupPanel.onAddedByUser();

                    self.sortGroups();

                    self.hideNewGroupButtonForEmptyPartnerList();
                    if (self.isTabView())
                    {
                        self.groupContainer.setActiveTab(createdGroupPanel);
                    }
                    else
                    {
                        self.newGroupDialog.onAfterDisappearAnimation = function ()
                        {
                            createdGroupPanel.el.scrollIntoView(self.groupContainer.el); //das scrollen muss nach dem Schließen des Dialogs gemacht werden, weil ansonsten das Schliessen dazu führt, dass die Partnerleiste wieder nach oben scrollt
                        };
                    }
                });
            }
        });
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    },

    changeDisplayView: function (isTab)
    {
        var self = this;
        this.remove(this.groupContainer, false);
        var afterrenderFct = function ()
        {
            self.addAllGroupsToGroupContainer();
        };

        this.createGroupContainer(afterrenderFct);
    },


    sortGroups: function ()
    {
        this.groupPanels.sort(this.createSortFunction());

        this.addAllGroupsToGroupContainer();
    },

    addAllGroupsToGroupContainer: function()
    {
        var self = this;

        if (this.isTabView())
        {
            // Bei einem TabPanel funktioniert add nicht wie gewünscht, weil nicht über die Id gegangen wird und dadurch das Panel nicht ersetzt wird. 
            // Um zu erreichen das die Liste umsortiert wird, muss man insert nutzen
            Ext.each(this.groupPanels, function(groupPanel, index)
            {
                self.groupContainer.insert(index, groupPanel);

                //Wozu ist das nötig, das wird doch schon im boxready vom GroupPanel_ACD gemacht?
                //Fall: Partnerleiste als Startseite im Tab-Modus, da hatte nur die erste ACD-Gruppe ein farbiges Icon im Tab
                //Anscheinend ist im boxready des panels das tab noch nicht gerendered und deshalb kann das farbige Icon nicht gesetzt werden
                if (groupPanel.colorizeTabIconForACDGroup)
                {
                    groupPanel.colorizeTabIconForACDGroup();
                }
            });
        }
        else
        {
            this.groupContainer.add(this.groupPanels);
        }
    },

    createSortFunction: function()
    {
        var sortView = CLIENT_SETTINGS.getSetting('PARTNERS', 'sortView');
        var sortByTitleName = function (i, j)
        {
            if (!i.titleText && !j.titleText)
            {
                return 0;
            }
            if (!i.titleText)
            {
                return -1;
            }
            if (!j.titleText)
            {
                return 1;
            }
            if (i.titleText.toUpperCase() < j.titleText.toUpperCase())
            {
                return -1;
            }
            if (i.titleText.toUpperCase() > j.titleText.toUpperCase())
            {
                return 1;
            }
            return 0;
        };

        return function (i, j)
        {
            if (i.isACDGroup() && !j.isACDGroup())
            {
                if (sortView === 'start')
                {
                    return -1;
                }
                else if (sortView === 'end')
                {
                    return 1;
                }
            }

            if (!i.isACDGroup() && j.isACDGroup())
            {
                if (sortView === 'start')
                {
                    return 1;
                }
                else if (sortView === 'end')
                {
                    return -1;
                }
            }
            return sortByTitleName(i, j);
        };
    },

    onNewEvents: function (response)
    {
        var self = this;
        Ext.asap(function ()
        {
            if (isValid(response.getAgentConfiguration()))
            {
                var origin = Number(response.getAgentConfiguration().getOrigins());

                if (origin === 2)
                {
                    console.log("onAgentContactsResolved begin");
                    self.onAgentContactsResolved(response.getAgentConfiguration());
                }
                else
                {
                    console.log("onNewAgentConfiguration begin");
                    self.onNewAgentConfiguration(response.getAgentConfiguration());
                }

            }
            Ext.each(this.groupPanels, function (groupPanel)
            {
                groupPanel.onNewEvents(response);
            });
        });

        if (response.getCtiWebServiceAvailability() === Caesar.CtiWebServiceAvailability[Caesar.CtiWebServiceAvailability.Available])
        {
            this.recreatePartnerlist();
        }
    },

    onAgentContactsResolved: function (configuration)
    {
        Ext.reverseEach(this.groupPanels, function (groupPanel) //rückwärts-Schleife, weil das groupPanel ja auch währenddessen rausfliegen kann aus this.groupPanels
        {
            Ext.asap(function()
            {
                groupPanel.onAgentContactsResolved(configuration);
            });
        });
    },

    onNewAgentConfiguration: function(configuration)
    {
        var groupGUIDs = [];
        Ext.each(this.groupPanels, function (groupPanel)
        {
            var acdId = groupPanel.group.getAcdId();
            if (acdId > 0)
            {
                groupGUIDs.push(acdId);
            }
        });
        
        var groupGuidsFromConfiguration = [];
        Ext.iterate(CURRENT_STATE_CONTACT_CENTER.Groups, function (groupId, group)
        {
            groupGuidsFromConfiguration.push(Number(groupId));
        });

        Ext.reverseEach(this.groupPanels, function (groupPanel) //rückwärts-Schleife, weil das groupPanel ja auch währenddessen rausfliegen kann aus this.groupPanels
        {
            Ext.asap(function()
            {
                groupPanel.onNewAgentConfiguration(configuration);
            });
        });
        
        var groupIdsToAdd = Ext.Array.difference(groupGuidsFromConfiguration, groupGUIDs);
        Ext.each(groupIdsToAdd, function (guid)
        {
            var acdGroup = CURRENT_STATE_CONTACT_CENTER.Groups[guid];
            if (!isValid(acdGroup))
            {
                return;
            }

            var partnerListGroup = new www_caseris_de_CaesarSchema_PartnerListGroup();

            partnerListGroup.setId(acdGroup.getId());
            partnerListGroup.setSource(SOURCE_CONTACT_CENTER);
            partnerListGroup.setName(acdGroup.getName());
            partnerListGroup.setAcdId(Number(acdGroup.getId()));

            Ext.asap(function()
            {
                this.createGroupPanel(partnerListGroup);
            }, this);
        }, this);

        Ext.asap(function()
        {
            this.sortGroups();
        }, this);

        //Fall: PL leer und dann kommen ACD-Gruppen über die Konfiguration
        //die groupPanels hatten dann nicht 100%-Breite => komplette Pl neu zeichnen, dann alles gut
        Ext.asap(function()
        {
            var visibilityChanged = this.updateVisibilityOfNewGroupButtonForEmptyPartnerList();
            if (visibilityChanged)
            {
                this.recreatePartnerlist();
            }
        }, this);
    },

    afterPanelsInserted: function ()
    {
        if (!this.groupContainer || this.groupContainer.destroyed)
        {
            return;
        }

        this.sortGroups();

        this.groupContainer.removeCls('notVisible');

        hideLoadingMask(this);

        if (this.isTabView())
        {
            Ext.asap(function ()
            {
                this.groupContainer.setActiveTab(0);
            }, this);
        }
        
        this.updateVisibilityOfNewGroupButtonForEmptyPartnerList();
    },

    isTabView: function()
    {
        return CLIENT_SETTINGS.getSetting('PARTNERS', 'displayView') === 'tab';
    },
    
    onRemoveGroup: function(group)
    {
        this.groupContainer.remove(group);
        this.removeGroup(group);

        /*Ext.each(this.groupPanels, function(groupPanel)
        {
            Ext.asap(function ()
            {
                groupPanel.redrawAllTiles();
            });
        });*/

        Ext.asap(function ()
        {
            this.updateLayout();
            this.updateVisibilityOfNewGroupButtonForEmptyPartnerList();
        }, this);
    },

    onGlobalEvent_PartnerListSettingsChanged: function()
    {
        this.recreatePartnerlist();
    },

    recreatePartnerlist: function ()
    {
        this.createSubComponents();
    },

    showError: function (text, errorType, timeout)
    {
        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            errorMessageText: text,
            errorType: errorType,
            borderWidth: 1,
            timeoutInSeconds: timeout,
            margin: '10'
        }));
    },

    onGlobalEvent_mouseOverTile: function (tile, contact)
    {
        var tooltip = Ext.create('BusinessCardTooltipForPartnerList',
        {
            defaultAlign: 'tl-tr',
            contact: contact
        });
        this.onMouseEnter(tile, tooltip);
    },

    onGlobalEvent_mouseOutTile: function (tile)
    {
        this.onMouseLeave(tile);
    },

    onGlobalEvent_contextMenuForTile: function (tile)
    {
        this.onContextMenu(tile);
    }
});