/**
 * Created by martens on 17.04.2015.
 */
Ext.define('CustomPanel', {
    extend: 'Ext.Panel',
    layout: { type: 'vbox', pack: 'start', align: 'stretch' },
    border: false,
    bodyBorder: false,
    
    header:
    {
        padding: 0,
        border: false,
        cls: 'groupEntry',
        style:
        {
            color: COLOR_HEADER_BAR,
            'padding-top': 0,
            'padding-bottom': 0,
            'padding-left': 0,
            'font-family': FONT_FAMILY,
            backgroundColor: 'transparent'
        },
        listeners:
        {
            afterrender: function (event)
            {
                event.child().setHeight(event.child().getHeight() + 10);
            }
        }
    },

    initComponent: function ()
    {
        this.callParent();

    }
});