Ext.define('BaseEventQueue',
{
    extend: 'Ext.Component',
    initComponent: function ()
    {
        this.callParent();
    },

    addEventListener: function (listener)
    {
        if (Ext.Array.contains(this.eventListeners, listener))
        {
            console.log("GlobalEventQueue: listener already registered ID: " + listener.id + ", className: " + getClassName(listener));
            return;
        }

        this.eventListeners.push(listener);
    },

    removeEventListener: function (listener)
    {
        Ext.Array.remove(this.eventListeners, listener);
    },

    onEvent: function (eventName, callback)
    {
        var args = Ext.Array.toArray(arguments, 1);
        var copyListeners = Ext.clone(this.eventListeners);
        Ext.each(copyListeners, function (listener)
        {
            if (isValid(listener[eventName]))
            {
                listener[eventName].apply(listener, args);
            }
        });
    }
});