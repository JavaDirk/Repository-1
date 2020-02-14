CaesarProxySession.prototype.login = function (autoLogout, name, password, relogin, onSuccess, onException) {
    if (!relogin) {
        this._eventsLoopStop = false;
    }
    this._name = name;
    this._password = password;
    this._relogin = (typeof relogin === "undefined" || relogin === false) ? false : true;
    this._autoLogout = (typeof autoLogout === "undefined" || autoLogout === false) ? false : true;
    if (this._loginIsOnTheWay) {
        return false;
    }
    this._loginIsOnTheWay = true;

    var sessionID = SESSION_STORAGE.getItem(SESSION_ID_COOKIE);
    if (!sessionID) { shared.newSession = true; }
    if (!isValid(onSuccess) && !isValid(onException)) {
        var self = this;
        onSuccess = function (response) { self.onLoginSuccess(response); };
        onException = function () { self.onLoginException(); };
    }

    var promise = Caesar.Access.loginForAgentManager(this._name, this._password, "", this._autoLogout, Caesar.ApiLevel.Version2017);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.LoginForAgentManagerResponse);
        onSuccess(response);
    }, function () {
        onException();
    });
    return true;
};

CaesarProxySession.prototype.onLoginSuccess = function (response) {
    this._loginIsOnTheWay = false;
    this.loginResponse = response.getReturnValue();
    if (isValid(this.loginResponse) && this.loginResponse.getCode() === ProxyError.ErrorOK.value) {
        var me = response.getContact();
        this.me = me;

        this._isLoggedIn = true;
        this._sessionID = response.getSessionId();
        SESSION_STORAGE.setItem(SESSION_ID_COOKIE, this._sessionID);

        this.fireEvent("onLogin", response, this._relogin);
        var self = this;
        setTimeout(function () { self.getEvents(); }, 100);
    }
    else if (isValid(this.loginResponse) && this.loginResponse.getCode() === ProxyError.ErrorSessionNotFound.value) {
        this.relogin();
    }
    else {
        console.log("login failed, error: " + this.loginResponse.getDescription());
        this.onLoginException(response);
    }
};

CaesarProxySession.prototype.relogin = function () {
    return this.login(this._autoLogin, this._name, this._password, true);
};

CaesarProxySession.prototype.onLoginException = function (response) {
    SESSION_STORAGE.removeItem(SESSION_ID_COOKIE);
    this._loginIsOnTheWay = false;

    this.fireEvent("onLoginFailed", response);
};

CaesarProxySession.prototype.onGetEventsException = function (response) {
    console.log("getEvents: Exception occurred");
    this.onConnectionLost();
};
CaesarProxySession.prototype.onConnectionLost = function (response) {
    this.fireEvent("onConnectionLost");
    this.reconnect(5);
    this._isLoggedIn = false;
};