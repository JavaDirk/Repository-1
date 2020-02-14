www_caseris_de_CaesarSchema_Addressbook.prototype.getDisplayName = function ()
{
    var name = this.getName();
    return this.isInternal() ? LANGUAGE.getString("colleagues") : name;
};

www_caseris_de_CaesarSchema_Addressbook.prototype.isInternal = function ()
{
    var name = this.getName();
    return name === "CAESAR Directory" || name === '[internal]';
};