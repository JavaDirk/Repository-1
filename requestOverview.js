/**
 * Created by martens on 09.03.2015.
 */
Ext.define('RequestOverview', {
    extend: 'Ext.Container',
    titleText: '',
    layout: { type: 'vbox', pack: 'start', align: 'stretch' },
    header: false,
    style: {
        'background-color': WHITE
    },
    createGridPanel: function () {
        var self = this;
        var me = this;

        var isAgentHidden = true;

        if (this.emailStore.isSearchStore()) {
            isAgentHidden = false;
        }

        return new Ext.grid.Panel({
            shrinkWrapDock: true,
            autoScroll: true,
            sortableColumns: false,
            border: false,
            activeEmail: {},
            store: self.emailStore,
            gridSplitter: {},
            isOnlyRead: false,
            overlayButtons: {},
            nextUrl: '',
            isLoadingUrl: false,
            requestOverviewContainer: self,
            isFlatSearch: false,
            flex: 1,
            style:
            {
                color: NEW_GREY
            },
            margin: '10 10 10 10',
            trailingBufferZone: 20,
            leadingBufferZone: 50,
            height: 200,
            plugins: ['bufferedrenderer'],
            
            responsiveConfig:
            {
                small:
                {
                    sizeType: 'small'
                },

                large:
                {
                    sizeType: 'large'
                }
            },
            focusCls: 'column-focus-transparent',
            _isLayoutRoot: true, // undokumentierter Schalter -> sorgt dafür das nur das was sich geändert hat neu gerendert wird und nicht alles

            setSizeType: function (sizeType)
            {
                this.sizeType = sizeType;

                this.updateDateColumn();
                this.updateVisibleColumns();
            },

            updateDateColumn: function ()
            {
                if (!this.isStateOk())
                {
                    return;
                }
                this.getView().refresh();
            },

            updateVisibleColumns: function ()
            {
                if (!this.columnManager)
                {
                    return;
                }
                var columns = this.getColumns();
                Ext.each(columns, function (column)
                {
                    if (column.hideOnResize)
                    {
                        column.setVisible(this.sizeType === 'large');
                    }
                }, this);
            },

            onGlobalEvent_MailProcessingChanged: function (mailProcessing)
            {
                if (this.destroyed)
                {
                    return;
                }

                if (mailProcessing === mailProcessingAvailability.NotAvailable.value)
                {
                    this.getStore().removeAll();
                    this.selectRequest();
                }
            },
            expandOrCollapseConversation: function (email)
            {
                if (email.isClickable)
                {
                    if (email.isExpanded)
                    {
                        this.collapseConversation(email);
                    }
                    else
                    {
                        this.expandConversation(email);
                    }
                }
            },

            expandConversation: function (email)
            {
                if (email.isClickable && !email.isExpanded)
                {
                    this.getStore().addConversationForEmail(email);
                }
            },

            collapseConversation: function (email)
            {
                if (email.isClickable && email.isExpanded)
                {
                    this.getStore().removeConversationForEmail(email);
                }
            },

            columns: [
                {
                    text: '',
                    width: 25,
                    menuDisabled: true,
                    resizable: false,
                    xtype: 'templatecolumn',
                    tpl: '',
                    focusCls: 'column-focus-transparent',
                    hideOnResize: false,
                    renderer: function (m, item, record, opt)
                    {
                        if (record.data.isClickable)
                        {
                            var iconSrc = 'Images/64/TPlus.png';

                            if (record.data.isExpanded)
                            {
                                iconSrc = 'Images/64/TMinus.png';
                            }

                            return '<tpl><div style="margin-top:2px;cursor:pointer;height:13px; width:13px;background-size: 13px 13px;background-image:url(' + iconSrc + ');" title= "' + LANGUAGE.getString('expand') + '" ></div></tpl>';
                        }

                        return '';
                    },
                    listeners:
                    {
                        click: function (me, view, index)
                        {
                            var email = me.getStore().data.getAt(index).data;
                            me.grid.expandOrCollapseConversation(email);
                        }
                    }
                },
                {
                    header: "",//LANGUAGE.getString('type'),
                    dataIndex: 'emailCase',
                    width: 25,
                    resizable: false,
                    menuDisabled: true,
                    tdCls: "backgroundTd",
                    focusCls: 'column-focus-transparent',
                    hideOnResize: false,
                    renderer: function (me, item, record, opt)
                    {
                        var marginLeft = 15;

                        if (record.data.isRequest || this.getStore().isDraftStore())
                        {
                            marginLeft = 5;
                        }
                        return createRequestBubble(record.data, marginLeft, this.getStore().isFlatSearch, 'tdGridPanelRequestLabel');
                    }
                },
                {
                    text: LANGUAGE.getString('dateOfReceipt'),
                    flex: 1,
                    menuDisabled: true,
                    width: 140,
                    resizable: false,
                    xtype: 'templatecolumn',
                    tpl: '',
                    focusCls: 'column-focus-transparent',
                    hideOnResize: false,
                    renderer: function (value, metaData, record, rowIndex, colIndex, store, view)
                    {
                        if (view.grid.sizeType === 'small')
                        {
                            return formatDateForEmail(new Date(record.data.date), 'small');
                        }
                        else
                        {
                            return formatDateString(new Date(record.data.date), true) + ' ' + formatTimeString(new Date(record.data.date));
                        }
                    }
                },
                {
                    text: LANGUAGE.getString('creator'),
                    flex: 1,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    tpl: '',
                    focusCls: 'column-focus-transparent',
                    hideOnResize: false,
                    renderer: function (me, item, record, opt)
                    {
                        var showName = record.data.email;

                        if (record.data.sender)
                        {
                            var receiver = record.data.sender;

                            if (isValidString(receiver.getName()))
                            {
                                showName = receiver.getName();
                            }

                        }

                        return Ext.String.htmlEncode(showName);
                    }
                },
                {
                    text: '<div style="height:16px;width:16px;background-image:url(Images/64/paperclip.png);background-size:contain;background-position:-1px" title="' + LANGUAGE.getString("attachments") + '"></div>',
                    //dataIndex: 'attachmentCount',
                    width: 32,
                    resizable: false,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    tpl: '',
                    focusCls: 'column-focus-transparent',
                    hideOnResize: false,
                    renderer: function (m, item, record, opt)
                    {
                        if (record.data.attachments && record.data.attachments.length > 0)
                        {
                            var title = record.data.attachments.length + " " + LANGUAGE.getString(record.data.attachments.length === 1 ? "attachment" : "attachments");
                            return '<tpl><div class="smallIcon paperclip" style="height:16px;width:16px;" title="' + title + '"></div></tpl>';
                        }

                        return '';
                    }
                    /*
                    sorter:
                    {
                        sorterFn: function (record1, record2)
                        {
                            var attachments1 = record1.data.attachments.length > 0;
                            var attachments2 = record2.data.attachments.length > 0;
                            if (attachments1 && attachments2)
                            {
                                return 0;
                            }
                            if (attachments1)
                            {
                                return -1;
                            }
                            return 1;
                        }
                    }*/
                },
                {
                    text: LANGUAGE.getString('subject'),
                    flex: 2,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    tpl: '{subject:htmlEncode}',
                    hideOnResize: false,
                    focusCls: 'column-focus-transparent'
                },
                {
                    text: LANGUAGE.getString('receiver'),
                    flex: 1,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    tpl: '',
                    hideOnResize: true,
                    focusCls: 'column-focus-transparent',
                    renderer: function (m, item, record, opt)
                    {
                        if (record.data.isRequest && record.data.type === MailType.Inbound.value && record.data.originalState !== emailState.Error.value)
                        {
                            var groupId = record.data.groupId;
                            var groupName = CURRENT_STATE_CONTACT_CENTER.getGroupName(groupId);
                            if (isValidString(groupName))
                            {
                                return Ext.String.htmlEncode(groupName);
                            }
                        }
                        if (record.data.receivers && record.data.receivers.length > 0)
                        {
                            var receiver = record.data.receivers[0];
                            var showName = '';

                            if (isValidString(receiver.getName()))
                            {
                                showName += receiver.getName();
                            }

                            return Ext.String.htmlEncode(showName);
                        }
                    }
                },
                {
                    text: LANGUAGE.getString('openSince'),
                    flex: 1,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    tpl: '',
                    hideOnResize: false,
                    focusCls: 'column-focus-transparent',
                    renderer: function (me, item, record, opt)
                    {
                        // Bei Conversation-Items werden keine Zeiten und kein Status angezeigt
                        if (!record.data.isRequest && record.data.originalState !== emailState.Error.value)
                        {
                            return '';
                        }

                        var text = record.data.arrivedAsString;
                        var color = record.data.escalationColor;

                        if (this.getStore().isEmailWorked(record.data) || record.data.originalState === emailState.Error.value)
                        {
                            text = emailState[record.data.originalState].text;
                            color = emailState[record.data.originalState].color;
                        }

                        return '<div style="color: ' + color + '"> ' + text + ' </div>';
                    }
                },
                {
                    text: LANGUAGE.getString('agent'),
                    flex: 2,
                    minWidth: 120,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    hidden: isAgentHidden,
                    tpl: '',
                    hideOnResize: false,
                    focusCls: 'column-focus-transparent',
                    renderer: function (m, item, record, opt)
                    {
                        var agentName = LANGUAGE.getString('noAgent');

                        if (record.data.curWorkingAgent)
                        {
                            agentName = record.data.curWorkingAgent.getName();
                            return '<div class="hBoxLayout"><div class="' + CLASS_CONTACT_PHOTO + '" style="width:' + PhotoSizes.OnlyStates.width + 'px;height:' + PhotoSizes.OnlyStates.height + 'px;align-self:center;"></div><div class="smallMarginLeft">' + agentName + '</div></div>';
                        }

                        return '<div style="margin-left: 17px;">' + agentName + '</div>';
                    }
                },
                {
                    text: 'ID',
                    minWidth: 75,
                    flex: 1,
                    menuDisabled: true,
                    xtype: 'templatecolumn',
                    tpl: '{shortId}',
                    hideOnResize: true,
                    focusCls: 'column-focus-transparent'
                }
            ],

            viewConfig:
            {
                plugins:
                [
                    {
                        ptype: 'GridViewWithPhotos'
                    }
                ]
            },

            selectRequest: function (record)
            {
                if (!record)
                {
                    record =
                    {
                        data: undefined
                    };
                }

                this.viewSelectedEmail(record.data);
            },

            onRequestManagementEvent_setActiveEmail: function (index, store)
            {
                if (this.store === store && this.getStore().data.length > index)
                {
                    this.getSelectionModel().select(index);
                }
            },

            onRequestManagementEvent_updateViewIfNeeded: function (email, store)
            {
                if (this.store === store)
                {
                    var selectedEmail = this.getSelectionModel().getSelection();

                    if (!selectedEmail)
                    {
                        return;
                    }
                    else
                    {
                        selectedEmail = selectedEmail[0].data;
                    }

                    if (selectedEmail.mailId === email.mailId)
                    {
                        this.viewSelectedEmail(email);
                    }
                }
            },

            setDisplayEmailContainer: function (displayEmail) 
            {
                this.displayEmailContainer = displayEmail;
            },

            getDisplayEmailContainer: function () 
            {
                return this.displayEmailContainer;
            },

            viewSelectedEmail: function (email)
            {
                var container = this.getDisplayEmailContainer();

                if (container)
                {
                    var clone = Ext.clone(email);
                    container.setDisplayEmail(clone);
                }
            },

            listeners:
            {
                headerclick: function (ct, column, event, item, eOpts)
                {
                    console.log("headerClick", ct, column, event, item, eOpts);
                },
                destroy: function (me)
                {
                    if (self.tooltip)
                    {
                        self.tooltip.destroy();
                    }
                    me.store.requestOverview = null;

                    GLOBAL_EVENT_QUEUE.removeEventListener(me);
                    REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(me);
                },
                resize: function (me, width, height, oldWidth, oldHeight)
                {
                    var container = me.getDisplayEmailContainer();
                    if (!container || !container.isStateOk() || !oldHeight)
                    {
                        return;
                    }

                    if (height < 10 || height === oldHeight || me.getStore().data.length <= 0)
                    {
                        return;
                    }
                    
                    container.onResizeRequestOverview();
                },
                select: function (event, record, index, eOpts) {

                    if (self.overviewGrid.timeoutFunction) 
                    {
                        clearTimeout(self.overviewGrid.timeoutFunction);
                    }

                    event.getStore().markEmailAsReadIfNeeded(record.data);

                    if (sessionStorage.getItem('keydown'))
                    {
                        self.overviewGrid.timeoutFunction = setTimeout(function ()
                        {
                            this.viewSelectedEmail(record.data);
                        }, 250);

                        return;
                    }

                    this.viewSelectedEmail(record.data);
                },
                
                afterrender: function (event) 
                {
                    GLOBAL_EVENT_QUEUE.addEventListener(event);
                    REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(event);

                    if (me.emailStore.data.length > 0) {
                        setTimeout(function () {
                            if (event && !event.destroyed) {
                                event.getSelectionModel().select(0);
                            }
                        }, 100);
                    }

                    event.updateVisibleColumns();

                    var view = event.getView();
                    view.on('itemupdate', function (record, index, node)
                    {
                        //Fall: man setzt einen Entwurf fort, speichert ihn wieder als Entwurf, dann wurde die email nicht aktualisiert
                        if (this.overviewGrid.getStore().isDraftStore())
                        {
                            var selection = this.overviewGrid.getView().getSelectionModel().getSelection();
                            if (selection.length === 1)
                            {
                                if (selection[0].data === record.data)
                                {
                                    this.overviewGrid.viewSelectedEmail(record.data);
                                }
                            }
                        }
                        
                    }, me);

                    self.tooltip = Ext.create('Ext.tip.ToolTip',
                        {
                            target: self.el,
                            showDelay: 1000,
                            autoHide: true,
                            trackMouse: false,
                            delegate: '.x-grid-cell-inner',
                            listeners:
                            {
                                beforeshow: function (tip)
                                {
                                    if (self.isDestroyed)
                                    {
                                        return false;
                                    }

                                    var element = tip.currentTarget.dom;
                                    if (isElementTooSmall(element))
                                    {
                                        tip.update(element.innerHTML);
                                        return true;
                                    }
                                    return false;
                                }
                            }
                        });
                },

                beforeitemcontextmenu: function (view, record, item, index, e, eOpts) 
                {
                    view.getSelectionModel().select(index);
                },

                itemcontextmenu: function (view, record, item, index, e, eOpts) 
                {
                    var emailContainer = self.overviewGrid.getDisplayEmailContainer().emailContainer;

                    var factory = new UserActionContainerFactory();
                    var userActionsContainer = factory.createUserActionContainer(emailContainer.getUserActionData(), emailContainer, emailContainer.getSelectedEmail(), emailContainer.getHeaderData());

                    var menu = userActionsContainer.convertButtonsToMenu();

                    var x = e.pageX;
                    var y = e.pageY;

                    menu.showAt([x, y]);
                    
                },
                
                rowkeydown: function (view, record, element, rowIndex, e, eOpts)
                {
                    if (record.data.isRequest)
                    {
                        if (record.data.conversation && record.data.conversation.length > 0)
                        {
                            if (e.keyCode === e.ENTER)
                            {
                                this.expandOrCollapseConversation(record.data);
                            }
                            if (e.keyCode === e.RIGHT)
                            {
                                this.expandConversation(record.data);
                            }
                            if (e.keyCode === e.LEFT)
                            {
                                this.collapseConversation(record.data);
                            }
                        }
                    }
                    else
                    {
                        if (e.keyCode === e.LEFT)
                        {
                            var requestRecord = this.getStore().getRecordForMailId(record.data.referenceMailId);
                            if (requestRecord)
                            {
                                this.getSelectionModel().select(requestRecord);
                                view.focusNode(requestRecord); //ist tatsächlich notwendig, weil nur das select nicht den focus umsetzt und wenn man nochmal auf LEFT drückt, war ExtJS der Meinung, dass man noch auf dem conversationItem steht
                            }
                        }
                    }
                }
            }
        });
    },
    initComponent: function () {
        this.callParent();

        this.overviewGrid = this.add(this.createGridPanel());
    },

    refresh: function ()
    {
        this.overviewGrid.getView().refresh();
    }
});