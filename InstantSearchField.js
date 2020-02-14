Ext.define('InstantSearchField',
{
    extend: 'Ext.form.field.Text',
    enableKeyEvents: true,

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.setTriggers(
        {
            clear:
            {
                cls: 'x-form-clear-trigger',
                handler: function ()
                {
                    self.clear();
                },
                hidden: true,
                scope: 'this'
            }
        });

        var lastSearchString = "";
        this.on('keyup', (field, event, eOpts) =>
        {
            if (event.getKey() === event.DOWN) {
                this.onKeyCursorDown();
            }
            else{
                var value = field.getValue();
                field.getTrigger('clear')[(value.length > 0) ? 'show' : 'hide']();

                if (value && value === lastSearchString) {
                    return;
                }

                lastSearchString = value;
                this.startSearch(value);
            }
        }, this, { buffer: 300 });
    },

    onKeyCursorDown: function () {

    },

    setValue: function (value)
    {
        this.callParent(arguments);
        if (!isValidString(value))
        {
            this.clear();
        }
    },

    clear: function ()
    {
        if (this.getValue() !== "")
        {
            this.setValue();
        }
        
        this.startSearch("");
        this.getTrigger('clear').hide();
    },

    startSearch: function (searchString)
    {

    }
});