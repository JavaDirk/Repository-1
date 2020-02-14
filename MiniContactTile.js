Ext.define('PartnerBoard.MiniContactTile',
{
    extend: 'PartnerBoard.BaseContactTile',
    height: MINI_GROUP_CONTACT_HEIGHT,
    width: MINI_GROUP_CONTACT_WIDTH,
    
    style: 'display:flex;' + SHADOW_BORDER,

    childEls: ["photoEl", "phoneBlockEl", "normalBlockEl", "nameEl", "callDirectionImageEl", "mobileAvailableEl", "redirectionEl", "lineStateEl"],

    initComponent: function ()
    {
        this.renderTpl =
        [
            '<div id="{id}-photoEl" data-ref="photoEl" style="margin:0 5px;display:flex;align-self:center"></div>',
            '<div id="{id}-nameEl" data-ref="nameEl" class="eclipsedText" style="min-width:0;font-size:' + FONT_SIZE_TEXT + 'px;color:' + BLACK + ';cursor:pointer;background-color:transparent;margin-top:4px;flex:1">' + this.getName() + '</div>',
            '<div id="{id}-phoneBlockEl" data-ref="phoneBlockEl" style="display:none;">',
                '<div id="{id}-callDirectionImageEl" data-ref="callDirectionImageEl" style="background-size:16px;background-position:center;height:16px;width:16px;margin:4px 5px 0 5px;"></div>',
            '</div>',
            '<div id="{id}-normalBlockEl" data-ref="normalBlockEl" style="display:flex;margin-top:4px;margin-right:5px">',
                '<div id="{id}-mobileAvailableEl" data-ref="mobileAvailableEl" style="display:none;background-size:16px;height:16px;width:16px;margin-left:5px;" title="' + LANGUAGE.getString("mobileAvailable") + '"></div>',
            '<div id="{id}-lineStateEl" data-ref="lineStateEl" style="display:none;background-size:16px;height:16px;width:16px;margin-left:5px;"  title="' + LANGUAGE.getString("lineStateOfPartnerOutOfService") + '"></div>',
            '<div id="{id}-redirectionEl" data-ref="redirectionEl" style="display:none;background-size:16px;height:16px;width:16px;margin-left:5px;"></div>',
            '</div>'
        ];

        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            var curContact = self.getCurrentContact();

            self.foto = Ext.create('OnlyStatesPhoto',
            {
                renderTo: self.photoEl,
                contact: curContact,
                showAgentState: self.groupPanel.isACDGroup() ? ShowAgentState.showAlways : ShowAgentState.showNever
            });
        });
    },

    onResolvedPartner: function (resolvedPartner)
    {
        if (!this.isStateOk())
        {
            return;
        }
        if (isValid(resolvedPartner, "getContact()"))
        {
            this.contact = resolvedPartner;

            var resolvedContact = resolvedPartner.getContact();
            if (resolvedContact.isValid())
            {
                this.foto.setContact(this.getCurrentContact());
                
                var presenceState, hasMobileDevice;
                var presenceStateEvent = CURRENT_STATE_STATES.getPresenceStateEvent(this.getGUID());
                if (isValid(presenceStateEvent))
                {
                    presenceState = getEnumForPresenceState(presenceStateEvent.getState());
                    hasMobileDevice = presenceStateEvent.getIsMobileAvailable();
                }
                else
                {
                    presenceState = getEnumForPresenceState(resolvedPartner.getContact().getPresenceState());
                    hasMobileDevice = false;
                }

                this.changePresenceStates(this.getGUID(), presenceState.value, hasMobileDevice);
            }
        }

        this.callParent(arguments);
    },

    getImageNameForIncomingCall: function ()
    {
        return "left";
    },

    getImageNameForOutgoingCall: function ()
    {
        return "right";
    }
});