/**
 * Created by jebing on 16.01.2015.
 */
Ext.define(CLASS_MAIN_CHAT_PANEL,
{
    extend: 'Ext.Container',

    style: 'background-color: white',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    scrollable: 'vertical',

    initComponent: function ()
    {

        this.titleIconWhite = IMAGE_LIBRARY.getImage('chat', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage('chat', 64, COLOR_TAB_ICON_NORMAL);

        this.tabConfig =
        {
            icon: this.titleIconBlack,
            tooltip: LANGUAGE.getString('chat')
        };

        this.callParent();

        this.createComponents();

        this.setVisible(SESSION.isOneOfTheseFeaturesAllowed([TimioFeature.Chat, TimioFeature.LiveChat]));

        this.on('boxready', function ()
        {
            SESSION.addListener(this);
        }, this);
    },

    createComponents: function ()
    {
        var components = [];

        this.liveChatPanelHeader = this.createCollapsibleContainer(LANGUAGE.getString('liveChats'), 'LiveChatsPanel');
        this.liveChatPanelHeader.hide();

        if (SESSION.isFeatureAllowed(TimioFeature.LiveChat))
        {
            components.push(this.liveChatPanelHeader);
            if (!SESSION.isFeatureAllowed(TimioFeature.Chat))
            {
                this.liveChatPanelHeader.show();
            }
        }

        this.liveChatPanelHeader.panel.hide();
        this.liveChatPanelHeader.panel.on('show', function ()
        {
            this.liveChatPanelHeader.show();
        }, this);
        this.liveChatPanelHeader.panel.on('hide', function ()
        {
            this.liveChatPanelHeader.hide();
        }, this);
            

        if (SESSION.isFeatureAllowed(TimioFeature.Chat) && MY_CONTACT.getRightChat())
        {
            this.userChatPanelHeader = this.createUserChatsContainer();
            components.push(this.userChatPanelHeader);

            this.teamChatPanelHeader = this.createTeamChatsContainer();
            components.push(this.teamChatPanelHeader);

            this.blackBoardPanelHeader = this.createBlackBoardsContainer();
            components.push(this.blackBoardPanelHeader);
        }
        

        GLOBAL_EVENT_QUEUE.addEventListener(this);

        this.add(components);
    },

    createUserChatsContainer: function ()
    {
        var userChatContainer = this.createCollapsibleContainer(LANGUAGE.getString('userChats'), 'UserChatsPanel', function ()
        {
            var dialog = Ext.create('ChooseChatPartnerContainer',
                {
                    parent: dialog
                });
            dialog.show();
        });
        return userChatContainer;
    },

    createTeamChatsContainer: function ()
    {
        var teamChatContainer = this.createCollapsibleContainer(LANGUAGE.getString('teamChats'), 'TeamChatsPanel', function ()
        {
            var chosenTeamChatRooms = CURRENT_STATE_CHATS.getChosenTeamChatRooms(CURRENT_STATE_CHATS.clientSettingsKeyForTeamChats);
            var chosenTeamChatRoomGuids = Ext.Array.pluck(chosenTeamChatRooms, "Guid");
            SESSION.getTeamChatRooms(chosenTeamChatRoomGuids);

            Ext.create('ChooseTeamChatContainer',
            {
                width: 400,
                okCallback: function (result)
                {
                    teamChatContainer.panel.onAddTeamChat(result);
                }
            }).show();
        });
        
        return teamChatContainer;
    },

    createBlackBoardsContainer: function ()
    {
        var blackBoardsContainer = this.createCollapsibleContainer(LANGUAGE.getString('blackBoards'), 'BlackBoardsPanel', function ()
        {
            var chosenBlackBoards = CURRENT_STATE_CHATS.getChosenTeamChatRooms(CURRENT_STATE_CHATS.clientSettingsKeyForBlackBoards);
            var chosenBlackBoardGuids = Ext.Array.pluck(chosenBlackBoards, "Guid");
            SESSION.getBlackBoards(chosenBlackBoardGuids);

            Ext.create('ChooseBlackBoardContainer',
                {
                    width: 400,
                    okCallback: function (result)
                    {
                        blackBoardsContainer.panel.onAddTeamChat(result);
                    }
                }).show();
        });
        
        return blackBoardsContainer;
    },

    createCollapsibleContainer: function (title, panelClassName, clickOnToolCallback)
    {
        var collapsibleContainer = Ext.create('CollapsibleContainerWithHeader',
        {
            margin: '0 0 0 5',
            titleText: title
        });

        if (clickOnToolCallback)
        {
            collapsibleContainer.addTool(Ext.create('ThinButton',
                {
                    changeColorOnHover: true,
                    hoverColor: COLOR_MAIN_GREY,
                    normalColor: NORMAL_GREY,
                    icon: 'images/64/add.png',
                    margin: '0 5 0 5',
                    listeners:
                    {
                        click: function ()
                        {
                            clickOnToolCallback();
                        }
                    }
                }));
        }
        
        collapsibleContainer.panel = collapsibleContainer.add(Ext.create(panelClassName,
        {
            margin: '-1 0 0 0'
        }));
        return collapsibleContainer;
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        GLOBAL_EVENT_QUEUE.removeEventListener(this);

        this.callParent();
    },

    onGlobalEvent_ChatChannelSelected: function ()
    {
        var self = this;
        var headers =
        [
            this.liveChatPanelHeader,
            this.userChatPanelHeader,
            this.teamChatPanelHeader,
            this.blackBoardPanelHeader
        ].filter(function (header)
        {
            if (self.contains(header))
            {
                return header;
            }
        });

        var opened = false;
        Ext.each(headers, function (header)
        {
            if (header.panel.getNumberNewMessages() > 0)
            {
                if (!opened)
                {
                    header.panel.openFirstChatWithUnreadMessages();
                    opened = true;
                }
                
                header.expandContainer();
            }
        });
        if (!opened)
        {
            Ext.each(headers, function (header)
            {
                if (header.panel.openFirstChat())
                {
                    return false;
                }
            });
        }
    },

    onNewEvents: function (response)
    {
        if (!SESSION.isFeatureAllowed(TimioFeature.Chat) && CURRENT_STATE_CONTACT_CENTER.mayReceiveLiveChats())
        {
            this.liveChatPanelHeader.show();
        }
    }
});