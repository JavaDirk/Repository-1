var MY_CONTACT = {};
var DEVICEMANAGER;

Ext.application(
{
    name: 'timio',
    requires: ['Ext.Responsive'],

	launch : function ()
	{
        try
        {
            APPLICATION = new TimioApplication();
            
            WEBRTCAVAILABLE = WebRtc.check();
            if (WEBRTCAVAILABLE)
            {
                DEVICEMANAGER = WebDevice.createManager();
            }   

            window.onbeforeunload = function (ev)
            {
                CURRENT_STATE_CHATS.onBeforeUnload();

                sessionStorage.clear();
                
                if (isValid(VIEWPORT, 'conversationsTabPanel.checkClosingMessages()'))
                {
                    var result = VIEWPORT.conversationsTabPanel.checkClosingMessages();


                    if (isValidString(result))
                    {
                        return ev.returnValue = result;
                    }
                    else 
                    {
                        SESSION.logout(true, true);
                    }
                }
                
            };

            VIEWPORT = Ext.create('ViewportForTimio', { deviceManager: DEVICEMANAGER });
        }
        catch (exception)
        {
            console.log(exception);
        }
    }
});
