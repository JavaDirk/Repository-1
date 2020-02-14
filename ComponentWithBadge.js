Ext.define('ComponentWithBadge',
{
    extend: 'Ext.Component',

    renderTpl: '<div id="{id}-badgeEl" data-ref="badgeEl" class="badge" style="display:none;z-index:1;position:absolute;right:2px;top:2px;"></div>',
    childEls: ['badgeEl'],


    initComponent: function ()
    {
        this.callParent();

        if (!this.className || !this.componentConfig)
        {
            console.log("ComponentWithBadge: no className and/or componentConfig specified!");
            return;
        }
        var self = this;
        this.on('boxready', function ()
        {
            self.componentConfig.renderTo = self.el;
            self.component = Ext.create(self.className, self.componentConfig);
        });
    },

    destroy: function ()
    {
        this.component.destroy();
        this.callParent();
    },

    setBadge: function (text)
    {
        if (!this.badgeEl)
        {
            return;
        }

        if (isValid(this.textNode))
        {
            this.textNode.nodeValue = text;
        }
        else
        {
            this.textNode = document.createTextNode(text);
            this.badgeEl.dom.appendChild(this.textNode);
        }

        if (!isValidString(text) || text === "0")
        {
            this.badgeEl.dom.style.display = 'none';
        }
        else
        {
            this.badgeEl.dom.style.display = 'block';
        }
    },

    resetBadge: function ()
    {
        this.setBadge();
    }
});
