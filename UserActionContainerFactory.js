Ext.define('UserActionContainerFactory',
{
    constructor: function ()
    {

    },

    createUserActionContainer: function (userActionData, parentContainer, email, headerData)
    {
        var className = this.getClassnameForUserActionContainer(userActionData, parentContainer);

        if (className)
        {
            var userActionContainer = Ext.create(className,
            {
                actionData: userActionData,
                userActionData: userActionData,
                parentContainer: parentContainer,
                email: email,
                headerData: headerData
            });

            return userActionContainer;
        }
        else
        {
            return undefined;
        }
    },
    
    getClassnameForUserActionContainer: function (userActionData, parentContainer)
    {
        if (!userActionData)
        {
            return undefined;
        }

        var store = userActionData.store;
        var curState = userActionData.state;
        var curType = userActionData.mailType;
        var curWorker = userActionData.worker;
        var isRequest = userActionData.isRequest;


        if (curWorker && curWorker.getName && curWorker.getName())
        {
            curWorker = curWorker.getName();
        }

        // Falls es eine Suche ist und die Anfrage einem anderem Agenten zugeteilt ist
        if (store.isSearchStore() && (!curWorker || curWorker && curWorker.indexOf && curWorker.indexOf(MY_CONTACT.getName()) === -1))
        {
            if (curState === emailState.Draft.value)
            {
                return 'UserActionButtonsForDefault';
            }
            else
            {
                return 'UserActionButtonsForSearch';
            }
        }
        // Falls es ein Entwurf ist 
        else if (curState === emailState.Draft.value || store.isDraftStore())
        {
            return 'UserActionButtonsForDraft';
        }
        // Falls es eine Anfrage ist...
        else if (isRequest)
        {
            // Prüfen ob die Anfrage abgeschlossen wurde oder noch offen ist
            if (curState === emailState.Answered.value || curState === emailState.Spam.value || curState === emailState.Worked.value)
            {
                return 'UserActionButtonsForWorkedRequest';
            }
            else if (curState === emailState.Reply3rdParty.value || curState === emailState.Reply.value)
            {
                return 'UserActionButtonsForInboundConversationItem';
            }
            else
            {
                return 'UserActionButtonsForActiveRequest';
            }
        }
        // Falls es eine Antwort des Kunden oder Dritter ist
        else if (curState === emailState.Reply3rdParty.value || curType === MailType.Inbound.value)
        {
            return 'UserActionButtonsForInboundConversationItem';
        }
        // Falls es eine ausgehende E-Mail des Agenten ist
        else if (curType === MailType.Query.value || curType === MailType.Copy.value || curType === MailType.Answer.value)
        {
            return 'UserActionButtonsForPrintAndCopy';

        }
        else if (curState === emailState.SystemMessage.value)
        {
            return 'UserActionButtonsForError';
        }

        return 'UserActionButtonsForDefault';
    }
});