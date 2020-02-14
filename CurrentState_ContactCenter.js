var ACD_GROUP_NAME = '_Name';
var ACD_GROUP_ID = '_Id';
var ACD_AGENTS_AVAILABLE = '_AgentsAvailable';
var ACD_AGENTS_NOT_AVAILABLE = '_AgentsNotAvailable';
var ACD_AGENTS_POST_PROCESSING = '_AgentsPostProcessing';
var ACD_AGENTS_IN_CALL = '_AgentsInCall';
var ACD_WAITING_FIELD_SIZE = '_WaitingFieldSize';
var ACD_WAITING_FIELD_TIME = '_WaitingFieldTime';
var ACD_WAITING_FIELD_SIZE_MAX = '_WaitingFieldSizeMax';
var ACD_WORKLOAD = '_Workload';
var ACD_WORKLOAD_MIN_LEVEL = '_WorkloadMinLevel';
var ACD_WORKLOAD_MAX_LEVEL = '_WorkloadMaxLevel';
var ACD_SERVICE_LEVEL = '_ServiceLevel';
var ACD_SERVICE_LEVEL_CRITICAL = '_ServiceLevelCritical';
var ACD_SERVICE_LEVEL_TARGET = '_ServiceLevelTarget';
var ACD_GROUP_STATE = '_GroupState';
var ACD_GROUP_MESSAGE = '_GroupMessage';
var ACD_GROUP_MIN_AGENTS = '_MinAgents';
var ACD_NUMBER_WORKING_AGENTS = '_NumberAgentsWorking';
var ACD_GROUP_ACTIVATED = '_GroupActivated';
var ACD_DASHBOARD_CALLS_ANSWERED = 'DayCallsAnswered';
var ACD_DASHBOARD_CALLS_VOICEBOX = 'DayCallsVoicebox';
var ACD_DASHBOARD_CALLS_LOST = 'DayCallsLost';
var ACD_DASHBOARD_CALLS_DROPPED = "DayCallsDropped";
var ACD_GROUP_ERROR = "_GroupError";

var ANNOUNCEMENT_NAME = "Name";
var ANNOUNCEMENT_ID = "AnnouncementId";
var ANNOUNCEMENT_LIST = "AnnouncementList";
var ANNOUNCEMENT_TEXT = "Text";
var ANNOUNCEMENT_READONLY = "ReadOnly";
var ANNOUNCEMENT_FREE_TEXT_ALLOWED = 'FreeTextAllowed';
var ANNOUNCEMENT_VOICE_MENU_ID = "VoiceMenuId";
var ANNOUNCEMENT_DEFAULT_VOICE_MENU_ID = "DefaultVoiceMenuId";
var ANNOUNCEMENT_DEFAULT_TEXT = "DefaultText";

var REDIRECTION_NAME = "Name";
var REDIRECTION_ID = "RedirectionId";
var REDIRECTION_LIST = "RedirectionList";
var REDIRECTION_TARGET = "Target";
var REDIRECTION_READONLY = "ReadOnly";
var REDIRECTION_FREE_TEXT_ALLOWED = 'FreeTextAllowed';
var REDIRECTION_VOICE_MENU_ID = "VoiceMenuId";

var GROUP_STATE_READ_ONLY = '_ReadOnly';
var GROUP_STATE = '_State';
var GROUP_ID = '_GroupId';

Ext.define('ACDGroupErrorMessage',
{
    group: null,

    getError: function () {
        if (!isValid(this.group))
        {
            return ACDGroupError.OK;
        }
            

        if (this.isDeactivated()) {
            return ACDGroupError.Deactivated;
        }
        else if (this.isServiceLevelCriticallyLow()) {
            return ACDGroupError.ServiceLevelCriticallyLow;
        }
        else if (this.isWorkloadTooHigh()) {
            return ACDGroupError.WorkloadTooHigh;
        }
        else if (this.isWorkloadTooLow()) {
            return ACDGroupError.WorkloadTooLow;
        }
        else if (this.isTooLessAgentsLoggedIn()) {
            return ACDGroupError.TooLessAgentsLoggedIn;
        }
        else if (this.isServiceLevelTooLow()) {
            return ACDGroupError.ServiceLevelTooLow;
        }
        else if (this.isWaitingFieldFull()) {
            return ACDGroupError.WaitingFieldFull;
        }

        return ACDGroupError.OK;
    },

    isDeactivated: function () {
        if (!isValid(this.group[ACD_GROUP_ACTIVATED])) {
            return false;
        }
        if (this.group[ACD_GROUP_ACTIVATED] === false) {
            return true;
        }
        return false;
    },

    isServiceLevelCriticallyLow: function () {
        if (!isValid(this.group[ACD_SERVICE_LEVEL]) || !isValid(this.group[ACD_SERVICE_LEVEL_CRITICAL])) {
            return false;
        }
        if (this.group[ACD_SERVICE_LEVEL] < this.group[ACD_SERVICE_LEVEL_CRITICAL]) {
            return true;
        }
        return false;
    },

    isServiceLevelTooLow: function () {
        if (!isValid(this.group[ACD_SERVICE_LEVEL]) || !isValid(this.group[ACD_SERVICE_LEVEL_TARGET])) {
            return false;
        }
        if (this.group[ACD_SERVICE_LEVEL] < this.group[ACD_SERVICE_LEVEL_TARGET]) {
            return true;
        }
        return false;
    },

    isWorkloadTooHigh: function () {
        if (!isValid(this.group[ACD_WORKLOAD]) || !isValid(this.group[ACD_WORKLOAD_MAX_LEVEL])) {
            return false;
        }
        if (this.group[ACD_WORKLOAD] > this.group[ACD_WORKLOAD_MAX_LEVEL]) {
            return true;
        }
        return false;
    },

    isWorkloadTooLow: function () {
        if (!isValid(this.group[ACD_WORKLOAD]) || !isValid(this.group[ACD_WORKLOAD_MIN_LEVEL])) {
            return false;
        }
        if (this.group[ACD_WORKLOAD] < this.group[ACD_WORKLOAD_MIN_LEVEL]) {
            return true;
        }
        return false;
    },

    isTooLessAgentsLoggedIn: function () {
        if (!isValid(this.group[ACD_GROUP_MIN_AGENTS]) || !isValid(this.group[ACD_NUMBER_WORKING_AGENTS])) {
            return false;
        }
        if (this.group[ACD_GROUP_MIN_AGENTS] > this.group[ACD_NUMBER_WORKING_AGENTS]) {
            return true;
        }
        return false;
    },

    isWaitingFieldFull: function () {
        if (!isValid(this.group[ACD_WAITING_FIELD_SIZE]) || !isValid(this.group[ACD_WAITING_FIELD_SIZE_MAX])) {
            return false;
        }
        if (this.group[ACD_WAITING_FIELD_SIZE] === 0 && this.group[ACD_WAITING_FIELD_SIZE_MAX] === 0) {
            return false;
        }
        if (this.group[ACD_WAITING_FIELD_SIZE] === this.group[ACD_WAITING_FIELD_SIZE_MAX]) {
            return true;
        }
        return false;
    }
});

Ext.define('CurrentState_ContactCenter',
{
    constructor: function () {
        this.dashboardEventStack = [];

        this.Agent = null;
        this.Agents = {};
        this.guid2AgentId = {};
        this.Groups = {};
        this.GroupCollections = {};
        this.Campaigns = {};
        this.Dashboards = {};
        this.Workloads = {};
        this.ServiceLevels = {};
        this.Announcements = {};
        this.Redirections = {};
        this.Options = {};
        this.BroadCastMessages = {};
        this.Calendars = {};

        this.CalendarSettings = {};
        this.OptionSettings = {};
        this.MessageOfTheDaySettings = {};

        this.BroadCastMessageSettings = {};

        this.AgentInfos = {};
        this.AnnouncementSettings = {};
        this.Skins = {};
        this.CharacteristicValues = {};
        this.DashboardPercentages = {};
        this.DashboardTimeSpans = {};
        this.DashboardCounter = {
            getMessageOverview: function (groupId)
            {
                var curDashboardCounters = this[groupId];
                
                var messageAgents = 0;
                var openMessages = 0;
                var editMessages = 0;
                var queuedMessages = 0;

                var hasData = false;

                if (isValid(curDashboardCounters, 'CurAgentsMessageActive'))
                {
                    messageAgents = curDashboardCounters.CurAgentsMessageActive.getValue();
                    hasData = true;
                }

                if (isValid(curDashboardCounters, 'CurMessagesInWork'))
                {
                    messageAgents = curDashboardCounters.CurAgentsMessageInWork.getValue();
                    hasData = true;
                }

                if (isValid(curDashboardCounters, 'CurMessagesOpen'))
                {
                    messageAgents = curDashboardCounters.CurAgentsMessageOpen.getValue();
                    hasData = true;
                }

                if (isValid(curDashboardCounters, 'CurMessagesWaiting'))
                {
                    messageAgents = curDashboardCounters.CurAgentsMessageWaiting.getValue();
                    hasData = true;
                }

                if (hasData)
                {
                    return {
                        messageAgents: messageAgents,
                        openMessages: openMessages,
                        editMessages: editMessages,
                        queuedMessages: queuedMessages
                    };
                }
                else
                {
                    return undefined;
                }
            },
            getAgentOverview: function (groupId)
            {
                var curDashboardCounters = this[groupId];

                var availableAgents = 0;
                var notAvailableAgents = 0;
                var postProcessingAgents = 0;
                var onPhoneAgents = 0;
                var loggedInAgents = 0;
                var waitForCall = 0;
                var waitingPersons = 0;

                var hasAgentData = false;


                if (isValid(curDashboardCounters, 'CurAgentsLoggedIn'))
                {
                    loggedInAgents = curDashboardCounters.CurAgentsLoggedIn.getValue();
                    hasAgentData = true;
                }

                if (isValid(curDashboardCounters, 'CurAgentsAvailable'))
                {
                    availableAgents = curDashboardCounters.CurAgentsAvailable.getValue();
                    hasAgentData = true;
                }

                if (isValid(curDashboardCounters, 'CurAgentsWorking'))
                {
                    onPhoneAgents = curDashboardCounters.CurAgentsWorking.getValue();
                    hasAgentData = true;
                }
                
                if (isValid(curDashboardCounters, 'CurAgentsPostProcessing'))
                {
                    postProcessingAgents = curDashboardCounters.CurAgentsPostProcessing.getValue();
                    hasAgentData = true;
                }

                if (isValid(curDashboardCounters, 'CurAgentsNotAvailable'))
                {
                    notAvailableAgents = curDashboardCounters.CurAgentsNotAvailable.getValue();
                    hasAgentData = true;
                }

                if (isValid(curDashboardCounters, 'CurCallsLongestWaitTime'))
                {
                    waitForCall = curDashboardCounters.CurCallsLongestWaitTime.getValue();
                    hasAgentData = true;
                }

                if (isValid(curDashboardCounters, 'CurCallsWaiting'))
                {
                    waitingPersons = curDashboardCounters.CurCallsWaiting.getValue();
                    hasAgentData = true;
                }

                /*if (hasAgentData)
                {
                    return {
                        loggedIn: loggedInAgents,
                        available: availableAgents,
                        notAvailable: notAvailableAgents,
                        postProcessing: postProcessingAgents,
                        onPhone: onPhoneAgents
                    };
                }
                else
                {
                    return undefined;
                }*/

                return {
                    loggedIn: loggedInAgents,
                    available: availableAgents,
                    notAvailable: notAvailableAgents,
                    postProcessing: postProcessingAgents,
                    onPhone: onPhoneAgents,
                    waitingPersons: waitingPersons,
                    waitForCall: waitForCall
                };
                
            }
        };

        this.GroupInfos = {};
        this.GroupStateSettings = {};
        this.QueueInfos = {};
        this.RedirectionSettings = {};
        

        //Listener for various Changes
        this.announcementListeners = [];
        this.redirectionListeners = [];
        this.dashboardListeners = [];
        this.groupListeners = [];
        this.agentStateListeners = [];
      
        this.eventListeners = [];

        if (window.GLOBAL_EVENT_QUEUE)
        {
            window.GLOBAL_EVENT_QUEUE.addEventListener(this);
        }
    },

    addEventListener: function (listener) {
        this.eventListeners.push(listener);
    },

    addAnnouncementListener: function (listener) {
        this.announcementListeners.push(listener);
    },

    addRedirectionListener: function (listener) {
        this.redirectionListeners.push(listener);
    },

    addDashboardListener: function (listener) {
        this.dashboardListeners.push(listener);
    },
    addGroupListener: function (listener) {
        this.groupListeners.push(listener);
    },
    addAgentStateListener: function (listener) {
        this.agentStateListeners.push(listener);
    },

    destroy: function () {
        //SESSION.removeListener(this);

        this.callParent();
    },

    dashListeners: [],
    addDashListener: function (listener) {
        this.dashListeners.push(listener)
    },
    fireDashListeners: function () {
        /*
        agent: { type: "agent", agentId:100 }
        group: { type: "group", groupId:8484 }
        value: { type: "value", valueName:"AllCalls", groupId: 8484 }
        */
        var currentItem = {};
        if (window.dashboard && window.dashboard.data && this.dashListeners.length>0) {
            while (true) {
                currentItem = this.dashboardEventStack.pop();
                if (!currentItem) return;
                for (var j = 0; j < this.dashListeners.length; j++) {
                    this.dashListeners[j].update(currentItem);
                }

            }
        } else if(!window.dashboard){
            this.dashboardEventStack = [];
        }
        
    },

    reset: function()
    {
        this.dashboardEventStack = [];

        this.Agent = null;
        this.Agents = {};
        this.guid2AgentId = {};
        this.Groups = {};
        this.Workloads = {};
        this.ServiceLevels = {};
        this.Announcements = {};
        this.Redirections = {};
        this.Options = {};
        this.BroadCastMessages = {};
        this.Calendars = {};

        this.CalendarSettings = {};
        this.OptionSettings = {};
        this.MessageOfTheDaySettings = {};

        this.BroadCastMessageSettings = {};

        this.AgentInfos = {};
        this.AnnouncementSettings = {};

        this.CharacteristicValues = {};
        this.DashboardPercentages = {};
        this.DashboardTimeSpans = {};

        this.GroupInfos = {};
        this.GroupStateSettings = {};
        this.QueueInfos = {};
        this.RedirectionSettings = {};


        //Listener for various Changes
        this.announcementListeners = [];
        this.redirectionListeners = [];
        this.dashboardListeners = [];
        this.groupListeners = [];

    },

    onLogin: function (response)
    {
        this.lastLoginResponse = response;

        if (response.getContactCenterLoginData && response.getContactCenterLoginData())
        {
            this.setContactCenterAvailability(response.getContactCenterLoginData().getAvailability());
        }
    },

    onLogoutSuccess: function(response)
    {
        if(response.getReturnValue().getCode() === 0)
        {
            this.reset();
        }
    },

    isContactCenterAvailable: function ()
    {
        if (this.contactCenterAvailability === ContactCenterAvailability.Available.value)
        {
            return true;
        }
        return false;
    },

    isContactCenterAvailableForMe: function ()
    {
        if (this.isContactCenterAvailable() && !this.amIDeactivated())
        {
            return true;
        }
        return false;
    },

    amIDeactivated: function ()
    {
        var agentInfo = this.getMyAgentInfo();
        if (agentInfo)
        {
            return agentInfo.getDeactivated();
        }
        return false;
    },

    mayILoggOff: function ()
    {
        if (isValid(this.contactCenterLoginData))
        {
            return this.contactCenterLoginData.getAllowLogOff();
        }
        return true;
    },

    isMailDispatcherAvailable: function ()
    {
        return this.mailDispatcherAvailbility;
    },

    getObjectTypeById: function (id){
        if (this["Groups"].hasOwnProperty(id)) return "Group";
        else if (this["GroupCollections"].hasOwnProperty(id)) return "GroupCollection";
        else if (this["Campaigns"].hasOwnProperty(id))return "Campaign";
    },

    setContactCenterAvailability: function (availability)
    {
        this.contactCenterAvailability = availability;
        if (!this.contactCenterAvailability)
        {
            this.contactCenterAvailability = ContactCenterAvailability.Available.value;
        }
    },

    updateContactCenterAvailability: function (getEventsResponse)
    {
        this.setContactCenterAvailability(getEventsResponse.getContactCenterAvailability());
    },

    onNewEvents: function (response)
    {
        this.updateContactCenterAvailability(response);
        
        if (!isValid(this.initializationResponse))
        {
            this.initializationResponse = response;
        }

        if (response.getContactCenterLoginData())
        {
            this.contactCenterLoginData = response.getContactCenterLoginData();
        }
        
        if (isValid(response.getAgentConfiguration())) {
            this.statisticsUrl = response.getAgentConfiguration().getStatisticUrl();
            this.onNewGroupConfiguration(response);
        }

        if (isValid(response.getMailProcessingAvailability()))
        {
            this.mailDispatcherAvailbility = response.getMailProcessingAvailability();
        }


        //Load Skins from AgentConfiguration
        try {
            if (isValid(response.getAgentConfiguration())) {
                var skinArray = response.getAgentConfiguration().getSkins();
                for (var i = 0; i < skinArray.length; i++) {
                    if (!this.Skins[skinArray[i].getId()] || !this.Skins[skinArray[i].getId()].FromAdmin) this.Skins[skinArray[i].getId()] = skinArray[i];
                }
                this.dashboardEventStack.unshift({ type: "configuration" });
            }
        } catch (e) {

        }
        

        var self = this;
        
        if (isValid(response.getAgentInfos()))
        {
            var agentInfos = response.getAgentInfos();
            if (isValid(response, "getAgentInfos().getAgentInfo()"))
            {
                agentInfos = response.getAgentInfos().getAgentInfo();
            }
            Ext.iterate(agentInfos, function (agentInfo, index) {
                self.AgentInfos[agentInfo.getAgentId()] = agentInfo;
                self.dashboardEventStack.unshift({ type: "agent", target: agentInfo.getAgentId() });
                self.fireDashListeners();
            });
        }

        var announcementSettings = response.getAnnouncementSettings();
        if (isValid(announcementSettings))
        {
            if (isValid(response, "getAnnouncementSettings()"))
            {
                announcementSettings = response.getAnnouncementSettings();
            }
            Ext.iterate(announcementSettings, function (announcementSetting, index) {
                self.AnnouncementSettings[announcementSetting.getAnnouncementId()] = announcementSetting;
                if (self.announcementListeners) {
                    Ext.iterate(self.announcementListeners, function (listener, index) { self.announcementListeners[index].onSettingsChange(announcementSetting); });
                }
            });
            
        }

        var optionSettings = response.getOptionSettings();
        if (isValid(optionSettings))
        { 
            if (isValid(response, "getOptionSettings().getOptionSetting()"))
            {
                optionSettings = response.getOptionSettings().getOptionSetting();
            }
            Ext.iterate(optionSettings, function (optionSetting, index) {
                self.OptionSettings[optionSetting.getOptionId()] = optionSetting;
            });

        }

        var calendarSettings = response.getCalendarSettings();
        if (isValid(calendarSettings))
        {
            if (isValid(response, "getCalendarSettings().getCalendarSetting()"))
            {
                calendarSettings = response.getCalendarSettings().getCalendarSetting();
            }
            Ext.iterate(calendarSettings, function (calendarSetting, index) {
                calendarSetting._Time = new Date().toLocaleString();
                self.CalendarSettings[calendarSetting.getCalendarId()] = calendarSetting;
            });

        }

        var messageOfTheDaySettings = response.getMessageOfTheDaySettings();
        if (isValid(messageOfTheDaySettings))
        {
            if (isValid(response, "getMessageOfTheDaySettings().getMessageOfTheDaySetting()"))
            {
                messageOfTheDaySettings = response.getMessageOfTheDaySettings();
            }
            Ext.iterate(messageOfTheDaySettings, function (messageOfTheDaySetting, index) {
                self.MessageOfTheDaySettings[messageOfTheDaySetting.getId()] = messageOfTheDaySetting;
                self.dashboardEventStack.unshift({ type: "message", target: messageOfTheDaySetting.getId() });
            });

        }

        var characteristicValues = response.getCharacteristicValues();
        if (isValid(characteristicValues))
        {
            if (isValid(response, "getCharacteristicValues().getCharacteristicValue()"))
            {
                characteristicValues = response.getCharacteristicValues().getCharacteristicValue();
            }
            Ext.iterate(characteristicValues, function (characteristicValue, index) {
                self.CharacteristicValues[characteristicValue.getCharacteristicID()] = characteristicValue;
            });
        }

        var dashboardCounters = response.getDashboardCounters();
        if (isValid(dashboardCounters))
        {
            if (isValid(response, "getDashboardCounters().getDashboardCounter()"))
            {
                dashboardCounters = response.getDashboardCounters().getDashboardCounter();
            }
            Ext.iterate(dashboardCounters, function (dashboardCounter, index) {
                var groupID = dashboardCounter.getGroupId();
                var dashboardCounters = self.DashboardCounter[groupID];

                if (isValid(dashboardCounters)) {
                    dashboardCounters[dashboardCounter.getType()] = dashboardCounter;
                    dashboardCounter.LastUpdate = new Date().getTime();
                }
                else {
                    self.DashboardCounter[groupID] = {};
                    self.DashboardCounter[groupID][dashboardCounter.getType()] = dashboardCounter;
                    dashboardCounter.LastUpdate = new Date().getTime();
                }
                self.dashboardEventStack.unshift({ type: "value", valueName: dashboardCounter.getType(), target: dashboardCounter.getGroupId() });
            });
            if (self.dashboardListeners)
            {
                Ext.iterate(self.dashboardListeners, function (listener, index)
                {
                    self.dashboardListeners[index].onSettingsChange(allCounters[0].getGroupId(), dashboardCounters);   
                });
            }
        }
        var dashboardPercentages = response.getDashboardPercentages();
        if (isValid(dashboardPercentages))
        {
            if (isValid(response, "getDashboardPercentages().getDashboardPercentage()"))
            {
                dashboardPercentages = response.getDashboardPercentages().getDashboardPercentage();
            }
            Ext.iterate(dashboardPercentages, function (dashboardCounter, index)
            {
                var groupID = dashboardCounter.getGroupId();
                var dashboardCounters = self.DashboardPercentages[groupID];

                if (isValid(dashboardCounters))
                {
                    dashboardCounters[dashboardCounter.getType()] = dashboardCounter;
                    dashboardCounter.LastUpdate = new Date().getTime();
                }
                else
                {
                    self.DashboardPercentages[groupID] = {};
                    self.DashboardPercentages[groupID][dashboardCounter.getType()] = dashboardCounter;
                    dashboardCounter.LastUpdate = new Date().getTime();
                }
                self.dashboardEventStack.unshift({ type: "value", valueName: dashboardCounter.getType(), target: dashboardCounter.getGroupId() });
            });
            if (self.dashboardListeners)
            {
                Ext.iterate(self.dashboardListeners, function (listener, index)
                {
                    self.dashboardListeners[index].onSettingsChange(allCounters[0].getGroupId(), dashboardPercentages);
                });
            }
        }

        var dashboardTimeSpans = response.getDashboardTimeSpans();
        if (isValid(dashboardTimeSpans))
        {
            if (isValid(response, "getDashboardTimeSpans().getDashboardTimeSpan()"))
            {
                dashboardTimeSpans = response.getDashboardTimeSpans().getDashboardTimeSpan();
            }
            Ext.iterate(dashboardTimeSpans, function (dashboardCounter, index)
            {
                var groupID = dashboardCounter.getGroupId();
                var dashboardCounters = self.DashboardTimeSpans[groupID];

                if (isValid(dashboardCounters))
                {
                    dashboardCounters[dashboardCounter.getType()] = dashboardCounter;
                    dashboardCounter.LastUpdate = new Date().getTime();
                }
                else
                {
                    self.DashboardTimeSpans[groupID] = {};
                    self.DashboardTimeSpans[groupID][dashboardCounter.getType()] = dashboardCounter;
                    dashboardCounter.LastUpdate = new Date().getTime();
                }
                self.dashboardEventStack.unshift({ type: "value", valueName: dashboardCounter.getType(), target: dashboardCounter.getGroupId() });
            });
            if (self.dashboardListeners)
            {
                Ext.iterate(self.dashboardListeners, function (listener, index)
                {
                    self.dashboardListeners[index].onSettingsChange(allCounters[0].getGroupId(), dashboardTimeSpans);
                });
            }
        }
        var groupInfos = response.getGroupInfos();
        if (isValid(groupInfos))
        {
            if (isValid(response, "getGroupInfos().getGroupInfo()"))
            {
                groupInfos = response.getGroupInfos().getGroupInfo();
            }
            Ext.iterate(groupInfos, function (groupInfo, index) {
                self.GroupInfos[groupInfo.getGroupID()] = groupInfo;
            });
        }

        var groupStateSettings = response.getGroupStateSettings();
        if (isValid(groupStateSettings))
        {
            if (isValid(response, "getGroupStateSettings().getGroupStateSetting()"))
            {
                groupStateSettings = response.getGroupStateSettings().getGroupStateSetting();
            }
            Ext.iterate(groupStateSettings, function (groupStateSetting, index) {
                self.GroupStateSettings[groupStateSetting.getGroupId()] = groupStateSetting;
            });
        }

        var queueInfos = response.getQueueInfos();
        if (isValid(queueInfos))
        {
            if (isValid(response, "getQueueInfos().getQueueInfo()"))
            {
                queueInfos = response.getQueueInfos().getQueueInfo();
            }
            Ext.iterate(queueInfos, function (queueInfo, index) {
                self.QueueInfos[queueInfo.getGroupID()] = queueInfo;
            });
        }

        var redirectionSettings = response.getRedirectionSettings();
        if (isValid(redirectionSettings))
        {
            Ext.iterate(redirectionSettings, function (redirectionSetting, index) {
                self.RedirectionSettings[redirectionSetting.getRedirectionId()] = redirectionSetting;
                if (self.redirectionListeners) {
                    Ext.iterate(self.redirectionListeners, function (listener, index)
                    {
                        self.redirectionListeners[index].onSettingsChange(redirectionSetting);
                    });
                }
            });
        }
        Ext.iterate(this.Groups, function (groupID, group) {
            if (isValid(group)) {
                group.mustBeRefreshed = self.addDashboardValuesToGroup(group);
            }
        });
        self.updateListeners();

        self.fireDashListeners();
    },
    updateListeners: function () 
    {
        Ext.iterate(this.eventListeners, function (listener)
        {
            listener.onChange();
        });
    },
    onNewGroupConfiguration: function (response) {
        if (!isValid(response) && !isValid(response.getAgentConfiguration()))
        {
            return;
        }
            
        var oldGroupIDs = Object.keys(this.Groups);

        this.Agents = {};
        this.guid2AgentId = {};



        this.Groups = {};
        this.GroupCollections = {};
        this.Campaigns = {};



        this.Dashboards = {};
        this.Workloads = {};
        this.ServiceLevels = {};
        this.Announcements = {};
        this.Redirections = {};

        var configuration = response.getAgentConfiguration();
        this.Agent = configuration.getAgent();
        this.configChanged = true;
        var self = this;

        try {
            if (isValid(response.getAgentConfiguration())) {
                var skinArray = response.getAgentConfiguration().getSkins();
                for (var i = 0; i < skinArray.length; i++) {
                    if (!this.Skins[skinArray[i].getId()] || !this.Skins[skinArray[i].getId()].FromAdmin)this.Skins[skinArray[i].getId()] = skinArray[i];
                }
            }
        } catch (e) {

        }

        var agents = configuration.getAgents();
        if (isValid(agents))
        {
            if (isValid(agents, "getAgent()"))
            {
                agents = agents.getAgent();
            }
            Ext.iterate(agents, function (agent, index) {
                self.Agents[agent.getId()] = agent;

                var guid = self.getContactGUIDForAgentId(agent.getId());
                if (isValidString(guid))
                {
                    self.guid2AgentId[guid] = agent.getId();
                }
                self.dashboardEventStack.unshift({ type: "agent", target: agent.getId() });
            });
        }

        var dashboards = configuration.getDashboards();
        if (isValid(dashboards))
        {
            if (isValid(dashboards, "getDashboard()"))
            {
                dashboards = dashboards.getDashboard();
            }
            Ext.iterate(dashboards, function (dashboard, index) {
                if (isValid(dashboard)) {
                    self.Dashboards[dashboard.getDashboardId()] = dashboard;
                    //HERE - Later
                }
            });
        }

        var groupCollections = configuration.getGroupCollections();
        if (isValid(groupCollections)) 
        {
            if (isValid(groupCollections, "getGroupCollection()"))
            {
                groupCollections = groupCollections.getGroupCollection();
            }
            Ext.iterate(groupCollections, function (groupCollection, index) {
                if (isValid(groupCollection)) {
                    if (!self.GroupCollections[groupCollection.getCollectionId()] || !self.GroupCollections[groupCollection.getCollectionId()]) {
                        self.GroupCollections[groupCollection.getCollectionId()] = groupCollection;
                    }
                    self.dashboardEventStack.unshift({ type: "group", target: groupCollection.getCollectionId() });
                }
            });
        }

        var campaigns = configuration.getCampaigns();
        if (isValid(campaigns))
        {
            if (isValid(campaigns, "getCampaign()"))
            {
                campaigns = campaigns.getCampaign();
            }
            Ext.iterate(campaigns, function (campaign, index) {
                if (isValid(campaign)) {
                    self.Campaigns[campaign.getId()] = campaign;
                    self.dashboardEventStack.unshift({ type: "group", target: campaign.getId() });
                }
            });
        }

        var groupDescriptions = configuration.getGroupDescriptions();
        if (isValid(groupDescriptions))
        {
            if (isValid(groupDescriptions, "getGroupDescription()"))
            {
                groupDescriptions = groupDescriptions.getGroupDescription();
            }
            this.otherGroups = groupDescriptions;
        }

        var skillDescriptions = configuration.getSkillDescriptions();
        if (isValid(skillDescriptions))
        {
            if (isValid(skillDescriptions, "getSkillDescription()"))
            {
                skillDescriptions = skillDescriptions.getSkillDescription();
            }
            this.skillDescriptions = {};
            Ext.each(skillDescriptions, function (skillDescription)
            {
                this.skillDescriptions[skillDescription.Id] = skillDescription;
            }, this);
        }

        var groups = configuration.getGroups();
        if (isValid(groups)) {
            if (isValid(groups, "getGroup()"))
            {
                groups = groups.getGroup();
            }
            Ext.iterate(groups, function (group, index) 
            {
                var workloads = group.getWorkloads();
                if (isValid(workloads))
                {
                    Ext.iterate(workloads, function (workload, index) {
                        workload.getGroup = function () {
                            return group;
                        };
                        self.Workloads[workload.getId()] = workload;
                    });
                }

                var calendarConfigurations = group.getCalendarConfigurations();
                if (isValid(calendarConfigurations))
                {
                    if (isValid(calendarConfigurations, "getCalendarConfiguration()"))
                    {
                        calendarConfigurations = calendarConfigurations.getCalendarConfiguration();
                    }
                    if (calendarConfigurations.length > 0) 
                    {
                        calendarConfigurations[0].validUntil = Ext.Date.format(new Date(), "Y-m-d H:i:s");
                        
                    }
                }

                if (isValid(group)) {
                    self.Groups[group.getId()] = group;
                    self.dashboardEventStack.unshift({ type: "group", target: group.getId() });
                }

                var serviceLevels = group.getServiceLevels();
                if (isValid(serviceLevels))
                {
                    Ext.iterate(serviceLevels, function (serviceLevel, index) {
                        serviceLevel.getGroup = function () {
                            return group;
                        };
                        self.ServiceLevels[serviceLevel.getId()] = serviceLevel;
                    });
                }

                var announcementConfigurations = group.getAnnouncementConfigurations();
                if (isValid(announcementConfigurations))
                {
                    Ext.each(announcementConfigurations, function (announcement, index) {
                        self.Announcements[announcement.getAnnouncementId()] = announcement;
                    });
                    if (self.announcementListeners) {
                        Ext.each(self.announcementListeners, function (listener, listenerIndex) {
                            self.announcementListeners[listenerIndex].onConfigChange(group.getId(), announcementConfigurations);
                        });
                    }
                }

                var redirectionConfigurations = group.getRedirectionConfigurations();
                if (isValid(redirectionConfigurations))
                {
                    Ext.iterate(redirectionConfigurations, function (redirection, index) {
                        self.Redirections[redirection.getRedirectionId()] = redirection;
                    });
                    if (self.redirectionListeners) {
                        Ext.each(self.redirectionListeners, function (listener, listenerIndex) {
                            self.redirectionListeners[listenerIndex].onConfigChange(group.getId(), redirectionConfigurations);
                        });
                    }
                }

                
                self.addDashboardValuesToGroup(group);
            });
        }


        this.deleteObsoleteGroups(oldGroupIDs);
    },

    deleteObsoleteGroups: function (oldGroupIDs) {
        var self = this;
        var newGroupIDs = Object.keys(this.Groups);
        var groupsToBeDeleted = Ext.Array.difference(oldGroupIDs, newGroupIDs);
        Ext.iterate(groupsToBeDeleted, function (id) {
            delete self.Groups[id];
        });
    },

    addDashboardValuesToGroup: function (group) {
        /*jslint bitwise: true */
        var refresh = false;
        var groupID = group[ACD_GROUP_ID];

        var groupInfo = this.getGroupInfo(groupID);
        if (isValid(groupInfo)) {
            var numberAgents = groupInfo.getAgentsAvailable() + groupInfo.getAgentsPostProcessing() + groupInfo.getAgentsOnPhone();
            refresh = refresh | this.updateValueForGroup(group, ACD_NUMBER_WORKING_AGENTS, numberAgents);
        }
        var queueInfo = this.getQueueInfo(groupID);
        if (isValid(queueInfo)) {
            refresh = refresh | this.updateValueForGroup(group, ACD_WAITING_FIELD_SIZE, queueInfo.getCallerCount());
            refresh = refresh | this.updateValueForGroup(group, ACD_WAITING_FIELD_SIZE_MAX, queueInfo.getSize());
        }
        var workload = this.getWorkload(groupID);
        if (isValid(workload)) {
            refresh = refresh | this.updateValueForGroup(group, ACD_WORKLOAD_MIN_LEVEL, workload.getMinLevel());
            refresh = refresh | this.updateValueForGroup(group, ACD_WORKLOAD_MAX_LEVEL, workload.getMaxLevel());

            var workloadValue = this.getWorkloadValue(workload.getId());
            if (isValid(workloadValue)) {
                refresh = refresh | this.updateValueForGroup(group, ACD_WORKLOAD, workloadValue.getValue());
            }
        }
        var serviceLevel = this.getServiceLevel(groupID);
        if (isValid(serviceLevel)) {
            refresh = refresh | this.updateValueForGroup(group, ACD_SERVICE_LEVEL_CRITICAL, serviceLevel.getCritical());
            refresh = refresh | this.updateValueForGroup(group, ACD_SERVICE_LEVEL_TARGET, serviceLevel.getTarget());

            var serviceLevelValue = this.getServiceLevelValue(serviceLevel.getId());
            if (isValid(serviceLevelValue)) {
                refresh = refresh | this.updateValueForGroup(group, ACD_SERVICE_LEVEL, serviceLevelValue.getValue());
            }
        }
        var groupStateSetting = this.getGroupStateSetting(groupID);
        if (isValid(groupStateSetting)) {
            refresh = refresh | this.updateValueForGroup(group, ACD_GROUP_ACTIVATED, groupStateSetting[GROUP_STATE] === GroupState.Enabled.value);
        }
        refresh = refresh | this.computeErrorMessage(group);
        /*jslint bitwise: false */
        return refresh;
    },

    computeErrorMessage: function (group) {
        /*jslint bitwise: true */
        var refresh = false;
        var error = Ext.create('ACDGroupErrorMessage', { group: group }).getError();

        refresh = refresh | this.updateValueForGroup(group, ACD_GROUP_ERROR, error);
        refresh = refresh | this.updateValueForGroup(group, ACD_GROUP_STATE, error.image);

        var numberAgents = this.getNumberLoggedInAgents(group.Id);
        var newText = error.text + ", " + numberAgents + " " + (numberAgents === 1 ? LANGUAGE.getString("agent") : LANGUAGE.getString("agents"));
        refresh = refresh | this.updateValueForGroup(group, ACD_GROUP_MESSAGE, newText);
        /*jslint bitwise: false */
        return refresh;
    },

    updateValueForGroup: function (group, key, value) {
        var oldValue = group[key];
        if (oldValue === value) {
            return false;
        }
        group[key] = value;
        return true;
    },

    getCharacteristic: function (id) {
        var characteristic = this.Workloads[id];
        if (isValid(characteristic)) {
            return characteristic;
        }
        return this.ServiceLevels[id];
    },

    getGroupForCharacteristic: function (characteristicID) {
        var characteristic = this.getCharacteristic(characteristicID);
        if (!isValid(characteristic)) {
            return null;
        }
        return characteristic.getGroup();
    },

    getGroup: function (groupID) {
        return this.Groups[groupID];
    },

    getGroupName: function (groupId)
    {
        var group = this.getGroup(groupId);
        if (group)
        {
            return group.getName();
        }

        group = this.getGroupDescription(groupId);
        if (group)
        {
            return group.getGroupName();
        }
        return "";
    },

    getGroupByName: function (groupName)
    {
        var result;
        Ext.iterate(this.Groups, function (groupId, group)
        {
            if (group.getName() === groupName)
            {
                result = group;
                return false;
            }
        });
        return result;
    },

    getGroupByEMail: function(email)
    {
        var result;
        Ext.iterate(this.Groups, function (groupId, group)
        {
            if (group.getMailAddress() === email)
            {
                result = group;
                return false;
            }
        });
        return result;
    },

    getGroupModel: function (groupID) {
        for (var i = 0; i < this.getCount() ; ++i) {
            var currentGroupID = this.getAt(i).raw[ACD_GROUP_ID];
            if (currentGroupID === groupID || currentGroupID === Number(groupID)) {
                return this.getAt(i);
            }
        }
        return null;
    },

    getAgent: function (agentID) {
        return this.Agents[agentID];
    },

    getAgentInfo: function (agentID) {
        return this.AgentInfos[agentID];
    },

    getAgentIDForContactGUID: function (guid)
    {
        if (isValid(this.Agent) && this.Agent.getGUID() === guid)
        {
            return this.Agent.getId();
        }
        return this.guid2AgentId[guid];
    },

    getContactGUIDForAgentId: function(agentId)
    {
        var agent = this.getAgent(agentId);
        if(isValid(agent))
        {
            if (isValidString(agent.GUID))
            {
                return agent.GUID;
            }
            var contact = agent.getContact();

            if(isValid(contact))
            {
                return contact.GUID;
            }
        }
        return "";
    },

    getAgentInfoForContactGUID: function(guid)
    {
        var agentID = this.getAgentIDForContactGUID(guid);
        return this.getAgentInfo(agentID);
    },

    getAgentForContactGUID: function (guid)
    {
        var agentID = this.getAgentIDForContactGUID(guid);
        return this.getAgent(agentID);
    },

    getGroups: function () {
        return this.Groups;
    },

    getGroupsForOutbound: function ()
    {
        var result = [];
        Ext.iterate(this.Groups, function (groupId, group) {
            if (group.getServiceOutboundCall()) {
                result.push(group);
            }
        });
        return result;
    },

    getGroupInfo: function (id) {
        return this.GroupInfos[id];
    },

    getQueueInfo: function (id) {
        return this.QueueInfos[id];
    },

    getWorkload: function (groupID) {
        var group = this.getGroup(groupID);
        if (!isValid(group)) {
            return null;
        }
        if (isValid(group.getWorkloads()) && group.getWorkloads().length > 0) {
            return group.getWorkloads()[0];
        }
        return null;
    },

    getServiceLevel: function (groupID) {
        var group = this.getGroup(groupID);
        if (!isValid(group)) {
            return null;
        }
        if (isValid(group.getServiceLevels()) && group.getServiceLevels().length > 0) {
            return group.getServiceLevels()[0];
        }
        return null;
    },

    getWorkloadValue: function (workloadID) {
        return this.CharacteristicValues[workloadID];
    },

    getServiceLevelValue: function (serviceLevelID) {
        return this.CharacteristicValues[serviceLevelID];
    },

    getGroupStateSetting: function (groupID) {
        return this.GroupStateSettings[groupID];
    },

    getMyAgentInfo: function () {
        if (!isValid(this.Agent)) {
            return null;
        }
        var myId = this.Agent.getId();
        return this.AgentInfos[myId];
    },

    getMyAgentState: function () {
        var myAgentInfo = this.getMyAgentInfo();
        if (!isValid(myAgentInfo)) {
            return AgentState.Unknown.value;
        }
        return myAgentInfo.getAgentState();
    },

    getMyAgentStateText: function ()
    {
        var myAgentInfo = this.getMyAgentInfo();
        if (!isValid(myAgentInfo))
        {
            return "";
        }
        return myAgentInfo.getAgentStateText();
    },

    getMyAgentId: function () {
        if (this.Agent) {
            return this.Agent.getId();
        }
        return -1;
    },
    getMyAgent: function () {
        return this.getAgent(this.getMyAgentId());
    },

    getDashboardCounters: function (groupID)
    {
        return this.DashboardCounter[groupID];
    },

    getDashboardCounter: function (groupID, type)
    {
        var counters = this.getDashboardCounters(groupID);
        if (isValid(counters))
        {
            return counters[type];
        }
        return null;
    },

    getDashboardPercentages: function (groupID)
    {
        return this.DashboardPercentages[groupID];
    },

    getDashboardPercentage: function (groupID, type)
    {
        var counters = this.getDashboardPercentages(groupID);
        if (isValid(counters))
        {
            return counters[type];
        }
        return null;
    },

    getDashboardTimeSpans: function (groupID)
    {
        return this.DashboardTimeSpans[groupID];
    },

    getDashboardTimeSpan: function (groupID, type)
    {
        var counters = this.getDashboardTimeSpans(groupID);
        if (isValid(counters))
        {
            return counters[type];
        }
        return null;
    },

    isListChanged: function () {
        var refreshList = false;
        for (var index = 0; index < this.getCount() ; index++) {
            if (this.getAt(index).mustBeRefreshed) {
                refreshList = true;
            }
            this.getAt(index).mustBeRefreshed = false;
        }
        return refreshList;
    },

    isAgentLoggedOff: function () {
        var agentInfo = this.getMyAgentInfo();
        if (isValid(agentInfo)) {
            return agentInfo.getAgentState() === AgentState.LoggedOff.value;
        }
        return false;
    },

    getAnnouncement: function (id) {
        return this.Announcements[id];
    },

    getAnnouncementsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        if (!isValid(group)) {
            return [];
        }
        if (isValid(group.getAnnouncementConfigurations())) {
            return group.getAnnouncementConfigurations();
        }
        return null;
    },

    getAnnouncementSettingsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        var announcementSettings = [];
        var announcements = {};
        if (!isValid(group)) {
            return [];
        }
        var self = this;
        if (isValid(group.getAnnouncementConfigurations())) {
            announcements = group.getAnnouncementConfigurations();
            Ext.iterate(announcements, function (announcement, index) {
                announcementSettings.push(self.getAnnouncementSetting(announcement.getAnnouncementId()));
            });
            return announcementSettings;
        }
        return null;
    },
    getMessageOfTheDayForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        if (!isValid(group)) {
            return [];
        }
        if (isValid(group.getMessageOfTheDayConfigurations())) {
            return group.getMessageOfTheDayConfigurations();
        }
        return null;
    },

    getMessagesOfTheDay: function (groupID) {
        var group = this.getGroup(groupID);
        var messageOfTheDaySettings = [];
        var messagesOfTheDay = {};
        if (!isValid(group)) {
            return [];
        }
        var self = this;
        if (isValid(group.getMessageOfTheDayConfigurations())) {
            messagesOfTheDay = group.getMessageOfTheDayConfigurations();
            Ext.iterate(messagesOfTheDay, function (messageOfTheDay, index) {
                var message = self.getMessageOfTheDaySetting(messageOfTheDay.getId()) || {};
                if (message.getText) {
                    messageOfTheDaySettings.push(message.getText());
                }
            });
            return messageOfTheDaySettings;
        }
        return null;
    },
    getOptionsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        if (!isValid(group)) {
            return [];
        }
        if (isValid(group.getOptionConfigurations())) {
            return group.getOptionConfigurations();
        }
        return null;
    },

    getOptionSettingsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        var optionSettings = [];
        var options = {};
        if (!isValid(group)) {
            return [];
        }
        var self = this;
        if (isValid(group.getOptionConfigurations())) {
            options = group.getOptionConfigurations();
            Ext.iterate(options, function (option, index) {
                optionSettings.push(self.getOptionSetting(option.getOptionId()));
            });
            return optionSettings;
        }
        return null;
    },
    getCalendarSettingsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        var calendarSettings = [];
        var calendars = {};
        if (!isValid(group)) {
            return [];
        }
        var self = this;
        if (isValid(group.getCalendarConfigurations())) {
            calendars = group.getCalendarConfigurations();
            Ext.iterate(calendars, function (calendar, index) {
                calendarSettings.push(self.getCalendarSetting(calendar.getCalendarId()));
            });
            return calendarSettings;
        }
        return null;
    },
    getCalendarForGroup: function (groupID) 
    {
        var group = this.getGroup(groupID);
        if (!isValid(group)) 
        {
            return [];
        }
        if (group.getCalendarConfigurations().length > 0) 
        {
            return group.getCalendarConfigurations();
        }
        else
        {
            return [{ CalendarId: group.getCalendarId(), ReadOnly: true, NoConfiguration: true }];
        }
    },

    getCalendarDataForGroup: function (groupID) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var group = me.getGroup(groupID);
            if (!me.getCalendarForGroup(groupID)[0])
            {
                reject("");
            }
            SESSION.getCalendar(me.getCalendarForGroup(groupID)[0].CalendarId,
                function (response) {
                    response.groupId = groupID;
                    response.calendarId = group.getCalendarId();
                    resolve(response);
                },
                function () {
                    reject("Fehler beim Abrufen des Kalenderprofils.");
                });
            return null;
        });
    },
    getCalendarNextOpening: function (groupID) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var group = me.getGroup(groupID);
            if (!me.getCalendarForGroup(groupID)[0])
            {
                reject("");
            }
            SESSION.getCalendarDays(me.getCalendarForGroup(groupID)[0].CalendarId, 0, true,
                function (response) {
                    response.groupId = groupID;
                    response.calendarId = group.getCalendarId();
                    resolve(response);
                },
                function () {
                    reject("Fehler beim Abrufen des Kalenderprofils.");
                });
            return null;
        });
    },
    getDashboardValueList: function (objectType, language) {
        var me = this;
        return new Promise(function (resolve, reject) {
            SESSION.getDashboardValueList(objectType, language,
                function (response) {
                    resolve(response);
                },
                function () {
                    reject("Fehler beim Abrufen der Dashboarddaten");
                });
            return null;
        });
    },
    saveDashboardConfiguration: function (dashboardId, configuration) {
        var me = this;
        return new Promise(function (resolve, reject) {
            SESSION.saveDashboardConfiguration(dashboardId, configuration,
                function (response) {
                    resolve(response);
                },
                function () {
                    reject("Fehler beim speichern des Dashboards");
                });
            return null;
        });
    },
    getRedirectionSettingsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        var redirectionSettings = [];
        var redirections = {};
        if (!isValid(group)) {
            return [];
        }
        var self = this;
        if (isValid(group.getRedirectionConfigurations())) {
            redirections = group.getRedirectionConfigurations();
            Ext.iterate(redirections, function (redirection, index) {
                redirectionSettings.push(self.getRedirectionSetting(redirection.getRedirectionId()));
            });
            return redirectionSettings;
        }
        return null;
    },

    getAnnouncementSetting: function (id) {
        return this.AnnouncementSettings[id];
    },
    getMessageOfTheDaySetting: function (id) {
        return this.MessageOfTheDaySettings[id];
    },

    getOptionSetting: function (id) {
        return this.OptionSettings[id];
    },
    getCalendarSetting: function (id) {
        return this.CalendarSettings[id];
    },

    getRedirection: function (id) {
        return this.Redirections[id];
    },

    getRedirectionsForGroup: function (groupID) {
        var group = this.getGroup(groupID);
        if (!isValid(group)) {
            return [];
        }
        if (isValid(group.getRedirectionConfigurations())) {
            return group.getRedirectionConfigurations();
        }
        return null;
    },

    getRedirectionSetting: function (id) {
        return this.RedirectionSettings[id];
    },

    isLoggedIn: function (agentID) {
        var agentInfo = this.getAgentInfo(agentID);
        if (!isValid(agentInfo)) {
            return false;
        }
        return agentInfo.getAgentState() !== AgentState.LoggedOff.value;
    },

    isMyAgentLoggedInGroup: function (groupID) {
        return this.isLoggedInGroup(this.getMyAgentId(), groupID);
    },

    isLoggedInGroup: function (agentID, groupID) {
        var agentInfo = this.getAgentInfo(agentID);
        if (!isValid(agentInfo)) {
            return true; //deshalb, weil der CC-Webservice automatisch mich an allen Gruppen anmeldet. wenn man also noch keine AgentInfo hat, muss man an der Gruppe angemeldet sein
        }

        var loggedInGroupIds = this.getLoggedInGroupIdsForAgentInfo(agentInfo);
        return Ext.Array.contains(loggedInGroupIds, Number(groupID));
    },

    isMyAgentLoggedInCampaign: function (campaignID)
    {
        return this.isLoggedInCampaign(this.getMyAgentId(), campaignID);
    },

    isLoggedInCampaign: function (agentID, campaignID)
    {
        var agentInfo = this.getAgentInfo(agentID);
        if (!isValid(agentInfo))
        {
            return true; //deshalb, weil der CC-Webservice automatisch mich an allen Gruppen anmeldet. wenn man also noch keine AgentInfo hat, muss man an der Gruppe angemeldet sein
        }

        var callCampaignIds = agentInfo.getCallCampaigns();
        return Ext.Array.contains(callCampaignIds || [], Number(campaignID));
    },

    getNumberLoggedInAgents: function (groupID) {
        var groupInfo = this.getGroupInfo(groupID);
        if (!isValid(groupInfo)) {
            return 0;
        }
        var numberAgents = groupInfo.getAgentsAvailable() + groupInfo.getAgentsNotAvailable() + groupInfo.getAgentsPostProcessing() + groupInfo.getAgentsOnPhone();
        return numberAgents;
    },

    isGroupInConfiguration: function (groupID) {
        return isValid(this.getGroupModel(groupID));
    },


    onAgentManagerReady: function () {
        var me = this;
        return new Promise(function (resolve) {
            if (me.myAgentInfosPresent() && me.groupsPresent()) {
                resolve(true);
            } else {
                var interval = setInterval(function () {
                    if (me.agentInfosPresent() && me.groupsPresent()) {
                        resolve(true);
                        clearInterval(interval);
                    }
                }, 10);
            }
        });
    },
    myAgentInfosPresent: function () {
        return isValid(this.getAgentInfo(this.agent.getId()));
    },
    groupsPresent: function () {
        return Object.keys(this.getGroups()).length > 0;
    },

    getStatisticsUrl: function ()
    {
        var language = urlLanguage[MY_CONTACT.getLanguage()].value;
        var addLanguage = language;

        if (language === 'en')
        {
            addLanguage = 'us';
        } 


        return this.statisticsUrl + '&lang=' + language + '-' + addLanguage.toUpperCase();
    },

    getNotReadyReasons: function()
    {
        var reasons = [];
        Ext.iterate(this.Groups, function (groupId, group)
        {
            if (isValid(group, "getNotReadyReasons()"))
            {
                reasons = reasons.concat(group.getNotReadyReasons());
            }
        });
        return Ext.Array.unique(reasons);
    },

    getMyLoggedInGroups: function ()
    {
        var myAgentInfo = this.getMyAgentInfo();
        if (!isValid(myAgentInfo))
        {
            return [];
        }
        var loggedInGroupIds = this.getLoggedInGroupIdsForAgentInfo(myAgentInfo);
        
        var self = this;
        var groups = [];
        Ext.each(loggedInGroupIds, function (loggedInGroupId)
        {
            var group = self.getGroup(loggedInGroupId);
            if (isValid(group))
            {
                groups.push(group);
            }
        });
        return groups;
    },

    getLoggedInGroupIdsForAgentInfo: function (agentInfo)
    {
        if (!isValid(agentInfo))
        {
            return [];
        }
        var loggedInGroupIds = [];

        var callGroups = agentInfo.getCallGroups();
        if (isValid(agentInfo, "getCallGroups().getLong()"))
        {
            callGroups = agentInfo.getCallGroups().getLong();
        }
        loggedInGroupIds = loggedInGroupIds.concat(callGroups);

        var mailGroups = agentInfo.getMailGroups();
        if (isValid(agentInfo, "getMailGroups().getLong()"))
        {
            mailGroups = agentInfo.getMailGroups().getLong();
        }
        loggedInGroupIds = loggedInGroupIds.concat(mailGroups);

        var chatGroups = agentInfo.getChatGroups();
        if (isValid(agentInfo, "getChatGroups().getLong()"))
        {
            chatGroups = agentInfo.getChatGroups().getLong();
        }
        loggedInGroupIds = loggedInGroupIds.concat(chatGroups);

        return Ext.Array.unique(loggedInGroupIds);
    },

    getSkill: function (id)
    {
        return this.skillDescriptions[id];
    },

    getGroupDescription: function (id)
    {
        var result;
        Ext.each(this.otherGroups, function (group)
        {
            if (Number(group.GroupId) === Number(id))
            {
                result = group;
                return false;
            }
        });
        return result;
    },

    getCallTransferAgentsForGroup: function (groupId)
    {
        var group = this.getGroup(groupId);
        if (!isValid(group))
        {
            return [];
        }
        var agents = [];
        Ext.each(group.CallTransferAgents, function (agentDescription)
        {
            var agent = this.getAgent(agentDescription.Id);
            if (isValid(agent))
            {
                var contact;
                if (isValid(agent.getContact()))
                {
                    contact = agent.getContact();
                }
                else
                {
                    contact = new www_caseris_de_CaesarSchema_Contact();
                    contact.convertFromAgent(agent);
                }

                contact.agent = agent;
                agents.push(contact);
            }
        }, this);
        return agents;
    },

    getCallTransferGroupsForGroup: function (groupId)
    {
        var group = this.getGroup(groupId);
        if (!isValid(group))
        {
            return [];
        }
        var groups = [];
        Ext.each(group.CallTransferGroups, function (groupDescription)
        {
            var group = this.getGroupDescription(groupDescription.Id);
            if (isValid(group))
            {
                group = Ext.clone(group);
                group.skills = [];
                Ext.each(groupDescription.SkillId, function (skillId)
                {
                    var skill = CURRENT_STATE_CONTACT_CENTER.getSkill(skillId);
                    if (isValid(skill))
                    {
                        group.skills.push(Ext.clone(skill));
                    }
                }, this);
                groups.push(group);
            }
        }, this);
        return groups;
    },

    getAllMailGroups: function ()
    {
        var mailGroups = [];
        Ext.iterate(this.Groups, function (groupId, group)
        {
            if (this.isMailGroup(group))
            {
                mailGroups.push(group);
            }
        }, this);
        return mailGroups;
    },

    isMailGroup: function (group)
    {
        if (group && group.getHasMessageRules() && group.getServiceMessage() && !group.getExternalMessageDistribution())
        {
            return true;
        }
        return false;
    },

    getAllMailGroupsForNewTicket: function ()
    {
        var result = {};
        var groups = this.getAllMailGroups();
        Ext.each(groups, function (group)
        {
            var mailDistributionGroupIds = group.getMailDistributionGroupIds();
            Ext.each(mailDistributionGroupIds, function (groupId)
            {
                var group = this.getGroup(groupId);
                if (group)
                {
                    result[group.getId()] = group;
                }
                else
                {
                    var groupDescription = this.getGroupDescription(groupId);
                    if (groupDescription)
                    {
                        result[groupDescription.getGroupId()] = groupDescription;
                    }
                }
            }, this);

            result[group.getId()] = group;
        }, this);
        return result;
    },

    getAllAgentsForMyMailGroups: function ()
    {
        var agents = [];
        Ext.each(this.getAllMailGroups(), function (group)
        {
            Ext.each(group.getAgentIds(), function (agentId)
            {
                var agent = this.getAgent(agentId);
                if (agent)
                {
                    agents.push(agent);
                }
            }, this);
        }, this);
        return agents;
    },

    onGlobalEvent_UploadMyImageFinished: function (newImageUrl)
    {
        var agent = this.getMyAgent();
        if (agent && agent.getContact())
        {
            agent.getContact().setImageUrl(newImageUrl);
        }
    },

    mayReceiveLiveChats: function ()
    {
        var result = false;
        Ext.iterate(this.Groups, function (groupId, group)
        {
            if (group.getServiceChat())
            {
                result = true;
                return false;
            }
        }, this);
        return result;
    },

    getCampaigns: function ()
    {
        return this.Campaigns;
    },

    getCampaign: function (id)
    {
        return this.Campaigns[id];
    },

    getCampaignName: function (id)
    {
        var campagne = this.getCampaign(id);
        if (campagne)
        {
            return campagne.getName();
        }
        return "";
    },

    getMyLoggedInCampaigns: function ()
    {
        var myAgentInfo = this.getMyAgentInfo();
        if (!isValid(myAgentInfo))
        {
            return [];
        }
        var loggedInCampaignIds = myAgentInfo.getCallCampaigns();

        return Ext.Array.map(loggedInCampaignIds || [], function (campaignId)
        {
            return this.getCampaign(campaignId);
        }, this);
    },

    isManualCampaignAvailable: function ()
    {
        var manualCampaigns = Ext.Array.filter(Object.values(this.Campaigns), function (campaign)
        {
            return campaign.getManualRequest();
        }, this);
        return !Ext.isEmpty(manualCampaigns);
    }
});

var CURRENT_STATE_CONTACT_CENTER = new CurrentState_ContactCenter();