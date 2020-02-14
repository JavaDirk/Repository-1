Ext.define('GlobalJournalContainer',
{
    extend: 'Ext.tab.Panel',
    flex: 1,
    border: false,

    deferredRender: false,

    initComponent: function ()
    {
        this.titleIconWhite = IMAGE_LIBRARY.getImage('list', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage('list', 64, COLOR_TAB_ICON_NORMAL);

        this.tabConfig =
        {
            icon: this.titleIconBlack,
            iconCls: 'bigTabPanelIcon',
            tooltip: LANGUAGE.getString('journal')
        };

        this.callParent();


        this.globalJournalPanel = this.add(Ext.create('GlobalJournalPanel',
        {
            
        }));
        
        this.missedCallsPanel = this.add(Ext.create('MissedCallsPanel',
        {
            
        }));

        this.callsWithNotePanel = this.add(Ext.create('CallsWithNotePanel',
        {
            
        }));

        this.setActiveTab(this.globalJournalPanel);

        this.on('tabchange', function (tabPanel, newCard, oldCard, eOpts)
        {
            if (isValid(oldCard, "onTabBlur"))
            {
                oldCard.onTabBlur();
            }
            if (isValid(newCard, "onTabFocus"))
            {
                newCard.onTabFocus();
            }
        });

        this.setVisible(SESSION.isTelephonyAllowed());
    },

    showMissedCalls: function ()
    {
        this.setActiveTab(this.missedCallsPanel);

        this.missedCallsPanel.openFirstJournalEntry();
    }
});