/**
 * Created by jebing on 21.01.2015.
 */
Ext.define('Label',
{
    extend: 'Ext.Component',
    fontSize: FONT_SIZE_SUBTITLE,
    lineHeight: 0,
    color: COLOR_MAIN_2,
    text: '',
    weight: '400',
    textAlign: 'left',
    cursor: 'default',
    wordWrap: 'break-word',
    backgroundColor: 'transparent',
    fontFamily: FONT_FAMILY,
    borderRadius: 0,
    whiteSpace: 'nowrap',
    border: 'none',

    initComponent: function ()
    {
        this.callParent();
        this.refresh();
        var self = this;
        if (isValidString(this.tooltip))
        {
            var tip;
            this.on('afterrender', function () 
            {
                tip = Ext.create('Ext.tip.ToolTip',
                {
                    target: self.getEl(),
                    html: self.tooltip,
                    showDelay: 1000,
                    hideDelay: 0,
                    autoHide: true
                });
            });
            this.on('destroy', function ()
            {
                if (tip)
                {
                    tip.destroy();
                }
            });
        }
    },

    refresh : function ()
    {
        var lineHeight = this.lineHeight !== 0 ? 'line-height:' + this.lineHeight + 'px;' : 'line-height:normal;';
        this.setHtml('<div class="innerLabel eclipsedText" style="flex:1;border:' + this.border + ';padding:' + this.Padding + ';border-radius:' + this.borderRadius + ';font-family:' + this.fontFamily + ';background-color:' + this.backgroundColor + ';word-wrap:' + this.wordWrap + ';cursor:' + this.cursor + ';text-align:' + this.textAlign + ';font-weight:' + this.weight + ';font-size:' + this.fontSize + 'px;' + lineHeight + ';color:' + this.color + ';white-space:' + this.whiteSpace + '">' + this.text + '</div>');
    },

    setBorder: function (border) {
        this.border = border;
        this.refresh();
    },

    setText: function (text)
    {
        this.text = text;
        
        var div = this.getInnerLabel();
        if (isValid(div))
        {
            div.innerText = text;
        }
    },

    setHTMLText: function (text) {
        this.text = text;
        
        var div = this.getInnerLabel();
        if (isValid(div))
        {
            div.innerHTML = text;
        }
    },

    getInnerLabel: function ()
    {
        var divs = getHTMLElements('#' + this.id + ' .innerLabel');
        if (isValid(divs) && divs.length > 0)
        {
            return divs[0];
        }
        return null;
    },

    setBackgroundColor: function (color) {
        this.backgroundColor = color;
        this.refresh();
    },

    setWordWrap: function (wordWrap) {
        this.wordWrap = wordWrap;
        this.refresh();
    },

    setFontSize: function (sizeInPixel)
    {
        this.fontSize = sizeInPixel;
        this.refresh();
    },

    setLineHeight: function (sizeInPixel)
    {
        this.lineHeight = sizeInPixel;
        this.refresh();
    },

    setColor: function (color)
    {
        this.color = color;
        this.refresh();
    },

    setFontWeight: function (weight)
    {
        this.weight = weight;
        this.refresh();
    },

    setTextAlign: function (textAlign)
    {
        this.textAlign = textAlign;
        this.refresh();
    },

    setCursor: function (cursor)
    {
        this.cursor = cursor;
        this.refresh();
    },

    setBorderRadius: function (borderRadius)
    {
        this.borderRadius = borderRadius;
        this.refresh();
    },

    setWhiteSpace: function (whiteSpace)
    {
        this.whiteSpace = whiteSpace;
        this.refresh();
    }
});


/*
Ext.define('TextLabel',
{
    extend: 'Ext.form.Label',
    style: 'font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_TEXT,
});

Ext.define('TitleLabel',
{
    extend: 'Ext.form.Label',
    style: 'normal;font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_TITLE,
});

Ext.define('SubtitleLabel',
{
    extend: 'Ext.form.Label',
    style: 'font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + COLOR_SUBTITLE,
});

Ext.define('NameLabel',
{
    extend: 'Ext.form.Label',
    style: 'font-size:' + FONT_SIZE_NAME + 'px;color:' + COLOR_NAME,
});*/