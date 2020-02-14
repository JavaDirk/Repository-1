/*
Um ein Photo normal zu verwenden, einfach erzeugen und in einen Container adden.

Um ein Photo in einem View zu nutzen, muss folgendes gemacht werden:
1. im Teplate des View ein div mit der class CLASS_CONTACT_PHOTO erstellen
2. der Store muss von BaseStore abgeleitet sein (damit die Photo-Instanzen auch wieder gelöscht werden)
3. der View muss das Plugin ViewWithPhotos bzw die abgeleiteten Klassen ContactViewWithPhotos etc. einbinden (dort werden bei Events wie itemadd, refresh, itemupdate die Photos erzeugt)
*/

var PhotoSizes =
{
    OnlyStates: { width: 12,    height: 12,     presenceStateSize: 12,  agentStateSize: 12, fontSize: 0},
    Tiny:       { width: 32,    height: 32,     presenceStateSize: 9,   agentStateSize: 9,  fontSize: 11},
    Small:      { width: 40,    height: 40,     presenceStateSize: 12,  agentStateSize: 12, fontSize: 13},
    Default:    { width: 46,    height: 46,     presenceStateSize: 12,  agentStateSize: 14, fontSize: 15},
    Normal:     { width: 60,    height: 60,     presenceStateSize: 12,  agentStateSize: 16, fontSize: 20},
    Big:        { width: 75,    height: 75,     presenceStateSize: 17,  agentStateSize: 17, fontSize: 25},
    Biggest:    { width: 102,   height: 102,    presenceStateSize: 19,  agentStateSize: 19, fontSize: 33}
};

var ShowAgentState =
{
    showNever: { value: 0 },                //Zeige nie den Agentenstatus
    showByClientSettings: { value: 1 },     //Default. Ob der Agentenstatus angezeigt werden soll, wird aus den Client-Settings übernommen (sprich: der Benutzer kann das einstellen)
    showAlways: { value: 2 }                //Zeige immer den Agentenstatus (z.B. in einer ACD-Gruppe)
};

Ext.define('Photo',
{
    extend: 'Ext.Component',
    cls: CLASS_FOR_SHOWING,
    size: PhotoSizes.Default,
    
    childEls: ["presenceStateEl", "agentStateEl"],

    //Man kann von außerhalb bestimmen, ob Präsenz oder Agentenstatus angezeigt werden soll. 
    //Beispiel: In einer nicht-ACD-Gruppe in der Partnerleiste soll der Agentenstatus nicht angezeigt werden
    //oder im ChatPanel soll gar kein Status angezeigt werden
    showPresenceState: true,
    showAgentState: ShowAgentState.showByClientSettings,
    showNameTooltip: true,

    avatarImageName: '',
    avatarImageSize: 64,
    avatarColor: COLOR_DARK_AVATAR,

    initComponent: function ()
    {
        if (this.showAgentState === true || this.showAgentState === false)
        {
            console.log("Photo: using true or false for showAgentState is deprecated. Pleas use one of the ShowAgentState enum values!");
        }
        this.size = this.size || PhotoSizes.Default;
        this.width = this.size.width;
        this.height = this.size.height;

        this.convertContact();

        this.avatarImageName = this.avatarImageName || this.getAvatarImageName();
        this.avatarImageSize = this.avatarImageSize || 64;
        this.avatarColor = this.avatarColor || COLOR_DARK_AVATAR;

        this.backgroundColorForInitials = this.backgroundColorForInitials || COLOR_MAIN_2;
        this.colorForInitials = this.colorForInitials || WHITE;

        this.renderTpl = [
            '<div id="{id}-presenceStateEl" data-ref="presenceStateEl" style="' + this.getStyleForPresenceState() + ';background-image:' + this.getBackgroundImageForPresenceState() + '"></div>',
            '<div id="{id}-agentStateEl" data-ref="agentStateEl" style="' + this.getStyleForAgentState() + ';background-image' + this.getBackgroundImageForAgentState() + '"></div>'
        ];
        
        this.style = this.style || "";

        var defaultStyles =
        {
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'border-radius': '100%',
            'background-size': this.width + 'px ' + this.height + 'px',
            'width': this.width + 'px',
            'height': this.height + 'px',
            'display': 'flex'
        };
        var self = this;
        Ext.iterate(defaultStyles, function (attributeName, value)
        {
            if (self.style.indexOf(attributeName) === -1)
            {
                self.style += ";" + attributeName + ":" + value;
            }
        });
        
        
        this.callParent();
        
        this.on('boxready', function ()
        {
            SESSION.addListener(self);
            if (window.GLOBAL_EVENT_QUEUE)
            {
                GLOBAL_EVENT_QUEUE.addEventListener(self);
            }
            self.updateUI();
        });   
    },

    destroy: function ()
    {
        if (window.GLOBAL_EVENT_QUEUE)
        {
            GLOBAL_EVENT_QUEUE.removeEventListener(this);
        }
        SESSION.removeListener(this);

        this.callParent(this);
    },

    onGlobalEvent_UploadMyImageFinished: function (newImageUrl)
    {
        if (this.contact && this.contact.equals(MY_CONTACT))
        {
            this.contact.setImageUrl(newImageUrl);
            this.updateUI();
        }
    },

    addTooltips: function ()
    {
        if (this.showNameTooltip && isValid(this, 'contact.getFullName'))
        {
            this.changeEl('title', this.contact.getFullName());
        }

        this.changePresenceStateEl("title", this.getTooltipTextForPresenceState());
        this.changeAgentStateEl("title", this.getTooltipTextForAgentState());
    },

    convertContact: function()
    {
        if (this.contact && this.contact.typeMarker === "www_caseris_de_CaesarSchema_CTIContact") 
        {
            var convertedContact = new www_caseris_de_CaesarSchema_Contact();
            convertedContact.convertFromCTIContact(this.contact);
            this.contact = convertedContact;
        }
    },

    setContact: function (contact)
    {
        this.contact = contact;

        this.convertContact();

        this.updateUI();
    },

    updateUI: function()
    {
        if (!isStateOk(this))
        {
            return;
        }
        
        if (isValidString(this.getImageUrl()))
        {
            this.changeElStyle(this.getCSSForImageCase());
        }
        else
        {
            if (this.showInitials())
            {
                this.setInitialsText();
                this.changeElStyle(this.getCSSForInitialsCase());
            }
            else if (this.showAvatar())
            {
                this.avatarImageName = this.getAvatarImageName();
                this.changeElStyle(this.getCSSForAvatarCase());
            }
        }

        this.updatePresenceStateAndAgentState();

        this.addTooltips();
    },

    setInitialsText: function()
    {
        if (isValid(this.textNodeForInitials))
        {
            this.changeEl('nodeValue', this.getInitials());
        }
        else
        {
            this.textNodeForInitials = document.createTextNode(this.getInitials());
            this.el.dom.appendChild(this.textNodeForInitials);
        }
    },

    getCSSForImageCase: function ()
    {
        return {
            'background-image':'url(' + this.getImageUrl() + ')',
            'background-color':'white',
            'color':'transparent',
            'border': 'none'
        };
    },

    getCSSForInitialsCase: function ()
    {
        return {
            'display': 'flex',
            'background-image': 'none',
            'background-color': this.backgroundColorForInitials,
            'color': this.colorForInitials,
            'justify-content': 'center',
            'align-items': 'center',
            'font-size': this.getFontSizeForInitials() + "px",
            'border': 'none',
            'line-height': this.height + "px" //wenn man das nicht macht, werden die Initialen bei größeren Höhen nicht richtig vertikal zentriert, liegt an der Schriftart Segoe UI
        };
    },

    getCSSForAvatarCase: function ()
    {
        var borderWidth = isValid(this.borderWidth) ? this.borderWidth : 1;
        var cssObject = {
            'border': borderWidth + 'px solid ' + this.getAvatarColor(),
                'background-color':'transparent',
                'color':'transparent'
        };
        var avatarImage = this.avatarImage;
        if (!avatarImage && isValidString(this.avatarImageName))
        {
            avatarImage = IMAGE_LIBRARY.getImage(this.avatarImageName, this.avatarImageSize, this.avatarColor);
        }
        if (isValidString(avatarImage))
        {
            cssObject['background-image'] = 'url(' + avatarImage + ')';
        }
        return cssObject;
    },

    updatePresenceStateAndAgentState: function()
    {
        this.changePresenceStateElStyle({
                                        'background-image': this.getBackgroundImageForPresenceState(),
                                        'display': this.getDisplayAttributeValueForPresenceState()
        });
        
        this.changeAgentStateElStyle({
                                        'background-image': this.getBackgroundImageForAgentState(),
                                        'display': this.getDisplayAttributeValueForAgentState()
        });
    },

    showInitials: function ()
    {
        return !isValidString(this.getImageUrl()) && isValidString(this.getInitials());
    },

    showAvatar: function ()
    {
        if (isValidString(this.getImageUrl()))
        {
            return false;
        }
        if (this.showInitials())
        {
            return false;
        }
        return true;
    },

    setColorsForInitials: function (backgroundColor, color)
    {
        this.backgroundColorForInitials = backgroundColor;
        this.colorForInitials = color;
        
        this.updateUI();
    },

    getAvatarImageName: function ()
    {
        if (isValidString(this.avatarImageName))
        {
            return this.avatarImageName;
        }
        if (!isValid(this.contact))
        {
            return "";
        }

        if (isValid(this, "contact.getAvatarImageNameForPhoto"))
        {
            return this.contact.getAvatarImageNameForPhoto();
        }
        return "";
    },

    getAvatarColor: function ()
    {
        if (isValid(this.avatarColor))
        {
            return this.avatarColor;
        }
        if (isValid(this.contact))
        {
            return this.contact.getBorderColorForPhoto();
        }
        return WHITE;
    },

    setImageUrl: function(url)
    {
        if (isValid(this.contact))
        {
            this.contact.setImageUrl(url);
            this.setContact(this.contact);
        }
        else
        {
            this.imageUrl = url;
        }
    },

    getImageUrl: function ()
    {
        if (isValid(this.contact))
        {
            return this.contact.getImageUrl() || "";
        }
        return this.imageUrl || "";
    },

    getGUID: function ()
    {
        if (isValid(this, "contact.getGUID"))
        {
            return this.contact.getGUID();
        }
        if (isValid(this, "contact.getGuid"))
        {
            return this.contact.getGuid();
        }

        return '';
    },

    getBorder: function()
    {
        return this.borderWidth + "px solid " + this.borderColor;
    },

    getStyleForPresenceState: function ()
    {
        return this.getPositionForPresenceState() + ";" +
            this.getSizeStringForPresenceState() + ";" +
            this.getStyleForBothStates() +
            ";display:" + this.getDisplayAttributeValueForPresenceState() +
            ";border:" + this.getBorderWidthForPresenceState() + "px solid white;background-repeat:no-repeat";
    },
    
    getStyleForAgentState: function ()
    {
        return this.getPositionForAgentState() + ";" +
            this.getSizeStringForAgentState() + ";" +
            this.getStyleForBothStates() +
            ";display:" + this.getDisplayAttributeValueForAgentState() +
            ";border:" + this.getBorderWidthForAgentState() + "px solid white";
    },

    getDisplayAttributeValueForPresenceState: function ()
    {
        if (this.AgentStateShouldBeShown())
        {
            return "none";
        }
        if (this.PresenceStateShouldBeShown())
        {
            return "block";
        }
        return "none";
    },

    getDisplayAttributeValueForAgentState: function ()
    {
        return this.AgentStateShouldBeShown() ? "block" : "none";
    },

    PresenceStateShouldBeShown: function ()
    {
        return this.showPresenceState && isValidString(this.getBackgroundImageForPresenceState());
    },

    AgentStateShouldBeShown: function ()
    {
        if (this.showAgentState.value === ShowAgentState.showNever.value)
        {
            return false;
        }

        if (isValid(this.contact) && CURRENT_STATE_CALL.isOnPhone(this.contact.getGUID()))
        {
            return false;    
        }

        if (isValidString(this.getAgentStateImage()) && this.AgentStateShouldBeShownBySettings())
        {
            return true;           
        }
        return false;
    },

    AgentStateShouldBeShownBySettings: function ()
    {
        if (this.showAgentState.value === ShowAgentState.showAlways.value)
        {
            return true;
        }
        else if (this.showAgentState.value === ShowAgentState.showByClientSettings.value)
        {
            return !!CLIENT_SETTINGS.getSetting("CONTACTS", "alwaysShowAgentState");
        }  
        return false;
    },

    getStyleForBothStates: function ()
    {
        return "border-radius:100%;background-color:" + this.getBackgroundColorForStates() + ";";
    },

    getBackgroundColorForStates: function()
    {
        return "white";
    },
    
    getBorderWidthForPresenceState: function ()
    {
        return 3;
    },

    getBorderWidthForAgentState: function ()
    {
        return 2;
    },

    getPositionForPresenceState: function ()
    {
        return "position:absolute;bottom:-2px;right:-2px";
    },

    getPositionForAgentState: function ()
    {
        return "position:absolute;bottom:-2px;right:-2px";
    },

    getSizeForPresenceState: function ()
    {
        return this.size.presenceStateSize;
    },

    getSizeStringForPresenceState: function ()
    {
        var width = this.getSizeForPresenceState();
        return this.getSizeForStates(width, this.getBorderWidthForPresenceState());
    },

    getSizeForAgentState: function ()
    {
        return this.size.agentStateSize;
    },

    getSizeStringForAgentState: function ()
    {
        var width = this.getSizeForAgentState();
        return this.getSizeForStates(width, this.getBorderWidthForAgentState());
    },

    getSizeForStates: function (width, borderWidth)
    {
        var height = width;
        
        return 'width:' + (width + 2 *borderWidth) + 'px;height:' + (height + 2*borderWidth) + 'px;background-size:contain;box-sizing:border-box';
    },

    getBackgroundImageForPresenceState: function ()
    {
        var presenceImage = this.getBackgroundForPresenceState();
        if (isValidString(presenceImage)) {
            return 'url(' + presenceImage + ')';
        }
        return '';
    },

    getBackgroundForPresenceState: function ()
    {
        if (!this.showPresenceState || !isValid(this.contact))
        {
            return "";
        }

        if (this.contact.getPresenceImage) 
        {
            return this.contact.getPresenceImage();
        }
        
        return "";
    },

    getBackgroundImageForAgentState: function ()
    {
        var agentStateImage = this.getAgentStateImage();
        if (isValidString(agentStateImage))
        {
            return 'url(' + agentStateImage + ')';
        }
        return "";
    },

    getAgentStateImage: function ()
    {
        var agentInfo;
        if (this.contact)
        {
            agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfoForContactGUID(this.contact.getGUID());
            if (!isValid(agentInfo) && isValid(this, "contact.agent"))
            {
                agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfo(this.contact.agent.getId());
            }
        }
        
        if (isValid(agentInfo))
        {
            var agentState = getEnumForAgentState(agentInfo.getAgentState());
            if (isValid(agentState))
            {
                var allGroupsEmpty = !isValid(agentInfo.getCallGroups()) && !isValid(agentInfo.getMailGroups()) && !isValid(agentInfo.getChatGroups());
                    
                if (allGroupsEmpty || agentState.value === AgentState.LoggedOff.value)
                {
                    if (!this.AgentStateShouldBeShownBySettings())
                    {
                        return "";
                    }
                }
                return IMAGE_LIBRARY.getImage(ICON_NAME_ACD_AGENT, 64, agentState.color);
            }
        }
        
        return "";
    },

    getFontSizeForInitials: function ()
    {
        return this.size.fontSize;
    },

    getInitials: function ()
    {
        var self = this;

        var firstName = "";
        var lastName = "";
        if (isValid(this.contact, "getFirstName") && isValidString(this.contact.getFirstName()))
        {
            firstName = (this.contact.getFirstName());
        }
        if (isValid(this.contact, "getLastName") && isValidString(this.contact.getLastName()))
        {
            lastName = (this.contact.getLastName());

            //Fall: im LastName steht der komplette Name, im firstName nix
            if (isValidString(lastName) && !isValidString(firstName))
            {
                if (lastName.indexOf(', ') !== -1)
                {
                    lastName = lastName.split(', ');
                    firstName = lastName[1];
                    lastName = lastName[0];
                }
            }
        }

        var possibleNameFields = ['getName', 'getFullName'];
        Ext.each(possibleNameFields, function (possibleNameField)
        {
            if (!isValidString(firstName) || !isValidString(lastName))
            {
                if (isValid(self.contact, possibleNameField + '()') && isValidString(self.contact[possibleNameField]()))
                {
                    var name = Ext.String.htmlDecode(self.contact[possibleNameField]());

                    if (name.indexOf(', ') !== -1)
                    {
                        name = name.split(', ');
                        firstName = name[1];
                        lastName = name[0];
                    }
                    else
                    {
                        name = name.split(' ');
                        if (name.length === 1)
                        {
                            lastName = name[0];
                            firstName = "";
                        }
                        else
                        {
                            firstName = name[0];

                            //für den Fall, dass der String "Reimbold & Strick GmbH" ist dann sollten die Initialen nicht "R&" sondern "RS" sein
                            for (var i = 1; i < name.length; i++)
                            {
                                var namePart = name[i];
                                if (isLetter(namePart[0]) || i === name.length - 1)
                                {
                                    lastName = namePart;
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        });
        
        var initialsText = '';

        if (isValidString(firstName))
        {
            initialsText = firstName[0];
        }


        if (isValidString(lastName))
        {
            initialsText += lastName[0];
        }

        if (initialsText.length === 2 && BLACK_LIST.indexOf(initialsText) !== -1)
        {
            initialsText = initialsText[1];
        }

        return initialsText;
    },

    getTooltipTextForPresenceState: function ()
    {
        if (isValid(this.contact, 'getPresenceText'))
        {
            return this.contact.getPresenceText();
        }
    },

    getTooltipTextForAgentState: function ()
    {
        if (this.contact)
        {
            var agentInfo = CURRENT_STATE_CONTACT_CENTER.getAgentInfoForContactGUID(this.contact.getGUID());
            if (isValid(agentInfo))
            {
                var agentState = getEnumForAgentState(agentInfo.getAgentState());
                if (isValid(agentState))
                {
                    return agentState.text;
                }
            }
        }
        return null;
    },

    onNewEvents: function(response)
    {
        if (!isStateOk(this))
        {
            return;
        }

        var updateStates = false;

        Ext.iterate(response.getPresenceStateEventsForGuid(this.getGUID()), function (partner, index)
        {
            this.changePresenceStateEl("title", partner.getText());
            updateStates = true;
        }, this);

        Ext.iterate(response.getAgentInfos(), function (state)
        {
            var myAgentId = CURRENT_STATE_CONTACT_CENTER.getAgentIDForContactGUID(this.getGUID());
            if (myAgentId !== state.getAgentId())
            {
                return;
            }

            this.updatePresenceStateAndAgentState(); //warum hier auch die Präsenz updaten? wenn der Agentenstatus LoggedOff ist, soll die Präsenz angezeigt werden

            var agentState = state.getAgentState();
            agentState = getEnumForAgentState(agentState);
            if (isValid(agentState))
            {
                this.changeAgentStateEl('title', agentState.text);
            }
        }, this);
        
        Ext.each(response.getCallEventsForGuid(this.getGUID()), function (call)
        {
            updateStates = true;
        }, this);
        
        if (!CURRENT_STATE_CALL.isMyLineStateOKOrBusy())
        {
            updateStates = true;
        }

        if(updateStates)
        {
            this.updatePresenceStateAndAgentState();
        }
    },

    changePresenceStateEl: function(attribute, value)
    {
        if (!this.presenceStateEl.dom)
        {
            return;
        }
        this.presenceStateEl.dom[attribute] = value;
    },

    changePresenceStateElStyle: function (cssObject)
    {
        if (!this.presenceStateEl.dom)
        {
            return;
        }
        Object.assign(this.presenceStateEl.dom.style, cssObject);
    },

    changeAgentStateEl: function (attribute, value)
    {
        if (!this.agentStateEl.dom)
        {
            return;
        }
        this.agentStateEl.dom[attribute] = value;
    },

    changeAgentStateElStyle: function (cssObject)
    {
        if (!this.agentStateEl.dom)
        {
            return;
        }
        Object.assign(this.agentStateEl.dom.style, cssObject);
    },

    changeEl: function (attribute, value)
    {
        if (!this.el.dom)
        {
            return;
        }
        this.el.dom[attribute] = value;
    },

    changeElStyle: function (cssObject)
    {
        if (!this.el.dom)
        {
            return;
        }
        Object.assign(this.el.dom.style, cssObject);
    },

    isForMe: function(guid)
    {
        var myGuid = this.getGUID();
        return myGuid === guid;
    }
});

Ext.define('FileUploadPhoto',
{
    extend: 'Photo',
    size: PhotoSizes.Big,

    showAgentState: ShowAgentState.showNever,

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            self.changeEl('title', LANGUAGE.getString("clickToChangePicture"));

            self.el.on('mouseenter', function ()
            {
                self.changePresenceStateElStyle({ 'background-image': 'url(' + IMAGE_LIBRARY.getImage('camera', 64, NEW_GREY) + ')' });
            });
            self.el.on('mouseleave', function ()
            {
                self.changePresenceStateElStyle({ 'background-image': self.getBackgroundImageForPresenceState() });
            });
        });
    }
});

//Dies Klasse ist für den Fall gedacht, dass man nur Präsenz/Agentenstatus anzeigen will und nicht das Foto bzw die Initialen
Ext.define('OnlyStatesPhoto',
{
    extend: 'Photo',

    cls: '',
    
    initComponent: function ()
    {
        this.size = PhotoSizes.OnlyStates;
        this.callParent();
    },

    getSizeForPresenceState: function ()
    {
        return 12;
    },

    getSizeForAgentState: function ()
    {
        return 16;
    },

    getBorderWidthForPresenceState: function ()
    {
        return 1;
    },

    getBorderWidthForAgentState: function () {
        return 0;
    },

    getPositionForPresenceState: function () {
        return "position:absolute;bottom:-2px;right:-1px";
    },

    getPositionForAgentState: function () {
        return "position:absolute;bottom:-2px;right:-1px";
    },

    getBackgroundColorForStates: function () {
        return "transparent";
    },

    showInitials: function ()
    {
        return false;
    },

    showAvatar: function ()
    {
        return false;
    },

    getImageUrl: function()
    {
        return "";
    }
    });

Ext.define('WhatsAppImage',
    {
        extend: 'Photo',
        
        avatarImageName: 'whatsapp',
        
        initComponent: function ()
        {
            if (isValidString(this.contact.getFullName()))
            {
                this.avatarImageName = 'whatsapp_without_phone';
            }
            this.callParent();
        },


        updateUI: function ()
        {
            if (!isStateOk(this))
            {
                return;
            }

            if (isValidString(this.contact.getFullName()))
            {
                this.setInitialsText();
                this.changeElStyle(this.getCSSForInitialsCase());
            }
            this.changeElStyle(this.getCSSForAvatarCase());
        },

        getCSSForAvatarCase: function ()
        {
            var color = this.avatarColor || NEW_GREY;
            var cssObject = {
                'border': 'none',
                'border-radius': '0',
                'background-color': 'transparent',
                'background-position': 'center 1px',
                'color': color,
                'background-image': 'url(' + IMAGE_LIBRARY.getImage(this.avatarImageName, 64, color) + ')'
            };
            return cssObject;
        },
    });