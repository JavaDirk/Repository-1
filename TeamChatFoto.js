Ext.define('TeamChatFoto',
{
    extend: 'Photo',

    getGUID: function ()
    {
        if (isValid(this.teamChat))
        {
            return this.teamChat.getGuid();
        }
        return "";
    },

    getImageUrl: function () {
        if (isValid(this.teamChat)) {
            return this.teamChat.getImageUrl() || "";
        }
        return "";
    },

    getAvatarImageName: function ()
    {
        if (isValidString(this.avatarImageName))
        {
            return this.avatarImageName;
        }
        if (!isValid(this.teamChat)) {
            return "";
        }
        return this.teamChat.getSmallImageName();
    },

    getAvatarColor: function () {
        if (isValid(this.avatarColor)) {
            return this.avatarColor;
        }
        return NEW_GREY;
    },

    onNewEvents: function(response)
    {
        this.callParent(arguments);

        var self = this;
        if (isValid(response.getChangedChatRooms()))
        {
            Ext.each(response.getChangedChatRooms().getChangedInfos(), function (changeInfo)
            {
                if (changeInfo.getChatReceiver().getGuid() === self.getGUID())
                {
                    if (isValid(changeInfo) && changeInfo.getReason() === "Altered")
                    {
                        var alteredChatRoom;
                        Ext.each(response.getChangedChatRooms().getChatRoomInfos(), function (chatRoom)
                        {
                            if (chatRoom.getGuid() === changeInfo.getChatReceiver().getGuid())
                            {
                                alteredChatRoom = chatRoom;
                            }
                        });
                        if (isValid(alteredChatRoom))
                        {
                            self.teamChat = alteredChatRoom;
                            self.updateUI();
                        }
                    }
                }
            });
        }
    }
});