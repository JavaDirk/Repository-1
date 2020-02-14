/**
 * Created by jebing on 20.01.2015.
 */
Ext.define(CLASS_CHANNEL_STATISTICS,
{
    extend: 'Channel',

    getText: function ()
    {
        return LANGUAGE.getString('statistics');
    },
        
    getChannelImageClassName: function ()
    {
        return CLASS_STATISTICS_CHANNEL_IMAGE;
    },

    needContactCenter: function ()
    {
        return true;
    },

    isAllowedByTimioFeature: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.Statistics);
    }
});