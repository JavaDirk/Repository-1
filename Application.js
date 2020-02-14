var PARENT_REQUEST_STORE;
var OPEN_REQUEST_STORE;
var OVERDUE_REQUEST_STORE;
var TODAY_REQUEST_STORE;
var EDIT_REQUEST_STORE;
var WORKED_REQUEST_STORE;
var DRAFT_REQUEST_STORE;

var isGoogleMapsApiLoaded = false;
window.googleMapsLoaded = function ()
{
    isGoogleMapsApiLoaded = true;
};

class TimioApplication
{
    constructor()
    {
        Ext.ariaWarn = Ext.emptyFn;
        Ext.setEnableKeyboardMode(true);
        /*
        Ext.tip.QuickTipManager.init();
        Ext.apply(Ext.tip.QuickTipManager.getQuickTip(), {
            showDelay: 1000,
            trackMouse: false
        });
        */
        preventBrowserContextmenuExceptForInputs();

        Ext.iterate(RENDER_IMAGES, function (key, value)
        {
            IMAGE_LIBRARY.addToLibrary(key, value);
        }, this);

        SESSION.addListener(this);
        SESSION.addVIPListener(CURRENT_STATE_CONTACT_CENTER);
        LANGUAGE.setProxySession(SESSION);
    }

    onLogin(response, relogin)
    {
        this.initRequestStores();

        if (response.getReturnValue().getCode() === 0)
        {
            addLanguageDependentStringsToEnums();

            this.loadExtJsLanguageFiles(response.getContact().getLanguage());

            this.initGoogleMaps(response);
        }
    }

    onLogoutSuccess(response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.onLogoutWasSuccessfull();
        }
    }

    onLogoutWasSuccessfull()
    {
        this.clearSessionStorageAfterLogout();

        IMAGE_LIBRARY = new ImageLibraryForTimio();
    }

    onNewEvents(event)
    {
        this.showContactCenterError(event);
    }

    loadExtJsLanguageFiles(language)
    {
        var languageShortcut = language === "Germany" ? "de" : "en";
        var url = Ext.util.Format.format("../shared/ext-7.1.0/build/classic/locale/locale-" + languageShortcut + ".js");

        Ext.Loader.loadScript({
            url: url,
            onLoad: Ext.emptyFn,
            onError: Ext.emptyFn,
            scope: this
        });
    }

    initRequestStores()
    {
        if (PARENT_REQUEST_STORE)
        {
            return;
        }

        PARENT_REQUEST_STORE = new ParentRequestStore();
        OPEN_REQUEST_STORE = Ext.create('OpenRequestStore', {});
        OVERDUE_REQUEST_STORE = Ext.create('OverdueRequestStore', {});
        TODAY_REQUEST_STORE = Ext.create('TodayRequestStore', {});
        EDIT_REQUEST_STORE = Ext.create('EditRequestStore', {});
        WORKED_REQUEST_STORE = Ext.create('WorkedRequestStore', {});
        DRAFT_REQUEST_STORE = Ext.create('DraftRequestStore', {});
    }

    initGoogleMaps(response)
    {
        if (!isValid(window, "google.maps"))
        {
            var googleMapsKey = response.getGoogleMapsKey();
            loadjscssfile("https://maps.googleapis.com/maps/api/js?v=3&callback=googleMapsLoaded&key=" + googleMapsKey, "js");
            loadjscssfile("https://www.google.com/jsapi", "js");
        }
    }

    clearSessionStorageAfterLogout()
    {
        SESSION_STORAGE.removeItem('LoginPassword');
        SESSION_STORAGE.removeItem('sessionId');
    }

    showContactCenterError(event)
    {
        if (isValid(event.getContactCenterLoginData()))
        {
            if (event.getContactCenterLoginData().getAvailability() === ContactCenterAvailability.TemporaryNotAvailable.value && isValidString(event.getContactCenterLoginData().getErrorText()))
            {
                var errorText = event.getContactCenterLoginData().getErrorText();
                showWarningMessage(errorText);
            }
        }
    }
}

class RequestManagementApplication extends TimioApplication
{
    onNewEvents(event)
    {
        this.showContactCenterError(event);

        if (isValid(event, 'getMailProcessingAvailability()'))
        {
            GLOBAL_EVENT_QUEUE.onGlobalEvent_MailProcessingChanged(event.getMailProcessingAvailability(), true);
        }
    }

    onLogoutSuccess(response)
    {
        if (response.getReturnValue().getCode() === 0)
        {
            this.clearSessionStorageAfterLogout();

            window.location.href = 'EmailClient.html';
        }
    }
}