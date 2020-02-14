/**
 * Created by jebing on 04.02.2015.
 */
Ext.define('OverlayButtons',
{
    extend: 'Ext.Container',

    renderToItem: null,

    initComponent: function ()
    {
        this.callParent();

        this.buttons = [];
    },

    insertButton: function (buttonConfig, index)
    {
        if (!isValid(buttonConfig))
        {
            return null;
        }

        var renderToItem = Ext.get(this.renderToItem);
        var initialButtonConfig = {
            renderTo: renderToItem,
            icon: buttonConfig.imageUrl,
            clickListener: buttonConfig.clickListener,
            tooltipText: buttonConfig.tooltipText,
            disabled: buttonConfig.disabled,
            hidden: buttonConfig.hidden,
            numberToDial: buttonConfig.numberToDial,
            parent: this,
            style: 'align-self:center'
        };
        if (buttonConfig.color)
        {
            initialButtonConfig.normalColor = buttonConfig.color;
        }
        
        /*
        if (!isValid(buttonConfig.color))
        {
            buttonConfig.color = COLOR_OVERLAY_BUTTON;
        }
        initialButtonConfig.color = buttonConfig.color;
        initialButtonConfig.normalColor = buttonConfig.normalColor || buttonConfig.color;
        initialButtonConfig.hoverColor = buttonConfig.hoverColor || buttonConfig.color;
        initialButtonConfig.normalTextColor = buttonConfig.normalTextColor || buttonConfig.color;
        initialButtonConfig.hoverTextColor = buttonConfig.hoverTextColor || buttonConfig.color;
        */
        if (buttonConfig.shouldBeVisible)
        {
            initialButtonConfig.shouldBeVisible = buttonConfig.shouldBeVisible;
        }
        var overlayButton = Ext.create(CLASS_NAME_OVERLAY_BUTTON, initialButtonConfig);
        this.buttons[index] = overlayButton;
        return overlayButton;
    },

    addButton: function (buttonConfig)
    {
        return this.insertButton(buttonConfig, this.buttons.length);
    },

    indexOf: function (button)
    {
        return this.buttons.indexOf(button);
    },

    removeFromRenderToItem: function ()
    {
        var self = this;
        Ext.each(this.buttons, function (overlayButton)
        {
            self.removeButton(overlayButton);
        });
    },

    removeButton: function (overlayButton)
    {
        var self = this;
        var buttonID = overlayButton.id;
        Ext.each(this.renderToItem.childNodes, function (child)
        {
            if (buttonID === child.id)
            {
                self.renderToItem.removeChild(child, true);
            }
        });
    },

    hideButtons: function ()
    {
        Ext.each(this.buttons, function (button)
        {
            button.hideButton();
        });
    },

    showButtons: function ()
    {
        Ext.each(this.buttons, function (button)
        {
            button.showButton();
        });
    },

    updateVisibilityOfAllButtons: function ()
    {
        this.showButtons();
    },

    onClickedOverlayButton: function (numberToDial)
    {
        this.parent.onStartAction(this.record, numberToDial);
    }
});