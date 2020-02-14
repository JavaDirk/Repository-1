Ext.define('Action_OpenURL',
{
    extend: 'BaseAction',

    run: function (title)
    {
        this.executeURL(null, title);
    },

    isUrlAbsolute: function (url)
    {
        return /^(?:\/|[a-z]+:)/.test(url);
        /*
        if (url.indexOf('//') === 0) { return true; } // URL is protocol-relative (= absolute)
        if (url.indexOf('://') === -1) { return false; } // URL has no protocol (= relative)
        if (url.indexOf('.') === -1) { return false; } // URL does not contain a dot, i.e. no TLD (= relative, possibly REST)
        if (url.indexOf('/') === -1) { return false; } // URL does not contain a single slash (= relative)
        if (url.indexOf(':') > url.indexOf('/')) { return false; } // The first colon comes after the first slash (= relative)
        if (url.indexOf('://') < url.indexOf('.')) { return true; } // Protocol is defined before first dot (= absolute)
        return false; // Anything else must be relative
        */
    },

    executeURL: function (url, title)
    {
        url = url || this.getURL();
        if (isValidString(url))
        {
            switch (this.config.BrowserMode)
            {
                case ACTION_BROWSER_MODE_NONE:
                    var openedWindow = window.open(url, "_blank");
                    setTimeout(function ()
                    {
                        if (isValid(openedWindow))
                        {
                            openedWindow.close();
                        }
                    }, 10);
                    break;
                case ACTION_BROWSER_MODE_TIMIO:
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_OpenURL(url, title);
                    break;
                case ACTION_BROWSER_MODE_TIMIOCALL:
                    if (isValid(this.callPanel))
                    {
                        this.callPanel.openURL(url, title);
                    }
                    break;
                case ACTION_BROWSER_MODE_TIMIOCONTACT:
                    if (isValid(this.contactPanel))
                    {
                        this.contactPanel.openURL(url, title);
                    }
                    break;
                case ACTION_BROWSER_MODE_OUTSIDETIMIO:
                    if (this.config.OpenInSpecialWindow)
                    {
                        window.open(url, 'timio_OpenedByAction');
                    }
                    else
                    {
                        window.open(url);
                    }
                    break;
                default:
                    console.log("Unknown browser mode: ", this.config.BrowserMode);
                    break;
            }
        }
    },

    getURL: function ()
    {
        this.url = this.config.DataString;
        if (isValidString(this.url) && this.areAllConstraintsSatisfied())
        {
            if (!this.isUrlAbsolute(this.url))
            {
                this.url = location.protocol + "//" + this.url;
            }
            this.url = this.url.replace(ACTION_SPLITTER_SIGN, "");
            return this.substituteParametersInURL();
        }
        return "";
    },

    getIconName: function ()
    {
        return "world";
    },

    isActionAllowedByTimioFeature: function ()
    {
        return true;
    }
});
