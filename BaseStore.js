Ext.define('BaseStore',
{
    extend: 'Ext.data.Store',

    autoDestroy: true,

    constructor: function()
    {
        this.callParent(arguments);

        var self = this;
        
        this.on('remove', function (store, records)
        {
            Ext.each(records, self.destroyPhoto);
        });
    },

    destroyPhoto: function(record)
    {
        if (isValid(record.photo)) {
            record.photo.destroy();
        }
    },

    removeAll: function()
    {
        this.each(this.destroyPhoto);

        this.callParent(arguments);
    },

    destroy: function ()
    {
        this.each(this.destroyPhoto);

        this.callParent(arguments);
    }
});