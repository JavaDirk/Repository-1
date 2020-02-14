Ext.define('Actions',
{
    allActions: [],

    constructor: function () 
    {
        this.callParent();
        SESSION.addVIPListener(this);
    },

    destroy: function () 
    {
        SESSION.removeVIPListener(this);

        this.callParent();
    },

    reset: function () 
    {
        this.allActions = [];
    },

    onLogin: function (response, relogin)
    {
        if (response.getReturnValue().getCode() === 0) 
        {
            this.reset();

            if (isValid(response.getTimioProfile))
            {
                var profileJSON = response.getTimioProfile();
                if (isValidString(profileJSON)) 
                {
                    try
                    {
                        var profile = JSON.parse(profileJSON);
                        if (isValid(profile, "timioProfile.actions")) 
                        {
                            var actionFactory = Ext.create('ActionFactory', {});
                            var self = this;
                            Ext.each(profile.timioProfile.actions, function (actionConfig)
                            {
                                self.allActions.push(actionFactory.createAction(actionConfig));
                            });
                        }
                    }
                    catch (exception)
                    {
                        console.log(exception);
                    }
                    
                }
            }
        }
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            this.reset();
        }
    },

    getActionsForWelcomePage: function () 
    {
        return this.getManualActions(ACTION_PAGE_START);
    },

    getActionsForCallPanel: function () 
    {
        return this.getManualActions(ACTION_PAGE_CALL);
    },

    getActionsForContactPanel: function ()
    {
        return this.getManualActions(ACTION_PAGE_CONTACT);
    },

    getActionsForNotification: function ()
    {
        var result = [];
        Ext.each(this.allActions, function (action)
        {
            if (action.config.Type !== ACTION_TYPE_CALLNOTIFICATION)
            {
                return;
            }

            if (action.isActionAllowedByTimioFeature())
            {
                result.push(action);
            }
        });
        return result;
    },

    getManualActions: function (pageType)
    {
        var result = [];
        Ext.each(this.allActions, function (action)
        {
            if (action.config.PageType !== pageType || action.config.Type !== ACTION_TYPE_MANUELL)
            {
                return;
            }

            if (action.isActionAllowedByTimioFeature())
            {
                result.push(action);
            }
        });
        return result;
    },

    getAutomatedTelephonyActionsExceptConnectedAndBusy: function ()
    {
        return this.getAutomatedActions([ACTION_TYPE_RING, ACTION_TYPE_NORESPONSE, ACTION_TYPE_CALLEND, ACTION_TYPE_HANGON]);
    },

    getAutomatedTelephonyActionsForConnectedAndBusy: function ()
    {
        return this.getAutomatedActions([ACTION_TYPE_CONNECTED, ACTION_TYPE_OCCUPIED]);
    },

    getAutomatedPresenceStateActions: function ()
    {
        return this.getAutomatedActions([ACTION_TYPE_PRESENCESTATE]);
    },

    getAutomatedActionsOnStartup: function ()
    {
        return this.getAutomatedActions([ACTION_TYPE_ON_STARTUP]);
    },

    getAutomatedActionsOnEnd: function ()
    {
        var actions = this.getAutomatedActions([ACTION_TYPE_PRESENCESTATE]);
        var result = [];
        Ext.each(actions, function (action)
        {
            if (action.config.PresenceState === ACTION_PRESENCESTATE_OFFLINE)
            {
                result.push(action);
            }
        });
        return result;
    },

    getAutomatedActions: function (actionTypes)
    {
        var result = [];
        Ext.each(this.allActions, function (action)
        {
            if (!Ext.Array.contains(actionTypes, action.config.Type) || !action.config.Active)
            {
                return;
            }

            if (action.isActionAllowedByTimioFeature())
            {
                result.push(action);
            }
        });
        return result;
    }
});

var ACTIONS = Ext.create('Actions', {});