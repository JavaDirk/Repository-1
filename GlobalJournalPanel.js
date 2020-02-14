Ext.define('GlobalJournalPanel',
{
    extend: 'BaseJournalPanel',

    title: '',

    getJournalFilterFunction: function () {
        return function (journalEntry) {
            return true;
        };
    },

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('calls').toUpperCase();
    }
});