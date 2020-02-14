Ext.define('Action_Call',
{
    extend: 'BaseAction',

    lastCallEvent: null,
    
    resolveOrRun: function (ctiAction)
    {
        if (!isValid(ctiAction))
        {
            return;
        }

        if (isPhoneNumber(ctiAction.number))
        {
            ctiAction.run();
        }
        else
        {
            var self = this;
            SESSION.resolveName(ctiAction.number, null, Caesar.MatchFlag.First, Caesar.MatchType.Begin, function (response)
            {
                if (response.getReturnValue().getCode() === 0)
                {
                    if (response.getContacts().length === 0)
                    {
                        showWarningMessage(LANGUAGE.getString("noHitsFor", ctiAction.number), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                    }
                    else
                    {
                        var contact = response.getContacts()[0];
                        self.showContact(contact, ctiAction);
                    }
                }
                else
                {
                    showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            }, function ()
            {
                showWarningMessage(LANGUAGE.getString("errorResolveName"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            });
        }
    },

    showContact: function (contact, ctiAction)
    {
        if (!isValid(contact))
        {
            return;
        }
        var businessCardPanel = Ext.create('BusinessCardPanel',
        {
            contact: contact
        });
        var dialButton = Ext.create('RoundThinButton',
        {
            text: ctiAction.getOKButtonText(),
            iconName: 'phone',
            listeners:
            {
                click: function ()
                {
                    Ext.create('ChooseNumberContextMenu',
                    {
                        contact: contact,
                        numberChosenCallback: function (contact, number)
                        {
                            ctiAction.number = number;
                            ctiAction.contact = contact;
                            ctiAction.run();
                        },
                        button: dialButton
                    });
                }
            }
        });
        var dialog = Ext.create('SimpleDialog',
        {
            items:
            [
                Ext.create('Ext.Container',
                {
                    layout:
                    {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    margin: '5 0 0 5',
                    items:
                    [
                        businessCardPanel,
                        Ext.create('Ext.Container',
                        {
                            layout:
                            {
                                type: 'hbox'
                            },
                            items: [dialButton]
                        })
                    ]
                })
            ]
        });
        dialog.show();
        ctiAction.beforeCTIAction = function ()
        {
            dialog.hide();
        };
    },

    getIconName: function ()
    {
        return "phone";
    },

    isActionAllowedByTimioFeature: function ()
    {
        return SESSION.isTelephonyAllowed();
    }
});