Ext.define('SessionStorage', {
    setItem: function (key, value) {
        sessionStorage.setItem(document.title + '_' + key, value);
    },
    removeItem: function (key) {
        sessionStorage.removeItem(document.title + '_' + key);
    },
    getItem: function (key) {
        return sessionStorage.getItem(document.title + '_' + key);
    },
    clear: function () {
        sessionStorage.clear();
    }
});

var SESSION_STORAGE = Ext.create('SessionStorage', {});