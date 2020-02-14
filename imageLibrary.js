/**
 * Created by martens on 13.05.2015.
 */
Ext.define('ImageLibrary', {
    images: [],
    finishedImages: {},
    index: 0,
    viewport: {},
    curImage: {},
    splitIndex: -1,
    logRenderedImages: false,
    afterRenderImages: function () {},
    addImage: function (name, size, color, imageData) {
        if (!this.containsImage(name, size, color)) {
            this.finishedImages[name + '_' + size + '_' + color] = imageData;

            if (this.logRenderedImages)
            {
                var prop = name + '_' + size + '_' + color;
                console.log('"' + prop + '"' + ':' + '"' + imageData + '"' + ',');
            }
        }
    },
    addToLibrary: function (key, value)
    {
        key = key.replace(' ', '_');
        this.finishedImages[key] = value;
    },
    buildImageName: function (name) {
        name = name.split('/');
        name = name[name.length - 1];
        name = name.split('.')[0];
        return name;
    },
    getImage: function (name, size, color, checkContain) {
        if (!isValid(color)) {
            //return '';
        }

        var rgbColor = color.r + ',' + color.g + ',' + color.b;
        color = color.toString();
        var title = document.title.replace(' ', '_');
        var oldName = title + '_image_' + name + '_' + rgbColor + '_' + size + size; 
        name = name + '_' + size + '_' + color;
        
        if (this.finishedImages[name] || checkContain) {
            return this.finishedImages[name];
        } else
        {
            if (this.finishedImages[oldName]) {
                return this.finishedImages[oldName];
            }

            if (this.finishedImages.length === 0)
            {
                console.log("Image library ist noch nicht fertig geladen. Das Bild " + name + ' konnte nicht geladen werden');
                return name + 'NotInImageLibrary.png';
            }

            console.log('Die Datei ' + name + ' befindet sich nicht in der Image Library');
            return name + 'NotInImageLibrary.png';
        }
    },
    getProperty: function (prop) {
        if (Ext.isArray(prop)) {
            return prop[0];
        } else {
            return prop;
        }
    },
    setProperty: function (prop) {
        if (prop.length > 1) {
            if (prop.length > 2) {
                var curProp = prop[0];
                var result = Ext.Array.remove(prop, prop[0]);
                return result;
            } else {
                return prop[1];
            }
        } else {
            return prop[0];
        }
    },
    checkImageProperties: function (imageData, src) {
        var self = this;
        self.addImage(self.buildImageName(imageData.src), imageData.scale, imageData.color.toString(), src);

        if (this.curImage.src) {
            this.createImage();
        } else {
            if (this.index < this.images.length - 1) {
                this.index += 1;
                this.curImage = Ext.clone(this.images[this.index]);

                setTimeout(function ()
                {
                    self.createImage();
                }, 0);
            } else
            {
                setTimeout(function ()
                {
                    self.imageContainer.removeAll();
                    self.viewport.remove(self.imageContainer);
                }, 1500);

                self.afterRenderImages();
            }
        }
    },
    containsImage: function (name, size, color) {
      return !!this.getImage(name, size, color, true);
    },

    createImage: function () {

        var self = this;

        var imageData = {
            src: this.getProperty(this.curImage.src),
            scale: this.getProperty(this.curImage.scale),
            color: this.getProperty(this.curImage.color),
            alpha: this.curImage.alpha
        };

        if (!Ext.isArray(this.curImage.color) && !Ext.isArray(this.curImage.scale) && Ext.isArray(this.curImage.src)) {
            this.curImage.src = self.setProperty(this.curImage.src);
            this.curImage.scale = Ext.clone(self.images[self.index].scale);
            this.curImage.color = Ext.clone(self.images[self.index].color);
        } else if (!Ext.isArray(this.curImage.color) && Ext.isArray(this.curImage.scale)) {
            this.curImage.scale = self.setProperty(this.curImage.scale);
            this.curImage.color = Ext.clone(self.images[self.index].color);
        } else if (Ext.isArray(this.curImage.color)) {
            this.curImage.color = this.setProperty(this.curImage.color);
        } else {
            this.curImage.src = undefined;
        }

        var test = 'image_' + this.buildImageName(imageData.src) + "_" + imageData.color + '_' + imageData.scale + imageData.scale;
        var icon = localStorage.getItem('image_' + this.buildImageName(imageData.src) + "_" + imageData.color.r + ',' + imageData.color.g + ',' + imageData.color.b + '_' + imageData.scale + imageData.scale);

        if (!icon)
        {
            test = 'image_' + this.buildImageName(imageData.src) + '_' + imageData.scale + "_" + imageData.color;
            icon = localStorage.getItem(this.buildImageName(imageData.src) + '_' + imageData.scale + "_" + imageData.color);

            if (!icon)
            {
                icon = LOCAL_STORAGE.getItem(this.buildImageName(imageData.src) + '_' + imageData.scale + "_" + imageData.color);
            }
        }

        if (!icon) {

            CANVAS_TAG.update('<canvas id="canvas" height="' + imageData.scale + 'px" width="' + imageData.scale + 'px"></canvas>');

            this.imageContainer.add(new ThinImage({
                src: imageData.src,
                normalColor: imageData.color,
                height: imageData.scale,
                width: imageData.scale,
                alpha: imageData.alpha,
                useUiFunctions: true,
                hidden: true,
                afterSourceChanged: function (event)
                {
                    self.checkImageProperties(imageData, event.src);
                },
                alt: "icon"
            }));
        } else {
            this.checkImageProperties(imageData, icon);
        }


    },

    startRendering: function (viewport)
    {
        this.viewport = viewport;
        try
        {
            var curUrl = new URL(window.location.href);

            // Falls neue Bilder einzufügen sind den Parameter 'renderimages' in der url angeben und auf true setzen
            this.logRenderedImages = curUrl.searchParams.get('renderimages');

            if (this.logRenderedImages === 'true')
            {
                this.logRenderedImages = true;
            }
            else if (this.logRenderedImages === 'false' || !this.logRenderedImages)
            {
                this.logRenderedImages = false;
            }
        }
        catch (e)
        {
            console.log(e);
        }

        if (this.logRenderedImages)
        {
            localStorage.clear();
            //Nur im Firefox ausführen! Die in die console ausgegebenen Pfade werden von Chrome verhunzt!
            CANVAS_TAG = this.viewport.add(Ext.create('Ext.Component', {
                html: '<canvas id="canvas" height="25" width="25"></canvas>',
                style: 'display:none'
            }));

            this.imageContainer = this.viewport.add(new Ext.Container({
                layout: {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                }
            }));

            this.curImage = Ext.clone(this.images[0]);
            this.createImage();
        }
        else
        {
            this.afterRenderImages();
        }
    },

    constructor: function () {
        var self = this;
    }
});

var IMAGE_LIBRARY = new ImageLibrary();