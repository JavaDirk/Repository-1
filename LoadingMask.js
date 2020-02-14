Ext.define('LoadingMask', {
    extend: 'Ext.Component',
    floating: true,
    xtype: 'loadingmask',
    
    

    initComponent: function ()
    {
        this.spinnerCls = this.spinnerCls || "";
        
        this.html = getWaitCursorTemplate('', ' ', this.spinnerCls);
        this.callParent();
    },

    style: 'position: absolute;top:50%;left:50%;transform: translate(-50%, -50%);z-index:10000000'
});

Ext.define('BlackLoadingMask', {
    extend: 'LoadingMask',
    spinnerCls: 'spinner_black',
    floating: false
});

Ext.define('WhiteLoadingMask', {
    extend: 'LoadingMask',
    spinnerCls: 'spinner_white',
    floating: false
});

Ext.define('BlueLoadingMask', {
    extend: 'LoadingMask',
    spinnerCls: 'spinner_blue',
    floating: false
});

Ext.define('DarkBlueLoadingMask', {
    extend: 'LoadingMask',
    spinnerCls: 'spinner_dark_blue',
    floating: false
});

function showBlackLoadingMask(element)
{
    showLoadingMask(element, "BlackLoadingMask");
}

function showBlueLoadingMask(element)
{
    showLoadingMask(element, "BlueLoadingMask");
}

function showDarkBlueLoadingMask(element)
{
    showLoadingMask(element, "DarkBlueLoadingMask");
}

function showWhiteLoadingMask(element)
{
    showLoadingMask(element, "WhiteLoadingMask");
}

function hideLoadingMask(element)
{
    showLoadingMask(element);
}

function showLoadingMask(element, className)
{
    if (!element)
    {
        return;
    }
    if (isValidString(className))
    {
        if (!element.loadingMask || !element.loadingMask.isVisible())
        {
            element.loadingMask = new window[className]({
                renderTo: element.el
            });
            element.loadingMask.show();
        }
    }
    else
    {
        if (element.loadingMask)
        {
            element.loadingMask.hide();
        }
    }
}

function isLoadingMaskVisible(element)
{
    if (element.loadingMask)
    {
        return element.loadingMask.isVisible();
    }
    return false;
}