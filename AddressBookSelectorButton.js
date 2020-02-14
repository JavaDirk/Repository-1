Ext.define('SelectAddressBookContextMenu',
{
    extend: 'CustomMenu',

    selectCallback: Ext.emptyFn,

    currentAddressBook: '',

    group: 'selectAddressBook',

    alwaysOnTop: true,
    
    initComponent: function ()
    {
        var addressBooks = CURRENT_STATE_DATA_CONNECT.getAddressBooks();
        this.insertItems = this.createMenuItems(addressBooks);
        this.callParent();
        this.showBy(this.target);
    },

    createMenuItems: function (addressBooks, icon)
    {
        var result = [];
        var addressBookItems = Ext.Array.map(addressBooks, function (addressBook)
        {
            return this.createMenuItem(addressBook.getName(), addressBook.getDisplayName());
        }, this);
        
        result.push(addressBookItems);
        result.push([this.createMenuItem(ALL_ADDRESS_BOOKS, LANGUAGE.getString("allAddressBooks"))]);
        return result;
    },

    createMenuItem: function (addressBookName, displayName)
    {
        var self = this;
        return {
            icon: ((this.currentAddressBook === addressBookName) ? IMAGE_LIBRARY.getImage('check', 64, DARKER_GREY) : ''),
            text: displayName,
            handler: function ()
            {
                self.selectCallback(addressBookName, displayName);                
            }
        };
    }
});

Ext.define('AddressBookSelectorButton',
{
    extend: 'Ext.Component',

    parent: null,
    
    initComponent: function ()
    {
        this.renderTpl = '<div style="display:flex">' +
                            '<img src="' + IMAGE_LIBRARY.getImage('addressBook2', 64, DARKER_GREY) + '" style="width:16px;height:16px"></img>' +
                           '<img src="' + IMAGE_LIBRARY.getImage('arrow_down', 64, DARKER_GREY) + '" style="width:10px;height:10px;margin:4px 0 0 4px"></img>' +
                        '</div>';
        this.callParent();

        var self = this;
        this.on(
        {
            el:
            {
                click: function ()
                {

                    if (isValid(self.contextMenu, "hiddenEventDate") && new Date().getTime() - self.contextMenu.hiddenEventDate.getTime() < 250)
                    {
                        self.contextMenu.close();
                        
                    }
                    else {
                        self.contextMenu = Ext.create('SelectAddressBookContextMenu',
                        {
                            currentAddressBook: self.parent.currentAddressBook,
                            target: self,
                            selectCallback: function (addressBookName, addressBookDisplayName)
                            {
                                self.parent.onNewAddressBookChosen(addressBookName, addressBookDisplayName);
                            },
                            listeners:
                            {
                                hide: function ()
                                {
                                    self.contextMenu.hiddenEventDate = new Date();
                                }
                            }
                        });
                    }
                }
            }
        });
    }
});
