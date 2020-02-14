/**
 * Created by jebing on 19.12.2014.
 */
Ext.define('Header',
{
    extend: 'Ext.Container',
    
    layout:
    {
        type: 'hbox',
        pack: 'start'
    },

    cls: 'header',
    height: 44,
    padding: '3 0 0 0',

    initComponent: function ()
    {
        this.style = this.style || 'background-color:' + COLOR_HEADER_BAR;
        
        this.callParent();

        var self = this;

        this.add(new Ext.Component({
            html: '<div style="margin: 5px 0px 0px 8px; background-size: 150px 30px; height: 30px; background-repeat: no-repeat; background-image: url(' + OEM_SETTINGS.getLogoHeaderBar() + ');"></div>',
            responsiveConfig:
            {
                'width < 525': {image: 'small'},
                'width >= 525': {image: 'large'}
            },
            setImage: function (iconSize)
            {
                if (this.el)
                {
                    var url = iconSize === 'small' ? OEM_SETTINGS.getSmallLogoHeaderBar() : OEM_SETTINGS.getLogoHeaderBar();
                    this.el.dom.firstChild.style.backgroundImage = 'url(' + url + ')';
                    this.el.dom.firstChild.style.width = iconSize === 'small' ? '80px' : '150px';
                    return;
                }
                
                this.iconSize = iconSize;
            },
            style:
            {
                cursor: 'pointer'
            },
            listeners:
            {
                boxready: function (me)
                {
                    /*
                    if (!me.iconSize)
                    {
                        if (window.innerWidth >= 525)
                        {
                            me.iconSize = window.innerWidth >= 525 ? 'large' : 'small'
                        }
                    }*/
                    if (me.iconSize)
                    {
                        me.setImage(me.iconSize);
                    }
                },

                el:
                {
                    click: function ()
                    {
                        GLOBAL_EVENT_QUEUE.onGlobalEvent_ChannelSelected(Ext.create(CLASS_CHANNEL_WELCOME, {}));                        
                    }
                }
            }
        }));

        this.add(Ext.create('Ext.Component',
        {
            html: '<div class="svgWrapper smallSvg" style="cursor:pointer" title="' + LANGUAGE.getString('openTimioWidget') + '">' +
                IMAGE_LIBRARY.getLaunchIcon() +
                '</div>',
            margin: '11 0 0 5',
            listeners:
            {
                boxready: function ()
                {
                    SvgInjector.injectSvgs();
                },
                el:
                {
                    click: function ()
                    {
                        var url = '../timioWidget/timioWidget.html?language=' + LANGUAGE.getLanguage() + '&phoneMode=' + SESSION.getCtiMode();
                        return window.open(url, "_blank", "chrome, locationbar=no, toolbar=no, menubar=no, personalbar=no, status=no, width=340, height=435");
                    }
                }
            }
        }));

        this.add(Ext.create('Ext.Component',
        {
            flex: 1
        }));
        
        this.mediaStatePanel = new ChannelStatePanel({
            style: {
                'background-color': 'transparent'
            }
        });
        
        this.add(this.mediaStatePanel);
        
        var showHideListeners = {
            show: () => { this.checkHeaderWidth(); },
            hide: () => { this.checkHeaderWidth(); }
        };
        this.add(new AgentStateContainer(
        {
            listeners: showHideListeners,
            responsiveConfig:
            {
                'width < 400': { agentStateTextVisibility: false },
                'width >= 400': { agentStateTextVisibility: true }
            }
        }));

        this.add(new PresenceTextContainer(
        {
            listeners: showHideListeners
        }));
        
        this.headerPhoto = Ext.create('HeaderFoto', {
            contact: MY_CONTACT,
            margin: '2 0 0 10',
            scale: 32
        });
        this.add(this.headerPhoto);

        var gearWheelImage = Ext.create('Ext.Img',
        {
            src: IMAGE_LIBRARY.getImage('menu', 64, WHITE),
            alt: 'menu',
            height: 16,
            width: 16,
            margin: '10 0 0 0'
        });

        this.settingsImage = Ext.create('Ext.Container',
        {
            width: 35,
            height: 44,

            layout:
            {
                type: 'hbox',
                pack: 'start'
            },
            overCls: 'mediaHover',
            items:
            [
                gearWheelImage
            ],
            padding: '0 0 0 10',
            margin: '0 5 0 10',
            
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        var settingsMenu = self.createSettingsContent();
                        settingsMenu.showBy(gearWheelImage);
                        settingsMenu.setStyle({ left: 'auto', right: '5px' });
                    }
                }
            }
        });

        this.add(this.settingsImage);

        SESSION.addListener(this);

        this.on('resize', function (me, width, height, oldWidth, oldHeight)
        {
            me.checkHeaderWidth();
        }, this);

        this.on('boxready', function (me, width)
        {
            var innerCt = getInnerContainer(me);
            me.innerCt = innerCt;
        }, this);

        Ext.mixin.Responsive.notify();
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        this.callParent();
    },

    checkHeaderWidth: function ()
    {
        this.checkIfHeaderIsTooSmallForContent();
        this.updateChannelVisibility();
    },

    checkIfHeaderIsTooSmallForContent: function ()
    {
        this.showChannels();

        this.headerIsTooSmall = isElementTooSmall(this.innerCt.dom);
    },

    updateChannelVisibility: function ()
    {
        if (this.isTooSmallForContent())
        {
            this.hideChannels();
        }
        else
        {
            this.showChannels();
        }
    },

    isTooSmallForContent: function ()
    {
        return this.headerIsTooSmall;
    },

    showChannels: function ()
    {
        this.mediaStatePanel.show();
    },

    hideChannels: function ()
    {
        this.mediaStatePanel.hide();
    },

    createSettingsContent: function ()
    {
        var insertItems = [];

        if (this.isTooSmallForContent())
        {
            insertItems.push(this.mediaStatePanel.convertChannelsToMenuItems());
        }
        insertItems.push([{
            text: LANGUAGE.getString("settings") + "...",
            handler: function ()
            {
                Ext.asap(function ()
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_openSettings();
                });
            }
        }]);
        insertItems.push([{
            text: LANGUAGE.getString("end"),
            handler: function ()
            {
                if (SESSION.isSIPMode() && CURRENT_STATE_CALL.isMyLineStateOKOrBusy())
                {
                    var key = 'dontShowLogoutMessageDespiteSoftphone';
                    var errorMessage = LANGUAGE.getString("logoutDespiteSoftphone");
                    if (CURRENT_STATE_CALL.isCallAvailable(MY_CONTACT.getGUID()))
                    {
                        key = 'dontShowLogoutMessageDespiteCurrentCalls';
                        errorMessage = LANGUAGE.getString("logoutDespiteCurrentCalls");
                    }

                    var shouldShowConfirmation = !CLIENT_SETTINGS.getSetting("GENERAL", key);
                    if (shouldShowConfirmation)
                    {
                        showConfirmation(Ext.create('ConfirmationComponentWithCheckbox',
                        {
                            yesCallback: function ()
                            {
                                SESSION.logout(true);
                            },
                            checkBoxText: LANGUAGE.getString('dontShowAgain'),
                            checkBoxClientSettingsKey: key,
                            noCallback: Ext.emptyFn,
                            errorMessageText: errorMessage
                        }));
                        return;
                    }
                }

                Ext.asap(function ()
                {
                    SESSION.logout(false);
                });
            }
        }]);
        return new CustomMenu({
            
            highlightFirstMenuItem: false,
            insertItems: insertItems,
            minHeight: 54 //ohne die minHeight gibt es ein Problem bei Browser Zoom 90%: Es erscheinen "hoch"- und "Runter"-Tasten und die eigentlichen Menüeinträge sind nicht sichtbar
        });
    },

    onTabChange: function (newCard, oldCard, classNameNewCard)
    {
        this.mediaStatePanel.onTabChange(newCard, oldCard, classNameNewCard);
    }
});
