Ext.define('Address',
{
    extend: 'Ext.Component',

    contact: {},

    toString: function ()
    {
        var firstLine = this.getFirstLine();
        var secondLine = this.getSecondLine();

        if (isValidString(firstLine) && isValidString(secondLine))
        {
            return firstLine + ", " + secondLine;
        }

        if (isValidString(firstLine))
        {
            return firstLine;
        }
 
        return secondLine;
    },

    getFirstLine: function ()
    {
        return this.getStreet().trim();
    },

    getSecondLine: function ()
    {
        var result = "";
        if (isValidString(this.getZIP()))
        {
            result += this.getZIP() + " " + this.getCity();
        }
        else if (isValidString(this.getCity()))
        {
            result += this.getCity();
        }
        return result.trim();
    },

    toArray: function ()
    {
        return [this.getFirstLine(), this.getSecondLine()];
    }
});

Ext.define('HomeAddress',
{
    extend: 'Address',

    getStreet: function ()
    {
        return this.contact.getHomeStreet() || "";
    },

    getZIP: function ()
    {
        return this.contact.getHomeZIP() || "";
    },

    getCity: function ()
    {
        return this.contact.getHomeCity() || "";
    },

    getCountry: function ()
    {
        return this.contact.getHomeCountry() || "";
    }
});


Ext.define('OfficeAddress',
{
    extend: 'Address',

    getStreet: function ()
    {
        return this.contact.getOfficeStreet() || "";
    },

    getZIP: function ()
    {
        return this.contact.getOfficeZIP() || "";
    },

    getCity: function ()
    {
        return this.contact.getOfficeCity() || "";
    },

    getCountry: function ()
    {
        return this.contact.getOfficeCountry() || "";
    },

    toArray: function ()
    {
        return [this.contact.getCompany(), this.getFirstLine(), this.getSecondLine()];
    }
});

Ext.define('GlobalInfoAddress',
{
    extend: 'Address',

    getStreet: function ()
    {
        return "";
    },

    getZIP: function ()
    {
        return "";
    },

    getCity: function ()
    {
        return this.contact.City || "";
    },

    getCountry: function ()
    {
        return this.contact.Country || "";
    },

    toArray: function ()
    {
        return [this.getFirstLine(), this.getSecondLine()];
    }
});



