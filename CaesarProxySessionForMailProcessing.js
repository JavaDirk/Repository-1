SESSION._proxy = new www_caseris_de_CaesarSchema_ICaesarProxy();
SESSION._proxy.url = '/Proxy';

CaesarProxySession.prototype.loginForMailProcessing = function (token, username, password, relogin, onSuccess, onException)
{
    if (!relogin) {
        this._eventsLoopStop = false;
    }

    if (isValidString(onSuccess))
    {
        onSuccess = undefined;
    }

    this._token = token;
    this._userName = username;
    this._password = btoa(password);

    this._relogin = (typeof relogin === "undefined" || relogin === false) ? false : true;
    if (this._loginIsOnTheWay) {
        return false;
    }
    this._loginIsOnTheWay = true;

    if (!isValid(onSuccess) && !isValid(onException)) {
        var self = this;
        onSuccess = function (response) { self.onLoginSuccess(response); };
        onException = function () { self.onLoginException(); };
    }

    this._proxy.LoginForMailProcessing(onSuccess, onException, this._token, this._userName, atob(this._password), 'Version2017');
    return true;
};

CaesarProxySession.prototype.onLoginSuccess = function (response) {
    this._loginIsOnTheWay = false;
    this.loginResponse = response.getReturnValue();
    if (isValid(this.loginResponse))
    {
        switch (this.loginResponse.getCode())
        {
            case ProxyError.ErrorOK.value:

                var me = response.getContact();
                this.me = me;

                this._isLoggedIn = true;
                this._sessionID = response.getSessionId();

                this.fireEvent("onLogin", response, this._relogin);
                var self = this;
                setTimeout(function () { self.getEvents(); }, 100);
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

CaesarProxySession.prototype.relogin = function () {
    return this.loginForMailProcessing(this._token, this._userName, atob(this._password), true);
};
