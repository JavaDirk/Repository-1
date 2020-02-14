www_caseris_de_CaesarSchema_ChatMessage.prototype.getPreviewTextForAttachments = function ()
{
    if (!isValid(this, 'getAttachments()'))
    {
        return "";
    }

    var numberImages = 0;
    var numberVideos = 0;
    var numberFiles = 0;

    if (isValidString(this.getText()))
    {
        return this.getText();
    }

    Ext.each(this.getAttachments(), function (attachment)
    {
        var mimeType = attachment.getMimeType();
        if (mimeType.indexOf("video/") === 0)
        {
            numberVideos++;
        }
        else if (mimeType.indexOf("image/") === 0)
        {
            numberImages++;
        }
        else
        {
            numberFiles++;
        }
    });

    var result = [];

    if (numberVideos === 1)
    {
        result.push(LANGUAGE.getString("video"));
    }
    else if (numberVideos > 1)
    {
        result.push(LANGUAGE.getString("videos"));
    }
    if (numberImages === 1)
    {
        result.push(LANGUAGE.getString("image"));
    }
    else if (numberImages > 1)
    {
        result.push(LANGUAGE.getString("images"));
    }
    if (numberFiles === 1)
    {
        result.push(LANGUAGE.getString("file"));
    }
    else if (numberFiles > 1)
    {
        result.push(LANGUAGE.getString("files"));
    }

    return result.join(", ");
}; 

www_caseris_de_CaesarSchema_ChatMessage.prototype.getPreviewTextForAttachmentsWithFileNames = function ()
{
    if (isValidString(this.getText()))
    {
        return this.getText();
    }

    var previewText = this.getPreviewTextForAttachments();

    var attachmentNames = Ext.Array.pluck(this.getAttachments(), "displayName");
    var names = Ext.Array.map(attachmentNames, function (str)
    {
        return '"' + str + '"';
    });
    if (!Ext.isEmpty(names))
    {
        previewText += " ( " + names.join(", ") + " )";
    }
    return previewText;
};

www_caseris_de_CaesarSchema_ChatMessage.prototype.isOutgoing = function ()
{
    return this.getDirection() === ChatDirection.Out.value;
};