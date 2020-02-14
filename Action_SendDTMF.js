Ext.define('Action_SendDTMF',
    {
        extend: 'Action_Call',

        run: function ()
        {
            SESSION.sendDTMF(this.callPanel.callId, this.config.DTMFSequence, function (response)
            {
                if (response.getReturnValue().getCode() !== 0)
                {
                    showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            }, function ()
            {
                showWarningMessage(LANGUAGE.getString("errorSendDTMF"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            });
        },

        getIconName: function ()
        {
            return "keypad";
        }
    });