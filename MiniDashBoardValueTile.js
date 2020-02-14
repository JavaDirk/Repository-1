Ext.define('PartnerBoard.MiniDashBoardValueTile', {
    extend: 'PartnerBoard.BaseDashBoardValueTile',
    
    childEls: ["valueEl"],
    
    height: MINI_GROUP_CONTACT_HEIGHT,
    width: MINI_GROUP_CONTACT_WIDTH,
    margin: '10 10 0 0 ',
    style: 'color:white;display:flex;flex-direction:row;align-items:center',

    initComponent: function ()
    {
        this.renderTpl =    '<div style="margin:0 0 0 5px;background-image:url({image});background-size:16px 16px;width:16px;height:16px"></div>' +
                            '<label class="eclipsedText" style="flex: 1;text-align: left;margin:0 0 0 5px">{subtitle}</label>' +
                            '<label id="{id}-valueEl" data-ref="valueEl" class="eclipsedText" style="margin-top:0px;width:45px;padding:0 5px 0 0;text-align:right"></label>';

        this.callParent();
    }
});