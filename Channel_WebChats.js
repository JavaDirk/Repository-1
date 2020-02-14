/**
 * Created by jebing on 20.01.2015.
 */
Ext.define(CLASS_CHANNEL_WEBCHATS,
{
    extend: 'Channel',

    getImage: function ()
    {
        return 'images/64/chats_white.png';
    },
    getChannelImage: function ()
    {
        return 'Images/64/chats.png';
    },

    getText: function ()
    {
        return LANGUAGE.getString('chats');
    },

    getPanelClassName: function ()
    {
        return CLASS_MAIN_CHAT_PANEL;
    },

    getChannelImageClassName: function ()
    {
        return CLASS_CHAT_CHANNEL_IMAGE;
    },

    needContactCenter: function ()
    {
        return false;
    },

    constructor: function ()
    {
        SESSION.addListener(this);
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            this.destroy();
        }
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    isAllowedByTimioFeature: function ()
    {
        return SESSION.isOneOfTheseFeaturesAllowed([TimioFeature.Chat, TimioFeature.LiveChat]);
    }
});