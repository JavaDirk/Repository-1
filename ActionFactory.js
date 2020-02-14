Ext.define('ActionFactory',
{
    createAction: function (actionConfig) {
        switch (actionConfig.Action) {
            case ACTION_TELEPHONY_DIAL:
                return Ext.create('Action_Dial', actionConfig);
            case ACTION_TELEPHONY_HANGUP:
                return Ext.create('Action_HangUp', actionConfig);
            case ACTION_TELEPHONY_REDIRECT:
                return Ext.create('Action_Redirect', actionConfig);
            case ACTION_TELEPHONY_FORWARD:
                return Ext.create('Action_Forward', actionConfig);
            case ACTION_TELEPHONY_SENDDTMF:
                return Ext.create('Action_SendDTMF', actionConfig);
            case ACTION_OPENURL:
                return Ext.create('Action_OpenURL', actionConfig);
            default:
                break;
        }
        console.log("no action for action config!", actionConfig);
        return null;
    }
});

