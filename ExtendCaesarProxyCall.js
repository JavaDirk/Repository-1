www_caseris_de_CaesarSchema_Call.prototype.isConnected = function ()
{
    var callState = this.getCallState();
    return callState === CallState.Connected.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isConferenced = function () {
    var callState = this.getCallState();
    return callState === CallState.Conferenced.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isOnHold = function ()
{
    var callState = this.getCallState();
    return callState === CallState.OnHold.value || callState === CallState.OnHoldPendingTransfer.value || callState === CallState.OnHoldPendingConference.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isIdle = function ()
{
    var callState = this.getCallState();
    return callState === CallState.Idle.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isRingback = function () {
    var callState = this.getCallState();
    return callState === CallState.Ringback.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isDisconnected = function ()
{
    var callState = this.getCallState();
    return callState === CallState.Disconnected.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isBusy = function ()
{
    var callState = this.getCallState();
    return callState === CallState.Busy.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isOffering = function ()
{
    var callState = this.getCallState();
    return callState === CallState.Offering.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isDialing = function () {
    var callState = this.getCallState();
    return callState === CallState.Dialing.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isDialtone = function () {
    var callState = this.getCallState();
    return callState === CallState.Dialtone.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isOnPhone = function ()
{
    return this.isConnected() || this.isConferenced() || this.isOnHold();
};


www_caseris_de_CaesarSchema_Call.prototype.isIncoming = function ()
{
    return this.getCallDirection() === CallDirection.In.value;
};

www_caseris_de_CaesarSchema_Call.prototype.isOutgoing = function ()
{
    return !this.isIncoming();
};

www_caseris_de_CaesarSchema_Call.prototype.isMissedCall = function ()
{
    return this.isIdle() && this.isIncoming() && this.getCallSuccess() !== CallState.Connected.value;
};

www_caseris_de_CaesarSchema_Call.prototype.getNumberToDisplay = function ()
{
    if (this.isNumberNotKnown())
    {
        return LANGUAGE.getString("suppressedNumber");
    }
    var possibleNumbers = [this.getDisplayNumber(), this.getNumber()];
    if (!this.isDialing() && !this.isDialtone())
    {
        possibleNumbers.push(LANGUAGE.getString("suppressedNumber"));
    }
    return getFirstValidString(possibleNumbers);
};

www_caseris_de_CaesarSchema_Call.prototype.isNumberNotKnown = function ()
{
    return Ext.create('CallFlagsNumberNotKnown', {}).isPossible(this.getCallFlags());
};

www_caseris_de_CaesarSchema_Call.prototype.isACDHistoryAvailable = function () {
    return this.getCountACDHistory() > 0;
};

www_caseris_de_CaesarSchema_Call.prototype.getCountACDHistory = function ()
{

    if (!CURRENT_STATE_CALL.getUserHistory(this.getCallId()))
    {
        return false;
    }

    var history = CURRENT_STATE_CALL.getUserHistory(this.getCallId());
    var count = 0;
    if (isValid(history, "getMailHistory()"))
    {
        count += history.getMailHistory().length;
    }
    if (isValid(history, "getCallHistory()")) {
        count += history.getCallHistory().length;
    }
    return count;
};

www_caseris_de_CaesarSchema_Call.prototype.isInternalCall = function ()
{
    return Ext.create('CallFlagsInternalCall', {}).isPossible(this.getCallFlags());
};

www_caseris_de_CaesarSchema_Call.prototype.isPrivateCall = function ()
{
    return Ext.create('CallFlagsPrivateCall', {}).isPossible(this.getCallFlags());
};

www_caseris_de_CaesarSchema_Call.prototype.isEncrypted = function ()
{
    return Ext.create('CallFlagsIsEncryptedCall', {}).isPossible(this.getCallFlags());
};

www_caseris_de_CaesarSchema_Call.prototype.getCurrentLineTime = function ()
{
    if (!isValid(this.lineTimeDate))
    {
        return 0;
    }
    var now = new Date().getTime();
    return Math.floor((now - this.lineTimeDate) / 1000);
};

www_caseris_de_CaesarSchema_Call.prototype.isACDCall = function ()
{
    return isValid(this, 'getACDCallInfo()');
};

www_caseris_de_CaesarSchema_Call.prototype.isSessionRecorded = function ()
{
    if (this.isIdle() || this.isDisconnected())
    {
        return false;
    }
    var acdInfo = this.getACDCallInfo();
    if (isValid(acdInfo))
    {
        return acdInfo.getRecordingState() === "RecordingActive";
    }
    return false;
};

www_caseris_de_CaesarSchema_Call.prototype.isCoached = function ()
{
    var acdInfo = this.getACDCallInfo();
    if (isValid(acdInfo))
    {
        return acdInfo.getCoachId() !== 0;
    }
    return false;
};

