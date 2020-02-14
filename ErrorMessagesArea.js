Ext.define('ErrorMessagesArea',
    {
        extend: 'Ext.Container',

        hidden: true,

        distanceBetweenItems: 10,

        showErrorMessage: function (errorText, errorLevel, timeoutInSeconds, referenceId)
        {
            var component = this.getComponentByReferenceId(referenceId);
            if (isValid(component))
            {
                component.setText(errorText);
                component.setErrorType(errorLevel);
                return;
            }
            this.showErrorMessageComponent(Ext.create('ErrorMessageComponent',
            {
                errorMessageText: errorText,
                errorType: errorLevel,
                timeoutInSeconds: timeoutInSeconds,
                referenceId: referenceId
            }));
        },

        showErrorMessageComponent: function (component)
        {
            if (this.distanceBetweenItems && this.isEmpty())
            {
                component.margin = this.distanceBetweenItems + ' 0 0 0';
            }
            this.insert(0, component);
        },

        showConfirmation: function (confirmation)
        {
            confirmation.margin = confirmation.margin || '0 0 0 0';
            confirmation.errorType = confirmation.errorType || ErrorType.Warning;

            this.addBorderBottom(confirmation);

            this.insert(0, confirmation);
            this.updateLayout(); //nur deswegen nötig, weil die errorMessageComponent evtl umbricht, weil zuviele Elemente angezeigt werden. ohne das updateLayout würde man die "zweite Zeile" nicht oder nur abgeschnitten sehen
        },

        insert: function ()
        {
            this.callParent(arguments);
            this.updateVisibility();
        },

        addBorderBottom: function (component)
        {
            component.setStyle({ border: 'none', borderBottom: '1px solid ' + BORDER_GREY });
        },

        removeErrorMessage: function (referenceId)
        {
            var component = this.getComponentByReferenceId(referenceId);
            this.remove(component);

            this.updateVisibility();
        },

        getComponentByReferenceId: function (referenceId)
        {
            if (!isValidString(referenceId))
            {
                return null;
            }

            var result;
            this.each(function (errorMessageComponent)
            {
                if (errorMessageComponent.referenceId === referenceId)
                {
                    result = errorMessageComponent;
                    return false;
                }
            }, this);
            return result;
        },

        updateVisibility: function ()
        {
            this.setVisible(!this.isEmpty());
        }
    });
Ext.define('GlobalErrorMessagesArea',
{
    extend: 'ErrorMessagesArea',

    distanceBetweenItems: 0,

    initComponent: function ()
    {
        this.callParent();

        GLOBAL_EVENT_QUEUE.addEventListener(this);
    },

    destroy: function ()
    {
        GLOBAL_EVENT_QUEUE.removeEventListener(this);
        this.callParent();
    },

    onGlobalEvent_showError: function (errorText, timeoutInSeconds, referenceId)
    {
        this.showErrorMessage(errorText, ErrorType.Error, timeoutInSeconds, referenceId);
    },

    onGlobalEvent_showWarning: function (errorText, timeoutInSeconds, referenceId)
    {
        this.showErrorMessage(errorText, ErrorType.Warning, timeoutInSeconds, referenceId);
    },

    onGlobalEvent_showInfo: function (errorText, timeoutInSeconds, referenceId)
    {
        this.showErrorMessage(errorText, ErrorType.Info, timeoutInSeconds, referenceId);
    },

    onGlobalEvent_showConfirmation: function (confirmation)
    {
        this.showConfirmation(confirmation);
    },

    onGlobalEvent_removeErrorMessage: function (referenceId)
    {
        this.removeErrorMessage(referenceId);
    },

    showErrorMessageComponent: function (component)
    {
        this.addBorderBottom(component);

        this.callParent(arguments);
    }
});