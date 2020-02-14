var WIDTH_FORM_FIELD = 250;
var WIDTH_FORM_FIELD_ZIP = 100;

Ext.define('AddressFormField',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox'
        //align: 'stretch'
    },
	
    initComponent: function ()
    {
        this.callParent(arguments);
        this.street = this.add(Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 0',
            emptyText: LANGUAGE.getString("street"),
            width: 2 * WIDTH_FORM_FIELD,
            value: this.address ? this.address.getStreet() : ""
        }));

        this.zip = Ext.create('Ext.form.field.Text',
        {
            emptyText: LANGUAGE.getString("zip"),
            width: WIDTH_FORM_FIELD_ZIP,
            value: this.address ? this.address.getZIP() : ""
        });
        this.city = Ext.create('Ext.form.field.Text',
        {
            emptyText: LANGUAGE.getString("town"),
            width: 2 * WIDTH_FORM_FIELD - WIDTH_FORM_FIELD_ZIP - 5,
            margin: '0 0 0 5',
            value: this.address ? this.address.getCity() : ""
        });
        this.add(Ext.create('Ext.Container',
        {
            margin: '5 0 0 0',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            items:
            [
                this.zip,
                this.city
            ]
        }));
        this.country = this.add(Ext.create('Ext.form.field.Text',
        {
            emptyText: LANGUAGE.getString("country"),
            margin: '5 0 5 0',
            width: 2 * WIDTH_FORM_FIELD,
            value: this.address ? this.address.getCountry() : ""
        }));
    },

    isDirty: function ()
    {
        return this.country.isDirty() || this.city.isDirty() || this.zip.isDirty() || this.street.isDirty();
    },

    updateValues: function (street, zip, city, country)
    {
        this.street.setValue(street);
        this.zip.setValue(zip);
        this.city.setValue(city);
        this.country.setValue(country);
    },

    isAddressAvailable: function ()
    {
        var addressAvailable = false;
        Ext.each([this.street, this.zip, this.city, this.country], function (textfield)
        {
            if (isValidString(textfield.getValue()))
            {
                addressAvailable = true;
            }
        });
        return addressAvailable;
    }
});



Ext.define('NewContactPanel',
{
    extend: 'Ext.Container',
    
    border: false,

    scrollable: 'vertical',
    
	initComponent: function ()
    {
        this.title = this.title || LANGUAGE.getString("newContact").toUpperCase();

        this.callParent(arguments);

        this.titleIconWhite = IMAGE_LIBRARY.getImage("newContact", 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage("newContact", 64, COLOR_TAB_ICON_NORMAL);

        this.contact = this.contact || new www_caseris_de_CaesarSchema_Contact();

        var self = this;
        this.additionalAddresses = {};
        
        this.firstNameControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getFirstName(),
            emptyText: LANGUAGE.getString("firstName"),
            listeners:
            {
                focus: function ()
                {
                    self.firstNameControl.clearInvalid();
                    self.lastNameControl.clearInvalid();
                }
            }
        });

        this.lastNameControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getLastName(),
            emptyText: LANGUAGE.getString("lastName"),
            listeners:
            {
                focus: function ()
                {
                    self.firstNameControl.clearInvalid();
                    self.lastNameControl.clearInvalid();
                }
            }
        });

        this.companyControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getCompany(),
            emptyText: LANGUAGE.getString("company")
        });

        this.commentControl = Ext.create('Ext.form.field.TextArea',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getComment(),
            emptyText: LANGUAGE.getString("comment"),
            height: 72
        });

        var officeNumber = this.contact.getFirstOfficePhoneNumber();
        var mobileNumber = this.contact.getFirstMobilePhoneNumber();

        if (isValidString(this.number))
        {
            if (new TelephoneNumber(this.number).isMobileNumber())
            {
                mobileNumber = this.number;
            }
            else
            {
                officeNumber = this.number;
            }
        }

        this.numberControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: officeNumber,
            emptyText: LANGUAGE.getString("office")
        });
        this.mobileControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: mobileNumber,
            emptyText: LANGUAGE.getString("mobile")
        });
        this.homeControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getFirstHomePhoneNumber(),
            emptyText: LANGUAGE.getString("home")
        });
        this.emailOfficeControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getEMail(),
            emptyText: LANGUAGE.getString("office")
        });
        this.emailHomeControl = Ext.create('Ext.form.field.Text',
        {
            margin: '5 0 0 5',
            width: WIDTH_FORM_FIELD,
            value: this.contact.getHomeEMail(),
            emptyText: LANGUAGE.getString("home")
        });
        
        this.fieldset1 = this.createFieldSet(LANGUAGE.getString("contact"), '0 5 0 15', false);
        this.fieldset1.add(Ext.create('Ext.Container',
        {
            margin: '5 0 5 0',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            items:
            [
                this.firstNameControl,
                this.lastNameControl
            ]
        }));
        this.fieldset1.add(this.companyControl);
        this.fieldset1.add(this.commentControl);
           

        this.fieldset2 = this.createFieldSet(LANGUAGE.getString("telephone"), '0 5 0 15', false);
        this.fieldset2.add([this.numberControl, this.mobileControl, this.homeControl]);

        this.fieldset3 = this.createFieldSet(LANGUAGE.getString("email"), '0 5 0 15', false);
        this.fieldset3.add(this.emailOfficeControl);
        this.fieldset3.add(this.emailHomeControl);

        var officeAddress;
        if (this.contact)
        {
            officeAddress = this.contact.getOfficeAddress() || this.contact.getGlobalInfoAddress()
        }
        this.officeAddressFormField = Ext.create('AddressFormField',
        {
            address: officeAddress,
            margin: '0 0 0 5'
        });
        this.homeAddressFormField = Ext.create('AddressFormField',
        {
            address: isValid(this.contact) ? this.contact.getHomeAddress() : null,
            margin: '0 0 0 5'
        });

        this.officeAddressFieldSet = this.createFieldSet(LANGUAGE.getString('officeAddress'), '0 5 0 15', !officeAddress);
        this.officeAddressFieldSet.add(this.officeAddressFormField);

        this.homeAddressFieldSet = this.createFieldSet(LANGUAGE.getString('homeAddress'), '0 5 0 15', true);
        this.homeAddressFieldSet.add(this.homeAddressFormField);
		
        this.add(
        [
            this.fieldset1,
            this.fieldset2,
            this.fieldset3,
            this.officeAddressFieldSet,
            this.homeAddressFieldSet
        ]);

        this.saveButton = Ext.create('RoundThinButton',
        {
            margin: '15 0 0 15',
            iconName: 'check',
            text: LANGUAGE.getString('save'),
            listeners:
            {
                click: function (event)
                {
                    self.onAddContact();
                }
            }
        });

        this.add(Ext.create('Ext.Container',
            {
                layout: 'hbox',
                items: [this.saveButton, this.cancelButton]
            }));
        
        SESSION.addListener(this);
	},

	destroy: function ()
	{
        SESSION.removeListener(this);

        this.callParent();
	},

	createFieldSet: function (title, margin, collapsed)
    {
        return Ext.create('CollapsibleContainerWithHeader',
        {
            titleText: title,
            margin: margin,
            drawLine: false,
            maxWidth: 505,
            collapsed: collapsed
        });
	},

    onAddContact: function ()
    {    
        this.syncUIToContact(this.contact);

        if (this.checkContact(this.contact))
        {
            this.save();
        }
    },

    syncUIToContact: function (contact)
    {
        contact.setFirstName(this.trim(this.firstNameControl.getValue()));
        contact.setLastName(this.trim(this.lastNameControl.getValue()));
        contact.setComment(this.trim(this.commentControl.getValue()));
        contact.setCompany(this.trim(this.companyControl.getValue()));
        contact.setEMail(this.trim(this.emailOfficeControl.getValue()));
        contact.setHomeEMail(this.trim(this.emailHomeControl.getValue()));

        contact.setOfficeStreet(this.trim(this.officeAddressFormField.street.getValue()));
        contact.setOfficeZIP(this.trim(this.officeAddressFormField.zip.getValue()));
        contact.setOfficeCity(this.trim(this.officeAddressFormField.city.getValue()));
        contact.setOfficeCountry(this.trim(this.officeAddressFormField.country.getValue()));

        contact.setHomeStreet(this.trim(this.homeAddressFormField.street.getValue()));
        contact.setHomeZIP(this.trim(this.homeAddressFormField.zip.getValue()));
        contact.setHomeCity(this.trim(this.homeAddressFormField.city.getValue()));
        contact.setHomeCountry(this.trim(this.homeAddressFormField.country.getValue()));

        var officePhoneNumbers = [];
        var officePhone = this.trim(this.numberControl.getValue());
        if (isValidString(officePhone)) {
            officePhoneNumbers.push(officePhone);
        }
        contact.setOfficePhoneNumbers(officePhoneNumbers);

        var mobile = [];
        var mobilePhone = this.trim(this.mobileControl.getValue());
        if (isValidString(mobilePhone)) {
            mobile.push(mobilePhone);
        }
        contact.setMobilePhoneNumbers(mobile);

        var homePhone = [];
        var homePhoneNumber = this.trim(this.homeControl.getValue());
        if (isValidString(homePhoneNumber)) {
            homePhone.push(homePhoneNumber);
        }
        contact.setHomePhoneNumbers(homePhone);
    },

    trim: function (str)
    {
        return str.trim();
    },

    save: function ()
    {
        SESSION.addBuddy(this.contact);
    },

    onAddBuddySuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.contact = response.getContact();
            this.close();
        }
        else
        {
            this.handleError(response);
        }
    },

    handleError: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorContactExistsWithSameEMail.value)
        {
            this.contact.setEMail("");
            
            this.showErrorMessage(response.getReturnValue().getDescription(), this.emailOfficeControl);

            this.emailOfficeControl.focus();
        }
        else if (response.getReturnValue().getCode() === ProxyError.ErrorContactExistsWithSameNumber.value)
        {
            this.contact.setOfficePhoneNumbers(new schemas_microsoft_com_2003_10_Serialization_Arrays_ArrayOfstring());

            this.showErrorMessage(response.getReturnValue().getDescription(), this.numberControl);

            this.numberControl.focus();
        }
        else {
            this.showErrorMessage(response.getReturnValue().getDescription(), this.saveButton);
        }
    },

    checkContact: function (newContact)
    {
        if (!isValid(newContact))
        {
            return false;
        }
        var result = true;
        var self = this;
        var numberControls = [this.numberControl, this.mobileControl];
        Ext.each(numberControls, function (numberControl)
        {
            var number = numberControl.getValue();
            if (isValidString(number) && !isPhoneNumber(number))
            {
                self.showErrorMessage(LANGUAGE.getString("noValidPhoneNumber", number), numberControl);
                numberControl.focus();
                result = false;
            }
        });
        if (result === false)
        {
            return false;
        }
        
        if (!isValidString(newContact.getFirstName()) && !isValidString(newContact.getLastName()))
        {
            this.drawRedBorder(this.lastNameControl);
            this.showErrorMessage(LANGUAGE.getString("noNamePart"), this.firstNameControl);
            this.firstNameControl.focus();
            return false;
        }
        if (isValidString(newContact.getEMail()) && !isValidEmailAddress(newContact.getEMail()))
        {
            this.showErrorMessage(LANGUAGE.getString("noValidEmailAddress", newContact.getEMail()), this.emailOfficeControl);
            this.emailOfficeControl.focus();
            return false;
        }
        if (isValidString(newContact.getHomeEMail()) && !isValidEmailAddress(newContact.getHomeEMail())) {
            this.showErrorMessage(LANGUAGE.getString("noValidEmailAddress", newContact.getHomeEMail()), this.emailHomeControl);
            this.emailHomeControl.focus();
            return false;
        }
        return true;
    },

    drawRedBorder: function (field)
    {
        if (!isValid(field))
        {
            return;
        }

        field.msgTarget = 'none';
        if (field.setActiveError)
        {
            field.setActiveError("");
        }
    },

    showErrorMessage: function (errorText, field)
    {
        this.drawRedBorder(field);

        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '10',
            errorMessageText: errorText,
            errorType: ErrorType.Error,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    },

    reset: function ()
    {
        this.firstNameControl.setValue("");
        this.lastNameControl.setValue("");
        this.companyControl.setValue("");
        this.commentControl.setValue("");

        this.numberControl.setValue("");
        this.mobileControl.setValue("");
        this.homeControl.setValue("");

        this.emailOfficeControl.setValue("");
        this.emailHomeControl.setValue("");

        this.officeAddressFormField.updateValues("", "", "", "");
        this.homeAddressFormField.updateValues("", "", "", "");
    },

    setContact: function (contact)
    {
        this.contact = contact || new www_caseris_de_CaesarSchema_Contact();
        this.syncContactToUI(this.contact);
    },

    syncContactToUI: function (contact)
    {
        if (!isValid(contact))
        {
            return;
        }

        this.firstNameControl.setValue(contact.getFirstName());
        this.lastNameControl.setValue(contact.getLastName());
        this.companyControl.setValue(contact.getCompany());
        this.commentControl.setValue(contact.getComment());

        this.numberControl.setValue(contact.getFirstOfficePhoneNumber());
        this.mobileControl.setValue(contact.getFirstMobilePhoneNumber());
        this.homeControl.setValue(contact.getFirstHomePhoneNumber());

        this.emailOfficeControl.setValue(contact[CONTACT_EMAIL]);
        this.emailHomeControl.setValue(contact.getHomeEMail());

        this.officeAddressFormField.updateValues(contact.getOfficeStreet(), contact.getOfficeZIP(), contact.getOfficeCity(), contact.getOfficeCountry());
        this.homeAddressFormField.updateValues(contact.getHomeStreet(), contact.getHomeZIP(), contact.getHomeCity(), contact.getHomeCountry());
    },

    focus: function ()
    {
        this.firstNameControl.focus();
    },

    isDirty: function ()
    {
        var fields =
        [
            this.firstNameControl,
            this.lastNameControl,
            this.companyControl,
            this.commentControl,
            this.numberControl,
            this.mobileControl,
            this.homeControl,
            this.emailOfficeControl,
            this.emailHomeControl,
            this.officeAddressFormField,
            this.homeAddressFormField
        ];

        var result = false;
        Ext.each(fields, function (field)
        {
            if (field.isDirty())
            {
                result = true;
            }
        });
        return result;
    },
    
    close: function ()
    {
        this.parent.removeItem(this);
    }
});

Ext.define('EditContactPanel',
{
    extend: 'NewContactPanel',

    initComponent: function ()
    {
        this.callParent();
        
        this.titleIconWhite = IMAGE_LIBRARY.getImage("edit", 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage("edit", 64, COLOR_TAB_ICON_NORMAL);

        if (isValid(this.contact))
        {
            this.setContact(this.contact);
        }

        var self = this;
        this.on('beforeclose', function ()
        {
            if (!self.isDirty() || self.ignoreCloseEvent)
            {
                return true;
            }
                
            self.parent.setActiveTab(self);

            self.insert(0, Ext.create('ConfirmationComponent',
            {
                yesCallback: function ()
                {
                    self.close();
                },
                noCallback: Ext.emptyFn,
                errorMessageText: LANGUAGE.getString("discardChanges"),
                borderWidth: 1,
                margin: '10'
            }));
            
            return false;  //cancels the close event
        });
    },

    setContact: function (contact)
    {
        if (isValid(contact))
        {
            this.contact = contact;
        }
        this.syncContactToUI(this.contact);

        this.title = this.contact.getDisplayName().toUpperCase();
    },

    save: function ()
    {
        SESSION.editBuddy(this.contact);
    },

    onEditBuddySuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.setContact(response.getContact());
            this.ignoreCloseEvent = true;
            this.close();
            this.ignoreCloseEvent = false;
        }
        else
        {
            this.handleError(response);
        }
    },

    onEditBuddyException: function ()
    {
        this.showErrorMessage(LANGUAGE.getString("errorEditBuddy"), this.saveButton);
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && this.contact.equals(panel.contact);
    },

    onRemoveBuddySuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0 && this.contact.equals(contact))
        {
            this.close();
        }
    }
});