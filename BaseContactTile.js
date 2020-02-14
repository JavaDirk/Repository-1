Ext.define('PartnerBoard.ContactContextMenu', {
    extend: 'CustomMenu',

    contact: null,

    initComponent: function ()
    {
        this.callParent();

        if (!isValid(this.parent))
        {
            console.log("no parent given in ContextMenu!");
            return;
        }

        if (!isValid(this.contact))
        {
            console.log("no contact given in ContextMenu!");
            return;
        }

        if (!isValid(this.groupPanel))
        {
            console.log("no groupPanel given in ContextMenu!");
            return;
        }

        if (!isValid(this.event))
        {
            console.log("no event given in ContextMenu!");
            return;
        }
        
        var actions = new PartnerActions(this.contact, this.partner, this.parent, !this.groupPanel.isACDGroup());
        this.addEntries(actions.getActionsAsMenuEntries());

        this.showAt(this.event.pageX + 5, this.event.pageY);
    }
});

Ext.define('PartnerBoard.BaseContactTile', {
    extend: 'PartnerBoard.BaseTile',
    margin: '10 10 0 0',
    cls: CLS_CONTACT_TILE + ' partnerBackground',
    
    initComponent: function()
    {
        this.callParent();

        var self = this;
        this.addListener(
        {
            el:
            {
                mouseenter: function (event)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_mouseOverTile(self, self.getCurrentContact(), event);            
                },

                mouseleave: function (event)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_mouseOutTile(self, self.getCurrentContact(), event);
                },

                dblclick: function ()
                {
                    self.onDoubleClick();
                },

                contextmenu: function (event)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_contextMenuForTile(self, self.getCurrentContact(), event);            

                    self.contextMenu = Ext.create('PartnerBoard.ContactContextMenu',
                    {
                        event: event,
                        contact: self.getCurrentContact(),
                        partner: self.contact,
                        groupPanel: self.groupPanel,
                        parent: self
                    });
                }
            },
            boxready: function ()
            {
                requestAnimationFrame(function ()
                {
                    self.checkCall();
                    self.changeRedirectionImage();
                    self.changeMobileAvailableImage();
                    self.changeLineStateImage();
                });

                self.lineStateEl.on('mouseenter', function ()
                {
                    self.mouseOverLineStateEl = true;
                });
                self.lineStateEl.on('mouseleave', function ()
                {
                    self.mouseOverLineStateEl = false;
                });



            }
            
        });
    },

    onAgentContactsResolved: function (configuration)
    {

    },

    getMobileAvailableImage: function ()
    {
        var contact = this.getCurrentContact();
        if (isValid(contact))
        {
            var image = contact.getMobileAvailableImage();
            if (isValidString(image))
            {
                return 'url(' + image + ')';
            }    
        }
        
        return "";
    },

    getAgentStateImage: function ()
    {
        var guid = this.getGUID();

        var agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfoForContactGUID(guid);
        if (isValid(agentInfo))
        {
            return "url(" + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, AgentState[agentInfo.getAgentState()].color) + ")";
        }
        return "";
    },

    getGUID: function ()
    {
        if (isValid(this.contact, 'getGuid()'))
        {
            return this.contact.getGuid();
        }
        else if (isValid(this.contact, 'getGUID()'))
        {
            return this.contact.getGUID();
        }
        return "";
    },

    getName: function ()
    {
        if (!isValid(this.contact))
        {
            return "";
        }
        var name = this.contact.getName();

        if (isValid(this.contact.getLabel) && isValidString(this.contact.getLabel()))
        {
            name = this.contact.getLabel();
        }
        else
        {
            if (this.contact.getContact && this.contact.getContact() && this.contact.getContact().isValid())
            {
                name = this.contact.getContact().getLastName();
            }
            else
            {
                name = name.split(',')[0];
            }
        }
        return name;
    },

    changePresenceStates: function (guid, state, hasMobileDevice)
    {
        var presenceState = getEnumForPresenceState(state);

        var newMobileAvailableIcon = "";
        if (getEnumForPresenceState(state).value >= 5 && hasMobileDevice)
        {
            newMobileAvailableIcon = 'url(' + IMAGE_LIBRARY.getImage('mobile', 64, NEW_GREY) + ')';
        }

        if (isValidString(newMobileAvailableIcon))
        {
            this.showMobileAvailableImage(newMobileAvailableIcon);
        }
        else
        {
            this.hideMobileAvailableImage();
        }
    },

    changeMobileAvailableImage: function()
    {
        if (!this.isStateOk())
        {
            return;
        }
        var mobileAvailableImage = this.getMobileAvailableImage();
        if (isValidString(mobileAvailableImage))
        {
            this.showMobileAvailableImage(mobileAvailableImage);
        }
        else
        {
            this.hideMobileAvailableImage();
        }
    },

    changeRedirectionImage: function (guid, callDiversion)
    {
        if (!this.isStateOk())
        {
            return false;
        }
        if (!isValid(guid) && !isValid(callDiversion))
        {
            guid = this.getGUID();
            callDiversion = CURRENT_STATE_STATES.getCallDiversion(guid);
        }
        if (!isValid(callDiversion) || guid !== this.getGUID())
        {
            return false;
        }

        var self = this;
        var destination = getFirstValidString([callDiversion.getDisplayNumber(), callDiversion.getDestination()]);

        if (callDiversion.getEnabled())
        {
            this.showRedirection();
            
            var agentID = CURRENT_STATE_CONTACT_CENTER.getAgentIDForContactGUID(guid);
            var agent = CURRENT_STATE_CONTACT_CENTER.getAgent(agentID);
            var name = isValid(agent) ? agent.getName() : "";
            if (isValidString(name))
            {
                this.setTooltipTextForRedirection(name, destination);
            }
            else
            {
                SESSION.getContactByGuid(guid, function (result)
                {
                    var contact = result.getContact();
                    self.setTooltipTextForRedirection(isValid(contact) ? contact.getFullName(true) : "", destination, true);
                }, function ()
                {

                });
            }
        }
        else
        {
            this.hideRedirection();
        }
        return true;
    },

    setTooltipTextForRedirection: function (name, destination)
    {
        var tooltipText = LANGUAGE.getString("redirectionSet");
        if (isValidString(name))
        {
            if (isValidString(destination))
            {
                tooltipText = LANGUAGE.getString("redirectionSetForPartner", name, destination);
            }
            else
            {
                tooltipText = LANGUAGE.getString("redirectionSetForPartnerDestinationUnknown", name);
            }
        }
        this.setRedirectionTooltip(tooltipText);
    },

    changeLineStateImage: function ()
    {
        if (!this.isStateOk())
        {
            return;
        }
        var lineStateImage = this.getLineStateImage();
        if (isValidString(lineStateImage))
        {
            this.showLineStateImage(lineStateImage);
        }
        else
        {
            this.hideLineStateImage();
        }
    },

    getLineStateImage: function ()
    {
        var contact = this.getCurrentContact();
        if (isValid(contact))
        {
            var image = contact.getLineStateImage();
            if (isValidString(image))
            {
                return 'url(' + image + ')';
            }
        }
        return "";
    },

    getCurrentContact: function ()
    {
        var curContact = this.contact;
        if (isValid(this.contact, 'getContact()') && this.contact.getContact().isValid())
        {
            curContact = this.contact.getContact();
        }
        else
        {
            if (curContact.typeMarker === "www_caseris_de_CaesarSchema_Partner")
            {
                curContact = new www_caseris_de_CaesarSchema_Contact();
                curContact.convertFromPartner(this.contact);
            }
            else if (curContact.typeMarker === "www_caseris_de_CaesarSchema_Agent")
            {
                curContact = new www_caseris_de_CaesarSchema_Contact();
                curContact.convertFromAgent(this.contact);
            }
        }
        return curContact;
    },

    onDoubleClick: function ()
    {
        var self = this;
        var contact = this.getCurrentContact();
        
        if (CURRENT_STATE_CALL.isPickupAllowedAndPossible(this.getGUID()))
        {
            this.showConfirmation(
            {
                errorMessageText: LANGUAGE.getString("reallyPickup"),
                yesCallback: function ()
                {
                    self.pickupCall(contact, this.el);
                },
                noCallback: function ()
                {
                },
                errorType: ErrorType.Info
            });
        }
        else
        {
            if (isValidString(contact.getFirstOfficePhoneNumber()) && contact.getPresenceState() === PresenceState.Available.value)
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(contact, contact.getFirstOfficePhoneNumber());
            }
            else
            {
                var numbers = contact.getAllNumbers();
                if (Ext.isEmpty(numbers))
                {
                    this.showError(LANGUAGE.getString("contactWithoutNumber"));
                    return;
                }
                GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(contact, numbers[0]);
            }
        }
    },
    
    onResolvedPartner: function (resolvedPartner)
    {
        this.changeLineStateImage();
    },

    getAgentStateForGroup: function (guid)
    {
        var agentId = CURRENT_STATE_CONTACT_CENTER.getAgentIDForContactGUID(guid);
        var agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfo(agentId);
        var agentState = AgentState.LoggedOff.value;
        var userLogedIn = true;

        if (this.groupPanel.isACDGroup() && isValid(agentInfo))
        {
            userLogedIn = agentInfo.amILogedInGroup(this.groupPanel.group.getId());
        }

        if (isValid(agentInfo) && userLogedIn)
        {
            agentState = agentInfo.getAgentState();
        }

        return agentState;
    },

    addInformationToDragSource: function (info)
    {
        //info.setData('contact', this.contact);
    },

    onNewEvents: function (response)
    {
        if (!this.isStateOk())
        {
            return;
        }

        Ext.each(response.getPartnerCalls(), function (partnerCall)
        {
            this.checkCall(partnerCall);
        }, this);

        Ext.each(response.getOwnerCalls(), function (ownerCall)
        {
            this.checkCall(ownerCall);
        }, this);
        
        
        if (isValid(response.getOwnerCallDiversion()))
        {
            this.changeRedirectionImage(MY_CONTACT.getGUID(), response.getOwnerCallDiversion());
        }

        Ext.each(response.getPartnerCallDiversions(), function (callDiversion)
        {
            Ext.each(callDiversion.getGuids(), function (guid)
            {
                this.changeRedirectionImage(guid, callDiversion);
            }, this);
            
        }, this);

        var contact = this.getCurrentContact();
        Ext.each(response.getLineStateEvents(), function (lineStateEvent)
        {
            if (contact.getGUID() === lineStateEvent.getGuid())
            {
                this.changeLineStateImage();
            }
        }, this);
    },

    checkCall: function (currentCall)
    {
        if (!this.isStateOk())
        {
            return false;
        }
        var self = this;
        var guid;
        if (isValid(currentCall))
        {
            guid = currentCall.getOwner();
        }
        else
        {
            guid = this.getGUID();
            currentCall = CURRENT_STATE_CALL.getLastCallEventForGUID(guid);
            if (!isValid(currentCall))
            {
                return false;
            }
        }

        if (guid !== this.getGUID())
        {
            return false;
        }

        if (currentCall.isDisconnected() || currentCall.isIdle())
        {
            self.switchToNormalView();

            self.el.dom.classList.remove('activeCall');
            self.el.dom.classList.remove('ringingCall');
        }
        else
        {
            if (!currentCall.isDialtone())
            {
                self.switchToTelephoneView();
            }
            
            if (currentCall.isOffering() || currentCall.isRingback())
            {
                self.el.dom.classList.add('ringingCall');

                self.setLineTimeText(LANGUAGE.getString("ringing"));
            }

            if (currentCall.isConferenced() || currentCall.isConnected() || currentCall.isOffering() || currentCall.isRingback() || currentCall.isOnHold())
            {
                var color = currentCall.isInternalCall() ? COLOR_INTERNAL_CALL : COLOR_EXTERNAL_CALL;

                if (currentCall.isOnHold())
                {
                    self.showHoldImage(color);
                }
                else
                {
                    self.hideHoldImage();
                }

                self.showACDGroupName(currentCall);

                var imageName;
                if (currentCall.isConferenced())
                {
                    imageName = "conference";
                }
                else
                {
                    imageName = currentCall.isIncoming() ? self.getImageNameForIncomingCall() : self.getImageNameForOutgoingCall();
                }

                self.callDirectionImageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage(imageName, 64, color) + ')';

                self.setCallerText(currentCall);
                

                if (currentCall.isConnected() || currentCall.isConferenced() || currentCall.isOnHold())
                {
                    self.el.dom.classList.add('activeCall');
                    self.el.dom.classList.remove('ringingCall');

                    if (isValid(currentCall, "getCallDurationAllowed") && currentCall.getCallDurationAllowed())
                    {
                        self.startCallDurationTimer(currentCall);
                    }
                    else
                    {
                        self.setLineTimeText(LANGUAGE.getString("connected"));
                    }
                }
            }
        }

        return true;
    },

    startCallDurationTimer: Ext.emptyFn,

    setLineTimeText: Ext.emptyFn,

    showHoldImage: Ext.emptyFn,

    hideHoldImage: Ext.emptyFn,

    showACDGroupName: Ext.emptyFn,

    setCallerText: Ext.emptyFn,

    getImageNameForIncomingCall: Ext.emptyFn,

    getImageNameForOutgoingCall: Ext.emptyFn,

    getNumberForCall: function (currentCall)
    {
        var number = currentCall.getNumber() || currentCall.getDisplayNumber();

        if (isValid(currentCall.getCaller()) && currentCall.getCaller().getFullName())
        {
            number = currentCall.getCaller().getFullName();
        }
        return number;
    },

    switchToTelephoneView: function ()
    {
        this.phoneBlockEl.dom.style.display = "flex";
        this.normalBlockEl.dom.style.display = "none";
    },

    switchToNormalView: function ()
    {
        this.phoneBlockEl.dom.style.display = "none";
        this.normalBlockEl.dom.style.display = "flex";
    },

    showMobileAvailableImage: function (newImage)
    {
        this.mobileAvailableEl.dom.style.display = "block";
        this.mobileAvailableEl.dom.style.backgroundImage = newImage;
    },

    hideMobileAvailableImage: function (newImage)
    {
        this.mobileAvailableEl.dom.style.display = "none";
    },

    showLineStateImage: function (newImage)
    {
        this.lineStateEl.dom.style.display = "block";
        this.lineStateEl.dom.style.backgroundImage = newImage;
    },

    hideLineStateImage: function ()
    {
        this.lineStateEl.dom.style.display = "none";
    },

    showRedirection: function ()
    {
        this.redirectionEl.dom.style.display = "block";
        this.redirectionEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage('redirection', 64, NEW_GREY) + ')';
    },

    hideRedirection: function ()
    {
        this.redirectionEl.dom.style.display = "none";
    },

    setRedirectionTooltip: function (text)
    {
        this.redirectionEl.dom.title = text;
    },

    isContextMenuVisible: function ()
    {
        if (isValid(this.contextMenu) && this.contextMenu.isVisible())
        {
            return true;
        }
        else if (isValid(this.chooseNumberContextMenu) && this.chooseNumberContextMenu.isVisible())
        {
            return true;
        }
        return false;
    },


    pickupCall: function (contact) 
    {
        if (!isValid(contact))
        {
            return;
        }
        var officePhoneNumber = contact.getFirstOfficePhoneNumber();
        officePhoneNumber = officePhoneNumber.replace(/\s+/g, '');

        var self = this;
        SESSION.pickupCall(officePhoneNumber, function (response)
        {
            if (response.getReturnValue().getCode() !== 0)
            {
                self.showError(response.getReturnValue().getDescription());
            }
        },
            function ()
            {
                self.showError(LANGUAGE.getString("errorPickup"));
            });
    },

    showError: function (text, errorLevel)
    {
        if (isValid(this, "ownerCt.ownerCt"))
        {
            this.ownerCt.ownerCt.showError(text, errorLevel);
        }
        else
        {
            showErrorMessage(text, DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    showConfirmation: function (confirmation)
    {
        if (isValid(this, "ownerCt.ownerCt"))
        {
            this.ownerCt.ownerCt.showConfirmation(confirmation);
        }
    }
});