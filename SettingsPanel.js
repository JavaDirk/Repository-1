Ext.define('SettingsTabPanel',
{
    extend: 'Ext.tab.Panel',

    cls: 'SettingsPanel',

    tabPosition: 'left',
    tabRotation: 0,
    margin: '0',
    border: false,

    defaults:
    {
        textAlign: 'left'
    },

    panels: [],

    initComponent: function ()
    {
        this.callParent();

        if (this.panels.length <= 0)
        {
            var infoPanel = Ext.create('SettingsInfoPanel', {});
            var searchPanel = Ext.create('SettingsSearchPanel', {});
            var chatPanel = Ext.create('SettingsChatPanel', {});
            var emailPanel = Ext.create('SettingsEmailPanel', {});
            var partnerPanel = Ext.create('SettingsPartnerStrip', {});
            var userPanel = Ext.create('SettingsUserPanel', {});
            var privacyPanel = Ext.create('SettingsPrivacyPanel', {});
            var presentationPanel = Ext.create('SettingsPresentationPanel', {});
            var notificationsPanel = Ext.create('SettingsNotificationsPanel', {});
            this.devicePanel = Ext.create('SettingsDevicesPanel', {});
            this.tspPanel = Ext.create('SettingsTSPPanel', {});
            this.panels = [infoPanel];
            
            if(SESSION.isFeatureAllowed(TimioFeature.Search))
            {
                this.panels.push(searchPanel);
            }

            if(SESSION.isOneOfTheseFeaturesAllowed([TimioFeature.LiveChat, TimioFeature.Chat]))
            {
                this.panels.push(chatPanel);
            }

            if(SESSION.isFeatureAllowed(TimioFeature.Partnerlist))
            {
                this.panels.push(partnerPanel);
            }

            if(SESSION.isFeatureAllowed(TimioFeature.ContactCenter))
            {
                this.panels.push(emailPanel);
            }


            this.panels.push(userPanel);
            this.panels.push(privacyPanel);
            this.panels.push(presentationPanel);
            this.panels.push(notificationsPanel);
            if (SESSION.isOneOfTheseFeaturesAllowed([TimioFeature.Telephony_Softphone, TimioFeature.WebRtcIncoming, TimioFeature.WebRtcOutgoing]))
            {
                this.panels.push(this.devicePanel);
            }
            if (SESSION.isFeatureAllowed(TimioFeature.Telephony_CTI) && !SESSION.isSIPMode())
            {
                this.panels.push(this.tspPanel);
            }
        }
       

        var self = this;
        Ext.each(this.panels, function (panel)
        {
            self.add(panel);
        });

        var index = 0;

        if (CLIENT_SETTINGS.getSetting('SETTINGSPANEL', 'Tabindex'))
        {
            index = parseInt(CLIENT_SETTINGS.getSetting('SETTINGSPANEL', 'Tabindex'), 10);
        }
        this.setActiveTab(index);
    },

    onOK: function ()
    {
        var self = this;
        self.allOkay = 0;
        Ext.each(this.panels, function (panel)
        {
            if (panel.onOK)
            {
                if (panel.identifier === 'userPanel' && panel.el) {
                    panel.successFunction();
                    setTimeout(function () {
                        if (panel.onOK() === -1) {
                            self.allOkay += 1;
                        }
                    }, 400);
                } else {
                    if (panel.onOK() === -1) {
                        self.allOkay += 1;
                    }
                }
            }
        });
    },

    selectSettingsPageForSoftphone: function ()
    {
        this.setActiveTab(this.devicePanel);
    },

    destroy: function ()
    {
        CLIENT_SETTINGS.addSetting('SETTINGSPANEL', 'Tabindex', this.items.indexOf(this.getActiveTab()));
        CLIENT_SETTINGS.saveSettings();

        this.callParent();
    }
});

Ext.define('SettingsPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    border: false,

    title: '',

    style: 'background-color: ' + COLOR_WATERMARK_BACKGROUND.toString(),

    initComponent: function ()
    {
        this.title = LANGUAGE.getString('settings');
        this.callParent();

        if (!this.settingsTabPanel)
        {
            this.settingsTabPanel = Ext.create('SettingsTabPanel', { flex: 1 });
        }
        this.settingsTabPanel.tabBar.setMargin('0 5 0 0');

        this.add(this.settingsTabPanel);
    },

    close: function ()
    {
        this.parent.removeItem(this);
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    },

    selectSettingsPageForSoftphone: function ()
    {
        this.settingsTabPanel.selectSettingsPageForSoftphone();
    }
});

Ext.define('SettingsPanelForRequestManagement',
{
    extend: 'SettingsPanel',
    initComponent: function ()
    {
        this.settingsTabPanel = Ext.create('SettingsTabPanelForRequestManagement', { flex: 1 });

        this.callParent();
    }
});

Ext.define('SettingsTabPanelForRequestManagement',
{
    extend: 'SettingsTabPanel',
    initComponent: function ()
    {
        var infoPanel = Ext.create('SettingsInfoPanel', {});
        var emailPanel = Ext.create('SettingsEmailPanel', {});
        var userPanel = Ext.create('SettingsUserPanel', {});
        this.panels = [infoPanel, emailPanel, userPanel];

        this.callParent();
    }
});
