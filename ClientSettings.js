var CLIENT_SETTINGS = {
    settings: {},
    dirty: false,

    addSetting: function (namespace, key, value) {
        if (!this.settings[namespace]) {
            this.settings[namespace] = {};
        }

        if (key) {
            var oldValue = this.settings[namespace][key];
            if (oldValue === value)
            {
                return;
            }
            this.settings[namespace][key] = value;
            this.dirty = true;
        }

    },
    removeSetting: function (namespace, key) {
        if (this.checkPropertyExist(namespace, key)) {
            delete this.settings[namespace][key];
        }
    },
    getSetting: function (namespace, key) {
        if (this.checkPropertyExist(namespace, key)) {
            return this.settings[namespace][key];
        }
        else {
            return undefined;
        }
    },
    saveSettings: function () {
        if (!this.dirty)
        {
            return;
        }

        var self = this;
        var doneFunction = function ()
        {
            self.dirty = false;
        };

        var failFunction = function () {
            
        };

        SESSION.saveSettings(JSON.stringify(this.settings), doneFunction, failFunction);
    },

    checkPropertyExist: function (namespace, key) 
    {
        if (!isValid(this.settings[namespace])) 
        {
            return false;
        }

        if (!isValid(this.settings[namespace][key])) 
        {
            return false;
        }

        return true;
    },

    loadSettings: function ()
    {
        var self = this;

        var doneFunction = function (settings)
        {
            try
            {
                self.settings = JSON.parse(settings.getSettings());

                if (!self.settings)
                {
                    self.settings = {};
                }
            }
            catch (exception)
            {
                console.log(exception);
            }
        };

        var failFunction = function (settings) {
            self.settings = {};
            console.log("Fehler beim Laden der Einstellungen");
        };

        SESSION.loadSettings(doneFunction, failFunction);
    },

    getKeysWithPrefix: function (namespace, prefix)
    {
        var result = [];
        if (!this.settings[namespace])
        {
            console.log("Der Namespace " + namespace + " befindet sich nicht in den settings");
            return false;
        }
        var namespaceSettings = this.settings[namespace];
        Ext.iterate(namespaceSettings, function (key, value)
        {
            if (key.indexOf(prefix) === 0)
            {
                result.push(key);
            }
        });
            
        return result;
    },

    afterLoadSettings: function ()
    {

    },

    onLogin: function (response, relogin)
    {
        if (isValidString(response.getSettings()))
        {
            try
            {
                this.settings = JSON.parse(response.getSettings());
            }
            catch (exception)
            {
                console.log(exception);
            }
        }
        else
        {
            this.settings = {};
        }
    }
};