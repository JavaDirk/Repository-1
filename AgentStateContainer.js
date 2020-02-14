var ID_ERROR_MESSAGE_FORM_MUST_BE_FILLED = 'FormMustBeFilled';
Ext.define('AgentStateDialog',
{
    extend: 'CustomMenu',

    highlightFirstMenuItem: false,

    initComponent: function ()
    {
        var self = this;

        this.insertItems = [];
        this.insertItems[0] = [];
        this.insertItems[1] = [];

        this.insertItems[0].push({
            text: AgentState.Available.text,
            iconName: ICON_NAME_ACD_AGENT,
            iconColor: COLOR_AGENT_GREEN,
            number: 'Available',
            handler: function (item)
            {
                if (CURRENT_STATE_CONTACT_CENTER.isAgentLoggedOff())
                {
                    SESSION.getLoginStates(function (response)
                    {
                        if (response.getReturnValue().getCode() === 0)
                        {
                            var loggedInGroups = Ext.Array.filter(response.getStates(), function (state)
                            {
                                return state.Activated;
                            }, this);
                            if (Ext.isEmpty(loggedInGroups))
                            {
                                showConfirmation(Ext.create('ConfirmationComponent',
                                    {
                                        yesCallback: () =>
                                        {
                                            var dialog = new GroupsAndCampaignsDialog();
                                            dialog.setAllLoginStates(true);
                                            dialog.saveLoginStates(null, function (response)
                                            {
                                                SESSION.setAgentState(AgentState.Available, "", false);
                                            });
                                        },
                                        noCallback: () => 
                                        {

                                        },
                                        errorMessageText: LANGUAGE.getString("loginToAllGroupsAndCampaigns")
                                    }));
                            }
                            else
                            {
                                SESSION.setAgentState(AgentState.Available, "", false);
                            }
                        }
                    }, function () { });
                    
                }
                else
                {
                    SESSION.setAgentState(AgentState.Available, "", false);
                }
            }
        });

        this.insertItems[0].push({
            text: AgentState.NotAvailable.text,
            iconName: ICON_NAME_ACD_AGENT,
            iconColor: COLOR_AGENT_RED,
            number: 'NotAvailable',
            handler: function (item)
            {
                SESSION.setAgentState(AgentState.NotAvailable, "", false);
                item.parentMenu.hide();
            },
            onShow: function ()
            {
                var menu = self.createMenuForNotReadyReasons();
                this.setMenu(menu);
            },

            menu: {}
        });

        this.insertItems[0].push({
            text: AgentState.PostProcessing.text,
            iconName: ICON_NAME_ACD_AGENT,
            iconColor: COLOR_AGENT_BLUE,
            style:
            {
                color: AgentState.PostProcessing.color
            },
            number: 'PostProcessing',
            handler: function (item)
            {
                SESSION.setAgentState(AgentState.PostProcessing, "", false);
            }
        });

        this.insertItems[0].push({
            text: AgentState.LoggedOff.text,
            iconName: ICON_NAME_ACD_AGENT,
            iconColor: COLOR_AGENT_GREY,
            number: 'LoggedOff',
            handler: function (item)
            {
                SESSION.setAgentState(AgentState.LoggedOff, "", false);
            },
            onShow: function ()
            {
                if (window.CURRENT_STATE_CONTACT_CENTER && !CURRENT_STATE_CONTACT_CENTER.mayILoggOff())
                {
                    this.hide();
                }
            }
        });

        this.insertItems[1].push({
            text: LANGUAGE.getString('loginNew'),
            iconName: 'settings',
            handler: function (item)
            {
                createGroupConfigurationDialog();
            }
        });

        this.callParent();

        this.on('show', function ()
        {
            Ext.each(self.items.items, function (menuItem)
            {
                menuItem.onShow();
            });
        });
    },

    createMenuForNotReadyReasons: function ()
    {
        var self = this;
        var notReadyReasons = CURRENT_STATE_CONTACT_CENTER.getNotReadyReasons();
        var subMenuEntries = [];
        subMenuEntries.push(
            {
                text: LANGUAGE.getString("notReadyReason_Reason") + ":",
                disabled: true,
                style:
                {
                    'background-color': 'transparent',
                    opacity: 1 //sonst wird durch das disabled:true die opacity auf 0.5 gestellt und die schwarze Farbe wird grau
                },
                listeners:
                {
                    afterrender: function (menuItem)
                    {
                        menuItem.textEl.setStyle({ 'font-weight': 'bold', 'color': 'black !important' });
                    }
                }
            });
        subMenuEntries.push(Ext.create('Ext.menu.Separator', {}));

        subMenuEntries.push(self.createMenuItemForNotReadyReason(LANGUAGE.getString("notReadyReason_Other")));
        subMenuEntries.push(self.createMenuItemForNotReadyReason(LANGUAGE.getString("notReadyReason_Break")));

        Ext.each(notReadyReasons, function (notReadyReason)
        {
            subMenuEntries.push(self.createMenuItemForNotReadyReason(notReadyReason));
        });

        return Ext.create('CustomMenu',
            {
                insertItems: subMenuEntries
            });
    },

    createMenuItemForNotReadyReason: function (reason)
    {
        var myAgentInfo = CURRENT_STATE_CONTACT_CENTER.getMyAgentInfo();
        
        return {
            xtype: 'menucheckitem',
            group: 'notReadyReasons',
            text: Ext.String.htmlEncode(reason),
            handler: function ()
            {
                this.setChecked(true);
                SESSION.setAgentState(AgentState.NotAvailable, reason, false);
            },
            checked: (isValid(myAgentInfo) && myAgentInfo.getAgentStateText() === reason) ? true : undefined //wenn man false nimmt, zeigt er einen leeren Rahmen an
        };
    }
});

Ext.define('AgentStateContainer',
    {
        extend: 'Ext.Container',

        height: 24,
        layout: { type: 'hbox', pack: 'start', align: 'stretch' },

        style:
        {
            'border-radius': BORDER_RADIUS_BUTTONS + ' !important',
            'background-color': WHITE
        },
        margin: '7 5 0 0',

        visibilityAgentStateText: true,

        initComponent: function ()
        {
            this.callParent();

            var self = this;

            this.selectButton = this.add(new Ext.button.Button({
                width: 42,
                height: 24,
                scale: 'small',
                border: 0,
                padding: '0 0 0 10',
                cls: 'buttonWithMenu',
                listeners: {
                    afterrender: function (button)
                    {
                        var agentInfo = CURRENT_STATE_CONTACT_CENTER.getMyAgentInfo();
                        this.setAgentStateImage(agentInfo);

                        button.btnEl.setStyle({ padding: '0' });
                        button.btnIconEl.setStyle({ 'background-size': '16px' });

                        SESSION.addListener(this);
                    },

                    destroy: function ()
                    {
                        SESSION.removeListener(this);
                    },

                    el: {
                        click: function ()
                        {
                            self.menu.showBy(self);
                        }
                    }
                },
                style: {
                    'border-radius': BORDER_RADIUS_BUTTONS + ' 0 0 ' + BORDER_RADIUS_BUTTONS + ' !important',
                    'background-color': WHITE
                },
                menu: {}, //wird nur gebraucht, damit ExtJS ein Dreieck anzeigt

                onNewEvents: function (response)
                {
                    Ext.each(response.getAgentInfosForId(CURRENT_STATE_CONTACT_CENTER.getMyAgentId()), function (agentInfo) 
                    {
                        this.setAgentStateImage(agentInfo);
                    }, this);


                    if (isValid(response.getAgentConfiguration()) || isValid(response.getAgentInfos()))
                    {
                        this.updateTitleForLoggedInGroups();
                    }
                },

                setAgentStateImage: function (agentInfo)
                {
                    if (!agentInfo)
                    {
                        return;
                    }
                    var agentState = getEnumForAgentState(agentInfo.getAgentState());
                    this.setIcon(IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, agentState.color));
                },

                updateTitleForLoggedInGroups: function ()
                {
                    var groups = CURRENT_STATE_CONTACT_CENTER.getMyLoggedInGroups();
                    var groupNames = Ext.Array.pluck(groups, "Name");

                    var campaigns = CURRENT_STATE_CONTACT_CENTER.getMyLoggedInCampaigns();
                    var campaignNames = Ext.Array.pluck(campaigns, "Name");

                    var textForGroups = LANGUAGE.getString("loggedInFollowingGroups", groupNames.join(",\n"));
                    var textForCampaigns = LANGUAGE.getString("loggedInFollowingCampaigns", campaignNames.join(",\n"));

                    var title;
                    if (Ext.isEmpty(campaignNames) && Ext.isEmpty(groupNames))
                    {
                        title = LANGUAGE.getString("notLoggedIn");
                    }
                    else if (Ext.isEmpty(campaignNames))
                    {
                        title = textForGroups;
                    }
                    else if (Ext.isEmpty(groupNames))
                    {
                        title = textForCampaigns;
                    }
                    else
                    {
                        title = textForGroups + "\n\n" + textForCampaigns;
                    }
                    this.el.dom.title = title;
                }
            }));

            this.menu = Ext.create('AgentStateDialog');

            this.selectTextField = this.add(new Ext.form.Label(
            {
                style:
                {
                    'font-size': '13px',
                    cursor: 'pointer'
                },
                width: 170,
                padding: '3 0 0 5',

                listeners:
                {
                    boxready: function ()
                    {
                        var agentInfo = CURRENT_STATE_CONTACT_CENTER.getMyAgentInfo();
                        this.setAgentStateTextAndColor(agentInfo);
                        
                        SESSION.addListener(this);
                    },

                    destroy: function ()
                    {
                        SESSION.removeListener(this);
                    },

                    el:
                    {
                        click: function ()
                        {
                            self.menu.showBy(self);
                        }
                    }
                },

                onNewEvents: function (response)
                {
                    Ext.each(response.getAgentInfosForId(CURRENT_STATE_CONTACT_CENTER.getMyAgentId()), function (agentInfo)
                    {
                        this.setAgentStateTextAndColor(agentInfo);
                    }, this);
                },

                setAgentStateTextAndColor: function (agentInfo)
                {
                    if (!agentInfo)
                    {
                        return;
                    }
                    var agentState = getEnumForAgentState(agentInfo.getAgentState());
                    this.el.setStyle({ color: agentState.color });
                    this.setText(agentState.text);
                }
            }));

            this.timeField = this.add(Ext.create('CheapLabel',
                {
                    text: '00:00',
                    padding: "4 15 5 0",
                    border: 0,
                    height: 20,
                    width: 60,
                    timeOut: {},
                    margin: 0,
                    left: 0,
                    style: {
                        'border-radius': '0 ' + BORDER_RADIUS_BUTTONS + ' ' + BORDER_RADIUS_BUTTONS + ' 0 !important',
                        'background-color': WHITE,
                        color: BLACK,
                        'text-align': 'right',
                        'font-size': '12px'
                    },

                    setMenu: function (menu)
                    {
                        this.menu = menu;
                    },

                    startCounter: function ()
                    {
                        var me = this;
                        this.timeOut = setInterval(function ()
                        {
                            if (me.destroyed)
                            {
                                clearInterval(me.timeOut);
                                return;
                            }

                            me.setText(convertSecondsToString(me.getSeconds()), false);
                        }, 1000);
                    },
                    startPostProcessing: function (initialTime)
                    {
                        this.countDown = true;

                        clearTimeout(this.timeOut);
                        this.setSeconds(initialTime);
                        this.updatePostProcessing();
                    },

                    updatePostProcessing: function ()
                    {
                        var seconds = this.getSeconds();
                        if (seconds === 0)
                        {
                            if (CURRENT_STATE_CALL.FormMustBeFilled())
                            {
                                showWarningMessage(LANGUAGE.getString('fillForm'), null, ID_ERROR_MESSAGE_FORM_MUST_BE_FILLED);
                            }
                            else
                            {
                                SESSION.setAgentState(AgentState.Available, "", false);
                            }
                        }
                        else
                        {
                            if (seconds < 0 && this.countDown)
                            {
                                seconds = 0;
                            }

                            this.timeOut = setTimeout(() => 
                            {
                                if (isValid(this.updatePostProcessing))
                                {
                                    this.updatePostProcessing();
                                }
                            }, 1000);
                        }
                        this.setText(convertSecondsToString(seconds));
                    },

                    restartCounter: function (seconds) 
                    {
                        this.countDown = false;

                        clearTimeout(this.timeOut);
                        this.setSeconds(seconds);
                        this.setText(convertSecondsToString(seconds));
                        this.startCounter();
                    },

                    menu: {},

                    listeners:
                    {
                        el:
                        {
                            click: function (label)
                            {
                                label = Ext.getCmp(label.currentTarget.id);

                                if (isValid(label, 'menu.items.length') && label.menu.items.length > 0)
                                {
                                    new CustomMenu(
                                        {
                                            insertItems: label.menu.items
                                        }).showBy(label);
                                }
                            }
                        },
                        afterrender: function ()
                        {
                            SESSION.addListener(this);
                            this.startCounter();
                        },

                        destroy: function ()
                        {
                            SESSION.removeListener(this);
                        }
                    },

                    onNewEvents: function (response)
                    {
                        if (!CURRENT_STATE_CALL.FormMustBeFilled())
                        {
                            removeErrorMessage(ID_ERROR_MESSAGE_FORM_MUST_BE_FILLED);
                        }
                        Ext.each(response.getAgentInfosForId(CURRENT_STATE_CONTACT_CENTER.getMyAgentId()), function (agentInfo) 
                        {
                            if (agentInfo.getAgentState() === AgentState.PostProcessing.value && parseInt(agentInfo.getPostProcessTime(), 10) > 0)
                            {
                                this.startPostProcessing(parseInt(agentInfo.getPostProcessTime(), 10));
                                this.setStyle({ cursor: 'pointer' });
                                this.setMenu(
                                    {
                                        plain: true,
                                        width: 100,
                                        floating: false,
                                        items:
                                            [
                                                {
                                                    plain: true,
                                                    icon: IMAGE_LIBRARY.getImage('clock', 64, NEW_GREY),
                                                    text: LANGUAGE.getString('extendPostProcessingTime_OneMinute'),
                                                    handler: function ()
                                                    {
                                                        self.timeField.addSeconds(60);
                                                    }
                                                },
                                                {
                                                    plain: true,
                                                    icon: IMAGE_LIBRARY.getImage('clock', 64, NEW_GREY),
                                                    text: LANGUAGE.getString('extendPostProcessingTime_TwoMinutes'),
                                                    handler: function ()
                                                    {
                                                        self.timeField.addSeconds(120);
                                                    }
                                                }
                                            ]
                                    });
                            }
                            else
                            {
                                this.restartCounter(agentInfo.getStateTime());
                                this.setStyle({ cursor: 'default' });
                                this.setMenu({
                                    plain: true
                                });
                            }

                            this.setStyle({ color: getEnumForAgentState(agentInfo.getAgentState()).color });

                        }, this);
                    },

                    setSeconds: function (seconds)
                    {
                        if (this.countDown)
                        {
                            seconds = -1 * seconds;
                        }
                        this.timestampStateChange = new Date().getTime();
                        if (isValid(seconds))
                        {
                            this.timestampStateChange = this.timestampStateChange - seconds * 1000;
                        }
                    },

                    getSeconds: function ()
                    {
                        var now = new Date().getTime();
                        var difference = now - this.timestampStateChange;
                        if (this.countDown)
                        {
                            difference = this.timestampStateChange - now;
                        }
                        return Math.floor(difference / 1000);
                    },

                    addSeconds: function (seconds)
                    {
                        if (!isValid(this.timestampStateChange))
                        {
                            return;
                        }
                        this.timestampStateChange += seconds * 1000;
                    }
                }));

            this.on('boxready', function ()
            {
                if (!CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe())
                {
                    this.hide();
                }

                SESSION.addListener(this);
                
                this.tooltip = Ext.create('Ext.tip.ToolTip',
                {
                    target: this.el,
                    showDelay: 1000,
                    autoHide: true,
                    trackMouse: false,

                    listeners:
                    {
                        beforeshow: function (tip)
                        {
                            var agentInfo = CURRENT_STATE_CONTACT_CENTER.getMyAgentInfo();
                            if (isValid(agentInfo) && isValidString(agentInfo.getAgentStateText()))
                            {
                                tip.update(LANGUAGE.getString("notReadyReason_Reason") + ": " + Ext.String.htmlEncode(agentInfo.getAgentStateText()));
                                return true;
                            }
                            return false;
                        }
                    }
                    });

                this.setAgentStateTextVisibility(this.visibilityAgentStateText);

            }, this);

        },

        destroy: function ()
        {
            if (this.tooltip)
            {
                this.tooltip.destroy();
            }
            
            SESSION.removeListener(this);
            this.callParent();
        },

        onNewEvents: function (response)
        {
            if (CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe())
            {
                this.show();
            }
            else
            {
                this.hide();
            }
        },

        onSetAgentStateSuccess: function (response, state, text)
        {
            if (isValid(response, 'getReturnValue().getExtendedInfo()'))
            {
                var infos = JSON.parse(response.getReturnValue().getExtendedInfo());

                var doneFct = function ()
                {
                    if (infos.length > 0)
                    {
                        var curInfo = infos[0];

                        var newInfos = [];

                        for (var i = 1; i < infos.length; i++)
                        {
                            newInfos[i - 1] = infos[i];
                        }

                        infos = newInfos;

                        var closing = false;

                        if (infos.length <= 0)
                        {
                            closing = true;
                        }

                        showConfirmation(Ext.create('ConfirmationComponent',
                            {
                                yesCallback: doneFct,
                                noCallback: Ext.emptyFn,
                                yesButtonText: LANGUAGE.getString('ok'),
                                showCloseButton: closing,
                                errorMessageText: curInfo
                            }));
                    }
                };

                doneFct();
            }
            else
            {
                if (response.getReturnValue().getCode() === ProxyError.ErrorSetAgentState.value)
                {
                    showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
                else if (response.getReturnValue().getCode() === ProxyError.ErrorNotEnoughAgents.value ||
                    response.getReturnValue().getCode() === ProxyError.ErrorFormNotFilled.value)
                {
                    showConfirmation(Ext.create('ConfirmationComponent',
                        {
                            yesCallback: function ()
                            {
                                SESSION.setAgentState(state, text, true);
                            },
                            noCallback: function () { },
                            errorMessageText: response.getReturnValue().getDescription()
                        }));
                }
                else if (response.getReturnValue().getCode() === ProxyError.ErrorLicenseOverflow.value)
                {
                    showWarningMessage(response.getReturnValue().getDescription());
                }
                else if (response.getReturnValue().getCode() !== ProxyError.ErrorOK.value)
                {
                    showWarningMessage(response.getReturnValue().getDescription());
                }
            }
        },

        setAgentStateTextVisibility: function (visible)
        {
            if (this.isStateOk()) 
            {
                this.selectTextField.setVisible(visible);
            }
            else 
            {
                this.visibilityAgentStateText = visible;
            }
        }
    });