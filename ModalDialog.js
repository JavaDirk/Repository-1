var BORDER_RADIUS_MODAL_DIALOG = '7px';
var BORDER_RADIUS_MODAL_DIALOG_HACK = '9px';

var MODAL_DIALOG_WIDTH = 475;
var MODAL_DIALOG_BODY_PADDING = 20;

Ext.define('ModalDialog',
    {
        extend: 'DialogWithArrow',
        
        cls: 'modalDialog',
        
        style:
        {
            'background-color': COLOR_DIALOG_BACKGROUND,
            opacity: 0,
            'border-top-left-radius': BORDER_RADIUS_MODAL_DIALOG_HACK,   // der Header hat auch einen border-radius. Wenn wir den gleich halten, sieht man ein paar weiße Pixel an den abgerundeten
            'border-top-right-radius': BORDER_RADIUS_MODAL_DIALOG_HACK,  // Ecken. Deswegen hier 2 Pixel mehr, dann sieht man nur noch den border-radius des Headers (wenn man dem Header keinen radius gibt, erhält man eckige Ecken *eyesRoll*)
            'border-bottom-left-radius': BORDER_RADIUS_MODAL_DIALOG,
            'border-bottom-right-radius': BORDER_RADIUS_MODAL_DIALOG
        },
        layout:
        {
            type: 'vbox',
            align: 'stretch'
        },
        showCloseButton: false,
        defaultAlign: 'c-c',
        padding: 0,
        margin: 0,

        addErrorMessageRow: true,

        listeners:
        {
            boxready: function (self)
            {
                // Muss so umgesetzt werden, da sich das padding und margin sonst immer wieder überschreibt
                var body = document.querySelector('#' + self.getId() + ' .x-tip-body');
                body.style.padding = '0';
                body.style.margin = 0;

                // InnerCt bekommt ein margin von 5 -> die Breite passt nicht mehr und muss angepasst werden
                var innerBody = document.querySelector('#' + self.getId() + ' .x-box-inner');
                innerBody.style.padding = '0';
                innerBody.style.margin = 0;
                innerBody.style.width = body.style.width;

                // Die Breiten von header body und Button-Container passt auch nicht mehr
                var headerContainer = document.getElementById(self.headerContainer.getId());
                headerContainer.style.width = body.style.width;

                var bodyContainer = document.getElementById(self.bodyContainer.getId());
                bodyContainer.style.width = body.style.width;

                var buttonContainer = document.getElementById(self.buttonContainer.getId());
                buttonContainer.style.width = body.style.width;

                var messageDialog = document.getElementById(self.messageDialog.getId());
                messageDialog.style.width = body.style.width;

                self.messageDialog.hide();
            },

            hide: function (me)
            {
                me.destroy();
            }
        },

        initComponent: function ()
        {
            this.callParent();

            this.target = VIEWPORT;

            this.headerContainer = this.add(new Ext.Container(
            {
                layout:
                {
                    type: 'hbox'
                },
                style:
                {
                    'background-color': COLOR_HEADER_BAR,
                    'padding-bottom': '20px',
                    'border-top-left-radius': BORDER_RADIUS_MODAL_DIALOG,
                    'border-top-right-radius': BORDER_RADIUS_MODAL_DIALOG
                }
            }));

            this.headerContainer.add(Ext.create('Label',
            {
                margin: '20 0 0 0',
                padding: '0 0 0 20',
                text: this.titleText,
                fontSize: 21,
                weight: '400',
                color: WHITE,
                flex: 1
            }));
            
            this.headerContainer.add(Ext.create('Ext.Img',
                {
                    src: IMAGE_LIBRARY.getImage("delete", 64, WHITE),
                    style: 'cursor:pointer',
                    height: 24,
                    width: 24,
                    margin: '24 15 0 15',
                    listeners:
                    {
                        el:
                        {
                            click: function ()
                            {
                                self.hide();
                            }
                        }
                    }
                }));

            this.messageDialog = this.add(new ErrorMessageComponentForDialogs(
                {
                    padding: '0 10 10 10',
                    margin: '20 20 5 20'
                }));
            /*
            if (this.addErrorMessageRow)
            {
                this.add(this.messageDialog);
            }*/

            this.bodyContainer = this.add(new Ext.Container(
            {
                padding: '0 ' + MODAL_DIALOG_BODY_PADDING,
                margin: '15 0 0 0',
                style: 'border-bottom:1px solid ' + BORDER_GREY,
                layout:
                    {
                    type: 'vbox',
                    //pack: 'center',
                    align: 'stretch'
                },
                flex:1,
                listeners:
                {
                    boxready: () =>
                    {
                        this.makeSubElementsBigger();
                    }
                }
            }));

            this.buttonContainer = this.add(new Ext.Container({
                margin: '20 20 15 20',
                layout: {
                    pack: 'end',
                    align: 'stretch',
                    type: 'hbox'
                }
            }));

            var self = this;
            
            this.on('boxready', function ()
            {
                if (isValid(self, "zIndexManager.mask.el"))
                {
                    if (!isValid(self.zIndexManager.mask.numberModalDialogs) || self.zIndexManager.mask.numberModalDialogs === 0)
                    {
                        self.zIndexManager.mask.el.setStyle({ 'background-color': 'black', opacity: 0 });
                        self.zIndexManager.mask.el.animate(
                        {
                            from:
                            {
                                opacity: 0
                            },
                            to:
                            {
                                opacity: 0.5
                            },
                            duration: 300
                        });
                        self.zIndexManager.mask.numberModalDialogs = 0;
                    }
                    self.zIndexManager.mask.numberModalDialogs++;
                }
            });

            this.setWidth(Math.min(MODAL_DIALOG_WIDTH, window.innerWidth - 10));
        },

        addButton: function (buttonConfig)
        {
            if (isValid(buttonConfig.xtype))
            {
                return this.buttonContainer.add(buttonConfig);
            }
            else
            {
                if (!buttonConfig.minWidth)
                {
                    buttonConfig.minWidth = MIN_WIDTH_BUTTON;
                }
                if (!buttonConfig.scale)
                {
                    buttonConfig.scale = 'medium';
                }
                if (buttonConfig.text)
                {
                    buttonConfig.text = buttonConfig.text.toUpperCase();
                }

                if (!buttonConfig.style)
                {
                    buttonConfig.style = {};
                }
                if (!buttonConfig.style.backgroundColor)
                {
                    buttonConfig.style.backgroundColor = COLOR_MAIN_2;
                }
                if (!buttonConfig.style.borderColor)
                {
                    buttonConfig.style.borderColor = COLOR_MAIN_2;
                }
                if (!buttonConfig.color)
                {
                    buttonConfig.color = WHITE;
                }
                if (!buttonConfig.cls)
                {
                    buttonConfig.cls = [HIGHLIGHTED_ROUND_THIN_BUTTON, ROUND_THIN_BUTTON];
                }

                var button = new RoundThinButton(buttonConfig);

                return this.buttonContainer.add(button);
            }
        },
        

        addToBody: function (element)
        {
            return this.bodyContainer.add(element);
        },

        clearBody: function ()
        {
            this.bodyContainer.removeAll();
        },

        changeErrorMessage: function (message, newErrorType)
        {
            newErrorType = newErrorType || ErrorType.Warning;
            this.messageDialog.setErrorType(newErrorType);
            
            if (isValidString(message))
            {
                this.messageDialog.setText(message);
                this.messageDialog.show();

                this.messageDialog.focusInput();
            }
            else 
            {
                this.messageDialog.hide();
            }
        },
       
        showAnimationForAppearing: function ()
        {
            this.el.animate(
            {
                from:
                {
                    opacity: 0,
                    y: window.innerHeight - this.getHeight()
                },
                to:
                {
                    opacity: 1,
                    y: (window.innerHeight - this.getHeight()) / 2
                },
                duration: 250
            });
        },

        showAnimationForDisappearing: function (callbackAfterAnimation)
        {
            this.el.animate(
            {
                from:
                {
                        
                },
                to:
                {
                    y: window.innerHeight + 10
                },
                duration: 250,
                listeners:
                {
                    afterAnimate: function ()
                    {
                        callbackAfterAnimation();
                    }
                }
            });
        },

        makeSubElementsBigger: function ()
        {
            var self = this;

            var inputBoxes = document.querySelectorAll('#' + self.getId() + ' input:not(.doNotResize)');

            Ext.iterate(inputBoxes, function (inputBox)
            {
                if (inputBox.clientHeight <= 0 || inputBox.type === 'checkbox')
                {
                    return;
                }

                inputBox.style.height = inputBox.className.indexOf('x-form-cb-input') >= 0 ? '30px' : '36px';
                inputBox.style.fontSize = FONT_SIZE_MODAL_DIALOG + 'px';
                inputBox.style.paddingLeft = inputBox.style.paddingLeft || '10px';
                inputBox.style.paddingRight = inputBox.style.paddingRight || '10px';

                var extjsField = Ext.get(inputBox).up('.x-field.x-form-item');
                if (extjsField)
                {
                    extjsField = Ext.getCmp(extjsField.dom.id);
                }
                if (extjsField)
                {
                    extjsField.on('expand', function () //Fall: extjsField ist eine ComboBox
                    {
                        var searchListItems = document.querySelectorAll("#" + extjsField.picker.el.dom.id + " li");

                        Ext.iterate(searchListItems, function (searchListItem)
                        {
                            searchListItem.style.fontSize = FONT_SIZE_MODAL_DIALOG + 'px';
                        });
                    });

                    var triggerItem = document.querySelector('#' + extjsField.id + ' .clear-trigger-default');

                    if (triggerItem)
                    {
                        triggerItem.style.backgroundSize = '16px 16px';
                        triggerItem.style.backgroundPosition = 'center';

                        triggerItem.parentNode.style.paddingRight = '3px';
                    }

                    var selectItem = document.querySelector('#' + extjsField.id + ' .x-form-arrow-trigger');

                    if (selectItem)
                    {
                        selectItem.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage('arrow_down', 64, DARKER_GREY) + ')';
                        selectItem.style.backgroundSize = '16px 16px';
                        selectItem.style.backgroundPosition = 'center';
                        selectItem.style.marginLeft = '10px';
                        selectItem.style.width = '32px';
                    }
                }

            }, self);

            var textareas = document.querySelectorAll('#' + self.getId() + ' textarea');

            Ext.iterate(textareas, function (textarea)
            {
                textarea.style.fontSize = FONT_SIZE_MODAL_DIALOG + 'px';
                textarea.style.paddingLeft = '10px';
                textarea.style.paddingRight = '10px';
                textarea.style.paddingTop = '10px';
            });

            var aTags = document.querySelectorAll('#' + self.getId() + ' a:not(.x-tab):not(.x-btn)');

            Ext.iterate(aTags, function (aTag)
            {
                aTag.style.width = '36px';
            });

            var selectBoxes = document.querySelectorAll('#' + self.getId() + ' select');

            Ext.iterate(selectBoxes, function (selectBox)
            {
                selectBox.style.height = '38px';
                selectBox.style.fontSize = FONT_SIZE_MODAL_DIALOG + 'px';
                selectBox.style.textAlign = 'center';
            });

            var labels = document.querySelectorAll('#' + self.getId() + ' label:not(.doNotResize)');
            Ext.iterate(labels, function (label)
            {
                var fieldsets = Ext.get(label).up('.x-fieldset');
                if (!fieldsets || fieldsets.length === 0)
                {
                    label.style.height = '30px';
                }

                if (!isValidString(label.style.fontSize) || parseInt(label.style.fontSize, 10) < 16)
                {
                    label.style.fontSize = FONT_SIZE_MODAL_DIALOG + 'px';
                }
                if (!label.style.marginLeft)
                {
                    label.style.marginLeft = "5px";
                }

            });

            var selectors = [' .x-form-radio-default', ' .x-form-checkbox-default'];
            Ext.each(selectors, function (selector)
            {
                var buttons = document.querySelectorAll('#' + self.getId() + selector + ':not(.doNotResize)');
                Ext.each(buttons, function (button)
                {
                    button.style.marginTop = "7px";
                });
            });


            var addressBookSelectorButton = document.querySelectorAll('#' + self.getId() + ' .addressBookSelectorButton');
            Ext.each(addressBookSelectorButton, function (button)
            {
                button.style.height = "36px";
            });

            var headings = document.querySelectorAll('#' + self.getId() + ' .settingsSubTitle div');

            Ext.iterate(headings, function (heading)
            {
                heading.style.fontSize = FONT_SIZE_MODAL_DIALOG + "px";
            });

            var tabButtons = document.querySelectorAll('#' + self.getId() + ' span.x-tab-inner.x-tab-inner-default');

            Ext.iterate(tabButtons, function (tabButton)
            {
                tabButton.style.fontSize = FONT_SIZE_MODAL_DIALOG + "px";
                tabButton.style.lineHeight = "normal";
            });


            self.setMinHeight(150);
        },

        destroy: function ()
        {
            if (isValid(this, "zIndexManager.mask"))
            {
                if (this.zIndexManager.mask.numberModalDialogs === 1)
                {
                    this.zIndexManager.mask.el.setStyle({ opacity: 0 });
                }
                this.zIndexManager.mask.numberModalDialogs--;
            }
            this.callParent();
        }
});