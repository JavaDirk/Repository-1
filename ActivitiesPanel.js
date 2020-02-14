Ext.define('ActivitiesPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'hbox',
        align: 'stretch'
    },

    scrollable: 'vertical',

    flex: 1,

    ctiJournalCount: -1,
    acdJournalCount: -1,
    waitedLongEnough: false,

    initComponent: function ()
    {
        this.title = LANGUAGE.getString("history").toUpperCase();

        var self = this;
        this.callParent();

        this.acdHistory = undefined;
        
        this.journalPanel = this.add(Ext.create('ContactJournalPanel',
        {
            flex: 1,
            hidden: true,
            contact: this.contact,
            onJournalLoaded: function (count)
            {
                self.ctiJournalCount = count;
                if (self.timeoutWasFired)
                {
                    self.onTimeout();
                }
            }
        }));

        this.callParent();

        if (isValid(this.initialCallEvent, "getACDCallInfo()"))
        {
            this.setACDCall(true);
        }
    },

    startTimer: function ()
    {
        if (isValid(this.timeoutID))
        {
            return; //timer wurde schon gestartet
        }
        var self = this;
        showBlackLoadingMask(self);
        self.timeoutWasFired = false;

        var timeoutFunction = function () {
            self.timeoutWasFired = true;
            self.onTimeout();
        };

        if (!isValid(this.isACD))
        {
            this.timeoutID = setTimeout(timeoutFunction, 1000);
        }
        else
        {
            timeoutFunction();
            this.timeoutID = -1;
        }
    },
    
    stopTimer: function ()
    {
        clearTimeout(this.timeoutID);
        this.timeoutID = null;

        hideLoadingMask(this);
    },

    setGroupIdForOutboundCall: function (groupId)
    {
        if (groupId && groupId > 0)
        {
            this.setACDCall(true);
        }
    },

    setACDCall: function (flag)
    {
        this.isACD = flag;

        if (this.timeoutID && this.timeoutID !== -1) {
            this.stopTimer();
            this.startTimer();
        }
    },

    isACDCall: function ()
    {
        return this.isACD;
    },
    
    onNewCallEvent: function (call, contact)
    {
        var self = this;

        if (call.isIdle() || call.isDisconnected())
        {
            return;
        }
        Ext.asap(function ()
        { //Ext.asap deswegen, weil sonst das ConversationsTabPanel über 500ms braucht, um ein neues CallPanel zu adden
            
            if (isValid(self.journalPanel, "setContactAndNumber"))
            {
                self.journalPanel.setContactAndNumber(contact, call.getNumber());
            }
        });

        if (isValid(call.getACDCallInfo()))
        {
            if (!isValid(this.historyPanel) && call.isACDHistoryAvailable())
            {
                this.historyPanel = Ext.create('ContactHistoryPanel', {
                    sender: call.getCaller(),
                    closable: true,
                    history: CURRENT_STATE_CALL.getUserHistory(call.getCallId()),
                    parentContainer: this
                });
                
                this.acdJournalCount = call.getCountACDHistory();
                this.onTimeout();
            }
        }
        if (call.isIdle())
        {
            hideLoadingMask(this);
        }
    },
        
    onTimeout: function ()
    {
        if (this.destroyed)
        {
            return;
        }
        hideLoadingMask(this);

        if (this.acdJournalCount > 0)
        {
            if (!this.contains(this.historyPanel))
            {
                this.add(this.historyPanel);
                this.journalPanel.setVisible(false);
            }
        }
        else if (this.ctiJournalCount > 0)
        {
            if (this.journalPanel.isHidden())
            {
                this.journalPanel.setVisible(true);
            }
        }
    },

    onActivitiesLoaded: Ext.emptyFn
});