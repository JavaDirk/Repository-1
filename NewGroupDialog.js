Ext.define('NewGroupDialog',
    {
        extend: 'ModalDialog',

        onCreateNewGroup: Ext.emptyFn,

        initComponent: function ()
        {
            this.titleText = LANGUAGE.getString('createNewGroup');

            this.callParent();

            var self = this;

            var groupFindContainer = new Ext.Container(
            {
                margin: '5 0 0 0',
                layout:
                {
                    type: 'hbox',
                    pack: 'start',
                    align: 'stretch'
                }
            });

            this.groupFinderField = groupFindContainer.add(new Ext.form.field.Text({
                minWidth: 250,
                flex: 1,
                margin: '0 0 0 0',
                emptyText: LANGUAGE.getString('displayName'),
                enableKeyEvents: true,
                listeners:
                {
                    keypress: function (field, event)
                    {
                        if (event.getKey() === KEY_ENTER && isValidString(field.getValue()))
                        {
                            self.createNewGroup();
                        }
                    },

                    change: function (textfield, newValue)
                    {
                        okButton.setDisabled(!isValidString(newValue));
                    }
                }
            }));


            var groupsButton = groupFindContainer.add(new RoundThinButton({
                margin: '0 0 0 15',
                minWidth: 75,
                text: '...',
                
                listeners:
                {
                    boxReady: function (button)
                    {
                        button.btnInnerEl.dom.style.fontSize = "14px";
                    },
                    click: function (button)
                    {
                        if (isValidString(button.errorMessage))
                        {
                            self.changeErrorMessage(button.errorMessage);
                            button.errorMessage = "";
                            return;
                        }
                        if (Ext.isEmpty(button.myTenantGroups))
                        {
                            self.changeErrorMessage(LANGUAGE.getString("noTenantGroups"));
                            return;
                        }
                        var menu = Ext.create('CustomMenu', {
                            highlightFirstMenuItem: false,
                            alwaysOnTop: true,
                            insertItems: button.myTenantGroups
                        });
                        menu.showBy(button);
                    }
                }
            }));

            SESSION.getTenantGroups(undefined, function (result)
            {
                if (result.getReturnValue().getCode() !== 0)
                {
                    groupsButton.errorMessage = result.getReturnValue().getDescription();
                }
                if (isValid(result.getTenantItems()))
                {
                    groupsButton.myTenantGroups = [];
                    Ext.each(result.getTenantItems(), function (tenantItem)
                    {
                        groupsButton.myTenantGroups.push(
                            {
                                text: tenantItem.getDisplayName(),
                                tenantId: tenantItem.getObjectId(),
                                iconName: 'users',
                                handler: function (item)
                                {
                                    self.groupFinderField.setValue(item.text);
                                    
                                    self.selectedTenantId = item.tenantId;
                                    self.selectedTenantGroupName = item.text;
                                }
                            });
                    });
                    Ext.Array.sort(groupsButton.myTenantGroups, function (group1, group2)
                    {
                        var name1 = group1.text.toUpperCase(),
                            name2 = group2.text.toUpperCase();

                        return name1.localeCompare(name2);
                    });
                }
                self.myGroups = [];

            },
            function (error)
            {
                groupsButton.errorMessage = LANGUAGE.getString("errorGetTenantGroups");
            });

            this.addToBody(groupFindContainer);

            var okButton = this.addButton({
                disabled: true,
                text: LANGUAGE.getString('ok'),
                listeners:
                {
                    click: function (event)
                    {
                        self.createNewGroup();
                    }
                }
            });

            this.show();
        },

        createNewGroup: function ()
        {
            var groupName = this.selectedTenantGroupName;
            var tenantId = this.selectedTenantId;
            if (groupName !== this.groupFinderField.getValue())  //man muss hier auch noch den Namen vergleichen, weil es ja sein kann, dass jemand die TenantGroup "Kollegen" auswählt, den Text aber dann zu Kollegen2 ändert
            {
                groupName = this.groupFinderField.getValue();
                tenantId = undefined;
            }
            this.hide();
            this.onCreateNewGroup(groupName, tenantId);
        }
    });