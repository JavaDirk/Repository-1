/**
 * Created by jebing on 20.01.2015.
 */
Ext.define('Channel',
{
    createPanel: function (parent, isStartPage)
    {
        return Ext.create(this.getPanelClassName(),
        {
            title: this.getText(),
            parent: parent,
            isStartPage: isStartPage
        });
    },

    getImage: function ()
    {
        return '';
    },

    getText: function ()
    {
        return '';
    },

    getPanelClassName: function ()
    {
        return '';
    },

    getChannelImageClassName: function ()
    {
        return CLASS_CHANNEL_IMAGE;
    },

    convertToMenuItem: function ()
    {
        var self = this;
        return {
            text: this.getText(),
            handler: function ()
            {
                var channelImage = Ext.create(self.getChannelImageClassName(),
                    {
                        channel: self
                    });
                channelImage.onClick();
            }
        };
    }
});