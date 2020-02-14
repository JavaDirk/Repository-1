Ext.define('PresenceStateConfiguration', {
    extend: 'ModalDialog',
    
    maxWidth: undefined,
    height: 700,
    dataObject: {},
    successCallBack: function () { },
    
    initComponent: function ()
    {
        if (window.innerWidth > 550)
        {
            this.width = 525;
        }
            
        this.titleText = LANGUAGE.getString("presenceSettings");
        
        var me = this;
        this.callParent();

        
        var selectedState = MY_CONTACT.getPresenceStateWithoutOnPhone() - 1;

        if (selectedState < 0 || selectedState > 3)
        {
            selectedState = 0;
        }

        this.tabPanel = Ext.create('Ext.tab.Panel', {
            margin: '0 0 25 0',
            flex: 1,
            activeTab: selectedState,
            deferredRender: false,
            items: [
                {
                    title: this.createPresenceStateBatch(this.dataObject[0].presenceState, 40, 1) + ' ' + LANGUAGE.getString("available"),
                    bodyPadding: 10,
                    items: [this.p0 = this.getPanelContent(0)],
                    scrollable: 'vertical'
                },
                {
                    title: this.createPresenceStateBatch(this.dataObject[1].presenceState, 40, 1) + ' ' + LANGUAGE.getString("absent"),
                    bodyPadding: 10,
                    items: [this.p1 = this.getPanelContent(1)],
                    scrollable: 'vertical'
                },
                {
                    title: this.createPresenceStateBatch(this.dataObject[2].presenceState, 40, 1) + ' ' + LANGUAGE.getString("break"),
                    bodyPadding: 10,
                    items: [this.p2 = this.getPanelContent(2)],
                    scrollable: 'vertical'
                },
                {
                    title: this.createPresenceStateBatch(this.dataObject[3].presenceState, 40, 1) + ' ' + LANGUAGE.getString("notDisturb"),
                    bodyPadding: 10,
                    items: [this.p3 = this.getPanelContent(3)],
                    scrollable: 'vertical'
                }
            ],
            //renderTo: Ext.getBody()
        });

        this.addToBody(this.tabPanel);

        this.addButton({
            text: LANGUAGE.getString("save"),
            listeners: {
                click: function (button)
                {
                    var result = [me.p0.getResult(), me.p1.getResult(), me.p2.getResult(), me.p3.getResult(), me.dataObject[4]];
                    var phoneCorrect = true;
                    for (var i = 0; i < result.length; i++)
                    {
                        phoneCorrect = phoneCorrect && ((result[i].selectedItem == 2 && !isPhoneNumber(result[i].phoneNumber)) ? false : true);
                    }
                    if (!(result[0] === false || result[1] === false || result[2] === false || result[3] === false) && phoneCorrect)
                    {
                        me.successCallBack(result);
                    } else
                    {
                        me.changeErrorMessage(LANGUAGE.getString("stateChangeNumberError"));
                    }

                }
            }
        });
        
    },

    createPresenceStateBatch: function(state, scale, borderWidth)
    {
        borderWidth = borderWidth || 0;

        var presenceImage = "";
        
        if(!scale)
        {
            scale = 32;
        }

        if(state)
        {
            var width = 16;
            
            if (scale <= 32)
            {
                width = 9;
            }
            else if (scale <= 52)
            {
                width = 12;
            }
            else if (scale <= 100)
            {
                width = 19;                
            }
            else
            {
                this.scale = 100;
                width = 19;
            }
            presenceImage = state.image;
            return '<div style="background-image:url(' + presenceImage + ');border-radius:100%;background-size:contain;position:relative;box-sizing:content-box;top:1px;border:' + borderWidth + 'px solid white;width:' + width + 'px;height:' + width + 'px;display:inline-block"></div>';
        }
    },

    checkNumber: function (number) {
        //var phoneRegEx = RegExp(/^[\s()+-]*([0-9][\s()+-]*){0,50}$/);
        return isPhoneNumber(number);
    },
    getPanelContent: function (id) {
        this.removeTempEntries(id);
        var me = this, resetButton;
        function reset(withDelete) {
            if (withDelete) {

                me.insert(1, Ext.create('ConfirmationComponent',
                {
                    yesCallback: function () {
                        me.clearLists(id);
                        if (id === 0) {
                            radio2.setValue(true);
                        } else {
                            radio1.setValue(true);
                        }
                        numberCombo.setDisabled(me.dataObject[id].selectedItem !== 2);

                        if (id === 0) {
                            me.setTextList(id, [LANGUAGE.getString("PresenceStateAvailable")]);
                            textCombo.select(LANGUAGE.getString("PresenceStateAvailable"));
                            me.dataObject[id].availableTexts = [LANGUAGE.getString("PresenceStateAvailable")];
                        } else if (id === 1) {
                            me.setTextList(id, [LANGUAGE.getString("PresenceStateNotAvailable")]);
                            textCombo.select(LANGUAGE.getString("PresenceStateNotAvailable"));
                            me.dataObject[id].availableTexts = [LANGUAGE.getString("PresenceStateNotAvailable")];
                        } else if (id === 2) {
                            me.setTextList(id, [LANGUAGE.getString("PresenceStatePause")]);
                            textCombo.select(LANGUAGE.getString("PresenceStatePause"));
                            me.dataObject[id].availableTexts = [LANGUAGE.getString("PresenceStatePause")];
                        } else if (id === 3) {
                            me.setTextList(id, [LANGUAGE.getString("PresenceStateDnd")]);
                            textCombo.select(LANGUAGE.getString("PresenceStateDnd"));
                            me.dataObject[id].availableTexts = [LANGUAGE.getString("PresenceStateDnd")];
                        }
                        textStore.loadData(me.getTextList(id).map(function (str) { return { name: str.replace("|||temp", "") }; }));
                        numberStore.loadData(me.getDeviceList(id).map(function (str) { return { name: str.replace("|||temp", "") }; }));

                        numberCombo.select(me.dataObject[id].phoneNumber);
                    },
                    noCallback: function () {
                        
                    },
                    errorMessageText: LANGUAGE.getString("stateChangeUndo"),
                    errorType: ErrorType.Warning,
                    borderWidth: 1,
                    margin: '15 20 20 20'
                }));

            } else {
                if (me.dataObject[id].selectedItem <= 0) {
                    radio1.setValue(true);
                } else if (me.dataObject[id].selectedItem === 1) {
                    radio2.setValue(true);
                } else if (me.dataObject[id].selectedItem === 2) {
                    radio3.setValue(true);
                } else if (me.dataObject[id].selectedItem === 3) {
                    radio4.setValue(true);
                }

                numberCombo.select(me.dataObject[id].phoneNumber);
                numberCombo.setDisabled(me.dataObject[id].selectedItem !== 2);
            }
            
        }
        var content, textCombo, numberCombo, radio1, radio2, radio3, radio4, errorExists;
        this.updateTextList(id, this.dataObject[id].presenceState.text, true);
        this.updateDeviceList(id, this.dataObject[id].phoneNumber, true);
        this.setInitialTextList(id);
        var textStore = new Ext.data.Store({
            data: this.getTextList(id).map(function (str) { return { name: str.replace("|||temp", "") }; })
        });
        var numberStore = new Ext.data.Store({
            data: this.getDeviceList(id).map(function (str) { return { name: str.replace("|||temp", "") }; })
        }); 
        var content = Ext.create("Ext.Container", {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            listeners: {
                afterrender: function (event) {
                    event.ownerCt.body.setStyle({ border: 'none' });
                }
            },
            getResult: function () {
                if (errorExists) {
                    //return false;
                }
                var result = me.dataObject[id];

                

                var selectedItem = -1;
                var text = "";
                if (radio1.getValue() === true) {
                    selectedItem = 0;
                } else if (radio2.getValue() === true) {
                    selectedItem = 1;
                } else if (radio3.getValue() === true) {
                    selectedItem = 2;
                    result.phoneNumber = numberCombo.getRawValue();
                    if (selectedItem === 2 && !isPhoneNumber(result.phoneNumber)) {
                        me.tabPanel.setActiveTab(id);
                        return false;
                    }
                } else if (radio4.getValue() === true) {
                    selectedItem = 3;
                }
                text = textCombo.getRawValue();
                result.text = text;
                result.presenceState.text = text;
                if (result.availableTexts.indexOf(text) === -1) { result.availableTexts.unshift(text); }
                result.availableTexts = result.availableTexts.map(function (p) { return "\"" + p + "\""; });
                result.selectedItem = selectedItem;
                return result;
            }
        });
        content.add(Ext.create("Ext.container.Container",
            {
                cls: ["form-header", "eclipsedText"],
                html: this.createPresenceStateBatch(this.dataObject[id].presenceState, 80, 1) + "<div style='font-size:20px;margin-left:6px;' class='t3 inline'>" + LANGUAGE.getString("stateChangeHeader" + id) + "</div>"
            }));
        content.add(Ext.create("Ext.container.Container", { cls: ["settingsSubTitle"], margin: '10 0 10 0', html: LANGUAGE.getString("stateChangeMessageTitle") + ":" }));
        content.add(Ext.create("Ext.container.Container", {
            cls: ["form-row"],
            items: [textCombo = Ext.create("Ext.form.field.ComboBox", {
                listConfig:
                {
                    getInnerTpl: function ()
                    {
                        return '{name:htmlEncode}';
                    }
                },
                cls: ["form-full-col"],
                store: textStore,
                valueField: 'name',
                displayField: "name",
                editable: true,
                queryMode: "local",
                listeners: {
                    specialkey: function (field, e) {
                        if (e.getKey() == e.ENTER) {
                            var val = textCombo.getRawValue();
                            me.updateTextList(id, val, false);
                            var listToShow = me.getTextList(id).map(function (str) { return str.replace("|||temp", ""); }).filter(function (item, pos, self) {
                                return self.indexOf(item) === pos || self.indexOf(item) === pos;
                            }).map(function (x) { return { name: x }; });

                            textStore.loadData(listToShow);
                        }
                    },
                    blur: function () {
                        var val = textCombo.getRawValue();
                        me.updateTextList(id, val, false);
                        var listToShow =  me.getTextList(id).map(function (str) { return str.replace("|||temp", ""); }).filter(function (item, pos, self) {
                            return self.indexOf(item) == pos;
                        }).map(function (x) { return { name: x }; });

                        textStore.loadData(listToShow);
                    }
                }
            })]
        }));
        content.add(Ext.create("Ext.container.Container", { cls: ["form-divider"] }));
        content.add(Ext.create("Ext.container.Container", { cls: ["settingsSubTitle"], margin: '10 0 10 0', html: LANGUAGE.getString("stateChangePhoneTitle") + ":" }));
        content.add(Ext.create("Ext.container.Container", {
            cls: ["form-row", "form-field"],
            padding: '10 7 0 7',
            items: [
                radio1 = Ext.create("Ext.form.field.Radio", { cls: ["form-full-col"], boxLabel: LANGUAGE.getString("stateChangeOption1"), name: 'rb' + id, inputValue: '1' }),
                radio2 = Ext.create("Ext.form.field.Radio", { cls: ["form-full-col"], boxLabel: LANGUAGE.getString("stateChangeOption2"), name: 'rb' + id, inputValue: '2' }),
                radio3 = Ext.create("Ext.form.field.Radio", {
                    cls: ["form-half-col"], boxLabel: LANGUAGE.getString("stateChangeOption3"), name: 'rb' + id, inputValue: '3', listeners: {
                        change: function (instance, newValue, oldValue) {
                            if (newValue === true) {
                                if (me.checkNumber(numberCombo.getRawValue())) {
                                    errorExists = false;
                                } else {
                                    errorExists = true;
                                }
                                numberCombo.setDisabled(false);
                            } else {
                                errorExists = false;
                                numberCombo.setDisabled(true);
                            }
                        }
                    }
                }),
                numberCombo = Ext.create("Ext.form.field.ComboBox", {
                    listConfig:
                    {
                        getInnerTpl: function ()
                        {
                            return '{name:htmlEncode}';
                        }
                    },
                    margin: '-7 0 0 0',
                    cls: ["form-half-col"],
                    store: numberStore,
                    valueField: 'name',
                    displayField: "name",
                    editable: true,
                    queryMode: "local",
                    listeners: {
                        change: function (instance, newValue, oldValue) {
                            if (radio3.getValue() === true) {
                                if (me.checkNumber(newValue)) {
                                    errorExists = false;
                                } else {
                                    errorExists = true;
                                }
                            }
                        },
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                var val = numberCombo.getRawValue();
                                if (me.checkNumber(val)) {
                                    me.updateDeviceList(id, val, false);
                                    numberStore.loadData(me.getDeviceList(id).map(function (str) { return { name: str }; }));
                                }
                            }
                        },
                        blur: function () {
                            var val = numberCombo.getRawValue();
                            if (me.checkNumber(val)) {
                                me.updateDeviceList(id, val, false);
                                numberStore.loadData(me.getDeviceList(id).map(function (str) { return { name: str }; }));
                            }
                        }
                    }
                }),
                radio4 = Ext.create("Ext.form.field.Radio", { cls: ["form-full-col"], boxLabel: LANGUAGE.getString("stateChangeOption4"), name: 'rb' + id, inputValue: '4', disabled: !this.dataObject[id].answeringMachineAvailable })
            ]
        }));

        if (id === 3) {
            content.add(Ext.create("Ext.container.Container", { cls: ["form-divider"] }));
            content.add(Ext.create("Ext.container.Container", { cls: ["settingsSubTitle"], margin: '10 0 10 0', html: LANGUAGE.getString("privacyChatAndVideo") + ":" }));
            content.add(Ext.create("Ext.form.field.Checkbox", {
                cls: ["form-full-col", "normal-side-padding", "t3", "form-field"],
                style: { "padding-top": "5px", "padding-left": "7px" },
                margin: '0 0 0 0',
                labelWidth: 100,
                boxLabel: LANGUAGE.getString("privacyChatBox"),
                checked: me.dataObject[id].chatActivated,
                handler: function (instance, newValue)
                {
                    me.dataObject[id].chatActivated = newValue;
                }
            }));
        }
        resetButton = new RoundThinButton({
            scale: 'medium',
            //cls: ["align-right", "buttonNoHover"],
            margin: '10 0 0 0',
            text: LANGUAGE.getString("stateChangeReset").toUpperCase(),
            listeners: {
                click: function ()
                {
                    reset(true);
                }
            }
        });
        content.add(new Ext.Container(
            {
                margin: '0 5 0 0',
                layout:
                {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'end'
                },
                items: [resetButton]
            }));
        if (!me.dataObject[id].presenceState.text) {
            if (id === 0) {
                textCombo.select(LANGUAGE.getString("PresenceStateAvailable"));
            } else if (id == 1) {
                textCombo.select(LANGUAGE.getString("PresenceStateNotAvailable"));
            } else if (id == 2) {
                textCombo.select(LANGUAGE.getString("PresenceStatePause"));
            } else if (id == 3) {
                textCombo.select(LANGUAGE.getString("PresenceStateDnd"));
            }
        } else {
            textCombo.select(me.dataObject[id].presenceState.text);
        }
        numberCombo.select(me.dataObject[id].phoneNumber);


        reset();
        return content;
    },
    getCache: function (id) {
        var cache = LOCAL_STORAGE.getItem("stateConfigCache" + id) || "{}";
        cache = JSON.parse(cache);
        return cache || {};
    },
    getDeviceList: function (id) {
        var cache = this.getCache(id);
        return cache.deviceList || [];
    },
    setDeviceList: function (id, deviceList) {
        var cache = this.getCache(id),
            json;
        cache.deviceList = deviceList;
        json = JSON.stringify(cache);
        LOCAL_STORAGE.setItem("stateConfigCache" + id, json);
    },
    getTextList: function (id) {
        var cache = this.getCache(id);
        return cache.textList || [];
    },
    setTextList: function (id, textList) {
        var cache = this.getCache(id),
            json;
        cache.textList = textList;
        json = JSON.stringify(cache);
        LOCAL_STORAGE.setItem("stateConfigCache" + id, json);
    },
    setInitialTextList: function (id) {
        this.dataObject[id].availableTexts = this.dataObject[id].availableTexts.filter(function (x) { return x !== "" && x != "\"\""; });
        this.dataObject[id].availableTexts = this.dataObject[id].availableTexts.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });
        this.dataObject[id].availableTexts = this.dataObject[id].availableTexts.map(function (x) {
            if (x.length >= 2 && x.indexOf("\"") > -1) {
                return x.substr(1, x.length - 2);
            } else {
                return "";
            }
        });
        this.setTextList(id, this.dataObject[id].availableTexts);
    },
    updateDeviceList: function (id, device, fromServer) {
        var list = this.getDeviceList(id),
            index = -1;
        if (!device||device.length === 0) {
            return;
        }
        if (!fromServer) {
            device = device + "|||temp";
        }
        index = list.indexOf(device);
        if (index !== -1) {
            list.splice(index, 1);
        }
        list.unshift(device);
        this.setDeviceList(id, list);
    },
    updateTextList: function (id, text, fromServer) {
        var list = this.getTextList(id),
            index = -1;
        if (!text || text.length === 0) {
            return;
        }
        if (!fromServer) {
            text = text + "|||temp";
        }
        index = list.indexOf(text);
        if (index !== -1) {
            list.splice(index, 1);
        }
        list.unshift(text);
        this.setTextList(id, list);
    },
    clearLists: function (id) {
        LOCAL_STORAGE.setItem("stateConfigCache" + id, "{}");
    },
    removeTempEntries: function (id) {
        var list = this.getTextList(id);
        for (var i = 0; i < list.length; i++) {
            if (list[i].indexOf("|||temp") > -1) {
                list.splice(i, 1);
                i = 0;
            }
        }
        this.setTextList(id, list);
        list = this.getDeviceList(id);
        for (var i = 0; i < list.length; i++) {
            if (list[i].indexOf("|||temp") > -1) {
                list.splice(i, 1);
                i = 0;
            }
        }
        this.setDeviceList(id, list);
    }
});