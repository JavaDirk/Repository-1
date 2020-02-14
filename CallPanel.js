Ext.define('BaseCallPanel',
{
    extend: 'Ext.Mixin',

    mixinConfig:
    {
        after:
        {
            destroy: 'destroy'
        }
    },

    constructor: function ()
    {
        if (!isValid(this.callId) && isValid(this.initialCallEvent))
        {
            this.callId = this.initialCallEvent.getCallId();
        }

        SESSION.addListener(this);
    },
    
    destroy: function () {
        SESSION.removeListener(this);

        this.callParent();
    },

    onNewEvents: function (response)
    {
        if (this.destroyed)
        {
            return;
        }
        Ext.each(response.getOwnerCallEventsForCallId(this.callId), this.onNewCallEventForMe, this);
    },

    onNewCallEventForMe: function (call)
    {
        var invokeSetContact = false;
        if (this.selectedNumber !== call.getNumberToDisplay())
        {
            this.selectedNumber = call.getNumberToDisplay();
            invokeSetContact = true;
        }

        var isRedirectedOrForwarded = isValidString(call.getRedirectedNumber()) || isValidString(call.getNewDestinationNumber());
        if (isRedirectedOrForwarded)
        {
            this.contact = call.getCaller();
            invokeSetContact = true;
        }

        if (call.isOutgoing())
        {
            if(isValid(call.getCaller()))
            {
                if (!isValid(this.contact) || (isValid(this.contact) && this.contact.equals(call.getCaller()) && !this.contact.deepCompare(call.getCaller())))
                {
                    //Bei einem outgoing-call haben wir den Ruf initiiert und evtl. dem CallPanel ein contact übergeben. Der würde im dialing durch null überschrieben, 
                    //was nicht gewollt ist
                    //bei incoming soll das möglich sein, weil bei einem weitergeleiteten Gespräch man zuerst einen aufgelösten Kontakt haben kann, der danach zu einem nicht aufgelösten kontakt werden kann

                    //Es gibt allerdings bei outgoing einen Fall, bei dem man den Kontakt überschrieben haben möchte. Und zwar wenn es derselbe Kontakt anhand GUID, ObjectSource ist (equals),
                    //aber die anderen Felder andere Werte haben (geprüft durch deepCompare). Der Fall kam dadurch, dass ACD einen minimal-Kontakt geliefert hat und DataConnect 
                    //später denselben Kontakt mit imageUrl und Präsenz schickte. Dann will man natürlich das Bild etc anzeigen
                    
                    this.contact = call.getCaller();
                    invokeSetContact = true;
                }
            }
        }
        else
        {
            var isNewContact = true;
            if (isValid(this.contact))
            {
                isNewContact = !this.contact.deepCompare(call.getCaller());
            }

            if (isNewContact)
            {
                this.contact = call.getCaller();
                invokeSetContact = true;
            }
        }
        if (invokeSetContact)
        {
            this.setContact(this.contact, this.selectedNumber);
        }
    },

    getName: function ()
    {
        if (isValid(this.contact) && this.contact.isRealContact())
        {
            return this.contact.getDisplayName();
        }
        if (isValidString(this.selectedNumber))
        {
            return this.selectedNumber;
        }
        
        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        if (isValid(lastCallEvent) && lastCallEvent.isDialtone())
        {
            return LANGUAGE.getString("pleaseDial");
        }
        return "";
    },

    setInitialCallEvent: function (callEvent)
    {
        this.initialCallEvent = callEvent;
        this.onNewCallEventForMe(this.initialCallEvent);
    },

    setContact: function (contact)
    {
        this.contact = contact;
    },

    getImageName: function (callEvent)
    {
        var imageName = "";
        if (callEvent.isIncoming()) {
            imageName = "phone_in";
        }
        else {
            imageName = "phone_out";
        }
        if (isValid(callEvent.getACDCallInfo())) {
            imageName += "_acd";
        }
        else if (isValidString(callEvent.getRedirectedNumber()) || isValidString(callEvent.getNewDestinationNumber())) {
            imageName += "_redirected";
        }
        return imageName;
    },

    isInternalCall: function ()
    {
        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        if (isValid(lastCallEvent))
        {
            return lastCallEvent.isInternalCall();
        }
        return isValid(this.selectedNumber) && this.selectedNumber.length > 5 ? false : true;
    },

    isACDCall: function () 
    {
        return CURRENT_STATE_CALL.isACDCall(this.callId);
    },

    getACDGroup: function ()
    {
        var acdInfos = CURRENT_STATE_CALL.getACDInfoForCallId(this.callId);
        if (!acdInfos)
        {
            return null;
        }
        return CURRENT_STATE_CONTACT_CENTER.getGroup(acdInfos.getGroupId());
    },

    isMaxTalkTimeExceeded: function (numberSeconds)
    {
        var group = this.getACDGroup();
        if (group && group.getMaxTalkTime() < numberSeconds)
        {
            return true;
        }
        return false;
    }
});

var HEIGHT_CALLER_PANEL = 89;

Ext.define('CallerPanel',
{
    extend: 'Ext.Component',
    mixins: ['BaseCallPanel'],

    height: HEIGHT_CALLER_PANEL,
    flex: 1,

    contact: null,
    selectedNumber: "",
    viaText: '',

    padding: '5 0 0 0',

    childEls: ['firstRowEl', 'secondRowEl', 'thirdRowEl', 'fourthRowEl', 'imageEl', 'dateTimeEl', 'callDurationEl', 'coachingImageEl', 'encryptedImageEl'],
    
    renderTpl: '<div style="display:flex;flex-direction:column">' +
                    '<div style="display:flex;flex-direction:column;padding:0 10px 0 0">' +
                        '<div style="display:flex">' +
                            '<div id="{id}-firstRowEl" data-ref="firstRowEl" class="eclipsedText" style="min-width:275px;flex:1;font-weight:500;font-size:' + FONT_SIZE_NAME + 'px;color:' + COLOR_CALL_DISPLAY_TITLE + '"></div>' +
                            '<div id="{id}-imageEl" data-ref="imageEl" style="margin-left:15px;align-self:center;height:24px;width:24px;background-size:24px 24px;background-image:url({imageSrc})"></div>' +
                        '</div>' +
                        '<div style="display:flex">' +
                            '<div id="{id}-secondRowEl" data-ref="secondRowEl" class="eclipsedText" style="flex:1;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + '"></div>' +
                            '<div id="{id}-dateTimeEl" data-ref="dateTimeEl" style="margin-left:15px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + ';">{dateTime}</div>' +
                        '</div>' +
                        '<div style="display:flex">' +
                            '<div id="{id}-thirdRowEl" data-ref="thirdRowEl" class="eclipsedText" style="flex:1;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + '"></div>' +
                            '<div id="{id}-callDurationEl" data-ref="callDurationEl" class="eclipsedText" style="margin-left:15px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + ';">{callDuration}</div>' +
                        '</div>' +
                        '<div style="display:flex">' +
                            '<div id="{id}-fourthRowEl" data-ref="fourthRowEl" class="eclipsedText" style="flex:1;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + '"></div>' +
                            '<div style="display:flex;justify-content:flex-end; margin:0 0px 0 0">' +
                                '<div id="{id}-coachingImageEl" data-ref="coachingImageEl" style="visibility:hidden;margin-left:5px;width:16px;height:16px;background-size:16px 16px;background-image:url(images/64/privacy.png);"></div>' +
                                '<div id="{id}-encryptedImageEl" data-ref="encryptedImageEl" style="visibility:hidden;margin-left:5px;margin-top:2px;width:16px;height:16px;background-size:16px 16px;"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',

    initComponent: function ()
    {
        this.callParent();

        this.mixins.BaseCallPanel.constructor.call(this);

        this.update(this.renderData);
        
        this.on('boxready', () => 
        {
            this.encryptedImageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage('lock', 64, WHITE) + ')';

            this.encryptedImageEl.tooltip = this.addTooltip(this.encryptedImageEl, LANGUAGE.getString("encrypted"));
            this.coachingImageEl.tooltip = this.addTooltip(this.coachingImageEl, LANGUAGE.getString("coaching"));
            
            this.setContact(this.contact, this.selectedNumber, this.viaText, this.initialCallEvent);

            if (isValid(this.initialCallEvent)) 
            {
                var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.initialCallEvent.getCallId());
                this.onNewCallEventForMe(lastCallEvent);
            }
        });

        this.on('destroy', function ()
        {
            Ext.each([this.encryptedImageEl, this.coachingImageEl], function (element)
            {
                if (isValid(element, "tooltip"))
                {
                    element.tooltip.destroy();
                }
            });
        });
    },
    
    initRenderData: function ()
    {
        var data = this.callParent();

        data.imageSrc = this.defaultPhoneImage || IMAGE_LIBRARY.getImage("phone", 64, WHITE);
        data.dateTime = "";
        data.callDuration = "";
        
        return data;
    },

    addTooltip: function (target, text)
    {
        return Ext.create('Ext.tip.ToolTip',
        {
            target: target,
            showDelay: 1000,
            autoHide: true,
            trackMouse: false,

            listeners:
            {
                beforeshow: function (tip) {
                    if (target.dom.style.visibility !== 'hidden') {
                        tip.update(text);
                        return true;
                    }
                    return false;
                }
            }
        });
    },

    destroy: function ()
    {
        this.stopTimer();
        this.stopBlinkingCallStateTimer();

        this.callParent();
    },

    setInitialCallEvent: function (callEvent)
    {
        this.mixins.BaseCallPanel.setInitialCallEvent.call(this, callEvent);
        
        if (isValid(this.initialCallEvent) && !this.initialCallEvent.isConnected() && this.initialCallEvent.getLineTime() === 0)
        {
            this.startBlinkingCallStateTimer();
        }
    },

    onMakeCallSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.startBlinkingCallStateTimer();
        }
        else
        {
            this.setContact(this.contact, this.selectedNumber, this.viaText, this.initialCallEvent);
        }
    },

    onNewCallEventForMe: function (callEvent)
    {
        this.mixins.BaseCallPanel.onNewCallEventForMe.call(this, callEvent);

        if (!this.isStateOk())
        {
            return;
        }
        
        this.encryptedImageEl.dom.style.visibility = CURRENT_STATE_CALL.isSessionEncrypted(this.callId) ? "visible" : 'hidden';
        this.coachingImageEl.dom.style.visibility = CURRENT_STATE_CALL.isSessionCoached(this.callId) ? "visible" : 'hidden';
        
        if (callEvent.isIdle())
        {
            this.onIdle(callEvent);
        }
        if (callEvent.isOffering() || callEvent.isRingback() || callEvent.isDialing())
        {
            this.startBlinkingCallStateTimer();
        }
        if (callEvent.isDisconnected())
        {
            this.onDisconnected(callEvent);
        }
        if (callEvent.isConnected())
        {
            this.onConnected(callEvent);
        }
        if (callEvent.isOnHold())
        {
            this.onHold(callEvent);
        }
        if (callEvent.isConferenced())
        {
            this.onConferenced(callEvent);
        }
        if (callEvent.isDialtone())
        {
            this.onDialtone(callEvent);
        }
        if (callEvent.isBusy())
        {
            this.onBusy(callEvent);
        }

        this.updateViaInformation(callEvent);
    },

    onBusy: function (callEvent)
    {
        this.onCallEnd(callEvent);

        this.dateTimeEl.setText(LANGUAGE.getString("callStateBusy"));
        this.callDurationEl.setText("");
    },

    setContact: function (contact, number, viaText, callEvent)
    {
        this.contact = contact;
        this.selectedNumber = isValidString(number) ? number : this.selectedNumber;
        this.viaText = isValidString(viaText) ? viaText : this.viaText;
        if (!this.isStateOk())
        {
            return;
        }
        
        var possibleValues = this.getPossibleValues();
        this.firstRowEl.setText(getFirstValidString(possibleValues));
        this.secondRowEl.setText(getSecondValidString(possibleValues));
        this.thirdRowEl.setText(getThirdValidString(possibleValues));
        this.fourthRowEl.setText(getFourthValidString(possibleValues));

        this.addClickListenerOnName();
    },

    getPossibleValues: function()
    {
        var possibleValues = [this.getName()];
        if (!this.isOnlyANumber()) 
        {
            if (isValid(this.contact) && this.contact.isCompanyContact()) 
            {
                possibleValues.push(this.contact.getCompany());
                possibleValues.push(this.contact.getCity());
            }
            else if (isValid(this.contact) && this.contact.isGlobalInfo()) 
            {
                possibleValues.push(this.contact.getCity());
                possibleValues.push(this.contact.getCountry());
            }
            else
            {
                var companyOrDepartment = [];
                if (isValid(this.contact))
                {
                    if (this.isInternalCall())
                    {
                        companyOrDepartment.push(this.contact.getDepartment());
                    }
                    companyOrDepartment.push(this.contact.getCompany());
                }
                possibleValues.push(getFirstValidString(companyOrDepartment));


                var numberToShow = this.selectedNumber;
                var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
                if (isValid(lastCallEvent)) {
                    numberToShow = lastCallEvent.getNumberToDisplay();
                }
                if (isValidString(numberToShow) && numberToShow !== this.getName()) {
                    possibleValues.push(numberToShow);
                }
            }
            if (isValidString(this.viaText)) {
                possibleValues.push(this.viaText);
            }
        }
        return Ext.Array.unique(possibleValues);
    },

    addClickListenerOnName: function ()
    {
        if (this.contact && this.contact.isRealContact())
        {
            this.firstRowEl.dom.title = LANGUAGE.getString('openContact');
            this.firstRowEl.dom.style.cursor = 'pointer';
            this.firstRowEl.dom.onclick = () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(this.contact);
            };
        }
    },

    isIncomingCall: function ()
    {
        var callEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        if (isValid(callEvent))
        {
            return callEvent.isIncoming();
        }
        return false;
    },

    isOnlyANumber: function ()
    {
        return !isValid(this.contact) && !isValidString(this.viaText);
    },

    setNumber: function (number)
    {
        this.setContact(this.contact, number);
    },

    updateViaInformation: function (call)
    {
        if (!isValid(call))
        {
            return;
        }

        var possibleValues = [];

        if (call.getACDCallInfo())
        {
            var acdCallInfo = call.getACDCallInfo();
            var agent = acdCallInfo.getRedirAgentName();
            var group = acdCallInfo.getRedirGroupName();
            if (isValidString(agent) && isValidString(group))
            {
                possibleValues.push(group + " (" + agent + ")");
            }
        }

        if (isValid(call.getViaCaller()))
        {
            possibleValues.push(call.getViaCaller().getName());
        }
        possibleValues.push(call.getRedirectedNumber());
        
        var value = getFirstValidString(possibleValues);
        if (isValidString(value))
        {
            this.viaText = LANGUAGE.getString("via") + ": " + value;
            this.setContact(this.contact, this.selectedNumber, this.viaText);
        }
    },

    setCallId: function (callId)
    {
        this.callId = callId;

        var callEvent = CURRENT_STATE_CALL.getLastCallEvent(callId);
        if (isValid(callEvent))
        {
            this.onNewCallEventForMe(callEvent);
        }

        this.setContact(this.contact, this.selectedNumber, this.viaText);
    },

    onConnected: function (callEvent)
    {
        this.startTimerIfNecessary(callEvent);
        this.stopBlinkingCallStateTimer();

        var imageName = this.getImageName(callEvent);

        this.imageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage(imageName, 64, WHITE) + ')';
    },

    onHold: function (callEvent)
    {
        this.startTimerIfNecessary(callEvent); //nur dann nötig, wenn man mit einem gehaltenen Gespräch den Client startet

        this.imageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage("phone_hold", 64, WHITE) + ')';
    },

    onConferenced: function ()
    {
        this.imageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage("phone_conference", 64, WHITE) + ')';
    },

    onDialtone: function () 
    {
        this.imageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage("phone_out", 64, WHITE) + ')';
    },

    startTimerIfNecessary: function (callEvent)
    {
        if (!isValid(this.dateTimeTimer))
        {
            //wir speichern den timestamp, wann das Gespräch angefangen hat und berechnen daraus im Timer die angezeigte Zeit neu,
            //weil die Timer in Javascript nicht 100%ig exakt sind - dadurch kam es bei einem längeren Gespräch zu einer Zeitdiskrepanz
            var timestampCallIsConnected = new Date().getTime();
            if (isValid(callEvent)) {
                timestampCallIsConnected = timestampCallIsConnected - callEvent.getLineTime() * 1000;
            }

            var self = this;
            var dateTimeFunction = function ()
            {
                var now = new Date().getTime();
                var seconds = Math.floor((now - timestampCallIsConnected) / 1000);
                if (self.isMaxTalkTimeExceeded(seconds))
                {
                    self.parent.onMaxTalkTimeExceeded();
                }
                self.dateTimeEl.setText(convertSecondsToString(seconds));

                if (CURRENT_STATE_CALL.isSessionCoached(self.callId))
                {
                    if (self.coachingImageEl.dom.style.backgroundImage === "")
                    {
                        self.coachingImageEl.dom.style.backgroundImage = "url(images/64/privacy.png)";
                    }
                    else
                    {
                        self.coachingImageEl.dom.style.backgroundImage = "";
                    }
                }
            };
            dateTimeFunction();
            this.dateTimeTimer = Ext.util.TaskManager.start(
            {
                interval: 1000,
                run: dateTimeFunction
            });
        }
    },

    stopTimer: function ()
    {
        if (isValid(this.dateTimeTimer))
        {
            Ext.util.TaskManager.stop(this.dateTimeTimer);
        }
    },

    onIdle: function (callEvent)
    {
        this.onCallEnd(callEvent);
    },

    onDisconnected: function (callEvent)
    {
        this.onCallEnd(callEvent);
    },

    onMakeCallFailed: function ()
    {
        this.onCallEnd();
    },

    onMakeCallException: function ()
    {
        this.onCallEnd();
    },

    onCallEnd: function (callEvent)
    {
        this.stopTimer();
        this.stopBlinkingCallStateTimer();

        this.imageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage("phone_hangUp", 64, WHITE) + ')';
        this.dateTimeEl.setText(LANGUAGE.getString("callFinished"));
        this.dateTimeEl.dom.style.backgroundColor = 'transparent';
        this.dateTimeEl.dom.style.padding = '0';
        
        this.encryptedImageEl.dom.style.visibility = 'hidden';
        this.coachingImageEl.dom.style.visibility = 'hidden';
        
        if (isValid(callEvent))
        {
            this.callDurationEl.setText(LANGUAGE.getString("duration") + ": " + convertSecondsToString(callEvent.getLineTime()));
        }
    },

    startBlinkingCallStateTimer: function ()
    {
        if (isValid(this.blinkingCallStateTimer))
        {
            return;
        }

        var iconCounter = 1;
        var iconList =
        [
            IMAGE_LIBRARY.getImage("phone_ringing_3", 64, WHITE),
            IMAGE_LIBRARY.getImage("phone_ringing_2", 64, WHITE),
            IMAGE_LIBRARY.getImage("phone_ringing", 64, WHITE),
            IMAGE_LIBRARY.getImage("phone", 64, WHITE)
        ];

        var self = this;
        this.blinkingCallStateTimer = Ext.util.TaskManager.start(
        {
            interval: 250,
            run: function ()
            {
                iconCounter += 1;
                if (iconCounter > 3)
                {
                    iconCounter = 0;
                }
                
                self.imageEl.dom.style.backgroundImage = 'url(' + iconList[iconCounter] + ')';
            }
        });
    },

    stopBlinkingCallStateTimer: function ()
    {
        if (isValid(this.blinkingCallStateTimer))
        {
            Ext.util.TaskManager.stop(this.blinkingCallStateTimer);
        }
    }
});

Ext.define('ACDCallInfoPanel',
{
    extend: 'Ext.Container',
    mixins: ['BaseCallPanel'],

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    
    minHeight: 60,

    additionalInfoText: "",
    padding: '5 0',

    style: 'border-left:5px solid transparent',

    initComponent: function ()
    {
        this.callParent();
        this.mixins["BaseCallPanel"].constructor.call(this);

        this.groupNameLabel = Ext.create('Ext.form.Label',
        {
            style: 'font-size:' + FONT_SIZE_TEXT + 'px;',
            margin: '0 0 0 5'
        });

        this.additionalInfoLabel = Ext.create('Ext.form.Label',
        {
            style: 'font-size:' + FONT_SIZE_TEXT + 'px;',
            margin: '2 0 0 5'
        });

        this.waitTimeLabel = Ext.create('Ext.form.Label',
        {
            style: 'font-size:' + FONT_SIZE_TEXT + 'px;',
            margin: '0 5 0 5'
        });

        this.additionalInfoFromDataConnectLabel = Ext.create('Ext.form.Label',
        {
            style: 'font-size:' + FONT_SIZE_TEXT + 'px;',
            margin: '2 0 0 5'
        });

        this.groupRow = this.add(Ext.create('Ext.Container',
        {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '0 0 5 0',
            flex: 1,
            hidden: true,
            items:
            [
                this.groupNameLabel,
                this.waitTimeLabel
            ]
        }));

        if (isValid(this.initialCallEvent)) 
        {
            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            this.onNewCallEventForMe(lastCallEvent);
        }
        this.setColors();

        this.updateVisibility();
    },

    onNewCallEventForMe: function (callEvent)
    {
        this.mixins.BaseCallPanel.onNewCallEventForMe.call(this, callEvent);

        Ext.batchLayouts(function ()
        {
            this.updateACDInformation(callEvent);
            this.setColors(callEvent);

            if (callEvent.isOutgoing())
            {
                this.waitTimeLabel.hide();
            }

            this.updateVisibility();
        }, this);
    },

    updateVisibility: function ()
    {
        this.setVisible(this.isACDCall() || this.hasAdditionalInformationFromDataConnect());
    },

    hasAdditionalInformationFromDataConnect: function ()
    {
        return isValidString(this.getValueForSpecialAttribute());
    },

    setColors: function ()
    {
        var labels = [this.groupNameLabel, this.additionalInfoLabel, this.waitTimeLabel, this.additionalInfoFromDataConnectLabel];
        var color = this.isInternalCall() ? COLOR_ACD_CALL_PANEL_LABEL_FOR_INTERNAL_CALLS : COLOR_ACD_CALL_PANEL_LABEL_FOR_EXTERNAL_CALLS;
        
        Ext.each(labels, function (label)
        {
            label.setStyle({ color: color });
        });

        var backgroundColor = this.isInternalCall() ? COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS : COLOR_ACD_CALL_PANEL_FOR_EXTERNAL_CALLS;

        this.setStyle({ 'background-color': backgroundColor });
    },

    updateACDInformation: function (call)
    {
        this.updateGroupName(call);
        this.updateWaitTime(call);
        this.updateAdditionalInformation(call);
        this.updateAdditionalInformationFromDataConnect(call);
    },

    updateGroupName: function (call)
    {
        if (!isValid(call))
        {
            return;
        }

        var group = this.getACDGroup();
        if (isValid(group))
        {
            this.groupRow.show();
            this.groupNameLabel.setHtml(this.createKeyValueLine(LANGUAGE.getString("group"), Ext.String.htmlEncode(group.getName())));
            this.groupRow.setVisible(true);
        }
    },

    updateWaitTime: function (call)
    {
        if (!isValid(call))
        {
            return;
        }

        if (isValid(call.getACDCallInfo()))
        {
            var waitTime = call.getACDCallInfo().getWaitTime();
            this.waitTimeLabel.setHtml(this.createKeyValueLine(LANGUAGE.getString("waitingTime"), convertSecondsToString(waitTime)));
        }
    },

    updateAdditionalInformation: function (call)
    {
        if (!isValid(call))
        {
            return;
        }

        if (isValid(call.getACDCallInfo()))
        {
            var additionalInfo = call.getACDCallInfo().getAdditionalInfo();
            var html = '';
            var keyValuePairs = this.splitIntoKeyValuePairs(additionalInfo);
            Ext.each(keyValuePairs, function (pair)
            {
                html += this.createKeyValueLine(pair.key, pair.value);
            }, this);
            this.additionalInfoLabel.setHtml(html);

            if (isValidString(additionalInfo))
            {
                this.add(this.additionalInfoLabel);
            }
        }
    },
    //TODO: Das müßte ne allgemeine Methode werden
    createKeyValueLine: function (key, value)
    {
        var line = '<div style="display:flex;font-size:' + FONT_SIZE_SUBTITLE + 'px"><div class="eclipsedText" style="flex:1">' + key + ':</div>';
        if (isValidString(value))
        {
            line += '<div style="flex:3;margin-left:5px;';
            if (this.isInternalCall())
            {
                line += 'color: lemonchiffon';
            }
            line += '">' + value + '</div>';
        }
        line += '</div>';
        return line;
    },

    splitIntoKeyValuePairs: function (str)
    {
        var result = [];
        var lines = str.split('\r\n');
        Ext.each(lines, function (line)
        {
            var key, value;
            var position = line.indexOf(':');
            if (position === -1)
            {
                key = line;
            }
            else
            {
                key = line.substr(0, position);
                value = line.substr(position + 1);
            }
            

            result.push({ key: key.trim(), value: isValidString(value) ? value.trim() : "" });
        }, this);
        return result;
    },

    updateAdditionalInformationFromDataConnect: function (call)
    {
        if (isValid(this.contact) && isValidString(this.getSpecialAttribute()))
        {
            var line = this.createKeyValueLine(this.getSpecialAttribute(), this.getValueForSpecialAttribute());
            
            this.additionalInfoFromDataConnectLabel.setHtml(line);

            if (isValidString(this.getValueForSpecialAttribute()))
            {
                this.add(this.additionalInfoFromDataConnectLabel);
            }
        }
    },

    getValueForSpecialAttribute: function ()
    {
        if (isValid(this.contact))
        {
            return this.contact.getSpecialAttributeValue();
        }
        return "";
    },

    getSpecialAttribute: function ()
    {
        if (isValid(this.contact))
        {
            return this.contact.getSpecialAttribute();
        }
        return "";
    },

    setCallId: function (callId)
    {
        this.callId = callId;

        var callEvent = CURRENT_STATE_CALL.getLastCallEvent(callId);
        if (isValid(callEvent)) {
            this.onNewCallEventForMe(callEvent);
        }
    },

    onMakeCallSuccess: function (response) {
        if (response.getReturnValue().getCode() !== 0) {
            this.onMakeCallFailed();
        }
    },

    onMakeCallException: function ()
    {
        this.onMakeCallFailed();
    },

    onMakeCallFailed: function ()
    {

    }
});

//TODO: Mit CallerPanel verschmelzen?
Ext.define('CallDisplayPanel',
{
    extend: 'Ext.Container',
    mixins: ['BaseCallPanel'],

    layout:
    {
        type: 'hbox'
    },

    
    contact: null,
    selectedNumber: "",

    style: 'border-left:5px solid transparent',
    
    initComponent: function ()
    {
        this.callParent();
        this.mixins["BaseCallPanel"].constructor.call(this);

        this.photo = this.add(Ext.create('Photo',
        {
            margin: '10 0 0 5',
            contact: this.contact,
            avatarImageName: 'phone_small',
            avatarColor: WHITE
        }));

        this.callerPanel = this.add(Ext.create('CallerPanel',
        {
            parent: this,
            callId: this.callId,
            contact: this.contact,
            selectedNumber: this.selectedNumber,
            initialCallEvent: this.initialCallEvent,
            margin: '0 0 0 ' + MARGIN_BETWEEN_PHOTO_AND_NAME,
            defaultPhoneImage: this.defaultPhoneImage
        }));

        var contact = this.contact;
        this.contact = undefined;
        this.setContact(contact, this.selectedNumber);

        if (isValid(this.initialCallEvent))
        {
            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            this.onNewCallEventForMe(lastCallEvent);
        }
        this.on('boxready', () =>
        {
            this.setColors();
        });
    },

    setContact: function (contact)
    {
        if (isValid(contact))
        {
            this.contact = contact;

            if (!this.contact.isRealContact() && isValidString(this.getImageNameForNumber()))
            {
                this.photo.avatarImageName = this.getImageNameForNumber();
                this.photo.avatarColor = WHITE;
            }
            else
            {
                this.photo.avatarImageName = "";
            }


            this.photo.setContact(contact);
        }
        else
        {
            this.photo.avatarImageName = new TelephoneNumber(this.selectedNumber).isMobileNumber() ? 'mobile_small' : 'phone_small';
        }

        this.callerPanel.setContact(contact); //normalerweise nicht nötig; eingebaut für den Fall, dass man outbound einen ACD-Call macht, für den man schon einen Kontakt hat, dann wird der hier richtig weitergereicht
    },

    setNumber: function (number)
    {
        this.selectedNumber = number;

        this.callerPanel.setNumber(number);
    },

    getImageNameForNumber: function ()
    {
        return getImageNameForNumber(this.contact, this.selectedNumber);
    },

        
    setCallId: function (callId)
    {
        this.callId = callId;

        var callEvent = CURRENT_STATE_CALL.getLastCallEvent(callId);
        if (isValid(callEvent))
        {
            this.onNewCallEventForMe(callEvent);
        }

        this.callerPanel.setCallId(callId);
    },

    setInitialCallEvent: function (callEvent)
    {
        this.mixins.BaseCallPanel.setInitialCallEvent.call(this, callEvent);

        this.callerPanel.setInitialCallEvent(callEvent);
    },

    onNewCallEventForMe: function (callEvent)
    {
        this.mixins.BaseCallPanel.onNewCallEventForMe.call(this, callEvent);

        this.setColors();
    },

    setColors: function ()
    {
        var backgroundColor = this.isInternalCall() ? COLOR_CALL_DISPLAY_PANEL_FOR_INTERNAL_CALLS :  COLOR_CALL_DISPLAY_PANEL_FOR_EXTERNAL_CALLS;
        
        this.setStyle('background-color', backgroundColor);

        if (this.isInternalCall())
        {
            this.photo.setColorsForInitials(COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS, WHITE);
        }
        else
        {
            this.photo.setColorsForInitials(COLOR_ACD_CALL_PANEL_FOR_EXTERNAL_CALLS, WHITE);
        }
    },
    
    onMakeCallSuccess: function (response)
    {
        this.callerPanel.onMakeCallSuccess(response);

        if (response.getReturnValue().getCode() !== 0)
        {
            this.onMakeCallFailed();
        }
    },

    onMakeCallException: function ()
    {
        this.onMakeCallFailed();
    },

    onMakeCallFailed: function ()
    {
        this.callerPanel.onMakeCallFailed();
    },

    onMaxTalkTimeExceeded: function ()
    {
        this.parent.onMaxTalkTimeExceeded();
    }
});

Ext.define('CallButtons',
{
    extend: 'Ext.Container',
    mixins: ['BaseCallPanel'],

    padding: '10',
    layout:
    {
        type: 'hbox',
        pack: 'center'
    },

    style:
    {
        backgroundColor: PANEL_BACKGROUND_GREY
    },

    initComponent: function ()
    {
        this.callParent();
        this.mixins["BaseCallPanel"].constructor.call(this);

        var self = this;

        this.conferenceButton = Ext.create('CallButton',
        {
            iconName: 'conference',
            tooltip: LANGUAGE.getString("conference"),
            clickListener: function ()
            {
                self.parent.onButtonClickedConference(self.conferenceButton);
            },
            margin: '0 5 0 0',
            hidden: true
        });

        this.swapHoldButton = Ext.create('CallButton',
        {
            iconName: 'swapHold',
            tooltip: LANGUAGE.getString("swapHold"),
            clickListener: function ()
            {
                self.parent.onButtonClickedSwapHold();
            },
            margin: '0 5 0 0',
            hidden: true
        });

        this.holdButton = Ext.create('CallButton',
            {
                iconName: 'pause',
            tooltip: LANGUAGE.getString("holdCall"),
            clickListener: function ()
            {
                /*
                self.holdButton.disable();
                var enableButton = function ()
                {
                    self.holdButton.enable();
                };*/
                SESSION.hold(self.callId, DEFAULT_SUCCESS_CALLBACK(null, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorHold"), null));
            },
            margin: '0 5 0 0',
            hidden: true
        });
        
        this.unholdButton = Ext.create('CallButton',
        {
            iconName: 'pause',
            iconColor: WHITE,
            backgroundColor: COLOR_CALL_BUTTON_ON_HOVER,
            backgroundColorOnHover: COLOR_MAIN_2,
            tooltip: LANGUAGE.getString("unhold"),
            clickListener: function ()
            {
                /*
                self.unholdButton.disable();
                var enableButton = function ()
                {
                    self.unholdButton.enable();
                };*/
                SESSION.unhold(self.callId, DEFAULT_SUCCESS_CALLBACK(null, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorUnhold"), null));
            },
            hidden: true,
            margin: '0 5 0 0'
        });
        
        this.directTransferButton = Ext.create('CallButton',
        {
            tooltip: LANGUAGE.getString("blindTransferTooltip"),
            iconName: ICON_TRANSFER_CALL,
            clickListener: function ()
            {
                if (CURRENT_STATE_CALL.isContactCenterTransferPossible(self.callId))
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_showDialogForACDTransfer(self.callId);
                }
                else
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_showDialogForDirectTransfer(self.callId);
                }
            },
            margin: '0 5 0 0',
            hidden: true
        });
        
        this.completeTransferButton = Ext.create('CallButton',
            {
                iconName: ICON_TRANSFER_CALL,
            tooltip: LANGUAGE.getString("completeTransfer"),
            clickListener: function ()
            {
                self.parent.onButtonClickedCompleteTransfer(self.completeTransferButton);
            },
            hidden: true,
            margin: '0 5 0 0'
        });

        this.secondCallButton = Ext.create('CallButton',
        {
            tooltip: LANGUAGE.getString("secondCall"),
            iconName: ICON_SECOND_CALL,
            clickListener: function ()
            {
                self.parent.onButtonClickedSecondCall(self.secondCallButton);
            },
            margin: '0 5 0 0',
            hidden: true
        });
        
        this.hangUpButton = Ext.create('CallButton',
        {
            iconName: 'hangUp',
            iconColor: COLOR_CALL_BUTTON_HANG_UP,
            tooltip: LANGUAGE.getString("hangUp"),
            clickListener: function ()
            {
                self.parent.onButtonClickedHangUp();
            },
            hidden: true
        });
        
        this.answerButton = Ext.create('CallButton',
        {
            iconName: 'phone',
            iconColor: COLOR_CALL_BUTTON_DIAL,
            tooltip: LANGUAGE.getString("answerCall"),
            clickListener: function () {
                self.parent.onButtonClickedAnswer(self.answerButton);
            },
            hidden: true,
            margin: '0 5 0 0'
        });

        this.dtmfButton = Ext.create('CallButton',
        {
            iconName: 'keypad',
            tooltip: LANGUAGE.getString("dtmf"),
            clickListener: function ()
            {
                self.parent.onButtonClickedDtmf(self.dtmfButton);
            },
            hidden: true,
            margin: '0 5 0 0'
        });

        this.startRecordingButton = Ext.create('CallButton',
        {
            iconName: 'circle',
            tooltip: LANGUAGE.getString("startRecording"),
            clickListener: function ()
            {
                self.startRecordingButton.hide();
                self.stopRecordingButton.show();

                self.parent.onButtonClickedStartRecording(self.startRecordingButton);
            },
            hidden: true,
            margin: '0 5 0 0'
        });

        this.stopRecordingButton = Ext.create('CallButton',
        {
            iconName: 'circle',
            iconColor: COLOR_CALL_BUTTON_HANG_UP,
            tooltip: LANGUAGE.getString("stopRecording"),
            clickListener: function ()
            {
                if (CURRENT_STATE_CALL.isStopRecordingPossible(self.callId))
                {
                    self.startRecordingButton.show();
                    self.stopRecordingButton.hide();

                    self.parent.onButtonClickedStopRecording(self.stopRecordingButton);
                }
                else
                {
                    showInfoMessage(LANGUAGE.getString("recordingCannotBeStopped"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            },
            hidden: true,
            margin: '0 5 0 0'
        });

        this.onMute = () =>
        {
            this.unmuteButton.show();
            this.muteButton.hide();
        };

        this.onUnmute = () =>
        {
            this.unmuteButton.hide();
            this.muteButton.show();
        };

        this.muteButton = Ext.create('CallButton',
        {
            iconName: 'microphone',
            tooltip: LANGUAGE.getString("muteCall"),
            clickListener: function ()
            {
                self.onMute();

                if (DEVICEMANAGER)
                {
                    DEVICEMANAGER.mute();
                }
            },
            hidden: !SESSION.isSIPMode(),
            margin: '0 5 0 0'
        });

        this.unmuteButton = Ext.create('CallButton',
        {
            iconName: 'noMicrophone',
            iconColor: COLOR_CALL_BUTTON_HANG_UP,
            tooltip: LANGUAGE.getString("unmuteCall"),
            clickListener: function ()
            {
                self.onUnmute();

                if (DEVICEMANAGER)
                {
                    DEVICEMANAGER.unmute();
                }
            },
            hidden: true,
            margin: '0 5 0 0'
            });

        if (DEVICEMANAGER)
        {
            DEVICEMANAGER.addEventListener("deviceMute", this.onMute);
            DEVICEMANAGER.addEventListener("deviceUnmute", this.onUnmute);
        }
        
        this.callActionButtons =
        [
            this.conferenceButton,
            this.swapHoldButton,
            this.holdButton,
            this.unholdButton,
            this.directTransferButton,
            this.completeTransferButton,
            this.secondCallButton,
            this.dtmfButton,
            this.startRecordingButton,
            this.stopRecordingButton,
            Ext.create('Ext.Component', {flex: 1}),
            this.muteButton,
            this.unmuteButton,
            this.hangUpButton,
            this.answerButton
        ];

        this.add(this.callActionButtons);

        if (isValid(this.initialCallEvent)) 
        {
            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            this.onNewCallEventForMe(lastCallEvent);
        }
    },

    destroy: function ()
    {
        if (DEVICEMANAGER)
        {
            DEVICEMANAGER.removeEventListener("deviceMute", this.onMute);
            DEVICEMANAGER.removeEventListener("deviceUnmute", this.onUnmute);
        }
        this.callParent();
    },

    onNewCallEventForMe: function(callEvent)
    {
        this.mixins.BaseCallPanel.onNewCallEventForMe.call(this, callEvent);

        Ext.batchLayouts(function ()
        {
            this.updateButtons();
        }, this);
        

        if (/*callEvent.isDisconnected() ||*/ callEvent.isIdle())
        {
            this.onCallEnd();
        }
    },

    setCallId: function (callId)
    {
        this.callId = callId;

        this.updateButtons();
    },

    updateButtons: function ()
    {
        if (!isValid(this.callId) || !isValid(CURRENT_STATE_CALL.getLastCallEvent(this.callId)))
        {
            return;
        }
        
        Ext.batchLayouts(() =>
        {
            this.setButtonVisible(this.hangUpButton, CURRENT_STATE_CALL.isHangUpAllowed(this.callId));
            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            if (isValid(lastCallEvent))
            {
                this.hangUpButton.setTooltip(LANGUAGE.getString(lastCallEvent.isConferenced() ? "hangUpConference" : "hangUp"));
            }
            this.setButtonVisible(this.answerButton, this.answerViaNotifierWasNotSuccessfull && CURRENT_STATE_CALL.isAnswerAllowed(this.callId));

            this.setButtonVisible(this.holdButton, CURRENT_STATE_CALL.isHoldAllowed(this.callId));
            this.setButtonVisible(this.unholdButton, CURRENT_STATE_CALL.isUnholdAllowed(this.callId));

            this.setButtonVisible(this.secondCallButton, CURRENT_STATE_CALL.isMakeCallAllowed(this.callId) && !CURRENT_STATE_CALL.isDialtone(this.callId));

            this.setButtonVisible(this.directTransferButton, !CURRENT_STATE_CALL.isCompleteTransferAllowed(this.callId) && (CURRENT_STATE_CALL.isBlindTransferAllowed(this.callId) || CURRENT_STATE_CALL.isRedirectAllowed(this.callId)));

            this.setButtonVisible(this.completeTransferButton, CURRENT_STATE_CALL.isCompleteTransferAllowed(this.callId));
            this.setButtonVisible(this.swapHoldButton, CURRENT_STATE_CALL.isSwapHoldAllowed(this.callId));
            this.setButtonVisible(this.conferenceButton, CURRENT_STATE_CALL.isCompleteConferenceAllowed(this.callId));
            this.setButtonVisible(this.dtmfButton, CURRENT_STATE_CALL.isDTMFAllowed(this.callId));

            this.setButtonVisible(this.startRecordingButton, CURRENT_STATE_CALL.isStartRecordingPossible(this.callId));
            this.setButtonVisible(this.stopRecordingButton, CURRENT_STATE_CALL.isSessionRecorded(this.callId) || CURRENT_STATE_CALL.isStopRecordingPossible(this.callId));
            
            this.stopRecordingButton.setTooltip(LANGUAGE.getString(CURRENT_STATE_CALL.isStopRecordingPossible(this.callId) ? "stopRecording" : "recording"));

            if (CURRENT_STATE_CALL.isIdle(this.callId) || CURRENT_STATE_CALL.isDisconnected(this.callId))
            {
                this.setButtonVisible(this.muteButton, false);
                this.setButtonVisible(this.unmuteButton, false);
            }

            if (this.stopRecordingButton.btnIconEl)
            {
                var newAnimation = CURRENT_STATE_CALL.isSessionRecorded(this.callId) ? 'fade 2s infinite' : 'none';
                if (newAnimation !== this.stopRecordingButton.btnIconEl.dom.style.animation)
                {
                    this.stopRecordingButton.btnIconEl.dom.style.animation = newAnimation;
                }
            }
        }, this);        
    },

    setButtonVisible: function (button, visible)
    {
        if (!isValid(button) || button.destroyed)
        {
            return;
        }
        button.setVisible(visible);
        button.setMargin(visible ? "0 5 0 0" : "0 0 0 0");
    },

    onAnswerSuccess: function (response)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            this.onAnswerFailed(response.getReturnValue().getDescription());
        }
    },

    onAnswerException: function ()
    {
        this.onAnswerFailed(LANGUAGE.getString("errorAnswer"));
    },

    onAnswerFailed: function (errorText)
    {
        this.answerViaNotifierWasNotSuccessfull = true;
        this.updateButtons();
    },

    onMakeCallSuccess: function (response)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            this.onCallEnd();
        }
    },

    onMakeCallException: function ()
    {
        this.onCallEnd();
    },

    onCallEnd: function ()
    {
        this.updateButtons();
    }
});

Ext.define(CLASS_CALL_PANEL,
    {
        extend: 'Ext.Container',
        mixins: ['BaseCallPanel'],

        layout:
        {
            type: 'vbox',
            pack: 'start',
            align: 'stretch'
        },

        autoRender: true,

        contact: null,
        selectedNumber: "",
        initialCallEvent: null,

        callId: 0,
                
        titleIconWhite: '',
        titleIconBlack: '',

        initComponent: function ()
        {
            this.callParent();
            this.mixins["BaseCallPanel"].constructor.call(this);

            this.initSubComponents();
            this.updateTitle();
        },

        destroy: function ()
        {
            var dialogs = [this.secondCallDialog, this.transferDialog, this.dtmfDialog];
            Ext.each(dialogs, function (dialog)
            {
                if (dialog && !dialog.destroyed)
                {
                    dialog.hide();
                }
            });
            
            CURRENT_STATE_CALL.deleteInformationForCall(this.callId);

            window.removeEventListener("message", this.callbackForMessagesFromForm, false);

            this.callParent();
        },

        initSubComponents: function ()
        {
            var self = this;

            var components = [];

            this.titleIconWhite = IMAGE_LIBRARY.getImage("phone", 64, COLOR_TAB_ICON_SELECTED);
            this.titleIconBlack = IMAGE_LIBRARY.getImage("phone", 64, COLOR_TAB_ICON_NORMAL);

            this.callerDisplayPanel = Ext.create('CallDisplayPanel',
                {
                    parent: this,
                    //contact: this.contact,
                    selectedNumber: this.selectedNumber,
                    initialCallEvent: this.initialCallEvent
                });

            this.acdCallInfosPanel = Ext.create('ACDCallInfoPanel',
                {
                    initialCallEvent: this.initialCallEvent,
                    selectedNumber: this.selectedNumber
                });

            this.callButtons = Ext.create('CallButtons',
                {
                    contact: this.contact,
                    initialCallEvent: this.initialCallEvent,
                    selectedNumber: this.selectedNumber,
                    parent: this
                });

            var callPartsContainer = Ext.create('Ext.Container',
                {
                    margin: '0 0 15 0',
                    layout:
                    {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    maxWidth: WIDTH_CALL_DISPLAY_PANEL,
                    items:
                    [
                        this.callerDisplayPanel,
                        this.acdCallInfosPanel,
                        this.callButtons
                    ]
                });
            components.push(Ext.create('Ext.Container',
            {
                layout:
                {
                    type: 'vbox',
                    align: 'stretch'
                },
                scrollable: 'vertical',
                items:
                [
                    callPartsContainer
                ]
            }));
            const marginLeftActionButtons = 15;
            this.actionButtons = Ext.create('Ext.Container',
                {
                    margin: '10 10 0 ' + marginLeftActionButtons,
                    layout: 'column',
                    width: WIDTH_CALL_DISPLAY_PANEL
                });
            var actions = ACTIONS.getActionsForCallPanel();
            Ext.Array.sort(actions, function (action1, action2)
            {
                var actionTypePriorities = [ACTION_TELEPHONY_DIAL, ACTION_TELEPHONY_REDIRECT, ACTION_OPENURL, ACTION_TELEPHONY_FORWARD, ACTION_TELEPHONY_SENDDTMF, ACTION_TELEPHONY_HANGUP];
                var priority1 = actionTypePriorities.indexOf(action1.config.Action);
                var priority2 = actionTypePriorities.indexOf(action2.config.Action);

                if (priority1 === priority2)
                {
                    return action1.config.Name.localeCompare(action2.config.Name);
                }
                return priority1 < priority2 ? -1 : 1;
            });
            Ext.each(actions, function (action, index)
            {
                action.callPanel = self;
                action.lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(self.callId);

                var marginBetweenActionButtons = 10;
                self.actionButtons.add(Ext.create('ActionThinButton',
                {
                    width: (WIDTH_CALL_DISPLAY_PANEL - marginBetweenActionButtons) / 2 - marginLeftActionButtons, //Aktionsbuttons zweispaltig anzeigen
                    margin: '10 ' + (index % 2 === 0 ? marginBetweenActionButtons : 0) + ' 0 0',
                    action: action
                }));
            });
            if (!Ext.isEmpty(actions))
            {
                callPartsContainer.add(this.actionButtons);
            }

            this.contactPanel = Ext.create('Ext.Container',
                {
                    title: LANGUAGE.getString("contact").toUpperCase(),
                    layout:
                    {
                        type: 'vbox',
                        align: 'stretch'
                    }
                });

            this.businessCardPanel = this.contactPanel.add(Ext.create('BusinessCardPanel',
                {
                    contact: this.contact,
                    margin: '5 0 0 0',
                    onRoute: function (clickedButton, contact)
                    {
                        self.onRoute(clickedButton, contact);
                    },
                    onMap: function (clickedButton, contact)
                    {
                        self.onMap(clickedButton, contact);
                    }
                }));

            this.separator = components.push(Ext.create('BarSeparator', {}));

            //TODO: tabPanel sollte eine eigene Klasse werden
            this.tabPanel = Ext.create('UniqueTabPanel',
                {
                
                margin: '0 0 0 0',
                flex: 1,
                border: false
            });

            if (!SESSION.isSIPMode())
            {
                components.push(this.tabPanel); //Im SIP-Modus wird das TabPanel erst später hinzugefügt, damit der Aufbau der WebRTC-Verbindung schneller ist (weil da ansonsten zuviel von der UI blockiert wird)
            }

            this.addNoticePanel();

            this.buttons = Ext.create('ContactButtons',
            {
                showCallButton: false,
                margin: '20 0 0 5',
                parent: this,
                contact: this.contact
            });
            
            this.contactPanel.add(this.buttons);
            if (isValid(this.contact))
            {
                this.showContactPanel();
            }

            this.activitiesPanel = Ext.create('ActivitiesPanel',
                {
                    closable: false,
                    initialCallEvent: this.initialCallEvent,
                    groupIdForOutboundCall: this.groupId,
                    contact: this.contact,
                    onActivitiesLoaded: function ()
                    {

                    }
                });
            this.addToTabPanel(this.activitiesPanel);
            
            this.on('beforeclose', function ()
            {
                return self.onBeforeClose();
            });

            this.on(
            {
                el:
                {
                    click: function ()
                    {
                        if (isValid(self.confirmComponentHangUpCall))
                        {
                            self.remove(self.confirmComponentHangUpCall);
                            self.confirmComponentHangUpCall = null;
                        }
                    }
                }
            });


            if (this.callId > 0)
            {
                this.setCallId(this.callId);
            }

            if (isValid(this.initialCallEvent))
            {
                var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
                this.onNewCallEventForMe(lastCallEvent);
            }

            this.mainContainer = this.add(new Ext.Container(
                {
                    responsiveConfig: SWITCH_LAYOUT,
                    flex: 1,
                    items: components
                }));
        },

        onBeforeClose: function ()
        {
            var self = this;
            if (CURRENT_STATE_CALL.FormHasToBeFilled(this.callId))
            {
                this.showError(LANGUAGE.getString("formHasToBeFilled"), function ()
                {
                    var callEvent = CURRENT_STATE_CALL.getLastCallEvent(self.callId);
                    if (isValid(callEvent))
                    {
                        var acdInfo = callEvent.getACDCallInfo();
                        if (isValid(acdInfo))
                        {
                            var sessionId = acdInfo.getSessionId();
                            SESSION.finishSession(sessionId, function (response)
                            {
                                if (response.getReturnValue().getCode() !== 0)
                                {
                                    console.log("finishSession failed!", response, sessionId);
                                }
                            }, function () { });
                        }
                        if (!callEvent.isIdle())
                        {
                            self.hangUp();
                        }
                    }
                    self.close(true);
                    
                });
                return false;//cancels the close event
            }

            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            if (!isValid(lastCallEvent) || lastCallEvent.isIdle() || lastCallEvent.isDisconnected())
            {
                return true;
            }
            this.parent.setActiveTab(this);

            var errorMessage = LANGUAGE.getString("hangUpCall");
            if (this.isNoticeUnsaved())
            {
                errorMessage = LANGUAGE.getString("hangUpCallWithoutSaveNotice");
            }

            if (lastCallEvent && lastCallEvent.isConferenced())
            {
                errorMessage = LANGUAGE.getString("hangUpConferenceReally");
            }

            this.showError(errorMessage, function ()
            {
                if (CURRENT_STATE_CALL.hasNoForm(self.callId) || !CURRENT_STATE_CALL.FormHasToBeFilled(self.callId))
                {
                    self.close(true);
                }
                self.hangUp();
            });

            return false;  //cancels the close event
        },

        showError: function (text, listener)
        {
            if (isValid(this.confirmComponentHangUpCall))
            {
                return;
            }
            this.confirmComponentHangUpCall = this.showErrorComponent(Ext.create('ConfirmationComponent',
            {
                borderWidth: 1,
                margin: '5 5 10 5',
                errorType: ErrorType.Info,
                errorMessageText: text,
                yesCallback: listener
            }));
        },

        setCallId: function (callId)
        {
            this.callId = callId;

            this.callerDisplayPanel.setCallId(callId);
            this.callButtons.setCallId(callId);
            this.acdCallInfosPanel.setCallId(callId);
            this.callNotePanel.callId = callId;
        },

        setContact: function (contact)
        {
            this.contact = contact;

            this.callerDisplayPanel.setContact(contact);
        },

        setNumber: function (number)
        {
            this.selectedNumber = number;

            this.callerDisplayPanel.setNumber(number);
        },

        setInitialCallEvent: function (callEvent)
        {
            this.mixins.BaseCallPanel.setInitialCallEvent.call(this, callEvent);

            this.callerDisplayPanel.setInitialCallEvent(callEvent);
            this.callButtons.setInitialCallEvent(callEvent);
            this.acdCallInfosPanel.setInitialCallEvent(callEvent);
        },

        onAnswerSuccess: function (response)
        {
            if (isValid(this.callButtons))
            {
                this.callButtons.onAnswerSuccess(response);
            }

            if (response.getReturnValue().getCode() === 0)
            {
                if (isValid(this.activitiesPanel))
                {
                    var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
                    if (isValid(lastCallEvent))
                    {
                        this.activitiesPanel.setACDCall(isValid(lastCallEvent.getACDCallInfo()));
                    }
                }

                this.addTabPanelIfSipIsReady();
            }
            else
            {
                this.showErrorMessage(response.getReturnValue().getDescription());
            }

        },

        onAnswerException: function ()
        {
            if (isValid(this.callButtons))
            {
                this.callButtons.onAnswerException();
            }
            this.showErrorMessage(LANGUAGE.getString("errorAnswer"));
        },

        addTabPanelIfSipIsReady: function ()
        {
            if (!SESSION.isSIPMode() || this.tabPanel.rendered)
            {
                return;
            }
            var promise = WebRtcForSip.waitForConnection();
            promise.finally(() =>
            {
                this.mainContainer.add(this.tabPanel);
            });
        },

        onMakeCallSuccess: function (response, groupId)
        {
            //response.getReturnValue().setCode(12345);
            //response.getReturnValue().setDescription("Ihre Telefonieaktion und so weiter und so fort. Bitte verständigen Sie Ihren Aktivitator.");

            this.groupId = groupId;

            if (isValid(this.activitiesPanel))
            {
                this.activitiesPanel.setACDCall(isValid(groupId) && groupId > 0);
            }

            if (response.getReturnValue().getCode() === 0)
            {
                this.setCallId(response.getCallId());
            }
            else
            {
                this.titleIconWhite = IMAGE_LIBRARY.getImage("phone_hangUp", 64, COLOR_TAB_ICON_SELECTED);
                this.titleIconBlack = IMAGE_LIBRARY.getImage("phone_hangUp", 64, COLOR_TAB_ICON_NORMAL);

                if (isValid(this.tab))
                {
                    //this.tab.setIcon(this.tab.active ? this.titleIconWhite : this.titleIconBlack);
                    this.tab.setIcon(this.titleIconBlack);
                }

                this.showErrorMessage(CURRENT_STATE_CALL.isMyLineStateBusy() ? LANGUAGE.getString("lineStateIsBusy") : response.getReturnValue().getDescription());
                this.remove(this.tabPanel);
            }
            this.callerDisplayPanel.onMakeCallSuccess(response);
            this.callButtons.onMakeCallSuccess(response);
            this.acdCallInfosPanel.onMakeCallSuccess(response);
        },

        onMakeCallException: function ()
        {
            this.showErrorMessage(LANGUAGE.getString("errorMakeCall"));

            this.callerDisplayPanel.onMakeCallException();
            this.callButtons.onMakeCallException();
            this.acdCallInfosPanel.onMakeCallException();
        },

        showErrorMessage: function (errorText)
        {
            this.showErrorComponent(Ext.create('ErrorMessageComponent',
            {
                errorMessageText: errorText,
                errorType: ErrorType.Error,
                borderWidth: 1,
                margin: 5
            }));
        },

        showErrorComponent: function (component)
        {
            if (this.destroyed)
            {
                return;
            }
            var result = this.insert(0, component);
            this.updateLayout(); //falls der ErrorText zu lang ist für eine Zeile, würde sich die Confirmation ohne das updateLayout mit dem CallDisplay überlappen
            return result;
        },

        onConnectionLost: function ()
        {
            this.close(true);
        },

        updateTitle: function ()
        {
            var numberOrName = this.getName();
            if (isValidString(numberOrName))
            {
                this.title = numberOrName.toUpperCase();
            }
            else
            {
                this.title = LANGUAGE.getString('phoneCall').toUpperCase();
            }

            if (isValid(this.tab))
            {
                this.tab.setText(Ext.String.htmlEncode(this.title));
            }
        },

        onTabFocus: function ()
        {
            this.updateTabIcon();

            this.activitiesPanel.startTimer();

            if (isValid(this.formPanel))
            {
                this.formPanel.showIframe();
            }
        },

        onTabBlur: function ()
        {
            this.updateTabIcon();
        },

        onNewEvents: function (response)
        {
            var lastOwnerCallEvent;
            Ext.each(response.getOwnerCallEventsForCallId(this.callId), function (callEvent)
            {
                this.executeAutomatedActions(callEvent);
                lastOwnerCallEvent = callEvent;
            }, this);
            if (lastOwnerCallEvent)
            {
                this.onNewCallEventForMe(lastOwnerCallEvent);
            }

            if (CURRENT_STATE_CALL.isIdle(this.callId))
            {
                if (CURRENT_STATE_CALL.isSessionFinished(this.callId))
                {
                    if (!this.isFormPanelSaving())
                    {
                        this.close(true);
                    }
                }
            }

            if (!CURRENT_STATE_CALL.isMyLineStateOKOrBusy())
            {
                this.close(true);
            }
        },

        onNewCallEventForMe: function (call)
        {
            this.mixins.BaseCallPanel.onNewCallEventForMe.call(this, call);

            if (!isValid(this.callerDisplayPanel))
            {
                this.initialCallEvent = call;
                return;
            }

            Ext.batchLayouts(function ()
            {
                if (this.isDestroyed)
                {
                    return;
                }

                if (call.isOutgoing())
                {
                    //Im SIP-Modus warten wir mit dem Hinzufügen des TabPanels, damit webRTC die Verbindungen aufbauen kann und nicht durch die UI blockiert wird
                    this.addTabPanelIfSipIsReady();
                }

                if (isValidString(call.getDisconnectReasonDescription()))
                {
                    if (this.fakeMakeCallSuccessSended)
                    {
                        return;
                    }
                    var makeCallResponse = new www_caseris_de_CaesarSchema_CTI_MakeCallResponse();
                    var returnValue = new www_caseris_de_CaesarSchema_ReturnValue();
                    returnValue.setCode(1);
                    returnValue.setDescription(call.getDisconnectReasonDescription());
                    makeCallResponse.setReturnValue(returnValue);

                    this.onMakeCallSuccess(makeCallResponse);

                    this.fakeMakeCallSuccessSended = true;
                    return;
                }

                this.updateTabIcon(call);

                this.buttons.setContact(this.contact);

                this.activitiesPanel.onNewCallEvent(call, this.contact);

                this.updateTitle();

                this.businessCardPanel.setContact(this.contact);

                this.showContactPanel();

                var acdCallInfo = call.getACDCallInfo();
                if (isValid(acdCallInfo))
                {
                    if(isValid(this.formPanel))
                    {
                        if (!isValidString(acdCallInfo.getChangedFormUrl()) && !isValidString(acdCallInfo.getFormUrl()))
                        {
                            this.tabPanel.remove(this.formPanel);
                        }
                    }
                    else
                    {
                        this.showForm(call);
                    }
                }

                if (call.isIdle())
                {
                    this.onIdle();
                }
                if (call.isDisconnected())
                {
                    this.onDisconnected();
                }
                if (call.isConnected())
                {
                    this.onConnected();
                }
                if (call.isOnHold())
                {
                    this.onHold();
                }
            }, this);
        },
        
        executeAutomatedActions: function (callEvent)
        {
            if (!window.ACTIONS)
            {
                return;
            }
            var self = this;
            var actions = ACTIONS.getAutomatedTelephonyActionsForConnectedAndBusy();
            Ext.each(actions, function (action)
            {
                action.lastCallEvent = callEvent;
                action.callPanel = self;
                if (action.areAllConstraintsSatisfied())
                {
                    action.execute();
                }
            });
        },
        
        showForm: function (call)
        {
            if (isValid(this.formPanel))
            {
                return;
            }
            if (isValid(call) && isValidString(call.getACDCallInfo().getFormUrl()))
            {
                var self = this;
                this.formPanel = Ext.create('FormPanel',
                {
                    closable: false,
                    url: call.getACDCallInfo().getFormUrl(),
                    callId: this.callId,
                    onSaveFinished: function ()
                    {
                        self.close(true);
                    }
                });
                self.addToTabPanel(self.formPanel);
            }
        },

        onIdle: function ()
        {
            this.onCallEnd();
        },

        onDisconnected: function ()
        {
            //this.onCallEnd();
            this.activitiesPanel.stopTimer();
        },

        onCallEnd: function ()
        {
            var callEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            if (callEvent && this.isMaxTalkTimeExceeded(callEvent.getLineTime()))
            {
                this.changeStyleOfCallDisplayPanelAndACDCallInfosPanel('animation', 'none');
                this.changeStyleOfCallDisplayPanelAndACDCallInfosPanel('borderLeft', "5px solid " + COLOR_MAX_TALK_TIME_EXCEEDED);
            }

            if (this.canBeClosed())
            {
                this.close(true);
                return;
            }

            if (CURRENT_STATE_CALL.FormHasToBeFilled(this.callId))
            {
                this.letFormPanelBlink();
            }
        },

        canBeClosed: function ()
        {
            if (this.isFormPanelSaving())
            {
                return false;
            }
            return CURRENT_STATE_CALL.FormCanBeClosed(this.callId); 
        },

        isFormPanelSaving: function ()
        {
            if (this.formPanel && this.formPanel.isSavingInProgress())
            {
                return true;
            }
            return false;
        },
                
        onConnected: function ()
        {
            this.updateTabIcon();
        },

        onHold: function ()
        {
            this.updateTabIcon();
        },

        updateTabIcon: function (callEvent)
        {
            var lastCallEvent = callEvent || CURRENT_STATE_CALL.getLastCallEvent(this.callId);
            var imageName = this.getIconNameForCallEvent(lastCallEvent);
            
            this.titleIconWhite = IMAGE_LIBRARY.getImage(imageName, 64, COLOR_TAB_ICON_SELECTED);
            this.titleIconBlack = IMAGE_LIBRARY.getImage(imageName, 64, COLOR_TAB_ICON_NORMAL);

            if (isValid(this.tab))
            {
                //this.tab.setIcon(this.tab.active ? this.titleIconWhite : this.titleIconBlack);
                this.tab.setIcon(this.titleIconBlack);
            }
        },

        getIconNameForCallEvent: function (callEvent)
        {
            var imageName = "phone";
            if (isValid(callEvent))
            {
                imageName = this.getImageName(callEvent);

                if (callEvent.isOnHold())
                {
                    imageName = "pause";
                }
                if (callEvent.isConferenced())
                {
                    imageName = "conference";
                }
                if (callEvent.isIdle() || callEvent.isDisconnected())
                {
                    imageName = "phone_hangUp";
                }
            }
            return imageName;
        },

    onButtonClickedStartRecording: function (button)
    {
        this.changeRecordingState("Start", LANGUAGE.getString("errorStartRecording"));
    },

    onButtonClickedStopRecording: function (button)
    {
        this.changeRecordingState("Stop", LANGUAGE.getString("errorStopRecording"));
    },

    changeRecordingState: function (command, errorText)
    {
        var sessionInfo = CURRENT_STATE_CALL.getSessionInfoForCallId(this.callId);
        if (isValid(sessionInfo))
        {
            SESSION.recordSession(command, sessionInfo.getSessionId(), function (response)
            {
                if (response.getReturnValue().getCode() !== 0)
                {
                    showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            },
                function ()
                {
                    showErrorMessage(errorText, DEFAULT_TIMEOUT_ERROR_MESSAGES);
                });
        }
        else
        {
            showErrorMessage(errorText, DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    onButtonClickedDtmf: function (button)
    {
        var self = this;
        this.dtmfDialog = Ext.create('ModalDialog',
        {
            width: undefined,
            titleText: LANGUAGE.getString("dtmf"),
            focus: function ()
            {
                Ext.asap(function ()
                {
                    if (keypadPanel)
                    {
                        keypadPanel.focus();
                    }
                });

            }
        });
        var keypadPanel = Ext.create('KeyPadPanel',
        {
            margin: '15 0 25 0',
            keyCallback: function (text)
            {
                SESSION.sendDTMF(self.callId, text, function (response)
                {
                    if (response.getReturnValue().getCode() !== 0)
                    {
                        self.dtmfDialog.changeErrorMessage(response.getReturnValue().getDescription());
                    }
                }, function ()
                    {
                        self.dtmfDialog.changeErrorMessage(LANGUAGE.getString("errorSendDTMF"));
                    });
            }
        });
        this.dtmfDialog.addToBody(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'hbox',
                pack: 'center',
                align: 'stretch'
            },
            items:
            [
                keypadPanel
            ]
        }));
        this.dtmfDialog.addButton({ text: LANGUAGE.getString('cancel'), handler: () => { this.dtmfDialog.hide(); }});
        this.dtmfDialog.show();
    },

    onButtonClickedAnswer: function (button)
    {
        SESSION.answer(this.callId, DEFAULT_SUCCESS_CALLBACK(null, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorAnswer"), null));
    },

    onButtonClickedHangUp: function ()
    {
        if (CURRENT_STATE_CALL.hasNoForm(this.callId))
        {
            this.close(true);
        }
        this.hangUp();
    },

    hangUp: function ()
    {
        var self = this;
        Ext.asap(function ()
        {
            var callbackForDisplayCallPanelAgain = function ()
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_OwnerCall(CURRENT_STATE_CALL.getLastCallEvent(self.callId), true);
            };

            SESSION.hangUp(self.callId, DEFAULT_SUCCESS_CALLBACK(Ext.emptyFn, callbackForDisplayCallPanelAgain), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorHangUp"), callbackForDisplayCallPanelAgain));
        });
    },

    close: function (force)
    {
        if (this.canBeClosed() || force)
        {
            if (isValid(this.parent))
            {
                Ext.batchLayouts(function ()
                {
                    this.parent.removeItem(this, true, true);
                }, this);
            }
            else
            {
                console.log("CallPanel has no parent!");
            }
        }
    },

    onButtonClickedSwapHold: function ()
    {
        SESSION.swapHold(this.callId, 0, DEFAULT_SUCCESS_CALLBACK(null, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorSwapHold"), null));
    },

    onButtonClickedCompleteTransfer: function ()
    {
        this.showErrorComponent(Ext.create('ConfirmationComponent',
        {
            yesCallback: function ()
            {
                SESSION.completeTransfer(DEFAULT_SUCCESS_CALLBACK(null, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorCompleteTransfer"), null));
            },
            noCallback: Ext.emptyFn,
            errorMessageText: LANGUAGE.getString("reallyCompleteTransfer"),
            errorType: ErrorType.Info,
            borderWidth: 1,
            margin: '5 5 10 5'
        }));
    },

    onButtonClickedConference: function ()
    {
        SESSION.completeConference(DEFAULT_SUCCESS_CALLBACK(null, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorCompleteConference"), null));
    },

    onButtonClickedSecondCall: function ()
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_showDialogForNewCall();
    },

    onButtonClickedCallback: function ()
    {
        showErrorMessage("Not yet implemented");
    },
    
    showContactPanel: function ()
    {
        if (!isValid(this.tabPanel, "items"))
        {
            return;
        }

        if (isValid(this.contact) && this.contact.isRealContact())
        {
            var self = this;
            Ext.asap(function () {
                if (self.tabPanel && !self.tabPanel.destroyed && !self.tabPanel.contains(self.contactPanel)) {
                    self.addToTabPanel(self.contactPanel, 0);
                }
            });
            
        }
        else
        {
            this.tabPanel.remove(this.contactPanel, false);
        }
    },
        
    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && this.callId === panel.callId && this.callId > 0;
    },

    onChat: function ()
    {
        this.createChatPanel();
        this.tabPanel.setActiveTab(this.chatPanel);
        this.chatPanel.focus();
    },

    createChatPanel: function ()
    {
        if (!isValid(this.chatPanel))
        {
            this.chatPanel = Ext.create('ChatPanel',
            {
                margin: '5 0 0 5',
                closable: true,
                titleIsContactName: false
            });
            this.chatPanel.setContact(this.contact);
            this.addToTabPanel(this.chatPanel);
        }
    },

    onRoute: function (clickedButton, contact)
    {
        this.openGoogleMaps(true, contact);
    },

    onMap: function (clickedButton, contact)
    {
        this.openGoogleMaps(false, contact);
    },

    openGoogleMaps: function (route, contact) {
        if (!isValid(window.google)) {
            return;
        }
        var mapsPanel = Ext.create('GoogleMapsPanel',
        {
            contact: contact,
            title: LANGUAGE.getString(route ? "route" : "map").toUpperCase(),
            displayRoute: route
        });
        this.addToTabPanel(mapsPanel);
    },

    shouldTabStopBlinking: function ()
    {
        return !CURRENT_STATE_CALL.isOffering(this.callId);
    },

    addToTabPanel: function (tab, position)
    {
        Ext.batchLayouts(function () {
            this.addToTabPanelBatched(tab, position);
        }, this);
    },
    addToTabPanelBatched: function (tab, position)
    {
        if (!isValid(this.tabPanel) || this.tabPanel.destroyed)
        {
            return;
        }

        if (isValid(position))
        {
            this.tabPanel.insert(position, tab);
        }
        else
        {
            this.tabPanel.addItem(tab);
        }
        
        //das tab wird nur dann das aktive Tab, wenn nicht ein anderes in der Wichtigkeits-Reihenfolge davorsteht
        var tabOrder = [this.formPanel, this.contactPanel, this.callNotePanel, this.activitiesPanel];
        var index = tabOrder.indexOf(tab);
        if (index === -1)
        {
            this.tabPanel.setActiveTab(tab);
        }
        else
        {
            var self = this;
            Ext.each(tabOrder, function (tabToShow)
            {
                if (tabToShow === tab)
                {
                    self.tabPanel.setActiveTab(tab);
                }
                else
                {
                    if (isValid(tabToShow))
                    {
                        return false;
                    }
                }
                return true;
            });
        }
    },

    confirmRemove: function ()
    {
        if (!isValid(this.callId) || this.callId <= 0)
        {
            return true;
        }
        return this.onBeforeClose();
    },

    isNoticeUnsaved: function ()
    {
        return isValid(this.callNotePanel) && this.callNotePanel.isDirty();
    },

    addNoticePanel: function ()
    {
        this.callNotePanel = Ext.create('CallNoticePanelForCallPanel',
        {
            noticePanelOwner: this,
            callId: this.callId
        });
        this.addToTabPanel(this.callNotePanel);
        return this.callNotePanel;
    },

    letFormPanelBlink: function ()
    {
        if (isValid(this.formPanel) && isValid(this.tabPanel))
        {
            this.tabPanel.setActiveTab(this.formPanel);
            this.tabPanel.blinkTab(this.formPanel, 3);
        }
    },

    openURL: function (url)
    {
        var iframe = Ext.create('IFrame',
        {
            url: url,
            title: url,
            isEqualToThisPanel: function (panel)
            {
                return getClassName(this) === getClassName(panel);
            }
        });
        this.addToTabPanel(iframe);
    },

    onTransferContactCenterCallToGroupSuccess: function (response)
    {
        if (response.returnValue.Code === 0)
        {
            this.saveForm();
        }
        else
        {
            this.onTransferFailed(response.returnValue.Description);
        }
    },

    onTransferContactCenterCallToGroupException: function ()
    {
        this.onTransferFailed(LANGUAGE.getString("errorTransferCall"));
    },

    onTransferContactCenterCallToAgentSuccess: function (response)
    {
        if (response.returnValue.Code === 0)
        {
            this.saveForm();
        }
        else
        {
            this.onTransferFailed(response.returnValue.Description);
        }
    },

    onTransferContactCenterCallToAgentException: function ()
    {
        this.onTransferFailed(LANGUAGE.getString("errorTransferCall"));
    },

    onTransferFailed: function (errorText)
    {
        showErrorMessage(errorText, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onBlindTransferSuccess: function (response, callId)
    {
        if (callId !== this.callId)
        {
            return;
        }

        if (response.getReturnValue().getCode() === 0)
        {
            this.saveForm();
        }
    },

    onCompleteTransferSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.saveForm();
        }
    },

    saveForm: function ()
    {
        var group = this.getACDGroup();
        if (!group)
        {
            return;
        }

        if (!isValid(this.formPanel))
        {
            return;
        }

        this.formPanel.saveForm(group, this.callId);
    },

    onMaxTalkTimeExceeded: function ()
    {
        if (this.animationStarted)
        {
            return;
        }
        this.animationStarted = true;

        this.changeStyleOfCallDisplayPanelAndACDCallInfosPanel('animation', 'blinkBorderLeft 2s infinite');
    },

    changeStyleOfCallDisplayPanelAndACDCallInfosPanel: function (attributeName, value)
    {
        Ext.each([this.callerDisplayPanel, this.acdCallInfosPanel], function (container)
        {
            container.el.dom.style[attributeName] = value;
        }, this);
    }
});