//valid bedeutet, dass zumindest ein member nicht null oder undefined ist
www_caseris_de_CaesarSchema_CTIContact.prototype.isValid = function ()
{
    var valid = false;
    var isPropertyValid = function (key)
    {
        if (isValid(this[key]) && key !== "typeMarker")
        {
            valid = true;
        }
    };
    Ext.each(Object.keys(this), isPropertyValid, this);
    return valid;
};

www_caseris_de_CaesarSchema_CTIContact.prototype.isOnlyANumber = function ()
{
    if(isValidString(this.getNumber()) || isValidString(this.getCanonicalNumber()))
    {
        var otherAttributes = [this.getCity(), this.getCompany(), this.getDepartment(), this.getName()];
        var filteredArray = Ext.Array.filter(otherAttributes, function (string)
        {
            return isValidString(string);
        });
        if (Ext.isEmpty(filteredArray))
        {
            return true;
        }
    }
    return false;
};