www_caseris_de_CaesarSchema_GetEventsResponse.prototype.getPresenceStateEventsForGuid = function (guid)
{
    var events = [];
    Ext.iterate(this.getPartners(), function (partner)
    {
        Ext.iterate(partner.getGuids(), function (partnerGuid)
        {
            if (partnerGuid === guid)
            {
                events.push(partner);
            }
        }, this);
    }, this);

    if (isValid(this.getOwner()))
    {
        Ext.iterate(this.getOwner().getGuids(), function (myGuid)
        {
            if (myGuid === guid)
            {
                events.push(this.getOwner());
            }
        }, this);
    }
    
    return events;
};

www_caseris_de_CaesarSchema_GetEventsResponse.prototype.getCallEventsForGuid = function (guid)
{
    var events = [];

    Ext.each(this.getOwnerCalls(), function (call)
    {
        if (guid === MY_CONTACT.getGUID())
        {
            events.push(call);
        }
    }, this);

    Ext.each(this.getPartnerCalls(), function (call)
    {
        if (guid === call.getOwner())
        {
            events.push(call);
        }
    }, this);

    return events;
};

www_caseris_de_CaesarSchema_GetEventsResponse.prototype.getAgentInfosForId = function (agentId)
{
    if (Ext.isEmpty(this.getAgentInfos()))
    {
        return [];
    }
    return Ext.Array.filter(this.getAgentInfos(), function (agentInfo) 
    {
        return agentId === agentInfo.getAgentId();
    });
};

www_caseris_de_CaesarSchema_GetEventsResponse.prototype.getOwnerCallEventsForCallId = function (callId)
{
    if (!this.getOwnerCalls())
    {
        return [];
    }
    return Ext.Array.filter(this.getOwnerCalls(), function (callEvent)
    {
        return callId === callEvent.getCallId();
    });
};