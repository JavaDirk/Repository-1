//titleText: Titel des Panels
var HEADER_MARGIN_TOP = 'margin-top:3px';

Ext.define('CollapsibleContainerWithHeader', {
    extend: 'CustomPanel',
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    margin: '0 0 0 0',
    titleText: '',
    drawLine: true,
    lineColor: COLOR_SEPARATOR,

    addTool: function (item) {

        if (!item)
        {
            return null;
        }

        this.changeMarginTop(item);
        if (this.rendered)
        {
            this.callParent(arguments);
        }
        else
        {
            this.headerTools = this.headerTools || [];
            
            this.headerTools.push(item);
        }
        return item;
    },
    listeners: {
        afterrender: function (event) 
        {
            var header = event.getHeader();
            if (!header)
            {
                return;
            }
            header.removeAll();

            if (event.collapsed)
            {
                event.body.hide();
            }

            var components = [];
            
            event.collapsibleButton = new ThinButton({
                icon: 'images/64/arrow_right.png',
                
                listeners: {
                    click: function (button)
                    {
                        if (button.iconName.indexOf('arrow_right') !== -1)
                        {
                            event.expandContainer();
                        }
                        else
                        {
                            event.minimizeContainer();
                        }
                    },
                    afterrender: function (button)
                    {
                        if (!event.collapsed)
                        {
                            event.expandContainer();
                        }

                        button.btnIconEl.setStyle({ 'background-size': '12px 12px', backgroundPosition: 'center bottom' });
                    }
                }
            });

            components.push(event.collapsibleButton);

            event.groupNameLabel = new Ext.Component({
                margin: '0 5 0 2',
                setText: function (newName)
                {
                    this.setHtml('<div class="groupEntry" style="padding:10px 5px 10px 5px">' + Ext.String.htmlEncode(newName) + '</div>');
                }
            });
            event.groupNameLabel.setText(event.titleText);

            components.push(event.groupNameLabel);
            components = components.concat(event.getHeaderComponentsAfterTitle());
            if (event.drawLine)
            {
                components.push(new Ext.Component({
                    html: '<div style="' + HEADER_MARGIN_TOP + ';margin-left:5px;height:1.2px;background-color:' + event.lineColor + '">',
                    flex: 1
                }));
            }
            
            if (event.headerTools)
            {
                Ext.each(event.headerTools, function (tool)
                {
                    components.push(tool);
                }, this);
            }

            header.add(components);
        }
    },

    getHeaderComponentsAfterTitle: function ()
    {
        return [];
    },

    expandContainer: function () {
        this.expand(false);
        this.collapsibleButton.setIconSrc('images/64/arrow_down.png');
    },
    minimizeContainer: function () {
        this.collapse(Ext.Component.DIRECTION_BOTTOM, false);
        this.collapsibleButton.setIconSrc('images/64/arrow_right.png');
    },

    changeMarginTop: function (tool)
    {
        tool.on('boxready', function ()
        {
            tool.btnIconEl.dom.style.marginTop = "2px";
        });
    }
});