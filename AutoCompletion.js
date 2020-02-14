//
// ---------------------------------------------------------
// Copyright(C) CASERIS GmbH. All rights reserved.
// ---------------------------------------------------------
//
// This file contains the required functions for autocompletion
//
// Author: PQ
//

/*
de.search_for = "Suchen nach %1";
de.dial = "%1 wählen...";
*/

function saveToDialHistory(response, number, contact)
{
    saveToHistory(response, number, contact, KEY_DIAL_HISTORY);
}

function saveToTransferHistory(response, number, contact)
{
    saveToHistory(response, number, contact, KEY_TRANSFER_HISTORY);
}

function saveToCallDiversionHistory(response, number, contact)
{
    saveToHistory(response, number, contact, KEY_CALL_DIVERSION_HISTORY);
}

function saveToPartnerHistory(response, number, contact)
{
    saveToHistory(response, number, contact, KEY_SEARCH_PARTNER_HISTORY);
}

function saveToColleaguesHistory(response, number, contact)
{
    saveToHistory(response, number, contact, KEY_SEARCH_COLLEAGUES_HISTORY);
}

function saveToHistory(response, number, contact, key)
{
    if (response && response.getReturnValue().getCode() !== 0)
    {
        return;
    }

    var history = new History("AUTO_COMPLETION", key);
    history.addNumberAndContact(number, contact);
}

class History
{
    constructor(clientSettingsNamespace, clientSettingsKey)
    {
        this.appName = clientSettingsNamespace;
        this.fieldName = clientSettingsKey;
        
        this.load();
    }

    load() 
    {
        this.items = [];

        var autoCompletionSettings = CLIENT_SETTINGS.getSetting(this.appName, this.fieldName);
        if (autoCompletionSettings && autoCompletionSettings.length > 0)
        {
            try
            {
                this.items = JSON.parse(autoCompletionSettings);
            }
            catch (exception)
            {
                console.log(exception);
            }
        }
    }

    save(list)
    {
        CLIENT_SETTINGS.addSetting(this.appName, this.fieldName, list);
        CLIENT_SETTINGS.saveSettings();
    }

    addNumberAndContact(number, contact)
    {
        var name = '';
        if (contact)
        {
            name = contact.getFullName(false);
        }
        this.add(name, number);
    }

    add(name, number)
    {
        //check if entry  already exists in the list
        var entryFound = this.items.find(function (element) 
        {
            var sameNumber = new TelephoneNumber(number).equals(element.number);
            var sameName = name && name.length > 0 && element.name === name;
            return sameNumber || sameName;
        });

        //don't save because item already in the list
        if (entryFound)
        {
            return;
        }
        // first save in memory
        this.items.push(
            {
                name: name || '',
                number: number || ''
            });

        // then save on server
        var itemList = JSON.stringify(this.items);
        this.save(itemList);
    }

    getItems()
    {
        this.load();
        return this.items;
    }

    reset() 
    {
        this.items = [];

        this.save("");
    }
}

class AutoCompletion {
    constructor(inputField, appName, fieldName, actionLine = true, actionFunc, textDial = "Suchen nach %1", textSearch = "%1 wählen...", onButtonClickedDial) {
        this.inputField = inputField;
        this.inputValue = "";
        this.ul = undefined;
        this.currentFocus = 0;
        this.actionLine = actionLine;
        this.actionFunc = actionFunc;
        this.filter = "";
        this.textDial = textDial;
        this.textSearch = textSearch;
        this.onButtonClickedDial = onButtonClickedDial;

        this.searchIcon = "images/search.png";
        this.dialIcon = "images/dial.png";

        this.maxLength = 10;

        // execute a function when someone clicks in the document:
        document.addEventListener("click", function (e) 
        {
            AutoCompletion.closeAllAutoCompletionList(e.target);
        });

        this.history = new History(appName, fieldName);
    }

    setMaxLength(length)
    {
        this.maxLength = length;
    }

    setIconForSearch(iconUrl)
    {
        this.searchIcon = iconUrl;
    }

    setIconForDial(iconUrl)
    {
        this.dialIcon = iconUrl;
    }

    load() 
    {
        this.history.load();
    }

    save(list)
    {
        this.history.save(list);
    }

    // execute a function presses a key on the keyboard:
    keyHandler(e) 
    {
        if (this.inputField.value === "")
        {
            return;
        }

        if (e.keyCode === 40) //down
        {
            this.changeCurrentSelectedItem(1);
        }
        else if (e.keyCode === 38) //up
        {
            this.changeCurrentSelectedItem(-1);
        }
        else if (e.keyCode === 13) //enter
        {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            
            if (this.currentFocus > -1)
            {
                /*and simulate a click on the "active" item if available or display the auto completion list*/
                var currentItem = this.getCurrentItem();
                if (currentItem)
                {
                    currentItem.click();
                }
                else
                {
                    this.display();
                }
            }
        }
        else if (e.keyCode === 27) //esc
        {
            AutoCompletion.closeAllAutoCompletionList();
        }
    }

    changeCurrentSelectedItem(positionChangeFactor)
    {
        this.currentFocus = this.currentFocus + positionChangeFactor;

        /*and and make the current item more visible:*/
        this.addActive();
        /*show the phone number of the selected entry in the input field*/
        this.showNumber();		
    }

    addActive() 
    {
        var listItems = this.getListItems();
        /*a function to classify an item as "active":*/
        if (!listItems) return false;
        /*start by removing the "active" class on all items:*/
        this.removeActive(listItems);

        if (this.currentFocus >= listItems.length)
        {
            this.currentFocus = 0;
        }
        if (this.currentFocus < 0)
        {
            this.currentFocus = listItems.length - 1;
        }
        /*add class "autocomplete-active":*/
        var currentItem = listItems[this.currentFocus];
        currentItem.classList.add("autoCompletionActive");
    }

    getListItems()
    {
        if (!this.ul || this.ul.style.display === 'none')
        {
            return null;
        }
        return this.ul.getElementsByTagName("li");
    }

    getCurrentItem()
    {
        var listItems = this.getListItems();
        if (!listItems)
        {
            return null;
        }
        return listItems[this.currentFocus];
    }

    removeActive(listItems) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < listItems.length; i++) {
            listItems[i].classList.remove("autoCompletionActive");
        }
    }

    add(name, number) {

        this.history.add(name, number);
    }

    reset() 
    {
        this.history.reset();
    }

    display() {

        AutoCompletion.closeAllAutoCompletionList();

        if (!this.inputField.value)
        {
            return;
        }
            
        // create a ul element that will contain the items (values):		
        this.ul = document.createElement("ul");
        this.ul.setAttribute("class", "autoCompletionList");
        this.ul.style.top = this.inputField.clientHeight + "px";
        this.ul.style.display = "none";
        // this.inputField.parentNode.appendChild(this.ul);	
        this.inputField.parentNode.insertBefore(this.ul, this.inputField.nextSibling);		

        // clear the auto completion list
        while (this.ul.firstChild) {
            this.ul.removeChild(this.ul.firstChild);
        }	

        if (this.actionLine) {
            // create a record to start phone number lookup or dialing
            var li = document.createElement('li');
            li.onclick = () => { this.onButtonClickedDial(); };
            this.ul.appendChild(li);

            // check for phone number to dial or search string
            if (this.phoneNumberCheck(this.inputField.value))
            {
                this.fillListItem(li, this.textDial, this.dialIcon);
            }
            else 
            {
                this.fillListItem(li, this.textSearch, this.searchIcon);
            }
        }

        // save input value
        this.inputValue = this.inputField.value;

        // populate the list
        this.filter = this.inputField.value.toUpperCase();

        // suppress leading zeros
        this.filter = this.filter.replace(/^0+/g, '');

        // display only the first 10 hits
        var items = this.history.getItems();
        var maxLen = Math.min(this.maxLength, items.length);
        var len = 0;
        for (var index = 0; index < items.length; ++index) 
        {
            if (this.filter === '*')
            {
                continue;
            }
            var name = items[index].name || '';
            var number = items[index].number || '';
            if (this.phoneNumberCheck(this.filter))
            {
                if (!new TelephoneNumber(number).contains(this.filter))
                {
                    continue;
                }
            }
            else
            {
                if (name.toUpperCase().indexOf(this.filter) === -1)
                {
                    continue;
                }
            }
            

            // end iteration if max list length has been reached
            if (++len > maxLen)
            {
                break;
            }

            // remove leading zeros
            var stringToBold = this.inputField.value.replace(/^0+/g, '');

            // first create a list element
            li = document.createElement('li');
            li.title = number;
            li.dataset.number = number;
            li.dataset.name = name;

            if (name !== "")
            {
                li.innerHTML = this.makeBold(name + " " + number, stringToBold);
            }
            else
            {
                li.innerHTML = this.makeBold(number, stringToBold);
            }
            // the input field is reset only if an action line has been configured
            // otherwise only the auto completion list will be closed
            var self = this;
            li.onclick = function()
            {
                if (self.actionLine)
                {
                    self.actionFunc(this.dataset.number);
                    self.inputField.value = '';
                }
                else
                {
                    self.inputField.value = number;
                }
            };			
            li.className = "autoCompletionLine";
                        
            this.ul.appendChild(li);	
        }

        if (this.filter.length > 0)
        {
            this.ul.style.display = "block";
        }
        else
        {
            this.ul.style.display = "none";
        }

        this.currentFocus = 0;
    }

    fillListItem(listItem, text, icon)
    {
        var regExp = /\{0\}|\%1/gi; //findet {0} oder %1
        listItem.innerHTML = text.replace(regExp, "<b>" + this.inputField.value + "</b>");
        listItem.className = "autoCompletionActionLine autoCompletionActive";
        listItem.style.backgroundImage = "url(" + icon + ")";
        listItem.title = this.inputField.value;
    }
    
    hide() 
    {
        this.ul.style.display = "none";
    }

    setTextSearch(value)
    {
        if (isValid(value))
        {
            this.textSearch = value;
        }
    }

    setTextDial(value)
    {
        if (isValid(value))
        {
            this.textDial = value;
        }
    }
  
    makeBold(input, wordToBold) {			

        if (!wordToBold || wordToBold === '*')
        {
            return wordToBold;
        }
        
        if (this.phoneNumberCheck(wordToBold))
        {
            wordToBold = new TelephoneNumber(wordToBold).toString();
        }

        if (wordToBold[0] === "+")
        {
            wordToBold = "\\" + wordToBold;
        }

        return input.replace(new RegExp(wordToBold, "ig"), "<b>$&</b>");
    }  

    static closeAllAutoCompletionList(element) 
    {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var list = document.getElementsByClassName("autoCompletionList");		
        for (var i = list.length - 1; i >= 0; i--) 
        {			
            if (element !== list[i]) 
            {
                list[i].parentNode.removeChild(list[i]);
            }
        }
    }

    phoneNumberCheck(phoneNumber)
    {
        return isPhoneNumber(phoneNumber);
    }

    showNumber() 
    {
        this.inputField.value = this.inputValue;

        var currentItem = this.getCurrentItem();
        if (currentItem)
        {
            if (isValidString(currentItem.dataset.number))
            {
                this.inputField.value = currentItem.dataset.number;
            }
            else if (isValidString(currentItem.dataset.name))
            {
                this.inputField.value = currentItem.dataset.name;
            }
        }

        this.setCursorAtEnd();
    }

    setCursorAtEnd()
    {
        setTimeout(() =>
        {
            this.inputField.selectionStart = this.inputField.selectionEnd = this.inputField.value.length;
        }, 0);
    }
}

class AutoCompletionForSalesforce extends AutoCompletion
{
    phoneNumberCheck(phoneNumber)
    {
        return /^(\(?\+? [0 - 9] *\)?)?[0 -9_\- \(\)]*$/.test(phoneNumber);
    }

    reset()
    {
        super.reset();
        showSnackbar(getLanguageString("auto_completion_reset", user_language), "info");
    }
}