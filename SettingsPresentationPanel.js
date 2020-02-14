Ext.define('SettingsPresentationPanel',
{
    extend: 'SettingsBasePanel',

    margin: '0 0 0 5',
    title: '',
    iconCls: 'fullView',

    initComponent: function () {
        this.callParent();

        this.title = LANGUAGE.getString('presentation');

        this.add(Ext.create('Ext.form.Label',
        {
            text: LANGUAGE.getString("startPage"),
            style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
            margin: '10 0 0 5'
        }));

        var startPage = TIMIO_SETTINGS.getStartPage();

        var hbox = this.add(Ext.create('Ext.Container',
        {
            layout: 'hbox'
        }));
        this.startPageComboBox = hbox.add(new Ext.form.field.ComboBox({
            disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
            margin: '5 0 0 0',
            listConfig: {
                getInnerTpl: function(){
                    return '{name:htmlEncode}';
                }
            },
            editable: false,
            store: new Ext.data.Store({
                fields: ['name', 'value']
            }),
            displayField: 'name',
            valueField: 'value',
            queryMode: 'local',
            listeners:
            {
                change: function(combobox, newValue, oldValue, eOpts)
                {
                    if (isValid(newValue) && isValid(oldValue))
                    {
                        if (newValue === PREFIX_WEBSITE)
                        {
                            websiteTextField.setVisible(true);
                        }
                        else
                        {
                            websiteTextField.setVisible(false);
                        }
                        CLIENT_SETTINGS.addSetting("GENERAL", "startPage", newValue);
                        CLIENT_SETTINGS.saveSettings();
                    }
                }
            }
        }));

        var url = "";
        if (startPage.indexOf(PREFIX_WEBSITE) === 0) {
            var parts = startPage.split(PREFIX_WEBSITE + ":");
            if (parts.length > 1) {
                url = parts[1];
            }
        }

        var websiteTextField = hbox.add(Ext.create('Ext.form.field.Text',
            {
            width: 300,
            disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
            margin: '5 0 0 5',
            emptyText: 'URL',
            hidden: startPage.indexOf(PREFIX_WEBSITE) !== 0,
            value: url,
            listeners:
            {
                blur: function()
                {
                    CLIENT_SETTINGS.addSetting("GENERAL", "startPage", PREFIX_WEBSITE + ":" + websiteTextField.getValue());
                    CLIENT_SETTINGS.saveSettings();
                }
            }
        }));

        var possibleStartPages =
        [
            { name: LANGUAGE.getString("welcomePage"), value: CLASS_CHANNEL_WELCOME, channel: CLASS_CHANNEL_WELCOME },
            { name: LANGUAGE.getString("emailsNormalCase"), value: CLASS_CHANNEL_EMAILS, channel: CLASS_CHANNEL_EMAILS },
            { name: LANGUAGE.getString("contacts"), value: CLASS_CHANNEL_CONTACTS, channel: CLASS_CHANNEL_CONTACTS },
            { name: LANGUAGE.getString("partnerStrip"), value: CLASS_CHANNEL_PARTNER_STRIP, channel: CLASS_CHANNEL_PARTNER_STRIP },
            { name: LANGUAGE.getString("website"), value: PREFIX_WEBSITE },
            { name: LANGUAGE.getString("noStartPage"), value: "" }
        ];

        var startPagesAllowedByTimioFeatures = Ext.Array.filter(possibleStartPages, function(startPage)
        {
            if(isValidString(startPage.channel))
            {
                var channel = Ext.create(startPage.channel, {});
                return channel.isAllowedByTimioFeature();
            }
            return true;
        });
        this.startPageComboBox.getStore().add(startPagesAllowedByTimioFeatures);

        var startPageEntry;
        Ext.each(possibleStartPages, function (possibleStartPage)
        {
            if(possibleStartPage.value === startPage || startPage.indexOf(possibleStartPage.value) === 0)
            {
                startPageEntry = possibleStartPage;
                return false;
            }
        });
        
        this.startPageComboBox.setValue(startPageEntry.value);

        this.add(Ext.create('Ext.form.Label',
        {
            text: LANGUAGE.getString("contacts"),
            style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
            margin: '25 0 0 5'
        }));

        var checked = TIMIO_SETTINGS.getAlwaysShowAgentState();

        var self = this;

        this.add(new Ext.form.field.Checkbox(
        {
            disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
            checked: checked,
            margin: '5 0 0 5',
            boxLabel: LANGUAGE.getString('alwaysShowAgentState'),
            listeners:
            {
                change: function (event, newValue, oldValue, eOpts)
                {
                    if (newValue)
                    {
                        CLIENT_SETTINGS.addSetting('CONTACTS', 'alwaysShowAgentState', true);
                    }
                    else
                    {
                        CLIENT_SETTINGS.addSetting('CONTACTS', 'alwaysShowAgentState', false);
                    }
                    CLIENT_SETTINGS.saveSettings();

                    if (isValid(self.changeLabel))
                    {
                        return;
                    }
                    self.changeLabel = self.add(Ext.create('Ext.form.Label',
                    {
                        text: LANGUAGE.getString("changeNeedsNewLogin"),
                        style: 'font-size:' + FONT_SIZE_TEXT + 'px;color: ' + RED,
                        margin: '0 0 0 25'
                    }));
                }
            }
        }));
    }
});
