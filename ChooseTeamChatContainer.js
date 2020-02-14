Ext.define('TeamChatList',
{
    extend: 'BaseViewPanel',
    itemSelector: 'div.overviewContact',
    selectedItemCls: 'selectedEntry',
    border: false,

    minHeight: 50,
    maxHeight: 6 * 57,//window.innerHeight - 150, //TODO: bitte ne schönere Lösung finden
    scrollable: 'vertical',
    minWidth: 300,
    flex: 1,
    
    plugins:
    [
        {
            ptype: 'TeamChatViewWithPhotos'
        }
    ],
    
    initComponent: function ()
    {
        this.tpl = getTemplateForTeamChat();

        this.callParent();

        var self = this;

        this.setStore(Ext.create('TeamChatStore',
        {
            
        }));

        this.on('itemdblclick', function (self, record, item, index, event, eOpts)
        {
            self.parent.onTeamChatChosen();
        });

        this.on('itemkeydown', function (self, record, item, index, event, eOpts)
        {
            if (event.getKey() === KEY_ENTER || event.getKey() === KEY_SPACE)
            {
                self.parent.onTeamChatChosen();
            }
        });
        
        var oldContent = this.getOldContent();
        this.oldContentGuids = Ext.Array.pluck(oldContent, "Guid");
        this.getStore().add(oldContent);

        this.on('boxready', function () {
            Ext.asap(function () {
                //self.showOnlyTheFirstXRecords(6);
                //self.parent.updatePosition();

                self.getSelectionModel().select(0);
            });
        });

        if(this.getStore().getCount() === 0)
        {
            this.getStore().add(this.createWaitCursorEntry());
        }
    },

    onGetTeamChatRoomsSuccess: function (response, alreadyChosenTeamChatRoomGuids)
    {
        this.onServerResponse(response, alreadyChosenTeamChatRoomGuids);
    },

    onGetTeamChatRoomsException: function (alreadyChosenTeamChatRoomGuids) 
    {
        this.onServerResponse(null, alreadyChosenTeamChatRoomGuids);
    },

    onServerResponse: function (response, alreadyChosenTeamChatRoomGuids)
    {
        if (isValid(response) && response.getReturnValue().getCode() === 0)
        {
            this.fillStore(response, alreadyChosenTeamChatRoomGuids);
        }
    },

    fillStore: function (response, alreadyChosenTeamChatRoomGuids)
    {
        this.removeWaitCursorEntry();

        if (alreadyChosenTeamChatRoomGuids)
        {
            var newContent = this.getContent(response);
            var newContentGuids = Ext.Array.pluck(newContent, "Guid");
            if (!Ext.Array.equals(newContentGuids, this.oldContentGuids))
            {
                var self = this;
                var deletedRoomGuids = Ext.Array.difference(this.oldContentGuids, newContentGuids);
                Ext.each(deletedRoomGuids, function (deletedRoomGuid)
                {
                    var record = self.getRecordByGuid(deletedRoomGuid);
                    if (isValid(record))
                    {
                        self.getStore().remove(record);
                    }
                });

                var newRooms = [];
                var newRoomGuids = Ext.Array.difference(newContentGuids, this.oldContentGuids);
                Ext.each(newRoomGuids, function (newRoomGuid)
                {
                    Ext.each(newContent, function (newRoom)
                    {
                        if (newRoom.getGuid() === newRoomGuid)
                        {
                            newRooms.push(newRoom);
                        }
                    });
                });
                this.getStore().add(newRooms);
            }
        }
        else
        {
            //keine guids werden übergeben, wenn bei einem relogin CurrentState_Chats getTeamChatRooms aufruft - dann muss man nur den oldContent aktualisieren
            var oldContent = this.getOldContent();
            this.oldContentGuids = Ext.Array.pluck(oldContent, "Guid");
            this.getStore().removeAll();
            this.getStore().add(oldContent);
        }
        
        if (this.getStore().getCount() === 0)
        {
            var errorMessage = this.parent.onNoChoosableChatRoomsAvailable();

            this.getStore().add(
            {
                errorMessage: errorMessage
            });
            this.setMinHeight(25);
        }
        else
        {
            this.getSelectionModel().select(0);
        }
    },

    getRecordsByGuid: function (guid)
    {
        var result = [];
        this.getStore().each(function (record) 
        {
            if (isValid(record, "data.getGuid()"))
            {
                if (record.data.getGuid() === guid) 
                {
                    result.push(record);
                }
            }
        });
        return result;
    },

    getContent: function (response)
    {
        if (isValid(response, "getChatRoomInfos()"))
        {
            return response.getChatRoomInfos();
        }
        return [];
    },

    getOldContent: function ()
    {
        return CURRENT_STATE_CHATS.getChoosableTeamChatRooms();
    },

    getContentFromStore: function () {
        var result = [];
        this.getStore().each(function (record) {
            result.push(record.data);
        });
        return result;
    },

    getResult: function ()
    {
        var selectedRecords = this.getSelectionModel().getSelection();
        if (!isValid(selectedRecords) || selectedRecords.length !== 1)
        {
            return null;
        }
        return selectedRecords[0].data;
    },

    onContactSelected: function (record, item)
    {
        this.parent.onTeamChatChosen();
    },

    getOverlayButtons: function (record, item)
    {
        return [];
    }
});

Ext.define('TeamChatListForAllTeamChatRooms',
{
    extend: 'TeamChatList',
    getOldContent: function () {
        return CURRENT_STATE_CHATS.getTeamChatRooms();
    }
});


Ext.define('BlackBoardList',
{
    extend: 'TeamChatList',

    getContent: function (response)
    {
        if (isValid(response, "getBlackboardInfos()"))
        {
            return response.getBlackboardInfos();
        }
        return [];
    },

    getOldContent: function () {
        return CURRENT_STATE_CHATS.getChoosableBlackBoards();
    },

    onGetBlackBoardsSuccess: function (response) {
        this.onServerResponse(response);
    },

    onGetBlackBoardsException: function () {
        this.onServerResponse();
    }
});

Ext.define('BlackBoardListForAllBlackBoards',
{
    extend: 'BlackBoardList',
    
    getOldContent: function () {
        return CURRENT_STATE_CHATS.getBlackBoards();
    }
});


Ext.define('ChooseTeamChatContainer',
{
    extend: 'ModalDialog',
    okCallback: Ext.emptyFn,

    listClassName: 'TeamChatList',

    initComponent: function ()
    {
        this.titleText = this.titleText || LANGUAGE.getString("selectChatRoom");

        this.callParent();
        
        var self = this;

        var container = new Ext.Container(
        {
            border: false,

            layout:
            {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            }
        });
        
        this.list = Ext.create(this.listClassName,
        {
            style: 'border: 1px solid ' + COLOR_SEPARATOR,
            margin: '5 0',
            parent: this
        });
        
        //dieser Container brauche ich nur, damit this.list einen scrollbalken erhält
        container.add(this.list);

        this.notifyNewMessages = Ext.create('Ext.form.field.Checkbox',
        {
            checked: true,
            boxLabel: LANGUAGE.getString('showNotifications'),
            flex: 1
        });

        this.addToBody(container);

        this.addButton(this.notifyNewMessages);
        this.addButton({
            text: LANGUAGE.getString("ok"),
            listeners:
                {
                    click: function (event)
                    {
                        self.onTeamChatChosen();
                    }
                }
        });
    },

    updatePosition: function ()
    {
        //this.setStyle({ top: '50%', left: '50%', transform: 'translate(-50 %, -50 %)' });
    },

    focus: function ()
    {
        this.list.focus();
    },

    onTeamChatChosen: function ()
    {
        var result = this.list.getResult();
        
        this.hide();

        if (isValid(result))
        {
            result.setShowNotification(this.notifyNewMessages.getValue());
            this.updateRoom(result);

            var self = this;
            Ext.asap(function ()
            {
                self.okCallback(result);
            });
        }
    },

    updateRoom: function (room)
    {
        CURRENT_STATE_CHATS.updateTeamChatRoom(room);
    },

    onNoChoosableChatRoomsAvailable: function()
    {
        var errorMessage = LANGUAGE.getString("noMoreChatRooms");
        if (Ext.isEmpty(CURRENT_STATE_CHATS.getTeamChatRooms()))
        {
            errorMessage = LANGUAGE.getString("noChatRooms");
        }
        return errorMessage;
    },

    removeAllButtonsExceptOK: function ()
    {
        //this.buttonContainer.remove(this.notifyNewMessages);
    }
});

Ext.define('ChooseBlackBoardContainer',
{
    extend: 'ChooseTeamChatContainer',
    listClassName: 'BlackBoardList',

    onNoChoosableChatRoomsAvailable: function ()
    {
        var errorMessage = LANGUAGE.getString("noMoreBlackBoards");
        if (Ext.isEmpty(CURRENT_STATE_CHATS.getBlackBoards()))
        {
            errorMessage = LANGUAGE.getString("noBlackBoards");
        }
        return errorMessage;
    },

    initComponent: function ()
    {
        this.titleText = LANGUAGE.getString("selectBlackBoard");
        this.callParent();
    },

    updateRoom: function (room)
    {
        CURRENT_STATE_CHATS.updateBlackBoard(room);
    }
});