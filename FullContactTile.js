Ext.define('PartnerBoard.FullContactTile', {
    extend: 'PartnerBoard.BaseContactTile',
    
    acdGroupId: undefined,
    height: FULL_GROUP_CONTACT_HEIGHT,
    width: FULL_GROUP_CONTACT_WIDTH,

    style: 'display:flex;flex-direction:column;' + SHADOW_BORDER,

    childEls: ["phoneBlockEl", "normalBlockEl", "nameEl", "callerEl", "lineTimeEl", "callDirectionImageEl", "holdImageEl", "acdGroupNameEl", "mobileAvailableEl", "redirectionEl", "photoEl", "lineStateEl"],

    initComponent: function ()
    {
        this.renderTpl =
        [
            '<div id="{id}-phoneBlockEl" data-ref="phoneBlockEl" style="display:none;flex:1;flex-direction:column;justify-content:space-around;max-width:' + (FULL_GROUP_CONTACT_WIDTH - 2 * TILE_BORDER_WIDTH) + 'px">',
                '<div id="{id}-callerEl" data-ref="callerEl" style="text-align:center;margin-bottom:2px;padding-right:2px;max-height:36px"></div>',
                '<div id="{id}-lineTimeEl" data-ref="lineTimeEl" style="text-align: center;word-wrap:break-word;color:' + NEW_GREY + '"></div>',
                '<div style="display:flex;flex-direction:row;height:20px;margin:3px 0;justify-content:center">',
                    '<div id="{id}-callDirectionImageEl" data-ref="callDirectionImageEl" style="background-repeat:no-repeat;background-size:20px 20px;width:20px"></div>',
                    '<div id="{id}-holdImageEl" data-ref="holdImageEl" style="background-repeat:no-repeat;background-size:20px 20px;width:20px"></div>',
                '</div>',
                '<div id="{id}-acdGroupNameEl" data-ref="acdGroupNameEl" class="eclipsedText" style="font-style:italic;text-align: center;word-wrap:break-word;color:' + NEW_GREY + ';"></div>',
            '</div>',
            '<div id="{id}-normalBlockEl" data-ref="normalBlockEl" style="display:flex;flex:1;margin-top:8px;height:' + (FULL_GROUP_CONTACT_HEIGHT - 2) + 'px;">',
                '<div id="{id}-photoEl" data-ref="photoEl" style="flex:1;margin-right:5px;margin-left:8px;"></div>',
                '<div style="display:flex;flex-direction:column;margin:0 5px">',
                    '<div id="{id}-mobileAvailableEl" data-ref="mobileAvailableEl" style="display:none;background-size:16px;height:16px;width:16px;" title="' + LANGUAGE.getString("mobileAvailable") + '"></div>',
                    '<div id="{id}-lineStateEl" data-ref="lineStateEl" style="display:none;background-size:16px;height:16px;width:16px;margin-top:5px;" title="' + LANGUAGE.getString("lineStateOfPartnerOutOfService") + '"></div>',
                    '<div id="{id}-redirectionEl" data-ref="redirectionEl" style="display:none;background-size:16px;height:16px;width:16px;margin-top:5px;"></div>',
                '</div>',
            '</div>',
            '<div id="{id}-nameEl" data-ref="nameEl" class="eclipsedText" style="font-size:' + FONT_SIZE_TEXT + 'px;margin:0 8px;height:20px;text-align:left;color:' + BLACK + ';">' + this.getName() + '</div>'
        ];
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            var contact = this.getCurrentContact();
            self.userFoto = Ext.create('Photo',
            {
                renderTo: self.photoEl,
                size: PhotoSizes.Normal,
                contact: contact,
                showAgentState: self.groupPanel.isACDGroup() ? ShowAgentState.showAlways : ShowAgentState.showNever,
                showNameTooltip: false
            });
        });
    },

    destroy: function()
    {
        Ext.asap(function()
        {
            if (this.userFoto)
            {
                this.userFoto.destroy();
            }
            
            PartnerBoard.FullContactTile.superclass.destroy.apply(this);
        }, this);
    },
    
    onResolvedPartner: function(resolvedPartner)
    {
        if(isValid(resolvedPartner, "getContact()"))
        {
            this.contact = resolvedPartner;

            var resolvedContact = resolvedPartner.getContact();
            if (resolvedContact.isValid())
            {
                if (isValid(this.userFoto))
                {
                    this.userFoto.setContact(resolvedPartner.getContact());
                }
            }
        }

        this.callParent(arguments);
    },

    onAgentContactsResolved: function (configuration)
    {
        var contact = this.getCurrentContact();
        if (contact.converted)
        {
            Ext.asap(function()
            {
                var agent = CURRENT_STATE_CONTACT_CENTER.getAgentForContactGUID(this.getGUID());
                if (isValid(agent))
                {
                    this.contact = agent;
                    if (isValid(this.userFoto) && isValid(agent.getContact()))
                    {
                        this.userFoto.setContact(agent.getContact());
                    }
                }
            }, this);
        }
    },

    setLineTimeText: function (text)
    {
        this.lineTimeEl.setText(text);
    },

    startCallDurationTimer: function (callEvent)
    {
        if (isValid(this.currentCallTimer))
        {
            return;

        }
        var self = this;

        var addOneSecond = function() {
            if (self.destroyed) {
                return;
            }

            var seconds = 0;
            var isConnected = false;
            var lastCallEvent = CURRENT_STATE_CALL.getLastCallEventForGUID(self.getGUID());
            if (isValid(lastCallEvent)) 
            {
                if (lastCallEvent.isConnected() || lastCallEvent.isConferenced() || lastCallEvent.isOnHold()) 
                {
                    isConnected = true;
                }
                seconds = lastCallEvent.getCurrentLineTime();
            }

            if (isConnected) {
                self.lineTimeEl.setText(convertSecondsToString(seconds));
            }
            else {
                self.lineTimeEl.setText('');

                clearInterval(self.currentCallTimer);
                self.currentCallTimer = null;
            }
        };
        addOneSecond();
        this.currentCallTimer = setInterval(addOneSecond, 1000);
    },

    isPresenceStateUnknown: function()
    {
        if (isValid(this.contact, 'getContact()'))
        {
            if (isValid(this.contact, 'getContact().getPresenceState().value') && this.contact.getContact().getPresenceState().value === PresenceState.Unknown.value)
            {
                return true;
            }
        }
        return false;
    },

    switchToTelephoneView: function()
    {
        this.callParent();
        this.nameEl.dom.style.textAlign = "center";
    },

    switchToNormalView: function()
    {
        this.callParent();
        this.nameEl.dom.style.textAlign = "left";
    },

    showHoldImage: function (color)
    {
        this.holdImageEl.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage("pause", 64, color) + ')';
        this.holdImageEl.dom.style.display = 'block';
    },

    hideHoldImage: function ()
    {
        this.holdImageEl.dom.style.backgroundImage = '';
        this.holdImageEl.dom.style.display = 'none';
    },

    showACDGroupName: function (currentCall)
    {
        this.groupNameForCall = "";
        if (currentCall.isACDCall())
        {
            this.groupNameForCall = CURRENT_STATE_CONTACT_CENTER.getGroupName(currentCall.getACDCallInfo().getGroupId());
        }

        this.acdGroupNameEl.setText(this.groupNameForCall);
    },

    getImageNameForIncomingCall: function ()
    {
        return "down";
    },

    getImageNameForOutgoingCall: function ()
    {
        return "up";
    },

    setCallerText: function (currentCall)
    {
        var text;

        if (currentCall.isConferenced())
        {
            text = LANGUAGE.getString("conference");
        }
        else
        {
            var number = this.getNumberForCall(currentCall);
            text = isValidString(number) ? number : LANGUAGE.getString('unknown');
        }
        this.callerEl.setText(text);
        this.clamp(currentCall);
    },
    
    clamp: function (currentCall)
    {
        var numberLines = 2;
        if (currentCall.isACDCall())
        {
            numberLines = 1;
        }

        var self = this;
        Ext.asap(function ()
        {
            if (!isValid(self.callerEl))
            {
                return;
            }
            $clamp(self.callerEl.dom, { clamp: numberLines }); //dieses plugin beschränkt die Höhe auf zwei Zeilen und fügt ggf ein "..." dazu
        });
    }
});