Ext.define('ChooseChatPartnerContainer',
{
    extend: 'ModalDialog',

    listPanelClassName: 'ColleaguesListPanelForChat',

    initComponent: function ()
    {
        this.titleText = this.getTitleText();

        this.callParent();

        var self = this;

        var container = new Ext.Container(
        {
            border: false,

            layout:
            {
                type: 'vbox',
                pack: 'start',
                align: 'stretch'
            }
        });

        this.colleaguesPanel = container.add(Ext.create('ColleaguesPanel',
        {
            parent: this,
            listPanelClassName: this.listPanelClassName,
            margin: '0 0 5 0',
            marginForSearchPanel: '5 0 0 0',
            minHeight: 32,
            backgroundColorForSubComponents: COLOR_DIALOG_BACKGROUND,
            
            onSelectionChanged: function (view, selected)
            {
                if (selected.length > 0)
                {
                    okButton.enable();
                    return;
                }
                okButton.disable();    
            },

            showError: function (text)
            {
                self.changeErrorMessage(text, ErrorType.Info);
            }
        }));

        this.addToBody(container);

        var okButton = this.addButton(
        {
            text: LANGUAGE.getString("ok"),
            disabled: true,
            listeners:
            {
                click: function (event) 
                {
                    self.openChat();
                }
            }
        });
    },

    //@override
    getTitleText: function ()
    {
        return LANGUAGE.getString('selectChatPartner');
    },

    focus: function ()
    {
        this.colleaguesPanel.focus();
    },

    openChat: function (contact)
    {
        contact = contact || this.colleaguesPanel.getSelectedContact();
        if (isValid(contact))
        {
            this.saveName(contact);
            this.startChat(contact);

            this.hideDialog();
        }
        else
        {
            this.changeErrorMessage(LANGUAGE.getString("noContactChosen"), ErrorType.Info);
        }
    },

    startChat: function (contact)
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_openUserChat(contact);
    },

    saveName: function (contact)
    {
        saveToColleaguesHistory(null, "", contact);
    },

    hideDialog: function ()
    {
        this.hide();
    }
});
