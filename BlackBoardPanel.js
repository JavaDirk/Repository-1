Ext.define('BlackBoardHeader',
{
    extend: 'TeamChatHeader',

    getChatRoomType: function ()
    {
        return LANGUAGE.getString("blackBoard");
    },

    createButtons: function () {
        return [];
    }
});


Ext.define('ChatMessagesPanelForBlackBoard',
{
    extend: 'TeamChatMessagesPanel',

    ascending: false,

    style: 'background-color:' + MAIN_BACKGROUND_GREY,

    showDateSplitter: false,

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.on('afterrender', function (view) {

            view.getEl().on('click', function (event, node)
            {
                event.stopEvent();

                if (isValid(event.record))
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(event.record.data.contact);
                }

            }, null, { delegate: 'div.author' });

            var deleteFunction = function (record)
            {
                var node = self.getNode(record);
                animateDeleteEntry(node, function ()
                {
                    self.deleteMessageOnServer(record);
                });
            };

            view.getEl().on('click', function (event, node)
            {
                event.stopEvent();

                var record = event.record;
                if (!isValid(record))
                {
                    return;
                }

                self.parent.insert(1, Ext.create('ConfirmationComponent',
                {
                    yesCallback: function ()
                    {
                        deleteFunction(record);
                    },
                    noCallback: Ext.emptyFn,
                    errorMessageText: LANGUAGE.getString("deleteMessageWithTitle", record.data.title),
                    errorType: ErrorType.Warning,
                    borderWidth: 1,
                    margin: '10 5 5 0'
                }));
                
            }, null, { delegate: 'div.trashImage' });

            view.getEl().on('contextmenu', function (event, node)
            {
                event.stopEvent();

                var IamModerator = CURRENT_STATE_CHATS.amIModerator(self.teamChat.getGuid());
                if (!IamModerator)
                {
                    return;
                }

                var record = event.record;
                if (!isValid(record))
                {
                    return;
                }

                var contextMenu = Ext.create('CustomMenu',
                {
                    highlightFirstMenuItem: false,
                    insertItems:
                    [
                        {
                            text: LANGUAGE.getString('remove'),
                            iconName: 'remove',
                            handler: function ()
                            {
                                deleteFunction(record);
                            }
                        }
                    ]
                });
                contextMenu.showAt(event.clientX, event.clientY);
            }, null, { delegate: 'div.chatMessage' });
            
        });
    },

    getTemplate: function ()
    {
        var self = this;
        return new Ext.XTemplate(
            '<div style="display:flex;flex-direction:column-reverse">'+ //Das ist der Trick! column-reverse! BlackBoardPanel zeigt die Nachrichten ja umgekehrt chronologisch an, das wird dadurch realisiert, dass wir dem Container sagen, dass er die Reihenfolgen umkehren soll, dadurch kann der Store genauso gefüllt werden wie bei TeamChat oder UserChat
            '<tpl for=".">' +
                '<tpl if="loadingMessage">' +
                    getWaitCursorTemplate('chatMessage') +
                '<tpl else>' +
                    '<div class="chatMessage">' +
                        '<div style="display: flex;background-color:white;margin: 0px 5px 10px 0px;padding: 10px 10px 10px 10px;">' +
                            '<div style="display: flex;flex-direction:column;flex:1;justify-content: space-between;margin-bottom: 5px;">' +
                                '<div class="chat_metadata" style="display: flex;flex-direction:row;flex:1">' +
                                    '<div style="display:flex;color:' +
                                    '<tpl if="this.isMessageReleased(values)">' +
                                        COLOR_SUBTITLE + ';' +
                                    '<tpl else>' +
                                        'rgb(200, 0, 0);font-weight:500;'+
                                    '</tpl>' +
                                        '">{[this.getFullDateAsString(values)]}</div>' +
                                    '<tpl if="isValid(values.validTo)">' +
                                        '<div style="margin-left:5px;display:flex;color:' + COLOR_SUBTITLE + '">{[this.getValidToAsString(values)]}</div>' +
                                    '</tpl>' +
                                    '<div style="margin:0 5px">-</div>' +
                                    '<div class="author" style="cursor:pointer;color:' + COLOR_MAIN_2 + '">{name}</div>' +
                                    '<div style="flex:1;"></div>' +
                                    '<tpl if="this.amIModerator()">' +
                                        '<div class="trashImage" style="cursor:pointer;width:16px;height:16px;background-size:16px 16px;background-image:url('+ IMAGE_LIBRARY.getImage("trash", 64, NEW_GREY) + ')"></div>' +
                                    '</tpl>' +
                                '</div>' +
                                '<div style="font-weight:600;font-size:' + FONT_SIZE_NAME + 'px;word-wrap: break-word;word-break: normal;' +
                                '<tpl if="error">' +
                                    'color:' + RED +
                                '<tpl else>' +
                                    'color:' + ALMOST_BLACK +
                                '</tpl>' +
                                '">{title:htmlEncode}</div>' +
                                '<div class="chat_message" style="margin-top:7px;word-wrap: break-word;word-break: normal;' +
                                    '<tpl if="error">' +
                                        'color:' + RED +
                                    '</tpl>' +
                                    '">{text}</div>' +
                            
                            '</div>' +
                        '</div>' +
                '</div>' +
            '</tpl>'+
            '</tpl>' +
            '</div>' +
            '<div class="loadPreviousMessagesButton" style="display:flex;justify-content:center;margin-bottom:10px"></div>',
        {
            isMessageReleased: function(chatMessage)
            {
                if (isValid(chatMessage.validFrom))
                {
                    var now = new Date();
                    if (now < chatMessage.validFrom)
                    {
                        return false;
                    }
                }
                return true;
            },

            getFullDateAsString: function (chatMessage)
            {
                var result = "";
                if (isValid(chatMessage.validFrom))
                {
                    var now = new Date();
                    if (now < chatMessage.validFrom)
                    {
                        result = LANGUAGE.getString("released") + ': ';
                    }

                    result += this.formatDate(chatMessage.validFrom);
                    return result;
                }
                
                if (!isValid(chatMessage.fullDate)) {
                    return "";
                }
                return this.formatDate(chatMessage.fullDate);
            },

            getValidToAsString: function(chatMessage)
            {
                if (isValid(chatMessage.validTo))
                {
                    return "[" + LANGUAGE.getString("ending") + ": " + this.formatDate(chatMessage.validTo) + "]";
                }
                return "";
            },

            formatDate: function(date)
            {
                return formatLongDateString(date, true) + ", " + formatTimeString(date);
            },

            getTextColor: function (values)
            {
                if (values.error)
                {
                    return 'color:' + RED + ';';
                }
                return "";
            },

            amIModerator: function()
            {
                return CURRENT_STATE_CHATS.amIModerator(self.teamChat.getGuid());
            }
        });
    },

    prepareMessageText: function (message)
    {
        // Title und Message separieren
        var index = message.text.indexOf('\n');
        var title = message.text.substring(0, index);
        var text = message.text.substring(title.length + 1, message.length);
        // Kein Zeilenumbruch oder Text enthält nur Whitespaces
        if (index === -1 || !text.replace(/\s/g, '').length) {
            // Title automatisch ermitteln und Text entsprechend setzen
            message.title = this.findTitle(message.text);
            message.text = message.text.substring(message.title.length);
        }
        else
        {
            message.title = title;
            message.text = text;
        }
        this.callParent(arguments);
    },

    findTitle: function (text)
    {
        var delimiters = [': ', ' - ', '. ', '! ', '? ', '; ', ', ', ':', '.', '!', '?', ';', ',', '-', ' '];
        var index = -1;
        for (var i = 0; i < delimiters.length; i++) 
        {
            index = text.indexOf(delimiters[i]);
            if (index > -1) 
            {
                return text.substring(0, index + delimiters[i].length);
            }
        }
        return text;
    },

    insertMessages: function (messages, insertPosition)
    {
        Ext.each(messages, function (message)
        {
            this.prepareMessageText(message);
        }, this);

        return this.getStore().insert(insertPosition, messages);
    }
});

Ext.define('BlackBoardPanel',
{
    extend: 'TeamChatPanel',

    showEnteredUsers: false,

    createHeader: function ()
    {
        var header = Ext.create('BlackBoardHeader',
        {
            parent: this,
            teamChat: this.teamChat,
            contacts: this.contacts
        });
        return header;
    },

    createChatMessagesPanel: function ()
    {
        return Ext.create('ChatMessagesPanelForBlackBoard', {
            margin: '0 0 0 0',
            flex: 1,
            teamChat: this.teamChat,
            parent: this
        });
    },

    createChatInputContainer: function ()
    {
        var self = this;
        return new Ext.Container({
            layout: 
            {
                type: 'hbox',
                pack: 'center'
            },
            style:
            {
                'background-color': PANEL_BACKGROUND_GREY
            },
            items:
            [
                new RoundThinButton(
                {
                    cls: [HIGHLIGHTED_ROUND_THIN_BUTTON, ROUND_THIN_BUTTON],
                    color: WHITE,
                    text: LANGUAGE.getString('newMessage'),
                    iconName: 'add',
                    scale: 'medium',
                    listeners:
                    {
                        click: function (button)
                        {
                            var dialog = Ext.create('NewMessageDialogForBlackBoards',
                            {
                                sendCallback: function(title, text, validFrom, validTo)
                                {
                                    dialog.hide();
                                    self.sendMessage(title + "\n" + text, validFrom, validTo);
                                }
                            });
                            dialog.showBy(button);
                        }
                    },
                    margin: '10 0 10 0'
                })
            ]
        });
    },

    getTextToSend: function ()
    {
        return this.titleField.getRawValue() + "\n" + this.textBox.getRawValue();
    },

    sendMessageToServer: function (text, files, startDate, endDate, record)
    {
        var startDateAsString = isValid(startDate) ? startDate.toISOString() : "";
        var endDateAsString = isValid(endDate) ? endDate.toISOString() : "";
        
        SESSION.sendTeamChatMessage(this.teamChat.getGuid(), "Text", text, null, startDateAsString, endDateAsString, record);
    },

    createChatInputTitleField: function()
    {
        return Ext.create('Ext.form.field.Text', 
        {
            emptyText: LANGUAGE.getString('title'),
            flex: 1,
            height: 32
        });
    },
    
    isWritingDisallowed: function ()
    {
        var result = this.callParent();
        var IamModerator = CURRENT_STATE_CHATS.amIModerator(this.teamChat.getGuid());
        
        return result || ((this.teamChat.getWriteRightForModeratorsOnly()) && !IamModerator);
    },

    updateChatInputContainer: function () {
        if (this.isWritingDisallowed()) {
            this.chatInputContainer.hide();
        }
        else {
            this.chatInputContainer.show();
        }
    },

    focus: function ()
    {
        if (this.titleField)
        {
            var self = this;
            setTimeout(function ()
            {
                self.titleField.focus();
            }, 550);
        }
    },

    sendMessageIfEnterWasPressed: function (event)
    {
        return false;
    },

    getMarginBottomForChatArea: function ()
    {
        return 0;
    }
});