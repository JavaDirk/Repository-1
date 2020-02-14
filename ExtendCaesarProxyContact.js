www_caseris_de_CaesarSchema_Contact.prototype.toString = function ()
{
    return this.getFullName(false);
};

www_caseris_de_CaesarSchema_Contact.prototype.getFullName = function (lastNameFirst)
{
    var result = "";
    if (lastNameFirst)
    {
        if (isValidString(this.getLastName()))
        {
            result = this.getLastName();
        }
        if (isValidString(this.getFirstName()))
        {
            if (isValidString(result))
            {
                result += ", ";
            }
            result += this.getFirstName();
        }
        result = Ext.String.trim(result);
    }
    else
    {
        if (isValidString(this.getFirstName()))
        {
            result = this.getFirstName();
        }
        if (isValidString(this.getLastName()))
        {
            result += " " + this.getLastName();
        }
        result = Ext.String.trim(result);
    }
    if (!isValidString(result))
    {
        result = Ext.String.trim(this.getName());
    }
    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.getCountTelephoneNumbers = function ()
{
    return this.getAllNumbers().length;
};

www_caseris_de_CaesarSchema_Contact.prototype.getAllNumbers = function ()
{
    var result = this.filterNumbers(this.getOfficePhoneNumbers());

    var push = Array.prototype.push;

    push.apply(result, this.filterNumbers(this.getMobilePhoneNumbers()));
    push.apply(result, this.filterNumbers(this.getHomePhoneNumbers()));

    if (isValidString(this.number)) //dies kommt vor, wenn man einen Kontakt aus einem JournalEntry holt. Der eigentliche Kontakt hat keine Nummer (weil im Adressbuch nicht gepflegt), aber aus dem JournalEntry kennt man die Nummer
    {
        result.push(this.number);
    }

    Ext.each(this.getAdditionalNumbers(), function (number)
    {
        result.push(number);
    });

    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.getAdditionalNumbers = function ()
{
    var result = [];
    
    Ext.each(this.getAdditionalNumberAttributes(), function (attribute)
    {
        Ext.each(attribute.getValues(), function (value)
        {
            result.push(value);
        });
    });
    
    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.getAdditionalNumberAttributes = function ()
{
    return this.filterAdditionalAttributesByCategory("#");
};

www_caseris_de_CaesarSchema_Contact.prototype.getAdditionalEMailAttributes = function ()
{
    return this.filterAdditionalAttributesByCategory("@");
};

www_caseris_de_CaesarSchema_Contact.prototype.getAdditionalAttributesExceptNumberAndEMailAddresses = function ()
{
    return this.filterAdditionalAttributesByCategory("");
};

www_caseris_de_CaesarSchema_Contact.prototype.filterAdditionalAttributesByCategory = function (category)
{
    var result = [];

    Ext.each(this.getAdditionalAttributes(), function (attribute)
    {
        if (attribute.getCategory() === category)
        {
            result.push(attribute);
        }
    });

    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.getAllEMailAddresses = function ()
{
    var result = [];
    if (isValidString(this.getEMail()))
    {
        result.push(this.getEMail());
    }
    if (isValidString(this.getHomeEMail()))
    {
        result.push(this.getHomeEMail());
    }
    Ext.each(this.getAdditionalEMailAttributes(), function (attribute)
    {
        Ext.each(attribute.getValues(), function (value)
        {
            result.push(value);
        });
    });
    
    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.getSpecialAttributeValue = function ()
{
    var specialAttribute = this.getSpecialAttribute();
    var result = "";
    if (isValidString(specialAttribute))
    {
        Ext.each(this.getAdditionalAttributes(), function (attribute)
        {
            if (attribute.getKey() === specialAttribute && !Ext.isEmpty(attribute.getValues()))
            {
                result = attribute.getValues().toString();
            }
        });
        
        if (isValidString(result))
        {
            return result;
        }

        Ext.iterate(this, function (key, value)
        {
            if (equalsIgnoringCase(key, specialAttribute))
            {
                result = value;
                return false;
            }
        }, this);
    }
    return result || "";
};

www_caseris_de_CaesarSchema_Contact.prototype.filterNumbers = function (numbers)
{
    if (!isValid(numbers))
    {
        return [];
    }
    return Ext.Array.filter(numbers, function (number)
    {
        return isValidString(number);
    }) || [];
};

www_caseris_de_CaesarSchema_Contact.prototype.isResolved = function ()
{
    var name = this.getFullName(true);
    return isValidString(name);
};

www_caseris_de_CaesarSchema_Contact.prototype.isCompanyContact = function ()
{
    var company = this.getCompany();
    var fullname = this.getFullName(true);
    if (!isValidString(fullname) && !isValidString(this.getName()) && isValidString(company))
    {
        return true;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.isGlobalInfo = function ()
{
    var country = this.getCountry();
    var fullname = this.getFullName(true);
    if (!isValidString(fullname) && !isValidString(this.getName()) && isValidString(country))
    {
        return true;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.isOnline = function ()
{
    var state = this.getCurrentPresenceState();
    if (state !== null && state !== undefined)
    {
        var presenceStateObject = getEnumForPresenceState(state);
        return presenceStateObject.onlineState;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.isOffline = function ()
{
    var state = this.getCurrentPresenceState();
    if (state)
    {
        var presenceStateObject = getEnumForPresenceState(state);
        return !presenceStateObject.onlineState;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.getCurrentPresenceState = function ()
{
    if (this.isExternalContact())
    {
        return null;
    }

    var presenceStateEvent;
    if (window.CURRENT_STATE_STATES)
    {
        presenceStateEvent = CURRENT_STATE_STATES.getPresenceStateEvent(this.getGUID()); //wir rufen nicht this.getPresenceState auf, weil man dort auch PresenceState.onPhone bekommen könnte. Wir brauchen aber den eigentlichen PresenceState, um feststellen zu können, ob jemand online ist
    }
    if (presenceStateEvent)
    {
        return presenceStateEvent.State;
    }
    else
    {
        return this.PresenceState;
    }
};

www_caseris_de_CaesarSchema_Contact.prototype.sendEMail = function (suggestedEMailAddress)
{
    if (isValidString(suggestedEMailAddress))
    {
        sendEMail(suggestedEMailAddress, this);
    }
    else
    {
        sendEMail(this.getEMail(), this);
    }
};

www_caseris_de_CaesarSchema_Contact.prototype.equals = function (contact)
{
    if (!isValid(contact))
    {
        return false;
    }

    var sameGUID = contact.getGUID() === this.getGUID() && isValidString(contact.getGUID());
    var sameObjectName = false;
    var sameObjectSource = false;

    //bei JournalEntrys kann der ObjectName auch so aufgebaut sein: objectSource$$objectName. Daher das Splitten
    var objectName1 = contact.getObjectName();
    var objectName2 = this.getObjectName();
    var objectSource1 = contact.getObjectSource();
    var objectSource2 = this.getObjectSource();
    if (isValidString(objectName1) && isValidString(objectName2))
    {
        if (objectName1.indexOf("$$") > 0)
        {
            var objectNameParts1 = objectName1.split("$$");
            objectName1 = objectNameParts1[1];
            objectSource1 = objectNameParts1[0];
        }
        if (objectName2.indexOf("$$") > 0)
        {
            var objectNameParts2 = objectName2.split("$$");
            objectName2 = objectNameParts2[1];
            objectSource2 = objectNameParts2[0];
        }
    }

    if (isValidString(objectName1) && objectName1 === objectName2)
    {
        sameObjectName = true;
    }

    if (isValidString(objectSource1) && objectSource1 === objectSource2)
    {
        sameObjectSource = true;
    }

    return sameGUID || (sameObjectName && sameObjectSource);
};

www_caseris_de_CaesarSchema_Contact.prototype.deepCompare = function (contact)
{
    return JSON.stringify(this) === JSON.stringify(contact);
};

www_caseris_de_CaesarSchema_Contact.prototype.getAddressBookName = function () 
{
    var addressBook = this.getProfileName() || this.getObjectSource();
    if (isValidString(addressBook))
    {
        if (addressBook.indexOf("!!") !== -1)
        {
            var addressBookParts = addressBook.split("!!");
            addressBook = addressBookParts[addressBookParts.length - 1];
        }
        return addressBook;
    }
    return "";
};

www_caseris_de_CaesarSchema_Contact.prototype.isExternalContact = function ()
{
    if (isValid(this.getPresenceState()))
    {
        return false;
    }
    else
    {
        return true;
    }
};

www_caseris_de_CaesarSchema_Contact.prototype.getPresenceImage = function ()
{
    var presenceState = getEnumForPresenceState(this.getPresenceState());
    return presenceState.image;
};

www_caseris_de_CaesarSchema_Contact.prototype.getPresenceState = function ()
{
    if (window.CURRENT_STATE_STATES)
    {
        var presenceStateEvent = CURRENT_STATE_STATES.getPresenceStateEvent(this.getGUID());
        if (isValid(presenceStateEvent))
        {
            return presenceStateEvent.getState();
        }
    }
    return this.PresenceState;
};

www_caseris_de_CaesarSchema_Contact.prototype.getPresenceStateWithoutOnPhone = function ()
{
    if (window.CURRENT_STATE_STATES)
    {
        var presenceStateEvent = CURRENT_STATE_STATES.getPresenceStateEvent(this.getGUID());
        if (isValid(presenceStateEvent))
        {
            return presenceStateEvent.getStateWithoutOnPhone();
        }
    }

    return this.PresenceState;
};

www_caseris_de_CaesarSchema_Contact.prototype.getPresenceText = function ()
{
    var state = this.getPresenceState();
    if (state === PresenceState.OnPhone.value)
    {
        return PresenceState.OnPhone.text;
    }

    if (window.CURRENT_STATE_STATES)
    {
        var presenceStateEvent = CURRENT_STATE_STATES.getPresenceStateEvent(this.getGUID());
        if (isValid(presenceStateEvent))
        {
            var text = presenceStateEvent.getText();
            if (isValidString(text))
            {
                return text;
            }
            else
            {
                return isValid(state) ? state.text : "";
            }
        }
    }

    return this.PresenceText;
};

www_caseris_de_CaesarSchema_Contact.prototype.getPresenceStateText = function ()
{
    var presenceState = getEnumForPresenceState(this.getPresenceState());
    var offlineTime = this.getOfflineTime();
    if (isValidString(offlineTime) && (presenceState === PresenceState.Offline || presenceState === PresenceState.Offline2))
    {
        var presenceText = LANGUAGE.getString("offlineSince");
        var date = new Date(offlineTime);

        var now = new Date();
        var today = getToday();
        var yesterday = getYesterday();
        var oneDay = Ext.Date.add(today, Ext.Date.DAY, -2);

        if (date < oneDay)
        {
            var countDays = 1;
            while (date < oneDay)
            {
                oneDay = Ext.Date.add(oneDay, Ext.Date.DAY, -1);
                countDays++;
            }
            presenceText += countDays + " " + LANGUAGE.getString('days');
        }
        else if (Ext.Date.between(date, oneDay, yesterday))
        {
            presenceText += LANGUAGE.getString('dayBeforeYesterday');
        }
        else if (Ext.Date.between(date, yesterday, today))
        {
            presenceText += LANGUAGE.getString('yesterday');
        }
        else
        {
            presenceText += LANGUAGE.getString('today');
        }

        return presenceText;
    }

    return this.getPresenceText() || presenceState.text;
};

www_caseris_de_CaesarSchema_Contact.prototype.getDisplayName = function (lastNameFirst)
{
    return this.getFullName(lastNameFirst);
};

www_caseris_de_CaesarSchema_Contact.prototype.getFirstOfficePhoneNumber = function ()
{
    if (!isValid(this))
    {
        return "";
    }

    if (!isValid(this.getOfficePhoneNumbers()))
    {
        return "";
    }

    return this.getOfficePhoneNumbers()[0];
};

www_caseris_de_CaesarSchema_Contact.prototype.getFirstMobilePhoneNumber = function ()
{
    if (!isValid(this))
    {
        return "";
    }

    if (!isValid(this.getMobilePhoneNumbers()))
    {
        return "";
    }

    return this.getMobilePhoneNumbers()[0];
};

www_caseris_de_CaesarSchema_Contact.prototype.getFirstHomePhoneNumber = function ()
{
    if (!isValid(this))
    {
        return "";
    }

    if (!isValid(this.getHomePhoneNumbers()))
    {
        return "";
    }

    return this.getHomePhoneNumbers()[0];
};

www_caseris_de_CaesarSchema_Contact.prototype.getAdditionalInformation = function ()
{

    var result = {};

    if (isValid(this.getEMail()))
    {
        result.email = this.getEMail();
    }

    if (isValid(this.getAddress()))
    {
        result.adress = this.getAddress().toString();
    }

    if (isValid(this.getAllNumbers()))
    {
        result.numbers = this.getAllNumbers();
    }

    if (isValid(this.getDepartment()))
    {
        result.department = this.getDepartment();
    }

    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.getAddress = function ()
{
    var result = this.getOfficeAddress();
    if (isValid(result))
    {
        return result;
    }
    result = this.getHomeAddress();
    if (isValid(result))
    {
        return result;
    }
    return this.getGlobalInfoAddress();
};

www_caseris_de_CaesarSchema_Contact.prototype.getOfficeAddress = function ()
{
    var officeAddress = Ext.create('OfficeAddress',
        {
            contact: this
        });
    if (isValidString(officeAddress.toString()))
    {
        return officeAddress;
    }
    return null;
};

www_caseris_de_CaesarSchema_Contact.prototype.getHomeAddress = function ()
{
    var homeAddress = Ext.create('HomeAddress',
        {
            contact: this
        });
    if (isValidString(homeAddress.toString()))
    {
        return homeAddress;
    }
    return null;
};

www_caseris_de_CaesarSchema_Contact.prototype.getGlobalInfoAddress = function ()
{
    var address = Ext.create('GlobalInfoAddress',
        {
            contact: this
        });
    if (isValidString(address.toString()))
    {
        return address;
    }
    return null;
};

function replace(str, char1, char2)
{
    if (!isValidString(str))
    {
        return str;
    }

    var parts = str.split(char1);
    return parts.join(char2);
}

www_caseris_de_CaesarSchema_Contact.prototype.isChattable = function ()
{
    if (window.CURRENT_STATE_CHATS)
    {
        if (!CURRENT_STATE_CHATS.isChatAllowedAndPossible())
        {
            return false;
        }
    }
    return (this.isOfflineAvailable() || this.isOnline() || this.getIsMobileAvailable()) && this.getRightChat() && MY_CONTACT.getRightChat();
};

www_caseris_de_CaesarSchema_Contact.prototype.isVideoChattable = function ()
{
    return WEBRTCAVAILABLE && this.isOnline() && !this.equals(MY_CONTACT) && this.getRightVideo() && MY_CONTACT.getRightVideo();
};

www_caseris_de_CaesarSchema_Contact.prototype.isAudioChattable = function () 
{
    return WEBRTCAVAILABLE && this.isOnline() && !this.equals(MY_CONTACT) && this.getRightVideo() && MY_CONTACT.getRightVideo();
};

//valid bedeutet, dass zumindest ein member nicht null oder undefined ist
www_caseris_de_CaesarSchema_Contact.prototype.isValid = function ()
{
    var valid = false;
    var self = this;
    Ext.each(Object.keys(this), function (key)
    {
        if (isValid(self[key]) && key !== "typeMarker" && key !== "GUID") //in der Partnerleiste hatten wir mal Kontakte, in denen nur die GUID gefüllt war
        {
            valid = true;
        }
    });
    return valid;
};

www_caseris_de_CaesarSchema_Contact.prototype.isRealContact = function ()
{
    if (this.isCompanyContact() || this.isGlobalInfo() || this.ignore || this.pseudoContact)
    {
        return false;
    }
    return this.isValid();
};


www_caseris_de_CaesarSchema_Contact.prototype.showAddToFavoritesButton = function ()
{
    if (!window.CURRENT_STATE_BUDDY_LIST)
    {
        return false;
    }
    if (!CURRENT_STATE_BUDDY_LIST.isFavourite(this) && !this.pseudoContact)
    {
        return true;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.showRemoveFromFavoritesButton = function ()
{
    if (!window.CURRENT_STATE_BUDDY_LIST)
    {
        return false;
    }
    if (CURRENT_STATE_BUDDY_LIST.isFavourite(this) && !this.getImported()) 
    {
        return true;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.isEditable = function ()
{
    return this.getGUID().indexOf("GENERATED") === 0;
};

www_caseris_de_CaesarSchema_Contact.prototype.getPhoneStateImage = function ()
{
    if (window.CURRENT_STATE_CALL && CURRENT_STATE_CALL.isOnPhone(this.getGUID()))
    {
        return IMAGE_LIBRARY.getImage("phone", 64, NEW_GREY);
    }
    return "";
};

www_caseris_de_CaesarSchema_Contact.prototype.getMobileAvailableImage = function ()
{
    if (this.getIsMobileAvailable() && this.isOffline())
    {
        return IMAGE_LIBRARY.getImage("mobile", 64, NEW_GREY);
    }
    return "";
};

www_caseris_de_CaesarSchema_Contact.prototype.isLineStateOk = function ()
{
    if (!window.CURRENT_STATE_CALL)
    {
        return true;
    }
    return CURRENT_STATE_CALL.isLineStateOK(this.getGUID());
};

www_caseris_de_CaesarSchema_Contact.prototype.getLineStateImage = function()
{
    if (this.isLineStateOk())
    {
        return "";
    }
    return "images/64/phone_outOfService.png";//IMAGE_LIBRARY.getImage("remove", 64, RED);
};

www_caseris_de_CaesarSchema_Contact.prototype.convertToPhoneContact = function (number)
{
    var result = new www_caseris_de_CaesarSchema_PhoneContact();
    result.setCompany(this.getCompany());
    result.setName(this.getFullName());
    result.setNumber(number);
    result.setEmail(this.getEMail());
    result.setEntryId(this.getObjectName());
    result.setStorageId(this.getObjectSource());
    return result;
};

www_caseris_de_CaesarSchema_Contact.prototype.convertFromPhoneContact = function (phoneContact)
{
    if (!isValid(phoneContact))
    {
        return;
    }

    this.setCompany(phoneContact.getCompany());
    this.setLastName(phoneContact.getName());

    var officePhoneNumbers = [];
    if (isValidString(phoneContact.getNumber()))
    {
        officePhoneNumbers.push(phoneContact.getNumber().trim());
        this.setOfficePhoneNumbers(officePhoneNumbers);
    }

    this.setEMail(phoneContact.getEmail());
    this.setObjectName(phoneContact.getEntryId());
    this.setObjectSource(phoneContact.getStorageId());

    this.converted = true;
};

www_caseris_de_CaesarSchema_Contact.prototype.convertToCTIContact = function (number)
{
    var result = new www_caseris_de_CaesarSchema_CTIContact();
    result.setCity(this.getCity());
    result.setCompany(this.getCompany());
    result.setCountry(this.getCountry());
    result.setDepartment(this.getDepartment());
    result.setDisplayNumber(number);
    result.setEntryId(this.getObjectName());
    result.setGuid(this.getGUID());
    result.setName(this.getDisplayName());
    result.setNumber(number);
    result.setStorageId(this.getObjectSource());

    return result;
};


www_caseris_de_CaesarSchema_Contact.prototype.convertFromCTIContact = function (ctiContact)
{
    this.setCity(ctiContact.getCity());
    this.setCompany(ctiContact.getCompany());
    this.setCountry(ctiContact.getCountry());
    this.setDepartment(ctiContact.getDepartment());
    this.setObjectName(ctiContact.getEntryId());
    this.setObjectSource(ctiContact.getStorageId());
    this.setGUID(ctiContact.getGuid());

    this.setLastName(ctiContact.getName());

    var officePhoneNumbers = [];
    if (isValidString(ctiContact.getNumber().trim()))
    {
        officePhoneNumbers.push(ctiContact.getNumber().trim());
        this.setOfficePhoneNumbers(officePhoneNumbers);
    }

    this.converted = true;
};

www_caseris_de_CaesarSchema_Contact.prototype.convertFromChatContact = function (chatContact)
{
    this.setCompany(chatContact.getCompany());
    this.setName(chatContact.getName());

    var officePhoneNumbers = [];
    if (isValidString(chatContact.getNumber()))
    {
        officePhoneNumbers.push(chatContact.getNumber().trim());
        this.setOfficePhoneNumbers(officePhoneNumbers);
    }


    this.setEMail(chatContact.getEmail());
    this.setObjectName(chatContact.getEntryId());
    this.setObjectSource(chatContact.getStorageId());
    this.setGUID(chatContact.getGuid());

    this.converted = true;
};

www_caseris_de_CaesarSchema_Contact.prototype.convertFromAgent = function (agent)
{
    this.setEMail(agent.getEMail());
    this.setGUID(agent.getGUID());
    var possibleNames = [agent.getDisplayName(), agent.getName(), agent.getInternalName()];
    this.setName(getFirstValidString(possibleNames));

    var officePhoneNumbers = [];
    if (isValidString(agent.getDevice()))
    {
        officePhoneNumbers.push(agent.getDevice().trim());
    }
    this.setOfficePhoneNumbers(officePhoneNumbers);

    this.converted = true;
};

www_caseris_de_CaesarSchema_Contact.prototype.convertFromPartner = function (partner)
{
    this.setGUID(partner.getGuid());

    if (isValidString(partner.getName()))
    {
        this.setName(partner.getName());

        var name = partner.getName();

        name = name.split(', ');

        this.setFirstName(name[1]);
        this.setLastName(name[0]);

        if (!isValidString(this.getFirstName()) && !isValidString(this.getLastName()) && isValidString(partner.getLabel()))
        {
            this.setLastName(partner.getLabel());
        }
    }
    this.setCompany(partner.getCompany());
    this.setObjectName(partner.getEntryId());
    this.setObjectSource(partner.getStorageId());

    var officePhoneNumbers = [];
    if (isValidString(partner.getDevice()))
    {
        officePhoneNumbers.push(partner.getDevice().trim());
    }
    this.setOfficePhoneNumbers(officePhoneNumbers);

    this.setIsPhoneticResult(false);
    this.setVerified(false);
    this.setCallState(0);
    this.setCallDiversionEnabled(false);
    this.setRightFollowMe(false);
    this.setLanguage('Germany');
    this.setImported(false);
    this.setIsMobileAvailable(false);
    this.setSetCallDiversionAllowed(false);
    this.setIsVoiceBoxEnabled(false);
    this.setAgentState('Undefined');

    this.converted = true;
};

www_caseris_de_CaesarSchema_Contact.prototype.hasNumber = function (number)
{
    if (!isValidString(number))
    {
        return false;
    }
    var telephoneNumbers = new TelephoneNumbers(this.getAllNumbers());
    return telephoneNumbers.contains(number);
};

www_caseris_de_CaesarSchema_Contact.prototype.getAgentStateImage = function ()
{
    if (window.CURRENT_STATE_CONTACT_CENTER)
    {
        var agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfoForContactGUID(this.getGUID());
        if (isValid(agentInfo))
        {
            var agentState = getEnumForAgentState(agentInfo.getAgentState());
            return IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, agentState.color); //agentState.image;
        }
    }
    return "";
};

www_caseris_de_CaesarSchema_Contact.prototype.deserialize = function (jsonContact)
{
    for (var k in jsonContact)
    {
        //Abwärtskompatibilität: Früher (SOAP) fingen alle Attribute mit Unterstrich an, unter JSON nicht mehr, deswegen muss beim kopieren der Attribute der Unterstrich gelöscht werden
        if (k.indexOf("_") === 0)
        {
            var attributeWithoutUnderscore = k.replace("_", "");
            if (!isValidString(this[attributeWithoutUnderscore]))
            {
                this[attributeWithoutUnderscore] = jsonContact[k];
            }
        }
        else
        {
            this[k] = jsonContact[k];
        }   
    }
    
    //jetzt noch eine Ausnahmebehandlung für die telefonnummern
    //die Abfragen auf die Attribute mit Unterstrich sind wg Abwärtkompatibilität, vor der Umstellung von SOAP auf JSON gabe es Unterstriche, danach nicht
    var officenumbers = [];
    if (isValid(this, "_OfficePhoneNumbers._string"))
    {
        officenumbers = this._OfficePhoneNumbers._string;
    }
    else if (Ext.isArray(this._OfficePhoneNumber))
    {
        officenumbers = this._OfficePhoneNumbers;
    }
    else if (Ext.isArray(this.OfficePhoneNumber))
    {
        officenumbers = this.OfficePhoneNumbers;
    }
    this.setOfficePhoneNumbers(officenumbers);

    var mobilenumbers = [];
    if (isValid(this, "_MobilePhoneNumbers._string"))
    {
        mobilenumbers = this._MobilePhoneNumbers._string;
    }
    else if (Ext.isArray(this._MobilePhoneNumbers))
    {
        mobilenumbers = this._MobilePhoneNumbers;
    }
    else if (Ext.isArray(this.MobilePhoneNumbers))
    {
        mobilenumbers = this.MobilePhoneNumbers;
    }
    this.setMobilePhoneNumbers(mobilenumbers);

    var homenumbers = [];
    if (isValid(this, "_HomePhoneNumbers._string"))
    {
        homenumbers = this._HomePhoneNumbers._string;
    }
    else if (Ext.isArray(this._HomePhoneNumbers))
    {
        homenumbers = this._HomePhoneNumbers;
    }
    else if (Ext.isArray(this.HomePhoneNumbers))
    {
        homenumbers = this.HomePhoneNumbers;
    }
    this.setHomePhoneNumbers(homenumbers);


    //und noch eine Ausnahmebehandlung für die AdditionAttributes
    var attributesAsJSON;
    if (isValid(this, "_AdditionalAttributes._Attribute"))
    {
        attributesAsJSON = this._AdditionalAttributes._Attribute;
    } 
    else if (isValid(this, "_AdditionalAttributes"))
    {
        attributesAsJSON = this._AdditionalAttributes;
    }
    else if (isValid(this, "AdditionalAttributes"))
    {
        attributesAsJSON = this.AdditionalAttributes;
    }
    var attributes = [];
    Ext.each(attributesAsJSON, function (attributeJSON)
    {
        var attribute = new www_caseris_de_CaesarSchema_Attribute();
        Ext.apply(attribute, attributeJSON);
        var values = [];
        if (isValid(attributeJSON, "_Values._string"))
        {
            values = attributeJSON._Values._string;
        }
        else if (isValid(attributeJSON, "_Values"))
        {
            values = attributeJSON._Values;
        }
        else if (isValid(attributeJSON, "Values"))
        {
            values = attributeJSON.Values;
        }
        attribute.setValues(values);
        attributes.push(attribute);
    });
    
    this.setAdditionalAttributes(attributes);
};

www_caseris_de_CaesarSchema_Contact.prototype.showInvitationsButton = function ()
{

    var stunServerAvailable = false;

    if (isValid(CURRENT_STATE_CHATS, 'areStunServerConfigured'))
    {
        stunServerAvailable = CURRENT_STATE_CHATS.areStunServerConfigured();
    }

    return stunServerAvailable && isValidString(this.getEMail()) && this.isExternalContact() && MY_CONTACT.getRightVideo();
};

www_caseris_de_CaesarSchema_Contact.prototype.isOfflineAvailable = function ()
{
    if (this.isExternalContact())
    {
        return false;
    }
    if (window.CURRENT_STATE_STATES)
    {
        var presenceStateEvent = CURRENT_STATE_STATES.getPresenceStateEvent(this.getGUID());
        if (presenceStateEvent)
        {
            return presenceStateEvent.getIsOfflineAvailable();
        }
    }

    return this.getIsOfflineAvailable();
};

www_caseris_de_CaesarSchema_Contact.prototype.getAvatarImageNameForPhoto = function ()
{
    if (this.isCompanyContact())
    {
        return "factory_small";
    }
    else if (this.pseudoContact || this.isGlobalInfo())
    {
        var mobileNumber = false;
        var numbers = this.getAllNumbers();
        if (numbers.length > 0)
        {
            mobileNumber = new TelephoneNumber(numbers[0]).isMobileNumber();
        }
        return this.isContactWithMobileNumber || mobileNumber ? "mobile_small" : "phone_small";//"telephone_small";
    }
    return "user";
};

www_caseris_de_CaesarSchema_Contact.prototype.getBorderColorForPhoto = function ()
{
    if (this.isCompanyContact())
    {
        return COLOR_DARK_AVATAR;
    }
    else if (this.pseudoContact || this.isGlobalInfo())
    {
        return COLOR_DARK_AVATAR;
    }
    else if (this.isExternalContact())
    {
        return COLOR_DARK_AVATAR;
    }
    else
    {
        return WHITE;
    }

};

www_caseris_de_CaesarSchema_Contact.prototype.matches = function (searchString) {
    var firstName = this.getFirstName().toUpperCase();
    var lastName = this.getLastName().toUpperCase();
    if (isValidString(firstName) || isValidString(lastName))
    {
        return firstName.indexOf(searchString.toUpperCase()) >= 0 || lastName.indexOf(searchString.toUpperCase()) >= 0;
    }
    if (isValidString(this.getName()))
    {
        return this.getName().toUpperCase().indexOf(searchString.toUpperCase()) >= 0;
    }
    return false;
};

//TODO: Besser wäre es, diese MEthode getDisplayName zu nennen und die bisherigen getDisplayAufrufe auf getFullName zu ändern
www_caseris_de_CaesarSchema_Contact.prototype.getDisplayNameForLiveChat = function (defaultString)
{
    var firstNumber = this.getAllNumbers()[0];
    
    return getFirstValidString([this.getDisplayName(), this.getEMail(), firstNumber, defaultString || LANGUAGE.getString("unknownUser")]);
};

www_caseris_de_CaesarSchema_Contact.prototype.isEqualForLiveChat = function (contact)
{
    if (isValid(this, "getGUID") && isValid(contact, "getGUID"))
    {
        if (this.getGUID() === contact.getGUID())
        {
            return true;
        }
    }
    if (isValid(this, "getEMail") && isValid(contact, "getEMail"))
    {
        if (new EmailAddress(this.getEMail()).equals(contact.getEMail()))
        {
            return true;
        }
    }

    if (new TelephoneNumbers(this.getAllNumbers()).sharesTelephoneNumber(contact.getAllNumbers()))
    {
        return true;
    }
    return false;
};

www_caseris_de_CaesarSchema_Contact.prototype.isOnlyANumber = function ()
{
    if (!Ext.isEmpty(this.getAllNumbers()))
    {
        var otherAttributes = [this.getCity(), this.getCompany(), this.getDepartment(), this.getName()];
        var filteredArray = Ext.Array.filter(otherAttributes, function (string)
        {
            return isValidString(string);
        });
        if (Ext.isEmpty(filteredArray))
        {
            return true;
        }
    }
    return false;
};