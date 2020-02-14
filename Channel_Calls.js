/**
 * Created by jebing on 20.01.2015.
 */
Ext.define(CLASS_CHANNEL_CALLS,
{
    extend: 'Channel',

    getImage: function ()
    {
        return 'images/64/phone.png';
    },
    getChannelImage: function ()
    {
        return 'Images/64/phone.png';
    },

    getText: function ()
    {
        return LANGUAGE.getString('calls');
    },

    getPanelClassName: function ()
    {
        return CLASS_MAIN_CALL_PANEL;
    },

    getChannelImageClassName: function ()
    {
        return CLASS_TELEPHONY_CHANNEL_IMAGE;
    },

    needContactCenter: function ()
    {
        return false;
    },

    isAllowedByTimioFeature: function ()
    {
        return SESSION.isTelephonyAllowed();
    }
});