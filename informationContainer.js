Ext.define('InformationContainer', {
    extend: 'Ext.Component',

    height: HEIGHT_CALLER_PANEL,
    flex: 1,
    iconSrc: "",
    padding: '5 0 0 5',
    contact: null,
    
    border: false,
    childEls: ["photoEl", "firstRowEl", "secondRowEl", "thirdRowEl", "fourthRowEl"],

    initComponent: function ()
    {
        this.style = this.style || 'background-color:' + COLOR_CALL_DISPLAY_PANEL_FOR_INTERNAL_CALLS;

        this.renderTpl = ['<div style="display:flex;flex-direction:column;margin:7px 0 0 0">',
                        '<div style="display:flex;">',
                            '<div id="{id}-photoEl" data-ref="photoEl" style=""></div>',
                            '<div style="display:flex;flex-direction:column;flex: 1;margin:0 0 0 15px">',
                                '<div style="position:relative;height: 24px">', //das position relative und absolute mit right und left machen wir hier nur, damit das mit dem eclipsedText funktioniert
                                    '<div id="{id}-firstRowEl" data-ref="firstRowEl" class="eclipsedText" style="left:0;right:5px;top:-6px;position:absolute;margin:0 0 0px 0;font-weight:500;font-size:' + FONT_SIZE_NAME + 'px;color:' + COLOR_CALL_DISPLAY_TITLE + '">{firstRow}</div>',
                                '</div>',
                                '<div id="{id}-secondRowEl" data-ref="secondRowEl" class="eclipsedText" style="font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + '"></div>',
                                '<div id="{id}-thirdRowEl" data-ref="thirdRowEl" class="eclipsedText" style="font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + '"></div>',
                                '<div id="{id}-fourthRowEl" data-ref="fourthRowEl" class="eclipsedText" style="font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_CALL_DISPLAY_SUBTITLE + '"></div>',
                            '</div>',
                        '</div>',
                    '</div>'];

        this.callParent();

        var self = this;
        this.on('boxready', function()
        {
            self.fillRows();

            self.photo = self.createPhoto();

            if (this.contact && this.contact.isRealContact())
            {
                this.firstRowEl.dom.title = LANGUAGE.getString('openContact');
                this.firstRowEl.dom.style.cursor = 'pointer';
                this.firstRowEl.dom.onclick = () =>
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_openContact(this.contact);
                }
            }
        });
    },

    destroy: function()
    {
        this.photo.destroy();
        
        this.callParent();
    },

    createPhoto: function ()
    {
        var photo = Ext.create('Photo',
        {
            renderTo: this.photoEl,
            contact: this.contact,
            avatarColor: WHITE,
            backgroundColorForInitials: COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS,
            colorForInitials: WHITE,
        });
        return photo;
    },

    fillRows: function()
    {
        var possibleValues = this.getPossibleValues();

        this.firstRowEl.dom.innerHTML = Ext.String.htmlEncode(getFirstValidString(possibleValues));
        this.secondRowEl.dom.innerHTML = Ext.String.htmlEncode(getSecondValidString(possibleValues));
        this.thirdRowEl.dom.innerHTML = Ext.String.htmlEncode(getThirdValidString(possibleValues));
        this.fourthRowEl.dom.innerHTML = Ext.String.htmlEncode(getFourthValidString(possibleValues));
    },

    getPossibleValues: function()
    {
        var possibleValues = [this.getName()];
        if (isValid(this.contact) && this.contact.isGlobalInfo())
        {
            possibleValues.push(this.contact.getCity());
            possibleValues.push(this.contact.getCountry());
        }
        else
        {
            if (isValid(this.contact) && isValidString(this.contact.getDepartment()))
            {
                possibleValues.push(this.contact.getDepartment());
            }
            else if (isValid(this.contact) && isValidString(this.contact.getCompany()))
            {
                possibleValues.push(this.contact.getCompany());
            }
        }
        return Ext.Array.unique(possibleValues); //damit nicht zweimal dasselbe angezeigt wird (Fall: sowohl im Namen als auch in der Firma stand "Amt Stuttgart")
    },

    getName: function ()
    {
        var possibleNameValues = [this.displayName];
        if (this.contact)
        {
            possibleNameValues.push(this.contact.getDisplayNameForLiveChat());
        }
        possibleNameValues.push(LANGUAGE.getString("unknownUser"));

        return getFirstValidString(possibleNameValues);
    }
});

Ext.define('InformationContainerForTeamChat',
{
    extend: 'InformationContainer',
    teamChatRoom: null,
    
    createPhoto: function ()
    {
        return Ext.create('TeamChatFoto',
        {
            renderTo: this.photoEl,
            teamChat: this.teamChatRoom,
            avatarColor: WHITE
        });
    },

    getPossibleValues: function ()
    {
        if (!isValid(this.teamChatRoom))
        {
            return [];
        }
        return [this.teamChatRoom.getDisplayName(), this.teamChatRoom.getDescription()];
    }
});

Ext.define('InformationContainerForWebRTCLive', {
    extend: 'InformationContainer',
    getPossibleValues: function ()
    {
        var result = this.callParent();
        result.push(LANGUAGE.getString("invitationAccepted"));
        result.push(LANGUAGE.getString(this.mediaType === WebRtcMediaType.Video ? "startVideoChat" : "startAudioChat"));
        
        return result;
    },

    createPhoto: function ()
    {
        return Ext.create('Photo',
        {
            renderTo: this.photoEl,
            avatarImageName: 'video',
            avatarColor: WHITE,
            avatarImageSize: 64,
            style: 'background-size:36px 36px',
            backgroundColorForInitials: COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS,
            colorForInitials: WHITE
        });
    }
});


Ext.define('InformationContainerForWebRTC',
{
    extend: 'InformationContainer',

    getPossibleValues: function ()
    {
        var result = [this.getName()];
        result.push(LANGUAGE.getString('invitationToWebRtcChat', LANGUAGE.getString(this.mediaType === WebRtcMediaType.Video ? "videoCall" : "audioCall")));

        return result;
    }
    });


Ext.define('InformationContainerForWhatsApp',
{
    extend: 'InformationContainer',

    createPhoto: function ()
    {
        return Ext.create('WhatsAppImage',
        {
            renderTo: this.photoEl,
            contact: this.contact,
            avatarColor: WHITE,
            backgroundColorForInitials: COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS,
            colorForInitials: WHITE,
            margin: '0 0 0 5'
        });
    }
});





Ext.define('AdditionalInformationContainer', {
    extend: 'Ext.Component',

    height: 59,
    iconSrc: "",
    padding: '5 5 7 5',

    contact: {},
    
    border: false,
    initComponent: function ()
    {
        this.style = this.style || 'background-color:' + COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS;
        this.tpl = this.createHTMLForRow('firstRow') + this.createHTMLForRow('secondRow') + this.createHTMLForRow('thirdRow');

        this.data =
        {
            id: this.id,
            firstRow: "",
            secondRow: "",
            thirdRow: ""
        };
        this.callParent();

        var self = this;
        this.on('afterrender', function ()
        {
            self.clamp();
        });
    },

    createHTMLForRow: function(name)
    {
        var color = COLOR_ACD_CALL_PANEL_LABEL_FOR_INTERNAL_CALLS;
        return '<div id="{id}-' + name + 'El" class="" style="font-size:' + FONT_SIZE_TEXT + 'px;color:' + color + '">{' + name + '}</div>';
    },

    setFirstRowText: function(text, htmlEncode)
    {
        if (htmlEncode)
        {
            text = Ext.String.htmlEncode(text);
        }
        this.data.firstRow = text;
    },

    setSecondRowText: function (text, htmlEncode)
    {
        if (htmlEncode)
        {
            text = Ext.String.htmlEncode(text);
        }
        this.data.secondRow = text;
    },

    setThirdRowText: function (text, htmlEncode)
    {
        if (htmlEncode)
        {
            text = Ext.String.htmlEncode(text);
        }
        this.data.thirdRow = text;
    },
    
    updateUI: function()
    {
        this.update(this.data);
        this.clamp();
    },

    clamp: function()
    {
        var firstRow = document.getElementById(this.id + "-firstRowEl");
        if (firstRow)
        {
            $clamp(firstRow, { clamp: 3 }); //dieses plugin beschränkt die Höhe auf drei Zeilen und fügt ggf ein "..." dazu
        }
    }
});