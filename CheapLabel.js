//Cheap in der Hinsicht, dass in der setText-Methode das updateLayout auskommentiert wurde. Dies braucht man in der Regel nicht, 
//z.B. wenn das Label ne feste Breite hat

Ext.define('CheapLabel',
{
    extend: 'Ext.form.Label',

    setText: function (text, encode) {
        var me = this;
        encode = encode !== false;
        if (encode) {
            me.text = text;
            delete me.html;
        } else {
            me.html = text;
            delete me.text;
        }
        if (me.rendered) {
            me.el.dom.innerHTML = encode !== false ? Ext.util.Format.htmlEncode(text) : text;
            //me.updateLayout();
        }
        return me;
    }
});