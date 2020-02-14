Ext.define('NewMessageDialogForBlackBoards',
{
    extend: 'ModalDialog',
    maxWidth: undefined,
    
    initComponent: function ()
    {
        var widthDateFields = 125;

        this.titleText = LANGUAGE.getString("newMessage");
        this.callParent();

        this.setMaxHeight(window.innerHeight - 75);

        var self = this;

        this.titleField = this.createChatInputTitleField();
        this.textBox = new GrowableTextArea({
            oneRow: false,
            emptyText: LANGUAGE.getString('text'),
            growMax: window.innerHeight - 425,
            margin: '10 0 0 0'
        });

        this.sendButton = this.addButton(this.createChatInputSendButton());

        this.nowRadioButton = new Ext.form.field.Radio(
        {
            boxLabel: LANGUAGE.getString("now"),
            checked: true,
            name: 'nowOrLater'
        });

        var startDate = new Date();
        startDate.setHours(startDate.getHours() + 1);
        startDate.setMinutes(0);
        startDate.setSeconds(0);
        startDate.setMilliseconds(0);

        this.startDateField = new Ext.form.field.Date(
        {
            margin: '3 0 0 0',
            value: startDate,
            width: widthDateFields
        });
        
        this.startTimeField = new Ext.form.field.Time({
            margin: '3 0 0 0',
            value: startDate,
            formatText: '',
            flex: 1,
            increment: 60
        });

        this.laterRadioButton = new Ext.form.field.Radio(
        {
            name: 'nowOrLater'
        });

        var laterContainer = new Ext.Container(
        {
            layout: 
            {
                type: 'hbox'
            },

            items:
            [
                this.laterRadioButton,
                Ext.create('Ext.form.Label',
                {
                    margin: '4 15 0 10',
                    style: '',
                    text: LANGUAGE.getString("at").toLowerCase(),
                    width: 20
                }),
                this.startDateField,
                Ext.create('Ext.form.Label',
                {
                    margin: '4 5 0 5',
                    style: 'text-align:center',
                    text: LANGUAGE.getString("around").toLowerCase(),
                    width: 25
                }),
                this.startTimeField
            ],

            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        self.laterRadioButton.setValue(true);
                    }
                }
            }
        });
        

        this.neverEndingRadioButton = new Ext.form.field.Radio(
        {
            boxLabel: LANGUAGE.getString("never"),
            name: 'ending',
            checked: true
        });

        this.endsInDaysRadioButton = new Ext.form.field.Radio(
        {
            name: 'ending'
        });

        this.numberOfDaysField = Ext.create('Ext.form.field.Number',
        {
            margin: '3 0 0 0',
            value: 7,
            minValue: 1,
            maxValue: 999,
            width: widthDateFields,
            listeners:
            {
                boxready: function(field)
                {
                    //Her ganze Heckmeck machen wir nur, damit das "Tage" in dem Eingabefeld auftaucht
                    field.inputEl.setWidth(21);

                    field.inputWrap.dom.style.display = 'flex';
                    field.daysLabel = field.inputWrap.createChild(
                    {
                        tag: 'div',
                        html: field.createHTMLForDaysLabel()
                    });

                    field.daysLabel.dom.style.margin = '3px 0 0 0';
                    field.daysLabel.dom.style.cursor = 'default';
                    field.daysLabel.dom.style.flex = "1";
                    
                    field.daysLabel.dom.onclick = function ()
                    {
                        field.focus();
                    };
                },

                change: function(field)
                {
                    field.daysLabel.setHtml(field.createHTMLForDaysLabel());

                    var metrics = new Ext.util.TextMetrics(field.el);
                    var width = metrics.getWidth(field.getValue());
                    field.inputEl.setWidth(width + 14);

                    field.setBorderColorOfDayLabel(COLOR_BORDER_FOCUS); //ist deswegen nötig: wenn man mit der Maus auf den Pfeil nach unten/oben klickt, dann ist der border-bottom von dayLabel wieder grau
                },

                blur: function (field)
                {
                    field.setBorderColorOfDayLabel(COLOR_BORDER);
                },

                focus: function (field)
                {
                    field.setBorderColorOfDayLabel(COLOR_BORDER_FOCUS);
                }
            },

            setBorderColorOfDayLabel: function (color)
            {
                var dayLabel = document.getElementsByClassName('dayLabel');
                if (dayLabel.length > 0)
                {
                    dayLabel = dayLabel[0];
                    dayLabel.style.borderColor = color;
                }
            },

            createHTMLForDaysLabel: function()
            {
                var numberDays = this.getValue();
                var result = LANGUAGE.getString(numberDays === 1 ? "day" : "days");
                return '<div class="dayLabel" style="padding-bottom:2px;border-bottom:' + FIELDS_BORDER_BOTTOM + '">' + result + '</div>';
            }
        });
                    
        var endsInDaysContainer = new Ext.Container(
        {
            layout:
            {
                type: 'hbox'
            },

            items:
            [
                this.endsInDaysRadioButton,
                Ext.create('Ext.form.Label',
                {
                    width: 20,
                    margin: '4 15 0 10',
                    text: LANGUAGE.getString('in')
                }),
                this.numberOfDaysField
            ],
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        self.endsInDaysRadioButton.setValue(true);
                    }
                }
            }
        });

        var endDate = new Date();
        endDate.setHours(endDate.getHours() + 1);
        endDate.setMinutes(0);
        endDate.setSeconds(0);
        endDate.setMilliseconds(0);
        endDate.setMonth(endDate.getMonth() + 1);
        this.endDateField = new Ext.form.field.Date(
        {
            margin: '3 0 0 0',
            value: endDate,
            width: widthDateFields
        });
           
        this.endTimeField = new Ext.form.field.Time(
        {
            margin: '3 0 0 0',
            value: endDate,
            formatText: '',
            flex: 1,
            increment: 60
        });

        this.endsAtDateRadioButton = new Ext.form.field.Radio(
        {
            name: 'ending'
        });

        var endsAtDateContainer = new Ext.Container(
        {
            layout:
            {
                type: 'hbox'
            },
            margin: '5 0 0 0',
            items:
            [
                this.endsAtDateRadioButton,
                Ext.create('Ext.form.Label',
                {
                    margin: '4 15 0 10',
                    text: LANGUAGE.getString("at").toLowerCase(),
                    width: 20
                }),
                this.endDateField,         
                Ext.create('Ext.form.Label',
                {
                    margin: '4 5 0 5',
                    style: 'text-align:center',
                    text: LANGUAGE.getString("around").toLowerCase(),
                    width: 25
                }),
                this.endTimeField
            ],
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        self.endsAtDateRadioButton.setValue(true);
                    }
                }
            }
        });


        this.optionsFieldSet = Ext.create('Ext.form.FieldSet',
        {
            margin: '10 0 0 0',
            flex: 1,
            border: false,
            title: LANGUAGE.getString("options"),
            padding: 0,
            collapsible: true,
            collapsed: true,
            items:
            [
                Ext.create('Ext.Container',
                {
                    layout:
                    {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items:
                    [
                        Ext.create('Ext.Container',
                        {
                            layout:
                            {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            flex: 1,
                            items:
                            [
                                Ext.create('Ext.Container',
                                {
                                    layout:
                                    {
                                        type: 'hbox',
                                        align: 'stretch'
                                    },
                                    flex: 1,
                                    items:
                                    [
                                        Ext.create('Ext.form.Label',
                                        {
                                            width: 90,
                                            margin: '4 0 0 0',
                                            text: LANGUAGE.getString("released") + ":",
                                            style: 'color:' + COLOR_MAIN_2
                                        }),
                                        Ext.create('Ext.Container',
                                        {
                                            layout:
                                            {
                                                type: 'vbox',
                                                align: 'stretch'
                                            },
                                            flex: 1,
                                            items:
                                            [
                                                this.nowRadioButton,
                                                laterContainer
                                            ]
                                        })
                                    ]
                                }),
                                Ext.create('Ext.Container',
                                {
                                    margin: '10 0 0 0',
                                    layout:
                                    {
                                        type: 'hbox',
                                        align: 'stretch'
                                    },
                                    flex: 1,
                                    items:
                                    [
                                        Ext.create('Ext.form.Label',
                                        {
                                            width: 90,
                                            margin: '4 0 0 0',
                                            text: LANGUAGE.getString("ending") + ":",
                                            style: 'color:' + COLOR_MAIN_2
                                        }),
                                        Ext.create('Ext.Container',
                                        {
                                            layout:
                                            {
                                                type: 'vbox',
                                                align: 'stretch'
                                            },
                                            flex: 1,
                                            items:
                                            [
                                                this.neverEndingRadioButton,
                                                endsInDaysContainer,
                                                endsAtDateContainer
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        this.optionsContainer = Ext.create('Ext.Container',
        {
            layout: 'hbox',
            items:
            [
                this.optionsFieldSet
            ]
        });


        this.addToBody(new Ext.Container(
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '0 0 10 0',
            items:
            [
                new Ext.Container(
                {
                    layout:
                    {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items:
                    [
                        this.titleField,
                        this.textBox,
                        this.optionsContainer
                    ]
                })
            ]
        }));
    },

    createCheckbox: function(text, listOfDependentFields)
    {
        return new Ext.form.field.Checkbox({
            width: 50,
            boxLabel: text,
            margin: '0 10 5 5',
            style: {
                color: NEW_GREY,
                'font-size': FONT_SIZE_SUBTITLE
            },
            checked: true,
            listeners:
            {
                change: function (checkbox, newValue)
                {
                    Ext.each(listOfDependentFields, function (field)
                    {
                        field.setDisabled(!newValue);
                    });
                }
            }
        });
    },

    focus: function()
    {
        var self = this;
        setTimeout(function ()
        {
            if (isValid(self.titleField))
            {
                self.titleField.focus();
            }
        }, 250);
    },

    sendCallback: function(title, text, validFrom, validTo)
    {

    },

    createChatInputTitleField: function ()
    {
        return Ext.create('Ext.form.field.Text',
        {
            emptyText: LANGUAGE.getString('title'),
            flex: 1,
            height: 32
        });
    },

    showError: function (text, errorLevel)
    {
        this.insert(1, Ext.create('ErrorMessageComponent',
        {
            margin: '10 20 0 20',
            errorMessageText: text,
            errorType: errorLevel || ErrorType.Warning,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    },

    createChatInputSendButton: function ()
    {
        var self = this;
        return new RoundThinButton(
        {
            cls: [HIGHLIGHTED_ROUND_THIN_BUTTON, ROUND_THIN_BUTTON],
            text: LANGUAGE.getString('publish').toUpperCase(),
            width: 158,
            scale: 'medium',
            listeners:
            {
                click: function ()
                {
                    var title = self.titleField.getRawValue();
                    var text = self.textBox.getRawValue();
                    if (!isValidString(title) && !isValidString(text))
                    {
                        self.showError(LANGUAGE.getString("enterTitleOrText"));
                        return;
                    }

                    var startDate = self.getStartDate();
                    var endDate = self.getEndDate();
                    if (isValid(endDate))
                    {
                        if (endDate < startDate)
                        {
                            self.showError(LANGUAGE.getString("endDateIsBeforeStartDate"));
                            return;
                        }
                        if (endDate < new Date())
                        {
                            self.showError(LANGUAGE.getString("endDateIsBeforeNow"));
                            return;
                        }
                    }
                    self.sendCallback(title, text, startDate, endDate);
                }
            },
            margin: '0 0 0 0'
        });
    },

    getStartDate: function()
    {
        var self = this;
        if (!this.optionsFieldSet.collapsed)
        {
            if(this.laterRadioButton.getValue())
            {
                if (!this.startDateField.isValid())
                {
                    self.showError(LANGUAGE.getString("dateIsInvalid"));
                    throw new Exception();
                }
                if (!this.startTimeField.isValid())
                {
                    self.showError(LANGUAGE.getString("timeIsInvalid"));
                    throw new Exception();
                }
                var startDate = this.startDateField.getValue();
                var startTime = this.startTimeField.getValue();
                this.addTimeToDate(startDate, startTime);
                return startDate;
            }
        }
        
        return null;
    },

    getEndDate: function()
    {
        if (!this.optionsFieldSet.collapsed)
        {
            if(this.endsInDaysRadioButton.getValue())
            {
                var numberDays = this.numberOfDaysField.getValue();
                if (numberDays <= 0)
                {
                    this.showError(LANGUAGE.getString("numberIsInvalid"));
                    throw new Exception();
                }
                var date = new Date();
                date.setDate(date.getDate() + numberDays);
                date.setHours(23);
                date.setMinutes(59);
                date.setSeconds(59);
                if (Ext.isNumber(date.getTime()))
                {
                    return date;
                }
                else
                {
                    this.showError(LANGUAGE.getString("numberIsInvalid"));
                    throw new Exception();
                }
            }
            else if (this.endsAtDateRadioButton.getValue())
            {
                if (!this.endDateField.isValid())
                {
                    this.showError(LANGUAGE.getString("dateIsInvalid"));
                    throw new Exception();
                }
                if (!this.endTimeField.isValid())
                {
                    this.showError(LANGUAGE.getString("timeIsInvalid"));
                    throw new Exception();
                }
                var endDate = this.endDateField.getValue();
                var endTime = this.endTimeField.getValue();
                this.addTimeToDate(endDate, endTime);
                return endDate;    
            }
        }
        return null;
    },

    addTimeToDate: function(date, time)
    {
        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());
        date.setSeconds(time.getSeconds());
    }
});