//Ein Mixin, um Visitenkarten (BusinessCardTooltip) anzuzeigen und zu verwalten
//ersetzt damit das delegate-Feature eines Tooltips von ExtJS

Ext.define('BusinessCard_ShowHideBehaviour',
{
    extend: 'Ext.Mixin',

    onMouseEnter: function (element, businessCardTooltip)
    {
        if (isValid(element.businessCardTooltip) && element.businessCardTooltip.isVisible())
        {
            return;
        }
        Ext.each(this.businessCardTooltips, function (tooltip)
        {
            tooltip.hide();
        });
        this.businessCardTooltips = [];

        element.timeout = setTimeout(() =>
        {
            element.businessCardTooltip = businessCardTooltip;
            element.businessCardTooltip.showBy(element);

            this.businessCardTooltips.push(element.businessCardTooltip);
        }, HIDE_DELAY);
    },

    onMouseLeave: function (element)
    {
        Ext.asap(function () //Ext.asap deshalb, weil es ja vorkommen kann, dass man von der Kachel auf den Tooltip wechselt. 
        {                   // Dann kommt aber erst das mouseleave der Kachel und dann das mouseenter des tooltips. Und das wollen wir durch das Ext.asap abwarten
            clearTimeout(element.timeout);
            if (isValid(element.businessCardTooltip))
            {
                if (element.businessCardTooltip.isMouseOverTooltip())
                {
                    return;
                }
                Ext.Array.remove(this.businessCardTooltips, element.businessCardTooltip);
                element.businessCardTooltip.hide();
            }
        }, this);
    },

    onContextMenu: function (element)
    {
        clearTimeout(element.timeout);
        Ext.each(this.businessCardTooltips, function (tooltip)
        {
            tooltip.hide();
        });
        this.businessCardTooltips = [];
    }
});