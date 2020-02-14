Ext.define('ExternalContactsPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    title: '',

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('contacts').toUpperCase();

        this.listPanel = Ext.create('SearchResultsPanel',
        {
            openContactOnSelect: true,
            margin: '-1 0 0 0',
            getWatermarkImage: function ()
            {
                return IMAGE_LIBRARY.getImage("addressBook", 64, COLOR_WATERMARK);
            },
            hidden: false,
            searchNumbers: true,
            
            clearSearch: function ()
            {
                self.clearSearch();
            }
        });

        var self = this;
        this.searchPanel = Ext.create('SearchPanelWithAddressBookChooser',
        {
            margin: '10 5 0 5',
            contactListPanel: this.listPanel,
            clientSettingsKey: KEY_SEARCH_EXTERNAL_CONTACTS_HISTORY,
            classNameForComboBox: 'ComboBoxWithHistoryForSearch',
            clearComboBoxOnSuccess: true,
            onClearButtonPressed: function ()
            {
                self.clearSearch();
            }
        });

        this.add(
        [
            this.searchPanel,
            Ext.create('Ext.Component', //diese Component wird nur gebraucht, um den obersten borderTop der Liste zu verdecken. Dadurch braucht man keine Logik, wann man einen Trennstrich zwischen den Kontakten braucht
            {
                height: 5,
                style: 'z-index:1;background-color:white'
            }),
            this.listPanel
        ]);
    },

    clearSearch: function ()
    {
        this.listPanel.clearContacts();

        this.focus();
    },

    focus: function ()
    {
        this.callParent();

        this.searchPanel.focus();
    }
});