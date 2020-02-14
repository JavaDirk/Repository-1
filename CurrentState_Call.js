Ext.define('CurrentState_Call',
{
    callDiversion: new www_caseris_de_CaesarSchema_CallDiversionInfo(),
    callEvents: new CallEventList(),
    partnerCallEvents: new PartnerCallEventList(),
    
    userHistory: {},
    sessionInfos: new SessionInfoList(),
    lineStateEvents: new LineStateEventList(),
    lineCommandEvents: new LineCommandEventList(),

    constructor: function ()
    {
        SESSION.addVIPListener(this);
    },

    destroy: function ()
    {
        SESSION.removeVIPListener(this);

        this.callParent();
    },
    
    onLogin: function (response)
    {
        this.contact = response.getContact();

        if (response.getContact().getCallDiversionEnabled())
        {
            this.callDiversion.setDestination(response.getContact().getCallDiversionDestination());
            this.callDiversion.setDisplayNumber(response.getContact().getCallDiversionDisplayNumber());
        }
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            this.reset();
        }
    },

    reset: function()
    {
        this.callDiversion = new www_caseris_de_CaesarSchema_CallDiversionInfo();
        this.userHistory = {};
        
        this.lineStateEvents.reset();
        this.lineCommandEvents.reset();

        this.resetAllCalls();
    },

    resetAllCalls: function ()
    {
        this.sessionInfos.reset();
        this.callEvents.reset();
        this.partnerCallEvents.reset();
    },

    getMyLineId: function ()
    {
        var ctiLoginData = SESSION.getCtiLoginData();
        if (!isValid(ctiLoginData))
        {
            return -1;
        }
            
        return ctiLoginData.getLineId();
    },

    onNewEvents: function (response)
    {
        if (isValid(response.getOwnerCallDiversion()))
        {
            this.callDiversion = response.getOwnerCallDiversion();
        }

        var self = this;
        Ext.each(response.getOwnerCalls(), function (call)
        {
            if (isValid(call, 'getACDCallInfo().getHistory()'))
            {
                if (call.getACDCallInfo().getHistory().getCallHistory() || call.getACDCallInfo().getHistory().getMailHistory())
                {
                    self.userHistory[call.getCallId()] = call.getACDCallInfo().getHistory();
                }
            }

                
            self.executeAutomatedActions(call);
        });
        
        if (isValid(response.getLineStateEvents()))
        {
            if (!this.isMyLineStateOKOrBusy())
            {
                this.resetAllCalls();
            }
        }

        if (isValid(response.getSipPreferences()))
        {
            this.sipPreferences = response.getSipPreferences();
        }
    },

    isMyLineStateOKOrBusy: function ()
    {
        return this.lineStateEvents.isMyLineStateOKOrBusy();
    },

    isMyLineStateOK: function ()
    {
        return this.lineStateEvents.isMyLineStateOK();
    },

    isLineStateOK: function (guid)
    {
        return this.lineStateEvents.isLineStateOK(guid);
    },

    isMyLineStateBusy: function ()
    {
        return this.lineStateEvents.isMyLineStateBusy();
    },

    isLineStateBusy: function (guid)
    {
        return this.lineStateEvents.isLineStateBusy(guid);
    },

    deleteInformationForCall: function (callId)
    {
        var self = this;
        setTimeout(function ()
        {
            delete self.userHistory[callId];
            self.callEvents.deleteEvent(callId);
        }, 20000); //Warum erst nach 20 Sekunden? Wenn man es sofort macht, dann passiert folgendes, wenn man im CallPanel auf  Auflegen drückt: die ganzen Infos werden gelöscht, aber es kommen ja noch disconnected und idle, die dann gespeichert werden, aber nicht aufgeräumt werden => Memory Leak        
    },

    executeAutomatedActions: function (callEvent)
    {
        if (!window.ACTIONS)
        {
            return;
        }
        
        var actions = ACTIONS.getAutomatedTelephonyActionsExceptConnectedAndBusy();
        Ext.each(actions, function (action)
        {
            action.lastCallEvent = callEvent;
            if (action.areAllConstraintsSatisfied())
            {
                action.execute();
            }
        });
    },

    getSessionInfoForCallId: function (callId) 
    {
        var acdInfos = this.getACDInfoForCallId(callId);
        if (!isValid(acdInfos)) {
            return null;
        }
        return this.sessionInfos.getEvent(acdInfos.getSessionId());
    },

    getACDInfoForCallId: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent))
        {
            return null;
        }

        return lastCallEvent.getACDCallInfo();
    },

    isEventForMe: function (event)
    {
        return event.getLineId() === this.getMyLineId();
    },

    getLastCallEvent: function (callId)
    {
        return this.callEvents.getEvent(callId);
    },

    getUserHistory: function (callId)
    {
        return this.userHistory[callId];
    },

    isConferenceAllowed: function (callId)
    {
        return this.isCompleteConferenceAllowed(callId) || this.isSetupConferenceAllowed(callId);
    },
    
    isCompleteConferenceAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandCompleteConference', {}), callId);
    },
    
    isSetupConferenceAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandSetupConference', {}), callId);
    },
    
    isSwapHoldAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandSwapHold', {}), callId);
    },

    isHangUpAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandHangUp', {}), callId);
    },

    isHoldAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandHold', {}), callId);
    },
    
    isUnholdAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandUnhold', {}), callId);
    },
    
    isTransferAllowed: function (callId)
    {
        return this.isBlindTransferAllowed(callId) || this.isRedirectAllowed(callId) || this.isSetupTransferAllowed(callId);
    },
    
    isAnswerAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandAnswer', {}), callId);
    },
    
    isBlindTransferAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandBlindTransfer', {}), callId);
    },
    
    isRedirectAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandRedirect', {}), callId);
    },

    isCompleteTransferAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandCompleteTransfer', {}), callId);
    },

    isSetupTransferAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandSetupTransfer', {}), callId);
    },

    isDTMFAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandSendDTMF', {}), callId);
    },

    isCallbackAllowed: function (callId)
    {
        return this.isCallCommandAllowed(Ext.create('CallCommandCallback', {}), callId);
    },

    isCallCommandAllowed: function (callCommand, callId)
    {
        return callCommand.isPossible(this.getCallCommands(callId));
    },

    getCallCommands: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent))
        {
            return 0;
        }

        return lastCallEvent.getCallCommands();
    },

    isMakeCallAllowed: function (callId)
    {
        return this.isLineCommandAllowed(Ext.create('LineCommandMakeCall', {}), callId);
    },

    isCallDiversionAllowed: function ()
    {
        return this.isLineCommandAllowed(Ext.create('LineCommandForward', {}));
    },

    isLineCommandAllowed: function (lineCommand, callId)
    {
        return lineCommand.isPossible(this.getLineCommands(callId));
    },

    getLineCommands: function (callId)
    {
        if (isValidString(callId))
        {
            var lastCallEvent = this.getLastCallEvent(callId);
            if (isValid(lastCallEvent))
            {
                return lastCallEvent.getLineCommands();
            }
            return 0;
        }
        else
        {
            var lineCommandEvent = this.lineCommandEvents.getEvent(this.contact.getGUID());
            if (lineCommandEvent)
            {
                return lineCommandEvent.getLineCommand();
            }
            var ctiLoginData = SESSION.getCtiLoginData();
            if (isValid(ctiLoginData))
            {
                return ctiLoginData.getLineCommands();
            }
            return 0;
        }
    },

    getCallDiversionNumber: function ()
    {
        return getFirstValidString([this.callDiversion.getDisplayNumber(), this.callDiversion.getDestination()]);
    },

    isBusy: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent))
        {
            return false;
        }

        return lastCallEvent.isBusy();
    },

    isOffering: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent))
        {
            return false;
        }

        return lastCallEvent.isOffering();
    },

    isIdle: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent))
        {
            return false;
        }

        return lastCallEvent.isIdle();
    },

    isDisconnected: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent))
        {
            return false;
        }

        return lastCallEvent.isDisconnected();
    },

    isDialtone: function (callId) {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (!isValid(lastCallEvent)) {
            return false;
        }

        return lastCallEvent.isDialtone();
    },

    isOnPhone: function (guid)
    {
        var lastCallEvent = this.getLastCallEventForGUID(guid);
        if (!isValid(lastCallEvent))
        {
            return false;
        }
        if (lastCallEvent.isConnected() || lastCallEvent.isConferenced() || lastCallEvent.isOnHold())
        {
            return true;
        }
        return false;
    },

    isCallAvailable: function (guid)
    {
        var lastCallEvent = this.getLastCallEventForGUID(guid);
        if (!isValid(lastCallEvent))
        {
            return false;
        }
        if (lastCallEvent.isIdle() || lastCallEvent.isDisconnected())
        {
            return false;
        }
        return true;
    },

    isCallConferencedForGUID: function (guid)
    {
        var lastCallEvent = this.getLastCallEventForGUID(guid);
        return isValid(lastCallEvent) && lastCallEvent.isConferenced();
    },

    isCallConnectedForGUID: function (guid)
    {
        var lastCallEvent = this.getLastCallEventForGUID(guid);
        return isValid(lastCallEvent) && lastCallEvent.isConnected();
    },

    getLastCallEventForGUID: function (guid)
    {
        return this.callEvents.getLastCallEventForGUID(guid) || this.partnerCallEvents.getLastCallEventForGUID(guid);
    },

    isPickupAllowedAndPossible: function (guid)
    {
        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEventForGUID(guid);
        return isValid(lastCallEvent) && lastCallEvent.isOffering() && lastCallEvent.getPickupAllowed();
    },

    FormMustBeFilled: function()
    {
        return this.sessionInfos.FormMustBeFilled();
    },

    FormCanBeClosed: function (callId)
    {
        var sessionInfo = this.getSessionInfoForCallId(callId);
        if (isValid(sessionInfo))
        {
            return sessionInfo.FormCanBeClosed();
        }
        return true;
    },

    FormHasToBeFilled: function (callId)
    {
        var sessionInfo = this.getSessionInfoForCallId(callId);
        if (isValid(sessionInfo))
        {
            return sessionInfo.isFormFillingRequired();
        }
        return false;
    },

    hasNoForm: function (callId)
    {
        var sessionInfo = this.getSessionInfoForCallId(callId);
        if (isValid(sessionInfo))
        {
            return sessionInfo.hasNoForm();
        }
        return true;
    },

    isFormSavingRequired: function (callId)
    {
        var sessionInfo = this.getSessionInfoForCallId(callId);
        if (isValid(sessionInfo))
        {
            if (sessionInfo.getFormState() === FormState.NoForm.value || sessionInfo.getFormState() === FormState.FormCanceled.value)
            {
                return false;
            }
            return true;
        }
        return false;
    },

    isSessionFinished: function (callId)
    {
        var sessionInfo = this.getSessionInfoForCallId(callId);
        if (!isValid(sessionInfo) || sessionInfo.isFinished())
        {
            return true;
        }
        return false;
    },

    isStartRecordingPossible: function (callId)
    {
        return this.isRecordingActionPossible(callId, "Start");
    },

    isStopRecordingPossible: function (callId)
    {
        return this.isRecordingActionPossible(callId, "Stop");
    },

    isRecordingActionPossible: function (callId, action)
    {
        if (this.isIdle(callId) || this.isDisconnected(callId))
        {
            return false;
        }
        var sessionInfo = this.getSessionInfoForCallId(callId);
        if (isValid(sessionInfo, "getRecordingAction()"))
        {
            var possibleActions = sessionInfo.getRecordingAction();
            if (Ext.Array.contains(possibleActions, action))
            {
                return true;
            }
        }
        return false;
    },

    isSessionRecorded: function (callId)
    {
        var callEvent = this.getLastCallEvent(callId);
        if (!isValid(callEvent))
        {
            return false;
        }
        return callEvent.isSessionRecorded();
    },

    isSessionCoached: function (callId)
    {
        var callEvent = this.getLastCallEvent(callId);
        if (!isValid(callEvent))
        {
            return false;
        }

        return callEvent.isCoached();
    },

    isSessionEncrypted: function (callId)
    {
        var callEvent = this.getLastCallEvent(callId);
        if (!isValid(callEvent))
        {
            return false;
        }
        return callEvent.isEncrypted();
    },

    isContactCenterTransferPossible: function (callId)
    {
        if (this.isIncomingContactCenterCall(callId) && this.areForwardTargetsConfigured(callId) && !this.isIdle(callId) && !this.isDisconnected(callId))
        {
            return true;
        }
        return false;
    },

    isIncomingContactCenterCall: function (callId)
    {
        return this.isContactCenterCall(callId) && this.isIncoming(callId);
    },

    isContactCenterCall: function (callId)
    {
        var callEvent = this.getLastCallEvent(callId);
        if (isValid(callEvent))
        {
            return isValid(callEvent, "getACDCallInfo()");
        }
        return false;
    },

    isIncoming: function (callId)
    {
        var callEvent = this.getLastCallEvent(callId);
        if (isValid(callEvent))
        {
            return callEvent.isIncoming();
        }
        return false;
    },

    areForwardTargetsConfigured: function (callId)
    {
        var acdInfos = this.getACDInfoForCallId(callId);
        if (!isValid(acdInfos))
        {
            return false;
        }
        var groupId = acdInfos.getGroupId();
        var agents = CURRENT_STATE_CONTACT_CENTER.getCallTransferAgentsForGroup(groupId);
        var groups = CURRENT_STATE_CONTACT_CENTER.getCallTransferGroupsForGroup(groupId);

        if (Ext.isEmpty(agents) && Ext.isEmpty(groups))
        {
            return false;
        }
        return true;
    },

    isInternalCall: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (isValid(lastCallEvent))
        {
            return lastCallEvent.isInternalCall();
        }
        return true;
    },

    isACDCall: function (callId)
    {
        var lastCallEvent = this.getLastCallEvent(callId);
        if (isValid(lastCallEvent) && isValid(lastCallEvent.getACDCallInfo()))
        {
            return true;
        }
        return false;
    },

    getSipPreferences: function ()
    {
        return this.sipPreferences;
    }
});

var CURRENT_STATE_CALL = Ext.create('CurrentState_Call', {});