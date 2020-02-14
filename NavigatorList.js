Ext.define('NavigatorList', {
    extend: 'Ext.Container',
    listItems: [],
    flex: 1,
    tabPanel: undefined,

    onRequestManagementEvent_updateNavigationSelect: function (newTab)
    {
        this.setActiveItem(newTab);
    },

    onGlobalEvent_EmailsAdded: function (store, needChange)
    {
        if (!store || !store.data)
        {
            return;
        }

        if (store.isSearchStore() || store.isParentStore())
        {
            return;
        }

        this.changeBatchCounter(store.getName(), store.requestCount, needChange);
    },

    changeBatchCounter: function (identifier, counter, needChange)
    {
        var needActionBackground = false;

        if (identifier === LANGUAGE.getString('incoming'))
        {
            var selItem = getHTMLElements('#' + this.getId() + ' .selectedEntry')[0];

            if (selItem && selItem.innerText.indexOf(LANGUAGE.getString('incoming')) !== -1)
            {
                needActionBackground = true;
            }
        }

        if (identifier.indexOf(' ') !== -1)
        {
            identifier = identifier.split(' ')[0];
        }

        var items = getHTMLElements('#' + this.getId() + ' .' + identifier);

        for (var i = 0; i < items.length; i++)
        {
            var curItem = items[i];

            if (counter > 0)
            {
                if (curItem.className.indexOf('display') !== -1)
                {
                    curItem.className = curItem.className.replace('display', '');
                }
            }
            else
            {
                if (curItem.className.indexOf('display') === -1)
                {
                    curItem.className += ' display';
                }
            }

            if (needActionBackground && needChange)
            {
                curItem.className = curItem.className.replace('informationBackground', ' newMessageBackground ');
            }

            curItem.innerText = counter;
            curItem.innerHTML = counter;
            curItem.text = counter;
        }
    },
    setActiveItem: function (panel)
    {
        for (var i = 0; i < this.items.length; i++)
        {
            if (!isValidString(this.items.getAt(i).name))
            {
                continue;
            }
            var itemText = this.items.getAt(i).name.toUpperCase();
            if (panel.title === this.items.getAt(i).name.toUpperCase() || panel.title.indexOf(itemText) !== -1)
            {
                this.items.getAt(i).addCls('selectedEntry');
            }
            else
            {
                this.items.getAt(i).removeCls('selectedEntry');
            }
        }
    },
    initComponent: function ()
    {
        this.callParent();

        GLOBAL_EVENT_QUEUE.addEventListener(this);
        REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(this);

        var self = this;

        for (var i = 0; i < this.listItems.length; i++)
        {
            var extraCss = 'none';

            if (i > 0)
            {
                extraCss = 'solid 1px ' + COLOR_SEPARATOR;
            }

            this.add(new Ext.Component({
                handlerFct: this.listItems[i].handler,
                name: this.listItems[i].text,
                padding: '10 10 10 15',
                flex: 1,
                style: {
                    cursor: 'pointer',
                    'border-top': extraCss
                },
                overCls: 'navigatorBackground',
                html: '<div style="display: flex; flex-direction: row;cursor:pointer">' +
                        '<div style="height: 16px; width: 16px; background-size: 16px 16px; background-image: url(' + this.listItems[i].icon + ')"></div>' +
                        '<div style="flex: 1; max-width: 30px;"></div>' +
                        '<div style="border: 1px;flex: 2;text-align: left;">' + this.listItems[i].text + '</div>' +
                        '<div style="flex: 1;text-align: right; display: flex;"><div style="flex: 1"></div><div class="informationBackground display batchCounter ' + this.listItems[i].text + ' innerLabel hideForOverlayButtons" style="border-radius:10px;color:white;font-size:12px;height:17px;min-width:16px;margin-right:5px;padding:0px 5px 2px 5px;text-align: right;">0</div></div>' +
                        '<div style="width: 5px;"></div>' + 
                      '</div>',
                listeners: {
                    el: {
                        click: function (event)
                        {
                            if (CLIENT_SETTINGS.getSetting('EMAIL', 'emailNavigationCollapsed'))
                            {
                                return;
                            }

                            var selItems = getHTMLElements('#' + self.getId() + ' .selectedEntry');
                            

                            for (var j = 0; j < selItems.length; j++)
                            {
                                var selItem = selItems[j];

                                if (selItem)
                                {
                                    selItem = Ext.getCmp(selItem.id);
                                    selItem.removeCls('selectedEntry');
                                }
                            }

                            event = Ext.getCmp(event.currentTarget.id);
                            event.addCls('selectedEntry');

                            if (event.name === LANGUAGE.getString('incoming'))
                            {
                                var curItem = getHTMLElements('#' + self.getId() + ' .newMessageBackground')[0];

                                if (curItem)
                                {
                                    curItem.className = curItem.className.replace('newMessageBackground', ' informationBackground ');
                                }
                            }

                            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_checkIfTabAlreadyExists(event.name, event.handlerFct);
                        }
                    }
                }
            }));
        }

        var newTicketButton = new RoundThinButton(
            {
                margin: '25',
                text: LANGUAGE.getString('newTicket'),
                iconName: 'add',
                handler: function ()
                {
                    REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_createNewTicket();
                }
            });

        this.add(new Ext.Container(
            {
                layout:
                {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'center'
                },
                items: [newTicketButton]
            }));

        this.on('boxready', function ()
        {
            Ext.each(this.listItems, function (listItem)
            {
                this.onGlobalEvent_EmailsAdded(listItem.store);
            }, this);
        });

        this.on('destroy', function ()
        {
            GLOBAL_EVENT_QUEUE.removeEventListener(self);
            REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(self);
        });
        
    }
});