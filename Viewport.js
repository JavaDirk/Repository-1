Ext.define('Viewport',
{
    extend: 'Ext.container.Viewport',

    contactsPanel: null,

    layout:
    {
        type: 'box',
        vertical: true,
        pack: 'start',
        align: 'stretch'
    },

    mixins: ['Ext.mixin.Responsive'],
    responsiveFormulas:
    {
        small: () =>
        {
            var width = window.innerWidth;//VIEWPORT.getConversationTabPanelWidth();
            return width < TRESHOLD_FOR_SWITCHING_TO_SMALL_VIEW;
        },
        large: () =>
        {
            var width = window.innerWidth;//VIEWPORT.getConversationTabPanelWidth();
            return width >= TRESHOLD_FOR_SWITCHING_TO_SMALL_VIEW;
        }
    },

    initComponent: function ()
    {
        this.callParent();

        SESSION.addListener(this);

        this.initializeGlobalEventListeners(); //TODO: die könnten doch jetzt in die Application.js wandern, oder?

        this.on('boxready', function ()
        {
            IMAGE_LIBRARY.afterRenderImages = function ()
            {

            };
            IMAGE_LIBRARY.startRendering(this);
        }, this);

        OEM_SETTINGS = Ext.create('OEM_Settings',
        {
            onFinished: () =>
            {
                this.startTimio();
            }
        });
        OEM_SETTINGS.loadSettings();
    },

    destroy: function ()
    {
        Ext.each(this.globalEventListeners, function (globalEventListener)
        {
            globalEventListener.destroy();
        }, this);

        SESSION.removeListener(this);

        this.callParent();
    },

    //TODO: dies muss doch in timio.js rein, nicht in den viewport; aber: wenn man es in timio.js reinnimmt, muss es auf in emailclient.js...
    initializeGlobalEventListeners: function ()
    {
        this.globalEventListeners = [];
        this.globalEventListeners.push(new GlobalCallEventListener());
        this.globalEventListeners.push(new GlobalChatEventListener());
        this.globalEventListeners.push(new GlobalContactCenterEventListener());
        this.globalEventListeners.push(new GlobalListenerForDialogs());
        this.globalEventListeners.push(new GlobalEventListenerForWebDevicesForTimio(this.deviceManager));
        this.globalEventListeners.push(new GlobalCampaignEventListener());
    },

    onLogin: function (response, relogin)
    {
        hideConnectionLostMask(this);

        if (response.getReturnValue().getCode() === 0)
        {
            this.logInDialog.onLogin(response, relogin); //durch das anschließende removeAll bekommt der loginDialog sonst das onLogin nicht mit
            
            MY_CONTACT = response.getContact();

            if (!relogin)
            {
                Ext.batchLayouts(function ()
                {
                    this.removeAll();
                    this.createView();

                    Ext.mixin.Responsive.notify();
                }, this);
            }
        }
    },

    onLoginFailed: function (response, relogin)
    {
        var errorCodes = [ProxyError.ErrorAmbigousUser.value, ProxyError.ErrorUserNotFound.value, ProxyError.ErrorAuthenticationFailed.value];
        if (relogin && isValid(response) && Ext.Array.contains(errorCodes, response.getReturnValue().getCode()))
        {
            if (!this.logInDialog || this.logInDialog.destroyed || !this.logInDialog.xtype || this.logInDialog.hasLogedIn)
            {
                hideConnectionLostMask(this);

                SESSION_STORAGE.removeItem('LoginPassword');
                SESSION_STORAGE.removeItem('sessionId');
                this.removeAll(true);
                IMAGE_LIBRARY = new ImageLibraryForTimio();
                this.startTimio();
            }
        }
    },

    onLoginException: function ()
    {

    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var errorMessage;
            if (response.getProxyMessages && response.getProxyMessages())
            {
                var logoutMessage;
                Ext.each(response.getProxyMessages(), function (message)
                {
                    if (message.getReason() === "Logout")
                    {
                        errorMessage = message.getText();
                        return false;
                    }
                });
            }
            this.onLogoutWasSuccessfull(errorMessage);
        }
    },

    onLogoutWasSuccessfull: function (errorText)
    {
        this.removeAll(true);
        this.startTimio(errorText);
    },

    onNewEvents: function (event)
    {
        hideConnectionLostMask(this);
    },

    onConnectionLost: function (event)
    {
        showConnectionLostMask(this, null, "viewport");
    },

    createView: function (error)
    {
        //this.add(new Ext.Button({ scale: 'small', text: "So!", iconCls: 'pictos pictos-home red', /*glyph: 'xf015@sencha-tools'*/ }));
        this.header = Ext.create('Header', {});

        this.conversationsTabPanel = Ext.create('ConversationsTabPanel',
            {
                region: 'center',
                flex: 1
            });

        this.contactsPanel = Ext.create('ContactsPanel',
            {
                region: 'west',
                split: MAIN_GREY_SPLITTER,
                parent: this
            });

        this.conversationsTabPanel.addTabChangeListener(this.header);
        this.contactsPanel.addTabChangeListener(this.header);

        var body = Ext.create('Ext.Container',
        {
            flex: 1,
            layout: 'border',
            style: 'background-color: ' + MAIN_BACKGROUND_GREY,
            items:
            [
                this.contactsPanel,
                this.conversationsTabPanel
                ],
            listeners:
            {
                boxready: () =>
                {
                    this.splitter = body.items.items[1];

                    body.setSplitterVisible(this.splitterVisible);
                }
            },
            responsiveConfig:
            {
                small: { splitterVisible: false},
                large: { splitterVisible: true}
            },

            setSplitterVisible: (visible) =>
            {
                if (this.splitter)
                {
                    this.splitter.setWidth(visible ? 10 : 1);
                }
                else
                {
                    this.splitterVisible = visible;
                }
            }
        });

        this.add(this.header);
        this.add(Ext.create('GlobalErrorMessagesArea', {}));
        this.add(body);

        var startPage = TIMIO_SETTINGS.getStartPage();
        if (isValidString(startPage))
        {
            if (startPage.indexOf(PREFIX_WEBSITE) === 0)
            {
                var parts = startPage.split(PREFIX_WEBSITE + ":");
                if (parts.length > 1)
                {
                    var url = parts[1];
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_OpenURL(url, LANGUAGE.getString('startPage'));
                }
            }
            else
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_ChannelSelected(Ext.create(startPage), true);
            }
        }
    },

    startTimio: function (message)
    {
        SESSION.addVIPListener(CLIENT_SETTINGS);

        this.hideInitialWaitMessage();

        createGlobalCSS();

        this.logInDialog = this.add(this.createLoginDialog(message));
    },

    createLoginDialog: function (message)
    {
        return new LogInWindowForTimio({
            sessionObject: SESSION,
            imageHtml: '<div style="margin: 0px 0px 0px 5px; background-size: 130px 24px; height: 24px; width: 140px; background-repeat: no-repeat; background-image: url(' + OEM_SETTINGS.getLogoLoginMask() + ');"></div>',
            loginSuccessFunction: Ext.emptyFn,
            languageObject: LANGUAGE,
            defaultExceptionText: message
        });
    },

    hideInitialWaitMessage: function ()
    {
        var waitMessage = document.getElementsByClassName("initialWaitMessage");
        Ext.each(waitMessage, function (element)
        {
            element.style.display = "none";
        });
    }
});

Ext.define('ViewportForTimio',
{
    extend: 'Viewport',

    startTimio: function (message)
    {
        this.changeTitle();

        LOCAL_STORAGE = new LocalStorage();
        LANGUAGE = new Language();
        this.callParent(arguments);

        this.changeFavicon();
    },

    changeTitle: function ()
    {
        var title = OEM_SETTINGS.getTitle();
        if (!isValidString(title))
        {
            return;
        }
        document.title = title;
    },

    changeFavicon: function ()
    {
        var favicon = OEM_SETTINGS.getLogoFavicon();
        if (!isValidString(favicon))
        {
            return;
        }

        var faviconElement = document.getElementById('favicon');
        if (!faviconElement)
        {
            return;
        }
        faviconElement.href = favicon;
    },

    onLogin: function (response, relogin)
    {
        this.callParent(arguments);

        if (response.getReturnValue().getCode() === 0 && !relogin)
        {
            this.executeAutomatedActionsOnStartup();
        }
    },

    onLogoutWasSuccessfull: function (errorText)
    {
        this.callParent(arguments);

        this.executeAutomatedActionsOnEnd();
    },

    executeAutomatedActionsOnStartup: function ()
    {
        var actions = ACTIONS.getAutomatedActionsOnStartup();
        Ext.each(actions, function (action)
        {
            if (action.areAllConstraintsSatisfied())
            {
                action.execute();
            }
        });
    },

    executeAutomatedActionsOnEnd: function ()
    {
        var actions = ACTIONS.getAutomatedActionsOnEnd();
        Ext.each(actions, function (action)
        {
            if (action.areAllConstraintsSatisfied())
            {
                action.execute();
            }
        });
    }
});

Ext.define('ViewportForRequestManagement',
{
    extend: 'Viewport',

    actionsAndContactsPanel: {},
    bodyContainer: {},

    flex: 1,

    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    createView: function ()
    {
        this.gridSplitter = {};

        this.mainContainer = new Ext.Container(
        {
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            border: false,
            margin: 0,
            flex: 1
        });

        this.emailPanel = new MainEMailPanel({
            flex: 1
        });

        this.mainContainer.add(this.emailPanel);

        this.add(this.mainContainer);
    },

    createLoginDialog: function (message)
    {
        return new LogInWindow({
            sessionObject: SESSION,
            loginSuccessFunction: Ext.emptyFn,
            languageObject: LANGUAGE,
            defaultExceptionText: '',
            getAvatarDefaultImage: function ()
            {
                return IMAGE_LIBRARY.getImage("user", 64, COLOR_MAIN_2);
            }
        });
    },

    onLogin: function (response, relogin)
    {
        this.callParent(arguments);
        
        if (response.getReturnValue().getCode() === 0)
        {
            if (!isValidString(window.location.search))
            {
                LOCAL_STORAGE.setItem('sessionId', response.getSessionId());
            }
        }
    },

    onLoginFailed: function (response)
    {
        if (this.logInDialog && this.logInDialog.xtype)
        {
            this.logInDialog.show();
        }
    }
});