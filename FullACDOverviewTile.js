Ext.define('PartnerBoard.FullACDOverviewTile',
{
    extend: 'PartnerBoard.BaseACDOverviewTile',

    childEls: ["availableEl", "notAvailableEl", "postProcessingEl", "onPhoneEl", "waitingPersonsEl", "waitForCallEl"],
    cls: 'partnerBackground',
    style: 'margin-top: 10px; margin-right: 10px;height:' + FULL_GROUP_CONTACT_HEIGHT + 'px;width:' + FULL_GROUP_CONTACT_WIDTH + 'px;' + SHADOW_BORDER,

    initComponent: function ()
    {
        this.renderTpl =    '<div style="margin-top: 5px;flex:1;text-align:center;width:' + FULL_GROUP_CONTACT_WIDTH + 'px;">' + LANGUAGE.getString('agents') + '</div>' +
                                
                            '<div style="display:flex;margin-top:10px;margin-left:2px">' +
                                '<div style="margin-top:2px;height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, COLOR_AGENT_GREEN) + ')" ></div>' +
                                '<label id="{id}-availableEl" data-ref="availableEl" style="margin-left: 5px;margin-top:1px;width: 22px;">0</label>' +
                                '<div style="margin-top:2px;margin-left:5px;height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage('phone_ringing', 64, COLOR_AGENT_BLUE) + ')" ></div>' +
                                '<label id="{id}-onPhoneEl" data-ref="onPhoneEl" style="margin-left: 5px;margin-top:1px;width: 22px;">0</label>' +
                            '</div>' +
                            '<div style="display:flex;margin-top:5px;margin-left:2px">' +
                                '<div style="margin-top:2px;height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, COLOR_AGENT_RED) + ')" ></div>' +
                                '<label id="{id}-notAvailableEl" data-ref="notAvailableEl" style="margin-left: 5px;margin-top:1px;width: 22px;">0</label>' +
                                '<div style="margin-top:2px;margin-left:5px;height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage('music', 64, COLOR_AGENT_BLUE) + ')" ></div>' +
                                '<label id="{id}-waitingPersonsEl" data-ref="waitingPersonsEl" style="margin-left: 5px;margin-top:1px;width: 22px;">0</label>' +
                            '</div>' +
                            '<div style="display:flex;margin-top:5px;margin-left:2px">' +
                                '<div style="margin-top:2px;height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, COLOR_AGENT_BLUE) + ')" ></div>' +
                                '<label id="{id}-postProcessingEl" data-ref="postProcessingEl" style="margin-left: 5px;margin-top:1px;width: 22px;">0</label>' +
                                '<div style="margin-top:2px;margin-left:5px;height:16px;width:16px;background-size:16px 16px;background-image:url(' + IMAGE_LIBRARY.getImage('clock', 64, COLOR_AGENT_BLUE) + ')" ></div>' +
                                '<label id="{id}-waitForCallEl" data-ref="waitForCallEl" style="margin-left: 5px;margin-top:1px;width: 22px;"></label>' +
                            '</div>';

        this.callParent();
    },

    initRenderData: function ()
    {
        var data = this.callParent();
        data.waitingPersons = 0;
        return data;
    },

    update: function (data)
    {
        if (!this.isStateOk())
        {
            return;
        }
        this.callParent(arguments);
        this.waitingPersonsEl.setText(data.waitingPersons);
        if (!isValidString(this.waitForCallEl.dom.innerHTML))
        {
            this.waitForCallEl.setText("00:00");
        }
    }
});