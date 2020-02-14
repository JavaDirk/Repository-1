Ext.define('Action_Redirect',
    {
        extend: 'Action_Call',

        run: function ()
        {
            var ctiAction = Ext.create('CTIAction_BlindTransfer',
                {
                    callId: this.callPanel.callId,
                    number: this.config.DialTarget
                });
            this.resolveOrRun(ctiAction);
        },

        getIconName: function ()
        {
            return ICON_TRANSFER_CALL;
        }
    });