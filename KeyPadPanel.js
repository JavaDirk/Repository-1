Ext.define('KeyPadPanel',
{
    extend: 'Ext.Container',
    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    minWidth: 135,
    maxWidth: 175,
    flex: 1,
    tabIndex: 0,

    buttonBackgroundColor: 'transparent',

    initComponent: function ()
    {
        this.callParent();

        var buttonConfigs =
            [
                {
                    text: '1',
                    subtext: ''
                },
                {
                    text: '2',
                    subtext: ''
                },
                {
                    text: '3',
                    subtext: ''
                },
                {
                    text: '4',
                    subtext: ''
                },
                {
                    text: '5',
                    subtext: ''
                },
                {
                    text: '6',
                    subtext: ''
                },
                {
                    text: '7',
                    subtext: ''
                },
                {
                    text: '8',
                    subtext: ''
                },
                {
                    text: '9',
                    subtext: ''
                },
                {
                    text: '*',
                    subtext: ''
                },
                {
                    text: '0',
                    subtext: '+'
                },
                {
                    text: '#',
                    subtext: ''
                }
            ];
        this.buttons = [];
        var self = this;
        Ext.each(buttonConfigs, function (buttonConfig, index)
        {
            self.buttons[index] = self.createNumberButton(buttonConfig.text, buttonConfig.subtext);
        });

        this.createButtonLine([this.buttons[0], this.buttons[1], this.buttons[2]]);
        this.createButtonLine([this.buttons[3], this.buttons[4], this.buttons[5]], 10);
        this.createButtonLine([this.buttons[6], this.buttons[7], this.buttons[8]], 10);
        this.createButtonLine([this.buttons[9], this.buttons[10], this.buttons[11]], 10);

        this.on(
        {
            el:
            {
                keydown: function (event)
                {
                    var text;
                    if (event.keyCode >= 48 && event.keyCode <= 57 && event.shiftKey === false)
                    {
                        text = String(event.keyCode - 48);
                    }

                    if (event.keyCode >= 96 && event.keyCode <= 105 && event.shiftKey === false)
                    {
                        text = String(event.keyCode - 96);
                    }

                    if (event.keyCode === 191 && event.shiftKey === false)
                    {
                        text = '#';
                    }

                    if (event.keyCode === 106 || (event.keyCode === 187 && event.shiftKey === true))
                    {
                        text = '*';
                    }
                    if (isValid(text))
                    {
                        self.keyCallback(text);
                        Ext.each(self.buttons, function (button)
                        {
                            if (button.text === text)
                            {
                                button.el.highlight(COLOR_MAIN_2, {duration: 250});
                            }
                        });
                    }
                }
            }
        });
    },

    focus: function ()
    {
        this.buttons[0].focus(); //einen Container kann man nicht fokussieren; durch den Fokus auf den ersten Button funktioniert dann aber das keyDown-Event auf den Container
    },

    removeAllCallButtons: function ()
    {
        if (!isValid(this.callButtonsContainer))
        {
            return;
        }
        this.callButtonsContainer.removeAll();
    },

    addCallButtonLine: function (button)
    {
        this.remove(this.callButtonsContainer);
        this.callButtonsContainer = this.createButtonLine([button], 20);
        return this.callButtonsContainer;
    },

    addAdditionalCallButtonLine: function (button, marginTop)
    {
        this.createButtonLine([button], marginTop);
    },

    createButtonLine: function (buttons, marginTop)
    {
        marginTop = marginTop || '0';
        var container = this.add(Ext.create('Ext.Container',
        {
            margin: marginTop + ' 0 0 0',
            layout:
            {
                type: 'hbox',
                align: 'stretch',
                pack: 'center'
            },
            flex: 1
        }));
        Ext.each(buttons, function (button, index)
        {
            if (index !== 0)
            {
                container.add(Ext.create('Ext.Component', { flex: 1 }));
            }
            container.add(button);
        });
        return container;
    },
    
    createNumberButton : function (text, subtext)
    {
        var self = this;

        var buttonText = text;
        if (isValidString(subtext))
        {
            buttonText = '<div style="display:flex;flex-direction:column;align-items:center"><div style="line-height:13px;margin-top:10px">' + text + '</div><div style="font-size:13px;"> ' + subtext + '</div></div>';
        }
        return Ext.create('CallButton',
        {
            margin: 0,
            text: buttonText,
            fontSize: 20,

            backgroundColor: COLOR_DIAL_NUMBER_BUTTON,
            backgroundColorOnHover: COLOR_DIAL_NUMBER_BUTTON_ON_HOVER,
            color: COLOR_DIAL_NUMBER_BUTTON_TEXT,
            colorOnHover: COLOR_DIAL_NUMBER_BUTTON_TEXT_ON_HOVER,
            borderColor: COLOR_DIAL_NUMBER_BUTTON,
            borderColorOnHover: COLOR_DIAL_NUMBER_BUTTON,

            listeners:
            {
                el:
                {
                    mouseup: function ()
                    {
                        clearTimeout(this.mouseDownTimer);
                        if (!this.ignoreNextMouseUp)
                        {
                            self.keyCallback(text);
                        }
                        this.ignoreNextMouseUp = false;
                    },
                    mousedown: function ()
                    {
                        this.mouseDownTimer = setTimeout(() =>
                        {
                            self.keyCallback(subtext);
                            this.ignoreNextMouseUp = true;
                        }, 500);
                    }
                }
            }
        });
    }
});