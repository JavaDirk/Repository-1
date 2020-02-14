const ID_ERROR_MESSAGE_SET_TO_NOT_AVAILABLE = 'automaticallySetToNotAvailable';
const ID_ERROR_MESSAGE_AGENT_DEACTIVATED = 'yourAgentWasDeactivated';

class GlobalContactCenterEventListener extends GlobalEventListener
{
    onLogoutSuccess(response) 
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorNotEnoughAgents.value) 
        {
            showConfirmation(Ext.create('ConfirmationComponent',
            {
                yesCallback: function ()
                {
                    SESSION.logout(true);
                },
                noCallback: Ext.emptyFn,
                errorMessageText: response.getReturnValue().getDescription()
            }));
        }
    }

    onNewEvents(response)
    {
        Ext.each(response.getAgentInfosForId(CURRENT_STATE_CONTACT_CENTER.getMyAgentId()), function (agentInfo) 
        {
            this.updateDeactivationMessageWasDisplayed(agentInfo);
            if (isValidString(agentInfo.getMessage()) && !this.wasDeactivationMessageDisplayed())
            {
                showWarningMessage(agentInfo.getMessage(), null, ID_ERROR_MESSAGE_AGENT_DEACTIVATED);
                this.setDeactivationMessageWasDisplayed(true);
            }
            if (!agentInfo.getDeactivated())
            {
                removeErrorMessage(ID_ERROR_MESSAGE_AGENT_DEACTIVATED);
            }

            if (agentInfo.getAgentState() === AgentState.NotAvailable.value)
            {
                var agentStateReasons =
                [
                    AgentStateReason.AdminManual.value,
                    AgentStateReason.ServerNoAnswer.value,
                    AgentStateReason.ServerNoAnswerNoAutoAv.value
                ];
                if (Ext.Array.contains(agentStateReasons, agentInfo.getAgentStateReason()))
                {
                    showInfoMessage(LANGUAGE.getString("systemChangedYourAgentState", LANGUAGE.getString("acdAgentsNotAvailable")), null, ID_ERROR_MESSAGE_SET_TO_NOT_AVAILABLE);
                }
            }
            else
            {
                removeErrorMessage(ID_ERROR_MESSAGE_SET_TO_NOT_AVAILABLE);
            }

        }, this);
    }

    updateDeactivationMessageWasDisplayed(agentInfo)
    {
        if (!agentInfo)
        {
            return;
        }
        if (this.deactivationMessageWasDisplayed && !agentInfo.getDeactivated())
        {
            this.deactivationMessageWasDisplayed = false;
        }
    }

    setDeactivationMessageWasDisplayed(flag)
    {
        this.deactivationMessageWasDisplayed = flag;
    }

    wasDeactivationMessageDisplayed()
    {
        return this.deactivationMessageWasDisplayed;
    }
}

