Ext.define('BaseEventList',
{
    extend: 'Ext.Component',

    initComponent: function ()
    {
        this.events = {}; //map<id, event>

        this.callParent();

        SESSION.addVIPListener(this);
    },

    destroy: function ()
    {
        SESSION.removeVIPListener(this);
        this.callParent();
    },

    reset: function ()
    {
        this.events = {};
    },

    addEvent: function (id, event)
    {
        this.events[id] = event;
    },

    getEvent: function (id)
    {
        return this.events[id];
    },

    deleteEvent: function (id)
    {
        delete this.events[id];
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            this.reset();
        }
    }
});