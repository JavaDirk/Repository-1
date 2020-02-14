Ext.define('Action_Forward',
    {
        extend: 'Action_Call',

        run: function ()
        {
            if (isValidString(this.config.DialTarget))
            {
                var ctiAction = Ext.create('CTIAction_Diversion',
                    {
                        number: this.config.DialTarget
                    });
                this.resolveOrRun(ctiAction);
            }
            else
            {
                SESSION.removeCallDiversion(0, DEFAULT_SUCCESS_CALLBACK(function (response)
                {
                    if (response.getReturnValue().getCode() !== 0)
                    {
                        showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                    }
                }, null), DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorDeleteDiversion"), null));
            }
        },

        getIconName: function ()
        {
            return "calldiversion";
        }
    });