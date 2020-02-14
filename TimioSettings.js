var TIMIO_SETTINGS =
{

    onLogin: function (response, relogin)
    {
        if (response.getReturnValue().getCode() === 0) 
        {
            var profileJSON = response.getTimioProfile ? response.getTimioProfile() : ""; //beim reinen Anfragemanagement gibt es kein Timio-Profil
            if (isValidString(profileJSON)) 
            {
                try
                {
                    var profile = JSON.parse(profileJSON);
                    if (isValid(profile, "timioProfile")) 
                    {
                        TIMIO_SETTINGS.timioProfile = profile.timioProfile;
                    }
                }
                catch (exception)
                {
                    console.log(exception);
                }
            }
        }
    },

    getLastSelectedGroupId: function ()
    {
        return CLIENT_SETTINGS.getSetting("CONTACT_CENTER", CLIENT_SETTINGS_KEY_LAST_SELECTED_GROUP_ID) || -1;
    },

    getAgentMayChangeProfile: function ()
    {
        if (isValid(this.timioProfile, 'GENERAL.changingProfileIsAllowed'))
        {
            return this.timioProfile.GENERAL.changingProfileIsAllowed;
        }
        return true;
    },

    getSendChatViaEnterKey: function ()
    {
        return this.getClientOrProfileSetting('CHAT', 'sendWithReturn', true);
    },

    getAlwaysShowAgentState: function ()
    {
        return this.getClientOrProfileSetting("CONTACTS", "alwaysShowAgentState", false);
    },

    getMatchFlag: function ()
    {
        return this.getClientOrProfileSetting('SETTINGSPANEL', SETTINGS_MATCH_FLAG, Caesar.MatchFlag[Caesar.MatchFlag.All]);
    },

    getMatchType: function ()
    {
        return this.getClientOrProfileSetting('SETTINGSPANEL', SETTINGS_MATCH_TYPE, Caesar.MatchType[Caesar.MatchType.Begin]);
    },

    getNumberEntries: function ()
    {
        return this.getClientOrProfileSetting('SETTINGSPANEL', SETTINGS_MAX_NUMBER_ENTRIES, 20);
    },

    getStartPage: function ()
    {
        return this.getClientOrProfileSetting("GENERAL", "startPage", CLASS_CHANNEL_WELCOME);
    },

    getShowBrowserNotifications: function ()
    {
        return this.getClientOrProfileSetting("NOTIFICATIONS", "showBrowserNotifications", true);
    },

    getClientOrProfileSetting: function(namespace, key, defaultValue)
    {
        var clientSetting = CLIENT_SETTINGS.getSetting(namespace, key);
        var profileSetting;
        if (isValid(this.timioProfile, namespace + '.' + key))
        {
            profileSetting = this.timioProfile[namespace][key];
        }

        var value;
        if (this.getAgentMayChangeProfile())
        {
            value = clientSetting;
        }
        else
        {
            value = profileSetting;
        }
        if (value === null || value === undefined)
        {
            return defaultValue;
        }
        return value;
    }
};

SESSION.addVIPListener(TIMIO_SETTINGS);