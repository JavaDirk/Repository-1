Ext.define('UserActionContainer',
{
    extend: 'Ext.toolbar.Toolbar',
    overflowHandler: 'menu',

    margin: '15 0 10 10',

    padding: '1 0 0 0',

    border: false,

    style: {
        backgroundColor: 'transparent'
    },

    actionData: undefined,

    parentContainer: undefined,

    initComponent: function ()
    {
        this.callParent();
    },

    getMyPosition: function ()
    {
        var myPosition = 0;
        if (!this.ownerCt)
        {
            return 0;
        }
        Ext.each(this.ownerCt.items.items, function (item, index)
        {
            if (item === this)
            {
                myPosition = index;
                return false;
            }
        }, this);
        return myPosition;
    },

    showError: function (text, errorType)
    {
        var errorMessageComponent = Ext.create('ErrorMessageComponent',
        {
            errorMessageText: text,
            errorType: errorType || ErrorType.Error,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        });
        var myPosition = this.getMyPosition();

        if (isValid(this, "parentContainer.showMessage"))
        {
            this.parentContainer.showMessage(myPosition, errorMessageComponent);
        }
        else if (isValid(this, "parentContainer.insert"))
        {
            this.parentContainer.insert(myPosition, errorMessageComponent);
        }
        else
        {
            showErrorMessage(text, DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    showConfirmation: function (confirmation)
    {
        var myPosition = this.getMyPosition();
        confirmation.borderWidth = confirmation.borderWidth || 1;
        var confirmationComponent = Ext.create('ConfirmationComponent', confirmation);

        if (isValid(this, "parentContainer.showMessage"))
        {
            this.parentContainer.showMessage(myPosition, confirmationComponent);
        }
        else if (isValid(this, "parentContainer.insert"))
        {
            this.parentContainer.insert(myPosition, confirmationComponent);
        }
    },

    add: function ()
    {
        this.callParent(arguments);
        Ext.each(this.items.items, function (item, index)
        {
            item.addCls(ROUND_THIN_BUTTON);
            if (index === 0)
            {
                item.addCls(HIGHLIGHTED_ROUND_THIN_BUTTON);
                item.isFirstButton = true;
                item.setColor(WHITE);
            }
            
            if (index !== this.items.items.length - 1)
            {
                item.setMargin('0 15 0 0');
            }
        }, this);
    },

    hasMailChanged: function ()
    {
        return this.parentContainer.hasMailChanged();
    },

    getMailData: function ()
    {
        return this.parentContainer.getMailData();
    },

    setActionData: function (actionData)
    {
        this.actionData = actionData;

        this.each(function (button)
        {
            button.setActionData(actionData);
        });
    },

    convertButtonsToMenu: function ()
    {
        var insertItems = [];

        this.each(function (button)
        {
            var item = button.convertToMenuItem();

            if (Ext.isArray(item))
            {
                insertItems = insertItems.concat(item);
            }
            else
            {
                insertItems.push(item);
            }
            
        });

        return Ext.create('CustomMenu',
        {
            highlightFirstMenuItem: true,
            insertItems: insertItems,
            listeners:
            {
                hide: function (me)
                {
                    Ext.asap(() =>
                    {
                        me.destroy();
                    });
                }
            }
        });
    }
});

Ext.define('UserActionButtonsForReply',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
            new SendAndCompleteButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new SendButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new SaveDraftButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new CancelButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData})

        ]);
    }
});

Ext.define('UserActionButtonsForReply3rdParty',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
            new SendButton(
            {
                category: '',
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new SaveDraftButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new CancelButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData})

        ]);
    }
});

Ext.define('UserActionButtonsForNewTicket',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(new CreateTicketButton({
            actionData: this.actionData,
            userActionContainer: this,
            email: this.email,
            headerData: this.headerData
        }));
        this.add(new CreateTicketForMeButton({
            actionData: this.actionData,
            userActionContainer: this,
            email: this.email,
            headerData: this.headerData
        }));
    }
});

Ext.define('UserActionButtonsForSplit',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(new SplitTicketButton({
            actionData: this.actionData,
            userActionContainer: this,
            email: this.email,
            headerData: this.headerData}));
    }
});

Ext.define('UserActionButtonsForMerge',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(new MergeTicketButton({
            actionData: this.actionData,
            userActionContainer: this,
            email: this.email,
            headerData: this.headerData}));
    }
});

Ext.define('UserActionButtonsForPrintAndCopy',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
            new CopyToButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new PrintButton({
                actionData: this.actionData,
                userActionContainer: this,
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
        ]);
    }
});

Ext.define('UserActionButtonsForError',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(new PrintButton({
            actionData: this.actionData,
            userActionContainer: this,
            email: this.email,
            headerData: this.headerData
        }));
        this.add(new ExportButton(
        {
            actionData: this.actionData,
            userActionContainer: this.userActionContainer,
            email: this.email,
            headerData: this.headerData
        }));
    }
});

Ext.define('UserActionButtonsForSearch',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        if (this.userActionData.isRequest)
        {
            this.add(new OvertakeButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}));
        }

        this.add(
        [
            new CopyToButton(
            {
                actionData: this.actionData,
                email: this.email,
                headerData: this.headerData
            }),
            new PrintButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
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
        ]);
    }
});

Ext.define('UserActionButtonsForWorkedRequest',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
            new AnswerButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new TransferButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new RedistributeButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new MoreButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData})
        ]);
    }
});

Ext.define('UserActionButtonsForInboundConversationItem',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
            new AnswerButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new CopyToButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new CreateSplitViewButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new PrintButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
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
        ]);

        if (this.actionData.read !== readEmailState.Acknowledged.value)
        {
            this.insert(2, new AcknowledgeButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}));
        }
    }
});

Ext.define('UserActionButtonsForDraft',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
                new ContinueDraftButton({
                    actionData: this.actionData,
                    userActionContainer: this,
                    email: this.email,
                    headerData: this.headerData}),
                new DiscardDraftButton({
                    actionData: this.actionData,
                    userActionContainer: this,
                    email: this.email,
                    headerData: this.headerData}),
                new PrintButton({
                    actionData: this.actionData,
                    userActionContainer: this,
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
        ]);
    }
});

Ext.define('UserActionButtonsForDefault',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(new PrintButton({
            actionData: this.actionData,
            userActionContainer: this,
            email: this.email,
            headerData: this.headerData
        }));
        this.add(new ExportButton(
        {
            actionData: this.actionData,
            userActionContainer: this.userActionContainer,
            email: this.email,
            headerData: this.headerData
        }));
    }
});

Ext.define('UserActionButtonsForActiveRequest',
{
    extend: 'UserActionContainer',

    initComponent: function ()
    {
        this.callParent();

        this.add(
        [
            new AnswerButton(
            {
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData
            }),
            new GiveBackButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new TransferButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new CompleteButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}),
            new MoreButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData})
        ]);

        if (this.actionData.state === emailState.Assigned.value)
        {
            this.insert(2, new LockButton({
                actionData: this.actionData,
                userActionContainer: this,
                email: this.email,
                headerData: this.headerData}));
        }
    }
});