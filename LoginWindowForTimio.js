Ext.define('LogInWindowForTimio', {
    extend: 'LogInWindow',
    
    initComponent: function ()
    {
        this.callParent();

        this.tabPanel.add(this.createOtherOptionsContainer());
        this.softPhoneActivated = this.header.add(Ext.create('Ext.Component',
            {
                height: 17,
                margin: '1 0 0 14',
                style: 'font-family:arial;font-weight:600;font-size:11px;color:white;transition:0.3s;opacity:' + this.getOpacityValueForSoftphoneTitle(),
                html: LANGUAGE.getString("softphone")
            }));
    },

    getAvatarDefaultImage: function ()
    {
        if (IMAGE_LIBRARY.containsImage("user", 64, COLOR_MAIN_2))
        {
            return IMAGE_LIBRARY.getImage("user", 64, COLOR_MAIN_2);
        }

        this.colorizePhoto(); //ist nötig, wenn über die oem.ini eine andere Akzentfarbe gesetzt wird
        return "";
    },

    colorizePhoto: function ()
    {
        var self = this;
        this.add(new ThinImage({
            src: "images/64/user.png",
            normalColor: COLOR_MAIN_2,
            height: 64,
            width: 64,
            alpha: 1,
            useUiFunctions: true,
            hidden: true,
            afterSourceChanged: function (event)
            {
                var contact = self.foto.contact;
                contact.setImageUrl(event.src);
                self.foto.setContact(contact);
            }
        }));
    },

    createContainer: function ()
    {
        this.tabPanel = new Ext.tab.Panel({
            height: 180,
            width: 300,
            padding: '15 10 15 10',

            style: {
                'border-radius': '3px'
            },
            bodyStyle:
            {
                background: 'transparent',
                border: 'none'
            },
            tabBar:
            {
                cls: 'loginTabBar',
                style:
                {
                    background: 'transparent'
                }
            },
            listeners: {
                afterrender: function (event)
                {
                    this.setActiveTab(1);
                    this.setActiveTab(0);
                }
            }
        });
        return this.tabPanel;
    },

    createOtherOptionsContainer: function ()
    {
        var self = this;

        var container = Ext.create('Ext.Container',
            {
                title: LANGUAGE.getString("startOptions"),
                padding: '0 10',
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1
            });

        addLanguageDependentStringsToPresenceStateEnums();
        var store = new Ext.data.Store(
            {
                fields: ['name', 'value']
            });
        LANGUAGE.getLanguage();
        Ext.each([PresenceState.Available, PresenceState.NotAvailable, PresenceState.Break, PresenceState.DnD], function (presenceState)
        {
            var presenceStateCheckItem = new PresenceStateCheckItem(
                {
                    presenceState: presenceState
                });
            store.add(
                {
                    name: presenceStateCheckItem.text,
                    value: presenceState
                });
        });

        container.add(Ext.create('Ext.form.Label',
        {
            margin: '15 0 5 0',
            style: 'color: white',
            text: LANGUAGE.getString("stateAtStart") + ":"
        }));

        this.presenceStateCombobox = container.add(Ext.create('Ext.form.field.ComboBox',
        {
            height: 29,
            store: store,
            editable: false,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'value',
            enableKeyEvents: true,
            listeners:
            {
                boxready: function ()
                {
                    this.setStyle({ background: 'white'});
                    this.labelTextEl.setStyle({ color: WHITE });
                    this.inputEl.dom.style.paddingTop = "5px";
                    //this.inputEl.dom.style.paddingLeft = "8px";
                    
                    var foundRecord;
                    this.getStore().each(function (record)
                    {
                        if (record.data.value.value === self.getSavedPresenceState())
                        {
                            foundRecord = record;
                            return false;
                        }
                    });
                    this.select(foundRecord);
                }
            },
            //das überschreiben von fieldSubTpl, displayTpl und setRawvalue dient nur dazu, damit man in der Combobox sowohl in der Liste als auch im Feld selber html anzeigen kann
            //ExtJS kann das nur in der Liste, aber nicht im Feld, weil die ein input-element nehmen, was html nicht interpretiert. Hier wird das input durch ein div ersetzt
            fieldSubTpl: [
                '<div class="{hiddenDataCls}" role="presentation"></div>',
                '<div id="{id}" type="{type}" ',
                '<tpl if="size">size="{size}" </tpl>',
                '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>',
                'class="{fieldCls} {typeCls}" autocomplete="off"></div>',
                '<div id="{cmpId}-triggerWrap" class="{triggerWrapCls}" role="presentation">',
                '{triggerEl}',
                '<div class="{clearCls}" role="presentation" style=""></div>',
                '</div>',
                {
                    compiled: true,
                    disableFormats: true
                }
            ],
            displayTpl: Ext.create('Ext.XTemplate', [
                '<tpl for=".">',
                '{[values.name]}',
                '</tpl>'
            ]),
            setRawValue: function (value)
            {
                var me = this;
                me.rawValue = value;

                // Some Field subclasses may not render an inputEl
                if (me.inputEl)
                {
                    // me.inputEl.dom.value = value;
                    // use innerHTML
                    me.inputEl.dom.innerHTML = value;
                }
                return value;
            }
            }));

        this.softphoneCheckbox = container.add(Ext.create('Ext.form.field.Checkbox',
        {
            height: 34,
            margin: '5 0 0 0',
            boxLabel: LANGUAGE.getString("startAsSoftphone"),
            checked: this.getSavedUseSoftphone(),
            listeners:
            {
                boxready: function ()
                {
                    this.bodyEl.dom.style.paddingTop = "5px";
                    this.boxLabelEl.setStyle({ color: WHITE });
                },
                change: function (checkbox, newValue, oldValue)
                {
                    self.softPhoneActivated.setStyle({ opacity: self.getOpacityValueForSoftphoneTitle() });
                }
            }
        }));
        if (!SESSION.areSoftphoneAndCTIAllowed())
        {
            this.softphoneCheckbox.hide();
        }

        return container;
    },

    getLoginOptions: function ()
    {
        this.loginOptions = new www_caseris_de_CaesarSchema_LoginOptions();

        this.loginOptions.setUseSoftPhone(this.isSoftphoneChosen());
        this.loginOptions.setLoginPresenceState(this.getSavedPresenceState());
        Ext.each(this.presenceStateCombobox.lastSelectedRecords, function (selectedRecord)
        {
            this.loginOptions.setLoginPresenceState(selectedRecord.data.value.value);
        }, this);
        return this.loginOptions;
    },

    getSavedPresenceState: function ()
    {
        var presenceState = LOCAL_STORAGE.getItem('PresenceStateAtBeginning') || PresenceState.Available.value;
        return Number(presenceState);
    },

    savePresenceState: function ()
    {
        var value = this.loginOptions.getLoginPresenceState();
        LOCAL_STORAGE.setItem('PresenceStateAtBeginning', value);
    },

    getSavedUseSoftphone: function ()
    {
        var useSoftPhone = LOCAL_STORAGE.getItem('UseSoftphone') || "false";
        return useSoftPhone.toLowerCase() === "true";
    },

    saveUseSoftphone: function ()
    {
        var value = this.loginOptions.getUseSoftPhone();
        LOCAL_STORAGE.setItem('UseSoftphone', value);
    },

    getValueForUseSoftphone: function ()
    {
        return this.softphoneCheckbox.getValue();
    },

    onLogin: function (result, relogin)
    {
        this.callParent(arguments);

        if (result.getReturnValue().getCode() === 0 && !relogin)
        {
            this.savePresenceState();
            this.saveUseSoftphone();
        }
    },

    getOpacityValueForSoftphoneTitle: function ()
    {
        var softphone = this.isSoftphoneChosen();
        return softphone ? 1 : 0;
    },

    isSoftphoneChosen: function ()
    {
        if (SESSION.areSoftphoneAndCTIAllowed())
        {
            if (isValid(this.softphoneCheckbox.getValue()))
            {
                return this.softphoneCheckbox.getValue();
            }
            else
            {
                return this.getSavedUseSoftphone();
            }
        }
        else
        {
            if (SESSION.isFeatureAllowed(TimioFeature.Telephony_Softphone))
            {
                return true;
            }
        }
        return false;
    }
});