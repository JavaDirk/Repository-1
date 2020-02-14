var SEPARATOR = "Separator";

class ContactActions
{
    constructor(contact, showCallButton = true)
    {
        this.contact = contact;
        this.showCallButton = showCallButton;
    }

    setContact(contact)
    {
        this.contact = contact;
    }

    isValidContact()
    {
        return isValid(this.contact) && !this.contact.ignore;
    }

    getActions()
    {
        if (!this.isValidContact())
        {
            return [];
        }
        return this.getActionList();
    }

    getActionsWithoutSeparators()
    {
        return Ext.Array.filter(this.getActions(), function (action)
        {
            return action !== SEPARATOR;
        });
    }

    getActionList()
    {
        return [];
    }

    getActionsAsOverlayButtons()
    {
        //Bei den anderen Buttons werden diese tatsächlich erzeugt, bei den OverlayButtons nur die configs zurückgegeben. Warum?
        //das liegt daran, dass die OverlayButtons mit dem renderTo-Attribut in die Seite eingefügt werden (müssen).
        //dies kann man nicht später setzen, d.h. es ist nicht möglich, hier zuerst eine Instanz von OverlayButton zu erzeugen
        //und später das renderTo zu setzen

        //TODO: Könnte man hier das renderTo-Ziel übergeben und dann doch die OverlayButtons erzeugen? Würde ne Menge Probleme sparen 
        //und den Code verständlicher machen
        return Ext.Array.map(this.getActionsWithoutSeparators(), function (action)
        {
            action.tooltipText = action.text;
            return action;
        }, this);
    }

    getActionsAsMenuEntries()
    {
        return Ext.Array.map(this.getActions(), (action) =>
        {
            return this.createMenuEntry(action);
        }, this);
    }

    getActionsAsIcons()
    {
        var actions = this.getActionsWithoutSeparators();

        return Ext.Array.map(actions, function (action, index)
        {
            var isLastAction = index === actions.length - 1;
            var button = this.createIcon(action, isLastAction);
            this.updateVisibilityOnNewEvents(button);
            return button;
        }, this);
    }

    createIcon(action, isLastAction)
    {
        var button = this.createButton(action, CLASSNAME_ICON_BUTTON, isLastAction);
        button.tooltip = button.tooltip || button.text;
        button.deleteText();
        button.setMinWidth(30);
        return button;
    }

    getActionsAsIconButtons()
    {
        var actions = this.getActionsWithoutSeparators();

        return Ext.Array.map(actions, function (action, index)
        {
            var isLastAction = index === actions.length - 1;
            var button = this.createIconButton(action, isLastAction);
            this.updateVisibilityOnNewEvents(button);
            return button;
        }, this);
    }

    createIconButton(action, isLastAction)
    {
        var button = this.createButton(action);
        button.tooltip = button.tooltip || button.text;
        button.margin = '0 10 0 0';
        button.deleteText();
        button.setMinWidth(50);
        button.padding = button.menu ? "2 0 2 16" : "2 8 2 8";
        return button;
    }

    getActionsAsButtons()
    {
        var actions = this.getActionsWithoutSeparators();

        return Ext.Array.map(actions, function (action, index)
        {
            var isLastAction = index === actions.length - 1;
            var button = this.createButton(action, null, isLastAction);
            this.updateVisibilityOnNewEvents(button);
            return button;
        }, this);
    }

    createButton(action, additionalCls, isLastAction)
    {
        var buttonConfig =
        {
            color: action.color,
            text: action.text,
            tooltip: action.tooltipText,
            iconName: this.getIconName(action),
            handler: action.clickListener,
            shouldBeVisible: action.shouldBeVisible,
            menu: action.menu,
            margin: isLastAction ? '5 0 0 0' : '5 5 0 0' //marginTop ist deshalb wichtig, weil sonst bei einem Umbruch die Buttons direkt untereinanderhängen
        };
        var button = new RoundThinButton(buttonConfig);
        if (additionalCls)
        {
            button.addCls(additionalCls);
        }
        return button;
    }

    getIconName(action)
    {
        var iconName = action.imageUrl.split('/');
        iconName = iconName[iconName.length - 1];
        return iconName.substr(0, iconName.indexOf('.'));
    }

    updateVisibilityOnNewEvents(button)
    {
        if (!button)
        {
            return;
        }
        button.on('boxready', function ()
        {
            SESSION.addListener(button);

            updateVisibility();
        }, this);
        button.on('destroy', function ()
        {
            SESSION.removeListener(button);
        }, this);

        var updateVisibility = function ()
        {
            if (button.shouldBeVisible)
            {
                button.setVisible(button.shouldBeVisible());
            }
        };
        button.onNewEvents = function (response)
        {
            updateVisibility();
        };
        
    }

    createMenuEntry(action)
    {
        if (action === SEPARATOR)
        {
            return new Ext.menu.Separator({
                margin: '0'
            });
        }
        var imageName = this.getIconName(action);
        if (imageName === "info2")
        {
            imageName = "info";
        }

        var menuItem = {
            iconColor: action.color || COLOR_OVERLAY_BUTTON,
            iconName: imageName,
            text: action.text,
            handler: action.clickListener,
            menu: action.menu
        };
        if (action.shouldBeVisible)
        {
            menuItem.hidden = !action.shouldBeVisible();
        }
        return menuItem;
    }

    getCallContactAction()
    {
        return {
            shouldBeVisible: () =>
            {
                var allNumbers = this.getAllNumbers();
                return this.showCallButton && allNumbers.length > 0 && SESSION.isTelephonyAllowed();
            },
            imageUrl: 'images/64/phone.png',
            text: LANGUAGE.getString("callContact"),
            menu: this.createNumberContextMenu(),
            clickListener: () =>
            {
                var groupId = TIMIO_SETTINGS.getLastSelectedGroupId();

                /*
                var noDialForGroup = !!CLIENT_SETTINGS.getSetting('CONTACT_CENTER', 'noACDCallOnInternalCalls');
                var internalContact = this.contact.addressBook && this.contact.addressBook.isInternal();
                if (noDialForGroup && internalContact)
                {
                    groupId = -1;
                }
                */
                GLOBAL_EVENT_QUEUE.onGlobalEvent_DialForGroup(this.contact, this.getNumberToDial(), groupId, false, this.callbackForMakeCallSuccess);
            },
            numberToDial: this.getNumberToDial()
        };
    }

    setCallbackForMakeCallSuccess(callback)
    {
        this.callbackForMakeCallSuccess = callback;
    }

    getAllNumbers()
    {
        return new TelephoneNumbers(this.contact.getAllNumbers()).removeDuplicateNumbers();
    }

    createNumberContextMenu()
    {
        if (this.getAllNumbers().length <= 1)
        {
            return null;
        }
        return Ext.create('ChooseNumberContextMenu',
        {
            contact: this.contact,
            journalEntry: this.journalEntry,
            numberChosenCallback: (contact, number) =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(contact, number);
            },
            ignoreCallbackDuringInitialization: true
        });
    }

    getNumberToDial()
    {
        var allNumbers = this.getAllNumbers();
        if (Ext.isEmpty(allNumbers))
        {
            return "";
        }
        return allNumbers[0];
    }

    getVideoCallAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isValid(this.contact) && this.contact.isVideoChattable() && SESSION.isFeatureAllowed(TimioFeature.WebRtcOutgoing);
            },
            imageUrl: 'images/64/video.png',
            text: LANGUAGE.getString("videoCall"),
            clickListener: () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openVideoChat(this.contact);
            }
        };
    }

    getAudioCallAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isValid(this.contact) && this.contact.isAudioChattable() && SESSION.isFeatureAllowed(TimioFeature.WebRtcOutgoing);
            },
            imageUrl: 'images/64/microphone.png',
            text: LANGUAGE.getString("audioCall"),
            clickListener: () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openAudioChat(this.contact);
            }
        };
    }

    getMailAction()
    {
        return this.getMailAddressAction(this.contact ? this.contact.getEMail() : "");
    }

    getMailAddressAction(emailAddress)
    {
        return {
            shouldBeVisible: () =>
            {
                return isValidString(emailAddress);
            },
            imageUrl: 'images/64/mail.png',
            text: LANGUAGE.getString("writeEmail"),
            clickListener: () =>
            {
                sendEMail(emailAddress, this.contact);
            },
            addSeparator: true
        };
    }

    getChatAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isValid(this.contact) && this.contact.isChattable() && SESSION.isFeatureAllowed(TimioFeature.Chat);
            },
            imageUrl: 'images/64/chats.png',
            text: LANGUAGE.getString("chat"),
            clickListener: () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openUserChat(this.contact);
            }
        };
    }

    getInvitationsAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isValid(this.contact) && this.contact.showInvitationsButton() && SESSION.isFeatureAllowed(TimioFeature.WebRtcOutgoing);
            },
            imageUrl: 'images/64/invitation.png',
            text: LANGUAGE.getString("invitation"),
            clickListener: () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_createInvitation(this.contact);
            },

            addSeparator: true
        };
    }

    getShowDetailsAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isValid(this.contact) && this.contact.isRealContact();
            },
            imageUrl: 'images/64/info2.png',
            text: LANGUAGE.getString("openContact"),
            clickListener: () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(this.contact);
            }
        };
    }

    getAddToFavoritesAction()
    {
        return {
            imageUrl: 'images/64/favorite.png',
            text: LANGUAGE.getString("addToFavorites"),
            clickListener: (button, buttons) =>
            {
                var updateVisibilityCallback = this.createCallbackForUpdateVisibility(buttons);
                SESSION.addFavourite(this.contact, updateVisibilityCallback, updateVisibilityCallback);
            },

            shouldBeVisible: () =>
            {
                return this.contact.showAddToFavoritesButton() && SESSION.isFeatureAllowed(TimioFeature.Search);
            },

            addSeparator: true
        };
    }

    getRemoveFromFavoritesAction()
    {
        return {
            imageUrl: 'images/64/favorite.png',
            color: COLOR_FAVORITE_BUTTON,
            text: LANGUAGE.getString("removeFromFavorites"),
            clickListener: (button, buttons) =>
            {
                CURRENT_STATE_BUDDY_LIST.updateGUID(this.contact);

                var updateVisibilityCallback = this.createCallbackForUpdateVisibility(buttons);
                SESSION.removeFavourite(this.contact, updateVisibilityCallback, updateVisibilityCallback);
            },

            shouldBeVisible: () =>
            {
                return this.contact.showRemoveFromFavoritesButton() && SESSION.isFeatureAllowed(TimioFeature.Search);
            },

            addSeparator: true,

            onAddFavouriteSuccess: function (response)
            {
                
            },

            onAddFavouriteException: function ()
            {
                
            },

            onRemoveFavouriteSuccess: function (response)
            {
                
            },

            onRemoveFavouriteException: function ()
            {
                
            }
        };
    }
    
    createCallbackForUpdateVisibility(buttons)
    {
        return () =>
        {
            this.updateVisibility(buttons);
        };
    }

    updateVisibility(buttons)
    {
        if (this.parent && this.parent.updateVisibilityOfAllButtons)
        {
            this.parent.updateVisibilityOfAllButtons();
        }
        else
        {
            if (buttons && !buttons.destroyed && buttons.updateVisibilityOfAllButtons)
            {
                buttons.updateVisibilityOfAllButtons();
            }
        }
    }
}

class TeamChatContactActions extends ContactActions
{
    getActionList()
    {
        return [
            this.getChatAction(),
            this.getVideoCallAction(),
            this.getAudioCallAction(),
            this.getInvitationsAction(),
            this.getCallContactAction(),
            this.getMailAction(),
            this.getShowDetailsAction(),
            this.getAddToFavoritesAction(),
            this.getRemoveFromFavoritesAction()
        ];
    }
}

class ContactPanelActions extends ContactActions
{
    constructor(contact, journalEntry, parent, showCallButton)
    {
        super(contact, showCallButton);

        this.journalEntry = journalEntry;
        this.parent = parent;
    }

    getActionList()
    {
        return [
            this.getCallContactAction(),
            this.getVideoCallAction(),
            this.getAudioCallAction(),
            this.getInvitationsAction(),
            this.getChatAction(),
            this.getMailAction(),
            this.getRouteAction(),
            this.getMapAction(),
            this.getAddToFavoritesAction(),
            this.getRemoveFromFavoritesAction(),
            this.getOpenInExternalApplicationAction()
        ];
    }

    collectAllNumbers()
    {
        var numbers = [];
        if (isValid(this.contact))
        {
            numbers = numbers.concat(this.contact.getAllNumbers());
        }
        if (isValid(this.journalEntry))
        {
            numbers = numbers.concat(this.journalEntry.getAllNumbers());
        }
        return new TelephoneNumbers(numbers).removeDuplicateNumbers();
    }

    getCallContactAction()
    {
        var action = super.getCallContactAction();
        action.clickListener = () =>
        {
            var numberToCall;
            if (isValid(this.journalEntry))
            {
                numberToCall = this.journalEntry.getNumber();
            }
            else
            {
                var numbers = this.collectAllNumbers();
                numberToCall = numbers[0];
            }

            GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(this.contact, numberToCall);
        };
        return action;
    }

    getRouteAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isGoogleMapsApiLoaded && isValid(this.contact, 'getAddress()') && isValid(MY_CONTACT, 'getAddress()');
            },
            imageUrl: 'images/64/car.png',
            text: LANGUAGE.getString("route"),
            clickListener: () =>
            {
                this.parent.onRoute(null, this.contact);
            }
        };
    }

    getMapAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isGoogleMapsApiLoaded && isValid(this.contact, 'getAddress()');
            },
            imageUrl: 'images/64/map.png',
            text: LANGUAGE.getString("map"),
            clickListener: () =>
            {
                this.parent.onMap(null, this.contact);
            }
        };
    }

    getOpenInExternalApplicationAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return isValid(this.contact) && isValidString(this.contact.getHostUrl());
            },
            imageUrl: 'images/64/user.png',
            text: isValid(this.contact) ? this.contact.getObjectSource() : LANGUAGE.getString('openInExternalApplication'),
            tooltipText: isValid(this.contact) ? this.contact.getHostUrl() : undefined, 
            clickListener: () =>
            {
                var browserTab = window.open(this.contact.getHostUrl());
                if (isValid(browserTab))
                {
                    browserTab.close();
                }
            }
        };
    }
}

class ContactActionsForContactList extends ContactActions
{
    constructor(contact, showCallButton)
    {
        super(contact, showCallButton);
    }

    getActionList()
    {
        return [
            this.getCallContactAction(),
            this.getChatAction(),
            this.getMailAction(),
            this.getVideoCallAction(),
            this.getAudioCallAction(),
            this.getInvitationsAction(),
            this.getAddToFavoritesAction(),
            this.getRemoveFromFavoritesAction()
        ];
    }
}

class ContactActionsForPersonalContacts extends ContactActionsForContactList
{
    constructor(record, item, parent)
    {
        super(record.data);
        this.item = item;
        this.parent = parent;
        this.record = record;
    }

    getActionList()
    {
        var actions = [
            this.getEditContactAction(),
            this.getDeleteAction()
        ];
        return actions.concat(super.getActionList());
    }


    getDeleteAction() 
    {
        return {
            shouldBeVisible: () =>
            {
                return SESSION.isFeatureAllowed(TimioFeature.Contacts);
            },
            imageUrl: 'images/64/trash.png',
            text: LANGUAGE.getString("removeFromPersonalContacts"),
            clickListener: (button, buttons) =>
            {
                if (buttons && buttons.hideButtons)
                {
                    buttons.hideButtons();
                }
                this.parent.createConfirmDeleteButton(this.item, this.record);
            }
        };
    }

    getEditContactAction()
    {
        return {
            shouldBeVisible: () =>
            {
                return this.contact.isEditable() && SESSION.isFeatureAllowed(TimioFeature.Contacts);
            },
            imageUrl: 'images/64/edit.png',
            text: LANGUAGE.getString("editContact"),
            clickListener: (button, buttons) =>
            {
                this.parent.onEditContact(this.contact);
            }
        };
    }
}

class FavoriteActions extends ContactActionsForContactList
{
    constructor(record, item, parent)
    {
        super(record.data);
        this.item = item;
        this.parent = parent;
        this.record = record;
    }

    getRemoveFromFavoritesAction()
    {
        var action = super.getRemoveFromFavoritesAction();
        action.clickListener = (button, buttons) =>
        {
            if (buttons.hideButtons)
            {
                buttons.hideButtons();
            }

            this.parent.createConfirmDeleteButton(this.item, this.record);
        };
        return action;
    }
}

class PartnerActions extends ContactActionsForContactList
{
    constructor(contact, partner, parent, showRemovePartner)
    {
        super(contact);
        this.parent = parent;
        this.partner = partner;
        this.showRemovePartner = showRemovePartner;
    }

    getActionList()
    {
        var actions = [];
        actions.push(this.getCallContactAction());
        if (this.contact.isValid() && (MY_CONTACT.equals(this.contact) || (isValid(this.contact, 'getSetCallDiversionAllowed') && this.contact.getSetCallDiversionAllowed())))
        {
            actions.push(this.getSetCallDiversionAction());
        }
        actions.push(SEPARATOR);

        var guid = this.parent.getGUID();
        if (CURRENT_STATE_CALL.isPickupAllowedAndPossible(guid))
        {
            actions.push(this.getPickupCallAction());
        }
            
        actions.push(this.getVideoCallAction());
        actions.push(this.getAudioCallAction());
        actions.push(this.getChatAction());
        actions.push(this.getMailAction());
        
        actions.push(SEPARATOR);

        actions.push(this.getShowDetailsAction());
        actions.push(this.getAddToFavoritesAction());
        actions.push(this.getRemoveFromFavoritesAction());
        
        if (this.showRemovePartner)
        {
            actions.push(SEPARATOR);
            actions.push(this.getRemovePartnerAction());
        }
        return actions;
    }

    getPickupCallAction()
    {
        return {
            text: LANGUAGE.getString("pickup"),
            imageUrl: 'images/64/phone.png',
            clickListener: () =>
            {
                this.parent.pickupCall(this.contact);
            }
        };
    }

    getRemovePartnerAction()
    {
        return {
            text: LANGUAGE.getString('removePartner'),
            imageUrl: 'images/64/remove.png',
            clickListener: () =>
            {
                GLOBAL_EVENT_QUEUE.onGlobalEvent_RemovePartner(this.partner);
            }
        };
    }

    getSetCallDiversionAction()
    {
        return {
            text: LANGUAGE.getString('setRemoveCallDiversion'),
            imageUrl: 'images/64/redirection.png',
            clickListener: () =>
            {
                var lineId;
                SESSION.getLineIdByGuid(this.parent.getGUID(), (response) =>
                {
                    if (response.getReturnValue().getCode() === 0)
                    {
                        lineId = response.getLineId();
                        var dialog = Ext.create('DiversionPanel',
                            {
                                titleText: LANGUAGE.getString("diversionPanelTitleForContact", this.contact.getName()),
                                lineId: lineId
                            });
                        dialog.show();
                    }
                    else
                    {
                        this.parent.showError(response.getReturnValue().getDescription());
                    }
                }, () =>
                {
                    this.parent.showError(LANGUAGE.getString("errorGetLineByGUID"));
                });
            }
        };
    }
}

class ChatHeaderActions extends ContactActions
{
    getActionList()
    {
        return [
            this.getCallContactAction(),
            this.getMailAction(),
            this.getVideoCallAction(),
            this.getAudioCallAction()
        ];
    }
}
