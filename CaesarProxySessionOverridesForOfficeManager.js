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

    var promise = Caesar.Access.loginForOfficeManager(this._name, this._password, sessionID, Caesar.ApiLevel.Version2017);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.LoginForOfficeManagerResponse);
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


CaesarProxySession.prototype.addCalendarException = function (calendarId, name, start, end, workTime, onSuccess, onException) {
    var self = this;
    this._calendarId = calendarId;
    this._name = name;
    this._start = start;
    this._end = end;
    this._workTime = workTime;

    var promise = Caesar.Access.contactCenter_AddCalendarException(this._sessionID, calendarId, name, start, end, workTime);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.contactCenter_AddCalendarExceptionResponse);
        onSuccess(response);
    }, function () {
        onException();
    });
};


CaesarProxySession.prototype.deleteCalendarException = function (calendarId, exceptionId) {
    var self = this;
    this._calendarId = calendarId;
    this._exceptionId = exceptionId;

    var promise = Caesar.Access.contactCenter_DeleteCalendarException(this._sessionID, calendarId, exceptionId);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.contactCenter_DeleteCalendarExceptionResponse);
        self.onDeleteCalendarExceptionSuccess(response);
    }, function () {
        self.onDeleteCalendarExceptionException(response);
    });
};

CaesarProxySession.prototype.onDeleteCalendarExceptionSuccess = function (response) {
    this.fireEvent('onDeleteCalendarExceptionSuccess', response);
};

CaesarProxySession.prototype.onDeleteCalendarExceptionException = function () {
    this.fireEvent('onDeleteCalendarExceptionException');
};

CaesarProxySession.prototype.getCalendar = function (calendarId, success, fail) {
    var self = this;
    this._calendarId = calendarId;

    var promise = Caesar.Access.contactCenter_GetCalendar(this._sessionID, calendarId);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_GetCalendarResponse);
        success(response);
    }, function () {
        fail(response);
    });
};

CaesarProxySession.prototype.onGetCalendarSuccess = function (response) {
    this.fireEvent('onDeleteCalendarExceptionSuccess', response);
};

CaesarProxySession.prototype.onGetCalendarException = function () {
    this.fireEvent('onDeleteCalendarExceptionException');
};

CaesarProxySession.prototype.getCalendarDays = function (calendarId, days, includeNextWorkTime, success, fail) {
    var self = this;
    this._calendarId = calendarId;


    var promise = Caesar.Access.contactCenter_GetCalendarDays(this._sessionID, calendarId, days, includeNextWorkTime);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_GetCalendarDaysResponse);
        success(response);
    }, function () {
        fail(response);
    });
};

CaesarProxySession.prototype.onGetCalendarDaysSuccess = function (response) {
    this.fireEvent('onDeleteCalendarDaysExceptionSuccess', response);
};

CaesarProxySession.prototype.onGetCalendarDaysException = function () {
    this.fireEvent('onDeleteCalendarDaysExceptionException');
};


CaesarProxySession.prototype.modifyCalendarException = function (calendarId, exceptionId, name, start, end, workTime, onSuccess, onException) {
    var self = this;
    this._calendarId = calendarId;
    this._exceptionId = exceptionId;
    this._name = name;
    this._start = start;
    this._end = end;
    this._workTime = workTime;

    var promise = Caesar.Access.contactCenter_ModifyCalendarException(this._sessionID, calendarId, exceptionId, name, start, end, workTime);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_ModifyCalendarExceptionResponse);
        onSuccess(response);
    }, function () {
        onException(response);
    });
};


CaesarProxySession.prototype.modifyCalendarWeekDay = function (calendarId, weekDay, workTime, onSuccess, onException) {
    var self = this;
    this._calendarId = calendarId;
    this._weekDay = Caesar.WeekDay[weekDay];
    this._workTime = workTime;

    var promise = Caesar.Access.contactCenter_ModifyCalendarWeekDay(this._sessionID, calendarId, Caesar.WeekDay[weekDay], workTime);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_ModifyCalendarWeekDayResponse);
        onSuccess(response);
    }, function () {
        onException(response);
    });
};


CaesarProxySession.prototype.setDynamicOption = function (optionId, optionValue, validUntil, onSuccess, onException) {
    var self = this;
    this._optionId = optionId;
    this._optionValue = optionValue;
    this._validUntil = validUntil;

    var promise = Caesar.Access.contactCenter_SetDynamicOption(this._sessionID, optionId, optionValue, validUntil);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_SetDynamicOptionResponse);
        onSuccess(response);
    }, function () {
        onException(response);
    });
};

CaesarProxySession.prototype.setMessageOfTheDay = function (messageId, text) {
    var self = this;
    this._messageId = messageId;
    this._text = text;

    var promise = Caesar.Access.contactCenter_SetMessageOfTheDay(this._sessionID, messageId, text);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_SetMessageOfTheDayResponse);
        self.onSetMessageOfTheDaySuccess(response);
    }, function () {
        self.onSetMessageOfTheDayException(response);
    });
};

CaesarProxySession.prototype.onSetMessageOfTheDaySuccess = function (response) {
    this.fireEvent('onSeMessageOfTheDaySuccess', response);
};

CaesarProxySession.prototype.onSetMessageOfTheDayException = function () {
    this.fireEvent('onSetMessageOfTheDayException');
};

CaesarProxySession.prototype.onConnectionLost = function (response) {
    this.fireEvent("onConnectionLost");
    this.reconnect(30);
    this._isLoggedIn = false;
};