www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getPresenceImage = function ()
{
    var addressInfo = this.getResolvedAddressInfo();
    if (!isValid(addressInfo))
    {
        return "";
    }
        
    var presenceState = addressInfo.getPresenceState();
    if (!isValid(presenceState))
    {
        return "";
    }
    return getEnumForPresenceState(presenceState).image;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getDisplayName = function (htmlEncode)
{
    if (isValid(this.getResolvedAddressInfo()))
    {
        var result = this.getResolvedAddressInfo().getDisplayName();
        if (isValidString(result))
        {
            if (htmlEncode)
            {
                result = Ext.String.htmlEncode(result);
            }
            return result;
        }
    }
    if (!isValid(this.getAddressInfo()))
    {
        return "";
    }

    var addressInfo = this.getAddressInfo();
    var result = getFirstValidString([addressInfo.getName(), addressInfo.getDisplayNumber(), addressInfo.getNumber(), LANGUAGE.getString('suppressedNumber'), "&nbsp;"]);
    if (htmlEncode)
    {
        result = Ext.String.htmlEncode(result);
    }
    return result;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getCompany = function (encodeHtml)
{
    if (!isValid(this.getAddressInfo()))
    {
        return "";
    }

    var possibleValues = [];
    if (isValid(this.getResolvedAddressInfo()))
    {
        possibleValues = this.collectPossibleValues(this.getResolvedAddressInfo().isGlobalInfo());
    }
    var addressInfo = this.getAddressInfo();
    possibleValues.push(addressInfo.getCompany());
    if (this.getDisplayName() !== addressInfo.getNumber() && this.getDisplayName() !== addressInfo.getDisplayNumber())
    {
        possibleValues.push(addressInfo.getNumber()); //Nummer in der zweiten Reihe des JournalEntrys nur anzeigen, wenn die erste Zeile nicht die Nummer enthält
    }
    
    var result = getFirstValidString(possibleValues);
    if (encodeHtml)
    {
        return Ext.String.htmlEncode(result);
    }
    return result;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.collectPossibleValues = function (addCityAndCountry)
{
    var possibleValues = [];
    if (isValid(this.getResolvedAddressInfo()))
    {
        possibleValues.push(this.getResolvedAddressInfo().getCompany());
        if (addCityAndCountry)
        {
            possibleValues.push(getFirstValidString([this.getResolvedAddressInfo().getCity(), this.getResolvedAddressInfo().getCountry()]));
        }

    }
    if (!isValid(this.getAddressInfo()))
    {
        return Ext.Array.clean(possibleValues);
    }

    var addressInfo = this.getAddressInfo();
    possibleValues.push(addressInfo.getCompany());
    if (this.getDisplayName() !== addressInfo.getNumber() && this.getDisplayName() !== addressInfo.getDisplayNumber())
    {
        possibleValues.push(addressInfo.getNumber()); //Nummer in der zweiten Reihe des JournalEntrys nur anzeigen, wenn die erste Zeile nicht die Nummer enthält
    }

    return Ext.Array.clean(possibleValues);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isCallSuccessfull = function ()
{
    return this.getCallSuccess() === "Connected";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getCallSuccessText = function ()
{
    if (this.isBusy())
    {
        return LANGUAGE.getString('callStateBusy');
    }
    
    var name = (this.isCallSuccessfull() && !this.isMissedCall()) ? "successfulCall" : "unsuccessfulCall";
    name += this.isIncoming() ? "Incoming" : "Outgoing";
    return LANGUAGE.getString(name);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getDate = function ()
{
    if (!isValidString(this.getDateTime()))
    {
        return "";
    }
    var dateTime = new Date(this.getDateTime());
    
    return formatDateStringWithWeekDay(dateTime, true);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getTime = function ()
{
    if (!isValidString(this.getDateTime()))
    {
        return "";
    }
    var dateTime = new Date(this.getDateTime());
    return formatTimeString(dateTime);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getCallDirectionImage = function ()
{
    var color = this.getCallSuccessColor();
    var imageName = this.getImageName("arrow_right", "arrow_left");
    return IMAGE_LIBRARY.getImage(imageName, 64, color);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getCallDirectionImageWithPhone = function ()
{
    var color = this.getCallSuccessColor();
    var imageName = this.getImageName("phone_in", "phone_out");
    return IMAGE_LIBRARY.getImage(imageName, 64, color);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getImageName = function (baseForIncoming, baseForOutgoing) {
    var imageName = "";
    if (this.isIncoming()) {
        imageName = baseForIncoming;
    }
    else {
        imageName = baseForOutgoing;
    }
    if (isValid(this.getACDInfo())) {
        imageName += "_acd";
    }
    else if (isValidString(this.getViaInformation()) || isValidString(this.getToInformation())) {
        imageName += "_redirected";
    }
    return imageName;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.hasNotice = function ()
{
    return isValid(this.getNotice()) && (isValidString(this.getNotice().getBody()) || isValidString(this.getNotice().getSubject()));
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getNoticeImageIfAvailable = function ()
{
    if (this.hasNotice())
    {
        return IMAGE_LIBRARY.getImage("file", 64, DARKER_GREY);
    }
    return "";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getSpeakerImageIfAvailable = function ()
{
    if (isValidString(this.getVoiceMailUrl()) || (isValid(this.getACDInfo()) && isValidString(this.getACDInfo().getRecordingUrl())))
    {
        return IMAGE_LIBRARY.getImage("speaker", 64, DARKER_GREY);
    }
    return "";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getFormImageIfAvailable = function ()
{
    if (isValid(this.getACDInfo()) && isValidString(this.getACDInfo().getFormUrl()))
    {
        return IMAGE_LIBRARY.getImage("form", 64, DARKER_GREY);
    }
    return "";
}; 

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getCallSuccessColor = function ()
{
    if (this.isMissedCall())
    {
        return COLOR_UNSUCCESSFULL_CALL.toString();
    }
    return COLOR_SUCCESSFULL_CALL.toString();
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isIncoming = function ()
{
    return this.getCallDirection() === CallDirection.In.value;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isBusy = function ()
{
    return this.getCallSuccess() === CallState.Busy.value;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isOutgoing = function ()
{
    return !this.isIncoming();
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isMissedCall = function () {
    if (this.ignore) {
        return false;
    }

    return (!this.isCallSuccessfull() && this.isIncoming()) || isValidString(this.getVoiceMailUrl());
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isForThisNumber = function (number)
{
    if (!isValidString(number))
    {
        return false;
    }
    if (!isValid(this.getAddressInfo()))
    {
        return false;
    }
        
    var addressInfo = this.getAddressInfo();

    var possibleNumbers = new TelephoneNumbers([addressInfo.getNumber(), addressInfo.getCanonicalNumber(), addressInfo.getDisplayNumber()]);
    return possibleNumbers.contains(number);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isLastEntryInGroup = function (parents, xindex)
{
    var nextElement = parents[xindex]; //xindex zeigt schon auf das nächste Element
    if (isValid(nextElement) && isValid(nextElement.data) && nextElement.data.typeMarker === "www_caseris_de_CaesarSchema_CTIJournalEntry")
    {
        nextElement = nextElement.data;
    }
    return !isValid(nextElement) || (isValid(nextElement) && nextElement.groupEntry);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getViaInformation = function ()
{
    return this.getInformationFromAddressInfo(this.getViaAddressInfo());
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getToInformation = function ()
{
    return this.getInformationFromAddressInfo(this.getToAddressInfo());
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getInformationFromAddressInfo = function (addressInfo)
{
    if (!isValid(addressInfo))
    {
        return "";
    }

    var nameOrNumber = getFirstValidString([addressInfo.getName(), addressInfo.getDisplayNumber(), addressInfo.getNumber()]);
    if (isValidString(nameOrNumber))
    {
        return LANGUAGE.getString("via").toLowerCase() + ": " + nameOrNumber;
    }
    return "";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getAllNumbers = function ()
{
    if (isValid(this.getAddressInfo()))
    {
        var number = this.getAddressInfo().getNumber();
        if (isValidString(number))
        {
            return [number];
        }
    }
    return [];
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getPhoneIcon = function ()
{
    return IMAGE_LIBRARY.getImage("phone", 64, NEW_GREY);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getLineStateImage = function ()
{
    var contact = this.getContactForPhoto();
    if (isValid(contact))
    {
        return contact.getLineStateImage();
    }
    return "";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getContactForPhoto = function (scale, hidePresenceState, hideAgentState, additionalStyle)
{
    if (!isValid(this.getAddressInfo()))
    {
        return null;
    }

    var contact = this.getResolvedAddressInfo();
    if (!isValid(contact))
    {
        contact = new www_caseris_de_CaesarSchema_Contact();
        if (this.getAddressInfo().isOnlyANumber())
        {
            contact.pseudoContact = true;
        }
        else
        {
            contact.convertFromCTIContact(this.getAddressInfo());
        }
    }
    contact.isContactWithMobileNumber = new TelephoneNumber(this.getAddressInfo().getNumber()).isMobileNumber() || new TelephoneNumber(this.getAddressInfo().getCanonicalNumber()).isMobileNumber();
    return contact;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getNumber = function ()
{
    if (isValid(this.getAddressInfo()))
    {
        return this.getAddressInfo().getNumber();
    }
    return "";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getPhoneImage = function ()
{
    return IMAGE_LIBRARY.getImage("phone", 64, NEW_GREY);
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.equals = function (entry) {
    if (!isValid(entry))
    {
        return false;
    }
    if (isValid(this, "getJournalId()") && isValid(entry, "getJournalId()"))
    {
        return this.getJournalId().equals(entry.getJournalId());
    }
    return false;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.showCreateContactButton = function ()
{
    if (isValid(this.getResolvedAddressInfo()) && this.getResolvedAddressInfo().isRealContact())
    {
        return false;
    }
    var number = this.getNumber();
    if (!isValidString(number)) {
        return false;
    }
    var favorites = CURRENT_STATE_BUDDY_LIST.getFavoritesForNumber(number);
    if (!Ext.isEmpty(favorites)) {
        return false;
    }
    var buddies = CURRENT_STATE_BUDDY_LIST.getBuddiesForNumber(number);
    if (!Ext.isEmpty(buddies)) {
        return false;
    }
    return true;
};


www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getACDGroupName = function () {
    if (isValid(this.getACDInfo())) {
        var groupName = this.getACDInfo().getGroup();
        return groupName || "";
    }
    return "";
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getAgentStateImage = function ()
{
    if (!isValid(this.getResolvedAddressInfo()))
    {
        return "";
    }

    return this.getResolvedAddressInfo().getAgentStateImage();
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.isInternalCall = function ()
{
    return Ext.create('CallFlagsInternalCall', {}).isPossible(this.getCallFlags());
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getColorForCallType = function ()
{
    return this.isInternalCall() ? COLOR_INTERNAL_CALL : COLOR_EXTERNAL_CALL;
};

www_caseris_de_CaesarSchema_CTIJournalEntry.prototype.getLongDateAsString = function ()
{
    var date = new Date(this.getDateTime());

    return formatLongDateString(date, false);
};
















www_caseris_de_CaesarSchema_CTIJournalId.prototype.equals = function (journalId)
{
    if (!isValid(journalId))
    {
        return false;
    }
    if (isValid(this, "getStorageId()") && isValid(journalId, "getStorageId()") && isValid(this, "getEntryId()") && isValid(journalId, "getEntryId()"))
    {
        return this.getEntryId() === journalId.getEntryId() && this.getStorageId() === journalId.getStorageId();
    }
    return false;
};
