Ext.define('CustomMenu', {
    extend: 'Ext.menu.Menu',
    plain: true,
    items: [],
    insertItems: [],
    needSplitterPadding: false,
    cls: 'customMenu menuBackground menuBorder menuShadow',
    highlightFirstMenuItem: true,
    
    initComponent: function ()
    {
        this.callParent();

        this.addEntries(this.insertItems);

        /*
        this.on('hide', function ()
        {
            this.destroy();
        }, this);*/
    },

    addEntries: function(entries)
    {
        this.removeAll();

        var self = this;

        var items = [];

        var isFirstItem = true;

        Ext.each(entries, function (insertArray, arrayIndex)
        {
            var padding = 0;

            if (self.needSplitterPadding)
            {
                padding = 10;
            }

            if (arrayIndex > 0 && insertArray.length > 0)
            {
                items.push(new Ext.menu.Separator({
                    margin: '0 ' + padding + ' 0 ' + padding
                }));
            }

            Ext.each(insertArray, function (menuItem, itemIndex)
            {
                if (menuItem.iconName)
                {
                    if (self.highlightFirstMenuItem && isFirstItem)
                    {
                        isFirstItem = false;
                        menuItem.icon = IMAGE_LIBRARY.getImage(menuItem.iconName, 64, menuItem.iconColor || COLOR_OVERLAY_BUTTON_DEFAULT_ACTION);
                        menuItem.cls = 'firstMenuItem';
                    }
                    else
                    {
                        menuItem.icon = IMAGE_LIBRARY.getImage(menuItem.iconName, 64, menuItem.iconColor || NEW_GREY);
                    }
                }

                if (!isValid(menuItem.padding))
                {
                    if (isValidString(menuItem.icon) || menuItem.xtype === 'menucheckitem')
                    {
                        menuItem.padding = '1 20 1 10';

                    }
                    else
                    {
                        menuItem.padding = '1 10 1 31';
                    }
                }

                items.push(menuItem);
            });
        });
        this.add(items);
    }
});