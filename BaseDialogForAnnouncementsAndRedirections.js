var ENTER_OWN_TEXT_ID = -2;

Ext.define('BaseDialogForAnnouncementsAndRedirections',
{
    extend: 'ModalDialog',
    
    scrollable: 'vertical',
    groupId: "",


    initComponent: function ()
    {
        this.callParent();

        this.fieldsets = [];
        SESSION.addListener(this);

        var self = this;
        this.saveButton = this.addButton(
        {
            text: LANGUAGE.getString("save"),
            handler: function (button)
            {
                if (self.onSaveButton())
                {
                    self.hide();
                }
            }
        });
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    showUnknownError: function ()
    {
        this.showErrorMessage(LANGUAGE.getString("unknownErrorOccurred"));
    },

    showErrorMessage: function (text)
    {
        showErrorMessage(text, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onSaveSuccess: function (response)
    {
        if (response.getReturnValue().getCode() !== ProxyError.ErrorOK.value)
        {
            this.showErrorMessage(response.getReturnValue().getDescription());
        }
    },

    onSaveException: function ()
    {
        this.showUnknownError();
    },

    createFieldset: function (title)
    {
        var fieldset = Ext.create('Ext.Container',
        {
            margin: '0 5 15 0 5',
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            items:
            [
                Ext.create('Ext.form.Label',
                {
                    style: 'color:' + COLOR_MAIN_2 + ';font-size:' + FONT_SIZE_HEADLINE + 'px',
                    text: title
                })
            ]
        });
        return fieldset;
    },

    createFieldSetWithComboBox: function (storeEntries, disabled, title, textfieldEmptyText)
    {
        if (!isValid(storeEntries))
        {
            return null;
        }
        var self = this;
        var store = Ext.create('Ext.data.Store',
            {
                fields:
                    [
                        "text", "value"
                    ]
            });
        store.add(storeEntries);
        var combobox = Ext.create('Ext.form.field.ComboBox',
            {
                listConfig:
                {
                    getInnerTpl: function ()
                    {
                        return '{text:htmlEncode}';
                    }
                },
                editable: false,
                queryMode: 'local',
                displayField: 'text',
                valueField: 'value',
                enableKeyEvents: true,
                store: store,
                disabled: disabled,
                listeners:
                {
                    boxready: function ()
                    {
                        this.inputEl.setStyle({ cursor: 'pointer' });
                    },

                    change: function (select, value)
                    {
                        if (value === ENTER_OWN_TEXT_ID)
                        {
                            self.showTextField(fieldset);
                        }
                        else
                        {
                            self.hideTextField(fieldset);
                        }
                    }
                }
            });

        var fieldset = this.createFieldset(title);
        fieldset.add(combobox);

        fieldset.combobox = combobox;

        fieldset.textfield = Ext.create(this.classNameForTextfield,
            {
                hidden: true,
                
                margin: '5 0 0 0',
                emptyText: textfieldEmptyText,
                placeHolder: LANGUAGE.getString("announcementText"),
                disabled: disabled,
                listeners:
                {
                    boxready: function ()
                    {
                        this.inputEl.setStyle({ fontSize: FONT_SIZE_MODAL_DIALOG + 'px', lineHeight: 'normal' });
                    },

                    show: function ()
                    {
                        Ext.asap(() =>
                        {
                            fieldset.textfield.focus();
                        });
                    }
                }
            });
        fieldset.add(fieldset.textfield);


        return fieldset;
    },

    showTextField: function (fieldset)
    {
        fieldset.textfield.show();
    },

    hideTextField: function (fieldset)
    {
        fieldset.textfield.hide();
    }
});
