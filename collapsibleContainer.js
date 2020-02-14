/**
 * Created by martens on 19.05.2015.
 */
Ext.define('ExpandableContainer', {
    extend: 'Ext.Container',
    parentContainer: {},
    content: '',
    height: 0,
    margin: '0 0 5 0',
    isExpanded: false,
    containerHeight: -1,
    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    flex: 1,
    expandContainer: function () {

        this.containerHeight = this.content.getHeight();

        this.animate({
            to: {height: this.containerHeight},
            duration: 0
        });
        this.isExpanded = true;
    },
    closeWindow: function () {
        this.animate({
            to: {height: 0},
            duration: 1
        });
        this.isExpanded = false;

        this.setHeight(0);
    },
    listeners: {
        afterrender: function (event) {
            setTimeout(function () { event.expandContainer(); }, 100);
        }
    },
    initComponent: function () {
        var self = this;
        this.callParent();
        this.add(this.content);

        setTimeout(function () {
            self.parentContainer.add(self);
        }, 100);
    },
    updateContainer: function () {
        this.containerHeight = this.content.getHeight();
        this.setHeight(this.content.getHeight());
    }
});