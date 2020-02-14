Ext.define('DiversionPanel',
{
    extend: 'ModalDialog',

    lineId: 0,

    initComponent: function ()
    {
        this.titleText = this.titleText || LANGUAGE.getString('diversionPanelTitle');

        this.callParent();
       

        var self = this;
        this.searchResultsPanel = Ext.create('SearchResultsPanelForDialogs',
        {
            parent: this,
            overlayButtons: false,
            margin: '5 0 0 0',
            searchForNumber: false,
            listeners:
            {
                hide: function ()
                {
                    self.errorLabel.hide();
                    this.setEmptyText("");
                }
            },

            onContactSelected: function (record, item)
            {
                self.setCallDiversion(self.setDiversionButton);
            },

            onDoubleClick: function (view, record, item, index, event, opts)
            {
                this.onContactSelected(record, item);
            }
        });


        this.comboBox = Ext.create('SearchPanelWithAddressBookChooser',
        {
            clientSettingsKeyForCurrentAddressBook: 'DiversionPanel_SelectedAddressBook',
            clientSettingsKey: KEY_CALL_DIVERSION_HISTORY,
            clearComboBoxOnSuccess: true,
            textForAutoCompletion_dial: LANGUAGE.getString("setCallDiversionToNumber"),
            ctiAction: Ext.create('CTIAction_Diversion',
            {
                lineId: this.lineId,
                searchResultsPanel: this.searchResultsPanel,
                panelToHide: null,
                errorLabel: this.errorLabel,
                beforeCTIAction: function()
                {
                    self.hide();
                },
                
                exceptionCallback: function (errorText)
                {
                    self.onError(errorText);
                }
            }),
            contactListPanel: this.searchResultsPanel,

            onSuccessfullSearch: function (value)
            {
                self.errorLabel.hide();
            },

            onClearButtonPressed: function ()
            {
                if (self.searchResultsPanel.isHidden())
                {
                    return;
                }
                self.searchResultsPanel.hide();
            },

            onEnter: function (toSearchFor)
            {

            }
        });
        
        this.errorLabel = Ext.create('Label',
        {
            hidden: true,

            setTextAndShow: function (text)
            {
                this.setText('<div class="errorMessage">' + text + '</div>');
                this.show();
            }
        });

        var container = Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },

            flex: 1,
            margin: '2 5',
            items: [this.comboBox, this.searchResultsPanel, this.errorLabel]
        });

        this.addToBody(container);

        this.setDiversionButton = {
            margin: '0 10 0 0',
            text: LANGUAGE.getString('set'),
            listeners:
            {
                click: function ()
                {
                    self.setCallDiversion(self.setDiversionButton);
                }
            }
        };

        this.deleteDiversionButton = {
            text: LANGUAGE.getString('erase'),
            listeners:
            {
                click: function ()
                {
                    //self.parent.hide();
                    self.deleteCallDiversion();
                }
            }
        };

        this.setDiversionButton = this.addButton(this.setDiversionButton);
        this.deleteDiversionButton = this.addButton(this.deleteDiversionButton);

        this.on('boxready', function ()
        {
            this.updateCallDiversionNumber();
            SESSION.addListener(this);
        }, this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    setCallDiversion: function (target)
    {
        var self = this;
        Ext.create('PickNumberAndStartAction',
        {
            ctiAction: self.comboBox.ctiAction,
            errorMessageBoxTarget: self.setDiversionButton,
            searchResultsPanel: self.searchResultsPanel,
            comboBox: self.comboBox,
            button: target,
            noInputCallback: function ()
            {
                self.deleteCallDiversion();
            },

            showError: function (text)
            {
                self.changeErrorMessage(text);
            }
        }).run();
    },

    deleteCallDiversion: function ()
    {
        this.hide();
        var self = this;
        SESSION.removeCallDiversion(this.lineId, DEFAULT_SUCCESS_CALLBACK(function (response)
        {
            if (response.getReturnValue().getCode() === 0 && !self.destroyed && isValid(self.comboBox))
            {
                self.comboBox.reset();
            }
        }, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorDeleteDiversion"), null));
    },

    getNumber: function ()
    {
        return Ext.String.trim(this.comboBox.getRawValue());
    },

    updateButtons: function ()
    {
        this.enableButtons(isValidString(this.getNumber()));
    },

    enableButtons: function (enabled)
    {
        this.setDiversionButton.setDisabled(!enabled);
    },

    onNewEvents : function (response)
    {
        if (isValid(response.getOwnerCallDiversion()))
        {
            this.updateCallDiversionNumber();
        }
    },

    updateCallDiversionNumber: function ()
    {
        if (this.lineId === 0)
        {
            this.comboBox.setRawValue(CURRENT_STATE_CALL.getCallDiversionNumber());
        }
        else
        {
            var self = this;
            SESSION.getCallDiversion(this.lineId, function (response)
            {
                if (response.getReturnValue().getCode() === 0 && isValid(response, "getCallDiversionInfo()"))
                {
                    var destination = getFirstValidString([response.getCallDiversionInfo().getDisplayNumber(), response.getCallDiversionInfo().getDestination()]);
                    if (isValid(self.comboBox))
                    {
                        self.comboBox.setRawValue(destination);
                    }
                }
            }, function () { });
        }
    },

    onError: function (errorText)
    {

    },

    focus: function ()
    {
        this.callParent();

        this.comboBox.focus();
    }
});