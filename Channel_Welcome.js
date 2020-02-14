Ext.define(CLASS_CHANNEL_WELCOME,
{
    extend: 'Channel',

    getImage: function ()
    {
        return 'images/64/mail.png';
    },
    getChannelImage: function () {
        return 'Images/64/mail.png';
    },

    getText: function ()
    {
        return LANGUAGE.getString('welcome');
    },

    getPanelClassName: function ()
    {
        return CLASS_MAIN_WELCOME_PANEL;
    },

    needContactCenter: function ()
    {
        return true;
    },

    getChannelImageClassName: function ()
    {
        return CLASS_MAIL_CHANNEL_IMAGE;
    },

    isAllowedByTimioFeature: function ()
    {
        return true;
    }
});
