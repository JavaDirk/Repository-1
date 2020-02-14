Ext.define('ContactCenterForwardDialog',
{
    extend: 'ModalDialog',

    groupId: -1,

    callId: -1,

    initComponent: function ()
    {
        this.titleText = LANGUAGE.getString("forwardContactCenterCallDialogTitle");

        this.callParent();

        this.setMinHeight(window.innerHeight * 0.8);
        this.setMaxHeight(window.innerHeight * 0.8);

        this.group = CURRENT_STATE_CONTACT_CENTER.getGroup(this.groupId);
        if (!isValid(this.group))
        {
            console.error("ContactCenterForwardDialog: did not found a group for groupId: " + this.groupId, CURRENT_STATE_CONTACT_CENTER.Groups);
            showErrorMessage(LANGUAGE.getString("unknownErrorOccurred"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            return;
        }

        var agents = CURRENT_STATE_CONTACT_CENTER.getCallTransferAgentsForGroup(this.groupId);

        this.agents = Ext.Array.filter(agents, function (agent)
        {
            if (isValidString(agent.getGUID()) && agent.getGUID() === MY_CONTACT.getGUID())
            {
                return false;
            }
            return true;
        });
        this.groups = CURRENT_STATE_CONTACT_CENTER.getCallTransferGroupsForGroup(this.groupId);
        
        this.tabPanel = this.addToBody(new Ext.tab.Panel(
        {
            flex: 1,
            padding: '0 10 15 10',
            deferredRender: false,
            bodyStyle:
            {
                border: 'none'
            },
            listeners:
            {
                tabchange: (tabPanel, newCard, oldCard, eOpts) =>
                {
                    if (newCard)
                    {
                        if (newCard && oldCard)
                        {
                            CLIENT_SETTINGS.addSetting("CONTACT_CENTER", "ContactCenterForwardDialog_selectedTab", newCard.clientSettingsValue);
                        }
                        
                        CLIENT_SETTINGS.saveSettings();

                        newCard.focus();
                    }
                }
            }
        }));
        this.tabPanel.add(this.createAgentList());
        this.tabPanel.add(this.createGroupList());
        this.tabPanel.add(this.createTelephoneInputPanel());

        var selectedTab = CLIENT_SETTINGS.getSetting("CONTACT_CENTER", "ContactCenterForwardDialog_selectedTab");
        this.tabPanel.each(function (item, index)
        {
            if (!item.hidden && item.clientSettingsValue === selectedTab)
            {
                this.tabPanel.setActiveTab(index);
                return false;
            }
        }, this);
        if (!isValid(this.tabPanel.getActiveTab()))
        {
            this.tabPanel.each(function (item, index)
            {
                if (!item.hidden)
                {
                    this.tabPanel.setActiveTab(index);
                    return false;
                }
            }, this);
        }

        this.addButton(
        {
            text: LANGUAGE.getString("forwardContactCenterCall"),
            handler: () =>
            {
                this.onForwardCall();
            }
        });

        Ext.asap(() =>
        {
            var activeTab = this.tabPanel.getActiveTab();
            activeTab.focus();
        });

        this.on('boxready', function ()
        {
            SESSION.addListener(this);
        }, this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    createAgentList: function ()
    {
        this.agentListContainer = new Ext.Container(
        {
            clientSettingsValue: 'agents',
            title: LANGUAGE.getString("agents"),
            layout:
            {
                type: 'vbox',
                align: 'stretch'
                },
            flex: 1,
            getView: () =>
            {
                return this.agentList;
            },
            focus: function ()
            {
                searchField.focus();
            }
        });

        var searchField = this.agentListContainer.add(this.createSearchField(LANGUAGE.getString("searchIn", LANGUAGE.getString("agents"))));
        this.agentListContainer.add(Ext.create('Ext.Component', //diese Component wird nur gebraucht, um den obersten borderTop der Liste zu verdecken. Dadurch braucht man keine Logik, wann man einen Trennstrich zwischen den Kontakten braucht
        {
            height: 5,
            style: 'z-index:1;background-color:white'
        }));
        this.agentList = this.agentListContainer.add(new ContactListPanel(
        {
            margin: '-1 0 0 0',
            minHeight: 100,
            overlayButtons: false,
            openContactOnSelect: false,
            plugins:
            [
                {
                    ptype: 'ContactViewWithPhotos',
                    showAgentState: ShowAgentState.showAlways
                }
            ],
            getTemplateString: function ()
            {
                return '<tpl for=".">' + getContactTemplateString(55, '0 ' + VIEWS_PADDING_RIGHT + ' 0 ' + VIEWS_PADDING_LEFT, "0 0 0 15px") + '</tpl>';
            },
            onDoubleClick: (view, record, item) =>
            {
                this.onForwardCall();
            },
            getFilterFunction: (searchString) =>
            {
                return function (record)
                {
                    return record.data.matches(searchString);
                };
            }
        }));

        this.agentList.showContacts(this.agents);
        if (Ext.isEmpty(this.agents))
        {
            this.agentListContainer.hide();
        }
        return this.agentListContainer;
    },

    createGroupList: function ()
    {
        var self = this;
        this.groupListContainer = new Ext.Container(
        {
            clientSettingsValue: 'groups',
            title: LANGUAGE.getString("groups"),
            layout:
            {
                type: 'vbox',
                align: 'stretch'
                },
            //flex: 1,
            getView: () =>
            {
                return this.groupList;
            },
            focus: function ()
            {
                searchField.focus();
            }
        });

        var searchField = this.groupListContainer.add(this.createSearchField(LANGUAGE.getString("searchIn", LANGUAGE.getString("groups"))));

        this.groupList = this.groupListContainer.add(new OutboundGroupList(
        {
            itemPadding: '0 0 0 ' + VIEWS_PADDING_LEFT,
            minHeight: 100,
            showMyContact: false,
            overlayButtons: false,
            groups: this.groups,
            onDoubleClick: () =>
            {
                this.onForwardCall();
            },

            getLastSelectedGroupId: function ()
            {
                if (self.groups.length > 0)
                {
                    return self.groups[0].GroupId;
                }
                return -1;
            },

            listeners:
            {
                select: function (view, record, item)
                {
                    self.skillsViewPanel.setSkills(record.data.skills);
                }
            },
            getFilterFunction: (searchString) =>
            {
                return function (record)
                {
                    var name = record.data.Name.toUpperCase();
                    return name.indexOf(searchString.toUpperCase()) >= 0;
                };
            }
        }));

        var skills = [];
        if (!Ext.isEmpty(this.groups))
        {
            skills = this.groups[0].skills;
        }
        
        this.skillsViewPanel = this.groupListContainer.add(new SkillsViewPanel(
        {
            margin: '5 0 0 0',
            skills: skills,
            maxHeight: 180
        }));

        if (Ext.isEmpty(this.groups))
        {
            this.groupListContainer.hide();
        }
        return this.groupListContainer;
    },

    createTelephoneInputPanel: function ()
    {
        var self = this;

        this.ctiAction = Ext.create('CTIAction_BlindTransfer',
        {
            callId: this.callId,
            beforeCTIAction: function (response)
            {
                self.hide(true);
            }
        });

        this.telephoneInputPanel = Ext.create('TelephoneInputPanel',
        {
            clientSettingsValue: 'telephoneInput',
            title: LANGUAGE.getString("phoneNumber"),
            padding: '10 0 0 0',
            width: DEFAULT_WIDTH_FOR_LISTS,
            buttonBackgroundColor: 'white',
            searchPanelMarginRight: 5,
            clearComboBoxOnSuccess: false,
            searchResultsPanelClassName: 'SearchResultsPanelForTransfer',
            showOutboundGroup: false
        });

        this.telephoneInputPanel.setCallButtons(null);
        this.telephoneInputPanel.setCTIAction(this.ctiAction);

        return this.telephoneInputPanel;
    },

    createSearchField: function (emptyText)
    {
        return new InstantSearchField(
        {
            emptyText: emptyText,
            margin: '10 0',
            padding: '10 10 0 10',
            startSearch: (searchString) =>
            {
                this.startSearch(searchString);
            }
        });
    },
    
    onForwardCall: function ()
    {
        this.hide();
        Ext.asap(() =>
        {
            var activeTab = this.tabPanel.getActiveTab();
            if (activeTab === this.groupListContainer)
            {
                var groupId = this.getSelectedGroupId();
                if (isValid(groupId))
                {
                    var skills = this.skillsViewPanel.getCheckedSkills();
                    SESSION.transferContactCenterCallToGroup(this.sessionId, groupId, skills, this.callId);
                }
            }
            else if (activeTab === this.agentListContainer)
            {
                var agentId = this.getSelectedAgentId();
                if (isValid(agentId))
                {
                    SESSION.transferContactCenterCallToAgent(this.sessionId, agentId, this.callId);
                }
            }
            else
            {
                this.ctiAction.groupId = this.telephoneInputPanel.getSelectedGroupId();

                var selectedContact = this.telephoneInputPanel.searchResultsPanel.getSelectedContact();
                if (selectedContact)
                {
                    Ext.create('PickNumberAndStartAction',
                        {
                            ctiAction: this.ctiAction,
                            searchResultsPanel: this.telephoneInputPanel.searchResultsPanel,
                            comboBox: this.telephoneInputPanel.comboBox,
                            noInputCallback: Ext.emptyFn,
                            showError: function (text)
                            {
                                showInfoMessage(text, DEFAULT_TIMEOUT_ERROR_MESSAGES);
                            }
                        }).startActionForSelectedContact();
                }
                else
                {
                    var comboBoxValue = this.telephoneInputPanel.comboBox.getRawValue();
                    this.ctiAction.number = comboBoxValue;

                    this.ctiAction.run();
                }
            }
        });
    },

    getSelectedAgentId: function ()
    {
        var contact = this.agentList.getSelectedContact();
        if (contact)
        {
            return contact.data.agent.getId();
        }
        return -1;
    },

    getSelectedGroupId: function ()
    {
        var group = this.groupList.getSelectedGroup();
        if (group)
        {
            return group.data.Id;
        }
        return -1;
    },

    startSearch: function (searchString)
    {
        var activeTab = this.tabPanel.getActiveTab();
        var view = activeTab.getView();
        if (!isValid(view) || !isValid(view, "getStore()"))
        {
            return;
        }

        if (view.lastSearchString === searchString)
        {
            view.reselect();
            return;
        }

        view.getStore().clearFilter();
        if (isValidString(searchString))
        {
            view.getStore().filterBy(view.getFilterFunction(searchString));
        }
        else
        {
            view.setEmptyText("");
        }

        view.getSelectionModel().deselectAll();
        view.getSelectionModel().select(0);

        if (view.getStore().getCount() === 0)
        {
            view.setEmptyText(LANGUAGE.getString("noHitsFor", searchString));
            this.skillsViewPanel.setSkills([]);
        }
        view.lastSearchString = searchString;
    },

    onNewEvents: function ()
    {
        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        if (!isValid(lastCallEvent) || lastCallEvent.isDisconnected() || lastCallEvent.isIdle())
        {
            this.hide();
        }
    }
});