www_caseris_de_CaesarSchema_SessionInfo.prototype.isFinished = function ()
{
    return this.getSessionState() === "Finished" || this.getSessionState() === "Revoked";
};

www_caseris_de_CaesarSchema_SessionInfo.prototype.isFormFinished = function ()
{
    if (this.hasNoForm())
    {
        return true;
    }

    if (this.isFinished())
    {
        return true;
    }
    
    if (this.isFormFilled())
    {
        return true;
    }

    return !this.isFormFillingRequired();
};

www_caseris_de_CaesarSchema_SessionInfo.prototype.FormCanBeClosed = function ()
{
    if (this.hasNoForm())
    {
        return true;
    }

    if (this.isFinished())
    {
        return true;
    }

    switch (this.getSessionState())
    {
        case "PostProcessing":
        case "Connected":
            return false;
    }
    
    if (this.isFormFilled())
    {
        return true;
    }

    return !this.isFormFillingRequired();
};

www_caseris_de_CaesarSchema_SessionInfo.prototype.isFormFillingRequired = function ()
{
    return this.getFormState() === FormState.FormMissingFields.value;
};

www_caseris_de_CaesarSchema_SessionInfo.prototype.isFormFilled = function ()
{
    return this.getFormState() === FormState.FormFilled.value;
};

www_caseris_de_CaesarSchema_SessionInfo.prototype.hasNoForm = function (callId)
{
    return this.getFormState() === FormState.NoForm.value;
};