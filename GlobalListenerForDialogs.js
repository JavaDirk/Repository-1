Ext.define('GlobalListenerForDialogs',
{
    constructor: function ()
    {
        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    onGlobalEvent_SearchContact: function (saveSelectedContactFunction, hasSelectButton, overlayButtons, titleText)
    {
        overlayButtons = overlayButtons || false;

        if (this.searchDialog)
        {
            return;
        }

        var searchDialog = new SearchContactWindow(
        {
            titleText: titleText,

            hasSelectButton: hasSelectButton,

            saveSelectedContactFunction: saveSelectedContactFunction || function (){ },

            overlayButtons: overlayButtons
        });

        searchDialog.show();
    },

    onGlobalEvent_startVideoChat: function ()
    {
        var dialog = Ext.create('ChooseVideoPartner', { });
        dialog.show();
    },

    onGlobalEvent_openBlackBoardDialog: function ()
    {
        var dialog = Ext.create('ChooseBlackBoardContainer',
        {
            listClassName: 'BlackBoardListForAllBlackBoards',
            okCallback: function (result)
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openBlackBoard(result);
            }
        });

        dialog.show();
    },

    onGlobalEvent_openTeamChatDialog: function ()
    {
        var dialog = Ext.create('ChooseTeamChatContainer',
        {
            listClassName: 'TeamChatListForAllTeamChatRooms',
            okCallback: function (result)
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openTeamChat(result);
            }
        });
        dialog.show();
    },

    onGlobalEvent_startUserChat: function ()
    {
        var dialog = Ext.create('ChooseChatPartnerContainer', { });
        dialog.show();
    },

    onGlobalEvent_showDialogForNewCall: function ()
    {
        var ctiAction = Ext.create('CTIAction_Dial', {});
        this.showDialogForCTIAction(LANGUAGE.getString("startCall"), LANGUAGE.getString("callContact"), LANGUAGE.getString("dialNumber"), ctiAction, 'SearchResultsPanelForNewCall');
    },

    onGlobalEvent_showDialogForDirectTransfer: function (callId)
    {
        var ctiAction = Ext.create('CTIAction_BlindTransfer',
        {
            callId: callId
        });
        this.showDialogForCTIAction(LANGUAGE.getString("blindTransfer"), LANGUAGE.getString("blindTransfer"), LANGUAGE.getString("transferToNumber"), ctiAction, 'SearchResultsPanelForTransfer');
    },

    onGlobalEvent_showDialogForACDTransfer: function (callId)
    {
        var callEvent = CURRENT_STATE_CALL.getLastCallEvent(callId);
        new ContactCenterForwardDialog(
            {
                callId: callId,
                groupId: callEvent.getACDCallInfo().getGroupId(),
                sessionId: callEvent.getACDCallInfo().getSessionId()
            }).show();
    },

    showDialogForCTIAction: function (title, buttonText, textForAutoCompletion, ctiAction, classNameForSearchResultsPanel) 
    {
        var dialog = Ext.create('ModalDialog',
        {
            titleText: title,
            focus: function ()
            {
                telephoneInputPanelForCall.focus();
            }
        });

        ctiAction.beforeCTIAction = function (response)
        {
            dialog.hide(true);
        };
        
        var telephoneInputPanelForCall = Ext.create('TelephoneInputPanel',
        {
            margin: '0 0 25 0',
            buttonBackgroundColor: 'white',
            searchPanelMarginRight: 5,
            clearComboBoxOnSuccess: false,
            searchResultsPanelClassName: classNameForSearchResultsPanel,
            showOutboundGroup: false,
            textForAutoCompletion_dial: textForAutoCompletion,
            showCallButtons: false
        });

        telephoneInputPanelForCall.setCallButtons(null);
        telephoneInputPanelForCall.setCTIAction(ctiAction);

        dialog.addToBody(telephoneInputPanelForCall);
        dialog.addButton(
        {
            text: buttonText,
            handler: function ()
            {
                var selectedContact = telephoneInputPanelForCall.searchResultsPanel.getSelectedContact();
                if (selectedContact)
                {
                    Ext.create('PickNumberAndStartAction',
                    {
                        ctiAction: ctiAction,
                        searchResultsPanel: telephoneInputPanelForCall.searchResultsPanel,
                        comboBox: telephoneInputPanelForCall.comboBox,
                        button: this,
                        noInputCallback: Ext.emptyFn,
                        showError: function (text)
                        {
                            dialog.changeErrorMessage(text, ErrorType.Info);
                        }
                    }).startActionForSelectedContact();
                }
                else
                {
                    telephoneInputPanelForCall.onStartSearch();
                }
            }
        });
        dialog.show();
    },

    onGlobalEvent_setCallDiversion: function ()
    {
        var dialog = Ext.create('DiversionPanel',
        {
            onError: function (errorText)
            {
                showErrorMessage(errorText, DEFAULT_TIMEOUT_ERROR_MESSAGES);
            }
        });

        dialog.show();
    },

    onGlobalEvent_createInvitation: function (contact)    
    {
        var dialog = Ext.create('InvitationDialog',
        {
            contact: contact
        });
        dialog.show();
    },

    onGlobalEvent_showInvitations: function ()
    {
        var dialog = Ext.create('InvitationListDialog', { });
        dialog.show();
    }
});