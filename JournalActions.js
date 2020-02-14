class JournalActions extends ContactActions
{
    constructor(journalEntry, record, item, parent)
    {
        super(journalEntry.getResolvedAddressInfo());

        this.journalEntry = journalEntry;
        this.record = record;
        this.parent = parent;
        this.item = item;
    }

    isValidJournalEntry()
    {
        return this.journalEntry && !this.journalEntry.ignore;
    }

    getActions()
    {
        if (!this.isValidJournalEntry())
        {
            return [];
        }
        return this.getActionList();
    }

    getActionList()
    {
        var actions =
            [
                this.getCallContactAction(),
                this.getChatAction(),
                this.getMailAddressAction(),
                this.getVideoCallAction(),
                this.getAudioCallAction(),
                this.getInvitationsAction()
            ];
        if (isValid(this.contact) && this.contact.isRealContact())
        {
            actions.push(this.getAddToFavoritesAction());
            actions.push(this.getRemoveFromFavoritesAction());
        }
        actions.push(this.getNoticeAction());
        actions.push(this.getCreateContactAction());
        actions.push(this.getShowContactAction());
        actions.push(this.getDeleteFromJournalAction());

        return actions;
    }

    getMailAddressAction()
    {
        var emailAddress = "";
        if (isValid(this.journalEntry, "getResolvedAddressInfo().getEMail()"))
        {
            emailAddress = this.journalEntry.getResolvedAddressInfo().getEMail();
        }
        var contact = this.journalEntry.getResolvedAddressInfo();
        var mailAddressAction = super.getMailAddressAction(emailAddress);
        mailAddressAction.clickListener = () =>
        {
            var subject = LANGUAGE.getString("ourCallSubject", this.journalEntry.getLongDateAsString());
            sendEMail(emailAddress, contact, subject);
        };
        return mailAddressAction;
    }

    getAllNumbers()
    {
        var mergedNumbers = Ext.Array.merge(this.contact ? this.contact.getAllNumbers() : [], this.journalEntry.getAllNumbers());
        return new TelephoneNumbers(mergedNumbers).removeDuplicateNumbers();
    }

    getNumberToDial()
    {
        return this.journalEntry.getNumber();
    }

    getNoticeAction()
    {
        return {
            imageUrl: 'images/64/file.png',
            text: LANGUAGE.getString(this.journalEntry.hasNotice() ? "editNotice" : "addNotice"),
            clickListener: (button, buttons, item) =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_AddOrEditNotice(this.journalEntry);
            }
        };
    }

    getCreateContactAction() 
    {
        return {
            imageUrl: 'images/64/user.png',
            text: LANGUAGE.getString("createContact"),
            clickListener: (button, buttons, item) =>
            {
                var number = this.journalEntry.getNumber();
                //ein ResolveAddressInfo kann es z.B. geben, wenn es ein GlobalInfo gibt, also Stadt/Land bekannt sind. Diese können dann in den anzulegenden Kontakt eingetragen werden
                GLOBAL_EVENT_QUEUE.onGlobalEvent_CreateContact(number, this.journalEntry.getResolvedAddressInfo());
            },
            shouldBeVisible: () =>
            {
                return isValid(this.journalEntry) && this.journalEntry.showCreateContactButton();
            }
        };
    }

    getShowContactAction()
    {
        return {
            imageUrl: 'images/64/user.png',
            text: LANGUAGE.getString("showContact"),
            clickListener: (button, buttons, item) =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(this.contact);
            },
            shouldBeVisible: () =>
            {
                return this.isValidContact() && this.contact.isRealContact();
            }
        };
    }

    getDeleteFromJournalAction()
    {
        return {
            imageUrl: "images/64/trash.png",
            text: LANGUAGE.getString("removeFromJournal"),
            clickListener: (button, buttons) =>
            {
                if (buttons.hideButtons)
                {
                    buttons.hideButtons();
                }

                this.parent.createConfirmDeleteButton(this.item, this.record);
            }
        };
    }
}

class JournalEntryActions extends JournalActions
{
    constructor(journalEntry, parent)
    {
        super(journalEntry, null, null, parent);
    }
    getActionList()
    {
        var actions =
            [
                this.getCallContactAction(),
                this.getChatAction(),
                this.getMailAddressAction(),
                this.getVideoCallAction(),
                this.getAudioCallAction(),
                this.getInvitationsAction()
            ];
        if (isValid(this.contact) && this.contact.isRealContact())
        {
            actions.push(this.getAddToFavoritesAction());
            actions.push(this.getRemoveFromFavoritesAction());
        }
        actions.push(this.getCreateContactAction());
        actions.push(this.getShowContactAction());
        
        return actions;
    }
}

class ContactJournalActions extends JournalActions
{
    getActionList()
    {
        return [
                this.getChatAction(),
                this.getMailAddressAction(),
                this.getVideoCallAction(),
                this.getAudioCallAction(),
                this.getInvitationsAction(),
                this.getDeleteFromJournalAction()
            ];
    }
}