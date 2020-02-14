Ext.define('SettingsDevicesPanel',
{
    extend: 'SettingsBasePanel',

    layout: {
        type: 'vbox',
    
    },

    margin: '0 0 0 5',

    title: '',
    iconCls: 'speaker',

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('softphone');

        var mainContainer = this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            width:500
        }));
        mainContainer.add(Ext.create('Ext.form.Label',
        {
            text: LANGUAGE.getString("phoneDevicesTitle"),
            style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
            margin: '10 0 0 5'
        }));

        if (!DEVICEMANAGER || Ext.isEmpty(DEVICEMANAGER.getInstalledDevices()))
        {
            return;
        }
        
        this.settingsPhone = mainContainer.add(this.createCombobox(LANGUAGE.getString("phoneDevices"), undefined, (combobox, newValue) =>
        {
            if (isValid(newValue))
            {
                this.setVisibilityForMicrophonesAndSpeakers(newValue.data.value.value === "-");
            }
        }));
        
        this.htmlHintComponent = mainContainer.add(Ext.create('ErrorMessageComponent',
        {
            errorType: ErrorType.Info,
            margin: '10 0 0 5',
            borderWidth: 1,
            showCloseButton: false
        }));
        
        this.settingsMicrophones = mainContainer.add(this.createCombobox(LANGUAGE.getString("microphoneDevices"), '5 0 0 25'));

        this.settingsSpeakers = mainContainer.add(this.createCombobox(LANGUAGE.getString("speakerDevices"), '5 0 0 25'));
        
        this.settingsForRinging = mainContainer.add(this.createCombobox(LANGUAGE.getString("speakerForRingtone")));

        this.settingsForBusyLights = mainContainer.add(this.createCombobox(LANGUAGE.getString("busyLights")));

        this.fillComboboxes();

        mainContainer.add(new Link(
            {
                text: LANGUAGE.getString("searchForFurtherDevices"),
                margin: '10 0 0 ' + (this.getLabelWidth() + 16),
                listeners:
                {
                    el:
                    {
                        click: function ()
                        {
                            DEVICEMANAGER.reinit(true);
                        }
                    }
                }
            }));

        this.onAvailableDevicesChanged = async (customEvent) =>
        {
            this.resetComboboxes();
            this.fillComboboxes();
            await this.onDeviceSelectionChanged();
        };
        DEVICEMANAGER.addEventListener("availableDevicesChanged", this.onAvailableDevicesChanged);

        this.add(Ext.create('Ext.form.Label',
        {
            text: LANGUAGE.getString("busyOnBusy"),
            style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
            margin: '10 0 0 5'
        }));

        var sipPreferences = CURRENT_STATE_CALL.getSipPreferences();
        this.add(new Ext.form.field.Checkbox(
            {
                checked: sipPreferences ? sipPreferences.BusyOnBusy : true,
                margin: '5 0 0 5',
                boxLabel: LANGUAGE.getString('discardCallOnBusy'),
                listeners:
                {
                    change: function (event, newValue, oldValue, eOpts)
                    {
                        var BusyOnBusy = newValue;
                        SESSION.setSipPreferences({ BusyOnBusy: BusyOnBusy }, function (response)
                        {
                            if (response.getReturnValue().getCode() !== 0)
                            {
                                showWarningMessage(response.getReturnValue().getDescription(), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                            }
                        }, function ()
                            {
                                showWarningMessage(LANGUAGE.getString("errorSaveChanges"), DEFAULT_TIMEOUT_ERROR_MESSAGES);
                            });
                    }
                }
            }));

        /*
        this.onDetectionRunning = async (customEvent) =>
        {
            showBlackLoadingMask(this);
        };
        DEVICEMANAGER.addEventListener("deviceDetectionRunning", this.onDetectionRunning);

        this.onDetectionIdle = async (customEvent) =>
        {
            hideLoadingMask(this);
        };
        DEVICEMANAGER.addEventListener("deviceDetectionIdle", this.onDetectionIdle);
        */

        this.on('boxready', function ()
        {
            this.selectDevices(DEVICEMANAGER.getSelectedDevices());
        }, this);
    },

    destroy: function ()
    {
        DEVICEMANAGER.removeEventListener("availableDevicesChanged", this.onAvailableDevicesChanged);
        this.callParent();
    },

    resetComboboxes: function ()
    {
        var comboboxes = [this.settingsPhone, this.settingsMicrophones, this.settingsSpeakers, this.settingsForRinging, this.settingsForBusyLights];
        Ext.each(comboboxes, function (combobox)
        {
            combobox.store.removeAll();
        }, this);
    },

    fillComboboxes: function ()
    {
        var installedDevices = DEVICEMANAGER.getInstalledDevices();
        let phoneDevices = installedDevices.phoneDevices;
        phoneDevices.sort((a, b) => a.displayName.localeCompare(b.displayName));
        this.fillCombobox(this.settingsPhone, phoneDevices);
        this.settingsPhone.store.add(
        {
            displayName: LANGUAGE.getString("advancedSelection"),
            value:
            {
                displayName: LANGUAGE.getString("advancedSelection"),
                deviceId:
                {
                    id: "-"
                }
            }
        });
        
        this.fillCombobox(this.settingsMicrophones, installedDevices.microphones);
        this.fillCombobox(this.settingsSpeakers, installedDevices.speakers);
        this.fillCombobox(this.settingsForRinging, installedDevices.speakers);
        var busyLights = installedDevices.busylights;
        if (!Ext.isEmpty(busyLights))
        {
            busyLights = busyLights.concat({
                deviceId: { id: WebDevice.NoDeviceId },
                displayName: LANGUAGE.getString("noBusyLight")
            });
        }
        this.fillCombobox(this.settingsForBusyLights, busyLights);
    },

    fillCombobox: function (combobox, devices)
    {
        Ext.iterate(devices, function (device)
        {
            combobox.store.add(
                {
                    displayName: device.displayName,
                    value: device
                });
        }, this);
        combobox.setVisible(!Ext.isEmpty(devices));
    },

    createCombobox: function (label, margin, selectListener)
    {
        var combobox = Ext.create('Ext.form.field.ComboBox',
        {
            listConfig:
            {
                getInnerTpl: function ()
                {
                    return '{displayName:htmlEncode}';
                }
            },
            emptyText: LANGUAGE.getString("noDeviceChosenYet"),
            margin: margin || '5 0 0 5',
            fieldLabel: label,
            labelWidth: this.getLabelWidth(),
            editable: false,
            store: new Ext.data.Store({
                fields: ['displayName', 'value']
            }),
            displayField: 'displayName',
            valueField: 'value',
            queryMode: 'local',
            listeners: {
                select: async (combobox, newValue) =>
                {
                    if (selectListener)
                    {
                        selectListener(combobox, newValue);
                    }

                    await this.onDeviceSelectionChanged();
                }
            }
        });
        return combobox;
    },

    getLabelWidth: function ()
    {
        return 170;
    },

    setVisibilityForMicrophonesAndSpeakers: function (flag)
    {
        Ext.each([this.settingsMicrophones, this.settingsSpeakers], function (combobox)
        {
            combobox.setVisible(flag);
        }, this);
    },

    onAvailableDevicesChanged: async function (event)
    {
        this.onDeviceSelectionChanged(event.detail);
    },

    onDeviceSelectionChanged: async function (deviceIds) 
    {
        if (!DEVICEMANAGER)
        {
            return;
        }
        
        deviceIds = await DEVICEMANAGER.selectDevices(deviceIds ? deviceIds : {
            phoneDeviceId: this.getChosenPhoneDeviceId(),
            voiceInputDeviceId: this.getChosenMicrophoneDeviceId(),
            voiceOutputDeviceId: this.getChosenSpeakerDeviceId(),
            soundOutputDeviceId: this.getChosenSpeakerForRingtoneDeviceId(),
            busyLightDeviceId: this.getChosenBusyLightDeviceId()
        });

        this.selectDevices(deviceIds);
        
        return deviceIds;
    },

    selectDevices: function (deviceIds)
    {
        if (!deviceIds)
        {
            return;
        }
        this.selectPhone(this.isAdvancedSettingsSelected() ? "-" : (deviceIds.phoneDeviceId ? deviceIds.phoneDeviceId.id : "-"));
        this.selectMicrophone(deviceIds.voiceInputDeviceId ? deviceIds.voiceInputDeviceId.id : "");
        this.selectSpeaker(deviceIds.voiceOutputDeviceId ? deviceIds.voiceOutputDeviceId.id : "");
        this.selectSpeakerForRingtone(deviceIds.soundOutputDeviceId ? deviceIds.soundOutputDeviceId.id : "");
        this.selectSpeakerForBusyLight(deviceIds.busyLightDeviceId ? deviceIds.busyLightDeviceId.id : "");

        this.setVisibilityForMicrophonesAndSpeakers(this.isAdvancedSettingsSelected());

        let selectedPhoneDevice = DEVICEMANAGER.getSelectedPhoneDevice();
        let htmlHintText = selectedPhoneDevice ? (selectedPhoneDevice.htmlInstallationHint || "") : "";
        this.htmlHintComponent.setVisible(isValidString(htmlHintText));
        this.htmlHintComponent.setHtml(htmlHintText);
        this.updateLayout(); //wenn man das nicht macht und der hintText etwas größer ist, geht das Layout kaputt
    },

    isAdvancedSettingsSelected: function ()
    {
        var value = this.settingsPhone.getValue();
        if (value)
        {
            return value.deviceId.id === "-";
        }
        return false;
    },

    selectPhone: function (deviceId)
    {
        this.selectValue(this.settingsPhone, deviceId);
    },

    selectMicrophone: function (deviceId)
    {
        this.selectValue(this.settingsMicrophones, deviceId);
    },

    selectSpeaker: function (deviceId)
    {
        this.selectValue(this.settingsSpeakers, deviceId);
    },

    selectSpeakerForRingtone: function (deviceId)
    {
        this.selectValue(this.settingsForRinging, deviceId);
    },

    selectSpeakerForBusyLight: function (deviceId)
    {
        this.selectValue(this.settingsForBusyLights, deviceId);
    },

    selectValue: function (combobox, deviceId)
    {
        var foundRecord;
        combobox.getStore().each(function (record)
        {
            if (record.data.value.deviceId.id === deviceId)
            {
                foundRecord = record;
                return false;
            }
        }, this);
        combobox.select(foundRecord);
    },

    getChosenPhoneDeviceId: function ()
    {
        return this.getChosenDeviceId(this.settingsPhone);
    },

    getChosenMicrophoneDeviceId: function ()
    {
        return this.getChosenDeviceId(this.settingsMicrophones);
    },

    getChosenSpeakerDeviceId: function()
    {
        return this.getChosenDeviceId(this.settingsSpeakers);
    },

    getChosenSpeakerForRingtoneDeviceId: function ()
    {
        return this.getChosenDeviceId(this.settingsForRinging);
    },

    getChosenBusyLightDeviceId: function ()
    {
        return this.getChosenDeviceId(this.settingsForBusyLights);
    },

    getChosenDeviceId: function (combobox)
    {
        var device = combobox.getValue();
        if (!isValid(device) || device === "-")
        {
            return null;
        }
        return device.deviceId;
    }
});
