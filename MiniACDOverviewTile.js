Ext.define('PartnerBoard.MiniACDOverviewTile',
{
    extend: 'PartnerBoard.BaseACDOverviewTile',

    childEls: ["tileEl", "availableEl", "notAvailableEl", "postProcessingEl", "onPhoneEl"],

    initComponent: function ()
    {
        this.renderTpl = '<div id="{id}-tileEl" data-ref="tileEl" class="partnerBackground" style="' + SHADOW_BORDER + ';padding:1px;margin-top: 10px; margin-right: 10px;height:' + MINI_GROUP_CONTACT_HEIGHT + 'px;width:' + MINI_GROUP_CONTACT_WIDTH + 'px;">' +
                            '<div style="height:100%;display:flex;justify-content:center;align-items:center">' +
                                '<div style="height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, COLOR_AGENT_GREEN) + ')" ></div>' +
                                '<label id="{id}-availableEl" data-ref="availableEl"  style="margin:0 5px;width: 22px;"></label>' +
                                '<div style="height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, COLOR_AGENT_RED) + ')" ></div>' +
                                '<label id="{id}-notAvailableEl" data-ref="notAvailableEl"  style="margin:0 5px;width: 22px;"></label>' +
                                '<div style="height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, COLOR_AGENT_BLUE) + ')" ></div>' +
                                '<label id="{id}-postProcessingEl" data-ref="postProcessingEl" style="margin:0 5px;width: 22px;"></label>' +
                                '<div style="height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage('phone_ringing', 64, COLOR_AGENT_BLUE) + ')" ></div>' +
                                '<label id="{id}-onPhoneEl" data-ref="onPhoneEl" style="margin:0 5px;width: 22px;"></label>' +
                           '</div>' +
                        '</div>';

        this.callParent();
    }
});