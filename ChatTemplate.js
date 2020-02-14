Ext.define('ChatTemplate',
{
    extend: 'Ext.XTemplate',

    constructor: function (html, config)
    {
        this.callParent(arguments);
    },

    isSizeZero: function (file)
    {
        return this.getFileSize(file) === 0;
    },

    getDisplayFileSize: function (file)
    {
        return formateBytes(this.getFileSize(file));
    },

    getFileSize: function (file)
    {
        if (!file.size && !file._size)
        {
            return 0;
        }
        return file._size || file.size;
    },

    getAuthor: function (values)
    {
        if (values.contact)
        {
            return values.contact.getDisplayNameForLiveChat(LANGUAGE.getString("unknownUser"));
        }
        return values.name || LANGUAGE.getString("unknownUser");
    },

    getUrl: function (values)
    {
        return values.url;
    },

    isDisplayable: function (values)
    {
        if (this.isSizeZero(values))
        {
            return false;
        }
        return isValid(this.getUrl(values));
    },

    isDownloadable: function (values)
    {
        if (this.isSizeZero(values))
        {
            return false;
        }
        var type = this.getMimeType(values);

        var chatConfiguration = CURRENT_STATE_CHATS.getChatConfiguration();
        if (isValid(chatConfiguration) && isValid(type))
        {
            var defaultExtensions = [];
            if (isValid(chatConfiguration, "getWhitelistAttachments()"))
            {
                defaultExtensions = chatConfiguration.getWhitelistAttachments();
            }
            type = type.toLowerCase();
            var splitted = type.split("/");
            if (splitted.length > 1)
            {
                type = splitted[1];
            }
            if (Ext.Array.contains(defaultExtensions, type))
            {
                return false; //ein Image oder pdf wollen wir nicht downloaden, sondern anzeigen
            }
        }

        return true;
    },
    getFileName: function (values)
    {
        return values.name || values.displayName;
    },

    getFullDateAsString: function (chatMessage)
    {
        if (!isValid(chatMessage.fullDate))
        {
            return "";
        }
        return formatTimeString(chatMessage.fullDate);
    },

    getImageURL: function (values, index, parent)
    {
        //ne URL hat das Ding, wenn der Eintrag aus der History kommt
        if (isValidString(values.thumbnailUrl))
        {
            return values.thumbnailUrl;
        }
        if (isValidString(values.url) && (this.isImage(values) || this.isVideo(values) || this.isAudio(values)))
        {
            return values.url;
        }
        if (values.typeMarker === "www_caseris_de_CaesarSchema_ChatAttachment")
        {
            //kommt aus der Historie - wenn values kein typeMarker hat, dann ist es eine gerade ausgewählte Datei
            var recordIndex = this.parentView.getStore().find("id", parent.id);
            var url = this.previewFile(values, ".chatMessage[data-recordindex=\"" + recordIndex + "\"] ." + this.getAttachmentClassName(values, index));
            return url;
        }
    },

    isVideo: function (values)
    {
        return this.getMimeType(values).indexOf('video') !== -1;
    },

    isAudio: function (values)
    {
        return this.getMimeType(values).indexOf('audio') !== -1;
    },

    isImage: function (values)
    {
        return this.getMimeType(values).indexOf('image') !== -1;
    },

    getAttachmentClassName: function (values, xindex)
    {
        return "attachment_" + (xindex - 1);
    },

    showLoading: function (values, parent)
    {
        if (parent.error || isValidString(values.url) || isValidString(values.thumbnailUrl))
        {
            return 'none';
        }
        return 'flex';
    },

    getDisplayNameAndSize: function (fileOrAttachment)
    {
        var name = this.getDisplayName(fileOrAttachment);
        if (!isValidString(name))
        {
            return "";
        }
        var size = fileOrAttachment.size || fileOrAttachment.getSize() || 0;
        if (isValid(size))
        {
            name += " - " + formateBytes(size);
        }
        return name;
    },

    getDisplayName: function (fileOrAttachment)
    {
        var possibleValues = [fileOrAttachment.displayName, fileOrAttachment.name];
        return getFirstValidString(possibleValues);
    },

    getAdditionalStyle: function (values, parent, xindex, xcount)
    {
        var marginRight = "margin-right:";
        if (xindex === xcount)
        {
            marginRight += '0px';
        }
        else
        {
            marginRight += '5px';
        }
        if (parent.error)
        {
            return "background-color:" + RED + ";background-blend-mode: multiply;" + marginRight;
        }
        return marginRight;
    },
    getUserMessageClasses: function(values)
    {
        var classes = [];
        classes.push('chatMessage');
        classes.push('user-message');
        classes.push(values.outgoing ? 'outgoing' : 'incoming');

        var position = this.parentView.getStore().indexOf(values);
        var isAdjacent = false;
        try
        {
            var previousItem = this.parentView.getStore().getAt(position - 1);
            isAdjacent = this.parentView.isAdjacent(values, previousItem.data);
            if (isAdjacent === true)
            {
                classes.push('adjacent');
            }
        } catch (e) { }

        return classes.join(' ');
    },

    previewFile: function (file, selector)
    {
        if (this.isImage(file) || this.isVideo(file) || this.isAudio(file))
        {
            return "";
        }

        var createThumbnailsForAttachments = () =>
        {
            var elements = getHTMLElements(selector, false, this.parentView.el);
                
            Ext.each(elements, function (element)
            {
                this.createThumbnailForNonImage(file, element);
            }, this);
            this.parentView.removeListener("itemadd", createThumbnailsForAttachments, this);
            this.parentView.removeListener("itemupdate", createThumbnailsForAttachments, this);

        };

        //wenn man die History holt, dann kommt man in den itemadd-Fall, wenn ein uploadedAttachment-Event kommt, in den itemupdate-Fall
        this.parentView.addListener('itemadd', createThumbnailsForAttachments, this, { single: true });
        this.parentView.addListener('itemupdate', createThumbnailsForAttachments, this, { single: true });
        
        return "";
    },

    createThumbnailForNonImage: function (file, element)
    {
        if (this.isSizeZero(file))
        {
            return;
        }
        
        var extension = this.getFileExtension(file);
        element.innerHTML = '<div style="display:flex;align-items:center;background-color:white" title="' + this.getDisplayNameAndSize(file) + '">' +
            '<div style="display:flex;align-items:flex-end;width:64px;height:64px;background-position: center center;background-image:url(' + IMAGE_LIBRARY.getImage('file', 64, NEW_GREY) + ')">' +
            '<div class="textThumbnail" style="cursor:inherit;margin:0 0 10px 5px;display:flex;justify-content:center;align-items:center;word-break:break-word"><div style="background-color:' + RED + ';margin-left:15px;text-align:center;font-weight:500;color:white;width:40px;padding:2px 5px 3px;border-radius:3px">' + extension + "</div></div>" +
            '</div></div>';
    },

    getFileExtension: function (file)
    {
        var extension = "";
        var fileName = this.getDisplayName(file);
        if (!isValid(fileName))
        {
            return;
        }
        var parts = fileName.split('.');
        if (parts.length === 1)
        {
            extension = this.getFileExtensionFromMimeType(file) || "&nbsp;";
        }
        else if (parts.length > 1)
        {
            extension = parts[parts.length - 1];
        }
        return extension.toUpperCase();
    },

    getFileExtensionFromMimeType: function (file)
    {
        var mimeType = this.getMimeType(file);
        var mimeTypeParts = mimeType.split("/");
        if (mimeTypeParts.length > 1)
        {
            return mimeTypeParts[1];
        }
        return mimeType;
    },

    getMimeType: function (file)
    {
        return file.mimeType || file.type;
    }
});