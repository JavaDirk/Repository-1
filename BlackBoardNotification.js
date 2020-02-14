Ext.define('BlackBoardNotification',
{
    extend: 'TeamChatNotification',

    createTitle: function ()
    {
        return LANGUAGE.getString("newBlackBoardMessage");
    }
});