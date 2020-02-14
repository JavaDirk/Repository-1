Ext.define('PasswordChanger', {
    extend: 'Ext.Container',
    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    margin: 5,
    confirmButton: {},
    oldPasswordField: {},
    callBackSuccess: function () { },
    callBackCancel: function () { },
    maxWidth: 500,
    initComponent: function ()
    {
        var me = this;
        this.callParent();
        var content = Ext.create("Ext.Container", { margin: 15, maxWidth: 500, layout: {type: 'vbox', pack: 'start', align: 'stretch'}}),
            oldPassword, newPasswordRepeat;
        content.add(new Ext.Component({ html: '<input type="text" autocomplete="username" hidden>' })); //Passwort-Manager des Browsers trägt das gespeicherte Passwort und Username ein und such sich für den username dann irgendein input-Feld. Durch dieses versteckte Feld wird der Benutzer nicht verwirrt, weil der Browser es in das einträgt
        content.add(Ext.create("Ext.Container", { cls: ["form-header", "eclipsedText"], html: '<div style="color:' + COLOR_MAIN + ';font-size: ' + FONT_SIZE_HEAD_SETTING + 'px;">' + LANGUAGE.getString("passwordChangeHeader") + '</div>' }));
        content.add(Ext.create("Ext.container.Container", {
            cls: ["form-row"],
            items: [
                oldPassword = Ext.create("Ext.form.field.Text", {
                    cls: ["form-full-col"], labelWidth: 100, fieldLabel: LANGUAGE.getString("passwordChangeOldPassword"), inputType: "password",
                    listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() === e.ENTER) {
                                me.confirmFunction();
                            }
                        }
                    }
                }),
                newPassword = Ext.create("Ext.form.field.Text", {
                    cls: ["form-full-col"], labelWidth: 100, fieldLabel: LANGUAGE.getString("passwordChangeNewPassword"), inputType: "password",
                    listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() === e.ENTER) {
                                me.confirmFunction();
                            }
                        }
                    }
                }),
                newPasswordRepeat = Ext.create("Ext.form.field.Text", {
                    cls: ["form-full-col"], labelWidth: 100, fieldLabel: LANGUAGE.getString("passwordChangeNewPasswordRepeat"), inputType: "password",
                    listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() === e.ENTER) {
                                me.confirmFunction();
                            }
                        }
                    }
                })
            ]
        }));

        this.oldPasswordField = oldPassword;
        this.newPasswordField = newPassword;
        this.newPasswordFieldRepeat = newPasswordRepeat;
        this.add(content);
        this.confirmFunction = function () {
            me.callBackSuccess(oldPassword.getRawValue(), newPassword.getRawValue(), newPasswordRepeat.getRawValue());
        };
        this.confirmButton = new RoundThinButton({
            iconName: "check",
            margin: '0 0 0 15',
            text: LANGUAGE.getString("passwordChangeOvertake"),
            listeners: {
                click: this.confirmFunction
            }
        });

        this.add(new Ext.Container(
            {
                layout: 'hbox',
                items: [this.confirmButton]
            }));
        
    }
});