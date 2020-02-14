const MAX_WIDTH_LABEL = 350;

Ext.define('BusinessCardPanel_Base',
{
    extend: 'Ext.Component',

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            this.el.on('click', function (event, node)
            {
                if (SESSION.isTelephonyAllowed())
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(self.contact, node.innerText);
                }
            }, null, { delegate: '.telephoneNumber' });

            this.el.on('click', function (event, node)
            {
                self.contact.sendEMail(node.innerText, self.contact);
            }, null, { delegate: '.emailAddress' });

            this.el.on('click', function (event, node)
            {
                self.onMap(node, self.contact);
            }, null, { delegate: '.address' });

            this.el.on('click', function (event, node)
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(self.contact);
                if (isValid(self, "parent.hideTooltip"))
                {
                    self.parent.hideTooltip();
                }
            }, null, { delegate: '.name' });
        }, this);
    },

    onMap: function ()
    {

    }
});

Ext.define('BusinessCardPanel_NameAndPhoto',
{
    extend: 'BusinessCardPanel_Base',

    margin: '5 0 0 5',

    groupName: '',

    titleSize: FONT_SIZE_TITLE,
    textSize: FONT_SIZE_SUBTITLE,

    contact: null,
    addressInfo: null,

    layout: 'hbox',

    cls: 'selectable',

    initComponent: function ()
    {
        this.callParent();

        this.createBusinessCard();

        this.on('boxready', function ()
        {
            this.createPhoto();
        }, this);
    },

    createPhoto: function ()
    {
        if (this.photo)
        {
            this.photo.destroy();
        }
        if (!this.el)
        {
            return;
        }
        var photoElement = this.el.down('.' + CLASS_CONTACT_PHOTO);
        this.photo = new Photo({
            size: this.getPhotoSize(),
            contact: this.getContact(),
            avatarImageName: this.getAvatarImageName(),
            avatarColor: this.getAvatarColor(),
            avatarImageSize: 64,
            borderColor: COLOR_DARK_AVATAR,
            renderTo: photoElement
        });
    },

    destroy: function ()
    {
        if (this.photo)
        {
            this.photo.destroy();
        }
        this.callParent();
    },

    getContact: function ()
    {
        var contact = this.contact;
        if (!isValid(contact) && isValid(this.addressInfo))
        {
            contact = new www_caseris_de_CaesarSchema_Contact();
            contact.convertFromCTIContact(this.addressInfo);
        }
        return contact;
    },

    getAvatarImageName: function ()
    {
        var number = isValid(this.addressInfo) ? this.addressInfo.getNumber() : "";

        var contact = this.contact;
        if (!contact && this.journalEntry)
        {
            contact = this.journalEntry.getContactForPhoto();
        }
        return getImageNameForNumber(contact, number, "phone_small");
    },

    getAvatarColor: function ()
    {
        if (isValid(this.contact))
        {
            return null;
        }
        
        return NEW_GREY;
    },

    getPhotoSize: function ()
    {
        return PhotoSizes.Big;
    },

    createBusinessCard: function ()
    {
        var photoSize = this.getPhotoSize();
        var contact = this.getContact();
        var htmlString = '<div style="display:flex;flex-direction:row">' +
            '<div class="' + CLASS_CONTACT_PHOTO + '" style="width:' + photoSize.width + 'px;height:' + photoSize.height + 'px;margin-right:' + MARGIN_BETWEEN_PHOTO_AND_NAME + 'px"></div>' +    
                            this.createHtmlStringForContact(contact) +
                        '</div>';
        this.setHtml(htmlString);
    },

    createHtmlStringForContact: function (contact)
    {
        var usedInfos = new Map(); //damit nicht doppelte Sachen angezeigt werden (z.B. wenn in Name und in Company dasselbe drin steht), werden hier die Sachen gespeichert, die schon angezeigt werden

        var htmlStringForNameRow = '<div style="display:flex;flex-direction:row">';
        if (isPhoneNumber(this.getName()))
        {
            htmlStringForNameRow += this.createNumberLink(this.getName(), FONT_SIZE_NAME, "0 0 0 0");
        }
        else
        {
            htmlStringForNameRow += this.createLabel(Ext.String.htmlEncode(this.getName()), FONT_SIZE_NAME, '0 0 0 0', COLOR_NAME, 500, 'name', 'cursor:pointer', LANGUAGE.getString('openContact'));
        }
        
        if (isValid(this.contact) && isValidString(this.contact.getMobileAvailableImage()))
        {
            htmlStringForNameRow += this.createImage(this.contact.getMobileAvailableImage(), '0 5px', LANGUAGE.getString('mobileAvailable'));
        }
        if (isValid(this.contact) && !this.contact.isLineStateOk())
        {
            htmlStringForNameRow += this.createImage(this.contact.getLineStateImage(), '0 10px', LANGUAGE.getString('lineStateOfPartnerOutOfService'));
        }
        htmlStringForNameRow += '</div>';

        this.addToUsedInfos(usedInfos, this.getName(), htmlStringForNameRow);

        if (isValidString(this.groupName))
        {
            var htmlStringForGroup = '<div style="display:flex;flex-direction:row">';
            htmlStringForGroup += this.createImage(IMAGE_LIBRARY.getImage("headset2", 64, DARK_GREY), '0 5px 0 0');
            htmlStringForGroup += this.createLabel(Ext.String.htmlEncode(this.groupName));
            htmlStringForGroup += '</div>';

            this.addToUsedInfos(usedInfos, this.groupName, htmlStringForGroup);
        }
        else
        {
            if (this.contact && this.contact.isCompanyContact())
            {
                this.addToUsedInfos(usedInfos, this.contact.getCompany(), this.createCompanyLink(this.contact.getCompany(), "5 0 0 0"));
            }
            else if (this.contact && this.contact.isGlobalInfo())
            {
                var cityOrCountry = getFirstValidString([this.contact.getCity(), this.contact.getCountry()]);
                if (isValid(cityOrCountry))
                {
                    this.addToUsedInfos(usedInfos, cityOrCountry, this.createLabel(cityOrCountry, this.textSize, "5 0 0 0"));
                }
            }
            else
            {
                var added = false;
                if (isValidString(this.getDepartment()))
                {
                    this.addToUsedInfos(usedInfos, this.getDepartment(), this.createLabel(this.getDepartment(), this.textSize, "0 0 2 0"));
                    added = true;
                }
                if (isValidString(this.getCompany()))
                {
                    this.addToUsedInfos(usedInfos, this.getCompany(), this.createCompanyLink(this.getCompany()));
                    added = true;
                }
                if (isValid(this.addressInfo) && !this.isInfoAlreadyUsed(usedInfos, this.addressInfo.getNumber()))
                {
                    this.addToUsedInfos(usedInfos, this.addressInfo.getNumber(), this.createNumberLink(this.addressInfo.getNumber(), this.textSize, "5 0 0 0"));
                    added = true;
                }
                if (!added)
                {
                    var numbers = this.getNumbers();
                    if (Ext.isEmpty(numbers))
                    {
                        var emailAddress = this.getEMail();
                        if (isValidString(emailAddress))
                        {
                            this.addToUsedInfos(usedInfos, emailAddress, this.createEmailLink(emailAddress, "5 0 0 0"));
                        }
                    }
                    else
                    {
                        Ext.each(numbers, function (number)
                        {
                            if (isValidString(number))
                            {
                                this.addToUsedInfos(usedInfos, number, this.createNumberLink(number, this.textSize, "5 0 0 0"));
                            }
                        }, this);
                    }
                }
            }
        }
        var htmlString = '<div style="display:flex;flex-direction:column">';
        usedInfos.forEach(function(value, key)
        {
            htmlString += value;
        });
        htmlString += '</div>';
        return htmlString;
    },

    addToUsedInfos: function (usedInfos, info, html)
    {
        if (usedInfos.has(info))
        {
            return;
        }
        usedInfos.set(info, html);
    },

    isInfoAlreadyUsed: function (infos, newInfo)
    {
        if (isValidString(newInfo))
        {
            return Ext.Array.contains(infos, newInfo);
        }
        return true;
    },

    setContact: function (contact)
    {
        if (contact)
        {
            this.contact = contact;

            this.createBusinessCard();

            Ext.asap(() =>
            {
                this.createPhoto();
            }, this);
        }
    },

    createLabel: function (text, fontSize, margin, color, fontWeight, cls, additionalStyle, title) 
    {
        title = title || '';
        additionalStyle = additionalStyle || "";
        cls = cls || "";
        color = color || COLOR_SUBTITLE;
        return '<div title="' + title + '" class="' + cls + '" style="' + additionalStyle + ';max-width:' + MAX_WIDTH_LABEL + 'px;margin:' + margin + ';font-size:' + fontSize + 'px;color:' + color + ';font-weight:' + fontWeight + '">' + Ext.String.htmlEncode(text) + '</div>';        
    },

    createCompanyLink: function (company, margin)
    {
        var onclick = "window.open('" + window.location.protocol + "//www.google.com/#q=" + encodeURIComponent(company) + "', '_blank')";
        return '<div onclick="' + onclick + '" class="companyLink" style="margin:' + margin + ';cursor:pointer;color:' + COLOR_MAIN_2 + ';font-size:' + this.textSize + 'px;" title="' + LANGUAGE.getString('searchForCompany', company) + '">' + Ext.String.htmlEncode(company) + '</div>';
    },

    createEmailLink: function (emailAddress, margin)
    {
        return this.createLink(emailAddress, this.textSize, margin, 'emailAddress', LANGUAGE.getString("writeEMailTo", emailAddress));
    },

    createNumberLink: function (number, textSize, margin)
    {
        return this.createLink(number, textSize, margin, 'telephoneNumber', LANGUAGE.getString("callNumber", number));
    },
    
    createLink: function (text, fontSize, margin, className, tooltip) 
    {
        return '<div class="link ' + className + '" style="max-width:' + MAX_WIDTH_LABEL + 'px;margin:' + margin + ';font-size:' + fontSize + 'px;color:' + COLOR_MAIN_2 + ';" title="' + tooltip + '">' + text + '</div>';
    },

    createImage: function (src, margin, tooltip)
    {
        return '<img style="margin:' + margin + ';align-self:center" width="16px" height="16px" src="' + src + '" title="'+ tooltip + '"></img>';
    },

    getName: function ()
    {
        var possibleValues = [];
        possibleValues.push(this.getAttributeValue("getDisplayName"));
        possibleValues.push(this.getAttributeValue("getName"));
        possibleValues.push(this.getAttributeValue("getNumber"));
        possibleValues.push(this.getCompany());
        if (isValid(this.contact, "number"))
        {
            possibleValues.push(this.contact.number);
        }
        if (this.contact && !Ext.isEmpty(this.contact.getAllNumbers()))
        {
            possibleValues.push(this.contact.getAllNumbers()[0]);
        }
        possibleValues.push(LANGUAGE.getString("suppressedNumber"));
        return getFirstValidString(possibleValues);
    },

    getNumbers: function ()
    {
        var numbers = [];
        if (isValid(this.contact))
        {
            numbers = this.contact.getAllNumbers();
        }
        if (isValid(this.addressInfo) && Ext.isEmpty(numbers))
        {
            numbers.push(this.addressInfo.getNumber());
        }
        return numbers;
    },

    getCompany: function ()
    {
        return this.getAttributeValue("getCompany");
    },

    getDepartment: function ()
    {
        return this.getAttributeValue("getDepartment");
    },

    getEMail: function ()
    {
        return this.getAttributeValue("getEMail");
    },

    getAttributeValue: function (methodName)
    {
        var possibleValues = [];
        if (isValid(this.contact, methodName))
        {
            possibleValues.push(this.contact[methodName]());
        }
        if (isValid(this.addressInfo, methodName))
        {
            possibleValues.push(this.addressInfo[methodName]());
        }
        return getFirstValidString(possibleValues);
    }
});

Ext.define('BusinessCardPanel_BaseForDetails',
{
    extend: 'BusinessCardPanel_Base',

    initComponent: function ()
    {
        this.contact = this.contact || new www_caseris_de_CaesarSchema_Contact();
        this.html = this.createHtml();

        this.callParent();
    },

    createMainDiv: function ()
    {
        return '<div style="display:flex;flex-direction:row;flex-wrap:wrap">';
    },

    createColumnDiv: function (marginRight, contentHtml)
    {
        if (!isValidString(contentHtml))
        {
            return "";
        }
        marginRight = marginRight === 0 ? 0 : (marginRight || 75);
        return '<div style="display:flex;flex-direction:column;margin-right:' + marginRight + 'px">' + contentHtml + "</div>";
    },

    createParagraphDiv: function (title, marginBottom)
    {
        marginBottom = marginBottom === 0 ? 0 : (marginBottom || 15);
        return '<div class="businessCardPanel_title" style="margin-bottom:' + marginBottom + 'px">' + title;
    },

    createNumbersContainer: function (paragraphMarginBottom)
    {
        var numbers = isValid(this.contact) ? this.contact.getAllNumbers() : [];
        if (Ext.isEmpty(numbers))
        {
            return '';

        }
        var labelWidth = this.computeWidthForStrings(this.contact.getAllNumbers());

        var additionalNumbers = [];
        Ext.each(this.contact.getAdditionalNumberAttributes(), function (attribute)
        {
            additionalNumbers = additionalNumbers.concat(attribute.getValues());
        }, this);

        return this.createParagraphDiv(LANGUAGE.getString('telephone'), paragraphMarginBottom) +
                this.createNumbersRow(this.contact.getOfficePhoneNumbers(), 'office', labelWidth) +
                this.createNumbersRow(this.contact.getMobilePhoneNumbers(), 'mobile', labelWidth) +
                this.createNumbersRow(this.contact.getHomePhoneNumbers(), 'home', labelWidth) +
                this.createNumbersRow(additionalNumbers, '', labelWidth) +
            '</div>';
    },

    createNumbersRow: function (numbers, description, labelWidth)
    {
        var result = "";
        var link = SESSION.isTelephonyAllowed() ? 'link' : '';
        Ext.each(numbers, function (number)
        {
            if (!isValidString(number))
            {
                return;
            }
            result += this.createRow(number, description, "telephoneNumber " + link, LANGUAGE.getString("callNumber", number), labelWidth);
        }, this);
        return result;
    },

    createEMailContainer: function (paragraphMarginBottom)
    {
        var emailAddresses = isValid(this.contact) ? this.contact.getAllEMailAddresses() : [];
        if (Ext.isEmpty(emailAddresses))
        {
            return '';
        }
        var labelWidth = this.computeWidthForStrings(this.contact.getAllEMailAddresses());

        return this.createParagraphDiv(LANGUAGE.getString('email'), paragraphMarginBottom) +
                    this.createEMailRow([this.contact.getEMail()], 'office', labelWidth) +
                    this.createEMailRow([this.contact.getHomeEMail()], 'home', labelWidth) +
                    this.createEMailRows(this.contact.getAdditionalEMailAttributes(), labelWidth) +
                '</div>';
    },

    createEMailRows: function (additionalAddresses, labelWidth)
    {
        var html = '';
        Ext.each(additionalAddresses, function (additionalAddress)
        {
            html += this.createEMailRow(additionalAddress.Values, additionalAddress.Key, labelWidth);
        }, this);
        return html;
    },

    createEMailRow: function (emailAddresses, description, labelWidth)
    {
        var result = "";
        Ext.each(emailAddresses, function (email)
        {
            if (!isValidString(email))
            {
                return;
            }
            result += this.createRow(email, description, "emailAddress link", LANGUAGE.getString("writeEMailTo", email), labelWidth);
        }, this);
        return result;
    },

    createAddressContainer: function (address, title, paragraphMarginBottom)
    {
        if (!isValid(address))
        {
            return '';
        }

        var result = this.createParagraphDiv(LANGUAGE.getString(title), paragraphMarginBottom);
            
        Ext.each(address.toArray(), function (addressLine)
        {
            if (isValidString(addressLine))
            {
                result += this.createAddressRow(addressLine);
            }
        }, this);
        result += '</div>';
        return result;
    },

    createAddressRow: function (text)
    {
        var link = isGoogleMapsApiLoaded ? 'link' : '';

        return this.createRow(text, '', "address " + link, LANGUAGE.getString("openGoogleMaps"));
    },

    createAddressBookContainer: function (paragraphMarginBottom)
    {
        if (!isValid(this.contact))
        {
            return '';
        }
        var addressBook = this.getAddressBook();
        if (!isValidString(addressBook))
        {
            return '';
        }

        var result = this.createParagraphDiv(LANGUAGE.getString('addressBook'), paragraphMarginBottom);
        result += this.createRow(addressBook, '', 'label');
        result += '</div>';
        return result;
    },

    getAddressBook: function ()
    {
        var addressBook = this.contact.getProfileName() || this.contact.getObjectSource();
        if (!isValidString(addressBook) && isValidString(this.contact.getGUID()) && this.contact.getGUID().indexOf("GENERATED") === 0)
        {
            addressBook = LANGUAGE.getString("localContacts");
        }
        return addressBook;
    },

    createCommentContainer: function (paragraphMarginBottom)
    {
        if (!isValid(this.contact))
        {
            return '';
        }
        var comment = this.contact.getComment();
        if (!isValidString(comment))
        {
            return '';
        }

        var escapedComment = replaceNewLinesWithBRTag(comment);
        var result = this.createParagraphDiv(LANGUAGE.getString('comment'), paragraphMarginBottom);
        result += this.createRow(escapedComment, '', 'label');
        result += '</div>';
        return result;
    },

    createAdditionalAttributesContainer: function (paragraphMarginBottom)
    {
        if (!isValid(this.contact))
        {
            return '';
        }
        var additionalAttributes = this.contact.getAdditionalAttributesExceptNumberAndEMailAddresses();
        if (Ext.isEmpty(additionalAttributes))
        {
            return '';
        }

        var result = this.createParagraphDiv(LANGUAGE.getString('additionalAttributes'), paragraphMarginBottom);

        var keys = Ext.Array.pluck(additionalAttributes, "Key");
        var widthForKeys = this.computeWidthForStrings(keys);
        Ext.each(additionalAttributes, function (attribute) 
        {
            result += this.createKeyValueContainer(attribute.getKey(), attribute.getValues(), widthForKeys);
        }, this);
        result += '</div>';
        return result;
    },

    computeWidthForStrings: function (keys)
    {
        return 7 * this.getMaxLengthOfStrings(keys);
    },

    getMaxLengthOfStrings: function (keys)
    {
        var maxKeyLength = 0;
        Ext.each(keys, function (key)
        {
            if (key.length > maxKeyLength)
            {
                maxKeyLength = key.length;
            }
        });
        return maxKeyLength;
    },

    createKeyValueContainer: function (key, values, keyLabelWidth)
    {
        var result = '<div style="display:flex;">' +
            '<div class="label" style="min-width:75px;width:' + keyLabelWidth + 'px">' + key + ':</div>';
        Ext.each(values, function (value)
        {
            result += '<div class="label">' + value + '</div>';
        }, this);
        result += '</div>';
        return result;
    },

    createRow: function (text, description, ccsClass, tooltip, labelWidth)
    {
        var result = '<div style="display:flex;" title="' + tooltip + '">' +
            '<div class="' + ccsClass + '" style="';
        if (labelWidth)
        {
            result += 'width:' + labelWidth + 'px;';
        }
        else
        {
            result += 'flex:1;';
        }
        result += '">' + text + '</div>';
        if (isValidString(description))
        {
            var descriptionText = LANGUAGE.getString(description);
            if (!isValidString(descriptionText))
            {
                descriptionText = description;
            }
            result += '<div style="margin-left:5px;width:50px;font-size:' + FONT_SIZE_SUBTITLE + 'px">(' + descriptionText + ')</div>';
        }
        result += '</div>';
        return result;
    },

    setContact: function (contact) 
    {
        if (!contact)
        {
            return;
        }
        
        this.contact = contact;
        
        if (this.destroyed)
        {
            return;
        }

        this.setHtml(this.createHtml());
    },

    onMap: function (clickedButton, contact) {
        if (!isValid(this.parent)) {
            return;
        }
        this.parent.onMap(clickedButton, contact);
    },

    createHtml: function ()
    {
        return this.createMainDiv() +
            this.createContentHtml() +
            '</div>';
    },

    isEmpty: function ()
    {
        return Ext.isEmpty(this.createContentHtml());
    }
});

Ext.define('BusinessCardPanel_Details',
{
    extend: 'BusinessCardPanel_BaseForDetails',

    flex: 1,
    border: false,

    margin: '10 0 0 5',

    createContentHtml: function ()
    {
        return  this.createColumnDiv(75, this.createNumbersContainer() + this.createEMailContainer()) +
                this.createColumnDiv(75, this.createAddressContainer(this.contact.getAddress(), 'address') + this.createAddressBookContainer()) +
                this.createColumnDiv(75, this.createCommentContainer() + this.createAdditionalAttributesContainer());
    }
});

Ext.define('BusinessCardPanel_ContactDetailsForTabPanel',
{
    extend: 'BusinessCardPanel_BaseForDetails',

    createContentHtml: function ()
    {
        return  this.createColumnDiv(50, this.createNumbersContainer() + this.createAddressContainer(this.contact.getOfficeAddress(), 'company', 0)) +
                this.createColumnDiv(0, this.createEMailContainer() + this.createAddressContainer(this.contact.getHomeAddress(), 'home', 0));
    }
});

Ext.define('BusinessCardPanel_OtherDetailsForTabPanel',
{
    extend: 'BusinessCardPanel_BaseForDetails',

    createContentHtml: function ()
    {
        return  this.createColumnDiv(50, this.createCommentContainer() + this.createAddressBookContainer(0)) +
                this.createColumnDiv(0, this.createAdditionalAttributesContainer(0));
    }
});

Ext.define('BusinessCardPanel_DetailsTabPanel',
{
    extend: 'Ext.tab.Panel',
    border: false,
    bodyPadding: '5 15 5 15',
    flex: 1,

    cls: 'selectable',

    initComponent: function ()
    {
        this.callParent();

        this.contactDetailsPanel = Ext.create('BusinessCardPanel_ContactDetailsForTabPanel',
        {
            contact: this.contact
        });

        this.otherDetailsPanel = Ext.create('BusinessCardPanel_OtherDetailsForTabPanel',
        {
            contact: this.contact
        });

        this.on('tabchange', function (tabPanel, newCard, oldCard, eOpts)
        {
            if (this.skipNextTabChangeEvent)
            {
                return;
            }
            var foundIndex = -1;
            this.each(function (tab, index)
            {
                if (tab === newCard)
                {
                    foundIndex = index;
                    return false;
                }
            }, this);
            if (foundIndex !== -1)
            {
                CLIENT_SETTINGS.addSetting("CONTACTS", "businessCardTooltip_selectedTabIndex", foundIndex);
                CLIENT_SETTINGS.saveSettings();
            }
        });

        this.setContact(this.contact);
    },

    setSavedActiveTab: function ()
    {
        var activeTabIndex = CLIENT_SETTINGS.getSetting("CONTACTS", "businessCardTooltip_selectedTabIndex");
        if (activeTabIndex > this.items.items.length - 1)
        {
            activeTabIndex = 0;
        }
        this.skipNextTabChangeEvent = true;
        this.setActiveTab(activeTabIndex || 0);
        this.skipNextTabChangeEvent = false;
    },

    setContact: function (contact)
    {
        this.contactDetailsPanel.setContact(contact);
        this.otherDetailsPanel.setContact(contact);

        var firstTab = this.createTab(LANGUAGE.getString("contact"));
        firstTab.add(this.contactDetailsPanel);
        var firstTabEmpty = this.contactDetailsPanel.isEmpty();
        
                
        var secondTab = this.createTab(LANGUAGE.getString("otherAttributes"));
        secondTab.add(this.otherDetailsPanel);
        var secondTabEmpty = this.otherDetailsPanel.isEmpty();
        
        this.removeAll();

        var tabs = [];
        if (!firstTabEmpty)
        {
            tabs.push(firstTab);
        }
        if (!secondTabEmpty)
        {
            tabs.push(secondTab);
        }
        
        this.add(tabs);

        if (Ext.isEmpty(tabs))
        {
            this.removeFromParent();
        }
        else
        {
            this.addToParent();
            this.setSavedActiveTab();
        }
    },

    addToParent: function ()
    {

    },

    removeFromParent: function ()
    {

    },

    createTab: function (title)
    {
        return Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '5 0 0 0',
            flex: 1,
            title: title.toUpperCase()
        });
    }
});

Ext.define('BusinessCardPanel', {
    extend: 'Ext.Container',
    layout: {type: 'vbox', pack: 'start', align: 'stretch'},

    contact: null,
    addressInfo: null,
    journalEntry:null, //TODO: damit ist addressInfo überflüssig
    groupName: '',

    showDetails: true,

    margin: '0 0 25 0',

    cls: 'selectable',

    initComponent: function ()
    {
        this.callParent();

        this.createBusinessCard();
    },

    createBusinessCard: function ()
    {
        this.removeAll();
        
        this.nameAndPhotoPanel = this.add(Ext.create('BusinessCardPanel_NameAndPhoto',
        {
            parent: this,
            contact: this.contact,
            addressInfo: this.addressInfo,
            groupName: this.groupName,
            journalEntry: this.journalEntry
        }));

        if (this.showDetails)
        {
            this.detailsPanel = this.add(Ext.create('BusinessCardPanel_Details',
            {
                parent: this,
                contact: this.contact,
                addressInfo: this.addressInfo,
                journalEntry: this.journalEntry
            }));
        }
    },

    setContact: function (contact)
    {
        if (contact && this.contact)
        {
            if (this.contact.equals(contact))
            {
                return;
            }
        }
        this.contact = contact;

        if (this.contact || this.addressInfo)
        {
            this.createBusinessCard();

            this.nameAndPhotoPanel.setContact(contact);
            this.detailsPanel.setContact(contact);
        }
    },

    onRoute: function (clickedButton, contact) {
        this.onMap(clickedButton, contact, true);
    },

    onMap: function (clickedButton, contact, showRoute)
    {
        if (!isValid(this, "parent.onMap"))
        {
            if (!isValid(contact)) {
                return;
            }

            var dialog = new SimpleDialog(
            {
                items:
                [
                    Ext.create('GoogleMapsPanel',
                    {
                        width: 700,
                        height: 350,
                        contact: contact,
                        title: LANGUAGE.getString(showRoute ? "route" : "map").toUpperCase(),
                        displayRoute: showRoute || false
                    })
                ],
                target: clickedButton.el
            });
            dialog.show();
            return;
        }
        this.parent.onMap(clickedButton, contact);
    },

    updatePresenceState: function ()
    {
        this.photo.setContact(this.contact);
    }
});