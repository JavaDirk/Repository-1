function getStyleForSplitter(vertical)
{
    var style = {
        'background-repeat': 'no-repeat',
        'background-position': '50% 50%',
        'background-color': MAIN_BACKGROUND_GREY
    };
    
    style['background-image'] = 'url(' + IMAGE_LIBRARY.getSplitterIcon(vertical) + ')';
    return style;
}

Ext.define('Splitter',
{
    extend: 'Ext.resizer.Splitter',

    collapseTarget: 'prev',
    size: SPLITTER_SIZE,

    initComponent: function ()
    {
        this.style = getStyleForSplitter(false);
        this.callParent();
    }
});

Ext.define('LineSeparator',
{
    extend: 'Ext.Component',

    width: 1,
    margin: '0 10',
    style: 'background-color:' + COLOR_SEPARATOR,

    responsiveConfig:
    {
        small:
        {
            height: 1,
            margin: '10 0'
        },
        large:
        {
            width: 1,
            margin: '0 10'
        }
    }
    });

Ext.define('OnlyVerticalLineSeparator',
    {
        extend: 'LineSeparator',

        width: 3,
        margin: '0',

        responsiveConfig:
        {
            small:
            {
                visible: false
            },
            large:
            {
                visible: true
            }
        }
    });



Ext.define('BarSeparator',
{
    extend: 'Ext.Component',

    margin: 0,
    width: 10,

    style: 'background-color:' + COLOR_SEPARATOR,

    responsiveConfig:
    {
        small:
        {
            visible: false
        },
        large:
        {
            visible: true
        }
    }
});
