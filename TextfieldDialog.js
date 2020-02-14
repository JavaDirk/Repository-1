Ext.define('TextfieldDialog',
{
    extend: 'ModalDialog',

    labels: [],

    initComponent: function()
    {
        this.callParent();

        var self = this;

        var container = new Ext.Container({
            margin: '0 0 10 0',
            padding: '5 5 5 5',
            layout: { type: 'vbox', pack: 'start', align: 'stretch' }
        });

        this.textfields = [];
        Ext.each(this.labels, function(label)
        {
            var textfield = Ext.create('Ext.form.field.Text',
            {
                emptyText: label,
                margin: '0 0 0 5',
                listeners: {
                    specialkey: function (field, e)
                    {
                        if (e.getKey() === e.ENTER)
                        {
                            self.submit();
                        }
                    }
                }
            });
            self.textfields.push(textfield);
            container.add(textfield);
            /*container.add(Ext.create('Ext.Container',
                {
                margin: '5 0 0 0',
                layout: 'hbox',
                items:
                [
                    Ext.create('Ext.form.Label',
                    {
                        margin: '3 0 0 0 ',
                        text: label + ":",
                        minWidth: 150
                    }),
                    textfield
                ]
            }));*/
        });

        this.addToBody(container);

        this.okButton = this.addButton({
            margin: '0 5 0 0',
            text: LANGUAGE.getString("ok"),
            listeners:
            {
                click: function(event) {
                    self.submit();
                }
            }
        });
    },

    focus: function ()
    {
        if (this.textfields && this.textfields.length > 0)
        {
            this.textfields[0].focus();
        }
    },

    submit: function ()
    {
        var result = [];
        Ext.each(this.textfields, function (textfield)
        {
            result.push(textfield.getValue());
        });
        this.onOK(result);

        this.hide();
    },

    onOK: function()
    {

    },

    onCancel: function()
    {

    }
});