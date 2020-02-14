Ext.define('PartnerBoard.GroupPanel_ACD',
{
    extend: 'PartnerBoard.BaseGroupPanel',
    
    fullACDOverviewTile: null,
    miniACDOverviewTile: null,

    allNormalDashboardValues: [],
    allMiniDashboardValues: [],

    initComponent: function()
    {
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            self.colorizeTabIconForACDGroup();
        });

        this.iconCls = ICON_NAME_ACD_AGENT;

        this.setVisible(CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe());
    },

    getAllTools: function ()
    {
        return [this.createAnnouncementButtonForGroups(), this.createRedirectionButtonForACDGroup(), this.createSettingsButton()];
    },

    getPositionOfSettingsButton: function ()
    {
        return this.getHeader().indexOf(this.settingsButton);
    },

    insertButtonBeforeSettingsButton: function (button)
    {
        return this.insertButtonInHeader(this.getPositionOfSettingsButton(), button);
    },

    insertButtonInHeader: function (position, button)
    {
        return this.getHeader().insert(position, button);
    },

    updateEmptyTextComponent: Ext.emptyFn,

    renameGroupOnServer: Ext.emptyFn,

    addHeaderListeners: function ()
    {
        this.callParent();
        this.addClickListenerOnGroupIcon();
    },

    addClickListenerOnGroupIcon: function()
    {
        this.tab.btnIconEl.on('click', function ()
        {
            createGroupConfigurationDialog();
        });
    },

    getHeaderComponentsAfterTitle: function ()
    {
        var imageClass = 'acdIconPartner acdIconPartner_' + this.group.getAcdId();

        this.acdIcon = new Ext.Component({
            height: 20,
            width: 20,
            cls: imageClass,
            margin: '0 5 0 0',
            style: {
                'cursor': 'pointer',
                'background-image': this.getBackgroundImageValueForAgentState()
            },
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        createGroupConfigurationDialog();
                    }
                }
            }
        });
        return [this.acdIcon];
    },

    getBackgroundImageValueForAgentState: function ()
    {
        var myAgentState = CURRENT_STATE_CONTACT_CENTER.getMyAgentState();
        var color = 'transparent';

        if (AgentState[myAgentState])
        {
            color = AgentState[myAgentState].color;
        }
        else
        {
            color = AgentState.LoggedOff.color;
        }
        if (!CURRENT_STATE_CONTACT_CENTER.isMyAgentLoggedInGroup(this.group.getId()))
        {
            color = AgentState.LoggedOff.color;
        }
        return "url(" + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, color) + ")";
    },

    initializeGroup: function ()
    {
        this.createTiles();
    },

    createTiles: function ()
    {
        if (this.destroyed)
        {
            return;
        }

        this.createDashboardValuesTiles();
        this.createACDOverviewTiles();
        this.createAgentTiles();

        this.redrawAllTiles();
    },

    createACDOverviewTiles: function()
    {
        var groupId = this.group.getAcdId();
        var dashBoardData = CURRENT_STATE_CONTACT_CENTER.DashboardCounter.getAgentOverview(groupId);
        if (dashBoardData)
        {
            this.agentStates_miniString = "";

            this.fullACDOverviewTile = new PartnerBoard.FullACDOverviewTile({
                dashBoardData: dashBoardData,
                groupSettings: this.groupSettings,
                groupPanel: this,
                groupId: groupId
            });
            
            this.miniACDOverviewTile = Ext.create('PartnerBoard.MiniACDOverviewTile', {
                dashBoardData: dashBoardData,
                groupSettings: this.groupSettings,
                groupPanel: this,
                groupId: groupId
            });
        }
    },

    createAgentTiles: function ()
    {
        if (!this.memberList)
        {
            this.memberList = [];
        }

        var contactCenterGroup = CURRENT_STATE_CONTACT_CENTER.Groups[this.group.getAcdId()];
        if (!isValid(contactCenterGroup))
        {
            if (isValid(this.parentContainer))
            {
                this.parentContainer.onRemoveGroup(this);
            }
            return;
        }

        var agentIds = contactCenterGroup.getAgentIds();
        var oldAgentIds = this.getAgentIdsOfMemberList();
        
        var agentsDeleted = this.deleteObsoleteMembersFromMemberList(oldAgentIds, agentIds);

        var agentsToInsert = this.insertNewMembersToMemberList(oldAgentIds, agentIds);

        this.addToMemberList(agentsToInsert);

        return agentsToInsert.length > 0 || agentsDeleted;
    },

    isInMemberList: function (contact)
    {
        var found = false;
        Ext.each(this.memberList, function (member)
        {
            if (member.getGuid() === contact.getGUID())
            {
                found = true;
                return false;
            }
        });

        return found;
    },

    getAgentIdsOfMemberList: function ()
    {
        var agentIds = [];
        Ext.each(this.memberList, function (member)
        {
            var agentIdForMember = member.agentId;
            if (agentIdForMember > 0)
            {
                agentIds.push(agentIdForMember);
            }
        }, this);
        return agentIds;
    },

    deleteObsoleteMembersFromMemberList: function (oldAgentIds, agentIds)
    {
        var agentIdsToDelete = Ext.Array.difference(oldAgentIds, agentIds);

        this.memberList = Ext.Array.filter(this.memberList, function (member)
        {
            var agentIdForMember = member.agentId;

            return !Ext.Array.contains(agentIdsToDelete, Number(agentIdForMember));
        });
        return agentIdsToDelete.length > 0;
    },

    insertNewMembersToMemberList: function (oldAgentIds, agentIds)
    {
        var agentsToInsert = [];
        var agentIdsToAdd = Ext.Array.difference(agentIds, oldAgentIds);
        Ext.each(agentIdsToAdd, function (agentId)
        {
            var agent = CURRENT_STATE_CONTACT_CENTER.getAgent(agentId);

            if (!isValid(agent.getContact()))
            {
                var contact = new www_caseris_de_CaesarSchema_Contact();
                contact.convertFromAgent(agent);
                agent.setContact(contact);
            }

            agent.getContact().getGuid = function ()
            {
                return this.getGUID();
            };

            if (!this.isInMemberList(agent.getContact()))
            {
                agent.getContact().agentId = agentId; //das ist für die Agenten, die keine GUID haben, und wir die AgentId nicht über CURRENT_STATE_CONTACT_CENTER herausfinden können
                agentsToInsert.push(agent.getContact());
            }
        }, this);

        return agentsToInsert;
    },

    getGuidOfContact: function (contact)
    {
        if (isValid(contact, 'getGuid()'))
        {
            return contact.getGuid();
        }
        else if (isValid(contact, 'getGUID()'))
        {
            return contact.getGUID();
        }
        return "";
    },

    onAgentContactsResolved: function (configuration)
    {
        Ext.each(this.collectAllTiles(), function (tile)
        {
            if (isValid(tile, "onAgentContactsResolved"))
            {
                tile.onAgentContactsResolved(configuration);
            }
        });
    },

    onNewAgentConfiguration: function (configuration) {
        this.updateName();
        this.createTiles();

        if (this.redirectionsButton)
        {
            if (this.redirectionsButton.hidden === false)
            {
                this.redirectionsButton.fireEvent('onNewAgentConfiguration', this.redirectionsButton);
            }
            else if (this.existRedirections())
            {
                this.redirectionsButton.show();
            }
        }

        if (this.announcementsButton)
        {
            if (this.announcementsButton.hidden === false)
            {
                this.announcementsButton.fireEvent('onNewAgentConfiguration', this.announcementsButton);
            }
            else if (this.existAnnouncements())
            {
                this.announcementsButton.show();
            }
        }
    },
    
    createDashboardValuesTiles: function ()
    {
        var groupId = this.group.getAcdId();
        var contactCenterGroup = CURRENT_STATE_CONTACT_CENTER.getGroup(groupId);
        var self = this;
        this.allNormalDashboardValues = [];
        this.allMiniDashboardValues = [];

        if (isValid(contactCenterGroup, 'getDashboardDataValues()') && CURRENT_STATE_CONTACT_CENTER.DashboardCounter[groupId])
        {
            var dashBoardValues = contactCenterGroup.getDashboardDataValues();
            
            for (var i = 0; i < dashBoardValues.length; i++)
            {
                var curDashboardItem = dashBoardValues[i];
                var dashboardType = curDashboardItem.getType();
                var curDashboardValue = 0;
                var escalationLevel = dashboardDataType.Neutral.value;
                var animationType = dashboardDataLevel.NoEffect.value;

                var dashboardCounters =
                [
                    CURRENT_STATE_CONTACT_CENTER.getDashboardCounter(groupId, dashboardType),
                    CURRENT_STATE_CONTACT_CENTER.getDashboardPercentage(groupId, dashboardType),
                    CURRENT_STATE_CONTACT_CENTER.getDashboardTimeSpan(groupId, dashboardType)
                ];
                Ext.each(dashboardCounters, function (dashboardCounter)
                {
                    if (isValid(dashboardCounter))
                    {
                        escalationLevel = dashboardCounter.getLevel();
                        animationType = dashboardCounter.getDisplay();
                        curDashboardValue = dashboardCounter.getValue();
                        return false;
                    }
                });

                var dashBoardData = {
                    title: curDashboardItem.getName(),
                    tooltip: curDashboardItem.getDescription(),
                    value: curDashboardValue,
                    type: curDashboardItem.getClass(),
                    heading: curDashboardItem.getHeading(),
                    identifier: curDashboardItem.getType()
                };

                var classNameForFull = 'PartnerBoard.FullDashBoardValueTile';
                if (dashBoardData.type === "AutoTimeSpan" || dashBoardData.type === "TimeSpan")
                {
                    classNameForFull = 'PartnerBoard.FullDashBoardTimespanTile';
                }
                if (dashBoardData.type === "Percentage")
                {
                    classNameForFull = 'PartnerBoard.FullDashBoardPercentageTile';
                }
                var dashboardValue = Ext.create(classNameForFull, {
                    escalationLevel: escalationLevel,
                    animationType: animationType,
                    dashBoardData: dashBoardData,
                    groupSettings: self.groupSettings,
                    groupPanel: self,
                    groupId: groupId,
                    dashboardType: dashboardType
                });
                this.allNormalDashboardValues.push(dashboardValue);

                var classNameForMini = 'PartnerBoard.MiniDashBoardValueTile';
                if (dashBoardData.type === "AutoTimeSpan" || dashBoardData.type === "TimeSpan")
                {
                    classNameForMini = 'PartnerBoard.MiniDashBoardTimespanTile';
                }
                if (dashBoardData.type === "Percentage")
                {
                    classNameForMini = 'PartnerBoard.MiniDashBoardPercentageTile';
                }
                var miniDashBoardValue = Ext.create(classNameForMini, {
                    escalationLevel: escalationLevel,
                    animationType: animationType,
                    dashBoardData: dashBoardData,
                    groupSettings: self.groupSettings,
                    groupPanel: self,
                    groupId: groupId,
                    dashboardType: dashboardType
                });

                this.allMiniDashboardValues.push(miniDashBoardValue);
            }
        }
    },

    updateName: function ()
    {
        var group = CURRENT_STATE_CONTACT_CENTER.getGroup(this.group.getAcdId());
        if (isValid(group))
        {
            this.renameGroup(group.getName());
        }
    },

    isACDGroup: function()
    {
        return true;
    },

    collectAllTiles: function ()
    {
        var result = [];
        if (this.isNormalViewType())
        {
            if (isValid(this.fullACDOverviewTile))
            {
                result.push(this.fullACDOverviewTile);
            }
            result = result.concat(this.allNormalDashboardValues);

        }
        else
        {
            if (isValid(this.miniACDOverviewTile))
            {
                result.push(this.miniACDOverviewTile);
            }
            result = result.concat(this.allMiniDashboardValues);
        }
        result = result.concat(this.callParent());
        return result;
    },

    onNewEvents: function(response)
    {
        this.callParent(arguments);

        var list = [this.allNormalDashboardValues, this.allMiniDashboardValues, [this.fullACDOverviewTile, this.miniACDOverviewTile]];
        Ext.each(list, function (tileList)
        {
            Ext.each(tileList, function (tile)
            {
                if (isValid(tile, 'onNewEvents'))
                {
                    tile.onNewEvents(response);
                }
            });
        });

        if (isValid(response, "getAgentInfos()"))
        {
            this.updateAgentState();
            this.colorizeTabIconForACDGroup();
        }

        if (CLIENT_SETTINGS.getSetting('PARTNERS', 'displayView') !== 'tab') //TODO: Das ist nur eine Notlösung: In der Tabansicht bewirkt das SetVisible, dass immer die letzte Gruppe "selektiert" wird
        {
            this.setVisible(CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe());
        }
    },

    updateAgentState: function ()
    {
        if (!isValid(this, "acdIcon.el.dom"))
        {
            return;
        }
        
        this.acdIcon.el.dom.style.backgroundImage = this.getBackgroundImageValueForAgentState();
    },

    colorizeTabIconForACDGroup: function ()
    {
        var me = this;
        // Falls man in der Tab-Darstellung ist und es eine ACD-Gruppe ist...
        if (isValid(me, 'tab.btnIconEl'))
        {
            //... Anzeige-Icon in den aktuellen Anmeldestatus ändern
            me.tab.btnIconEl.removeCls(ICON_NAME_ACD_AGENT);
            me.tab.btnIconEl.addCls('acdIconPartner_' + me.group.getId());

            // initial einmal das Icon setzten
            var agentId = CURRENT_STATE_CONTACT_CENTER.getAgentIDForContactGUID(MY_CONTACT.getGUID());
            var agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfo(agentId);
            var groupColor = AgentState.LoggedOff.color;

            // Ist man in der Gruppe angemeldet...
            if (agentInfo && agentInfo.amILogedInGroup(me.group.getId()))
            {
                // ... den aktuellen Agentenstatus übernehmen -> Ansonsten bleibt der Status auf abgemeldet stehen
                if (AgentState[CURRENT_STATE_CONTACT_CENTER.getMyAgentState()])
                {
                    groupColor = AgentState[CURRENT_STATE_CONTACT_CENTER.getMyAgentState()].color;
                }
            }

            me.tab.setIcon(IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, groupColor));
        }
    },

    getClassNameForContextMenu: function ()
    {
        return 'ACDGroupContextMenu';
    },

    openAnnouncementsDialog: function () {
        new AnnouncementsDialog(
            {
                groupId: this.group.getAcdId()
            }).show();

    },

    openRedirectionDialog: function () {
        new RedirectionsDialog(
            {
                groupId: this.group.getAcdId()
            }).show();
    }, 

    existRedirections: function () {
        if (!Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getRedirectionsForGroup(this.group.getAcdId()))) {
            return true;
        }
        return false;
    },

    existAnnouncements: function () {
        if (!Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getAnnouncementsForGroup(this.group.getAcdId()))) {
            return true;
        }
        return false;
    },

    createAnnouncementButtonForGroups: function () {
        var self = this;
        this.announcementsButton = Ext.create('ThinButton', {
            hidden: !this.existAnnouncements(),
            margin: '0 5 0 5',
            icon: 'Images/64/speaker.png',
            tooltip: LANGUAGE.getString("announcements"),
            listeners: {
                click: function () {
                    self.openAnnouncementsDialog();
                },
                onNewAgentConfiguration: function () {
                    if (Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getAnnouncementsForGroup(self.group.getAcdId()))) {
                        this.hide();
                    }

                }
            }
        });
        return this.announcementsButton;
    },

    createRedirectionButtonForACDGroup: function ()
    {
        var self = this;
        this.redirectionsButton = Ext.create('ThinButton', {
            hidden: !this.existRedirections(),
            margin: '0 5 0 5',
            icon: 'Images/64/redirection.png',
            tooltip: LANGUAGE.getString("redirections"),
            listeners: {
                click: function ()
                {
                    self.openRedirectionDialog();
                },
                onNewAgentConfiguration: function ()
                {
                    if (Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getRedirectionsForGroup(self.group.getAcdId())))
                    {
                        this.hide();
                    }
                }

            }
        });
        return this.redirectionsButton;
    }
});