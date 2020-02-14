www_caseris_de_CaesarSchema_AgentInfo.prototype.amILogedInGroup = function (groupId)
{
    var callGroups = [];
    var chatGroups = [];
    var mailGroups = [];

    var logedIn = false;

    if (isValid(this, 'getCallGroups()'))
    {
        callGroups = this.getCallGroups();
    }

    if (isValid(this, 'getChatGroups()'))
    {
        chatGroups = this.getChatGroups();
    }

    if (isValid(this, 'getMailGroups()'))
    {
        mailGroups = this.getMailGroups();
    }

    Ext.iterate([callGroups, chatGroups, mailGroups], function (groupIds)
    {
        Ext.iterate(groupIds, function (curGroupId)
        {
            if (parseInt(curGroupId, 10) === parseInt(groupId, 10))
            {
                logedIn = true;
            }
        });
    });

    return logedIn;
};