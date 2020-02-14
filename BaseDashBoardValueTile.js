Ext.define('PartnerBoard.BaseDashBoardValueTile', {
    extend: 'PartnerBoard.BaseTile',

    dashBoardData: {},
    cls: 'partnerBackground ' + dashboardDataType.Neutral.value,

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            self.setValue(self.dashBoardData.value);

            self.el.dom.title = self.getTooltip();

            self.addCls(self.escalationLevel);
            
            self.el.dom.style.animation = self.initialAnimation;
        });
    },

    setTileBackground: function(color)
    {
        this.el.dom.style.backgroundColor = color;
        this.el.dom.style.borderColor = color;
    },

    initRenderData: function ()
    {
        var data = this.callParent();

        var title = this.dashBoardData.heading;
        var subTitle = this.dashBoardData.title;
        var imageName = "";

        if (DashBoardValues[this.dashBoardData.identifier])
        {
            imageName = DashBoardValues[this.dashBoardData.identifier].imageName;
        }
        else
        {
            console.log("Missing image for dashboardValue:", this.dashBoardData.identifier);
        }

        data.title = title;
        data.subtitle = subTitle;
        data.additionalStyleForParent = 'background-color:' + dashboardDataType[this.escalationLevel].color;
        data.tooltip = this.getTooltip();
        data.image = isValidString(imageName) ? IMAGE_LIBRARY.getImage(imageName, 64, WHITE) : "";
        

        return data;
    },

    getTooltip: function()
    {
        return this.groupPanel.getGroupName(false) + " - " + this.dashBoardData.tooltip;
    },

    setValue: function(value)
    {
        if (!isValid(this.valueEl) || this.destroyed)
        {
            return;
        }
        this.valueEl.setText(value);
    },

    onNewEvents: function (response)
    {
        var self = this;
        
        if (isValid(response, "getDashboardCounters()"))
        {
            Ext.iterate(response.getDashboardCounters(), function (dashboardCounter)
            {
                self.updateDashboardCounter(dashboardCounter);
            });
        }

        if (isValid(response, "getDashboardTimeSpans()"))
        {
            Ext.iterate(response.getDashboardTimeSpans(), function (dashboardTimeSpan)
            {
                self.updateDashboardTimeSpan(dashboardTimeSpan);
            });
        }

        if (isValid(response, "getDashboardPercentages()"))
        {
            Ext.iterate(response.getDashboardPercentages(), function (dashboardPercentage)
            {
                self.updateDashboardCounter(dashboardPercentage);
            });
        }
    },

    updateDashboardCounter: function (dashboardCounter)
    {
        var groupID = dashboardCounter.getGroupId();
        if (groupID !== this.groupId)
        {
            return;
        }
        var type = dashboardCounter.getType();
        if (type !== this.dashBoardData.identifier)
        {
            return;
        }
        this.setValue(dashboardCounter.getValue());

        var escalationLevel = dashboardDataType[dashboardCounter.getLevel()].color;
        var effect = dashboardDataLevel[dashboardCounter.getDisplay()].cls;

        if (isValid(this.el))
        {
            var cls = dashboardDataType[dashboardCounter.getLevel()].value;
            this.addCls(cls);
            this.el.dom.style.animation = effect;
        }
        else
        {
            this.initialBackgroundColor = escalationLevel;
            this.initialAnimation = effect;
        }
    },

    updateDashboardTimeSpan: function (dashboardTimeSpan)
    {
        var groupID = dashboardTimeSpan.getGroupId();
        if (groupID !== this.groupId)
        {
            return;
        }
        var type = dashboardTimeSpan.getType();
        if (type !== this.dashBoardData.identifier)
        {
            return;
        }

        var dashboardValue = dashboardTimeSpan.getValue();

        this.setValue(dashboardValue);

        if (dashboardValue === -1)
        {
            this.stopInterval(type, groupID);
            return;
        }

        if (dashboardTimeSpan.getAutoCount())
        {
            this.startInterval(type, groupID, dashboardValue);
        }
    },

    startInterval: function (type, groupID, initialValue)
    {
        this.stopInterval(type, groupID);

        var startDate = new Date();
        startDate.setSeconds(startDate.getSeconds() - initialValue);

        this.dashboardTimeSpanTimer = Ext.util.TaskManager.start(
        {
            interval: 1000,
            run: function ()
            {
                var now = new Date().getTime();
                var seconds = Math.floor((now - startDate.getTime()) / 1000);

                this.setValue(seconds);
            },
            scope: this
        });
    },

    stopInterval: function (type, groupID)
    {
        if (isValid(this.dashboardTimeSpanTimer))
        {
            Ext.util.TaskManager.stop(this.dashboardTimeSpanTimer);
            delete this.dashboardTimeSpanTimer;
        }
    }
});