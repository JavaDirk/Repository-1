var WELCOME_PAGE_CHANNEL_WIDTH = 475;
var WELCOME_PAGE_CHANNEL_MARGIN_TOP = 25;

var CHANNEL_TRESHOLD_FOR_SWITCHING_TO_SMALL_VIEW = 275;

Ext.define('WelcomePage_Header',
    {
        extend: 'Ext.Component',
        
        childEls: ['welcomePageHeaderEl', 'nameEl', 'numberMissedCallsEl', 'loginTimeEl', 'loginDurationEl'],
        
        initComponent: function ()
        {
            this.loginTime = SESSION.getLastLoginTimeStamp();

            this.renderTpl = '<div class="welcomePageChannel welcomePageHeaderGrid" id="{id}-welcomePageHeaderEl" data-ref="welcomePageHeaderEl"  style="color:white;padding:10px 25px 10px 25px;border-radius:' + BORDER_RADIUS_BUTTONS + '">' +
                                '<div id="{id}-nameEl" data-ref="nameEl" class="welcomeSubTitle name" style="grid-area:name;margin-left:10px">' + MY_CONTACT.getFullName() + '</div>' +
                                '<div class="welcomeSubTitle clientMode" style="grid-area:clientMode;">' + SESSION.getClientModeName() + '</div>' +
                                '<div style="grid-area:numberMissedCalls;">' +
                                    '<div id="{id}-numberMissedCallsEl" data-ref="numberMissedCallsEl" class="welcomeSubTitle" style="">-</div>' +
                                    '<div class="statisticValue" style="">' + LANGUAGE.getString("missedCalls") + '</div>' +
                                '</div>' +
                                '<div style="grid-area:loginTime;">' +
                                    '<div id="{id}-loginTimeEl" data-ref="loginTimeEl" class="welcomeSubTitle" style="">' + formatTimeString(this.loginTime) + '</div>' +
                                    '<div class="statisticValue" style="">' + LANGUAGE.getString("loginTime") + '</div>' +
                                '</div>' +
                                '<div style="grid-area:loginDuration;">' +
                                    '<div id="{id}-loginDurationEl" data-ref="loginDurationEl" class="welcomeSubTitle" style="">00:00</div>' +
                                    '<div class="statisticValue" style="">' + LANGUAGE.getString("loginDuration") + '</div>' +
                                '</div>' +
                            '</div>';
            this.callParent();

            var self = this;
            this.on('boxready', function ()
            {
                SESSION.addListener(this);
                GLOBAL_EVENT_QUEUE.addEventListener(this);

                var changeDuration = () =>
                {
                    var difference = new Date().getTime() - this.loginTime.getTime();

                    if (!self.loginDurationEl.destroyed)
                    {
                        self.loginDurationEl.dom.innerHTML = convertSecondsToHoursAndMinutesString(Math.floor(difference / 1000));
                    }
                };
                changeDuration();
                this.durationInterval = setInterval(changeDuration, 60 * 1000);

                self.updateNumberMissedCalls();
            }, this);
        },

        onResize: function ()
        {
            Ext.asap(() =>
            {
                const newSizeType = this.getWidth() > CHANNEL_TRESHOLD_FOR_SWITCHING_TO_SMALL_VIEW ? "large" : "small";
                const small = newSizeType === 'small';

                this.welcomePageHeaderEl.dom.classList[small ? 'add' : 'remove']('small_welcomePageHeaderGrid');
            }, this);
        },

        updateNumberMissedCalls: function ()
        {
            if (SESSION.isTelephonyAllowed())
            {
                if (CURRENT_STATE_JOURNAL.getJournalState() === JournalState.Loaded)
                {
                    var count = CURRENT_STATE_JOURNAL.getCountMissedCalls();
                    if (this.isStateOk())
                    {
                        this.numberMissedCallsEl.dom.innerHTML = count;
                    }
                }
            }
            else
            {
                this.hideNumberMissedCallsElement();
            }
        },

        onGlobalEvent_ResetMissedCalls: function ()
        {
            if (!this.isStateOk())
            {
                return;
            }
            if (SESSION.isTelephonyAllowed())
            {
                this.numberMissedCallsEl.dom.innerHTML = 0;
            }
            else
            {
                this.hideNumberMissedCallsElement();
            }
        },

        hideNumberMissedCallsElement: function ()
        {
            this.numberMissedCallsEl.dom.parentNode.style.display = "none";
        },

        onGetJournalSuccess: function (response)
        {
            if (response.getReturnValue().getCode() === 0)
            {
                this.updateNumberMissedCalls();
            }
        },

        onNewEvents: function (response)
        {
            if (!Ext.isEmpty(response.getJournalEntries()))
            {
                this.updateNumberMissedCalls();
            }
        },

        destroy: function ()
        {
            SESSION.removeListener(this);
            GLOBAL_EVENT_QUEUE.removeEventListener(this);
            clearInterval(this.durationInterval);
            this.callParent();
        }
    });

Ext.define('WelcomePage',
    {
        extend: 'Ext.Component',

        title: 'WelcomePage',

        isEqualToThisPanel: function (panel)
        {
            return getClassName(this) === getClassName(panel);
        },

        scrollable: 'vertical',

        padding: WELCOME_PAGE_CHANNEL_MARGIN_TOP,

        childEls: ['mainContainerEl', 'leftContainerEl', 'rightContainerEl', 'headerEl'],

        initComponent: function ()
        {
            this.style = this.style || 'background-image:url(' + OEM_SETTINGS.getWelcomePageBackgroundImage() + ');background-size:cover;background-repeat:no-repeat';

            this.renderTpl = '<div class="welcomePageGrid" id="{id}-mainContainerEl" data-ref="mainContainerEl" style="justify-content:center">' +
                                    '<div id="{id}-headerEl" data-ref="headerEl" style="grid-area:header;"></div>' +
                                    '<div id="{id}-leftContainerEl" data-ref="leftContainerEl" style="grid-area:actions;"></div>' +
                                    '<div id="{id}-rightContainerEl" data-ref="rightContainerEl" style="grid-area:userActions"></div>' +
                            '</div>';

            this.callParent();

            SESSION.addListener(this);
            GLOBAL_EVENT_QUEUE.addEventListener(this);

            
            this.on('resize', function (component, newWidth)
            {
                var actions = ACTIONS.getActionsForWelcomePage();
                var makeSmall = newWidth < 1025 || Ext.isEmpty(actions);

                this.mainContainerEl.dom.classList[makeSmall ? 'add' : 'remove']('small_welcomePageGrid');

                Ext.each(this.channels, function (channel)
                {
                    channel.onResize();
                }, this);

                this.welcomePageHeader.onResize();
            }, this);

            this.on('boxready', () =>
            {
                this.welcomePageHeader = new WelcomePage_Header({ renderTo: this.headerEl });

                var defaultCallFunction = function (target)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_showDialogForNewCall();
                };

                var menuItemsForTelephony =
                    [
                        {
                            label: LANGUAGE.getString('startCall') + '...',
                            clickFunction: function (target)
                            {
                                defaultCallFunction(target);
                            }
                        }
                    ];
                if (CURRENT_STATE_CALL.isCallDiversionAllowed())
                {
                    menuItemsForTelephony.push({
                        label: LANGUAGE.getString('setCallDiversion') + '...',
                        clickFunction: function (target)
                        {
                            GLOBAL_EVENT_QUEUE.onGlobalEvent_setCallDiversion();
                        }
                    });
                }

                this.channels = [];
                if (SESSION.isTelephonyAllowed())
                {
                    this.channels.push(new WelcomePageChannel(
                        {
                            renderTo: this.leftContainerEl,
                            parent: this,
                            imageSrc: 'Images/phone.svg',
                            subTitle: LANGUAGE.getString('telephony'),
                            imageName: 'phone',
                            defaultClickFunction: function (target)
                            {
                                defaultCallFunction(target);
                            },
                            menuItemData: menuItemsForTelephony
                        }));
                }

                var defaultChatFunction = function (target)
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_startUserChat(target);
                };

                this.welcomePageChannelChats = new WelcomePageChannel(
                    {
                        renderTo: this.leftContainerEl,
                        parent: this,
                        imageSrc: 'Images/chat.svg',
                        subTitle: LANGUAGE.getString('chat'),
                        imageName: 'chat',
                        defaultClickFunction: defaultChatFunction,
                        hidden: !CURRENT_STATE_CHATS.isChatAllowedAndPossible(),
                        menuItemData:
                            [
                                {
                                    label: LANGUAGE.getString('newConversation') + '...',
                                    clickFunction: function (target)
                                    {
                                        defaultChatFunction(target);
                                    }
                                },
                                {
                                    label: LANGUAGE.getString('openTeamchat') + '...',
                                    clickFunction: function ()
                                    {
                                        GLOBAL_EVENT_QUEUE.onGlobalEvent_openTeamChatDialog();
                                    }
                                },
                                {
                                    label: LANGUAGE.getString('openBlackBoard') + '...',
                                    clickFunction: function ()
                                    {
                                        GLOBAL_EVENT_QUEUE.onGlobalEvent_openBlackBoardDialog();
                                    }
                                }
                            ]
                    });
                this.channels.push(this.welcomePageChannelChats);

                var defaultVideoFunction = function ()
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_startVideoChat();
                };

                var stunServerAvailable = CURRENT_STATE_CHATS.areStunServerConfigured();
                var rightVideo = MY_CONTACT.getRightVideo();
                if (rightVideo)
                {
                    var menuItemData =
                        [
                            {
                                label: LANGUAGE.getString('newConversation') + '...',
                                clickFunction: function (target)
                                {
                                    defaultVideoFunction(target);
                                }
                            }
                        ];
                    menuItemData.push({
                        label: LANGUAGE.getString('inviteExternalPartner') + '...',
                        clickFunction: function ()
                        {
                            GLOBAL_EVENT_QUEUE.onGlobalEvent_createInvitation(null);
                        },
                        htmlId: 'welcomePage_inviteExternalPartner',
                        visible: stunServerAvailable
                    });
                    menuItemData.push({
                        label: LANGUAGE.getString('listOfInvitation') + '...',
                        clickFunction: function ()
                        {
                            GLOBAL_EVENT_QUEUE.onGlobalEvent_showInvitations();
                        },
                        htmlId: 'welcomePage_showInvitations',
                        visible: stunServerAvailable
                    });

                    if (SESSION.isFeatureAllowed(TimioFeature.WebRtcOutgoing))
                    {
                        this.channels.push(new WelcomePageChannel(
                            {
                                renderTo: this.leftContainerEl,
                                parent: this,
                                imageSrc: 'Images/video.svg',
                                subTitle: LANGUAGE.getString('video'),
                                imageName: 'video',
                                defaultClickFunction: defaultVideoFunction,
                                menuItemData: menuItemData
                            }));
                    }
                }

                if (SESSION.isFeatureAllowed(TimioFeature.Contacts))
                {
                    this.channels.push(new WelcomePageChannel(
                        {
                            renderTo: this.leftContainerEl,
                            parent: this,
                            imageSrc: 'Images/user.svg',
                            subTitle: LANGUAGE.getString('contacts'),
                            imageName: 'user',
                            defaultClickFunction: function (target)
                            {
                                GLOBAL_EVENT_QUEUE.onGlobalEvent_ChannelSelected(Ext.create(CLASS_CHANNEL_CONTACTS, {}));
                            },
                            menuItemData:
                                [
                                    {
                                        label: LANGUAGE.getString('myContacts') + '...',
                                        clickFunction: function ()
                                        {
                                            GLOBAL_EVENT_QUEUE.onGlobalEvent_ChannelSelected(Ext.create(CLASS_CHANNEL_CONTACTS, {}));
                                        }
                                    },
                                    {
                                        label: LANGUAGE.getString('searchContacts') + '...',
                                        clickFunction: function ()
                                        {
                                            GLOBAL_EVENT_QUEUE.onGlobalEvent_SearchContact(undefined, false, true, LANGUAGE.getString('searchContacts'));
                                        }
                                    },
                                    {
                                        label: LANGUAGE.getString('addContact') + "...",
                                        clickFunction: function ()
                                        {
                                            GLOBAL_EVENT_QUEUE.onGlobalEvent_CreateContact('');
                                        }
                                    }
                                ]
                        }));
                }

                var actions = ACTIONS.getActionsForWelcomePage();
                Ext.each(actions, function (action)
                {
                    this.channels.push(new WelcomePageChannel(
                        {
                            renderTo: this.rightContainerEl,
                            parent: this,
                            imageSrc: 'images/launch.svg',
                            subTitle: action.getName(),
                            tooltip: action.getTooltip(),
                            imageName: 'action',
                            defaultClickFunction: function (target)
                            {
                                action.execute(this.subTitle);
                            }
                        }));
                }, this);
            }, this);
        },

        getLayoutPack: function ()
        {
            return OEM_SETTINGS.getPositionForWelcomeHeader();
        },


    onGetWebRtcConfigurationSuccess: function (response)
    {
        var elements = getHTMLElements('#welcomePage_inviteExternalPartner, #welcomePage_showInvitations');

        var stunServerAvailable = CURRENT_STATE_CHATS.areStunServerConfigured();
        
        Ext.each(elements, function (element)
        {
            element.style.display = stunServerAvailable ? "block" : "none";
        });
    },

    onGlobalEvent_newWebRtcConfiguration: function (configuration)
    {
        this.onGetWebRtcConfigurationSuccess();
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        this.callParent();
    },

    onNewEvents: function (response)
    {
        if (this.welcomePageChannelChats)
        {
            this.welcomePageChannelChats.setVisible(CURRENT_STATE_CHATS.isChatAllowedAndPossible());
        }
    }
});

Ext.define('WelcomePageChannel',
    {
        extend: 'Ext.Component',
        imageSrc: undefined,
        subTitle: undefined,
        clickFunction: undefined,
        cursor: 'pointer',
        menuItems: undefined,
        menuItemData: undefined,
        imageName: undefined,
        
        margin: WELCOME_PAGE_CHANNEL_MARGIN_TOP + ' 0 0 0',
        
        initComponent: function ()
        {
            this.callParent();

            this.menuItems = [];

            this.createMenuItems();
            
            this.template = '<div class="welcomePageChannel" style="height:' + (3 * HEIGHT_WELCOME_PAGE_LIST_ITEM + 10) + 'px;display:flex;justify-content:center;padding:0 25px;align-items:center;border-radius:' + BORDER_RADIUS_BUTTONS + '">' +
                                '<div class="svgWrapper" style="cursor:pointer">' +
                                    '<img class="welcomePageSvg svg" src="' + this.imageSrc + '"></img>' +
                                '</div>' +
                                '<div class="welcomeSubTitle eclipsedText" style="text-align:left;cursor:pointer;margin:-5px 0 0 25px;flex:1">' + this.subTitle + '</div>' +
                                '<div class="menuButton" style="display:' + (Ext.isEmpty(this.menuItems) ? 'none' : 'flex') + ';margin:0 0 0 5px;background-image:url(' + IMAGE_LIBRARY.getImage('more', 64, WHITE) + ');background-repeat:no-repeat;background-size:contain;width:36px;height:36px"></div>' +
                                this.menuItems +
                            '</div>';
            
            this.update(this.template);

            var self = this;
            this.on('boxready', function (image)
            {
                SvgInjector.injectSvgs();

                var listItems = Ext.select('#' + self.getId() + ' ul li').elements;
                self.addClickListenerToListItems(listItems);

                var svgImage = Ext.select('#' + self.getId() + ' .svgWrapper').elements[0];
                self.addListenerForImage(svgImage);

                var subtitle = Ext.select('#' + self.getId() + ' .welcomeSubTitle').elements[0];
                self.addListenerForSubtitle(subtitle);

                self.menuButton = Ext.select('#' + self.getId() + ' .menuButton').elements[0];

                var tooltipForIcon = this.subTitle;
                if (isValidString(this.tooltip))
                {
                    tooltipForIcon += "<br />" + this.tooltip;
                }
                if (!Ext.isEmpty(this.menuItemData))
                {
                    tooltipForIcon = this.menuItemData[0].label;
                }

                image.tooltipControl = Ext.create('Ext.tip.ToolTip',
                {
                    target: self.el,
                    html: tooltipForIcon,
                    showDelay: 1000,
                    autoHide: true,
                    trackMouse: false,
                    listeners:
                    {
                        beforeShow: function (tooltip)
                        {
                            var text = self.sizeType === "large" ? self.tooltip : tooltipForIcon;
                            tooltip.setHtml(text);
                            
                            return isValidString(text);
                        }
                    }
                });
                

                self.el.on('mouseenter', function ()
                {
                    if (Ext.isEmpty(self.menuItemData) || this.sizeType === "small")
                    {
                        return;
                    }
                    var menuItems = Ext.select('#' + self.getId() + ' .welcomePageListItem').elements;
                    Ext.each(self.menuItemData, function (menuItemData, index)
                    {
                        if (menuItemData.shouldBeVisible)
                        {
                            var menuItem = menuItems[index];
                            if (menuItem)
                            {
                                menuItem.style.display = menuItemData.shouldBeVisible() ? 'block' : 'none';
                            }
                        }
                    }, this);
                    self.setDisplayOnWelcomePageList(this.el, 'flex');
                    self.setOpacityOnWelcomePageList(this.el, 1);
                    self.menuButton.style.display = 'none';
                    if (isElementTooSmall(subtitle))
                    {
                        subtitle.style.display = 'none';
                    }
                }, this, { delegate: '.menuButton' });

                self.el.on('mouseleave', function ()
                {
                    self.setDisplayOnWelcomePageList(this.el, 'none');
                    self.setOpacityOnWelcomePageList(this.el, 0);

                    if (Ext.isEmpty(self.menuItemData) || this.sizeType === "small")
                    {
                        return;
                    }

                    self.menuButton.style.display = 'flex';
                    subtitle.style.display = this.getDisplayValue('welcomeSubTitle');
                }, this);

            });

            this.on('destroy', function (image)
            {
                if (image.tooltipControl)
                {
                    image.tooltipControl.destroy();
                }
            });
        },

        getDisplayValue: function (className)
        {
            return className === 'welcomeSubTitle' ? 'block' : 'flex';
        },
        
        onResize: function ()
        {
            Ext.asap(() =>
            {
                
                var classNames = ['menuButton', 'welcomeSubTitle', 'spacer'];
                Ext.each(classNames, function (className)
                {
                    this.setDisplay(this.el, className, this.getDisplayValue(className));
                }, this);

                var width = this.getWidth();
                if (width === 0)
                {
                    return;
                }
                const newSizeType = width > CHANNEL_TRESHOLD_FOR_SWITCHING_TO_SMALL_VIEW ? "large" : "small";
                if (newSizeType === this.sizeType)
                {
                    //return;
                }
                this.sizeType = newSizeType;

                Ext.each(classNames, function (className)
                {
                    var displayValue = this.sizeType === "large" ? this.getDisplayValue(className) : 'none';
                    this.setDisplay(this.el, className, displayValue);
                }, this);

                if (Ext.isEmpty(this.menuItemData))
                {
                    this.menuButton.style.display = 'none';
                }
                //this.el.dom.style.margin = this.sizeType === "large" ? '' : ''
            }, this);
            
        },

        setOpacityOnWelcomePageList: function (element, opacity)
        {
            this.setOpacity(element, 'welcomePageListWrapper', opacity);
        },

        setOpacity: function (element, cssClass, opacity)
        {
            var welcomePageList = element.down('.' + cssClass);
            if (welcomePageList)
            {
                welcomePageList.dom.style.opacity = opacity;
            }
        },

        setDisplayOnWelcomePageList: function (element, value)
        {
            this.setDisplay(element, 'welcomePageListWrapper', value);
        },

        setDisplay: function (element, cssClass, value)
        {
            var welcomePageList = element.down('.' + cssClass);
            if (welcomePageList)
            {
                welcomePageList.dom.style.display = value;
            }
        },

        createMenuItems: function ()
        {
            if (Ext.isEmpty(this.menuItemData))
            {
                this.menuItems = '';
                return;
            }
            var self = this;
            this.menuItems = '<div class="welcomePageListWrapper" style="transition:0.3s;display:none;flex-direction:column;opacity:0;justify-content:space-around">' +
                                '<ul class="welcomePageList" style="padding-inline-start:0px">';

            Ext.each(this.menuItemData, function (menuItemData, index)
            {
                self.menuItems += self.createMunItem(menuItemData);
            });

            this.menuItems += '</ul></div>';
        },
        createMunItem: function (menuItemData)
        {
            var classes = 'welcomePageListItem eclipsedText';

            var id;
            if (isValid(menuItemData.htmlId))
            {
                id = 'id="' + menuItemData.htmlId + '"';
            }

            var style = 'style="line-height:normal;';
            if (menuItemData.visible === false)
            {
                style += 'display:none;';
            }
            style += '"';

            var tooltip;
            if (isValid(menuItemData.tooltip))
            {
                tooltip = 'title="' + menuItemData.tooltip + '"';
            }
            if (menuItemData.button)
            {
                return '<button class="eclipsedText action" ' + tooltip + ' style="text-align:center;min-width:150px;border:none;height:28px;border-radius:2px;cursor:pointer;color:white;margin-bottom:5px;background-color:' + COLOR_MAIN_GREY + '">' + menuItemData.label + '</button>';
            }
            return '<li ' + style + " " + (isValid(id) ? id : "") + " " + (isValid(tooltip) ? tooltip : "") +' class="' + classes + '">' + menuItemData.label + '</li>';

        },
        addClickListenerToListItems: function (items)
        {
            var self = this;

            Ext.each(items, function (item, index)
            {
                var clickFunction = self.menuItemData[index].clickFunction;

                item.addEventListener('click', function ()
                {
                    clickFunction(item);
                }, false);
            });
        },
        addListenerForImage: function(image)
        {
            var self = this;

            image.addEventListener('click', function (me)
            {
                me = me.currentTarget || me.srcElement;

                self.defaultClickFunction(me);
            });
        },

        addListenerForSubtitle: function(subtitle)
        {
            var self = this;

            subtitle.addEventListener('click', function (me)
            {
                me = me.currentTarget || me.srcElement;

                self.defaultClickFunction(me);
            });
        }
    });