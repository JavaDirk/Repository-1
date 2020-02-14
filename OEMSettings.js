Ext.define('OEM_Settings',
{
    extend: 'Ext.Component',

    initComponent: function ()
    {
        this.callParent();

        SESSION.addVIPListener(this);       
    },

    destroy: function ()
    {
        SESSION.removeVIPListener(this);
        this.callParent();
    },

    loadSettings: function ()
    {
        this.load(this.getTenantFromURL());
    },

    getTenantFromURL: function ()
    {
        var currentUrl = new URL(window.location.href.toLowerCase());
        return currentUrl.searchParams.get('tenant');
    },

    load: function (tenant)
    {
        SESSION.loadOEMSettings(tenant);
    },

    onFinished: function ()
    {

    },

    onLoadOEMSettingsSuccess: function (response)
    {
        this.settings = response;

        createGlobalColorConstants(this.getMainColor());
        syncColorsForInternalAndExternal();

        this.onFinished();
    },

    onLoadOEMSettingsException: function ()
    {
        this.onFinished();
    },

    getTitle: function ()
    {
        return this.getValue("Appearance", "title") || 'timio by CAESAR';
    },

    getWelcomePageBackgroundImage: function ()
    {
        return this.getValue("Appearance", "welcomePageBackgroundImage") || 'images/background.jpg';
    },

    getLogoFavicon: function ()
    {
        return this.getValue("Appearance", "logoFavicon") || 'images/FavIcon.gif';
    },

    getLogoLoginMask: function ()
    {
        return this.getValue("Appearance", "logoLoginMask") || 'Images/Timio_weiss.svg';
    },

    getLogoHeaderBar: function ()
    {
        return this.getValue("Appearance", "logoHeaderBar") || 'Images/Timio_weiss.svg';
    },

    getSmallLogoHeaderBar: function ()
    {
        return this.getValue("Appearance", "smallLogoHeaderBar") || 'Images/Timio_white_small.svg';
    },

    getLogoSettings: function ()
    {
        return this.getValue("Appearance", "logoSettings") || 'Images/TimioLargeLogo.png';
    },

    getMainColor: function ()
    {
        var color = new Ext.draw.Color();
        var rgbString = this.getValue("Appearance", "mainColor");
        color.setFromString(rgbString);
        if (Ext.isNumeric(color.r) && Ext.isNumeric(color.g) && Ext.isNumeric(color.b))
        {
            return color;
        }
        return DARKEST_BLUE;
    },

    getPositionForWelcomeHeader: function ()
    {
        var possibleValues = ["start", "center", "end"];
        var value = this.getValue("Appearance", "positionWelcomeHeader");
        if (Ext.Array.contains(possibleValues, value))
        {
            return value;
        }
        return 'start';
    },

    getSupportEMailAddress: function ()
    {
        return this.getValue("Support", "EmailAddress") || 'service@caseris.de';
    },

    getSupportWebsite: function ()
    {
        return this.getValue("Support", "Website") || 'www.caseris.de';
    },
    
    getSoundFile: function ()
    {
        return this.getValue("LiveNotifications", "audioFile") || "Notifications/message.wav";
    },

    getValue: function (sectionName, key)
    {
        var value = '';
        Ext.each(this.settings, function (setting)
        {
            if (setting.section === sectionName)
            {
                Ext.each(setting.values, function (keyValuePair)
                {
                    if (keyValuePair.entry === key)
                    {
                        value = keyValuePair.value;
                        return false;
                    }
                });
            }
        });
        return value;
    }
});
