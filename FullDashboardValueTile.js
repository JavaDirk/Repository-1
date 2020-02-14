Ext.define('PartnerBoard.FullDashBoardValueTile', {
    extend: 'PartnerBoard.BaseDashBoardValueTile',
    childEls: ["valueEl"],
    
    height: FULL_GROUP_CONTACT_HEIGHT,
    width: FULL_GROUP_CONTACT_WIDTH,
    margin: '10 10 0 0 ',
    style: 'display:flex;flex-direction:column;justify-content:space-around;color:' + WHITE,

    initComponent: function ()
    {
        this.renderTpl = '<label class="eclipsedText" title="{title}" style="height: 32px;word-wrap:break-word;font-size:12px;white-space: normal;">{title}</label>' +
                         '<label id="{id}-valueEl" data-ref="valueEl" class="eclipsedText dashboardValue" style="font-size:25px"></label>' +
                         '<label class="eclipsedText" title="{subTitle}" style="height:32px;font-size:11px;word-wrap:break-word;white-space: normal">{subtitle}</label>';
        
        this.callParent();
    }
});