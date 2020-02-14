function getWaitCursorTemplate(itemSeparator, borderTop, spinnerCls)
{
    borderTop = borderTop || ('border-top:1px solid ' + COLOR_SEPARATOR.toString());
    spinnerCls = spinnerCls || "spinner_black";
    return '<div class="waitMessage spinner ' + spinnerCls + ' ' + itemSeparator + '" style="' + borderTop + ';">' +
        '<div class="bounce1"></div>' +
        '<div class="bounce2"></div>' +
        '<div class="bounce3"></div> ' +
        '</div>';
}

function createInitialWaitCursor()
{
    var title = document.title;
    var subtitle = "";
    if (title !== "")
    {
        title = title.replace("by CAESAR", "");
        subtitle = "by CAESAR";
    }
    
    var currentUrl = new URL(window.location.href.toLowerCase());
    var tenant = currentUrl.searchParams.get('tenant');
    if (isValidString(tenant))
    {
        title = "";
        subtitle = "";
    }
    var html = '<div class="initialWaitMessage" style="display:flex;flex-direction:column;position:absolute;left:50%;top:50%;transform: translate(-50%, -50%);color:' + COLOR_MAIN_2 + ';">' +
        '<div style="display:flex;justify-content:center;align-items:baseline;font-family:Arial">' +
            '<div style="font-size:64px;font-weight:600">' + title + '</div>' +
            '<div class="waitMessageHideIfTooSmall" style="font-size:24px;margin-left:5px;width:135px;">' + subtitle + '</div>' +
        '</div>' +
        getWaitCursorTemplate(' ', ' ', 'spinner_dark_blue') +
        '</div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}


function hideInitialWaitCursor() 
{
    var waitMessage = document.getElementsByClassName("initialWaitMessage");
    Ext.each(waitMessage, function (element) {
        element.style.display = "none";
    });
}

createInitialWaitCursor();

