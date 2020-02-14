CaesarProxySession.prototype.login = function (force, name, password, relogin, onSuccess, onException, token) {
    var self = this;

    if (!relogin) {
        this._eventsLoopStop = false;
    }
    this._name = name;
    this._password = password;
    this._relogin = (typeof relogin === "undefined" || relogin === false) ? false : true;
    this._token = token;
    //this._force = (typeof autoLogout=== "undefined" || autoLogout === false) ? false : true;
    this._force = force || false;
    if (this._loginIsOnTheWay) {
        return false;
    }

    this._loginIsOnTheWay = true;

    if (!isValid(onSuccess) && !isValid(onException)) {
        onSuccess = function (response) { self.onLoginSuccess(response); };
        onException = function () { self.onLoginException(); };
    }

    var sessionId = "";
    if (sessionId.length > 0) {
        Logger.info("Login: Reuse SessionId: " + sessionId);
    } else {
        Logger.info("Login: New SessionId - No relogin!");
    }
    

    var promise = Caesar.Access.loginForDashboard(this._name, this._password, sessionId, Caesar.ContactCenterDeviceType.Undefined, Caesar.ApiLevel.Version2020, false, "en-US", token);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.LoginForDashboardResponse);
        onSuccess(response);
    }, function () {
        onException();
    });
    return true;
};

CaesarProxySession.prototype.onLoginSuccess = function (response) {
    this._loginIsOnTheWay = false;

    this.lastLoginResponse = response;
    this.loginResponse = response.returnValue;
    if (isValid(this.loginResponse) && this.loginResponse.Code === ProxyError.ErrorOK.value) {
        this.me = response.Contact;

        this._isLoggedIn = true;
        this._sessionID = response.sessionId;
        Logger.info("Login: Successful: Use SessionId: " + response.sessionId);
        SESSION_STORAGE.setItem(SESSION_ID_COOKIE, this._sessionID);
        this.fireEvent("onLogin", response, this._relogin);

        var self = this;
        self.getEvents();
    }
    else if (isValid(this.loginResponse) && this.loginResponse.Code === ProxyError.ErrorSessionNotFound.value) {
        this.relogin();
    }
    else {
        console.log("login failed, error: " + this.loginResponse.Description);
        this.onLoginException(response);
    }
};

CaesarProxySession.prototype.reset = function () {
    this._sessionID = "";
    this._eventsLoopStop = true;
    SESSION.logout(true);
};

CaesarProxySession.prototype.onLoginException = function (response) {
    console.log("onLoginException");
    this._loginIsOnTheWay = false;
    //SESSION.logout(true);
    this.fireEvent("onLoginFailed", response, this._relogin);
    if (this._relogin) {
        var errorCodes = [ProxyError.ErrorAmbigousUser.value, ProxyError.ErrorUserNotFound.value, ProxyError.ErrorAuthenticationFailed.value, ProxyError.ErrorAccountLocked.value];

        if (isValid(response) && Ext.Array.contains(errorCodes, response.getReturnValue().getCode())) {
            return;
        }
        this.reconnect(15);
    }
};


CaesarProxySession.prototype.relogin = function () {
    //this.abortGetEvents();
    
    return this.login(true, this._name, this._password, true, null, null, this._token);
};

CaesarProxySession.prototype.getDashboardValueList = function (objectType, language, success, fail) {
    var self = this;
    var promise = Caesar.Access.contactCenter_GetDashboardValueList(this._sessionID, Caesar.ContactCenterObjectType[objectType], language, Caesar.ApiLevel.Version2020)
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_GetDashboardValueListResponse);
        success(response);
    }, function () {
        fail();
    });
};


CaesarProxySession.prototype.saveDashboardConfiguration = function (dashboardId, configuration, success, fail) {
    var self = this;
    var promise = Caesar.Access.contactCenter_SaveDashboardConfiguration(this._sessionID, dashboardId, configuration)
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_SaveDashboardConfigurationResponse);
        success(response);
    }, function () {
        fail();
    });
};