Ext.define('DialogWithArrow',
{
    extend: 'Ext.tip.ToolTip',

    cls: 'dialogWithArrow',
    showDelay: 0,
    dismissDelay: 0,
    padding: '0 5',
    //anchor: 'top',
    modal: true,

    defaultAlign: 'bl',

    constrain: true,

    scrollable: 'vertical',

    destroyOnHide: true,

    style:
    {
        border: '10px solid rgba(120, 120, 120, 0.6)',
        'background-clip': 'padding-box',
        'background-color': COLOR_DIALOG_BACKGROUND,
        opacity: 0
    },

    showCloseButton: true,

    initComponent: function ()
    {
        //Mindestabstand zum Browserfensterrand 10px
        var viewportRegion = VIEWPORT.getRegion();
        var inset = 10;
        viewportRegion.left = inset;
        viewportRegion.top = inset;
        viewportRegion.x = inset;
        viewportRegion.y = inset;
        viewportRegion.right = viewportRegion.right - inset;
        viewportRegion.bottom = viewportRegion.bottom - inset;
        viewportRegion.width = viewportRegion.width - 2 * inset;
        viewportRegion.height = viewportRegion.height - 2 * inset;

        this.constrainTo = viewportRegion;

        this.callParent();

        this.setMaxHeight(window.innerHeight - 25);
        var self = this;

        this.on('beforeshow', this.onBeforeShowDialog);
        this.on('show', this.onShowDialog);
            
        this.on('boxready', function ()
        {
            Ext.asap(function ()
            {
                if (isValid(self, "zIndexManager.mask"))
                {
                    self.classNamesByExtJS = self.zIndexManager.mask.dom.className;
                    self.zIndexManager.mask.setCls(self.classNamesByExtJS + ' ' + self.cls);

                    //bei einem Klick außerhalb des Dialogs wird der Dialog geschlossen. Zwar unterstützt das ExtJS von Haus aus, aber nur wenn man die disable-Methode
                    //nicht überschreibt
                    //das tun wir aber, weil es sonst Probleme mit der Combox in einem Dialog gibt: Das Auswählen eines Eintrags führt dann zu keiner Reaktion
                    self.zIndexManager.mask.dom.onclick = function ()
                    {
                        self.hide();
                    };
                }
            });


            self.body.dom.style.overflow = "hidden";
                
            self.escapeKeyNav = new Ext.util.KeyNav({
                target: self.el,
                eventName: 'keydown',
                scope: self,
                esc: self.onEscapeKey
            });
                
            if (self.showCloseButton)
            {
                var closeButtonImage = IMAGE_LIBRARY.getImage("delete", 64, WHITE);
                var closeButton;
                if (isValidString(closeButtonImage))
                {
                    closeButton = self.el.createChild(
                        {
                            tag: 'div',
                            html: '<div style="cursor:pointer;position:absolute;height:24px;width:24px;left:auto;right:-20px;top:-20px;background-color:' + DARKER_GREY + ';border-radius:100%;padding:2px 5px 0px 5px;border:2px solid white;background-position: 2px;background-size:16px 16px;background-image:url(' + closeButtonImage + ')"></div>'
                        });
                }
                else
                {
                    closeButton = self.el.createChild(
                        {
                            tag: 'div',
                            html: '<div style="cursor:pointer;position:absolute;height:26px;width:26px;left:auto;right:-20px;top:-20px;background-color:' + DARKER_GREY + ';border-radius:100%;padding:3px 5px 0px 7px;border:2px solid white;color:white">X</div>'
                        });
                }
                closeButton.on('click', function ()
                {
                    self.hide();
                });
            }

            this.showAnimationForAppearing();

            setTimeout(function () 
            {
                self.focus();
            }, 50);
        });

        Ext.each(this.items.items, function (item)
        {
            item.parent = self;
        });

        SESSION.addListener(this);

        if (!isValid(this.target) || this.target.destroyed)
        {
            this.target = null;
        }
    },

    onEscapeKey: function ()
    {
        this.hide();
    },

    disable: Ext.emptyFn, //disable wird deswegen überschrieben, weil ExtJS diese Methode aufruft, wenn man außerhalb des Dialogs klickt, dies führt dazu, dass alle children disabled werden sollen (sehr seltsames Verhalten)

    hide: function (force)
    {
        if (this.destroyed || this.hideInProgress)
        {
            return;
        }
        //Fall: DialogWithArrow ist sichtbar und man öffnet auf diesem ein Ext.menu.Menu. Wenn man dann auf ein menuItem klickt, würde sich der DialogWithArrow schliessen, dabei soll sich nur das Ext.menu.Menu schliessen
        if (!force && this.shouldHideBeSkipped())
        {
            return;
        }

        this.hideInProgress = true;
        var args = arguments;
        var self = this;
        this.showAnimationForDisappearing(function ()
        {

            DialogWithArrow.superclass.hide.apply(self, args);
            if (self.destroyOnHide)
            {
                self.destroy();
            }
            self.hideInProgress = false;

            self.onAfterDisappearAnimation();
        });
    },

    onAfterDisappearAnimation: function ()
    {

    },

    shouldHideBeSkipped: function ()
    {
        return this.isAnotherDialogVisibleWithHigherZIndex();
    },

    destroy: function ()
    {
        SESSION.removeListener(this);

        if (isValid(this, "zIndexManager.mask"))
        {
            this.zIndexManager.mask.setCls(this.classNamesByExtJS);
        }
            
        this.callParent();
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.hide();
        }
    },

    onBeforeShowDialog: function ()
    {
        //wenn das Target zum Zeitpunkt des Anzeigens nicht sichtbar ist (also display:none), dann kann der Tooltip den Pfeil nicht richtig positionieren
        //daher kurz anzeigen und im show wieder verschwinden lassen
        this.targetHidden = false;
        if (isValid(this.target))
        {
            var targetCmp = Ext.getCmp(this.target.id);
            if (isValid(targetCmp))
            {
                this.targetHidden = targetCmp.hidden;
                if (this.targetHidden)
                {
                    targetCmp.setVisible(true);
                }
            }
        }
    },

    onShowDialog: function ()
    {
        var self = this;
        if (self.targetHidden) {
            Ext.asap(function () {
                var targetCmp = Ext.getCmp(self.target.id);
                if (isValid(targetCmp)) {
                    targetCmp.setVisible(false);
                }
            });
        }
    },
    
    showAnimationForAppearing: function ()
    {
        this.el.animate(
        {
            from:
            {
                opacity: 0
            },
            to:
            {
                opacity: 1
            },
            duration: 250

        });
    },

    showAnimationForDisappearing: function (callbackAfterAnimation)
    {
        if (this.el)
        {
            this.el.animate(
                {
                    from:
                    {
                        opacity: 1
                    },
                    to:
                    {
                        opacity: 0
                    },
                    duration: 350,
                    listeners:
                    {
                        afterAnimate: function ()
                        {
                            callbackAfterAnimation();

                        }
                    }
                });
        }
        else
        {
            callbackAfterAnimation();
        }
    },
    
    focus: function ()
    {
        var focusableItem = this.getFirstFocusableItem(this);
        if (isValid(focusableItem))
        {
            focusableItem.focus();
        }
    },

    getFirstFocusableItem: function (item)
    {
        if (item !== this && item.isFocusable())
        {
            return item;
        }
        if (!isValid(item, "items.items"))
        {
            return null;
        }
        var self = this;
        var result;
        Ext.each(item.items.items, function (subItem)
        {
            result = self.getFirstFocusableItem(subItem);
            if (isValid(result))
            {
                return false;
            }
        });
        return result;
    },

    /* setTarget wird überschrieben, weil hier die callbacks für mouseover etc festgelegt werden. 
     * Das wollen wir ja nicht, das soll ja nur auf klicks reagieren
     * */
    setTarget: function (target)
    {
        var me = this,
            listeners;
        if (me.targetListeners)
        {
            me.targetListeners.destroy();
        }
        if (target)
        {
            me.target = target = Ext.get(target.el || target);
            listeners = {
                /*mouseover: 'onTargetOver',
                mouseout: 'onTargetOut',
                mousemove: 'onMouseMove',*/
                tap: 'onTargetTap',
                scope: me,
                destroyable: true
            };
            if (isValid(target))
            {
                me.targetListeners = target.on(listeners);
            }
            else
            {
                console.log("Dialogs.js:setTarget: target is undefined!", me, arguments);
            }
        } else
        {
            me.target = null;
        }
    }
});

Ext.define('SimpleDialog',
{
    extend: 'DialogWithArrow',
    cls: 'menuBorder menuShadow',
    style: { opacity: 0 },
    showCloseButton: false
});

Ext.define('Dialog',
    {
        extend: 'DialogWithArrow',
        anchor: undefined,
        shadow: true,
        scrollable: false,

        shouldHideBeSkipped: function ()
        {
            return false;
        }
    });

Ext.define('DialogWithHeader',
    {
        extend: 'Dialog',
        draggable: true,
        padding: '0',

        initComponent: function ()
        {
            var self = this;
            this.header =
                {
                    xtype: 'container',
                    layout:
                    {
                        type: 'hbox'
                    },
                    padding: '5',
                    height: 30,
                    style:
                    {
                        'background-color': PANEL_BACKGROUND_GREY,
                        'border-bottom': 'none !important',
                        'cursor': 'move'
                    },
                    items:
                    [
                        new Ext.Img({
                            height: 20,
                            width: 20,
                            margin: '0 10 0 0',
                            src: IMAGE_LIBRARY.getImage(self.icon, 64, NEW_GREY),
                            alt: "icon",
                            style: 'cursor:move'
                        }),
                        Ext.create('Ext.form.Label',
                            {
                                text: this.title,
                                style: 'color:' + NEW_GREY + ';font-size:' + FONT_SIZE_TITLE + 'px;cursor:move',
                                flex: 1
                            })
                    ]
                };

            this.callParent();
        }
    });

Ext.define('NotificationDialog',
{
    extend: 'Ext.window.Toast',

    style: 'border-color: rgb(200, 200, 200);background-color:' + COLOR_NOTIFICATION_BACKGROUND,

    modal: false,

    align: 'r',

    useXAxis: true,

    autoClose: false,

    slideInAnimation: 'ease',
    slideBackAnimation: 'ease',

    bodyPadding: '0 0 10 0',

    showCloseButton: false,

    hideDuration: 0,

    paddingX: 10,

    alwaysOnTop: 10,
    
    listeners:
    {
        close: function (me)
        {
            me.destroy();
        }
    }, 

    initComponent: function ()
    {
        this.header =
        {
            xtype: 'container',
            layout:
            {
                type: 'hbox'
            },
            padding: '5',
            height: 30,
            style:
            {
                'background-color': PANEL_BACKGROUND_GREY,
                'border-bottom': 'none !important',
                'cursor': 'default'
            },
            items:
            [
                new Ext.Img({
                    height: 20,
                    width: 20,
                    margin: '0 10 0 0',
                    src: this.getHeaderImage(),
                    alt: "icon"
                }),
                Ext.create('Ext.form.Label',
                {
                    text: this.title,
                    style: 'color:' + COLOR_MAIN_GREY + ';font-weight:500;font-size:' + FONT_SIZE_TITLE + 'px',
                    flex: 1
                })
            ]
        };
        
        this.callParent();

        NOTIFICATION_WINDOW.push(this);

        var self = this;
        Ext.asap(function ()
        {
            self.startPlayingSound();
        });

        if (!VISIBILITY.isVisible) 
        {
            this.browserNotification = this.createBrowserNotification();
        }

        if (window.VIEWPORT)
        {
            VIEWPORT.on('resize', function (viewport, newWidth, newHeight, oldWidth, oldHeight)
            {
                self.reposition(newWidth, oldWidth);
            });
        }

        SESSION.addListener(this);

        this.setWidth(Math.min(NOTIFICATIONS_WIDTH, window.innerWidth - 20));
    },

    getHeaderImage: function ()
    {
        return IMAGE_LIBRARY.getImage(this.icon, 64, NEW_GREY);
    },

    reposition: function (newWidth, oldWidth)
    {
        if (this.isStateOk())
        {
            var xy = this.el.getXY();
            this.xPos = xy[0] + newWidth - oldWidth;
            this.setLocalXY(this.xPos, this.yPos);
        }
    },

    hide: function ()
    {
        this.isHiding = true;
        this.isFading = false;

        this.callParent([this.animateTarget, this.doClose, this]);
    },

    startPlayingSound: function ()
    {
        this.playSound();
    },

    playSound: function ()
    {
        var player = document.getElementById('notificationSound');
        if (isValid(player))
        {
            player.pause();
            player.currentTime = 0;

            setTimeout(function () //setTimeout nur deswegen, weil Chrome sonst meckert: "The play() request was interrupted by a call to pause()"
            {
                player.play();
            }, 0);
        }
    },

    createBrowserNotification: Ext.emptyFn,

    close: function ()
    {
        this.enableAnimations = false;

        this.callParent();
    },

    onConnectionLost: function ()
    {
        this.hide();
    },

    onLogoutSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.hide();
        }
    },

    destroy: function ()
    {
        if (this.browserNotification)
        {
            this.browserNotification.destroy();
        }
        
        SESSION.removeListener(this);
        Ext.Array.remove(NOTIFICATION_WINDOW, this);

        this.callParent();
    }
});

Ext.define('ConfirmationDialog',
    {
        extend: 'DialogWithArrow',

        yesCallback: Ext.emptyFn,
        noCallback: Ext.emptyFn,
        text: '',
        showNoButton: true,
        showYesButton: true,
        closeWindow: true,
        maxWidth: Math.min(500, window.innerWidth / 2),

        initComponent: function ()
        {
            this.callParent();

            this.yesButtonText = this.yesButtonText || LANGUAGE.getString('yes');
            this.noButtonText = this.noButtonText || LANGUAGE.getString('no');

            this.onAfterRender = function ()
            {
                if (this.showNoButton)
                {
                    this.noButton.focus();
                }
                else
                {
                    this.yesButton.focus();
                }
            };

            var self = this;


            var container = this.add(new Ext.Container({
                padding: '5 5 5 5',
                layout: { type: 'vbox', pack: 'start', align: 'stretch' },
                flex: 1
            }));

            var splittedText = this.text.split("\n\n");
            Ext.each(splittedText, function (part, index)
            {
                if (index !== 0)
                {
                    container.add(new Ext.Component({
                        style: 'height:5px'
                    }));
                }
                container.add(new Ext.Component({
                    style: 'white-space:pre-wrap;font-size:' + FONT_SIZE_TEXT + 'px;color:' + BLACK,
                    html: part
                }));
            });


            var buttonContainer = container.add(new Ext.Container({
                margin: '5 0 0 0',
                flex: 1,
                layout: { type: 'hbox', pack: 'start', align: 'stretch' }
            }));

            if (this.showYesButton)
            {
                this.yesButton = buttonContainer.add(new RoundThinButton({
                    margin: '0 5 0 0',
                    text: this.yesButtonText,
                    iconName: 'check',
                    listeners:
                    {
                        click: function (event)
                        {
                            self.yesCallback();

                            if (self.closeWindow)
                            {
                                self.hide();
                            }
                        }
                    }
                }));
            }

            if (this.showNoButton)
            {
                this.noButton = buttonContainer.add(new RoundThinButton({
                    margin: '0 5 0 0',
                    text: this.noButtonText,
                    iconName: 'remove',
                    listeners: {
                        click: function (event)
                        {
                            self.hide();

                            if (self.noCallback)
                            {
                                self.noCallback();
                            }
                        }
                    }
                }));
            }
            this.on('afterrender', this.onAfterRender, this);
            this.show();
        },

        onAfterRender: function ()
        {

        },

        shouldHideBeSkipped: function ()
        {
            return false;
        }
    });

Ext.define('MessageDialog',
    {
        extend: 'ConfirmationDialog',
        text: '',
        yesButtonText: LANGUAGE.getString('ok'),
        showNoButton: false,

        onAfterRender: function ()
        {
            this.yesButton.focus();
        }
    });

Ext.define('ProgressDialog',
    {
        extend: 'DialogWithArrow',

        labelText: "",

        padding: "5",

        initComponent: function ()
        {
            this.callParent();
            this.label = this.add(Ext.create('CheapLabel',
                {
                    margin: '0 0 0 0',
                    style: "color:" + COLOR_SUBTITLE + ";font-size:" + FONT_SIZE_SUBTITLE + "px",
                    text: this.labelText
                }));
            this.progressBar = this.add(Ext.create('Ext.ProgressBar',
                {
                    margin: '5 0 0 0',
                    width: 250
                }));

            var self = this;
            this.cancelButton = Ext.create('RoundThinButton',
                {
                    text: LANGUAGE.getString("cancel"),
                    iconName: 'remove',
                    listeners:
                    {
                        click: function ()
                        {
                            self.onCancel();
                        }
                    }
                });
            this.add(Ext.create('Ext.Container',
                {
                    margin: '5 0 0 0',
                    items: [this.cancelButton],
                    layout:
                    {
                        type: 'hbox',
                        //align: 'stretch',
                        pack: 'end'
                    },
                    flex: 1
                }));
            this.progressBar.show();
        },

        onCancel: function ()
        {

        },

        setLabelText: function (text)
        {
            if (this.destroyed)
            {
                return;
            }
            this.label.setText(text);
        },

        progress: function (message, title)
        {
            if (this.destroyed)
            {
                return;
            }
            this.progressBar.progress(message, title);
        },

        updateProgress: function (number, str)
        {
            if (this.destroyed)
            {
                return;
            }
            this.progressBar.updateProgress(number, str);
        },

        hide: function ()
        {
            if (this.destroyed) {
                return;
            }
            
            var args = arguments;
            DialogWithArrow.superclass.hide.apply(this, args);
            if (this.destroyOnHide) {
                this.destroy();
            }
        }
    });

