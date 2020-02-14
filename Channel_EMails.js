/**
 * Created by jebing on 20.01.2015.
 */
Ext.define(CLASS_CHANNEL_EMAILS,
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
        return LANGUAGE.getString('requests');
    },

    getPanelClassName: function ()
    {
        return CLASS_MAIN_EMAIL_PANEL;
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
        return SESSION.isFeatureAllowed(TimioFeature.ContactCenter);
    }
});
