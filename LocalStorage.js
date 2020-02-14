Ext.define('LocalStorage', {
    getTitle: function ()
    {
        var title = this.title || document.title;

        if (document.title.indexOf(' ') >= 0)
        {
            title = title.split(' ');
            var endTitle = '';

            for (var i = 0; i < title.length; i++) {
                endTitle += title[i];
            }

            title = endTitle;
        }
        
        return title;
    },
    setItem: function (key, value)
    {
        localStorage.setItem(this.getTitle() + '_' + key, value);
    },
    removeItem: function (key) {
        localStorage.removeItem(this.getTitle() + '_' + key);
    },
    getItem: function (key) {
        return localStorage.getItem(this.getTitle() + '_' + key);
    },
    clear: function () {
        localStorage.clear();
    },

    getKeysWithPrefix: function (prefix)
    {
        var result = [];
        var key = this.getTitle() + '_' + prefix;
        for (var i = 0, len = localStorage.length; i < len; ++i)
        {
            var key = localStorage.key(i);
            if (key && key.indexOf(key) === 0)
            {
                result.push(key.replace(this.getTitle() + '_', ""));
            }
        }
        return result;
    }
});

var LOCAL_STORAGE = new LocalStorage();