var CLIENT_SETTINGS_KEY_LAST_SELECTED_GROUP_ID = 'lastSelectedGroupId';

Ext.define('OutboundGroup',
{
    extend: 'Ext.data.Model',
    fields:
    [
        { name: 'LogoUrl', type: 'string' },
        { name: 'Name', type: 'string' },
        { name: 'shortCut', type: 'string' },
        { name: 'Id', type: 'string', defaultValue: '-1' }
    ]
});

Ext.define('OutboundGroupList',
{
    extend: 'BaseViewPanel',

    itemPadding: '0 0 0 0',
    
    itemSelector: 'div.outboundGroup',
    selectedItemCls: 'selectedEntry',
    overlayButtons: true,
    openContactOnSelect: true,
    minWidth: 300,
    //maxHeight: 400,
    //scrollable: 'vertical',
    showMyContact: true,
    plugins:
    [
        {
            ptype: 'ContactViewWithPhotos',
            photoSize: PhotoSizes.Small
        }
    ],

    initComponent: function ()
    {
        var self = this;
        this.tpl =  new Ext.XTemplate('<tpl for=".">' +
                                        '<div class="outboundGroup" style="display:flex;align-items:center;cursor:pointer;margin:5px 0;padding:{[this.getItemPadding()]}">' +
                                        '<tpl if="isValidString(LogoUrl)">' +
                                            '<div class="' + CLASS_FOR_SHOWING + '" style="border-radius:100%;border:1px solid ' + COLOR_CALL_BUTTON_BORDER + ';background-image:url({LogoUrl});width:45px;height:45px;background-repeat:no-repeat;cursor:pointer;background-size:{[this.getBackgroundSize(values)]};background-position: center center;"></div>' +
                                        '<tpl else>' +
                                            '<div class="' + CLASS_CONTACT_PHOTO + '" style="display:flex;align-items:center;width:45px;height:45px;"></div>' +
                                        '</tpl>' +
                                        '<div class="hideForOverlayButtons" style="font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_TITLE + ';flex:1;align-self:center;margin:0 0 0 10px;cursor:pointer">{Name:htmlEncode}</div>' +
                                        '<tpl if="isValidString(shortCut)">' +
                                            '<div class="hideForOverlayButtons" style="font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_TITLE + ';text-align:right;justify-content:flex-end;align-self:center;padding:0 5px;cursor:pointer">[{shortCut}]</div>' +
                                        '</tpl>' +
                                            '<div class="showForOverlayButtons" style="margin-left:5px;display:none;flex:1"></div>' +
                                            '<div class="moreButton" style=""></div>' +
                                        '</div>' +
                                    '</tpl>',
            {
                getBackgroundSize: function (values)
                {
                    if (values.logoIsAvatar)
                    {
                        return "30px 30px";
                    }
                    else
                    {
                        return "contain";
                    }
                },

                getItemPadding: function ()
                {
                    return self.itemPadding;
                }
            });
        this.setStore(Ext.create('Ext.data.Store',
            {
                model: 'OutboundGroup'
            }));
        this.callParent();     

        this.fillStore(this.groups);

        //warum ist das nötig? Gab den Fall im ContactCenterForwardDialog. Da konnte es vorkommen, dass man auf eine Gruppe klickt, dann dort die Fähigkeitenliste erscheint und dadurch die 
        //Liste nach oben scrollte
        this.on('itemclick', function (view, record, item)
        {
            Ext.asap(() =>
            {
                Ext.get(item).scrollIntoView(view.el);
            });
        }, this);
    },

    setEmptyText: function (newText)
    {
        if (isValidString(newText))
        {
            this.emptyText = '<div class="errorMessage">' + newText + '</div>';
        }
        else
        {
            this.emptyText = '';
        }

        this.applyEmptyText();
    },

    createRecordForMyContact: function ()
    {
        if (!isValid(MY_CONTACT, "getDisplayName()"))
        {
            return null;
        }
        this.me = {
            Name: MY_CONTACT.getDisplayName(),
            shortCut: 0,
            Id: -1,
            contact: MY_CONTACT
        };
        return this.me;
    },

    dialSelectedRecord: function ()
    {
        var selectedRecord = this.getSelectedGroup();
        if (!isValid(selectedRecord)){
            return;
        }
        this.dial(selectedRecord.data.Id);
    },

    getSelectedGroup: function ()
    {
        var selectedRecords = this.getSelectionModel().getSelection();
        if (!isValid(selectedRecords) || selectedRecords.length !== 1)
        {
            return;
        }
        return selectedRecords[0];
    },

    getOverlayButtons: function (record, item)
    {
        var contact = record.data;
        if (contact.ignore) {
            return [];
        }
        
        return [this.getOverlayButtonForCallForGroup(contact)];
    },

    getOverlayButtonForCallForGroup: function (contact) {
        var self = this;
        return {
            imageUrl: 'images/64/phone.png',
            tooltipText: LANGUAGE.getString("callContact"),
            clickListener: function ()
            {                
                self.dial(contact.Id);
            }
        };
    },

    getLastSelectedGroupId: function ()
    {
        return TIMIO_SETTINGS.getLastSelectedGroupId();
    },
    
    dial: function (groupId)
    {
        this.parent.dial(groupId);
    },

    onSingleClick: function (view, record, item, index, event, opts)
    {

    },

    fillStore: function (groups)
    {
        this.getStore().removeAll();
        this.refresh();

        this.groups = [];

        var shortCut = 1;

        Ext.Array.sort(groups, function (record1, record2)
        {
            var data1 = record1.data || record1;
            var data2 = record2.data || record2;

            var name1 = data1.Name || data1.GroupName;
            var name2 = data2.Name || data2.GroupName;

            return name1.localeCompare(name2);
        });
        Ext.each(groups, function (group)
        {
            var groupModel = this.convertGroupForStore(group);
            groupModel.shortCut = shortCut;
            shortCut += 1;
            this.groups.push(groupModel);
        }, this);

        var recordForMe = this.createRecordForMyContact();
        if (isValid(recordForMe) && this.showMyContact)
        {
            this.groups.push(recordForMe);
        }
        
        this.getStore().add(this.groups);

        this.selectLastSelectedGroup();
    },

    convertGroupForStore: function (group)
    {
        var groupModel =
        {
            Name: group.Name || group.GroupName,
            LogoUrl: group.LogoUrl,
            Id: group.Id || group.GroupId,
            skills: group.skills
        };
        if (!group.getLogoUrl || !isValidString(group.getLogoUrl()))
        {
            groupModel.LogoUrl = IMAGE_LIBRARY.getImage(ICON_NAME_ACD_GROUP, 64, COLOR_OVERLAY_BUTTON);
            groupModel.logoIsAvatar = true;
        } 
        return groupModel;
    },

    selectLastSelectedGroup: function ()
    {
        var groupId = Number(this.preselectedGroupId || this.getLastSelectedGroupId());
        this.getStore().each(function (record)
        {
            if (Number(record.data.Id) === Number(groupId))
            {
                Ext.asap(() =>
                {
                    this.getSelectionModel().deselect(record);
                    this.getSelectionModel().select(record);    
                }, this);
            }
        }, this);
    },

    setNumber: function (number)
    {
        this.number = number;
    },

    setContact: function (contact)
    {
        this.contact = contact;
    },

    onKeyPress: function (self, record, item, index, event, opts)
    {
        if (event.keyCode >= 48 && event.keyCode <= 57) {
            self.getStore().each(function (record, index) {
                if (record.data.shortCut === String(event.keyCode - 48)) {
                    self.getSelectionModel().deselect(record);
                    self.getSelectionModel().select(index);
                }
            });
        }
        this.callParent(arguments);
    },

    selectContact: function (self, record, item, index, event, opts)
    {
        this.dial(record.data.Id);
    }
});

Ext.define('SelectOutboundGroupContainer',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    margin: '5',
    //flex: 1,
    scrollable: 'vertical',
    overlayButtons: true,
    
    initComponent: function ()
    {
        this.callParent();

        this.contactContainer = Ext.create('Ext.Container',
        {
            layout: 
            {
                type: 'vbox',
                align: 'stretch'
            }
        });
        
        this.contactOrNumberLabel = Ext.create('Ext.form.Label',
        {
            margin: '0 15 0 0',
            style: 'font-size:' + FONT_SIZE_HEADLINE + 'px;color: ' + COLOR_SUBTITLE
        });
        this.updateContact();

        this.list = Ext.create('OutboundGroupList',
        {
            groups: this.groups,
            number: this.number,
            contact: this.contact,
            preselectedGroupId: this.preselectedGroupId,
            parent: this,
            margin: '0 0 15 0',
            overlayButtons: this.overlayButtons
        });

        if (isValid(this.contact) || isValid(this.number))
        {
            this.add(Ext.create('Ext.Container',
            {
                margin: '5 0 0 0',
                layout:
                {
                    type: 'hbox',
                    align: 'stretch'
                },
                items:
                    [
                        this.contactOrNumberLabel,
                        this.contactContainer
                    ]
            }));
            this.add(Ext.create('Ext.form.Label',
            {
                style: 'font-size:' + FONT_SIZE_TITLE + 'px;color: ' + COLOR_MAIN_2,
                margin: '15 0 0 0',
                text: LANGUAGE.getString("callForGroup")
            }));
            this.add(this.createLine());

        }
        
        this.add(this.list);
    },

    updateContact: function ()
    {
        var possibleValues = [];
        if (isValid(this.contact))
        {
            possibleValues.push(this.contact.getDisplayName());
            possibleValues.push(this.contact.getCompany());
        }
        possibleValues.push(this.number);

        var uniqueValues = Ext.Array.unique(Ext.Array.clean(possibleValues));
        Ext.each(uniqueValues, function (value, index)
        {
            this.addLabelToContactContainer(value, index === 0 ? ("font-weight:600;font-size:" + FONT_SIZE_HEADLINE + "px") : ('font-size:' + FONT_SIZE_SUBTITLE + 'px'));
        }, this);

        var languageKey = 'contact';
        if (uniqueValues.length === 1 && isPhoneNumber(uniqueValues[0]))
        {
            languageKey = 'number';
        }
        this.contactOrNumberLabel.setText(LANGUAGE.getString(languageKey) + ":");
    },

    addLabelToContactContainer: function (text, style)
    {
        if (!isValidString(text))
        {
            return;
        }

        this.contactContainer.add(Ext.create('Ext.Component',
        {
            html: '<div style="color: ' + COLOR_SUBTITLE + ';' + style + '">' + text + '</div>'
        }));
    },

    createLine: function ()
    {
        return Ext.create('Ext.Component',
        {
            html: '<div style="margin-top:2px;height:1px;background-color:' + COLOR_SEPARATOR + '"></div>'
        });
    },
    
    focus: function ()
    {
        this.list.focus();
    },

    beforeCTIAction: function ()
    {
        this.parent.beforeCTIAction();
    },

    setNumber: function (number)
    {
        this.number = number;
        this.list.setNumber(number);
    },

    fillStore: function (groups)
    {
        this.list.fillStore(groups);
    },

    getSelectedRecords: function ()
    {
        return this.list.getSelectionModel().getSelection();
    },

    dial: function (groupId)
    {
        this.parent.dial(groupId);
    }
});

Ext.define('SelectOutboundGroupDialog',
{
    extend: 'ModalDialog',

    overlayButtons: true,
    
    initComponent: function ()
    {
        this.titleText = this.titleText || LANGUAGE.getString("outgoingCall");
        this.callParent();

        this.groupContainer = this.addToBody(Ext.create('SelectOutboundGroupContainer',
            {
                flex:1,
                number: this.number,
                contact: this.contact,
                groups: this.groups,
                preselectedGroupId: this.preselectedGroupId,
                beforeCTIAction: this.beforeCTIAction,
                parent: this,
                overlayButtons: this.overlayButtons
            }));

        this.addButton(this.getButtonConfig());
    },

    getButtonConfig: function ()
    {
        return {
            text: LANGUAGE.getString("dial"),
            handler: () =>
            {
                this.groupContainer.list.dialSelectedRecord();
            }
        };
    },

    getSelectedRecords: function ()
    {
        return this.groupContainer.getSelectedRecords();
    },

    dial: function (groupId)
    {
        CLIENT_SETTINGS.addSetting("CONTACT_CENTER", CLIENT_SETTINGS_KEY_LAST_SELECTED_GROUP_ID, groupId);
        CLIENT_SETTINGS.saveSettings();

        this.beforeCTIAction();

        var dialAction = Ext.create('CTIAction_Dial',
        {
            groupId: groupId,
            number: this.number,
            contact: this.contact
        });

        dialAction.run();
    }
});

Ext.define('CurrentOutboundGroup',
{
    extend: 'OutboundGroupList',

    flex: 1,

    overlayButtons: false,

    selectedItemCls: '',
    overItemCls: '',

    minWidth: undefined,

    ctiAction: null,

    initComponent: function ()
    {
        this.callParent();
        
        this.on('boxready', () =>
        {
            this.setHidden(Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getGroupsForOutbound()));

            SESSION.addListener(this);

            this.getStore().on('add', function (store, records, index)
            {
                Ext.each(records, function (record)
                {
                    var node = this.getNode(record);
                    var moreButtonContainer = Ext.get(node).down('.moreButton');

                    Ext.create('RoundThinButton', //FakeButton: Durch den singleClick-Listener ist eh ne Aktion festgelegt
                        {
                            iconName: 'more',
                            minWidth: 50,
                            renderTo: moreButtonContainer
                        });
                }, this);

            }, this);

            this.fillStore();
        }, this);
    },

    destroy: function ()
    {
        SESSION.removeListener(this);
        this.callParent();
    },

    onSingleClick: function ()
    {
        this.showSelectGroupDialog();
    },

    onDoubleClick: function ()
    {
        this.showSelectGroupDialog();
    },

    createRecordForMyContact: function ()
    {
        var me = this.callParent();
        me.shortCut = null;
        return me;
    },

    fillStore: function ()
    {
        if (!this.isStateOk())
        {
            return;
        }

        var lastSelectedId = Number(TIMIO_SETTINGS.getLastSelectedGroupId());
        if (this.selectedGroupId === lastSelectedId)
        {
            return;
        }
        
        this.getStore().removeAll();
        this.refresh();

        var group = CURRENT_STATE_CONTACT_CENTER.getGroup(lastSelectedId);
        if (isValid(group))
        {
            this.getStore().add(this.convertGroupForStore(group));
            this.selectedGroupId = lastSelectedId;
        }
        else
        {
            var recordForMe = this.createRecordForMyContact();
            if (isValid(recordForMe))
            {
                this.getStore().add(recordForMe);
            }
            this.selectedGroupId = -1;
        }       

        this.selectLastSelectedGroup();


        if (this.ctiAction)
        {
            this.ctiAction.groupId = this.selectedGroupId;
        }
    },
        
    showSelectGroupDialog: function ()
    {
        var self = this;
        var dialog = Ext.create('SelectOutboundGroupDialog',
            {
                overlayButtons: false,
                titleText: LANGUAGE.getString('callForGroup'),
                groups: CURRENT_STATE_CONTACT_CENTER.getGroupsForOutbound(),
                preselectedGroupId: TIMIO_SETTINGS.getLastSelectedGroupId(),
                getButtonConfig: function ()
                {
                    return {
                        text: LANGUAGE.getString("ok"),
                        handler: () =>
                        {
                            self.onDialogButtonPressed_OK(dialog);
                        }
                    };
                },
                dial: function (groupId)
                {
                    self.onDialogButtonPressed_OK(dialog);
                }
            });
        dialog.show();
    },

    onDialogButtonPressed_OK: function (dialog)
    {
        var records = dialog.getSelectedRecords();
        if (!Ext.isEmpty(records))
        {
            var record = records[0];
            if (this.ctiAction)
            {
                this.ctiAction.groupId = record.data.Id;
            }
            CLIENT_SETTINGS.addSetting("CONTACT_CENTER", CLIENT_SETTINGS_KEY_LAST_SELECTED_GROUP_ID, record.data.Id);
            CLIENT_SETTINGS.saveSettings();
        }
        

        dialog.hide();
        Ext.asap(() =>
        {
            this.fillStore();
        }, this);
    },

    onNewEvents: function (response)
    {
        if (isValid(response.getAgentConfiguration()))
        {
            this.fillStore();
        }

        if (Ext.isEmpty(CURRENT_STATE_CONTACT_CENTER.getGroupsForOutbound()))
        {
            this.hide();
        }
        else
        {
            this.show();
        }
    },

    getSelectedGroupId: function ()
    {
        if (CURRENT_STATE_CONTACT_CENTER.isContactCenterAvailableForMe())
        {
            return this.selectedGroupId;
        }
        return -1;
    }
});

Ext.define('CurrentOutboundGroupForDialogs',
{
    extend: 'CurrentOutboundGroup',

    onDialogButtonPressed_OK: function (dialog)
    {
        dialog.hide();
        Ext.asap(() =>
        {
            this.fillStore();
        }, this);
    }
});