Ext.define('WebRtcLiveNotificationForInvitation', {
    extend: 'WebRtcLiveNotification',
    contact: undefined,
    showOpenContact: false,

    initComponent: function ()
    {
        this.title = LANGUAGE.getString('newVideoSessionByInvitation');
        this.icon = 'invitation';

        this.callParent();
    },

    createInformationContainer: function ()
    {
        return Ext.create('InformationContainerForWebRTCLive',
            {
                contact: this.contact,
                mediaType: this.mediaType
            });
    },

    isTimioFeatureAllowed: function ()
    {
        return SESSION.isFeatureAllowed(TimioFeature.WebRtcIncoming);
    }
});