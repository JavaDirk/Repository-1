Ext.define('CampaignNotification', {
    extend: 'NotificationDialog',

    icon: 'phone',

    initComponent: function ()
    {
        this.setTitle(LANGUAGE.getString('outgoingCall'));
        this.callParent();

        this.contact = new www_caseris_de_CaesarSchema_Contact();
        this.contact.convertFromPhoneContact(this.callRequest.Contact);

        this.createComponents();

        Ext.asap(function () 
        {
            if (SESSION.isTelephonyAllowed())
            {
                this.show();
            }
        }, this);
    },

    createComponents: function ()
    {
        SESSION.addListener(this);
        GLOBAL_EVENT_QUEUE.addEventListener(this);

        this.callDisplayPanel = Ext.create('CallDisplayPanel',
            {
                padding: 0,
                contact: this.contact,
                selectedNumber: this.callRequest.DialNumber,
                defaultPhoneImage: ' '
            });

        this.additionalInformationContainer = Ext.create('AdditionalInformationContainer',
            {

            });

        var campaignName = CURRENT_STATE_CONTACT_CENTER.getCampaignName(this.callRequest.getCampaignId());
        this.additionalInformationContainer.setFirstRowText(new ACDCallInfoPanel().createKeyValueLine(LANGUAGE.getString("campaign"), Ext.String.htmlEncode(campaignName)));
        if (isValidString(this.callRequest.getRemarks()))
        {
            this.additionalInformationContainer.setSecondRowText(new ACDCallInfoPanel().createKeyValueLine(LANGUAGE.getString("note"), Ext.String.htmlEncode(this.callRequest.getRemarks())));
        }
        

        this.actionContainer = new Ext.Container({
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            flex: 1,
            margin: '10 10 0 10'
        });

        this.startCall = Ext.create('AcceptButton',
        {
            text: LANGUAGE.getString("callContact"),
            handler: (button) =>
            {
                button.disable();
                this.onAccept();
            }
        });

        this.endCall = Ext.create('DeclineButton',
            {
                handler: (button) =>
                {
                    button.disable();
                    this.onDecline();
                },
                margin: '0 5 0 0'
            });

        
        this.actionContainer.add(new Ext.Container({
            flex: 1
        }));

        this.actionContainer.add(this.endCall);
        this.actionContainer.add(this.startCall);

        var components = [this.callDisplayPanel, this.additionalInformationContainer, this.actionContainer];

        this.actionButtons = Ext.create('Ext.Container',
            {
                margin: '10 10 0 10',
                layout: 'column'
            });
        this.add(components);
    },

    onAccept: function ()
    {
        this.close();

        var callRequest = this.callRequest;
        Ext.asap(function ()
        {
            SESSION.acceptCampaignCall(callRequest, function (response)
            {
                if (response.getReturnValue().getCode() !== 0)
                {
                    showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }

            }, function ()
            {
                showErrorMessage(LANGUAGE.getString("errorAcceptCampaignCall"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            });
        }, this);
    },

    onDecline: function ()
    {
        this.close();

        var callRequest = this.callRequest;
        Ext.asap(function ()
        {
            SESSION.rejectCampaignCall(callRequest, function (response)
            {
                //bewußt keine Fehlermeldung anzeigen: Gibt schonmal Situationen, wo ein Request behandelt wird und der BEnutzer auf den Knopf drückt
            }, function ()
            {
                
            });
        }, this);
    }
});