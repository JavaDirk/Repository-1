
Ext.define('ShortcutModel', {
    extend: 'Ext.data.Model',
    fields: [

        {
            name: 'Text', type: 'string' 
        },
        {
            name: 'Shortcut', type: 'string'
        },
        {
            name: 'DisplayName', type: 'string'
        },
        {
            name: 'Category', type: 'string'
        },
        {
            name: 'Source', type: 'string'
        },
        {
            name:'oldText', type: 'string'
        },
        {
            name:'oldShortcut', type: 'string'
        },
        {
            name: 'oldDisplayName', type: 'string'
        },
        {
            name:'oldCategory', type:'string'
        }
    ]
});

Ext.define('CategoryModel', {
    extend: 'Ext.data.Model',

    fields: [{
        name: 'Category', type:'string'
    }]

});

Ext.define('categoryStore',{
    extend: 'Ext.data.Store',
    model:'CategoryModel'
    
});


Ext.define('ShortcutStore', {
    extend: 'Ext.data.Store',
    model: 'ShortcutModel',

    constructor: function ()
    {
        this.callParent(arguments);

        var self = this;

        this.setSorters(
            [
                {
                    sorterFn: function (record1, record2)
                    {   
                        var sortVariable1 = self.getSortVariable(record1);
                        var sortVariable2 = self.getSortVariable(record2);

                        return sortVariable1.localeCompare(sortVariable2);   
                    }
                }
            ]);
    },

    getSortVariable: function (record)
    {
        return getFirstValidString([record.data.DisplayName, record.data.Shortcut, record.data.Text]);
    },


    // spliten des String(#)--> ersetzen des hashtags
    // zeichen für ausnahmen (zb. #a.)

    replaceAllShortcuts: function (value)
    {
        var sortedRecords = this.getDESCSortedRecords();

        var valueParts = value.split('#');
        for (var x = 1; x < valueParts.length; x++)
        {
            valueParts[x] = '#' + valueParts[x];        //# sind nötig, um nur am Anfang Kürzel zu finden und nicht in der Mitte
            Ext.each(sortedRecords, function (record)
            {
                if (record.data.Shortcut !== '')
                {
                    if (valueParts[x].toUpperCase().indexOf('#' + record.data.Shortcut.toUpperCase()) === 0)
                    {
                        valueParts[x] = record.data.Text + valueParts[x].substring(record.data.Shortcut.length + 1);
                    }
                }
            });
        }
        return valueParts.join('');
    },

    getDESCSortedRecords: function ()
    {
        var clonedStore = Ext.create(Ext.data.Store, {//clonedstore: kopierem zum sortieren, um richtiges Einsetzen zu gewährleisten, ohne den View zu verändern
            model: 'ShortcutModel'
        });
        this.each(function (record)
        {
            clonedStore.add(record);
        });
        clonedStore.sort('Shortcut', 'DESC');
        var sortedRecords = [];
        clonedStore.each(function (record)
        {
            sortedRecords.push(record);
        });
        return sortedRecords;
    },

    existsRecordWithText: function (value, Id)
    {
        return this.existsRecordWithAttribute("Text", value, Id);
    },

    existsRecordWithShortcut: function (value, Id)   
    {
        return this.existsRecordWithAttribute("Shortcut", value, Id);
    },

    existsRecordWithAttribute: function (attributeName, value, Id)
    {
        return !!this.getRecordWithAttribute(attributeName, value, Id);
    },

    getRecordWithAttribute: function (attributeName, value, Id)
    {
        if (attributeName === 'Shortcut' && value === '')
        {
            return true;
        }
        if (value === '')
        {
            return null;
        }
        var resultRecord;
        this.each(function (record)
        {

            if (record.data[attributeName].toUpperCase() === value.trim().toUpperCase() && record.data.Id !== Id)
            {
                resultRecord = record;
                return false;
            }
        });
        return resultRecord;
    },

    onAdd: function () {

    }
});

Ext.define('textShortcutDialog', {
    extend: 'ModalDialog',
    enableKeyEvents: true,
  
    initComponent: function ()
    {
        this.titleText = LANGUAGE.getString("newShortmessage");
        this.callParent();
        var self = this;
        
        this.textfeld = Ext.create('Ext.form.field.Text', {

            enableKeyEvents: true,
            flex: 1,
            height: 50,
            emptyText: LANGUAGE.getString('textmessage'),
            listeners: {
                specialkey: function (field, e)
                {
                    if (e.getKey() === e.ENTER)
                    {
                        self.Shortcutfeld.focus();
                    }
                    if (e.getKey() === e.ESC)
                    {
                        self.hide();
                    }
                },

                change: function ()
                {
                    self.setGeneratedShortcut();
                }
            }
        });

        this.Shortcutfeld = Ext.create('Ext.form.field.Text', {
            enableKeyEvents: true,
            flex: 0.65,
            //height: 50,
            margin: '0 0 0 0',
            emptyText: LANGUAGE.getString('shortcut') + " (" + LANGUAGE.getString("optional") + ")",
            listeners: {
                specialkey: function (field, e) {
                    if (e.getKey() === e.ENTER)
                    {
                        self.displayNameField.focus();
                    }
                    else if (e.getKey() === e.ESC) {
                        self.hide();
                    }
                }
            }
        });

        this.shortcutInfoImg = Ext.create('Ext.Img', {
            src: IMAGE_LIBRARY.getImage('info', 64, NEW_GREY),
            height: 17,
            width: 17,
            margin:'10 8 0 9'
        });

        this.shortcutInfoContainer = Ext.create('ErrorMessageComponentForDialogs', {
            height: 36,
            padding: '0px 0px 0px 0px',
            margin: '0 0 0 0',
            errorType: ErrorType.Info
        });

        this.displayNameField = Ext.create('Ext.form.field.Text',
        {
            enableKeyEvents: true,
            flex: 1,
            height: 50,
            emptyText: LANGUAGE.getString('displayName') + " (" + LANGUAGE.getString("optional") + ")",
            listeners: {
                specialkey: function (field, e)
                {
                    if (e.getKey() === e.ENTER)
                    {
                        self.categoryField.focus();
                    }
                    if (e.getKey() === e.ESC)
                    {
                        self.hide();
                    }
                }
            }
            });

        this.store = Ext.create('categoryStore');

        this.store.add(CURRENT_STATE_CHATS.getCategories().map(function (category) {
            return {Category: category};
        }));

        this.categoryField = Ext.create('Ext.form.field.ComboBox',
        {
            margin: '0 0 25 0',
            store:this.store,
            emptyText: LANGUAGE.getString('category'),
            displayField: 'Category',
            valueField: 'Category',
            queryMode: 'local',
            listeners: {
                specialkey: function (field, e) {
                    if (e.getKey() === e.ENTER) {
                        self.beforeSaveRecord();
                    }
                    else if (e.getKey() === e.ESC) {
                        self.hide();
                    }

                },
                boxready: function () 
                {
                    this.setValue(CLIENT_SETTINGS.getSetting('CHAT', 'focusedCategoryTab'));
                }
            }            
        });

        var shortcutAndInfoContainer = Ext.create('Ext.container.Container', {
            height:50,
            layout: { type: 'hbox' },
            items:
            [
                this.Shortcutfeld,
                this.shortcutInfoImg
            ]
        });
        
        this.addToBody(this.textfeld);
        this.addToBody(shortcutAndInfoContainer);
        this.addToBody(this.displayNameField);
        this.addToBody(this.categoryField);

       this.on('boxready', function ()
       {
            SESSION.addListener(this); 
            
            Ext.create('Ext.tip.ToolTip', {
               target: self.textfeld.getEl(),
               html: LANGUAGE.getString('textmessage'),
               listeners:
               {
                    beforeshow: function ()
                    {
                       if (self.textfeld && self.textfeld.getValue() === '') {
                           return false;
                       }
                   }
               }
           });

           Ext.create('Ext.tip.ToolTip', {
               target: self.Shortcutfeld.getEl(),
               html: LANGUAGE.getString('shortcut'),
               listeners: {
                   beforeshow: function ()
                   {
                       if (self.Shortcutfeld && self.Shortcutfeld.getValue() === '')
                       {
                           return false;
                       }
                   }
               }
           });

           Ext.create('Ext.tip.ToolTip', {
               target: self.displayNameField.getEl(),
               html: LANGUAGE.getString('displayName'),
               listeners: {
                   beforeshow: function ()
                   {
                       if (self.displayNameField && self.displayNameField.getValue() === '')
                       {
                           return false;
                       }
                   }
               }
           });

           Ext.create('Ext.tip.ToolTip', {
               target: self.categoryField.getEl(),
               html: LANGUAGE.getString('category'),
               listeners: {
                   beforeshow: function () {
                       if (self.displayNameField && self.displayNameField.getValue() === '') {
                           return false;
                       }
                   }
               }
           });

           Ext.create('Ext.tip.ToolTip', {
               target: self.shortcutInfoImg.getEl(),
               html: LANGUAGE.getString('shortcutInformation')
           });

           var savebutton = Ext.create('RoundThinButton',
               {
                   text: LANGUAGE.getString('save'),
                   handler: function () {
                       self.beforeSaveRecord();
                   }
               });

           this.addButton(savebutton);
        });

        this.on('destroy', function () {
            SESSION.removeListener(this);
        });
    },

    textValidator: function (str)
    {
        if (str.trim() === '')
        {
            return LANGUAGE.getString('emptyFieldError');
        }
        if (str.match('#'))
        {
            return LANGUAGE.getString('fieldContainsError', '#');
        }
        if (this.existsRecordWithText(str))
        {
            return LANGUAGE.getString("textAlreadyExistError");
        }
        return "";
    },

    ShortcutValidator: function (str)
    {
        if (str === '')
        {
            return "";
        }
        if (str.trim() === '')
        {
            return LANGUAGE.getString('fieldNoValidCharacterError');
        }
        if (str.match('#'))
        {
            return LANGUAGE.getString('fieldContainsError','#');
        }
        if (str.match('<'))
        {
            return LANGUAGE.getString('fieldContainsError','<');
        }
        if (this.existsRecordWithShortcut(str))
        {
            return LANGUAGE.getString("shortcutAlreadyExistError");
        }
        return "";
    },

    existsRecordWithText: function (value)
    {

    },

    existsRecordWithShortcut: function (value)   
    {

    },

    beforeSaveRecord: function ()
    {
        var textfieldValidation = this.textValidator(this.textfeld.getValue());
        var shortCutValidation = this.ShortcutValidator(this.Shortcutfeld.getValue());
        if (isValidString(textfieldValidation))
        {
            this.changeErrorMessage(textfieldValidation, ErrorType.Info);
            Ext.asap(() =>
            {
                this.textfeld.focus();
            });
        }
        else if (isValidString(shortCutValidation))
        {
            this.changeErrorMessage(shortCutValidation, ErrorType.Info);
            Ext.asap(() =>
            {
                this.Shortcutfeld.focus();
            });
        }
        else
        {
            this.saveChatTextBlock();
        }
    },

    setGeneratedShortcut: function (Text)
    {
        var newShortcut = '';
        var letterNumber = /^[\u00C0-\u02A0\u1D00-\u1EFFa-zA-Z']?$/;
        textParts = this.textfeld.getValue().trim().split(' ');
        Ext.each(textParts, function (str)
        {
            if (str.charAt(0) !== null && str.charAt(0).match(letterNumber))
            {
                newShortcut += str.charAt(0);
            }
        });
        this.Shortcutfeld.setValue(newShortcut.slice(0, 5));
    },

    setCategoryField: function (value) {
        if (isValidString(value)) {
            this.categoryField.setValue(value);
        }
    }
});

Ext.define('editTextShortcutDialog', {
    extend: 'textShortcutDialog',
    titleText: LANGUAGE.getString("editShortmessage"),
    record: null,

    initComponent: function ()
    {
        this.callParent();

        if (this.record)
        {
            this.setKürzel(this.record.data.Shortcut);
            this.setTextfeld(this.record.data.Text);
            this.setDisplayName(this.record.data.DisplayName);
            this.setCategoryField(this.record.data.Category);
        }

        this.on('show', function ()
        {
            Ext.asap(() =>
            {
                this.textfeld.focus();
                this.textfeld.inputEl.dom.selectionStart = this.textfeld.inputEl.dom.selectionEnd = this.textfeld.getValue().length;
            });
        });
    },

    setGeneratedShortcut: function ()
    {

    },
    
    existsRecordWithText: function (value)
    {

    },

    existsRecordWithShortcut: function (value)
    {

    },

    setKürzel: function (value)
    {
        this.Shortcutfeld.setValue(value);
    },

    setTextfeld: function (value) {
        if (isValidString(value)) {
            this.textfeld.setValue(value);
        }
    },

    setDisplayName: function (value)
    {
        if (isValidString(value)){
            this.displayNameField.setValue(value);
        }
    },


    saveChatTextBlock: function ()
    {
        if (!this.record)
        {
            return;
        }

        var category = this.categoryField.getRawValue().trim();
        var isNewCategory = !CURRENT_STATE_CHATS.doesCategoryExist(category);

        this.record.data.oldText = this.record.data.Text;
        this.record.data.oldShortcut = this.record.data.Shortcut;
        this.record.data.oldDisplayName = this.record.data.DisplayName;
        this.record.data.oldCategory = this.record.data.Category;
        this.record.set('Text', this.textfeld.getValue());
        this.record.set('Shortcut', this.Shortcutfeld.getValue().trim());
        this.record.set('DisplayName', this.displayNameField.getValue().trim());
        this.record.set('Category', category);
        this.record.data.Source = 0; // musste auf null gesetzt werden, da der Store ihm einen Source zugewiesen hat

        SESSION.updateChatTextBlock(this.record.data, isNewCategory);
        this.hide(); 
    }
});

Ext.define('newTextShortcutDialog', {
    extend: 'textShortcutDialog',

    initComponent: function () {
        this.callParent();

        this.on('boxready', function () {
            Ext.asap(() => 
            {
                this.textfeld.focus();
            }, this);
        }, this);

        this.anotherTextBlockCheckbox = this.addButton(this.newTextblockCheckbox());
    },

    getMarkedText: function () {

    },

    newTextblockCheckbox: function () {
        return Ext.create('Ext.form.field.Checkbox',
        {
            boxLabel: LANGUAGE.getString('anotherTextblock'),
            checked: false,
            flex: 1
        });
    },

    saveChatTextBlock: function ()
    {
        var displayName = getFirstValidString([this.displayNameField.getValue(), this.textfeld.getValue()]);
        
        var chatTextBlock = {
            Shortcut: this.Shortcutfeld.getValue().trim(),
            Text: this.textfeld.getValue(),
            Category: this.categoryField.getRawValue().trim(), 
            Source: Caesar.ChatTextBlockSource.User,
            DisplayName: displayName
        };

        var isNewCategory = !CURRENT_STATE_CHATS.doesCategoryExist(chatTextBlock.Category);
        SESSION.addChatTextBlock(chatTextBlock, isNewCategory);
        if (this.shouldCreateAnotherTextBlock())
        {
            this.reset();
        }
        else
        {
            this.hide();
        }
    },

    listeners:
    {
        show: function () 
        {
            this.textfeld.setValue(this.getMarkedText());
        }
    },

    reset: function () {
        this.Shortcutfeld.setValue('');
        this.textfeld.setValue('');
        this.displayNameField.setValue('');
        this.anotherTextBlockCheckbox.setValue(false);
    },

    onAddChatTextBlockException: function ()//todo: unnötig?--> in andere klasse schreiben
    {
        showErrorMessage(LANGUAGE.getString("errorAddChatTextBlock"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    existsRecordWithText: function (value)
    {

    },

    existsRecordWithShortcut: function (value)
    {

    },

    shouldCreateAnotherTextBlock: function () {
          return this.anotherTextBlockCheckbox.getValue();
    }
});

Ext.define('ShortcutView',
{
    extend: 'Ext.view.View',
    cls: 'shortCutView',
    flex: 1,    
    emptyText: '<div style="padding-left:20px;background:' + CHAT_BACKGROUND_COLOR + ';color:' + NEW_GREY + ';font-size:' + FONT_SIZE_TITLE + 'px">' + LANGUAGE.getString('noChatTextBlocks') + '</div>',
    deferEmptyText: false,
    initComponent: function ()
    {
        var self = this;
        this.store = Ext.create('ShortcutStore');
        this.itemSelector = 'div.thumb-wrap';
        this.tpl = new Ext.XTemplate(
            '<div style="flex-direction:row; display:flex; flex-wrap:wrap; padding:10px 0px 0 0; max-height:150px;overflow-y:auto; background-color:' + CHAT_BACKGROUND_COLOR + ';background:'+CHAT_BACKGROUND_COLOR+'">',
                '<tpl for=".">',
                    '<div class="thumb-wrap textBaustein" style="cursor:pointer;align-items:center;justify-content:space-between;display:flex;flex-direction:row;margin-left:10px;margin-bottom:10px;padding:5px 5px 5px 10px;min-width:90px;border-radius:20px; background-color:' + COLOR_MAIN_2 +';">',
                        '<div style="flex: 1;text-align:center;max-width:200px;color:white; white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">',
                        '<tpl if="isValidString(DisplayName)">',
                            '{DisplayName:htmlEncode}',
                        '<tpl elseif="isValidString(Shortcut)">',
                            '{Shortcut:htmlEncode}',
                        "<tpl else>",
                          '{Text:htmlEncode}',
                        "</tpl>",
                        '</div>',
                        '<div style="display:flex; flex-direction:row; margin-left: 10px;margin-right:5px">',
                            '<div class="containerImage editImage" style="margin:1px 2px 0px 0px;width:14px; height: 14px; background-size: contain;background-image:url(' + IMAGE_LIBRARY.getImage("edit", 64, WHITE) +'"></div>',
                            '<div class="containerImage deleteImage" style="margin:1px 0px 0px 2px;width:16px; height: 16px; background-size: contain;background-image:url(' + IMAGE_LIBRARY.getImage("remove", 64, WHITE) + '"></div>',
                        '</div>',
                    '</div>',
                '</tpl>',
            '</div>',
        );
        this.callParent();

        this.on('boxready', function () {
            SESSION.addListener(this);
        });

        this.on('destroy', function () {
            SESSION.removeListener(this);
        });

        this.on('boxready', function () 
        {   
            
            var delegateEditImage = '.editImage';
            var delegateDeleteImage = '.deleteImage';
            var mouseInTooltip = false;

            Ext.create(Ext.tip.ToolTip, {
                showDelay: 1000,
                hideDelay: 500,
                delegate: '.thumb-wrap',
                maxHeight: '700',
                scrollable: 'vertical',
                target: this.el,
                focusable: true,
                anchor: 'bottom',
                listeners:
                {
                    beforeshow: function (tooltip) 
                    {
                        //verhindern, dass ein Tooltip angezeigt wird, wenn wir über einem Button  (edit, delete) hovern
                        var selector = delegateEditImage + ", " + delegateDeleteImage;
                        if (isValid(tooltip, "pointerEvent.target") && tooltip.pointerEvent.target.matches(selector))
                        {
                            return false;
                        }
                        
                        var record = self.getRecord(tooltip.triggerElement);
                        if (!isValid(record)) 
                        {
                            return false;
                        }

                        var bubbleIsEclipsed = isValid(tooltip, "triggerElement.firstChild") && self.isOverflowing(tooltip.triggerElement.firstChild);

                        var createDivForKeyValuePair = function (key, value)
                        {
                            return '<div style="display:flex"><div style="width:100px;font-weight:500;color:' + COLOR_MAIN + '">' + key + ':</div><div style="flex:1">' + Ext.String.htmlEncode(value) + '</div></div>';
                        };

                        var html = '<div style="display:flex;flex-direction:column">';
                        html += createDivForKeyValuePair(LANGUAGE.getString("textmessage"), record.data.Text);
                        if (isValidString(record.data.Shortcut))
                        {
                            html += createDivForKeyValuePair(LANGUAGE.getString("shortcut"), record.data.Shortcut);
                        }
                        if (bubbleIsEclipsed && isValidString(record.data.DisplayName))
                        {
                            html += createDivForKeyValuePair(LANGUAGE.getString("displayName"), record.data.DisplayName);
                        }
                        
                        html += '</div>';

                        tooltip.setHtml(html);
                        return true;
                    },

                    beforehide: function () {
                        if (mouseInTooltip === true) {
                            return false;
                        }
                    },

                    afterrender: function () {
                        var self = this;
                        this.getEl().on('mouseenter', function () {
                            mouseInTooltip = true;
                        });

                        this.getEl().on('mouseleave', function () {
                            mouseInTooltip = false;
                            setTimeout(function () { self.hide(); }, 200);
                        });
                    }
                }
            });

            Ext.create(Ext.tip.ToolTip, {
                showDelay: 750,
                hideDelay: 200,
                delegate: delegateEditImage,
                target: this.el,
                html: LANGUAGE.getString("editShortmessage")
            });

            Ext.create(Ext.tip.ToolTip, {
                showDelay: 750,
                hideDelay: 200,
                delegate: delegateDeleteImage,
                target: this.el,
                html: LANGUAGE.getString("deleteShortmessage")
            });

            this.el.on('click', function (event, node) {
                this.openEditDialog(event.record);
            }, this, { delegate: delegateEditImage });

            this.el.on('click', function (event, node)
            {
                var confirmation = new ConfirmationComponent(
                    {
                        margin: '10',
                        yesCallback: () =>
                        {
                            SESSION.deleteChatTextBlock(event.record);
                        },
                        noCallback: Ext.emptyFn,
                        errorMessageText: LANGUAGE.getString("reallyDeleteTextBlock", event.record.data.DisplayName),
                        borderWidth: 1,
                        errorType: ErrorType.Info
                    });
                this.showConfirmation(confirmation);
            }, this, { delegate: delegateDeleteImage });

            this.el.on('click', function (event, node)
            {
                var selector = delegateEditImage + ", " + delegateDeleteImage;
                if (isValid(event, "browserEvent.target") && event.browserEvent.target.matches(selector)) //hier hat jemand auf edit oder delete geklickt
                {
                    return;
                }
                this.insertTextInChat(event.record.data.Text);
            }, this, { delegate: '.thumb-wrap' , buffer:200 });


        }, this);
    },

    isOverflowing: function (element)
    {
        return element && element.scrollWidth > element.clientWidth;
    },
    
    onDeleteChatTextBlockSuccess: function (response, textBlock) {
        if (response.getReturnValue().getCode() !== 0) {
            this.getStore().add(textBlock);
            showErrorMessage(response.returnValue.Description, DEFAULT_TIMEOUT_ERROR_MESSAGES, 43282498945842);
        }
        else if (this.store.contains(textBlock)) {
            this.store.remove(textBlock);
            if (this.store.getCount() === 0) {
                this.destroy();
            }
        }
    },

    onDeleteChatTextBlockException: function () {
        showErrorMessage(LANGUAGE.getString("errorDeleteChatTextBlock"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    onAddChatTextBlockSuccess: function (response, textBlock, isNewCategory) {
        if (response.getReturnValue().getCode() === 0) {
            this.getStore().add(textBlock);
            this.refresh();
        }
        else
        {
            showErrorMessage(response.returnValue.Description, DEFAULT_TIMEOUT_ERROR_MESSAGES);//todo:errormessages von einem objekt aufrufen,den es nur einmal gibt ;
        }
    },

    onAddChatTextBlockException: function () {
        showErrorMessage(LANGUAGE.getString("errorAddChatTextBlock"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },
    
    setFilterByCategory: function (name) 
    {
        this.store.filterBy(function (record)
        {
            return record.data.Category === name;
        });
    },

    onUpdateChatTextBlockSuccess: function (response, textBlock, isNewCategory) {

        if (response.getReturnValue().getCode() === 0)
        {
            if (textBlock.Category === this.category)
            {
                this.refilter();
            }
            if (this.store.getCount() === 0)
            {
                this.destroy();
            }
        }
        else {
            textBlock.Text = textBlock.oldText;
            textBlock.Shortcut = textBlock.oldShortcut;
            textBlock.DisplayName = textBlock.oldDisplayName;
            textBlock.Category = textBlock.oldCategory;
            showErrorMessage(response.returnValue.Description, DEFAULT_TIMEOUT_ERROR_MESSAGES, 8394792489023);
        }
    },

    refilter: function ()
    {
        this.store.clearFilter();
        this.setFilterByCategory(this.category);
    },

    onUpdateChatTextBlockException: function () {
        showErrorMessage(LANGUAGE.getString("errorUpdateChatTextBlock"), DEFAULT_TIMEOUT_ERROR_MESSAGES);//todo: können hier auch mehrere exceptions gworfen werden?
    },

    insertTextInChat: function (Text)
    {

    },

    existsRecordWithText: function (value, Id)
    {
        return this.store.existsRecordWithText(value, Id);
    },

    existsRecordWithShortcut: function (value, Id)
    {
        return this.store.existsRecordWithShortcut(value, Id);
    },

    openEditDialog: function (record)
    {
        if (!record || !record.data)
        {
            return;
        }
        var self = this;
        var editDialog = Ext.create('editTextShortcutDialog',
            {
                record: record,
                
                existsRecordWithText: function (value)
                {
                    return self.existsRecordWithText(value, record.data.Id);
                },

                existsRecordWithShortcut: function (value)
                {
                    return self.existsRecordWithShortcut(value, record.data.Id);
                }
            });
        
        editDialog.show();
    },

    replaceAllShortcuts: function (value)
    {
        return this.store.replaceAllShortcuts(value);
    },

    sortStoreASC: function ()
    {
        this.sortByAttribute('ASC');
    },

    sortStoreDESC: function ()
    {
        this.sortByAttribute('DESC');
    },

    sortByAttribute: function (bySortAttribute)
    {
        this.store.sort('Shortcut', bySortAttribute);
    },

    isValidString: function (str)
    {
        return str !== "";
    },

    showConfirmation: function (confirmation)
    {

    },

    onAdd: function()
    {

    }
});

Ext.define('shortcutGroupTabPanel', {
    extend: 'Ext.tab.Panel',

    border: false,
    
    initComponent: function () 
    {
        this.callParent();
        var self = this;
        this.categories = CURRENT_STATE_CHATS.getCategories();
        this.categories.forEach(function (category) {
            self.addFilteredView(category);
        });
        this.removeViewWithoutCategoryIfNecessary();

        this.on('boxready', function () {
            SESSION.addListener(this);

            this.reverseEach(function (item)
            {
                this.setActiveTab(item);
            }, this);
            
        });
    },

    listeners:
    {
        boxready: function () {
            //CURRENT_STATE_CHATS.getChatTextBlocks();
            this.on('add', function (tabpanel, newTab, index, eOpts) {
                tabpanel.setActiveTab(newTab);
            });
            if (this.items.items.length === 0) {
                this.addFilteredViewForNoCategory();
            }
        },

        destroy: function () {
            SESSION.removeListener(this);
        },
        tabchange: function (tabPanel, newTab, oldTab) {
            CLIENT_SETTINGS.addSetting('CHAT', 'focusedCategoryTab', newTab.category);
            CLIENT_SETTINGS.saveSettings();
        }
    },

    addFilteredViewForNoCategory: function ()
    {
        var filteredView = this.createFilteredViewWithTextblocks("");
        this.insert(0, filteredView);
    },

    addFilteredView: function (category)
    {
        if (!isValidString(category))
        {
            this.addFilteredViewForNoCategory();
            return;
        }
        var filteredView = this.createFilteredViewWithTextblocks(category);
        this.add(filteredView);
    },

    createFilteredViewWithTextblocks: function (category) {
        var self = this;
        var view = Ext.create('ShortcutView', {
            title: category,
            category: category,
            
            insertTextInChat: function (Text) {
                self.insertTextInChat(Text);
            },

            showConfirmation: function (confirmation) {
                self.showConfirmation(confirmation);
            },
        });

        if (category === '') {
            view.title = LANGUAGE.getString('noCategory');
        }

        view.getStore().add(CURRENT_STATE_CHATS.getChatTextBlocks());
        view.setFilterByCategory(category);
        return view;
    },

    showConfirmation: function (confirmation) {

    },

    replaceAllShortcuts: function (value) 
    {
        var replaceShortcutStore = Ext.create('ShortcutStore');
        replaceShortcutStore.add(CURRENT_STATE_CHATS.getChatTextBlocks());
        return replaceShortcutStore.replaceAllShortcuts(value);
    },

    existsRecordWithText: function (value) {
        var exist = false;
        this.items.items.forEach(function (items)
        {
            if (items.existsRecordWithText(value))
            {
                exist = true;
            }
        });
        return exist;
    },

    insertTextInChat: function (Text) {

    },

    existsRecordWithShortcut: function (value) 
    {
        var exist = false;
        this.items.items.forEach(function (items)
        {
            if (items.existsRecordWithShortcut(value))
            {
                exist = true;
            }
        });
        return exist;
    },

    onAddChatTextBlockSuccess: function (response, textBlock, isNewCategory) 
    {
        this.updateTabs(response, textBlock, isNewCategory);
    },

    onUpdateChatTextBlockSuccess: function (response, textBlock, isNewCategory) 
    {
        this.updateTabs(response, textBlock, isNewCategory);
    },

    updateTabs: function (response, textBlock, isNewCategory)
    {
        if (response.getReturnValue().getCode() === 0) 
        {
            if (isNewCategory) 
            {
                this.addFilteredView(textBlock.Category);
                this.removeViewWithoutCategoryIfNecessary();
            }
        }
    },

    removeViewWithoutCategoryIfNecessary: function ()
    {
        this.reverseEach(function (view)
        {
            if (view.category === "" && view.getStore().getCount() === 0 && !Ext.isEmpty(CURRENT_STATE_CHATS.getCategories()))
            {
                view.destroy();
            }
        });
    },

    onDeleteChatTextBlockSuccess: function (response, textBlock) 
    {
        if (response.getReturnValue().getCode() === 0) 
        {
            if (CURRENT_STATE_CHATS.getChatTextBlocks().length === 0) 
            {
                this.addFilteredViewForNoCategory();
            }
        }
    }
});

Ext.define('TextShortcutListContainer', {
    extend: 'Ext.Container',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    style:
    {
        margin: '5px 0 5px 0',
        borderRadius: '10px 10px 0 0',
    },
    border: false, //todo: richtig?

    initComponent: function ()
    {
        this.callParent();
        var self = this;

        GLOBAL_EVENT_QUEUE.addEventListener(this);

       this.optionsButton = Ext.create('ThinButton', {
            
            icon: 'images/64/settings.png',
            changeColorOnHover: false,
            padding: '17 5 0 10',

            handler: function () {
                var settingsMenu = self.createSettingsContent();
                settingsMenu.showBy(this);
            },
        });

        this.shortcutGroupTabPanel = Ext.create('shortcutGroupTabPanel', {
            flex:1,
            insertTextInChat: function (Text) {
                self.insertTextInChat(Text);
            },

            showConfirmation: function (confirmation) {
                self.insert(0, confirmation);
            }
        });
      

        this.add(Ext.create('Ext.container.Container',
        {
            layout:
            {
                type: 'hbox'
            },
            flex: 1,
            items:
            [
                this.shortcutGroupTabPanel,
                this.optionsButton
            ]

        }));

        this.on('beforedestroy', function () {
            GLOBAL_EVENT_QUEUE.removeEventListener(this);
        });
    },

    listeners:
    {
        show: function () {
            CLIENT_SETTINGS.addSetting('CHAT', 'isShortcutGroupTabPanelVisible', true);
            CLIENT_SETTINGS.saveSettings();
        },

        hide: function () {
            CLIENT_SETTINGS.addSetting('CHAT', 'isShortcutGroupTabPanelVisible', false);
            CLIENT_SETTINGS.saveSettings();
        }
    },

    createSettingsContent: function () {
        var insertItems = [];
        var self = this;

        insertItems.push([{
            iconName: 'add',
            text: LANGUAGE.getString('newShortmessage'),
            handler: function ()
            {
                self.openTextShortcutDialog();
            }
        }]);

        if (CURRENT_STATE_CHATS.getChatTextBlocks().length > 0)
        {
            var editMode = self.getEditMode();
            insertItems.push([{
                iconName: 'edit',
                text: LANGUAGE.getString(editMode ? 'leaveEditMode' : 'enterEditMode'),
                handler: function ()
                {
                    Ext.asap(function ()
                    {
                        self.setEditMode(!editMode);
                    });
                },
            }]);
        }
        
        return new CustomMenu({

            highlightFirstMenuItem: false,
            insertItems: insertItems,
            minHeight:5,
        });
    },

    setEditMode: function (editMode) 
    {
        if (editMode)
        {
            this.addCls('editMode');
        }
        else
        {
            this.removeCls('editMode');
        }
        this.editMode = editMode;
    },

    getEditMode: function ()
    {
        return this.editMode || false;
    },

    getMarkedText: function () {

    },

    showConfirmation: function ()
    {

    },

    insertTextInChat: function (Text)
    {

    },

    replaceAllShortcuts: function (value)
    {
        return this.shortcutGroupTabPanel.replaceAllShortcuts(value);
    },

    existsRecordWithText: function (value)
    {
        return this.shortcutGroupTabPanel.existsRecordWithText(value);
    },

    existsRecordWithShortcut: function (value)
    {
        return this.shortcutGroupTabPanel.existsRecordWithShortcut(value);
    },

    onGlobalEvent_ShortcutGroupTabPanelVisibilityChanged: function (visible) {
        this.setVisible(visible);
    },

    showShortCuts: function ()
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_ShortcutGroupTabPanelVisibilityChanged(!this.isVisible());
    },

    openTextShortcutDialog: function () {
        var self = this;
        this.newShortcutDialog = Ext.create('newTextShortcutDialog',
            {
                existsRecordWithText: function (value) {
                    return self.existsRecordWithText(value);
                },

                existsRecordWithShortcut: function (value) {
                    return self.existsRecordWithShortcut(value);
                },

                getMarkedText: function () {
                    return self.getMarkedText();
                },
            });
        this.newShortcutDialog.show();
    }
});

Ext.define('NewShortcutButton', {
    extend: 'RoundThinButton',

    iconName: 'settings',

    initComponent: function ()
    {
        this.text = this.text || LANGUAGE.getString('newShortmessage');
        this.callParent();
    },

    handler: function ()
    {
        this.blur();
        this.openTextShortcutDialog();
    },

    openTextShortcutDialog: function ()
    {
        var self = this;
        this.newShortcutDialog = Ext.create('newTextShortcutDialog',
            {
                existsRecordWithText: function (value)
                {
                    return self.existsRecordWithText(value);
                },

                existsRecordWithShortcut: function (value)
                {
                    return self.existsRecordWithShortcut(value);
                },

                getMarkedText: function () {
                   return self.getMarkedText();
                },
            });
        this.newShortcutDialog.show();
    },

    getMarkedText: function () {

    },

    existsRecordWithText: function (value)
    {
        return self.existsRecordWithText(value);
    },

    existsRecordWithShortcut: function (value)
    {
        return self.existsRecordWithShortcut(value);
    },
});

Ext.define('ShowTextBlocksInDisplayModeButton',
{
    extend: 'ThinButton',
    tooltip: LANGUAGE.getString("showTextBlocks"),
    icon: 'images/64/cubes.png',
    iconName: 'cubes',
    changeColorOnHover: false,
    handler: function ()
    {
        this.shortcutPanel.showShortCuts();
    },
});