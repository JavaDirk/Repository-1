CaesarProxySession.prototype.login = function (force, name, password, relogin, onSuccess, onException, loginOptions)
{
    var self = this;

    if (!relogin) {
        this._eventsLoopStop = false;
    }
    this._name = name;
    this._password = btoa(password);
    this._loginOptions = loginOptions;
    this._relogin = (typeof relogin === "undefined" || relogin === false) ? false : true;
    //this._force = (typeof autoLogout=== "undefined" || autoLogout === false) ? false : true;
    this._force = force || false;
    if (this._loginIsOnTheWay) {
        return false;
    }

    this._loginIsOnTheWay = true;

    if (!isValid(onSuccess) && !isValid(onException)) {
        onSuccess = function (response, loginOptions) { self.onLoginSuccess(response, loginOptions); };
        onException = function () { self.onLoginException(); };
    }

    var sessionId = "";
    if (relogin)
    {
        sessionId = this._sessionID;
    }
    
    var promise = Caesar.Access.loginForTimio(this._name, atob(this._password), Caesar.Service.All, this._force, sessionId, loginOptions);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.LoginForTimioResponse);
        onSuccess(response, loginOptions);
    }, function () { onException(); });
    return true;
};

CaesarProxySession.prototype.onLoginSuccess = function (response, loginOptions) {
    this._loginIsOnTheWay = false;
    if (!this._relogin)
    {
        this.lastLoginTimeStamp = new Date();
    }
    this.lastLoginResponse = response;

    this.loginResponse = response.getReturnValue();
    if (isValid(this.loginResponse))
    {
        switch (this.loginResponse.getCode())
        {
            case ProxyError.ErrorOK.value:

                this.me = response.getContact();

                this._isLoggedIn = true;
                this._sessionID = response.getSessionId();
                this.configuration = response.getConfiguration();

                this.fireEvent("onLogin", response, this._relogin, loginOptions);

                var self = this;
                self.getEvents();
                setTimeout(function () { self.getFavourites(); }, 100);
                setTimeout(function () { self.getBuddyList(); }, 150);
                return;
            case ProxyError.ErrorSessionNotFound.value:
                this.relogin();
                return;
            case ProxyError.ErrorServerExhausted.value:
                this.reloginAfterServerExhaustedFault(this.loginResponse.getNextLoginTrial());
                return;
        }
    }
    
    console.log("login failed, error: " + this.loginResponse.getDescription());
    this.onLoginException(response);
};

CaesarProxySession.prototype.defineTimioFeatures = function ()
{
    this.features = [
        TimioFeature.Telephony_CTI,
        TimioFeature.Telephony_Softphone,
        TimioFeature.ContactCenter,
        TimioFeature.Search,
        TimioFeature.Chat,
        TimioFeature.LiveChat,
        TimioFeature.Contacts,
        TimioFeature.WebRtcIncoming,
        TimioFeature.WebRtcOutgoing,
        TimioFeature.Statistics,
        TimioFeature.Partnerlist
    ];

    var clientMode = this.getClientModeName();

    if (isValidString(clientMode))
    {
        Ext.iterate(TimioClientMode, function (key, value)
        {
            if (equalsIgnoringCase(key, clientMode))
            {
                this.features = value.features;
                return false;
            }
        }, this);
    }

    var currentUrl = new URL(window.location.href.toLowerCase());
    var phoneMode = currentUrl.searchParams.get('phonemode');
    if (equalsIgnoringCase(phoneMode, "softphone"))
    {
        this.features.push(TimioFeature.Telephony_Softphone);
    }
    else if (equalsIgnoringCase(phoneMode, "cti"))
    {
        this.features.push(TimioFeature.Telephony_CTI);
    }
};

CaesarProxySession.prototype.getClientModeName = function ()
{
    var currentUrl = new URL(window.location.href.toLowerCase());
    var clientMode = currentUrl.searchParams.get('clientmode');
    if (isValidString(clientMode))
    {
        var foundClientMode = "";
        Ext.iterate(TimioClientMode, function (key, value)
        {
            if (equalsIgnoringCase(key, clientMode))
            {
                foundClientMode = key;
                return false;
            }
        }, this);
        return foundClientMode;
    }
    return "";
};

CaesarProxySession.prototype.getLastLoginTimeStamp = function ()
{
    return this.lastLoginTimeStamp;
};

CaesarProxySession.prototype.relogin = function ()
{
    Caesar.Access.stopEventProcessing();

    return this.login(true, this._name, atob(this._password), true, null, null, this._loginOptions);
};

CaesarProxySession.prototype.getApplication = function ()
{
    return Caesar.Application.Timio;
};

CaesarProxySession.prototype.isFeatureAllowed = function (feature)
{
    if (!isValid(this.features))
    {
        this.defineTimioFeatures(); //das wird ein Problem werden, wenn wir den clientMode irgendwann nicht über die url, sondern erst beim login bekommen: woher soll das LoginWindow wissen, ob er die Softphone-Option anzeigen soll oder nicht?
    }
    return Ext.Array.contains(this.features, feature);
};

CaesarProxySession.prototype.areFeaturesAllowed = function (features)
{
    var result = true;
    Ext.each(features, function (feature)
    {
        if (!this.isFeatureAllowed(feature))
        {
            result = false;
            return false;
        }
    }, this);
    return result;
};

CaesarProxySession.prototype.isOneOfTheseFeaturesAllowed = function (features)
{
    var result = false;
    Ext.each(features, function (feature)
    {
        if (this.isFeatureAllowed(feature))
        {
            result = true;
            return false;
        }
    }, this);
    return result;
};

CaesarProxySession.prototype.isTelephonyAllowed = function ()
{
    return this.isOneOfTheseFeaturesAllowed([TimioFeature.Telephony_CTI, TimioFeature.Telephony_Softphone]);
};

CaesarProxySession.prototype.areSoftphoneAndCTIAllowed = function ()
{
    return this.areFeaturesAllowed([TimioFeature.Telephony_CTI, TimioFeature.Telephony_Softphone]);
};

CaesarProxySession.prototype.loadOEMSettings = function (tenant)
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/proxy/GetOemSettings?tenant=' + (tenant || ""));
    var self = this;
    xhr.onreadystatechange = function (response)
    {
        if (xhr.readyState === 4)
        {
            if (xhr.status === 200 && isValidString(xhr.responseText))
            {
                try
                {
                    self.onLoadOEMSettingsSuccess(JSON.parse(xhr.responseText));
                }
                catch (exception)
                {
                    console.log(exception);
                    self.onLoadOEMSettingsException();
                }
            }
            else
            {
                self.onLoadOEMSettingsException();
            }
        }
    };
    xhr.send();
};

CaesarProxySession.prototype.onLoadOEMSettingsSuccess = function (response)
{
    this.fireEvent("onLoadOEMSettingsSuccess", response);
};

CaesarProxySession.prototype.onLoadOEMSettingsException = function ()
{
    this.fireEvent("onLoadOEMSettingsException");
};
