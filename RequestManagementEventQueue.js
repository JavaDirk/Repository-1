Ext.define('RequestManagementEventQueue',
{
    extend: 'BaseEventQueue',

    eventListeners: [],

    onRequestManagementEvent_updateViewIfNeeded: function (email, store)
    {
        this.onEvent('onRequestManagementEvent_updateViewIfNeeded', email, store);
    },

    onRequestManagementEvent_createNewTab: function (panel)
    {
        this.onEvent('onRequestManagementEvent_createNewTab', panel);
    },

    onRequestManagementEvent_checkIfActionIsPossible: function (target, ticketId, yesCallBackFunction, noCallBackFunction)
    {
        this.onEvent('onRequestManagementEvent_checkIfActionIsPossible', target, ticketId, yesCallBackFunction, noCallBackFunction);
    },

    onRequestManagementEvent_hideRankingTooltip: function ()
    {
        this.onEvent('onRequestManagementEvent_hideRankingTooltip');
    },

    onRequestManagementEvent_updateNavigationSelect: function (newTab)
    {
        this.onEvent('onRequestManagementEvent_updateNavigationSelect', newTab);
    },

    onRequestManagementEvent_checkIfTabAlreadyExists: function (name, handlerFunction)
    {
        this.onEvent('onRequestManagementEvent_checkIfTabAlreadyExists', name, handlerFunction);
    },

    onRequestManagementEvent_addViewToTabPanel: function (store, title)
    {
        this.onEvent('onRequestManagementEvent_addViewToTabPanel', store, title);
    },

    onRequestManagementEvent_removeTab: function (panel)
    {
        this.onEvent('onRequestManagementEvent_removeTab', panel);
    },

    onRequestManagementEvent_hideAnswerRequestPanel: function ()
    {
        this.onEvent('onRequestManagementEvent_hideAnswerRequestPanel');
    },

    onRequestManagementEvent_showAnswerRequestPanel: function ()
    {
        this.onEvent('onRequestManagementEvent_showAnswerRequestPanel');
    },

    onRequestManagementEvent_showRequestConversation: function (email)
    {
        this.onEvent('onRequestManagementEvent_showRequestConversation', email);
    },

    onRequestManagementEvent_showSearch: function (searchParameters)
    {
        this.onEvent('onRequestManagementEvent_showSearch', searchParameters);
    },

    onRequestManagementEvent_displayNoEmailsView: function (store)
    {
        this.onEvent('onRequestManagementEvent_displayNoEmailsView', store);
    },

    onRequestManagementEvent_splitterHeightChanged: function (requestHeight, emailHeight)
    {
        this.onEvent('onRequestManagementEvent_splitterHeightChanged', requestHeight, emailHeight);
    },

    onRequestManagementEvent_splitterHeightChangedForSearch: function (requestHeight, emailHeight)
    {
        this.onEvent('onRequestManagementEvent_splitterHeightChangedForSearch', requestHeight, emailHeight);
    },

    onRequestManagementEvent_splitterHeightReplyPanelChanged: function (requestContainer, replyContainer)
    {
        this.onEvent('onRequestManagementEvent_splitterHeightReplyPanelChanged', requestContainer, replyContainer);
    },

    onRequestManagementEvent_toggleTab: function (tab, tabFunction)
    {
        this.onEvent('onRequestManagementEvent_toggleTab', tab, tabFunction);
    },

    onRequestManagementEvent_createNewTicket: function ()
    {
        var replyHeader = new EmailHeaderForNewTicket(
        {
            margin: '10 0 0 0',
            headerData: {},
            email: {}
        });

        var actionData =
        {
            mailType: MailType.NewTicket.value
        };

        var email =
        {
            type: MailType.NewTicket.value,
            mailId: -1,
            fullId: ''
        };

        var replyPanel = new ReplyCustomerPanel(
        {
            titleHeader: LANGUAGE.getString('newTicket'),
            title: LANGUAGE.getString('newTicket'),
            userEmailContainer: undefined,
            email: email,
            userHeaderData: {},
            replyHeader: replyHeader,
            isOpenEmail: false,
            userActions: Ext.create('UserActionButtonsForNewTicket',
                {
                    actionData: actionData,
                    email: email
            })
        });

        replyPanel.userActions.parentContainer = replyPanel;

        this.onRequestManagementEvent_createNewTab(replyPanel);
    },

    onRequestManagementEvent_selectEmailInEditEmailsFolder: function (email)
    {
        this.onEvent('onRequestManagementEvent_selectEmailInEditEmailsFolder', email);
    },

    onRequestManagementEvent_setActiveEmail: function (index, store)
    {
        this.onEvent('onRequestManagementEvent_setActiveEmail', index, store);
    },

    onRequestManagementEvent_newGroupChosenForNewTicket: function (groupId)
    {
        this.onEvent('onRequestManagementEvent_newGroupChosenForNewTicket', groupId);
    },

    onRequestManagementEvent_cancelMail: function (email)
    {
        this.moveMailFromEditToOpen(email);
    },

    moveMailFromEditToOpen: function (email)
    {
        var cancelEmail = Ext.clone(email);
        cancelEmail.state = emailState.Assigned.value;
        cancelEmail.originalState = emailState.Assigned.value;

        EDIT_REQUEST_STORE.removeEmail(cancelEmail);
        OPEN_REQUEST_STORE.addEmails([cancelEmail]);

        OPEN_REQUEST_STORE.selectEmail(OPEN_REQUEST_STORE.getStoreIndexForFullId(cancelEmail.fullId));
    }

});

var REQUEST_MANAGEMENT_EVENT_QUEUE = Ext.create('RequestManagementEventQueue', {});