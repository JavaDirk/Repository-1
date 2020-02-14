var ErrorType =
{
    Info: { cls: 'info', backgroundColor: INFO_BACKGROUND_COLOR, color: INFO_COLOR, iconColor: DARKEST_BLUE.createLighter(0.15), iconName: 'info' },
    Warning: { cls: 'warning', backgroundColor: WARNING_BACKGROUND_COLOR, color: WARNING_COLOR, iconColor: BROWN, iconName: 'warning' },
    Error: { cls: 'error', backgroundColor: ERROR_BACKGROUND_COLOR, color: ERROR_COLOR, iconColor: RED, iconName: 'warning' }
};

Ext.define('ErrorMessageComponent',
{
    extend: 'Ext.Component',
    
    padding: '3 15 13 15', //kein padding-top von 10, dafür hat jedes child nen margin-top von 10? Das liegt daran, dass im Fall, dass das flex-wrap zuschlägt, die children einen Abstand haben sollen

    errorMessageText: "",

    errorType: ErrorType.Warning,

    borderWidth: 0,

    showCloseButton: true,

    childEls: ['iconEl', 'textEl', 'buttonsEl', 'closeEl'],
    initComponent: function ()
    {
        this.style = this.style || {};
        this.style.opacity = 0;
        this.style.border = this.borderWidth + "px solid";
        Ext.apply(this.style, this.errorType);

        this.renderTpl = ['<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between">',
                            '<div style="display:flex;margin-top:10px;margin-right:25px">',
                                '<img id="{id}-iconEl" data-ref="iconEl" src="' + IMAGE_LIBRARY.getImage(this.style.iconName, 64, this.style.iconColor) + '" width="16px" height="16px" style="margin:2px 10px 0 0"></img>',
                                '<div id="{id}-textEl" data-ref="textEl" style="color:' + this.style.color + ';background-color:' + this.style.backgroundColor + ';font-weight:600;word-wrap:break-word;flex:1">' + this.errorMessageText + '</div>',
                            '</div > ',
                            '<div id="{id}-buttonsEl" data-ref="buttonsEl" style="display:flex;justify-content:flex-end;align-self:center;margin-top:10px"></div>',
                            '<div id="{id}-closeEl" data-ref="closeEl" class="closeButtonForErrorMessage" style="display:none;border-radius:100%;margin:11px 0 0 10px;background-image:url(' + IMAGE_LIBRARY.getImage("remove", 64, this.style.iconColor) + '); width:16px;height:16px;background-size:contain;cursor:pointer"></div>',
                        '</div>'];

        this.callParent();

        this.on('boxready', () =>
        {
            this.onBoxReady();
        }, this);
        
        if (this.timeoutInSeconds)
        {
            setTimeout(() =>
            {
                if (this.ownerCt)
                {
                    this.removeFromParent();
                }
            }, this.timeoutInSeconds * 1000);
        }

    },

    onBoxReady: function ()
    {
        requestAnimationFrame(() =>
        {
            if (this.el)
            {
                this.el.animate({ to: { opacity: 1 }, duration: 350 });
            }
        });

        this.closeEl.dom.onclick = () =>
        {
            this.removeFromParent();
        };

        if (this.showCloseButton)
        {
            this.closeEl.dom.style.display = 'flex';
        }

        Ext.each(this.buttonConfigs, function (buttonConfig)
        {
            buttonConfig.renderTo = this.buttonsEl;
            new Ext.Button(buttonConfig);
        }, this);
    },

    removeFromParent: function ()
    {
        requestAnimationFrame(() =>
        {
            if (!this.isStateOk())
            {
                return;
            }
            this.el.animate({
                to:
                {
                    opacity: 0
                },
                duration: 250,
                listeners:
                {
                    afteranimate: () =>
                    {
                        if (this.ownerCt && !this.ownerCt.isDestroyed)
                        {
                            this.ownerCt.remove(this);
                        }
                    }
                }
            });
        });
    },

    addButton: function (text, callback, style)
    {
        var buttonConfig = {
            text: text,
            style: style,
            cls: 'errorMessageComponentButton ' + this.errorType.cls,
            listeners: {
                click: () =>
                {
                    this.removeFromParent();
                    callback();
                }
            }
        };
        if (this.rendered)
        {
            buttonConfig.renderTo = this.buttonsEl;
            return new Ext.Button(buttonConfig);
        }
        else
        {
            this.buttonConfigs = this.buttonConfigs || [];
            this.buttonConfigs.push(buttonConfig);
        }
    },

    setErrorType: function (newErrorType)
    {
        this.errorType = newErrorType;

        this.style = this.style || {};
        Ext.apply(this.style, this.errorType);

        this.setStyle(this.style);

        this.iconEl.dom.src = IMAGE_LIBRARY.getImage(this.style.iconName, 64, this.style.iconColor);

        this.textEl.dom.style.color = this.style.color;
        this.textEl.dom.style.backgroundColor = this.style.backgroundColor;
        
        this.closeEl.dom.src = IMAGE_LIBRARY.getImage('remove', 64, this.style.iconColor);
    },

    setText: function (text)
    {
        if (!this.isStateOk())
        {
            return;
        }
        this.errorMessageText = text;
        this.textEl.setText(text);
    },

    setHtml: function (html)
    {
        if (!this.isStateOk())
        {
            return;
        }
        this.errorMessageText = html;
        this.textEl.setHtml(html);
    }
});

Ext.define('ErrorMessageComponentForDialogs',
    {
        extend: 'ErrorMessageComponent',

        padding: 0,
        margin: '20 0 20 0',

        borderWidth: 1,
        showCloseButton: false,                

        initComponent: function ()
        {
            this.callParent();

            var me = this;

            this.on('boxready', () =>
            {
                this.textBox = new Ext.Component(
                {
                    renderTo: this.el,
                    height: 0,
                    width: 0,
                    border: false,
                    padding: 0,
                    html: '<input style="height:0;width:0;padding:0;border:none;">',
                    listeners:
                    {
                        boxready: function (self)
                        {
                            me.inputBox = self.el.dom.querySelector(' input');

                            me.inputBox.addEventListener('blur', function ()
                            {
                                me.hide();
                            });
                        }
                    }
                });
            });
        },

        focusInput: function ()
        {
            setTimeout(() =>
            {
                if (this.inputBox)
                {
                    this.inputBox.focus();
                }
            }, 100);
        }
    });

Ext.define('ConfirmationComponent',
{
    extend: 'ErrorMessageComponent',

    yesCallback: null,
    noCallback: null,
    cancelCallback: null,
    showCloseButton: false,
    checkboxConfig: null,

    initComponent: function()
    {
        this.callParent();
        this.yesButtonText = this.yesButtonText || LANGUAGE.getString('yes');
        this.noButtonText = this.noButtonText || LANGUAGE.getString('no');
        this.cancelButtonText = this.cancelButtonText || LANGUAGE.getString('cancel');

        var buttonStyle = 'min-width:100px;color: ' + this.style.backgroundColor + ';border:none;margin-left:5px';

        if (this.yesCallback)
        {
            this.addButton(this.yesButtonText, this.yesCallback, buttonStyle);
        }

        if (this.noCallback)
        {
            this.addButton(this.noButtonText, this.noCallback, buttonStyle);
        }

        if (this.cancelCallback)
        {
            this.addButton(this.cancelButtonText, this.cancelCallback, buttonStyle);
        }
        
    }
    });

Ext.define('ConfirmationComponentWithCheckbox',
{
    extend: 'ConfirmationComponent',

    checkBoxText: '',
    checkBoxClientSettingsKey: '',

    initComponent: function ()
    {
        this.callParent();

        this.addCheckBox(this.checkBoxText, this.checkBoxCallback, '');
    },

    addCheckBox: function (text, callback, style)
    {
        var config = {
            boxLabel: text,
            style: style,
            margin: '0 25 0 0',
            cls: 'errorMessageComponentButton ' + this.errorType.cls
        };

        if (this.rendered)
        {
            config.renderTo = this.buttonsEl;
            this.checkBox = new Ext.form.field.Checkbox(config);
        }
        else
        {
            this.checkBoxConfig = config;
        }
    },

    onBoxReady: function ()
    {
        if (isValid(this.checkBoxConfig))
        {
            this.checkBoxConfig.renderTo = this.buttonsEl;
            this.checkBox = new Ext.form.field.Checkbox(this.checkBoxConfig);
        }
        this.callParent();
    },

    getCheckBoxValue: function ()
    {
        return this.checkBox.getValue();
    },

    removeFromParent: function ()
    {
        this.callParent();

        if (this.getCheckBoxValue())
        {
            CLIENT_SETTINGS.addSetting("GENERAL", this.checkBoxClientSettingsKey, true);
            CLIENT_SETTINGS.saveSettings();
        }
    }
});