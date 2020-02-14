/**
 * Created by jebing on 19.12.2014.
 */
Ext.define('JournalEntry',
{
    extend: 'Ext.data.Model',
    fields:
    [
        //{ name:'_ACDInfo', type:'object' },
        //{ name:'_AddressInfo', type:'object' },
        { name: '_CallDirection', type: 'string' },
        { name: '_CallSuccess', type: 'string' },
        { name: '_DateTime', type: 'string' },
        { name: '_LineTime', type: 'number' },
        //{ name:'_Notice', type:'object' },
        //{ name:'_ToAddressInfo', type:'object' },
        //{ name:'_ViaAddressInfo', type:'object' },
        { name: '_WasRead', type: 'boolean' },
        { name: CONTACT_GROUP_ENTRY, type: 'boolean' }
    ]
});

Ext.define('JournalEntryAddressInfo',
{
    extend: 'Ext.data.Model',
    belongsTo: ['JournalEntry'],
    fields:
    [
        { name: '_Number', type: 'string' }
    ]
});

Ext.define('BaseJournalPanel',
{
    extend: 'BaseViewPanel',

    itemSelector: 'div.journalEntry',
    emptyText: '',
    border: false,
    scrollable: 'vertical',
    selectedItemCls: 'selectedEntry',

    overlayButtons: true,
    openContactOnSelect: true,

    loadMask: false, //warum das hier nötig ist, k.A., wenn man es nicht macht, zeigt das ContactJournalPanel einen Wartecursor an, wenn man bei clientstart einen ruf hat

    plugins:
    [
        {
            ptype: 'JournalViewWithPhotos'
        }
    ],

    initComponent: function ()
    {
        var self = this;
        this.tpl = new Ext.XTemplate(
    '<tpl for=".">'+
        '<tpl if="values.groupEntry">'+
            '<div class="groupEntry journalEntry" style="">{text}</div>'+
        '<tpl else>'+
            //die feste Höhe nur deshalb, weil sonst im Firefox beim hovern über das Foto die OverlayButtons eingeblendet werden und durch die geringere Höhe der Eintrag springt
            '<div class="journalEntry" style="height:65px;padding:' + VIEWS_PADDING + ';display:flex;border-top:1px solid ' + COLOR_SEPARATOR.toString() + ';">'+
                '<div class="' + CLASS_CONTACT_PHOTO + '" style="height:' + PhotoSizes.Default.height + 'px;width:' + PhotoSizes.Default.width + 'px;display:flex;align-self:center;"></div>' +
                '<div class="hideForOverlayButtons" style="display:flex;flex-direction: row;flex:1">'+
                    '<div style="display:flex;flex-direction:column;align-self:center;align-items:center;width:46px;margin-right:2px">'+
                        '<div style="width:16px;height:16px;background-image:url({[values.getCallDirectionImageWithPhone()]});background-size:16px" ></div>'+
                        '<tpl if="isValidString(values.getFormImageIfAvailable())">'+
                            '<div style="width:16px;height:16px;margin-top:5px;background-image:url({[values.getFormImageIfAvailable()]});background-size:16px" ></div>'+
                        '<tpl elseif="isValidString(values.getNoticeImageIfAvailable())">'+
                            '<div style="width:16px;height:16px;margin-top:5px;background-image:url({[values.getNoticeImageIfAvailable()]});background-size:16px" ></div>'+
                        '</tpl>'+
                        '<tpl if="values.getSpeakerImageIfAvailable()">'+
                            '<div style="width:16px;height:16px;margin-top:5px;background-image:url({[values.getSpeakerImageIfAvailable()]});background-size:16px" ></div>'+
                        '</tpl>'+
                    '</div>'+
                    '<div style="flex-direction:column;display:flex;flex:1;">'+
                        '<div style="display:flex;align-items:center">'+
                            '<div class="eclipsedText" style="' + TEMPLATE_STYLE_TITLE() + ';color:{[values.getColorForCallType()]}">{[this.getDataForFirstRow(values)]}</div>'+
                            '<tpl if="isValidString(values.getLineStateImage())">' +
                                '<div class="icon hideForOverlayButtons" style="width:16px;height:16px;background-size:16px;margin:0 5px;background-image:url({[values.getLineStateImage()]})" data-tooltip="' + LANGUAGE.getString("lineStateOfPartnerOutOfService") + '"></div>' +
                            '</tpl>' +
                        '</div>'+
                        '<tpl if="isValidString(values.getCompany())">'+
                            '<div class="eclipsedText" style="margin-bottom:2px;' + TEMPLATE_STYLE_TEXT(' ', '0') + ';">{[this.getDataForSecondRow(values)]}</div>'+
                        '</tpl>'+
                        '<div class="eclipsedText" style="' + TEMPLATE_STYLE_TEXT(' ', '0') + ';color:{[values.getCallSuccessColor()]}">{[this.getDataForThirdRow(values)]}</div>'+
                    '</div>'+
                '</div>'+
                '<div class="hideForOverlayButtons" style="margin:0 5px;color:' + COLOR_SUBTITLE + '">{[values.getTime()]}</div>'+
                '<div class="showForOverlayButtons" style="margin-left:5px;display:none;flex:1"></div>'+
            '</div>'+

        '</tpl>'+
            '</tpl>',
            {
                getDataForFirstRow: function (contact)
                {
                    return self.getDataForFirstRow(contact);
                },
                getDataForSecondRow: function (contact)
                {
                    return self.getDataForSecondRow(contact);
                },
                getDataForThirdRow: function (contact)
                {
                    return self.getDataForThirdRow(contact);
                }
            });

        this.callParent();

        this.emptyText = LANGUAGE.getString('noJournalEntries');

        this.setStore(Ext.create('Ext.data.Store',
        {
            model: 'JournalEntry',
            isLoaded: function ()
            {
                return this.getCount() >= 0;
            },
            isLoading: function ()
            {
                return CURRENT_STATE_JOURNAL.getJournalState() === JournalState.Loading;
            }
        }));

        switch (CURRENT_STATE_JOURNAL.getJournalState())
        {
            case JournalState.ServerNotAvailable:
                this.emptyText = LANGUAGE.getString('journalIsLoadedLater');
                break;
            case JournalState.Loading:
                this.emptyText = this.getEmptyTextForNoEntries();
                this.on('boxready', function ()
                {
                    // diese Abfrage ist tatsächlich nötig! Fall: Wir sind das Outgoing-Journal, was anfangs nicht sichtbar ist.
                    // Dann wird das afterrender erst geworfen, wenn man auf das Tab klickt und dann dreht sich der Wartecursor
                    // für immer, weil das self.mask.hide() (s.u.) schon längst vorher aufgerufen wurde
                    if (CURRENT_STATE_JOURNAL.getJournalState() === JournalState.Loading)
                    {
                        showBlackLoadingMask(self);
                    }
                });
                break;
            case JournalState.Loaded:
                this.onGetJournalSuccess();
                break;
        }
        

        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function () {
        this.callParent();
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
    },

    getDataForFirstRow: function (journalEntry)
    {
        return Ext.String.htmlEncode(journalEntry.getDisplayName(true));
    },

    getDataForSecondRow: function (journalEntry)
    {
        var dataForFirstRow = this.getDataForFirstRow(journalEntry);

        var result = "";
        Ext.each(journalEntry.collectPossibleValues(true), function (possibleValue)
        {
            if (dataForFirstRow !== possibleValue)
            {
                result = possibleValue;
                return false;
            }
        }, this);

        return Ext.String.htmlEncode(result) || "&nbsp;";
    },

    getDataForThirdRow: function (journalEntry)
    {
        return Ext.String.htmlEncode(journalEntry.getCallSuccessText());
    },

    getEmptyTextForNoEntries: function ()
    {
        return LANGUAGE.getString('noJournalEntries');
    },

    getWatermarkImage: function ()
    {
        return IMAGE_LIBRARY.getImage("list", 64, COLOR_WATERMARK);
    },

    onGlobalEvent_ConversationTabFocus: function (panel)
    {
        if (isValid(panel, "journalEntry") && getClassName(panel) === "JournalEntryPanel")
        {
            var index = this.findRecordPositionByJournalEntry(panel.journalEntry);
            if (index >= 0)
            {
                this.getSelectionModel().select(index);
            }
        }
    },

    onNewEvents: function (response)
    {
        this.callParent(arguments);
        
        if (isValid(response.getJournalEntries()) && !Ext.isEmpty(response.getJournalEntries()))
        {
            var filteredJournalEntries = Ext.Array.filter(response.getJournalEntries(), this.getJournalFilterFunction());
            if (!Ext.isEmpty(filteredJournalEntries))
            {
                filteredJournalEntries = this.filterEntriesAlreadyInStore(filteredJournalEntries);
                
                this.addNewEntriesToStore(filteredJournalEntries);
            }
        }

        if (response.getCtiWebServiceAvailability() === Caesar.CtiWebServiceAvailability[Caesar.CtiWebServiceAvailability.Available])
        {
            this.setEmptyText("");
            showBlackLoadingMask(this);
        }
    },

    filterEntriesAlreadyInStore: function (entries)
    {
        var result = [];
        var store = this.getStore();
        Ext.each(entries, function (entry)
        {
            store.each(function (storeEntry, index)
            {
                if (storeEntry.data.equals(entry))
                {
                    store.remove(storeEntry);
                    return false;
                }
            });
            result.push(entry);
        });
        return result;
    },

    addNewEntriesToStore: function (entries)
    {
        var store = this.getStore();

        var index = this.getGroupEntryForToday();
        if (index === -1)
        {
            var groupEntry = this.createGroupEntryForToday();
            store.insert(0, groupEntry);
        }

        store.insert(1, entries[0]);
    },

    getGroupEntryForToday: function ()
    {
        var store = this.getStore();
        var firstEntry = store.getAt(0);
        if (isValid(firstEntry) && firstEntry.data.groupEntry && firstEntry.data.text === LANGUAGE.getString("today"))
        {
            return 0;
        }
        return -1;
    },

    onGetJournalSuccess: function (response)
    {
        hideLoadingMask(this);
        
        if (this.destroyed || !isValid(this.getStore()))
        {
            return;
        }
        if (this.getStore().getCount() > 0)
        {
            this.getStore().removeAll();
            this.refresh();
        }
        
        var journal = CURRENT_STATE_JOURNAL.getJournal(this.getJournalFilterFunction());
        var groupedJournal = this.groupByDate(journal);
        this.addGroupsToStore(groupedJournal);

        if (this.getStore().getCount() === 0)
        {
            if (response && response.getReturnValue().getCode() !== 0)
            {
                this.setEmptyText(response.getReturnValue().getDescription());
            }
            else
            {
                this.setEmptyText(this.getEmptyTextForNoEntries());
            }
        }
    },

    groupByDate: function (journal)
    {
        var groups = {};
        Ext.each(journal, function (journalEntry)
        {
            var date = journalEntry.getDate();
            if (isValid(groups[date]))
            {
                groups[date].push(journalEntry);
            }
            else
            {
                groups[date] = [journalEntry];
            }
        });
        return groups;
    },

    addGroupsToStore: function (groups)
    {
        var result = [];
        var self = this;
        Ext.iterate(groups, function (groupDate, groupedJournalEntries)
        {
            var groupEntry = self.createGroupEntry(groupDate);
            result.push(groupEntry);

            Ext.each(groupedJournalEntries, function (sortedJournalEntry)
            {
                result.push(sortedJournalEntry);
            });
        });

        var store = this.getStore();            
        store.add(result);
    },

    createGroupEntryForToday: function ()
    {
        return this.createGroupEntry(LANGUAGE.getString("today"));
    },

    createGroupEntry: function (text)
    {
        var groupEntry = new www_caseris_de_CaesarSchema_CTIJournalEntry();
        groupEntry.ignore = true;
        groupEntry.text = text;
        groupEntry.groupEntry = true;
        return groupEntry;
    },

    onGetJournalException: function ()
    {
        if (this.mask)
        {
            this.mask.hide();
        }
    },

    onDoubleClick: function (view, record, item, index, event, opts)
    {
        if (isValid(record, "data.getAddressInfo()"))
        {
            var number = record.data.getAddressInfo().getNumber();
            if (isValidString(number))
            {
                var contact = record.data.getResolvedAddressInfo();
                GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(contact, number);
                return;
            }
        }
        this.callParent(arguments);
    },

    getActions: function (record, item)
    {
        return new JournalActions(record.data, record, item, this);
    },

    onContactSelected: function (record)
    {
        if (record.data.ignore)
        {
            return;
        }
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openJournalEntry(record.data);
    },

    deleteEntry: function (record)
    {
        this.deleteFromStore(record, function ()
        {
            SESSION.deleteJournalEntry(record.data.getJournalId());
        });
    },

    onDeleteJournalEntrySuccess: function (response, journalID)
    {
        var self = this;
        var store = this.getStore();
        store.each(function (entry, index)
        {
            if (!isValid(entry) || entry.data.ignore)
            {
                return;
            }
            if (entry.data.getJournalId().equals(journalID))
            {
                self.deleteFromStore(store.getAt(index));
            }
        });
    },

    deleteFromStore: function (record, callBackAfterAnimation)
    {
        var self = this;
        var position = this.getStore().indexOf(record);
        if (position >= 0)
        {
            var deleteRecord = function ()
            {
                self.getStore().removeAt(position);
                if (position - 1 >= 0)
                {
                    var otherRecord = self.getStore().getAt(position - 1);
                    if (record.data.isLastEntryInGroup(self.getStore().getData().items, position) && isValid(otherRecord))
                    {
                        if (otherRecord.data.groupEntry)
                        {
                            self.getStore().removeAt(position - 1);
                        }
                    }
                }
                if (callBackAfterAnimation)
                {
                    callBackAfterAnimation();
                }
            };
            var node = this.getNode(record);
            animateDeleteEntry(node, deleteRecord);
        }
    },

    filterStoreByOwnGUID: function (record)
    {
        if (isValid(record, "data.AddressInfo.Guid"))
        {
            return record.data.AddressInfo.Guid === MY_CONTACT.getGUID();
        }
        return false;
    },

    getContactOutOfRecord: function (record)
    {
        if (isValid(record, "data.getResolvedAddressInfo()"))
        {
            if (record.data.getResolvedAddressInfo().isValid())
            {
                return record.data.getResolvedAddressInfo();
            }
        }
        return null;
    },

    onUpdateJournalEntrySuccess: function (response, journalEntry) 
    {
        this.onUpdateJournalEntriesSuccess(response, [journalEntry]);
    },

    onUpdateJournalEntriesSuccess: function (response, journalEntries)
    {
        var self = this;
        if (response.getReturnValue().getCode() === 0)
        {
            var store = this.getStore();
            Ext.each(journalEntries, function (journalEntry)
            {
                var position = self.findRecordPositionByJournalEntry(journalEntry);
                if (position >= 0)
                {
                    store.removeAt(position);
                    store.insert(position, journalEntry);
                }
            });
        }
    },

    onSingleClick: function (view, record, item, index, event, opts)
    {
        if (record.data.groupEntry)
        {
            return;
        }
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openJournalEntry(record.data);
    },

    findRecordByJournalEntry: function (journalEntry)
    {
        var store = this.getStore();
        return store.getAt(this.findRecordPositionByJournalEntry(journalEntry));
    },

    findRecordPositionByJournalEntry: function (journalEntry) {
        var store = this.getStore();
        var position = store.findBy(function (record, id) {
            return record.data.equals(journalEntry);
        });
        return position;
    }

});
