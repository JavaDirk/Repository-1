Ext.define('ChooseWebtRtcPartner', 
{
    extend: 'ChooseChatPartnerContainer',

    listPanelClassName: 'ColleaguesListPanelForVideoCall'
});


Ext.define('ChooseVideoPartner',
{
    extend: 'ChooseWebtRtcPartner',

    target: undefined,

    startChat: function (contact)
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openVideoChat(contact);
    },

    //@override
    getTitleText: function ()
    {
        return LANGUAGE.getString('selectChatVideoPartner');
    }
});
