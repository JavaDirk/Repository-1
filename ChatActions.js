class BaseActionsForChatOverview extends ContactActions
{
    getDeleteHistoryAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return true;
            },
            imageUrl: 'images/64/trash.png',
            text: LANGUAGE.getString("deleteHistory"),
            clickListener: (button, buttons) =>
            {
                if (buttons.hideButtons)
                {
                    buttons.hideButtons();
                }

                this.parent.createConfirmButton(this.item, this.record, LANGUAGE.getString("reallyDeleteHistory"), (record, item) =>
                {
                    this.deleteHistory(record, item);
                });
            }
        };
    }

    deleteHistory(record, item)
    {
        this.parent.deleteEntry(record, item);
    }

    getDeleteAction()
    {
        return {
            shouldBeVisible: () =>
            {
                if (this.record.data.waitMessage)
                {
                    return false;
                }
                return isValid(this.record);
            },
            imageUrl: 'images/64/remove.png',
            text: LANGUAGE.getString("removeFromList"),
            clickListener: (button, buttons) =>
            {
                if (buttons.hideButtons)
                {
                    buttons.hideButtons();
                }

                this.delete();
            }
        };
    }

    delete()
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_DeleteUserChat(this.record);
        animateDeleteEntry(this.item, () =>
        {
            this.parent.deleteFromStore(this.record);
        });
    }
}

class UserChatActions extends BaseActionsForChatOverview
{
    constructor(record, item, parent)
    {
        super(parent.getContactOutOfRecord(record));
        this.parent = parent;
        this.record = record;
        this.item = item;
    }

    getActionList()
    {
        return [
            this.getCallContactAction(),
            this.getMailAction(),
            this.getVideoCallAction(),
            this.getAudioCallAction(),
            this.getAddToFavoritesAction(),
            this.getRemoveFromFavoritesAction(),
            this.getDeleteHistoryAction(),
            this.getDeleteAction()
        ];
    }
}

class LiveChatActions extends UserChatActions
{
    getActionList()
    {
        return [
            this.getCallContactAction(),
            this.getMailAction(),
            this.getVideoCallAction(),
            this.getAudioCallAction(),
            this.getDeleteAction()
        ];
    }
}

class TeamChatActions extends BaseActionsForChatOverview
{
    constructor(record, item, parent)
    {
        super(record);
        this.parent = parent;
        this.record = record;
        this.item = item;
    }

    getActionList()
    {
        return [
            this.getShowNotificationsAction(),
            this.getHideNotificationsAction(),
            this.getDeleteHistoryAction(),
            this.getDeleteAction()
        ];
    }

    getShowNotificationsAction()
    {
        return {
            imageUrl: 'images/64/bell.png',
            text: LANGUAGE.getString("showNotifications"),
            clickListener: (button, buttons) =>
            {
                this.record.data.setShowNotification(true);

                this.parent.saveAllTeamChats();
                this.updateVisibility(buttons);
            },

            shouldBeVisible: () =>
            {
                if (this.record.data.waitMessage)
                {
                    return false;
                }
                return !this.record.data.getShowNotification();
            }
        };
    }

    getHideNotificationsAction()
    {
        return {
            imageUrl: 'images/64/bell.png',
            color: COLOR_FAVORITE_BUTTON,
            text: LANGUAGE.getString("hideNotifications"),
            clickListener: (button, buttons) =>
            {
                this.record.data.setShowNotification(false);

                this.parent.saveAllTeamChats();
                this.updateVisibility(buttons);
            },

            shouldBeVisible: () =>
            {
                if (this.record.data.waitMessage)
                {
                    return false;
                }
                return this.record.data.getShowNotification();
            }
        };
    }

    getDeleteHistoryAction() 
    {
        var action = super.getDeleteHistoryAction();
        action.shouldBeVisible = () =>
        {
            return CURRENT_STATE_CHATS.amIModerator(this.record.data.getGuid());
        };
        return action;
    }

    deleteHistory(record)
    {
        SESSION.deleteTeamChatHistory(record.data.getGuid());
    }

    delete()
    {
        animateDeleteEntry(this.item, () =>
        {
            this.parent.deleteEntry(this.record, this.item);
        });
    }
}
