/**
 * Created by martens on 11.09.2015.
 */
Ext.define('SettingsPartnerStrip',
    {
        extend: 'SettingsBasePanel',
        flex:1,
        title: '',
        iconCls: 'users',
        cb_showRequestEmail: {},
        
        initComponent: function ()
        {
            this.callParent();

            this.title = LANGUAGE.getString('partnerStrip');

            this.add(Ext.create('Ext.form.Label',
                {
                    text: LANGUAGE.getString("display"),
                    style: 'font-size:' + FONT_SIZE_SUB_SETTING + 'px;color: ' + SETTINGS_SUB_HEADDING + ';font-weight:bold',
                    cls: 'settingsSubTitle',
                    margin: '10 0 0 10'
                }));

            var displayRadioButtonContainer = this.add(new Ext.Container({
                margin: '5 0 0 5',
                layout: {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },
                border: false
            }));

            displayView = CLIENT_SETTINGS.getSetting('PARTNERS', 'displayView');
            var checked = false;

            if (displayView === 'panel')
            {
                checked = false;
            }
            else
            {
                checked = true;
            }

            displayRadioButtonContainer.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString("partnerStrip_showGroupsAsTabs"),
                name: 'displayView',
                checked: checked,
                margin: '0 0 0 5',
                listeners:
                {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', event.name, 'tab');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));

            displayRadioButtonContainer.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString("partnerStrip_showGroupsBelow"),
                name: 'displayView',
                checked: !checked,
                margin: '0 0 0 5',
                listeners:
                {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', event.name, 'panel');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));
            
            this.add(Ext.create('Label',
                {
                    text: LANGUAGE.getString("contact"),
                    color: SETTINGS_SUB_HEADDING,
                    fontSize: FONT_SIZE_SUB_SETTING,
                    margin: '10 0 0 10',
                    weight: 'bold'
                }));

            var radioButtonContainer = this.add(new Ext.Container({
                margin: '5 0 0 5',
                layout: {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },
                border: false
            }));

            checked = false;

            if (CLIENT_SETTINGS.getSetting('PARTNERS', 'contactView') === 'normal' || !CLIENT_SETTINGS.getSetting('PARTNERS', 'contactView'))
            {
                checked = true;
                CLIENT_SETTINGS.addSetting('PARTNERS', 'contactView', 'normal');
                CLIENT_SETTINGS.saveSettings();
            }

            radioButtonContainer.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString("normalView"),
                name: 'contactView',
                checked: checked,
                margin: '0 0 0 5',
                listeners:
                {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', event.name, 'normal');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));

            if (CLIENT_SETTINGS.getSetting('PARTNERS', 'contactView') === 'small')
            {
                checked = true;
            }
            else
            {
                checked = false;
            }

            radioButtonContainer.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString("compactView"),
                name: 'contactView',
                checked: checked,
                margin: '0 0 0 5',
                listeners:
                {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', event.name, 'small');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));
            
            this.add(Ext.create('Label',
            {
                text: LANGUAGE.getString("view"),
                margin: '15 0 5 10',
                weight: 'bold',
                fontSize: FONT_SIZE_SUB_SETTING,
                color: SETTINGS_SUB_HEADDING
            }));

            if (!CLIENT_SETTINGS.getSetting('PARTNERS', 'sortView'))
            {
                CLIENT_SETTINGS.addSetting('PARTNERS', 'sortView', 'dynamic');
                CLIENT_SETTINGS.saveSettings();
            }

            if (CLIENT_SETTINGS.getSetting('PARTNERS', 'sortView') === 'start')
            {
                checked = true;
            }
            else {
                checked = false;
            }

            this.dynamicContacts = this.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString('partnerStrip_sortACDGroups_begin'),
                name: 'sortView',
                margin: '0 0 0 10',
                checked: checked,
                listeners: {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', 'sortView', 'start');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));

            if (CLIENT_SETTINGS.getSetting('PARTNERS', 'sortView') === 'dynamic')
            {
                checked = true;
            }
            else
            {
                checked = false;
            }

            this.dynamicContacts = this.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString('partnerStrip_sortACDGroups_sort'),
                name: 'sortView',
                margin: '0 0 0 10',
                checked: checked,
                listeners: {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', 'sortView', 'dynamic');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));

            if (CLIENT_SETTINGS.getSetting('PARTNERS', 'sortView') === 'end')
            {
                checked = true;
            }
            else
            {
                checked = false;
            }

            this.dynamicContacts = this.add(new Ext.form.field.Radio({
                boxLabel: LANGUAGE.getString('partnerStrip_sortACDGroups_end'),
                name: 'sortView',
                margin: '0 0 0 10',
                checked: checked,
                listeners: {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('PARTNERS', 'sortView', 'end');
                            CLIENT_SETTINGS.saveSettings();

                            GLOBAL_EVENT_QUEUE.onGlobalEvent_PartnerListSettingsChanged();
                        }
                    }
                }
            }));
        }
    });