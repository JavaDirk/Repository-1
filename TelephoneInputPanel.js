Ext.define('TelephoneInputPanel',
{
    extend: 'Ext.Container',
    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    flex: 1,
    padding: '25 25 0 25',

    currentAddressBook: ALL_ADDRESS_BOOKS,

    backgroundColor: 'transparent',
    buttonBackgroundColor: 'transparent',
    searchPanelMarginRight: 0,
    searchResultsPanelClassName: 'SearchResultsPanel',
    ctiAction: null,
    clearComboBoxOnSuccess: true,
    openContactOnSelect: false,
    showOutboundGroup: true,
    showCallButtons: true,
    
    cls: 'telephoneInputPanel',

    initComponent: function ()
    {
        this.callParent();

        var self = this;

        this.searchResultsPanel = Ext.create(this.searchResultsPanelClassName,
        {
            openContactOnSelect: this.openContactOnSelect,
            searchForNumber: false,
            parent: this,
            margin: '5 0 0 0',
            listeners:
            {
                hide: function ()
                {
                    //self.setFlex(0);
                    if (self.parent) {
                        self.parent.updateLayout();
                    }

                    this.setEmptyText("");

                    self.keyPadPanel.show();

                    self.errorLabel.hide();
                },

                show: function ()
                {
                    self.keyPadPanel.hide();
                }
            },

            clearSearch: function ()
            {
                self.clearSearch();
            }
        });

        this.keyPadPanel = Ext.create('KeyPadPanel',
        {
            buttonBackgroundColor: this.buttonBackgroundColor,
            margin: '20 0 0 0',
            keyCallback: function (key)
            {
                self.comboBox.addCharacter(key);
            },
            listeners:
            {
                hide: function ()
                {
                    self.searchResultsPanel.show();
                }
            }
        });

        if (!isValid(this.ctiAction))
        {
            this.ctiAction = Ext.create("CTIAction_Dial",
            {
                callId: this.callId
            });
            this.ctiAction.addCallbackForSuccessfullCTIAction(function (response, number, contact) 
            {
                self.errorLabel.hide();
                self.searchResultsPanel.hide();
                self.close();
            });
        }
        
        this.comboBox = Ext.create('SearchPanelWithAddressBookChooser',
        {
            margin: (isValidString(this.title) ? 25 : 0) + ' 0 0 0',
            flex: 1,
            clientSettingsKey: this.ctiAction.getClientSettingsKeyForHistory(),
            clearComboBoxOnSuccess: this.clearComboBoxOnSuccess,
            contactListPanel: this.searchResultsPanel,
            marginRight: this.searchPanelMarginRight,
            ctiAction: this.ctiAction,
            textForAutoCompletion_dial: this.textForAutoCompletion_dial,
            onEnter: function (toSearch)
            {
                if (self.showOutboundGroup)
                {
                    //self.ctiAction.groupId = self.outboundGroupEntry.getSelectedGroupId();
                }
            },

            onSuccessfullSearch: function (value)
            {
                self.onSuccessfullSearch(value);
            },

            onClearButtonPressed: function ()
            {
                self.clearSearch();
            }
        });

        this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'hbox',
                pack: 'center'
            },

            items:
            [
                self.comboBox
            ]
        }));

        
        this.errorLabel = Ext.create('Label',
        {
            hidden: true,
            setTextAndShow: function (text)
            {
                this.setText('<div class="errorMessage">' + text + '</div>');
                this.show();
            }
        });
   
        this.keyPadAndSearchResultsContainer = this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },

            flex: 1,
            scrollable: 'vertical',
            items:
            [
                Ext.create('Ext.Container',
                {
                    layout:
                    {
                        type: 'hbox',
                        pack: 'center'
                    },
                    items: [this.keyPadPanel]
                }),
                this.searchResultsPanel,
                this.errorLabel
            ]
        }));

        var button = Ext.create('CallButton',
        {
            tooltip: LANGUAGE.getString('dial'),
            iconName: "phone",
            iconColor: COLOR_CALL_BUTTON_DIAL,
            clickListener: Ext.emptyFn,
            ctiAction: this.ctiAction
            });

        if (this.showCallButtons)
        {
            this.setCallButtons(button);
        }    

        this.setStyle({
            backgroundColor: this.backgroundColor
        });

        this.on('boxready', function ()
        {
            SESSION.addListener(this);
        }, this);

        if (this.showOutboundGroup)
        {
            this.labelForOutboundGroupEntry = this.keyPadAndSearchResultsContainer.add(new Ext.Component(
                {
                    hidden: Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getGroupsForOutbound()),
                    margin: '25 0 0 0',
                    html: '<div style="display:flex;flex:1;align-items:center">' +
                            '<div style="padding-bottom:1px;margin-left:2px;font-weight:500;font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_MAIN_2 + '">' + LANGUAGE.getString("callForGroup") + '</div>' +
                            '<div style="flex:1;height:1px;margin-left:15px;background-color:' + COLOR_SEPARATOR + '"></div>' +
                        '</div>'
                }));

            this.outboundGroupEntry = new CurrentOutboundGroup(
                {
                    ctiAction: this.ctiAction,
                    listeners:
                    {
                        show: function ()
                        {
                            self.labelForOutboundGroupEntry.show();
                            self.checkbox.show();
                        },

                        hide: function ()
                        {
                            self.labelForOutboundGroupEntry.hide();
                            self.checkbox.hide();
                        }
                    }
                });
            this.keyPadAndSearchResultsContainer.add(new Ext.Container(
                {
                    margin: '0 0 0 0',
                    layout:
                    {
                        type: 'hbox'
                    },
                    items:
                        [
                            this.outboundGroupEntry
                        ]
                }));

            
            var checked = !!CLIENT_SETTINGS.getSetting('CONTACT_CENTER', 'noACDCallOnInternalCalls');
            this.checkbox = /*this.keyPadAndSearchResultsContainer.add*/(new Ext.form.field.Checkbox(
                {
                    checked: checked,
                    boxLabel: LANGUAGE.getString("noACDCallsIfInternalContact", MY_CONTACT.getFullName()),
                    listeners:
                    {
                        change: function (checkbox, newValue)
                        {
                            CLIENT_SETTINGS.addSetting('CONTACT_CENTER', 'noACDCallOnInternalCalls', newValue);
                            CLIENT_SETTINGS.saveSettings();
                        }
                    }
                }));
        }
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    clearSearch: function ()
    {
        if (this.searchResultsPanel.isHidden())
        {
            return;
        }
        this.searchResultsPanel.hide();
        this.searchResultsPanel.clearContacts();

        Ext.asap(() =>
        {
            this.focus();
        }, this);
    },

    setCTIAction: function (ctiAction)
    {
        this.ctiAction = ctiAction;

        this.comboBox.setCTIAction(ctiAction);
        if (this.outboundGroupEntry)
        {
            this.outboundGroupEntry.ctiAction = ctiAction;
        }
    },

    setCallButtons: function (callButton)
    {
        this.keyPadPanel.removeAllCallButtons();
        if (!isValid(callButton))
        {
            if (isValid(this.labelForOutboundGroupEntry))
            {
                this.labelForOutboundGroupEntry.margin = '0 0 0 0';
            }
            return;
        }
        var self = this;
        var clickListener = function ()
        {
            //this.ctiAction.groupId = self.getSelectedGroupId();
            
            Ext.create('PickNumberAndStartAction',
            {
                ctiAction: this.ctiAction,
                errorMessageBoxTarget: callButton,
                searchResultsPanel: self.searchResultsPanel,
                comboBox: self.comboBox,
                button: this,
                noInputCallback: Ext.emptyFn
            }).run();
        };

        callButton.on('click', clickListener);
        
        callButton.ctiAction.searchResultsPanel = self.searchResultsPanel;
        callButton.ctiAction.panelToHide = self.keyPadPanel;
        callButton.ctiAction.errorLabel = self.errorLabel;

        this.setCTIAction(callButton.ctiAction);
        
        this.keyPadPanel.addCallButtonLine(callButton);
    },

    addButton: function (button, marginTop)
    {
        this.keyPadPanel.addAdditionalCallButtonLine(button, marginTop);
    },

    close: function ()
    {
        if (isValid(this.parent, "hideTelephoneInputPanel"))
        {
            this.parent.hideTelephoneInputPanel();
        }
    },

    getCurrentNumber: function ()
    {
        return Ext.String.trim(this.comboBox.getRawValue());
    },

    onSuccessfullSearch: function (value)
    {
        this.errorLabel.hide();
    },

    reset: function ()
    {
        this.searchResultsPanel.hide();

        this.comboBox.reset();
    },

    focus: function ()
    {
        this.callParent();

        this.comboBox.focus();
    },

    getSelectedGroupId: function ()
    {
        if (isValid(this.outboundGroupEntry))
        {
            return this.outboundGroupEntry.getSelectedGroupId();
        }
        return -1;
    },

    //@override
    setCTIActionIsPossible: function (flag)
    {
        
    },

    onStartSearch: function ()
    {
        var toSearch = this.comboBox.getRawValue();
        
        this.comboBox.onStartSearch(toSearch);
    }
});
