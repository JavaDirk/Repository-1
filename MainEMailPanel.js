/**
 * Created by martens on 25.02.2015.
 */

Ext.define('EmailTabPanel',
{
    extend: 'UniqueTabPanel',

    activeEmail: undefined,
    overCls: 'splitterOnHover',
    region: 'center',
    margin: MARGIN_BETWEEN_COMPONENTS + " " + MARGIN_BETWEEN_COMPONENTS + " " + MARGIN_BETWEEN_COMPONENTS + " 0",
    style:
    {
        'background-color': WHITE
    },
    border: false,

    listeners:
    {
        tabchange: function (event, newTab, oldTab)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_updateNavigationSelect(newTab);

            setTimeout(function ()
            {
                if (isValid(newTab, 'requestOverview.xtype'))
                {
                    newTab.requestOverview.resizable = true;
                    newTab.requestOverview.minHeight = 1;
                }
            }, 100);

        },

        destroy: function (me)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(me);
        },

        boxready: function (me)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(this);

            me.createEmailView(OPEN_REQUEST_STORE, LANGUAGE.getString('incoming'));
        }
    },

    onRequestManagementEvent_selectEmailInEditEmailsFolder: function (email)
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var curPanel = this.items.getAt(i);

            if (isValid(curPanel, 'requestContainer.emailStore.store') && curPanel.requestContainer.emailStore.store.isEditRequestStore())
            {
                this.setActiveTab(curPanel);

                REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_setActiveEmail(EDIT_REQUEST_STORE.getStoreIndexForMailId(email.MailId), EDIT_REQUEST_STORE);
                return;
            }
        }

        this.onRequestManagementEvent_addViewToTabPanel(EDIT_REQUEST_STORE, LANGUAGE.getString('inProgress'));
        setTimeout(() =>
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_setActiveEmail(EDIT_REQUEST_STORE.getStoreIndexForMailId(email.MailId), EDIT_REQUEST_STORE);
        }, 350);
    },

    onRequestManagementEvent_checkIfActionIsPossible: function (target, ticketId, yesCallBackFunction, noCallBackFunction)
    {
        var self = this;

        for (var i = 0; i < this.items.length; i++)
        {
            var curPanel = this.items.getAt(i);

            if (curPanel.isAnswerPanel && curPanel.email.fullId === ticketId)
            {
                target.showConfirmation(
                {
                    margin: '10 0 0 0',
                    errorMessageText: LANGUAGE.getString('generalInEditing'),
                    yesCallback: function ()
                    {
                        var items = [];

                        for (var i = 0; i < self.items.length; i++)
                        {
                            var curPanel = self.items.getAt(i);

                            if (curPanel.isAnswerPanel && curPanel.email.fullId === ticketId)
                            {
                                items.push(curPanel);
                            }
                        }

                        for (var i = 0; i < items.length; i++)
                        {
                            self.remove(items[i]);
                        }

                        yesCallBackFunction();
                    },
                    noCallback: function ()
                    {
                        noCallBackFunction();
                    }
                });

                return;
            }
        }

        yesCallBackFunction();
    },

    onRequestManagementEvent_createNewTab: function (panel)
    {
        var curItem = this.getActiveTab();

        if (isValid(curItem, 'requestOverview.xtype'))
        {
            curItem.requestOverview.resizable = false;
            if (curItem.requestOverview.rendered)
            {
                curItem.requestOverview.minHeight = curItem.requestOverview.getHeight();
            }
            else
            {
                curItem.on('boxready', function ()
                {
                    curItem.requestOverview.minHeight = curItem.requestOverview.getHeight();
                });
            }
        }

        for (var i = 0; i < this.items.length; i++)
        {
            var curTab = this.items.getAt(i);
            var email = panel.email;

            if (curTab.email && email)
            {
                var curEmail = curTab.email;

                if (isValidString(curEmail.fullId) && curEmail.fullId === email.fullId && email.type === curEmail.type)
                {
                    if (panel.isAnswerPanel)
                    {
                        if (!curTab.isAnswerPanel)
                        {
                            continue;
                        }
                    }

                    this.setActiveTab(curTab);
                    return;
                }
            }
        }

        this.addItem(panel);
    },

    onRequestManagementEvent_removeTab: function (tab)
    {
        this.remove(tab);
    },

    onRequestManagementEvent_checkIfTabAlreadyExists: function (title, handlerFunction)
    {
        if (!this.checkPanelAlreadyExists(title))
        {
            handlerFunction();
        }
        else
        {
            for (var i = 0; i < this.items.length; i++)
            {
                var curPanel = this.items.getAt(i);

                if (curPanel.title.toUpperCase() === title.toUpperCase())
                {
                    this.setActiveTab(curPanel);
                    return;
                }
            }
        }
    },

    onRequestManagementEvent_addViewToTabPanel: function (store, title)
    {
        this.createEmailView(store, title);
    },

    onRequestManagementEvent_showRequestConversation: function (email)
    {
        this.searchFct(email, undefined, false);
    },

    onRequestManagementEvent_showSearch: function (searchParameters)
    {
        this.searchFct(null, searchParameters, false);
    },

    onRequestManagementEvent_toggleTab: function (tab, tabFunction)
    {
        var lastTab = this.getActiveTab();

        this.setActiveTab(tab);

        if (tabFunction)
        {
            tabFunction();
        }

        this.setActiveTab(lastTab);
    },

    checkPanelAlreadyExists: function (title)
    {
        return !!this.getPanelByTitle(title);
    },

    getPanelByTitle: function (title)
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var curPanel = this.items.getAt(i);

            if (curPanel.title.toUpperCase() === title.toUpperCase())
            {
                return curPanel;
            }
        }

        return null;
    },

    getUnsavedChanges: function ()
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var curPanel = this.items.getAt(i);

            if (curPanel.isAnswerPanel)
            {
                return LANGUAGE.getString('beforeCloseText');
            }
        }

        return '';

    },

    checkPanelExists: function (panel, requestContainer)
    {
        panel.requestContainer = requestContainer;

        var foundPanel = this.getPanelByTitle(panel.title);
        if (isValid(foundPanel))
        {
            this.setActiveTab(foundPanel);
            return true;
        }
        else
        {
            this.addItem(panel);
            return false;
        }
    },

    createEmailView: function (store, title)
    {
        if (store.isSearchStore())
        {
            this.searchFct();
            return;
        }

        var activeEmail = undefined;

        if (isValid(store, 'data.length') && store.data.length > 0)
        {
            activeEmail = store.data.getAt(0).data;
        }

        var requestContainer = new RequestOverview(
            {
                layout: { type: 'vbox', pack: 'start', align: 'stretch' },
                border: false,
                emailStore: store,
                style:
                {
                    'border-left': 'solid 3px transparent',
                    'background-color': WHITE
                }
            });
        store.requestOverview = requestContainer;

        var emailPanel = new EmailOverviewPanel(
            {
                title: title,
                email: activeEmail,
                requestOverview: requestContainer,
                store: store
            });

        requestContainer.parentPanel = emailPanel;

        if (this.checkPanelExists(emailPanel, requestContainer))
        {
            return undefined;
        }

        return emailPanel;
    },

    searchFct: function (email, searchParameters, showGridPanelTitle = true)
    {
        var searchPanel = new MainSearchPanel(
        {
            border: false,
            isOnlyRead: true,
            mailStore: new SearchRequestStore(),
            titleText: LANGUAGE.getString('search') + ' ' + LANGUAGE.getString('emailsNormalCase'),
            initialEmail: email,
            initialSearchParameters: searchParameters,
            showGridPanelTitle: showGridPanelTitle
        });

        this.onRequestManagementEvent_createNewTab(searchPanel);

        return searchPanel;
    },

    initComponent: function ()
    {

        this.collapsible = false;

        this.callParent();
    }
});

Ext.define('RequestNavigationContainer',
{
    extend: 'Ext.Panel',

    layout: { type: 'vbox', pack: 'start', align: 'stretch' },
    region: 'west',
    margin: MARGIN_BETWEEN_COMPONENTS + ' 0 ' + MARGIN_BETWEEN_COMPONENTS + ' 0',
    collapsible: true,
    floating: false,
    collapsedMenu: false,
    border: false,
    animCollapse: false,
    hideCollapseTool: true,
    createCollapsedButtons: function ()
    {
        if (!isValid(this, 'placeholder.removeAll'))
        {
            return;
        }


        this.placeholder.removeAll();

        //das anlegen des expandTool ist eigentlich Quatsch, weil wir gar keins haben wollen
        //Aber: ExtJS greift darauf zu und produziert dadurch JS-Fehler. Also legen wir es versteckt an und alle sind glücklich :-)
        this.placeholder.expandTool = this.placeholder.add(Ext.create('Ext.Component',
            {
                hidden: true
            }));

        var createButton = function (icon, tooltip, margin, store, handler)
        {
            handler = handler || function (button, event)
            {
                REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_addViewToTabPanel(store, button.tooltip);
            };
            return new ThinButton(
                {
                    icon: icon,
                    scale: 'medium',
                    margin: margin,
                    tooltip: tooltip,
                    listeners:
                    {
                        click: function (button, event)
                        {
                            handler(button, event);
                            event.stopPropagation(); //ganz wichtig! Ansonsten wird bei einem Klick auf einen Button in der minimierten Ansicht nicht nur der entsprechende Ordner geöffnet,
                                                     //sondern auch die expanded Ansicht zusätzlich angezeigt (das passiert in der getPlaceholder-Methode)
                        }
                    }
                });
        };

        this.placeholder.add(createButton('Images/64/inbox.png', LANGUAGE.getString('incoming'), '0 0 0 0', OPEN_REQUEST_STORE));
        this.placeholder.add(createButton('Images/64/edit.png', 'In Bearbeitung', '10 0 0 0', EDIT_REQUEST_STORE));
        this.placeholder.add(createButton('Images/64/action.png', LANGUAGE.getString('drafts'), '10 0 0 0', DRAFT_REQUEST_STORE));
        this.placeholder.add(createButton('Images/64/clock.png', LANGUAGE.getString('workToday'), '10 0 0 0', TODAY_REQUEST_STORE));
        this.placeholder.add(createButton('Images/64/warning.png', LANGUAGE.getString('overdue'), '10 0 0 0', OVERDUE_REQUEST_STORE));
        this.placeholder.add(createButton('Images/64/check.png', LANGUAGE.getString('worked'), '10 0 0 0', WORKED_REQUEST_STORE));
        this.placeholder.add(createButton('Images/64/search.png', LANGUAGE.getString('search'), '10 0 0 0', new SearchRequestStore()));
        this.placeholder.add(createButton('Images/64/add.png', LANGUAGE.getString('newRequest'), '25 0 0 0', null, function (button, event)
        {
            event.stopPropagation();
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_createNewTicket();
        }));
        
        this.body.hide();

        Ext.asap(function ()
        {
            if (this.collapsedMenu)
            {
                this.collapse();
            }
            else
            {
                this.expand();
            }
        }, this);
        
    },
    header: false,
    width: DEFAULT_WIDTH_FOR_REQUEST_MANAGEMENT,

    listeners:
    {
        collapse: function (event)
        {
            CLIENT_SETTINGS.addSetting("EMAIL", "emailNavigationCollapsed", true);
            CLIENT_SETTINGS.saveSettings();

            if (event.placeholder.items.length < 4)
            {
                event.createCollapsedButtons();
            }

            this.collapsedMenu = true;
        },

        beforeexpand: function (event)
        {
            CLIENT_SETTINGS.removeSetting("EMAIL", "emailNavigationCollapsed");
            CLIENT_SETTINGS.saveSettings();
            
            event.body.show();

            this.collapsedMenu = false;
        },

        boxready: function (me)
        {
            me.collapsedMenu = false;

            if (CLIENT_SETTINGS.getSetting("EMAIL", "emailNavigationCollapsed"))
            {
                me.collapsedMenu = true;
            }

            if (me.collapsedMenu)
            {
                Ext.asap(function ()
                {
                    me.collapse();

                    me.createCollapsedButtons();
                });
                
            }
        }
    },

    initComponent: function ()
    {
        this.callParent();

        if (CLIENT_SETTINGS.getSetting("EMAIL", "emailNavigationCollapsed"))
        {
            this.collapsedMenu = true;
        }

        this.add(new Ext.Container(
            {
                layout: { type: 'vbox', pack: 'center'},
                height: 39,
                style: 'background-color:' + PANEL_BACKGROUND_GREY,
                items:
                    [
                        new Ext.form.Label({
                            style: 'margin-left:10px;text-align:center;font-size:16px;color:' + BLACK,
                            text: LANGUAGE.getString('requests')
                        })
                    ]
            }));

        this.navigationMenu = this.add(Ext.create('NavigatorList',
        {
            listItems:
            [
                this.createListItem(LANGUAGE.getString('incoming'), 'inbox', OPEN_REQUEST_STORE),
                this.createListItem(LANGUAGE.getString('inProgress'), 'edit', EDIT_REQUEST_STORE),
                this.createListItem(LANGUAGE.getString('drafts'), 'action', DRAFT_REQUEST_STORE),
                this.createListItem(LANGUAGE.getString('workToday'), 'clock', TODAY_REQUEST_STORE),
                this.createListItem(LANGUAGE.getString('overdue'), 'warning', OVERDUE_REQUEST_STORE),
                this.createListItem(LANGUAGE.getString('worked'), 'check', WORKED_REQUEST_STORE),
                this.createListItem(LANGUAGE.getString('search'), 'search', new SearchRequestStore())
            ]
        }));
    },

    createListItem: function (title, imageName, store)
    {
        return {
            text: title,
            icon: IMAGE_LIBRARY.getImage(imageName, 64, COLOR_MAIN_GREY),
            handler: function () 
            {
                REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_addViewToTabPanel(store, title);
            },
            store: store
        };
    }
});

Ext.define('MainEMailPanel', {
    extend: 'Ext.Container',
    cls: 'mainEMailPanel',
    layout: 'border',
    loadMask: null,
    border: false,
    autoDestroy: false,
    backgroundLabel: {},
    canDestroy: false,
    defaults:
    {
        collapsible: true,
        split: GREY_SPLITTER
    },

    style:
    {
        'background-color': MAIN_BACKGROUND_GREY
    },

    listeners:
    {
        beforeclose: function (self)
        {
            var closeMessage = self.getUnsavedChanges();

            if (isValidString(closeMessage))
            {
                self.add(Ext.create('ConfirmationComponent', {
                    region: 'north',
                    margin: '15 10 5 0',
                    borderWidth: 1,
                    errorMessageText: closeMessage,
                    yesCallback: function ()
                    {
                        var tabPanel = self.tabPanelContainer;

                        for (var i = 0; i < tabPanel.items.length; i++)
                        {
                            if (isValid(tabPanel.items.getAt(i), 'activeEmail'))
                            {
                                var email = tabPanel.items.getAt(i).activeEmail;

                                if (email.newMailId)
                                {

                                    SESSION.cancelMail(email.newMailId, function ()
                                    {
                                        console.log('Cancel mail succeded');
                                    }, function () { });
                                }
                            }
                        }

                        self.removeAll(true);

                        self.destroy();
                    },
                    noCallback: function ()
                    {
                    }
                }));

                return false;
            }
        },

        afterrender: function (event) {
            userReplyAttachmentItems = [];
            OPEN_REQUEST_STORE.activeEmail = undefined;

            setTimeout(function ()
            {
                if (event.backgroundLabel.xtype)
                {
                    event.backgroundLabel.setMargin(55 + event.getHeight() / 2 + ' 0 0 0');
                }

                // Nach dem Aufbau muss geprüft werden, ob der Mail-Dispatcher läuft, da man ansonsten nie die Maske sehen würde
                var mailDispatcherAvailbilty = CURRENT_STATE_CONTACT_CENTER.isMailDispatcherAvailable();

                if (mailDispatcherAvailbilty === mailProcessingAvailability.NotAvailable.value)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_MailProcessingChanged(mailDispatcherAvailbilty, true);
                }
            }, 100);
        },
        destroy: function (me)
        {
            GLOBAL_EVENT_QUEUE.removeEventListener(me);
        }
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    },

    getUnsavedChanges: function ()
    {
        return this.tabPanelContainer.getUnsavedChanges();

    },
    createView: function ()
    {
        if (OPEN_REQUEST_STORE.data.length <= 0)
        {
            var target = this;

            if (!VIEWPORT.emailPanel)
            {
                target = VIEWPORT;
            }

            this.createLoadingMask(target);
        }

        GLOBAL_EVENT_QUEUE.onGlobalEvent_EmailsAdded(OPEN_REQUEST_STORE);
    },

    onGlobalEvent_MailProcessingChanged: function (mailProcessing)
    {
        if (mailProcessing === mailProcessingAvailability.Available.value)
        {
            hideConnectionLostMask(this);
        }
        else if (mailProcessing === mailProcessingAvailability.NotAvailable.value)
        {
            showConnectionLostMask(this);
        }
    },
    createLoadingMask: function (target) {
        var self = this;
        this.loadMask = new LoadingMask({
            target: target,
            msg: LANGUAGE.getString('loadRequests')
        });
    },

    initComponent: function () 
    {
        // Sencha-Bug bei Tab-Panel mit border-Layout (siehe Ticket bei Sencha)
        this.items =
        [
            new EmailTabPanel(),
            new RequestNavigationContainer()
        ];

        this.collapsible = false;

        this.callParent();

        GLOBAL_EVENT_QUEUE.addEventListener(this);

        // Zuweisung muss gemacht werden, da man nur direkt ueber items zuweisen kann
        this.tabPanelContainer = this.items.getAt(0);

        this.createView();
    }
});