Ext.define('UserActionButton',
{
    extend: 'RoundThinButton',

    text: '',

    toolTipText: '',

    iconName: '',

    userActionContainer: undefined,

    selectedEmail: undefined,

    handler: function ()
    {
        this.showLoadingMask();
        setTimeout(() =>
        {
            this.run();
        }, 0);
    },
    
    initComponent: function ()
    {
        if (this.text)
        {
            //this.text = this.text.toUpperCase();
        }
        
        this.callParent();

        this.transformHandler();
    },

    createEmailRequestContainer: function (email)
    {
        var emailRequestContainer = new EmailRequestContainer(
        {
            headerTitle: '',
            email: email || this.email,
            store: this.actionData.store,
            showActions: false,
            parentContainer: this.userActionContainer.parentContainer
        });

        return emailRequestContainer;
    },

    hasMailChanged: function ()
    {
        return this.userActionContainer.hasMailChanged();
    },
    
    convertToMenuItem: function ()
    {
        var self = this;

        return {
            text: this.text,
            icon: IMAGE_LIBRARY.getImage(this.iconName, 64, THIN_BUTTON_NORMAL_COLOR),
            handler: function ()
            {
                if (this.menu)
                {
                    return; //wenn das menuItem ein Submenu hat, dann soll der Klick auf den eigentlichen Eintrag nichts bewirken
                }
                self.handler();
            },
            menu: this.menu,
            hidden: this.hidden
        };
    },

    createMailActionDialog: function (mailAction, title, callbackFunction, additionalContainer)
    {
        var groupId = this.actionData.groupId;

        var reasons;
        if (CURRENT_STATE_CONTACT_CENTER.Groups[groupId])
        {
            reasons = CURRENT_STATE_CONTACT_CENTER.Groups[groupId].getCategories()[mailAction];
        }

        var canComment = false;
        if (CURRENT_STATE_CONTACT_CENTER.Groups[groupId])
        {
            canComment = CURRENT_STATE_CONTACT_CENTER.Groups[groupId].getRemarks()[mailAction];
        }

        if (reasons.length > 0 || mailAction === 'MailDistribute')
        {
            new MailActionDialog(
                {
                    reasons: reasons,
                    titleText: title,
                    canComment: canComment,
                    additionalContainer: additionalContainer,
                    callBackFunction: callbackFunction
                });
        }
        else
        {
            callbackFunction(-1, '');
        }
    },

    replyCustomerEmail: function (selectedEmail, citeMode)
    {
        var emailData = this.prepareEMailDataForReplyPanel(selectedEmail);
        selectedEmail = emailData.selectedEmail;
        var headerData = emailData.headerData;

        selectedEmail.type = MailType.Answer.value;
        headerData.mailType = MailType.Answer.value;
        headerData.curMailState = emailState.Reply.text;

        var actionData = Ext.clone(this.actionData);
        actionData.mailType = MailType.Answer.value;
        
        var additionalConfigForReplyPanel =
        {
            title: selectedEmail.subject,
            citeType: citeMode
        };

        this.createAndShowReplyPanel(selectedEmail, headerData, actionData, additionalConfigForReplyPanel, "UserActionButtonsForReply");
    },

    prepareEMailDataForReplyPanel: function (selectedEmail)
    {
        var originalHeaderData = this.getHeaderData();
        var headerData = Ext.clone(originalHeaderData);

        if (selectedEmail)
        {
            var receiver = selectedEmail.receiver;

            if (receiver.getName)
            {
                receiver = receiver.getName() || receiver.getEmail();
            }

            originalHeaderData.sender = selectedEmail.name;
            originalHeaderData.receiver = receiver;
            originalHeaderData.senderObject = selectedEmail.sender;
            originalHeaderData.receiverObject = selectedEmail.receivers[0];
        }
        else
        {
            selectedEmail = Ext.clone(this.getSelectedEmail());
        }

        headerData.receiver = originalHeaderData.sender;
        headerData.sender = originalHeaderData.receiver;
        headerData.receiverObject = originalHeaderData.senderObject;
        headerData.senderObject = originalHeaderData.receiverObject;
        headerData.senders = originalHeaderData.receivers || [];
        headerData.receivers = [originalHeaderData.senderObject] || [];
        headerData.isRequest = false;

        return {
            headerData: headerData,
            selectedEmail: selectedEmail
        };
    },

    reply3rdParty: function (mailType, selectedEmail, title, citeType)
    {
        var emailData = this.prepareEMailDataForReplyPanel(selectedEmail);
        selectedEmail = emailData.selectedEmail;
        var headerData = emailData.headerData;

        selectedEmail.type = mailType.value;
        headerData.mailType = mailType.value;
        headerData.curMailState = mailType.text;

        
        var replyHeader = new EmailHeader3rdReplyFrame(
        {
            margin: '10 0 0 0',
            headerData: headerData,
            email: selectedEmail
        });
        var additionalConfigForReplyPanel =
        {
            title: title || selectedEmail.subject,
            is3rdPartyAnswer: true,
            replyHeader: replyHeader
        };

        this.createAndShowReplyPanel(selectedEmail, headerData, Ext.clone(this.actionData), additionalConfigForReplyPanel, "UserActionButtonsForReply3rdParty", citeType);
    },

    createAndShowReplyPanel: function (selectedEmail, headerData, actionData, extraConfig, classNameForUserActions, citeType)
    {
        var config =
        {
            citeType: citeType,
            userEmailContainer: this.createEmailRequestContainer(selectedEmail),
            email: selectedEmail,
            userHeaderData: headerData,
            isOpenEmail: actionData.store.isOpenStore(),
            userActions: Ext.create(classNameForUserActions, 
            {
                actionData: actionData,
                email: selectedEmail
            })
        };

        Ext.apply(config, extraConfig);
        var replyPanel = new ReplyCustomerPanel(config);
        replyPanel.userActions.parentContainer = replyPanel;

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_createNewTab(replyPanel);
    },

    showError: function (text, errorType)
    {
        if (isValid(this, "userActionContainer"))
        {
            this.userActionContainer.showError(text, errorType);
        }
    },

    showConfirmation: function (confirmation)
    {
        if (isValid(this, "userActionContainer"))
        {
            this.userActionContainer.showConfirmation(confirmation);
        }
    },

    lockRequest: function ()
    {
        var self = this;

        var callBackFunction = function (reasonId, comment, additionalContent)
        {
            var doneFct = function (value)
            {
                self.hideLoadingMask();
                if (value.getReturnValue().getCode() !== 0)
                {
                    self.showError(value.getReturnValue().getDescription());
                    return;
                }
            };

            var failFct = function ()
            {
                self.hideLoadingMask();
                self.showError(LANGUAGE.getString("errorLockRequest"));
            };

            self.mailToBeSelected = self.actionData.fullId;
            self.showLoadingMask();
            SESSION.lockEMail(self.actionData.fullId, true, comment, reasonId, doneFct, failFct);
        };

        this.createMailActionDialog('MailLock', LANGUAGE.getString('hold'), callBackFunction);
    },

    sendEmail: function ()
    {
        var self = this;
        var mailMessage = this.createMailMessage();

        if (!mailMessage.getFrom || !mailMessage.getFrom() || !isValidString(mailMessage.getFrom()) || !isValidEmailAddress(mailMessage.getFrom(), true))
        {
            self.showError(LANGUAGE.getString('newTicketErrorSelectSender'), ErrorType.Info);
            return;
        }
        else if (!mailMessage.getTo || !mailMessage.getTo() || !isValidString(mailMessage.getTo()))
        {
            self.showError(LANGUAGE.getString('newTicketErrorSelectReceiver'), ErrorType.Info);
            return;
        }
        else if (!mailMessage.getSubject || !mailMessage.getSubject() || !isValidString(mailMessage.getSubject()))
        {
            self.showError(LANGUAGE.getString('newTicketErrorEnterSubject'), ErrorType.Info);
            return;
        }
        else if (!mailMessage.getBody || !mailMessage.getBody() || !isValidString(mailMessage.getBody()))
        {
            self.showError(LANGUAGE.getString('newTicketErrorEnterBody'), ErrorType.Info);
            return;
        }

        var sendEMail = function (reasonId, comment, additionalContent)
        {
            self.showLoadingMask();

            var doneFunction = function (result)
            {
                self.hideLoadingMask();

                self.emailSaved = true;
                
                if (result.getReturnValue().getCode() === 0)
                {
                    REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_removeTab(self.userActionContainer.parentContainer);
                }
                else
                {
                    self.showError(result.getReturnValue().getDescription());
                }
            };

            var failFunction = function ()
            {
                self.hideLoadingMask();
                self.showError(LANGUAGE.getString("errorSendMail"));
            };

            var mailData = self.getMailData();
            SESSION.sendEMail(self.email.newMailId, mailMessage, self.completeRequest, comment, reasonId, mailData.groupId, mailData.agentId, doneFunction, failFunction);
        };
        if (this.category)
        {
            self.createMailActionDialog(this.category, this.titleForMailActionDialog, sendEMail, undefined);
        }
        else
        {
            sendEMail();
        }

    },

    setNewMailId: function (newMailId)
    {
        this.newMailId = newMailId;
    },

    createMailMessage: function ()
    {
        var mailMessage = new www_caseris_de_CaesarSchema_MailMessageNew();

        var mailData = this.getMailData();

        mailMessage.setAttachmentsEx(mailData.attachments);
        mailMessage.setSubject(mailData.subject || '');
        mailMessage.setBody(mailData.body || '');
        mailMessage.setTo(mailData.receiver || '');
        mailMessage.setFrom(mailData.sender || '');
        mailMessage.setTemplateId(-1);
        mailMessage.setBodyFormat('HTML');
        mailMessage.setBodyFormatSpecified(true);

        return mailMessage;
    },

    getMailData: function ()
    {
        return this.userActionContainer.getMailData();
    },

    setActionData: function (actionData)
    {
        this.actionData = actionData;
    },

    setUserActionContainer: function (userActionContainer)
    {
        this.userActionContainer = userActionContainer;
    },

    setSelectedEmail: function (selectedEmail)
    {
        this.selectedEmail = selectedEmail;
    },

    getSelectedEmail: function ()
    {
        return this.email;
    },

    getHeaderData: function ()
    {
        return this.headerData;
    },

    listeners:
    {
        afterrender: function (button) 
        {
            if (isValidString(button.toolTipText))
            {
                button.toolTipObject = new Ext.tip.ToolTip(
                {
                    style:
                    {
                        'border-color': 'rgb(120, 120, 120)'
                    },
                    target: button,
                    html: button.toolTipText,
                    showDelay: 1000
                });
            }

        },
        destroy: function (button)
        {
            if (button.toolTipObject)
            {
                button.toolTipObject.destroy();
            }
        }
    }
});

Ext.define('AnswerButton',
{
    extend: 'UserActionButton',

    iconName: 'reply',

    selectedEmail: undefined,

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('answer');

        this.menu = new CustomMenu(
        {
            highlightFirstMenuItem: false,
            insertItems:
                [
                    [{
                        text: LANGUAGE.getString('withOriginalEmail'),
                        iconName: 'reply',
                        handler: () =>
                        {
                            this.reply(MailCreateCiteMode.CiteBelow.value);
                        }
                    }],
                    [{
                        text: LANGUAGE.getString('withoutOriginalEmail'),
                        iconName: 'reply',
                        handler: () =>
                        {
                            this.reply(MailCreateCiteMode.CiteNone.value);
                        }
                    }]
                ]
        });
        
        this.callParent();
    },

    handler: function ()
    {
        this.reply(MailCreateCiteMode.CiteBelow.value);
    },

    reply: function (citeMode)
    {
        this.replyCustomerEmail(this.getSelectedEmail(), citeMode);
    }
});

Ext.define('LockButton',
{
    extend: 'UserActionButton',

    iconName: "lock",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('hold');
        this.tooltipText = LANGUAGE.getString('tooltipLockRequest');

        this.callParent();
    },

    handler: function ()
    {
        this.lockRequest();
    }
});

Ext.define('GiveBackButton',
{
    extend: 'UserActionButton',

    iconName: 'up',

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('giveBack');
        this.toolTipText = LANGUAGE.getString('tooltipGiveBackRequest');

        this.callParent();
    },

    handler: function ()
    {
        var self = this;

        var yesCallbackFunction = function ()
        {
            var callBackFunction = function (reasonId, comment, additionalContent)
            {
                var doneFct = function (result)
                {
                    self.hideLoadingMask();
                    if (result.getReturnValue().getCode() !== 0)
                    {
                        self.showError(result.getReturnValue().getDescription());
                    }
                };

                var failFct = function ()
                {
                    self.hideLoadingMask();
                    self.showError(LANGUAGE.getString("errorGiveBack"));
                };
                self.showLoadingMask();
                SESSION.handBackEMail(self.actionData.fullId, comment, reasonId, doneFct, failFct);
            };

            self.createMailActionDialog('MailHandBack', LANGUAGE.getString('giveBack'), callBackFunction, undefined);
        };

        var noCallBackFunction = function () { };

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_checkIfActionIsPossible(this, self.actionData.fullId, yesCallbackFunction, noCallBackFunction);
    }

});

Ext.define('TransferButton',
{
    extend: 'UserActionButton',

    iconName: "transferMail",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('transfer');
        this.toolTipText = LANGUAGE.getString('tooltipTransmitRequest');

        this.callParent();
    },

    // TODO: In eigene Klasse auslagern
    createTransferAdditionalContainer: function (target)
    {
        var self = this;

        var additionalContentContainer = new Ext.Container(
            {
                layout: { type: 'hbox', pack: 'start', align: 'stretch' },
                margin: '10 0 20 0',
                border: false
            });

        var createComboBoxStore = function (data, dataObject)
        {
            var store = new Ext.data.Store(
                {
                    fields: ['name', 'value']
                });

            Ext.iterate(data, function (prop)
            {
                var curItem = dataObject[prop];

                if (curItem)
                {
                    var name = curItem.getName();

                    store.add(
                        {
                            name: name,
                            value: prop
                        });
                }

            });

            store.sort('name', 'ASC');

            return store;
        };

        createChangeButton = function (store, style, icon, buttonName, checked, workingGroup)
        {
            var self = this;

            return new ThinButton(
                {
                    width: 42,
                    icon: icon,
                    normalColor: COLOR_MAIN_2,
                    hoverColor: COLOR_MAIN_2,
                    style: style,
                    getLastValue: function ()
                    {
                        if (workingGroup && CLIENT_SETTINGS.getSetting('EMAIL', 'transferButton') === 'group' && buttonName !== 'groupStoreButton')
                        {
                            for (var i = 0; i < store.data.length; i++)
                            {
                                var curGroup = store.data.getAt(i).data;

                                if (curGroup.value === workingGroup.getId())
                                {
                                    return i;
                                }
                            }
                        }

                        return 0;
                    },
                    setLastValue: function ()
                    {

                    },
                    toggleButton: function (force)
                    {
                        var me = this;

                        me.setStyle({ 'background-color': COLOR_MAIN_2 });
                        me.curSelected = true;

                        if (additionalContentContainer[buttonName])
                        {
                            additionalContentContainer[buttonName].curSelected = false;
                            additionalContentContainer[buttonName].setStyle({ 'background-color': WHITE });
                        }

                        var curIcon = me.iconName.split('/');
                        curIcon = curIcon[curIcon.length - 1];

                        me.setIcon(IMAGE_LIBRARY.getImage(curIcon, 64, WHITE));

                        if (additionalContentContainer[buttonName])
                        {
                            additionalContentContainer[buttonName].setIcon(IMAGE_LIBRARY.getImage(curIcon, 64, NEW_GREY));
                        }

                        me.normalColor = me.hoverColor;
                        me.normalTextColor = me.hoverTextColor;

                        if (additionalContentContainer[buttonName])
                        {
                            additionalContentContainer[buttonName].normalColor = NEW_GREY;
                            additionalContentContainer[buttonName].normalTextColor = NEW_GREY;
                            additionalContentContainer[buttonName].beforeRenderEvent(additionalContentContainer[buttonName]);
                        }

                        additionalContentContainer.addressField.setEmptyText(LANGUAGE.getString('agent'));

                        var selectedIndex = 0;

                        if (additionalContentContainer.addressField.getStore() !== store || force)
                        {
                            additionalContentContainer.addressField.setStore(store);
                            selectedIndex = me.getLastValue();
                        }

                        additionalContentContainer.addressField.setValue(store.data.getAt(selectedIndex).data.name);
                    },
                    listeners:
                    {
                        click: function (me)
                        {
                            me.toggleButton();

                            var agentOrGroups = CLIENT_SETTINGS.getSetting('EMAIL', 'transferButton');
                            var toggledValue = agentOrGroups === 'group' ? 'agent' :'group';

                            CLIENT_SETTINGS.addSetting('EMAIL', 'transferButton', toggledValue);
                            CLIENT_SETTINGS.saveSettings();
                        },
                        afterrender: function (event)
                        {
                            var curIcon = event.iconName.split('/');
                            curIcon = curIcon[curIcon.length - 1];

                            event.curSelected = checked;

                            if (checked)
                            {
                                event.setStyle({ 'background-color': COLOR_MAIN_2 });
                                event.setIcon(IMAGE_LIBRARY.getImage(curIcon, 64, WHITE));
                                additionalContentContainer.addressField.setStore(store);
                            }
                            else
                            {
                                event.setStyle({ 'background-color': WHITE });
                                event.setIcon(IMAGE_LIBRARY.getImage(curIcon, 64, NEW_GREY));
                            }
                        },
                        mouseover: function (event)
                        {
                            return;
                        },
                        mouseout: function (event)
                        {
                            var curIcon = event.iconName.split('/');
                            curIcon = curIcon[curIcon.length - 1];

                            if (event.curSelected)
                            {
                                event.setStyle({ 'background-color': COLOR_MAIN_2 });
                                event.setIcon(IMAGE_LIBRARY.getImage(curIcon, 64, WHITE));
                                additionalContentContainer.addressField.setStore(store);
                            }
                            else
                            {
                                event.setStyle({ 'background-color': WHITE });
                                event.setIcon(IMAGE_LIBRARY.getImage(curIcon, 64, NEW_GREY));
                            }
                            return;
                        }
                    }
                });
        };

        var addressBox = new Ext.form.field.ComboBox(
            {
                listConfig:
                {
                    getInnerTpl: function ()
                    {
                        return '{name:htmlEncode}';
                    }
                },
                flex: 1,
                editable: false,
                store: new Ext.data.Store(
                    {
                        fields: ['name', 'value']
                    }),
                displayField: 'name',
                queryMode: 'local',
                emptyText: LANGUAGE.getString('agent'),
                listeners:
                {
                    boxready: function (me)
                    {
                        var group = CURRENT_STATE_CONTACT_CENTER.Groups[self.actionData.groupId];

                        if (group)
                        {
                            if (isValid(group, 'getAgentIds()'))
                            {
                                me.agentStore = createComboBoxStore(group.getAgentIds(), CURRENT_STATE_CONTACT_CENTER.Agents);
                            }

                            var groups = {};
                            if (isValid(group, 'getMailDistributionGroupIds()'))
                            {
                                Ext.each(group.getMailDistributionGroupIds(), function (id)
                                {
                                    var group = CURRENT_STATE_CONTACT_CENTER.getGroup(id) || CURRENT_STATE_CONTACT_CENTER.getGroupDescription(id);
                                    if (group)
                                    {
                                        groups[group.getId()] = group;
                                    }
                                }, this);
                                me.groupStore = createComboBoxStore(group.getMailDistributionGroupIds(), groups);
                            }

                            var isAgentChecked = true;

                            if (CLIENT_SETTINGS.getSetting('EMAIL', 'transferButton') === 'group')
                            {
                                isAgentChecked = false;
                            }
                            
                            additionalContentContainer.agentStoreButton = undefined;

                            var style =
                                {
                                    'border': 'solid 1px ' + NEW_GREY,
                                    'border-radius': BORDER_RADIUS_BUTTONS + ' 0px 0px ' + BORDER_RADIUS_BUTTONS,
                                    'margin-left': '10px'
                                };

                            if (!me.groupStore)
                            {
                                style =
                                    {
                                        'border': 'solid 1px ' + NEW_GREY,
                                        'border-radius': BORDER_RADIUS_BUTTONS
                                    };

                                isAgentChecked = true;
                            }

                            if (me.agentStore)
                            {
                                additionalContentContainer.agentStoreButton = createChangeButton(me.agentStore, style, 'Images/64/user.png',
                                    'groupStoreButton', isAgentChecked, CURRENT_STATE_CONTACT_CENTER.Groups[self.actionData.groupId]);
                            }


                            additionalContentContainer.groupStoreButton = undefined;

                            style =
                                {
                                    'border': 'solid 1px ' + NEW_GREY,
                                    'border-radius': '0px ' + BORDER_RADIUS_BUTTONS + ' ' + BORDER_RADIUS_BUTTONS + ' 0px',
                                    'border-left': 'none'
                                };

                            if (!me.agentStore)
                            {
                                style =
                                    {
                                        'border': 'solid 1px ' + NEW_GREY,
                                        'border-radius': BORDER_RADIUS_BUTTONS
                                    };

                                isAgentChecked = true;
                            }

                            if (me.groupStore)
                            {
                                additionalContentContainer.groupStoreButton = createChangeButton(me.groupStore,
                                    style, 'Images/64/users.png', 'agentStoreButton', !isAgentChecked, CURRENT_STATE_CONTACT_CENTER.Groups[self.actionData.groupId]);
                            }


                            additionalContentContainer.add([additionalContentContainer.agentStoreButton, additionalContentContainer.groupStoreButton]);

                            var defaultStore = me.agentStore;
                            var defaultIndex = 0;

                            if (CLIENT_SETTINGS.getSetting('EMAIL', 'transferButton') === 'group' && me.groupStore)
                            {
                                defaultStore = me.groupStore;
                                defaultIndex = additionalContentContainer.groupStoreButton.getLastValue();
                            }

                            me.setStore(defaultStore);

                            if (defaultStore.getCount() > 0)
                            {
                                me.setValue(defaultStore.data.getAt(defaultIndex).data.name);
                            }
                        }


                    },
                    select: function (comboBox)
                    {
                        setTimeout(function ()
                        {
                            comboBox.focus();
                        }, 100);
                    }
                }
            });

        additionalContentContainer.addressField = additionalContentContainer.add(addressBox);

        return additionalContentContainer;
    },

    handler: function ()
    {
        var group = CURRENT_STATE_CONTACT_CENTER.Groups[this.actionData.groupId];

        if (!group)
        {
            self.showError('Da sie nicht Mitglied der Gruppe sind, können Sie die Anfrage nicht abgeben');
            return;
        }

        var self = this;

        var yesCallBackFunction = function ()
        {
            var additionalContainer = self.createTransferAdditionalContainer(this);

            var callBackFunction = function (reasonId, comment, additionalContent)
            {
                var getReceiverId = function (name, store)
                {
                    for (var i = 0; i < store.data.length; i++)
                    {
                        var curStoreData = store.data.getAt(i).data;

                        if (curStoreData.name === name)
                        {
                            return curStoreData.value;
                        }
                    }

                    return undefined;
                };

                var ticketId = self.actionData.fullId;
                var receiver = getReceiverId(additionalContainer.addressField.getValue(), additionalContainer.addressField.getStore());

                var doneFct = function (result)
                {
                    self.hideLoadingMask();

                    if (result.getReturnValue().getCode() !== 0)
                    {
                        self.showError(result.getReturnValue().getDescription());
                    }
                };

                var failFct = function ()
                {
                    self.hideLoadingMask();
                    self.showError(LANGUAGE.getString("errorDistributeTo"));
                };

                self.showLoadingMask();
                if (additionalContent.addressField.getStore() === additionalContent.addressField.agentStore)
                {
                    SESSION.distributeToAgent(ticketId, receiver, comment, reasonId, doneFct, failFct);
                }
                else
                {
                    SESSION.distributeToGroup(ticketId, receiver, comment, reasonId, doneFct, failFct);
                }
            };

            self.createMailActionDialog('MailDistribute', LANGUAGE.getString('transfer') + '...', callBackFunction, additionalContainer);
        };

        var noCallbackFunction = function () { };

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_checkIfActionIsPossible(this, self.actionData.fullId, yesCallBackFunction, noCallbackFunction);
    }

});

Ext.define('CompleteButton',
{
    extend: 'UserActionButton',

    iconName: "check",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('complete');
        this.toolTipText = LANGUAGE.getString('tooltipCloseRequest');

        this.callParent();
    },

    handler: function ()
    {
        var self = this;

        var yesCallBackFunction = function ()
        {
            var callBackFunction = function (reasonId, comment)
            {
                var doneFct = function (result)
                {
                    self.hideLoadingMask();
                    if (result.getReturnValue().getCode() !== 0)
                    {
                        self.showError(result.getReturnValue().getDescription());
                    }
                };

                var failFct = function ()
                {
                    self.hideLoadingMask();
                    self.showError(LANGUAGE.getString("errorCloseTicket"));
                };

                self.showLoadingMask();
                SESSION.markEMail(self.actionData.fullId, MarkEmailState.Done.value, comment, reasonId, doneFct, failFct);
            };

            self.createMailActionDialog('MailDone', LANGUAGE.getString('complete'), callBackFunction, undefined);
        };

        var noCallBackFunction = function () { };

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_checkIfActionIsPossible(this, this.actionData.fullId, yesCallBackFunction, noCallBackFunction);
    }

});

Ext.define('PrintButton',
{
    extend: 'UserActionButton',

    iconName: "print",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('print');
        this.toolTipText = LANGUAGE.getString('tooltipPrintRequest');

        this.callParent();
    },

    handler: function ()
    {
        this.printUrl(this.actionData.printUrl);
    },

    printUrl: function (url)
    {
        var win = window.open(url);
        if (win)
        {
            win.print();
        }
    }
});

Ext.define('ExportButton',
{
    extend: 'UserActionButton',

    iconName: "disc",

    initComponent: function ()
    {
        if (!Ext.isEmpty(this.email.conversation))
        {
            this.menu = new CustomMenu(
                {
                    highlightFirstMenuItem: false,
                    insertItems:
                        [
                            [{
                                text: LANGUAGE.getString('saveWithoutSubItems'),
                                iconName: 'disc',
                                handler: () =>
                                {
                                    this.download(false);   
                                }
                            }],
                            [{
                                text: LANGUAGE.getString('saveWithSubItems'),
                                iconName: 'disc',
                                handler: () =>
                                {
                                    this.download(true);
                                }
                            }]
                        ]
                });
        }
        this.text = LANGUAGE.getString('export');
        this.toolTipText = LANGUAGE.getString('tooltipSaveRequest');

        if (!isValidString(this.email.urlSource))
        {
            this.hidden = true;
        }
        this.callParent();
    },

    handler: function ()
    {
        this.download(false);        
    },

    download: function (recursively)
    {
        downloadURI(this.actionData.sourceUrl);        
        if (recursively)
        {
            Ext.each(this.email.conversation, function (conversationItem)
            {
                downloadURI(conversationItem.URLSource, "");
            });
        }
    }
});

Ext.define('BaseSendButton',
{
    extend: 'UserActionButton',

    iconName: "reply",

    newMailId: undefined,

    handler: function ()
    {
        this.sendEmail();
    }
});

Ext.define('SendAndCompleteButton',
{
    extend: 'BaseSendButton',

    completeRequest: true,

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('completeAndClose');
        this.category = 'MailDone';
        this.titleForMailActionDialog = LANGUAGE.getString('completeAndClose');

        this.callParent();
    }
});

Ext.define('SendButton',
{
    extend: 'BaseSendButton',

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('send');
        this.category = 'MailAnswer';
        this.titleForMailActionDialog = LANGUAGE.getString('send');

        this.callParent();
    }
});

Ext.define('SaveDraftButton',
{
    extend: 'UserActionButton',

    iconName: "action",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('saveAsDraft');

        this.callParent();
    },

    run: function ()
    {
        var self = this;
        var mailMessage = this.createMailMessage();

        var doneFunction = function (response)
        {
            self.hideLoadingMask();

            self.emailSaved = true;

            if (response.getReturnValue().getCode() === 0)
            {
                
                REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_removeTab(self.userActionContainer.parentContainer);
            }
            else
            {
                self.showError(result.getReturnValue().getDescription());
            }
        };

        var failFunction = function ()
        {
            self.hideLoadingMask();
            self.showError(LANGUAGE.getString("errorSaveMail"));
        };

        SESSION.saveMail(self.getSelectedEmail().newMailId, mailMessage, doneFunction, failFunction);
    }
});

Ext.define('CancelButton',
{
    extend: 'UserActionButton',

    iconName: "remove",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('cancel');

        this.callParent();
    },

    handler: function ()
    {
        var self = this;

        var doneFunction = function (result)
        {
            self.hideLoadingMask();
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_removeTab(self.userActionContainer.parentContainer);
        };

        var failFunction = function ()
        {
            self.hideLoadingMask();
        };

        var cancelMailFunction = function ()
        {
            self.showLoadingMask();
            SESSION.cancelMail(self.getSelectedEmail().newMailId, doneFunction, failFunction);
        };

        if (isValid(this, 'email.type') && this.email.type === MailType.NewTicket.value)
        {
            cancelMailFunction();
            return;
        }

        if (this.hasMailChanged())
        {
            this.showConfirmation(
                {
                    errorMessageText: LANGUAGE.getString('saveEmailAsDraft'),
                    yesCallback: function ()
                    {
                        var saveDraftButton = new SaveDraftButton({
                            actionData: self.actionData,
                            userActionContainer: self.userActionContainer,
                            email: self.email,
                            headerData: self.headerData
                        });
                        saveDraftButton.handler();
                    },
                noCallback: cancelMailFunction
            });
        }
        else
        {
            cancelMailFunction();
        }

        if (this.actionData.store.isOpenStore())
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_cancelMail(this.email);
        }
    }

});

Ext.define('CopyToButton',
{
    extend: 'UserActionButton',

    iconName: "reply",

    mailType: MailType.Copy,

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('copyTo');
        
        this.callParent();
    },

    handler: function ()
    {
        var selectedEmail = this.getSelectedEmail();
        var title = selectedEmail.subject;
        this.reply3rdParty(MailType.Copy, selectedEmail, title, MailCreateCiteMode.CiteBelow.value);
    }
});

Ext.define('QueryButton',
{
    extend: 'UserActionButton',

    iconName: "reply",

    mailType: MailType.Query,

    citeMode: MailCreateCiteMode.CiteNone.value,

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('queryTo');

        this.menu = new CustomMenu(
        {
            highlightFirstMenuItem: false,
            insertItems:
            [
                [
                    {
                        text: LANGUAGE.getString("withOriginalEmail"),
                        iconName: 'reply',
                        handler: () =>
                        {
                            this.replyWithOriginalMail();
                        }
                    }
                ],
                [
                    {
                        text: LANGUAGE.getString("withoutOriginalEmail"),
                        iconName: 'reply',
                        handler: () =>
                        {
                            this.replyWithoutOriginalMail();
                        }
                    }
                ]
            ]
        });
            
        this.callParent();
    },

    handler: function ()
    {
        this.replyWithoutOriginalMail();
    },

    replyWithOriginalMail: function ()
    {
        this.reply(MailCreateCiteMode.CiteBelow.value);
    },

    replyWithoutOriginalMail: function ()
    {
        this.reply(MailCreateCiteMode.CiteNone.value);
    },

    reply: function (citeMode)
    {
        var selectedEmail = this.getSelectedEmail();
        var title = LANGUAGE.getString('queryTo');
        this.reply3rdParty(MailType.Query, selectedEmail, title, citeMode);
    }
});

Ext.define('MergeTicketButton',
{
    extend: 'UserActionButton',

    iconName: "conference",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('merge');

        this.callParent();
    },

    handler: function (button)
    {
        var self = this;

        var yesCallBackFunction = function ()
        {
            new MergeRequestDialog(
            {
                store: self.actionData.store,
                email: self.getSelectedEmail(),
                onMerge: function (sourceId, targetId)
                {
                    var mergeRequest = function (reasonId, comment)
                    {
                        var doneFct = function (result)
                        {
                            self.hideLoadingMask();
                            if (result.getReturnValue().getCode() !== 0)
                            {
                                self.showError(result.getReturnValue().getDescription());
                            }
                        };

                        var failFct = function ()
                        {
                            self.hideLoadingMask();
                            self.showError(LANGUAGE.getString("errorMerge"));
                        };

                        self.showLoadingMask();
                        SESSION.mergeTicket(sourceId, targetId, reasonId, comment, doneFct, failFct);
                    };
                        
                    self.createMailActionDialog("MailMerge", LANGUAGE.getString("mergeTicket"), mergeRequest, undefined);
                }
            }).show();
        };

        var noCallBackFunction = function () { };

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_checkIfActionIsPossible(this, self.getSelectedEmail().fullId, yesCallBackFunction, noCallBackFunction);
    }

});

Ext.define('CreateSplitViewButton',
{
    extend: 'UserActionButton',

    iconName: "split",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('split');

        this.callParent();
    },

    handler: function ()
    {
        var selectedEmail = Ext.clone(this.getSelectedEmail());

        selectedEmail.type = MailType.NewTicket.value;

        var originalHeaderData = this.getHeaderData();
        var headerData = Ext.clone(originalHeaderData);
        var actionData = Ext.clone(this.actionData);

        actionData.mailType = MailType.Split.value;

        headerData.curMailState = MailType.NewTicket.value;
        headerData.mailType = MailType.NewTicket.value;

        var replyHeader = new EmailHeaderSplitTicketFrame(
        {
            margin: '10 0 0 0',
            headerData: headerData,
            email: selectedEmail
        });

        var isOpenEmail = actionData.store.isOpenStore();

        var replyPanel = new ReplyCustomerPanel(
        {
            title: selectedEmail.subject,
            userEmailContainer: undefined,
            email: selectedEmail,
            userHeaderData: headerData,
            replyHeader: replyHeader,
            isOpenEmail: isOpenEmail,
            userActions: Ext.create('UserActionButtonsForSplit',
            {
                actionData: actionData,
                email: selectedEmail
            })
        });

        replyPanel.userActions.parentContainer = replyPanel;

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_createNewTab(replyPanel);
    }

    });

Ext.define('SplitTicketButton',
{
    extend: 'UserActionButton',

    iconName: 'split',

    category: 'MailSplit',
    titleForMailActionDialog: LANGUAGE.getString('split'),

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('split');

        this.callParent();
    },

    handler: function ()
    {
        this.sendEmail();
    }
});

Ext.define('CreateTicketButton',
{
    extend: 'UserActionButton',

    iconName: "reply",

    category: '',
    titleForMailActionDialog: '',

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('send');

        this.callParent();
    },

    handler: function ()
    {
        this.sendEmail();
    }
});

Ext.define('CreateTicketForMeButton',
{
    extend: 'UserActionButton',

    iconName: "reply",

    category: '',
    titleForMailActionDialog: '',
    
    initComponent: function ()
    {
        this.text = LANGUAGE.getString('sendToMe');
        this.toolTipText = LANGUAGE.getString("sendToMeTooltip");
        this.callParent();

        REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function ()
    {
        REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(this);
        this.callParent();
    },

    handler: function ()
    {
        this.sendEmail();
    },

    getMailData: function ()
    {
        var mailData = this.userActionContainer.getMailData();
        mailData.agentId = CURRENT_STATE_CONTACT_CENTER.getMyAgentId();
        return mailData;
    },

    onRequestManagementEvent_newGroupChosenForNewTicket: function (groupId)
    {
        var group = CURRENT_STATE_CONTACT_CENTER.getGroup(groupId);
        if (CURRENT_STATE_CONTACT_CENTER.isMailGroup(group))
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    }
});

Ext.define('RedistributeButton',
{
    extend: 'UserActionButton',

    iconName: "up",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('redistribute');
        this.toolTipText = LANGUAGE.getString('tooltipGiveBackRequest');

        this.callParent();
    },

    run: function ()
    {
        var self = this;

        var doneFct = function (result)
        {
            self.hideLoadingMask();
            if (result.getReturnValue().getCode() !== 0)
            {
                self.showError(result.getReturnValue().getDescription(), ErrorType.Error);
            }
        };

        var failFct = function ()
        {
            self.hideLoadingMask();
            self.showError(LANGUAGE.getString("errorRedistribute"));
        };

        SESSION.distributeToGroup(self.actionData.fullId, self.actionData.groupId, '', -1, doneFct, failFct);
    }
});

Ext.define('AcknowledgeButton',
{
    extend: 'UserActionButton',

    iconName: "check",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('acknowledged');
        this.toolTipText = LANGUAGE.getString('toolTipDocumentToKnowlegde');

        this.callParent();
    },

    run: function ()
    {
        var self = this;

        setTimeout(function ()
        {
            SESSION.mailMarkRead(self.actionData.mailId, 'Acknowledged', function (result)
            {
                self.hideLoadingMask();
                if (result.getReturnValue().getCode() !== 0)
                {
                    self.showError(result.getReturnValue().getDescription(), ErrorType.Error);
                }
                
            }, function ()
            {
                self.hideLoadingMask();
                self.showError(LANGUAGE.getString("errorAcknowledge"));
            });
        }, 100);
    }

});

Ext.define('DiscardDraftButton',
{
    extend: 'UserActionButton',

    iconName: "remove",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('discard');
        this.toolTipText = LANGUAGE.getString('tooltipDiscardDraft');

        this.callParent();
    },

    handler: function ()
    {
        var self = this;

        var selectedEmail = Ext.clone(this.getSelectedEmail());

        this.showConfirmation(
        {
            errorMessageText: LANGUAGE.getString('discardDraft'),
            yesCallback: function ()
            {
                self.showLoadingMask();
                var mailId = selectedEmail.newMailId || selectedEmail.mailId;

                SESSION.deleteMail(mailId, function (result)
                {
                    self.hideLoadingMask();
                    if (result.getReturnValue().getCode() !== 0)
                    {
                        self.showError(result.getReturnValue().getDescription(), ErrorType.Error);
                    }
                }, function ()
                {
                    self.hideLoadingMask();
                    self.showError(LANGUAGE.getString("errorDiscardDraft"), ErrorType.Error);
                });
            },
            noCallback: function ()
            {
            }
        });
    }

});

Ext.define('ContinueDraftButton',
{
    extend: 'UserActionButton',

    iconName: "edit",

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('continue');
        this.toolTipText = LANGUAGE.getString('tooltipContinueDraft');

        this.callParent();
    },

    handler: function ()
    {
        var selectedDraft = this.getSelectedEmail();
        var referenceMailId = selectedDraft.referenceMailId; //Referenz ist entweder das Ticket oder  die Mail, auf die man "antowrten", "Kopie an" oder "Rückfrage" gedrückt hat

        var emailState = selectedDraft.type;

        var referenceEmail = PARENT_REQUEST_STORE.getMailForMailId(referenceMailId);
        if (!isValid(referenceEmail))
        {
            console.log("Could not find a mail for mailId", referenceMailId);
            this.showError(LANGUAGE.getString("unknownErrorOccurred"));
            return;
        }

        if (!referenceEmail.receiver)
        {
            var receiverName = '';

            if (isValid(referenceEmail, 'receivers.length') && referenceEmail.receivers.length > 0) 
            {
                var receiver = referenceEmail.receivers[0];

                if (receiver.getName && isValidString(receiver.getName()))
                {
                    receiverName = receiver.getName();
                }
            }

            referenceEmail.receiver = receiverName;
        }

        if (emailState === MailType.Answer.value)
        {
            this.replyCustomerEmail(referenceEmail, MailCreateCiteMode.Undefined.value);
        }
        else if (emailState === MailType.Query.value)
        {
            this.reply3rdParty(MailType[emailState], referenceEmail, LANGUAGE.getString('queryTo'));
        }
        else
        {
            this.reply3rdParty(MailType[emailState], referenceEmail);
        }

        console.log(selectedDraft);
    }

});

Ext.define('OvertakeButton',
{
    extend: 'UserActionButton',

    iconName: 'lock',

    handler: function ()
    {
        var self = this;

        var message = LANGUAGE.getString("generalOvertakeRequest");
        if (isValid(this, "email.curWorkingAgent"))
        {
            message = LANGUAGE.getString("overtakeRequest", this.email.curWorkingAgent.getDisplayName());
        }
        this.showConfirmation(
        {
            errorMessageText: message,
            yesCallback: function ()
            {
                self.lockRequest(self);
            },
            noCallback: function ()
            {
            },
            errorType: ErrorType.Info
        });
    },

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('passwordChangeOvertake');
        this.toolTipText = LANGUAGE.getString('tooltipLockRequest');

        this.callParent();

        this.on('boxready', () =>
        {
            SESSION.addListener(this);
        });
        
    },

    onNewEvents: function (response)
    {
        if (!isValid(this.mailToBeSelected))
        {
            return;
        }
        var mail;
        Ext.each(response.getMailMessagesEx(), function (mailMessageEx)
        {
            if (mailMessageEx.getTicketId() === this.mailToBeSelected)
            {
                mail = mailMessageEx;
                this.mailToBeSelected = undefined;
                return false;
            }
        }, this);

        if (mail)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_selectEmailInEditEmailsFolder(mail);            
        }
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    }
});

Ext.define('SpamButton',
{
    extend: 'UserActionButton',

    iconName: 'spam',

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('spam');

        this.callParent();
    },

    handler: function ()
    {
        var self = this;

        var yesCallBackFunction = function ()
        {
            var callbackFunction = function (reasonId, comment)
            {
                var doneFct = function (result)
                {
                    self.hideLoadingMask();
                    if (result.getReturnValue().getCode() !== 0)
                    {
                        self.showError(result.getReturnValue().getDescription(), ErrorType.Error);
                    }
                };

                var failFct = function ()
                {
                    self.hideLoadingMask();
                    self.showError(LANGUAGE.getString("errorMarkAsSpam"));
                };

                self.showLoadingMask();
                SESSION.markEMail(self.actionData.fullId, MarkEmailState.Spam.value, comment, reasonId, doneFct, failFct);
            };


            self.createMailActionDialog('MailSpam', LANGUAGE.getString('spam'), callbackFunction);
        };

        var noCallBackFunction = function () { };

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_checkIfActionIsPossible(this, this.actionData.fullId, yesCallBackFunction, noCallBackFunction);

    }
});

Ext.define('MoreButton',
{
    extend: 'UserActionButton',

    createButtons: function ()
    {
        var actions =
        [
            new QueryButton(
            {
                actionData: this.actionData,
                userActionContainer: this.userActionContainer,
                email: this.email,
                headerData: this.headerData
            }),
            new CopyToButton(
            {
                actionData: this.actionData,
                userActionContainer: this.userActionContainer,
                email: this.email,
                headerData: this.headerData
            }), 
            new PrintButton(
            {
                actionData: this.actionData,
                userActionContainer: this.userActionContainer,
                email: this.email,
                headerData: this.headerData
            }),
            new ExportButton(
            {
                actionData: this.actionData,
                userActionContainer: this.userActionContainer,
                email: this.email,
                headerData: this.headerData
            })
        ];

        if (this.actionData.isRequest)
        {
            actions.push(new SpamButton(
            {
                actionData: this.actionData,
                userActionContainer: this.userActionContainer,
                email: this.email,
                headerData: this.headerData
            }));
            actions.push(new MergeTicketButton(
            {
                actionData: this.actionData,
                userActionContainer: this.userActionContainer,
                email: this.email,
                headerData: this.headerData
            }));
        }

        actions.push(new CreateSplitViewButton(
        {
            actionData: this.actionData,
            userActionContainer: this.userActionContainer,
            email: this.email,
            headerData: this.headerData
        }));

        return actions;
    },

    convertToMenuItems: function ()
    {
        var buttons = this.createButtons();
        var menuItems = [];

        Ext.each(buttons, function (button)
        {
            menuItems.push(button.convertToMenuItem());
        });

        return menuItems;
    },

    convertToMenuItem: function ()
    {
        return this.convertToMenuItems();
    },

    createMenu: function ()
    {
        var menuItems = this.convertToMenuItems();

        var menu = new CustomMenu(
        {
            highlightFirstItem: true,
            insertItems: menuItems
        });
        return menu;
    },

    initComponent: function ()
    {
        this.text = LANGUAGE.getString('more') + "...";
        this.toolTipText = LANGUAGE.getString('tooltipMoreActions');
        
        this.callParent();

        this.on('hide', this.onHide, this);
        this.on('show', this.onShow, this);
        this.on('boxready', this.onBoxReady, this);
    },

    onBoxReady: function ()
    {
        if (this.isVisible())
        {
            this.onShow();
        }
        else
        {
            this.onHide();
        }
    },

    onShow: function ()
    {
        this.menu = null;
        this.handler = () =>
        {
            this.createMenu().showBy(this);
        };
    },

    onHide: function ()
    {
        this.menu = this.createMenu();
        this.handler = null;
    },

    handler: function ()
    {

    }
});