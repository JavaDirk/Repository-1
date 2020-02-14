Ext.define('AnnouncementsDialog',
    {
        extend: 'BaseDialogForAnnouncementsAndRedirections',

        titleText: LANGUAGE.getString("announcements"),

        classNameForTextfield: 'Ext.form.field.TextArea',

        initComponent: function ()
        {
            this.callParent();

            var announcements = CURRENT_STATE_CONTACT_CENTER.getAnnouncementsForGroup(this.groupId);
            this.setAnnouncements(announcements);
        },

        onNewEvents: function (response)
        {
            if (isValid(response.getAnnouncementSettings()))		
            {
                this.onNewAnnouncementSettings(response);
            }
        },
        
        onNewAnnouncementSettings: function (response)
        {
            Ext.each(response.getAnnouncementSettings(), function (settings)
            {
                var fieldset = this.getFieldsetForAnnouncementID(settings[ANNOUNCEMENT_ID]);
                if (!isValid(fieldset))
                {
                    return;
                }
                this.updateValueForSetting(settings, fieldset);
            }, this);
        },

        updateValueForSetting: function (settings, fieldset)
        {
            if (!isValid(settings) || !isValid(fieldset))
            {
                return;
            }

            if (isValidString(settings[ANNOUNCEMENT_TEXT]) || settings.getVoiceMenu().getVoiceMenuId() === ENTER_OWN_TEXT_ID)
            {
                fieldset.combobox.setValue(ENTER_OWN_TEXT_ID);
                if (isValid(fieldset.textfield))
                {
                    fieldset.textfield.setValue(settings[ANNOUNCEMENT_TEXT]);
                }
                return;
            }

            var voiceMenu = settings.getVoiceMenu();
            if (voiceMenu[ANNOUNCEMENT_VOICE_MENU_ID] > 0)
            {
                fieldset.combobox.setValue(voiceMenu[ANNOUNCEMENT_VOICE_MENU_ID]);
            }
            else
            {
                var announcements = CURRENT_STATE_CONTACT_CENTER.getAnnouncementsForGroup(this.groupId);
                var announcementID = settings[ANNOUNCEMENT_ID];
                for (var index in announcements)
                {
                    if (announcements[index][ANNOUNCEMENT_ID] === announcementID)
                    {
                        var announcement = announcements[index];
                        var defaultVoiceMenuId = announcement[ANNOUNCEMENT_DEFAULT_VOICE_MENU_ID];
                        fieldset.combobox.setValue(defaultVoiceMenuId);
                    }
                }
            }
        },

        getFieldsetForAnnouncementID: function (id)
        {
            var result = null;
            Ext.each(this.fieldsets, function (fieldset)
            {
                if (isValid(fieldset.announcement[ANNOUNCEMENT_ID]) && fieldset.announcement[ANNOUNCEMENT_ID] === id)
                {
                    result = fieldset;
                    return false;
                }
            }, this);
            return result;
        },

        setAnnouncements: function (announcements)
        {
            this.clearBody();
            this.fieldsets = [];

            var saveButtonEnabled = false;
            Ext.each(announcements, function (announcement)
            {
                var fieldset = this.createFieldSetForAnnouncement(announcement);
                this.fieldsets.push(fieldset);
                this.addToBody(fieldset);
                if (!announcement[ANNOUNCEMENT_READONLY])
                {
                    saveButtonEnabled = true;
                }

                var setting = CURRENT_STATE_CONTACT_CENTER.getAnnouncementSetting(announcement[ANNOUNCEMENT_ID]);
                this.updateValueForSetting(setting, fieldset);
            }, this);

            if (saveButtonEnabled)
            {
                this.saveButton.enable();
            }
            else
            {
                this.saveButton.disable();
            }
        },

        createFieldSetForAnnouncement: function (announcement)
        {
            if (!isValid(announcement))
            {
                return null;
            }
            announcement[ANNOUNCEMENT_LIST] = [];
            if (announcement[ANNOUNCEMENT_DEFAULT_VOICE_MENU_ID] === -1)
            {
                announcement[ANNOUNCEMENT_LIST].push(
                    {
                        text: LANGUAGE.getString("noAnnouncement"),
                        value: -1
                    });
            }

            Ext.each(announcement.getVoiceMenus(), function (voiceMenu)
            {
                var text = voiceMenu.getName();
                if (voiceMenu.getVoiceMenuId() === announcement[ANNOUNCEMENT_DEFAULT_VOICE_MENU_ID])
                {
                    text += " (" + LANGUAGE.getString("default") + ")";
                }
                announcement[ANNOUNCEMENT_LIST].push(
                    {
                        text: text,
                        value: voiceMenu.getVoiceMenuId()
                    });
            }, this);
            

            if (announcement[ANNOUNCEMENT_FREE_TEXT_ALLOWED])
            {
                announcement[ANNOUNCEMENT_LIST].push(
                    {
                        text: LANGUAGE.getString("announcementsEnterOwnText"),
                        value: ENTER_OWN_TEXT_ID
                    });
            }

            var fieldset = this.createFieldSetWithComboBox(announcement[ANNOUNCEMENT_LIST], announcement[ANNOUNCEMENT_READONLY], announcement[ANNOUNCEMENT_NAME], LANGUAGE.getString("yourText"));
            fieldset.announcement = announcement;
            return fieldset;
        },

        onSaveButton: function ()
        {
            Ext.each(this.fieldsets, function (fieldset)
            {
                var text = "";
                if (isValid(fieldset.textfield) && fieldset.textfield.isVisible())
                {
                    text = fieldset.textfield.getValue();
                }

                var self = this;

                var announcementID = fieldset.announcement[ANNOUNCEMENT_ID];
                var voiceMenuID = fieldset.combobox.getValue();

                SESSION.setDynamicAnnouncement(announcementID, voiceMenuID || -1, text, undefined, function (response) { self.onSaveSuccess(response); }, function () { self.onSaveException(); });
            }, this);
            return true;
        }
    });	
