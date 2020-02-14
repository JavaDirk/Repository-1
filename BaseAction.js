Ext.define('BaseAction',
{
    config: null, 

    constructor: function (actionConfig)
    {
        this.callParent();
        this.config = actionConfig;
        this.triggeredCallIds = {}; //für diese CallIds wurde die Aktion schon ausgeführt; als Objekt und nicht als Array, damit man schneller suchen kann
        
        SESSION.addListener(this);
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            this.destroy();
        }
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    execute: function (title)
    {
        if (isValid(this.lastCallEvent))
        {
            if (this.triggeredCallIds.hasOwnProperty(this.lastCallEvent.getCallId()))
            {
                return;
            }
        }

        this.run(title);

        if (isValid(this.lastCallEvent) && this.config.Type !== ACTION_TYPE_MANUELL)
        {
            this.triggeredCallIds[this.lastCallEvent.getCallId()] = null;
        }
    },

    substituteParametersInURL: function () {
        if (!isValidString(this.url)) {
            return "";
        }
        var self = this;
        var result = this.url;
        
        var possibleParameters =
        [
            "@ACDGroup",
            "@ACDDisplayInfo",
            "@CTIUserName",
            "@CTIUserStreet",
            "@CTIUserZIP",
            "@CTIUserCity",
            "@CTIUserCountry",
            "@CTIUserNumber",
            "@CTIUserMobilePhone",
            "@CTIUserOfficePhone",
            "@CTIUserHomePhone",
            "@CTIUserEMail",
            "@CTIUserCompany",
            "@CTIPartnerName",
            "@CTIPartnerStreet",
            "@CTIPartnerZIP",
            "@CTIPartnerCity",
            "@CTIPartnerCountry",
            "@CTIPartnerNumber",
            "@CTIPartnerMobilePhone",
            "@CTIPartnerOfficePhone",
            "@CTIPartnerHomePhone",
            "@CTIPartnerEMail",
            "@CTIPartnerCompany",
            "@CTIStatus",
            "@CTIDirection",
            "@CTIBeginDate",
            "@CTIDuration",
            "@CTIProviderCallID",
            "@CTIViaNumber",
            "@CTIViaName",
            "@CTIViaEmail",
            "@CTIViaCompany",
            "@CTIStorageID",
            "@CTIEntryID"
        ];
        Ext.each(possibleParameters, function (possibleParameter)
        {
            result = result.replace(possibleParameter, self.getValueForParameter(possibleParameter));
        });

        if (result.indexOf("@InputParam") >= 0) 
        {
            var indices = this.getIndicesOfInputParams(result);
            var labelString = isValidString(this.config.InputParameters) ? this.config.InputParameters : "";
            var labels = labelString.split(";");
            var labelsToShow = [];
            Ext.each(indices, function (index)
            {
                if (index - 1 <= labels.length - 1)
                {
                    labelsToShow.push(labels[index - 1]);
                }
            });
            var dialog = Ext.create('TextfieldDialog',
            {
                titleText: LANGUAGE.getString('manualInput'),
                labels: labelsToShow,
                onOK: function(values) {
                    Ext.each(values, function (value, index)
                    {
                        var inputParamIndex = indices[index];
                        result = result.replace("@InputParam" + inputParamIndex, value);
                    });
                    self.executeURL(result, result);
                }
                });
            dialog.show();
            return "";
        }
        return result;
    },

    //hier kommt etwas rein a la "http://google.de/@InputParam1/web/@InputParam2"
    getIndicesOfInputParams: function (url)
    {
        var result = [];
        var urlParts = url.split("@InputParam");
        Ext.each(urlParts, function (part, index)
        {
            if (index !== 0)
            {
                result.push(parseInt(part, 10));
            }
        });
        return result;
    },

    getValueForParameter: function (parameterName)
    {
        var rawValue = this.getRawValueForParameter(parameterName);
        if (isValidString(rawValue))
        {
            return encodeURI(rawValue);
        }
        return "";
    },

    getRawValueForParameter: function (parameterName)
    {
        var contact;
        if (isValid(this.contact))
        {
            contact = this.contact;
        }
        else
        {
            contact = isValid(this.lastCallEvent) ? this.lastCallEvent.getCaller() : null;
        }
            
        var viaContact = isValid(this.lastCallEvent) ? this.lastCallEvent.getViaCaller() : null;

        switch (parameterName)
        {
            case "@CTIUserName":
                return MY_CONTACT.getFullName();
            case "@CTIUserStreet":
                return MY_CONTACT.getOfficeStreet();
            case "@CTIUserZIP":
                return MY_CONTACT.getOfficeZIP();
            case "@CTIUserCity":
                return MY_CONTACT.getOfficeCity();
            case "@CTIUserCountry":
                return MY_CONTACT.getOfficeCountry();
            case "@CTIUserNumber":
                if (isValidString(SESSION.getMyCallNumber()))
                {
                    return SESSION.getMyCallNumber();
                }
                return "";
            case "@CTIUserMobilePhone":
                return MY_CONTACT.getFirstMobilePhoneNumber();
            case "@CTIUserOfficePhone":
                return MY_CONTACT.getFirstOfficePhoneNumber();
            case "@CTIUserHomePhone":
                return MY_CONTACT.getFirstHomePhoneNumber();
            case "@CTIUserEMail":
                return MY_CONTACT.getEMail();
            case "@CTIUserCompany":
                return MY_CONTACT.getCompany();
            case "@ACDGroup":
                if (isValid(this.lastCallEvent, "getACDCallInfo()"))
                {
                    var acdCallInfo = this.lastCallEvent.getACDCallInfo();
                    var groupId = acdCallInfo.getGroupId();
                    if (isValid(groupId) && groupId !== 0)
                    {
                        var group = CURRENT_STATE_CONTACT_CENTER.getGroup(groupId);
                        if (isValid(group))
                        {
                            return group.getName();

                        }
                    }
                }
                return "";

            case "@ACDDisplayInfo":
                if (isValid(this.lastCallEvent, "getACDCallInfo()"))
                {
                    var acdCallInfo = this.lastCallEvent.getACDCallInfo();
                    return acdCallInfo.getAdditionalInfo();
                }
                return "";

            case "@CTIPartnerName":
                return isValid(contact) ? contact.getFullName() : "";
            case "@CTIPartnerStreet":
                return isValid(contact) ? contact.getOfficeStreet() : "";
            case "@CTIPartnerZIP":
                return isValid(contact) ? contact.getOfficeZIP() : "";
            case "@CTIPartnerCity":
                return isValid(contact) ? contact.getOfficeCity() : "";
            case "@CTIPartnerCountry":
                return isValid(contact) ? contact.getOfficeCountry() : "";
            case "@CTIPartnerNumber":
                return isValid(this.lastCallEvent) ? this.lastCallEvent.getNumber() : "";
            case "@CTIPartnerMobilePhone":
                return isValid(contact) ? contact.getFirstMobilePhoneNumber() : "";
            case "@CTIPartnerOfficePhone":
                return isValid(contact) ? contact.getFirstOfficePhoneNumber() : "";
            case "@CTIPartnerHomePhone":
                return isValid(contact) ? contact.getFirstHomePhoneNumber() : "";
            case "@CTIPartnerEMail":
                return isValid(contact) ? contact.getEMail() : "";
            case "@CTIPartnerCompany":
                return isValid(contact) ? contact.getCompany() : "";


            case "@CTIStatus": //"Busy","Dialtone","Unknown"...
                return isValid(this.lastCallEvent) ? this.lastCallEvent.getCallState() : "";
            case "@CTIDirection": //"In", "Out", "Unknown"
                return isValid(this.lastCallEvent) ? this.lastCallEvent.getCallDirection() : "";
            case "@CTIBeginDate":
                return isValid(this.lastCallEvent) ? Ext.util.Format.date(this.lastCallEvent.lineTimeDate, "d-m-Y H:i:s") : "";
            case "@CTIDuration":
                return isValid(this.lastCallEvent) ? this.lastCallEvent.getCurrentLineTime() : "";
            case "@CTIProviderCallID":
                return isValid(this.lastCallEvent) ? this.lastCallEvent.getProviderCallId() : "";
            case "@CTIViaNumber":
                return isValid(this.lastCallEvent) ? this.lastCallEvent.getRedirectedNumber() : "";
            case "@CTIViaName":
                return isValid(viaContact) ? viaContact.getFullName() : "";
            case "@CTIViaEmail":
                return isValid(viaContact) ? viaContact.getEMail() : "";
            case "@CTIViaCompany":
                return isValid(viaContact) ? viaContact.getCompany() : "";
            case "@CTIStorageID":
                return isValid(contact) ? contact.getObjectSource() : "";
            case "@CTIEntryID":
                return isValid(contact) ? contact.getObjectName() : "";
            default:
                return "";
        }
    },
    
    getName: function (htmlEncoded)
    {
        if (htmlEncoded)
        {
            return Ext.String.htmlEncode(this.config.Name);
        }
        return this.config.Name;
    },

    getTooltip: function ()
    {
        return Ext.String.htmlEncode(this.config.Comment);
    },

    getIconName: function ()
    {
        return "action";
    },

    showAsButton: function()
    {
        return this.config.PresentationType === ACTION_PRESENTATION_BUTTON;
    },

    areAllConstraintsSatisfied: function ()
    {
        var result = true;

        var presenceState = this.checkPresenceState();
        var callState = this.checkCallState();
        var callDirection = this.checkCallDirection();
        var callType = this.checkCallType();
        var callUsage = this.checkCallUsage();
        var resolveState= this.checkResolveState();
        var numberState = this.checkNumberState();
        var routingMode = this.checkRoutingMode();
        var acdGroup = this.checkACDGroup();
        
        return presenceState && callState && callDirection && callType && callUsage && resolveState && numberState && routingMode && acdGroup;
    },

    checkPresenceState: function ()
    {
        switch (this.config.PresenceState)
        {
            case ACTION_PRESENCESTATE_PRESENT:
                return isValid(this.presenceStateEvent) ? this.presenceStateEvent.getState() === PresenceState.Available.value : true;
            case ACTION_PRESENCESTATE_ABSENT:
                return isValid(this.presenceStateEvent) ? this.presenceStateEvent.getState() === PresenceState.NotAvailable.value : true;
            case ACTION_PRESENCESTATE_BREAK:
                return isValid(this.presenceStateEvent) ? this.presenceStateEvent.getState() === PresenceState.Break.value : true;
            case ACTION_PRESENCESTATE_DONTDISTURB:
                return isValid(this.presenceStateEvent) ? this.presenceStateEvent.getState() === PresenceState.DnD.value : true;
            case ACTION_PRESENCESTATE_OFFLINE:
                return isValid(this.presenceStateEvent) ? (this.presenceStateEvent.getState() === PresenceState.Offline.value || this.presenceStateEvent.getState() === PresenceState.Offline2.value) : true;
            default:
                console.log("Unknown presence state option ", this.config.PresenceState);
                break;
        }
        return true;
    },

    checkCallState: function ()
    {
        switch (this.config.Type)
        {
            case ACTION_TYPE_RING:
                return this.lastCallEvent.getCallState() === CallState.Offering.value || this.lastCallEvent.getCallState() === CallState.Ringback.value;
            case ACTION_TYPE_CONNECTED:
                return this.lastCallEvent.getCallState() === CallState.Connected.value;
            case ACTION_TYPE_OCCUPIED:
                return this.lastCallEvent.getCallState() === CallState.Busy.value;
            case ACTION_TYPE_NORESPONSE:
                return this.lastCallEvent.getCallState() === CallState.Idle.value && this.lastCallEvent.getCallSuccess() === CallState.Ringback.value;
            case ACTION_TYPE_CALLEND:
                return this.lastCallEvent.getCallState() === CallState.Idle.value;
            case ACTION_TYPE_HANGON:
                return this.lastCallEvent.getCallState() === CallState.Disconnected.value;
            default:
                console.log("Unknown call state option ", this.config.Type);
                break;
        }
        return true;
    },

    checkCallDirection: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }
        switch (this.config.SubType)
        {
            case ACTION_SUBTYPE_INGOING:
                return this.lastCallEvent.getCallDirection() === CallDirection.In.value;
            case ACTION_SUBTYPE_OUTGOING:
                return this.lastCallEvent.getCallDirection() === CallDirection.Out.value;
            case ACTION_SUBTYPE_BOTH:
                return true;
            case ACTION_SUBTYPE_NONE:
                return false;
            default:
                console.log("Unknown call direction option ", this.config.SubType);
                break;
        }
        return true;
    },

    checkCallType: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }
        switch (this.config.CallType)
        {
            case ACTION_CALLTYPE_INTERN:
                return this.lastCallEvent.isInternalCall();
            case ACTION_CALLTYPE_EXTERN:
                return !this.lastCallEvent.isInternalCall();
            case ACTION_CALLTYPE_BOTH:
                return true;
            default:
                console.log("Unknown call type option ", this.config.CallType);
                break;
        }
        return true;
    },

    checkCallUsage: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }
        switch (this.config.CallUsage)
        {
            case ACTION_CALLUSAGE_BUSINESS:
                return !this.lastCallEvent.isPrivateCall();
            case ACTION_CALLUSAGE_PRIVATE:
                return this.lastCallEvent.isPrivateCall();
            case ACTION_CALLUSAGE_BOTH:
                return true;
            default:
                console.log("Unknown call usage option ", this.config.CallUsage);
                break;
        }
        return true;
    },

    checkResolveState: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }

        var isValidContact = isValid(this.lastCallEvent.getCaller()) && this.lastCallEvent.getCaller().isValid();
        switch (this.config.ContactState)
        {
            case ACTION_CONTACTSTATE_RESOLVED:
                return isValidContact;
            case ACTION_CONTACTSTATE_NOTRESOLVED:
                return !isValidContact;
            case ACTION_CONTACTSTATE_BOTH:
                return true;
            default:
                console.log("Unknown resolve state option ", this.config.ContactState);
                break;
        }
        return true;
    },

    checkNumberState: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }
        var result = true;
        switch (this.config.NumberState)
        {
            case ACTION_NUMBERSTATE_HIDDEN:
                return this.lastCallEvent.isNumberNotKnown();
            case ACTION_NUMBERSTATE_VISIBLE:
                if (this.config.RegardNumber)
                {
                    var self = this;
                    var numberMatch = false;
                    Ext.each(this.config.Numbers, function (number)
                    {
                        if (self.checkIfNumbersMatch(number, self.lastCallEvent.getNumber()))
                        {
                            numberMatch = true;
                        }
                    });
                    result &= numberMatch;
                }
                else
                {
                    return !this.lastCallEvent.isNumberNotKnown();
                }
                break;
            case ACTION_NUMBERSTATE_ALL:
                return true;
            default:
                console.log("Unknown number state option ", this.config.NumberState);
                break;
        }
        return result;
    },

    checkRoutingMode: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }
        switch (this.config.CallRoutingMode)
        {
            case ACTION_ROUTINGMODE_DIRECT:
                return !isValid(this.lastCallEvent.getACDCallInfo());
            case ACTION_ROUTINGMODE_CONTACTCENTER:
                return isValid(this.lastCallEvent.getACDCallInfo());
            case ACTION_ROUTINGMODE_BOTH:
                return true;
            default:
                console.log("Unknown routing mode option ", this.config.CallRoutingMode);
                break;
        }
        return true;
    },

    checkACDGroup: function ()
    {
        if (!isValid(this.lastCallEvent))
        {
            return true;
        }
        if (this.config.CCGroupRestrict === ACTION_CCGROUPRESTRICT_NAMED && isValidString(this.config.CCGroup))
        {
            var acdCallInfo = this.lastCallEvent.getACDCallInfo();
            if (isValid(acdCallInfo))
            {
                var group = CURRENT_STATE_CONTACT_CENTER.getGroup(acdCallInfo.getGroupId());
                if (isValid(group))
                {
                    return group.getName() === this.config.CCGroup;   
                }
            }
            return false;
        }
        return true;
    },

    checkIfNumbersMatch: function (szFilter, szNumber)
    {
        if (!isValidString(szFilter))
        {
            return true;
        }
        if (!isValidString(szNumber))
        {
            return false;
        }

        var strFilter = szFilter;
        var strNumber = szNumber;
        var arr = [];

        strNumber = new TelephoneNumber(strNumber).toString();

        if (!isValidString(strNumber))
        {
            return false;
        }
        arr = strFilter.split(",;");

        if (arr.length === 0)
        {
            return true;
        }
        var match = false;
        for (var i = 0; i < arr.length; ++i)
        {
            part = new TelephoneNumber(arr[i], true).toString();

            if (part.indexOf("*") === -1)
            {
                // do exact comparision
                if (part === strNumber)
                {
                    return true;
                }
            }
            else
            {
                // check only one *
                if ((part.split("*").length - 1) > 1)
                {
                    continue;
                }
                if (part[0] === "*")
                {
                    // starting with *
                    // remove leading *
                    part = part.substr(1);

                    if (strNumber.substr(strNumber.length - part.length) === part)
                    {
                        return true;
                    }
                }
                else if (part[part.length - 1] === "*")
                {
                    part = part.substr(0, part.length - 1);

                    if (strNumber.substr(0, part.length) === part)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    isActionAllowedByTimioFeature: function ()
    {
        return true;
    }
});