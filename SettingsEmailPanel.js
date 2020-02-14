/**
 * Created by martens on 11.09.2015.
 */
Ext.define('SettingsEmailPanel',
    {
        extend: 'SettingsBasePanel',

        margin: '0 0 0 5',

        title: '',
        iconCls: 'mail',
        cb_showRequestEmail: {},

        initComponent: function ()
        {
            this.callParent();

            this.title = LANGUAGE.getString('emailsNormalCase');

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("settings"),
                style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
                margin: '10 0 0 5'
            }));

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("answer"),
                style: 'font-size:' + FONT_SIZE_SUB_SETTING + 'px;color: ' + SETTINGS_SUB_HEADDING + ';font-weight:bold;',
                margin: '10 0 0 5'
            }));
            
            var isChecked = false;

            if (CLIENT_SETTINGS.getSetting('EMAIL', 'showSenderEmail'))
            {
                isChecked = true;
            }

            this.cb_showRequestEmail = this.add(new Ext.form.field.Checkbox({
                checked: isChecked,
                margin: '5 0 0 5',
                boxLabel: LANGUAGE.getString("showSenderEmail"),
                listeners: {
                    change: function (event, newValue, oldValue)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('EMAIL', 'showSenderEmail', true);
                        }
                        else
                        {
                            CLIENT_SETTINGS.removeSetting('EMAIL', 'showSenderEmail');
                        }
                    }
                }
            }));

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("search"),
                style: 'font-size:' + FONT_SIZE_SUB_SETTING + 'px;color: ' + SETTINGS_SUB_HEADDING + ';font-weight:bold;',
                margin: '10 0 0 5'
            }));

            isChecked = false;

            if (CLIENT_SETTINGS.getSetting('EMAIL', 'saveSearchSettings'))
            {
                isChecked = true;
            }

            this.cb_showRequestEmail = this.add(new Ext.form.field.Checkbox(
            {
                checked: isChecked,
                margin: '5 0 0 5',
                boxLabel: LANGUAGE.getString("saveSearchSettings"),
                listeners:
                {
                    change: function (event, newValue, oldValue)
                    {
                        if (newValue)
                        {
                            CLIENT_SETTINGS.addSetting('EMAIL', 'saveSearchSettings', true);
                        }
                        else
                        {
                            CLIENT_SETTINGS.removeSetting('EMAIL', 'saveSearchSettings');
                        }
                    }
                }
            }));

        }
    });