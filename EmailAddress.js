class EmailAddress
{
    constructor(emailAddressString)
    {
        if (!emailAddressString)
        {
            return;
        }
        this.rawEmailAddressString = emailAddressString;
        this.splitEMailAddress(emailAddressString.trim());
    }

    equals(emailAddressString)
    {
        return isValidString(this.getPureEmailAddress()) && this.getPureEmailAddress().toUpperCase() === new EmailAddress(emailAddressString).getPureEmailAddress().toUpperCase();
    }

    getFriendlyName()
    {
        return this.friendlyName || "";
    }

    getPureEmailAddress()
    {
        return this.emailAddress || "";
    }

    getCompleteEmailAddress()
    {
        if (isValidString(this.getFriendlyName()))
        {
            return this.getFriendlyName() + " " + this.getPureEmailAddress();
        }
        return this.getPureEmailAddress();
    }

    splitEMailAddress(emailAddress)
    {
        if (!isValidString(emailAddress))
        {
            this.emailAddress = "";
            this.friendlyName = "";
        }
        var sTemp = emailAddress;
        sTemp.trim();

        var m_sEmailAddress, m_sFriendlyName;
        //divide the substring into friendly names and e-mail addresses
        var nMark = sTemp.lastIndexOf('<');
        var nMark2 = sTemp.lastIndexOf('>');
        if (nMark !== -1 && nMark2 !== -1 && nMark2 > nMark + 1)
        {
            m_sEmailAddress = sTemp.substr(nMark + 1, nMark2 - nMark - 1);
            m_sFriendlyName = sTemp.substr(0, nMark);

            //Tidy up the parsed values
            m_sFriendlyName = m_sFriendlyName.trim();
            m_sFriendlyName = this.removeQuotes(m_sFriendlyName);
            m_sEmailAddress = m_sEmailAddress.trim();
            m_sEmailAddress = this.removeQuotes(m_sEmailAddress);
        }
        else
        {
            nMark = sTemp.lastIndexOf('(');
            nMark2 = sTemp.lastIndexOf(')');
            if (nMark !== -1 && nMark2 !== -1 && nMark2 > nMark + 1)
            {
                m_sEmailAddress = sTemp.substr(0, nMark);
                m_sFriendlyName = sTemp.substr(nMark + 1, nMark2 - nMark - 1);

                //Tidy up the parsed values
                m_sFriendlyName = m_sFriendlyName.trim();
                m_sFriendlyName = this.removeQuotes(m_sFriendlyName);
                m_sEmailAddress = m_sEmailAddress.trim();
                m_sEmailAddress = this.removeQuotes(m_sEmailAddress);
            }
            else
            {
                m_sEmailAddress = sTemp;
            }
        }

        this.emailAddress = m_sEmailAddress;
        this.friendlyName = m_sFriendlyName;
    }

    removeQuotes(sValue)
    {
        var sReturn;

        var nLength = sValue.length;
        if (nLength > 2)
        {
            if (sValue[0] === '"' && sValue[nLength - 1] === '"')
            {
                sReturn = sValue.substr(1, nLength - 2);
            }
            else
            {
                sReturn = sValue;
            }
        }
        else
        {
            sReturn = sValue;
        }
        return sReturn.replace(new RegExp("\"", "g"), "\'"); //Für den Fall, dass im FriendlyName doppelte Anführungsstriche vorkommen, z.B.: "Dirk "Superman" Braun" <dirk@super.de>
    }

    getDisplayName()
    {
        if (isValidString(this.getFriendlyName()))
        {
            return this.getFriendlyName();
        }
        else
        {
            var contactName = this.getPureEmailAddress().split('@')[0];
            contactName = contactName.split(".").join(" ");
            return contactName.trim();
        }
    }
}

class EmailAddresses
{
    constructor(emailAddressesString)
    {
        this.emailAddresses = this.splitEmailAddresses(emailAddressesString);
    }

    getEmailAddresses()
    {
        return this.emailAddresses || [];
    }

    splitEmailAddresses(emailAddressesString)
    {
        if (!isValidString(emailAddressesString))
        {
            return [];
        }
        var result = [];
        var bLeftQuotationMark = false;
        var length = emailAddressesString.length;
        for (var pos = 0, start = 0; pos <= length; pos++)
        {
            if (bLeftQuotationMark && emailAddressesString[pos] !== '"')
            {
                continue;
            }
            if (bLeftQuotationMark && emailAddressesString[pos] === '"')
            {
                bLeftQuotationMark = false;
                continue;
            }
            if (emailAddressesString[pos] === '"')
            {
                bLeftQuotationMark = true;
                continue;
            }

            //Valid separators between addresses are ',' or ';'
            if (emailAddressesString[pos] === ',' || emailAddressesString[pos] === ';' || pos === length)
            {
                result.push(new EmailAddress(emailAddressesString.substring(start, pos)));
                start = pos + 1;
            }
        }
        return result;
    }

    each(callback, scope)
    {
        Ext.each(this.emailAddresses, callback, scope);
    }
}