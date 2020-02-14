/**
 * Created by martens on 24.04.2015.
 */
Ext.define('LogInWindow', {
    extend: 'Ext.Container',
    //title: '<div style="cursor:default;color:white;font-size:' + FONT_SIZE_TITLE + 'px;margin:6px 0 0 6px">CAESAR <span style="cursor:default;color: rgb(173, 210, 237)">OMNI</span>Client - Anmeldung</div>',
    nameField: {},
    passwordField: {},
    forgotPassword: {},
    logInButton: {},
    minHeight: 200,
    minWidth: 200,
    draggable: false,
    resizable: false,
    header: undefined,
    sessionObject: {},
    languageObject: {},
    userImage: '',
    htmlText: '',
    mobileMargin: -1,
    autoLogout: true,
    forceLogin: false,
    border: false,
    animationWindow: {},
    isUrlLogin: false,
    hasLogedIn: false,
    imageHtml: null,
    loginSuccessFunction: function () { },
    defaultExceptionText: undefined,
    style:
    {
        border: 'none !important'
    },
    cls: 'loginPanel',

    onLogin: function (result, relogin)
    {
        if (isValid(result, 'getSettings()'))
        {
            CLIENT_SETTINGS.settings = JSON.parse(result.getSettings());
        }
        if (!window.location.origin) { // Some browsers (mainly IE) does not have this pr o per t y, so we need t o  build it manually...
            window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
        }

        this.loginSuccessFunction(result, relogin);

        if (result.getReturnValue().getCode() === 0)
        {
            this.hasLogedIn = true;
            this.saveUserImageToLocalStorage(result.getContact());
        }
    },

    saveUserImageToLocalStorage: function (contact)
    {
        if (isValid(contact, 'getImageUrl()') && isValidString(contact.getImageUrl()))
        {
            LOCAL_STORAGE.setItem('LogInPicture', contact.getImageUrl());
        }
        else
        {
            LOCAL_STORAGE.removeItem('LogInPicture');
        }
    },
    
    onLoginFailed: function (response)
    {
        SESSION_STORAGE.removeItem('LoginPassword');

        var self = this;

        var doneFct = function ()
        {
            self.login(LOCAL_STORAGE.getItem('LogInName'), self.passwordField.getValue(), true);

            self.showLoading();
        };

        if (response && response.getReturnValue && response.getReturnValue() && (response.getReturnValue().getCode() === ProxyError.ErrorForceLogin.value))
        {
            var dialog = new ConfirmationDialog(
                {
                    target: self.logInButton,
                    text: response.getReturnValue().getDescription(),
                    yesCallback: doneFct,
                    showNoButton: false
                });

            this.hideLoading();
            return;
        }

        if (this.logInButton.xtype)
        {
            if (isValid(response) && isValid(response.getReturnValue()))
            {
                if (response.getReturnValue().getCode() === ProxyError.ErrorTokenDoesNotExist.value)
                {
                    showErrorWindow(self.logInButton, LANGUAGE.getString("errorLogin"));
                }
                else
                {
                    showErrorWindow(self.logInButton, response.getReturnValue().getDescription());
                }
                
            }
            else
            {
                showErrorWindow(self.logInButton, LANGUAGE.getString("unknownErrorOccurred"));
            }

            this.hideLoading();
        }
    },

    showLoading: function ()
    {
        this.logInButton.setText('');

        showWhiteLoadingMask(this.logInButton);
    },

    hideLoading: function ()
    {
        this.logInButton.setText(LANGUAGE.getString('login'));
        hideLoadingMask(this.logInButton);
    },

    layout: { type: 'vbox', pack: 'center', align: 'center' },
    confirmFct: function (name, password, picture)
    {
        var self = this;
        this.showLoading();

        setTimeout(function ()
        {
            LOCAL_STORAGE.setItem('LogInName', name);
            SESSION_STORAGE.setItem('LoginPassword', password);

            self.login(name, password, self.forceLogin);
        }, 0);
    },

    listeners: {
        afterrender: function (event)
        {
            if (event.defaultExceptionText)
            {
                var self = event;
                setTimeout(function ()
                {
                    new MessageDialog({
                        target: event.logInButton,
                        text: event.defaultExceptionText
                    }).show();
                }, 100);
            }
            
        }, resize: function (event)
        {
            if (event.mobileMargin <= 0)
            {
                event.setMargin(((Ext.getBody().getHeight() - 402) / 2) + 'px 0 0 0');
            }
            else
            {
                event.setMargin(event.mobileMargin + ' 0 0 0');
            }
        }, beforedestroy: function (event)
        {
            if (event.animationWindow && event.animationWindow.xtype && !event.animationWindow.destroyed)
            {
                event.animationWindow.hide();
            }

        }
    },
    handleLogInFailed: function (response)
    {
        SESSION_STORAGE.removeItem('LoginPassword');

        if (isValid(response) && isValid(response.getReturnValue()))
        {
            if (response.getReturnValue().getDescription().indexOf('Anmeldename') !== -1)
            {
                response.getReturnValue().setDescription(LANGUAGE.getString("enterYourName"));
            }
            this.passwordField.setActiveError(response.getReturnValue().getDescription());
        } else
        {
            this.passwordField.setActiveError(LANGUAGE.getString("unknownErrorOccurred"));
        }

        this.hideLoading();
    },
    handleCustomError: function (customError)
    {
        this.passwordField.setActiveError(customError);
        this.hideLoading();
    },
    initComponent: function ()
    {
        this.callParent();

        SESSION.addListener(this);

        var parameters = window.location.search;

        if (isValidString(parameters))
        {


            var username = this.getInitialParameterArray().username || "";

            username = username.replace('%20', ' ');

            var password = this.getInitialParameterArray().password || "";
            if (username && password)
            {
                this.isUrlLogin = true;
            }

            if (username && username !== LOCAL_STORAGE.getItem('LogInName'))
            {
                LOCAL_STORAGE.setItem('LogInName', username);
                SESSION_STORAGE.removeItem('LoginPassword');
                SESSION_STORAGE.removeItem('sessionId');
                LOCAL_STORAGE.removeItem('sessionId');
                SESSION_STORAGE.removeItem(SESSION_ID_COOKIE);
            }

            if (password && password !== SESSION_STORAGE.getItem('LoginPassword'))
            {
                SESSION_STORAGE.setItem('LoginPassword', password);
                SESSION_STORAGE.removeItem('sessionId');
                LOCAL_STORAGE.removeItem('sessionId');
                SESSION_STORAGE.removeItem(SESSION_ID_COOKIE);
            }
        }

        if (LOCAL_STORAGE.getItem('LogInName') && SESSION_STORAGE.getItem('LoginPassword'))
        {
            if (isValid(this.sessionObject, 'loginForMailProcessing'))
            {
                this.sessionObject.loginForMailProcessing(undefined, LOCAL_STORAGE.getItem('LogInName'), SESSION_STORAGE.getItem('LoginPassword'), false);
                return;
            }
            
        } else {
            if (window.dashboard && this.getInitialParameterArray().token) {
                this.isUrlLogin = true;
                this.sessionObject.login(this.autoLogout, LOCAL_STORAGE.getItem('LogInName'), SESSION_STORAGE.getItem('LoginPassword'), false, null, null, this.getInitialParameterArray().token);
                return;
            }
        }

        var token = this.getInitialParameterArray().token;
        if (isValidString(token))
        {
            this.isUrlLogin = true;
            if (this.sessionObject.loginForMailProcessing)
            {
                this.sessionObject.loginForMailProcessing(token, undefined, undefined, false);
                this.hide();
            }
        }

        var self = this;

        var userName = LOCAL_STORAGE.getItem('LogInName');

        if (!userName)
        {
            userName = '';
        }

        this.mainContainer = this.add(new Ext.Container({
            padding: '0 0 15 0',

            flex: 1,
            style: {
                border: 'solid 1px ' + COLOR_MAIN.createLighter(0.15),
                'border-radius': '3px',
                'background-color': COLOR_MAIN.createLighter(0.15)
            },
            layout: { type: 'vbox', pack: 'center', align: 'stretch' },
            listeners: {
                afterrender: function (event)
                {
                    setTimeout(function ()
                    {
                        event.setMaxWidth(event.getWidth());
                    }, 100);
                }, beforerender: function (event)
                {


                }
            }
        }));

        

        this.header = this.mainContainer.add(new Ext.Container(
            {
                hidden: !isValid(self.imageHtml),
                padding: '15 0 0 0',
                style:
                {
                    backgroundColor: COLOR_MAIN
                },
                layout:
                {
                    type: 'vbox',
                    align: 'stretch'
                },
                items:
                    [
                        new Ext.Component(
                        {
                            html: self.imageHtml
                        })
                    ]
            }));

        this.mainContainer.add(new Ext.Container({
            border: false,
            margin: '20 0 0 0',
            layout: { type: 'hbox', pack: 'center', align: 'stretch' },
            listeners: {
                beforerender: function (container)
                {
                    container.setWidth(Math.min(350, window.innerWidth - 10));
                    var contact = new www_caseris_de_CaesarSchema_Contact();
                    contact.setImageUrl(self.getAvatarImage());

                    self.foto = container.add(new Photo({
                        size: PhotoSizes.Normal,
                        showPresenceState: false,
                        showAgentState: ShowAgentState.showNever,
                        contact: contact,
                        style: 'border:1px solid ' + COLOR_MAIN_2
                    }));
                }
            }
        }));

        var container = this.mainContainer.add(this.createContainer());

        /*container.add(new Ext.form.Label(
            {
                text: self.languageObject.getString('userName') + ':',
                margin: '0 0 7 10',
                style:
                {
                    color: WHITE,
                    'font-size': FONT_SIZE_TEXT
                }

            }));*/

        this.fieldContainer = container.add(Ext.create('Ext.Container',
            {
                title: LANGUAGE.getString("loginNew"),
                layout:
                {
                    type: 'vbox',
                    align: 'stretch'
                },
                flex: 1
            }));

        self.nameField = new Ext.form.field.Text({
            margin: '20 10 15 10',
            padding: 0,
            height: 34,
            emptyText: self.languageObject.getString('userName'),
            fieldStyle: {
                'border-color': WHITE,
                'margin': '0 !important'
            },
            value: userName,
            enableKeyEvents: true,
            listeners: {
                keypress: function (field, event)
                {

                    if (event.getKey() === 13 && field.getValue().length > 0)
                    {
                        self.confirmFct(self.nameField.getRawValue(), self.passwordField.getRawValue());
                    }
                },
                afterrender: function (event)
                {
                    event.inputEl.setHeight(35);
                    event.inputEl.setStyle({ borderRadius: '3px' });
                        
                    var item = document.querySelector('#' + event.getId() + ' .x-form-trigger-wrap-default');

                    item.style.borderColor = WHITE;
                    item.style.borderRadius = '3px 3px 3px 3px';
                },
                change: function (field)
                {
                    if (isValidString(field.inputEl.dom.value))
                    {
                        field.inputEl.dom.style.paddingTop = 0;
                    }
                    else if (navigator.userAgent.toLowerCase().indexOf('firefox') > 0)
                    {
                        field.inputEl.dom.style.paddingTop = '8px';
                    }
                }
            }
        });
        this.fieldContainer.add(self.nameField);

        self.passwordField = new Ext.form.field.Text({
            margin: '0 10 0 10',
            padding: '5 0 0 0',
            height: 34,
            inputType: 'password',
            emptyText: self.languageObject.getString('password'),
            fieldStyle:
                {
                    'border-color': WHITE
                },
            enableKeyEvents: true,
            
            listeners: {
                keypress: function (field, event)
                {
                    if (event.getKey() === 13 && field.getValue().length > 0)
                    {
                        self.confirmFct(self.nameField.getRawValue(), self.passwordField.getRawValue());
                    }

                    if (event.browserEvent.getModifierState && event.browserEvent.getModifierState('CapsLock'))
                    {
                        self.setError(LANGUAGE.getString("capsLock"));
                    }
                    else
                    {
                        self.setError("");
                    }
                },
                afterrender: function (event)
                {
                    event.inputEl.setHeight(35);
                    event.inputEl.setStyle({ borderRadius: '3px' });

                    setTimeout(function ()
                    {
                        if (isValidString(event.inputEl.dom.value))
                        {
                            event.inputEl.dom.style.paddingTop = 0;
                        }
                        else if (navigator.userAgent.toLowerCase().indexOf('firefox') > 0)
                        {
                            event.inputEl.dom.style.paddingTop = '8px';
                        }


                    }, 150);

                    var item = document.querySelector('#' + event.getId() + ' .x-form-trigger-wrap-default');

                    item.style.borderColor = WHITE;
                    item.style.borderRadius = '3px 3px 3px 3px';

                },
                change: function (field)
                {
                    if (isValidString(field.inputEl.dom.value))
                    {
                        field.inputEl.dom.style.paddingTop = 0;
                    }
                    else if (navigator.userAgent.toLowerCase().indexOf('firefox') > 0)
                    {
                        field.inputEl.dom.style.paddingTop = '8px';
                    }
                }
            }
        });

        this.fieldContainer.add(self.passwordField);
        /*
        self.errorLabel = container.add(Ext.create('Label',
            {
                margin: '10 10 0 10',
                padding: '2px 5px',
                backgroundColor: '#borderRadius',
                borderRadius: 3,
                color: WHITE,
                hidden: true
            }));*/


        self.logInButton = new ThinButton({
            margin: '30 20 10 20',
            scale: 'large',
            needUpperCase: false,
            text: self.languageObject.getString('login'),
            style: {
                'background-color': COLOR_MAIN,
                'border-color': COLOR_MAIN,
                'border-radius': BORDER_RADIUS_BUTTONS
            },
            normalColor: WHITE,
            normalTextColor: WHITE,
            hoverColor: WHITE,
            hoverTextColor: WHITE,
            listeners: {
                click: function (event)
                {
                    self.confirmFct(self.nameField.getRawValue(), self.passwordField.getRawValue());
                    return false;
                    //document.activeElement.blur();
                },
                boxready: function ()
                {
                    this.btnIconEl.setStyle({ backgroundSize: '20px 20px' });
                }
            }
        });

        this.mainContainer.add(self.logInButton);

        this.mainContainer.add(new Ext.form.Label({
            text: 'Version: 14.02 (Build: #' + BUILD_NUMBER + ')',
            style: 'font-size:11px;color:white;text-align:center',
            margin: '5 0 0 0'
        }));

        this.add(new Ext.Container({
            border: false,
            flex: 1,
            margin: '25 0 0 0',
            layout: { type: 'hbox', pack: 'center', align: 'stretch' },
            listeners: {
                beforerender: function (event)
                {
                    self.forgotPassword = new Link({
                        text: self.languageObject.getString('passwordForgotten'),
                        fontSize: 15,
                        lineHeight: 25,
                        listeners: {
                            el: {
                                click: function (event)
                                {
                                    if (self.nameField.getRawValue().length > 0)
                                    {
                                        self.sessionObject.sendInitialPassword(self.nameField.getRawValue(), function (response)
                                        {
                                            if (response.getReturnValue().getCode() !== 0)
                                            {
                                                showErrorWindow(self.forgotPassword, response.getReturnValue().getDescription());
                                            }
                                        },
                                        function ()
                                        {
                                            showErrorWindow(self.forgotPassword, self.languageObject.getString("errorSendInitialPassword"));
                                        });
                                    }
                                    else
                                    {
                                        showErrorWindow(self.forgotPassword, self.languageObject.getString('enterYourName'));
                                    }
                                }
                            }
                        }
                    });

                    event.add(self.forgotPassword);
                }
            }

        }));


        this.show();
        setTimeout(function ()
        {
            var focusTarget = self.nameField;
            if (isValidString(userName))
            {
                focusTarget = self.passwordField;
            }
            if (isValidString(self.passwordField.getValue()))
            {
                focusTarget = self.logInButton;
            }

            focusTarget.focus();
        }, 250);
    },

    getAvatarImage: function ()
    {
        return LOCAL_STORAGE.getItem('LogInPicture') || this.getAvatarDefaultImage();
    },

    getAvatarDefaultImage: function ()
    {
        return '../Shared/Images/profile.png';
    },

    login: function (name, password, force)
    {
        if (isValid(this.sessionObject, 'loginForMailProcessing'))
        {
            this.sessionObject.loginForMailProcessing(undefined, name, password, force);
        }
        else
        {
            var loginOptions = this.getLoginOptions();
            this.sessionObject.login(force, name, password, false, undefined, undefined, loginOptions);
        }
    },

    getLoginOptions: function ()
    {
        return undefined;
    },

    createContainer: function ()
    {
        return new Ext.Container({
            margin: '0 10',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            flex: 1
        });
    },

    setError: function (text)
    {
        if (isValid(this.capsLockTooltip))
        {
            this.capsLockTooltip.hide();
        }
        
        this.capsLockTooltip = Ext.create('Ext.tip.ToolTip',
        {
            cls: 'capsLockTooltip',
            autoHide: false,
            trackMouse: false,
            anchor: 'top',
            defaultAlign: 'bc-tc',
            listeners:
            {
                beforeshow: function (tip)
                {
                    tip.setHtml(text);
                }
            }
        });

        if (isValidString(text))
        {
            this.capsLockTooltip.showBy(this.passwordField);
        }
    },

    getInitialParameterArray: function () {
        if (!this.initialParameterArray)
        {
            if (isValidString(window.location.search))
            {
                this.initialParameterArray = this.URLToArray(window.location.search, '?');
            }
            else
            {
                //abwärtskompatibilität: wenn das jemand mit einem alten CTI-Client macht
                this.initialParameterArray = this.URLToArray(window.location.hash, '#');
            }
            
        }
        return this.initialParameterArray;
        
    },
    URLToArray: function (url, separationChar) {
        var request = {};
        var pairs = url.substring(url.indexOf(separationChar) + 1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            if (!pairs[i]) {
                continue;
            }
            var pair = pairs[i].split('=');
            if (pair.length === 2) {
                request[decodeURIComponent(pair[0]).toLowerCase()] = decodeURIComponent(pair[1]);
            } else if (pair.length === 1) {
                request[decodeURIComponent(pair[0]).toLowerCase()] = decodeURIComponent(pair[0]);
            }
        }
        return request;
    },

    destroy: function ()
    {
        if (this.foto)
        {
            this.foto.destroy();
        }
        if (this.capsLockTooltip)
        {
            this.capsLockTooltip.destroy();
        }
        SESSION.removeListener(this);
        this.callParent();
    }
});