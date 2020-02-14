Ext.define('StateEntry',
    {
        extend: 'Ext.Component',

        childEls: ['activatedEl', 'textEl', 'callsEl', 'mailsEl', 'chatsEl'],

        initComponent: function ()
        {
            this.text = Ext.util.Format.htmlEncode(this.dataItem.title) + (this.dataItem.autoLogOn ? " *" : "");

            this.renderTpl = '<div style="display:flex">' +
                '<input class="regular-checkbox" type="checkbox" id="{id}-activatedEl" data-ref="activatedEl"></input>' +
                '<div class="eclipsedText" id="{id}-textEl" data-ref="textEl" style="width:298px;font-size:14px;margin:0 5px;color:#666666">' + this.text + '</div>' +
                '<input class="regular-checkbox" type="checkbox" id="{id}-callsEl" data-ref="callsEl"></input>' +
                '<input class="regular-checkbox" type="checkbox" id="{id}-mailsEl" data-ref="mailsEl" style="margin-left:7px"></input>' +
                '<input class="regular-checkbox" type="checkbox" id="{id}-chatsEl" data-ref="chatsEl" style="margin-left:7px"></input>' +
                '</div>';
            this.callParent();

            this.on('boxready', function ()
            {
                if (this.dataItem.autoLogOn)
                {
                    Ext.each([this.activatedEl, this.textEl, this.callsEl, this.mailsEl, this.chatsEl], function (element)
                    {
                        element.dom.style.opacity = 0.6;
                        element.dom.disabled = true;
                    }, this);
                }

                this.callsEl.dom.style.visibility = this.isCallConfigured() ? 'visible' : 'hidden';
                this.mailsEl.dom.style.visibility = this.isMailConfigured() ? 'visible' : 'hidden';
                this.chatsEl.dom.style.visibility = this.isChatConfigured() ? 'visible' : 'hidden';

                this.callsEl.dom.checked = this.isCallActivated();
                this.mailsEl.dom.checked = this.isMailActivated();
                this.chatsEl.dom.checked = this.isChatActivated();
                this.activatedEl.dom.checked = (this.isCallActivated() || !this.isCallConfigured()) && (this.isMailActivated() || !this.isMailConfigured()) && (this.isChatActivated() || !this.isChatConfigured());

                this.textEl.on('click', () =>
                {
                    if (this.activatedEl.dom.checked)
                    {
                        this.deactivate();
                    }
                    else
                    {
                        this.activate();
                    }
                });
                this.activatedEl.on('click', () =>
                {
                    if (this.activatedEl.dom.checked)
                    {
                        this.activate();
                    }
                    else
                    {
                        this.deactivate();
                    }
                });

                Ext.each([this.callsEl, this.mailsEl, this.chatsEl], function (checkbox)
                {
                    checkbox.on('click', function ()
                    {
                        if (this.areAllChannelsChecked())
                        {
                            this.activate();
                        }
                        if (this.areAllChannelsUnchecked())
                        {
                            this.deactivate();
                        }
                    }, this);
                }, this);

            }, this);
        },

        allActivated: function () 
        {
            if (this.activatedEl.dom.checked && this.areAllChannelsChecked())
            {
                return true;
            }
            return false;
        },

        areAllChannelsChecked: function ()
        {
            return (!this.isCallConfigured() || this.callsEl.dom.checked === true) &&
                (!this.isChatConfigured() || this.chatsEl.dom.checked === true) &&
                (!this.isMailConfigured() || this.mailsEl.dom.checked === true);
        },

        areAllChannelsUnchecked: function ()
        {
            return (!this.isCallConfigured() || this.callsEl.dom.checked === false) &&
                (!this.isChatConfigured() || this.chatsEl.dom.checked === false) &&
                (!this.isMailConfigured() || this.mailsEl.dom.checked === false);
        },

        save: function () 
        {
            if (this.isCallConfigured()) 
            {
                this.dataItem.channels.call = this.callsEl.dom.checked;
            }
            if (this.isMailConfigured()) 
            {
                this.dataItem.channels.mail = this.mailsEl.dom.checked;
            }
            if (this.isChatConfigured()) 
            {
                this.dataItem.channels.chat = this.chatsEl.dom.checked;
            }
            this.dataItem.activated = this.activatedEl.dom.checked;
        },

        activate: function () 
        {
            if (this.dataItem.autoLogOn) 
            {
                return;
            }
            this.activatedEl.dom.checked = true;
            if (this.isCallConfigured()) 
            {
                this.callsEl.dom.checked = true;
            }
            if (this.isMailConfigured()) 
            {
                this.mailsEl.dom.checked = true;
            }
            if (this.isChatConfigured()) 
            {
                this.chatsEl.dom.checked = true;
            }

            this.updateParent();
        },

        deactivate: function () 
        {
            if (this.dataItem.autoLogOn)
            {
                return;
            }
            this.activatedEl.dom.checked = false;
            this.callsEl.dom.checked = false;
            this.mailsEl.dom.checked = false;
            this.chatsEl.dom.checked = false;

            this.updateParent();
        },

        updateParent: function ()
        {
            this.parent.pauseEvents = true;
            this.parent.updateStateOfAllActiveCheckBox();
            this.parent.setBackgroundImageOfAllActivated();
            this.parent.pauseEvents = false;
        },

        isCallConfigured: function ()
        {
            return this.isChannelConfigured('call');
        },
        
        isMailConfigured: function ()
        {
            return this.isChannelConfigured('mail');
        },

        isChatConfigured: function ()
        {
            return this.isChannelConfigured('chat');
        },

        isChannelConfigured: function (channel)
        {
            return this.dataItem.channels.hasOwnProperty(channel); 
        },

        isCallActivated: function ()
        {
            return this.isChannelActivated('call');
        },

        isMailActivated: function ()
        {
            return this.isChannelActivated('mail');
        },

        isChatActivated: function ()
        {
            return this.isChannelActivated('chat');
        },

        isChannelActivated: function (channel)
        {
            return this.dataItem.channels[channel] === true;
        }
    });

Ext.define('AgentStateConfiguration', {
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    flex: 1,

    callBackSuccess: function () { },
    
    initComponent: function () 
    {
        var me = this;
        var buttonContainer;
        this.groupItems = [];
        this.campaignItems = [];
        this.callParent();

        this.add(Ext.create("Ext.container.Container",
        {
            style: 'padding:0 10px 0 15px',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            items:
            [
                this.allActive = Ext.create("Ext.form.field.Checkbox",
                {
                    flex: 1,
                    height: 26,
                    cls: "eclipsedText",
                    boxLabel: LANGUAGE.getString("agentStateSelectAll"),
                    checked: false,
                    handler: function (instance, newValue) 
                    {
                        if (!me.pauseEvents) 
                        {
                            Ext.each(me.getGroupAndCampaignItems(), function (groupOrCampaignItem)
                            {
                                if (newValue)
                                {
                                    groupOrCampaignItem.activate();
                                }
                                else
                                {
                                    groupOrCampaignItem.deactivate();
                                }
                            }, this);
                        }
                    }
                }),
                Ext.create('Ext.Container',
                {
                    layout:
                    {
                        type: 'hbox',
                        align: 'middle',
                        pack: 'end'
                    },
                    items:
                    [
                        this.createImage('phone_ringing'),
                        this.createImage('mail'),
                        this.createImage('chat')
                    ]
                })
            ]
        }));
        this.mainContainer = Ext.create("Ext.Container",
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1,
            style: 'padding:5px 10px 5px 10px;border:1px solid #aaaaaa',
            minHeight: 350,
            scrollable: 'vertical'
        });

        this.groupItems = this.createGroupItems();

        this.campaignItems = this.createCampaignItems();
        
        buttonContainer = Ext.create("Ext.Container",
        {
            layout:
            {
                type: 'hbox',
                align: 'stretch',
                pack: 'end'
            },
            items:
            [
                Ext.create("Ext.Component",
                {
                    margin: '2 0 0 0',
                    style:
                    {
                        "font-size": "11px",
                        "color": "#666"
                    },
                    html: LANGUAGE.getString("agentStateNoChangeMessage")
                })
            ]
        });
        this.add(this.mainContainer);
        this.add(buttonContainer);

        this.on('boxready', function ()
        {
            this.updateStateOfAllActiveCheckBox();

            this.updateUIOfAllActiveCheckBox();
        }, this);
    },

    setBackgroundImageOfAllActivated: function ()
    {
        if (this.allActive.inputEl.dom.checked)
        {
            this.allActive.displayEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage("check", 64, NEW_GREY) + ')';
        }
        else
        {
            this.allActive.displayEl.dom.style.backgroundImage = 'none';
        }
    },

    updateUIOfAllActiveCheckBox: function ()
    {
        this.allActive.displayEl.dom.style.width = '16px';
        this.allActive.displayEl.dom.style.height = '16px';
        this.allActive.displayEl.dom.style.background = 'none';
        this.setBackgroundImageOfAllActivated();
        this.allActive.displayEl.dom.style.backgroundSize = 'contain';
        this.allActive.displayEl.dom.style.border = '1px solid ' + NEW_GREY;

        this.allActive.inputEl.dom.onclick = function ()
        {
            me.setBackgroundImageOfAllActivated();
        };
    },

    createImage: function (iconName)
    {
        return Ext.create("Ext.Img",
            {
                margin: '0 10 0 0',
                src: IMAGE_LIBRARY.getImage(iconName, 64, NEW_GREY),
                width: 16,
                height: 16,
                alt: "agentState"
            });
    },

    createGroupItems: function ()
    {
        this.groupItems = this.createItems(this.groups, LANGUAGE.getString("agentStateGroups"), LANGUAGE.getString("agentStateNoGroups"), "0 0 5 3");
        return this.groupItems;
    },

    createCampaignItems: function ()
    {
        this.campaignItems = this.createItems(this.campaigns, LANGUAGE.getString("campaigns"), LANGUAGE.getString("agentStateNoCampaigns"), "5 0 5 3");
        return this.campaignItems;
    },

    createItems: function (groupsOrCampaigns, title, emptyText, margin)
    {
        var createdItems = [];
        this.mainContainer.add(Ext.create("Ext.Component",
            {
                margin: margin,
                cls: ["settingsSubTitle"],
                style: "font-size:" + FONT_SIZE_MODAL_DIALOG + "px;color:" + ALMOST_BLACK,
                html: title
            }));
        groupsOrCampaigns.sort(function (a, b) 
        {
            var nameA = a.title.toUpperCase();
            var nameB = b.title.toUpperCase();
            return nameA.localeCompare(nameB);
        });

        if (groupsOrCampaigns.length === 0) 
        {
            this.mainContainer.add(Ext.create("Ext.Component",
                {
                    html: emptyText
                }));
        }
        else
        {
            Ext.each(groupsOrCampaigns, function (groupOrCampaign) 
            {
                createdItems.push(this.createItem(groupOrCampaign));
            }, this);
        }
        this.mainContainer.add(createdItems);
        return createdItems;
    },

    createItem: function (dataItem) 
    {
        return Ext.create('StateEntry',
        {
            dataItem: dataItem,
            parent: this
        });
        /*
        var main = {};
        var call = {};
        var mail = {};
        var chat = {};
        var me = this;

        var deactivateMainWhenAllSettingsAreOff = function (instance, newValue) 
        {
            setTimeout(function () 
            {
                if (call.getValue && mail.getValue && chat.getValue &&
                    call.getValue() === false && mail.getValue() === false && chat.getValue() === false) 
                {
                    main.setValue(false);
                }
                if (main.getValue() === false && call.getValue && mail.getValue && chat.getValue && (
                    call.getValue() !== false || mail.getValue() !== false || chat.getValue() !== false) && newValue === true) 
                {
                    main.setValue(true);
                }

                me.pauseEvents = true;
                me.updateStateOfAllActiveCheckBox();
                me.pauseEvents = false;
            }, 100);
        };
        var activateAllSettingsWhenAllAreOff = function () 
        {
            setTimeout(function () 
            {
                if (call.getValue() === false && mail.getValue() === false && chat.getValue() === false) 
                {
                    if (dataItem.channels.hasOwnProperty("call")) 
                    {
                        call.setValue(true);
                    }
                    if (dataItem.channels.hasOwnProperty("mail")) 
                    {
                        mail.setValue(true);
                    }
                    if (dataItem.channels.hasOwnProperty("chat")) 
                    {
                        chat.setValue(true);
                    }
                }
            }, 100);
        };

        var content = Ext.create("Ext.Container",
        {
            layout:
            {
                type: 'hbox'
            },
            height: 20,
            padding: '0 5',
            save: function () 
            {
                if (dataItem.channels.hasOwnProperty("call")) 
                {
                    dataItem.channels.call = call.getValue();
                }
                if (dataItem.channels.hasOwnProperty("mail")) 
                {
                    dataItem.channels.mail = mail.getValue();
                }
                if (dataItem.channels.hasOwnProperty("chat")) 
                {
                    dataItem.channels.chat = chat.getValue();
                }
                dataItem.activated = main.getValue();
            },
            activate: function () 
            {
                if (dataItem.autoLogOn) 
                {
                    return;
                }
                main.setValue(true);
                if (dataItem.channels.hasOwnProperty("call")) 
                {
                    call.setValue(true);
                }
                if (dataItem.channels.hasOwnProperty("mail")) 
                {
                    mail.setValue(true);
                }
                if (dataItem.channels.hasOwnProperty("chat")) 
                {
                    chat.setValue(true);
                }
            },

            deactivate: function () 
            {
                if (dataItem.autoLogOn)
                {
                    return;
                }
                main.setValue(false);
                call.setValue(false);
                mail.setValue(false);
                chat.setValue(false);
            },

            allActivated: function () 
            {
                if (main.getValue() === true &&
                    (!dataItem.channels.hasOwnProperty("call") || call.getValue() === true) &&
                    (!dataItem.channels.hasOwnProperty("chat") || chat.getValue() === true) &&
                    (!dataItem.channels.hasOwnProperty("mail") || mail.getValue() === true)) 
                {
                    return true;
                }
                return false;
            },
            items:
            [
                main = Ext.create("Ext.form.field.Checkbox",
                {
                    flex: 1,
                    disabled: dataItem.autoLogOn ? true : false,
                    boxLabel: Ext.util.Format.htmlEncode(dataItem.title) + (dataItem.autoLogOn ? " *": ""),
                    checked: dataItem.activated,
                    handler: function (instance, newValue) 
                    {
                        if (newValue === true) 
                        {
                            activateAllSettingsWhenAllAreOff();
                        }

                        me.pauseEvents = true;
                        me.updateStateOfAllActiveCheckBox();
                        me.pauseEvents = false;
                    },
                    listeners:
                    {
                        boxready: function ()
                        {
                            this.boxLabelEl.dom.style.fontSize = FONT_SIZE_MODAL_DIALOG + "px";
                            this.boxLabelEl.dom.style.lineHeight = '1.1';
                            this.boxLabelEl.dom.style.width = '100%';
                            this.boxLabelEl.dom.style.position = 'absolute';
                            this.boxLabelEl.dom.style.marginTop = '0px';
                            this.boxLabelEl.dom.className += "eclipsedText";

                            this.displayEl.dom.className += 'doNotResize';
                            this.displayEl.dom.style.marginTop = "2px";
                        }
                    }
                }),
                Ext.create('Ext.Container',
                {
                    layout:
                    {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    width: 75,
                    margin: '0 0 0 5',
                    items:
                    [
                        call = this.createCheckboxForChannel(dataItem, 'call', deactivateMainWhenAllSettingsAreOff),
                        mail = this.createCheckboxForChannel(dataItem, 'mail', deactivateMainWhenAllSettingsAreOff),
                        chat = this.createCheckboxForChannel(dataItem, 'chat', deactivateMainWhenAllSettingsAreOff)
                    ]
                })
            ]
        });
        return content;*/
    },

    getGroupAndCampaignItems: function ()
    {
        var groupAndCampaignItems = [];
        groupAndCampaignItems = groupAndCampaignItems.concat(this.groupItems);
        groupAndCampaignItems = groupAndCampaignItems.concat(this.campaignItems);
        return groupAndCampaignItems;
    },

    updateStateOfAllActiveCheckBox: function ()
    {
        this.allActive.setValue(this.areAllGroupsAndCampaignsActivated());
    },

    areAllGroupsAndCampaignsActivated: function()
    {
        var items = this.getGroupAndCampaignItems();
        for (var i = 0; i < items.length; i++) 
        {
            if (!items[i].allActivated())
            {
                return false;
            }
        }
        return true;
    },

    createCheckboxForChannel: function (dataItem, channelName, handler)
    {
        if (!dataItem.channels.hasOwnProperty(channelName))
        {
            return null;
        }
        return Ext.create("Ext.form.field.Checkbox",
        {
            margin: '0 0 0 10',
            checked: dataItem.channels[channelName],
            disabled: (dataItem.channels.hasOwnProperty(channelName) && dataItem.autoLogOn !== true) ? false : true,
            handler: handler,
            listeners:
            {
                boxready: function ()
                {
                    this.displayEl.dom.className += 'doNotResize';
                    this.displayEl.dom.style.marginTop = "2px";
                }
            }
        });
    },

    onButtonClicked_OK: function()
    {
        Ext.each(this.getGroupAndCampaignItems(), function (groupOrCampaignItem)
        {
            groupOrCampaignItem.save();
        }, this);
        
        this.callBackSuccess(this.groups, this.campaigns);
    },

    updateUI: function ()
    {
        this.mainContainer.removeAll();

        this.groupItems = this.createGroupItems();
        this.campaignItems = this.createCampaignItems();
    }
});

Ext.define('GroupsAndCampaignsDialog',
{
    extend: 'ModalDialog',
    addErrorMessageRow: false,

    initComponent: function ()
    {
        this.titleText = this.titleText || LANGUAGE.getString("agentStateHeader");
        this.callParent();

        this.groups = this.getAllGroups();
        this.campaigns = this.getAllCampaigns();

        this.agentStateConfiguration = new AgentStateConfiguration(
        {
            callBackSuccess: (groups, campaigns) =>
            {
                Ext.each(groups, function (group)
                {
                    group.type = Caesar.LoginStateOnExitType.Group;
                });
                Ext.each(campaigns, function (campaign)
                {
                    campaign.type = Caesar.LoginStateOnExitType.Campaign;
                });

                var groupsAndCampaigns = groups.concat(campaigns);
                this.saveLoginStates(groupsAndCampaigns);

                this.hide();
            },
            groups: this.groups,
            campaigns: this.campaigns,
            margin: '15 0 25 0'
        });
        this.addToBody(this.agentStateConfiguration);
        this.addButton({
            text: LANGUAGE.getString("ok"),
            listeners: {
                click: () =>
                {
                    this.agentStateConfiguration.onButtonClicked_OK();
                }
            }
        });

        this.on('boxready', () =>
        {
            if (CURRENT_STATE_CONTACT_CENTER.isAgentLoggedOff())
            {
                //wenn wir nicht am ContactCenter angemeldet sind, haben wir über die AgentInfos keine Daten darüber, an welchen Gruppen wir angemeldet sind
                //dafür rufen wir dann getLoginStates vom Proxy auf. An diesen Gruppen werden wir angemeldet, wenn wir z.B. auf "Ich bin bereit" gehen
                SESSION.getLoginStates((response) =>
                {
                    this.onGetLoginStatesSuccess(response);
                }, () =>
                {
                    this.hide();
                    showErrorMessage(LANGUAGE.getString("errorGetGroupLoginStates"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                });
            }
        }, this);
    },

    getAllGroups: function ()
    {
        var groups = [];

        var myAgent = CURRENT_STATE_CONTACT_CENTER.getMyAgentInfo();
        var myGroups = CURRENT_STATE_CONTACT_CENTER.getGroups();

        // Hilfsfunktion um zu bestimmen ob der aktuelle Kanal aktiviert ist
        var isChannelPropertyChecked = function (groupId, channel, channelName)
        {
            var activated = false;
            if (!channel)
            {
                return false;
            }

            Ext.iterate(channel, function (curGroupId, index)
            {
                if (curGroupId === parseInt(groupId, 10))
                {
                    activated = true;
                    return true;
                }
            });

            return activated;
        };

        Ext.iterate(myGroups, function (groupId, group)
        {
            var channels = {}; // Hier wird gespeichert ob der jeweilige Channel aktiviert ist oder nicht

            // Ist die Gruppe für Anrufe konfiguriert...
            if (group.getHasCallRules())
            {
                // Hat mein Agent ebenfalls Gruppen für Anrufe konfiguriert...
                if (myAgent.getCallGroups)
                {
                    // Prüfen ob die für diese Gruppe Anrufe aktiviert sind
                    channels.call = isChannelPropertyChecked(group.getId(), myAgent.getCallGroups(), 'call');
                }
                else
                {
                    // Sonst bleiben Anrufe deaktiviert
                    channels.call = false;
                }
            }

            // Ist die Gruppe für Chats konfiguriert...
            if (group.getHasChatRules())
            {
                // Hat mein Agent ebenfalls Gruppen für Chats konfiguriert...
                if (myAgent.getChatGroups)
                {
                    // Prüfen ob die für diese Gruppe Chats aktiviert sind
                    channels.chat = isChannelPropertyChecked(groupId, myAgent.getChatGroups(), 'chat');
                }
                else
                {
                    // Sonst bleiben Chats deaktiviert
                    channels.chat = false;
                }
            }

            // Ist die Gruppe für E-Mails konfiguriert...
            if (group.getHasMessageRules())
            {
                // Hat mein Agent ebenfalls Gruppen für E-Mails konfiguriert...
                if (myAgent.getMailGroups)
                {
                    // Prüfen ob die für diese Gruppe E-Mails aktiviert sind
                    channels.mail = isChannelPropertyChecked(groupId, myAgent.getMailGroups(), 'mail');
                }
                else
                {
                    // Sonst bleiben E-Mails deaktiviert
                    channels.mail = false;
                }
            }

            // Aktuelle Gruppe mit notwendigen Properties abspeichern
            groups.push({
                autoLogOn: group.getAutoLogon(),
                title: group.getName(),
                activated: CURRENT_STATE_CONTACT_CENTER.isMyAgentLoggedInGroup(groupId),
                channels: channels,
                id: groupId
            });
        }, this);

        return groups;
    },

    getAllCampaigns: function ()
    {
        var campaigns = [];

        Ext.iterate(CURRENT_STATE_CONTACT_CENTER.getCampaigns(), function (campaignId, campaign)
        {
            campaigns.push({
                autoLogOn: campaign.getAutoLogon(),
                title: campaign.getName(),
                activated: CURRENT_STATE_CONTACT_CENTER.isMyAgentLoggedInCampaign(campaignId),
                channels:
                {
                    call: CURRENT_STATE_CONTACT_CENTER.isMyAgentLoggedInCampaign(campaignId)
                },
                id: campaign.getId()
            });
        }, this);
        return campaigns;
    },


    onGetLoginStatesSuccess: function (response)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            return;
        }

        Ext.each(response.getStates(), function (loginGroup)
        {
            Ext.each([this.groups, this.campaigns], function (groupsOrCampaigns)
            {
                Ext.each(groupsOrCampaigns, function (groupOrCampaign)
                {
                    if (!isValid(groupOrCampaign))
                    {
                        return;
                    }
                    var channels = groupOrCampaign.channels;

                    // Prüfen ob die Gruppen gleich sind
                    if (groupOrCampaign.id === loginGroup.getGroupId() && !groupOrCampaign.activated)
                    {
                        if (channels.hasOwnProperty("call"))
                        {
                            channels.call = loginGroup.getCalls();
                        }
                        if (channels.hasOwnProperty("chat"))
                        {
                            channels.chat = loginGroup.getChats();
                        }
                        if (channels.hasOwnProperty("mail"))
                        {
                            channels.mail = loginGroup.getMails();
                        }
                    }
                }, this);
            }, this);
        }, this);

        this.agentStateConfiguration.updateUI();
    },

    saveLoginStates: function (groups, successCallback, exceptionCallback)
    {
        if (Ext.isEmpty(groups))
        {
            groups = this.groups.concat(this.campaigns);
        }

        var groupsWithoutAutoLogon = Ext.Array.filter(groups, (group) =>
        {
            return !group.autoLogOn;
        });

        var stateGroups = Ext.Array.map(groupsWithoutAutoLogon, (group) =>
        {
            return this.convertGroupOrCampaignToLoginState(group);
        });

        var groupsAsClosure = this.groups;
        var campaignsAsClosure = this.campaigns;
        successCallback = successCallback || ((response) =>
        {
            this.onSetLoginStatesSuccess(response, groupsAsClosure, campaignsAsClosure);
        });
        exceptionCallback = exceptionCallback || (() =>
        {
            console.log(err);
        });
        SESSION.setLoginStates(stateGroups, false, successCallback, exceptionCallback);
    },

    onSetLoginStatesSuccess: function (response, groups, campaigns)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            return;
        }

        var errObjects = JSON.parse(response.getReturnValue().getExtendedInfo());

        Ext.each(errObjects, function (errObject)
        {
            var getGroup = (group) =>
            {
                for (var i = 0; i < groups.length; i++)
                {
                    if (Number(group.ObjectId) === Number(groups[i].id))
                    {
                        return groups[i];
                    }
                }
            };
            var group = getGroup(errObject);
            if (!group)
            {
                return;
            }
            if (errObject.ReturnValue.Code === ProxyError.ErrorNotEnoughAgents.value)
            {
                showConfirmation(Ext.create('ConfirmationComponent',
                    {
                        yesCallback: () =>
                        {
                            if (!group.channels)
                            {
                                group.channels =
                                {
                                    call: false,
                                    chat: false,
                                    mail: false
                                };
                            }

                            SESSION.setLoginStates([this.convertGroupOrCampaignToLoginState(group)], true, function () { }, function () { });
                        },
                        noCallback: Ext.emptyFn,
                        errorMessageText: errObject.ReturnValue.Description
                    }));
            }
            else if (errObject.ReturnValue.Code === ProxyError.ErrorTooManyAgents.value)
            {
                showConfirmation(Ext.create('ConfirmationComponent',
                    {
                        yesCallback: function ()
                        {

                        },
                        yesButtonText: LANGUAGE.getString("ok"),
                        errorMessageText: errObject.ReturnValue.Description
                    }));
            }
        }, this);
    },

    convertGroupOrCampaignToLoginState: function (groupOrCampaign)
    {
        var loginState = new www_caseris_de_CaesarSchema_ContactCenterLoginStateOnExit();

        // Die jeweiligen Channel-Werte setzen
        loginState.setCalls(groupOrCampaign.channels.call || false);
        loginState.setChats(groupOrCampaign.channels.chat || false);
        loginState.setMails(groupOrCampaign.channels.mail || false);
        loginState.setActivated(groupOrCampaign.activated);
        loginState.setGroupId(groupOrCampaign.id);
        loginState.setType(groupOrCampaign.type);
        return loginState;
    },

    setAllLoginStates: function (flag)
    {
        Ext.each([this.groups, this.campaigns], function (groupsOrCampaign)
        {
            Ext.each(groupsOrCampaign, function (group)
            {
                Ext.iterate(group.channels, function (type, value)
                {
                    group.channels[type] = flag;
                    group.activated = flag;
                }, this);
            }, this);
        }, this);
    }
});