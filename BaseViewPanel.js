Ext.define('BaseViewPanel',
{
    extend: 'Ext.view.View',

    maxNumberOverlayButtons: 5,

    scrollable: 'vertical',

    overItemCls: 'viewOnHover',

    flex: 1,
    top: '-1px',

    initComponent: function ()
    {
        this.confirmDeleteButtonText = LANGUAGE.getString('removeEntry');

        this.prohibitSelectionOfGroupEntries();

        this.callParent();

        this.adjustNavigationModel();

        var self = this;

        if (this.overlayButtons)
        {
            this.on('itemmouseenter', function (self, record, item, index, event, opts)
            {
                //self.onItemHover(self, record, item, index, event, opts);
            });
            this.on(
            {
                el:
                {
                    mousemove: function (event, item) {
                        var photoElement = self.findParentNode(item, "." + CLASS_FOR_SHOWING);
                        var hoveringOverPhoto = isValid(photoElement);
                        if (hoveringOverPhoto)
                        {
                            var record = self.getRecordForNode(item);
                            if (isValid(record))
                            {
                                var nodeForRecord = self.getNode(record);
                                self.onItemHover(self, record, nodeForRecord);
                            }
                        }
                    }
                }
            });

            this.on('itemmouseleave', function (self, record, item, index, event, opts)
            {
                self.onItemLeave(self, record, item, index, event, opts);
            });
        }

        var onSingleClick = function (view, record, item, index, event, opts)
        {
            //wenn auf einen OverlayButton geklickt wurde, sendet ExtJS den Klick sowohl an den Button als auch an das Listitem
            //dies wird mit dem nächsten Code-Block verhindert
            if (self.wasClickedOnOverlayButton(event) || self.el.dom.style.display === 'none') {
                return;
            }

            if (self.areConfirmDeleteButtonsVisible(item)) {
                self.removeConfirmationButtons(item, record);
                return;
            }

            self.onSingleClick(view, record, item, index, event, opts);
        };
        var onDoubleClick = function (view, record, item, index, event, opts) {
            //wenn auf einen OverlayButton doppelgeklickt wurde, sendet ExtJS den Doppelklick sowohl an den Button als auch an das Listitem
            //dies wird mit dem nächsten Code-Block verhindert
            if (self.wasClickedOnOverlayButton(event) || self.el.dom.style.display === 'none') {
                return;
            }
            setTimeout(function ()
            {
                self.onDoubleClick(view, record, item, index, event, opts);
            }, 0);
        };

        var callSingleOrDoubleClickFunction = function (view, record, item, index, event, opts) {

            var timeout;

            return function (view, record, item, index, event, opts) {

                if (typeof item.clicks === 'undefined')
                {
                    item.clicks = 0;
                }
                item.clicks++;

                if (item.clicks === 1)
                {
                    timeout = setTimeout(function ()
                    {
                        onSingleClick(view, record, item, index, event, opts);
                        Ext.each(view.getNodes(), function (node)
                        {
                            node.clicks = 0;
                        });
                        
                    }, 250);
                }
                else
                {
                    clearTimeout(timeout);
                    onDoubleClick(view, record, item, index, event, opts);
                    Ext.each(view.getNodes(), function (node)
                    {
                        node.clicks = 0;
                    });
                }
            };
        };
        this.on('itemclick', callSingleOrDoubleClickFunction(), this);

        this.on('itemkeydown', function (self, record, item, index, event, opts) 
        {
            var selectedRecord = this.getSelectedRecord(); //ExtJS Bug: wenn man mit der Tastatur navigiert, liefert ExtJS immer den ersten record als Parameter, deshalb holen wir uns hier den selektierten
            record = selectedRecord || record;
            index = this.indexOf(record);
            item = this.getNode(record);
            
            self.onKeyPress(self, record, item, index, event, opts);
        }, this, { delay: 50 });
        
        this.on('itemmouseup', function (record, item, index, event, opts)
        {
            self.onItemMouseUp(record, item, index, event, opts);
        });

        this.on('boxready', function () {
            self.tooltip = Ext.create('Ext.tip.ToolTip',
            {
                target: self.el,
                delegate: self.itemSelector + " .overlayButton",
                showDelay: 1000,
                //hideDelay: 0,
                autoHide: true,
                trackMouse: false,

                listeners:
                {
                    beforeshow: function (tip)
                    {
                        var overlayButton = Ext.getCmp(tip.triggerElement.id);
                        if (overlayButton)
                        {
                            if (overlayButton.contextMenuVisible)
                            {
                                return false;
                            }

                            if (isValidString(overlayButton.tooltipText))
                            {
                                tip.update(overlayButton.tooltipText);
                                return true;
                            }
                        }
                        return false;
                    }
                }
            });
        });

        this.on('destroy', function ()
        {
            if (self.tooltip)
            {
                self.tooltip.destroy();
            }
        });
        SESSION.addListener(this);
    },

    adjustNavigationModel: function ()
    {
        var navigationModel = this.getNavigationModel();

        navigationModel.onKeyHome = function(keyEvent)
        {
            var indices = this.view.getIndicesOfAllValidRecords();
            if (Ext.isEmpty(indices))
            {
                return;
            }
            var newPosition = indices[0];

            this.setPosition(newPosition, keyEvent);
            this.scrollIntoView(newPosition);
        };

        navigationModel.onKeyEnd = function (keyEvent)
        {
            var indices = this.view.getIndicesOfAllValidRecords();
            if (Ext.isEmpty(indices))
            {
                return;
            }
            var newPosition = indices[indices.length - 1];

            this.setPosition(newPosition, keyEvent);
            this.scrollIntoView(newPosition);
        };

        navigationModel.onKeyUp = function (keyEvent)
        {
            var indices = this.view.getIndicesOfAllValidRecords();
            if (Ext.isEmpty(indices))
            {
                return;
            }
            var newPosition = this.recordIndex;
            do
            {
                newPosition = newPosition - 1;
                if (newPosition < 0)
                {
                    newPosition = indices[indices.length - 1];
                    break;
                }
            }
            while (!Ext.Array.contains(indices, newPosition));


            this.setPosition(newPosition, keyEvent);
            this.scrollIntoView(newPosition);
        };

        navigationModel.onKeyDown = function (keyEvent)
        {
            var indices = this.view.getIndicesOfAllValidRecords();
            if (Ext.isEmpty(indices))
            {
                return;
            }

            var newPosition = this.recordIndex;
            do
            {
                newPosition = newPosition + 1;
                if (newPosition > this.view.all.getCount() - 1)
                {
                    newPosition = indices[0];
                    break;
                }
            }
            while (!Ext.Array.contains(indices, newPosition));

            this.setPosition(newPosition, keyEvent);
            this.scrollIntoView(newPosition);
        };

        navigationModel.onKeyRight = function(keyEvent)
        {
            this.onKeyDown(keyEvent);
        }

        navigationModel.onKeyLeft = function (keyEvent)
        {
            this.onKeyUp(keyEvent);
        };

        navigationModel.onKeySpace = (keyEvent) =>
        {
            this.onNavigationKey(keyEvent);
        };

        navigationModel.onKeyEnter = (keyEvent) =>
        {
            this.onNavigationKey(keyEvent);
        };

        navigationModel.scrollIntoView = function (index)
        {
            var record = this.view.dataSource.getAt(index);
            var node = this.view.getNode(record);
            if (node && !isElementVisibleInParent(node, this.view.el.dom))
            {
                node.scrollIntoView(this.el, null, true);
            }
        };

        Ext.destroy(navigationModel.keyNav);
        navigationModel.initKeyNav(this);
    },

    onNavigationKey: function (keyEvent)
    {
        keyEvent.stopEvent();

        var selectedRecord = this.getSelectedRecord();
        var index = this.indexOf(selectedRecord);
        var item = this.getNode(selectedRecord);

        switch (keyEvent.keyCode)
        {
            case keyEvent.ENTER:
                this.onDoubleClick(this, selectedRecord, item, index, keyEvent);
                break;
            case keyEvent.SPACE:
                this.onSingleClick(this, selectedRecord, item, index, keyEvent);
                break;
        }
    },

    getIndexOfFirstRealRecord: function ()
    {
        var indices = this.getIndicesOfAllValidRecords();
        if (Ext.isEmpty(indices))
        {
            return -1;
        }
        return indices[0];
    },

    getIndicesOfAllValidRecords: function ()
    {
        var indices = [];
        this.getStore().each(function (record, index)
        {
            if (record && record.data.ignore)
            {
                return;
            }
            indices.push(index);
        }, this);
        return indices;
    },

    prohibitSelectionOfGroupEntries: function ()
    {
        this.setSelectionModel(new Ext.selection.DataViewModel(
        {
            listeners:
            {
                beforeselect: function (t, record, index)
                {
                    if (record.data.ignore)
                    {
                        return false;
                    }
                }
            }
        }));
    },

    findParentNode: function(item, simpleSelector, limit, returnEl) {
        var p = Ext.fly(item);
        return p ? p.findParent(simpleSelector, limit, returnEl) : null;
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    wasClickedOnOverlayButton: function (event)
    {
        if (isValid(event, "browserEvent.target"))
        {
            //den DOM nach oben wandern und gucken, ob bei den Elementen ein OverlayButton dabei war
            var element = event.browserEvent.target;
            var overlayButtonElement = Ext.get(element).up("." + CLASS_NAME_OVERLAY_BUTTON);
            return isValid(overlayButtonElement);
        }
        return false;
    },

    getSelectedRecord: function ()
    {
        var selection = this.getSelectionModel().getSelected();
        if (selection && !Ext.isEmpty(selection.items))
        {
            return selection.items[0];
        }
        return null;
    },

    onKeyPress: function (self, record, item, index, event, opts)
    {
        switch(event.getKey())
        {
            case event.ESC:
                this.onEscape(self, record, item, index, event, opts);
                break;
        }
    },

    onSingleClick: function (view, record, item, index, event, opts)
    {
        if (this.openContactOnSelect)
        {
            this.selectContact(this, record, item, index, event, opts);
        }
    },

    onDoubleClick: function (view, record, item, index, event, opts)
    {
        this.startDefaultAction(record, item);
    },

    startDefaultAction: function (record, item)
    {
        var buttons = Ext.Array.clean(this.getOverlayButtons(record, item));
        if (buttons.length > 0)
        {
            this.onStartAction(record, buttons[0].numberToDial);
            buttons[0].clickListener();
        }
    },

    selectContact: function (self, record, item, index, event, opts)
    {
        if (this.areConfirmDeleteButtonsVisible(item))
        {
            this.onItemHover(self, record, item, index, event, opts);
        }
        else
        {
            this.onContactSelected(record, item);
        }
    },

    onContactSelected: function (record, item)
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(this.getContactOutOfRecord(record));
    },

    getContactOutOfRecord: function (record)
    {
        return record.data;
    },

    onEscape: function (view, record, item, index, event, opts)
    {

    },

    areConfirmDeleteButtonsVisible: function (item)
    {
        var result = false;
        Ext.each(item.childNodes, function (child)
        {
            if (child.className && child.className.indexOf(CLASSNAME_CONFIRM_DELETE_BUTTON) >= 0)
            {
                result = true;
            }
        });
        return result;
    },

    removeConfirmationButtons: function (item, record)
    {
        Ext.each(item.childNodes, function (child)
        {
            if (child.className && child.className.indexOf(CLASSNAME_CONFIRM_DELETE_BUTTON) >= 0)
            {
                item.removeChild(child);
            }
        });
        record.confirmButton = null;

        if (isValid(item.overlayButtons)) {
            item.overlayButtons.showButtons();
        }
        else {
            this.showPartOfItemForOverlayButtons(item);
        }
    },

    onItemLeave: function (self, record, item, index, event, opts)
    {
        if (isValid(item.overlayButtons))
        {
            //item.overlayButtons.removeFromRenderToItem();
            item.overlayButtons.hideButtons();
        }

        if (!this.areConfirmDeleteButtonsVisible(item))
        {
            this.showPartOfItemForOverlayButtons(item);
        }
    },

    onItemHover: function (self, record, item, index, event, opts)
    {
        this.showOverlayButtons(record, item);
    },

    showOverlayButtons: function (record, item)
    {
        if (this.areConfirmDeleteButtonsVisible(item))
        {
            return;
        }

        this.hidePartOfItemForOverlayButtons(item);

        //Im Template sollte ein div mit der Klasse showForOverlayButtons sein, in denen die Buttons dargestellt werden sollen
        var overlayButtonContainerEl = getHTMLElements(".showForOverlayButtons", false, item);
        if (overlayButtonContainerEl.length > 0)
        {
            overlayButtonContainerEl = overlayButtonContainerEl[0];
        }
        else
        {
            overlayButtonContainerEl = item;
        }
        if (!isValid(item.overlayButtons))
        {
            item.overlayButtons = Ext.create('OverlayButtons',
                {
                    renderToItem: overlayButtonContainerEl,
                    parent: this,
                    record: record
                });
        }

        //wenn sich sowohl die Breite als auch der record nicht geändert hat, dann zeigen wir die bisherigen Buttons an,
        //ansonst nochmal neu erzeugen. Dies ist dann notwendig, wenn die Präsenz des Kontakts sich geändert hat (bspw. VideoCall ist dann möglich) oder 
        //die Breite des Containers, in dem die Buttons sind, sich ändert
        var overlayButtonContainer = Ext.get(overlayButtonContainerEl);

        if (this.constraintsHaveChanged(overlayButtonContainer, record, item))
        {
            //die width ändert sich z.B. wenn man durch den slider die linke Spalte kleiner oder größer macht. 
            this.saveWidthAndNumberVisibleOverlayButtons(overlayButtonContainer, record, item);

            item.overlayButtons.removeFromRenderToItem();

            //wenn zuviele OverlayButtons angezeigt werden sollen, dann pack die übrigen in einen more-Button mit Kontextmenü für die restlichen Aktionen
            var width = overlayButtonContainer.getWidth();
            var maxNumberOverlayButtons = Math.max(1, Math.min(width / (OVERLAY_BUTTON_SIZE + 2 * OVERLAY_BUTTON_MARGIN), this.maxNumberOverlayButtons));

            record.buttonsToShowAsMenuEntries = [];
            var moreButton = null;
            var buttons = this.getOverlayButtons(record, item);
            while (this.getNumberVisibleOverlayButtons(buttons, moreButton) > maxNumberOverlayButtons)
            {
                if (moreButton === null)
                {
                    moreButton = this.getOverlayButtonForMore(record, item);
                }
                var lastButton = buttons[buttons.length - 1];
                if (!isValid(lastButton, "shouldBeVisible") || lastButton.shouldBeVisible())
                {
                    Ext.Array.insert(record.buttonsToShowAsMenuEntries, 0, [lastButton]);

                }
                Ext.Array.remove(buttons, lastButton);
            }
            if (moreButton)
            {
                buttons.push(moreButton);
            }
            Ext.each(buttons, function (button)
            {
                item.overlayButtons.addButton(button);
            });
        }
        else
        {
            item.overlayButtons.showButtons();
        }
    },

    constraintsHaveChanged: function (overlayButtonContainer, record, item)
    {
        if (overlayButtonContainer.savedWidth === overlayButtonContainer.getWidth() &&
            overlayButtonContainer.savedVisibleOverlayButtons === this.getVisibleOverlayButtons(Ext.Array.clean(this.getOverlayButtons(record, item))))
        {
            return false;
        }
        return true;
    },

    saveWidthAndNumberVisibleOverlayButtons: function (overlayButtonContainer, record, item)
    {
        overlayButtonContainer.savedWidth = overlayButtonContainer.getWidth();
        overlayButtonContainer.savedVisibleOverlayButtons = this.getVisibleOverlayButtons(Ext.Array.clean(this.getOverlayButtons(record, item)));
    },

    getNumberVisibleOverlayButtons: function (buttons, moreButton)
    {
        var numberVisibleButtons = this.getVisibleOverlayButtons(buttons).length;
        return numberVisibleButtons + (moreButton ? 1 : 0);
    },

    getVisibleOverlayButtons: function (buttons)
    {
        var result = [];
        Ext.each(buttons, function (button)
        {
            if (isValid(button, "shouldBeVisible") && !button.shouldBeVisible()) {
                return;
            }

            result.push(button);
        });
        return result;
    },

    showPartOfItemForOverlayButtons: function (item)
    {
        this.changeAttributeOfChild(item, "hideForOverlayButtons", "display", "flex");
        this.changeAttributeOfChild(item, "showForOverlayButtons", "display", "none");
    },

    hidePartOfItemForOverlayButtons: function (item)
    {
        this.changeAttributeOfChild(item, "hideForOverlayButtons", "display", "none");
        this.changeAttributeOfChild(item, "showForOverlayButtons", "display", "flex");
    },

    changeAttributeOfChild: function (item, className, attributeName, value)
    {
        if (!isValid(item))
        {
            return;
        }
            
        var children = getHTMLElements('.' + className, false, item);
        Ext.each(children, function (child)
        {
            child.style[attributeName] = value;
        });
    },

    onItemMouseUp: function (record, item, index, event, opts)
    {
        if (event.button === 2)
        {
            this.onItemRightClick(record, item, index, event, opts);
        }
    },

    onItemRightClick: function (record, item, index, event, opts)
    {
        this.getSelectionModel().select(index);
        
        var buttons = Ext.Array.clean(this.getOverlayButtons(record, item));
        if (Ext.isEmpty(buttons))
        {
            return;
        }
        var menuEntries = this.convertOverlayButtonsToMenuEntries(buttons);

        var contextMenu = Ext.create('CustomMenu',
        {
            insertItems: menuEntries
        });

        contextMenu.showAt(event.pageX, event.pageY);
    },

    getOverlayButtons: function (record, item)
    {
        return this.getActions(record, item).getActionsAsOverlayButtons();
    },

    //@override
    getActions: function (record, item)
    {

    },
    
    getOverlayButtonForMore: function (record, item)
    {
        var self = this;
        return {
            shouldBeVisible: function ()
            {
                if (!isValid(record)) {
                    return false;
                }
                var contact = self.getContactOutOfRecord(record);
                if (isValid(contact) && (!contact.isValid() || contact.pseudoContact)) {
                    return false;
                }
                return true;
            },
            imageUrl: 'images/64/more.png',
            tooltipText: LANGUAGE.getString("moreButtons"),
            clickListener: function (button, buttons, row)
            {
                var menuEntries = self.convertOverlayButtonsToMenuEntries(record.buttonsToShowAsMenuEntries);
                var contextMenu = Ext.create('CustomMenu',
                {
                    highlightFirstMenuItem: false,
                    insertItems: menuEntries,
                    listeners:
                    {
                        hide: function ()
                        {
                            button.contextMenuVisible = false;
                        }
                    }
                });
                contextMenu.overlayButton = button;

                var target = this;
                if (isValid(this, "el.dom"))
                {
                    if (this.el.dom.style.display === 'none')
                    {
                        target = item;
                    }
                }
                contextMenu.showBy(target, null, "c-c");
                button.contextMenuVisible = true;
            },
            buttonsToShowAsMenuEntries: []
        };
    },

    convertOverlayButtonsToMenuEntries: function (buttons) {
        var visibleButtons = [];
        var menuEntries = [];

        //wir machen bewußt zweimal das Ext.each, damit die Logik mit dem Ext.menu.Separator zieht, dass am Ende des MEnus kein Separator stehen darf
        Ext.each(buttons, function (button)
        {
            if (isValid(button, "shouldBeVisible") && !button.shouldBeVisible()) {
                return;
            }
            visibleButtons.push(button);
        }, this);
        Ext.each(visibleButtons, function (button, index)
        {
            var menuEntry = new ContactActions().createMenuEntry(button);
            menuEntries.push(menuEntry);
            if (button.addSeparator && index !== visibleButtons.length - 1)
            {
                menuEntries.push(new Ext.menu.Separator({ }));
            }
        }, this);
        return [menuEntries];
    },
        
    showConfirmationButtonForRemoveFromFavorite: function ()
    {
        return false;
    },

    refresh: function ()
    {
        var recordsWithConfirmDeleteButton = [];
        if (!isValid(this.getStore()))
        {
            return;
        }
        this.getStore().each(function (record)
        {
            if (isValid(record.confirmDeleteButton))
            {
                recordsWithConfirmDeleteButton.push(record);
            }
        }, this);

        this.callParent();

        Ext.each(recordsWithConfirmDeleteButton, function (record)
        {
            var contact = this.getContactOutOfRecord(record);
            if (!isValid(contact))
            {
                return;
            }
            var node = this.getNode(record);
            if (isValid(node))
            {
                this.createConfirmDeleteButton(node, record);
            }
        }, this);
    },

    createConfirmDeleteButton: function (item, record)
    {
        this.createConfirmButton(item, record, this.confirmDeleteButtonText, (record, item) =>
        {
            this.deleteEntry(record, item);
        });
        this.hidePartOfItemForOverlayButtons(item);
    },

    createConfirmButton: function (item, record, text, handler)
    {
        var self = this;

        if (isValid(record.confirmButton))
        {
            return;
        }

        this.hidePartOfItemForOverlayButtons(item);

        record.confirmButton = Ext.create(CLASSNAME_CONFIRM_DELETE_BUTTON,
            {
                text: text,
                renderTo: item,
                listeners:
                {
                    click: function (button, event)
                    {
                        event.stopPropagation();
                        handler(record, item);
                    }
                }
            });
        record.confirmButton.on('blur', function (button, event)
        {
            //wir kommen hier auch rein, wenn auf den Button geklickt wurde! Deswegen diese Abfrage
            if (button.el.dom !== event.relatedTarget)
            {
                self.removeConfirmationButtons(item.dom || item, record);
            }
        }, this, { delay: 200, buffer: true }); //blur wird in die Zukunft verschoben, weil ansonsten nur das blur, aber nicht das click-Event kommen würde, wenn man auf den Button klickt (warum auch immer)
        record.confirmButton.focus();
    },

    deleteEntry: Ext.emptyFn,

    onNewEvents: function (response)
    {
        Ext.iterate(response.getPartners(), function (partner, index)
        {
            Ext.iterate(partner.getGuids(), function (guid, index)
            {
                var text = partner.getText();
                var state = partner.getState();
                this.setNewPresenceStateAndText(guid, state, text);
            }, this);
        }, this);
        
        if (isValid(response.getOwner()))
        {
            var text = response.getOwner().getText();
            var state = response.getOwner().getState();
            this.setNewPresenceStateAndText(MY_CONTACT.getGUID(), state, text);
        }

        Ext.each(response.getLineStateEvents(), function (lineStateEvent)
        {
            var records = this.getRecordsByGuid(lineStateEvent.getGuid());
            Ext.each(records, function (record)
            {
                if (isValid(record))
                {
                    record.set("LineState", lineStateEvent.getLineState());
                }
            }, this);
        }, this);
    },

    onSetPresenceStateSuccess: function (response, state, text, force)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
        {
            //wir nehmen hier den status aus MY_CONTACT, weil der auch prüft, ob man PresenceState.OnPhone ist
            var currentPresenceState = MY_CONTACT.getPresenceState();
            if (isValid(currentPresenceState) && currentPresenceState === PresenceState.OnPhone.value)
            {
                state = PresenceState.OnPhone.value;
                text = PresenceState.OnPhone.text;
            }

            this.setNewPresenceStateAndText(MY_CONTACT.getGUID(), state, text);
        }
    },

    setNewPresenceStateAndText: function (guid, state, text)
    {
        var records = this.getRecordsByGuid(guid);
        Ext.each(records, function (record)
        {
            record.beginEdit();
            record.set("PresenceText", ""); //warum dieser Unsinn hier? Fall: man telefoniert mit einem, sucht den während des Gesprächs. Dessen Präsenztext ist dann "Telefoniert". Wenn man dann auflegt, hat der den Präsenztext nicht verändert, weil er in dem Model noch auf "Ich bin anwesend" o.ä. steht (telefoniert ist ja nur ein pseudo-Präsenztext)
            record.set("PresenceText", text);
            record.endEdit();
        });
    },

    getRecordByGuid: function (guid)
    {
        var records = this.getRecordsByGuid(guid);
        if (!Ext.isEmpty(records))
        {
            return records[0];
        }
        return null;
    },

    getRecordsByGuid: function (guid)
    {
        if (!isValid(this.getStore()))
        {
            return null;
        }
        var records = [];
        this.getStore().each(function (record)
        {
            if (record.data.GUID === guid)
            {
                records.push(record);
            }
        });
        return records;
    },

    isVerticalScrollBarVisible: function ()
    {
        if (!isValid(this.el) || !isValid(this.el.dom))
        {
            return false;
        }
        var scrollBarVisible = this.el.dom.scrollHeight > this.el.dom.clientHeight;
        return scrollBarVisible;
    },

    createWaitCursorEntry: function () {
        var waitCursorEntry = {};
        waitCursorEntry.waitMessage = true;
        return waitCursorEntry;
    },

    removeWaitCursorEntry: function () {
        var waitCursorEntry = this.getWaitCursorEntry();
        if (isValid(waitCursorEntry)) {
            this.getStore().remove(waitCursorEntry);
        }
    },

    getWaitCursorEntry: function () {
        var result = null;
        this.getStore().each(function (entry, index) {
            if (entry.data.waitMessage) {
                result = entry;
                return false;
            }
        });
        return result;
    },

    showOnlyTheFirstXRecords: function (maxNumberRecords)
    {
        var height = this.computeHeightOfTheFirstXRecords(maxNumberRecords);
        if (height > 0)
        {
            this.setMaxHeight(Math.max(height, this.minHeight));
        }
    },

    setStore: function (store)
    {
        this.callParent(arguments);

        if (!isValid(store, "on"))
        {
            return;
        }

        var self = this;
        var updateWatermarkImage = function ()
        {
            if (store.getCount() === 0 && isValidString(self.getWatermarkImage()))
            {
                self.setStyle("background-image", 'url(' + self.getWatermarkImage() + ')');
                self.setStyle("background-repeat", 'no-repeat');
                self.setStyle("background-position", 'center center');
            }
            else
            {
                self.setStyle("background-image", 'none');
            }
        };
        updateWatermarkImage(); //initialer Fall
        store.onAfter('datachanged', updateWatermarkImage);
    },

    getWatermarkImage: function ()
    {
        return null;
    },

    //Hier kommt man rein, wenn eine Aktion auf einen Listeneintrag gestartet wurde: anrufen, email schicken etc.
    //@override
    onStartAction: function (record, number)
    {

    }
});
