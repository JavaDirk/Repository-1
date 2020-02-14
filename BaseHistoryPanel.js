var historyEntryTemplate = new Ext.XTemplate(
    

    {
        
    }
);

Ext.define('BaseHistoryPanel', {
    extend: 'BaseViewPanel',
    itemSelector: 'div.journalEntry',
    tpl: historyEntryTemplate,
    autoScroll: true,
    emptyText: '',
    border: false,
    selectedItemCls: 'selectedEntry',
    overlayButtons: true,
    openContactOnSelect: true,
    sender: undefined,
    parent: undefined,
    history: undefined,
    initComponent: function ()
    {
        var self = this;
        this.emptyText = LANGUAGE.getString('noHistory');
        this.tpl = new Ext.XTemplate(
            '<tpl for=".">',
        '<tpl if="values.groupEntry">',
            '<div class="groupEntry journalEntry" style="">{text}</div>',
        '<tpl elseif="this.isEMail(values)">',
            '<div class="journalEntry" style="display:flex;align-items:center;padding:5px 5px 5px 0;cursor:pointer;border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';">',
            '<div class="' + CLASS_FOR_SHOWING + '" style="display:flex;flex-direction:column;padding-left:15px;padding-right: 10px;margin-top:3px">',
                        '{[values.getMailIcon()]}',
                '</div>',
                '<div class="hideForOverlayButtons" style="display:flex;flex-direction:column;margin:0 0 0 3px;flex:1;max-width:300px;min-width:0">',
                    '<div class="eclipsedText" style="' + TEMPLATE_STYLE_TITLE() + '">{[this.getSubject(values)]}</div>',
                    '<div class="eclipsedText" style="' + TEMPLATE_STYLE_SUBTITLE() + ';color:' + COLOR_TITLE.toString() + '">{[this.getGroup(values)]}</div>',
                '</div>',

                '<div class="hideForOverlayButtons" style="margin:0 5px 0 3px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_SUBTITLE.toString() + '">{[values.getTime()]}</div>',
            '</div>',
        '<tpl else>',
            templateStringForContactJournalPanel,
        '</tpl>',
    '</tpl>',
            {
                getSubject: function (values)
                {
                    return Ext.String.htmlEncode(values.getSubject());
                },

                getGroup: function (values)
                {
                    if (values.callConversationItem)
                    {
                        return "";
                    }
                    return Ext.String.htmlEncode(values.getGroup());
                },

                isEMail: function (values)
                {
                    return self.isEMail(values.typeMarker);
                },

                getDataForFirstRow: function (values)
                {
                    if (isValidString(values.getCampaign()))
                    {
                        return values.getCampaign();
                    }
                    if (isValidString(values.getGroup()))
                    {
                        return values.getGroup();
                    }
                    if (values.getDirect() && !this.isEMail(values))
                    {
                        return values.getAgentName();
                    }
                    return "";
                },

                getDataForSecondRow: function (values)
                {
                    if (isValidString(values.getGroup()))
                    {
                        return values.getAgentName();
                    }
                    if (values.getDirect() && !this.isEMail(values))
                    {
                        if (values.getCallDirection() === CallDirection.In.value)
                        {
                            return values.getCalledNumber();
                        }
                        else
                        {
                            return values.getCallerNumber();
                        }
                    }
                    return values.getAgentName();
                },

                getColorForSecondRow: function (values)
                {
                    return COLOR_TITLE;
                },

                getAvatarImage: function (values)
                {
                    return createAvatar(getImageNameForNumber(undefined, values.getCallerNumber()), NEW_GREY, 'contain');
                }
            }
        );
        this.callParent();
        
        this.on('beforeitemcontextmenu', function (view, record, item, index, e, eOpts)
        {
            view.getSelectionModel().select(index);
        });

        this.setStore(Ext.create('Ext.data.Store', {
            sorters: this.getSorters()
        }));

        if (this.sender && this.sender.typeMarker === "www_caseris_de_CaesarSchema_Contact")
        {
            this.sender = this.sender.convertToPhoneContact();
        }
    },

    getSorters: function ()
    {
        return [
            {
                sorterFn: compareByFormDateTime,
                direction: 'DESC'
            }
        ];
    },

    createHistory: function (email) 
    {

        var emailConversation = undefined;
        var callHistory = undefined;
        var self = this;

        var allData = [];
        if (isValid(this.history, 'getMailHistory()'))
        {
            emailConversation = this.history.getMailHistory();

            Ext.iterate(emailConversation, function (item, index)
            {
                item.getTime = function () {
                    var date = new DateTime(this.getDateTime());

                    return date.getTime();
                };

                item.getDate = function ()
                {
                    formatDateStringWithWeekDay(new Date(this.getDateTime()), true);
                };

                item.getNoticeImageIfAvailable = function ()
                {
                    return "";
                };

                item.getFormImageIfAvailable = function ()
                {
                    return "";
                };

                item.getMailIcon = function () {
                    if (isValid(item, 'getMail') && item.getMail())
                    {
                        var email = PARENT_REQUEST_STORE.convertEmail(item.getMail());
                        var labelAndClass = getStateLabelAndBackgroundClass(email);
                        return '<div class="emailHeaderStateImage ' + labelAndClass.backgroundClass + '" style="width:7px;height:36px;border-radius:' + BORDER_RADIUS_BUTTONS + '" title="' + labelAndClass.stateLabel + '"></div>';
                    }
                    else
                    {
                        return createAvatar('mail', NEW_GREY);
                    }
                };

                item.getFormDateTime = function () {
                    return new Date(this.getDateTime());
                };

                item.date = formatDateStringWithWeekDay(new Date(item.getDateTime()), true);
            });

            var sortFunction = function (entryDate1, entryDate2)
            {
                if (parseInt(entryDate1.getDate(), 10) === parseInt(entryDate2.getDate(), 10)) {
                    return 0;
                }
                else
                {
                    return parseInt(entryDate1.getDate(), 10) > parseInt(entryDate2.getDate(), 10) ? -1 : 1;
                }
            };

            emailConversation.sort(sortFunction);
            allData = allData.concat(emailConversation);
        }

        var curLocation = window.location.href;

        if (isValid(this.history, 'getCallHistory()') && curLocation.indexOf('emailclient') < 0)
        {
            callHistory = this.history.getCallHistory();

            Ext.iterate(callHistory, function (item, index)
            {
                item.getTime = function () {
                    var date = new DateTime(this.getDateTime());

                    return date.getTime();
                };

                item.getAgentName = function ()
                {
                    if (isValidString(this.getAgent()))
                    {
                        return this.getAgent();
                    }
                    else
                    {
                        return this.getCallerNumber();
                    }
                };

                item.getDate = function ()
                {
                    return formatDateStringWithWeekDay(new Date(this.getDateTime()), true);
                };
                
                item.getSpeakerImageIfAvailable = function ()
                {
                    if (isValidString(this.getRecordingUrl()))
                    {
                        return IMAGE_LIBRARY.getImage("speaker", 64, DARKER_GREY);
                    }
                    return "";
                };

                item.getNoticeImageIfAvailable = function ()
                {
                    return "";
                };

                item.getFormImageIfAvailable = function ()
                {
                    return this.getFormUrl();
                };

                item.getCallDirectionImageWithPhone = function ()
                {
                    var color = '';

                    if (this.getCallDirection() === LANGUAGE.getString('missedCall') || parseInt(this.getDuration(), 10) === 0)
                    {
                        color = COLOR_UNSUCCESSFULL_CALL.toString();
                    }
                    else
                    {
                        color = COLOR_SUCCESSFULL_CALL.toString();
                    }
                    var imageName = this.getCallDirection() === CallDirection.In.value ? 'phone_out' : 'phone_in'; //wenn in dann out? Ja, weil man die Sichtweise umdreht: Kunde ruft ACD-Gruppe an: Für uns ist das zwar Incoming, aber der PFeil in der Ansicht sollte andersrum sein
                    if (isValidString(this.getGroup()))
                    {
                        imageName += '_acd';
                    }
                    
                    return IMAGE_LIBRARY.getImage(imageName, 64, color);
                };

                item.getCallDuration = function ()
                {
                    return this.getDuration();
                };

                item.getPhoneNumber = function ()
                {
                    if (this.getCallDirection())
                    {
                        return this.getCallerNumber();
                    }
                };

                item.getFormDateTime = function () {
                    return new Date(this.getDateTime());
                };

                item.date = formatDateStringWithWeekDay(new Date(item.getDateTime()), true);
            });

            var sortFunction = function (entryDate1, entryDate2) {
                if (parseInt(entryDate1.getDate(), 10) === parseInt(entryDate2.getDate(), 10)) {
                    return 0;
                }
                else {
                    return parseInt(entryDate1.getDate(), 10) > parseInt(entryDate2.getDate(), 10) ? -1 : 1;
                }
            };

            callHistory.sort(sortFunction);
            allData = allData.concat(callHistory);
        }

        //self.getStore().add(emailConversation);
        //self.getStore().add(callHistory);

        var lastDate = undefined;

        var dates = [];

        var sortFunction = function (entryDate1, entryDate2) {
            if (parseInt(entryDate1.getDate(), 10) === parseInt(entryDate2.getDate(), 10)) {
                return 0;
            }
            else {
                return parseInt(entryDate1.getDate(), 10) > parseInt(entryDate2.getDate(), 10) ? -1 : 1;
            }
        };

        allData.sort(sortFunction);

        for (var i = 0; i < allData.length; i++)
        {
            var curDate = allData[i].getDate();

            if (!curDate)
            {
                curDate = allData[i].getDateTime();

                var testCurDate = new Date(curDate);

                testCurDate = formatDateStringWithWeekDay(testCurDate, true);

                if (!testCurDate)
                {
                    testCurDate = formatDateStringWithWeekDay(curDate, true);
                }
                else
                {
                    curDate = testCurDate;
                }
            }


            if (curDate !== lastDate && lastDate !== LANGUAGE.getString('today'))
            {
                lastDate = curDate;

                if (curDate === new DateTime(new Date()).getDateTime())
                {
                    curDate = LANGUAGE.getString('today');
                }

                var dateTime = new Date(allData[i].getDateTime());

                dateTime.setHours(23);
                dateTime.setMinutes(59);
                dateTime.setSeconds(59);

                var needDate = true;

                for (var j = 0; j < dates.length; j++)
                {
                    var curItem = dates[j];

                    if (curItem.text === curDate)
                    {
                        needDate = false;
                        break;
                    }
                }

                if (needDate && curDate)
                {
                    dates.push(
                    {
                        text: curDate || dateTime,
                        groupEntry: true,
                        date: curDate || dateTime,
                        index: i,
                        dateTime: dateTime,
                        getFormDateTime: function ()
                        {
                            return this.dateTime;
                        }
                    });
                }
            }
        }

        allData = allData.concat(dates);
        self.getStore().add(allData);


        for (var i = 0; i < self.getStore().data.length; i++)
        {
            var curRecord = self.getStore().data.getAt(i).data;
            if (!curRecord.groupEntry)
            {
                self.select(i);
                break;
            }
        }

        self.onContactSelected(self.getStore().data.getAt(i));
    },

    isEMail: function (typeMarker)
    {
        return typeMarker === "www_caseris_de_CaesarSchema_MailConversationItem";
    },
    
    getHeaderData: function ()
    {
        var email = PARENT_REQUEST_STORE.convertEmail(this.selection.data.getMail());

        return {
            store: PARENT_REQUEST_STORE,
            state: email.originalState,
            mailType: email.type,
            worker: email.curWorkingAgent,
            isRequest: true,
            mailId: email.mailId,
            groupId: email.groupId,
            fullId: email.fullId,
            printUrl: email.urlPrint,
            sourceUrl: email.urlSource
        };
    },

    getOverlayButtons: function (record, item)
    {
        var buttons = [];

        if (this.isEMail(record.data.typeMarker))
        {
            buttons = [this.getOverlayButtonForCopy(record, item), this.getOverlayButtonForPrint(record, item)];
        }
        else
        {
            buttons = [this.getOverlayButtonForCall(record, item)];
        }

        return buttons;
    },

    getOverlayButtonForCall: function (record, item)
    {
        var self = this;
        return {
            shouldBeVisible: function ()
            {
                return isValidString(record.data.getCallerNumber()) && SESSION.isTelephonyAllowed();
            },
            imageUrl: 'images/64/phone.png',
            tooltipText: LANGUAGE.getString("call"),
            clickListener: function ()
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(undefined, record.data.getCallerNumber());
            }
        };
    },

    getOverlayButtonForCopy: function (record, item) 
    {
        var self = this;
        return {
            shouldBeVisible: function ()
            {
                return true;
            },
            imageUrl: 'images/64/reply.png',
            tooltipText: LANGUAGE.getString("copyTo"),
            clickListener: function ()
            {
                self.onContactSelected(record);

                var copyToButton = new CopyToButton(
                    {
                        email: PARENT_REQUEST_STORE.convertEmail(record.data.getMail())
                    });
                copyToButton.handler();
            }
        };
    },

    getOverlayButtonForPrint: function (record, item) 
    {
        return {
            shouldBeVisible: function ()
            {
                return true;
            },
            imageUrl: 'images/64/print.png',
            tooltipText: LANGUAGE.getString("print"),
            clickListener: function ()
            {
                var printButton = new PrintButton(
                    {
                        email: record.data.getMail()
                    });
                printButton.printUrl(record.data.getMail().URLPrint);
            }
        };
    },

    onContactSelected: function (record)
    {
        if (!record)
        {
            return null;
        }

        if (record.data.groupEntry)
        {
            return null;
        }

        this.parentContainer.resultPanel.removeAll();

        if (this.isEMail(record.data.typeMarker))
        {
            var activeEmail = PARENT_REQUEST_STORE.convertEmail(record.data.getMail());

            var requestContainer = new EmailRequestContainer(
            {
                email: activeEmail,
                store: PARENT_REQUEST_STORE
            });
        }
        else
        {
            var agentContact = undefined;

            if (record.data.getAgentId() > 0)
            {
                agentContact = CURRENT_STATE_CONTACT_CENTER.getAgent(record.data.getAgentId());

                if (isValid(agentContact, 'getContact()'))
                {
                    agentContact = agentContact.getContact();
                }
            }
            if (!isValid(agentContact))
            {
                agentContact = new www_caseris_de_CaesarSchema_Contact();
                agentContact.pseudoContact = true;
                agentContact.setName(record.data.getAgent());

                var officePhoneNumbers = [];
                var number = "";
                if (record.data.getCallDirection() === CallDirection.In.value)
                {
                    number = record.data.getCalledNumber();
                }
                else
                {
                    number = record.data.getCallerNumber();
                }
                if (isValidString(number.trim()))
                {
                    officePhoneNumbers.push(number.trim());
                }
                agentContact.setOfficePhoneNumbers(officePhoneNumbers);
            }
            var journalEntry = new www_caseris_de_CaesarSchema_CTIJournalEntry();
            var item = record.data;

            var acdInfo = new www_caseris_de_CaesarSchema_ACDInfo();
            acdInfo.setFormUrl(item.getFormUrl());
            acdInfo.setRecordingUrl(item.getRecordingUrl());
            acdInfo.setGroup(item.getGroup());
            
            acdInfo.callConversationItem = item;

            var addressInfo = new www_caseris_de_CaesarSchema_CTIContact();

            addressInfo.setNumber(record.data.getCallDirection() === CallDirection.In.value ? item.getCallerNumber() : item.getCalledNumber());

            if (this.sender)
            {
                addressInfo.setName(this.sender.getName());
            }

            journalEntry.setLineTime(item.getDuration());
            journalEntry.setDateTime(item.getDateTime());
            journalEntry.setCallSuccess('Connected');
            journalEntry.setCallDirection(item.getCallDirection());
            journalEntry.setOwnerDevice(item.getCalledNumber());
            journalEntry.setAddressInfo(addressInfo);
            journalEntry.setACDInfo(acdInfo);

            /*var requestContainer = Ext.create('CallHistoryDetailsPanel', {
                callItem: record.data
            });*/

            var requestContainer = Ext.create('JournalEntryACDPanel',
            {
                flex: 1,
                journalEntry: journalEntry,
                agent: agentContact,
                agentName: record.data.getAgent(),
                callConversationItem: record.data
            });
           
        }

        return this.parentContainer.resultPanel.add(requestContainer);
    }
});

Ext.define('ContactHistoryPanel', {
    extend: 'Ext.Container',
    autoScroll: false,
    scrollable: false,
    layout: 'border',
    collapsible: false,
    sender: undefined,
    flex: 1,
                    style: {
                    'background-color': WHITE
                },

    initComponent: function ()
    {
        this.callParent();

        this.listPanel = this.add(Ext.create('BaseHistoryPanel',
            {
                region: 'west',
                split: GREY_SPLITTER,
                sender: this.sender,
                parentContainer: this,
                scrollable: 'vertical',
                width: CLIENT_SETTINGS.getSetting('CONTAINER_WITH_PERSISTENT_SIZE', 'historyContainer_overviewWidth') || WIDTH_CALL_DISPLAY_PANEL,
                history: this.history,
                listeners: {
                    resize: function (panel, width, height, oldWidth, oldHeight)
                    {
                        CLIENT_SETTINGS.addSetting('CONTAINER_WITH_PERSISTENT_SIZE', 'historyContainer_overviewWidth', width);
                        CLIENT_SETTINGS.saveSettings();
                    }
                },
                responsiveConfig:
                {
                    small:
                    {
                        region: 'north'
                    },

                    large:
                    {
                        region: 'west'
                    }
                }
            }));

        this.resultPanel = this.add(Ext.create('Ext.Container',
        {
            region: 'center',
            flex: 3,
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            }
        }));
        
        if (!this.history)
        {
            SESSION.getContactHistory(this.sender.getEntryId(), this.sender.getStorageId(), this.sender.getEmail(), undefined, (result) =>
            {
                if (!isValid(event, "listPanel"))
                {
                    return;
                }
                console.log(result);
                if (result.getReturnValue().getCode() === 0)
                {
                    this.listPanel.history = result.getHistory();
                    this.listPanel.createHistory(this.sender.getEmail());
                }
                else
                {
                    showErrorMessage(result.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            }, function ()
            {
                showErrorMessage(LANGUAGE.getString("errorGetContactHistory"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            });
        }
        else
        {
            this.listPanel.createHistory();
        }
    },

    getRecordByGuid: function (guid)
    {
        return null;
    },

    getRecordsByGuid: function (guid)
    {
        return [];
    }
});