Ext.define('SettingsInfoPanel',
{
    extend: 'SettingsBasePanel',

    layout:
    {
        type: 'vbox'
    },
    title: '',
    iconCls: 'info',
    margin: '0 0 0 5',

    initComponent: function ()
    {
        this.callParent();
        
        this.title = LANGUAGE.getString("info");

        var image = this.add(new Ext.Img(
        {
            margin: '10 0 10 5',
            listeners:
            {
                boxready: function(img)
                {
                    img.el.dom.onload = function ()
                    {
                        image.setHeight(this.height);
                        image.setWidth(this.width);
                    };
                }
            }
        }));
        image.setSrc(OEM_SETTINGS.getLogoSettings());

        var supportEmailTag = new Ext.Component(
        {
            html: '<a style="color:' + COLOR_MAIN_2 + '" target="_blank" href="mailto:' + OEM_SETTINGS.getSupportEMailAddress() + '">' + Ext.String.htmlEncode(OEM_SETTINGS.getSupportEMailAddress()) + '</a>'
        });

        var supportWebsiteTag = new Ext.Component(
        {
            html: '<a style="color:' + COLOR_MAIN_2 + '" target="_blank" href="' + OEM_SETTINGS.getSupportWebsite() + '">' + Ext.String.htmlEncode(OEM_SETTINGS.getSupportWebsite()) + '</a>'
        });

        this.add(this.createPair(LANGUAGE.getString("version") + ":", "14.02 (Build: #" + BUILD_NUMBER + ")"));
        this.add(this.createPair(LANGUAGE.getString("server") + ":", window.location.host));
        this.add(this.createPair(LANGUAGE.getString("secureConnection") + ":", window.location.protocol.indexOf("https") === 0 ? LANGUAGE.getString("yes") : LANGUAGE.getString("no")));

        this.add(new Ext.Component(
        {
            html: '<div style="margin-top:10px;"></div>'
        }));

        this.add(this.createLinkPair(LANGUAGE.getString('supportEmail') + ':', supportEmailTag));
        this.add(this.createLinkPair(LANGUAGE.getString('supportUrl') + ':', supportWebsiteTag));
    },

    createPair: function (key, value)
    {
        var label = Ext.create('Ext.form.Label',
        {
            text: key,
            width: 150,
            cls: 'settingsSubTitle'
            //style: 'font-size:' + FONT_SIZE_SUBTITLE + 'px;color: ' + COLOR_SUBTITLE + ";font-weight:lighter"
        });
        var label2 = Ext.create('Ext.form.Label',
        {
            text: value,
            style: 'font-size:' + FONT_SIZE_SUBTITLE + 'px;color: ' + COLOR_SUBTITLE + ";"
        });
        return Ext.create('Ext.Container',
        {
            layout: 'vbox',
            margin: '0 0 0 5',
            items: [label, label2]
        });

    },

    createLinkPair: function (key, valueItem)
    {
        var label = Ext.create('Ext.form.Label',
        {
            text: key,
            width: 150,
            cls: 'settingsSubTitle'
        });

        return Ext.create('Ext.Container',
        {
            layout: 'vbox',
            margin: '0 0 0 5',
            items: [label, valueItem]
        });
    },

    onOK: Ext.emptyFn,

    hasUnsavedChanges: function ()
    {
        return false;
    }
});
