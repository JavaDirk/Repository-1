Ext.define('ToggleButton', {
    switchImage: {},
    toggled: false,
    extend: 'Ext.container.Container',
    scale: 20,
    style: { display: "inline-block", cursor: "pointer"},
    labelText: "",
    autoRender: true,
    selectFunction: function () { },
    unselectFunction: function () { },
    listeners: {
        afterrender: function (event)
        {
            setTimeout(function ()
            {
                if (event.toggled)
                {
                    event.toggleOn();
                }
            }, 0);
        }
    },
    setScale: function (newScale) {
        this.scale = newScale;
        this.switchImage.setStyle("width", (this.scale + 3) + "px");
        this.switchImage.setStyle("height", (this.scale + 3) + "px");
        if (this.toggled) {
            this.switchImage.setStyle("left", (this.scale - 3) + "px");
        }
        else
        {
            this.switchImage.setStyle("left", "1px");
        }
        this.label.setStyle("margin-top", (((this.scale - 8) / 2) - 1) + "px");
        this.content.setStyle("width", (2 * this.scale + 3) + "px");
        this.content.setStyle("height", (this.scale + 7) + "px");
    },
    toggleOn: function () {
        animateWidth = this.scale - 3;
        this.switchImage.setStyle('left', animateWidth + "px");
        this.content.setStyle('background-color', '#4BD661');
        this.content.setStyle('border', '1px solid #4BD661');
        this.toggled = true;
        this.selectFunction();
    },
    toggleOff: function () {
        animateWidth = 1;
        this.switchImage.setStyle('left', animateWidth + "px");
        this.content.setStyle('background-color', '#ffffff');
        this.content.setStyle('border', '1px solid #e5e5e5');
        this.toggled = false;
        this.unselectFunction();
    },
    toggleButton: function (notFireChange, fast) {
        var self = this,
            animateWidth = 1;
        if (self.duringAnimation) {
            return;
        }
        if (!this.toggled) {
            animateWidth = this.scale - 3;
        }

        /*if (fast) {
            this.switchImage.setStyle('left', animateWidth + "px");
            self.toggled = !self.toggled;
            if (self.toggled) {
                self.toggleOn();
            } else {
                self.toggleOff()
            }
            if (!notFireChange) {
                self.onChange();
            }
        } else {
            if (this.switchImage.getEl()) {
                self.duringAnimation = true;
                this.switchImage.getEl().animate({
                    to: { left: animateWidth },
                    duration: 150,
                    listeners: {
                        afteranimate: function () {
                            self.toggled = !self.toggled;
                            if (self.toggled) {
                                self.content.setStyle('background-color', '#4BD661');
                                self.content.setStyle('border', '1px solid #4BD661');
                            } else {
                                self.content.setStyle('background-color', '#ffffff');
                                self.content.setStyle('border', '1px solid #e5e5e5');
                            }
                            if (!notFireChange) {
                                self.onChange();
                            }
                            self.duringAnimation = false;
                        }
                    }
                });
            } else {
                self.duringAnimation = false;
            }
        }*/

        this.switchImage.setStyle('left', animateWidth + "px");
        self.toggled = !self.toggled;
        if (self.toggled)
        {
            self.toggleOn();
        } else
        {
            self.toggleOff();
        }
        if (!notFireChange)
        {
            self.onChange();
        }
    },
    onChange: function () { },
    initComponent: function () {
        var self = this;
        this.callParent();


        this.content = Ext.create("Ext.container.Container", {
            style: {
                border: "1px solid #e5e5e5",
                "border-radius": this.scale + "px",
                display: "inline-block",
                "margin-bottom": "3px",
                "margin-right": "-3px",
                "margin-left": "4px",
                "margin-top": "4px",
                "float": "right",
                width: (2 * self.scale + 3) + "px",
                height: (self.scale + 7) + "px"
                
            },
            listeners: {
                el: {
                    click: {
                        fn: function (event) {
                            self.toggleButton();
                        },
                        scope: this
                    }
                }
            }
        });
        self.content.setStyle('background-color', self.toggled ? "#4BD661" : "#ffffff");
        self.content.setStyle('border', self.toggled ? "1px solid #4BD661" : "1px solid #e5e5e5");

        this.setWidth(2 * self.scale + 3);

        this.add(this.label = Ext.create("Ext.container.Container", { html: this.labelText, style: { "margin-top": (((this.scale - 8) / 2) - 1) + "px", width: "100px", padding: "3px", "padding-left": "0px", "padding-bottom": "6px" }, cls: this.labelCls || ["text-heading", "inline"] }));
        this.content.add(this.switchImage = new Ext.Img({
            src: "images/circle.png",
            alt: "SwitchImage",
            initComponent: function () {

                this.style = {
                    'border-radius': '100%',
                    'box-shadow': '0px 2px 5px 0px #999999 !important',
                    width: (self.scale + 3) + "px",
                    height: (self.scale + 3) + "px",
                    top: "1px"
                };
                if (self.toggled) {
                    this.style.left = (self.scale - 3) + "px";
                } else {
                    this.style.left = "1px";
                }
                this.style.position = "relative";
                this.callParent();
            }
        }));
        this.add(this.content);
    }
});