Ext.define('CallNoticePanel',
{
    extend: 'Ext.Container',
    title: '',
    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    border: false,

    journalEntry: null,

    closable: false,

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('note').toUpperCase();

        var clone = new www_caseris_de_CaesarSchema_CTIJournalEntry();
        Ext.apply(clone, this.journalEntry);
        this.journalEntry = clone;

        var body = isValid(this.journalEntry, "getNotice().getBody") ? this.journalEntry.getNotice().getBody() : "";
        this.bodyTextArea = this.add(Ext.create('Ext.form.field.TextArea', 
        {
            value: body,
            emptyText: LANGUAGE.getString('noticeText'),
            margin: '5 5 5 5',
            flex: 1,
            growMin: 0,
            grow: true
        }));
        
        this.buttons = this.add(Ext.create('Ext.Container',
        {
            margin: '5 0 10 5',
            layout: 
            {
                type: 'hbox',
                align: 'stretch'
            }
        }));
        
        this.saveButton = this.buttons.add(Ext.create('RoundThinButton',
            {
                iconName: 'check',
                text: LANGUAGE.getString('save'),
                listeners:
                {
                    click: this.onSave,
                    scope: this
                }
            }));
        
        var menu = [];
        menu.push(
        {
            iconName: 'mail',
            text: LANGUAGE.getString('toEmailAddress'),
            handler: () =>
            {
                this.sendNotice("", this.bodyTextArea.getRawValue());
            }
        });
        var partnerEmails = this.getEMailAddressesFromJournalEntry();
        if (!Ext.isEmpty(partnerEmails))
        {
            var name = this.getNameFromJournalEntry();
            var menuEntry =
            {
                iconName: 'mail',
                text: LANGUAGE.getString(name ? 'toName' : 'toSubscriber', name),
                handler: () =>
                {
                    this.sendNotice(partnerEmails[0], this.bodyTextArea.getRawValue(), LANGUAGE.getString("sendCallNoteSubject", this.journalEntry.getLongDateAsString()));
                }
            };

            if (partnerEmails.length > 1)
            {
                var subMenu = [];
                Ext.each(partnerEmails, function (partnerEmail)
                {
                    subMenu.push({
                        iconName: 'mail',
                        text: partnerEmail,
                        handler: () =>
                        {
                            this.sendNoticeToSubscriber(partnerEmail, this.bodyTextArea.getRawValue());
                        }
                    });
                }, this);
                menuEntry.menu = new CustomMenu({ highlightFirstMenuItem: false, insertItems: subMenu });
            }
            menu.push(menuEntry);
        }
        var myEmail = MY_CONTACT.getEMail();
        if (isValidString(myEmail))
        {
            menu.push({
                iconName: 'mail',
                text: LANGUAGE.getString('toMe'),
                handler: () =>
                {
                    this.sendNotice(myEmail, this.bodyTextArea.getRawValue());
                }
            });
        }

        this.sendButton = this.buttons.add(Ext.create('RoundThinButton',
            {
                width: 175,
                margin: '0 0 0 5',
                iconName: 'mail',
                text: LANGUAGE.getString('sendNotice'),
                handler: () =>
                {
                    this.sendNotice("", this.bodyTextArea.getRawValue());
                },
                menu: !Ext.isEmpty(menu) ? new CustomMenu({ highlightFirstMenuItem: false, insertItems: menu }) : undefined
            }));


        SESSION.addListener(this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    createMenuItem: function (email, text)
    {
        return {
            iconName: 'email',
            text: text,
            handler: () =>
            {
                this.sendNotice(email, this.bodyTextArea.getRawValue());
            }
        }
    },
    
    sendNotice: function (email, text, subject)
    {
        var name = this.getNameFromJournalEntry();
        var company = this.getCompanyFromJournalEntry();
        var number = this.getNumberFromJournalEntry();

        var nameOrNumber = name || number;
        if (isValidString(company))
        {
            nameOrNumber += " (" + company + ")";
        }
        subject = subject || LANGUAGE.getString("sendCallNoteToMeSubject", nameOrNumber, this.journalEntry.getLongDateAsString());
        text = escapeNewLinesForMailto(text);
        this.openUrl('mailto:' + email + "?body=" + text + "&subject=" + subject);
    },

    openUrl: function (url)
    {
        window.open(url);
    },

    getEMailAddressesFromJournalEntry: function ()
    {
        return this.getAttributeValueFromJournalEntry('getAllEMailAddresses');
    },

    getNameFromJournalEntry: function ()
    {
        return this.getAttributeValueFromJournalEntry('getFullName');
    },

    getCompanyFromJournalEntry: function ()
    {
        return this.getAttributeValueFromJournalEntry('getCompany');
    },

    getNumberFromJournalEntry: function ()
    {
        if (!this.journalEntry)
        {
            return "";
        }
        var addressInfo = this.journalEntry.getAddressInfo();
        if (addressInfo && addressInfo.getNumber())
        {
            return addressInfo.getNumber();
        }
        return "";
    },

    getAttributeValueFromJournalEntry: function (attributeName)
    {
        if (!this.journalEntry)
        {
            return "";
        }
        var contact = this.journalEntry.getResolvedAddressInfo();
        if (contact && contact[attributeName]())
        {
            return contact[attributeName]();
        }
        return "";
    },
    onSave: function ()
    {
        if (this.bodyTextArea.isDirty())
        {
            this.save(this.bodyTextArea.getValue(), this.journalEntry);
        }
    },

    save: function (text, journalEntry)
    {
        this.saveButton.showLoadingMask();
        CURRENT_STATE_JOURNAL.saveNoteInJournalEntry(journalEntry, text, this);
    },

    onUpdateJournalEntrySuccess: function (response, journalEntry) 
    {
        this.saveButton.hideLoadingMask();
        if (response.getReturnValue().getCode() === 0)
        {
            this.resetTextArea();
            //this.showMessage(LANGUAGE.getString("saveNoticeSuccess"));
        }
        else
        {
            this.handleError(response.getReturnValue().getDescription());
        }
    },
    
    resetTextArea: function ()
    {
        this.bodyTextArea.originalValue = this.bodyTextArea.getRawValue();
    },

    resetNoticeInJournalEntry: function ()
    {
        var notice = this.journalEntry.getNotice() || new www_caseris_de_CaesarSchema_CTINotice();
        notice.setBody(this.bodyTextArea.originalValue);

        this.journalEntry.setNotice(notice);
    },

    onUpdateJournalEntryException: function () 
    {
        this.saveButton.hideLoadingMask();

        this.resetNoticeInJournalEntry();
        this.handleError(LANGUAGE.getString("errorSaveNotice"));
    },

    handleError: function (text)
    {
        this.resetNoticeInJournalEntry();

        this.showError(text);
    },

    showError: function (text)
    {
        var target = VIEWPORT;
        if (this.rendered)
        {
            target = this;
        }

        var component = Ext.create('ErrorMessageComponent',
            {
                margin: '5 5 10 5',
                errorMessageText: text,
                errorType: ErrorType.Warning,
                timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
            });
        target.insert(1, component);
    },

    focus: function ()
    {
        this.bodyTextArea.focus();
    },

    isDirty: function ()
    {
        if (!isValid(this.bodyTextArea))
        {
            return false;
        }
        return this.bodyTextArea.isDirty();
    },

    close: function ()
    {
        this.parent.removeItem(this);
    }
});

Ext.define('CallNoticePanelForCallPanel',
{
    extend: 'CallNoticePanel',

    callId: null,

    destroy: function ()
    {
        this.callParent();
    },

    onSave: function ()
    {
        if (!isValid(this.callId) || this.callId === 0)
        {
            if (isValidString(this.bodyTextArea.getValue()))
            {
                this.showError(LANGUAGE.getString("errorSaveNotice"));
            }
            return;
        }
        CLIENT_SETTINGS.addSetting("JOURNAL", CLIENT_SETTINGS_KEY_NOTICE_TEXT_FOR_CALL_ID + this.callId, this.bodyTextArea.getValue());
        CLIENT_SETTINGS.saveSettings();
        this.resetTextArea();
        //this.showMessage(LANGUAGE.getString("saveNoticeSuccess"));
    },

    onTabFocus: function ()
    {
        this.bodyTextArea.focus();
    }
});