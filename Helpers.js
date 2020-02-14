var VIEWPORT_POSITION_AFTER_HEADER = 1;
/**
 * @param {Object} record
 * @param {string=} properties
 * @return {boolean}
 */

/* @flow */
/*: (record: Object, properties: string): boolean */
function isValid(record, properties)
{
    var checkProperty = function (prop) {
        if (prop.indexOf('(') !== -1) {
            prop = prop.split('(');

            var property = prop[0];

            if (record[property] === null || record[property] === undefined) {
                return undefined;
            }

            return record[prop[0]]();
        }

        return record[prop];

    };

    if (record === undefined || record === null)
    {
        return false;
    }

    if (properties && properties !== '') {
        properties = properties.split('.');

        for (var i = 0; i < properties.length; i++) {
            var child = checkProperty(properties[i]);
            if (child === undefined || child === null)
            {
                return false;
            }
            else
            {
                record = child;
            }
        }
    }

    return true;
}

/**
 * @param {string} str
 * @return {boolean}
 */

/* @flow */
/*: (str: string): boolean */
function isValidString(str)
{
    if (!isValid(str)) {
        return false;
    }
    return str !== "";
}

function isPhoneNumber(toCheck) 
{
    if (!isValidString(toCheck) || toCheck === '*')
    {
        return false;
    }

    for (var i = 0; i < toCheck.length; ++i)
    {
        var c = toCheck[i].toUpperCase();
        if (i === 0 && toCheck.length > 1 && (c === 'I' || c === 'P')) // das erste Zeichen darf ein i oder ein p sein
        {
            continue;
        }
        if (!this.isDigit(c) && c !== '+' && c !== '-' && c !== '/' && c !== '#' && c !== '*' && c !== ' ' && c !== '(' && c !== ')' && c !== '.')
        {
            return false;
        }
    }
    return true;
}


function isEqual(o1, o2)
{
    for (var p1 in o1)
    {
        if (o1[p1] !== o2[p1])
        {
            return false;
        }
    }
    for (var p2 in o2)
    {
        if (o1[p2] !== o2[p2])
        {
            return false;
        }
    }
    return true;
}

function isValidNumbers(numberArray) {
    return numberArray.every(isPhoneNumber);
}

function isDigit(character) {
    return !Number.isNaN(parseInt(character, 10));
}

function isValidChar(character, allowedCharacters) {
    if (allowedCharacters.indexOf(character) >= 0) {
        return true;
    }
    return false;
}

function isValidEmailAddress(szEmail, bAllowDisplayName, bAllowMultiple) {
    if (!isValid(szEmail)) {
        return false;
    }
    // split in multiple addresses
    var Addresses = szEmail.split(",");

    // more than one address allowed?
    if (!bAllowMultiple && Addresses.length > 1) {
        return false;
    }
    // check every single address
    for (var i = 0; i < Addresses.length; i++) {
        var strEmail = Addresses[i];

        // check display name
        if (bAllowDisplayName) {
            var EMailParts = strEmail.split(" ");

            if (0 === EMailParts.length) {
                return false;
            }
            if (1 < EMailParts.length) {
                // has display name
                var EmailDisplay = "";
                for (var j = 0; j < EMailParts.length - 1; j++)
                {
                    EmailDisplay += EMailParts[j] + " ";
                }
                EmailDisplay.trim();

                // check last part for valid email address
                strEmail = EMailParts[EMailParts.length - 1];
                if (strEmail.charAt(0) !== "<" || strEmail.charAt(strEmail.length - 1) !== ">") {
                    return false;
                }
            }
            else {
                // has email address only
                strEmail = EMailParts[0];
            }
        }

        // can be included in braces
        if (strEmail.charAt(0) === "<" && strEmail.charAt(strEmail.length - 1) === ">") {
            strEmail = strEmail.substring(1, strEmail.length - 1);
        }
        // must have all valid characters
        for (var k = 0; k < strEmail.length; ++k) {
            if (!isValidChar(strEmail.charAt(k), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789äöüÄÖÜß_@.-")) {
                return false;
            }
        }

        // must have an @ and at least one character before this @
        var posAt = strEmail.indexOf('@');
        if (posAt < 1) {
            return false;
        }
        // may not contain two or more @s
        var pos2At = strEmail.indexOf('@', posAt + 1);
        if (-1 !== pos2At) {
            return false;
        }
        // must have at least one dot after the @ with at least one character in between
        var posRDot = strEmail.lastIndexOf('.');
        if (posRDot < posAt + 1) {
            return false;
        }
        // must have a top level domain with at least 2 characters
        if (posRDot > strEmail.length - 3) {
            return false;
        }
        // TLD may not contain numbers
        var TLD = strEmail.substring(posRDot + 1);
        for (var l = 0; l < TLD.length; ++l) {
            if (!isValidChar(TLD.charAt(l), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")) {
                return false;
            }
        }

        // may not contain two consecutive dots in the domain part
        var posDotDot = strEmail.indexOf("..", posAt);
        if (-1 !== posDotDot) {
            return false;
        }
        // may not contain "@."
        var posAtDot = strEmail.indexOf("@.");
        if (-1 !== posAtDot) {
            return false;
        }
    }

    return true;
}

function getValidStringAtPosition(stringArray, position) {
    var filteredArray = Ext.Array.filter(stringArray, function (string) {
        return isValidString(string);
    });
    if (position > filteredArray.length - 1) {
        return "";
    }
    return filteredArray[position];
}

function getFirstValidString(stringArray)
{
    return getValidStringAtPosition(stringArray, 0);
}

function getSecondValidString(stringArray)
{
    return getValidStringAtPosition(stringArray, 1);
}

function getThirdValidString(stringArray)
{
    return getValidStringAtPosition(stringArray, 2);
}

function getFourthValidString(stringArray) {
    return getValidStringAtPosition(stringArray, 3);
}

function getClassName(panel)
{
    var classObject = Ext.getClass(panel);
    if (!isValid(classObject)) {
        return "";
    }
    return classObject.$className;
}
//TODO: Datei DateHelpers.js anlegen?
function getToday()
{
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getYesterday()
{
    var today = getToday();
    return Ext.Date.add(today, Ext.Date.DAY, -1);
}

function getTomorrow()
{
    var today = getToday();
    return Ext.Date.add(today, Ext.Date.DAY, 1);
}

function isToday(date)
{
    var today = getToday();
    return isSameDay(today, date);
}

function isYesterday(date)
{
    var yesterday = getYesterday();
    return isSameDay(yesterday, date);
}

function isTomorrow(date)
{
    var tomorrow = getTomorrow();
    return isSameDay(tomorrow, date);
}

function isDateInTheFuture(date)
{
    var today = getToday();
    return dateWithoutTime(date) > today;
}

function isDateInThePast(date)
{
    var today = getToday();
    return dateWithoutTime(date) < today;
}

function dateWithoutTime(date)
{
    var newDate = new Date(date);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
}

function isSameDay(date1, date2)
{
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

function isSameMinute(date1, date2)
{
    return date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();
}

function date2string(date)
{
    if (isToday(date)) {
        return formatTimeString(date);
    }
    return formatDateString(date);
}

function formatTimeString(date)
{
    return Ext.util.Format.date(date, "H:i");
}

function formatDate(date, considerTodayAndYesterday, formatString) {
    if (considerTodayAndYesterday) {
        if (isToday(date)) {
            return LANGUAGE.getString('today');
        }
        else if (isYesterday(date)) {
            return LANGUAGE.getString('yesterday');
        }
    }
    return Ext.util.Format.date(date, formatString);
}

function formatDateString(date, considerTodayAndYesterday)
{
    return formatDate(date, considerTodayAndYesterday, "d. M Y");
}

function formatLongDateString(date, considerTodayAndYesterday)
{
    return formatDate(date, considerTodayAndYesterday, "d. F Y");
}

function formatDateStringWithWeekDay(date, considerTodayAndYesterday)
{
    return formatDate(date, considerTodayAndYesterday, "l, d. M Y");
}

function formatLongDateStringWithWeekDay(date, considerTodayAndYesterday)
{
    return formatDate(date, considerTodayAndYesterday, "l, d. F Y");
}

function formatDateForEmail(date, smallOrLong)
{
    var result = '';
    if (isToday(date))
    {
        result += LANGUAGE.getString('today');
    }
    else if (isYesterday(date))
    {
        result += LANGUAGE.getString('yesterday');
    }
    else
    {
        if (smallOrLong === "small")
        {
            result += Ext.util.Format.date(date, 'd.m.y'); //Resultat z.B. "29.10.18"
        }
        else
        {
            result += Ext.util.Format.date(date, 'D').substr(0, 2); //ExtJs liefert für Montag Mon zurück, aber wir wollen Mo
            result += Ext.util.Format.date(date, '. d. F Y'); //Resultat z.B. "Di. 29. Oktober 2018"
        }
    }
    result += ", " + formatTimeString(date);
    return result;
}

function createCSS(selector, attributeName, value, removeId)
{
    if (!removeId)
    {
        removeId = "";
    }
    else
    {
        removeId += '_rule';
    }

    var ruleUpdated = false;

    //diese nächste if ist tatsächlich nötig, weil ExtJS anhand der arguments.length "erkennt", ob man als attributeName einen kompletten CSS-String übergibt, oder doch ein name/value-Paar
    //wenn value undefined ist, zählt das auch in die arguments.length rein
    if (isValid(value))
    {
        ruleUpdated = Ext.util.CSS.updateRule(selector, attributeName, value);
    }
    else
    {
        ruleUpdated = Ext.util.CSS.updateRule(selector, attributeName);
    }

    if (!ruleUpdated)
    {
        var propertyString = ' {' + attributeName;
        if (isValidString(value))
        {
            propertyString += ': ' + value;
        }
        propertyString += '}';
        Ext.util.CSS.createStyleSheet(selector + propertyString, removeId);
    }
}

function convertSecondsToString(numberSeconds)
{
    if (!numberSeconds || Number.isNaN(numberSeconds) || numberSeconds < 0)
    {
        numberSeconds = 0;
    }
    var hours = Math.floor(numberSeconds / 3600);
    var minutes = Math.floor((numberSeconds - hours * 3600) / 60);
    numberSeconds -= hours * 3600 + minutes * 60;
    numberSeconds += '';
    minutes += '';
    while (minutes.length < 2)
    {
        minutes = '0' + minutes;
    }
    while (numberSeconds.length < 2)
    {
        numberSeconds = '0' + numberSeconds;
    }
    hours = (hours) ? hours + ':' : '';
    return hours + minutes + ':' + numberSeconds;
}

function convertSecondsToHoursAndMinutesString(numberSeconds)
{
    if (numberSeconds < 0)
    {
        numberSeconds = 0;
    }
    var hours = Math.floor(numberSeconds / 3600) + '';
    var minutes = Math.floor((numberSeconds - hours * 3600) / 60);
    minutes += '';
    while (minutes.length < 2)
    {
        minutes = '0' + minutes;
    }
    while (hours.length < 2)
    {
        hours = '0' + hours;
    }
    
    if (hours > 24)
    {
        var numberDays = Math.floor(numberSeconds / (3600 * 24));
        return numberDays + ' ' + LANGUAGE.getString(numberDays === 1 ? 'day' : 'days2');
    }
    return hours + ':' + minutes;
}

//TODO: rename convertSecondsToUserFriendlyString; gehört eigentlich in JournalEntryPanel
function convertSecondsToString2(numberSeconds)
{
    if (numberSeconds < 0)
    {
        numberSeconds = 0;
    }
    //show only highes value
    var hours = Math.floor(numberSeconds / 3600);
    var minutes = Math.floor((numberSeconds - (hours * 3600)) / 60);
    numberSeconds -= ((hours * 3600) + (minutes * 60));

    var result = numberSeconds + " " + LANGUAGE.getString(numberSeconds === 1 ? "second" : "seconds");
    if (minutes > 0)
    {
        result = minutes + " " + LANGUAGE.getString(minutes === 1 ? "minute" : "minutes");
    }

    if (hours > 0) {
        result = hours + " " + LANGUAGE.getString(hours === 1 ? "hour" : "hours");
    }
    
    return result;
}

function sendEMail(emailAddress, contact, subject)
{
    subject = subject || "";
    var email = emailAddress;
    if (isValid(contact))
    {
        email = '"' + contact.getFullName() + '" <' + email + '>';
    }
    var openedWindow = window.open("mailto:" + email + '?subject=' + subject);
    if (isValid(openedWindow))
    {
        setTimeout(function ()
        {
            openedWindow.close(); //Falls der Browser auf die Idee kommt, hier wirklich ein neues Tab/Fenster aufzumachen (zusätzlich zum Öffnen des E-Mail-Programms), schliessen wir es hier prophylaktisch
        }, 10);
    }
}

function compareContactByDisplayNameWithLastNameFirst(record1, record2)
{
    record1 = record1.data || record1;
    record2 = record2.data || record2;

    var name1 = record1.getFullName(true).toUpperCase(),
            name2 = record2.getFullName(true).toUpperCase();

    return name1.localeCompare(name2);
}

function compareChatByDisplayName(record1, record2) {
    record1 = record1.data || record1;
    record2 = record2.data || record2;

    var contact1 = record1.contact || record1;
    var contact2 = record2.contact || record2;

    var name1 = contact1.getFullName ? contact1.getFullName(false).toUpperCase() : contact1.getDisplayName().toUpperCase();
    var name2 = contact2.getFullName ? contact2.getFullName(false).toUpperCase() : contact2.getDisplayName().toUpperCase();
        
    return name1.localeCompare(name2);
}

function compareChatByLastMessageDate(record1, record2)
{
    var date1 = record1.data.chatDateAsDate;
    var date2 = record2.data.chatDateAsDate;
    if (date1 && !date2)
    {
        return -1;
    }
    if (!date1 && date2)
    {
        return 1;
    }
    return date1 > date2 ? -1 : (date1 === date2 ? compareChatByDisplayName(record1, record2) : 1);
}

function compareByFullDate(record1, record2)
{
    return compareByDate(record1, record1.data.fullDate, record2, record2.data.fullDate);
}

function compareByFormDateTime(record1, record2)
{
    return compareByDate(record1, record1.data.getFormDateTime(), record2, record2.data.getFormDateTime());
}

function compareByDate(record1, date1, record2, date2)
{
    if (isSameDay(date1, date2))
    {
        if (record1.data.dateMessage) {
            return -1;
        }
        if (record2.data.dateMessage) {
            return 1;
        }
    }
    var a, b;
    var result =  (
        isFinite(a = date1.valueOf()) &&
        isFinite(b = date2.valueOf()) ?
        (a > b) - (a < b) :
        NaN
    );
    return result;
}

function showErrorWindow(target, errorText, defaultAlign, yesCallback)
{
    target = target || VIEWPORT;

    if (!yesCallback)
    {
        yesCallback = Ext.emptyFn;
    }

    return Ext.create('MessageDialog',
    {
        text: errorText,
        target: target.el ? target.el : target,
        defaultAlign: defaultAlign || 'tl-bl',
        yesCallback: yesCallback
    });
}

function getImageNameForNumber(contact, number, defaultImage)
{
    if (isValid(contact))
    {
        if (contact.isCompanyContact())
        {
            return "factory_small";
        }
        if (contact.isGlobalInfo())
        {
            return new TelephoneNumber(number).isMobileNumber() ? "mobile_small" : "phone_small";
        }
    }

    if (isValidString(number))
    {
        return new TelephoneNumber(number).isMobileNumber() ? "mobile_small" : "phone_small";
    }
    
    return defaultImage || "user_small";
}

//TODO: zu lang und besser eigene Dialog-Klasse
function createPresenceConfigurationDialog(target)
{
    var animationWindow = {};
    
    var successFunction = function (result)
    {
        console.log(result);
        if (result.getReturnValue().getCode() !== 0)
        {
            showErrorMessage(result.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
            return;
        }
        var getPresenceDataObject = function (state, presenceState)
        {
            var index = 0;

            presenceState.text = state.getCurrentText();

            if (state.getDiversionState() && isValidString(state.getDiversionState()))
            {
                var curState = state.getDiversionState();

                if (curState === DiversionState.Phone.value)
                {
                    index = 2;
                }
                else if (curState === DiversionState.DontChange.value)
                {
                    index = 0;
                }
                else if (curState === DiversionState.Delete.value)
                {
                    index = 1;
                }
                else if (curState === DiversionState.VoiceBox.value)
                {
                    index = 3;
                }
            }
            else
            {
                if (presenceState === PresenceState.Available)
                {
                    index = 1;
                }
            }

            return {
                presenceState: presenceState,
                phoneNumber: state.getDiversionNumber(),
                selectedItem: index,
                availableTexts: state.getAvailableTexts(),
                answeringMachineAvailable: result.getVoiceBoxEnabled(),
                chatActivated: result.getRefuseChatRequest()
            };
        };

        var dataObject =
            [
                getPresenceDataObject(result.getPresent(), Ext.clone(PresenceState.Available)),

                getPresenceDataObject(result.getAbsent(), Ext.clone(PresenceState.NotAvailable)),

                getPresenceDataObject(result.getPause(), Ext.clone(PresenceState.Break)),

                getPresenceDataObject(result.getDontDisturb(), Ext.clone(PresenceState.DnD)),

                getPresenceDataObject(result.getOffline(), Ext.clone(PresenceState.Offline))
            ];

        var content = new PresenceStateConfiguration({
            dataObject: dataObject,
            curPresenceState: {
                text: MY_CONTACT.presence,
                value: MY_CONTACT.getPresenceState()
            },
            successCallBack: function (result)
            {
                console.log(result);

                var getPresenceConfigurationItem = function (item)
                {
                    var result = new www_caseris_de_CaesarSchema_PresenceStateConfiguration();

                    var diversionState;

                    if (item)
                    {
                        if (item.selectedItem === 0)
                        {
                            diversionState = DiversionState.DontChange.value;
                        }
                        else if (item.selectedItem === 1)
                        {
                            diversionState = DiversionState.Delete.value;
                        }
                        else if (item.selectedItem === 2)
                        {
                            diversionState = DiversionState.Phone.value;
                        }
                        else if (item.selectedItem === 3)
                        {
                            diversionState = DiversionState.VoiceBox.value;
                        }
                        else
                        {
                            diversionState = '';
                        }

                        result.setAvailableTexts(item.availableTexts);
                        result.setCurrentText(item.presenceState.text);
                        result.setDiversionNumber(item.phoneNumber);
                        result.setDiversionState(diversionState);
                    }
                    else
                    {
                        result.setAvailableTexts(new schemas_microsoft_com_2003_10_Serialization_Arrays_ArrayOfstring());
                        result.setCurrentText('');
                        result.setDiversionNumber('');
                        result.setDiversionState('DontChange');
                    }

                    return result;

                };

                var present = getPresenceConfigurationItem(result[0]);
                var absent = getPresenceConfigurationItem(result[1]);
                var pause = getPresenceConfigurationItem(result[2]);
                var dnd = getPresenceConfigurationItem(result[3]);
                var offline = getPresenceConfigurationItem(result[4]);

                var successFunction = function (result)
                {
                    if (result.getReturnValue().getCode() !== 0)
                    {
                        showErrorMessage(result.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                    }
                    animationWindow.hide();
                };
                var errorFunction = function ()
                {
                    showErrorMessage(LANGUAGE.getString("errorSetPresenceStateConfiguration"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                };

                SESSION.setPresenceStateConfiguration(present, absent, pause, dnd, offline, result[3].chatActivated, successFunction, errorFunction);
            }
        });

        animationWindow = content;
        animationWindow.show();
    };

    var errorFunction = function ()
    {
        showErrorMessage(LANGUAGE.getString("errorGetPresenceStateConfiguration"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
        console.log("Get presence error");
    };

    SESSION.getPresenceStateConfiguration(successFunction, errorFunction);
}

function createGroupConfigurationDialog(self, target)
{
    Ext.asap(() =>
    {
        new GroupsAndCampaignsDialog().show();
    }, this);
}

function loadjscssfile(filename, filetype) {
    var fileref;
    if (filetype === "js") { //if filename is a external JavaScript file
        var scriptElements = document.getElementsByTagName("script");
        var header_already_added = false;

        for (var i = 0; i < scriptElements.length; i++) {
            if (scriptElements[i].src === filename) {
                header_already_added = true;
            }
        }

        if (header_already_added === false) {
            fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
        }
    }
    else if (filetype === "css") { //if filename is an external CSS file
        fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (isValid(fileref))
    {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function encodeString(str)
{
    var text = Ext.encode(str);
    return text.substring(1, text.length - 1); //ExtJS rahmt den string immer noch in Anführungszeichen - hier nehmen wir die weg
}
/**
 * @param {string} selector
 * @param {boolean=} asDom
 * @param {string=} base
 * @return {Array<Object>}
 */
function getHTMLElements(selector, asDom, base) {
    var escapedSelector = selector.replace('{', '');
    escapedSelector = escapedSelector.replace('}', '');
    var result = Ext.select(escapedSelector, asDom, base);
    if (isValid(result)) {
        return result.elements;
    }
    return [];
}

function showConnectionLostMask(component, message, additionalCls)
{
    if (!isValid(component, "el") || isValid(component.connectionLostMaskEl))
    {
        return;
    }
    component.connectionLostMaskEl = component.el.mask(message || LANGUAGE.getString("noConnectionToServer"));
    
    component.connectionLostMaskEl.addCls('noConnectionWindow');
    if (additionalCls)
    {
        component.connectionLostMaskEl.addCls(additionalCls);
    }
}

function hideConnectionLostMask(component)
{
    if (component.connectionLostMaskEl)
    {
        component.connectionLostMaskEl.destroy();
        component.connectionLostMaskEl = null;
    }
}

function changeUserImage(target, finishCallback)
{
    var uploadImage = function (file, image) { };

    var fileInput = VIEWPORT.add(new Ext.Container({
        margin: '5 0 0 5',
        html: '<input type="file" accept="image/*" id="fileSettingsInput" />',
        listeners:
        {
            afterrender: function () {
                var filePicker = document.getElementById('fileSettingsInput');
                filePicker.click();

                filePicker.onchange = function () {
                    uploadImage(this.files[0]);
                };
            }
        }
    })).hide();

    uploadImage = function (file) {
        var xhr = new XMLHttpRequest();

        var progressBarBox = Ext.create('ProgressDialog',
            {
                target: target,
                labelText: LANGUAGE.getString("fileUpload"),
                onCancel: function () {
                    xhr.aborted = true;
                    xhr.abort();
                }
            });
        progressBarBox.show();

        xhr.open('POST', "/Proxy/UploadMyImage?sessionId=" + SESSION._sessionID);
        xhr.setRequestHeader('X-File-Size', file.size);
        xhr.setRequestHeader('Content-Type', file.type);
        if (file.name.toLowerCase() === "user.gif")
        {
            xhr.setRequestHeader('X-File-Name', file.name); //user.gif schicken wir als Namen mit, damit ein Gif auch animiert sein kann. Ansonsten hatte Uwe Bedenken, falls Sonderzeichen im Dateinamen auftauchen können: Emojis oder son Zeuch
        }

        xhr.upload.onprogress = function (e) {
            var p = Math.round(100 / e.total * e.loaded);
            progressBarBox.updateProgress(p / 100, p + "%");
        };

        xhr.onLoad = function (e) {
            progressBarBox.updateProgress(1, "100%");
        };

        xhr.onreadystatechange = function (response) {
            if (xhr.readyState === 4) {
                progressBarBox.hide();
                if (isValid(finishCallback))
                {
                    finishCallback(response);
                }
                if (xhr.aborted) {
                    return;
                }
                if (xhr.status === 200 && isValidString(xhr.responseText)) {
                    var imageUrl = xhr.responseText;
                    MY_CONTACT.setImageUrl(imageUrl);
                    LOCAL_STORAGE.setItem('LogInPicture', imageUrl);

                    VIEWPORT.remove(fileInput);

                    GLOBAL_EVENT_QUEUE.onGlobalEvent_UploadMyImageFinished(imageUrl);
                }
                else if (xhr.status === 409)
                {
                    showErrorMessage(LANGUAGE.getString("errorUploadAttachmentVirus", file.name), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
                else {
                    showErrorMessage(LANGUAGE.getString("errorUploadMyImage"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                }
            }
        };
        xhr.send(file);
    };
}

function hideChildren(element)
{
    if (!isValid(element))
    {
        return;
    }
    Ext.each(element.childNodes, function (node)
    {
        node.style.display = 'none';
        node.style.animation = 'none';
    });
}

function formateBytes(bytes, decimals)
{
    if (bytes === 0)
    {
        return '0 Byte';
    }
    if (bytes < 0)
    {
        return LANGUAGE.getString('noSize');
    }

    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseInt((bytes / Math.pow(k, i)).toPrecision(dm), 10) + ' ' + sizes[i];
}

function animateDeleteEntry(node, deleteCallback)
{
    if (node)
    {
        var clientHeight = node.clientHeight;
        if (node.dataset)
        {
            node.dataset.originalHeight = clientHeight;
        }
        requestAnimationFrame(function()
        {
            Ext.get(node).animate(
                {
                    from:
                    {
                        opacity: 1
                    },
                    to: {
                        opacity: 0
                    },
                    duration: 150
                }).animate(
                    {
                        to: {
                            height: 0,
                            margin: 0,
                            padding: 0
                        },
                        duration: 150,
                        listeners:
                        {
                            afteranimate: function ()
                            {
                                deleteCallback();
                            }
                        }
                    });
        });
        return clientHeight;
    }
    else
    {
        deleteCallback();
    }
}

function createAvatar(imageName, color, backgroundSize)
{
    var image = imageName;
    if (IMAGE_LIBRARY.containsImage(imageName, 64, color))
    {
        image = IMAGE_LIBRARY.getImage(imageName, 64, color);
    }
    backgroundSize = backgroundSize || "24px 24px";
    var photoSize = PhotoSizes.Default;
    return '<div class="' + CLASS_FOR_SHOWING + '" style="width:' + photoSize.width + 'px;height:' + photoSize.height + 'px;background-position:center;background-repeat:no-repeat;background-size:' + backgroundSize + ';border-radius:100%;box-sizing:content-box;border:1px solid ' + color + ';background-image:url(' + image + ')"></div>';
}

function isLetter(str)
{
    if (!isValidString(str))
    {
        return false;
    }
    return str.length === 1 && str.match(/[a-z]/i);
}

function assignObjectClass(jsonObject, objectClass)
{
    if (Object.setPrototypeOf)
    {
        jsonObject = Object.setPrototypeOf(jsonObject, window[objectClass].prototype);
    }
    else { // IE 10
        var extend = function (source, extension) {
               for (var extensionkey in extension) {
                 source[extensionkey] = extension[extensionkey];
                }
        };

        extend(jsonObject, window[objectClass].prototype);
    }
}

function cloneCaesarProxyObject(caesarProxyObject)
{
    if (!isValid(caesarProxyObject, "typeMarker"))
    {
        console.error("Could not clone object without typeMarker!!", caesarProxyObject);
        return null;
    }
    var clonedObject = new window[caesarProxyObject.typeMarker]();
    Ext.apply(clonedObject, caesarProxyObject);
    return clonedObject;
}

function encodeRFC5987ValueChars(str)
{
    return encodeURIComponent(str).
        // Beachte, dass obwohl RFC3986 "!" reserviert, es nicht kodiert
        // werden muss, weil RFC5987 es nicht reserviert.
        replace(/['()]/g, escape). // i.e., %27 %28 %29
        replace(/\*/g, '%2A').
        // Die folgenden Zeichen müssen nicht nach RFC5987 kodiert werden,
        // daher können wir bessere Lesbarkeit übers Netzwerk sicherstellen:
        // |`^
        replace(/%(?:7C|60|5E)/g, unescape);
}

function createRequestBubble(email, marginLeft, isFlatSearch, cssClass)
{
    if (!email)
    {
        return "";
    }

    var labelAndClass = getStateLabelAndBackgroundClass(email, isFlatSearch);
    var stateLabel = labelAndClass.stateLabel;
    var backgroundClass = labelAndClass.backgroundClass;
    return '<div class="' + cssClass + ' ' + backgroundClass + '" style= "margin-left:' + marginLeft + 'px;border-radius: 10px; color: ' + WHITE + ';" title="' + stateLabel + '"></div>';
}

function getStateLabelAndBackgroundClass(email, isFlatSearch)
{
    if (!email)
    {
        return "";
    }
    // Da momentan die states und typen gemischt sind, kann es vorkommen, dass bei bestimmten Konstellationen die Werte aus dem mailtype geholt werden müssen
    var stateLabel;
    var backgroundClass;
    if (email.type === MailType.NewTicket.value)
    {
        stateLabel = LANGUAGE.getString("newRequest");
        backgroundClass = 'backgroundTdNew';
    }
    else
    {
        stateLabel = emailState[email.originalState].stateLabel || MailType[email.type].stateLabel;
        backgroundClass = emailState[email.originalState].backgroundCls || MailType[email.type].backgroundCls;
    }

    // Falls man in einer E-Mail im Status Fehler ist muss geprüft werden von welchem Typ sie eigentlich ist
    if (backgroundClass === emailState.Error.backgroundCls)
    {
        var stateData = getRealStateForError(email, isFlatSearch);
        backgroundClass = stateData[1];
        stateLabel = stateData[0];
    }
    return {
        stateLabel: stateLabel,
        backgroundClass: backgroundClass
    };
}

function getRealStateForError(email, isFlatSearch)
{
    var stateLabel = emailState.Assigned.stateLabel;
    var backgroundCls = emailState.Assigned.backgroundCls;

    if (isFlatSearch || !email.isRequest)
    {
        if (MailType[email.type] && MailType[email.type].stateLabel && MailType[email.type].backgroundCls)
        {
            return [MailType[email.type].stateLabel, MailType[email.type].backgroundCls];
        }
        else
        {
            return [emailState[email.originalState].stateLabel, emailState[email.originalState].backgroundCls];
        }

    }

    return [stateLabel, backgroundCls];
}


function downloadURI(uri, suggestedFileName)
{
    if (!isValidString(uri))
    {
        return;
    }
    var link = document.createElement("a");
    link.download = suggestedFileName;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
}

function preventBrowserContextmenuExceptForInputs()
{
    document.oncontextmenu = function (event)
    {
        if (event.target.nodeName !== "INPUT" && event.target.nodeName !== "TEXTAREA")
        {
            return false;
        }
    };
}

function isElementTooSmall(element)
{
    var result = false;
    var overflow = element.style.overflow;
    element.style.overflow = 'visible';
    if (element.clientWidth < element.scrollWidth)
    {
        result = true;
    }
    element.style.overflow = overflow;

    return result;
}

function trimChar(string, charToRemove)
{
    while (string.charAt(0) === charToRemove)
    {
        string = string.substring(1);
    }

    while (string.charAt(string.length - 1) === charToRemove)
    {
        string = string.substring(0, string.length - 1);
    }

    return string;
}

function replaceNewLinesWithBRTag(str)
{
    return str.replace(new RegExp('\n', 'g'), '<br/>');
}

function escapeNewLinesForMailto(str)
{
    return str.replace(new RegExp('\n', 'g'), '%0D%0A');
}



function equalsIgnoringCase(a, b)
{
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
}

function getInnerContainer(container)
{
    if (isValid(container, "el.dom.childNodes") && container.el.dom.childNodes.length > 0)
    {
        var innerCt = Ext.get(container.el.dom.childNodes[0]);
        return innerCt;
    }
    return null;
}

function isStateOk(extJsObject)
{
    return extJsObject.rendered && !extJsObject.destroyed && !extJsObject.el.destroyed;
}


function getHtmlCodeForDownloadLink(text, url, margin)
{
    text = text || '';
    url = url || '';
    margin = margin || '0';
    return '<a target="_blank" style="text-decoration:none;margin:' + margin + ';color:' + COLOR_MAIN_2 + ';cursor:pointer" href="' + url + '">' + text + '</a>';
}

function isElementVisibleInParent(el, holder)
{
    holder = holder || document.body;
    const { top, bottom, height } = el.getBoundingClientRect();
    const holderRect = holder.getBoundingClientRect();

    return top >= holderRect.top && bottom <= holderRect.bottom;
}

function isElementPartiallyVisibleInParent(el, holder)
{
    holder = holder || document.body;
    const { top, bottom, height } = el.getBoundingClientRect();
    const holderRect = holder.getBoundingClientRect();

    return top <= holderRect.top
        ? holderRect.top - top <= height
        : bottom - holderRect.bottom <= height;
}