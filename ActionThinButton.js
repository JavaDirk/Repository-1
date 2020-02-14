Ext.define('ActionThinButton',
{
    extend: 'RoundThinButton',
    margin: '0 5 0 0',
    textAlign: 'left',

    action: null,

    initComponent: function ()
    {
        if (!isValid(this.action))
        {
            console.log("no action exists for button!");
            return;
        }
        this.text = this.action.getName(true);
        
        this.iconName = this.action.getIconName();

        this.callParent();

        var self = this;
        this.on('click', function ()
        {
            self.action.execute();
        });

        this.on('boxready', function ()
        {
            self.tooltip = Ext.create('Ext.tip.ToolTip',
            {
                target: this.el,
                showDelay: 1000,
                autoHide: true,
                trackMouse: false,
                listeners:
                {
                    beforeshow: function (tip)
                    {
                        if (self.isDestroyed)
                        {
                            return false;
                        }
                        var tooltip = "";
                        if (self.btnInnerEl.dom.scrollWidth > self.btnInnerEl.dom.clientWidth)
                        {
                            tooltip += self.text;
                            if (isValidString(self.action.getTooltip()))
                            {
                                tooltip += '<br /><br />';
                            }
                        }
                        tooltip += self.action.getTooltip();
                        if (isValidString(tooltip))
                        {
                            tip.update(tooltip);
                            return true;
                        }
                        return false;
                    }
                }
            });
        }, this);
    },

    destroy: function ()
    {
        if (this.tooltip)
        {
            this.tooltip.destroy();
        }
        
        this.callParent();
    }
});

Ext.define('ActionSplitButton',
{
    extend: 'RoundThinButton',
    margin: '0 5 0 0',

    action: null,

    initComponent: function()
    {
        if (!isValid(this.actions))
        {
            console.log("no actions exists for button!");
            return;
        }
        this.text = LANGUAGE.getString("actions") + "...";
        this.tooltip = LANGUAGE.getString("actions");
        this.iconName = 'action';

        this.callParent();

        var self = this;
        this.on('click', function ()
        {
            var menuItems = [];
            Ext.each(this.actions, function (action)
            {
                menuItems.push(
                    {
                        text: action.getName(true),
                        tooltip: action.getTooltip(),
                        iconName: action.getIconName(),
                        handler: function ()
                        {
                            action.execute();
                        }
                    });
            });
            var menu = new CustomMenu({ highlightFirstMenuItem: false, insertItems: menuItems});
            menu.showBy(self);
        });
    }
});