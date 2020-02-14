function showErrorMessage(errorText, timeoutInSeconds, referenceId)
{
    GLOBAL_EVENT_QUEUE.onGlobalEvent_showError(errorText, timeoutInSeconds, referenceId);
}

function showWarningMessage(errorText, timeoutInSeconds, referenceId)
{
    GLOBAL_EVENT_QUEUE.onGlobalEvent_showWarning(errorText, timeoutInSeconds, referenceId);
}

function showInfoMessage(errorText, timeoutInSeconds, referenceId)
{
    GLOBAL_EVENT_QUEUE.onGlobalEvent_showInfo(errorText, timeoutInSeconds, referenceId);
}

function showConfirmation(confirmationComponent)
{
    GLOBAL_EVENT_QUEUE.onGlobalEvent_showConfirmation(confirmationComponent);
}

function removeErrorMessage(referenceId)
{
    GLOBAL_EVENT_QUEUE.onGlobalEvent_removeErrorMessage(referenceId);
}

Ext.define('GlobalEventQueue',
{
    extend: 'Ext.Component',

    eventListeners: [],

    initComponent: function () {
        this.callParent();
    },

    addEventListener: function (listener) {
        if (Ext.Array.contains(this.eventListeners, listener)) {
            console.log("GlobalEventQueue: listener already registered ID: " + listener.id + ", className: " + getClassName(listener));
            return;
        }
        this.eventListeners.push(listener);
    },

    removeEventListener: function (listener) {
        Ext.Array.remove(this.eventListeners, listener);
    },

    onGlobalEvent_Dial: function (contact, number) {
        this.onEvent('onGlobalEvent_Dial', contact, number);
    },

    onGlobalEvent_CancelMail: function (panel, activeEmail, closeFct) {
        this.onEvent('onGlobalEvent_CancelMail', panel, activeEmail, closeFct);
    },

    onGlobalEvent_DialForGroup: function (contact, number, groupId, force, onSuccess) {
        this.onEvent('onGlobalEvent_DialForGroup', contact, number, groupId, force, onSuccess);
    },

    onGlobalEvent_OwnerCall: function (call, setActiveItem) {
        this.onEvent('onGlobalEvent_OwnerCall', call, setActiveItem);
    },

    onGlobalEvent_Answer: function (contact, call) {
        this.onEvent('onGlobalEvent_Answer', contact, call);
    },

    onGlobalEvent_openLiveChat: function (contact, chatIds, chatOffers, liveChats) {
        this.onEvent('onGlobalEvent_openLiveChat', contact, chatIds, chatOffers, liveChats);
    },

    onGlobalEvent_acceptWebRtc: function (contact, mediaType, showSetupPage)
    {
        this.onEvent('onGlobalEvent_acceptWebRtc', contact, mediaType, showSetupPage);
    },

    onGlobalEvent_openContact: function (contact) {
        if (!isValid(contact) || !contact.isRealContact()) {
            return;
        }

        this.onEvent('onGlobalEvent_openContact', contact);
    },

    onGlobalEvent_openJournalEntry: function (journalEntry) {
        if (!isValid(journalEntry)) {
            return;
        }

        this.onEvent('onGlobalEvent_openJournalEntry', journalEntry);
    },

    onGlobalEvent_AddOrEditNotice: function (journalEntry) {
        if (!isValid(journalEntry)) {
            return;
        }

        this.onEvent('onGlobalEvent_AddOrEditNotice', journalEntry);
    },

    onGlobalEvent_openSettings: function () {
        this.onEvent('onGlobalEvent_openSettings');
    },

        
    onGlobalEvent_ChannelSelected: function (channel, isStartPage)
    {
        this.onEvent('onGlobalEvent_ChannelSelected', channel, isStartPage);
    },

    onGlobalEvent_TelephoneChannelSelected: function (channel)
    {
        this.onEvent('onGlobalEvent_TelephoneChannelSelected', channel);
    },

    onGlobalEvent_SearchChannelSelected: function (channel)
    {
        this.onEvent('onGlobalEvent_SearchChannelSelected', channel);
    },

    onGlobalEvent_ChatChannelSelected: function (channel)
    {
        this.onEvent('onGlobalEvent_ChatChannelSelected', channel);
    },

    onGlobalEvent_CreateContact: function (number, contact)
    {
        this.onEvent('onGlobalEvent_CreateContact', number, contact);
    },

    onGlobalEvent_openVideoChat: function (contact, contactInfo)
    {
        this.onEvent('onGlobalEvent_openVideoChat', contact, contactInfo);
    },

    onGlobalEvent_WebRtcVideoAgentInvitation: function (contact, contactInfo)
    {
        this.onEvent('onGlobalEvent_WebRtcVideoAgentInvitation', contact, contactInfo);
    },

    onGlobalEvent_openAudioChat: function (contact, contactInfo)
    {
        this.onEvent('onGlobalEvent_openAudioChat', contact, contactInfo);
    },

    onGlobalEvent_WebRtcAudioAgentInvitation: function (contact, contactInfo, target)
    {
        this.onEvent('onGlobalEvent_WebRtcAudioAgentInvitation', contact, contactInfo, target);
    },

    onGlobalEvent_openUserChat: function (contact)
    {
        this.onEvent('onGlobalEvent_openUserChat', contact);
    },

    onGlobalEvent_openTeamChatOrBlackBoard: function (teamChatOrBlackBoard)
    {
        if (CURRENT_STATE_CHATS.isBlackBoard(teamChatOrBlackBoard))
        {
            this.onGlobalEvent_openBlackBoard(teamChatOrBlackBoard);
        }
        else
        {
            this.onGlobalEvent_openTeamChat(teamChatOrBlackBoard);
        }
    },

    onGlobalEvent_openTeamChat: function (teamChat) {
        this.onEvent('onGlobalEvent_openTeamChat', teamChat);
    },

    onGlobalEvent_openBlackBoard: function (blackBoard) {
        this.onEvent('onGlobalEvent_openBlackBoard', blackBoard);
    },

    onGlobalEvent_RemovePartner: function (partner)
    {
        this.onEvent('onGlobalEvent_RemovePartner', partner);
    },

    onGlobalEvent_openStatistics: function ()
    {
        this.onEvent('onGlobalEvent_openStatistics');
    },

    onGlobalEvent_OpenURL: function (url, title)
    {
        this.onEvent('onGlobalEvent_OpenURL', url, title);
    },

    onGlobalEvent_EmailsAdded: function (store)
    {
        this.onEvent('onGlobalEvent_EmailsAdded', store);
    },

    onGlobalEvent_ChatActive: function (contact)
    {
        this.onEvent('onGlobalEvent_ChatActive', contact);
    },

    onGlobalEvent_TeamChatActive: function (teamChat)
    {
        this.onEvent('onGlobalEvent_TeamChatActive', teamChat);
    },

    onGlobalEvent_EmailsInitialized: function ()
    {
        this.onEvent('onGlobalEvent_EmailsInitialized');
    },

    onGlobalEvent_ConversationTabFocus: function (panel)
    {
        this.onEvent('onGlobalEvent_ConversationTabFocus', panel);
    },

    onGlobalEvent_NumberChatMessagesChanged: function ()
    {
        this.onEvent('onGlobalEvent_NumberChatMessagesChanged');
    },

    onGlobalEvent_NumberMailMessagesChanged: function ()
    {
        this.onEvent('onGlobalEvent_NumberMailMessagesChanged');
    },

    onGlobalEvent_MailChannelSelected: function ()
    {
        this.onEvent('onGlobalEvent_MailChannelSelected');
    },

    onGlobalEvent_MailProcessingChanged: function (mailProcessing, needClear)
    {
        this.onEvent('onGlobalEvent_MailProcessingChanged', mailProcessing, needClear);
    },

    onGlobalEvent_ResetMissedCalls: function ()
    {
        this.onEvent('onGlobalEvent_ResetMissedCalls');
    },
    
    onGlobalEvent_PartnerListSettingsChanged: function()
    {
        this.onEvent('onGlobalEvent_PartnerListSettingsChanged');
    },

    onGlobalEvent_ShortcutGroupTabPanelVisibilityChanged: function (visible) {
        this.onEvent('onGlobalEvent_ShortcutGroupTabPanelVisibilityChanged', visible);
    },

    onGlobalEvent_SearchContact: function (target, saveSelectedContactFunction, hasSelectButton, overlayButtons, titleText)
    {
        this.onEvent('onGlobalEvent_SearchContact', target, saveSelectedContactFunction, hasSelectButton, overlayButtons, titleText);
    },

    onGlobalEvent_startVideoChat: function ()
    {
        this.onEvent('onGlobalEvent_startVideoChat');
    },

    onGlobalEvent_openBlackBoardDialog: function ()
    {
        this.onEvent('onGlobalEvent_openBlackBoardDialog');
    },

    onGlobalEvent_openTeamChatDialog: function ()
    {
        this.onEvent('onGlobalEvent_openTeamChatDialog');
    },

    onGlobalEvent_startUserChat: function ()
    {
        this.onEvent('onGlobalEvent_startUserChat');
    },

    onGlobalEvent_showDialogForNewCall: function ()
    {
        this.onEvent('onGlobalEvent_showDialogForNewCall');
    },

    onGlobalEvent_showDialogForDirectTransfer: function (callId)
    {
        this.onEvent('onGlobalEvent_showDialogForDirectTransfer', callId);
    },

    onGlobalEvent_showDialogForACDTransfer: function (callId)
    {
        this.onEvent('onGlobalEvent_showDialogForACDTransfer', callId);
    },

    onGlobalEvent_setCallDiversion: function()
    {
        this.onEvent('onGlobalEvent_setCallDiversion');
    },

    onGlobalEvent_createInvitation: function (contact) {

        this.onEvent('onGlobalEvent_createInvitation', contact);
    },

    onGlobalEvent_showInvitations: function () {

        this.onEvent('onGlobalEvent_showInvitations');
    },

    onGlobalEvent_NewLastChatMessage: function (message, contact)
    {
        this.onEvent('onGlobalEvent_NewLastChatMessage', message, contact);
    },

    onGlobalEvent_NewLastTeamChatMessage: function (message, teamChatRoom, contact)
    {
        this.onEvent('onGlobalEvent_NewLastTeamChatMessage', message, teamChatRoom, contact);
    },

    onGlobalEvent_DeleteUserChat: function (record)
    {
        this.onEvent('onGlobalEvent_DeleteUserChat', record);
    },

    onGlobalEvent_UploadMyImageFinished: function (newImageUrl)
    {
        this.onEvent('onGlobalEvent_UploadMyImageFinished', newImageUrl);
    },

    onGlobalEvent_newWebRtcConfiguration: function (configuration)
    {
        this.onEvent('onGlobalEvent_newWebRtcConfiguration', configuration);
    },

    onGlobalEvent_mouseOverTile: function (tile, contact, event)
    {
        this.onEvent('onGlobalEvent_mouseOverTile', tile, contact, event);
    },

    onGlobalEvent_mouseOutTile: function (tile, contact, event)
    {
        this.onEvent('onGlobalEvent_mouseOutTile', tile, contact, event);
    },

    onGlobalEvent_contextMenuForTile: function(tile, contact, event)
    {
        this.onEvent('onGlobalEvent_contextMenuForTile', tile, contact, event);
    },

    onGlobalEvent_showError: function (errorText, timeoutInSeconds, referenceId)
    {
        this.onEvent('onGlobalEvent_showError', errorText, timeoutInSeconds, referenceId);
    },

    onGlobalEvent_showWarning: function (errorText, timeoutInSeconds, referenceId)
    {
        this.onEvent('onGlobalEvent_showWarning', errorText, timeoutInSeconds, referenceId);
    },

    onGlobalEvent_showInfo: function (errorText, timeoutInSeconds, referenceId)
    {
        this.onEvent('onGlobalEvent_showInfo', errorText, timeoutInSeconds, referenceId);
    },

    onGlobalEvent_showConfirmation: function (confirmation)
    {
        this.onEvent('onGlobalEvent_showConfirmation', confirmation);
    },

    onGlobalEvent_removeErrorMessage: function (referenceId)
    {
            this.onEvent('onGlobalEvent_removeErrorMessage', referenceId);
    },

    onGlobalEvent_OpenDevicesSettings: function ()
    {
        this.onEvent('onGlobalEvent_OpenDevicesSettings');
    },

    onGlobalEvent_openMainPanel: function (panel)
    {
        this.onEvent('onGlobalEvent_openMainPanel', panel);
    },

    onGlobalEvent_editContact: function (contact)
    {
        this.onEvent('onGlobalEvent_editContact', contact);
    },
        
    onEvent: function (eventName, callback)
    {
        var args = Ext.Array.toArray(arguments, 1);
        var copyListeners = Ext.clone(this.eventListeners);
        Ext.each(copyListeners, function (listener)
        {
            if (isValid(listener[eventName]))
            {
                listener[eventName].apply(listener, args);
            }
        });
    }
});

var GLOBAL_EVENT_QUEUE = Ext.create('GlobalEventQueue', {});