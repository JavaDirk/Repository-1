Ext.define('MergeRequestDialog',
{
    extend: 'ModalDialog',

    maxWidth: undefined,

    layout:
        {
            type: 'vbox',
            pack: 'start',
            align: 'stretch'
        },

    listeners:
        {
            boxready: function (me)
            {
                setTimeout(function ()
                {
                    me.searchQueryInput.focus();
                }, 100);

                showBlackLoadingMask(me.resultContainer);
            }
        },

    initComponent: function ()
    {
        this.titleText = LANGUAGE.getString('mergeTicket');
        this.callParent();

        var self = this;

        var container = new Ext.Container(
            {
                layout:
                {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },
                flex: 1,
                border: false
            });

        container.add(new EmailHeaderForMerge(
            {
                margin: '10 0 15 0',
                parentContainer: this,
                headerData: this.createHeaderData(this.email),
                email: this.email,
                isSelectable: false,
                border: 1
            }));

        container.add(new Ext.Component(
            {
                margin: '5 0 0 0',
                html: '<center><img src="' + IMAGE_LIBRARY.getImage('down', 64, NEW_GREY) + '" height="32px" width="32px" /></center>'
            }));

        container.add(new Ext.form.Label(
            {
                text: LANGUAGE.getString('chooseTargetRequest'),
                style:
                {
                    color: COLOR_MAIN,
                    'font-size': '20px'
                },
                margin: '5 0 0 0'
            }));

        var searchContainer = container.add(new Ext.Container(
            {
                layout:
                {
                    type: 'hbox',
                    pack: 'start'
                },

                margin: '10 0 5 0',

                border: false
            }));

        this.searchQueryInput = searchContainer.add(new Ext.form.field.Text(
            {
                margin: '2 0 0 0',
                emptyText: LANGUAGE.getString("searchQuery"),
                flex: 1,
                enableKeyEvents: true,
                listeners:
                {
                    keypress: function (field, event)
                    {
                        if (event.getKey() === 13)
                        {
                            self.searchTickets();
                        }
                    },

                    focus: function ()
                    {
                        self.searchButton.setStyle({ 'border-bottom-color': COLOR_MAIN_2 });
                    },

                    blur: function ()
                    {
                        self.searchButton.setStyle({ 'border-bottom-color': NORMAL_GREY });
                    }
                }
            }));

        this.searchButton = searchContainer.add(new RoundThinButton(
            {
                margin: '2 0 0 0',
                iconName: 'search',
                minWidth: 36,
                height: 36,
                style:
                {
                    border: 'none',
                    'background-color': WHITE,
                    'border-bottom': 'solid 1px ' + NORMAL_GREY,
                    'border-radius': '0px'
                },
                listeners:
                {
                    click: function ()
                    {
                        self.searchTickets();
                    }
                }
            }));

        this.timeChooser = searchContainer.add(new TimeIntervalSelect(
            {
                parentContainer: this
            }));

        this.fieldset = container.add(Ext.create('Ext.form.FieldSet',
        {
            title: LANGUAGE.getString("options"),
            margin: '5 0 0 0',
            border: false,
            collapsible: true,
            listeners:
            {
                boxready: function ()
                {
                    this.collapse();
                }
            }
        }));


        this.extraOptions = this.fieldset.add(new MergeTicketExpandableOptionsContainer());

        this.resultContainer = container.add(new Ext.Container(
            {
                scrollable: true,

                layout:
                {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },

                margin: '5 0 5 0',

                flex: 1,

                border: false
            }));

        this.addToBody(container);

        this.applyButton = self.addButton({
            text: LANGUAGE.getString('merge'),
            listeners:
            {
                click: function ()
                {
                    console.log(self.resultContainer.selectedEmail);
                    var targetTicket = self.resultContainer.selectedEmail;
                    var selectedTicket = self.email;

                    self.hide();
                    Ext.asap(() =>
                    {
                        self.onMerge(selectedTicket.fullId, targetTicket.fullId);
                    });
                }
            }
        });

        this.applyButton.hide();

        this.getInitialConversationItems();

        this.addToBody(container);

        this.on('boxready', function ()
        {
            var timeInterval = this.timeChooser.getValue();
            this.setTimeChooserOption(timeInterval);
        }, this);
    },

    onMerge: function (source, target)
    {

    },

    searchTickets: function ()
    {
        var me = this;

        this.changeErrorMessage("");

        this.resultContainer.removeAll(true);

        var queryString = this.searchQueryInput.getValue();

        var searchOptions = this.extraOptions.getSelectedOptions();

        if (queryString.indexOf('#') !== -1)
        {
            queryString = queryString.replace('#', '');
        }

        var failFunction = function (error)
        {
            console.log("Getting ticket for id failed!");
            console.log(error);
        };

        var doneFunction = function (result)
        {
            me.getSearchResults(result, me.resultContainer);
        };

        var startDate = searchOptions.searchPeriod.startDate;
        var endDate = searchOptions.searchPeriod.endDate;

        if (isValidString(queryString) && Ext.isNumeric(queryString))
        {
            searchOptions.searchFilter.setMailField(['Id']);
            startDate = undefined;
            endDate = undefined;
        }

        this.applyButton.hide();

        SESSION.searchForEmails(startDate, endDate, queryString, searchOptions.searchFilter, undefined, undefined, doneFunction, failFunction, MailSearchFilter.Journal.value);

        showBlackLoadingMask(me.resultContainer);
    },

    displayTicketHeader: function (tickets, resultContainer, initialSearch)
    {
        var self = this;
        var counter = 0;


        Ext.iterate(tickets, function (ticket)
        {
            ticket = PARENT_REQUEST_STORE.convertEmail(ticket);

            if (ticket.originalState === emailState.Error.value || ticket.state === emailState.Error.value
                || ticket.state === emailState.System.value || ticket.originalState === emailState.System.value
                || ticket.state === emailState.Spam.value || ticket.originalState === emailState.Spam.value)
            {
                return;
            }
            else if (ticket.fullId === self.email.fullId)
            {
                return;
            }
            else if (counter > 4)
            {
                return;
            }

            var headerData = self.createHeaderData(ticket);

            resultContainer.add(new EmailHeaderForMerge(
                {
                    //margin: counter === 4 ? '0' : '0 0 1 0',
                    parentContainer: resultContainer,
                    headerData: headerData,
                    email: ticket,
                    isSelectable: true
                }));

            counter++;
        });

        if (resultContainer.items.length > 0)
        {
            resultContainer.items.getAt(0).colorizeMainDivContainer();
            this.applyButton.show();
        }
        else
        {
            this.applyButton.hide();
            if (!initialSearch)
            {
                this.changeErrorMessage(LANGUAGE.getString('noResultsFound'));
            }
        }

        hideLoadingMask(resultContainer);
        setTimeout(function ()
        {
            self.setY((window.innerHeight - self.getHeight()) / 2, true);
        }, 0);

    },

    createHeaderData: function (mail)
    {
        var emailContainer = new EmailRequestContainer(
            {
                store: this.store,
                email: mail
            });
        return emailContainer.getHeaderData();
    },

    getSearchResults: function (result, resultContainer)
    {
        if (result.getReturnValue().getCode() !== 0)
        {
            this.changeErrorMessage(result.getReturnValue().getDescription());
            this.applyButton.hide();
            return;
        }

        if (isValid(result, 'getMailSearchData().getResult()') && result.getMailSearchData().getResult().length > 0)
        {
            this.displayTicketHeader(result.getMailSearchData().getResult(), resultContainer, false);
        }
        else
        {
            this.changeErrorMessage(LANGUAGE.getString('noResultsFound'));
            this.applyButton.hide();
        }
    },

    getInitialConversationItems: function ()
    {
        this.searchQueryInput.setValue(this.email.sender.getEmail());
        Ext.asap(() =>
        {
            this.searchTickets();
        });
    },

    setTimeChooserOption: function (timeInterval)
    {
        this.extraOptions.setEndDate(new Date());

        if (timeInterval === TimeInterval.freeInterval.value)
        {
            this.extraOptions.selectStartDateField();
            this.fieldset.expand();
        }
        else
        {
            var date = new Date();
            date.setMonth(date.getMonth() - timeInterval);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(1);
            this.extraOptions.setStartDate(date);
        }
    }
});
