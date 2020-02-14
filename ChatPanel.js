var SIZE_ATTACHMENT = 96;
var MARGIN_WAIT_CURSOR = "25px 0";

var CHAT_PANEL_PHOTO_SIZE = PhotoSizes.Default;

Ext.define('GrowableTextArea',
{
    extend: 'Ext.form.field.TextArea',
    growMax: '500',
    grow: true,
    flex: 1,
    enableKeyEvents: true,
    emptyText: '',
    //preventScrollbars: true,
    border: false,
    fieldCls: 'chatInputTextAreaField',
    initial: true,
    oneRow: true,

    listeners:
    {
        keypress: function (self, event)
        {
            if (event.getKey() === KEY_ENTER && self.sendMessageIfEnterWasPressed(event))
            {
                return self.sendMessage();
            }
        },

        autosize: function (me, height)
        {
            if (isValid(me.chatContainer))
            {
                me.chatContainer.scrollToLastMessage();
            }
        },

        change: function (me, newValue, oldValue)
        {
            if (isValid(me.contact))
            {
                clearTimeout(me.detectActivityTimer);

                var now = new Date();
                var lastActiveDate = isValid(me.lastActiveMsgTime) ? new Date(me.lastActiveMsgTime.getTime() + DISPLAY_TIMEOUT) : null;

                if (!isValid(lastActiveDate) || now > lastActiveDate)
                {
                    me.lastActiveMsgTime = now;

                    if (me.sendChatAliveMessages)
                    {
                        SESSION.sendChatAliveMessage(me.contact.getGUID(), MY_CONTACT.getGUID(), Caesar.ChatControlDataType.UserActive);
                    }
                    
                }

                me.detectActivityTimer = setTimeout(function ()
                {
                    me.onDetectActivity();
                }, DETECT_TIMEOUT);
            }
        }
    },

    onDetectActivity: function ()
    {
        this.lastActiveMsgTime = null;

        if (isValid(this.contact) && isValid(MY_CONTACT))
        {
            if (this.sendChatAliveMessages)
            {
                SESSION.sendChatAliveMessage(this.contact.getGUID(), MY_CONTACT.getGUID(), Caesar.ChatControlDataType.UserInactive);
            }
        }
    },

    autoSize: function ()
    {
        var me = this,
            inputEl, height, curWidth, value;
        if (me.grow && me.rendered && me.getSizeModel().height.auto)
        {
            inputEl = me.inputEl;
            //subtract border/padding to get the available width for the text
            curWidth = inputEl.getWidth(true);
            value = Ext.util.Format.htmlEncode(inputEl.dom.value) || '&#160;';
            value += me.growAppend;
            // Translate newlines to <br> tags
            value = replaceNewLinesWithBRTag(value);
            height = Ext.util.TextMetrics.measure(inputEl, value, curWidth).height + inputEl.getPadding('tb') + // The element that has the border depends on theme - inputWrap (classic)
            // or triggerWrap (neptune)
            me.inputWrap.getBorderWidth('tb') + me.triggerWrap.getBorderWidth('tb');

            //begin Änderung, damit wir die Textbox auf eine Zeile zwingen
            if (me.oneRow)
            {
                height -= 13;
            }
            //end

            height = Math.min(Math.max(height, me.growMin), me.growMax);
            var newHeight = Math.ceil(height);
            if (newHeight === me.el.dom.clientHeight)
            {
                return;
            }
            me.bodyEl.setHeight(newHeight);

            //begin Änderung, damit kein scrollbar auftaucht - das sollte man nicht über preventScrollbar lösen, weil ansonsten man eine Unterteilung sieht von dem inputEl und dem bodyEl
            me.inputEl.setHeight(newHeight);
            //end Änderung

            me.updateLayout();
            me.fireEvent('autosize', me, height);
        }
    },

    initComponent: function()
    {
        this.growMin = this.oneRow ? 20 : 180;

        this.emptyText = LANGUAGE.getString("message");

        this.callParent();
    },

    sendMessageIfEnterWasPressed: function(event)
    {
        return false;
    },

    sendMessage: function()
    {

    }
});

Ext.define('ChatHeader',
{
    extend: 'Ext.Container',
    layout:
    {
        type: 'hbox'
    },
    //margin: MARGIN_BETWEEN_COMPONENTS + ' 5 ' + MARGIN_BETWEEN_COMPONENTS + ' 0',
    padding: '15 15',
    border: false,
    style: {
        backgroundColor: CHAT_BACKGROUND_COLOR,
        borderColor: BORDER_GREY,
        borderStyle: 'solid'
    },
    contact: undefined,
    showTyping: true,
    
    initComponent: function ()
    {
        this.callParent();

        var self = this;
        
        this.add(this.createImage());

        this.leftContainer = this.add(Ext.create('Ext.Container',
        {
            margin: '2 0 0 15',
            layout: 
            {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1
        }));

        this.nameLabel = new Ext.form.Label(
        {
            text: this.getName(),
            style: 'font-size:' + FONT_SIZE_NAME + 'px;color:' + COLOR_NAME + ";font-weight:500;",
            margin: '-8 0 0 0'
        });

        this.typing = Ext.create('Ext.form.Label',
        {
            style: 'color:' + COLOR_NAME + ";font-size:" + FONT_SIZE_SUBTITLE,
            margin: '4 0 0 5',
            hidden: true,
            text: LANGUAGE.getString("typing")
        });

        this.nameContainer = this.leftContainer.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'hbox'
            },
            items:
            [
                this.nameLabel,
                this.typing,
                Ext.create('Ext.Img',
                {
                    src: isValid(this.contact) ? this.contact.getMobileAvailableImage() : "",
                    width: 16,
                    height: 16,
                    margin: '1 0 0 5',
                    alt: 'mobile',
                    listeners:
                    {
                        boxready: function (image) {
                            if (self.contact && self.contact.getIsMobileAvailable())
                            {
                                image.tooltip = Ext.create('Ext.tip.ToolTip',
                                {
                                    target: this.el,
                                    html: LANGUAGE.getString("mobileAvailable"),
                                    showDelay: 1000,
                                    autoHide: true,
                                    trackMouse: false
                                });
                            }
                        },
                        destroy: function (image)
                        {
                            if (image.tooltip)
                            {
                                image.tooltip.destroy();
                            }
                        }
                    }
                })
            ]
        }));
        
        this.contactInformation = this.leftContainer.add(this.createContactInformation());

        this.rightContainer = this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch',
                pack: 'end'
            }
        }));

        var buttonContainer = this.rightContainer.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'hbox',
                //align: 'stretch',
                pack: 'end'
            },
            margin: '1 0 3 0'
        }));

        buttonContainer.add(this.createButtons());

        this.on('boxready', function ()
        {
            SESSION.addListener(this);
        }, this);
    },

    onNewEvents: function (response)
    {
        if (this.showTyping)
        {
            if (isValid(response.getChatAliveDatas()))
            {
                Ext.each(response.getChatAliveDatas(), function (chatAliveData)
                {
                    if (chatAliveData.getSenderGuid() === this.contact.getGUID())
                    {
                        if (chatAliveData.getMessage().getType() === "UserActive")
                        {
                            this.typing.show();
                        }
                        if (chatAliveData.getMessage().getType() === "UserInactive")
                        {
                            this.typing.hide();
                        }
                    }
                }, this);
            }
            if (isValid(response, "getChats()"))
            {
                Ext.each(response.getChats(), function (chat)
                {
                    var contact = chat.getContact();
                    if (contact.equals(this.contact))
                    {
                        this.typing.hide();
                    }
                }, this);
            }
        }
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },
    
    getName: function ()
    {
        return this.parent.getName();
    },

    createImage: function ()
    {
        return Ext.create('Photo',
        {
            contact: this.contact
        });
    },

    createContactInformation: function ()
    {
        return [
            Ext.create('Ext.form.Label',
            {
                style: 'font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_TEXT,
                text: this.contact.getDepartment()
            }),
            Ext.create('Ext.form.Label',
            {
                margin: '2 0 0 0',
                style: 'font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_TEXT,
                text: this.contact.getCompany()
            })
        ];
    },

    createButtons: function ()
    {
        var actions = new ChatHeaderActions(this.contact);
        return actions.getActionsAsIcons();
    }
});

Ext.define('ChatEntry',
{
    extend: 'Ext.data.Model',
    fields:
    [
        { name: 'text', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'date', type: 'string' },
        { name: 'fullDate', type: 'date' },
        { name: 'image', type: 'string' },
        { name: 'outgoing', type: 'boolean' },
        { name: 'dateMessage', type: 'boolean' },
        { name: 'loadingMessage', type: 'boolean' },
        { name: 'contactMessage', type: 'boolean' },
        { name: 'offlineMessage', type: 'boolean' },
        { name: 'errorMessage', type: 'boolean' },
        { name: 'loadPreviousMessagesButtonMessage', type: 'boolean' },
        { name: 'error', type: 'boolean' },
        { name: 'attachments'}
    ]
    });

var HTML_FOR_ATTACHMENT = '<tpl if="this.isVideo(values)">' +
                            '<video controls preload="none" title="{[this.getDisplayName(values)]}" class="chatAttachment {[this.getAttachmentClassName(values, xindex)]}" style="{[this.getAdditionalStyle(values, parent, xindex, xcount)]};" >' +
                                '<source src="{[this.getImageURL(values, xindex, parent)]}" type="{mimeType}" />' +
                            '</video>' +
                        '<tpl elseif="this.isAudio(values)">' +
                            '<audio controls preload="metadata" title="{[this.getDisplayName(values)]}" class="chatAttachment {[this.getAttachmentClassName(values, xindex)]}" style="{[this.getAdditionalStyle(values, parent, xindex, xcount)]};" >' +
                                '<source src="{[this.getImageURL(values, xindex, parent)]}" type="{mimeType}" />' +
                            '</audio>' +
                        '<tpl else>' +
                            '<a class="clickableAttachment" target="_blank" style="color:transparent;' +
                                '<tpl if="this.isDownloadable(values)">' +
                                    'cursor:pointer" download="{[this.getFileName(values)]}" ' +
                                '</tpl>' +
                                '<tpl if="this.isDisplayable(values)">' +
                                    'cursor:pointer" href="{[this.getUrl(values)]}"' +
                                '<tpl else>' +
                                    'cursor:default"'+
                                '</tpl>' +
                                '>' +
                                '<div title="{[this.getDisplayNameAndSize(values)]}" class="chatAttachment {[this.getAttachmentClassName(values, xindex)]}" style="{[this.getAdditionalStyle(values, parent, xindex, xcount)]};display:flex;justify-content:center;border:0px solid ' + NORMAL_GREY + ';width:' + SIZE_ATTACHMENT + 'px;height:' + SIZE_ATTACHMENT + 'px;background-size:cover;background-repeat:no-repeat;background-position:center center;border-radius:3px;background-color:white;background-image:url({[this.getImageURL(values, xindex, parent)]})">' +
                                    '<div class="waitingMask" style="animation: spin 1s linear infinite;display:{[this.showLoading(values, parent)]};width:' + SIZE_ATTACHMENT + 'px;height:' +SIZE_ATTACHMENT+'px;background-size:24px 24px;background-repeat:no-repeat;background-position:center center;background-image:url(images/loading.png)"></div>'+
                                '</div>' +
                            '</a>'+
                        '</tpl>';

Ext.define('BaseChatMessagesPanel',
{
    extend: 'Ext.view.View',

    scrollable: 'vertical',
    border: false,
    style: 'background-color:' + CHAT_BACKGROUND_COLOR,
    deferEmptyText: false,
    ascending: true,
    showDeleteButton: true,
    showDateSplitter: true,

    mixins: ['BusinessCard_ShowHideBehaviour'],

    initComponent: function ()
    {
        this.tpl = this.getTemplate();
        this.store = Ext.create('Ext.data.Store',
        {
            model: 'ChatEntry'
        });

        this.itemSelector = 'div.chatMessage';
        this.callParent();

        var self = this;
        this.on('containerkeydown', function (view, event)
        {
            if (event.keyCode === KEY_DOWN)
            {
                self.scrollDown(50);
            }
            if (event.keyCode === KEY_UP)
            {
                self.scrollUp(50);
            }
            if (event.keyCode === KEY_PAGE_DOWN)
            {
                self.scrollDown(500);
            }
            if (event.keyCode === KEY_PAGE_UP)
            {
                self.scrollUp(500);
            }
            if (event.ctrlKey)
            {
                if (event.keyCode === KEY_POSITION_1)
                {
                    self.scrollToTop();
                }
                if (event.keyCode === KEY_POSITION_END)
                {
                    self.scrollToBottom();
                }
            }
        });

        this.on('itemadd', function (records, index, nodes, view)
        {
            this.addBusinessCardTooltipOnAuthorNodes(nodes);
        }, this);

        this.on('itemupdate', function (record, index, node, view)
        {
            this.addBusinessCardTooltipOnAuthorNodes([node]);
        }, this);

        this.on('refresh', function (view)
        {
            Ext.asap(function ()
            {
                if (view.destroyed)
                {
                    return;
                }
                var nodes = view.getNodes();
                this.addBusinessCardTooltipOnAuthorNodes(nodes);
            }, this);
        }, this);

        this.on('boxready', function () 
        {
            self.getEl().on('click', function (event, node)
            {
                var record = event.record;
                if (isValid(record))
                {
                    var position = self.getStore().indexOf(record);
                    var recordsToRemove = [record];
                    var recordsToRerender = [];
                    var wasLastMessage = false;
                    if (position - 1 >= 0)
                    {
                        var nextRecord = self.getStore().getAt(position + 1);
                        if (isValid(nextRecord))
                            recordsToRerender.push(nextRecord);
                        else
                            wasLastMessage = true;

                        var previousRecord = self.getStore().getAt(position - 1);
                        if (isValid(previousRecord))
                        {
                            if (previousRecord.data.dateMessage)
                            {
                                if (!isValid(nextRecord) || (isValid(nextRecord) && nextRecord.data.dateMessage))
                                    recordsToRemove.push(previousRecord);
                            }
                            else
                                recordsToRerender.push(previousRecord);
                        }
                    }

                    Ext.each(recordsToRemove, function (record)
                    {
                        self.on('itemremove', function (records, index, item, view, eOpts)
                        {
                            Ext.each(recordsToRerender, function (rec)
                            {
                                var pos = self.getStore().indexOf(rec);
                                self.refreshNode(pos);
                            });
                        }, null, { single: true });

                        var node = self.getNode(record);
                        animateDeleteEntry(node, function ()
                        {
                            self.deleteMessageOnServer(record, recordsToRemove, wasLastMessage);
                        });
                    });
                }
            }, null, { delegate: '.deleteButton' });
        });

        this.on('boxready', function ()
        {
            SESSION.addListener(this);
        }, this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    addBusinessCardTooltipOnAuthorNodes: function (nodes)
    {
        Ext.each(nodes, function (node)
        {
            var authorElement = Ext.get(node).down("." + CLS_AUTHOR);
            if (!authorElement)
            {
                return;
            }

            authorElement.on('mouseenter', this.onMouseEnterAuthor, this);
            authorElement.on('mouseleave', this.onMouseLeaveAuthor, this);
            authorElement.on('contextMenu', this.onContextMenuAuthor, this);
        }, this);
    },

    onMouseEnterAuthor: function (event, item)
    {
        var tooltip = Ext.create('BusinessCardTooltipForChatPanel',
        {
            contact: this.getContact(item),
            defaultAlign: 'tl-c',
            chatPanel: this
        });
        this.onMouseEnter(item, tooltip);
    },

    getContact: function (item)
    {
        var node = Ext.get(item).up('.chatMessage');
        var record = this.getRecord(node);
        if (record && record.data.contact)
        {
            return record.data.contact;
        }
        return null;
    },

    onMouseLeaveAuthor: function (event, item)
    {
        this.onMouseLeave(item);
    },

    onContextMenuAuthor: function (item)
    {
        this.onContextMenu(item);
    },

    removeAll: function ()
    {
        var store = this.getStore();
        if (!isValid(store))
        {
            return;
        }
        store.removeAll();
    },

    onUploadedAttachment: function (uploadedAttachment)
    {
        var store = this.getStore();
        if (!isValid(store))
        {
            return;
        }
        store.each(function (entry)
        {
            if (isValid(entry, "data.originalMessage"))
            {
                var messageId = entry.data.originalMessage.getMessageId();
                if (messageId === uploadedAttachment.getMessageId())
                {
                    var attachments = Ext.clone(entry.data.attachments) || [];
                    var originalAttachments = entry.data.originalMessage.getAttachments();
                    Ext.each(originalAttachments, function (originalAttachment, index)
                    {
                        if (originalAttachment.getId() === uploadedAttachment.getAttachmentID())
                        {
                            originalAttachment.size = attachments[index].size;
                            attachments[index] = originalAttachment;
                        }
                    });
                    entry.set("attachments", attachments);
                    this.onNewMediaUploaded(entry);
                }
            }
        }, this);
    },

    deleteMessageOnServer: function (record, recordsToRemove, wasLastMessage)
    {
        var messageId = this.getMessageId(record);
        if (isValidString(messageId))
        {
            this.deleteMessage(record, messageId, recordsToRemove, wasLastMessage);
        }
        else
        {
            //record ohne messageId sind z.B. dateMessages ("Heute" etc.))
            this.getStore().remove(record);
        }        
    },

    deleteMessage: function (record, messageId, recordsToRemove, wasLastMessage)
    {
        SESSION.deleteUserChatMessages(this.contact.getGUID(), [messageId], recordsToRemove, wasLastMessage);
    },

    getMessageId: function (record)
    {
        return isValid(record, "data.originalMessage") ? record.data.originalMessage.getMessageId() : "";
    },

    createLoadingEntry: function ()
    {
        var entry = {
            loadingMessage: true,
            text: LANGUAGE.getString("loading")
        };
        return entry;
    },

    onDeleteUserChatMessagesSuccess: function (response, recordsToRemove, messageIds, wasLastMessage)
    {
        var rowChatMessage = this.getNode(recordsToRemove[0]);
        if (!isValid(rowChatMessage))
        {
            return; //wurde nicht von unserem ChatPanel aufgerufen (kann ja auch noch ein anderes offen sein)
        }

        if (response.getReturnValue().getCode() === 0)
        {
            this.getStore().remove(recordsToRemove);

            if (wasLastMessage)
            {
                var lastRecord = this.getStore().getAt(this.getStore().getCount() - 1);
                GLOBAL_EVENT_QUEUE.onGlobalEvent_NewLastChatMessage(isValid(lastRecord, "data.originalMessage") ? lastRecord.data.originalMessage : null, this.contact);
            }
        }
        else
        {
            this.onDeleteUserChatMessagesFailed(recordsToRemove, response.getReturnValue().getDescription());
        }
    },

    onDeleteUserChatMessagesException: function (recordsToRemove)
    {
        this.onDeleteUserChatMessagesFailed(recordsToRemove, LANGUAGE.getString("errorDeleteChatMessage"));
    },

    onDeleteUserChatMessagesFailed: function (recordsToRemove, text)
    {
        Ext.each(recordsToRemove, function (record)
        {
            var node = this.getNode(record);
            if (node)
            {
                Ext.get(node).setHeight(node.dataset.originalHeight);
                node.style.opacity = 1;
            }
        }, this);

        this.parent.showErrorBeforeChatArea(text, ErrorType.Error, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    getSorters: function ()
    {
        return [
            {
                sorterFn: compareByFullDate,
                direction: this.ascending ? 'ASC' : 'DESC'
            }
        ];
    },
    
    getTemplate: function ()
    {
        var self = this; 
        var margin = '15px 0 15px 0';
        return new ChatTemplate(
            '<div class="loadPreviousMessagesButton" style="display:flex;justify-content:center;"></div>' +
            '<tpl for=".">' +
                '<tpl if="offlineMessage">' +
                    '<div class="chatMessage" style="display: flex;">' +
                    '<div style="color:' + NEW_GREY + ';font-size:' + FONT_SIZE_TITLE + 'px;flex:1;text-align:center;height:25px;margin:' + margin + ';border:none">{text}</div>' +
                '</div>' +
                '<tpl elseif="systemMessage">' +
                    '<div class="chatMessage" style="display: flex;">' +
                        '<div style="padding:5px;font-weight:bold;background-color:transparent;color:' + COLOR_GROUP_ENTRY.toString() + ';cursor:default;flex:1;text-align:center;height:25px;margin:' + margin + ';border:none">{text}</div>' +
                    '</div>' +
                '<tpl elseif="dateMessage">' +
                    '<div class="chatMessage" style="display: flex;">' +
                        '<div class="groupEntry" style="flex:1;text-align:center;height:25px;margin:' + margin + ';">{text}</div>' +
                    '</div>' +
                '<tpl elseif="loadingMessage">' +
                    '<div class="chatMessage" style="margin:' + MARGIN_WAIT_CURSOR + '">' +
                        getWaitCursorTemplate('', ' ') +
                    '</div>' +
                '<tpl elseif="errorMessage">' +
                    '<div class="chatMessage" style="display: flex;">' +
                        '<div style="color:' + RED + ';font-weight:bold;font-size:' + FONT_SIZE_TITLE + 'px;flex:1;text-align:center;height:25px;margin:' + margin + ';border:none">{text}</div>' +
                    '</div>' +
                '<tpl elseif="separatorMessage">' +
                    '<div class="chatMessage" style="display: flex;justify-content:center">' +
                        '<div style="background-color:' + BORDER_GREY + ';height:2px;width: 50%;margin:30px 0 15px"></div>' +
                    '</div>' +
                '<tpl else>' +
                    '<div class="{[this.getUserMessageClasses(values)]}">' + 
                        '<div class="' + CLASS_CONTACT_PHOTO + '" style="width:' + CHAT_PANEL_PHOTO_SIZE.width + 'px;height:' + CHAT_PANEL_PHOTO_SIZE.height + 'px"></div>' +
                        '<div class="user-message-content selectable">' +
                            '<div class="chat_metadata" style="color:' + COLOR_MAIN_2 + '">' +
                                '<div class="name ' + CLS_AUTHOR + '">{[this.getAuthor(values)]}</div>' +
                                '<div class="separator">-</div>' +
                                '<div class="time">{[this.getFullDateAsString(values)]}</div>' +
                            '</div>' +
                            '<div class="message-and-buttons">' +
                                '<div class="message-content"<tpl if="values.outgoing === true"> style="background-color:' + COLOR_HOVER + '"</tpl>>' + 
                                    '<tpl if="values.attachments && values.attachments.length &gt; 0">' +
                                    '<div class="chatAttachments<tpl if="!isValidString(text)"> attachments-centered</tpl>">' +
                                        '<tpl for="attachments">' +
                                        '<div style="">' +
                                            HTML_FOR_ATTACHMENT +
                                        '</div>' +
                                        '</tpl>' +
                                    '</div>' +
                                    '</tpl>' +
                                    '<tpl if="isValidString(text)">' +
                                    '<div class="chat_message" style="<tpl if="error">color:'+RED+'</tpl>">' + 
                                        '<span>{text}</span>' +
                                    '</div>' +
                                    '</tpl>' +
                                '</div>' +
                                (this.showDeleteButton ? '<div class="deleteButton" style="background-image:url(' + IMAGE_LIBRARY.getImage("trash", 64, NEW_GREY) + ');"></div>' : "") +
                            '</div>' +
                        '</div>' +
                    '</tpl>' +
                '</div>' +
            '</tpl>',
            {
                parentView: this
            }
        );
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getUploadedAttachments(), function (uploadedAttachment)
        {
            this.onUploadedAttachment(uploadedAttachment);
        }, this);
    },

    isAdjacent(message1, message2)
    {
        if (!message2)
            return false;
        else
        {
            if (message1.dateMessage || message2.dateMessage ||
                message1.errorMessage || message2.errorMessage ||
                message1.loadingMessage || message2.loadingMessage ||
                message1.outgoing !== message2.outgoing ||
                message1.guid !== message2.guid)
            {
                return false;
            }
            
            return isSameDay(message1.fullDate, message2.fullDate) && isSameMinute(message1.fullDate, message2.fullDate);
        }
    },

    insertMessages: function (messages, insertPosition)
    {
        var groupedMessages = this.groupByDate(messages);

        var dateSplitter;
        var modelsToAdd = [];
        Ext.iterate(groupedMessages, function (groupDate, groupedMessages)
        {
            if (this.showDateSplitter)
            {
                dateSplitter = this.createDateSplitterForDate(groupDate);
                modelsToAdd.push(dateSplitter);
            }
            
            Ext.each(groupedMessages, function (groupedMessage)
            {
                this.prepareMessageText(groupedMessage);
                modelsToAdd.push(groupedMessage);
            }, this);
        }, this);

        var result = this.getStore().insert(insertPosition, modelsToAdd);

        if (dateSplitter)
        {
            this.removeDuplicateDateSplitter(dateSplitter.fullDate);
        }
        
        return result;
    },

    groupByDate: function (messages)
    {
        var groups = {};
        Ext.each(messages, function (message)
        {
            if (!message)
            {
                return;
            }
            var date = new Date(message.fullDate);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (isValid(groups[date]))
            {
                groups[date].push(message);
            }
            else
            {
                groups[date] = [message];
            }
        });
        return groups;
    },

    removeDuplicateDateSplitter: function (date)
    {
        //wenn man nachlädt, kann es sein, dass es den DateSplitter für das übergebene date doppelt gibt
        var dateSplitters = [];
        this.getStore().each(function (record)
        {
            if (record.data.dateMessage && isSameDay(date, record.data.fullDate))
            {
                dateSplitters.push(record);
                if (dateSplitters.length === 2)
                {
                    this.getStore().remove(dateSplitters[1]);
                    return false;
                }
            }
        }, this);
    },

    add: function (messages)
    {
        if (!Ext.isArray(messages))
        {
            messages = [messages];
        }

        var records = [];
        Ext.each(messages, function (message)
        {
            if (message.systemMessage)
            {
                records.push(this.addMessage(message));
            }
            else
            {
                if (this.isDateSplitterNeeded(message))
                {
                    this.createAndAddDateSplitter(message);
                }

                this.prepareMessageText(message);
                records.push(this.addMessage(message));
            }

        }, this);
        return records;        
    },

    isDateSplitterNeeded: function (message)
    {
        if (!this.showDateSplitter)
        {
            return false;
        }
        var dateSplitterFound = false;
        this.getStore().each(function (record)
        {
            if (record.data.dateMessage && isSameDay(record.data.fullDate, new Date(message.fullDate)))
            {
                dateSplitterFound = true;
                return false;
            }
        }, this);
        return !dateSplitterFound;
    },

    prepareMessageText: function (message)
    {
        if (!isValid(message) || !isValidString(message.text))
        {
            return;
        }
        message.text = Ext.String.htmlEncode(message.text);
        message.text = this.createLinks(message.text);
        
        message.text = replaceNewLinesWithBRTag(message.text);
    },

    createLinks: function (chatText) 
    {
        const sep = "§C§A$S$E$R$I§S";
        const matches = chatText.match(/(?:(?:https?):\/\/|www\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,;.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,;.]*\)|[A-Z0-9+&@#\/%=~_|$])/gmi);
        if (matches)
        {
            matches.forEach((n, i) => chatText = chatText.replace(n, `${sep}-link-${i}`));
        }

        const emailParts = chatText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gim);
        if (emailParts)
        {
            emailParts.forEach((n, i) => chatText = chatText.replace(n, `${sep}-mail-${i}`));
        }         

        chatText = this.convertPhoneNumbers(chatText);
        if (matches)
        {
            matches.forEach((n, i) => chatText = chatText.replace(`${sep}-link-${i}`, `<a href="${n}" target="_blank">${n}</a>`));
        }
            
        if (emailParts)
        {
            emailParts.forEach((n, i) => chatText = chatText.replace(`${sep}-mail-${i}`, `<a href="javascript:sendEMail(\'${n}\')" >${n}</a>`));
        }
            
        return chatText;
    },

    convertPhoneNumbers: function (withoutPhoneNumbers) 
    {
        // TODO: Das Suchen & Ersetzen von Rufnummern macht im Zweifelsfall klickbare Links (mittels scanForEMailAddressesAndLinks erstellt)
        // kaputt. Deshalb werden (wie in timio derzeit) rufnummern nur noch mit dem "+"-Präfix akzeptiert.
        // Obgleich u.a.regex weder E.123 noch E.164 konform ist!
        // TB 21574

        //var phoneRegex = /(?:[[+]|[0])(?:[ /.,|-]?[(]?[0-9][)]?){6,}/g;
        var phoneRegex = /(?:[[+])(?:[ \/.,|-]?[(]?[0-9][)]?){6,}/g;
        return withoutPhoneNumbers.replace(phoneRegex, function (number)
        {
            return '<a onclick="javascript:GLOBAL_EVENT_QUEUE.onGlobalEvent_Dial(null, \'' + number + '\');" style="cursor:pointer;text-decoration:underline;color:#0000EE">' + number + '</a>';
        });
    },

    scrollToMessage: function (chatMessage)
    {
        this.scrollToMessageAfterLoad = null;

        var record = this.findRecord(chatMessage);
        if (record)
        {
            var nodes = this.getAdjacentNodes(record);
            
            Ext.each(nodes, function (node)
            {
                this.scrollToNode(node);
            }, this);

            setTimeout(() =>
            {
                Ext.each(nodes, function (node)
                {
                    Ext.get(node).highlight(COLOR_MAIN.createLighter(0.4), { endColor: CHAT_BACKGROUND_COLOR });
                }, this);
            }, 250);
        }
        else
        {
            this.scrollToMessageAfterLoad = chatMessage;
            if (this.loadPreviousMessagesButton)
            {
                this.loadPreviousMessagesButton.loadPreviousMessages();
            }
            else
            {
                console.warn("ChatPanel::ScrollToMessage: I want to load previous messages but there is no button!", this);
            }
            
        }
    },

    findRecord: function (chatMessage)
    {
        return this.findRecordByMessageId(chatMessage.getMessageId());  
    },

    findRecordByMessageId: function (chatMessageId)
    {
        var foundIndex = this.getStore().findBy(function (record)
        {
            if (record.data.originalMessage)
            {
                return record.data.originalMessage.getMessageId() === chatMessageId;
            }
            return false;
        }, this);
        return this.getStore().getAt(foundIndex);
    },

    getAdjacentNodes: function (record)
    {
        var node = this.getNode(record);
        if (node)
        {
            var nodes = [node];
            var index = this.getStore().indexOf(record);
            while (node.className.indexOf('adjacent') >= 0)
            {
                if (index <= 0)
                {
                    break;
                }
                index--;
                record = this.getStore().getAt(index);
                node = this.getNode(record);
                nodes.push(node);
            }
            return nodes;
        }
        return [];
    },

    scrollToLastMessage: function ()
    {
        if (this.ascending)
        {
            this.scrollToBottom();
        }
        else
        {
            this.scrollToTop();
        }
    },

    scrollToTop: function () {
        this.scroll('t', this.el.dom.scrollTop);
    },

    scrollToBottom: function ()
    {
        this.scroll('b', Infinity);
    },

    scrollUp: function(numberPixel)
    {
        this.scroll('t', numberPixel);
    },

    scrollDown: function (numberPixel)
    {
        this.scroll('b', numberPixel);
    },

    scrollToNode: function (node)
    {
        if (isValid(this.scrollable) && !this.destroyed)
        {
            this.scrollable.scrollIntoView(node, false, true);
        }
    },

    scroll: function (direction, numberPixel)
    {
        if (!this.isStateOk())
        {
            return;
        }

        this.getEl().scroll(direction, numberPixel);
    },

    createAndAddDateSplitter: function (message)
    {
        var dateSplitterRecord = this.createDateSplitterForDate(message.fullDate);
        this.addMessage(dateSplitterRecord);
    },

    createDateSplitterForDate: function (date)
    {
        if (!isValid(date))
        {
            return;
        }
        
        var displayDate = this.parseDate(date);

        displayDate = formatLongDateStringWithWeekDay(displayDate, true);
        
        return {
            dateMessage: true,
            text: displayDate,
            fullDate: date
        };
    },

    parseDate: function (date) {
        if (Ext.isDate(date))
        {
            return date;
        }
        var displayDate = new Date(date);
        if (!isFinite(displayDate))
        {
            var dateParts = date.split(/[.,: ]/);
            displayDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], dateParts[3], dateParts[4], dateParts[5]);
        }
        return displayDate;
    },

    isEmpty: function ()
    {
        return this.getStore().getCount() === 0;
    },

    addMessage: function(chatMessage)
    {
        return this.getStore().add(chatMessage);
    },

    insertMessage: function (position, chatMessage)
    {
        return this.getStore().insert(position, chatMessage);
    },

    isOfflineMessageAlreadyInStore: function ()
    {
        var result = false;
        this.getStore().each(function (record)
        {
            if (record.data.offlineMessage)
            {
                result = true;
                return false;
            }
        });
        return result;
    },

    fillChatView: function (chat, lastKnownMessageId, insertPosition)
    {
        var convertedChat = this.convertChatHistory(chat);
        if (!convertedChat.isForMe())
        {
            return false;
        }
        this.addAllChats(convertedChat.getMessages(), convertedChat.getContacts(), lastKnownMessageId, insertPosition);

        return true;
    },

    convertChatHistory: function (chatHistoryPromProxy)
    {
        return new UserChatHistory(chatHistoryPromProxy, this.contact);
    },

    addAllChats: function (messages, contacts, lastKnownMessageId, position)
    {
        hideLoadingMask(self);

        if (!messages || !contacts)
        {
            return;
        }
        
        this.scrollToLastMessageOnItemAdd(lastKnownMessageId);

        var models = this.convertChatMessages(messages, contacts);
        this.insertMessages(models, position || 0);
    },

    convertChatMessages: function (messages, contacts)
    {
        return Ext.Array.map(messages, function (message)
        {
            return this.convertChatMessageToModel(message, contacts);
        }, this);
    },

    onGetChatHistoryForUserSuccess: function (response, guid, lastKnownMessageId)
    {
        this.onGetChatHistorySuccess(response, guid, lastKnownMessageId);
    },

    onGetChatHistoryForUserException: function (guid)
    {
        this.onGetChatHistoryException(guid);
    },

    onGetChatHistorySuccess: function (response, guid, lastKnownMessageId)
    {
        if (!this.isForMyGuid(guid))
        {
            return;
        }

        hideLoadingMask(this);

        if (response.getReturnValue().getCode() === 0)
        {
            this.initialGetHistoryResponse = response;

            var history = response.getHistory();
            if (isValid(history))
            {
                if (!isValidString(lastKnownMessageId))
                {
                    this.removeAll();
                }
                this.fillChatView(history, lastKnownMessageId);

                if (!this.loadPreviousMessagesButton)
                {
                    this.createLoadPreviousMessagesButton(response);
                }

                if (this.scrollToMessageAfterLoad)
                {
                    Ext.asap(function () //Ext.asap nur deshalb, weil sonst bei mehrfachem nachladen das scrollen/highlighten nicht mehr zu sehen war
                    {
                        this.scrollToMessage(this.scrollToMessageAfterLoad);
                    }, this);
                }
            }
        }
        else
        {
            this.showError(response.getReturnValue().getDescription());
        }
    },

    onGetChatHistoryException: function (guid)
    {
        if (!this.isForMyGuid(guid))
        {
            return;
        }

        hideLoadingMask(this);
        
        this.showError(LANGUAGE.getString("errorGetChatHistory"));

        this.scrollToMessageAfterLoad = null;
    },

    onDeleteChatHistorySuccess: function (response, GUID, item)
    {
        if (response.getReturnValue().getCode() === 0 && GUID === this.contact.getGUID())
        {
            this.initialGetHistoryResponse = null;
        }
    },

    showError: function (text)
    {
        this.parent.showErrorBeforeChatArea(text, ErrorType.Error);
    },

    isForMyGuid: function (guid)
    {
        return this.getGuid() === guid;
    },

    getGuid: function ()
    {
        return this.contact.getGUID();
    },

    convertChatMessageToModel: function (message, contacts)
    {
        if (!isValid(message))
        {
            return;
        }
        var contact = contacts[0];
        var name = contact.getDisplayName();

        if (message.isOutgoing())
        {
            name = MY_CONTACT.getDisplayName();
        }

        var time, date;
        if (isValid(message.getTime()))
        {
            date = new Date(message.getTime());
            time = date.getTime();
        }
        else
        {
            date = new Date();
            time = formatTimeString(date);
        }

        var item = {
            text: message.getText(),
            date: time,
            outgoing: message.isOutgoing(),
            fullDate: date,
            name: name,
            guid: contact.getGUID(),
            contact: message.isOutgoing() ? MY_CONTACT : contact,
            originalMessage: message
        };
        if (isValid(message.getAttachments()))
        {
            item.attachments = message.getAttachments();
        }
        return item;
    },

    addChatMessage: function (messages, scroll)
    {
        if (scroll)
        {
            this.scrollToLastMessageOnItemAdd();
        }
        var models = this.add(messages);

        this.letTabBlinkWhenIncomingMessageArrived(messages);
        return models;
    },

    letTabBlinkWhenIncomingMessageArrived: function (messages)
    {
        var minimumOneIncomingMessage = false;
        Ext.each(messages, function (message)
        {
            if (!message.outgoing)
            {
                minimumOneIncomingMessage = true;
                return false;
            }
        }, this);

        if (isValid(this.parent, "letTabBlinkIfNotActive") && minimumOneIncomingMessage)
        {
            this.parent.letTabBlinkIfNotActive();
        }
    },

    scrollToLastMessageOnItemAdd: function (lastKnownMessageId)
    {
        if (isValidString(lastKnownMessageId))
        {
            return;
        }
        this.on('itemadd', function ()
        {
            if (this.isPanelActive())
            {
                requestAnimationFrame(() =>
                {
                    this.scrollToLastMessage();
                }, this);
            }
            else
            {
                this.newMessagesArrivedWhileInactive = true;
            }
        }, this, { single: true });
    },

    isPanelActive: function ()
    {
        return CURRENT_STATE_CHATS.isChatPanelActive(this.contact.getGUID());
    },

    onTabFocus: function ()
    {
        if (this.newMessagesArrivedWhileInactive)
        {
            requestAnimationFrame(() =>
            {
                this.scrollToLastMessage();
            }, this);
        }
        this.newMessagesArrivedWhileInactive = false;
    },

    setEmptyText: function (text)
    {
        var htmlText = '<div style="display:flex;height:100%;justify-content:center;"><div style="align-self:center;font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_SUBTITLE + '">' + text + '</div></div>';
        return this.callParent([htmlText]);
    }
});

Ext.define('ChatMessagesPanel',
{
    extend: 'BaseChatMessagesPanel',

    plugins:
    [
        {
            ptype: 'ContactViewWithPhotos',
            showPresenceState: false,
            showAgentState: ShowAgentState.showNever,
            photoSize: CHAT_PANEL_PHOTO_SIZE
        }
        ],

    onNewEvents: function (response)
    {
        this.callParent(arguments);

        Ext.each(response.getChats(), function (chat)
        {
            var isForMe = this.fillChatView(chat, '', this.getStore().getCount());
            if (isForMe)
            {
                SESSION.resetBadgeCounter(chat.getContact().getGUID(), MY_CONTACT.getGUID());

                this.letTabBlinkWhenIncomingMessageArrived(chat.getMessages());
            }
        }, this);
    },

    destroy: function ()
    {
        if (this.loadPreviousMessagesButton)
        {
            this.loadPreviousMessagesButton.destroy();
        }
        this.callParent();
    },

    getName: function ()
    {
        return this.parent.getName();
    },

    createLoadPreviousMessagesButton: function (response)
    {
        if (this.loadPreviousMessagesButton)
        {
            this.loadPreviousMessagesButton.destroy();
        }

        this.loadPreviousMessagesButton = Ext.create('LoadPreviousMessagesButtonForUserChat',
        {
            margin: '15 0 0 0',
            parent: this,
            contact: this.contact,
            response: response
        });
    },

    refresh: function ()
    {
        this.callParent(arguments);

        if (this.loadPreviousMessagesButton) //diese Abfrage nur deshalb, weil refresh beim Öffnen des TeamChats recht oft aufgerufen wird. Das CreateLoadPreviousMessagesButton macht erst Sinn, nachdem er im onGetTeamChatHistory angelegt wurde
        {
            this.createLoadPreviousMessagesButton(this.initialGetHistoryResponse);
        }
    }
});

Ext.define('ChatPanel',
{
    extend: 'Ext.Container',
    store: undefined,
    layout: {type: 'vbox', pack: 'start', align: 'stretch'},
    isReadOnly: false,
    scrollable: 'vertical',
    border: false,
    isScrollable: function ()
    {
        return true;
    },
    titleIsContactName: true,
    title: LANGUAGE.getString("chat").toUpperCase(),
    style: 'background-color:' + MAIN_BACKGROUND_GREY,

    initComponent: function ()
    {
        this.titleIconBlack = this.titleIconBlack || IMAGE_LIBRARY.getImage('chat', 64, COLOR_TAB_ICON_NORMAL);
        this.titleIconWhite = this.titleIconWhite || IMAGE_LIBRARY.getImage('chat', 64, COLOR_TAB_ICON_SELECTED);

        this.callParent();

        this.setContact(this.contact);

        
        this.on('boxready', function ()
        {
            SESSION.addListener(this);

            this.updateChatServerAvailability(true);

            Ext.asap(() => { this.focus(); }, this);
        }, this);
    },

    destroy: function () {
        SESSION.removeListener(this);
        
        this.callParent();
    },

    letTabBlinkIfNotActive: function ()
    {
        if (this.tab && !this.tab.active)
        {
            if (isValid(this, "parent.blinkTab"))
            {
                this.parent.blinkTab(this, this.getNumberBlinkingTab());
            }
        }
    },

    getNumberBlinkingTab: function ()
    {
        return 20;
    },

    getName: function ()
    {
        return Ext.String.htmlEncode(this.contact.getDisplayNameForLiveChat());
    },

    updateChatServerAvailability: function (initial)
    {
        if (CURRENT_STATE_CHATS.isChatServerAvailable())
        {
            if (!initial)
            {
                hideConnectionLostMask(this);

                this.reload();
            }
        }
        else
        {
            showConnectionLostMask(this, LANGUAGE.getString("noConnectionToChatServer"));
        }
    },

    reload: function ()
    {
        if (this.loadPreviousMessagesButton)
        {
            this.loadPreviousMessagesButton.destroy();
            this.loadPreviousMessagesButton = null;
        }
        
        this.chatContainer.removeAll();
        this.chatContainer.setEmptyText("");
        showBlackLoadingMask(this.chatContainer);
    },
    
    createHeader: function ()
    {
        var header = Ext.create('ChatHeader',
        {
            contact: this.contact,
            parent: this
        });
        return header;
    },

    createChatView: function () {
        
        if (this.chatContainer && !this.chatContainer.destroyed)
        {
            this.chatContainer.removeAll();
        }

        this.header = this.add(this.createHeader());
        var mainContainer = this.add(Ext.create('Ext.Container',
            {
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                flex: 1
            }));
        
        this.body = mainContainer.add(Ext.create('Ext.Container',
        {
            layout: 'border',
            flex: 1,
            margin: MARGIN_BETWEEN_COMPONENTS + " 0 0 0"
        }));

        this.chatArea = this.body.add(Ext.create('Ext.Container',
            {
            region: 'center',
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1
            }));
        //this.chatAreaPanel = this.body.add(this.createWrappingPanel(this.chatArea, LANGUAGE.getString('chat'), this.getClientSettingsKeyForChat()));
        
        this.createMediaListPanel();

        this.chatContainer = this.chatArea.add(this.createChatMessagesPanel());

        this.on('boxready', function ()
        {
            if (this.showWaitCursorForChatContainer())
            {
                showBlackLoadingMask(this.chatContainer);
            }
        }, this);

        this.chatInputContainer = this.createChatInputContainer();

        this.chatArea.add(new Ext.Component(
            {
                height: 5,
                style: 'background-color:' + CHAT_BACKGROUND_COLOR
            }));

        this.chatArea.add(this.chatInputContainer);
        
        this.chatArea.add(new Ext.Component(
        {
            height: this.getMarginBottomForChatArea(),
            style: 'background-color:' + CHAT_BACKGROUND_COLOR
        }));
        
        this.updateChatInputContainer();
    },

    getMarginBottomForChatArea: function ()
    {
        return 15;
    },

    createWrappingPanel: function (component, title, clientSettingsKey)
    {
        //wenn Accordion, dann hier das ersponsiveConfig und das plugin wegnehmen
        var panel = Ext.create('WrappingPanel',
        {
            title: title,
            items: [component],
            plugins:
            [
                {
                    ptype: 'ContainerWithPersistentSize',
                    clientSettingsKey: clientSettingsKey,
                    initialSize: DEFAULT_WIDTH_FOR_LISTS,
                    initialCollapsedState: 'collapsed'
                }
            ],
            responsiveConfig:
            {
                small:
                {
                    region: 'south',
                    flex: 1
                },

                large:
                {
                    region: 'east',
                    flex: 0
                }
            },

            onExpand: function ()
            {
                if (component.onExpand)
                {
                    component.onExpand();
                }
            }    

        });
        if (component.setParentPanel)
        {
            component.setParentPanel(panel);
        }
        
        return panel;
    },

    getClientSettingsKeyForMediaList: function ()
    {
        return 'chatPanel_mediaList_width';
    },

    getClientSettingsKeyForChat: function ()
    {
        return 'chatPanel_chat_width';
    },

    createMediaListPanel: function ()
    {
        this.mediaList = this.createMediaList();
        this.body.add(this.createWrappingPanel(this.mediaList, LANGUAGE.getString('mediaList'), this.getClientSettingsKeyForMediaList()));
    },

    createMediaList: function ()
    {
        return Ext.create('MediaListForUserChat',
        {
            border: false,
            contact: this.contact,
            onClick: (chatMessage) =>
            {
                this.chatContainer.scrollToMessage(chatMessage);
            }
        });
    },

    createChatInputContainer: function()
    {
        var self = this;

        this.cursorPosStart = -1;
        this.cursorPosEnd = -1;


        this.attachmentsButton = this.createAttachmentsButton();
        this.updateVisibilityOfAttachmentsButton();

        this.emojiButton = this.createEmojiButton();

        this.textBox = this.createChatInputTextBox(true);
        this.sendButton = this.createChatInputSendButton();
        this.shortcutPanel = new Ext.create('TextShortcutListContainer',
        {
            hidden: !CLIENT_SETTINGS.getSetting('CHAT', 'isShortcutGroupTabPanelVisible'),
            insertTextInChat: function (text)
            {
                var rawText = self.textBox.getValue();

                //einfügen des Textes in den Chat
                if ((self.getCursorPosStart() === null && self.getCursorPosEnd() === null) || (self.getCursorPosStart() === -1 && self.getCursorPosEnd() === -1))
                {
                    self.textBox.setValue(rawText + text);
                }
                else
                {
                    var rawTextStart = rawText.substr(0, self.getCursorPosStart());
                    var rawTextEnd = rawText.substr(self.getCursorPosEnd(), rawText.length);
                    self.textBox.setValue(rawTextStart + text + rawTextEnd);
                }

                //anpassen der CursorPosition an das neue Wort
                if (self.cursorPosStart !== -1 || self.cursorPosEnd !== -1) {
                    self.setCursorPosStart(self.getCursorPosStart() + text.length);
                    self.setCursorPosEnd(self.getCursorPosEnd() + text.length);
                }
                else {
                    self.setCursorPosStart(text.length);
                    self.setCursorPosEnd(text.length);
                }

                self.textBox.setFocusAndCursorPosition();
            },

            getMarkedText: function () {
                return self.getMarkedText();
            }
        });

        this.toggleShortcutButton = this.createShortcutToggleButton();
        
        //in diesem Container wird das overflow auf visible und die position des innerCt auf static geändert (ebenso in den Kinder-Containern). Grund: das Badge des
        //attachmentButtons würde sonst abgeschnitten werden
        return new Ext.Container(
        {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items:
            [
                new Ext.Component({ width: '7%' }),
                new Ext.Container({
                    layout:
                    {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    width: '86%',
                    
                    items:
                    [
                        this.shortcutPanel,
                        new Ext.Container(
                        {
                            layout:
                            {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            style: 'overflow:visible',
                            items:
                            [
                                    this.textBox,
                                    this.sendButton
                            ],
                            listeners:
                            {
                                boxready: function (container)
                                {
                                    var innerCt = getInnerContainer(container);
                                    if (innerCt)
                                    {
                                        innerCt.dom.style.position = 'static';
                                    }
                                }
                            }
                        }),
                        new Ext.Container(
                        {
                            layout:
                            {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            flex: 1,
                                style: 'overflow:visible; background-color:' + CHAT_BACKGROUND_COLOR,
                            items:
                                [
                                    this.attachmentsButton,
                                    this.toggleShortcutButton,
                                    this.emojiButton
                                ],
                            listeners:
                            {
                                boxready: function (container)
                                {
                                    var innerCt = getInnerContainer(container);
                                    if (innerCt)
                                    {
                                        innerCt.dom.style.position = 'static';
                                    }
                                }
                            }
                        })
                    ],
                    style: 'overflow:visible',
                    listeners:
                    {
                        boxready: function (container)
                        {
                            var innerCt = getInnerContainer(container);
                            if (innerCt)
                            {
                                innerCt.dom.style.position = 'static';
                            }
                        }
                    }
                }),
                new Ext.Component({ width: '7%' })
            ],
                style: 'overflow:visible;background-color:' + CHAT_BACKGROUND_COLOR,
                listeners:
                {
                    boxready: function (container)
                    {
                        var innerCt = getInnerContainer(container);
                        if (innerCt)
                        {
                            innerCt.dom.style.position = 'static';
                        }
                    }
                }
        });
    },

    getMarkedText: function () {
        if (this.cursorPosStart !== -1 && this.cursorPosEnd !== -1) {
            return this.textBox.getValue().substring(this.cursorPosStart, this.cursorPosEnd);
        }
        else {
            return null;
        }
    },

    onAddChatTextBlockException: function () { 
        this.showErrorAfterChatArea(LANGUAGE.getString('ErrorAddChatTextBlock'), ErrorType.Warning, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onDeleteChatTextBlockException: function () {
        this.showErrorAfterChatArea(LANGUAGE.getString('ErrorDeleteChatTextBlock'), ErrorType.Warning, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onUpdateChatTextBlockException: function () {
        this.showErrorAfterChatArea(LANGUAGE.getString('ErrorUpdateChatTextBlock'), ErrorType.Warning, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onLoadChatTextBlocksException: function () {
        this.showErrorAfterChatArea(LANGUAGE.getString('ErrorLoadChatTextBlocks'), ErrorType.Warning, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    getCursorPosStart: function () {
        return this.cursorPosStart;
    },

    setCursorPosStart:  function (pos) {
        this.cursorPosStart = pos;
    },

    getCursorPosEnd:  function () {
        return this.cursorPosEnd;
    },

    setCursorPosEnd: function (pos) {
        this.cursorPosEnd = pos;
    },

    createAttachmentsButton: function ()
    {
        var self = this;
        var button = Ext.create('AddAttachmentsButton',
        {
            hidden: true,
            onResize: function ()
            {
                self.chatInputContainer.updateLayout();
            },

            showErrorMessage: function (text)
            {
                self.showErrorAfterChatArea(text, ErrorType.Info, DEFAULT_TIMEOUT_ERROR_MESSAGES);
            },

            onAttachmentsChange: function ()
            {
                self.textBox.focus();
            }
        });
        return button;
    },

    createEmojiButton: function ()
    {
        return Ext.create('EmojiButton', {});
    },

    showErrorBeforeChatArea: function (text, errorType, timeout)
    {
        this.showError(text, 0, errorType, "0 0 10 0", timeout);
    },

    showErrorAfterChatArea: function (text, errorType, timeout)
    {
        this.showError(text, 1, errorType, "10 5 10 0", timeout);
    },

    showError: function (text, position, errorType, margin, timeout)
    {
        var component = Ext.create('ErrorMessageComponent',
        {
            margin: margin || '10 0 0 0',
            errorMessageText: text,
            errorType: errorType || ErrorType.Warning,
            timeoutInSeconds: timeout,
            borderWidth: 1
        });
        this.chatArea.insert(position, Ext.create('Ext.Container',
        {
            style: 'background-color:' + CHAT_BACKGROUND_COLOR,
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            items: [component]
        }));
    },

    createChatInputTextBox: function (oneRow, emptyText)
    {
        var self = this;
        return new GrowableTextArea(
        {
            sendChatAliveMessages: this.getSendChatAliveMessages(),
            oneRow: oneRow,
            emptyText: emptyText || LANGUAGE.getString("message"),
            chatContainer: this.chatContainer,
            contact: this.contact,
            sendMessageIfEnterWasPressed: function (event)
            {
                var sendWithReturn = TIMIO_SETTINGS.getSendChatViaEnterKey();
                if (sendWithReturn === null || sendWithReturn === undefined)
                {
                    sendWithReturn = true;
                }

                if ((!sendWithReturn && event.shiftKey) || (sendWithReturn && !event.shiftKey))
                {
                    return true;
                }
                return false;
            },
            sendMessage: function ()
            {
                /*if (self.shortcutPanel.replaceAllShortcuts(self.textBox.getValue()) === self.textBox.getValue()) { self.sendMessage(); } //wurde entfernt, da Phillip meinte, es wäre nicht mehr nötig
                else {
                    self.textBox.setValue(self.shortcutPanel.replaceAllShortcuts(self.textBox.getValue()));
                }*/
                self.sendMessage();
            },

            setFocusAndCursorPosition: function () {
                setTimeout(function () 
                {
                    self.textBox.focus();

                    setTimeout(function ()
                    {
                        self.textBox.inputEl.dom.selectionStart = self.getCursorPosEnd();
                        self.textBox.inputEl.dom.selectionEnd = self.getCursorPosEnd();
                    }, 0);
                }, 0);
            },
            listeners:
            {
                boxready: function ()
                {
                    this.inputEl.dom.style.paddingLeft = "15px";
                },

                inputEl:
                {
                    paste: function (e)
                    {
                        self.onPaste(e);
                    },

                    focus: function ()
                    {
                        self.sendButton.onFocusTextArea();
                        self.attachmentsButton.onFocusTextArea();
                    },

                    blur: function ()
                    {
                        self.sendButton.onBlurTextArea();
                        self.attachmentsButton.onBlurTextArea();

                        self.setCursorPosStart(this.dom.selectionStart); 
                        self.setCursorPosEnd(this.dom.selectionEnd);
                    }
                }
            }
        });
    },

    getSendChatAliveMessages: function ()
    {
        return true;
    },

    onPaste: function (e)
    {
        var event = e.event;
        if (event.clipboardData)
        {
            var items = event.clipboardData.items;
            if (items)
            {
                for (var i = 0; i < items.length; i++)
                {
                    if (items[i].type.indexOf("image") !== -1)
                    {
                        var blob = items[i].getAsFile();
                        if (isValid(this.attachmentsButton))
                        {
                            this.attachmentsButton.addAttachments([blob]);
                        }
                    }
                }
            }
        } 
    },

    createChatInputSendButton: function()
    {
        var self = this;
        return new Ext.Component(
        {
            html: '<div class="sendButton" title="Nachricht senden"></div>',
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        /*if (self.shortcutPanel.replaceAllShortcuts(self.textBox.getValue()) === self.textBox.getValue())
                            { self.sendMessage(); }
                        else
                        {
                            self.textBox.setValue(self.shortcutPanel.replaceAllShortcuts(self.textBox.getValue()));
                        }*/
                        self.sendMessage();
                    }
                }
                
            },
            //margin: MARGIN_BETWEEN_COMPONENTS + ' 0 0 0',
            style: 'background-color:' + WHITE,
            onFocusTextArea: function ()
            {
                this.addCls('focused');
            },
            onBlurTextArea: function ()
            {
                this.removeCls('focused');
            }
        });
    },

    createShortcutToggleButton: function ()
    {
        return this.createTextBlockButton('ShowTextBlocksInDisplayModeButton');
    },

    createTextBlockButton: function (className)
    {
        var self = this;
        return new window[className](
            {
                shortcutPanel: this.shortcutPanel,
                listeners:
                {
                    click: function ()
                    {
                        Ext.asap(() =>
                        {
                            self.chatContainer.scrollDown(self.shortcutPanel.getHeight());
                        });
                    }
                }
            });
    },

    createChatMessagesPanel: function()
    {
        var self = this;
        return Ext.create('ChatMessagesPanel', {
            margin: '0 0 0 0',
            flex: 1,
            contact: this.contact,
            parent: this,
            onNewMediaUploaded: function (record)
            {
                self.mediaList.onNewMediaUploaded(record);
            }
        });
    },

    showWaitCursorForChatContainer: function ()
    {
        return this.chatContainer.isEmpty();
    },

    isWritingDisallowed: function ()
    {
        return this.isReadOnly;
    },

    updateChatInputContainer: function ()
    {
        if (this.isWritingDisallowed())
        {
            this.chatInputContainer.disable();
        }
        else
        {
            this.chatInputContainer.enable();
        }
    },


    sendMessage: function (text, validFrom, validTo)
    {
        var self = this;
        var text = text || this.textBox.getRawValue();

        if (isValid(this, "shortcutPanel.replaceAllShortcuts"))
        {
            text = self.shortcutPanel.replaceAllShortcuts(text);  //auflösen der Kürzel //todo: schauen, ob es lösbar ist, dh.splitten.
        }

        text = isValidString(text) ? text.trim() : text;
        if (isValidString(text) || this.getNumberAttachments() > 0)
        {
            var files = this.getAttachments();
            var message = this.createMessageConfig(text, files, validFrom, validTo);

            var records = this.chatContainer.addChatMessage(message, true);
            var record = records.length > 0 ? records[0] : null;
            
            Ext.asap(function ()
            {
                text = this.prepareMessageText(text);
                this.sendMessageToServer(text, files, validFrom, validTo, record);
                if (isValid(this.attachmentsButton))
                {
                    this.attachmentsButton.resetAttachments();
                }
            }, this);
        }
        Ext.asap(function ()
        {
            if (isValid(this.textBox))
            {
                this.textBox.setValue('');
            }
        }, this);
    },

    prepareMessageText: function (text)
    {
        return text;
    },

    getNumberAttachments: function()
    {
        if (isValid(this.attachmentsButton))
        {
            return this.attachmentsButton.getNumberAttachments();
        }
        return 0;
    },

    getAttachments: function ()
    {
        if (isValid(this.attachmentsButton))
        {
            return this.attachmentsButton.getAttachments();
        }
        return [];
    },
    
    createMessageConfig: function (text, files, validFrom, validTo)
    {
        var now = new Date();

        var message = {
            outgoing: true,
            fullDate: now,
            name: MY_CONTACT.getDisplayName(),
            guid: MY_CONTACT.getGUID(),
            contact: MY_CONTACT,
            validFrom: validFrom,
            validTo: validTo
        };
        message.text = text;
        message.attachments = this.convertFilesToAttachments(files);
        return message;
    },

    convertFilesToAttachments: function (files)
    {
        var attachments = [];
        Ext.each(files, function (file)
        {
            attachments.push(file);
        });
        return attachments;
    },

    sendMessageToServer: function (text, files, validFrom, validTo, record)
    {
        SESSION.sendChatMessage(this.contact, text, files, record);
    },

    onSendChatMessageSuccess: function (response, contact, records, chosenFiles)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.uploadAttachments(records, response, chosenFiles);
            
        }
        else
        {
            this.onSendMessageFailed(response.getReturnValue().getDescription(), records);
        }
    },

    uploadAttachments: function (records, response, chosenFiles)
    {
        Ext.each(records, function (record)
        {
            var node = this.chatContainer.getNode(record);
            if (!isValid(node))
            {
                return; //wenn man zu dem record kein node bekommt, dann ist man auch nicht im richtigen ChatPanel
            }

            var message = this.getMessageFromResponse(response);
            record.data.originalMessage = message;
            var self = this;
            Ext.each(message.getAttachments(), function (attachment, index)
            {
                var xhr = new XMLHttpRequest();

                var chosenFile = chosenFiles[index];

                xhr.open('POST', attachment.getUrl());
                xhr.setRequestHeader('X-File-Size', chosenFile.size);
                var mimeType = attachment.getMimeType();
                if (mimeType.toLowerCase() === "text/xml")
                {
                    mimeType = "text/plain"; //damit wir auch XML-Dateien übertragen können, muss der Mime-Type auf text umgestellt werde, weil der Server das sonst als SOAP-Anfrage identifiziert
                }
                xhr.setRequestHeader('Content-Type', mimeType);

                xhr.onreadystatechange = function (response)
                {
                    if (xhr.readyState === 4)
                    {
                        if (xhr.status !== 200)
                        {
                            hideChildren(element);
                            element.style.backgroundImage = IMAGE_LIBRARY.getImage("error", 64, RED);
                            self.showErrorBeforeChatArea(LANGUAGE.getString(xhr.status === 409 ? "errorUploadAttachmentVirus" : "errorUploadAttachment", chosenFile.name), ErrorType.Error, DEFAULT_TIMEOUT_ERROR_MESSAGES);
                        }
                    }
                };
                xhr.send(chosenFile);
            });
        }, this);
    },

    getMessageFromResponse: function (response)
    {
        return response ? response.getMessage() : null;
    },

    onSendChatMessageException: function (records)
    {
        this.onSendMessageFailed(LANGUAGE.getString("errorSendChatMessage"), records);
    },

    onSendMessageFailed: function (errorText, records)
    {
        Ext.each(records, function (record)
        {
            record.set('error', true);
        }, this);
        
        this.showErrorAfterChatArea(errorText, ErrorType.Error, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },
    
    onNewEvents: function (response)
    {
        if (isValid(response.getPartners()) && isValid(response.getPartners()) && isValid(this.contact))
        {
            this.updateChatInputContainer();
        }

        if (isValid(response.getOwner()))
        {
            this.updateChatInputContainer();
        }
        
        if (isValidString(response.getChatServerAvailability()))
        {
            this.updateChatServerAvailability(false);
        }       

        this.updateVisibilityOfAttachmentsButton();
    },
    
    updateVisibilityOfAttachmentsButton: function ()
    {
        if (!isValid(this.attachmentsButton))
        {
            return;
        }

        var chatConfiguration = CURRENT_STATE_CHATS.getChatConfiguration();
        if (isValid(chatConfiguration))
        {
            var extensions = [];
            if (isValid(chatConfiguration, "getAttachmentExtensions()"))
            {
                extensions = chatConfiguration.getAttachmentExtensions();
            }
            var maxNumber = chatConfiguration.getMaxAttachments() || 0;
            var maxSize = chatConfiguration.getMaxAttachmentSize() || 0;
            if (!isValid(extensions) || Ext.isEmpty(extensions) || maxNumber === 0 || maxSize === 0)
            {
                this.attachmentsButton.setVisible(false);
            }
            else
            {
                this.attachmentsButton.setVisible(true);
            }
        }
        else
        {
            this.attachmentsButton.setVisible(false);
        }
    },

    onConnectionLost: function () {
        //this.parent.removeItem(this);
    },

    setContact: function (contact)
    {
        if (!isValid(contact))
        {
            return;
        }

        this.lastStoreItem = null;

        if (this.rendered)
        {
            this.removeAll();
        }
        
        this.contact = contact;

        if (this.titleIsContactName)
        {
            var title = contact.getDisplayName() || LANGUAGE.getString("unknownUser");
            this.title = title.toUpperCase();
        }
        
        if (isValid(this.tab))
        {
            this.tab.setText(Ext.String.htmlEncode(this.title));
        }

        this.createChatView();
    },

    focus: function ()
    {
        if (this.chatInputContainer.isDisabled())
        {
            //warum muss man den Fall abfangen? Weil der focus-Befehl auf das diable control dazu geführt hat, dass der chatMessageContainer nach oben gescrollt wurde (warum auch immer)
            return;
        }
        if (this.textBox)
        {
            var self = this;
            setTimeout(function ()
            {
                if (isValid(self.textBox))
                {
                    self.textBox.focus();
                }
            }, 550);
        }
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && this.contact.equals(panel.contact);
    },
    
    onTabFocus: function ()
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_ChatActive(this.contact);

        CURRENT_STATE_CHATS.setActiveChatPanel(this.contact);

        this.chatContainer.onTabFocus();
    },

    onTabBlur: function ()
    {
        CURRENT_STATE_CHATS.removeActiveChatPanel(this.contact);
    },

    getAdditionalTabContextMenuItems: function ()
    {
        var self = this;
        return [
                    [
                        {
                            text: LANGUAGE.getString("clearWindowContent"),
                            handler: function () {
                                self.chatContainer.removeAll();
                            }
                        }
                    ]
        ];
    }
});

Ext.define('UserChatPanel',
{
    extend: 'ChatPanel',

    initComponent: function ()
    {
        this.callParent();

        this.on('boxready', function ()
        {
            CURRENT_STATE_CHATS.addChatPanel(this);
        }, this);
    },

    destroy: function ()
    {
        CURRENT_STATE_CHATS.removeChatPanel(this);

        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        this.callParent();
    },

    reload: function ()
    {
        this.callParent();

        SESSION.getChatHistoryForUser(this.contact.getGUID());
    },

    setContact: function (contact)
    {
        this.callParent(arguments);

        this.on('boxready', function ()
        {
            SESSION.getChatHistoryForUser(this.contact.getGUID());

            GLOBAL_EVENT_QUEUE.addEventListener(this);
        }, this);
    },

    onDeleteChatHistorySuccess: function (response, GUID, item)
    {
        if (response.getReturnValue().getCode() === 0 && GUID === this.contact.getGUID())
        {
            this.chatContainer.removeAll();

            SESSION.resetBadgeCounter(GUID, MY_CONTACT.getGUID());
        }
    },

    onDeleteChatHistoryException: function (GUID, item) {

    },

    isWritingDisallowed: function ()
    {
        var result = this.callParent();
        return result || !this.contact.isChattable();
    },

    sendAttachments: function (files)
    {
        this.callParent(arguments);

        if (!this.contact.isChattable())
        {
            this.addContactIsOfflineMessage();
        }
    },

    sendMessage: function ()
    {
        this.callParent(arguments);
        
        if (!this.contact.isChattable())
        {
            this.addContactIsOfflineMessage();
        }
    },

    addContactIsOfflineMessage: function ()
    {
        var message = {
            text: LANGUAGE.getString("offlineMessage"),
            offlineMessage: true,
            fullDate: new Date()
        };
        if (this.isOfflineMessageAlreadyInStore())
        {
            return;
        }
        this.chatContainer.addChatMessage(message, true);
    },

    isOfflineMessageAlreadyInStore: function ()
    {
        return this.chatContainer.isOfflineMessageAlreadyInStore();
    },

    onGlobalEvent_DeleteUserChat: function (record)
    {
        if (record.data.contact.getGUID() === this.contact.getGUID())
        {
            this.parent.removeItem(this);
        }
    },

    onGetChatHistoryForUserSuccess: function (response, guid)
    {
        if (!this.chatContainer.isForMyGuid(guid))
        {
            return;
        }

        if (response.getReturnValue().getCode() === 0)
        {
            SESSION.resetBadgeCounter(this.contact.getGUID(), MY_CONTACT.getGUID());
        }
    }
});
