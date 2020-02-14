Ext.define('ContainerWithPersistentSize',
{
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.ContainerWithPersistentSize',
    clientSettingsKey: "",
    initialSize: WIDTH_CALL_DISPLAY_PANEL,
    initialCollapsedState: 'expanded',
    sizeType: 'width',

    init: function (cmp)
    {
        this.setCmp(cmp);

        var self = this;
        var size = Number(CLIENT_SETTINGS.getSetting('CONTAINER_WITH_PERSISTENT_SIZE', self.clientSettingsKey)) || self.initialSize;
        if (this.sizeType === 'width')
        {
            cmp.setWidth(size || self.initialSize);
        }
        else
        {
            cmp.setHeight(size || self.initialSize);
        }

        this.region = cmp.region;

        var savedState = CLIENT_SETTINGS.getSetting('CONTAINER_WITH_PERSISTENT_SIZE', self.clientSettingsKey + "state") || self.initialCollapsedState;
        if (savedState === "collapsed")
        {
            Ext.asap(function () {
                cmp.collapse();
            });
        }
        
        cmp.on('collapse', function ()
        {
            CLIENT_SETTINGS.addSetting('CONTAINER_WITH_PERSISTENT_SIZE', self.clientSettingsKey + "state", "collapsed");
            CLIENT_SETTINGS.saveSettings();

            cmp.isCollapsed = true;
            self.ignoreNextResize = true;
        });
        cmp.on('expand', function ()
        {
            CLIENT_SETTINGS.addSetting('CONTAINER_WITH_PERSISTENT_SIZE', self.clientSettingsKey + "state", "expanded");
            CLIENT_SETTINGS.saveSettings();

            cmp.isCollapsed = false;

            self.ignoreNextResize = true;
        });
        cmp.on('resize', function (container, newWidth, newHeight, oldWidth, oldHeight)
        {
            if (self.ignoreNextResize)
            {
                self.ignoreNextResize = false;
                return;
            }
            if (!isValid(oldWidth) && !isValid(oldHeight)) {
                return;
            }
            if (cmp.isCollapsed)
            {
                return;
            }
            if (self.sizeType === 'width')
            {
                if (newWidth === oldWidth)
                {
                    return;
                }
            }
            else
            {
                if (newHeight === oldHeight)
                {
                    return;
                }
            }

            if (self.region !== cmp.region)
            {
                return;
            }
            var size = self.sizeType === 'width' ? newWidth : newHeight;
            CLIENT_SETTINGS.addSetting('CONTAINER_WITH_PERSISTENT_SIZE', self.clientSettingsKey, size);
            CLIENT_SETTINGS.saveSettings();
        });
    }
});