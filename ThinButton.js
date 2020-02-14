/*
 * ThinButton
 * scale (canOverride): set the size of the icon (small, medium, large)
 * parentContainer (handsOff): holds the root of this item which includes the canvas tag
 * style (canOverride): set the style and the align of the button
 * iconName (handsOff): save the name of the icon -> needed for internal uses (localStorage)
 * normalColor (canOverride): the color in which the icon will appear normally (normal style)
 * hoverColor (canOverride): the color in which the icon will appear when it is hovered (hover style)
 * mouseoverEvent (handsOff):  function which includes needed actions for this event
 * mouseoutEvent (handsOff):  function which includes needed actions for this event
 * beforeRenderEvent (handsOff):  function which includes needed actions for this event
 */
Ext.define('ThinButton',
    {
        extend: 'Ext.button.Button',

        scale: 'small',
        iconArray: [],
        textArray: [],
        parentContainer: {},
        needUpperCase: true,
        blockClick: false,
        animationWidth: 90,
        cls: 'thinButton',
        style:
        {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
        },
        iconName: "",
        animationWindow: {},
        windowIcon: undefined,
        windowWidth: undefined,
        windowHeight: 200,
        destroyAnimationWindow: true,
        animationContent: undefined,
        shouldAddWindow: true,
        shouldOverlay: true,
        normalColor: THIN_BUTTON_NORMAL_COLOR,
        hoverColor: THIN_BUTTON_HOVER_COLOR,
        normalTextColor: THIN_BUTTON_NORMAL_TEXT_COLOR,
        hoverTextColor: THIN_BUTTON_HOVER_TEXT_COLOR,
        changeTextColor: true,
        closeBodyClick: true,
        justChanged: false,
        animationWindowHeight: undefined,
        isBrickButton: undefined,
        curColor: THIN_BUTTON_NORMAL_COLOR,
        changeColorOnHover: true,
        
        closeWindowFunction: function (isInitializing) {
            var me = this;

            if (me.arrowContainer.xtype) {
                me.arrowContainer.close();
                me.arrowContainer = {};
            }

            if (!isInitializing) {
                me.animate({
                    to: {height: 0},
                    duration: 0,
                    listeners: {
                        afteranimate: function () {
                            if (me.parent.destroyAnimationWindow === true) {
                                me.close();
                                me.parent.animationWindow = {};
                            } else {
                                me.hide();
                                me.isExpanded = false;
                            }

                            me.parent.blockClick = false;
                        }
                    }
                });
            }
        },
        afterSourceChanged: function (event) {
        },

        mouseoverEvent: function (event)
        {
            var item = Ext.select('#' + this.getId()).elements[0];

            if (this.normalColor !== this.hoverColor)
            {
                //item.style.backgroundColor = COLOR_CALL_BUTTON_ON_HOVER;
            }
            
            if (!this.changeColorOnHover)
            {
                return;
            }
            if (event.icon != undefined && event.normalColor != event.hoverColor)
            {
                this.curColor = this.hoverColor;
                var image = IMAGE_LIBRARY.getImage(this.iconName.split('/')[2], this.getIconScale(), this.hoverColor);
                if (image.indexOf('NotInImageLibrary.png') != -1)
                {
                    new uiFunctions(event, true);
                } else
                {
                    event.setIcon(image);
                }
            }

            event.setButtonColor(event.hoverColor, event.getId());
        },
        mouseoutEvent: function (event)
        {
            if (this.normalColor !== this.hoverColor)
            {
                var item = Ext.select('#' + this.getId()).elements[0];
                //item.style.backgroundColor = 'transparent';
            }
            
            if (!this.changeColorOnHover)
            {
                return;
            }
            if (event.icon != undefined && event.normalColor != event.hoverColor)
            {
                this.curColor = this.normalColor;
                var image = IMAGE_LIBRARY.getImage(this.iconName.split('/')[2], this.getIconScale(), this.normalColor);
                if (image.indexOf('NotInImageLibrary.png') != -1)
                {
                    new uiFunctions(event, false);
                } else
                {
                    event.setIcon(image);
                }
            }

            event.setButtonColor(event.normalTextColor, event.getId());
        },
        beforeRenderEvent: function (event) {
            if (event.icon) {

                if (event.icon.indexOf('data:image/') === -1) {
                    event.iconName = event.icon.split('.')[0];
                }

                this.curColor = this.normalColor;
                var icon = IMAGE_LIBRARY.getImage(event.iconName.split('/')[2], event.getIconScale(), this.normalColor); 

                if (icon.indexOf('NotInImageLibrary') === -1) {
                    event.setIcon(icon);
                } else {
                    //var uifunctions = new uiFunctions(event, false);
                }
            }
        },
        setButtonColor: function (color)
        {
            if (isValid(this.btnInnerEl)) {
                this.btnInnerEl.setStyle({ color: color });
            }
        },
        setIconSrc: function (icon) {
            this.icon = icon;
            this.beforeRenderEvent(this);
        },
        buttonClicked: function () {
            var me = this;
        },
        getArrayIndex: function (array, key) {
            if (array.length > 0) {
                var index =  Ext.Array.indexOf(array, key) + 1;
                if (index >= array.length) {
                    index = 0;
                }
                return index;
            }
        },
        setIconSettings: function () {
            var index = this.getArrayIndex(this.iconArray, this.iconName + '.png');
            this.setIconSrc(this.iconArray[index]);
        },
        setTextProperties: function () {
            if (this.textArray.length > 0) {
                this.curTextArrayIndex += 1;
                if (this.curTextArrayIndex >= this.textArray.length) {
                    this.curTextArrayIndex = 0;
                }
                if (this.needUpperCase === true) {
                    this.textArray[this.curTextArrayIndex] = this.textArray[this.curTextArrayIndex].toUpperCase();
                }
                this.setText(this.textArray[this.curTextArrayIndex]);
            }
        },
        setTextArrayValue: function (text, index)
        {
            var curIndex = this.curTextArrayIndex;

            if (this.needUpperCase === true) {
                this.textArray[index] = text.toUpperCase();
            } else {
                this.textArray[index] = text;
            }

            if (curIndex === index) {
                this.setText(this.textArray[index]);
            }
        },
        listeners: {
          mouseover: {
              fn: function (event, val) {
                  event.mouseoverEvent(event);
              }
          }, mouseout: {
                fn: function (event, val) {
                    event.mouseoutEvent(event);
                }
          }, beforerender: {
                fn: function (event, val) {
                    event.beforeRenderEvent(event);
                }
            }, click: {
                fn: function (event, val)
                {
                    if (event.animationContent)
                    {
                        event.buttonClicked();
                    } else if (event.iconArray.length > 0 || event.textArray.length > 0)
                    {

                        if (event.iconArray.length <= 0 && event.iconName)
                        {
                            event.setIcon(IMAGE_LIBRARY.getImage(event.iconName.split('/')[2], event.getIconScale(), event.curColor));
                        }
                        else if (event.iconName)
                        {
                            event.setIconSettings();
                        }
                       
                        event.setTextProperties();

                        event.justChanged = true;
                        setTimeout(function () {
                            event.justChanged = false;
                        }, 100);
                    }
                }
            }
        },
        getIconScale: function () {
            var scale = parseInt(this.iconName.split('/')[1], 10);
            return scale;
        },
        initComponent: function ()
        {
            this.cls = this.scale;
            
            this.textArray = [];
            this.curTextArrayIndex = 0;
            if (Array.isArray(this.icon))
            {
                this.iconArray = this.icon;
                this.icon = this.icon[0];
            }

            if (Array.isArray(this.text))
            {
                this.textArray = this.text;
                this.text = this.text[0];
            }
            this.originalIcon = this.icon;
            this.originalIconName = this.iconName;

            this.callParent();

            if (this.text && this.needUpperCase === true)
            {
                this.originalText = this.text;
                this.text = this.text.toUpperCase();
                this.textArray[0] = this.text;
            }

            this.on('afterrender', this.onAfterRender, this);
        },

        onAfterRender: function ()
        {
            this.setButtonColor(this.normalTextColor);
        },

        deleteText: function ()
        {
            this.text = '';
            this.textArray = [];
        }
    });

Ext.define('RoundThinButton',
    {
        extend: 'Ext.button.Split',

        scale: 'medium',

        cls: ROUND_THIN_BUTTON,

        color: NEW_GREY,

        minWidth: 125,

        initComponent: function ()
        {
            this.updateIcon();
            
            this.callParent();

            this.hideSplitButtonArrowIfNoMenuAvailable();
        },


        hideSplitButtonArrowIfNoMenuAvailable: function ()
        {
            if (!isValid(this.menu))
            {
                this.setMenu();
            }
        },

        deleteText: function ()
        {
            this.setText('');
            if (isValid(this, "btnInnerEl.dom"))
            {
                this.btnInnerEl.dom.style.display = 'none';
            }
            else
            {
                this.on('boxready', function ()
                {
                    this.btnInnerEl.dom.style.display = 'none';
                }, this);
            }
        },

        setColor: function (color)
        {
            this.color = color;
            this.updateIcon();
        },

        updateIcon: function ()
        {
            if (!isValidString(this.iconName))
            {
                return;
            }
            
            this.icon = IMAGE_LIBRARY.getImage(this.iconName, 64, this.color || NEW_GREY);
            if (this.rendered)
            {
                this.setIcon(this.icon);
            }            
        },

        showLoadingMask: function ()
        {
            var self = this;
            this.disable();
            Ext.asap(function () 
            {
                if (self.isStateOk())
                {
                    self.originalText = self.getText();
                    self.originalIcon = self.icon;
                    self.originalMinWidth = self.getMinWidth();
                    self.setMinWidth(self.getWidth()); //ansonsten wird der Button kleiner, wenn man text und icon wegnimmt, was unschön ist
                    self.setText("");
                    self.setIcon("");
                    if (self.isFirstButton) {
                        showWhiteLoadingMask(self);
                    } else {
                        showBlackLoadingMask(self);
                    }
                }
            });
        },

        hideLoadingMask: function ()
        {
            var self = this;
            Ext.asap(function () 
            {
                if (self.isStateOk())
                {
                    self.enable();
                    hideLoadingMask(self);

                    self.setMinWidth(self.originalMinWidth || 0);
                    if (isValidString(self.originalText)) //der originalText kann dann nicht da sein, wenn man eine Aktion nicht ausgelöst hat, aber das Event mitbekommt und dann hideLoadingMask aufgerufen bekommt, vorher aber nicht showLoadingMask (geschehen im LoadPreviousMessagesButton: Wenn man auf einen Eintrag in der Medienliste drückt, dann kann nachgeladen werden)
                    {
                        self.setText(self.originalText);
                    }
                    if (isValidString(self.originalIcon))
                    {
                        self.setIcon(self.originalIcon);
                    }
                }
            });
        }
});

Ext.define('AcceptButton',
{
    extend: 'RoundThinButton',

    minWidth: 90,
    scale: 'small',

    cls: [ROUND_THIN_BUTTON, ACCEPT_BUTTON],

    initComponent: function ()
    {
        this.text = this.text || LANGUAGE.getString("answerCall");
        this.callParent();
    }
});

Ext.define('DeclineButton',
{
    extend: 'RoundThinButton',

    minWidth: 90,
    scale: 'small',

    cls: [ROUND_THIN_BUTTON, DECLINE_BUTTON],

    initComponent: function ()
    {
        this.text = this.text || LANGUAGE.getString("decline");
        this.callParent();
    }
});