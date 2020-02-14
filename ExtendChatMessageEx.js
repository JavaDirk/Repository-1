www_caseris_de_CaesarSchema_ChatMessageEx.prototype.getMessageId = function ()
{
    return this.getId();
};

www_caseris_de_CaesarSchema_ChatMessageEx.prototype.getTime = function ()
{
    return this.getUtcTime();
};

www_caseris_de_CaesarSchema_ChatMessageEx.prototype.isOutgoing = function ()
{
    return this.getSenderGuid() === MY_CONTACT.getGUID();
};
