/*
Die Klasse CaesarProxySession kümmert sich um die Kommunikation mit dem CAESAR Proxy Server. Es sollte nur eine Instanz im Programm geben.

Um sich am Proxy anzumelden, nutzt man eine der Login-Methoden.

Um Events vom Server mitzubekommen, sollte man einer der Methoden addListener/addVIPListener aufrufen. Ein VIPListener bekommt die Events synchron (und vor den normalen Listenern), die normalen
Listener bekommen die asynchron, nach den VIPs. Gedacht ist das so, dass Klassen, die die Daten des Proxies speichern, diese sofort bekommen (VIP), UI-Komponenten können noch etwas warten 
(weil sie sich evtl ja auch aus den Datenklassen bedienen).
Wenn man als Listener registriert ist, bekommt man wichtige Events wie onLogin, onLoginFailed, onConnectionLost, onLogout und onNewEvents (diese Methoden können die Listener implementieren,
um die Events zu bekommen).

Wenn man eine Methode des Proxies aufruft, gibt es 2 Arten, wie man eine Antwort vom Proxy erhält: Entweder die Methode hat einen successCallback und einen ExceptionCallback (das ist z.B. bei 
der Methode resolveName so) als Parameter, die man übergeben kann. Oder, aber, wenn es diese Parameter nicht gibt, dann muss der Listener zwei Methoden implementieren: onMETHODENNAMESuccess und 
onMETHODENNAMEException. Beispiel: Um die Chat-History vom Proxy zu bekommen, ruft man SESSION.getChatHistory(); auf und implementiert ongetChatHistorySuccess und ongetChatHistoryException
*/
//var worker = new Worker('../shared/WebWorkerForSession.js');

var ProxyError =
{
    ErrorOK: { value: 0 },
    ErrorAmbigousUser: { value: 1 },
    ErrorUserNotFound: { value: 2 },
    ErrorAuthenticationFailed: { value: 3 },
    ErrorCaesarDirectory: { value: 4 },
    ErrorSessionNotFound: { value: 5 },
    ErrorTooManyHits: { value: 12 },
    ErrorSetAgentState: { value: 30 },
    ErrorNotEnoughAgents: { value: 31 },
    ErrorTimeout: { value: 38 },
    ErrorAccountLocked: { value: 40 },
    ErrorContactExistsWithSameEMail: { value: 42 },
    ErrorContactExistsWithSameNumber: { value: 43 },
    ErrorForceNeededForFollowMe: { value: 48 },
    ErrorAskForAgentDevice: { value: 60 },
    ErrorUnknown: { value: 2000 },
    ErrorCancelEvents: { value: 111 },
    ErrorShutdown: { value: 112 },
    ErrorForceLogin: { value: 125 },
    ErrorTooManyAgents: { value: 126 },
    ErrorLicenseOverflow: { value: 127 },
    ErrorFormNotFilled: { value: 163 },
    ErrorTeamChatDeactivated: { value: 193 },
    ErrorTokenDoesNotExist: { value: 197 },
    ErrorChatRoomDoesNotExist: { value: 199 },
    ErrorNoMoreCampaignCalls: { value: 243 },
    ErrorServerExhausted: { value: 251 },
};

var SESSION_ID_COOKIE = 'SessionIDCookie';

function CaesarProxySession() {
    this._name = "";
    this._password = "";
    this._sessionID = "";
    this._listeners = [];
    this._vipListeners = [];
    this._isLoggedIn = false;
    this._eventsLoopStop = false;
    /*
    this._proxy = new www_caseris_de_CaesarSchema_ICaesarProxy();
    */
    this._proxy = {};
    this._proxy.url = '/Proxy';
}

CaesarProxySession.prototype.addListener = function (listener)
{
    /// <field name="listener" type="Object"/>
    if (Ext.Array.contains(this._listeners, listener)) {
        return;
    }
    //TODO: hier bei ExtJS-Objekten listener erst im boxready hinzufügen und im destroy-event removen
    this._listeners.push(listener);
};

CaesarProxySession.prototype.addVIPListener = function (listener) {
    if (Ext.Array.contains(this._vipListeners, listener)) {
        return;
    }
    this._vipListeners.push(listener);
};

CaesarProxySession.prototype.removeListener = function (listener) {
    this._listeners = Ext.Array.remove(this._listeners, listener);
};

CaesarProxySession.prototype.removeVIPListener = function (listener) {
    this._vipListeners = Ext.Array.remove(this._vipListeners, listener);
};

/*
CaesarProxySession.prototype.loginWithAgentDevice = function (agentDevice, onSuccess, onException) {
    this._eventsLoopStop = false;
    this._relogin = false;

    if (this._loginIsOnTheWay)
    {
        return false;
    }
        
    this._loginIsOnTheWay = true;

    if (!isValid(onSuccess) && !isValid(onException)) {
        var self = this;
        onSuccess = function (response) { self.onLoginSuccess(response); };
        onException = function () { self.onLoginException(); };
    }
    this._proxy.LoginWithAgentDevice(onSuccess, onException, this._name, this._password, "Caesar2Go", agentDevice);

    return true;
};
CaesarProxySession.prototype.login = function (force, name, password, relogin, onSuccess, onException)
{
    if (!relogin) {
        this._eventsLoopStop = false;
    }
    this._name = name;
    this._password = password;
    this._relogin = (typeof relogin === "undefined" || relogin === false) ? false : true;
    //this._force = (typeof autoLogout=== "undefined" || autoLogout === false) ? false : true;
    this._force = force || false;
    if (this._loginIsOnTheWay)
    {
        return false;
    }
        
    this._loginIsOnTheWay = true;

    var sessionID = SESSION_STORAGE.getItem(SESSION_ID_COOKIE);

    if (!isValid(onSuccess) && !isValid(onException)) {
        var self = this;
        onSuccess = function (response) { self.onLoginSuccess(response); };
        onException = function () { self.onLoginException(); };
    }

    this._proxy.LoginForTimio(onSuccess, onException, this._name, this._password, "All", this._force, sessionID, 'Version2017');
    return true;
};
*/
CaesarProxySession.prototype.onLoginSuccess = function (response) {
    this._loginIsOnTheWay = false;

    this.lastLoginResponse = response;
    this.loginResponse = response.getReturnValue();
    if (isValid(this.loginResponse))
    {
        switch (this.loginResponse.getCode())
        {
            case ProxyError.ErrorOK.value:

                var me = response.getContact();
                //me.init();
                this.me = me;

                this._isLoggedIn = true;
                this._sessionID = response.getSessionId();
                SESSION_STORAGE.setItem(SESSION_ID_COOKIE, this._sessionID);

                this.fireEvent("onLogin", response, this._relogin);

                var self = this;
                setTimeout(function () { self.getFavourites(); }, 50);
                setTimeout(function () { self.getEvents(); }, 100);
                setTimeout(function () { self.getBuddyList(); }, 200);
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

CaesarProxySession.prototype.getMe = function () {
    return this.me;
};

CaesarProxySession.prototype.getCtiLoginData = function ()
{
    return this.ctiLoginData;
};

CaesarProxySession.prototype.getMyExtension = function ()
{
    if (this.isSIPMode())
    {
        return this.sipAddress || "";
    }
    else
    {
        if (!isValid(this.ctiLoginData))
        {
            return "";
        }
        return this.ctiLoginData.getExtension();
    }
};


CaesarProxySession.prototype.getMyCallNumber = function ()
{
    if (!isValid(this.ctiLoginData))
    {
        return "";
    }
    return this.ctiLoginData.getCallNumber();
};

CaesarProxySession.prototype.getCtiMode = function ()
{
    if (!isValid(this.ctiLoginData))
    {
        return null;
    }
    return this.ctiLoginData.getCtiMode();
};

CaesarProxySession.prototype.isSIPMode = function ()
{
    return this.getCtiMode() === "Sip";
};


CaesarProxySession.prototype.relogin = function ()
{
    console.log("relogin started");
    return this.login(true, this._name, this._password, true);
};

CaesarProxySession.prototype.onLoginException = function (response)
{
    console.log("onLoginException");
    SESSION_STORAGE.removeItem(SESSION_ID_COOKIE);
    this._loginIsOnTheWay = false;

    this.fireEvent("onLoginFailed", response, this._relogin);
    if (this._relogin)
    {
        var errorCodes = [ProxyError.ErrorAmbigousUser.value, ProxyError.ErrorUserNotFound.value, ProxyError.ErrorAuthenticationFailed.value, ProxyError.ErrorAccountLocked.value];
        
        if (isValid(response) && Ext.Array.contains(errorCodes, response.getReturnValue().getCode()))
        {
            return;
        }
        this.reconnect(15);
    }
};

CaesarProxySession.prototype.getEvents = function ()
{
    //var workerStarted = this.startWorker();
    //if (!workerStarted)
    {
        var self = this;
        Caesar.Access.startEventProcessing(this._sessionID, function (response)
        {
            var clonedResponse = Ext.clone(response);
            self.assignClassesToResponse(clonedResponse, ProxyTypeDefinitions.GetEventsResponse);
            self.onGetEventsSuccess(clonedResponse);

        }, function (error)
        {
            if (error.status == 200)
            {
                var clonedError = Ext.clone(error);
                self.assignClassesToResponse(clonedError, ProxyTypeDefinitions.GetEventsResponse);
                self.onGetEventsSuccess(clonedError);
            }
            else
            {
                self.onGetEventsException();
            }
        });
    }
};

function abortGetEvents()
{
    if (this.worker)
    {
        this.stopWorker();
    }
    else
    {
        Caesar.Access.stopEventProcessing();
    }
    
}

CaesarProxySession.prototype.onGetEventsSuccess = function (response)
{
    var error = response.getReturnValue().getCode();
    if (error === ProxyError.ErrorOK.value || error === ProxyError.ErrorTimeout.value/* || error === ProxyError.ErrorCancelEvents.value*/) {
        this._lastGetEventsDate = new Date();
        this._isLoggedIn = true;

        if (error === ProxyError.ErrorOK.value) 
        {
            if (response.getCtiLoginData())
            {
                this.ctiLoginData = response.getCtiLoginData();
            }
            if (response.getSipAddress())
            {
                this.sipAddress = response.getSipAddress();
            }
            if (response.getContactCenterLoginData())
            {
                this.contactCenterLoginData = response.getContactCenterLoginData();
            }
            if (response.getCtiWebServiceAvailability())
            {
                this.ctiWebServiceAvailability = response.getCtiWebServiceAvailability();
            }

            this.fireEvent("onNewEvents", response, this._relogin);

            var logoutMessageArrived = false;
            Ext.each(response.getProxyMessages(), function (message)
            {
                if (message.getReason() === "Logout")
                {
                    logoutMessageArrived = true;
                }
            });

            if (logoutMessageArrived)
            {
                console.log("getEvents: ProxyMessage.Logout arrived!", response);
                this.reset();

                this.fireEvent('onLogoutSuccess', response);
                return;
            }
        }
    }
    else if (error === ProxyError.ErrorSessionNotFound.value) {
        this.relogin();
    }
    else if (error === ProxyError.ErrorShutdown.value || error === ProxyError.ErrorCaesarDirectory.value) {
        this.onConnectionLost();
    }
    else {
        console.log("getEvents error: " + error + ", description: " + response.getReturnValue().getDescription());
    }
};

CaesarProxySession.prototype.onGetEventsException = function (response)
{
    if (this.currentGetEventsRequest && this.currentGetEventsRequest.aborted)
    {
        this.currentGetEventsRequest = null;
        return;
    }
    //console.log("getEvents: Exception occurred");
    this.onConnectionLost(response);
};

CaesarProxySession.prototype.onConnectionLost = function (response, delayInSecondsForReconnect)
{
    //console.log("onConnectionLost");
    this.fireEvent("onConnectionLost");
    this.reconnect(delayInSecondsForReconnect || 15);
    this._isLoggedIn = false;
};

CaesarProxySession.prototype.reconnect = function (delayInSeconds) {
    console.log(" trying relogin in " + delayInSeconds + " sec...");
    var self = this;
    setTimeout(function ()
    {
        self.relogin();
    }, delayInSeconds * 1000);
};

CaesarProxySession.prototype.reloginAfterServerExhaustedFault = function (delayInMilliSeconds)
{
    var self = this;
    setTimeout(function ()
    {
        Caesar.Access.stopEventProcessing();

        self.login(true, self._name, atob(self._password), false, null, null, self._loginOptions);
    }, delayInMilliSeconds);
}

CaesarProxySession.prototype.logout = function(force, synchron) {
    if (!isValidString(this._sessionID)) {
        return;
    }

    var self = this;
    this.logoutInProgress = true;

    if (synchron)
    {
        navigator.sendBeacon('/proxy/ForceLogout', "{sessionId:'" + this._sessionID + "'}");
    }
    else
    {
        var promise = Caesar.Access.logout(this._sessionID, force);
        this.executePromise(promise, function (response)
        {
            self.assignClassesToResponse(response, ProxyTypeDefinitions.LogoutResponse);
            self.onLogoutSuccess(response);
        }, function (response) { self.onLogoutException(); });
    }
    
    this.logoutInProgress = false;
};

CaesarProxySession.prototype.onLogoutSuccess = function (response) {

    if (response.getReturnValue().getCode() === ProxyError.ErrorOK.value)
    {
        this.reset();
    }
    this.fireEvent('onLogoutSuccess', response);
};

CaesarProxySession.prototype.onLogoutException = function () {
    this.fireEvent('onLogoutException');
};

CaesarProxySession.prototype.reset = function () {
    this._sessionID = "";
    this._eventsLoopStop = true;

    SESSION_STORAGE.removeItem(SESSION_ID_COOKIE);
};

CaesarProxySession.prototype.isLoggedOut = function () {
    if (this._sessionID === "" && this._eventsLoopStop === true)
    {
        return true;
    }
    return false;
};

CaesarProxySession.prototype.isCtiWebServiceAvailable = function ()
{
    return this.ctiWebServiceAvailability === Caesar.CtiWebServiceAvailability[Caesar.CtiWebServiceAvailability.Available];
};

CaesarProxySession.prototype.addBuddy = function (contact)
{
    this.deleteInvalidFieldsInRequest(contact);

    var self = this;
    var promise = Caesar.Access.addBuddy(this._sessionID, contact);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.AddBuddyResponse);
        self.onAddBuddySuccess(response);
    }, function () { self.onAddBuddyException(); });
};

CaesarProxySession.prototype.onAddBuddySuccess = function (response) {
    if (!isValid(response)) {
        return;
    }
    this.fireEvent('onAddBuddySuccess', response);
};

CaesarProxySession.prototype.onAddBuddyException = function ()
{
    this.fireEvent('onAddBuddyException');
};

CaesarProxySession.prototype.editBuddy = function (contact)
{
    var clonedContact = cloneCaesarProxyObject(contact);

    this.replaceEnumStringsWithNumericValue(clonedContact, ProxyTypeDefinitions.EditBuddy.contact);
    this.deleteInvalidFieldsInRequest(clonedContact);

    var self = this;
    var promise = Caesar.Access.editBuddy(this._sessionID, clonedContact);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.EditBuddyResponse);
        self.onEditBuddySuccess(response, contact.GUID);
    }, function () { self.onEditBuddyException(); });
};

CaesarProxySession.prototype.onEditBuddySuccess = function (response, formerGUID) {
    //closeWaitWindow();

    if (!isValid(response)) {
        return;
    }
    this.fireEvent('onEditBuddySuccess', response, formerGUID);
};

CaesarProxySession.prototype.onEditBuddyException = function () {
    this.fireEvent('onEditBuddyException');
};

CaesarProxySession.prototype.getBuddyList = function ()
{
    var self = this;
    var promise = Caesar.Access.getBuddyList(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetBuddyListResponse);
        self.onGetBuddyListSuccess(response);
    }, function ()
        {
            self.onGetBuddyListException();
        });
};

CaesarProxySession.prototype.onGetBuddyListSuccess = function (response) {
    this.lastGetBuddyListResponse = response;
    this.fireEvent('onGetBuddyListSuccess', response);
};

CaesarProxySession.prototype.onGetBuddyListException = function () {
    this.fireEvent('onGetBuddyListException');
};

CaesarProxySession.prototype.removeBuddy = function (contact)
{
    var self = this;
    var promise = Caesar.Access.removeBuddy(this._sessionID, [contact.getGUID()]);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.RemoveBuddyResponse);
        self.onRemoveBuddySuccess(response, contact);
    }, function () { self.onRemoveBuddyException(); });
}

CaesarProxySession.prototype.onRemoveBuddySuccess = function (response, contact) {
    if (!isValid(response)) {
        return;
    }
    this.fireEvent("onRemoveBuddySuccess", response, contact);
};

CaesarProxySession.prototype.onRemoveBuddyException = function () {
    this.fireEvent("onRemoveBuddyException");
};

CaesarProxySession.prototype.saveConfiguration = function (configuration, onSuccess, onException)
{
    var clonedConfiguration = cloneCaesarProxyObject(configuration);
    this.replaceEnumStringsWithNumericValue(clonedConfiguration, ProxyTypeDefinitions.SaveConfiguration.Configuration);

    var self = this;
    var promise = Caesar.Access.saveConfiguration(this._sessionID, clonedConfiguration);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SaveConfigurationResponse);
        onSuccess(response, configuration);
    }, function () { onException(); });
};


CaesarProxySession.prototype.setPresenceState = function (presenceState, force, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.setPresenceState(this._sessionID, presenceState, force);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SetPresenceStateResponse);
        if (successCallback)
        {
            successCallback(response, presenceState, "", force);
        }
        self.onSetPresenceStateSuccess(response, presenceState, "", force);
    }, function ()
    {
        if (exceptionCallback)
        {
            exceptionCallback();
        }
        self.onSetPresenceStateException();
    });
};

CaesarProxySession.prototype.onSetPresenceStateSuccess = function (response, state, text, force) {
    this.fireEvent('onSetPresenceStateSuccess', response, state, text, force);
};

CaesarProxySession.prototype.onSetPresenceStateException = function () {
    this.fireEvent('onSetPresenceStateException');
};

CaesarProxySession.prototype.resolveContactByGUID = function (GUID, onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.resolveContactByGUID(this._sessionID, GUID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetContactByGuidResponse);
        onSuccess(response, GUID);
    }, function () { onException(); });
};

CaesarProxySession.prototype.resolveContactByObject = function (ObjectName, ObjectSource, onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.resolveContactByObject(this._sessionID, ObjectName, ObjectSource);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetContactByObjectResponse);
        onSuccess(response, GUID);
    }, function () { onException(); });
};

CaesarProxySession.prototype.getChatHistory = function ()
{
    var self = this;
    var promise = Caesar.Access.getChatHistory(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetChatHistoryResponse);
        self.onGetChatHistorySuccess(response);
    }, function () { self.onGetChatHistoryException(); });
};

CaesarProxySession.prototype.onGetChatHistorySuccess = function (response) {
    this.fireEvent('onGetChatHistorySuccess', response);
};

CaesarProxySession.prototype.onGetChatHistoryException = function () {
    this.fireEvent('onGetChatHistoryException');
};

CaesarProxySession.prototype.sendChatMessage = function (contact, message, files, record)
{
    var attachments = [];
    Ext.each(files, function (file)
    {
        attachments.push(
            {
                displayName: file.name,
                mimeType: file.type
            });
    });

    var self = this;
    var promise = Caesar.Access.sendChatMessage(this._sessionID, contact.getGUID(), message, "", isValid(files) ? attachments : undefined);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SendChatMessageResponse);
        self.onSendChatMessageSuccess(response, contact, record, files);
    }, function () { self.onSendChatMessageException(record); });
};

CaesarProxySession.prototype.onSendChatMessageSuccess = function (response, contact, record, files) 
{
    this.fireEvent('onSendChatMessageSuccess', response, contact, record, files);
};

CaesarProxySession.prototype.onSendChatMessageException = function (record) {
    this.fireEvent('onSendChatMessageException', record);
};

CaesarProxySession.prototype.deleteChatHistory = function (GUID, item)
{
    var self = this;
    var promise = Caesar.Access.deleteChatHistory(this._sessionID, GUID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.DeleteChatHistoryResponse);
        self.onDeleteChatHistorySuccess(response, GUID, item);
    }, function () { self.onDeleteChatHistoryException(GUID); });
};


CaesarProxySession.prototype.onDeleteChatHistorySuccess = function (response, GUID, item) 
{
    this.fireEvent('onDeleteChatHistorySuccess', response, GUID, item);
};

CaesarProxySession.prototype.onDeleteChatHistoryException = function (GUID, item) 
{
    this.fireEvent('onDeleteChatHistoryException', GUID, item);
};

CaesarProxySession.prototype.setAgentState = function (state, text, force)
{
    var self = this;
    var promise = Caesar.Access.setAgentState(this._sessionID, Caesar.AgentState[state.value], text, force);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SetAgentStateResponse);
        self.onSetAgentStateSuccess(response, state, text);
    }, function () { self.onSetAgentStateException(); });
};

CaesarProxySession.prototype.onSetAgentStateSuccess = function (response, state, text) 
{
    this.fireEvent('onSetAgentStateSuccess', response, state, text);
};

CaesarProxySession.prototype.onSetAgentStateException = function () 
{
    this.fireEvent('onSetAgentStateException');
};

CaesarProxySession.prototype.setAgentDevice = function (device, onSuccess, onFail) {
    var self = this;
    this._device = device;

    var promise = Caesar.Access.contactCenter_SetAgentDevice(this._sessionID, device);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_SetAgentDeviceResponse);
        onSuccess(response);
    }, function () {
        onFail(response);
    });
};

CaesarProxySession.prototype.setAgentStateWithDevice = function (device) {
    var self = this;
    this._device = device;
    var action = new SetAgentStateWithDeviceProxyAction(function (response) { self.onSetAgentStateWithDeviceSuccess(response, this._state, this._text, device); }, function () { self.onSetAgentStateException(); }, this._state, this._text, this._force, device);
    action.run();
};

CaesarProxySession.prototype.onSetAgentStateWithDeviceSuccess = function (response, state, text, device) {
    this.onSetAgentStateSuccess(response, state, text);
};

CaesarProxySession.prototype.setGroupLoginState = function (groupID, force, calls, mails, chats, onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.setGroupLoginState(this._sessionID, groupID, force, calls, mails, chats);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SetGroupLoginStateResponse);
        onSuccess(response);
    }, function () { onException(); });
};

CaesarProxySession.prototype.setDynamicGroupState = function (groupID, state, onSuccess, onException) {
    var action = new SetDynamicGroupStateProxyAction(onSuccess, onException, groupID, state);
    action.run();
};

CaesarProxySession.prototype.setDynamicAnnouncement = function (announcementID, voiceMenuID, text, validUntil, onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.setDynamicAnnouncement(this._sessionID, announcementID, voiceMenuID, text, validUntil);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SetDynamicAnnouncementResponse);
        onSuccess(response);
    }, function () { onException(); });
};

CaesarProxySession.prototype.setDynamicRedirection = function (redirectionID, number, validUntil, onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.setDynamicRedirection(this._sessionID, redirectionID, number, validUntil);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SetDynamicRedirectionResponse);
        onSuccess(response);
    }, function () { onException(); });
};

CaesarProxySession.prototype.callViaCaesar = function (contact, number, onSuccess, onException) {
    var action = new CallViaCaesarProxyAction(onSuccess, onException, contact, number);
    action.run();
};

CaesarProxySession.prototype.activateFollowMeProfile = function (profile, force) {
    var self = this;
    var action = new ActivateFollowMeProfileProxyAction(function (response) { self.onActivateFollowMeProfileSuccess(response, profile, force); }, function () { self.onActivateFollowMeProfileException(); }, profile, force);
    action.run();
};

CaesarProxySession.prototype.onActivateFollowMeProfileSuccess = function (response, profile, force) {
    this.fireEvent('onActivateFollowMeProfileSuccess', response, profile, force);
};

CaesarProxySession.prototype.onActivateFollowMeProfileException = function () {
    this.fireEvent('onActivateFollowMeProfileException');
};

CaesarProxySession.prototype.deactivateFollowMeProfile = function () {
    var self = this;
    var action = new DeactivateFollowMeProfileProxyAction(function (response) { self.onDeactivateFollowMeProfileSuccess(response); }, function () { self.onDeactivateFollowMeProfileException(); });
    action.run();
};

CaesarProxySession.prototype.onDeactivateFollowMeProfileSuccess = function (response) {
    //closeWaitWindow();
    this.fireEvent('onDeactivateFollowMeProfileSuccess', response);
};

CaesarProxySession.prototype.onDeactivateFollowMeProfileException = function () {
    this.fireEvent('onDeactivateFollowMeProfileException');
};

CaesarProxySession.prototype.sendInitialPassword = function (loginName, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.sendInitialPassword(loginName, this.getApplication());
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SendInitialPasswordResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

//Override this!
CaesarProxySession.prototype.getApplication = function ()
{
    return 0;
};

CaesarProxySession.prototype.changePassword = function (oldPassword, newPassword, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.changePassword(this._sessionID, oldPassword, newPassword);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ChangePasswordResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.importPartnerList = function (successCallback, exceptionCallback) {
    var action = new ImportPartnerListProxyAction(successCallback, exceptionCallback);
    action.run();
};

CaesarProxySession.prototype.resetBuddyList = function (successCallback, exceptionCallback) {
    var action = new ResetBuddyListProxyAction(successCallback, exceptionCallback);
    action.run();
};

CaesarProxySession.prototype.cloneListeners = function (listeners)
{
    var clonedListeners = [];
    Ext.each(listeners, function (listener)
    {
        clonedListeners.push(listener);
    });
    return clonedListeners;
};

CaesarProxySession.prototype.fireEvent = function (callbackName)
{
    var args = Ext.Array.toArray(arguments, 1);
    
    var copyVIPListeners = this.cloneListeners(this._vipListeners);
    
    for (var i = 0, size = copyVIPListeners.length; i < size; ++i) {
        var listener = copyVIPListeners[i];
        
        if (isValid(listener, callbackName) && !listener.destroyed) {
            try {
                var start2 = new Date().getTime();
                listener[callbackName].apply(listener, args); //apply brauchen wir, damit der das args-array nicht als array an den callback übergibt, sondern als parameter
                var end2 = new Date().getTime() - start2;
                if (end2 > 100) {
                    //console.log("fireEvent for " + callbackName + " took " + end2 + " ms, listener: " + getClassName(listener), listener);
                }

            }
            catch (exception) {
                console.error(exception);
            }
        }
    }

    var copyListeners = this.cloneListeners(this._listeners);
    setTimeout(function ()
    {
        Ext.each(copyListeners, function (listener) 
        {
            if (isValid(listener, callbackName) && !listener.destroyed) {
                try
                {
                    var start2 = new Date().getTime();
                    listener[callbackName].apply(listener, args); //apply brauchen wir, damit der das args-array nicht als array an den callback übergibt, sondern als parameter
                    var end2 = new Date().getTime() - start2;
                    if (end2 > 50)
                    {
                        //console.log("fireEvent for " + callbackName + " took " + end2 + " ms, listener: " + getClassName(listener), listener);
                    }
                }
                catch (exception) {
                    console.error(exception);
                }
            }
     
        });
    }, 0);

};


CaesarProxySession.prototype.isLastGetChatHistorySuccessfull = function () {
    return isValid(this.lastGetChatHistoryResponse) && this.lastGetChatHistoryResponse.getReturnValue().getCode() === 0;
};

CaesarProxySession.prototype.isLastGetBuddyListSuccessfull = function () {
    return isValid(this.lastGetBuddyListResponse) && this.lastGetBuddyListResponse.getReturnValue().getCode() === 0;
};

CaesarProxySession.prototype.makeCall = function (destination, successCallback, exceptionCallback, contact)
{
    var self = this;
    var promise = Caesar.Access.cti_MakeCall(this._sessionID, destination);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_MakeCallResponse);
        successCallback(response, destination, contact);
    }, function ()
    {
        exceptionCallback(destination, contact);
    });
};

CaesarProxySession.prototype.makeCallForGroup = function (destination, phoneContact, groupId, force, successCallback, exceptionCallback, originalContact)
{
    var clonedContact;
    if (isValid(phoneContact))
    {
        clonedContact = cloneCaesarProxyObject(phoneContact);
        this.replaceEnumStringsWithNumericValue(clonedContact, ProxyTypeDefinitions.ContactCenter_MakeCall.Contact);
    }
    var self = this;
    var promise = Caesar.Access.contactCenter_MakeCall(this._sessionID, groupId, destination, clonedContact, force);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_MakeCallResponse);
        successCallback(response, destination, originalContact);
    }, function ()
    {
        exceptionCallback(destination, originalContact);
    });
};

CaesarProxySession.prototype.hangUp = function (callId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_HangUp(this._sessionID, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_HangUpResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.answer = function (callId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_Answer(this._sessionID, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_AnswerResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.blindTransfer = function (callId, destination, successCallback, exceptionCallback, contact)
{
    var self = this;
    var promise = Caesar.Access.cti_BlindTransfer(this._sessionID, destination, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_BlindTransferResponse);
        successCallback(response, callId, destination, contact);
        self.onBlindTransferSuccess(response, callId, destination, contact);
    }, function ()
        {
            exceptionCallback(callId, destination, contact);
            self.onBlindTransferException(callId, destination, contact);
        });
};

CaesarProxySession.prototype.onBlindTransferSuccess = function (response, callId, destination, contact)
{
    this.fireEvent('onBlindTransferSuccess', response, callId, destination, contact);
};

CaesarProxySession.prototype.onBlindTransferException = function (callId, destination, contact)
{
    this.fireEvent('onBlindTransferException', callId, destination, contact);
};


CaesarProxySession.prototype.setupTransfer = function (destination, successCallback, exceptionCallback) {
    var action = new SetupTransferProxyAction(destination, successCallback, exceptionCallback);
    action.run();
};

CaesarProxySession.prototype.transfer = function (destination, callId, successCallback, exceptionCallback) {
    var action = new TransferProxyAction(destination, 0, callId, successCallback, exceptionCallback);
    action.run();
};

CaesarProxySession.prototype.setCallDiversion = function (destination, contact, lineID)
{
    var self = this;
    var promise = Caesar.Access.cti_SetCallDiversion(this._sessionID, destination, lineID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_SetCallDiversionResponse);
        self.onSetCallDiversionSuccess(response, destination, contact);
    }, function () { self.onSetCallDiversionException(destination, contact); });
};

CaesarProxySession.prototype.onSetCallDiversionSuccess = function (response, destination, contact) {
    this.fireEvent('onSetCallDiversionSuccess', response, destination, contact);
};

CaesarProxySession.prototype.onSetCallDiversionException = function (destination, contact) {
    this.fireEvent('onSetCallDiversionException', destination, contact);
};

CaesarProxySession.prototype.removeCallDiversion = function (lineId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_RemoveCallDiversion(this._sessionID, lineId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_RemoveCallDiversionResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.getCallDiversion = function (lineId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_GetCallDiversion(this._sessionID, lineId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_GetCallDiversionResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.getLineCommands = function (lineID, successCallback, exceptionCallback) {
    var action = new GetLineCommandsProxyAction(lineID, successCallback, exceptionCallback);
    action.run();
};

CaesarProxySession.prototype.hold = function (callId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_Hold(this._sessionID, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_HoldResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.unhold = function (callId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_Unhold(this._sessionID, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_UnholdResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.swapHold = function (callId, connectedCallId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_SwapHold(this._sessionID, callId, connectedCallId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_SwapHoldResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.completeTransfer = function (successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_CompleteTransfer(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_CompleteTransferResponse);
        successCallback(response);
        self.fireEvent('onCompleteTransferSuccess', response);
    }, function ()
        {
            exceptionCallback();
            self.fireEvent('onCompleteTransferException');
        });
};

CaesarProxySession.prototype.completeConference = function (successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.cti_CompleteConference(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_CompleteConferenceResponse);
        successCallback(response);
    }, function () { exceptionCallback(); });
};

CaesarProxySession.prototype.setupConference = function (destination, successCallback, exceptionCallback) {
    var action = new SetupConferenceProxyAction(destination, successCallback, exceptionCallback);
    action.run();
};

CaesarProxySession.prototype.getAddressbooks = function ()
{
    var self = this;
    var promise = Caesar.Access.dataConnect_GetAddressbooks(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.DataConnect_GetAddressbooksResponse);
        self.onGetAddressbooksSuccess(response);
    }, function () { self.onGetAddressbooksException(); });
};

CaesarProxySession.prototype.onGetAddressbooksSuccess = function (response) {
    this.fireEvent('onGetAddressbooksSuccess', response);
};

CaesarProxySession.prototype.onGetAddressbooksException = function () {
    this.fireEvent('onGetAddressbooksException');
};

CaesarProxySession.prototype.getJournal = function ()
{
    var self = this;
    var promise = Caesar.Access.cti_GetJournal(this._sessionID, 0, -1);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_GetJournalResponse);
        self.onGetJournalSuccess(response);
    },
        function ()
        {
            self.onGetJournalException();
        });
};

CaesarProxySession.prototype.onGetJournalSuccess = function (response) {
    this.fireEvent('onGetJournalSuccess', response);
};

CaesarProxySession.prototype.onGetJournalException = function () {
    this.fireEvent('onGetJournalException');
};

CaesarProxySession.prototype.deleteJournalEntry = function (journalId)
{
    var self = this;
    var promise = Caesar.Access.cti_DeleteJournalEntry(this._sessionID, journalId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_DeleteJournalEntryResponse);
        self.onDeleteJournalEntrySuccess(response, journalId);
    }, function () { self.onDeleteJournalEntryException(); });
};

CaesarProxySession.prototype.onDeleteJournalEntrySuccess = function (response, journalIDs)
{
    this.fireEvent('onDeleteJournalEntrySuccess', response, journalIDs);
};

CaesarProxySession.prototype.onDeleteJournalEntryException = function ()
{
    this.fireEvent('onDeleteJournalEntryException');
};

CaesarProxySession.prototype.updateJournalEntry = function (journalEntry, initiatorPanel)
{
    var clonedJournalEntry = cloneCaesarProxyObject(journalEntry);
    this.replaceEnumStringsWithNumericValue(clonedJournalEntry, ProxyTypeDefinitions.CTI_UpdateJournalEntry.JournalEntry);

    var self = this;
    var promise = Caesar.Access.cti_UpdateJournalEntry(this._sessionID, clonedJournalEntry);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_UpdateJournalEntryResponse);
        self.onUpdateJournalEntrySuccess(response, journalEntry, initiatorPanel);
    }, function () { self.onUpdateJournalEntryException(journalEntry, initiatorPanel); });
};

CaesarProxySession.prototype.onUpdateJournalEntrySuccess = function (response, journalEntry, initiatorPanel) {
    this.fireEvent('onUpdateJournalEntrySuccess', response, journalEntry, initiatorPanel);
};

CaesarProxySession.prototype.onUpdateJournalEntryException = function (journalEntry, initiatorPanel) {
    this.fireEvent('onUpdateJournalEntryException', journalEntry, initiatorPanel);
};

CaesarProxySession.prototype.updateJournalEntries = function (journalEntries)
{
    var clonedEntries = [];
    Ext.each(journalEntries, function (journalEntry)
    {
        var clonedJournalEntry = cloneCaesarProxyObject(journalEntry);
        clonedEntries.push(clonedJournalEntry);
    })
    this.replaceEnumStringsWithNumericValue(clonedEntries, ProxyTypeDefinitions.CTI_UpdateJournalEntries.JournalEntries);

    var self = this;
    var promise = Caesar.Access.cti_UpdateJournalEntries(this._sessionID, clonedEntries);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_UpdateJournalEntriesResponse);
        self.onUpdateJournalEntriesSuccess(response, journalEntries);
    }, function () { self.onUpdateJournalEntriesException(journalEntries); });
};


CaesarProxySession.prototype.onUpdateJournalEntriesSuccess = function (response, journalEntries) {
    this.fireEvent('onUpdateJournalEntriesSuccess', response, journalEntries);
};

CaesarProxySession.prototype.onUpdateJournalEntriesException = function () {
    this.fireEvent('onUpdateJournalEntriesException');
};

CaesarProxySession.prototype.markJournalEntriesAsRead = function (journalIDs)
{
    var self = this;
    var promise = Caesar.Access.cti_MarkJournalEntriesAsRead(this._sessionID, journalIDs);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_MarkJournalEntriesAsReadResponse);
        self.onMarkJournalEntriesAsReadSuccess(response, journalIDs);
    }, function () { self.onMarkJournalEntriesAsReadException(journalIDs); });
};

CaesarProxySession.prototype.onMarkJournalEntriesAsReadSuccess = function (response, journalIDs) {
    this.fireEvent('onMarkJournalEntriesAsReadSuccess', response, journalIDs);
};

CaesarProxySession.prototype.onMarkJournalEntriesAsReadException = function () {
    this.fireEvent('onMarkJournalEntriesAsReadException');
};

CaesarProxySession.prototype.markAllJournalEntriesAsRead = function ()
{
    var self = this;
    var promise = Caesar.Access.cti_MarkAllJournalEntriesAsRead(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_MarkAllJournalEntriesAsReadResponse);
        self.onMarkAllJournalEntriesAsReadSuccess(response);
    }, function () { self.onMarkAllJournalEntriesAsReadException(); });
};

CaesarProxySession.prototype.onMarkAllJournalEntriesAsReadSuccess = function (response) {
    this.fireEvent('onMarkAllJournalEntriesAsReadSuccess', response);
};

CaesarProxySession.prototype.onMarkAllJournalEntriesAsReadException = function () {
    this.fireEvent('onMarkAllJournalEntriesAsReadException');
};

CaesarProxySession.prototype.getContactByObject = function (entryId, storageId, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.getContactByObject(this._sessionID, entryId, storageId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetContactByObjectResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.getContactByGuid = function (guid, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.getContactByGuid(this._sessionID, guid);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetContactByGuidResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.denyChat = function (chatId, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.webChat_Deny(this._sessionID, chatId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebChat_DenyResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.acceptChat = function (chatId, contact)
{
    var self = this;
    var promise = Caesar.Access.webChat_Accept(this._sessionID, chatId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebChat_AcceptResponse);
        self.onAcceptChatSuccess(response, chatId, contact);
    }, function () { self.onAcceptChatException(contact); });
};

CaesarProxySession.prototype.onAcceptChatSuccess = function (response, chatId, contact) {
    this.fireEvent('onAcceptChatSuccess', response, chatId, contact);
};

CaesarProxySession.prototype.onAcceptChatException = function () {
    this.fireEvent('onAcceptChatException');
};

CaesarProxySession.prototype.finishChat = function (chatId, contact)
{
    var self = this;
    var promise = Caesar.Access.webChat_Finish(this._sessionID, chatId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebChat_FinishResponse);
        self.onFinishChatSuccess(response, chatId, contact);
    }, function () { self.onFinishChatException(contact); });
};

CaesarProxySession.prototype.onFinishChatSuccess = function (response, chatId, contact) {
    this.fireEvent('onFinishChatSuccess', response, chatId, contact);
};

CaesarProxySession.prototype.onFinishChatException = function () {
    this.fireEvent('onFinishChatException');
};


CaesarProxySession.prototype.loadSettings = function (doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.loadSettings(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.LoadSettingsResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.saveSettings = function (settings, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.saveSettings(this._sessionID, settings);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SaveSettingsResponse);
        doneFct(response);
        self.onSaveSettingsSuccess(response);
    }, function ()
    {
        failFct();
        self.onSaveSettingsException(response);
    });
};

CaesarProxySession.prototype.onSaveSettingsSuccess = function (response)
{
    this.fireEvent('onSaveSettingsSuccess', response);
};

CaesarProxySession.prototype.onSaveSettingsException = function ()
{
    this.fireEvent('onSaveSettingsException');
};

CaesarProxySession.prototype.getGroups = function (doneFct, failFct)
{
    var groupsRange = new www_caseris_de_CaesarSchema_GroupsRange();

    groupsRange.setPosition(0);
    groupsRange.setCount(-1);

    var self = this;
    var promise = Caesar.Access.ctiPartnerList_GetGroups(this._sessionID, groupsRange);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_GetGroupsResponse);
        doneFct(response);
    }, function () { failFct(); });
};


CaesarProxySession.prototype.getPartners = function (groupId, doneFct, failFct)
{
    var partnerRange = new www_caseris_de_CaesarSchema_PartnersRange();

    partnerRange.setPosition(0);
    partnerRange.setCount(-1);
    partnerRange.setGroupId(groupId);

    var self = this;
    var promise = Caesar.Access.ctiPartnerList_GetPartners(this._sessionID, partnerRange);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_GetPartnersResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.updatePartner = function (partner, doneFct, failFct)
{
    var clonedPartner = cloneCaesarProxyObject(partner);
    this.replaceEnumStringsWithNumericValue(clonedPartner, ProxyTypeDefinitions.CTIPartnerList_SetPartner.Partner);

    var self = this;
    var promise = Caesar.Access.ctiPartnerList_SetPartner(this._sessionID, clonedPartner);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_SetPartnerResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.updateGroup = function (group, doneFct, failFct)
{
    var clonedGroup = cloneCaesarProxyObject(group);
    this.replaceEnumStringsWithNumericValue(clonedGroup, ProxyTypeDefinitions.CTIPartnerList_SetGroup.Group);

    var self = this;
    var promise = Caesar.Access.ctiPartnerList_SetGroup(this._sessionID, clonedGroup);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_SetGroupResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.removeItem = function (id, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.ctiPartnerList_RemoveItem(this._sessionID, id);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_RemoveItemResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.getTenantGroups = function (mandant, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.dataConnect_GetTenantGroups(this._sessionID, mandant);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.DataConnect_GetTenantGroupsResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.getTenantGroupMembers = function (groupId, mandant, doneFct, failFct)
{
    var self = this;
    var promise = Caesar.Access.dataConnect_GetGroupMembers(this._sessionID, groupId, mandant);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.DataConnect_GetGroupMembersResponse);
        doneFct(response);
    }, function () { failFct(); });
};

CaesarProxySession.prototype.addFavourite = function (contact, successCallback, exceptionCallback)
{
    var clonedContact = cloneCaesarProxyObject(contact);
    this.replaceEnumStringsWithNumericValue(clonedContact, ProxyTypeDefinitions.AddFavourite.Contact);
    this.deleteInvalidFieldsInRequest(clonedContact);

    var self = this;
    var promise = Caesar.Access.addFavourite(this._sessionID, clonedContact);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.AddFavouriteResponse);
        self.onAddFavouriteSuccess(response, contact);
        if (successCallback)
        {
            successCallback(response, contact);
        }
    }, function ()
    {
        self.onAddFavouriteException(contact);
        if (exceptionCallback)
        {
            exceptionCallback(contact);
        }
    });
};


CaesarProxySession.prototype.onAddFavouriteSuccess = function (response, contact) {
    this.fireEvent('onAddFavouriteSuccess', response, contact);
};

CaesarProxySession.prototype.onAddFavouriteException = function (contact) {
    this.fireEvent('onAddFavouriteException', contact);
};

CaesarProxySession.prototype.getFavourites = function ()
{
    var self = this;
    var promise = Caesar.Access.getFavourites(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetFavouritesResponse);
        self.onGetFavouritesSuccess(response);
    }, function () { self.onGetFavouritesException(); });
};

CaesarProxySession.prototype.onGetFavouritesSuccess = function (response)
{
    this.lastGetFavouritesResponse = response;
    this.fireEvent('onGetFavouritesSuccess', response);
};

CaesarProxySession.prototype.onGetFavouritesException = function () {
    this.fireEvent('onGetFavouritesException');
};

CaesarProxySession.prototype.removeFavourite = function (contact, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.removeFavourite(this._sessionID, [contact.getGUID()]);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.RemoveFavouriteResponse);
        self.onRemoveFavouriteSuccess(response, contact);
        if (successCallback)
        {
            successCallback(response, contact);
        }
    }, function ()
    {
        self.onRemoveFavouriteException(contact);
        if (exceptionCallback)
        {
            exceptionCallback(contact);
        }
    });
};

CaesarProxySession.prototype.onRemoveFavouriteSuccess = function (response, contact) {
    if (!isValid(response)) {
        return;
    }
    this.fireEvent("onRemoveFavouriteSuccess", response, contact);
};

CaesarProxySession.prototype.onRemoveFavouriteException = function (contact) {
    this.fireEvent("onRemoveFavouriteException", contact);
};

CaesarProxySession.prototype.getPresenceStateConfiguration = function (successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.cti_GetPresenceStateConfiguration(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_GetPresenceStateConfigurationResponse);
        self.onGetPresenceStateConfigurationSuccess(response, successFunction);
    }, function ()
        {
            self.onGetPresenceStateConfigurationException(errorFunction);
        });
};

CaesarProxySession.prototype.onGetPresenceStateConfigurationSuccess = function (response, successFunction)
{
    this.fireEvent('onGetPresenceStateConfigurationSuccess', response);
    if (isValid(successFunction))
    {
        successFunction(response);
    }
};

CaesarProxySession.prototype.onGetPresenceStateConfigurationException = function (errorFunction)
{
    this.fireEvent('onGetPresenceStateConfigurationException');
    if (isValid(errorFunction))
    {
        errorFunction();
    }
};

CaesarProxySession.prototype.setPresenceStateConfiguration = function (present, absent, pause, dontDisturb, offline, disableChat, successFunction, errorFunction)
{
    var self = this;

    var clonedPresent = cloneCaesarProxyObject(present);
    this.replaceEnumStringsWithNumericValue(clonedPresent, ProxyTypeDefinitions.CTI_SetPresenceStateConfiguration.Present);

    var clonedAbsent = cloneCaesarProxyObject(absent);
    this.replaceEnumStringsWithNumericValue(clonedAbsent, ProxyTypeDefinitions.CTI_SetPresenceStateConfiguration.Absent);

    var clonedPause = cloneCaesarProxyObject(pause);
    this.replaceEnumStringsWithNumericValue(clonedPause, ProxyTypeDefinitions.CTI_SetPresenceStateConfiguration.Pause);

    var clonedDontDisturb = cloneCaesarProxyObject(dontDisturb);
    this.replaceEnumStringsWithNumericValue(clonedDontDisturb, ProxyTypeDefinitions.CTI_SetPresenceStateConfiguration.DontDisturb);

    var clonedOffline = cloneCaesarProxyObject(offline);
    this.replaceEnumStringsWithNumericValue(clonedOffline, ProxyTypeDefinitions.CTI_SetPresenceStateConfiguration.Offline);

    var promise = Caesar.Access.cti_SetPresenceStateConfiguration(this._sessionID, clonedPresent, clonedAbsent, clonedPause, clonedDontDisturb, clonedOffline, disableChat);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_SetPresenceStateConfigurationResponse);
        self.onSetPresenceStateConfigurationSuccess(response, successFunction, present, absent, pause, dontDisturb, offline, disableChat);
    }, function ()
        {
            self.onSetPresenceStateConfigurationException(errorFunction);
        });
};


CaesarProxySession.prototype.onSetPresenceStateConfigurationSuccess = function (response, successFunction, present, absent, pause, dontDisturb, offline, disableChat)
{
    this.fireEvent('onSetPresenceStateConfigurationSuccess', response, present, absent, pause, dontDisturb, offline, disableChat);
    if (isValid(successFunction))
    {
        successFunction(response);
    }
};

CaesarProxySession.prototype.onSetPresenceStateConfigurationException = function (errorFunction)
{
    this.fireEvent('onSetPresenceStateConfigurationException');
    if (isValid(errorFunction))
    {
        errorFunction();
    }
};

CaesarProxySession.prototype.pickupCall = function (fromDevice, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.cti_Pickup(this._sessionID, fromDevice);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_PickupResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.resolvePartners = function (partners, successFunction, errorFunction)
{
    var clonedPartners = [];
    Ext.each(partners, function (partner)
    {
        clonedPartners.push(cloneCaesarProxyObject(partner));
    });
    this.replaceEnumStringsWithNumericValue(clonedPartners, ProxyTypeDefinitions.CTIPartnerList_ResolvePartners.Partners);
    this.deleteInvalidFieldsInRequest(clonedPartners);

    var self = this;
    var promise = Caesar.Access.ctiPartnerList_ResolvePartners(this._sessionID, clonedPartners);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_ResolvePartnersResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.getAccessRights = function (successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.ctiPartnerList_GetAccessRights(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_GetAccessRightsResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.setAccessRights = function (rights, successFunction, errorFunction)
{
    var clonedRights = [];
    Ext.each(rights, function (right)
    {
        clonedRights.push(cloneCaesarProxyObject(right));
    });
    this.replaceEnumStringsWithNumericValue(clonedRights, ProxyTypeDefinitions.CTIPartnerList_SetAccessRights.PartnerAccessRights);

    var self = this;
    var promise = Caesar.Access.ctiPartnerList_SetAccessRights(this._sessionID, clonedRights);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_SetAccessRightsResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};


CaesarProxySession.prototype.getTeamChatRooms = function (alreadyChosenTeamChatRoomGuids)
{
    var self = this;
    var promise = Caesar.Access.teamChat_GetChatRooms(this._sessionID, alreadyChosenTeamChatRoomGuids);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_GetChatRoomsResponse);
        self.onGetTeamChatRoomsSuccess(response, alreadyChosenTeamChatRoomGuids);
    }, function () { self.onGetTeamChatRoomsException(alreadyChosenTeamChatRoomGuids); });
};


CaesarProxySession.prototype.onGetTeamChatRoomsSuccess = function (response, alreadyChosenTeamChatRoomGuids) {
    this.fireEvent("onGetTeamChatRoomsSuccess", response, alreadyChosenTeamChatRoomGuids);
};

CaesarProxySession.prototype.onGetTeamChatRoomsException = function (alreadyChosenTeamChatRoomGuids) {
    this.fireEvent("onGetTeamChatRoomsException", alreadyChosenTeamChatRoomGuids);
};


CaesarProxySession.prototype.getBlackBoards = function (alreadyChosenBlackBoardGuids)
{
    var self = this;
    var promise = Caesar.Access.teamChat_GetBlackboards(this._sessionID, alreadyChosenBlackBoardGuids);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_GetBlackboardsResponse);
        self.onGetBlackBoardsSuccess(response);
    }, function () { self.onGetBlackBoardsException(); });
};

CaesarProxySession.prototype.onGetBlackBoardsSuccess = function (response) {
    this.fireEvent("onGetBlackBoardsSuccess", response);
};

CaesarProxySession.prototype.onGetBlackBoardsException = function () {
    this.fireEvent("onGetBlackBoardsException");
};

CaesarProxySession.prototype.subscribeTeamChatRoom = function (id)
{
    var self = this;
    var promise = Caesar.Access.teamChat_SubscribeChatRoom(this._sessionID, Caesar.ChatReceiverType.TeamRoom, id);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_SubscribeChatRoomResponse);
        self.onSubscribeTeamChatRoomSuccess(response, id);
    }, function () { self.onSubscribeTeamChatRoomException(id); });
};


CaesarProxySession.prototype.onSubscribeTeamChatRoomSuccess = function (response, id) {
    this.fireEvent("onSubscribeTeamChatRoomSuccess", response, id);
};

CaesarProxySession.prototype.onSubscribeTeamChatRoomException = function (id) {
    this.fireEvent("onSubscribeTeamChatRoomException", id);
};

CaesarProxySession.prototype.unsubscribeTeamChatRoom = function (id)
{
    var self = this;
    var promise = Caesar.Access.teamChat_UnsubscribeChatRoom(this._sessionID, Caesar.ChatReceiverType.TeamRoom, id);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_UnsubscribeChatRoomResponse);
        self.onUnsubscribeTeamChatRoomSuccess(response, id);
    }, function () { self.onUnsubscribeTeamChatRoomException(id); });
};


CaesarProxySession.prototype.onUnsubscribeTeamChatRoomSuccess = function (response, id) {
    this.fireEvent("onUnsubscribeTeamChatRoomSuccess", response, id);
};

CaesarProxySession.prototype.onUnsubscribeTeamChatRoomException = function (id) {
    this.fireEvent("onUnsubscribeTeamChatRoomException", id);
};


CaesarProxySession.prototype.enterTeamChatRoom = function (id)
{
    var self = this;
    var promise = Caesar.Access.teamChat_EnterChatRoom(this._sessionID, Caesar.ChatReceiverType.TeamRoom, id);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_EnterChatRoomResponse);
        self.onEnterTeamChatRoomSuccess(response, id);
    }, function () { self.onEnterTeamChatRoomException(id); });
};

CaesarProxySession.prototype.onEnterTeamChatRoomSuccess = function (response, id) {
    this.fireEvent("onEnterTeamChatRoomSuccess", response, id);
};

CaesarProxySession.prototype.onEnterTeamChatRoomException = function (id) {
    this.fireEvent("onEnterTeamChatRoomException", id);
};

CaesarProxySession.prototype.sendTeamChatMessage = function (guid, format, message, files, validFrom, validTo, record)
{
    var self = this;
    var chatReceiver = this.convert2ChatReceiver(guid);

    var attachments = [];
    Ext.each(files, function (file)
    {
        attachments.push(
            {
                displayName: file.name,
                mimeType: file.type
            });
    });

    var promise = Caesar.Access.teamChat_SendMessage(this._sessionID, chatReceiver, Caesar.ChatMessageFormat.Text, message, validFrom, validTo, attachments);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_SendMessageResponse);
        self.onSendTeamChatMessageSuccess(response, record, chatReceiver, files);
    }, function () { self.onSendTeamChatMessageException(record, chatReceiver); });
};

CaesarProxySession.prototype.onSendTeamChatMessageSuccess = function (response, record, chatReceiver, files) {
    if (!isValid(response))
    {
        return;
    }

    this.fireEvent("onSendTeamChatMessageSuccess", response, record, chatReceiver, files);
};

CaesarProxySession.prototype.onSendTeamChatMessageException = function (record, chatReceiver) {
    this.fireEvent("onSendTeamChatMessageException", record, chatReceiver);
};

CaesarProxySession.prototype.leaveTeamChatRoom = function (id)
{
    var self = this;
    var promise = Caesar.Access.teamChat_LeaveChatRoom(this._sessionID, Caesar.ChatReceiverType.TeamRoom, id);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_LeaveChatRoomResponse);
        self.onLeaveTeamChatRoomSuccess(response, id);
    }, function () { self.onLeaveTeamChatRoomException(id); });
};

CaesarProxySession.prototype.onLeaveTeamChatRoomSuccess = function (response, id)
{
    this.fireEvent("onLeaveTeamChatRoomSuccess", response, id);
};

CaesarProxySession.prototype.onLeaveTeamChatRoomException = function ()
{
    this.fireEvent("onLeaveTeamChatRoomException");
};

CaesarProxySession.prototype.convert2ChatReceiver = function (guid)
{
    var chatReceiver = new www_caseris_de_CaesarSchema_ChatReceiver();
    chatReceiver.setGuid(guid);
    chatReceiver.setType(Caesar.ChatReceiverType.TeamRoom);
    return chatReceiver;
};

CaesarProxySession.prototype.getTeamChatRoomHistory = function (guid, lastKnownMessageId, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.teamChat_GetHistory(this._sessionID, this.convert2ChatReceiver(guid), lastKnownMessageId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_GetHistoryResponse);
        self.onGetTeamChatRoomHistorySuccess(response, guid, lastKnownMessageId);
    }, function () { self.onGetTeamChatRoomHistoryException(guid, lastKnownMessageId); });
};

CaesarProxySession.prototype.onGetTeamChatRoomHistorySuccess = function (response, guid, lastKnownMessageId)
{
    this.fireEvent("onGetTeamChatRoomHistorySuccess", response, guid, lastKnownMessageId);
};

CaesarProxySession.prototype.onGetTeamChatRoomHistoryException = function (guid, lastKnownMessageId)
{
    this.fireEvent("onGetTeamChatRoomHistoryException", guid, lastKnownMessageId);
};

CaesarProxySession.prototype.getTeamChatRoomSubscribers = function (guid, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.teamChat_GetEnteredUsers(this._sessionID, this.convert2ChatReceiver(guid));
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_GetEnteredUsersResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.finishSession = function (sessionId, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.contactCenter_FinishSession(this._sessionID, sessionId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_FinishSessionResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.setGroupLoginStates = function (states, force, successFunction, errorFunction)
{
    var clonedStates = [];
    Ext.each(states, function (state)
    {
        clonedStates.push(cloneCaesarProxyObject(state));
    });
    this.replaceEnumStringsWithNumericValue(clonedStates, ProxyTypeDefinitions.ContactCenter_SetGroupLoginStates.States);

    var self = this;
    var promise = Caesar.Access.contactCenter_SetGroupLoginStates(this._sessionID, clonedStates, force);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_SetGroupLoginStatesResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.getGroupLoginStates = function (successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.contactCenter_GetGroupLoginStates(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_GetGroupLoginStatesResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.getChatRoomDetails = function (guid)
{
    var self = this;
    var promise = Caesar.Access.teamChat_GetChatRoomDetails(this._sessionID, guid);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_GetChatRoomDetailsResponse);
        self.onGetChatRoomDetailsSuccess(response, guid);
    }, function () { self.onGetChatRoomDetailsException(guid); });
};

CaesarProxySession.prototype.onGetChatRoomDetailsSuccess = function (response, guid) {
    this.fireEvent("onGetChatRoomDetailsSuccess", response, guid);
};

CaesarProxySession.prototype.onGetChatRoomDetailsException = function (guid) {
    this.fireEvent("onGetChatRoomDetailsException", guid);
};

CaesarProxySession.prototype.resetBadgeCounter = function (guid, senderGUID)
{
    var chatAliveMessage = new www_caseris_de_CaesarSchema_ChatAliveMessage();
    chatAliveMessage.setSenderGUID(senderGUID);
    chatAliveMessage.setReceiverGUID(guid);
    chatAliveMessage.setType(Caesar.ChatControlDataType.Read);
    chatAliveMessage.setTimeOutInMS(DETECT_TIMEOUT + DISPLAY_TIMEOUT); //Erfahrungswert lt. Ingo ;-)

    var self = this;
    var promise = Caesar.Access.sendChatAliveMessage(this._sessionID, chatAliveMessage);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SendChatAliveMessageResponse);
        
    }, function () {  });
    
};

CaesarProxySession.prototype.getLineIdByGuid = function (guid, successFunction, errorFunction)
{    
    var self = this;
    var promise = Caesar.Access.cti_GetLineIdByGuid(this._sessionID, guid);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_GetLineIdByGuidResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.sendDTMF = function (callId, digits, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.cti_SendDTMF(this._sessionID, callId, digits);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTI_SendDTMFResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.deleteTeamChatHistory = function (guid)
{
    var self = this;
    var promise = Caesar.Access.teamChat_DeleteAllMessages(this._sessionID, this.convert2ChatReceiver(guid));
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_DeleteAllMessagesResponse);
        self.onDeleteTeamChatHistorySuccess(response, guid);
    }, function () { self.onDeleteTeamChatHistoryException(guid); });
};

CaesarProxySession.prototype.onDeleteTeamChatHistorySuccess = function (response, guid) {
    this.fireEvent("onDeleteTeamChatHistorySuccess", response, guid);
};

CaesarProxySession.prototype.onDeleteTeamChatHistoryException = function (guid) {
    this.fireEvent("onDeleteTeamChatHistoryException", guid);
};


CaesarProxySession.prototype.deleteTeamChatMessages = function (guid, messageGuids, successFunction, exceptionFunction)
{
    var self = this;
    var promise = Caesar.Access.teamChat_DeleteMessages(this._sessionID, this.convert2ChatReceiver(guid), messageGuids);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_DeleteMessagesResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

// - UserActive
// - UserInactive
CaesarProxySession.prototype.sendChatAliveMessage = function (guid, senderGUID, type)
{
    var chatAliveMessage = new www_caseris_de_CaesarSchema_ChatAliveMessage();
    chatAliveMessage.setSenderGUID(senderGUID);
    chatAliveMessage.setReceiverGUID(guid);
    chatAliveMessage.setType(type);
    chatAliveMessage.setTimeOutInMS(DETECT_TIMEOUT + DISPLAY_TIMEOUT); //Erfahrungswert lt. Ingo ;-)

    var self = this;
    var promise = Caesar.Access.sendChatAliveMessage(this._sessionID, chatAliveMessage);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SendChatAliveMessageResponse);
        
    }, function () { });
};

CaesarProxySession.prototype.removePartnerListItem = function (partnerId, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.ctiPartnerList_RemoveItem(this._sessionID, partnerId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.CTIPartnerList_RemoveItemResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.recordSession = function (action, acdSessionId, successFunction, errorFunction)
{
    if (Ext.isString(action))
    {
        action = Caesar.RecordingAction[action];
    }
    var self = this;
    var promise = Caesar.Access.contactCenter_RecordSession(this._sessionID, acdSessionId, action);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_RecordSessionResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};


CaesarProxySession.prototype.WebRTCSaveInvitation = function (invitation, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.webRtcSaveInvitation(this._sessionID, invitation);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebRtcSaveInvitationResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.WebRTCEditInvitation = function (invitation, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.webRtcEditInvitation(this._sessionID, invitation);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebRtcEditInvitationResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.WebRTCDeleteInvitation = function (invitation, successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.webRtcDeleteInvitation(this._sessionID, invitation);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebRtcDeleteInvitationResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.WebRTCGetAllInvitations = function (successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.webRtcGetAllInvitations(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebRtcGetAllInvitationsResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.getLastChatMessages = function (guids) 
{
    var self = this;
    var promise = Caesar.Access.userChat_GetLastMessages(this._sessionID, guids);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.UserChat_GetLastMessagesResponse);
        self.onGetLastChatMessagesSuccess(response, guids);
    }, function ()
    {
        self.onGetLastChatMessagesException();
    });
};

CaesarProxySession.prototype.onGetLastChatMessagesSuccess = function (response, guids)
{
    this.fireEvent('onGetLastChatMessagesSuccess', response, guids);
};

CaesarProxySession.prototype.onGetLastChatMessagesException = function ()
{
    this.fireEvent('onGetLastChatMessagesException');
};

CaesarProxySession.prototype.getUnreadMessagesCounts = function ()
{
    var self = this;
    var promise = Caesar.Access.userChat_GetUnreadMessagesCounts(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.UserChat_GetUnreadMessagesCountsResponse);
        self.onGetUnreadMessagesCountsSuccess(response);
    }, function () { self.onGetUnreadMessagesCountsException(); });
};

CaesarProxySession.prototype.onGetUnreadMessagesCountsSuccess = function (response)
{
    this.fireEvent('onGetUnreadMessagesCountsSuccess', response);
};

CaesarProxySession.prototype.onGetUnreadMessagesCountsException = function ()
{
    this.fireEvent('onGetUnreadMessagesCountsException');
};

CaesarProxySession.prototype.getChatHistoryForUser = function (guid, lastKnownMessageId)
{
    var self = this;
    var promise = Caesar.Access.userChat_GetHistory(this._sessionID, guid, lastKnownMessageId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.UserChat_GetHistoryResponse);
        self.onGetChatHistoryForUserSuccess(response, guid, lastKnownMessageId);
    }, function () { self.onGetChatHistoryForUserException(guid); });
};

CaesarProxySession.prototype.onGetChatHistoryForUserSuccess = function (response, guid, lastKnownMessageId)
{
    this.fireEvent('onGetChatHistoryForUserSuccess', response, guid, lastKnownMessageId);
};

CaesarProxySession.prototype.onGetChatHistoryForUserException = function (guid)
{
    this.fireEvent('onGetChatHistoryForUserException', guid);
};

CaesarProxySession.prototype.getWebRtcConfiguration = function ()
{
    var self = this;
    var promise = Caesar.Access.webRtcGetConfiguration(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.WebRtcGetConfigurationResponse);
        self.onGetWebRtcConfigurationSuccess(response);
    }, function () { self.onGetWebRtcConfigurationException(); });
};

CaesarProxySession.prototype.onGetWebRtcConfigurationSuccess = function (response)
{
    this.fireEvent('onGetWebRtcConfigurationSuccess', response);
};

CaesarProxySession.prototype.onGetWebRtcConfigurationException = function ()
{
    this.fireEvent('onGetWebRtcConfigurationException');
};

CaesarProxySession.prototype.deleteUserChatMessages = function (partnerGuid, messageIds, recordsToRemove, wasLastMessage)
{
    var self = this;
    var promise = Caesar.Access.userChat_DeleteMessages(this._sessionID, partnerGuid, messageIds);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.UserChat_DeleteMessagesResponse);
        self.onDeleteUserChatMessagesSuccess(response, recordsToRemove, messageIds, wasLastMessage);
    }, function () { self.onDeleteUserChatMessagesException(recordsToRemove); });
};

CaesarProxySession.prototype.onDeleteUserChatMessagesSuccess = function (response, recordsToRemove, messageIds, wasLastMessage)
{
    this.fireEvent('onDeleteUserChatMessagesSuccess', response, recordsToRemove, messageIds, wasLastMessage);
};

CaesarProxySession.prototype.onDeleteUserChatMessagesException = function (recordsToRemove)
{
    this.fireEvent('onDeleteUserChatMessagesException', recordsToRemove);
};

CaesarProxySession.prototype.resolveName = function(name, addressBook, matchFlag, matchType, onSuccess, onException) {
    if (Ext.isString(matchFlag)) {
        matchFlag = Caesar.MatchFlag[matchFlag];
    }
    if (Ext.isString(matchType)) {
        matchType = Caesar.MatchType[matchType];
    }

    var promise;
    if (isValidString(addressBook))
    {
        promise = Caesar.Access.getContactFromName(this._sessionID, name, addressBook, matchFlag, matchType, []);
    }
    else
    {
        promise = Caesar.Access.getContactFromNameEx(this._sessionID, name, matchFlag, matchType, []);
    }

    var self = this;
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, isValidString(addressBook) ? ProxyTypeDefinitions.GetContactFromNameResponse : ProxyTypeDefinitions.GetContactFromNameExResponse);
        onSuccess(response, name, addressBook);
    }, function() { onException(name, addressBook); });
};

CaesarProxySession.prototype.resolveNumber = function(number, addressBook, onSuccess, onException) {
    var self = this;
    var promise = Caesar.Access.getContactFromNumber(this._sessionID, number, addressBook);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.GetContactFromNumberResponse);
        onSuccess(response, number, addressBook);
    }, function() { onException(number, addressBook); });
};

CaesarProxySession.prototype.sendEMail = function(mailId, value, finish, remark, reasonId, groupId, agentId, doneFct, failFct) {
    var clonedValue = cloneCaesarProxyObject(value);
    this.replaceEnumStringsWithNumericValue(clonedValue, ProxyTypeDefinitions.ContactCenterMail_Send.Message);
    if (!failFct) {
        failFct = function() {
            console.log("Failed answer email");
        };
    }

    var self = this;
    var promise = Caesar.Access.contactCenterMail_Send(this._sessionID, mailId, clonedValue, finish, remark, reasonId, Number(groupId), Number(agentId));
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_SendResponse);
        doneFct(response);
    }, function() { failFct(); });
};

CaesarProxySession.prototype.lockEMail = function(mailId, lock, remark, reasonId, doneFct, failFct) {

    if (!failFct) {
        failFct = function() {
            console.log("Failed lock email");
        };
    }

    var self = this;
    var promise = Caesar.Access.contactCenterMail_Lock(this._sessionID, mailId, lock, remark, reasonId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_LockResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.handBackEMail = function(ticketId, remark, reasonId, doneFct, failFct) {

    if (!failFct) {
        failFct = function() {
            console.log("Failed lock email");
        };
    }

    var self = this;
    var promise = Caesar.Access.contactCenterMail_HandBack(this._sessionID, ticketId, remark, reasonId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_HandBackResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.markEMail = function(mailId, state, remark, reasonId, doneFct, failFct) {
    if (Ext.isString(state)) {
        state = Caesar.MailMarkState[state];
    }

    if (!failFct) {
        failFct = function() {
            console.log("Failed mark email");
        };
    }

    var self = this;
    var promise = Caesar.Access.contactCenterMail_Mark(this._sessionID, mailId, state, remark, reasonId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_MarkResponse);
        doneFct(response);
    }, function() { failFct(); });

};


CaesarProxySession.prototype.getContactHistory = function(entryId, storageId, mailAddress, number, doneFct, failFct) {
    var self = this;
    var promise = Caesar.Access.contactCenter_GetContactHistory(this._sessionID, entryId, storageId, mailAddress, number);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_GetContactHistoryResponse);
        doneFct(response);
    }, function() { failFct(); });
};

CaesarProxySession.prototype.searchForEmails = function(start, end, searchTerm, searchField, groupIds, agentIds, doneFct, failFct, mailSearchFilter) {
    if (Ext.isString(mailSearchFilter)) {
        mailSearchFilter = Caesar.MailSearchFilter[mailSearchFilter];
    }

    var clonedSearchField = Ext.clone(searchField);
    for (var key in clonedSearchField)
    {
        clonedSearchField[key] = Caesar.MailField[clonedSearchField[key]];
    }

    var self = this;
    var promise = Caesar.Access.contactCenterMail_Search(this._sessionID, start, end, mailSearchFilter, searchTerm, clonedSearchField, groupIds, agentIds);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_SearchResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.distributeToAgent = function(mailId, agentId, remark, reasonId, doneFct, failFct) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_DistributeToAgent(this._sessionID, mailId, agentId, remark, reasonId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_DistributeToAgentResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.distributeToGroup = function(mailId, groupId, remark, reasonId, doneFct, failFct) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_DistributeToGroup(this._sessionID, mailId, groupId, remark, reasonId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_DistributeToGroupResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.createMail = function(ticketId, mailId, mailType, citeType, doneFct, failFct) {
    if (Ext.isString(mailType)) {
        mailType = Caesar.MailType[mailType];
    }
    if (Ext.isString(citeType)) {
        citeType = Caesar.MailCreateCiteMode[citeType];
    }

    var self = this;
    var promise = Caesar.Access.contactCenterMail_Create(this._sessionID, ticketId, mailId, mailType, citeType);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_CreateResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.saveMail = function(mailId, mailMessage, doneFct, failFct) {
    var clonedMailMessage = cloneCaesarProxyObject(mailMessage);
    this.replaceEnumStringsWithNumericValue(clonedMailMessage, ProxyTypeDefinitions.ContactCenterMail_Save.MailMessage);

    var self = this;
    var promise = Caesar.Access.contactCenterMail_Save(this._sessionID, mailId, clonedMailMessage);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_SaveResponse);
        doneFct(response);
    }, function() { failFct(); });
};


CaesarProxySession.prototype.getMailTemplate = function(mailId, templateId, doneFct, failFct) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_GetTemplate(this._sessionID, mailId, templateId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_GetTemplateResponse);
        doneFct(response);
    }, function() { failFct(); });
};

CaesarProxySession.prototype.getTextBlock = function(mailId, textBlockId, doneFct, failFct) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_GetTextBlock(this._sessionID, mailId, textBlockId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_GetTextBlockResponse);
        doneFct(response);
    }, function() { failFct(); });
};

CaesarProxySession.prototype.cancelMail = function(mailId, successFunction, errorFunction) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_Cancel(this._sessionID, mailId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_CancelResponse);
        successFunction(response);
    }, function() { errorFunction(); });
};


CaesarProxySession.prototype.deleteMail = function(mailId, successFunction, errorFunction) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_Delete(this._sessionID, mailId);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_DeleteResponse);
        successFunction(response);
    }, function() { errorFunction(); });
};

CaesarProxySession.prototype.mailMarkRead = function(mailId, read, successFunction, errorFunction) {
    if (Ext.isString(read)) {
        read = Caesar.MailReadFlag[read];
    }
    var self = this;
    var promise = Caesar.Access.contactCenterMail_MarkRead(this._sessionID, mailId, read);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_MarkReadResponse);
        successFunction(response);
    }, function() { errorFunction(); });
};


CaesarProxySession.prototype.mergeTicket = function(ticketId, targetTicketId, reasonId, remark, onSuccessFunction, onExceptionFunction) {
    var self = this;
    var promise = Caesar.Access.contactCenterMail_MergeTicket(this._sessionID, ticketId, targetTicketId, reasonId, remark);
    this.executePromise(promise, function(response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenterMail_MergeTicketResponse);
        onSuccessFunction(response);
    }, function() { onExceptionFunction(); });
};

CaesarProxySession.prototype.transferContactCenterCallToAgent = function (callSessionId, agentId, callId)
{
    var self = this;
    var promise = Caesar.Access.contactCenter_TransferCallToAgent(this._sessionID, callSessionId, agentId, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_TransferCallToAgentResponse);
        self.onTransferContactCenterCallToAgentSuccess(response);
    }, function () { self.onTransferContactCenterCallToAgentException(); });
};

CaesarProxySession.prototype.onTransferContactCenterCallToAgentSuccess = function (response)
{
    this.fireEvent('onTransferContactCenterCallToAgentSuccess', response);
};

CaesarProxySession.prototype.onTransferContactCenterCallToAgentException = function ()
{
    this.fireEvent('onTransferContactCenterCallToAgentException');
};

CaesarProxySession.prototype.transferContactCenterCallToGroup = function (callSessionId, groupId, skills, callId)
{
    var self = this;
    var promise = Caesar.Access.contactCenter_TransferCallToGroup(this._sessionID, callSessionId, groupId, skills, callId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_TransferCallToGroupResponse);
        self.onTransferContactCenterCallToGroupSuccess(response);
    }, function () { self.onTransferContactCenterCallToGroupException(); });
};

CaesarProxySession.prototype.onTransferContactCenterCallToGroupSuccess = function (response)
{
    this.fireEvent('onTransferContactCenterCallToGroupSuccess', response);
};

CaesarProxySession.prototype.onTransferContactCenterCallToGroupException = function ()
{
    this.fireEvent('onTransferContactCenterCallToGroupException');
};


CaesarProxySession.prototype.addChatTextBlock = function (textBlock, isNewCategory) {
    var self = this;
    var promise = Caesar.Access.addChatTextBlock(this._sessionID, textBlock);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.AddChatTextBlockResponse);
        self.onAddChatTextBlockSuccess(response, textBlock, isNewCategory);
    }, function () {
        self.onAddChatTextBlockException();
    });
};

CaesarProxySession.prototype.onAddChatTextBlockSuccess = function (response, textBlock, isNewCategory) {
    this.fireEvent('onAddChatTextBlockSuccess', response, textBlock, isNewCategory);
};

CaesarProxySession.prototype.onAddChatTextBlockException = function () {
    this.fireEvent('onAddChatTextBlockException');
};

CaesarProxySession.prototype.deleteChatTextBlock = function (textBlock) { //todo: fill
    var self = this;
    var promise = Caesar.Access.deleteChatTextBlock(this._sessionID, textBlock.data.Id);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.DeleteChatTextBlockResponse);
        self.onDeleteChatTextBlockSuccess(response, textBlock);
    }, function () {
        self.onDeleteChatTextBlockException();
    });
};

CaesarProxySession.prototype.onDeleteChatTextBlockSuccess = function (response, textBlock) {
    this.fireEvent("onDeleteChatTextBlockSuccess", response, textBlock);
};

CaesarProxySession.prototype.onDeleteChatTextBlockException = function () {
    this.fireEvent("onDeleteChatTextBlockException");
};

CaesarProxySession.prototype.updateChatTextBlock = function (textBlock, isNewCategory) {
    var self = this;
    var promise = Caesar.Access.updateChatTextBlock(this._sessionID, textBlock);
    this.executePromise(promise, function (response) {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.UpdateChatTextBlockResponse);
        self.onUpdateChatTextBlockSuccess(response, textBlock, isNewCategory);
    }, function() {
            self.onUpdateChatTextBlockException();
        });
};

CaesarProxySession.prototype.onUpdateChatTextBlockSuccess = function (response, textBlock, isNewCategory) {
    this.fireEvent("onUpdateChatTextBlockSuccess", response, textBlock, isNewCategory);
};

CaesarProxySession.prototype.onUpdateChatTextBlockException = function () {
    this.fireEvent("onUpdateChatTextBlockException");
};

CaesarProxySession.prototype.loadChatTextBlocks = function () {
    var self = this;
    var promise = Caesar.Access.loadChatTextBlocks(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.LoadChatTextBlocksResponse);
        self.onLoadChatTextBlocksSuccess(response);
    }, function ()
    {
        self.onLoadChatTextBlocksException();
    });
};

CaesarProxySession.prototype.onLoadChatTextBlocksSuccess = function (response) {
    this.fireEvent("onLoadChatTextBlocksSuccess", response);
};

CaesarProxySession.prototype.onLoadChatTextBlocksException = function () {
    this.fireEvent("onLoadChatTextBlocksException");
};

CaesarProxySession.prototype.getMediaListForTeamChat = function (guid, lastMessageId)
{
    var self = this;
    var promise = Caesar.Access.teamChat_GetMediaList(this._sessionID, this.convert2ChatReceiver(guid), lastMessageId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.TeamChat_GetMediaListResponse);
        self.onGetMediaListForTeamChatSuccess(response, guid, lastMessageId);
    }, function ()
    {
        self.onGetMediaListForTeamChatException(guid, lastMessageId);
    });
};

CaesarProxySession.prototype.onGetMediaListForTeamChatSuccess = function (response, guid, lastMessageId)
{
    this.fireEvent("onGetMediaListForTeamChatSuccess", response, guid, lastMessageId);
};

CaesarProxySession.prototype.onGetMediaListForTeamChatException = function (guid, lastMessageId)
{
    this.fireEvent("onGetMediaListForTeamChatException", guid, lastMessageId);
};

CaesarProxySession.prototype.getMediaListForUserChat = function (guid, lastMessageId, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.userChat_GetMediaList(this._sessionID, guid, lastMessageId);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.UserChat_GetMediaListResponse);
        self.onGetMediaListForUserChatSuccess(response, guid, lastMessageId);
    }, function ()
    {
        self.onGetMediaListForUserChatException(guid, lastMessageId);
    });
};

CaesarProxySession.prototype.onGetMediaListForUserChatSuccess = function (response, guid, lastMessageId)
{
    this.fireEvent("onGetMediaListForUserChatSuccess", response, guid, lastMessageId);
};

CaesarProxySession.prototype.onGetMediaListForUserChatException = function (guid, lastMessageId)
{
    this.fireEvent("onGetMediaListForUserChatException", guid, lastMessageId);
};

CaesarProxySession.prototype.setSipPreferences = function (preferences, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.setSipPreferences(this._sessionID, preferences);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.SetSipPreferencesResponse);
        successCallback(response);
    }, function ()
    {
        exceptionCallback();
    });
};

CaesarProxySession.prototype.acceptCampaignCall = function (callRequestEvent, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.acceptCampaign(this._sessionID, callRequestEvent.getCallRequestId());
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.AcceptCampaignResponse);
        successCallback(response);
    }, function ()
    {
        exceptionCallback();
    });
};

CaesarProxySession.prototype.rejectCampaignCall = function (callRequestEvent, successCallback, exceptionCallback)
{
    var self = this;
    var promise = Caesar.Access.rejectCampaign(this._sessionID, callRequestEvent.getCallRequestId());
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.RejectCampaignResponse);
        successCallback(response);
    }, function ()
    {
        exceptionCallback();
    });
};

CaesarProxySession.prototype.getLoginStates = function (successFunction, errorFunction)
{
    var self = this;
    var promise = Caesar.Access.contactCenter_GetLoginStates(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_GetLoginStatesResponse);
        successFunction(response);
    }, function () { errorFunction(); });
};

CaesarProxySession.prototype.setLoginStates = function (states, force, onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.contactCenter_SetLoginStates(this._sessionID, states, force);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.ContactCenter_SetLoginStateResponse);
        onSuccess(response);
    }, function () { onException(); });
};

CaesarProxySession.prototype.makeCallForCampaign = function (campaignCallRequest, onSuccess, onException)
{
    campaignCallRequest.DialMode = Caesar.CampaignCallMode[campaignCallRequest.DialMode];
    var self = this;
    var promise = Caesar.Access.makeCallForCampaign(this._sessionID, campaignCallRequest);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.MakeCallForCampaignResponse);
        onSuccess(response);
    }, function () { onException(); });
};

CaesarProxySession.prototype.requestNextCampaignCall = function (onSuccess, onException)
{
    var self = this;
    var promise = Caesar.Access.requestNextCampaignCall(this._sessionID);
    this.executePromise(promise, function (response)
    {
        self.assignClassesToResponse(response, ProxyTypeDefinitions.RequestNextCampaignCallResponse);
        onSuccess(response);
    }, function () { onException(); });
};


//geht eine Response vom Proxy rekursiv durch und weist den einzelnen Strukturen Klassen zu
//bspw gehen wir durch eine GetJournalResponse und weisen den einzelnen Einträgen die Klasse CTIJournalEntry zu
//der Parameter structure muss eine Struktur aus der Datei ProxyTypeDefinitions.js sein
CaesarProxySession.prototype.assignClassesToResponse = function(response, structure) {
    assignClassesToResponse(response, structure);
};

function assignObjectClass(jsonObject, objectClass)
{
    var prototype;
    if (self && self.document === undefined) //I'm in a WebWorker
    {
        prototype = self[objectClass].prototype;
    }
    else
    {   
        if (!window[objectClass])
        {
            return;
        }
        prototype = window[objectClass].prototype;
    }
    if (Object.setPrototypeOf)
    {
        jsonObject = Object.setPrototypeOf(jsonObject, prototype);
    }
    else
    { // IE 10
        var extend = function (source, extension)
        {
            for (var extensionkey in extension)
            {
                source[extensionkey] = extension[extensionkey];
            }
        };

        extend(jsonObject, prototype);
    }
}

//geht eine Response vom Proxy rekursiv durch und weist den einzelnen Strukturen Klassen zu
//bspw gehen wir durch eine GetJournalResponse und weisen den einzelnen Einträgen die Klasse CTIJournalEntry zu
//der Parameter structure muss eine Struktur aus der Datei ProxyTypeDefinitions.js sein
CaesarProxySession.prototype.assignClassesToResponse = function (response, structure)
{
    if (!response || !structure)
    {
        return;
    }
    if (Ext.isString(structure))
    {
        return;
    }

    Ext.iterate(structure, function (key, value)
    {
        switch (key)
        {
            case "className":
                if (value.indexOf("ArrayOf") >= 0)
                {
                    assignObjectClass(response, "Array");
                }
                else
                {
                    assignObjectClass(response, value);
                    response.typeMarker = value;
                }
                break;
            case "arrayMembers":
                Ext.each(response, function (entry)
                {
                    this.assignClassesToResponse(entry, structure[key]);
                }, this);
                break;

            default:
                if (Ext.isString(value) && value.indexOf("enum ") === 0)
                {
                    var valueParts = value.split(" ");
                    if (valueParts.length === 2)
                    {
                        var enumName = valueParts[1];
                        if (Caesar[enumName])
                        {
                            response[key] = Caesar[enumName][response[key]];
                        }
                    }
                }
                else if (Ext.isString(value) && value.indexOf("recursive ") === 0)
                {
                    var valueParts = value.split(" ");
                    if (valueParts.length === 2)
                    {
                        var recursiveStructure = valueParts[1]; //hier steht dann z.B. ArrayOfMailMessageEx
                        if (recursiveStructure.indexOf("ArrayOf") === 0)
                        {
                            var recursiveType = recursiveStructure.substring("ArrayOf".length);
                            Ext.each(response[key], function (item)
                            {
                                this.assignClassesToResponse(item, ProxyTypeDefinitions[recursiveType]);
                            }, this);
                        }
                        else
                        {
                            this.assignClassesToResponse(response[key], ProxyTypeDefinitions[recursiveStructure]);
                        }
                    }
                }
                else if (Ext.isString(value) && value.indexOf("[]") >= 0 && value !== "string[]" && value !== "number[]")
                {
                    //Fall: Array von enums
                    var enumType = value.substring(0, value.length - 2);
                    if (isValidString(enumType) && Caesar[enumType])
                    {
                        Ext.each(response[key], function (item, index)
                        {
                            response[key][index] = Caesar[enumType][response[key][index]];
                        }, this);
                    }
                }
                else
                {
                    this.assignClassesToResponse(response[key], structure[key]);
                }
        }
    }, this);
};

//geht eine Struktur (z.B. einen Kontakt) rekursiv durch und ersetzt alle enum-Werte, die ein String sind, durch
//den entsprechenden numerischen Wert, den der Proxy erwartet
CaesarProxySession.prototype.replaceEnumStringsWithNumericValue = function(requestParameter, structure) {
    if (!requestParameter || !structure) {
        return;
    }
    if (Ext.isString(structure)) {
        return;
    }

    Ext.iterate(structure, function(key, value) {
        switch (key) {
            case "className":
                break;
            case "arrayMembers":
                Ext.each(requestParameter, function(entry) {
                    this.replaceEnumStringsWithNumericValue(entry, structure[key]);
                }, this);
                break;

            default:
                if (Ext.isString(value) && value.indexOf("enum ") === 0) {
                    var valueParts = value.split(" ");
                    if (valueParts.length === 2) {
                        var enumName = valueParts[1];
                        if (Caesar[enumName] && Ext.isString(requestParameter[key])) {
                            requestParameter[key] = Caesar[enumName][requestParameter[key]];
                        }
                    }
                }
                //der recursive-Fall ist ungetestet, weil der Fall bisher nicht aufgetreten ist
                else if (Ext.isString(value) && value.indexOf("recursive ") === 0) {
                    var valueParts = value.split(" ");
                    if (valueParts.length === 2) {
                        var recursiveStructure = valueParts[1]; //hier steht dann z.B. ArrayOfMailMessageEx
                        if (recursiveStructure.indexOf("ArrayOf") === 0) {
                            var recursiveType = recursiveStructure.substring("ArrayOf".length);
                            Ext.each(requestParameter[key], function(item) {
                                this.replaceEnumStringsWithNumericValue(item, ProxyTypeDefinitions[recursiveType]);
                            }, this);
                        }
                        else {
                            this.replaceEnumStringsWithNumericValue(requestParameter[key], ProxyTypeDefinitions[recursiveStructure]);
                        }
                    }
                }
                else {
                    this.replaceEnumStringsWithNumericValue(requestParameter[key], structure[key]);
                }
                break;
        }
    }, this);
};

//geht eine Struktur (z.B. einen Kontakt) rekursiv durch und löscht alle Felder, die null/undefined sind
//das muss man bspw machen, wenn man einen neuen Kontakt anlegen will und der enum- und bool-Felder mit null vorbelegt hat,
//was beim Proxy zu einer Exception führt
CaesarProxySession.prototype.deleteInvalidFieldsInRequest = function(requestParameter) {
    if (!requestParameter) {
        return;
    }
    if (Ext.isArray(requestParameter)) {
        Ext.each(requestParameter, function(item) {

            this.deleteInvalidFieldsInRequest(item);

        }, this);
    }
    else if (Ext.isObject(requestParameter)) {
        Ext.iterate(requestParameter, function(key, value) {
            if (!isValid(requestParameter[key])) {
                delete requestParameter[key];
            }
            else {
                this.deleteInvalidFieldsInRequest(value);
            }
        }, this);
    }
};

CaesarProxySession.prototype.executePromise = function(promise, successCallback, exceptionCallback) {
    promise.then(successCallback, function(response) {
        if (response.status === 200) {
            successCallback(response);
        }
        else {
            exceptionCallback(response);
        }
    }).catch(function (error) {
        //In der Zukunft - Nur nicht mehr vor dem Release (5.3.2019)
        /*
            if (exceptionCallback && typeof exceptionCallback === "function") {
                exceptionCallback(error);
            }
        */
        console.error(error);
    });
};

var SESSION = new CaesarProxySession();

var getProxySession = function () {
    return SESSION;
    };
