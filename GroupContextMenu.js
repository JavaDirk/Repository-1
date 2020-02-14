Ext.define('GroupContextMenu',
{
    extend: 'CustomMenu',

    highlightFirstMenuItem: false,

    initComponent: function ()
    {
        var menuItems = this.createMenuEntriesForSettings();
        Ext.each(this.additionalMenuItems, function (additionalMenuItem)
        {
            menuItems.push(additionalMenuItem);
        });

        this.insertItems = menuItems;

        if (!this.isTabView)
        {
            this.style = { left: 'auto', right: '5px' };
        }
        this.callParent();
    },

    createMenuEntriesForSettings: function ()
    {
        var insertItems = [];

        insertItems.push([this.createMenuItemForAddContact()]);

        insertItems.push(
        [
            this.createMenuItemForRenameGroup(),
            this.createMenuItemForDeleteGroup()
        ]);

        insertItems.push(
        [
            this.createMenuItemForSwitchToMiniView(),
            this.createMenuItemForSwitchToNormalView()
        ]);

        if (!this.isTabView)
        {
            insertItems.push(
            [
                this.createMenuItemForExpandAllGroups(),
                this.createMenuItemForComprimizeAllGroups()
            ]);
        }

        insertItems.push(
        [
            this.createMenuItemForSwitchAllGroupsToMiniView(),
            this.createMenuItemForSwitchAllGroupsToNormalView()
        ]);

        insertItems.push(
        [
            this.createMenuItemForAddingGroup()
        ]);

        return insertItems;
    },

    createMenuItemForAddContact: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('addContact') + "...", 'newContact', () =>
        {
            this.parent.createSearchPanelForAddingPartner();
        });
    },

    createMenuItemForRenameGroup: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('renameGroup') + "...", 'edit', () =>
        {
            this.parent.onRenameGroup();
        });
    },

    createMenuItemForDeleteGroup: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('removeGroup'), 'remove', () =>
        {
            this.parent.onDeleteGroup();
        });
    },

    createMenuItemForSwitchToNormalView: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('normalView'), 'fullView', () =>
        {
            this.parent.setViewType('normal');
        });
    },

    createMenuItemForSwitchToMiniView: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('compactView'), 'smallView', () =>
        {
            this.parent.setViewType('mini');
        });
    },

    createMenuItemForExpandAllGroups: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('expandGroups'), '', () =>
        {
            this.parent.expandGroups();
        });
    },

    createMenuItemForComprimizeAllGroups: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('comprimizeGroups'), '', () =>
        {
            this.parent.compromizeGroups();
        });
    },

    createMenuItemForAddingGroup: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('newGroup') + "...", 'add', () =>
        {
            this.parent.addNewGroup();
        });
    },

    createMenuItemForSwitchAllGroupsToMiniView: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('compactViewGroups'), '', () =>
        {
            this.parent.showMiniGroupsView();
        });
    },

    createMenuItemForSwitchAllGroupsToNormalView: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('normalViewGroups'), '', () =>
        {
            this.parent.showNormalGroupsView();
        });
    },

    createMenuItem: function (text, iconName, handler)
    {
        return {
            text: text,
            iconName: iconName,
            handler: handler
        };
    }
});

Ext.define('ACDGroupContextMenu',
{
    extend: 'GroupContextMenu',

    createMenuEntriesForSettings: function ()
    {
        var insertItems = [];

        insertItems.push(
        [
            this.createMenuItemForSwitchToMiniView(),
            this.createMenuItemForSwitchToNormalView()    
        ]);

        if (!this.isTabView)
        {
            insertItems.push(
            [
                this.createMenuItemForExpandAllGroups(),
                this.createMenuItemForComprimizeAllGroups()
            ]);
        }

        insertItems.push(
        [
            this.createMenuItemForSwitchAllGroupsToMiniView(),
            this.createMenuItemForSwitchAllGroupsToNormalView()
        ]);

        insertItems.push(
        [
            this.createMenuItemForAddingGroup()
        ]);

        if (this.isTabView)
        {
            var menuItems = [];
            if (!Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getRedirectionsForGroup(this.group.getAcdId())))
            {
                menuItems.push(this.createMenuItemForRedirections());
            }
            if (!Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getAnnouncementsForGroup(this.group.getAcdId())))
            {
                menuItems.push(this.createMenuItemForAnnouncements());
            }
            if (!Ext.isEmpty(menuItems))
            {
                insertItems.push(menuItems);
            }
        }
        return insertItems;
    },

    createMenuItemForRedirections: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('redirections'), 'redirection', () =>
        {
            this.parent.openRedirectionDialog();
        });
    },

    createMenuItemForAnnouncements: function ()
    {
        return this.createMenuItem(LANGUAGE.getString('announcements'), 'speaker', () =>
        {
            this.parent.openAnnouncementsDialog();
        });
    }
});