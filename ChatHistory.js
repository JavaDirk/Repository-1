class ChatHistory
{
    getMessages()
    {
        return this.messages;
    }

    getContacts()
    {
        return this.contacts;
    }
}

class UserChatHistory extends ChatHistory
{
    constructor(historyFromProxy, contact)
    {
        super();

        this.historyFromProxy = historyFromProxy;

        this.contact = contact;

        this.contacts = this.getContactFromHistory(historyFromProxy);

        this.messages = Ext.Array.clean(historyFromProxy.getMessages());
    }

    getContactFromHistory(history)
    {
        if (!history)
        {
            return [];
        }
        var contactFromHistory = history.getContact();

        if (contactFromHistory && contactFromHistory.isValid())
        {
            return [contactFromHistory];
        }
        if (this.contact)
        {
            return [this.contact]; //Fall: Proxy konnte die GUID nicht auflösen, dann schickt er einen "leeren" kontakt, der nur die GUID beinhaltet
        }
        return [];
    }

    isForMe()
    {
        var contactFromHistory = this.historyFromProxy.getContact();
        return contactFromHistory && this.isForMyGuid(contactFromHistory.getGUID());
    }

    isForMyGuid(guid)
    {
        return this.getGuid() === guid;
    }

    getGuid()
    {
        return this.contact.getGUID();
    }
}

class TeamChatHistory extends ChatHistory
{
    constructor(historyFromProxy, teamChatGuid)
    {
        super();

        this.contacts = [];
        this.messages = [];

        if (!historyFromProxy)
        {
            return;
        }
        
        this.contacts = historyFromProxy.getContacts() || [];
        Ext.each(historyFromProxy.getTeamChatInfos(), function (teamChatInfo)
        {
            if (teamChatInfo.getChatReceiver().getGuid() !== teamChatGuid)
            {
                return;
            }
            this.messages = this.messages.concat(teamChatInfo.getMessages());
        }, this);
    }

    isForMe()
    {
        return !Ext.isEmpty(this.messages);
    }
}

class LiveChatHistory extends UserChatHistory
{
    isForMe()
    {
        var contactFromHistory = this.historyFromProxy.getContact();
        return this.contact && this.contact.isEqualForLiveChat(contactFromHistory);
    }
}