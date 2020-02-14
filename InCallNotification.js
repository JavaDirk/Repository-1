/**
 * Created by martens on 29.04.2015.
 */
Ext.define('InCallNotification', {
    extend: 'NotificationDialog',
    padding: '0 0 0 0',
    title: '',
    icon: 'phone',

    initComponent: function () {
        this.setTitle(LANGUAGE.getString('incomingCall'));
        this.callParent();

        this.callId = this.initialEvent.getCallId();

        var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(this.callId);
        this.contact = lastCallEvent.getCaller();
        this.number = lastCallEvent.getDisplayNumber();
        this.viaContact = lastCallEvent.getViaCaller();
        
            
        this.createComponents();

        Ext.asap(function () 
        {
            if (SESSION.isTelephonyAllowed())
            {
                this.show();
            }
        }, this);
    },
    
    createComponents: function ()
    {
        var self = this;
        SESSION.addListener(this);
        GLOBAL_EVENT_QUEUE.addEventListener(this);

        this.callDisplayPanel = Ext.create('CallDisplayPanel',
        {
            padding: 0,
            contact: this.contact,
            selectedNumber: this.number,
            initialCallEvent: this.initialEvent
        });

        this.acdCallInfoPanel = Ext.create('ACDCallInfoPanel', 
        {
            initialCallEvent: this.initialEvent
        });

        this.actionContainer = new Ext.Container({
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            flex:1,
            margin: '10 10 0 10'
        });

        this.startCall = Ext.create('AcceptButton',
        {
            handler: (button) =>
            {
                button.disable();
                this.onAccept();
            }
        });

        this.endCall = Ext.create('DeclineButton',
        {
            handler: (button) =>
            {
                button.disable();
                this.onDecline();
            },
            margin: '0 5 0 0'
        });

        this.directTransferButton = Ext.create('RoundThinButton',
        {
            scale: 'small',
            minWidth: 85,
            text: LANGUAGE.getString("blindTransferTooltip"),
            handler: function ()
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
            margin: '0 5 0 0'
        });
        
        this.directTransferButton.setVisible(!CURRENT_STATE_CALL.isCompleteTransferAllowed(this.callId) && (CURRENT_STATE_CALL.isBlindTransferAllowed(this.callId) || CURRENT_STATE_CALL.isRedirectAllowed(this.callId)));

        this.actionContainer.add(this.directTransferButton);
        
        this.actionContainer.add(new Ext.Container({
            flex: 1
        }));

        this.actionContainer.add(this.endCall);
        this.actionContainer.add(this.startCall);

        var components = [this.callDisplayPanel, this.acdCallInfoPanel, this.actionContainer];
        
        this.actionButtons = Ext.create('Ext.Container',
            {
                margin: '10 10 0 10',
                layout: 'column'
            });
        var actions = ACTIONS.getActionsForNotification();
        Ext.each(actions, function (action)
        {
            action.callPanel = self;
            action.callPanel.callId = self.initialEvent.getCallId();
            action.lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(self.initialEvent.getCallId());

            self.actionButtons.add(Ext.create('ActionThinButton',
            {
                scale: 'small',
                action: action
            }));
        });
        if (!Ext.isEmpty(actions))
        {
            components.push(this.actionButtons);
        }

        this.add(components);
    },

    onAccept: function ()
    {
        var contact = this.callDisplayPanel.contact;
        var callEvent = this.initialEvent;
        this.close();
        if (!isValid(callEvent))
        {
            return;
        }
        Ext.asap(function ()
        {
            Ext.batchLayouts(function ()
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_Answer(contact, callEvent);
            });
        });
    },

    onDecline: function ()
    {
        var callId = this.initialEvent.getCallId();
        this.close();

        Ext.asap(function ()
        {
            var errorCallback = (errorMessage) =>
            {
                var lastCallEvent = CURRENT_STATE_CALL.getLastCallEvent(callId);
                if (isValid(lastCallEvent))
                {
                    var newNotification = Ext.create(getClassName(this),
                        {
                            initialEvent: lastCallEvent
                        });
                    if (isValidString(errorMessage))
                    {
                        newNotification.on('afterrender', function ()
                        {
                            setTimeout(function ()
                            {
                                showErrorMessage(errorMessage, DEFAULT_TIMEOUT_ERROR_MESSAGES);
                            }, 50);
                        });
                    }
                }
                else if (isValidString(errorMessage))
                {
                    showErrorMessage(errorMessage, DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            };
            SESSION.hangUp(callId, DEFAULT_SUCCESS_CALLBACK(Ext.emptyFn, function (response)
            {
                errorCallback(response.getReturnValue().getDescription());
            }), function ()
            {
                errorCallback(LANGUAGE.getString("errorHangUp"));
            });
        }, this);
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getOwnerCalls(), function (call)
        {
            if (!isValid(call) || call.getCallId() !== this.initialEvent.getCallId())
            {
                return;
            }

            if (call.isIdle() || call.isDisconnected() || call.isConnected())
            {
                this.hide();
            }

            this.directTransferButton.setTooltip(LANGUAGE.getString("blindTransferTooltip"));
        }, this);
    },

    createBrowserNotification: function ()
    {
        if (!isValid(this.initialEvent))
        {
            return null;
        }

        var iconName = 'ringingPhone.png';
        if (new TelephoneNumber(this.initialEvent.getNumber()).isMobileNumber())
        {
            iconName = 'ringingMobilePhone.png';
        }
        return Ext.create('BrowserNotificationForCall',
        {
            icon: 'images/256/' + iconName,
            callId: this.initialEvent.getCallId(),
            initialEvent: this.initialEvent,
            contact: this.contact
        });
        
    },

    playSound: function ()
    {
        if (SESSION.isSIPMode())
        {
            this.createAudio(CURRENT_STATE_CALL.isInternalCall(this.initialEvent.getCallId()) ? 'Notifications/Ring02.wav' : 'Notifications/Ring07.wav');
        }
        else
        {
            this.callParent();
        }
    },

    createAudio: function (file, boxReadyListener)
    {
        var self = this;
        var id = "SIPnotification";
        this.audio = this.add(Ext.create('Ext.Component',
        {
            html: '<audio id="' + id + '" style="display:none" preload="auto"><source src="' + file + '" type="audio/wav"></audio>',
            listeners:
            {
                boxready: /*async*/ function ()
                {
                    var player = document.getElementById(id);
                    if (isValid(player))
                    {
                        /*
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        const audioDevices = devices.filter(device => device.kind === 'audiooutput');
                        await player.setSinkId(audioDevices[3].deviceId);
                        */
                        player.play();
                        self.playSoundInterval = setInterval(function ()
                        {
                            player.play();
                        }, 2000);
                    }
                }
            }
        }));
        return id;
    },

    onGlobalEvent_Answer: function (contact, call)
    {
        //hier hat jemand an einem Gerät auf Antworten gedrückt
        if (call.getCallId() === this.callId)
        {
            this.hide();
        }
    },

    destroy: function ()
    {
        clearInterval(this.playSoundInterval);
        if (SESSION.isSIPMode())
        {
            this.remove(this.audio);
            /*var player = document.getElementById('SIPnotificationSound');
            if (isValid(player))
            {
                player.pause();
                player.currentTime = 0;
            }*/
        }
        SESSION.removeListener(this);
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        
        if (isValid(this.transferDialog) && !this.transferDialog.destroyed)
        {
            this.transferDialog.hide();
        }

        this.callParent();
    }
});

Ext.define('InCallNotificationForSIP',
{
    extend: 'InCallNotification',

    initComponent: function () 
    {
        if (SESSION.isSIPMode())
        {
            this.plugins =
            [
                {
                    ptype: 'PlaySoundsInfinitelyPlugin',
                    id: 'playSoundPlugin'
                }
            ];
        }
        this.callParent();

        this.setSoundFileForInternalOrExternalCall();
    },

    setSoundFileForInternalOrExternalCall: function ()
    {
        var playSoundPlugin = this.getPlugin('playSoundPlugin');
        playSoundPlugin.setSoundFile(CURRENT_STATE_CALL.isInternalCall(this.initialEvent.getCallId()) ? 'Notifications/Ring02.wav' : 'Notifications/Ring07.wav');
    },

    onNewEvents: function (response)
    {
        this.callParent(arguments);

        this.setSoundFileForInternalOrExternalCall();
    }
});