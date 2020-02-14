Ext.define(CLASS_CHANNEL_CONTACTS,
{
    extend: 'Channel',

    getText: function () {
        return LANGUAGE.getString('contacts');
    },

    getPanelClassName: function () {
        return CLASS_MAIN_CONTACTS_PANEL;
    },

    needContactCenter: function () {
        return false;
    },

    isAllowedByTimioFeature: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.Contacts);
    }
});