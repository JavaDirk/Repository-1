Ext.define('CallButton',
{
    extend: 'Ext.Button',

    margin: "0 0 0 1",
    height: CALL_BUTTON_SIZE,
    width: CALL_BUTTON_SIZE,
    borderRadius: '100%',
    fontSize: FONT_SIZE_SUBTITLE,
    
    alt: " ",
    cls: 'callButton',

    clickListener: Ext.emptyFn,

    initComponent: function ()
    {
        this.backgroundColor = this.backgroundColor || COLOR_CALL_BUTTON;
        this.backgroundColorOnHover = this.backgroundColorOnHover || COLOR_CALL_BUTTON_ON_HOVER;
        this.color = this.color || COLOR_CALL_BUTTON_TEXT;
        this.colorOnHover = this.colorOnHover || COLOR_CALL_BUTTON_TEXT_ON_HOVER;
        this.borderColor = this.borderColor || COLOR_CALL_BUTTON_BORDER;
        this.borderColorOnHover = this.borderColorOnHover || this.backgroundColorOnHover;

        if (isValid(this.iconName))
        {
            this.icon = IMAGE_LIBRARY.getImage(this.iconName, 64, this.iconColor || COLOR_CALL_BUTTON_ICON);
        }

        //tooltip als title anzeigen, weil ExtJS-Tooltip sonst hinter einer Notification angezeigt werden würde
        var tooltip = this.tooltip;
        this.tooltip = null;

        this.callParent();

        this.setStyle(
        {
            backgroundColor: this.backgroundColor,
            border: '1px solid ' + this.borderColor,
            borderRadius: "100%"
        });
        
        
        if (this.clickListener)
        {
            this.on('click', this.clickListener);
        }

        var self = this;
        this.on('afterrender', function () {
            var color = self.color;
            if (self.disabledFlag)
            {
                color = self.backgroundColor;
            }
            self.btnInnerEl.setStyle({ 'font-size': self.fontSize + "px", color: color });
            self.btnIconEl.setStyle({ 'background-size': '20px' });

            if (isValidString(tooltip))
            {
                self.el.dom.title = tooltip;
            }
        });

        this.setDisabled(false);
    },

    setIconName: function (name)
    {
        this.iconName = name;
        if (isValid(this.iconName))
        {
            this.setIcon(IMAGE_LIBRARY.getImage(this.iconName, 64, this.iconColor || COLOR_CALL_BUTTON_ICON));
        }
    },

    destroy: function ()
    {
        Ext.util.CSS.removeStyleSheet(this.id + "_span_rule");

        this.callParent();
    },

    setDisabled: function (flag)
    {
        this.disabledFlag = flag;
        if (flag)
        {
            this.removeListener('mouseover', this.createMouseOverListener());
            this.removeListener('mouseout', this.createMouseOutListener());

            if (this.btnInnerEl)
            {
                this.btnInnerEl.setStyle({ color: this.backgroundColor });
            }
            
            
            this.removeListener('click', this.clickListener);
            this.setStyle({cursor: 'default'});
        }
        else
        {
            this.on('mouseover', this.createMouseOverListener());
            this.on('mouseout', this.createMouseOutListener());

            if (this.btnInnerEl)
            {
                this.btnInnerEl.setStyle({ color: this.color });
            }
            
            this.on('click', this.clickListener);
            this.setStyle({cursor: 'pointer'});
        }
    },

    createMouseOverListener: function ()
    {
        var self = this;
        return function ()
        {
            self.setStyle({ backgroundColor: this.backgroundColorOnHover, borderColor: this.borderColorOnHover });
            self.btnInnerEl.setStyle({ color: this.colorOnHover });

            if (isValidString(this.iconName))
            {
                self.btnIconEl.dom.style.backgroundImage = "url(" + IMAGE_LIBRARY.getImage(this.iconName, 64, WHITE) + ")";
            }
        };
    },

    createMouseOutListener: function ()
    {
        var self = this;
        return function ()
        {
            self.setStyle({ backgroundColor: this.backgroundColor, borderColor: this.borderColor});
            self.btnInnerEl.setStyle({ color: this.color });
            if (isValidString(this.iconName))
            {
                self.btnIconEl.dom.style.backgroundImage = "url(" + IMAGE_LIBRARY.getImage(this.iconName, 64, this.iconColor || COLOR_CALL_BUTTON_ICON) + ")";
            }
        };
    }
});


