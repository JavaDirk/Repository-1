/*
 * ThinImage
 * src (mustOverride): src of the image -> Must be set by user
 * style (handsOff): style for the image
 * iconName (handsOff): Internal name of the icon -> Automatically set by this class
 * normalColor (canOverride): color in which the image will be colored (normal align)
 * hoverColor (canOverride): color in which the image will be colored (hover align)
 * afterRenderEvent (handsOff): function which includes needed actions for this event
 * mouseOverEvent (handsOff): function which includes needed actions for this event
 * mouseOutEvent (handsOff): function which includes needed actions for this event
 * colorize (canOverride): should image be colored in the normal/hover color
 */
Ext.define('ThinImage', {
   extend: 'Ext.Img',
    src: '',
    allSrc: [],
    srcIndex: 0,
    style: "cursor: pointer",
    iconName: "",
    colorize: true,
    alpha: 1,
    normalColor: NEW_GREY,
    hoverColor: DARK_NEW_GREY,
    useUiFunctions: false,
    afterSourceChanged: function () {
    },
    imageClickedEvent: function () {
        if (this.srcIndex + 1 >= this.allSrc.length) {
            this.src = this.allSrc[0];
            new uiFunctions(this, false);
            this.srcIndex = 0;
        } else if (this.allSrc.length > 1) {
            this.src = this.allSrc[this.srcIndex + 1];
            var uifunctions = new uiFunctions(this, false);
            this.srcIndex += 1;
        }
    },
    getSrcNameIndex: function (imageSrc) {
        var name = imageSrc.split('/');
        return name[name.length - 1];
    },
    afterRenderEvent: function (event)
    {
        if (this.src && this.colorize)
        {
            this.iconName = ("" + this.getSrcNameIndex(this.src)).split('.')[0];
            var sizeHeight = this.height;
            var sizeWidth = this.width;

            if (!sizeHeight || !sizeWidth) {
                sizeHeight = this.getHeight();
                sizeWidth = this.getWidth();
            }

            var icon = LOCAL_STORAGE.getItem('image_' + this.iconName + '_' + this.normalColor.r + ',' + this.normalColor.g + ',' + this.normalColor.b + '_' + sizeHeight + sizeWidth);

            if (!icon && !this.useUiFunctions)
            {
                //icon = IMAGE_LIBRARY.getImage(this.iconName, sizeHeight, WHITE);
                icon = IMAGE_LIBRARY.getImage(this.iconName, sizeHeight, this.normalColor);
            }

            if (icon) {
                this.setSrc(icon);
            } else if (this.useUiFunctions) {
                new uiFunctions(this, false);
                return;
            }
        }

        if (this.colorize === true && this.useUiFunctions)
        {
            var uifunctions = new uiFunctions(this, false);
        } else {
            this.setSrc(this.src);
        }
    },
    mouseOverEvent: function (event)
    {
        return;
    },
    mouseOutEvent: function (event)
    {
        return;
    },
    setImageSrc: function (src, colorize) {
        if (colorize !== undefined) {
            this.colorize = colorize;
        }

        if (src && src !== '') {
            this.src = src;

            this.afterRenderEvent(this);

        } else if (src === '') {
            this.setSrc(src);
        }
    },
    setColorize: function (colorize) {
        this.colorize = colorize;

        if (colorize === true) {
            this.afterRenderEvent(this);
        }
    },
    listeners: {
        afterrender:
        {
            fn: function (event)
            {
                event.afterRenderEvent();
            }
        },
        el:
        {
            mouseover: function (event, val) {
                var thinimage = Ext.getCmp(event.currentTarget.id);
                thinimage.mouseOverEvent(event);
            }, mouseout: function (event, val) {
                var thinimage = Ext.getCmp(event.currentTarget.id);
                thinimage.mouseOutEvent(event);
            }, click: function (event, val) {
                var thinimage = Ext.getCmp(event.currentTarget.id);
                if (thinimage.allSrc.length > 0) {
                    thinimage.imageClickedEvent(event);
                }
            }
        }
    },
    rotateImage: function (degree) {
        // Set the transform property -> SetStyle does not work directly
        this.style.transform = 'rotate(' + degree + 'deg)';
        // Set the new style object as new style
        this.setStyle(this.style);
    },
    initComponent: function ()
    {
        if (Ext.isArray(this.src))
        {
            this.allSrc = this.src;
            this.src = this.allSrc[0];
        }

        if (!this.alpha) {
            this.alpha = 1;
        }

        this.callParent();
    },
    destroy: function ()
    {
        /*var id = this.getId();
        Ext.util.CSS.removeStyleSheet(this.getId() + '_rule');
        Ext.util.CSS.removeStyleSheet(this.getId() + '_span_rule');*/
        this.callParent();
    }
});