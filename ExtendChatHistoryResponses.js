function arePreviousMessagesAvailable(response)
{
    if (response.getReturnValue().getCode() === 0)
    {
        var history = response.getHistory();
        return history && history.getIsMoreAvailable();
    }
    return false;
}

www_caseris_de_CaesarSchema_UserChat_GetHistoryResponse.prototype.getHistory = function ()
{
    return this.getChat();
};

www_caseris_de_CaesarSchema_UserChat_GetHistoryResponse.prototype.arePreviousMessagesAvailable = function ()
{
    return arePreviousMessagesAvailable(this);
};

www_caseris_de_CaesarSchema_UserChat_GetHistoryResponse.prototype.getMessages = function ()
{
    var userChatHistory = new UserChatHistory(this.getHistory());
    return userChatHistory.getMessages();
};

//-----------------------------------------------------------------------------------------------


www_caseris_de_CaesarSchema_TeamChat_GetHistoryResponse.prototype.arePreviousMessagesAvailable = function ()
{
    return arePreviousMessagesAvailable(this);
};

www_caseris_de_CaesarSchema_TeamChat_GetHistoryResponse.prototype.getMessages = function (teamChatGuid)
{
    var teamChatHistory = new TeamChatHistory(this.getHistory(), teamChatGuid);
    return teamChatHistory.getMessages();
};

//-----------------------------------------------------------------------------------------------


www_caseris_de_CaesarSchema_UserChat_GetMediaListResponse.prototype.getHistory = function ()
{
    return this.getChat();
};

www_caseris_de_CaesarSchema_UserChat_GetMediaListResponse.prototype.arePreviousMessagesAvailable = function ()
{
    return arePreviousMessagesAvailable(this);
};

www_caseris_de_CaesarSchema_UserChat_GetMediaListResponse.prototype.getMessages = function ()
{
    var userChatHistory = new UserChatHistory(this.getHistory());
    return userChatHistory.getMessages();
};

//-----------------------------------------------------------------------------------------------


www_caseris_de_CaesarSchema_TeamChat_GetMediaListResponse.prototype.getHistory = function ()
{
    return this.getMediaList();
};

www_caseris_de_CaesarSchema_TeamChat_GetMediaListResponse.prototype.arePreviousMessagesAvailable = function ()
{
    return arePreviousMessagesAvailable(this);
};

www_caseris_de_CaesarSchema_TeamChat_GetMediaListResponse.prototype.getMessages = function (teamChatGuid)
{
    var teamChatHistory = new TeamChatHistory(this.getHistory(), teamChatGuid);
    return teamChatHistory.getMessages();
};