www_caseris_de_CaesarSchema_CTIPresenceState.prototype.getState = function () 
{
    if (this.isOnPhone())
    {
        return PresenceState.OnPhone.value;
    }
        
    return this.State;
};

www_caseris_de_CaesarSchema_CTIPresenceState.prototype.getStateWithoutOnPhone = function ()
{
    return this.State;
};

www_caseris_de_CaesarSchema_CTIPresenceState.prototype.getText = function () 
{
    if (this.isOnPhone())
    {
        return PresenceState.OnPhone.text;
    }
    return this.Text;
};

www_caseris_de_CaesarSchema_CTIPresenceState.prototype.isOnPhone = function ()
{
    var onPhoneStates = [Caesar.CallState.Connected, Caesar.CallState.Conferenced, Caesar.CallState.OnHold];
    return onPhoneStates.indexOf(this.getCallState()) >= 0;
};

www_caseris_de_CaesarSchema_CTIPresenceState.prototype.getFirstGuid = function () 
{
    if (isValid(this, "getGuids"))
    {
        var guids = this.getGuids();
        if (!Ext.isEmpty(guids))
        {
            return guids[0];
        }
    }
    return "";
};