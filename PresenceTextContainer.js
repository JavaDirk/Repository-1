Ext.define('PresenceTextContainer',
    {
        extend: 'Ext.Component',

        childEls: ['inputEl', 'imageEl'],

        width: 175,
        height: 30,
        margin: '6 0 0 0',

        initComponent: function ()
        {
            this.renderTpl =
            [
                '<div class="hBoxLayout bubbleForPresenceState">',
                    '<img id="{id}-imageEl" data-ref="imageEl" src="' + IMAGE_LIBRARY.getImage('edit', 64, NEW_GREY) + '" style="cursor:pointer;height: 12px; width: 12px; margin: 8px 6px 0 8px;" />',
                    '<div style="border: none;text-align: center;padding-top: 4px;">',
                        '<input id="{id}-inputEl" data-ref="inputEl" style="background-color:white;text-align:left;border: none !important" type="text" />',
                    '</div>',
                '</div>'
            ];
            this.callParent();

            this.on('boxready', function ()
            {
                this.hide();
                this.updatePresenceText(LANGUAGE.getString('unknownPresenceState'));

                SESSION.addListener(this);

                var self = this;
                this.imageEl.dom.onclick = function ()
                {
                    self.inputEl.el.dom.select();
                };

                this.inputEl.dom.onblur = function (item)
                {
                    if (item.srcElement)
                    {
                        item = item.srcElement;
                    }
                    else if (item.target)
                    {
                        item = item.target;
                    }

                    var newPresenceText = item.value;

                    self.savePresenceText(newPresenceText);
                };

            }, this);
        },

        destroy: function ()
        {
            SESSION.removeListener(this);
            this.callParent();
        },

        savePresenceText: function (value)
        {
            if (!isValidString(value))
            {
                return;
            }
            
            var presenceState = MY_CONTACT.getPresenceStateWithoutOnPhone();

            if (presenceState === PresenceState.Available.value)
            {
                SESSION.configuration.setPresentText(value);
            }
            else if (presenceState === PresenceState.NotAvailable.value)
            {
                SESSION.configuration.setAbsentText(value);
            }
            else if (presenceState === PresenceState.Break.value)
            {
                SESSION.configuration.setPauseText(value);
            }
            else if (presenceState === PresenceState.DnD.value)
            {
                SESSION.configuration.setDontDisturbText(value);
            }
            else
            {
                SESSION.configuration.setOfflineText(value);
            }

            var doneFct = function (result)
            {
                if (result.getReturnValue().getCode() !== 0)
                {
                    showErrorMessage(result.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            };

            var failFct = function ()
            {
                showErrorMessage(LANGUAGE.getString("errorSetPresenceText"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            };

            SESSION.saveConfiguration(SESSION.configuration, doneFct, failFct);
        },

        onNewEvents: function (response)
        {
            if (isValid(response, 'getOwner().getText()'))
            {
                this.updatePresenceText(response.getOwner().Text);
            }

            if (CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe())
            {
                this.hide();
            }
            else
            {
                this.show();
            }
        },

        onSetPresenceStateSuccess: function (response, state, text, force)
        {
            if(response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
            {
                var presenceText = text;
                if (!isValidString(presenceText))
                {
                    presenceText = getEnumForPresenceState(state).text;
                }
                this.updatePresenceText(presenceText);
            }
        },

        updatePresenceText: function (text)
        {
            if (!this.isStateOk())
            {
                return;
            }
            if (text === this.lastText)
            {
                return;
            }

            this.lastText = text;
            this.inputEl.dom.value = text;

            var presenceState = getEnumForPresenceState(MY_CONTACT.getPresenceStateWithoutOnPhone());
            if (presenceState === PresenceState.Unknown)
            {
                this.inputEl.dom.style.color = NEW_GREY;
                this.inputEl.dom.style.fontStyle = 'italic';
                this.inputEl.dom.disabled = true;

                this.imageEl.dom.style.cursor = 'default';
            }
            else
            {
                this.inputEl.dom.style.color = presenceState.color;
                this.inputEl.dom.style.fontStyle = 'normal';
                this.inputEl.dom.disabled = false;

                this.imageEl.dom.style.cursor = 'pointer';
            }
        }
    });