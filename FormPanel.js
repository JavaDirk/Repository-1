Ext.define('FormPanel',
{
    extend: 'IFrame',

    initComponent: function ()
    {
        this.url = this.addLanguageToUrl(this.url);
        this.callParent();

        this.on('boxready', function ()
        {
            SESSION.addListener(this);
        }, this);

        this.on('destroy', function ()
        {
            SESSION.removeListener(this);
        }, this);
    },

    addLanguageToUrl: function (url)
    {
        return url + "&lang=" + LANGUAGE.getLanguage();
    },

    isSavingInProgress: function ()
    {
        return this.isSaving;
    },

    saveForm: function (group, callId)
    {
        if (!group)
        {
            return;
        }

        if (!group.getPassFormOnTransfer())
        {
            return;
        }

        if (!CURRENT_STATE_CALL.isFormSavingRequired(callId))
        {
            return;
        }

        var self = this;
        this.callbackForMessagesFromForm = function (event)
        {
            self.receiveMessageFromForm(event);
        };
        window.addEventListener("message", this.callbackForMessagesFromForm, false);

        console.log("CallPanel: saving form...");
        this.isSaving = true;
        this.postMessage({
            action: 'submit',
            validation: false
        });
    },

    receiveMessageFromForm: function (event)
    {
        console.log("CallPanel: received event", event);

        if (event.origin.toLowerCase() !== window.location.origin.toLowerCase())
        {
            console.log("CallPanel: Received message from unknown origin!", event);
            return;
        }

        if (event.data.action === "submitSuccess" || event.data.action === "submitFailure")
        {
            this.isSaving = false;

            window.removeEventListener("message", this.callbackForMessagesFromForm, false);

            this.onSaveFinished();
        }
    },

    onSaveFinished: function ()
    {
        this.close(true);
    },

    onNewEvents: function (response)
    {
        Ext.each(response.getOwnerCalls(), function (callEvent)
        {
            if (callEvent.getCallId() !== this.callId)
            {
                return;
            }

            var acdCallInfo = callEvent.getACDCallInfo();
            if (!isValid(acdCallInfo))
            {
                return;
            }

            if (isValidString(acdCallInfo.getChangedFormUrl()))
            {
                this.setUrl(this.addLanguageToUrl(acdCallInfo.getChangedFormUrl()));
            }
            else if (isValidString(acdCallInfo.getFormUrl()))
            {
                this.updateUrl(this.addLanguageToUrl(acdCallInfo.getFormUrl()));
            }
            
        }, this);
    }
});