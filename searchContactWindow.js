/// <reference path="C:\sourcen\main\projects\Web\Shared\es6-promise.min.js" />
/**
 * Created by martens on 09.09.2015.
 */
Ext.define('SearchContactWindow',
{
    extend: 'ModalDialog',

    hasSelectButton: true,

    overlayButtons: false,

    initComponent: function ()
    {
        this.titleText = this.titleText || LANGUAGE.getString("addContact") + "...";
        this.callParent();

        var self = this;

        this.searchResultsPanel = new SearchResultsPanelForDialogs(
        {
            minHeight: 64,
            hidden: false,
            margin: '25 0 10 0',
            overlayButtons: this.overlayButtons,
            getWatermarkImage: function ()
            {
                return IMAGE_LIBRARY.getImage("addressBook", 64, COLOR_WATERMARK);
            },
            startSearch: function (searchString, successfullSearchCallback, successfullCTIActionCallback)
            {
                this.show();
                SearchResultsPanelForDialogs.superclass.startSearch.apply(this, arguments);
            },
            onSearchEnd: function (searchString)
            {
                hideLoadingMask(this);
            },
            onDoubleClick: function (me, record, item, index)
            {
                if (self.itemClicked(me, record, item, index))
                {
                    self.saveSelectedContact(me);
                }
            },
            onSingleClick: function (me, record, item, index)
            {
                if (self.buttonContainer)
                {
                    self.itemClicked(me, record, item, index);
                    return;
                }

                if (self.itemClicked(me, record, item, index))
                {
                    self.saveSelectedContact(me);
                }
            },

            onCompleteSearchFinished: function ()
            {
                this.showOnlyTheFirstXRecords(12);

                this.focusAndSelectFirstContact();

                if (this.getStore().getCount() > 0)
                {
                    Ext.asap(() =>
                    {
                        var selection = this.getSelectionModel().getSelection();
                        if (selection && selection[0])
                        {
                            self.itemClicked(self, selection[0]);
                        }
                    });
                }
                else
                {
                    this.hide();
                }
            },

            onContactSelected: function (record, item)
            {
                self.saveSelectedContact();
            }
        });

        //this.searchResultsPanel.hide();

        this.searchPanel = new SearchPanelWithAddressBookChooser(
        {
            contactListPanel: this.searchResultsPanel,
            clientSettingsKeyForCurrentAddressBook: 'SearchContactWindow_CurrentAddressBook',
            clientSettingsKey: KEY_SEARCH_PARTNER_HISTORY,
            textForAutoCompletion_dial: LANGUAGE.getString("searchContactWithNumber"),
            onClearButtonPressed: function ()
            {
                self.searchResultsPanel.clearContacts();
                if (self.saveButton)
                {
                    self.saveButton.onClearButtonPressed();
                }
            }
        });

        if (this.hasSelectButton)
        {
            this.saveButton = this.addButton({
                text: LANGUAGE.getString('add'),

                disabled: true,

                listeners:
                {
                    click: function (event)
                    {
                        self.saveSelectedContact(event);
                    }
                },

                onClearButtonPressed: function () {
                    this.disable();
                }
            });
        }
        else
        {
            this.addButton({
                text: LANGUAGE.getString('close'),

                listeners:
                {
                    click: function (event)
                    {
                        self.hide();
                    }
                }
            });
        }

        this.addToBody([this.searchPanel, this.searchResultsPanel]);
    },

    itemClicked: function (me, record, item, index)
    {
        if (this.saveButton)
        {
            this.saveButton.setDisabled(false);
        }

        this.partner = record.data;

        return true;
    },

    saveSelectedContact: function (target)
    {
        if (isValidString(this.partner.errorMessage))
        {
            this.changeErrorMessage(LANGUAGE.getString('chooseContact'));
            return;
        }

        if (this.saveSelectedContactFunction)
        {
            this.saveSelectedContactFunction(target, this.partner);

            this.hide();
        }
    },

    focus: function ()
    {
        this.searchPanel.focus();
    }
});

Ext.define('SearchContactWindowForPartner',
{
    extend: 'SearchContactWindow',

    initComponent: function ()
    {
        this.titleText = LANGUAGE.getString("addContactToPartnerBoard", this.partnerGroup.titleText);

        this.callParent();
    },

    itemClicked: function (me, record, item, index)
    {
        if (isValid(record) && !record.data.isRealContact()) {
            this.saveButton.setDisabled(true);
            return false;
        }
        var self = this;
        var group = self.partnerGroup.group;

        var groupId = group.getId();
        var name = record.data.getName();
        var label = name;
        var position = -1;

        if (group.allNormalContacts) {
            position = group.allNormalContacts.length;
        }
        else if (group.partners) {
            position = group.partners.length;
        }

        var guid = record.data.getGUID();
        var device = '';

        if (name.indexOf(',') !== -1) {
            label = name.split(',')[0];
        }
        else {
            var parts = name.split(' ');
            parts = Ext.Array.removeAt(parts, 0);
            label = parts.join(' ');
        }

        if (isValid(record.data.getOfficePhoneNumbers())) {
            device = record.data.getOfficePhoneNumbers()[0];
        }
        else if (isValid(record.data.getMobilePhoneNumbers())) {
            device = record.data.getMobilePhoneNumbers()[0];
        }
        else if (isValid(record.data.getHomePhoneNumbers())) {
            device = record.data.getHomePhoneNumbers()[0];
        }

        this.partner = new www_caseris_de_CaesarSchema_Partner();
        this.partner.setContact(record.data);
        this.partner.setGuid(guid);
        this.partner.setName(name);
        this.partner.setSource(SOURCE_APPLICATION);
        this.partner.setPosition(position);
        this.partner.setGroupId(groupId);
        this.partner.setDevice(device);
        this.partner.setIdentifier("Dn");
        this.partner.setLabel(label);
        this.partner.setStorageId(record.data.getObjectSource());
        this.partner.setEntryId(record.data.getObjectName());
        this.partner.setWorkplace('');
        this.partner.setCompany('');
        this.partner.setAcdId(-1);

        //this.partner.setContact(new www_caseris_de_CaesarSchema_Contact());


        if (guid && isValidString(guid)) {
            this.partner.setIdentifier("Guid");
        }

        self.saveButton.setDisabled(false);
        return true;
    },

    saveSelectedContact: function (target) {
        var self = this;

        if (!target) {
            target = self;
        }

        if (!this.partner) {
            return;
        }


        for (var i = 0; i < self.partnerGroup.memberList.length; i++) {
            if ((self.partnerGroup.memberList[i].getEntryId() === self.partner.getEntryId() && isValidString(self.partner.getEntryId())) ||
                (self.partnerGroup.memberList[i].getGuid() === self.partner.getGuid() && isValidString(self.partner.getGuid()))) 
            {
                self.changeErrorMessage(LANGUAGE.getString("contactAlreadyExistsInGroup"));
                return;
            }
        }

        self.setStyle({ display: 'none' });
        
        SESSION.updatePartner(this.partner, function (result) 
        {
            saveToPartnerHistory(result, '', self.partner.getContact());

            if (result.getReturnValue().getCode() === 0) 
            {
                self.partner.setId(result.getPartnerId());

                self.partnerGroup.addToMemberList([self.partner]);

                self.partnerGroup.redrawAllTiles();

                self.close();
            }
            else
            {
                self.setStyle({ display: 'block' });
                self.changeErrorMessage(result.getReturnValue().getDescription());
            }

        }, function () 
        {
            self.setStyle({ display: 'block' });
            self.changeErrorMessage(LANGUAGE.getString("errorUpdatePartner"));
        });
    }
});