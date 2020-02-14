/**
 * Created by martens on 27.01.2015.
 */
Ext.define('uiFunctions', {
    parentContainer: {},
    canvasPanel: {},
    iconHolder: {},
    src: "",
    // iconSrc -> The source of the needed icon
    // iconHolder -> The iconHolder (e.g.: Button, Image) which needs the icons
    constructor: function (iconHolder, isHover) {
        this.parentContainer = Ext.ComponentQuery.query('viewport')[0];//this.getHighestParent(iconHolder);
        this.canvasPanel = this.getCanvasPanel();
        this.iconHolder = iconHolder;
        if (this.iconHolder.xtype === "button" || this.iconHolder.xtype === "splitbutton") {
            this.src = this.iconHolder.icon;
        } else if (this.iconHolder.xtype === "image") {
            this.src = this.iconHolder.src;
        }

        this.getIcons(isHover);
    },
    refillPicture: function (color) {
        var img = new Image();
        var uifunctions = this;
        img.onload = function (e)
        {
            var scaleHeight = 0;
            var scaleWidth = 0;
            if (uifunctions.iconHolder.xtype === "button" || uifunctions.iconHolder.xtype === "splitbutton") {
                scaleHeight = uifunctions.getIconScale(uifunctions.iconHolder);
                scaleWidth = uifunctions.getIconScale(uifunctions.iconHolder);
            } else {
                scaleHeight = uifunctions.iconHolder.height;
                scaleWidth = uifunctions.iconHolder.width;

                if (!scaleHeight || !scaleWidth) {
                    scaleHeight = img.height;
                    scaleWidth = img.width;
                }
            }

            if (img.src.indexOf('data:') === -1)
            {
                uifunctions.refreshCanvas(scaleHeight, scaleWidth, uifunctions.canvasPanel);
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                var picLength = scaleWidth * scaleWidth;
                ctx.drawImage(img, 0, 0, scaleWidth, scaleHeight);
                img = ctx.getImageData(0, 0, scaleWidth, scaleHeight);
                // Loop through data.
                for (var i = 0; i < picLength * 4; i += 4)
                {
                    // First bytes are red bytes
                    img.data[i] = color.r;
                    // Second bytes are green bytes.
                    img.data[i + 1] = color.g;
                    // Third bytes are blue bytes.
                    img.data[i + 2] = color.b;
                    // Fourth bytes are alpha bytes

                    if (uifunctions.iconHolder.alpha < 1 && img.data[i + 3] > 0)
                    {
                        img.data[i + 3] = uifunctions.iconHolder.alpha * 100;
                    }
                }

                ctx.putImageData(img, 0, 0);

                LOCAL_STORAGE.setItem('image_' + uifunctions.iconHolder.iconName + "_" + color.r + ',' + color.g + ',' + color.b + '_' + scaleHeight + scaleWidth, canvas.toDataURL());

                //console.log(uifunctions.iconHolder.iconName + '_' + scaleWidth + '_' + color + ': ' + canvas.toDataURL() + ',');

                if (uifunctions.iconHolder.xtype == "button" || uifunctions.iconHolder.xtype == "splitbutton")
                {
                    uifunctions.iconHolder.setIcon(canvas.toDataURL());
                } else if (uifunctions.iconHolder.xtype == "image")
                {
                    uifunctions.iconHolder.setSrc(canvas.toDataURL());
                }

                uifunctions.iconHolder.afterSourceChanged(uifunctions.iconHolder);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            else
            {
                uifunctions.iconHolder.afterSourceChanged(uifunctions.iconHolder);
            }
            
        };
        img.src = this.src;
    },
    getIcons: function (isHover) {

        var color = this.iconHolder.normalColor;
        if (isHover) {
            color = this.iconHolder.hoverColor;
        }

        if (this.iconHolder.changeTextColor === true) {
            this.changeItemColor(this.iconHolder, color);
        }

        var scale = 0;

        if (this.iconHolder.xtype == "button" || this.iconHolder.xtype == "splitbutton") {
            scale = this.getIconScale(this.iconHolder);
        } else {
            scale = this.iconHolder.height;
        }

        var icon = LOCAL_STORAGE.getItem('image_' + this.iconHolder.iconName + '_' + color.r + ',' + color.g + ',' + color.b + '_' + scale + scale);
        if (icon !== null) {
            if (this.iconHolder.xtype == "button" || this.iconHolder.xtype == "splitbutton") {
                this.iconHolder.setIcon(icon);
            } else if (this.iconHolder.xtype == "image") {
                this.iconHolder.setSrc(icon);
            }
            this.iconHolder.afterSourceChanged(this.iconHolder);
        } else {
            this.refreshCanvas();
            this.refillPicture(color);
        }

        //this.canvasPanel.update('<canvas></canvas>');
    },
    getCanvasPanel: function () {
      for (var i = 0; i < this.parentContainer.items.length; i++) {
          var container = this.parentContainer.items.getAt(i);

          try
          {
              var containerHtml = container.body.dom.innerHTML;
              if (containerHtml.indexOf('canvas') !== null && containerHtml.indexOf('canvas') != -1) {
                  return container;
              }
          }
          catch (error) {
              return this.parentContainer.items.getAt(this.parentContainer.items.length - 1);
          }
      }
       return this.parentContainer.items.getAt(this.parentContainer.items.length - 1);
    },
    getHighestParent: function (container) {
        if (container.up() !== undefined) {
            return this.getHighestParent(container.up());
        } else {
            return container;
        }
    },
    getIconScale: function (iconholder) {
        switch (iconholder.scale) {
            case 'small': 
                return 16;
            case 'smallMedium': 
                return 20;
            case 'medium': 
                return 24;
            case 'large': 
                return 32;
        }
    },
    changeItemColor: function (iconholder, color)
    {
        
    },
    refreshCanvas: function (height, width, panel)
    {
        if (!panel)
        {
            return;
        }

        if (height === undefined) {
            height = 32;
        }

        if (width === undefined) {
            width = 32;
        }

        if (panel === undefined) {
            panel = this.canvasPanel;
        }
        panel.update('<canvas style="" id="canvas" height="' + height + '" width="' + width + '"></canvas>');
    }
});