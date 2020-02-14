Ext.define('Language', 
{
    constructor: function ()
    {
        var cookie = LOCAL_STORAGE.getItem('Language');
        if (isValidString(cookie))
        {
            this.applyLanguage(cookie);
        }
        else
        {
            var browserLanguage = (window.navigator.language) ? window.navigator.language : window.navigator.userLanguage;
            if (browserLanguage.substring(0, 2) === "en")
            {
                this.applyLanguage("UnitedKingdom");
            }
            else
            {
                this.applyLanguage("Germany");
            }
        }

        this.callParent(arguments);
    },

    setProxySession : function (session)
    {
        session.addListener(this);
    },

    onLogin : function (response)
    {
        if (!isValid(response) && !isValid(response.getContact())) {
            return;
        }
        var me = response.getContact();
        var myLanguage = me.getLanguage();
        this.saveLanguage(myLanguage);
        this.applyLanguage(myLanguage);
    },

    saveLanguage : function (languageText)
    {
        if (this.isGerman(languageText))
        {
            LOCAL_STORAGE.setItem('Language', "Germany");
        }
        else
        {
            LOCAL_STORAGE.setItem('Language', "UnitedKingdom");
        }
    },
	
    applyLanguage: function (languageText)
    {
        this.languageMapping = de;
        
        if (this.isGerman(languageText))
        {
            this.language = "de";
            this.languageMapping = de;
        }
        else
        {
            this.language = "en";
            this.languageMapping = en;
        }
    },

    getString: function (stringName)
    {
        var result = this.languageMapping[stringName];
        if (isValid(result))
        {
            for (var i = 1; i < arguments.length; ++i)
            {
                result = result.replace("{" + (i - 1) + "}", arguments[i]);
            }
            return result;
        }
        console.log("No string available for " + '"' + stringName + '"');
        return "";
    },

    isGerman : function (languageText)
    {
        return !isValid(languageText) || languageText === "Germany" || languageText === "Standard";
    },

    getLanguage: function ()
    {
        return this.language;
    }
});

var LANGUAGE = Ext.create('Language', {});