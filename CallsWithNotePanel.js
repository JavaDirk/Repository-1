Ext.define('CallsWithNotePanel',
{
    extend: 'BaseJournalPanel',

    flex: 1,

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
            return journalEntry.hasNotice();
        };
    },
    
    onUpdateJournalEntrySuccess: function (response, journalEntry)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.onGetJournalSuccess();
        }
    },

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('callsWithNote').toUpperCase();
    },

    getEmptyTextForNoEntries: function ()
    {
        return LANGUAGE.getString('noCallsWithNote');
    },
});