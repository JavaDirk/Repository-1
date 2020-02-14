Ext.define('InvitationDialog',
    {
        extend: 'ModalDialog',


    initComponent: function () {
        this.titleText = LANGUAGE.getString('newInvitation');
        this.callParent();


        var url = '../Invitations/invitation-edit.html?language=' + urlLanguage[MY_CONTACT.getLanguage()].value;
        if (isValid(this, "contact.getEMail()"))
        {
            url += '&email=' + this.contact.getEMail();
        }
        if (isValid(this, "contact.getFullName()")) {
            url += '&name=' + this.contact.getFullName();
        }

        var container = new Ext.Container(
        {
            layout:
                {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                }
            });

        this.iframe = Ext.create('IFrame',
        {
            height: 480,
            flex: 1,
            width: MODAL_DIALOG_WIDTH - 2 * MODAL_DIALOG_BODY_PADDING,
            url: url
        });

        container.add(this.iframe);

        var self = this;
        this.receiveMessage = function (event)
        {
            if (!Ext.isString(event.data)) //kommt z.B. vor, wenn die Jabra API Events feuert
            {
                return;
            }
            var data = JSON.parse(event.data);
            if (data && data.command === "saveInvitation")
            {
                var invitationAsJSON = JSON.stringify(data.invitation);
                SESSION.WebRTCSaveInvitation(invitationAsJSON, function (response)
                {
                    if (response.getReturnValue().getCode() === 0)
                    {
                        self.hide();
                    }
                    else
                    {
                        self.sendErrorToIFrame('saveResponse');
                        self.changeErrorMessage(response.getReturnValue().getDescription());
                    }
                }, function ()
                {
                    self.sendErrorToIFrame('saveResponse');
                    self.changeErrorMessage(LANGUAGE.getString("errorSaveInvitation"));
                });
            }
        };
        window.addEventListener("message", this.receiveMessage, false);

        this.addToBody(container);
    },

    destroy: function ()
    {
        window.removeEventListener("message", this.receiveMessage, false);
        this.callParent();
    },

    sendErrorToIFrame: function (command)
    {
        var message =
            {
                command: command,
                error: true
            };
        this.iframe.postMessage(JSON.stringify(message));
    }
});

Ext.define('InvitationListDialog',
{
    extend: 'ModalDialog',
    maxWidth: undefined,
    resizable: {
        handles: "se",
        pinned: true,
        minWidth: 250,
        minHeight: 200
    },
    
    titleText: 'Liste der Einladungen',

    initComponent: function () {
        this.callParent();

        var language = "en";
        if (MY_CONTACT.getLanguage() === "Germany") {
            language = "de";
        }
        this.iframe = Ext.create('IFrame',
        {
            height: 300,
            width: MODAL_DIALOG_WIDTH - 2 * MODAL_DIALOG_BODY_PADDING,
            url: '../Invitations/invitation-manager.html?language=' + language
        });
        
        this.addToBody(this.iframe);

        this.addButton(
        {
            text: LANGUAGE.getString("close"),
            handler: () =>
            {
                this.hide();
            }
        });

        var self = this;
        this.receiveMessage = function (event)
        {
            if (!Ext.isString(event.data)) //kommt z.B. vor, wenn die Jabra API Events feuert
            {
                return;
            }

            var data = JSON.parse(event.data);
            if (data && data.command === "editInvitation") {
                var invitationAsJSON = JSON.stringify(data.invitation);
                SESSION.WebRTCEditInvitation(invitationAsJSON, function (response)
                {
                    if (response.getReturnValue().getCode() === 0) {
                        var message =
                            {
                                command: 'editResponse',
                                data: invitationAsJSON
                            };
                        self.iframe.postMessage(JSON.stringify(message));
                    }
                    else
                    {
                        self.sendErrorToIFrame('editResponse');

                        self.changeErrorMessage(response.getReturnValue().getDescription());
                    }
                }, function ()
                {
                    self.sendErrorToIFrame('editResponse');
                    self.changeErrorMessage(LANGUAGE.getString("errorEditInvitation"));
                    });
            }
            if (data && data.command === "deleteInvitation") {
                SESSION.WebRTCDeleteInvitation(data.invitation.token, function (response)
                {
                    if (response.getReturnValue().getCode() === 0) {
                        var message =
                        {
                            command: 'deleteResponse',
                            data: data.invitation.token
                        };
                        self.iframe.postMessage(JSON.stringify(message));   
                    }
                    else
                    {
                        self.sendErrorToIFrame('deleteResponse');
                        self.changeErrorMessage(response.getReturnValue().getDescription());
                    }
                }, function ()
                {
                    self.sendErrorToIFrame('deleteResponse');
                    self.changeErrorMessage(LANGUAGE.getString("errorDeleteInvitation"));
                });
            }
            if (data && data.command === "getAllInvitations") {
                SESSION.WebRTCGetAllInvitations(function (response)
                {
                    if (response.getReturnValue().getCode() === 0)
                    {
                        var message =
                        {
                            command: 'getAllResponse',
                            data: response.getInvitations()
                        };
                        
                        self.iframe.postMessage(JSON.stringify(message));
                    }
                    else
                    {
                        self.sendErrorToIFrame('getAllResponse');
                        self.changeErrorMessage(response.getReturnValue().getDescription());
                    }
                }, function ()
                {
                    self.sendErrorToIFrame('getAllResponse');
                    self.changeErrorMessage(LANGUAGE.getString("errorGetAllInvitations"));
                });
            }
            if (data && data.command === "saveInvitation") {
                var invitationAsJSON = JSON.stringify(data.invitation);
                SESSION.WebRTCSaveInvitation(invitationAsJSON, function (response)
                {
                    if (response.getReturnValue().getCode() === 0) {
                        var message =
                            {
                                command: 'saveResponse',
                                data: response.getInvitation()
                            };

                        self.iframe.postMessage(JSON.stringify(message));
                    }
                    else
                    {
                        self.sendErrorToIFrame('saveResponse');
                        self.changeErrorMessage(self.iframe, response.getReturnValue().getDescription());
                    }
                }, function ()
                {
                    self.sendErrorToIFrame('saveResponse');
                    self.changeErrorMessage(LANGUAGE.getString("errorSaveInvitation"));
                });
            }
        };
        window.addEventListener("message", this.receiveMessage, false);
    },

    destroy: function () {
        window.removeEventListener("message", this.receiveMessage, false);
        this.callParent();
    },

    sendErrorToIFrame: function (command)
    {
        var message =
            {
                command: command,
                error: true
            };
        this.iframe.postMessage(JSON.stringify(message));
    }
});

