Ext.define('SettingsNotificationsPanel',
    {
        extend: 'SettingsBasePanel',

        margin: '0 0 0 5',
        title: '',
        iconCls: 'bell',

        initComponent: function ()
        {
            this.callParent();

            this.title = LANGUAGE.getString('notifications');

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("notifications"),
                style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
                margin: '10 0 0 5'
            }));

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("show"),
                style: 'font-size:' + FONT_SIZE_SUB_SETTING + 'px;color: ' + SETTINGS_SUB_HEADDING + ';font-weight: bold;',
                margin: '10 0 0 5'
            }));
            
            var checked = TIMIO_SETTINGS.getShowBrowserNotifications();

            this.add(new Ext.form.field.Checkbox({
                disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
                checked: checked,
                margin: '5 0 0 5',
                boxLabel: LANGUAGE.getString('showBrowserNotifications'),
                listeners: {
                    change: function (event, newValue, oldValue, eOpts) {
                        if (newValue) {
                            CLIENT_SETTINGS.addSetting('NOTIFICATIONS', 'showBrowserNotifications', true);
                        } else {
                            CLIENT_SETTINGS.addSetting('NOTIFICATIONS', 'showBrowserNotifications', false);
                        }

                        CLIENT_SETTINGS.saveSettings();
                    }
                }
            }));

        }
    });
