Ext.application(
{
    name   : 'CAESAR Request Management',
    launch : function () 
    {
        CURRENT_STATE_CHATS = {};

        APPLICATION = new RequestManagementApplication();

        window.onbeforeunload = function (e)
        {
            SESSION.logout(true, true);
        };
        
        VIEWPORT = Ext.create('ViewportForRequestManagement',
        {
                
        });
    }
});