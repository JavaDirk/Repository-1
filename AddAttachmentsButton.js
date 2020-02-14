Ext.define('AddAttachmentsButton',
{
    extend: 'Ext.Component',
    
    childEls: ['badgeEl', 'removeEl', 'addEl', 'lineEl'],

    height: 32,

    cls: 'attachmentsButton',

    style:
    {
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        'align-items': 'center'
    },

    initComponent: function ()
    {
        this.renderTpl = [
            '<div id="{id}-badgeEl" data-ref="badgeEl" class="badge" style="display:none;z-index:1;position:absolute;left:10px;top:-5px;"></div>',
            '<div id="{id}-addEl" data-ref="addEl" style="height:100%;padding:0 5px;width:22px;background-size:16px 16px;background-position:center;background-repeat:no-repeat;background-image:url(' + IMAGE_LIBRARY.getImage('paperclip', 64, DARK_GREY) + ')"></div>',
            '<div id="{id}-lineEl" data-ref="lineEl" style="display:none;height:26px;border-left:1px solid ' + DARK_GREY + '"></div>',
            '<div id="{id}-removeEl" data-ref="removeEl" style="height:100%;display:none;padding:0 5px;width:26px;background-position:center;background-size:16px 16px;background-repeat:no-repeat;background-image:url(' + IMAGE_LIBRARY.getImage('remove', 64, DARK_GREY) + ')"></div>'
        ];
        this.callParent();

        this.files = [];

        var self = this;
        this.addListener(
        {
            el:
            {
                mouseover: function ()
                {
                    self.showDeleteButton();
                },
                mouseout: function ()
                {
                    self.hideDeleteButton();
                },
                contextmenu: function ()
                {
                    if (self.getNumberAttachments() === 0)
                    {
                        return;
                    }
                    var key = self.getNumberAttachments() === 1 ? 'removeAttachment' : 'removeAttachments';
                    this.contextMenu = new CustomMenu({
                        highlightFirstMenuItem: false,
                        insertItems:
                        [
                            {
                                text: LANGUAGE.getString(key),
                                iconName: 'remove',
                                handler: function ()
                                {
                                    self.resetAttachments();
                                }
                            }
                        ]
                    });
                    this.contextMenu.showAt(event.pageX + 5, event.pageY);
                }
            }
        });

        this.on('boxready', function ()
        {
            self.tooltip = Ext.create('Ext.tip.ToolTip',
            {
                target: self.el,
                showDelay: 1000,
                //hideDelay: 0,
                autoHide: true,
                trackMouse: false,
                anchor: 'bottom',
                listeners:
                {
                    beforeshow: function (tip)
                    {
                        if (self.getNumberAttachments() === 0)
                        {
                            return false;
                        }
                        
                        var attachmentNames = Ext.Array.pluck(self.getAttachments(), "name");
                        tip.update(LANGUAGE.getString("chosenAttachments", attachmentNames.join(",<br />")));
                        return true;
                    }
                }
                });

            self.addEl.on('click', function ()
            {
                self.onClick();
            });
            self.removeEl.on('click', function ()
            {
                self.resetAttachments();
            });
        });

        this.on('destroy', function ()
        {
            if (self.tooltip)
            {
                self.tooltip.destroy();
            }
        });
    },

    onFocusTextArea: function ()
    {
        this.addCls('focused');
    },

    onBlurTextArea: function ()
    {
        this.removeCls('focused');
    },

    showDeleteButton: function ()
    {
        if (this.getNumberAttachments() > 0)
        {
            this.lineEl.dom.style.display = 'block';
            this.removeEl.dom.style.display = 'block';
            if (this.onResize)
            {
                this.onResize();
            }
        }
    },

    hideDeleteButton: function ()
    {
        this.lineEl.dom.style.display = 'none';
        this.removeEl.dom.style.display = 'none';
        if (this.onResize)
        {
            this.onResize();
        }
    },

    onClick: function ()
    {
        var self = this;
        var acceptedFileTypes = "";
        var chatConfiguration = CURRENT_STATE_CHATS.getChatConfiguration();
        if (isValid(chatConfiguration, "getAttachmentExtensions()"))
        {
            var extensions = chatConfiguration.getAttachmentExtensions();
            if (!Ext.Array.contains(extensions, "*"))
            {
                acceptedFileTypes = 'accept="';
                Ext.each(extensions, function (extension, index)
                {
                    if (index !== 0)
                    {
                        acceptedFileTypes += ",";
                    }
                    if (extension[0] === ".")
                    {
                        acceptedFileTypes += extension;
                    }
                    else
                    {
                        acceptedFileTypes += "." + extension;
                    }

                });
                acceptedFileTypes += '"';
            }
        }
        else
        {
            return;
        }

        var fileInput = new Ext.Container({
            renderTo: this.el,
            hidden: true,
            margin: '5 0 0 5',
            html: '<input type="file" ' + acceptedFileTypes + ' id="chatAttachments" multiple />',
            listeners:
            {
                afterrender: function ()
                {
                    var filePicker = document.getElementById('chatAttachments');
                    filePicker.click();

                    filePicker.onchange = function ()
                    {
                        if (self.addAttachments(this.files))
                        {
                            filePicker.input = '';
                            filePicker.input = 'file';
                        }
                        fileInput.destroy();

                        self.onAttachmentsChange();
                    };
                }
            }
        });
    },

    onAttachmentsChange: function ()
    {

    },

    getNumberAttachments: function ()
    {
        return this.files.length;
    },

    getAttachments: function ()
    {
        return this.files;
    },

    addAttachments: function (attachments)
    {
        var clonedFiles = [];
        Ext.each(this.files, function (file)
        {
            clonedFiles.push(file);
        });
 
        Ext.each(attachments, function (attachment)
        {
            clonedFiles.push(attachment);
        });

        if (this.checkNumberFilesAndSize(clonedFiles) && this.checkFileTypes(clonedFiles))
        {
            this.files = clonedFiles;
            this.setBadge(this.files.length);
        }
    },

    resetAttachments: function ()
    {
        this.files = [];
        this.resetBadge();
        this.hideDeleteButton();

        this.onAttachmentsChange();
    },

    checkFileTypes: function (files)
    {
        if (!isValid(files))
        {
            return false;
        }
        if (files.length === 0)
        {
            return false;
        }
        var chatConfiguration = CURRENT_STATE_CHATS.getChatConfiguration();
        if (isValid(chatConfiguration))
        {
            if (isValid(chatConfiguration, "getAttachmentExtensions()"))
            {
                var extensions = chatConfiguration.getAttachmentExtensions();
                if (Ext.Array.contains(extensions, "*"))
                {
                    return true;
                }

                var fileNotSupported;
                Ext.each(files, function (file)
                {
                    var extensionFound = false;
                    Ext.each(extensions, function (extension)
                    {
                        if (Ext.String.endsWith(file.name.toLowerCase(), extension.toLowerCase()))
                        {
                            extensionFound = true;
                            return false;
                        }
                    });
                    if (!extensionFound)
                    {
                        fileNotSupported = file.name;
                        return false;
                    }
                });
                if (isValidString(fileNotSupported))
                {
                    this.showErrorMessage(LANGUAGE.getString("fileTypeNotSupported", fileNotSupported, extensions.join(',')));
                    return false;
                }
                else
                {
                    return true;
                }
            }
        }
        return false;
    },

    checkNumberFilesAndSize: function (files)
    {
        if (!isValid(files))
        {
            return false;
        }
        if (files.length === 0)
        {
            return false;
        }
        var maxNumberAttachments = 5;
        var maxSizeAttachments = 50;
        var chatConfiguration = CURRENT_STATE_CHATS.getChatConfiguration();
        if (isValid(chatConfiguration))
        {
            maxNumberAttachments = chatConfiguration.getMaxAttachments();
            maxSizeAttachments = chatConfiguration.getMaxAttachmentSize();
        }
        if (files.length > maxNumberAttachments)
        {
            this.showErrorMessage(LANGUAGE.getString("maxNumberAttachmentsExceeded", maxNumberAttachments));
            return false;
        }

        var sumSize = 0;
        Ext.each(files, function (file)
        {
            sumSize += file.size;
        });

        if (sumSize > maxSizeAttachments * 1024 * 1024)
        {
            this.showErrorMessage(LANGUAGE.getString("sizeAttachmentsExceeded", maxSizeAttachments));
            return false;
        }
        return true;
    },

    showErrorMessage: function (text)
    {
        showErrorMessage(text, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    setBadge: function (text)
    {
        if (!this.badgeEl)
        {
            return;
        }

        if (isValid(this.textNode))
        {
            this.textNode.nodeValue = text;
        }
        else
        {
            this.textNode = document.createTextNode(text);
            this.badgeEl.dom.appendChild(this.textNode);
        }

        if (!isValidString(text) || text === "0")
        {
            this.badgeEl.dom.style.display = 'none';
        }
        else
        {
            this.badgeEl.dom.style.display = 'block';
        }
    },

    resetBadge: function ()
    {
        this.setBadge();
    }
});