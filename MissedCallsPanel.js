Ext.define('MissedCallsPanel',
{
    extend: 'BaseJournalPanel',

    mixins: ['Ext.ux.mixin.Badge'],

    flex: 1,

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('missedCalls').toUpperCase();

        /*
        var self = this;
        this.on('afterrender', function () {
            self.tab.updateBadgeText('5');
        });
        */
    },

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    title: '',
    emptyText: '',
        
    getJournalFilterFunction: function ()
    {
        return function (journalEntry)
        {
            return journalEntry.isMissedCall();
        };
    },

    onTabFocus: function ()
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_ResetMissedCalls();
    },

    getEmptyTextForNoEntries: function ()
    {
        return LANGUAGE.getString('noMissedCalls');
    },

    openFirstJournalEntry: function ()
    {
        this.getStore().each(function (record)
        {
            if (record.data.ignore)
            {
                return;
            }
            GLOBAL_EVENT_QUEUE.onGlobalEvent_openJournalEntry(record.data);
            this.getSelectionModel().select([record]);
            return false;
        }, this);
    }
});