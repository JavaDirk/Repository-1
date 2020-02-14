Ext.define('PresenceStateMenu',
{
    extend: 'Ext.menu.Menu',

    plain: true,

    floating: false,

    parentDialog: undefined,

    needConfiguration: true,

    style:
    {
        border: 'none !important',
        'border-radius': 0
    },

    listeners:
    {
        afterrender: function (menu)
        {
            menu.body.setStyle({ 'background-color': 'transparent' });
        }
    },

    createPresenceStateCheckItem: function (presenceState)
    {
        var self = this;
        var currentPresenceState = getEnumForPresenceState(MY_CONTACT.getPresenceStateWithoutOnPhone());
        return new PresenceStateCheckItem({
            presenceState: presenceState,
            checked: presenceState === currentPresenceState,
            listeners:
            {
                click: function ()
                {
                    self.hideDialog();
                }
            }
        });
    },

    hideDialog: function ()
    {
        if (this.parentDialog && this.parentDialog.xtype)
        {
            this.parentDialog.hide();
        }
    },

    initComponent: function ()
    {
        var self = this;

        this.items =
            [
                this.createPresenceStateCheckItem(PresenceState.Available),
                this.createPresenceStateCheckItem(PresenceState.NotAvailable),
                this.createPresenceStateCheckItem(PresenceState.Break),
                this.createPresenceStateCheckItem(PresenceState.DnD)
            ];

        if (this.needConfiguration)
        {
            this.items.push(new Ext.menu.Separator());
            this.items.push(new Ext.menu.Item(
                {
                    text: '<div style="display:flex;padding:3px 15px 3px 0;">' +
                        '<div style="margin:2px 5px 0 7px;display:flex;width:16px;height:16px;background-size:contain;background-repeat:no-repeat;background-image:url(' + IMAGE_LIBRARY.getImage('settings', 64, NEW_GREY) + ' )"></div>' +
                        '<div style="">' + LANGUAGE.getString('configuration') + '</div>' +
                        '</div>',
                    handler: function ()
                    {
                        self.hideDialog();
                        createPresenceConfigurationDialog(self.parent);
                    }
                }));
        }
        this.callParent();
    }
});