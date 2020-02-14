// Events
var ACTION_TYPE_MANUELL = "0";
var ACTION_TYPE_RING = "1";
var ACTION_TYPE_CONNECTED = "2";
var ACTION_TYPE_OCCUPIED = "3";
var ACTION_TYPE_NORESPONSE = "4";
var ACTION_TYPE_CALLEND = "5";
var ACTION_TYPE_HANGON = "6";
var ACTION_TYPE_ON_STARTUP = "7";
var ACTION_TYPE_CONTACT = "8";
var ACTION_TYPE_CALLNOTIFICATION = "9";
var ACTION_TYPE_PRESENCESTATE = "10";

// subtyp
var ACTION_SUBTYPE_INGOING = "0";
var ACTION_SUBTYPE_OUTGOING = "1";
var ACTION_SUBTYPE_BOTH = "2";
var ACTION_SUBTYPE_NONE = "3";

// call usage
var ACTION_CALLUSAGE_BUSINESS = "0";
var ACTION_CALLUSAGE_PRIVATE = "1";
var ACTION_CALLUSAGE_BOTH = "2";

// number state
var ACTION_NUMBERSTATE_ALL = "0";
var ACTION_NUMBERSTATE_HIDDEN = "1";
var ACTION_NUMBERSTATE_VISIBLE = "2";

// contact state
var ACTION_CONTACTSTATE_RESOLVED      =  "0";
var ACTION_CONTACTSTATE_NOTRESOLVED   =  "1";
var ACTION_CONTACTSTATE_BOTH = "2";

// contact center group
var ACTION_CCGROUPRESTRICT_ALL       =  "0";
var ACTION_CCGROUPRESTRICT_NAMED     =  "1";
                                         
// intern /extern                        
var ACTION_CALLTYPE_INTERN           = "0";
var ACTION_CALLTYPE_EXTERN           = "1";
var ACTION_CALLTYPE_BOTH             = "2";
                                           
// Direktanruf / Contact Center-Anruf      
var ACTION_ROUTINGMODE_DIRECT        = "0";
var ACTION_ROUTINGMODE_CONTACTCENTER = "1";
var ACTION_ROUTINGMODE_BOTH          = "2";
                                           
// Bildtyp (Kontaktaktionen)               
var ACTION_IMAGETYPE_UNKNOWN         = "0";
var ACTION_IMAGETYPE_ICO             = "1";
var ACTION_IMAGETYPE_BMP = "2";

// Bildanzeigemodus (Kontaktaktionen)
var ACTION_SHOWIMAGEMODE_NONE = "0";
var ACTION_SHOWIMAGEMODE_DEFAULT = "1";
var ACTION_SHOWIMAGEMODE_NAMED = "2";


var ACTION_OPENURL = "6";
/*
// action
#define ID_ACTION_NEWDOC                "0"
#define ID_ACTION_OPENDOC               "1"
#define ID_ACTION_OPENCONTACT           "2"
#define ID_ACTION_OPENVIEW              "3"
#define ID_ACTION_NEWNOTE               "4"
#define ID_ACTION_RUNPROG               "5"
#define ID_ACTION_OPENURL               "6"
#define ID_ACTION_EDITDOC               "7"
#define ID_ACTION_OPENDB                "8"
#define ID_ACTION_OPENDOCEXT            "9"


// actions exchange
#define ID_ACTION_EX_NEWMESSAGE         "0"
#define ID_ACTION_EX_NEWMEETING         "1"
#define ID_ACTION_EX_OPENCONTACT        "2"
#define ID_ACTION_EX_NOTETOJOURNAL      "3"
#define ID_ACTION_EX_NEWNOTE            "4"
#define ID_ACTION_EX_RUNPROG            "5"
#define ID_ACTION_EX_NEWTASK            "6"
#define ID_ACTION_EX_NEWTASKREQ         "7"
#define ID_ACTION_EX_TALKREQ            "8"
#define ID_ACTION_EX_OPENDOCEXT         "9"
#define ID_ACTION_EX_OPENURL            "10"
*/

// action telephony

var ACTION_TELEPHONY_DIAL     =   "100";
var ACTION_TELEPHONY_HANGUP   =   "101";
var ACTION_TELEPHONY_REDIRECT =   "102";
var ACTION_TELEPHONY_FORWARD  =   "103";
var ACTION_TELEPHONY_SENDDTMF = "104";

// action webservice
var ACTION_WEBSERVICES = "200";

// action call routing
var ACTION_CALLROUTING = "300";

// presence state
var ACTION_PRESENCESTATE_PRESENT     =  "0";
var ACTION_PRESENCESTATE_ABSENT      =  "1";
var ACTION_PRESENCESTATE_BREAK       =  "2";
var ACTION_PRESENCESTATE_DONTDISTURB =  "3";
var ACTION_PRESENCESTATE_OFFLINE = "4";

// page type
var ACTION_PAGE_START          =         "1";
var ACTION_PAGE_CALL           =         "2";
var ACTION_PAGE_CONTACT = "3";

// presentation type
var ACTION_PRESENTATION_BUTTON =         "1";
var ACTION_PRESENTATION_LINK = "2";

var ACTION_SPLITTER_SIGN = "§";

var ACTION_BROWSER_MODE_EMBEDDED	 = "embedded";
var ACTION_BROWSER_MODE_EXTERNAL	 = "external";
var ACTION_BROWSER_MODE_NONE		 = "none";
var ACTION_BROWSER_MODE_TIMIO		 = "timio";
var ACTION_BROWSER_MODE_TIMIOCALL	 = "timioCallWindow";
var ACTION_BROWSER_MODE_TIMIOCONTACT = "timioContactWindow";
var ACTION_BROWSER_MODE_OUTSIDETIMIO = "outsideTimio";
