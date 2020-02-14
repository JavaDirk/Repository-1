/**
 * Created by jebing on 04.02.2015.
 */
var CLASS_NAME_OVERLAY_BUTTON = 'overlayButton';

var OVERLAY_BUTTON_SIZE = 42;
var OVERLAY_BUTTON_MARGIN = 5;

Ext.define(CLASS_NAME_OVERLAY_BUTTON,
{
    extend: 'ThinButton',
    margin: '0 ' + OVERLAY_BUTTON_MARGIN,

    scale: 'smallMedium',
    height: OVERLAY_BUTTON_SIZE,
    width: OVERLAY_BUTTON_SIZE,
    clickListener: null,
    tooltipText: "",
    changeColorOnHover: true,
    hoverColor: WHITE,

    cls: CLASS_NAME_OVERLAY_BUTTON,
    
    initComponent: function ()
    {
        this.callParent();

        this.setStyle(this.disableButton ? "cursor:normal" : "");
        var self = this;

        this.on('click', function (item, event)
        {
            if (self.numberClicksToBeIgnored > 0)
            {
                self.numberClicksToBeIgnored--;
                return;
            }
            self.click();
        }, this, { delay: 100, buffer: true });

        //ein Button hat kein dblclick-Event, daher der Umweg ueber das el
        this.on(
        {
            el:
            {
                dblclick: function ()
                {
                    self.numberClicksToBeIgnored = 2;
                    self.click();
                }
            }
        });
        this.setStyle({ backgroundColor: "white" });
        this.on('mouseover', function ()
        {
            self.setStyle({ backgroundColor: COLOR_CALL_BUTTON_ON_HOVER.toString() });
        });
        this.on('mouseout', function ()
        {
            self.setStyle({ backgroundColor: "white" });
        });
        
        self.setStyle({ borderRadius: '100%', border: "1px solid " + COLOR_CALL_BUTTON_BORDER.toString() });

        this.hidden = !this.shouldBeVisible();
    },

    click: function ()
    {
        if (!isValid(this.clickListener))
        {
            return;
        }
        this.parent.onClickedOverlayButton(this.numberToDial);
        this.clickListener(this, this.parent, this.renderTo);
    },

    hideButton: function ()
    {
        try
        {
            if (!this.isStateOk())
            {
                return;
            }
            this.hide();
        }
        catch (exception)
        {
            console.warn("Exception occurred!", exception);
        }
    },

    showButton: function ()
    {
        try
        {
            if (!this.isStateOk())
            {
                return;
            }

            if (this.shouldBeVisible())
            {
                this.show();
            }
            else
            {
                this.hideButton();
            }
        }
        catch (exception)
        {
            console.warn("Exception occurred!", exception);
        }
    },

    shouldBeVisible: function ()
    {
        return true;
    }
});