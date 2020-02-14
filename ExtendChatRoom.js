www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getImageName = function ()
{
    return this.getWriteRightForModeratorsOnly() ? "blackBoard" : "chats";
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getSmallImageName = function () {
    return this.getImageName() + "_small2";
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getImage = function ()
{
    return IMAGE_LIBRARY.getImage(this.getImageName(), 64, NEW_GREY);
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getSmallImage = function ()
{
    return IMAGE_LIBRARY.getImage(this.getSmallImageName(), 64, NEW_GREY);
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.equals = function (chatRoom)
{
    if (!isValid(chatRoom))
    {
        return false;
    }
    return chatRoom.getGuid() === this.getGuid();
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getAdministratorsCount = function () {
    if (isValid(this, "getAdministrator()")) {
        return this.getAdministrators().length;
    }
    return 0;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getModeratorsCount = function () {
    if (isValid(this, "getModerators()")) {
        return this.getModerators().length;
    }
    return 0;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getStyleForFirstRow = function ()
{

    var style = 'flex: 1;margin-top:1px;' + TEMPLATE_STYLE_TITLE() + ';color:';
    if (this.getActivationStatus() === "Activated")
    {
        style += COLOR_TITLE.toString();
    }
    else
    {
        style += COLOR_SUBTITLE.toString() + ';font-style:italic';
    }
    return style;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getFirstRow = function () {
    return Ext.String.htmlEncode(this.getDisplayName());
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getSecondRow = function () {
    if (this.getActivationStatus() === "Deactivated") {
        return "(" + LANGUAGE.getString("deactivated") + ")";
    }
    if (this.isDeleted()) {
        return "(" + LANGUAGE.getString("deleted") + ")";
    }

    if (isValidString(this.lastMessage))
    {
        return Ext.String.htmlEncode(this.lastMessage);
    }
    
    var lastMessage = CURRENT_STATE_CHATS.getLastChatMessage(this.getGuid());
    if (lastMessage)
    {
        //var name = lastMessage.getContact().getFullName();
        var title = "";
        var message = lastMessage.getText();
        var messageParts = message.split("\n");
        if (messageParts.length > 1)
        {
            title = messageParts[0];
            message = messageParts[1];
            return Ext.String.htmlEncode(title);
        }
        return Ext.String.htmlEncode(message);
    }
    
    return Ext.String.htmlEncode(this.getDescription());
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.isDeleted = function () {
    return this.deleted || false;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.setDeleted = function (flag) {
    this.deleted = flag;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.getShowNotification = function ()
{
    return isValid(this.showNotification) ? this.showNotification : true;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.setShowNotification = function (flag)
{
    this.showNotification = flag;
};

www_caseris_de_CaesarSchema_ChatRoomInfo.prototype.isMemberInRoom = function (guid)
{
    var members = this.getMembers();
    if (Ext.isEmpty(members))
    {
        return true;
    }

    var meFound = false;
    Ext.each(members, function (member)
    {
        if (member.getGuid() === guid)
        {
            meFound = true;
            return false;
        }
    });
    return meFound;
};