/**
 * Created by martens on 21.09.2015.
 */
Ext.define(CLASS_MAIN_SEARCH_PANEL, {
    extend: 'Ext.Panel',
    layout: {type: 'vbox', pack: 'start', align: 'stretch'},
    searchContainer: {},
    resultOverview: {},
    resultContainer: {},
    contactButton: {},
    historyButton: {},
    gridHeight: -1,
    closable: true,
    lastSearchSettings: undefined,
    showGridPanelTitle: true,

    destroy: function () 
    {
        CLIENT_SETTINGS.saveSettings();
    },
    createNoView: function ()
    {
        if (isValid(this, 'requestContainer.overviewGrid.store.removeAll'))
        {
            this.tab.setText(LANGUAGE.getString('search').toUpperCase());

            this.changeGridPanelTitle(LANGUAGE.getString('searchResults'));
            
            this.requestContainer.overviewGrid.store.removeAll();
            this.gridPanel.requestOverview.store.removeAll();
            this.gridPanel.email = undefined;
            this.gridPanel.setEmailContainerViewStyle();
        }
    },
    displaySearchResults: function (result, isFlatSearch)
    {
        var self = this;

        if (isValid(result, 'getMailSearchData().getResult()') && result.getMailSearchData().getResult().length > 0)
        {
            if (this.initialEmail)
            {
                self.tab.setText((LANGUAGE.getString('request') + ' ' + self.initialEmail.shortId).toUpperCase());
            }
            else if (this.initialSearchParameters)
            {
                
            }
            else if (isValidString(this.searchQuery.getValue()))
            {
                var searchString = this.searchQuery.getValue();
                if (searchString.length > 10)
                {
                    searchString = searchString.substring(0, 10) + "...";
                }
                this.tab.setText(LANGUAGE.getString('search').toUpperCase() + ' (' + Ext.String.htmlEncode(searchString) + ')');
            }
            else
            {
                this.tab.setText(LANGUAGE.getString('search').toUpperCase());
            }

            var messages = result.getMailSearchData().getResult();

            self.mailStore.isFlatSearch = isFlatSearch;
            self.mailStore.checkEmails(messages, isFlatSearch);
        }
        else
        {

            this.createNoView();
        }

        self.gridPanel.requestOverview.isFlatSearch = isFlatSearch;
        self.gridPanel.requestOverview.setStore(self.mailStore);

        hideLoadingMask(self);


        var selectIndex = 0;

        if (this.initialEmail && self.gridPanel.requestOverview.store.data.length > 0)
        {
            var record = self.gridPanel.requestOverview.store.data.getAt(0);

            if (isValid(record, 'data.conversation.length') && record.data.conversation.length > 0)
            {
                self.gridPanel.requestOverview.getView().refreshNode(record);

                self.mailStore.addConversationForEmail(record.data);

                selectIndex = self.mailStore.getStoreIndexForMailId(this.initialEmail.mailId);

                setTimeout(function ()
                {
                    self.gridPanel.requestOverview.getSelectionModel().select(selectIndex);
                }, 100);
            }

        }

        if (self.gridPanel.requestOverview.store.data.length > 0)
        {
            self.gridPanel.requestOverview.getSelectionModel().select(selectIndex);
        }

        if (!messages)
        {
            messages = [];
        }

        this.changeGridPanelTitle(LANGUAGE.getString('searchResults') + ' (' + messages.length + ')');
        
        self.resultOverview.focus();
    },

    changeGridPanelTitle: function (text)
    {
        this.gridPanel.setTitle(text);
    },

    startSearch: function (fullId)
    {
        var self = this;

        var start = "";
        var end = "";
        
        if (isValidString(self.startDate.getValue()) && self.startDate.getValue())
        {
            self.startDate.getValue().setHours(0);
            self.startDate.getValue().setMinutes(0);
            self.startDate.getValue().setSeconds(1);

            self.endDate.getValue().setHours(23);
            self.endDate.getValue().setMinutes(59);
            self.endDate.getValue().setSeconds(59);

            start = self.startDate.getValue().toISOString();
            end = self.endDate.getValue().toISOString();
        }
        else
        {
            start = new Date();
            end = new Date();
        }

        var fields = this.getSelectedFilters();

        showBlackLoadingMask(this);

        var agentArray = [];
        var agent = self.addressField.getValue();
        if (agent !== -1)
        {
            agentArray.push(agent.Id);
        }

        var groupArray = [];
        var group = self.groupField.getValue();
        if (group !== -1)
        {
            groupArray.push(group.Id);
        }

        var isFlatSearch = true;

        var searchWord = self.searchQuery.getValue();

        var isRequestNumber = false;

        if (searchWord.indexOf('#') !== -1)
        {
            var query = searchWord.split('#');

            if (query.length < 2 && Ext.isNumeric(query[1]))
            {
                searchWord = query[1];
            }
        }

        if (fields.length === 1 && fields[0] === 'Id')
        {
            isRequestNumber = true;

            if (isValidString(fullId) || !self.searchQuery.getValue())
            {
                isFlatSearch = false;
            }
        }


        var mailSearchFilter = MailSearchFilter.Journal.value;

        if ((isRequestNumber && isValidString(self.searchQuery.getValue())) || self.initialEmail)
        {
            fields = ['Id'];

            if (!self.initialEmail) {
                start = undefined;
            }
            else
            {
                isRequestNumber = true;
                mailSearchFilter = MailSearchFilter.Journal.value;
            }
        }

        if (this.stateField)
        {
            if (this.stateField.getValue().indexOf('<') === -1)
            {
                mailSearchFilter = this.stateField.getValue();

                for (var x = 0; x < this.stateField.getStore().data.length; x++)
                {
                    var curStoreItem = this.stateField.getStore().data.getAt(x).data;

                    if (curStoreItem.name === mailSearchFilter)
                    {
                        mailSearchFilter = curStoreItem.value;
                    }
                }
            }
        }

        if (mailSearchFilter === MailSearchFilter.AllDocuments.value)
        {
            isFlatSearch = true;
        }

        if (this.initialEmail || (!isValidString(this.searchQuery.getValue()) && mailSearchFilter === MailSearchFilter.AllDocuments.value))
        {
            mailSearchFilter = MailSearchFilter.Journal.value;
            isFlatSearch = false;
        }

        if (!isValidString(this.searchQuery.getValue())) 
        {
            isFlatSearch = false;
        }
        else
        {
            isFlatSearch = true;
        }

        if (!this.onlyRequestBox.checked && isValidString(this.searchQuery.getValue()))
        {
            mailSearchFilter = MailSearchFilter.AllDocuments.value;
        }
        else if (!this.onlyRequestBox.checked && !isValidString(this.searchQuery.getValue()))
        {
            mailSearchFilter = MailSearchFilter.Journal.value;
        }

        if (isValidString(fullId))
        {
            SESSION.searchForEmails(null, null, fullId, fields, groupArray, agentArray, function (response)
            {
                self.onSearchSuccess(response, isFlatSearch);
            }, function ()
            {
                self.onSearchException();
            }, mailSearchFilter);
        }
        else
        {
            SESSION.searchForEmails(start, end, self.searchQuery.getValue(), fields, groupArray, agentArray, function (response)
            {
                self.onSearchSuccess(response, isFlatSearch);
            }, function ()
            {
                self.onSearchException();
            }, mailSearchFilter);
        }

        if (CLIENT_SETTINGS.getSetting('EMAIL', 'saveSearchSettings') && !isValidString(fullId))
        {
            var searchSettings =
            {
                searchQuery: self.searchQuery.getValue(),
                searchZone: '',
                searchQueryIn: fields,
                searchFor:
                {
                    groups: groupArray,
                    agents: agentArray,
                    requestStates: mailSearchFilter
                }

            };

            CLIENT_SETTINGS.addSetting('EMAIL', 'lastSearchSettings', searchSettings);
        }
    },

    onSearchSuccess: function (result, isFlatSearch)
    {
        hideLoadingMask(this);

        if (result.getReturnValue().getCode() === 0)
        {
            this.displaySearchResults(result, isFlatSearch);
        }
        else
        {
            this.showError(result.getReturnValue().getDescription());
        }
    },

    onSearchException: function ()
    {
        hideLoadingMask(this);
        this.showError(LANGUAGE.getString("errorSearch"));
    },

    showError: function (text)
    {
        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '10 15 0 15',
            errorMessageText: text,
            errorType: ErrorType.Error,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    },

    flex: 1,
    autoScroll: true,

    getSelectedFilters: function ()
    {
        var self = this;

        var filters = [];
        for (var i = 0; i < self.innerCheckBoxContainer.items.length; i++)
        {
            if (self.innerCheckBoxContainer.items.getAt(i).checked && self.innerCheckBoxContainer.items.getAt(i).name === 'SearchIn')
            {
                filters[filters.length] = self.innerCheckBoxContainer.items.getAt(i).boxValue;
            }
        }

        return filters;
    },
   
    selectMailItem: function (record)
    {
    },

    initComponent: function () {
        this.callParent();

        var self = this;

        this.addressField = this.createComboBox(LANGUAGE.getString('agent'),
        {
            afterrender: function (event)
            {
                event.agentStore = new Ext.data.Store({
                    fields: ['name', 'value']
                });

                var agents = CURRENT_STATE_CONTACT_CENTER.getAllAgentsForMyMailGroups();

                Ext.each(agents, function (agent)
                {
                    var curAgentName = agent.getName();
                    var isvalidContact = true;
                    if (!isValidString(curAgentName))
                    {
                        curAgentName = agent.getContact();

                        if (curAgentName && isValid(curAgentName, 'getName()'))
                        {
                            curAgentName = curAgentName.getName();
                        }
                        else
                        {
                            isvalidContact = false;
                        }

                    }

                    if (isvalidContact)
                    {
                        event.agentStore.add({
                            name: curAgentName,
                            value: agent
                        });
                    }
                });

                event.agentStore.sort('internalName', 'ASC');

                event.agentStore.insert(0, {
                    name: '<' + LANGUAGE.getString('all') + ' ' + LANGUAGE.getString('agents') + '>',
                    value: -1
                });


                event.setValue(-1);

                event.setStore(event.agentStore);
            }
        });

        this.groupField = this.createComboBox(LANGUAGE.getString('group'),
        {
            afterrender: function (event)
            {
                event.groupStore = new Ext.data.Store({
                    fields: ['name', 'value']
                });

                var mailGroups = CURRENT_STATE_CONTACT_CENTER.getAllMailGroups();

                Ext.each(mailGroups, function (group)
                {
                    var groupName = group.getName();
                    event.groupStore.add(
                        {
                            name: groupName,
                            value: group
                        });
                });

                event.groupStore.sort('internalName', 'ASC');

                event.groupStore.insert(0,
                    {
                        name: '<' + LANGUAGE.getString('all') + ' ' + LANGUAGE.getString('agentStateGroups') + '>',
                        value: -1
                    });

                event.setValue(-1);

                event.setStore(event.groupStore);
            }
        });
        

        this.stateField = this.createComboBox(LANGUAGE.getString('requestState'),
        {
            afterrender: function (event)
            {
                event.stateStore = new Ext.data.Store({
                    fields: ['name', 'value']
                });

                Ext.Object.each(MailSearchFilter, function (state, index)
                {
                    var curState = MailSearchFilter[state];
                    var curStateText = curState.text;

                    if (curState.value === MailSearchFilter.Journal.value)
                    {
                        curStateText = '<' + curStateText + '>';
                    }

                    if (curState.value !== MailSearchFilter.AllDocuments.value)
                    {
                        event.stateStore.add(
                            {
                                'name': curStateText,
                                'value': state,
                                'internalName': curStateText
                            });
                    }

                });

                event.stateStore.sort('internalName', 'ASC');

                event.setValue('<' + MailSearchFilter.Journal.text + '>');

                event.setStore(event.stateStore);
            }
        });

        var container = this.add(new Ext.Panel({
            padding: '0 10 0 10',
            layout: {type: 'vbox', pack: 'start', align: 'stretch'},
            margin: '10 0 20 0',
            border: false,
            listeners: {
                afterrender: function (event)
                {
                    setTimeout(function ()
                    {
                        container.insert(0, new Label({
                            text: LANGUAGE.getString('searchCriteria'),
                            color: COLOR_MAIN,
                            fontSize: FONT_SIZE_HEADLINE,
                            margin: '0 15 0 0'
                        }));
                    }, 100);
                }
            }
        }));

        this.searchContainer = container.add(new Ext.Container({
            margin: '10 0 0 0',
            layout: { type: 'hbox', pack: 'start', align: 'stretch' }
        }));

        this.extendedSearchContainer = container.add(new Ext.Container({
            flex: 3,
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            border: false
        })).hide();

        this.checkBoxContainer = this.extendedSearchContainer.add(new Ext.Container({
            layout: {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            },
            margin: '10 0 0 0',
            border: false
        }));

        this.searchInContainer = this.extendedSearchContainer.add(new Ext.Container({
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            margin: '10 0 0 0'
        }));

        this.searchInContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('searchIn', ''),
            style: {
                color: COLOR_MAIN,
                'font-size': FONT_SIZE_TITLE + "px"
            }
        }));

        var innerSearchInContainer = this.searchInContainer.add(new Ext.Container({
            layout: { type: 'hbox', pack: 'start', align: 'stretch' }
        }));

        this.groupContainer = innerSearchInContainer.add(new Ext.Container({
            margin: '0 10 0 0',
            layout: { type: 'vbox', pack: 'start', align: 'stretch' }
        }));

        this.agentContainer = innerSearchInContainer.add(new Ext.Container({
            margin: '0 10 0 0',
            layout: { type: 'vbox', pack: 'start', align: 'stretch' }
        }));

        this.stateContainer = innerSearchInContainer.add(new Ext.Container({
            layout: { type: 'vbox', pack: 'start', align: 'stretch' }
        }));

        this.dateContainer = this.extendedSearchContainer.add(new Ext.Container({
            margin: '10 0 0 0',
            layout: { type: 'vbox', pack: 'start', align: 'stretch' }
        }));

        var searchContent = this.searchContainer.add(new Ext.Container({
            layout: { type: 'hbox', pack: 'start', align: 'stretch' },
            flex: 2
        }));

        this.searchQuery = searchContent.add(new Ext.form.field.Text({
            flex: 1,
            maxWidth: 476,
            selectOnFocus: true,
            enableKeyEvents: true,
            height: 22,
            emptyText: LANGUAGE.getString('searchQuery'),
            listeners: {
                change: function (event)
                {
                    if (event.getValue() === '')
                    {
                        self.createNoView();
                    }
                },
                keypress: function (field, event)
                {
                    if (event.getKey() === KEY_ENTER)
                    {
                        self.startSearch();
                    }
                }
            },
            triggers:
            {
                search:
                {
                    cls: 'search-trigger',
                    weight: -1,
                    handler: function ()
                    {
                        self.startSearch();
                    }
                }
            }
        }));

        setTimeout(function ()
        {
            self.searchQuery.focus();
        }, 100);

        this.groupContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('group'),
            margin: '0 0 5 0 ',
            style: {
                color: NEW_GREY,
                'font-size': FONT_SIZE_SUBTITLE
            }
        }));

        this.agentContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('agent'),
            margin: '0 0 5 0 ',
            style: {
                color: NEW_GREY,
                'font-size': FONT_SIZE_SUBTITLE
            }
        }));

        this.stateFieldLabel = this.stateContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('requestState'),
            margin: '0 0 5 0 ',
            style:
            {
                color: NEW_GREY,
                'font-size': FONT_SIZE_SUBTITLE
            }
        }));

        this.agentContainer.add(this.addressField);

        this.groupContainer.add(this.groupField);

        this.stateContainer.add(this.stateField);



        this.dateContainer.add(new Ext.form.Label({
            margin: '0 0 5 0 ',
            text: LANGUAGE.getString('limitPeriod'),
            style: {
                color: COLOR_MAIN,
                'font-size': FONT_SIZE_TITLE + "px"
            }
        }));

        var innerDateContainer = this.dateContainer.add(new Ext.Container({
            layout: { type: 'hbox', pack: 'start', align: 'stretch' },
            border: false,
            flex: 1
        }));

        var startContainer = innerDateContainer.add(new Ext.Container({
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            border: false
        }));

        startContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('start'),
            marign: '0 0 5 0',
            style: {
                color: NEW_GREY,
                'font-size': FONT_SIZE_SUBTITLE
            }
        }));

        var startTerm = 1;
        if (CLIENT_SETTINGS.getSetting('EMAIL', 'defaultSerachTime'))
        {
            startTerm = parseInt(CLIENT_SETTINGS.getSetting('EMAIL', 'defaultSerachTime'), 10);
        }

        var startDate = new Date();
        if (startTerm !== TimeInterval.freeInterval.value)
        {
            startDate.setMonth(startDate.getMonth() - startTerm);
        }
       
        this.startDate = startContainer.add(new Ext.form.field.Date(
        {
            value: startDate
        }));
        this.startDate.on('change', function ()
        {
            this.onNewStartDateSelected();
        }, this);

        var endContainer = innerDateContainer.add(new Ext.Container({
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            border: false
        }));

        endContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('to'),
            marign: '0 0 5 10',
            style: {
                color: NEW_GREY,
                'font-size': FONT_SIZE_SUBTITLE,
                'margin-left': '10px'
            }
        }));

        this.endDate = endContainer.add(new Ext.form.field.Date({
            margin: '0 0 0 10',
            value: new Date()
        }));
        this.endDate.on('change', function ()
        {
            this.onNewEndDateSelected();
        }, this);

        searchContent.add(new Ext.Container({
            flex: 1,
            minHeight: 26
        })); 

        this.timeChooser = searchContent.add(new TimeIntervalSelect({
            value: startTerm,
            parentContainer: this
        }));

        this.optionsButton = searchContent.add(new ThinButton({
            icon: 'Images/64/arrow_right.png',
            text: LANGUAGE.getString('options'),
            clickFct: function ()
            {
                if (this.iconName.indexOf('arrow_right') !== -1)
                {
                    self.extendedSearchContainer.show();
                    this.setIconSrc('Images/64/arrow_down.png');
                    self.timeChooser.hide();
                }
                else
                {
                    self.extendedSearchContainer.hide();
                    this.setIconSrc('Images/64/arrow_right.png');
                    self.timeChooser.show();
                }
            },
            expandOptions: function () 
            {
                if (this.iconName.indexOf('arrow_right') !== -1)
                {
                    self.extendedSearchContainer.show();
                    this.setIconSrc('Images/64/arrow_down.png');
                }

                self.startDate.focus();
                self.startDate.expand();
            },
            listeners: {
                click: function (event)
                {
                    event.clickFct();
                },
                boxready: function ()
                {
                    this.btnIconEl.setStyle({backgroundSize: '12px 12px'});
                }
            }
        }));

        this.checkBoxContainer.add(new Ext.form.Label({
            text: LANGUAGE.getString('searchQueryIn'),
            style: {
                color: COLOR_MAIN,
                'font-size': FONT_SIZE_TITLE + "px"
            }
        }));

        this.innerCheckBoxContainer = this.checkBoxContainer.add(new Ext.Container({
            layout: { type: 'hbox', pack: 'start', align: 'stretch' },
            border: false,
            flex: 1
        }));


        this.receiverBox = this.innerCheckBoxContainer.add(new Ext.form.field.Checkbox({
            boxLabel: LANGUAGE.getString('sender'),
            boxValue: 'From',
            name: 'SearchIn',
            margin: '0 0 0 0',
            checked: true
        }));

        this.subjectBox = this.innerCheckBoxContainer.add(new Ext.form.field.Checkbox({
            boxLabel: LANGUAGE.getString('subject'),
            boxValue: 'Subject',
            name: 'SearchIn',
            margin: '0 0 0 10',
            checked: true

        }));


        this.bodyBox = this.innerCheckBoxContainer.add(new Ext.form.field.Checkbox({
            boxLabel: LANGUAGE.getString('requestText'),
            boxValue: 'Body',
            name: 'SearchIn',
            margin: '0 0 0 10',
            checked: true

        }));

        this.requestNumberBox = this.innerCheckBoxContainer.add(new Ext.form.field.Checkbox({
            boxLabel: LANGUAGE.getString('requestNumber'),
            boxValue: 'Id',
            name: 'SearchIn',
            margin: '0 0 0 10',
            checked: true

        }));

        this.onlyRequestBox = this.innerCheckBoxContainer.add(new Ext.form.field.Checkbox(
            {
                boxLabel: LANGUAGE.getString('searchOnlyRequests'),
                boxValue: 'onlyRequests',
                name: 'onlyRequests',
                margin: '0 0 0 10',
                checked: true,
                listeners:
                {
                    change: function (me, value)
                    {
                        if (value)
                        {
                            self.stateField.show();
                            self.stateFieldLabel.show();
                        }
                        else
                        {
                            self.stateField.hide();
                            self.stateFieldLabel.hide();
                        }
                    }
                }
            }));

        this.mailStore = new SearchRequestStore();

        this.resultOverview = new RequestOverview({
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            border: false,
            emailStore: this.mailStore,
            padding: '0 0 0 0',
            style: {
                'border-left': 'solid 3px transparent',
                'background-color': WHITE
            }
        });

        this.requestContainer = this.resultOverview;
        this.overviewGrid = this.requestContainer.overviewGrid;

        this.gridPanel = this.add(new EmailOverviewPanel(
        {
            store: new SearchRequestStore(),
            email: undefined,
            closable: false,
            requestOverview: this.resultOverview,
            header: this.showGridPanelTitle ? 
            {
                style: 'background-color:white',
                height: 48
            } : false,
            listeners:
            {
                boxready: function (me)
                {
                    if (self.initialEmail)
                    {
                        container.hide();
                        self.tab.setText((LANGUAGE.getString('request') + ' ' + self.initialEmail.shortId).toUpperCase());
                    }
                    if (self.initialSearchParameters)
                    {
                        container.hide();
                        self.tab.setText(self.initialSearchParameters.title);

                        showBlackLoadingMask(self);
                        SESSION.searchForEmails(null, null, self.initialSearchParameters.searchString, self.initialSearchParameters.fields, [], [], (response) =>
                        {
                            self.onSearchSuccess(response, false);
                        }, () =>
                        {
                            self.onSearchException();
                        }, MailSearchFilter.AllDocuments.value);
                    }
                    setTimeout(function ()
                    {
                        if (self.initialEmail)
                        {
                            self.searchQuery.setValue(self.initialEmail.fullId);
                            self.startSearch(self.initialEmail.fullId);
                        }
                        else if (!self.initialSearchParameters)
                        {
                            self.createNoView();
                            self.searchQuery.focus();
                        }
                    }, 100);
                }
            }
        }));

        this.requestContainer = this.resultOverview;

        setTimeout(function ()
        {
            if (CLIENT_SETTINGS.getSetting('EMAIL', 'saveSearchSettings')) {
                var settings = CLIENT_SETTINGS.getSetting('EMAIL', 'lastSearchSettings');

                if (!settings) {
                    return;
                }

                self.searchQuery.setValue(settings.searchQuery);

                if (settings.searchQueryIn)
                {
                    if (settings.searchQueryIn.indexOf('From') < 0)
                    {
                        self.receiverBox.setValue(false);
                    }

                    if (settings.searchQueryIn.indexOf('Subject') < 0)
                    {
                        self.subjectBox.setValue(false);
                    }

                    if (settings.searchQueryIn.indexOf('Body') < 0)
                    {
                        self.bodyBox.setValue(false);
                    }

                    if (settings.searchQueryIn.indexOf('Id') < 0)
                    {
                        self.requestNumberBox.setValue(false);
                    }
                }
                

                if (settings.searchFor.agents) {
                    var agentId = parseInt(settings.searchFor.agents, 10);

                    for (var i = 0; i < self.addressField.getStore().data.length; i++) {
                        var storeItem = self.addressField.getStore().data.getAt(i).data;

                        if (parseInt(storeItem.value, 10) === agentId) {
                            self.addressField.select(i);
                            self.addressField.setValue(storeItem.name);
                            break;
                        }
                    }
                }

                if (settings.searchFor.groups) {
                    var groupId = parseInt(settings.searchFor.groups[0], 10);

                    for (var i = 0; i < self.groupField.getStore().data.length; i++) {
                        var storeItem = self.groupField.getStore().data.getAt(i).data;

                        if (parseInt(storeItem.value, 10) === groupId) {
                            self.groupField.select(i);
                            self.groupField.setValue(storeItem.name);
                            break;
                        }
                    }
                }

                if (settings.searchFor.requestStates) {
                    var state = settings.searchFor.requestStates;

                    for (var i = 0; i < self.stateField.getStore().data.length; i++) {
                        var storeItem = self.stateField.getStore().data.getAt(i).data;

                        if (storeItem.value === state) {
                            self.stateField.select(i);
                            self.stateField.setValue(storeItem.name);
                            break;
                        }
                    }
                }
            }
        }, 200);
    },

    createComboBox: function (emptyText, listeners)
    {
        return new Ext.form.field.ComboBox({
            listConfig: {
                getInnerTpl: function ()
                {
                    return '{name:htmlEncode}';
                }
            },
            store: new Ext.data.Store({
                fields: ['name', 'value']
            }),
            maxWidth: 200,
            displayField: 'name',
            valueField: 'value',
            queryMode: 'local',
            emptyText: emptyText,
            text: '',
            editable: false,
            listeners: listeners
        });
    },

    isEqualToThisPanel: function (panel)
    {
        if (getClassName(this) !== getClassName(panel))
        {
            return false;
        }
        if (this.initialSearchParameters && JSON.stringify(this.initialSearchParameters) === JSON.stringify(panel.initialSearchParameters))
        {
            return true;
        }
        if (this.initialEmail && panel.initialEmail && this.initialEmail.mailId === panel.initialEmail.mailId)
        {
            return true;
        }
        return false;
    },

    onNewStartDateSelected: function ()
    {
        if (this.endDate.getValue() < this.startDate.getValue())
        {
            this.setEndDate(this.startDate.getValue());
        }
        this.timeChooser.setValue(TimeInterval.freeInterval.value);
    },

    onNewEndDateSelected: function ()
    {
        if (this.endDate.getValue() < this.startDate.getValue())
        {
            this.setStartDate(this.endDate.getValue());
        }
        this.timeChooser.setValue(TimeInterval.freeInterval.value);
    },

    setTimeChooserOption: function (timeInterval)
    {
        if (timeInterval === TimeInterval.freeInterval.value)
        {
            this.optionsButton.expandOptions();
        }
        else
        {
            var date = new Date();
            date.setMonth(date.getMonth() - timeInterval);
            this.setStartDate(date);
            this.setEndDate(new Date());
        }

        CLIENT_SETTINGS.addSetting('EMAIL', 'defaultSerachTime', timeInterval);
        CLIENT_SETTINGS.saveSettings();
    },

    setStartDate: function (date)
    {
        this.setDate(this.startDate, date);
    },

    setEndDate: function (date)
    {
        this.setDate(this.endDate, date);
    },

    setDate: function (dateField, date)
    {
        //Warum das Herumhantieren mit dem destroyed-flag? Seit ExtJS 7 kommt das change-Event der DateFields viel zu oft, z.B. wenn man den Wert mit setValue ändert (selbst wenn es denselben Wert hat wie vorher). 
        //Diese Event kann man dadurch verhindern, dass man das dateField auf destroyed setzt
        dateField.destroyed = true;
        dateField.setValue(date);
        dateField.destroyed = false;
    }
});