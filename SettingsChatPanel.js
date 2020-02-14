Ext.define('SettingsChatPanel',
    {
        extend: 'SettingsBasePanel',

        margin: '0 0 0 5',
        title: '',
        iconCls: 'chat',

        initComponent: function ()
        {
            this.callParent();

            this.title = LANGUAGE.getString('chat');

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("settings"),
                style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
                margin: '10 0 0 5'
            }));

            this.add(Ext.create('Ext.form.Label',
            {
                text: LANGUAGE.getString("send"),
                style: 'font-size:' + FONT_SIZE_SUB_SETTING + 'px;color: ' + SETTINGS_SUB_HEADDING + ';font-weight: bold;',
                margin: '10 0 0 5'
            }));
            
            var checked = TIMIO_SETTINGS.getSendChatViaEnterKey();

            this.add(new Ext.form.field.Checkbox({
                disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
                checked: checked,
                margin: '5 0 0 5',
                boxLabel: LANGUAGE.getString('sendWithReturn'),
                listeners: {
                    change: function (event, newValue, oldValue, eOpts) {
                        if (newValue) {
                            CLIENT_SETTINGS.addSetting('CHAT', 'sendWithReturn', true);
                        } else {
                            CLIENT_SETTINGS.addSetting('CHAT', 'sendWithReturn', false);
                        }

                        CLIENT_SETTINGS.saveSettings();
                    }
                }
            }));

        }
    });
