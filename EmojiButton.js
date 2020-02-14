Ext.define('EmojiButton',
{
    extend: 'Ext.Component',

    childEls: ['emojiEl'],

    height: 32,

    initComponent: function ()
    {
        this.style = 'filter: grayscale(100%);opacity: 0.7;';

        this.renderTpl = [
            '<div id="{id}-emojiEl" data-ref="emojiEl" style="margin:6px 0 0 3px;cursor:pointer;filter: grayscale(100%);opacity: 0.7;">😃</div>'
        ];
        this.callParent();

        var tooltip = Ext.create('Ext.tip.ToolTip',
            {
                html: '<div style="border-radius:25px;margin:5px 15px">' +
                        '<span>' + LANGUAGE.getString("emojiHelpTitle") + '</span>' +
                        this.createEntry('Chrome:', LANGUAGE.getString("emojiChrome")) + 
                        this.createEntry('Windows:', LANGUAGE.getString("emojiWindows")) + 
                        this.createEntry('MacOS:', LANGUAGE.getString("emojiMacOs")) + 
                        
                    '</div>'
            });

        this.on('boxready', function ()
        {
            this.emojiEl.on('click', function ()
            {
                tooltip.showBy(this.emojiEl);
            }, this);
        }, this);

        this.on('destroy', function ()
        {
            tooltip.destroy();
        }, this);
    },

    createEntry: function (title, text)
    {
        return '<p style="margin:10px 0 0 0">' +
            '<strong>' + title + '</strong>' +
            '<div>' + text + '</div>' +
            '</p> ';
    }
});