Ext.define('CurrentState_States',
{
    presenceStateEvents: {},
    callDiversions: {},

    constructor: function ()
    {
        SESSION.addVIPListener(this);
    },

    destroy: function () {
        SESSION.removeVIPListener(this);

        this.callParent();
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.reset();
        }
    },

    reset: function ()
    {
        this.presenceStateEvents = {};
        this.callDiversions = {};
    },

    onNewEvents: function (response)
    {
        var self = this;
        if (isValid(response.getPartners()))
        {
            Ext.iterate(response.getPartners(), function (partner, index) {
                Ext.iterate(partner.getGuids(), function (guid, index)
                {
                    self.presenceStateEvents[guid] = partner;
                });
            });
        }

        if (isValid(response.getOwner()))
        {
            Ext.iterate(response.getOwner().getGuids(), function (guid, index)
            {
                self.onMyPresenceStateHasChanged(response.getOwner(), response.getOwner().getText(), guid);
            });
        }

        if (isValid(response.getOwnerCallDiversion()))
        {
            this.callDiversions[MY_CONTACT.getGUID()] = response.getOwnerCallDiversion();
        }

        if (isValid(response.getPartnerCallDiversions())) {
            Ext.each(response.getPartnerCallDiversions(), function (callDiversion) {
                if (isValid(callDiversion.getGuids())) {
                    Ext.each(callDiversion.getGuids(), function (guid) {
                        self.callDiversions[guid] = callDiversion;
                    });
                }
            });
        }

        
    },

    onSetPresenceStateSuccess: function (response, state, text, force)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            var presenceState = new www_caseris_de_CaesarSchema_CTIPresenceState();
            presenceState.setState(state);
            presenceState.setText(text);
            presenceState.setIsMobileAvailable(MY_CONTACT.getIsMobileAvailable());

            this.onMyPresenceStateHasChanged(presenceState, text, MY_CONTACT.getGUID());
        }
    },

    onMyPresenceStateHasChanged: function (state, text, guid)
    {
        var stateHasChanged = true;
        if (isValid(MY_CONTACT, "getPresenceState()") && MY_CONTACT.getPresenceState() === state.getState())
        {
            stateHasChanged = false;
        }
        this.presenceStateEvents[guid] = state;
        
        if (stateHasChanged)
        {
            this.executeAutomatedActions(state);
        }
    },

    executeAutomatedActions: function (stateEvent)
    {
        var actions = ACTIONS.getAutomatedPresenceStateActions();
        Ext.each(actions, function (action)
        {
            action.presenceStateEvent = stateEvent;
            if (action.areAllConstraintsSatisfied())
            {
                action.execute();
            }
        });
    },

    getPresenceStateEvent: function (guid) {
        return this.presenceStateEvents[guid];
    },

    getCallDiversion: function (guid)
    {
        return this.callDiversions[guid];
    }
});

var CURRENT_STATE_STATES = Ext.create('CurrentState_States', {});