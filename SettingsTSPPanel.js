Ext.define('SettingsTSPPanel',
{
    extend: 'SettingsBasePanel',

    layout: {
        type: 'vbox',
    
    },
    padding: '5 5 5 10',

    title: 'TAPI',
    iconCls: 'phone',

    initComponent: function ()
    {
        this.title = LANGUAGE.getString('tspSettingsTitle');
        this.callParent();

        var self = this;

        this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString('tspSettingsLabel'),
                style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
                margin: '5 0 0 5'
            }));

        var url = window.location.origin + "/TSP/setup.exe";
        this.add(Ext.create('Ext.Component',
            {
                margin: '10 0 0 5',
                childEls: ['downloadButtonEl', 'activateButtonEl'],
                renderTpl: '<div style="display:flex;flex-direction:column">' +
                                '<div style="display:flex;"><div>1.</div>' + getHtmlCodeForDownloadLink(LANGUAGE.getString('tspDownloadText'), url, '0 0 0 5px') + '</div>' + 
                                '<div style="display:flex;margin-top:5px"><div>2.</div><div style="margin-left:5px">' + LANGUAGE.getString('tspInstallText') + '</div></div>' +
                                '<div style="display:flex;margin-top:5px"><div>3.</div>' + 
                                    '<div id="{id}-activateButtonEl" data-ref="activateButtonEl" style="margin-left:5px"></div>' +
                                '</div>' +
                        
                    '</div>',
                listeners:
                {
                    boxready: function (component)
                    {
                        new Link(
                        {
                            renderTo: component.activateButtonEl,
                            text: LANGUAGE.getString('tspActivateText'),
                            listeners:
                            {
                                el:
                                {
                                    click: function ()
                                    {
                                        var button = this;

                                        var message = {
                                            user: SESSION._name,
                                            pass: SESSION._password,
                                            URL: window.location.origin + "/scripts/ccf.dll/Proxy"
                                        };

                                        var messageListener = function (event)
                                        {
                                            if (!Ext.isString(event.data))
                                            {
                                                return;
                                            }
                                            try
                                            {
                                                var messageFromTSP = JSON.parse(event.data);
                                                if (messageFromTSP && messageFromTSP.command === "ActivationTSP")
                                                {
                                                    if (isValid(messageFromTSP, "result.result"))
                                                    {
                                                        var result = messageFromTSP.result.result;
                                                        if (result === 'ok')
                                                        {
                                                            self.showInfo(LANGUAGE.getString('activationTSPSuccess'));
                                                        }
                                                        else
                                                        {
                                                            self.showError(LANGUAGE.getString('activationTSPFailed'));
                                                            console.log("Activation TSP failed!", messageFromTSP);
                                                        }
                                                        window.removeEventListener('message', messageListener, false);
                                                    }
                                                }
                                            }
                                            catch (exception)
                                            {
                                                console.log(exception);
                                            }
                                            finally
                                            {
                                                openedWindow.close();
                                            }
                                        };
                                        window.addEventListener('message', messageListener, false);

                                        var openedWindow = window.open('http://localhost:55080/ProxyAuth?data=' + encodeURIComponent(JSON.stringify(message)));
                                        if (!openedWindow)
                                        {
                                            self.showError(LANGUAGE.getString('activationTSPFailed'));
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }));

        
    },
    showError: function (text)
    {
        this.showErrorMessage(text, ErrorType.Warning);
    },

    showInfo: function (text)
    {
        this.showErrorMessage(text, ErrorType.Info);
    },

    showErrorMessage: function (text, errorType)
    {
        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '5 5 10 5',
            errorMessageText: text,
            errorType: errorType,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    }
});