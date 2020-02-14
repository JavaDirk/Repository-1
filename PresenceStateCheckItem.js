Ext.define('PresenceStateCheckItem',
{
    extend: 'Ext.menu.CheckItem',
    group: 'presenceState',
    presenceState: null,
    dialog: null,

    initComponent: function ()
    {
        this.callParent();
        
        this.text = '<div style="display:flex;padding:3px 15px 3px 0;">' +
                        '<div style="margin:2px 5px 0 8px;display:flex;box-sizing:content-box;border-radius:100%;border:1px solid white;width:12px;height:12px;background-size:contain;background-repeat:no-repeat;background-image:url(' + this.presenceState.image + ' )"></div>' +
                        '<div style="">' + this.presenceState.text + '</div>'+
                    '</div>';
        this.src = this.presenceState.image;

        this.addListener('click', function ()
        {
            SESSION.setPresenceState(this.presenceState.value, false, (response, state) => { this.onSetPresenceStateSuccess(response, state); }, () => { this.onSetPresenceStateException();});
        });
    },

    onSetPresenceStateSuccess: function (response, state)
    {
        if (response.getReturnValue().getCode() === ProxyError.ErrorNotEnoughAgents.value)
        {
            showConfirmation(Ext.create('ConfirmationComponent',
            {
                yesCallback: function ()
                {
                    SESSION.setPresenceState(state, true);
                },
                noCallback: Ext.emptyFn,
                errorMessageText: response.getReturnValue().getDescription()
            }));
        }
        else if (response.getReturnValue().getCode() === ProxyError.ErrorLicenseOverflow.value)
        {
            showWarningMessage(response.getReturnValue().getDescription());
        }
        else if (response.getReturnValue().getCode() !== ProxyError.ErrorOK.value)
        {
            showErrorMessage(response.getReturnValue().getDescription());
        }
    },

    onSetPresenceStateException: function ()
    {
        showErrorMessage(LANGUAGE.getString("errorSetPresenceState"));
    }
});

