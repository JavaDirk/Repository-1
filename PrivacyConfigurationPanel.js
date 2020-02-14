Ext.define('PrivacyConfigurationPanel', {
    extend: 'Ext.Container',
    layout: {type: 'vbox', pack: 'start', align: 'stretch'},
    privacyData: {},
    margin: "0 0 0 10",
    minWidth: 600,
    maxWidth: 800,
    maxHeight: 410,
    minHeight: 150,
    //flex: 1,
    initComponent: function ()
    {
        this.callParent();
        
        this.afterrenderFunction = function (checkbox)
        {
            checkbox.displayEl.setStyle({'margin-top': '0'});
            checkbox.boxLabelEl.setStyle({'margin-top': '0'});
            checkbox.bodyEl.setStyle({height: '20px', 'min-height': '20px'});
        };

        this.initialData = {};

        /*me.startPersonSearch('*', "[internal]", "All", "Begin", function (result)
        {
            if (result.getContacts())
            {
                var contacts = result.getContacts();
                var resultSet = contacts.map(function (c)
                {
                    return { name: c.getDisplayName(), id: c.getGUID() };
                });

                me.initialData = resultSet;
            }
        });*/


        this.add(this.subContent = Ext.create("Ext.Container", { cls: ["settingsTitle", "eclipsedText"], html: LANGUAGE.getString("privacy")}));
        this.leftContainer = Ext.create("Ext.Container", { cls: [], padding: "5 5 0 0", style: { "margin-top": "2px" }, flex: 1, layout: { type: 'vbox', pack: 'start', align: 'stretch' } });
        this.rightContainer = Ext.create("Ext.Container", { cls: [], style: { padding: "5px 5px 0px 6px" }, flex: 1, layout: { type: 'vbox', pack: 'start', align: 'stretch' } });
        this.mainPart = Ext.create("Ext.Container", { cls: [], flex: 1, layout: { type: 'hbox', pack: 'start', align: 'stretch' } });
        this.leftSide = this.leftContainer.add(Ext.create("Ext.form.FieldSet", {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1, padding: 5, title: LANGUAGE.getString("privacyAuthorizedPartner")
        }));
        this.rightSide = this.rightContainer.add(Ext.create("Ext.form.FieldSet", { layout: {
            type: 'vbox',
            align: 'stretch'}, scrollable: 'vertical', flex: 1, padding: "5 5 0 5", title: LANGUAGE.getString("privacyAuthorizedFor") + ":" }));


        this.add(this.mainPart);

        this.mainPart.add([this.leftContainer, this.rightContainer]);

        /*this.testData = {
            permissions: [
                {
                    type:"",contactId: 1, contactName: "&lt;Alle&gt;",
                    call: 0, redirect: 0, present: 0,
                    incomingCall: true, outgoingCall: true, callDuration: true,
                    pickup: false, callDiversion: false
                }
            ],
            chatsForbidden:false
        };*/

        this.createStores();
        this.addView();
        this.addComboBoxes();
        this.addConstraints();
        this.addPermissions();

        this.view.select(0);
        
    },
    addView: function () {
        var me = this;
        this.view = Ext.create("Ext.view.View", {
            style: {
                "margin-top": "5px"
            },
            flex: 1,
            scrollable: 'vertical',
            itemSelector: ".item-selector",
            selectedItemCls: "background-selected-item",
            disableSelection: false,
            tpl: new Ext.XTemplate("<div class='form-row'><tpl for='.'><div class='item-selector' style='padding:5px;cursor:pointer;'><tpl if='type==\"agents\"'>{[this.getIcon('user','display:inline-block;')]}</tpl><tpl if='type==\"groups\"'>{[this.getIcon('users','display:inline-block;')]}</tpl><tpl if='type==\"special\"'>{[this.getIcon('users','display:inline-block;')]}</tpl>{contactName}</div></tpl></div>", {
                getIcon: function (name, style) {
                    var icon = "<div style='" + style + "'><div style='background:url(" + IMAGE_LIBRARY.getImage(name, 64, DARKER_GREY) + ") no-repeat center;background-size: 16px 16px;width:16px;height:16px;position:relative;top:3px;margin-right:5px;'></div></div>";
                    return icon;
                }
            }),
            store: this.viewStore,
            listeners: {
                'beforecontainerclick': function () {
                    return false;
                },
                selectionchange: function (container, selection, index, index2) {
                    var x = selection[0] ? selection[0].data : { id: "-1" };
                    me.changeEntry(x);

                    if (selection.length <= 0)
                    {
                        return;
                    }

                    if (selection[0].data.type == "special") {
                        me.removeButton.setDisabled(true);
                    } else {
                        me.removeButton.setDisabled(false);
                    }
                }
            }
        });

        this.buttonContainer = Ext.create("Ext.Container", {
            layout: 'hbox',
            margin: '5 0 0 0',
            cls: ["form-row"]
        });
        this.saveButton = new RoundThinButton({
            margin: '0 0 5 0',
            iconName: "check",
            text: LANGUAGE.getString("passwordChangeOvertake"),
            disabled: true,
            listeners: {
                click: function (event)
                {
                    me.saveFunction(me.testData);

                    event.setDisabled(true);
                }
            }
        });
        this.addButton = new RoundThinButton({
            iconName: "add",
            text: LANGUAGE.getString("add"),
            listeners: {
                click: function (event) {
                    if (!me.picker || me.picker && !me.picker.el) {
                        me.getGroups(function (groups) {                        
                            me.picker = new ModalDialog({
                                titleText: LANGUAGE.getString('addToPrivacy'),
                                //maxWidth: 350,
                                listeners:
                                {
                                    hide: function () 
                                    {
                                        me.picker = null;
                                        me.userStore.removeAll();
                                    }
                                }
                            });
                            me.picker.addToBody(me.createUserPicker(groups));

                            me.picker.addButton({
                                minWidth: 125,
                                text: LANGUAGE.getString("add"),
                                margin: '0 5 0 0',
                                listeners: {
                                    click: function ()
                                    {
                                        if (me.selectedEntry.type && me.selectedEntry.data)
                                        {
                                            me.insertEntry(me.selectedEntry.type, me.selectedEntry.data);
                                            me.picker.hide();
                                            me.saveButton.setDisabled(false);
                                        }
                                    }
                                }
                            });
                            me.picker.show();
                        });
                    }
                }
            }
        });
        this.removeButton = new RoundThinButton({
            iconName: "remove",
            text: LANGUAGE.getString("remove"),
            listeners: {
                click: function () {
                    me.removeSelectedEntry();
                    me.saveButton.setDisabled(false);
                }
            }
        });

        this.buttonContainer.add([this.addButton, this.removeButton]);



        this.leftSide.add(this.view);
        this.leftSide.add(this.buttonContainer);

        this.add(Ext.create("Ext.Container", { layout: 'hbox', padding: '5', margin: "0 0 0 0", items: [this.saveButton]}));




    },
    addComboBoxes: function () {
        var me = this;
        this.rightSide.add(Ext.create("Ext.container.Container", { margin: "0 0 5 0", cls: ["settingsSubTitle"], html: LANGUAGE.getString("privacyStatus") + ":" }));
        this.telCombo = Ext.create("Ext.form.field.ComboBox", {
            fieldLabel: LANGUAGE.getString("privacyTel") + ":",
            maxWidth: 350,
            cls: ["normal-side-padding"],
            store: this.telStore,
            valueField: 'id',
            displayField: "name",
            queryMode: "local",
            editable: false,
            listeners: {
                change: function (instance, newValue, oldValue) {
                    
                    setTimeout(function () {
                        if (instance.getEl() && !instance.destroyed) {
                            me.selectedEntry.call = newValue;

                            instance.getEl().title = LANGUAGE.getString("privacyToolTipState");
                            //Ext.QuickTips.register({ target: instance.getEl(), text: LANGUAGE.getString("privacyToolTipState") });
                            me.updateLogic();
                        }
                     }, 100);
                    
                },
                select: function (instance, newValue, oldValue)
                {
                    if (newValue !== oldValue)
                    {
                        me.saveButton.setDisabled(false);
                    }
                }
            }
        });

        this.redCombo = Ext.create("Ext.form.field.ComboBox", {
            fieldLabel: LANGUAGE.getString("privacyRed") + ":",
            maxWidth: 350,
            cls: ["normal-side-padding"],
            store: this.redStore,
            valueField: 'id',
            displayField: "name",
            queryMode: "local",
            editable: false,
            listeners: {
                change: function (instance, newValue, oldValue) {
                    me.selectedEntry.redirect = newValue;
                    setTimeout(function () {
                        if (instance.getEl() && !instance.destroyed) {
                            instance.getEl().title = LANGUAGE.getString("privacyToolTipRedirect");
                        }
                    }, 100);
                },
                select: function (instance, newValue, oldValue)
                {
                    if (newValue !== oldValue)
                    {
                        me.saveButton.setDisabled(false);
                    }
                }
            }
        });

        this.preCombo = Ext.create("Ext.form.field.ComboBox", {
            fieldLabel: LANGUAGE.getString("privacyPre") + ":",
            maxWidth: 350,
            cls: ["normal-side-padding"],
            store: this.preStore,
            valueField: 'id',
            displayField: "name",
            queryMode: "local",
            editable: false,
            listeners: {
                change: function (instance, newValue, oldValue) {
                    me.selectedEntry.present = newValue;
                    setTimeout(function () {
                        if (instance.getEl() && !instance.destroyed) {
                            instance.getEl().title = LANGUAGE.getString("privacyToolTipPresence");
                        }
                    }, 100);
                },
                select: function (instance, newValue, oldValue)
                {
                    if (newValue !== oldValue)
                    {
                        me.saveButton.setDisabled(false);
                    }
                }
            }
        });


        this.rightSide.add([this.telCombo, this.redCombo, this.preCombo]);
    },
    addConstraints: function () {
        var me = this;

        this.rightSide.add(Ext.create("Ext.container.Container", { cls: ["form-full-col", "settingsSubTitle"], html: LANGUAGE.getString("privacyConstraints") + ":" }));
        this.constraint1 = Ext.create("Ext.form.field.Checkbox", {
            margin: 0, padding: 0,
            cls: ["form-full-col", "normal-side-padding", "label-limit-large"], disabled: false, boxLabel: "<div class='eclipsedText'>" + LANGUAGE.getString("privacyConstraint1") + "</div>", checked: false,
            handler: function (instance, newValue) {
                me.selectedEntry.incomingCall = newValue;
                me.saveButton.setDisabled(false);
            },
            listeners: {
                afterrender: function (checkbox) {
                    me.afterrenderFunction(checkbox);
                }
            }
        });
        this.constraint2 = Ext.create("Ext.form.field.Checkbox", {
            margin: 0, padding: 0,
            style: {"margin-top": "-5px"},
            cls: ["form-full-col", "normal-side-padding"],
            disabled: false,
            boxLabel: LANGUAGE.getString("privacyConstraint2"),
            checked: false,
            handler: function (instance, newValue) {
                me.selectedEntry.outgoingCall = newValue;
                me.saveButton.setDisabled(false);
            },
            listeners: {
                afterrender: function (checkbox) {
                    me.afterrenderFunction(checkbox);
                }
            }
        });
        this.constraint3 = Ext.create("Ext.form.field.Checkbox", {
            margin: 0, padding: 0,
            style: { "margin-top": "-5px" },
            cls: ["form-full-col", "normal-side-padding"], disabled: false, boxLabel: LANGUAGE.getString("privacyConstraint3"), checked: false,
            handler: function (instance, newValue) {
                me.selectedEntry.callDuration = newValue;
                me.saveButton.setDisabled(false);
            },
            listeners: {
                afterrender: function (checkbox) {
                    me.afterrenderFunction(checkbox);
                }
            }
        });
        this.rightSide.add([this.constraint1, this.constraint2, this.constraint3]);
    },
    addPermissions: function () {
        var me = this;
        this.rightSide.add(Ext.create("Ext.container.Container", {  cls: ["form-full-col", "settingsSubTitle"], html: LANGUAGE.getString("privacyPermissions") + ":" }));
        this.permission1 = Ext.create("Ext.form.field.Checkbox", {
            margin: 0, padding: 0,
            cls: ["form-full-col", "normal-side-padding"], disabled: false, boxLabel: LANGUAGE.getString("privacyPermission1"), checked: false,
            handler: function (instance, newValue) {
                me.selectedEntry.pickup = newValue;
                me.saveButton.setDisabled(false);
            },
            listeners: {
                afterrender: function (checkbox) {
                    me.afterrenderFunction(checkbox);
                }
            }
        });
        this.permission2 = Ext.create("Ext.form.field.Checkbox", {
            margin: 0, padding: 0,
            style: { "margin-top": "-5px" },
            cls: ["form-full-col", "normal-side-padding"], disabled: false, boxLabel: LANGUAGE.getString("privacyPermission2"), checked: false,
            handler: function (instance, newValue) {
                me.selectedEntry.callDiversion = newValue;
                me.saveButton.setDisabled(false);
            },
            listeners: {
                afterrender: function (checkbox) {
                    me.afterrenderFunction(checkbox);
                }
            }
        });
        this.rightSide.add([this.permission1, this.permission2]);
    },
    createStores: function () {
        this.viewStore = new Ext.data.Store({
            data: this.testData.permissions,
            sorters: [{
                property: 'contactName',
                direction: 'ASC'
            }]
        });


        this.telStore = new Ext.data.Store({
            data: [
                { id: 0, name: LANGUAGE.getString("privacyTelDontShow") },
                { id: 1, name: LANGUAGE.getString("privacyTelState")},
                { id: 2, name: LANGUAGE.getString("privacyTelNumberShort") },
                { id: 3, name: LANGUAGE.getString("privacyTelNumberAll") }
            ]
        });

        this.redStore = new Ext.data.Store({
            data: [
                { id: 0, name: LANGUAGE.getString("privacyRedDontShow") },
                { id: 1, name: LANGUAGE.getString("privacyRedState") },
                { id: 2, name: LANGUAGE.getString("privacyRedStateAndDestination") }
            ]
        });

        this.preStore = new Ext.data.Store({
            data: [
                { id: 0, name: LANGUAGE.getString("privacyPreDontShow") },
                { id: 1, name: LANGUAGE.getString("privacyPreState") },
                { id: 2, name: LANGUAGE.getString("privacyPreStateAndOfflineDuration") }
            ]
        });

        this.userStore = new Ext.data.Store({
            data: []
        });

        this.groupStore = new Ext.data.Store({
            data: []
        });

    },
    createUserPicker: function (groups) {
        var me = this;
        me.selectedEntry = {};
        me.groupStore.loadData(groups);
        var createSubPicker = function (type)
        {
            var searchFunction = function (isInitial)
            {
                if (type === "agents")
                {
                    if (!isInitial)
                    {
                        showBlackLoadingMask(view);
                        me.startPersonSearch(searchText.getValue(), "[internal]", Caesar.MatchFlag.All, Caesar.MatchType.Begin, function (result)
                        {
                            if (result.getContacts())
                            {
                                var contacts = result.getContacts();
                                if (Ext.isEmpty(contacts))
                                {
                                    me.picker.changeErrorMessage(LANGUAGE.getString("noContactsFound"), ErrorType.Info);
                                }
                                else
                                {
                                    var resultSet = contacts.map(function (c)
                                    {
                                        var mandant = "";
                                        var additionalAttributes = c.getAdditionalAttributes();
                                        Ext.each(additionalAttributes, function (additionalAttribute)
                                        {
                                            if (additionalAttribute.getKey() === "Mandant")
                                            {
                                                var tenants = additionalAttribute.getValues();
                                                if (tenants.length > 0)
                                                {
                                                    mandant = tenants[0];
                                                }
                                            }
                                        });
                                        return { name: c.getDisplayName() + (mandant ? ("/" + mandant) : ""), id: c.getGUID() };
                                    });

                                    me.userStore.loadData(resultSet, false);
                                }
                            }
                            else if (searchText.getValue() === "")
                            {
                                me.picker.changeErrorMessage(LANGUAGE.getString("noName"), ErrorType.Info);
                            }
                            else if (result.getReturnValue() && result.getReturnValue().getCode() !== 0)
                            {
                                me.picker.changeErrorMessage(result.getReturnValue().getDescription(), ErrorType.Error);
                            }
                            hideLoadingMask(view);
                        });
                        setTimeout(function ()
                        {
                            hideLoadingMask(view);
                        }, 5000);
                    }
                    else
                    {
                        setTimeout(function ()
                        {
                            me.userStore.loadData(me.initialData, false);
                        }, 100);

                    }
                } else
                {
                    me.groupStore.clearFilter(true);
                    me.groupStore.filter(function (x)
                    {
                        return x.data.name.indexOf(searchText.getValue()) > -1;
                    });
                }

            };


            var searchText = Ext.create("Ext.form.field.Text", {
                emptyText: LANGUAGE.getString("searchInColleagues"),
                flex: 1,
                listeners: {
                    specialkey: function (field, e)
                    {
                        if (e.getKey() === e.ENTER)
                        {
                            searchFunction();
                        }
                    }
                }
            });
            var subContent = Ext.create("Ext.Container",
                {
                    layout:
                    {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    focus: function ()
                    {
                        searchText.focus();
                    }
                });
            var searchButton = Ext.create('RoundThinButton',
                {
                    iconName: 'search',
                    minWidth: 75,
                    margin: '0 3 0 5',
                    padding: '2 10 2 10',
                    listeners:
                    {
                        click: function ()
                        {
                            searchFunction();
                        }
                    }
                });

            var view = Ext.create("Ext.view.View", {
                style: {
                    border: "1px solid #aaaaaa"
                },
                height: 9 * 27 + 2, // 9 Einträge a 27 Höhe + 2 für den Rand
                scrollable: 'vertical',
                itemSelector: ".item-selector",
                selectedItemCls: "background-selected-item",
                disableSelection: false,
                tpl: Ext.XTemplate("<div class='form-row'>" +
                                        "<tpl for='.'>" +
                                            "<div class='item-selector' style='padding:5px;cursor:pointer;'>" +
                                                "<div class='eclipsedText' style='display:flex:flex:1;'>{name}</div>" +
                                            "</div>" + 
                                        "</tpl>" + 
                                    "</div> ", 
                {

                }),
                store: type === "agents" ? me.userStore : me.groupStore,
                listeners: {
                    'itemdblclick': function (container, selection)
                    {
                        var x = selection ? selection.data : { id: "-1" };
                        me.insertEntry(type, x);
                        me.picker.hide();
                    },
                    'beforecontainerclick': function ()
                    {
                        return false;
                    },
                    selectionchange: function (container, selection)
                    {
                        var x = selection[0] ? selection[0].data : { id: "-1" };
                        me.selectedEntry = { type: type, data: x };
                    },
                    afterrender: function ()
                    {
                        setTimeout(function ()
                        {
                            searchFunction(true);
                        }, 100);

                    }
                }
            });

            if (type === 'agents')
            {
                subContent.add(Ext.create('Ext.Container',
                {
                    margin: '0 0 10 0',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [searchText, searchButton]
                }));
            }
            subContent.add(view);
            return subContent;
        };

        var subpickerForAgents = createSubPicker("agents");
        var panel = Ext.create('Ext.tab.Panel', {
            margin: '0 0 10 0',
            activeTab: 0,
            flex: 1,

            items: [
                {
                    title: LANGUAGE.getString("colleagues"),
                    bodyPadding: 10,
                    items: [subpickerForAgents]
                },
                {
                    title: LANGUAGE.getString("groups"),
                    bodyPadding: 10,
                    items: [createSubPicker("groups")]
                }
            ],

            focus: function ()
            {
                subpickerForAgents.focus();
            }
        });

        return panel;
    },

    insertEntry: function (type, entry) {
        var exists = this.viewStore.findBy(function (e) {
            return e.data.contactId == entry.id;
        });
        if (exists == -1)
        {
            var startType = '';

            if (type === 'agents')
            {
                startType = 'User';
            }
            else
            {
                startType = 'Group';
            }

            var data = {
                type: type, contactId: entry.id, contactName: entry.name,
                call: 1, redirect: 1, present: 2, startType: startType,
                incomingCall: false, outgoingCall: false, callDuration: true,
                pickup: false, callDiversion: false
            };

            this.testData.permissions[this.testData.permissions.length] = data;
            this.viewStore.loadData([data], true);
            this.view.select(this.viewStore.findBy(function (e) {
                return e.data.contactId == entry.id;
            }));
            this.view.focus(false, 200);
            this.saveButton.setDisabled(false);
        }
    },
    removeSelectedEntry: function () {
        var me = this;
        var sel = me.view.getSelection();
        if (sel[0].data.contactId != 1) {
            me.viewStore.remove(me.view.getSelection());
            var newData = [];
            var insertIndex = 0;
            for (var i = 0; i < this.testData.permissions.length; i++)
            {
                if (sel[0].data.contactId === this.testData.permissions[i].contactId)
                {
                    continue;
                }
                else
                {
                    newData[insertIndex] = this.testData.permissions[i];
                    insertIndex += 1;
                }
            }

            this.testData.permissions = newData;
        }
        me.view.select(0);
    },
    updateLogic: function () {
        var tel = this.telCombo.getValue();
        this.constraint1.setDisabled(true);
        this.constraint2.setDisabled(true);
        this.constraint3.setDisabled(true);
        
        if (tel == 1) {
            this.constraint3.setDisabled(false);
        } else if (tel > 1) {
            this.constraint1.setDisabled(false);
            this.constraint2.setDisabled(false);
            this.constraint3.setDisabled(false);
        }

    },
    changeEntry: function (selectedEntry) {
        if (selectedEntry.id == "-1") {
            return;
        }
        this.selectedEntry = selectedEntry;
        this.setUIElements(selectedEntry);
        this.updateLogic();
    },
    setUIElements: function (selectedEntry) {
        var isDisabled = this.saveButton.disabled;
        this.suspendLayout = true;
        this.telCombo.select(selectedEntry.call);
        this.redCombo.select(selectedEntry.redirect);
        this.preCombo.select(selectedEntry.present);

        this.constraint1.setValue(selectedEntry.incomingCall);
        this.constraint2.setValue(selectedEntry.outgoingCall);
        this.constraint3.setValue(selectedEntry.callDuration);

        this.permission1.setValue(selectedEntry.pickup);
        this.permission2.setValue(selectedEntry.callDiversion);

        

        this.saveButton.setDisabled(isDisabled);
        this.rightSide.setTitle(" <div class='eclipsedText' style='max-width:250px;'>" + LANGUAGE.getString("privacyAuthorizedFor") + ": " + selectedEntry.contactName + "</div>");
        this.suspendLayout = false;
    },
    selectNewEntry: function () {

    },
    listeners: {
        beforedestroy: function (event)
        {
            //event.saveFunction(event.testData);
        }
    }
});