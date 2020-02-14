var LiveChatFinishReason =
{
    Agent: { value: 'Agent' },
    Customer: { value: 'Customer' },
    ConnectionLost: { value: 'ConnectionLost' }
};

var dateColors = {
    Green: { value: GREEN },
    Orange: { value: ORANGE },
    Red: { value: RED },
    Undefined: {value: NEW_GREY}
};

var MailCreateCiteMode =
{
    Undefined: { value: 'Undefined' },
    CiteNone: { value: 'CiteNone' },
    CiteAuto: { value: 'CiteAuto' },
    CiteBelow: { value: 'CiteBelow' }
};

var EmailDirection =
{
    Inbound: { value: 'Inbound' },
    Outbound: { value: 'Outbound' }
};

var SampleRating =
{
    fiveStars: { minValue: 80, maxValue: 100, returnValue: 5 },
    fourStars: { minValue: 70, maxValue: 79, returnValue: 4 },
    threeStars: { minValue: 50, maxValue: 69, returnValue: 3 },
    twoStars: { minValue: 40, maxValue: 49, returnValue: 2 },
    oneStar: { minValue: 30, maxValue: 39, returnValue: 1 },
    noStar: { minValue: 0, maxValue: 29, returnValue: 0 }
};

var urlLanguage =
{
    Germany: { value: 'de' },
    UnitedKingdom: { value: 'en' },
    Undefined: { value: 'de' }
};

var mailSearchField =
{
    Unknown: { value: 'Undefined'},
    From: { value: 'From'},
    Subject: { value: 'Subject'},
    Body: { value: 'Body'}
};

var mailProcessingAvailability =
{
    Available: { value: 'Available' },
    NotAvailable: { value: 'NotAvailable' },
    NotChanged: { value: null }
};

var dashboardDataType =
{
    Unknown: { value: 'Undefined', color: NEW_GREY },
    Ignore: { value: 'Ignore', color: 'transparent' },
    Neutral: { value: 'Neutral', color: COLOR_MAIN_2 },
    Good: { value: 'Good', color: GREEN },
    Warning: { value: 'Warning', color: COLOR_PRESENCE_STATE_ORANGE },
    Critical: { value: 'Critical', color: RED }
};

var dashboardDataLevel = {
    Unknown: { value: 'Undefined', cls: 'none' },
    NoEffect: { value: 'NoEffect', cls: 'none' },
    Blink: { value: 'Blink', cls: 'blink 2s infinite' }
};

var MarkEmailState = {
    Unknown: { value: 'Undefined'},
    Spam: { value: 'Spam'},
    Done: { value: 'Done'}
};

var RequestEscalationLevel =
{
    Low: { value: 'green' },
    Middle: { color: 'orange' },
    High: { value: 'red' }
};

var MailType = {
    Unknown: { value: 'Undefined' },
    Answer: { value: 'Answer', backgroundCls: 'backgroundTdAnswer' },
    AnswerWithCourse: { value: 'AnswerWithCourse' },
    Query: { value: 'Query', backgroundCls: 'backgroundTdQuery' },
    Message: { value: 'Message' },
    Copy: { value: 'Copy', backgroundCls: 'backgroundTdCopy' },
    Inbound: { value: 'Inbound' },
    Outbound: { value: 'Outbound', backgroundCls: 'backgroundTdQuery' },
    AutoAnswer: { value: 'AutoAnswer', backgroundCls: 'backgroundTdSystemMessage'},
    Split: { value: 'Split' },
    Merge: { value: 'Merge' },
    NewTicket: { value: 'NewTicket' }
};

var readEmailState =
{
    Read: { value: 'Read' },
    Unread: { value: undefined },
    Acknowledged: { value: 'Acknowledged' }
};

var emailState =
{
    Undefined: { value: 'Undefined', backgroundCls: ''},
    Assigned: { value: 'Assigned', backgroundCls: 'backgroundTdRequest' },
    InProgress: { value: 'InProgress', backgroundCls: 'backgroundTdRequest'},
    Locked: { value: 'Locked', backgroundCls: 'backgroundTdRequest'},
    Canceled: { value: 'Canceled', backgroundCls: ''},
    Answered: { value: 'Answered', backgroundCls: 'backgroundTdRequest', color: MAIL_BACKGROUND_GREEN},
    Spam: { value: 'Spam', backgroundCls: 'backgroundTdRequest', color: ORANGE},
    Worked: { value: 'Worked', backgroundCls: 'backgroundTdRequest', color: MAIL_BACKGROUND_GREEN },
    InQueue: { value: 'InQueue', backgroundCls: 'backgroundTdRequest'},
    Forwarded: { value: 'Forwarded', backgroundCls: 'backgroundTdRequest', color: MAIL_BACKGROUND_GREEN},
    ToBeSend: { value: 'ToBeSend', backgroundCls: ''},
    Sent: { value: 'Sent' },
    Reply: { value: 'Reply', backgroundCls: 'backgroundTdRequestion'},
    Draft: { value: 'Draft', backgroundCls: 'backgroundTdDraft'},
    Reply3rdParty: { value: 'Reply3rdParty', backgroundCls: 'backgroundTdCopy'},
    Reanswer: { value: 'Reanswer', backgroundCls: 'backgroundTdRequestion'},
    System: { value: 'System' }, backgroundCls: 'backgroundTdSystem',
    SystemMessage: { value: 'SystemMessage', backgroundCls: 'backgroundTdSystemError'},
    Error: { value: 'Error', backgroundCls: 'backgroundTdError', color: MAIL_BACKGROUND_RED},
    Unread: { value: 'Unread', backgroundCls: ''}
};

var UserActions =
{
    answer: { value: 'answer', text: '' },
    answerWithCourse: {value: 'answerWithCourse'},
    acknowledged: { value: 'acknowledged', text: '' },
    print: { value: 'print', text: '' },
    completeAndClose: { value: 'completeAndClose', text: '' },
    send: { value: 'send', text: '' },
    saveAsDraft: { value: 'saveAsDraft', text: '' },
    cancel: { value: 'cancel', text: '' },
    hold: { value: 'hold', text: '' },
    giveBack: { value: 'giveBack', text: '' },
    transfer: { value: 'transfer', text: '' },
    complete: { value: 'complete', text: '' },
    more: { value: 'more', text: '' },
    goOn: { value: 'goOn', text: '' },
    refuse: { value: 'refuse', text: '' },
    copyTo: { value: 'copyTo', text: '' },
    redistribute: { value: 'redistribute', text: '' },
    passwordChangeOvertake: { value: 'passwordChangeOvertake', text: '' },
    merge: { value: 'merge', text: '' },
    split: { value: 'split', text: '' },
    splitTicket: { value: 'splitTicket' },
    createTicket: { value: 'createTicket' }
};

var PresenceState =
{
    Unknown: { value: 0, color: "transparent", onlineState: false },
    Available: { value: 1, color: COLOR_PRESENCE_STATE_GREEN.toString(), onlineState: true },
    NotAvailable: { value: 2, color: COLOR_PRESENCE_STATE_RED.toString(), onlineState: true },
    Break: { value: 3, color: COLOR_PRESENCE_STATE_YELLOW.toString(), onlineState: true },
    DnD: { value: 4, color: COLOR_PRESENCE_STATE_RED.toString(), onlineState: true },
    Offline: { value: 5, color: COLOR_PRESENCE_STATE_GREY.toString(), onlineState: false },
    Offline2: { value: 6, color: COLOR_PRESENCE_STATE_GREY.toString(), onlineState: false },
    OnPhone: { value: 10000000, color: COLOR_PRESENCE_STATE_ORANGE.toString(), onlineState: false }
};

var DiversionState = {
    DontChange: {value: 'DontChange'},
    Delete: {value: 'Delete'},
    Phone: {value: 'Phone'},
    VoiceBox: {value: 'VoiceBox'}
};

function paintPresenceState(width, height, presenceState, attributeName) 
{
    if (presenceState.color === "transparent")
    {
        presenceState[attributeName] = "";
        return;
    }
    
    if (presenceState.value === PresenceState.Available.value)
    {
        presenceState[attributeName] = "../shared/images/Available.svg";
    }
    else if (presenceState.value === PresenceState.NotAvailable.value) 
    {
        presenceState[attributeName] = "../shared/images/NotAvailable.svg";
    }
    else if (presenceState.value === PresenceState.Break.value) 
    {
        presenceState[attributeName] = "../shared/images/Break.svg";
    }
    else if (presenceState.value === PresenceState.DnD.value)
    {
        presenceState[attributeName] = "../shared/images/DoNotDisturb.svg";
    }
    else if (presenceState.value === PresenceState.Offline.value || presenceState.value === PresenceState.Offline2.value)
    {
        presenceState[attributeName] = "../shared/images/Offline.svg";
    }
    else if (presenceState.value === PresenceState.OnPhone.value)
    {
        presenceState[attributeName] = "../shared/images/OnPhone.svg";
    }
    else 
    {
        console.log("new enum value for PresenceState defined, but no svg available!");   
    }
}

Ext.iterate(PresenceState, function (name, presenceState) 
{
    paintPresenceState(12, 12, presenceState, "image");
});

var AgentState =
{
    Unknown: { number: 0, value: "Undefined", color: 'transparent'},
    Available: { number: 1, value: "Available", color: COLOR_AGENT_GREEN },
    NotAvailable: { number: 2, value: "NotAvailable", color: COLOR_AGENT_RED },
    PostProcessing: { number: 3, value: "PostProcessing", color: COLOR_AGENT_BLUE },
    LoggedOff: { number: 4, value: "LoggedOff", color: COLOR_AGENT_GREY }
};

var AgentStateReason =
{
    Undefined: { value: "Undefined" },
    UserManual: { value: "UserManual" },
    UserAutomatic: { value: "UserAutomatic" },
    AdminManual: { value: "AdminManual" },
    ServerGeneric: { value: "ServerGeneric" },
    ServerNoAnswer: { value: "ServerNoAnswer" },
    ServerNoAnswerNoAutoAv: { value: "ServerNoAnswerNoAutoAv" }
};

var MatchType =
{
    Exact: { value: 'Exact'},
    Begin: { value: 'Begin'},
    Everywhere: { value: 'Anywhere'}
};

var MatchFlag =
{
    All: { value: 'All' },
    FirstMatch: { value: 'First' },
    Phonetic: { value: 'Phonetic' }
};

var ContactCenterAvailability =
{
    Available: { value: "Available" },
    NotAvailable: { value: "NotAvailable" },
    TemporaryNotAvailable: { value: "TemporaryNotAvailable" }
};

var CharacteristicType =
{
    Workload: { value: "Workload" },
    ServiceLevel: { value: "ServiceLevel" }
};

var GroupState =
{
    Disabled: { value: "Disabled" },
    Enabled: { value: "Enabled" }
};

var MailSearchFilter =
{
    Undefined: { value: 'Undefined' },
    Journal: { value: 'Journal', text: '' },
    AllDocuments: { value: 'AllDocuments', text: '' },
    WaitingTickets: { value: 'WaitingTickets', text: '' },
    OpenTickets: { value: 'OpenTickets', text: '' },
    Finished: { value: 'Finished', text: '' }
};

var CallState =
{
    Undefined: { value: "Undefined" },
    Unknown: { value: "Unknown" },
    Busy: { value: "Busy" },
    Connected: { value: "Connected" },
    Dialtone: { value: "Dialtone" },
    Offering: { value: "Offering" },
    Spezialinfo: { value: "Spezialinfo" },
    Disconnected: { value: "Disconnected" },
    Idle: { value: "Idle" },
    Accepted: { value: "Accepted" },
    Dialing: { value: "Dialing" },
    Ringback: { value: "Ringback" },
    Proceeding: { value: "Proceeding" },
    OnHold: { value: "OnHold" },
    OnHoldPendingConference: { value: "OnHoldPendingConference" },
    OnHoldPendingTransfer: { value: "OnHoldPendingTransfer" },
    Conferenced: { value: "Conferenced" }
};

var CharacteristicInterval =
{
    Undefined: { value: "Undefined" },
    Current: { value: "Current" },
    Day: { value: "Day" },
    Month: { value: "Month" }
};

var ACDGroupError =
{
    OK: { color: COLOR_PRESENCE_STATE_GREEN },
    Deactivated: { color: COLOR_PRESENCE_STATE_GREY },
    ServiceLevelCriticallyLow: { color: COLOR_PRESENCE_STATE_RED },
    WorkloadTooHigh: { color: COLOR_PRESENCE_STATE_RED },
    WorkloadTooLow: { color: COLOR_PRESENCE_STATE_RED },
    TooLessAgentsLoggedIn: { color: COLOR_PRESENCE_STATE_RED },
    ServiceLevelTooLow: { color: COLOR_PRESENCE_STATE_YELLOW },
    WaitingFieldFull: { color: COLOR_PRESENCE_STATE_YELLOW }
};
var FormState =
{
    Undefined: {value: 'Undefined'},
    NoForm: { value: 'NoForm' },
    FormStarted: { value: 'FormStarted' },
    FormCanceled: { value: 'FormCanceled' },
    FormFilled: { value: 'FormFilled' },
    FormMissingFields: { value: 'FormMissingFields' }
};

function paintACDGroupError(width, height, error) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    if (!ctx)
    {
        console.log("could not get context for canvas!");
        return "";
    }
    ctx.fillStyle = error.color;
    ctx.strokeStyle = error.color;
    ctx.arc(width / 2, height / 2, 8, 0, 180, false);
    ctx.fill();
    return canvas.toDataURL();
}

Ext.iterate(ACDGroupError, function (name, error) {
    error.image = paintACDGroupError(24, 24, error);
});

var CallDirection =
{
    In: { value: "Incoming" },
    Out: { value: "Outgoing" }
};

var ChatDirection =
{
    In: { value: "In" },
    Out: { value: "Out" }
};

var ChatMessageState =
{
    Delivered: { value: "Delivered" },
    Received: { value: "Received" },
    Pending: { value: "Pending" },
    NotDelivered: { value: "NotDelivered" }
};

var BadCallDiversionReason =
{
    OK: { value: "OK" },
    ClientLogin: { value: "ClientLogin" },
    ManualChange: { value: "ManualChange" }
};

var DashBoardValues = {
    CurCallsActive: {type: 'counter' },
    CurCallsWaiting: { type: 'counter' },
    CurCallsRing: { type: 'counter' },
    CurCallsMenu: { type: 'counter' },
    CurCallsVoiceBox: { type: 'counter' },
    CurCallsConnected: { type: 'counter' },
    CurCallsQueueSize: { type: 'counter' },
    CurCallsQueueFree: { type: 'counter' },
    CurCallsLongestWaitTime: { type: 'time' },
    CurCallsQueueAverageWaitTime: { type: 'time' },
    CurCallsServicelevel: { type: 'percentage' },
    CurCallsServiceRate: { type: 'percentage' },
    DayCallsSum: { type: 'counter' },
    DayCallsAnswered: { type: 'counter' },
    DayCallsNotAnswered: { type: 'counter' },
    DayCallsVoicebox: { type: 'counter' },
    DayCallsLost: { type: 'counter' },
    DayCallsDropped: { type: 'counter' },
    DayCallsSpillover: { type: 'time' },
    DayCallsServiceRate: { type: 'percentage' },
    DayCallsServicelevel: { type: 'percentage' },
    MonthCallsServicelevel: { type: 'percentage' },
    TotalOutboundCallsCount: { type: 'counter' },
    TotalOutboundCallsSum: { type: 'counter' },
    TotalOutboundCallsOpen: { type: 'counter' },
    TotalOutboundCallsSuccessful: { type: 'counter' },
    TotalOutboundCallsNotSuccessful: { type: 'counter' },
    TotalOutboundCallsSuccessRate: { type: 'percentage' },
    TotalOutboundCallsCompletedRate: { type: 'percentage' },
    CurOutboundCallsActive: { type: 'counter' },
    CurOutbondCallsConnected: { type: 'counter' },
    CurOutboundCallsInProgress: { type: 'counter' },
    DayOutboundCallsSum: { type: 'counter' },
    DayOutboundCallsConntected: { type: 'counter' },
    DayOutboundCallsNotConnected: { type: 'counter' },
    DayOutboundCallsBusy: { type: 'counter' },
    DayOutboundCallsNotReached: { type: 'counter' },
    CurMessagesOpen: { type: 'counter' },
    CurMessagesInWork: { type: 'counter' },
    CurMessagesWaiting: { type: 'counter' },
    CurMessagesEscalationMid: { type: 'counter' },
    CurMessagesEscalationHigh: { type: 'counter' },
    DayMessagesNew: { type: 'counter' },
    DayMessagesDone: { type: 'counter' },
    DayMessagesAnswered: { type: 'counter' },
    DayMessagesWorked: { type: 'counter' },
    DayMessagesSpam: { type: 'counter' },
    CurChatsActive: { type: 'counter' },
    CurChatsRing: { type: 'counter' },
    CurChatsWaiting: { type: 'counter' },
    CurChatsConnected: { type: 'counter' },
    CurChatsQueueSize: { type: 'counter' },
    CurChatsQueueFree: { type: 'counter' },
    CurChatsQueueAverageWaitTime: { type: 'time' },
    CurChatsLongestWaitTime: { type: 'time' },
    DayChatsSum: { type: 'counter' },
    DayChatsAnswered: { type: 'counter' },
    DayChatsNotAnswered: { type: 'counter' },
    DayChatsLost: { type: 'counter' },
    DayChatsDropped: { type: 'counter' },
    DayChatsServiceRate: { type: 'percentage' },
    CurAgentsCallActive: { type: 'counter' },
    CurAgentsMessageActive: { type: 'counter' },
    CurAgentsChatActive: { type: 'counter' },
    CurAgentsActive: { type: 'counter' },
    CurAgentsWorking: { type: 'counter' },
    CurAgentsLoggedIn: { type: 'counter' },
    CurAgentsAvailable: { type: 'counter' },
    CurAgentsNotAvailable: { type: 'counter' },
    CurAgentsPostProcessing: { type: 'counter' },
    StateActivationState: { type: 'counter' },
    CurOutboundCallsConnected: { type: 'counter' },
    DayAgentsWorkload: { type: 'percentage' },
    DayOutboundCallsConnected: { type: 'counter' },
};

var AccessRights = {
    CCA_APP_PARTNER_ACCESS_UNDEFINED: { value: "0x00000000" }, // Undefiniert
    CCA_APP_PARTNER_ACCESS_LEVEL_0: { value: "0x00000001", index: 0 }, // Keine Anzeige
    CCA_APP_PARTNER_ACCESS_LEVEL_1: { value: "0x00000002", index: 1 }, // Nur der Call State
    CCA_APP_PARTNER_ACCESS_LEVEL_2: { value: "0x00000004", index: 2 }, // Call-State und gekürzte Nummer
    CCA_APP_PARTNER_ACCESS_LEVEL_3: { value: "0x00000008", index: 3 }, // Call-State und volle Nummer
    CCA_APP_PARTNER_ACCESS_PICKUP: { value: "0x00000010" }, // Pickup erlaubt
    CCA_APP_PARTNER_ACCESS_NO_OUTBOUND: { value: "0x00000020" }, // Die Rufnummer bei ausgehenden Anrufen nicht anzeigen
    CCA_APP_PARTNER_ACCESS_OFFERING_ONLY: { value: "0x00000040" }, // Nur bei eingehenden Anrufen während des Offerings
    CCA_APP_PARTNER_ACCESS_CALLDIVERSION: { value: "0x00000080" }, // Ruf weiterleiten erlaubt
    CCA_APP_PARTNER_ACCESS_ONLINE_STATE: { value: "0x00000100", index: 2 }, // Präsenzstatus ausblenden
    CCA_APP_PARTNER_ACCESS_NO_DURATION: { value: "0x00000200" }, // Gesprächsdauer ausblenden
    CCA_APP_PARTNER_ACCESS_NO_STATE_DURATION: { value: "0x00000400", index: 1 }, // Offline seit x Tagen ausblenden
    CCA_APP_PARTNER_ACCESS_NO_CALLDIV_STATE: { value: "0x00000800", index: 0 }, // weiterleitung ausblenden
    CCA_APP_PARTNER_ACCESS_CALLDIV_TARGET: { value: "0x00001000", index: 2 } // Weitergeleitete Rufnummer anzeigen
};

var TimeInterval = {
    lastMonth: {value: 1},
    lastTwoMonth: {value: 2},
    lastThreeMonth: {value: 3},
    lastFourMonth: { value: 4},
    lastFiveMonth: {value: 5},
    lastSixMonth: {value: 6},
    freeInterval: {value: 7}
};

var TimioFeature =
{
    Telephony_CTI: { value: "Telephony_CTI"},
    Telephony_Softphone: { value: "Telephony_Softphone"},
    ContactCenter: { value: "ContactCenter"},
    Search: { value: "Search"},
    Chat: { value: "Chat"},
    LiveChat: { value: "LiveChat" },
    Contacts: { value: "Contacts" },
    WebRtcIncoming: { value: "WebRtcIncoming" },
    WebRtcOutgoing: { value: "WebRtcOutgoing" },
    Statistics: { value: "Statistics" },
    Partnerlist: { value: "Partnerlist" }
};

var TimioClientMode =
{
    LiveChat:
    {
        features:
        [
            TimioFeature.LiveChat,
            TimioFeature.Statistics
        ]
    },
    LiveChatPlus:
    {
        features:
        [
            TimioFeature.LiveChat,
            TimioFeature.Statistics,
            TimioFeature.WebRtcIncoming
        ]
    },
    Helpdesk:
    {
        features:
        [
            TimioFeature.ContactCenter,
            TimioFeature.Statistics
        ]
    },
    Collaboration:
    {
        features:
        [
            TimioFeature.Chat,
            TimioFeature.WebRtcOutgoing,
            TimioFeature.Partnerlist,
            TimioFeature.Search,
            TimioFeature.Contacts
        ]
    },
    Professional:
    {
        features:
        [
            TimioFeature.Chat,
            TimioFeature.LiveChat,
            TimioFeature.WebRtcIncoming,
            TimioFeature.WebRtcOutgoing,
            TimioFeature.Statistics,
            TimioFeature.Partnerlist,
            TimioFeature.Search,
            TimioFeature.Contacts
        ]
    },
    Enterprise:
    {
        features:
        [
            TimioFeature.ContactCenter,
            TimioFeature.Chat,
            TimioFeature.LiveChat,
            TimioFeature.WebRtcOutgoing,
            TimioFeature.WebRtcIncoming,
            TimioFeature.Statistics,
            TimioFeature.Partnerlist,
            TimioFeature.Search,
            TimioFeature.Contacts
        ]
    }
};

Object.values = function (obj) {
    return Object.keys(obj).map(function (e) {
        return obj[e];
    });
};

function getEnumForPresenceState(value) 
{
    for (var key in PresenceState)
    {
        if (PresenceState.hasOwnProperty(key))
        {
            var enumValue = PresenceState[key];
            if (enumValue.value === value) 
            {
                return enumValue;
            }
        }
    }
    return PresenceState.Unknown;
}

function getEnumForAgentState(value) 
{
    var propertyName = Ext.isNumber(value) ? "number" : "value";
    for (var key in AgentState)
    {
        if (AgentState.hasOwnProperty(key))
        {
            var enumValue = AgentState[key];

            if (enumValue[propertyName] === value)
            {
                return enumValue;
            }
        }
    }

    return AgentState.Unknown;
}

function addLanguageDependentStringsToPresenceStateEnums()
{
    PresenceState.Unknown.text = "";
    PresenceState.Unknown.text2 = "";
    PresenceState.Available.text = LANGUAGE.getString("PresenceStateAvailable");
    PresenceState.Available.text2 = LANGUAGE.getString("PresenceStateIsAvailable");
    PresenceState.NotAvailable.text = LANGUAGE.getString("PresenceStateNotAvailable");
    PresenceState.NotAvailable.text2 = LANGUAGE.getString("PresenceStateIsNotAvailable");
    PresenceState.Break.text = LANGUAGE.getString("PresenceStatePause");
    PresenceState.Break.text2 = LANGUAGE.getString("PresenceStateIsInPause");
    PresenceState.DnD.text = LANGUAGE.getString("PresenceStateDnd");
    PresenceState.DnD.text2 = LANGUAGE.getString("PresenceStateDnd");
    PresenceState.Offline.text = LANGUAGE.getString("PresenceStateOffline");
    PresenceState.Offline.text2 = LANGUAGE.getString("PresenceStateOffline");
    PresenceState.Offline2.text = LANGUAGE.getString("PresenceStateOffline");
    PresenceState.Offline2.text2 = LANGUAGE.getString("PresenceStateOffline");
    PresenceState.OnPhone.text = LANGUAGE.getString("PresenceStateOnCall");
    PresenceState.OnPhone.text2 = LANGUAGE.getString("PresenceStateIsOnCall");
}

function addLanguageDependentStringsToTimeIntervalEnums()
{
    TimeInterval.lastMonth.text = LANGUAGE.getString("lastMonth");
    TimeInterval.lastTwoMonth.text = LANGUAGE.getString("lastXMonth", 2);
    TimeInterval.lastThreeMonth.text = LANGUAGE.getString("lastXMonth", 3);
    TimeInterval.lastFourMonth.text = LANGUAGE.getString("lastXMonth", 4);
    TimeInterval.lastFiveMonth.text = LANGUAGE.getString("lastXMonth", 5);
    TimeInterval.lastSixMonth.text = LANGUAGE.getString("lastXMonth", 6);
    TimeInterval.freeInterval.text = LANGUAGE.getString("freePeriod");
}

function addLanguageDependentStringsToEnums()
{
    addLanguageDependentStringsToPresenceStateEnums();
    addLanguageDependentStringsToTimeIntervalEnums();

    MailSearchFilter.Journal.text = LANGUAGE.getString('all');
    MailSearchFilter.Finished.text = LANGUAGE.getString('finishedTickets');
    MailSearchFilter.AllDocuments.text = LANGUAGE.getString('allDocuments');
    MailSearchFilter.OpenTickets.text = LANGUAGE.getString('openTickets');
    MailSearchFilter.WaitingTickets.text = LANGUAGE.getString('inWaitngFieldsTicktes');

    MarkEmailState.Unknown.text = LANGUAGE.getString('other');
    MarkEmailState.Spam.text = LANGUAGE.getString('spam');
    MarkEmailState.Done.text = LANGUAGE.getString('answered');

    MailType.Unknown.text = LANGUAGE.getString('other');
    MailType.Answer.text = LANGUAGE.getString('outgoingMail');
    MailType.Query.text = LANGUAGE.getString('query');
    MailType.Message.text = LANGUAGE.getString('message');
    MailType.Copy.text = LANGUAGE.getString('copy');
    MailType.NewTicket.text = LANGUAGE.getString('split');
    MailType.Inbound.text = 'Inbound';
    MailType.Outbound.text = 'Outbound';
    MailType.AutoAnswer.text = 'AutoAnswer';
    
    MailType.Answer.stateLabel = LANGUAGE.getString('outgoingMail');
    MailType.Query.stateLabel = LANGUAGE.getString('message');
    MailType.Copy.stateLabel = LANGUAGE.getString('copy');
    MailType.Outbound.stateLabel = LANGUAGE.getString('message');
    MailType.AutoAnswer.stateLabel = LANGUAGE.getString('confirmation');

    emailState.Undefined.text = 'Undefined';
    emailState.Assigned.text = LANGUAGE.getString('assigned');
    emailState.InProgress.text = LANGUAGE.getString('inProgress');
    emailState.Locked.text = LANGUAGE.getString('locked');
    emailState.Canceled.text = LANGUAGE.getString('canceled');
    emailState.Answered.text = LANGUAGE.getString('worked');
    emailState.Spam.text = LANGUAGE.getString('spam');
    emailState.Worked.text = LANGUAGE.getString('worked');
    emailState.InQueue.text = LANGUAGE.getString('inQueue');
    emailState.Error.text = LANGUAGE.getString('error');
    emailState.Forwarded.text = LANGUAGE.getString('forwarded');
    emailState.ToBeSend.text = LANGUAGE.getString('toBeSent');
    emailState.Sent.text = LANGUAGE.getString('sent');
    emailState.Reply.text = LANGUAGE.getString('reply');
    emailState.Draft.text = LANGUAGE.getString('draft');
    emailState.Reply3rdParty.text = LANGUAGE.getString('reply3rdParty');
    emailState.Reanswer.text = LANGUAGE.getString('reanswer');
    emailState.System.text = 'AutoAntwort';
    emailState.SystemMessage.text = 'System';

    emailState.Undefined.stateLabel = LANGUAGE.getString('unknown');
    emailState.Assigned.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.InProgress.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.Locked.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.Canceled.stateLabel = LANGUAGE.getString('canceled');
    emailState.Answered.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.Spam.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.Worked.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.InQueue.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.Error.stateLabel = LANGUAGE.getString('error');
    emailState.Forwarded.stateLabel = LANGUAGE.getString('incomingMail');
    emailState.Reply.stateLabel = LANGUAGE.getString('reanswer');
    emailState.Draft.stateLabel = LANGUAGE.getString('draft');
    emailState.Reply3rdParty.stateLabel = LANGUAGE.getString('reanswer');
    emailState.System.stateLabel = LANGUAGE.getString('shortSystemMessage');
    emailState.SystemMessage.stateLabel = LANGUAGE.getString('shortSystemMessage');
    emailState.Error.stateLabel = LANGUAGE.getString('error');

    

    AgentState.Unknown.text = "";
    AgentState.Available.text = LANGUAGE.getString("acdAgentsAvailable");
    AgentState.NotAvailable.text = LANGUAGE.getString("acdAgentsNotAvailable");
    AgentState.PostProcessing.text = LANGUAGE.getString("acdAgentsPostProcessing");
    AgentState.LoggedOff.text = LANGUAGE.getString("acdAgentsLoggedOut");

    MatchType.Exact.text = LANGUAGE.getString("MatchTypeExact");
    MatchType.Begin.text = LANGUAGE.getString("MatchTypeBegin");
    MatchType.Everywhere.text = LANGUAGE.getString("MatchTypeEverywhere");

    MatchFlag.All.text = LANGUAGE.getString("MatchFlagAll");
    MatchFlag.FirstMatch.text = LANGUAGE.getString("MatchFlagFirstMatch");
    MatchFlag.Phonetic.text = "";

    CallState.Undefined.text = "";
    CallState.Unknown.text = "";
    CallState.Busy.text = LANGUAGE.getString("callStateBusy");
    CallState.Connected.text = "";
    CallState.Dialtone.text = LANGUAGE.getString("callStateSetupCall");
    CallState.Offering.text = LANGUAGE.getString("callStateIncomingCall");
    CallState.Spezialinfo.text = "";
    CallState.Disconnected.text = LANGUAGE.getString("callStateEnd");
    CallState.Idle.text = LANGUAGE.getString("callStateEnd");
    CallState.Accepted.text = "";
    CallState.Dialing.text = LANGUAGE.getString("callStateSetupCall");
    CallState.Ringback.text = LANGUAGE.getString("callStateSetupCall");
    CallState.Proceeding.text = LANGUAGE.getString("callStateSetupCall");
    CallState.OnHold.text = "";
    CallState.OnHoldPendingConference.text = "";
    CallState.OnHoldPendingTransfer.text = "";
    CallState.Conferenced.text = LANGUAGE.getString("callStateConferenced");

    ACDGroupError.OK.text = LANGUAGE.getString("agentGroupActive");
    ACDGroupError.Deactivated.text = LANGUAGE.getString("deactivated");
    ACDGroupError.ServiceLevelCriticallyLow.text = LANGUAGE.getString("serviceLevelCritical");
    ACDGroupError.WorkloadTooHigh.text = LANGUAGE.getString("WorkloadTooHigh");
    ACDGroupError.WorkloadTooLow.text = LANGUAGE.getString("WorkloadTooLow");
    ACDGroupError.TooLessAgentsLoggedIn.text = LANGUAGE.getString("TooLessAgentsLoggedIn");
    ACDGroupError.ServiceLevelTooLow.text = LANGUAGE.getString("serviceLevelTooLow");
    ACDGroupError.WaitingFieldFull.text = LANGUAGE.getString("waitingFieldFull");

    Ext.each([DashBoardValues.CurCallsWaiting,
        DashBoardValues.CurCallsRing,
        DashBoardValues.CurCallsMenu,
        DashBoardValues.CurCallsVoiceBox,
        DashBoardValues.CurCallsActive,
        DashBoardValues.CurCallsConnected,
        DashBoardValues.CurCallsQueueSize,
        DashBoardValues.CurCallsQueueFree,
        DashBoardValues.CurCallsLongestWaitTime,
        DashBoardValues.CurCallsQueueAverageWaitTime,
        DashBoardValues.CurCallsServicelevel,
        DashBoardValues.CurCallsServiceRate,
        DashBoardValues.DayCallsSum,
        DashBoardValues.DayCallsAnswered,
        DashBoardValues.DayCallsNotAnswered,
        DashBoardValues.DayCallsVoicebox,
        DashBoardValues.DayCallsLost,
        DashBoardValues.DayCallsDropped,
        DashBoardValues.DayCallsSpillover,
        DashBoardValues.DayCallsServiceRate,
        DashBoardValues.DayCallsServicelevel,
        DashBoardValues.MonthCallsServicelevel,
        DashBoardValues.TotalOutboundCallsCount,
        DashBoardValues.TotalOutboundCallsSum,
        DashBoardValues.TotalOutboundCallsOpen,
        DashBoardValues.TotalOutboundCallsSuccessful,
        DashBoardValues.TotalOutboundCallsNotSuccessful,
        DashBoardValues.TotalOutboundCallsSuccessRate,
        DashBoardValues.TotalOutboundCallsCompletedRate,
        DashBoardValues.CurOutboundCallsActive,
        DashBoardValues.CurOutbondCallsConnected,
        DashBoardValues.CurOutboundCallsInProgress,
        DashBoardValues.DayOutboundCallsSum,
        DashBoardValues.DayOutboundCallsConntected,
        DashBoardValues.DayOutboundCallsNotConnected,
        DashBoardValues.DayOutboundCallsBusy,
        DashBoardValues.DayOutboundCallsNotReached,
        DashBoardValues.DayOutboundCallsConnected,
        DashBoardValues.CurOutboundCallsConnected], function (value)
    {
        value.imageName = 'phone';
    });
    
    Ext.each([DashBoardValues.CurMessagesOpen,
                DashBoardValues.CurMessagesInWork,
                DashBoardValues.CurMessagesWaiting,
                DashBoardValues.CurMessagesEscalationMid,
                DashBoardValues.CurMessagesEscalationHigh,
                DashBoardValues.DayMessagesNew,
                DashBoardValues.DayMessagesDone,
                DashBoardValues.DayMessagesAnswered,
                DashBoardValues.DayMessagesWorked,
                DashBoardValues.DayMessagesSpam], function(value)
    {
        value.imageName = 'mail';
    });

    Ext.each([DashBoardValues.CurChatsActive,
                DashBoardValues.CurChatsRing,
                DashBoardValues.CurChatsWaiting,
                DashBoardValues.CurChatsConnected,
                DashBoardValues.CurChatsLongestWaitTime,
                DashBoardValues.CurChatsQueueSize,
                DashBoardValues.CurChatsQueueFree,
                DashBoardValues.CurChatsQueueAverageWaitTime,
                DashBoardValues.DayChatsSum,
                DashBoardValues.DayChatsAnswered,
                DashBoardValues.DayChatsNotAnswered,
                DashBoardValues.DayChatsLost,
                DashBoardValues.DayChatsDropped,
                DashBoardValues.DayChatsServiceRate], function(value)
    {
        value.imageName = 'chat';
    });

    Ext.each([DashBoardValues.CurAgentsCallActive,
                DashBoardValues.CurAgentsMessageActive,
                DashBoardValues.CurAgentsChatActive,
                DashBoardValues.CurAgentsActive,
                DashBoardValues.CurAgentsWorking,
                DashBoardValues.CurAgentsLoggedIn,
                DashBoardValues.CurAgentsAvailable,
                DashBoardValues.CurAgentsNotAvailable,
                DashBoardValues.CurAgentsPostProcessing,
                DashBoardValues.DayAgentsWorkload], function (value)
    {
        value.imageName = ICON_NAME_ACD_AGENT;
    });

    DashBoardValues.StateActivationState.imageName = 'circle';

    /*UserActions.answer.text = LANGUAGE.getString('answerWithoutCourse');
    UserActions.answerWithCourse.text = LANGUAGE.getString('answer');
    UserActions.acknowledged.text = LANGUAGE.getString('acknowledged');
    UserActions.print.text = LANGUAGE.getString('print');
    UserActions.completeAndClose.text = LANGUAGE.getString('completeAndClose');
    UserActions.send.text = LANGUAGE.getString('send');
    UserActions.saveAsDraft.text = LANGUAGE.getString('saveAsDraft');
    UserActions.cancel.text = LANGUAGE.getString('cancel');
    UserActions.hold.text = LANGUAGE.getString('hold');
    UserActions.giveBack.text = LANGUAGE.getString('giveBack');
    UserActions.transfer.text = LANGUAGE.getString('transfer');
    UserActions.complete.text = LANGUAGE.getString('complete');
    UserActions.more.text = LANGUAGE.getString('more');
    UserActions.goOn.text = LANGUAGE.getString('continue');
    UserActions.refuse.text = LANGUAGE.getString('refuse');
    UserActions.copyTo.text = LANGUAGE.getString('copyTo');
    UserActions.redistribute.text = LANGUAGE.getString('redistribute');
    UserActions.passwordChangeOvertake.text = LANGUAGE.getString('passwordChangeOvertake');
    UserActions.merge.text = LANGUAGE.getString('merge');
    UserActions.split.text = LANGUAGE.getString('split');
    UserActions.splitTicket.text = LANGUAGE.getString('splitTicket');
    UserActions.createTicket.text = LANGUAGE.getString('createTicket');

    USER_REQUEST_ACTIONS = [UserActions.answerWithCourse.text, UserActions.answer.text, UserActions.giveBack.text, UserActions.transfer.text, UserActions.complete.text, UserActions.more.text];
    USER_SUB_EMAIL_NO_REPLY_ACTIONS = [UserActions.print.text];
    USER_REPLY_ACTIONS = [UserActions.completeAndClose.text, UserActions.send.text, UserActions.saveAsDraft.text, UserActions.cancel.text];
    USER_SUB_REPLY_ACTIONS = [UserActions.send.text, UserActions.saveAsDraft.text, UserActions.cancel.text];
    WORKED_OTHER_AGENT_SUB_EMAIL_ACTIONS = [UserActions.copyTo.text, UserActions.print.text];
    ERROR_ACTIONS = [UserActions.print];
    USER_MERGE_ACTONS = [UserActions.merge.text];
    USER_SPLIT_ACTONS = [UserActions.splitTicket.text];
    CREATE_TICKET_ACTIONS = [UserActions.createTicket.text];
    WORKED_EMAIL_ACTIONS = [UserActions.answerWithCourse.text, UserActions.answer.text, UserActions.transfer.text, UserActions.redistribute.text, UserActions.more.text];
    USER_SUB_EMAIL_QUERY_ACTIONS = [UserActions.answerWithCourse.text, UserActions.answer.text, UserActions.copyTo.text, UserActions.split.text, UserActions.print.text];
    USER_DRAFT_EMAIL_ACTIONS = [UserActions.goOn.text, UserActions.refuse.text, UserActions.print.text];*/
}
