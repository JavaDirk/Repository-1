/**
 * Created by jebing on 19.12.2014.
 */
const TRESHOLD_FOR_SWITCHING_TO_SMALL_VIEW = 1100;

Ext.define('ConversationsTabPanel',
{
    extend: 'UniqueTabPanel',
    hideMode: 'display',
    cls: 'ConversationsTabPanel',
    border: false,

    preparedCallPanels: [],

    
    initComponent: function ()
    {
        this.iFrameTabCounter = 0;
        
        this.callParent();
        
        GLOBAL_EVENT_QUEUE.addEventListener(this);
        SESSION.addVIPListener(this);

        this.getTabBar().setLayout({ type: 'hbox', pack: 'start' });
        this.getTabBar().setHeight(40);

        this.on('tabchange', function (tabPanel, newCard, oldCard, eOpts)
        {
            GLOBAL_EVENT_QUEUE.onGlobalEvent_ConversationTabFocus(newCard);
        });
    },

    checkClosingMessages: function ()
    {
        var result = '';

        if (!isValid(this.items))
        {
            return '';
        }
        
        this.each(function (item)
        {
            if (item.getUnsavedChanges)
            {
                result += item.getUnsavedChanges();
            }
        });
        return result;
    },

    destroy: function ()
    {
        this.callParent();

        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        SESSION.removeVIPListener(this);
    },

    onGlobalEvent_ChannelSelected: function (channel, isStartPage)
    {
        var panel = channel.createPanel(this, isStartPage);
        return this.addItem(panel);
    },

    onGlobalEvent_MailChannelSelected: function(channel)
    {
        this.onGlobalEvent_ChannelSelected(Ext.create(CLASS_CHANNEL_EMAILS, {}));
    },
    
    onGlobalEvent_Dial: function (contact, number)
    {
        var action = Ext.create('CTIAction_Dial',
        {
            contact: contact,
            number: number
        });
        Ext.batchLayouts(function () {
            action.run();
        });
    },

    onGlobalEvent_DialForGroup: function (contact, number, groupId, force, onSuccess)
    {
        Ext.batchLayouts(function () {
            this.onGlobalEvent_DialForGroupBatched(contact, number, groupId, force, onSuccess);
        }, this);
    },

    onGlobalEvent_DialForGroupBatched: function (contact, number, groupId, force, onSuccess)
    {
        var panel = this.createCallPanelForDial(contact, number);
        
        var makeCallSuccess = function (response)
        {
            if (!isValid(panel) || panel.destroyed) //falls das MakeCall ewig dauert und der Benutzer das Panel in der Zwischenzeit schliesst
            {
                return;
            }

            if (response.getReturnValue().getCode() === ProxyError.ErrorFormNotFilled.value)
            {
                panel.close(true);

                showConfirmation(Ext.create('ConfirmationComponent',
                {
                    yesCallback: function ()
                    {
                        SESSION.makeCallForGroup(number, phoneContact, groupId, true, makeCallSuccess, makeCallException);
                    },
                    noCallback: Ext.emptyFn,
                    errorMessageText: response.getReturnValue().getDescription()
                }));
                return;
            }
            panel.onMakeCallSuccess(response, groupId);

            if (response.getReturnValue().getCode() === 0)
            {
                if (onSuccess)
                {
                    onSuccess(response, number, contact);
                }
            }
        };
        var makeCallException = function ()
        {
            if (!isValid(panel) || panel.destroyed)//falls das MakeCall ewig dauert und der Benutzer das Panel in der Zwischenzeit schliesst
            {
                return;
            }
            panel.onMakeCallException();
        };

        if (isValidString(groupId) && groupId > 0)
        {
            var phoneContact = isValid(contact) ? contact.convertToPhoneContact(number) : null;
            SESSION.makeCallForGroup(number, phoneContact, groupId, force, makeCallSuccess, makeCallException, contact);
        }
        else
        {
            SESSION.makeCall(number, makeCallSuccess, makeCallException, contact);
        }
    },

    createCallPanelForDial: function (contact, number)
    {
        var panel = this.addItem(Ext.create(CLASS_CALL_PANEL,
        {
            contact: contact,
            selectedNumber: number,
            parent: this
        }));
        
        panel.makeCallInvoked = true;
        return panel;
    },

    onGlobalEvent_OwnerCall: function (call, setActiveItem)
    {
        //ui-technisch können sich die call-events überholen, deswegen nehmen wir über die CURRENT_STATE_CALL immer das letzte event.
        call = CURRENT_STATE_CALL.getLastCallEvent(call.getCallId());
        if (!isValid(call) || call.isIdle() || call.isDisconnected())
        {
            return;
        }

        var callPanel = this.getCallPanel(call);
        if (!isValid(callPanel))
        {
            callPanel = this.createCallPanel(call);

            this.addItem(callPanel, false, call.isIncoming());
        }
        
        if (setActiveItem)
        {
            this.setActiveTab(callPanel);
        }
    },

    onGlobalEvent_Answer: function (contact, call)
    {
        var callPanel = this.addItem(this.createCallPanel(call), true);

        SESSION.answer(call.getCallId(), function (response)
        {
            callPanel.onAnswerSuccess(response);
        }, function ()
        {
            callPanel.onAnswerException();
        });
    },

    createCallPanel: function (callEvent)
    {
        return Ext.create(CLASS_CALL_PANEL,
        {
            callId: callEvent.getCallId(),
            contact: callEvent.getCaller(),
            selectedNumber: callEvent.getDisplayNumber(),
            initialCallEvent: callEvent,
            parent: this
        });
    },

    getCallPanel: function (call)
    {
        var callPanelWithSameCallId = null;
        this.each(function (panel)
        {
            if (CLASS_CALL_PANEL === getClassName(panel))
            {
                if (call.getCallId() === panel.callId || (panel.makeCallInvoked && call.isOutgoing()))
                {
                    callPanelWithSameCallId = panel;
                    return false; //ein quasi break
                }
            }
        });
        return callPanelWithSameCallId;
    },
    
    onGlobalEvent_openContact: function (contact)
    {
        Ext.batchLayouts(() =>
        {
            var panel = Ext.create('ContactPanel',
                {
                    contact: contact
                });
            var samePanel = this.addItem(panel, false);
            if (samePanel !== panel)
            {
                samePanel.setContact(contact);
            }
        }, this);
    },

    onGlobalEvent_openJournalEntry: function (journalEntry)
    {
        Ext.batchLayouts(() =>
        {
            var panel = Ext.create('JournalEntryPanel',
                {
                    journalEntry: journalEntry
                });
            var samePanel = this.addItem(panel, false);
            if (samePanel !== panel)
            {
                samePanel.setJournalEntry(journalEntry);
            }
        }, this);
    },

    onGlobalEvent_AddOrEditNotice: function (journalEntry) 
    {
        Ext.batchLayouts(() =>
        {
            var panel = Ext.create('JournalEntryPanel',
                {
                    journalEntry: journalEntry
                });
            this.addItem(panel, true);
            panel.showNoticeTab();
        }, this);
    },

    onGlobalEvent_openSettings: function ()
    {
        Ext.batchLayouts(() =>
        {
            this.openSettings();
        }, this);
    },

    openSettings: function ()
    {
        var settingsPanel = Ext.create('SettingsPanel',
            {

            });
        return this.addItem(settingsPanel);
    },

    onGlobalEvent_openStatistics: function ()
    {
        this.openURL(CURRENT_STATE_CONTACT_CENTER.getStatisticsUrl(), LANGUAGE.getString("statistics"));
    },

    onGlobalEvent_OpenURL: function(url, title)
    {
        this.openURL(url, title);
    },

    openURL: function (url, title)
    {
        Ext.batchLayouts(() =>
        {
            //var iFrameTabCounter = 0; //todo: in Klasse //todo zähler bei statistic behandeln, wenn es nicht hinzufügt
            //todo: wenn hinzufügen vorher prüfen ob da
            var self = this;
            var maxIFrameTabs = 2;
            var samePanel = null;
            this.each(function (item)
            {
                if (url === item.url)
                {
                    samePanel = item;
                }
            });

            //if (!url.includes(window.location.hostname)) { //todo: case insensitiv vergleichen und errorausgabe
            if (!samePanel)
            {
                if (this.iFrameTabCounter < maxIFrameTabs)
                {
                    //this.iFrameTabCounter += 1;
                    title = title || url;
                    var iframe = Ext.create('IFrame',
                        {
                            url: url,
                            title: title,
                            isEqualToThisPanel: function (tab)
                            {
                                return getClassName(this) === getClassName(tab) && this.url.toUpperCase() === tab.url.toUpperCase();
                            },
                            listeners: {
                                destroy: function ()
                                {
                                    self.decIFrameCounter();
                                },
                                boxready: function ()
                                {
                                    self.iFrameTabCounter += 1;
                                }
                            }
                        });

                    this.addItem(iframe);
                }
                else
                {
                    showErrorMessage(LANGUAGE.getString('tooManyOpenUrls', maxIFrameTabs), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            }
        }, this);
    },

    decIFrameCounter: function () {
        this.iFrameTabCounter = this.iFrameTabCounter - 1;
    },
    
    onGlobalEvent_CreateContact: function (number, contact)
    {
        Ext.batchLayouts(() =>
        {
            var panel = Ext.create(CLASS_MAIN_CONTACTS_PANEL,
                {
                    parent: this,
                    selectFirstItem: false
                });

            var samePanel = this.addItem(panel);
            samePanel.onNewContact(number, contact);
        }, this);
    },

    createWebRtcPanel: function (contact, contactInfo)
    {
        if (WebRtc.sessionActive)
        {
            showWarningMessage(LANGUAGE.getString("onlyOneWebRTC"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            return null;
        }
        var panel = this.addItem(Ext.create('WebRtcPanel',
        {
            contact: contact,
            title: contact.getDisplayName().toUpperCase(),
            parentContainer: this,
            contactInfo: contactInfo,
            showSetupPage: true
        }));

        return panel;
    },

    onGlobalEvent_openVideoChat: function (contact, contactInfo)
    {
        var panel = this.createWebRtcPanel(contact, contactInfo);
        if (isValid(panel))
        {
            panel.videoInvitationFunction();
        }
    },

    onGlobalEvent_openAudioChat: function (contact, contactInfo)
    {
        var panel = this.createWebRtcPanel(contact, contactInfo);
        if (isValid(panel))
        {
            panel.audioInvitationFunction();
        }
    },
    
    onGlobalEvent_openUserChat: function (contact)
    {
        var panel = Ext.create('UserChatPanel',
        {
            flex: 1,
            contact: contact
        });
        this.addItem(panel);
    },

    onGlobalEvent_openBlackBoard: function (blackBoard)
    {
        this.onGlobalEvent_openTeamChat(blackBoard, "BlackBoardPanel");
    },

    onGlobalEvent_openTeamChat: function (teamChat, classNameForChatPanel)
    {
        classNameForChatPanel = classNameForChatPanel || "TeamChatPanel";

        var panel = Ext.create(classNameForChatPanel,
            {
                teamChat: teamChat,
                flex: 1
            });
        this.addItem(panel);
    },

    onGlobalEvent_openLiveChat: function (contact)
    {
        var chatOffers = CURRENT_STATE_CHATS.getChatOffersByContact(contact);
        var chatIds = Ext.Array.map(chatOffers, function (chatOffer)
        {
            return chatOffer.getChatId();
        }, this);
        var liveChats = Ext.Array.flatten(Ext.Array.map(chatIds, function (chatId)
        {
            return CURRENT_STATE_CHATS.getLiveChatsByChatId(chatId);
        }, this));

        var lastChatOffer = chatOffers[chatOffers.length - 1];
        var title = contact.getDisplayNameForLiveChat(LANGUAGE.getString(lastChatOffer.getMediaType() === "WhatsApp" ? "whatsAppLiveChat" : 'liveChat'));
        var panelClassName = lastChatOffer.getMediaType() === "WhatsApp" ? 'WhatsAppChatPanel' : 'LiveChatPanel'
        var panel = Ext.create(panelClassName,
            {
                title: title.toUpperCase(),
                chatIds: chatIds,
                chatOffers: chatOffers,
                flex: 1,
                liveChats: liveChats,
                contact: contact
            });

        var samePanel = this.addItem(panel);
        if (samePanel !== panel)
        {
            samePanel.addChatOffer(lastChatOffer);
        }
    },

    onGlobalEvent_acceptWebRtc: function (contact, mediaType, showSetupPage)
    {
        var panel = this.addItem(Ext.create('WebRtcPanel', {
            contact: contact,
            parentContainer: this,
            title: contact.getDisplayNameForLiveChat(LANGUAGE.getString("liveChat")).toUpperCase(),
            showSetupPage: showSetupPage
        }));

        panel.acceptWebRtcInvitation(mediaType);
    },

    onGlobalEvent_OpenDevicesSettings: function ()
    {
        Ext.batchLayouts(() =>
        {
            var settingsPanel = this.openSettings();
            settingsPanel.selectSettingsPageForSoftphone();
        }, this);
    },

    //mit MainPanel ist die Situation gemeint, wenn das Browserfenster sehr schmal ist und deshalb die MainPanels nicht mehr
    //links angezeigt werden können (weil zugeklappt), sondern im ConversationsTabPanel
    onGlobalEvent_openMainPanel: function (panel)
    {
        Ext.batchLayouts(() =>
        {
            var index = this.items.items.length;
            if (this.currentMainPanel)
            {
                index = this.items.items.indexOf(this.currentMainPanel);
                this.remove(this.currentMainPanel);
            }
            panel.closable = true;
            this.insertItem(index, panel);
            Ext.asap(() =>
            {
                panel.focus();
            }, this);

            this.currentMainPanel = panel;
        }, this);
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getOwnerCalls(), function (currentCall)
        {
            if (currentCall.isIncoming())
            {
                //die Abfrage auf "Cti" ist drin, weil folgender Fall auftreten konnte:
                //Man hat einen ACD-Call, schließt das Tab und bekommt eine neue SessionInfo und dadurch ein neues CallEvent
                //mit Connected als CallState. Dadurch wurde das CallPanel wieder angezeigt und beim folgenden Idle wieder geschlossen (das flackerte)
                if (currentCall.getCallEventReason() === "Cti" && (currentCall.isConnected() || currentCall.isOnHold()))
                {
                    Ext.batchLayouts(function () 
                    {
                        this.onGlobalEvent_OwnerCall(currentCall);
                    }, this);
                }
            }
            else
            {
                Ext.batchLayouts(function () 
                {
                    this.onGlobalEvent_OwnerCall(currentCall);
                }, this);
            }
        }, this);
    },

    addItem: function (panel, deleteSamePanel, blink)
    {
        var result = this.callParent(arguments);

        return result;
    },

    getCallPanelForNumber: function (number)
    {
        var foundTab;
        this.each(function (tab)
        {
            if (getClassName(tab) === "CallPanel" && tab.selectedNumber === number)
            {
                foundTab = tab;
                return false;
            }
        });
        return foundTab;
    }
});