Ext.define('SessionInfoList',
{
    extend: 'BaseEventList',

    onNewEvents: function (response)
    {
        Ext.each(response.getSessionInfos(), function (sessionInfo)
        {
            console.log("SessionInfo arrived!", sessionInfo);
            if (sessionInfo.isFinished())
            {
                this.deleteEvent(sessionInfo.getSessionId());
            }
            else
            {
                this.addEvent(sessionInfo.getSessionId(), sessionInfo);
            }
        }, this);
    },

    FormMustBeFilled: function ()
    {
        var formMustBeFilled = false;
        Ext.iterate(this.events, function (id, sessionInfo)
        {
            if (sessionInfo.isFormFinished())
            {
                return;
            }
            formMustBeFilled = true;
            return false;

        }, this);
        return formMustBeFilled;
    }
});