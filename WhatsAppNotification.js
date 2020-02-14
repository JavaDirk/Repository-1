Ext.define('WhatsAppNotification',
{
    extend: 'LiveChatNotification',

    icon: 'whatsapp',

    createInformationContainer: function ()
    {
        return Ext.create('InformationContainerForWhatsApp',
        {
            contact: this.contact
        });
    },

    createTitle: function ()
    {
        return LANGUAGE.getString("newWhatsAppChatMessage");
    }
});