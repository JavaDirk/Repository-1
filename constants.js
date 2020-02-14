function createGlobalColorConstants(mainColor)
{
    NEW_BLUE = new Ext.draw.Color(56, 146, 211);

    ANTHRAZIT_BLUE = new Ext.draw.Color(27, 82, 122);
    LIGHTER_BLUE = new Ext.draw.Color(190, 216, 241);

    DARKER_GREY = new Ext.draw.Color(128, 128, 128);
    DARK_GREY = new Ext.draw.Color(150, 150, 150);
    NEW_GREY = new Ext.draw.Color(153, 153, 153);
    NORMAL_GREY = new Ext.draw.Color(170, 170, 170);
    TITLE_GREY = new Ext.draw.Color(190, 190, 190);
    GREY2 = new Ext.draw.Color(204, 204, 204);
    BORDER_GREY = new Ext.draw.Color(210, 210, 210);
    LIGHT_GREY = new Ext.draw.Color(225, 225, 225);
    MAIN_BACKGROUND_GREY = new Ext.draw.Color(235, 235, 235);
    PANEL_BACKGROUND_GREY = new Ext.draw.Color(245, 245, 245);
    
    
    LIGHT_NEW_GREY = NEW_GREY.createLighter(0.2);
    DARK_NEW_GREY = NEW_GREY.createDarker(0.2);

    DARK_GREEN = new Ext.draw.Color(111, 162, 71); //new Ext.draw.Color(101, 160, 45);
    DARKER_GREEN = new Ext.draw.Color(52, 77, 31);
    LIGHT_GREEN = DARK_GREEN.createLighter(0.2);

    RED = new Ext.draw.Color(208, 14, 13);
    DASHBOARD_RED = new Ext.draw.Color(216, 119, 122);

    GREEN = new Ext.draw.Color(18, 118, 17).createLighter(0.1);
    ORANGE = new Ext.draw.Color(255, 64, 0);
    LIGHT_ORANGE = ORANGE.createLighter(0.2);
    YELLOW = new Ext.draw.Color(100, 82, 0);

    BROWN = new Ext.draw.Color(162, 123, 71);

    TIMIO_GREEN = new Ext.draw.Color(178, 200, 7);

    BLACK = new Ext.draw.Color(0, 0, 0);
    ALMOST_BLACK = new Ext.draw.Color(75, 75, 75);
    WHITE = new Ext.draw.Color(255, 255, 255);

    COLOR_MAIN = mainColor;
    COLOR_MAIN_2 = mainColor.createLighter(0.2);
    COLOR_MAIN_GREY = DARKER_GREY;

    MAIL_BACKGROUND_GREEN = new Ext.draw.Color(37, 139, 1);
    MAIL_BACKGROUND_YELLOW = new Ext.draw.Color(255, 147, 38);
    MAIL_BACKGROUND_VIOLET = new Ext.draw.Color(134, 95, 197);
    MAIL_BACKGROUND_GREY = new Ext.draw.Color(136, 136, 136);
    MAIL_BACKGROUND_RED = new Ext.draw.Color(217, 0, 0);

    COLOR_MAIL_3RD_REPLY = MAIL_BACKGROUND_GREY;
    COLOR_MAIL_SYSTEM_MESSAGE = TIMIO_GREEN;
    COLOR_MAIL_QUERY = MAIL_BACKGROUND_GREY;
    COLOR_MAIL_COPY = MAIL_BACKGROUND_GREY;
    COLOR_MAIL_WORKED = MAIL_BACKGROUND_GREEN;
    COLOR_MAIL_REQUEST = DARKEST_BLUE.createLighter(0.15);
    COLOR_MAIL_ANSWER = TIMIO_GREEN;
    COLOR_MAIL_DRAFT = MAIL_BACKGROUND_YELLOW;
    COLOR_MAIL_REQUESTION = MAIL_BACKGROUND_VIOLET;
    COLOR_MAIL_SYSTEM_ERROR = MAIL_BACKGROUND_RED;
    COLOR_MAIL_SPAM = ORANGE;
    COLOR_MAIL_SPLIT = COLOR_MAIL_REQUEST;
    COLOR_MAIL_NEW = COLOR_MAIL_REQUEST;



    SETTINGS_HEADLINE = mainColor;
    SETTINGS_SUB_HEADDING = COLOR_MAIN_2;


    INFO_BACKGROUND_COLOR = COLOR_MAIN_2.createLighter(0.4);
    INFO_COLOR = COLOR_MAIN_2;
    WARNING_BACKGROUND_COLOR = BROWN.createLighter(0.45);
    WARNING_COLOR = BROWN;
    ERROR_BACKGROUND_COLOR = new Ext.draw.Color(248, 232, 224);
    ERROR_COLOR = new Ext.draw.Color(208, 0, 0);


    COLOR_BADGE = new Ext.draw.Color(255, 78, 12);

    COLOR_DARK_AVATAR = NEW_GREY;

    COLOR_SEPARATOR = PANEL_BACKGROUND_GREY;//LIGHT_GREY;

    COLOR_HEADER = NEW_GREY;
    COLOR_NAME = DARKER_GREY;
    COLOR_TITLE = DARKER_GREY;
    COLOR_SUBTITLE = DARKER_GREY;
    COLOR_TEXT = DARKER_GREY;

    COLOR_PARTNER_BACKGROUND = WHITE;//TITLE_GREY.createLighter(0.15);

    COLOR_SELECTION = mainColor.createLighter(0.55);

    COLOR_ACTIVE_TAB = mainColor;
    COLOR_TAB_ON_HOVER = COLOR_MAIN_GREY;

    COLOR_HEADER_BAR = mainColor;

    COLOR_BORDER_BUTTON = LIGHT_GREY;

    COLOR_CALL_BUTTON = WHITE;
    COLOR_CALL_BUTTON_TEXT = COLOR_MAIN_GREY;
    COLOR_CALL_BUTTON_TEXT_ON_HOVER = WHITE;
    COLOR_CALL_BUTTON_BORDER = COLOR_BORDER_BUTTON;
    COLOR_CALL_BUTTON_ON_HOVER = COLOR_MAIN_2.createLighter(0.2);
    COLOR_CALL_BUTTON_ICON = COLOR_MAIN_GREY;
    COLOR_CALL_BUTTON_DIAL = GREEN;
    COLOR_CALL_BUTTON_HANG_UP = RED;

    COLOR_DIAL_NUMBER_BUTTON = PANEL_BACKGROUND_GREY;
    COLOR_DIAL_NUMBER_BUTTON_ON_HOVER = WHITE;
    COLOR_DIAL_NUMBER_BUTTON_TEXT = COLOR_MAIN_GREY;
    COLOR_DIAL_NUMBER_BUTTON_TEXT_ON_HOVER = COLOR_MAIN_GREY;


    COLOR_ERROR_LABEL_TEXT = RED;
    COLOR_ERROR_LABEL_BACKGROUND = 'transparent';

    COLOR_WATERMARK = LIGHT_GREY;
    COLOR_WATERMARK_BACKGROUND = PANEL_BACKGROUND_GREY;

    COLOR_SUCCESSFULL_CALL = DARKER_GREY;
    COLOR_UNSUCCESSFULL_CALL = RED;

    COLOR_CONFIRM_DELETE = RED;

    COLOR_RED_IMAGE = RED;

    COLOR_FAVORITE_BUTTON = ORANGE;
    COLOR_FAVORITE_BUTTON_ON_HOVER = COLOR_FAVORITE_BUTTON.createLighter(0.2);

    COLOR_AGENT_GREEN = GREEN;//new Ext.draw.Color(0, 153, 0);
    COLOR_AGENT_RED = RED;
    COLOR_AGENT_BLUE = NEW_BLUE;
    COLOR_AGENT_GREY = NEW_GREY;

    COLOR_PRESENCE_STATE_GREEN = GREEN; //new Ext.draw.Color(36, 82, 33);
    COLOR_PRESENCE_STATE_RED = RED;
    COLOR_PRESENCE_STATE_YELLOW = YELLOW;
    COLOR_PRESENCE_STATE_GREY = TITLE_GREY;
    COLOR_PRESENCE_STATE_ORANGE = ORANGE.createLighter(0.15);

    COLOR_BACKGROUND = WHITE;

    CHAT_BACKGROUND_COLOR = PANEL_BACKGROUND_GREY;
    MEDIA_LIST_BACKGROUND_COLOR = WHITE;

    COLOR_GROUP_ENTRY = COLOR_MAIN_2;

    COLOR_BORDER = NORMAL_GREY;
    COLOR_BORDER_FOCUS = COLOR_MAIN_2;

    FIELDS_BORDER_BOTTOM = "1.2px solid " + COLOR_BORDER;

    NEW_GREEN = new Ext.draw.Color(0, 178, 89);
    LIGHT_NEW_GREEN = new Ext.draw.Color(193, 255, 224);


    COLOR_HIGHLIGHTING = LIGHT_ORANGE;

    COLOR_CALL_DISPLAY_PANEL_FOR_INTERNAL_CALLS = COLOR_MAIN_2;
    COLOR_CALL_DISPLAY_PANEL_FOR_EXTERNAL_CALLS = DARK_GREEN;

    COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS = COLOR_CALL_DISPLAY_PANEL_FOR_INTERNAL_CALLS.createLighter(0.1);
    COLOR_ACD_CALL_PANEL_LABEL_FOR_INTERNAL_CALLS = WHITE;

    COLOR_ACD_CALL_PANEL_FOR_EXTERNAL_CALLS = LIGHT_GREEN;
    COLOR_ACD_CALL_PANEL_LABEL_FOR_EXTERNAL_CALLS = DARKER_GREEN;

    COLOR_INTERNAL_CALL = COLOR_MAIN_2;
    COLOR_EXTERNAL_CALL = COLOR_MAIN_GREY;

    COLOR_CALL_DISPLAY_NAME = WHITE;
    COLOR_CALL_DISPLAY_TITLE = WHITE;
    COLOR_CALL_DISPLAY_SUBTITLE = WHITE;
    COLOR_CALL_DISPLAY_TEXT = WHITE;
    COLOR_CALL_DISPLAY_HEADER = WHITE;

    COLOR_OVERLAY_BUTTON = NEW_GREY;
    COLOR_OVERLAY_BUTTON_DEFAULT_ACTION = ALMOST_BLACK;

    COLOR_TAB_ICON_SELECTED = WHITE;
    COLOR_TAB_ICON_NORMAL = COLOR_MAIN_GREY;

    COLOR_EMPTY_TEXT = NORMAL_GREY;

    COLOR_DIALOG_BACKGROUND = WHITE;
    COLOR_NOTIFICATION_BACKGROUND = WHITE;

    COLOR_MASK = "rgba(150, 150, 150, 0.6)";

    COLOR_HOVER = mainColor.createLighter(0.6);//'#e2eff9';

    COLOR_MAX_TALK_TIME_EXCEEDED = COLOR_BADGE;

    THIN_BUTTON_NORMAL_COLOR = NEW_GREY;
    THIN_BUTTON_NORMAL_TEXT_COLOR = ALMOST_BLACK;
    THIN_BUTTON_HOVER_COLOR = ALMOST_BLACK;
    THIN_BUTTON_HOVER_TEXT_COLOR = DARK_NEW_GREY;

    BACKGROUND_COLOR_ROUND_THIN_BUTTON = COLOR_MAIN_2;

    COLOR_AVATAR_IMAGE_FOR_LIVE_CHAT = NEW_GREY;

    COLOR_ACCEPT_BUTTON = new Ext.draw.Color(92, 184, 92);
    COLOR_DECLINE_BUTTON = new Ext.draw.Color(217, 83, 79);
}

var DARKEST_BLUE = new Ext.draw.Color(48, 74, 109);
createGlobalColorConstants(DARKEST_BLUE);

function syncColorsForInternalAndExternal()
{
    COLOR_CALL_DISPLAY_PANEL_FOR_EXTERNAL_CALLS = COLOR_CALL_DISPLAY_PANEL_FOR_INTERNAL_CALLS;

    COLOR_ACD_CALL_PANEL_FOR_EXTERNAL_CALLS = COLOR_ACD_CALL_PANEL_FOR_INTERNAL_CALLS;
    COLOR_ACD_CALL_PANEL_LABEL_FOR_EXTERNAL_CALLS = COLOR_ACD_CALL_PANEL_LABEL_FOR_INTERNAL_CALLS;

    COLOR_INTERNAL_CALL = COLOR_EXTERNAL_CALL = COLOR_MAIN_GREY;
}

var NOTIFIER_ANIMATION_DURATION = 1000;

var CLASS_FOR_SHOWING = 'photo';
var CLASS_CONTACT_PHOTO = 'contactPhoto';

var CLASS_MAIN_CALL_PANEL = 'MainCallPanel';
var CLASS_MAIN_EMAIL_PANEL = 'MainEMailPanel';
var CLASS_MAIN_CHAT_PANEL = 'MainChatPanel';
var CLASS_CALL_PANEL = 'CallPanel';
var CLASS_MAIN_SEARCH_PANEL = 'MainSearchPanel';
var CLASS_MAIN_CONTACTS_PANEL = 'MainContactsPanel';
var CLASS_MAIN_PARTNER_STRIP_PANEL = 'MainPartnerStripPanel';
var CLASS_MAIN_WELCOME_PANEL = 'WelcomePage';

var CLASS_CHANNEL_CALLS = 'Channel_Calls';
var CLASS_CHANNEL_EMAILS = 'Channel_EMails';
var CLASS_CHANNEL_WEBCHATS = 'Channel_WebChats';
var CLASS_CHANNEL_LIVECHATS = 'Channel_LiveChat';
var CLASS_CHANNEL_OTHER = 'Channel_Other';
var CLASS_CHANNEL_CONTACTS = 'Channel_Contacts';
var CLASS_CHANNEL_PARTNER_STRIP = 'Channel_PartnerStrip';
var CLASS_CHANNEL_WELCOME = 'Channel_Welcome';
var CLASS_CHANNEL_STATISTICS = 'Channel_Statistics';

var CLASS_CHANNEL_IMAGE = "ChannelImage";
var CLASS_TELEPHONY_CHANNEL_IMAGE = "TelephonyChannelImage";
var CLASS_CHAT_CHANNEL_IMAGE = "ChatChannelImage";
var CLASS_MAIL_CHANNEL_IMAGE = "MailChannelImage";
var CLASS_STATISTICS_CHANNEL_IMAGE = "StatisticsChannelImage";

var MAX_NUMBER_ATTACHMENTS = 5;
var MAX_SUM_ATTACHMENTS_IN_MB = 50;

var KEY_ENTER = 13;
var KEY_SPACE = 32;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_PAGE_UP = 33;
var KEY_PAGE_DOWN = 34;
var KEY_POSITION_END = 35;
var KEY_POSITION_1 = 36;

var FONT_FAMILY = "segoe ui,arial,helvetica,arial,verdana,sans-serif";

var SHADOW_BORDER = "box-shadow:none"; //0px 0px 1px lightgrey !important";

var MIN_WIDTH_BUTTON = 125;

var FONT_SIZE_MAINTITLE = 40;
var FONT_SIZE_NAME = 23;
var FONT_SIZE_HEADER = 22;
var FONT_SIZE_HEADLINE = 17;
var FONT_SIZE_TITLE = 14;
var FONT_SIZE_SUBTITLE = 13;
var FONT_SIZE_TEXT = 12;

var FONT_SIZE_MODAL_DIALOG = 16;
var FONT_SIZE_SUB_SETTING = FONT_SIZE_TEXT;
var FONT_SIZE_HEAD_SETTING = 17;

var FULL_GROUP_CONTACT_WIDTH = 110;
var FULL_GROUP_CONTACT_HEIGHT = 110;
var MINI_GROUP_CONTACT_WIDTH = 200;
var MINI_GROUP_CONTACT_HEIGHT = 30;
var TILE_BORDER_WIDTH = 3;

var WIDTH_EMAIL_HEADER_LABEL = 65;

var TEMPLATE_STYLE_TITLE = function ()
{
    return 'font-weight:500;font-size:' + FONT_SIZE_TITLE + 'px; color:' + COLOR_TITLE.toString();
};

var TEMPLATE_STYLE_SUBTITLE = function (marginTop) {
    return 'margin-top:' + marginTop + 'px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_SUBTITLE.toString();
};

var TEMPLATE_STYLE_TEXT = function (text, marginTop) {
    marginTop = marginTop || 2;
    marginTop = isValidString(text) ? marginTop : 0;
    return 'margin-top:' + marginTop + 'px;font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_TEXT.toString();
};



var DEFAULT_WIDTH_FOR_LISTS = 320;
var DEFAULT_WIDTH_FOR_REQUEST_MANAGEMENT = 250;
var WIDTH_CALL_DISPLAY_PANEL = 400;

var TITLE = 'timio';

var ALL_ADDRESS_BOOKS = "";

var CALL_BUTTON_SIZE = 40;

var NOTIFICATIONS_WIDTH = WIDTH_CALL_DISPLAY_PANEL;

var ONE_DAY = 1000 * 60 * 60 * 24;

CONTACT_FIRSTNAME = '_FirstName';
CONTACT_LASTNAME = '_LastName';
CONTACT_COMPANY = '_Company';
CONTACT_IMAGE = '_ImageUrl';
CONTACT_PHONE = '_OfficePhoneNumbers';
CONTACT_FAX = '_OfficeFaxNumbers';
CONTACT_MOBILE_PHONE = '_MobilePhoneNumbers';
CONTACT_HOME_PHONE = '_HomePhoneNumbers';
CONTACT_PRESENCE = '_PresenceState';
CONTACT_PRESENCE_TEXT = '_PresenceText';
CONTACT_EMAIL = '_EMail';
CONTACT_HOME_EMAIL = '_HomeEmail';
CONTACT_GUID = '_GUID';
CONTACT_OBJECT_NAME = '_ObjectName';
CONTACT_ESCAPED_OBJECT_NAME = '_escapedObjectName';
CONTACT_OBJECT_SOURCE = '_ObjectSource';
CONTACT_PRESENCE_IMAGE = '_PresenceStateImage';
CONTACT_DEPARTMENT = '';
CONTACT_OFFICE_STREET = '';
CONTACT_OFFICE_CITY = '_OfficeCity';
CONTACT_AGENT_STATE = '_AgentState';
CONTACT_AGENT_STATE_TEXT = '_AgentStateText';

CLIENT_SETTINGS_KEY_NOTICE_TEXT_FOR_CALL_ID = "noticeTextForCallId_";

var LOCAL_CONTACTS = "[local_contacts]";

var CLS_CONTACT_TILE = 'ContactTile';
var CLS_AUTHOR = 'author';
var CLS_SENDER_CONTACT = 'senderContact';
var CLS_RECEIVER_CONTACT = 'receiverContact';

var ROUND_THIN_BUTTON = 'roundThinButton';
var HIGHLIGHTED_ROUND_THIN_BUTTON = 'highlightedRoundThinButton';
var ACCEPT_BUTTON = 'acceptButton';
var DECLINE_BUTTON = 'declineButton';

var PREFIX_WEBSITE = "website";

var VIEWS_PADDING_LEFT = '15px';
var VIEWS_PADDING_RIGHT = '5px';
var VIEWS_PADDING_TOP = '5px';
var VIEWS_PADDING_BOTTOM = '5px';
var VIEWS_PADDING = VIEWS_PADDING_TOP + ' ' + VIEWS_PADDING_RIGHT + ' ' + VIEWS_PADDING_BOTTOM + ' ' + VIEWS_PADDING_LEFT;

var DEFAULT_TIMEOUT_ERROR_MESSAGES = 5;

var DEFAULT_SUCCESS_CALLBACK = function (callbackForSuccess, callbackForFail) {
    return function (response) {
        if (response.getReturnValue().getCode() === 0) {
            if (isValid(callbackForSuccess)) {
                callbackForSuccess.apply(this, arguments);
            }
        }
        else {
            if (isValid(callbackForFail)) {
                callbackForFail.apply(this, arguments);
            }

            showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    };
};

var DEFAULT_EXCEPTION_CALLBACK = function (errorMessage, callback) {
    return function () {
        if (isValid(callback)) {
            callback.apply(this, arguments);
        }
        showWarningMessage(errorMessage, DEFAULT_TIMEOUT_ERROR_MESSAGES);
    };
};

var BLACK_LIST = ['NS', 'SS', 'HJ', 'KZ', 'SA'];

var BUILD_NUMBER = "1167";

var WEBRTCAVAILABLE = false;

var CLASSNAME_CONFIRM_DELETE_BUTTON = 'ConfirmDeleteButton';

var HEIGHT_WAIT_CURSOR = 50;

var TOOLTIP_SHOW_DELAY = 500;

var BORDER_RADIUS_BUTTONS = '20px';

const ICON_NAME_ACD_GROUP = "group";
const ICON_NAME_ACD_AGENT = "headset2";

const CLASSNAME_ICON_BUTTON = 'iconButton';


function getWaitCursorTemplate(itemSeparator, borderTop, spinnerCls)
{
    borderTop = borderTop || ('border-top:1px solid ' + COLOR_SEPARATOR.toString());
    spinnerCls = spinnerCls || "spinner_black";
    return '<div class="waitMessage spinner ' + spinnerCls + ' ' + itemSeparator + '" style="' + borderTop + ';">' +
        '<div class="bounce1"></div>' +
        '<div class="bounce2"></div>' +
        '<div class="bounce3"></div> ' +
        '</div>';
    /*
    return '<div class="waitMessage ' + itemSeparator + '" style="' + borderTop + ';">' +
        '<div class="x-component x-border-box x-mask x-component-default" style="display:flex;flex:1;height:' + HEIGHT_WAIT_CURSOR + 'px;position:relative;justify-content:center">' +
                                    '<div data-ref="msgWrapEl" class="x-mask-msg">' +
                                        '<div data-ref="msgEl" class="x-mask-loading x-mask-msg-inner">' +
                                            '<div data-ref="msgTextEl" class="x-mask-msg-text"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';*/
}

var DETECT_TIMEOUT = 2500;
var DISPLAY_TIMEOUT = 4 * DETECT_TIMEOUT;

var MARGIN_BETWEEN_COMPONENTS = 10;
var MARGIN_BETWEEN_PHOTO_AND_NAME = 15;

const SPLITTER_SIZE = MARGIN_BETWEEN_COMPONENTS + 1;

var SOURCE_CONTACT_CENTER = "ContactCenter";
var SOURCE_APPLICATION = "Application";
var SOURCE_USER = "User";

var SWITCH_LAYOUT = {
    small:
    {
        layout:
        {
            type: 'box',
            align: 'stretch',
            vertical: true
        }
    },

    large:
    {
        layout:
        {
            type: 'box',
            align: 'stretch',
            vertical: false
        }
    }
};

const HEIGHT_WELCOME_PAGE_LIST_ITEM = 24;

const ICON_TRANSFER_CALL = 'transfer';
const ICON_SECOND_CALL = 'thick_add';

const KEY_DIAL_HISTORY = 'dialHistory';
const KEY_CALL_DIVERSION_HISTORY = 'callDiversionHistory';
const KEY_TRANSFER_HISTORY = 'transferHistory"';
const KEY_SEARCH_COLLEAGUES_HISTORY = 'searchColleaguesHistory';
const KEY_SEARCH_EXTERNAL_CONTACTS_HISTORY = 'searchExternalContactsHistory';
const KEY_SEARCH_FAVORITES_HISTORY = 'searchFavoritesHistory';
const KEY_SEARCH_PARTNER_HISTORY = 'searchPartnerHistory';