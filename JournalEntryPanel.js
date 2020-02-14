Ext.define('CallDetailsPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },

    title: '', 

    journalEntry: null,
    parent: null,
    closable: false,

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString("callDetails").toUpperCase();
        
        this.main = this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            }
        }));
        
        if (isValid(this.journalEntry.getViaAddressInfo()) && this.journalEntry.getViaAddressInfo().isValid()) {
            this.add(this.parent.createTitleLabel(LANGUAGE.getString(this.journalEntry.isIncoming() ? "via" : "called"), "10 0 0 0"));
            this.add(this.parent.createBusinessCardPanel(this.journalEntry.getResolvedViaAddressInfo(), this.journalEntry.getViaAddressInfo(), undefined, this.journalEntry));
        }

        if (isValid(this.journalEntry.getToAddressInfo()) && this.journalEntry.getToAddressInfo().isValid()) {
            this.add(this.parent.createTitleLabel(LANGUAGE.getString(this.journalEntry.isIncoming() ? "transferedTo" : "transferedFrom"), "10 0 0 0"));
            this.add(this.parent.createBusinessCardPanel(this.journalEntry.getResolvedToAddressInfo(), this.journalEntry.getToAddressInfo(), undefined, this.journalEntry));
        }
    }
});

Ext.define('ContactButtonsForJournalEntryPanel',
{
    extend: 'ContactButtons',
    
    createContactActions: function ()
    {
        return new JournalEntryActions(this.journalEntry, this);
    }
});

Ext.define('JournalEntryPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
    },
    
    scrollable: 'vertical',

    journalEntry: null,
    showCallButton: true,
    showGroup: true,
    showNotice: true,
    
    initComponent: function ()
    {
        this.callParent();
        

        this.setJournalEntry(this.journalEntry);

        SESSION.addListener(this);

        var self = this;
        this.on('beforeclose', function ()
        {
            if (isValid(this.noticePanel) && this.noticePanel.isDirty())
            {
                self.showErrorOrConfirmation(Ext.create('ConfirmationComponent',
                {
                    yesCallback: function ()
                    {
                        self.close();
                        self.noticePanel.onSave();
                    },
                    noCallback: function ()
                    {
                        self.close();
                    },
                    errorMessageText: LANGUAGE.getString("noticeNotSaved"),
                    errorType: ErrorType.Warning,
                    borderWidth: 1,
                    margin: '5'
                }));
                return false;
            }
        });
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    setJournalEntry: function (journalEntry)
    {
        if (!isValid(journalEntry))
        {
            this.title = LANGUAGE.getString("call").toUpperCase();
            return;
        }

        this.suspendLayout = true;

        if (this.rendered)
        {
            this.removeAll();
        }

        this.journalEntry = journalEntry;

        this.title = LANGUAGE.getString(this.journalEntry.isIncoming() ? "incomingCall" : "outgoingCall");
        if (this.tab)
        {
            this.tab.setText(this.title.toUpperCase());
        }

        var MAX_WIDTH;

        var self = this;

        var firstLineText = this.journalEntry.getCallSuccessText();
        if (this.journalEntry.isMissedCall() && isValidString(this.journalEntry.getVoiceMailUrl()))
        {
            firstLineText = LANGUAGE.getString("missedCallWithVoiceMail");
        }

        var journalEntryDataContainer = this.add(Ext.create('Ext.Container',
            {
                padding: '0 0 15 5',
                margin: '0 0 0 0',
                layout:
                {
                    type: 'vbox',
                    align: 'stretch'
                },
                style:
                {
                    backgroundColor: PANEL_BACKGROUND_GREY
                }
            }));
        journalEntryDataContainer.add(Ext.create('Ext.Container',
        {
            maxWidth: MAX_WIDTH,
            margin: '5 5 0 5',
            layout:
            {
                type: 'hbox'
            },
            items:
            [
                Ext.create('Ext.form.Label',
                {
                    flex: 1,
                    text: firstLineText,
                    style: 'font-size:' + FONT_SIZE_NAME + 'px;color:' + this.journalEntry.getCallSuccessColor() + ";font-weight:500;"
                }),
                //Ext.create('Ext.Container', { flex: 1 }),
                this.trashIcon = Ext.create('Ext.Img',
                    {
                    margin: '10 0 0 0',
                    alt: 'trash',
                    tooltip: LANGUAGE.getString('removeFromJournal'),
                    src: IMAGE_LIBRARY.getImage('trash', 64, NEW_GREY),
                    height: 16,
                    width: 16,
                    listeners:
                    {
                        el:
                        {
                            click: function ()
                            {
                                self.showErrorOrConfirmation(Ext.create('ConfirmationComponent',
                                {
                                    yesCallback: function ()
                                    {
                                        self.deleteJournalEntry();
                                    },
                                    noCallback: Ext.emptyFn,
                                    errorMessageText: LANGUAGE.getString("removeFromJournal") + "?",
                                    borderWidth: 1,
                                    margin: '10 5 5 5'
                                }));
                            }
                        }
                    }
                })
            ]
        }));
        journalEntryDataContainer.add(Ext.create('Ext.Container',
        {
            maxWidth: MAX_WIDTH,
            margin: '5 5 0 5',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            items:
            [
                this.createLabel(LANGUAGE.getString("journalEntryDate", formatLongDateString(this.journalEntry.getDateTime()), this.journalEntry.getTime()), FONT_SIZE_SUBTITLE, "")
            ]
        }));
        var thirdLine = journalEntryDataContainer.add(Ext.create('Ext.Container',
        {
            maxWidth: MAX_WIDTH,
            margin: '0 5 0 5',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            }
        }));
        if (this.journalEntry.isCallSuccessfull() && !isValidString(this.journalEntry.getVoiceMailUrl()))
        {
            thirdLine.add(this.createLabel("(" + convertSecondsToString2(this.journalEntry.getLineTime()) + ")", FONT_SIZE_TEXT - 1, "5 0 0 0"));
        }

        var groupName = this.journalEntry.getACDGroupName();
        if (isValidString(groupName) && this.showGroup)
        {
            var fourthLine = journalEntryDataContainer.add(Ext.create('Ext.Container',
            {
                maxWidth: MAX_WIDTH,
                margin: '15 5 5 5',
                layout:
                {
                    type: 'hbox'
                },
                items:
                [
                    Ext.create('ThinImage',
                    {
                        src: IMAGE_LIBRARY.getImage(ICON_NAME_ACD_GROUP, 64, DARK_GREY),
                        colorize: false,
                        height: 24,
                        width: 24,
                        style: "cursor: normal",
                        alt: 'headset',
                        margin: '1 0 0 0'
                    }),
                    this.createLabel(groupName, FONT_SIZE_SUBTITLE, "4 0 0 5")
                ]
            }));
            this.fourthLine = fourthLine;
        }

        var campaignName = this.journalEntry.getACDInfo() ? this.journalEntry.getACDInfo().getCampaign() : "";
        if (isValidString(campaignName))
        {
            var fifthLine = journalEntryDataContainer.add(Ext.create('Ext.Container',
                {
                    maxWidth: MAX_WIDTH,
                    margin: '15 5 5 5',
                    layout:
                    {
                        type: 'hbox'
                    },
                    items:
                        [
                            this.createLabel(LANGUAGE.getString('campaign') + ': ' + campaignName, FONT_SIZE_SUBTITLE, "4 0 0 5")
                        ]
                }));
            this.fifthLine = fifthLine;
        }

        var voiceMailUrl = this.journalEntry.getVoiceMailUrl();
        if (isValidString(voiceMailUrl))
        {
            journalEntryDataContainer.add(Ext.create('Ext.Container',
            {
                margin: '10 5 5 5',
                layout: 'vbox',
                items:
                [
                    Ext.create('Ext.Component',
                    {
                        html: '<audio preload="metadata" controls src="' + voiceMailUrl + '"></audio>',
                        listeners:
                        {
                            boxready: function (component)
                            {
                                component.el.down('audio').on('error', function ()
                                {
                                    self.showErrorOrConfirmation(Ext.create('ErrorMessageComponent',
                                    {
                                        margin: '10 0',
                                        errorMessageText: LANGUAGE.getString('errorPlayRecordingUrl'),
                                        errorType: ErrorType.Error,
                                        borderWidth: 1
                                    }));
                                });
                            }
                        }
                    })
                ]
            }));
        }

        if (isValid(this.journalEntry, "getACDInfo().getRecordingUrl()"))
        {
            var recordingLabel = this.createLabel(LANGUAGE.getString("record") + ":", FONT_SIZE_SUBTITLE, "5 0 5 0");
            var recordingUrl = this.journalEntry.getACDInfo().getRecordingUrl();
            if (isValidString(recordingUrl)) {
                journalEntryDataContainer.add(Ext.create('Ext.Container',
                {
                    margin: '5 5 5 5',
                    layout: 'vbox',
                    items:
                    [
                        recordingLabel,
                        Ext.create('IFrame',
                        {
                            resizable:
                            {
                                handles: 'e'
                            },
                            width: 500,
                            height: 74,
                            url: recordingUrl + "&WrapHTML=true",
                            border: 1,
                            style: 
                            {
                                borderColor: COLOR_SEPARATOR,
                                borderStyle: 'solid'
                            }
                        })
                    ]
                }));
            }
        }
        
        if (this.showContact())
        {
            this.add(this.createBusinessCardPanelAndButtons());
        }

        this.tabPanel = this.add(Ext.create('UniqueTabPanel',
        {
            hidden: true,
            flex: 1,
            border: false
        }));

        var showCallDetails = false;
        if (isValid(this.journalEntry.getViaAddressInfo()) && this.journalEntry.getViaAddressInfo().isValid()) {
            showCallDetails = true;
        }

        if (isValid(this.journalEntry.getToAddressInfo()) && this.journalEntry.getToAddressInfo().isValid()) {
            showCallDetails = true;
        }

        if (showCallDetails) {
            this.addToTabPanel(Ext.create('CallDetailsPanel',
            {
                parent: this,
                journalEntry: this.journalEntry
            }));
        }

        if (this.showNotice)
        {
            this.addNoticePanel();
        }

        if (isValid(this.journalEntry, "getACDInfo().getFormUrl()"))
        {
            this.formPanel = Ext.create('FormPanel',
            {
                url: this.journalEntry.getACDInfo().getFormUrl()
            });
            this.addToTabPanel(this.formPanel);
        }

        this.suspendLayout = false;
        this.updateLayout();
    },

    showContact: function ()
    {
        return true;
    },

    createBusinessCardPanelAndButtons: function(addLine)
    {
        this.businessCardPanel = this.createBusinessCardPanel(this.journalEntry.getResolvedAddressInfo(), this.journalEntry.getAddressInfo(), undefined, this.journalEntry);

        var buttons = Ext.create('ContactButtonsForJournalEntryPanel',
        {
            margin: '0 0 5 5',
            parent: this,
            journalEntry: this.journalEntry,
            contact: this.getContactOutOfJournalEntry()
        });
        var container = Ext.create('Ext.Container',
        {
            margin: '20 0 10 0',
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            items:
            [
                this.businessCardPanel,
                buttons
            ]
        });
        return container;
    },

    createBusinessCardPanel: function (contact, addressInfo, groupName, journalEntry)
    {
        return Ext.create('BusinessCardPanel',
        {
            showCallButton: this.showCallButton,
            contact: contact,
            addressInfo: addressInfo,
            parent: this,
            showDetails: false,
            groupName: groupName,
            journalEntry: journalEntry
        });
    },

    getContactOutOfJournalEntry: function ()
    {
        var contact = this.journalEntry.getResolvedAddressInfo();
        if (!isValid(contact) || !contact.isRealContact())
        {
            return null;
        }
        if (contact.getCountTelephoneNumbers() === 0 && isValid(this.journalEntry.getAddressInfo()) && isValidString(this.journalEntry.getAddressInfo().getNumber()))
        {
            contact.number = this.journalEntry.getAddressInfo().getNumber();
        }
        return contact;
    },

    createTitleLabel: function (text, margin)
    {
        return this.createLabel(text, FONT_SIZE_TITLE, margin, COLOR_SUBTITLE);
    },

    createLabel: function (text, fontSize, margin, color)
    {
        return new Ext.form.Label({
            style: 'font-size:' + (fontSize || FONT_SIZE_SUBTITLE) + 'px;color:' + (color || COLOR_SUBTITLE),
            text: text,
            margin: margin
        });
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    },
    
    onChat: function (contact)
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openUserChat(contact);
    },

    deleteJournalEntry: function ()
    {
        this.close();

        SESSION.deleteJournalEntry(this.journalEntry.getJournalId());
    },

    onDeleteJournalEntrySuccess: function (response, journalID)
    {
        if (response.getReturnValue().getCode() === 0 && journalID === this.journalEntry.getJournalId())
        {
            this.close();
        }
    },

    close: function ()
    {
        if (isValid(this, "parent.removeItem"))
        {
            this.parent.removeItem(this);
        }
    },

    onMap: function (clickedButton, contact)
    {
        this.openGoogleMaps(false, contact);
    },

    onRoute: function (clickedButton, contact) {
        this.openGoogleMaps(true, contact);
    },

    openGoogleMaps: function (route, contact)
    {
        if (!isValid(contact)) {
            return;
        }

        this.addToTabPanel(Ext.create('GoogleMapsPanel',
        {
            contact: contact,
            title: LANGUAGE.getString(route ? "route" : "map").toUpperCase(),
            displayRoute: route
        }));
    },


    addToTabPanel: function (panel)
    {
        this.tabPanel.show();

        this.tabPanel.addItem(panel);
        this.tabPanel.setActiveTab(panel);
    },

    showNoticeTab: function ()
    {
        this.tabPanel.setActiveTab(this.noticePanel);
        this.noticePanel.focus();
    },

    createLine: function (maxWidth)
    {
        return Ext.create('Ext.Container',
        {
            maxWidth: maxWidth,
            height: 1,
            margin: '15 0 15 0',
            style: 'background-color:' + COLOR_SEPARATOR
        });
    },

    onUpdateJournalEntrySuccess: function (response, journalEntry)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            if (journalEntry === this.journalEntry)
            {
                this.setJournalEntry(this.journalEntry);
            }
        }
    },

    onUpdateJournalEntriesSuccess: function (response, journalEntries)
    {
        var self = this;
        if (response.getReturnValue().getCode() === 0)
        {
            Ext.each(journalEntries, function (journalEntry) {
                if (journalEntry === self.journalEntry) {
                    self.setJournalEntry(self.journalEntry);
                }
            });
        }
    },

    addNoticePanel: function ()
    {
        this.noticePanel = Ext.create('CallNoticePanel',
        {
            noticePanelOwner: this,
            journalEntry: this.journalEntry
        });
        this.addToTabPanel(this.noticePanel);
        return this.noticePanel;
    },

    showErrorOrConfirmation: function (errorOrConfirmation)
    {
        this.insert(0, errorOrConfirmation);
        this.updateLayout();
    }
});