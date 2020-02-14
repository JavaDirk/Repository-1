/**
 * Created by jebing on 19.12.2014.
 */

var CONTACT_GROUP_ENTRY = 'groupEntry';
var CONTACT_WAIT_CURSOR = 'waitMessage';
var CONTACT_ERROR_MESSAGE = "errorMessage";
var CONTACT_NUMBER_HITS = "numberHits";

Ext.define('Contact',
{
    extend: 'Ext.data.Model',
    fields:
    [
        { name: 'FirstName',	type: 'string'},
        { name: 'LastName',	    type: 'string'},
        { name: 'ImageUrl',		type: 'string'},
        { name: 'GUID',		    type: 'string'},
        { name: 'Department',   type: 'string'},
        { name: 'Company',      type: 'string'},
        { name: 'OfficeCity',   type: 'string'},
        { name: 'OfficeStreet', type: 'string'},
        { name: 'PresenceText', type: 'string'},
        { name: 'ObjectName',   type: 'string'},
        { name: 'ObjectSource', type: 'string'},
        { name: CONTACT_GROUP_ENTRY, type: 'boolean' },
        { name: CONTACT_WAIT_CURSOR, type: 'boolean' },
        { name: CONTACT_ERROR_MESSAGE, type: 'string' },
        { name: CONTACT_NUMBER_HITS, type: 'string' }
    ]
});

getContactTemplateString = function (height, padding, textMargin)
{
    height = height || 70;
    padding = padding || VIEWS_PADDING;
    textMargin = textMargin || "5px 0 0 15px";

    return '<div class="contact" style="height:' + height + 'px;padding:' + padding + ';display:flex;border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';">' +
                            '<div class="' + CLASS_CONTACT_PHOTO + '" style="display:flex;align-self:center;height:' + PhotoSizes.Default.height + 'px;width:' + PhotoSizes.Default.width + 'px;"></div>' +
                            '<div class="hideForOverlayButtons" style="flex:1;flex-direction: column;margin:' + textMargin + '">' +
                                '<div class="eclipsedText" style="{[this.getStyleForFirstRow(values)]}">{[Ext.String.htmlEncode(this.getDataForFirstRow(values))]}</div>' +
                                '<div class="eclipsedText" style="{[this.getStyleForSecondRow(values)]}">{[Ext.String.htmlEncode(this.getDataForSecondRow(values))]}</div>' +
                                '<div class="eclipsedText" style="{[this.getStyleForThirdRow(values)]}">{[Ext.String.htmlEncode(this.getDataForThirdRow(values))]}</div>' +
                            '</div>' +
                            '<tpl if="isValidString(values.getLineStateImage())">' +
                                '<div class="icon hideForOverlayButtons" style="width:16px;height:16px;background-size:16px;margin:5px 5px 0 0;background-image:url({[values.getLineStateImage()]})" data-tooltip="' + LANGUAGE.getString("lineStateOfPartnerOutOfService") + '"></div>' +
                            '</tpl>' +
                            '<tpl if="isValidString(values.getMobileAvailableImage())">' +
                                '<div class="icon hideForOverlayButtons" style="width:16px;height:16px;background-size:16px;margin:5px 5px 0 0;background-image:url({[values.getMobileAvailableImage()]})" data-tooltip="{[Ext.String.htmlEncode(this.getMobilAvailableTitle())]}"></div>' +
                            '</tpl>' +
                            '<div class="showForOverlayButtons" style="align-self:center;margin-left:5px;display:none;flex:1"></div>' +
                        '</div>';
};

Ext.define('ContactListPanel',
{
    extend: 'BaseViewPanel',

    itemSelector: 'div.contact',
    border: false,
    deferEmptyText: false,
    selectedItemCls: 'selectedEntry',
    overlayButtons: true,
    openContactOnSelect: true,
    searchForNumber: true, //wenn jemand ne Nummer eingibt: soll danach gesucht werden oder sofort lostelefoniert werden?
    ctiAction: null,

    plugins:
    [
        {
            ptype: 'ContactViewWithPhotos'
        }
    ],

    initComponent: function ()
    {
        var self = this;
        this.tpl = new Ext.XTemplate(self.getTemplateString(),
        {
            getDataForFirstRow: function (contact)
            {
                return self.getDataForFirstRow(contact);
            },
            getMobilAvailableTitle: function ()
            {
                return LANGUAGE.getString("mobileAvailable");
            },
            getDataForSecondRow: function (contact)
            {
                return self.getDataForSecondRow(contact);
            },
            getDataForThirdRow: function (contact)
            {
                return self.getDataForThirdRow(contact);
            },

            getStyleForFirstRow: function (contact)
            {
                return self.getStyleForFirstRow(contact);
            },
            getStyleForSecondRow: function (contact)
            {
                return self.getStyleForSecondRow(contact);
            },
            getStyleForThirdRow: function (contact)
            {
                return self.getStyleForThirdRow(contact);
            }
        });

        this.callParent();

        this.setStore(Ext.create('Ext.data.Store',
        {
            model: 'Contact',
            sorters: this.getSorters()
        }));

        GLOBAL_EVENT_QUEUE.addEventListener(this);

        this.on('boxready', function (image) {
            image.tooltip = Ext.create('Ext.tip.ToolTip',
            {
                target: self.el,
                delegate: self.itemSelector + " .icon",
                showDelay: 1000,
                //hideDelay: 0,
                autoHide: true,
                trackMouse: false,

                listeners:
                {
                    beforeshow: function (tip)
                    {
                        tip.update(tip.triggerElement.dataset.tooltip);
                    }
                }
            });
        }, this);

        this.on('destroy', function (image)
        {
            if (image.tooltip)
            {
                image.tooltip.destroy();
            }
        }, this);
    },

    destroy: function ()
    {
        this.callParent();
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
    },

    onGlobalEvent_ConversationTabFocus: function (panel)
    {
        var self = this;
        if (isValid(panel, "contact") && getClassName(panel) === "ContactPanel")
        {
            this.getStore().each(function (record, index) 
            {
                if (record.data.equals(panel.contact))
                {
                    self.getSelectionModel().select(index);
                }
            });
        }
    },

    getTemplateString: function ()
    {
        return '<tpl for=".">' + getContactTemplateString() + '</tpl>';
    },
    
    getDataForFirstRow: function (contact)
    {
        if (contact.isGlobalInfo())
        {
            var possibleValues = this.getPossibleValuesForGlobalInfoContact(contact);
            return getFirstValidString(possibleValues);
        }
        var name = contact.getFullName(true);
        if (isValidString(name))
        {
            return name;
        }
            
        return contact.number || ""; //TODO: Hier geht es um CompanyContact, wenn burhan denen eine Nummer gegeben hat
    },
    
    getDataForSecondRow: function (contact)
    {
        if (contact.isGlobalInfo())
        {
            var possibleValues = this.getPossibleValuesForGlobalInfoContact(contact);
            return getSecondValidString(possibleValues);
        }
        if (contact.isExternalContact())
        {
            var dataForFirstRow = this.getDataForFirstRow(contact);

            if (isValidString(contact.getCompany()) && dataForFirstRow !== contact.getCompany())
            {
                return contact.getCompany();
            }
            var address = contact.getAddress();
            if (isValid(address))
            {
                return address.getFirstLine();
            }
            return "";
        }
        
        return contact.getPresenceStateText();
    },

    getDataForThirdRow: function (contact)
    {
        if (contact.isGlobalInfo())
        {
            var possibleValues = this.getPossibleValuesForGlobalInfoContact(contact);
            return getThirdValidString(possibleValues);
        }
        if (contact.isExternalContact())
        {
            var address = contact.getAddress();
            if (isValid(address))
            {
                return address.getSecondLine();
            }
        }
        return '';
    },

    getPossibleValuesForGlobalInfoContact: function (contact)
    {
        return [contact.getFirstOfficePhoneNumber(), contact.getFirstMobilePhoneNumber(), contact.getCity(), contact.getCountry()];
    },

    getStyleForFirstRow: function (contact)
    {
        return TEMPLATE_STYLE_TITLE();
    },
    getStyleForSecondRow: function (contact)
    {
        return TEMPLATE_STYLE_TEXT(this.getDataForSecondRow(contact), '0');
    },
    getStyleForThirdRow: function (contact)
    {
        return TEMPLATE_STYLE_TEXT(this.getDataForThirdRow(contact), '0');
    },

    getSorters: function ()
    {
        return [
            {
                sorterFn: compareContactByDisplayNameWithLastNameFirst,
                direction: 'ASC'
            }
        ];
    },

    getWatermarkImage: function ()
    {
        return IMAGE_LIBRARY.getImage("search", 64, COLOR_WATERMARK);
    },
    
    startSearch: function (toSearchFor, onSuccessfullSearchCallback, onSuccessfullCTIAction)
    {   
        if (isValidString(toSearchFor))
        {
            if (isValid(this.ctiAction) && isPhoneNumber(toSearchFor) && !this.searchForNumber)
            {
                this.ctiAction.number = toSearchFor;
                if (onSuccessfullCTIAction)
                {
                    this.ctiAction.addCallbackForSuccessfullCTIAction(onSuccessfullCTIAction);
                }
                if (onSuccessfullSearchCallback)
                {
                    this.ctiAction.addCallbackForSuccessfullSearch(onSuccessfullSearchCallback);
                }
                
                this.ctiAction.addressBook = this.addressBook;
                this.ctiAction.run();
                return false;
            }

            this.search(toSearchFor, onSuccessfullSearchCallback, onSuccessfullCTIAction);
        }
        else
        {
            if (this.rendered)
            {
                this.setEmptyText('');
            }
        }
        return true;
    },
    
    search: function (toSearchFor, onSuccessfullSearchCallback, onSuccessfullCTIAction)
    {
        this.setEmptyText('');

        var self = this;
        this.show();
        this.results = {};
        this.addressBooks = CURRENT_STATE_DATA_CONNECT.getAddressBooksForName(this.addressBook);

        var onSuccess = function (response, searchString, addressBook)
        {
            if (self.destroyed) //falls eine Suche lange dauert und der Benutzer den Dialog währenddessen schließt
            {
                return;
            }

            Ext.each(response.getContacts(), function (contact)
            {
                contact.addressBook = addressBook;
            }, this);
            
            if (response.getReturnValue().getCode() === 0)
            {
                self.onSuccessfullSearch(toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIAction, response);
            }
            else if (response.getReturnValue().getCode() === ProxyError.ErrorTooManyHits.value)
            {
                self.onUnsuccessfullSearch(toSearchFor, addressBook, LANGUAGE.getString("tooManyHits"), response, onSuccessfullSearchCallback);
            }
            else {
                self.onUnsuccessfullSearch(toSearchFor, addressBook, response.getReturnValue().getDescription(), response, onSuccessfullSearchCallback);
            }
        };

        var onException = DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorSearch"), function (nameOrNumber, addressBook)
        {
            if (self.destroyed) //falls eine Suche lange dauert und der BEnutzer den Dialog währenddessen schließt
            {
                return;
            }
            self.onUnsuccessfullSearch(toSearchFor, addressBook, "");
        }, self);

        if (isPhoneNumber(toSearchFor))
        {
            if (Ext.isEmpty(this.addressBooks))
            {
                this.showPseudoContactForNumber(toSearchFor);
                return;
            }
            Ext.each(this.addressBooks, function (addressBook, index)
            {
                self.results[addressBook.getName()] = null;

                SESSION.resolveNumber(toSearchFor, addressBook.getName(), function (response, name)
                {
                    onSuccess(response, name, addressBook);
                }, function ()
                {
                    onException(name, addressBook);
                });
            });
        }
        else
        {
            var matchFlag = TIMIO_SETTINGS.getMatchFlag();
            var matchType = TIMIO_SETTINGS.getMatchType();

            Ext.each(this.addressBooks, function (addressBook, index)
            {
                self.results[addressBook.getName()] = null;
                SESSION.resolveName(toSearchFor, addressBook.getName(), matchFlag, matchType, function (response, name)
                {
                    onSuccess(response, name, addressBook);
                }, function ()
                {
                    onException(name, addressBook);
                });
            });
        }
    },

    onSuccessfullSearch: function (toSearchFor, addressBook, onSuccessfullSearchCallback, onSuccessfullCTIAction, response)
    {
        if (isValid(onSuccessfullSearchCallback))
        {
            onSuccessfullSearchCallback(response, addressBook);
        }

        var contacts = response.getContacts() || [];
        this.setEmptyText(contacts.length > 0 ? "" : this.getPlaceHolderForSearch(toSearchFor));
        hideLoadingMask(this);
        
        if (contacts.length === 1 && contacts[0].isGlobalInfo())
        {
            this.globalInfoContact = contacts[0];
            
            if (new TelephoneNumber(toSearchFor).isMobileNumber())
            {
                this.globalInfoContact.setMobilePhoneNumbers([toSearchFor]);
            }
            else
            {
                this.globalInfoContact.setOfficePhoneNumbers([toSearchFor]);
            }

            this.getStore().add(this.globalInfoContact);
        }
        else
        {
            this.showContacts(contacts);
        }
    },

    onUnsuccessfullSearch: function (toSearchFor, addressBook, errorText, response)
    {
        //this.setEmptyText(LANGUAGE.getString("numberHits", errorText));
        this.setEmptyText(errorText);
        hideLoadingMask(this);
    },

    isPseudoContactInStore: function ()
    {
        for (var i = this.getStore().getCount() - 1; i >= 0; --i) {
            var record = this.getStore().getAt(i);
            if (record.data.pseudoContact) {
                return true;
            }
        }
        return false;
    },

    showPseudoContactForNumber: function (toSearchFor)
    {
        if (this.isPseudoContactInStore())
        {
            return;
        }
        var pseudoContact = new www_caseris_de_CaesarSchema_Contact();
        pseudoContact.pseudoContact = true;
        pseudoContact.setLastName(toSearchFor);
        
        pseudoContact.setOfficePhoneNumbers([toSearchFor]);

        this.showContacts([pseudoContact]);
        hideLoadingMask(this);
    },

    deletePseudoContact: function ()
    {
        for (var i = this.getStore().getCount() - 1; i >= 0; --i)
        {
            var record = this.getStore().getAt(i);
            if (record.data.pseudoContact)
            {
                this.getStore().removeAt(i);
            }
        }
    },

    getPlaceHolderForSearch: function (searchString)
    {
        return LANGUAGE.getString('noHitsFor', Ext.String.htmlEncode(searchString));
    },

    showContacts: function (contacts)
    {
        //this.clearContacts();

        this.getStore().add(contacts);

        this.focusAndSelectFirstContact();
    },

    focusAndSelectFirstContact: function ()
    {
        var index = this.getIndexOfFirstRealRecord();
        if (index === -1)
        {
            return;
        }
        
        Ext.asap(function ()
        {
            this.getSelectionModel().deselectAll();
            this.getSelectionModel().select(index);
        }, this);

        Ext.asap(function () 
        {
            this.focus();
            this.getNavigationModel().setPosition(index);
        }, this);
    },

    clearContacts: function ()
    {
        var store = this.getStore();
        if (isValid(store))
        {
            Ext.each(this.all.elements, function (item)
            {
                if (isValid(item, "overlayButtons.buttons"))
                {
                    Ext.each(item.overlayButtons.buttons, function (button)
                    {
                        button.destroy();
                    });
                }
            });
            store.removeAll();
            this.setEmptyText("");
            this.refresh();
        }
    },

    getActions: function (record, item)
    {
        var actions = new ContactActionsForContactList(record.data);
        actions.setCallbackForMakeCallSuccess((response, number, contact) =>
        {
            this.clearSearch();
        });
        return actions;
    },
    
    getSelectedContact: function ()
    {
        var sm = this.getSelectionModel();
        return sm.getSelection()[0];
    },

    isEmpty: function () {
        return this.getStore().getCount() === 0;
    },

    setEmptyText: function (newText)
    {
        if (isValidString(newText))
        {
            this.emptyText = '<div class="errorMessage">' + newText + '</div>';
        }
        else
        {
            this.emptyText = '';
        }

        this.applyEmptyText();
    },

    onEscape: function (view, record, item, index, event, opts)
    {
        this.clearSearch();
    },

    clearSearch: function ()
    {

    }
});
