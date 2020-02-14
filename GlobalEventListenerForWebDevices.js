class GlobalEventListenerForWebDevices
{
    constructor(deviceManager)
    {
        SESSION.addListener(this);
        this.deviceManager = deviceManager;
    }

    async onLogin(response, relogin)
    {
        
    }

    async initDeviceManager()
    {
        if (!this.deviceManager)
        {
            return;
        }

        try
        {
            await this.deviceManager.init({
                audio: true,
                video: false,
                language: LANGUAGE.getLanguage()
            });

            if (SESSION.isSIPMode())
            {
                this.checkAvailabilityOfPhoneDevices();
            }
            
            this.addEventListeners();                        
        }
        catch (err)
        {
            console.warn("Can't get web devices: ", err);
            if (this.isInsecureContext())
            {
                this.showErrorForInsecureContext();
                return;
            }
                
            switch (err.name)
            {
                case "NotAllowedError":
                    this.showErrorForDevicesNotAllowed();
                    break;
                case "NotFoundError":
                case "OverconstrainedError":
                    this.showErrorForDevicesNotFound();
                    break;
                case "AbortError":
                case "NotReadableError":
                    this.showErrorForNoAccessToDevices();
                    break;
                case "SecurityError":
                    this.showErrorForSecurityError();
                    break;
                case "TypeError":
                    this.showErrorForUnknownError();
                    break;
            }
        }
    }

    isInsecureContext()
    {
        return location.protocol === "http:";
    }

    checkAvailabilityOfPhoneDevices()
    {
        if (this.checkForPhoneDevices())
        {
            this.hideErrorForDevicesNotFound();
        }
        else
        {
            this.showErrorForDevicesNotFound();
        }
    }

    checkForPhoneDevices()
    {
        var installedDevices = DEVICEMANAGER.getInstalledDevices();
        let phoneDevices = installedDevices.phoneDevices;
        let microphones = installedDevices.microphones;
        return phoneDevices.length > 0 || microphones.length > 0;
    }

    addEventListeners()
    {
        if (!this.deviceManager)
        {
            return;
        }
        this.onCallAnswer = async (customEvent) =>
        {
            this.answerCall(customEvent.detail.id);
        };
        this.deviceManager.addEventListener("callAnswer", this.onCallAnswer);

        this.onCallHangUp = async (customEvent) =>
        {
            this.hangUp(customEvent.detail.id);
        };
        this.deviceManager.addEventListener("callHangup", this.onCallHangUp);

        this.onCallHold = async (customEvent) =>
        {
            SESSION.hold(customEvent.detail.id, this.createCallbackForSuccess(), () => { this.showError_holdException(); });
        };
        this.deviceManager.addEventListener("callHold", this.onCallHold);

        this.onCallUnhold = async (customEvent) =>
        {
            SESSION.unhold(customEvent.detail.id, this.createCallbackForSuccess(), () => { this.showError_unholdException(); });
        };
        this.deviceManager.addEventListener("callUnhold", this.onCallUnhold);

        this.onCallSwap = async (customEvent) =>
        {
            this.swapHold();
        };
        this.deviceManager.addEventListener("callSwapHold", this.onCallSwap);

        this.onSelectedDevicesChange = async (customEvent) =>
        {
                
        };
        this.deviceManager.addEventListener("selectedDevicesChanged", this.onSelectedDevicesChange);

        this.onAvailableDevicesChange = async (customEvent) =>
        {
            this.checkAvailabilityOfPhoneDevices();
        };
        this.deviceManager.addEventListener("availableDevicesChanged", this.onAvailableDevicesChange);

        this.onBatteryState = (evt) =>
        {
            var batteryState = evt.detail;
            if (batteryState.low && !batteryState.charging)
            {
                this.showErrorForLowBattery(batteryState.level);
            }
            else
            {
                this.hideErrorForLowBattery();
            }
            
        };
        this.deviceManager.addEventListener("deviceBatteryState", this.onBatteryState);
    }

    removeEventListeners()
    {
        if (!this.deviceManager)
        {
            return;
        }
        this.deviceManager.removeEventListener("callAnswer", this.onCallAnswer);
        this.deviceManager.removeEventListener("callHangup", this.onCallHangUp);
        this.deviceManager.removeEventListener("callHold", this.onCallHold);
        this.deviceManager.removeEventListener("callUnhold", this.onCallUnhold);
        this.deviceManager.removeEventListener("callSwapHold", this.onCallSwap);
        this.deviceManager.removeEventListener("selectedDevicesChanged", this.onSelectedDevicesChange);
        this.deviceManager.removeEventListener("availableDevicesChanged", this.onAvailableDevicesChange);
        this.deviceManager.removeEventListener("deviceBatteryState", this.onBatteryState);
    }

    createCallbackForSuccess()
    {
        return (response) =>
        {
            if (response.getReturnValue().getCode() !== 0)
            {
                this.showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            }
        };
    }

    async onLogoutSuccess(response) 
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value && this.deviceManager) 
        {
            await this.deviceManager.deinit();

            this.removeEventListeners();
        }
    }

    onNewEvents(response)
    {
        if (isValid(response.getCtiLoginData()))
        {
            if (SESSION.isSIPMode())
            {
                if (this.deviceManager)
                {
                    if (this.isSoftphoneOrWebRtcAllowed())
                    {
                        this.initDeviceManager();
                    }
                }
                else
                {
                    //wenn wir keine DeviceManager haben, konnte er anscheinend nicht angelegt werden
                    //das kann passieren, wenn man mit http unterwegs ist oder wenn webRtc nicht unterstützt wird
                    if (this.isInsecureContext())
                    {
                        this.showErrorForInsecureContext();
                    }
                    else
                    {
                        this.showErrorForWebRtcNotSupported();
                    }
                }
            }
            else
            {
                this.initDeviceManager(); //im CTI-Modus brauchen wir den DeviceManager für die Busylights
            }
        }

        if (!this.deviceManager)
        {
            return;
        }

        Ext.each(response.getOwnerCalls(), function (callEvent)
        {
            if (callEvent.getCallEventReason() === "Acd")
            {
                return;
            }
            var call =
            {
                type: SESSION.isSIPMode() ? WebDevice.CallType.SIP : WebDevice.CallType.CTI,
                id: callEvent.getCallId(),
                state: callEvent.getCallState(),
                contact: callEvent.getCaller(),
                direction: this.convertCallDirection(callEvent.isIncoming())
            };
            this.deviceManager.setCall(call);
                
        }, this);
    }

    convertCallDirection(callDirection)
    {
        switch (callDirection)
        {
            case CallDirection.In.value:
                return WebDevice.CallDirection.In;
            case CallDirection.Out.value:
                return WebDevice.CallDirection.Out;
            default:
                return WebDevice.CallDirection.Unknown;
        }
    }

    answerCall(callId)
    {
        SESSION.answer(callId, (response) =>
        {
            this.onAnswerSuccess(response);
        }, () =>
        {
            this.onAnswerException();
        });
    }

    swapHold()
    {
        SESSION.swapHold(0, 0, (response) =>
        {
            this.onSwapHoldSuccess(response);
        }, () =>
        {
            this.onSwapHoldException();
        });
    }

    hangUp(callId)
    {
        SESSION.hangUp(callId, (response) =>
        {
            this.onHangUpSuccess(response);
        }, () =>
        {
            this.onHangUpException(response);
            
        });
    }

    //@override
    //success callback für den answer Aufruf
    onHangUpSuccess(response)
    {
        this.createCallbackForSuccess()(response);
    }

    //@override
    //exception callback für den answer Aufruf
    onHangUpException()
    {
        this.showError_hangUpException();
    }

    //@override
    //success callback für den answer Aufruf
    onAnswerSuccess(response)
    {
        this.createCallbackForSuccess()(response);
    }

    //@override
    //exception callback für den answer Aufruf
    onAnswerException()
    {
        this.showError_answerException();
    }

    //@override
    //success callback für den swapHold Aufruf
    onSwapHoldSuccess(response)
    {
        this.createCallbackForSuccess()(response);
    }

    //@override
    //exception callback für den swapHold Aufruf
    onSwapHoldException()
    {
        this.showError_swapHoldException();
    }

    //@override
    //Ist denn Softphone oder WebRtc erlaubt? Bei timio24 abhängig von der gebuchten Lizenz
    isSoftphoneOrWebRtcAllowed()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass man nicht auf die Devices zugreifen konnte
    showErrorForDevicesNotAllowed()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass keine Devices gefunden werden konnten
    showErrorForDevicesNotFound()
    {

    }

    //@override
    //vorherige Fehlermeldung (keine Devices gefunden) wieder entfernen
    hideErrorForDevicesNotFound()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass http statt https genutzt wird
    showErrorForInsecureContext()
    {

    }

    //@override
    showErrorForSecurityError()
    {

    }

    //@override
    //generische Fehlermeldung anzeigen
    showErrorForUnknownError()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass man nicht auf die Devices zugreifen konnte
    showErrorForNoAccessToDevices()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass WebRtc nicht unterstützt wird
    showErrorForWebRtcNotSupported()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass ein Halten der Verbindung eine Exception ausgelöst hat
    showError_holdException()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass ein Heranholen der Verbindung eine Exception ausgelöst hat
    showError_unholdException()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass ein Makeln eine Exception ausgelöst hat
    showError_swapHoldException()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass ein Auflegen eine Exception ausgelöst hat
    showError_hangUpException()
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass ein Annehmen eines Anrufs eine Exception ausgelöst hat
    showError_answerException()
    {

    }

    //@override
    //eine Warning anzeigen
    showWarningMessage(text)
    {

    }

    //@override
    //Fehlermeldung anzeigen für den Fall, dass der Akkustand niedrig ist
    showErrorForLowBattery(level)
    {

    }

    //@override
    //vorherige Fehlermeldung (Akkustand niedrig) entfernen/verstecken
    hideErrorForLowBattery()
    {

    }
}

class GlobalEventListenerForWebDevicesForTimio extends GlobalEventListenerForWebDevices
{
    isSoftphoneOrWebRtcAllowed()
    {
        return SESSION.isOneOfTheseFeaturesAllowed([TimioFeature.Telephony_Softphone, TimioFeature.WebRtcIncoming, TimioFeature.WebRtcOutgoing]);
    }

    showErrorForDevicesNotAllowed()
    {
        this.showErrorMessage(LANGUAGE.getString("permissionBlockedForSoftphone"));
    }

    showErrorForDevicesNotFound()
    {
        this.showErrorMessage(LANGUAGE.getString("noDevicesFound"), this.getIdForDevicesNotFoundErrorMessage());
    }

    showErrorForInsecureContext()
    {
        this.showErrorMessage(LANGUAGE.getString("webDevices_insecureContext"));
    }

    showErrorForSecurityError()
    {
        this.showErrorMessage(LANGUAGE.getString("permissionBlockedForSoftphone"));
    }

    showErrorForUnknownError()
    {
        this.showErrorMessage(LANGUAGE.getString("webDevices_unknownError"));
    }

    showErrorForNoAccessToDevices()
    {
        this.showErrorMessage(LANGUAGE.getString("webDevices_noAccess"));
    }

    showErrorForWebRtcNotSupported()
    {
        this.showErrorMessage(LANGUAGE.getString("browserTooOld"));
    }

    hideErrorForDevicesNotFound()
    {
        removeErrorMessage(this.getIdForDevicesNotFoundErrorMessage());
    }

    getIdForDevicesNotFoundErrorMessage()
    {
        return "softphoneNoPhoneDevices";
    }

    getIdForLowBatteryErrorMessage()
    {
        return "softphoneLowBattery";
    }

    showError_holdException()
    {
        this.showWarningMessage(LANGUAGE.getString("errorHold"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    }

    showError_unholdException()
    {
        this.showWarningMessage(LANGUAGE.getString("errorUnhold"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    }

    showError_swapHoldException()
    {
        this.showWarningMessage(LANGUAGE.getString("errorSwapHold"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    }

    showError_hangUpException()
    {
        this.showWarningMessage(LANGUAGE.getString("errorHangUp"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    }

    showErrorForLowBattery(level)
    {
        this.showWarningMessage(LANGUAGE.getString("webDevices_batteryLow", level), undefined, this.getIdForLowBatteryErrorMessage());
    }

    hideErrorForLowBattery()
    {
        removeErrorMessage(this.getIdForLowBatteryErrorMessage());
    }

    showWarningMessage(text, timeout, referenceId)
    {
        showWarningMessage(text, timeout, referenceId);
    }

    showErrorMessage(text, referenceId)
    {
        showErrorMessage(text, null, referenceId);
    }
    
    answerCall(callId)
    {
        var callEvent = CURRENT_STATE_CALL.getLastCallEvent(callId);
        GLOBAL_EVENT_QUEUE.onGlobalEvent_Answer(null, callEvent);
    }
}
