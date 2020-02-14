Ext.define('SettingsUserPanel', {
    extend: 'SettingsBasePanel',
    title: '',
    iconCls: 'user',
    identifier: 'userPanel',
    listeners: {
        activate: function (event) {
            setTimeout(function () {
                event.oldPasswordBox.focus();
            }, 100);
        }
    },
    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('user');

        var self = this;
        var passwordChanger = {};
        this.isOkay = 1;
        var successFunction = this.successFunction = function (oldPassword, newPassword, newRepeatPasword)
        {
            var newPassword = passwordChanger.newPasswordField;
            var newPasswordRepeat = passwordChanger.newPasswordFieldRepeat;
            var oldPassword = passwordChanger.oldPasswordField;
            this.isOkay = -1;
            var successCallBack = function (data)
            {
                if (data.getReturnValue().getCode() === 0) {
                    self.showError(LANGUAGE.getString("passwordChangeSuccess"));

                    newPassword.setValue('');
                    newPasswordRepeat.setValue('');
                    oldPassword.setValue('');
                    self.isOkay = 1;
                } else {
                    self.showError(data.getReturnValue().getDescription());
                    newPassword.setValue('');
                    newPasswordRepeat.setValue('');
                    oldPassword.setValue('');
                }
            };

            var failCallBack = function (data)
            {
                self.showError(LANGUAGE.getString("passwordChangeFailed"));
                newPassword.setValue('');
                newPasswordRepeat.setValue('');
                oldPassword.setValue('');
            };

            if (newPassword.getRawValue() && newPasswordRepeat.getRawValue() && oldPassword.getRawValue()) {
                if (newPassword.getRawValue() !== newPasswordRepeat.getRawValue()) {
                    newPassword.setValue('');
                    newPasswordRepeat.setValue('');
                    self.showError(LANGUAGE.getString("passwordChangeNewNotIdentical"));
                } else if (oldPassword.getRawValue() === newPassword.getRawValue()) {
                    newPassword.setValue('');
                    newPasswordRepeat.setValue('');
                    self.showError(LANGUAGE.getString('passwordChangeOldNewNotIdentical'));
                } else {
                    SESSION.changePassword(oldPassword.getRawValue(), newPassword.getRawValue(), successCallBack, failCallBack);
                }

            } else if (!newPassword.getRawValue() && !newPasswordRepeat.getRawValue() && !oldPassword.getRawValue()) {
                self.isOkay = 1;
            } else {
                self.showError(LANGUAGE.getString("passwordChangeFillOutAll"));
            }

            
        };

        passwordChanger = this.add(new PasswordChanger({
            callBackSuccess: successFunction,
            callBackCancel: function ()
            {
                //alert("Cancel");
            }
        }));

        this.oldPasswordBox = passwordChanger.oldPasswordField;

    },
    onOK: function () {
        return this.isOkay;
    },

    showError: function (text)
    {
        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '20 20 0 20',
            errorMessageText: text,
            errorType: ErrorType.Warning,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    }
});