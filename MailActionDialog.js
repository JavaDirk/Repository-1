Ext.define('MailActionDialog', {
    extend: 'ModalDialog',
    additionalContainer: undefined,
    canComment: true,
    target: undefined,
    reasons: undefined,
    titleText: '',
    enableKeyEvents: true,
    addErrorMessageRow: false,

    sendReasonAndComment: function ()
    {
        if (isValid(this, 'commentBox.hasFocus') && this.commentBox.hasFocus)
        {
            return;
        }

        var reasonId = -1;
        var comment = '';

        if (this.commentBox)
        {
            comment = Ext.String.htmlEncode(this.commentBox.getValue());
        }

        if (this.reasonBox)
        {
            reasonId = this.reasonBox.getValue();
        }

        this.callBackFunction(reasonId, comment, this.additionalContainer);
        this.close();
    },

    listeners:
    {
        boxready: function (me)
        {

            me.escapeKeyNav = new Ext.util.KeyNav(
            {
                target: me.el,
                eventName: 'keypress',
                scope: me,
                enter: me.sendReasonAndComment
            });
        }
    },

    initComponent: function ()
    {
        this.callParent();

        var self = this;

        var container = new Ext.Container({
            margin: '25 0 25 0',
            layout: { type: 'vbox', pack: 'start', align: 'stretch' },
            flex: 1,
            border: false,
            height: this.minHeight,
            enableKeyEvents: true
        });

        if (this.additionalContainer)
        {
            container.add(this.additionalContainer);
        }

        var store = new Ext.data.Store({});

        for (var i = 0; i < this.reasons.length; i++)
        {
            store.add({name: this.reasons[i].getName(), identifier: this.reasons[i].getId()});
        }

        if (this.reasons.length > 0)
        {
            this.reasonBox = container.add(new Ext.form.field.ComboBox({
                store: store,
                editable: false,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'identifier',
                enableKeyEvents: true,
                emptyText: LANGUAGE.getString('chooseReason') + '...',
                listeners:
                {
                    select: function (me)
                    {
                        setTimeout(function ()
                        {
                            me.focus();
                        }, 100);

                    }
                }
            }));


            this.reasonBox.select(store.data.getAt(0));
        }

        if (this.canComment)
        {
            this.commentBox = container.add(new Ext.form.field.TextArea({
                emptyText: LANGUAGE.getString('comment') + '...',
                grow: true,
                growMax: 160,
                flex: 1,
                hasFocus: false,
                listeners:
                {
                    focus: function (me)
                    {
                        me.hasFocus = true;
                    },
                    blur: function (me)
                    {
                        me.hasFocus = false;
                    },
                    boxready: function ()
                    {
                        this.inputEl.setStyle({ fontSize: FONT_SIZE_MODAL_DIALOG + 'px', lineHeight: 'normal' });
                    }
                }
            }));

            this.setMinHeight(300);
            container.setMinHeight(300);
        }

        this.addToBody(container);

        this.applyButton = this.addButton({
            text: LANGUAGE.getString('ok'),
            listeners: {
                click: function ()
                {
                    self.sendReasonAndComment();
                }
            }
        });
        
        if (!this.canComment && this.reasons.length <= 0 && !self.additionalContainer)
        {
            self.callBackFunction(-1, '', self.additionalContainer);
            this.hide();
        }
        else
        {
            this.show();

            if (isValid(this, 'reasonBox.focus'))
            {
                this.reasonBox.focus();
            }
            
        }
    }
});