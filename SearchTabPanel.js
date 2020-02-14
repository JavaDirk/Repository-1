Ext.define('SearchTabPanel',
{
    extend: 'Ext.tab.Panel',

    border: false,

    initComponent: function ()
    {
        this.titleIconWhite = IMAGE_LIBRARY.getImage('search', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage('search', 64, COLOR_TAB_ICON_NORMAL);

        this.tabConfig =
        {
            icon: this.titleIconBlack,
            tooltip: LANGUAGE.getString('searchColleaguesOrExternals')
        };

        this.callParent();

        
        this.colleaguesPanel = this.add(Ext.create('ColleaguesPanel',
        {
            parent: this
        }));
        this.externalContactsPanel = this.add(Ext.create('ExternalContactsPanel',
        {
            parent: this
        }));

        var lastChosenTab = CLIENT_SETTINGS.getSetting('SEARCH', 'lastChosenTab');
        this.setActiveTab(lastChosenTab || 0);

        this.on('tabchange', function (tabPanel, newCard, oldCard, eOpts)
        {
            var index = tabPanel.tabBar.items.indexOf(newCard.tab);
            CLIENT_SETTINGS.addSetting('SEARCH', 'lastChosenTab', index);
            CLIENT_SETTINGS.saveSettings();

            newCard.focus();
        });

        this.setVisible(SESSION.isFeatureAllowed(TimioFeature.Search));
    },


    focus: function ()
    {
        this.callParent();

        var activeTab = this.getActiveTab();
        if (isValid(activeTab))
        {
            activeTab.focus();
        }
        else
        {
            this.colleaguesPanel.focus();
        }
    }
});