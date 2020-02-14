Ext.define('FavoritesListPanel',
{
    extend: 'BasePersonalContactsListPanel',

    title: '',
    placeHolder: '',

    confirmDeleteButtonText: LANGUAGE.getString('removeFavorite'),

    initComponent: function ()
    {
        this.title = LANGUAGE.getString('favorites').toUpperCase();
        this.placeHolder = LANGUAGE.getString("favoritesPlaceholder");
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            if (CURRENT_STATE_BUDDY_LIST.isFavouritesLoading())
            {
                showBlackLoadingMask(self);
            }
        });
    },

    getActions: function (record, item)
    {
        var actions = new FavoriteActions(record, item, this);
        actions.setCallbackForMakeCallSuccess((response, number, contact) =>
        {
            this.clearSearch();
        });
        return actions;
    },

    onGetFavouritesSuccess: function (response)
    {
        hideLoadingMask(this);

        var store = this.getStore();
        store.removeAll();
        this.refresh();

        if (response.getReturnValue().getCode() === 0)
        {
            store.add(response.getContacts());

            this.getSelectionModel().setStore(store);
        }
        else
        {
            this.setEmptyText(response.getReturnValue().getDescription());
        }
    },

    onGetFavouritesException: function ()
    {
        hideLoadingMask(this);

        var store = this.getStore();
        store.removeAll();
        this.refresh();

        this.setEmptyText(LANGUAGE.getString("errorGetFavourites"));
    },

    onAddFavouriteSuccess: function (response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var contact = response.getContact();
            this.getStore().add(contact);
        }
    },
        
    onRemoveFavouriteSuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.removeContactFromStore(contact);
        }
        else
        {
            this.setEmptyText(response.getReturnValue().getDescription());
        }
    },

    onRemoveFavouriteException: function ()
    {
        this.setEmptyText(LANGUAGE.getString("errorRemoveFavourite"));
    },
    
    getWatermarkImage: function ()
    {
        return IMAGE_LIBRARY.getImage("favorite", 64, COLOR_WATERMARK);
    },

    deleteEntry: function (record)
    {
        SESSION.removeFavourite(record.data);
    },

    showConfirmationDialogForRemoveFromFavorite: function ()
    {
        return true;
    },

    onRemoveBuddySuccess: function (response, contact)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            var store = this.getStore();
            for (var i = store.getCount() - 1; i >= 0; i--)
            {
                var record = store.getAt(i);
                if (record.data.equals(contact))
                {
                    var node = Ext.get(this.getNode(record));
                    animateDeleteEntry(node, function ()
                    {
                        store.remove(record);
                    });
                }
            }
        }
    }
});

Ext.define('FavoritesPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },


    initComponent: function ()
    {
        this.titleIconWhite = IMAGE_LIBRARY.getImage('favorite', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage('favorite', 64, COLOR_TAB_ICON_NORMAL);

        this.tabConfig =
        {
            icon: this.titleIconBlack,
            tooltip: LANGUAGE.getString('favorites')
        };

        this.callParent();

        this.listPanel = Ext.create('FavoritesListPanel',
        {
            margin: '-1 0 0 0',
            onNoHitsFound: () =>
            {
                Ext.asap(() =>
                {
                    this.searchPanel.markSearchString();
                    this.searchPanel.focus();
                }, this);
            },
            clearSearch: function ()
            {
                self.clearSearch();
            }
        });

        var self = this;
        this.searchPanel = Ext.create('SearchPanel',
        {
            margin: '10 5 0 5',
            contactListPanel: this.listPanel,
            clientSettingsKey: KEY_SEARCH_FAVORITES_HISTORY,
            clearComboBoxOnSuccess: false,
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


        this.setVisible(SESSION.isFeatureAllowed(TimioFeature.Search));
    },

    clearSearch: function ()
    {
        this.searchPanel.reset();

        this.listPanel.clearContacts();

        this.focus();
    },

    focus: function ()
    {
        this.callParent();

        this.searchPanel.focus();
    }
});