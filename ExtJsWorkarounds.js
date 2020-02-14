Ext.view.View.prototype.reselect = function ()
{
    var records = this.getSelectionModel().getSelection();
    this.getSelectionModel().deselectAll();
    this.getSelectionModel().select(records);
};

Ext.view.View.prototype.applyEmptyText = function ()
{
    if (isValid(this.emptyEl))
    {
        this.emptyEl.innerHTML = this.emptyText;
    }
    else
    {
        if (this.isStateOk())
        {
            this.addEmptyText();
        }
    }
};

Ext.view.View.prototype.getRecordForNode = function (node)
{
    if (!isValid(node))
    {
        return null;
    }
    var record = this.getRecord(node);
    if (isValid(record))
    {
        return record;
    }
    var nodeForRecord = Ext.get(node).up(this.itemSelector);

    return isValid(nodeForRecord) ? this.getRecord(nodeForRecord) : null;
};

Ext.view.View.prototype.computeHeightOfTheFirstXRecords = function (maxNumberRecords)
{
    var height = 0;
    var nodes = this.getNodes();
    Ext.each(nodes, function (node, index)
    {
        var component = Ext.fly(node);
        if (isValid(component))
        {
            height += component.getHeight();
        }

        if (index === maxNumberRecords - 1)
        {
            return false;
        }
    });

    return height;
};

//in der for-schleife wurde über eine Liste (nodes) iteriert, aber dort auch auf eine andere (records) zugegriffen => das kann schiefgehen!

//Der Fehler tritt zumindest nicht auf (bei SelectOutboundGroupsDialog festgestellt), wenn man nach einem store.removeAll() ein refresh() auf die Liste aufruft
Ext.view.AbstractView.prototype.updateIndexes = function (startIndex, endIndex) {
    var nodes = this.all.elements,
        node,
        records = this.getViewRange(),
        i,
        myId = this.id;

    if (nodes.length !== records.length)
    {
        console.log("nodes.length: " + nodes.length + ", records.length: " + records.length);
        console.log("perhaps this.tpl and this.itemSelector doesn't fit together");
        console.log("or maybe you didn't do a this.refresh() after a this.getStore().removeAll()?");
        console.log("or maybe you didn't close a div tag?");
        console.log("nodes: ", nodes);
        console.log("records: ", records);
        Ext.each(records, function (record) {
            if (record.data.waitMessage)
            {
                console.log("waitMessage found in records!", record);
            }
        });
        return;
    }
    startIndex = startIndex || 0;
    endIndex = endIndex || ((endIndex === 0) ? 0 : (nodes.length - 1));
    for (i = startIndex; i <= endIndex; i++) {
        node = nodes[i];
        node.setAttribute('data-recordIndex', i);
        node.setAttribute('data-recordId', records[i].internalId);
        node.setAttribute('data-boundView', myId);
    }
};

Ext.event.Event.prototype.within = function (el, related, allowEl) {
    var t;
    if (el) {
        t = related ? this.getRelatedTarget() : this.getTarget();
    }
    if (!t || (allowEl === false && t === Ext.getDom(el))) {
        return false;
    }

    //begin Änderung
    if (!Ext.fly(el))
    {
        return false;
    }
    //end Änderung

    return Ext.fly(el).contains(t);
};

Ext.menu.Item.prototype.onBoxReady = function ()
{
    if (isValid(this, "itemEl.dom"))
    {
        this.itemEl.dom.removeAttribute('href'); //das verhindert, dass die MenuItems  draggable sind, weil der Browser denkt, dass da ja ein Link dahintersteckt
    }
};

Ext.Array.reverseEach = function (array, fn, scope)
{
    return Ext.each(array, fn, scope, true);
};

Ext.reverseEach = Ext.Array.reverseEach;


Ext.Container.prototype.isEmpty = function ()
{
    if (!isValid(this, "items.items"))
    {
        return true;
    }
    return this.items.items.length === 0;
};

Ext.Container.prototype.each = function (fn, scope)
{
    if (!isValid(this, "items.items"))
    {
        return;
    }
    Ext.each(this.items.items, fn, scope);
};

Ext.Container.prototype.reverseEach = function (fn, scope)
{
    if (!isValid(this, "items.items"))
    {
        return;
    }
    Ext.each(this.items.items, fn, scope, true);
};

Ext.Container.prototype.indexOf = function (element)
{
    if (!isValid(this, "items.items"))
    {
        return -1;
    }
    var foundIndex = -1;
    Ext.each(this.items.items, function (item, index)
    {
        if (item === element)
        {
            foundIndex = index;
            return false;
        }
    });
    return foundIndex;
};

Ext.Container.prototype.replace = function (item1, item2)
{
    var index = this.indexOf(item1);
    if (index !== -1)
    {
        this.remove(item1);
        this.insert(index, item2);
    }
};

Ext.Container.prototype.contains = function (element)
{
    return this.indexOf(element) >= 0;
};

Ext.tab.Panel.prototype.each = function (fn, scope)
{
    if (!isValid(this, "items.items"))
    {
        return;
    }
    Ext.each(this.items.items, fn, scope);
};

Ext.tab.Panel.prototype.reverseEach = function (fn, scope)
{
    if (!isValid(this, "items.items"))
    {
        return;
    }
    Ext.each(this.items.items, fn, scope, true);
};

Ext.tip.ToolTip.prototype.isAnotherDialogVisibleWithHigherZIndex = function ()
{
    var self = this;
    if (!isValid(self, "el.dom"))
    {
        return false;
    }

    var myZIndex = self.el.dom.style['z-index'];
    if (!isValidString(myZIndex))
    {
        return false;
    }

    var result = false;

    var dialogs = getHTMLElements('.x-layer');
    Ext.each(dialogs, function (dialog)
    {
        var dialogIsNormalTooltip = dialog.className.indexOf('x-tip') >= 0 && dialog.className.indexOf(self.cls) === -1;
        var dialogIsInvisible = dialog.style.display === 'none' || dialog.style.visibility === "hidden";
        if (dialogIsNormalTooltip || dialogIsInvisible)
        {
            return;
        }

        var dialogZIndex = dialog.style.zIndex;

        if (Number(dialogZIndex) > Number(myZIndex))
        {
            result = true;
        }
    });
    return result;
};

Ext.override(Ext.dom.Element,
{
    focus: function (defer, dom)
    {
        var me = this;

        // begin added by DB: Im Anfragemanagement haten wir den Fall, dass wenn manrecht schnell "Antworten"-"Abbrechen"-"Antworten" drückt, ExtJS versucht hat, ein iframe zu fokussieren, welches schon zerstört war
        if (me.destroyed)
        {
            return null;
        }
        //end
        dom = dom || me.dom;
        if (Number(defer))
        {
            Ext.defer(me.focus, defer, me, [
                null,
                dom
            ]);
        } else
        {
            Ext.GlobalEvents.fireEvent('beforefocus', dom);
            dom.focus();
        }
        return me;
    }
});

Ext.override(Ext.button.Button,
{
    clearTip: function ()
    {
        var me = this,
            el = me.el;
        if (Ext.quickTipsActive && Ext.isObject(me.tooltip))
        {
            Ext.tip.QuickTipManager.unregister(el);
        } else
        {
            if (el && el.dom) //added
            {
                el.dom.removeAttribute(me.getTipAttr());
            }
        }
    },

    transformHandler: function()
    {
        //hier wird es schräg: warum wird hier der handler des Buttons quasi neu gesetzt, aber trotzdem der eigentliche handler aufgerufen?
        //Fall: Man macht den Browser klein, so daß ExtJs einen More-Button anzeigt, der die Buttons in einem Menu anzeigt. Dazu konvertiert
        //er Buttons in menuItems und kopiert die Handler, aber nur wenn hasOwnProperty('handler') zutrifft, also nicht ererbt wurde
        //deshalb wird hier der handler neu gesetzt, so daß hasOwnProperty true ergibt
        var handler = this.handler;
        if(handler)
        {
            this.handler = () =>
            {
                handler.bind(this)();
            };
        }        
    }
    });

Ext.Component.override(
{
    onRender: function ()
    {
        this.callParent(arguments);

        this.el.set({TEST_ROLE: this.TEST_ROLE || this.$className});
    },

    isStateOk: function ()
    {
        return isStateOk(this);
    }
    });

Ext.panel.Panel.override(
{
    doPlaceholderExpand: function (nonAnimated)
    {
        nonAnimated = nonAnimated === true;
        var me = this,
            placeholder = me.placeholder,
            collapseTool = me.collapseTool,
            expandTool = placeholder.expandTool;
        if (nonAnimated)
        {
            Ext.suspendLayouts();
            me.show();
        }
        // the ordering of these two lines appears to be important in
        // IE9.  There is an odd expand issue in IE 9 in the border layout
        // example that causes the index1 child of the south dock region
        // to get 'hidden' after a collapse / expand cycle.  See
        // EXTJSIV-5318 for details
        me.el.removeCls(Ext.panel.Panel.floatCls);
        placeholder.hide();
        if (nonAnimated)
        {
            Ext.resumeLayouts(true);
        } else
        {
            // The center region has been left in its larger size, so a layout is needed now
            me.updateLayout();
        }
        // This part is quite tricky in both animated and non-animated sequence.
        // After the panel is collapsed we will show the placeholder,
        // but by that time we had already lost the previous focus state.
        // The subsequent onFocusEnter on the placeholder will thusly reset
        // placeholder's previousFocus property to null; so when we hide
        // the placeholder after expanding the panel again, it can't throw focus
        // back to the panel header by iself.
        // This is why we nudge it a little here; the assumption is that
        // if panel expansion has been caused by keyboard action
        // on focused placeholder expand tool, then the logical focus transition
        // is to panel header's collapse tool.
        if (me.focusHeaderCollapseTool && collapseTool)
        {
            collapseTool.focus();
        }
        me.focusHeaderCollapseTool = false;
        if (placeholder.ariaEl.dom) //Edit: Dirk: check eingebaut, damit der bei dauernden resizes nicht kracht
        {
            placeholder.ariaEl.dom.setAttribute('aria-expanded', true);
        }
        
        me.ariaEl.dom.setAttribute('aria-expanded', true);
        if (expandTool && expandTool._ariaRole)
        {
            expandTool.ariaEl.dom.setAttribute('role', expandTool._ariaRole);
            expandTool.ariaEl.dom.setAttribute('aria-label', expandTool._ariaLabel);
            expandTool._ariaRole = expandTool._ariaLabel = null;
        }
        me.isCollapsingOrExpanding = 0;
        me.fireEvent('expand', me);
        me.fireEvent('endfloat', me);
    }
});