Ext.define('PartnerBoard.BaseACDOverviewTile',
{
    extend: 'PartnerBoard.BaseTile',
    
    initComponent: function()
    {
        this.callParent();

        this.updateWaitForCall(this.dashBoardData.waitForCall);
        var self = this;
        this.on('afterrender', function ()
        {
            self.update(self.dashBoardData);
        });
        
    },

    onNewEvents: function (response)
    {
        var me = this;

        if (isValid(response.getDashboardCounters()))
        {
            var dashboardValueForMe = false;
            Ext.iterate(response.getDashboardCounters(), function (dashboardCounter, index)
            {
                var groupID = dashboardCounter.getGroupId();

                if (groupID === me.groupId)
                {
                    dashboardValueForMe = true;
                    me.dashBoardData = CURRENT_STATE_CONTACT_CENTER.DashboardCounter.getAgentOverview(groupID);
                }
            });
            if (dashboardValueForMe)
            {
                me.update(me.dashBoardData);
            }
        }

        if (isValid(response, "getDashboardTimeSpans()"))
        {
            Ext.iterate(response.getDashboardTimeSpans(), function (dashboardTimeSpan)
            {
                me.updateDashboardTimeSpan(dashboardTimeSpan);
            });
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
        if (type !== "CurCallsLongestWaitTime")
        {
            return;
        }

        var dashboardValue = dashboardTimeSpan.getValue();
        
        this.updateWaitForCall(dashboardValue);

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

                    this.updateWaitForCall(seconds);
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
    },

    updateWaitForCall: function (seconds)
    {
        if (isValid(this.waitForCallEl))
        {
            this.waitForCallEl.setText(convertSecondsToString(seconds));
        }
    },

    update: function (data)
    {
        if (!this.isStateOk())
        {
            return;
        }
        this.availableEl.setText(data.available);
        this.notAvailableEl.setText(data.notAvailable);
        this.postProcessingEl.setText(data.postProcessing);
        this.onPhoneEl.setText(data.onPhone);
    },

    initRenderData: function ()
    {
        var data = this.callParent();
        data.available = 0;
        data.notAvailable = 0;
        data.postProcessing = 0;
        data.onPhone = 0;
        return data;
    }
});