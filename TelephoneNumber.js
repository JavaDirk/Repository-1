class TelephoneNumber
{
    constructor(number, allowJoker = false)
    {
        this.rawNumber = number;
        this.allowJoker = allowJoker;
        this.normalizedNumber = this.normalizeNumber(number);
    }

    equals(number)
    {
        return isValidString(this.normalizedNumber) && this.normalizedNumber === this.normalizeNumber(number);
    }

    toString()
    {
        return this.normalizedNumber;
    }

    isMobileNumber()
    {
        var possibleMobileNumberPrefixes = ["015", "016", "017", "+4915", "+4916", "+4917"];
        var mobileNumber = false;
        Ext.each(possibleMobileNumberPrefixes, function (prefix)
        {
            if (this.startsWith(prefix))
            {
                mobileNumber = true;
                return false;
            }
        }, this);

        return mobileNumber;
    }

    startsWith(number)
    {
        return Ext.String.startsWith(this.normalizedNumber, this.normalizeNumber(number));
    }

    contains(number)
    {
        return this.indexOf(number) >= 0;
    }

    indexOf(number)
    {
        return this.normalizedNumber.indexOf(this.normalizeNumber(number));
    }

    normalizeNumber(number)
    {
        if (!isValidString(number))
        {
            return "";
        }
        var result = "";
        for (var i = 0; i < number.length; ++i)
        {
            var character = number[i];
            if (isDigit(character))
            {
                result += character;
            }
            if (this.allowJoker && character === "*")
            {
                result += character;
            }
        }
        if (isValidString(result))
        {
            if (number[0] === '+')
            {
                result = '+' + result;
            }
        }
        return result;
    }
}

class TelephoneNumbers
{
    constructor(numbers)
    {
        if (!numbers)
        {
            this.telephoneNumbers = [];
            return;
        }
        this.telephoneNumbers = Ext.Array.map(numbers, function (number)
        {
            return new TelephoneNumber(number);
        });

        this.telephoneNumbers = this.telephoneNumbers.filter(function (number)
        {
            return isValidString(number.toString());
        });

        this.telephoneNumbers = Ext.Array.unique(this.telephoneNumbers);
    }

    contains(number)
    {
        return this.indexOf(number) >= 0;
    }

    indexOf(number)
    {
        var foundIndex = -1;
        Ext.each(this.telephoneNumbers, function (telephoneNumber, index)
        {
            if (telephoneNumber.equals(number))
            {
                foundIndex = index;
                return false;
            }
        });
        return foundIndex;
    }

    each(callback)
    {
        Ext.each(this.telephoneNumbers, callback, this);
    }

    toArray()
    {
        return this.telephoneNumbers.map(function (number)
        {
            return number.toString();
        });
    }

    removeDuplicateNumbers()
    {
        return this.toArray(); //das entfernen der Duplikate wird schon im Konstructor gemacht
    }

    sharesTelephoneNumber(telephoneNumbers)
    {
        var convertedTelephoneNumbers = new TelephoneNumbers(telephoneNumbers);
        var intersection = Ext.Array.intersect(this.toArray(), convertedTelephoneNumbers.toArray());
        if (!Ext.isEmpty(intersection))
        {
            return true;
        }
    }
}