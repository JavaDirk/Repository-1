Ext.define('Channel_PartnerStrip', {
    extend: 'Channel',

    getImage: function ()
    {
        return 'images/64/list.png';
    },
    getChannelImage: function ()
    {
        return 'Images/64/list.png';
    },

    getText: function ()
    {
        return LANGUAGE.getString('partnerStrip');
    },

    getPanelClassName: function ()
    {
        return CLASS_MAIN_PARTNER_STRIP_PANEL;
    },

    needContactCenter: function ()
    {
        return false;
    },

    isAllowedByTimioFeature: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.Partnerlist);
    }
});