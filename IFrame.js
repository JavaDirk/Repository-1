Ext.define('IFrame',
{
    extend: 'Ext.Container',
    emptyText: '',
    url: '',
    layout: 'fit',
    flex: 1,
    initial: true,

    initComponent: function ()
    {
        this.title = this.title || LANGUAGE.getString("form").toUpperCase();

        this.callParent();

        var self = this;

        if (isValidString(this.url))
        {
            this.on('afterrender', function ()
            {
                self.addLoadListener();
                self.addErrorListener();
                if (!self.loaded)
                {
                    self.showLoadingMask();
                }
            });
            
            this.setHtml('<iframe class="innerIframe" width="100%" style="border:none" src="' + this.url + '"></iframe>');
        }
        else
        {
            this.emptyTextLabel = this.add(Ext.create('Ext.form.Label',
            {
                margin: '5 0 0 0',
                text: this.emptyText,
                style: 'color:' + COLOR_EMPTY_TEXT
            }));
        }
        
        this.on('resize', function (self, width, height)
        {
            var iframe = self.getIFrameEl();
            if (iframe) {
                iframe.height = height;
                iframe.width = width;
            }
        });
    },

    hideEmptyText: function ()
    {
        console.log("iframe::hideEmptyText", this.emptyTextLabel);
        if (this.isEmptyTextLabelValid())
        {
            this.emptyTextLabel.hide();
        }
    },

    setEmptyText: function (text)
    {
        if (this.isEmptyTextLabelValid())
        {
            this.emptyTextLabel.show();
            this.emptyTextLabel.setText(text);
        }
    },

    isEmptyTextLabelValid: function ()
    {
        return this.emptyTextLabel && this.emptyTextLabel.el && !this.emptyTextLabel.el.destroyed;
    },

    showIframe: function ()
    {
        var self = this;
        Ext.asap(function () {
            var iframe = self.getIFrameEl();
            if (iframe)
            {
                if (self.getHeight() > 0)
                {
                    iframe.height = self.getHeight();
                }
                if (self.getWidth() > 0)
                {
                    iframe.width = self.getWidth();
                }
            }
        });
        
    },

    addLoadListener: function ()
    {
        this.addIFrameListener("load", () =>
        {
            this.onLoadIframe();
        });
    },

    addErrorListener: function ()
    {
        this.addIFrameListener("error", () =>
        {
            this.onErrorIframe();
        });
    },

    addIFrameListener: function (eventName, handler)
    {
        var iframe = this.getIFrameEl();
        if (iframe)
        {
            if (iframe.addEventListener) {
                iframe.addEventListener(eventName, handler, true);
            }

            else if (iframe.attachEvent) {
                iframe.attachEvent('on' + eventName, handler);
            }
        }
    },

    getIFrameEl: function ()
    {
        var root = Ext.fly(this.id);
        if (isValid(root))
        {
            var iframes = getHTMLElements('iframe', false, this.id);
            if (iframes && iframes.length > 0) {
                return iframes[0];
            }
        }
        return null;
    },

    onErrorIframe: function ()
    {
        console.log("error!", arguments);
        this.hideLoadingMask();
    },

    onLoadIframe: function ()
    {
        console.log("on load");
        if (this.loaded)
        {
            return;
        }
        /*
        var loadingDiv = getHTMLElements('.loadingForm', false, this.id);
        if (loadingDiv && loadingDiv.length > 0) {
            loadingDiv[0].style.display = 'none';
        }
        */
        this.hideLoadingMask();

        this.onLoad();
        this.loaded = true;
        /*
        var newFrame = this.getIFrameEl();
        var keyHandler = function (event) { alert(JSON.stringify(event)); };

        var iframeDoc, UNDEF = "undefined";
        if (typeof newFrame.contentDocument != UNDEF)
        {
            iframeDoc = newFrame.contentDocument;
        } else if (typeof newFrame.contentWindow != UNDEF)
        {
            iframeDoc = newFrame.contentWindow.document;
        }
        if (typeof iframeDoc.addEventListener != UNDEF)
        {
            iframeDoc.addEventListener('keydown', keyHandler, false);
        } else if (typeof iframeDoc.attachEvent != UNDEF)
        {
            iframeDoc.attachEvent('onkeydown', keyHandler);  // OK IE7
        }
        */
    },

    onLoad: function ()
    {
        
    },

    postMessage: function (data, origin) {
        var iframeElement = this.getIFrameEl();
        if (isValid(iframeElement)) {
            iframeElement.contentWindow.postMessage(data, origin || "*");
        }
    },

    showLoadingMask: function ()
    {
        showBlackLoadingMask(this);
    },

    hideLoadingMask: function ()
    {
        hideLoadingMask(this);
    },

    updateUrl: function (url)
    {
        if (this.url === url)
        {
            return;
        }

        this.setUrl(url);
    },

    setUrl: function (url)
    {
        this.url = url;

        var iframeElement = this.getIFrameEl();
        if (iframeElement)
        {
            iframeElement.src = url;
        }
    }
});