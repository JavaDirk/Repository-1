Ext.define('RedirectionsDialog',
    {
        extend: 'BaseDialogForAnnouncementsAndRedirections',

        titleText: LANGUAGE.getString("redirections"),

        classNameForTextfield: 'Ext.form.field.Text',

        initComponent: function ()
        {
            this.callParent();

            var redirections = CURRENT_STATE_CONTACT_CENTER.getRedirectionsForGroup(this.groupId);
            this.setRedirections(redirections);
        },

        onNewEvents: function (response)
        {
            if (isValid(response.getRedirectionSettings()))		
            {
                this.onNewRedirectionSettings(response);
            }
        },
        
        onNewRedirectionSettings: function (response)
        {
            if (!isValid(response.getRedirectionSettings()))
            {
                return;
            }
            Ext.each(response.getRedirectionSettings(), function (settings)
            {
                var fieldset = this.getFieldsetForRedirectionID(settings[REDIRECTION_ID]);
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
            if (isValid(fieldset.combobox))
            {
                var foundRecord;
                fieldset.combobox.getStore().each(function (record)
                {
                    if (record.data.value !== ENTER_OWN_TEXT_ID && isValidString(record.data.value.getNumber()) && record.data.value.getNumber() === settings[REDIRECTION_TARGET])
                    {
                        foundRecord = record;
                        return false;
                    }
                });
                if (foundRecord)
                {
                    fieldset.combobox.setValue(foundRecord);
                    fieldset.textfield.setValue("");
                }
                else
                {
                    fieldset.combobox.setValue(ENTER_OWN_TEXT_ID);
                    fieldset.textfield.setValue(settings[REDIRECTION_TARGET]);
                }
            }
            else
            {
                if (isValid(fieldset.textfield))
                {
                    fieldset.textfield.setValue(settings[REDIRECTION_TARGET]);
                }
            }
        },

        getFieldsetForRedirectionID: function (id)
        {
            var result = null;
            Ext.each(this.fieldsets, function (fieldset)
            {
                if (isValid(fieldset.redirection[REDIRECTION_ID]) && fieldset.redirection[REDIRECTION_ID] === id)
                {
                    result = fieldset;
                    return false;
                }
            }, this);
            return result;
        },

        setRedirections: function (redirections)
        {
            this.clearBody();
            this.fieldsets = [];

            var saveButtonEnabled = false;
            Ext.each(redirections, function (redirection)
            {
                var fieldset = this.createFieldSetForRedirection(redirection);
                this.fieldsets.push(fieldset);
                this.addToBody(fieldset);
                if (!redirection[REDIRECTION_READONLY])
                {
                    saveButtonEnabled = true;
                }

                var setting = CURRENT_STATE_CONTACT_CENTER.getRedirectionSetting(redirection[REDIRECTION_ID]);
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

        createFieldSetForRedirection: function (redirection)
        {
            if (!isValid(redirection))
            {
                return null;
            }

            var emptyText = LANGUAGE.getString("targetNumber") + " (" + LANGUAGE.getString("redirectionHelpText") + ")";
            var textfield = Ext.create('Ext.form.field.Text',
            {
                width: '100%',
                emptyText: emptyText,
                disabled: redirection[REDIRECTION_READONLY]
            });

            var labelText = redirection[REDIRECTION_NAME] || LANGUAGE.getString("redirection");
            
            if (Ext.isEmpty(redirection.getTargets()))
            {
                var fieldset = this.createFieldset(labelText);
                fieldset.add(textfield);
                fieldset.redirection = redirection;
                fieldset.textfield = textfield;
                return fieldset;
            }
            else
            {
                var redirectionTargets = [];
                var targets = redirection.getTargets();
                Ext.each(targets, function (target)
                {
                    redirectionTargets.push({text: target.getName() + " [" + target.getNumber() + "]", value: target});
                });
                redirectionTargets.push({
                    text: LANGUAGE.getString("redirectionsEnterOwnText"),
                    value: ENTER_OWN_TEXT_ID
                });

                var fieldset = this.createFieldSetWithComboBox(redirectionTargets, redirection[REDIRECTION_READONLY], labelText, emptyText);
                fieldset.redirection = redirection;
                return fieldset;
            }
        },
        
        onSaveButton: function ()
        {
            if (!this.validate())
            {
                return false;
            }

            Ext.each(this.fieldsets, function (fieldset)
            {
                var text = "";
                if (isValid(fieldset.textfield) && fieldset.textfield.isVisible())
                {
                    text = fieldset.textfield.getValue();
                }
                else
                {
                    var selectedRecord = fieldset.combobox.getSelection();
                    if (isValid(selectedRecord))
                    {
                        text = selectedRecord.data.value.getNumber();
                    }
                }
                var self = this;
                var redirectionID = fieldset.redirection[REDIRECTION_ID];

                SESSION.setDynamicRedirection(redirectionID, text, undefined, function (response)
                {
                    self.onSaveSuccess(response);
                }, function ()
                {
                    self.onSaveException();
                });
            }, this);
            return true;
        },

        validate: function ()
        {
            var result = true;
            Ext.each(this.fieldsets, function (fieldset)
            {
                if (!isValid(fieldset.textfield))
                {
                    return;
                }

                var text = fieldset.textfield.getValue();
                if (isValidString(text) && !isPhoneNumber(text))
                {
                    this.changeErrorMessage(LANGUAGE.getString("noValidPhoneNumber", text));
                    result = false;
                    return false;
                }
            }, this);
            return result;
        }
    });	
