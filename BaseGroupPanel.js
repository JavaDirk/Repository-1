Ext.define('Ext.Caseris.FlexWrap', {
    extend: 'Ext.layout.container.Container',
    alias: 'layout.flexWrap',

    renderTpl: [
        /*'{%var oc,l=values.$comp.layout,oh=l.overflowHandler;' +
        'if (oh && oh.getPrefixConfig!==Ext.emptyFn) {' +
        'if(oc=oh.getPrefixConfig())dh.generateMarkup(oc, out)' +
        '}%}' +
        '<div id="{ownerId}-innerCt" data-ref="innerCt" role="presentation" class="{[l.innerCls]}' +
        '{[oh ? (" " + oh.getOverflowCls(l.direction)) : ""]}">' +
        '<div id="{ownerId}-targetEl" data-ref="targetEl" class="{targetElCls}" role="presentation">' +*/
        '{%this.renderBody(out, values)%}' +
        /*'</div>' +
        '</div>' +
        '{%if (oh && oh.getSuffixConfig!==Ext.emptyFn) {' +
        'if(oc=oh.getSuffixConfig())dh.generateMarkup(oc, out)' +
        '}%}',*/
        '',
        {
            disableFormats: true,
            definitions: 'var dh=Ext.DomHelper;'
        }
    ],

    doRenderBody: function (out, renderData)
    {
        // Careful! This method is bolted on to the renderTpl so all we get for context is 
        // the renderData! The "this" pointer is the renderTpl instance! 

        this.renderItems(out, renderData);
        this.renderContent(out, renderData);
    },

    setOwner: function (container)
    {
        var me = this;

        me.callParent(arguments);

        container.addCls('flex-container');
    }
});

Ext.define('PartnerBoard.BaseGroupPanel',
{
    extend: 'CollapsibleContainerWithHeader',
    
    type: '',
    memberList: [],
    titleText: '',
    collapsed: true,
    autoDestroy: false,
    currentContainer: {},
    margin: '5 0 10 5',
    border: false,
    parentContainer: {},
    allNormalContactTiles: [],
    allMiniContactTiles: [],
    allnormalContainers: [],
    allMiniContainers: [],
    cls: 'partnerGroup',
    
    headerBackground: 'transparent',
    cursor: 'normal',
    normalContactsContainer: {},
    miniContactsContainer: {},
    draggable: false,
    autoScroll: false,

    lineColor: BORDER_GREY,

    initComponent: function ()
    {
        var title = this.getGroupName(this.parentContainer.isTabView());
        this.titleText = title;
        this.title = title;
        this.iconCls = 'users';

        this.callParent();

        this.initial = true;
        var self = this;


        GLOBAL_EVENT_QUEUE.addEventListener(this);

        this.draggable = false;

        this.globalNormalString = '';
        this.globalMiniString = '';

        this.allNormalContactTiles = [];
        this.allMiniContactTiles = [];
        this.allnormalContainers = [];
        this.allMiniContainers = [];

        this.miniContactsContainer = this.add(new Ext.Container({
            cls: 'contactsContainer',
            scrollable: 'horizontal'
        }));

        this.normalContactsContainer = this.add(new Ext.Container({
            cls: 'contactsContainer',
            scrollable: 'horizontal'
        }));

        this.emptyTextComponent = this.add(new Ext.form.Label({
            hidden: true,
            text: LANGUAGE.getString('partnerBoardAddContacts'),
            style: {
                'margin': '10px 0',
                color: NEW_GREY,
                'font-size': FONT_SIZE_TITLE,
                'text-align': 'center',
                cursor: 'pointer'
            },
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        self.createSearchPanelForAddingPartner(self.emptyTextComponent.getEl());
                    }
                }
            }
        }));

        this.viewType = CLIENT_SETTINGS.getSetting('PARTNERS', 'contactView') || 'normal';

        SESSION.addListener(this);

        this.getHeader().hidden = this.parentContainer.isTabView();

        this.initial = false;
    },

    customizeHeader: function ()
    {
        if (this.parentContainer.isTabView())
        {
            this.addHeaderListeners();
        }
        else
        {
            this.fillHeader();
        }
    },

    addHeaderListeners: function ()
    {
        this.addContextMenuOnTab();
    },

    fillHeader: function ()
    {
        Ext.each(this.getAllTools(), function (tool)
        {
            this.getHeader().addTool(tool);
        }, this);
    },

    addContextMenuOnTab: function ()
    {
        var self = this;
        this.tab.on(
        {
            el:
            {
                contextmenu: function ()
                {
                    self.parentContainer.groupContainer.setActiveTab(self);

                    if (self.isACDGroup())
                    {
                        var menuItems = [[{
                            text: LANGUAGE.getString('loginNew'),
                            iconName: 'settings',
                            handler: function ()
                            {
                                createGroupConfigurationDialog();
                            }
                        }]];

                        self.showSettingsMenu(self.tab, menuItems);
                    }
                    else
                    {
                        self.showSettingsMenu(self.tab);
                    }
                }
            }
        });
    },

    getHeaderComponentsAfterTitle: function ()
    {
        return [];
    },

    getAllTools: function ()
    {
        return [this.createSettingsButton()];
    },

    createSettingsButton: function ()
    {
        var self = this;
        this.settingsButton = new ThinButton({
            margin: '0 15 0 0',
            icon: 'Images/64/more.png',
            scale: 'medium',
            listeners: {
                click: function (button)
                {
                    self.showSettingsMenu(button);
                },
                boxready: function (button)
                {
                    button.btnIconEl.setStyle({ backgroundSize: '20px 20px', transform: 'rotate(90deg) translate(1px)' });
                }
            }
        });
        return this.settingsButton;
    },

    onGlobalEvent_RemovePartner: function (partner)
    {
        if (this.group.getId() !== partner.getGroupId() || this.destroyed)
        {
            return;
        }
        
        var miniPartnerTile = this.getPartnerTile(this.miniContactsContainer, partner);
        this.setVisibilityOfTile(miniPartnerTile, false);
        
        var normalPartnerTile = this.getPartnerTile(this.normalContactsContainer, partner);
        this.setVisibilityOfTile(normalPartnerTile, false);
        

        var self = this;
        SESSION.removePartnerListItem(partner.getId(), function (response)
        {
            if (response.getReturnValue().getCode() === 0)
            {
                if (isValid(miniPartnerTile))
                {
                    self.miniContactsContainer.remove(miniPartnerTile);
                }
                if (isValid(normalPartnerTile))
                {
                    self.normalContactsContainer.remove(normalPartnerTile);
                }
                
                Ext.Array.remove(self.memberList, partner);

                Ext.each([self.allNormalContactTiles, self.allMiniContactTiles], function (tileContainer)
                {
                    Ext.reverseEach(tileContainer, function (tile, index)
                    {
                        if (tile.contact.getId() === partner.getId())
                        {
                            Ext.Array.removeAt(tileContainer, index);
                        }
                    });
                });
                
                self.updateEmptyTextComponent();
            }
            else
            {
                self.setVisibilityOfTile(normalPartnerTile, true);
                self.setVisibilityOfTile(miniPartnerTile, true);
                
                self.showError(response.getReturnValue().getDescription());
            }
        }, function ()
        {
            self.setVisibilityOfTile(normalPartnerTile, true);
            self.setVisibilityOfTile(miniPartnerTile, true);

            self.showError(LANGUAGE.getString("errorRemovePartnerListItem"));
        });
    },

    showError: function (text, errorLevel)
    {
        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '10 15 5 0',
            errorMessageText: text,
            errorType: errorLevel || ErrorType.Warning,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    },

    showConfirmation: function (confirmation)
    {
        confirmation.borderWidth = 1;
        confirmation.margin = '10 15 5 0';

        this.insert(0, Ext.create('ConfirmationComponent', confirmation));
    },

    setVisibilityOfTile: function (tile, visible)
    {
        if (isValid(tile, "el.dom"))
        {
            tile.el.dom.style.display = visible ? 'block' : 'none';
        }
    },

    updateEmptyTextComponent: function ()
    {
        if (Ext.isEmpty(this.memberList))
        {
            this.emptyTextComponent.show();
        }
        else
        {
            this.emptyTextComponent.hide();
        }
    },

    getPartnerTile: function (container, partner)
    {
        var result;
        container.each(function (partnerTile)
        {
            if(partnerTile.contact && partnerTile.contact.getId() === partner.getId())
            {
                result = partnerTile;
                return false;
            }
        });
        return result;
    },
    
    resolvePartners: function ()
    {
        var self = this;
        
        SESSION.resolvePartners(this.memberList, function (result)
        {
            if (isValid(result, 'getPartners()'))
            {
                self.memberList = result.getPartners();

                var sendResolvedEventToTile = function (tile, index)
                {
                    tile.onResolvedPartner(self.memberList[index]);
                };
                Ext.each(self.allNormalContactTiles, sendResolvedEventToTile);
                Ext.each(self.allMiniContactTiles, sendResolvedEventToTile);
            }
        }, function ()
        {

        });
    },

    showSettingsMenu: function (target, additionalMenuItems)
    {
        var contextMenu = Ext.create(this.getClassNameForContextMenu(),
        {
            parent: this,
            group: this.group,
            additionalMenuItems: additionalMenuItems,
            isTabView: this.parentContainer.isTabView()
        });
        contextMenu.showBy(target);
    },

    getClassNameForContextMenu: function ()
    {
        return 'GroupContextMenu';
    },

    onDeleteGroup: function ()
    {
        var self = this;
        this.expandContainer();
        this.insert(0, Ext.create('ConfirmationComponent',
        {
            yesCallback: function ()
            {
                var heightGroupPanel = animateDeleteEntry(self.el.dom, function ()
                {
                    SESSION.removeItem(self.group.getId(), function (result)
                    {
                        if (result.getReturnValue().getCode() === 0)
                        {
                            self.parentContainer.onRemoveGroup(self);
                        }
                        else
                        {
                            self.el.dom.style.opacity = 1;
                            self.el.setHeight(heightGroupPanel);

                            self.showError(result.getReturnValue().getDescription());
                        }
                    }, function ()
                        {
                            self.el.dom.style.opacity = 1;
                            self.el.setHeight(heightGroupPanel);

                            self.showError(LANGUAGE.getString("errorRemoveGroup"));
                        });
                });
            },
            noCallback: Ext.emptyFn,
            errorMessageText: LANGUAGE.getString('partnerBoardRemoveGroup', Ext.String.htmlEncode(self.group.getName())),
            borderWidth: 1,
            margin: '10 15 10 0'
        }));
    },

    onRenameGroup: function ()
    {
        var self = this;
        var dialog = new ModalDialog({
            titleText: LANGUAGE.getString("renameGroup")
        });

                var textField = dialog.addToBody(new Ext.form.field.Text({
                    style: 'background-color:' + PANEL_BACKGROUND_GREY,
                    emptyText: LANGUAGE.getString('enterGroupName'),
                    selectOnFocus: true,
                    value: self.group.getName(),
                    enableKeyEvents: true,
                    listeners:
                    {
                        specialKey: function (textfield, event)
                        {
                            var newGroupName = textField.getValue();
                            if (event.keyCode === KEY_ENTER && isValidString(newGroupName))
                            {
                                dialog.close();
                                self.renameGroup(newGroupName);
                            }
                        },

                change: function (textfield, newValue)
                {
                    renameButton.setDisabled(!isValidString(newValue));
                }
            }
        }));
        var renameButton = dialog.addButton({
            disabled: !isValidString(textField.getValue()),
            text: LANGUAGE.getString('rename'),
            listeners: {
                click: function ()
                {
                    dialog.close();
                    self.renameGroup(textField.getValue());
                }
            }
        });
        dialog.show();
    },

    createSearchPanelForAddingPartner: function ()
    {
        new SearchContactWindowForPartner(
        {
            partnerGroup: this
        }).show();
    },

    showMiniGroupsView: function ()
    {
        this.parentContainer.changeGroupViewStyle('mini');
    },

    showNormalGroupsView: function ()
    {
        this.parentContainer.changeGroupViewStyle('normal');
    },

    addNewGroup: function ()
    {
        this.parentContainer.createNewGroupDialog();
    },

    compromizeGroups: function ()
    {
        this.parentContainer.changeGroupCollapse(true);
    },

    expandGroups: function ()
    {
        this.parentContainer.changeGroupCollapse(false);
    },

    renameGroup: function (newName)
    {
        var name = this.parentContainer.isTabView() ? Ext.String.htmlEncode(newName) : newName;
        if (this.titleText === name || this.titleText === Ext.String.htmlEncode(name))
        {
            return;
        }
        this.titleText = name;

        if (this.groupNameLabel)
        {
            this.groupNameLabel.setText(this.titleText);
        }
        else
        {
            this.setTitle(name);
        }

        if (isValid(this.group))
        {
            this.group.setName(newName);
            
            this.renameGroupOnServer();
        }

        this.parentContainer.sortGroups();
        this.updateLayout();
    },

    renameGroupOnServer: function()
    {
        if (!isValid(this.group))
        {
            return;
        }
        var self = this;
        SESSION.updateGroup(this.group, function (result)
        {
            if (result.getReturnValue().getCode() !== 0)
            {
                self.showError(result.getReturnValue().getDescription());
            }
        }, function ()
        {
            self.showError(LANGUAGE.getString("errorRenameGroup"));
        });
    },

    getGroupSettingsJSON: function ()
    {
        var groupSettings = {};
        groupSettings.title = this.titleText;
        groupSettings.id = this.group.getId();
        groupSettings.collapsed = this.collapsed;
        groupSettings.viewType = this.viewType;
        return groupSettings;
    },

    //hier wird nicht mit ExtJS-Methode a la expand oder collapse gearbeitet, weil das unperformant ist (dauert bei einer großen Partnerleiste mit 40 Gruppen über eine Sekunde)
    //ExtJS vergibt nämlich absolute Positionen mit Hilfe des top-Attributs und muss daher bei einem collapse/expand das top-Attribut für alle Gruppen neu berechnen und setzen
    //deshalb setzen wir das top-Attribut per CSS auf "auto !important" und können daher hier einfach nur die Höhe der GRuppe ändern und sind fertig, weil der Browser
    //durch das "top:auto !important" die anderen Gruppen automatisch neu verschiebt
    expandContainer: function ()
    {
        if (this.parentContainer.isTabView())
        {
            return;
        }
        this.body.el.dom.style.display = 'block';
        this.updateLayout(); //ist nötig, weil folgender Fall sonst nicht funktioniert: alle zuklappen, Ansicht von normal auf mini (oder umgekehrt) schalten, dann alle erweitern

        this.el.dom.style.height = (this.header.el.dom.clientHeight + this.body.el.dom.clientHeight) + "px";
        this.collapsibleButton.setIconSrc('images/64/arrow_down.png');
    },
    minimizeContainer: function ()
    {
        if (this.collapsed)
        {
            return;
        }
        
        
        this.body.el.dom.style.display = 'none';
        this.el.dom.style.height = (this.header.el.dom.clientHeight + this.body.el.dom.clientHeight) + "px";

        this.collapsibleButton.setIconSrc('images/64/arrow_right.png');
    },

    listeners: {
        afterrender: function (panel)
        {
            panel.customizeHeader();
        },
        beforeclose: function (event)
        {
            event.removeAll(true);
        }
    },

    getContainerByViewType: function ()
    {
        if (this.isNormalViewType())
        {
            return this.normalContactsContainer;
        }
        else
        {
            return this.miniContactsContainer;
        }
    },

    

    createTiles: function(partners)
    {
        if (this.destroyed)
        {
            return;
        }

        this.addToMemberList(partners);

        this.redrawAllTiles();

        this.resolvePartners();
    },

    createContact: function (contact)
    {
        if (this.isNormalViewType())
        {
            this.allNormalContactTiles.push(new PartnerBoard.FullContactTile({
                contact: contact,
                groupSettings: this.groupSettings,
                groupPanel: this
            }));
        }
        else
        {
            this.allMiniContactTiles.push(Ext.create('PartnerBoard.MiniContactTile', {
                contact: contact,
                groupSettings: this.groupSettings,
                groupPanel: this
            }));
        }
    },

    addToMemberList: function (contacts)
    {
        Ext.each(contacts, function (contact) 
        {
            this.memberList.push(contact);
        }, this);

        this.memberList.sort(this.createCompareByNameFunction());
    },
           
    createCompareByNameFunction: function ()
    {
        return function (a, b)
        {
            var getName = function (record)
            {
                if (record.getLabel)
                {
                    return record.getLabel() || record.getName();
                }
                else
                {
                    return record.getName();
                }
            };
            var aLabel = getName(a);
            var bLabel = getName(b);
            
            return aLabel.localeCompare(bLabel);
        };
    },

    initializeGroup: function ()
    {
        var self = this;

        SESSION.getPartners(self.group.getId(), function (result)
        {
            if (result.getReturnValue().getCode() === 0)
            {
                if (result.getPartners().length > 0)
                {
                    self.normalizePartnerContacts(result.getPartners());

                    Ext.batchLayouts(function () 
                    {
                        self.createTiles(result.getPartners());
                    });
                }
                else
                {
                    self.updateEmptyTextComponent();
                }
            }
            else
            {
                self.showErrorMessage(result.getReturnValue().getDescription());
            }
            
        }, function ()
        {
            self.showErrorMessage(LANGUAGE.getString("errorGetPartners"));
        });
    },

    showErrorMessage: function(text)
    {
        this.add(new Ext.form.Label({
            text: text,
            style:
            {
                'margin': '10px 0',
                color: NEW_GREY,
                'font-size': FONT_SIZE_TITLE,
                'text-align': 'center'
            }
        }));
    },

    normalizePartnerContacts: function (partners)
    {
        Ext.each(partners, function (partner, index)
        {
            if (!isValid(partner.getContact()))
            {
                var contact = new www_caseris_de_CaesarSchema_Contact();
                contact.convertFromPartner(partner);
                partner.setContact(contact);
            }
            else
            {
                if ((!isValid(partner.getContact().getLastName()) && !isValidString(partner.getContact().getLastName())) && (!isValid(partner.getContact().getFirstName()) && !isValidString(partner.getContact().getFirstName())))
                {
                    var name = partner.getName().split(', ');
                    if (name.length > 1)
                    {
                        partner.getContact().setFirstName(name[1]);
                        partner.getContact().setLastName(name[0]);
                    }
                }
            }
        });
    },

    getGroupName: function (htmlEscape)
    {
        var title = this.group.getName();
        if (htmlEscape)
        {
            return Ext.String.htmlEncode(title);
        }
        return title;
    },
    
    setViewType: function (viewType)
    {
        this.viewType = viewType;
        if (this.viewType !== 'mini')
        {
            this.viewType = 'normal';
        }
        this.redrawAllTiles();
        this.updateLayout();
    },
    
    destroy: function ()
    {
        Ext.asap(function()
        {
            if (isValid(this, "getHeader().remove"))
            {
                Ext.each([this.settingsButton, this.collapsibleButton], function (button)
                {
                    if (button && button.isStateOk())
                    {
                        this.getHeader().remove(button);
                    }
                }, this);
            }

            Ext.destroy(this.dragTarget);

            GLOBAL_EVENT_QUEUE.removeEventListener(this);
            SESSION.removeListener(this);
            
            PartnerBoard.BaseGroupPanel.superclass.destroy.apply(this);
        }, this);
    },

    redrawAllTiles: function ()
    {
        var self = this;
        Ext.batchLayouts(function ()
        {
            self.redrawAllTilesWrapped();
        });
    },

    redrawAllTilesWrapped: function ()
    {
        Ext.each([this.allNormalContactTiles, this.allMiniContactTiles], function (tileList)
        {
            Ext.each(tileList, function (tile)
            {
                Ext.asap(function()
                {
                    tile.destroy();
                });
            });
        });
        this.allNormalContactTiles = [];
        this.allMiniContactTiles = [];

        var self = this;
        Ext.each(this.memberList, function (member)
        {
            self.createContact(member);
        });

        this.normalContactsContainer.removeAll(false);
        this.miniContactsContainer.removeAll(false);

        var container = this.getContainerByViewType();
        container.add(this.collectAllTiles());
        
        if (!this.initial)
        {
            this.updateEmptyTextComponent();
        }
    },

    collectAllTiles: function ()
    {
        if (this.isNormalViewType())
        {
            return this.allNormalContactTiles;   
        }
        else
        {
            return this.allMiniContactTiles;
        }
    },

    onAddedByUser: function ()
    {
        var partnerGroup = new www_caseris_de_CaesarSchema_PartnerListGroup();
        var self = this;
        if (self.destroyed)
        {
            return;
        }

        partnerGroup.setId('');
        partnerGroup.setPosition(0);
        partnerGroup.setSource(SOURCE_APPLICATION);
        partnerGroup.setName(this.group.getName());

        SESSION.updateGroup(partnerGroup, function (result)
        {
            if (result.getReturnValue().getCode() === 0)
            {
                partnerGroup.setId(result.getGroupId());
                self.group = partnerGroup;
            }
            else
            {
                self.showError(result.getReturnValue().getDescription());
            }

        }, function (result)
        {
            self.showError(LANGUAGE.getString("errorUpdateGroup"));
        });
    },


    onNewEvents: function (response)
    {
        var list = [this.allNormalContactTiles, this.allMiniContactTiles];
        Ext.each(list, function (tileList)
        {
            Ext.each(tileList, function (tile)
            {
                if (isValid(tile, 'onNewEvents'))
                {
                    tile.onNewEvents(response);
                }
            });
        });
    },

    onAgentContactsResolved: function (configuration)
    {

    },

    onNewAgentConfiguration: function(configuration)
    {
        
    },
   
    isACDGroup: function()
    {
        return false;
    },

    isNormalViewType: function()
    {
        return this.viewType === 'normal';
    }
});