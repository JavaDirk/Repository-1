Ext.define('LiveChatPlugin',
{
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.LiveChatPlugin',

    init: function (cmp)
    {
        this.setCmp(cmp);

        SESSION.addListener(this);
        
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    onNewEvents: function (response)
    {
        if (isValid(response, "getControlEvents().getControlEventChatFinish()"))
        {
            var liveChatId = response.getControlEvents().getControlEventChatFinish().getChatId();

            if (this.cmp.chatId == liveChatId)
            {
                this.cmp.hide();
            }
        }
    }
});