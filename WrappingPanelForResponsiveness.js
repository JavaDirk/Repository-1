Ext.define('WrappingPanel',
{
    extend: 'Ext.Panel',

    border: false,
    bodyStyle:
    {
        border: 'none'
    },
    header:
    {
        style:
        {
            background: 'white',
            border: 'none',
            padding: 0
        }
    },
    hideCollapseTool: true,
    titleCollapse: true,
    
    split:
    {
        size: MARGIN_BETWEEN_COMPONENTS,
        collapsible: true,
        style:
        {
            'background-color': MAIN_BACKGROUND_GREY
        }
    },
    flex: 1,
    region: 'east',
    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    
    listeners:
    {
        expand: function (panel)
        {
            panel.onExpand();
        },

        collapse: function ()
        {
            this.createExpandTool();
        },
        boxready: function ()
        {
            this.createExpandTool();
        }
    },
    
    createExpandTool: function () //TODO: allgemein für Ext.Panel implementieren?
    {
        if (!isValid(this.placeholder) || isValid(this, 'placeholder.expandTool'))
        {
            return;
        }

        //das anlegen des expandTool ist eigentlich Quatsch, weil wir gar keins haben wollen
        //Aber: ExtJS greift darauf zu und produziert dadurch JS-Fehler. Also legen wir es versteckt an und alle sind glücklich :-)
        this.placeholder.expandTool = this.placeholder.add(Ext.create('Ext.Component',
            {
                hidden: true
            }));
    },

    setHeaderTitleText: function (text)
    {
        this.getHeader().setTitle(text);
        var placeholder = this.placeholder || this.getPlaceholder(); //placeholder ist der "header", wenn das Panel collapsed ist
        placeholder.setTitle(text);
    },

    //@override
    onExpand: function ()
    {

    }
});


