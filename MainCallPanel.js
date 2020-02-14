/**
 * Created by jebing on 16.01.2015.
 */
Ext.define('DateAndTimePanel',
{
    extend: 'Ext.form.Label',
    style: 'color:' + NEW_GREY,

    initComponent: function ()
    {
        this.callParent();

        var now = new Date();
        this.currentDateTimeString = formatDateString(now) + " " + formatTimeString(now);
        this.setHtml(this.currentDateTimeString);

        this.dateTimeTimer = Ext.util.TaskManager.start(
        {
            scope: this,
            interval: 1000,
            run: function ()
            {
                if (!this.destroyed)
                {
                    var now = new Date();
                    var newDateTimeString = formatDateString(now) + "&nbsp;&nbsp;&nbsp;" + formatTimeString(now);
                    if (this.currentDateTimeString === newDateTimeString)
                    {
                        return;
                    }
                    this.currentDateTimeString = newDateTimeString;
                    this.setHtml(this.currentDateTimeString);
                }
                else
                {
                    Ext.util.TaskManager.stop(this.dateTimeTimer);
                }
            }
        });
    },

    destroy: function ()
    {
        Ext.util.TaskManager.stop(this.dateTimeTimer);

        this.callParent();
    }
});
Ext.define(CLASS_MAIN_CALL_PANEL,
{
    extend: 'Ext.Container',

    style: 'background-color: white',
    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },
    border: false,

    initComponent: function () 
    {
        var self = this;
        this.titleIconWhite = IMAGE_LIBRARY.getImage('phone', 64, COLOR_TAB_ICON_SELECTED);
        this.titleIconBlack = IMAGE_LIBRARY.getImage('phone', 64, COLOR_TAB_ICON_NORMAL);

        this.tabConfig =
            {
                icon: this.titleIconBlack,
                tooltip: LANGUAGE.getString('telephony')
            };

        this.callParent();

        this.dateAndExtensionPanel = this.add(Ext.create('Ext.Container',
            {
                layout:
                {
                    type: 'hbox',
                    align: 'stretch'
                },
                height: 29,
                padding: '6 6 0 7',
                style: 'overflow:hidden;border-bottom:1px solid ' + BORDER_GREY + ';background-color:' + PANEL_BACKGROUND_GREY
            }));
        this.dateAndExtensionPanel.add(Ext.create('DateAndTimePanel',
            {
                flex: 1
            }));

        var extensionAndCallDiversionContainer = this.dateAndExtensionPanel.add(Ext.create('Ext.Container',
            {
                layout:
                {
                    type: 'hbox'

                },
                height: 29,

                listeners:
                {
                    el:
                    {
                        click: function () {
                            if (CURRENT_STATE_CALL.isCallDiversionAllowed()) {
                                self.onShowDiversionPanel();
                            }
                            else {
                                showWarningMessage(LANGUAGE.getString("noCallDiversionAllowed"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                            }
                        }
                    }
                },
                style: CURRENT_STATE_CALL.isCallDiversionAllowed() ? 'cursor:pointer' : ''
            }));


        this.extensionLabel = extensionAndCallDiversionContainer.add(Ext.create('Ext.form.Label',
            {
                style: 'min-width:30px;padding: 0 5px 2px 5px;border-radius:3px;cursor:pointer;color:' + COLOR_MAIN_GREY,
                text: SESSION.getMyExtension() || " ",
                onNewEvents: function (response)
                {
                    var myExtension = SESSION.getMyExtension();
                    if (isValidString(myExtension) && this.text !== myExtension)
                    {
                        this.setText(SESSION.getMyExtension());
                    }

                    var backgroundColor = 'transparent';
                    var color = COLOR_MAIN_GREY;
                    if (!CURRENT_STATE_CALL.isMyLineStateOKOrBusy())
                    {
                        backgroundColor = RED;
                        color = WHITE;
                    }
                    
                    this.setStyle({ backgroundColor: backgroundColor, color: color });
                }
            }));
        SESSION.addListener(this.extensionLabel);

        this.callDiversionIcon = extensionAndCallDiversionContainer.add(Ext.create('Ext.Img',
            {
                src: IMAGE_LIBRARY.getImage('calldiversion', 64, NEW_GREY),
                margin: '0 3 0 5',
                alt: "callDiversion",
                hidden: true,
                height: 16,
                width: 16,
                style: 'cursor:pointer'
            }));
        this.extensionForRedirectionLabel = extensionAndCallDiversionContainer.add(Ext.create('Ext.form.Label',
            {
                hidden: true,
                style: 'cursor:pointer;color:' + COLOR_MAIN_GREY
            }));

        this.softPhoneDeviceIcon = Ext.create('ThinButton',
            {
                hidden: true,
                margin: '2 5 0 0',
                icon: "images/64/" + ICON_NAME_ACD_AGENT + ".png",
                handler: function ()
                {
                    GLOBAL_EVENT_QUEUE.onGlobalEvent_OpenDevicesSettings();
                }
            });

        this.titleLabel = Ext.create('Ext.Component',
            {
                style: 'color:' + COLOR_MAIN_2 + ';visibility:hidden',
                height: 27
            });
        
        this.titleContainer = this.add(new Ext.Container(
            {
                margin: '25 0 0 0',
                layout:
                {
                    type: 'hbox',
                    align: 'stretch',
                    pack: 'center'
                },
                items: [this.softPhoneDeviceIcon, this.titleLabel]
            }));

        if (DEVICEMANAGER)
        {
            this.selectedDeviceListener = (evt) =>
            {
                this.softPhoneDeviceIcon.setTooltip(LANGUAGE.getString("selectedPhoneDevice", DEVICEMANAGER.getSelectedPhoneDeviceDisplayText()));
            };
            DEVICEMANAGER.addEventListener("selectedDevicesChanged", this.selectedDeviceListener);
        }
        this.setTitle('');

        this.telephoneInputPanel = this.add(Ext.create('TelephoneInputPanel',
            {
                padding: '25 5 0 5',
                parent: this,
                openContactOnSelect: true
            }));

        this.manualCampaignButton = Ext.create('CallButton',
        {
            iconName: 'manual_campaign',
            iconColor: COLOR_CALL_BUTTON_DIAL,
            tooltip: LANGUAGE.getString("manualCampaign"),
            clickListener: function ()
            {
                SESSION.requestNextCampaignCall(function (response)
                {
                    if (response.getReturnValue().getCode() === ProxyError.ErrorNoMoreCampaignCalls.value)
                    {
                        showInfoMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                    }
                    else if (response.getReturnValue().getCode() !== 0)
                    {
                        showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                    }
                }, function ()
                {
                    showErrorMessage(LANGUAGE.getString("errorRequestNextCampaignCall"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                });
            },
            hidden: !CURRENT_STATE_CONTACT_CENTER.isManualCampaignAvailable(),
            listeners:
            {
                boxready: function ()
                {
                    this.btnIconEl.dom.style.backgroundSize = 'contain';
                }
            }
        });
        this.telephoneInputPanel.addButton(this.manualCampaignButton, 15);

        this.on('boxready', function ()
        {
            self.tooltip = Ext.create('Ext.tip.ToolTip',
                {
                    target: extensionAndCallDiversionContainer.getEl(),
                    html: self.tooltipText,
                    showDelay: 1000,
                    hideDelay: 0,
                    autoHide: true,
                    trackMouse: false,
                    listeners:
                    {
                        beforeshow: function (tip) {
                            if ((isValid(self.dialog) && self.dialog.isVisible()) || !isValidString(tip.html)) {
                                return false;
                            }
                        }
                    }
                });
        });
        this.on('destroy', function ()
        {
            if (self.tooltip)
            {
                self.tooltip.destroy();
            }
        });

        SESSION.addListener(this);

        this.updateCallDiversion();

        this.setVisible(SESSION.isTelephonyAllowed());

        if (SESSION.getCtiLoginData())
        {
            this.showSoftphoneOrTelephonyTitle();
        }
    },

    setTitle: function (title)
    {
        this.titleLabel.setHtml('<div style="border-radius:3px;font-size:20px;font-weight:500;justify-content:center;display:flex;flex:1;">' + title + '</div>');
        this.titleLabel.setStyle({ visibility: isValidString(title) ? 'visible' : 'hidden' });
    },

    onNewEvents: function (response) 
    {
        if (isValid(response.getCtiLoginData()))
        {
            this.showSoftphoneOrTelephonyTitle();
        }

        if (isValid(response.getOwnerCallDiversion())) 
        {
            this.updateCallDiversion();
        }

        if (CURRENT_STATE_CALL.isMyLineStateBusy())
        {
            showConnectionLostMask(this, LANGUAGE.getString("lineStateIsBusy"));
        }
        else
        {
            hideConnectionLostMask(this);
        }

        this.colorizeTitleLabel();
        this.updateVisibilityOfManualCampaignButton();
    },

    updateVisibilityOfManualCampaignButton: function ()
    {
        this.manualCampaignButton.setVisible(CURRENT_STATE_CONTACT_CENTER.isManualCampaignAvailable());
    },

    showSoftphoneOrTelephonyTitle: function ()
    {
        this.setTitle(LANGUAGE.getString(SESSION.isSIPMode() ? "softphone" : 'telephony'));

        this.softPhoneDeviceIcon.setVisible(SESSION.isSIPMode());
    },

    colorizeTitleLabel: function ()
    {
        var color = COLOR_MAIN_2;
        if (!SESSION.isCtiWebServiceAvailable())
        {
            color = COLOR_MAIN_GREY;
        }
        if (!CURRENT_STATE_CALL.isMyLineStateOKOrBusy())
        {
            color = RED;
        }
        this.titleLabel.setStyle({ backgroundColor: 'transparent', color: color });
    },
    
    destroy: function ()
    {
        if (DEVICEMANAGER)
        {
            DEVICEMANAGER.removeEventListener("selectedDevicesChanged", this.selectedDeviceListener);
        }
        
        SESSION.removeListener(this.extensionLabel);
        SESSION.removeListener(this);
        this.callParent();
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel);
    },
    
    focus: function ()
    {
        this.callParent();

        this.telephoneInputPanel.focus();
    },

    onSetCallDiversionSuccess: function (response)
    {
        if (response.getReturnValue().getCode() !== 0)
        {
            showErrorMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
        }
    },

    onSetCallDiversionException: function ()
    {
        showErrorMessage(LANGUAGE.getString("errorSetCallDiversion"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
    },

    updateCallDiversion: function () {
        var number = CURRENT_STATE_CALL.getCallDiversionNumber();
        if (isValidString(number)) {
            this.setTooltip(LANGUAGE.getString("redirectionToNumber", number));
            this.callDiversionIcon.show();

            if (number.length > 5)
            {
                number = "..." + number.substring(number.length - 4);
            }
            
            this.extensionForRedirectionLabel.setText(number);
            this.extensionForRedirectionLabel.show();
        }
        else {
            this.setTooltip();//LANGUAGE.getString("noRedirection"));
            this.callDiversionIcon.hide();
            this.extensionForRedirectionLabel.hide();
        }
    },

    setTooltip: function (text) {
        if (isValid(this.tooltip)) {
            this.tooltip.setHtml(text);
        }
        else {
            this.tooltipText = text;
        }
    },

    onShowDiversionPanel: function ()
    {
        GLOBAL_EVENT_QUEUE.onGlobalEvent_setCallDiversion();
    }
});