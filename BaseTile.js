Ext.define('PartnerBoard.BaseTile', {
    extend: 'Ext.Component',
    
    listeners:
    {
        /*
        afterRender: function (view)
        {
            if (view.groupPanel.isACDGroup())
            {
                return;
            }
            
            this.dragSource = new Ext.drag.Source({
                element: view.tileEl || view.el,
                groups: 'tiles',
                revert:
                {
                    callback: function ()
                    {
                        this.show();
                    },
                    scope: view
                },
                describe: function (info)
                {
                    view.addInformationToDragSource(info);
                },
                proxy:
                {
                    type: 'placeholder',
                    cursorOffset: [0, 0],
                    getElement: function (source)
                    {
                        var me = this,
                            el = me.element;
                        if (!el)
                        {
                            me.element = el = Ext.getBody().createChild({
                                cls: me.getCls(),
                                html: source.source.getElement().dom.outerHTML
                            });
                            el.addCls(me.placeholderCls);
                            el.setTouchAction({
                                panX: false,
                                panY: false
                            });
                        }
                        el.show();
                        return el;
                    },
                },

                listeners:
                {
                    dragstart: function (source)
                    {
                        view.hide();
                    }
                }
            });
        }*/
    },

    addInformationToDragSource: function (info)
    {

    },

    destroy: function ()
    {
        this.dragSource = Ext.destroy(this.dragSource);
        
        this.callParent();
    }
});