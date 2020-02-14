Ext.define('CallHistoryDetailsPanel', {
    extend: 'Ext.Panel',
    border: false,
    callItem: undefined,
    initComponent: function ()
    {
        this.callParent();

        //this.setTitle(this.callItem.getCallDirection());

        this.add(Ext.create('BaseCallDetailsView', {
            callData: this.callItem
        }));

        if (isValid(this.callItem, "getFormUrl()"))
        {
            this.formPanel = Ext.create('FormPanel',
            {
                url: this.callItem.getFormUrl()
            });

            this.add(this.formPanel);
        }
    }
});

Ext.define('BaseCallDetailsView', {
    extend: 'Ext.Component',

    margin: '8 0 0 0',

    activeEmail: null,

    border: false,

    showHistory: true,

    initComponent: function ()
    {
        this.tpl = '<div style="border: none !important">' +
            '<div style="font-size:' + FONT_SIZE_NAME + 'px; color:black;font-weight:500;">{callDirection}</div>' +
            '<div style="margin-top: 10px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + NEW_GREY + ';">Am {date} um {time}</div>' +
            '<div style="margin-top: 5px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + NEW_GREY + ';">Dauer: {duration}</div>' +
            '<div style="display:flex;flex-direction:row;margin-top: 10px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + NEW_GREY + ';">' +
                '<div style="background-repeat:no-repeat;background-size: 16px 16px;background-image: url(' + IMAGE_LIBRARY.getImage(ICON_NAME_ACD_GROUP, 64, NEW_GREY) + ');"><span style="margin-left: 25px;">{group}</span></div>' +
            '</div>' +
            '<tpl if="isValidString(values.recordingUrl)">' +
                '<div style="margin-top: 10px;font-size:' + FONT_SIZE_SUBTITLE + 'px;color:' + NEW_GREY + ';">Aufzeichnung</div>' +
                '<audio preload="metadata" controls src="{recordingUrl}"></audio>' +
            '</tpl>' +
            '<div style="margin-top: 20px;height: 1px; background-color:' + NEW_GREY.createLighter(0.2) + '"></div>' +
            '<div style="margin-bottom:18px;margin-top:15px;display:flex;flex-direction:row;">' +
                '{[values.phoneIcon]}' +
                '<div style="margin-top:18px;margin-left: 10px;font-size:' + FONT_SIZE_TITLE + 'px;color:' + NEW_GREY + ';">{phoneNumber}</div>' + 
            '</div>' +
        '</div>';
        this.data =
        {
            callDirection: '',
            date: '',
            time: '',
            duration: '',
            recordingUrl: '',
            group: '',
            phoneIcon: ''
        };

        this.callParent();

        this.setCallData(this.callData);
    },

    setCallData: function (callDetails)
    {
        this.data = {
            callDirection: callDetails.getCallDirection(),
            date: callDetails.getDate(),
            time: callDetails.getTime(),
            duration: callDetails.getCallDuration(),
            recordingUrl: callDetails.getRecordingUrl(),
            group: callDetails.getGroup(),
            phoneIcon: callDetails.getCallIcon(),
            phoneNumber: callDetails.getPhoneNumber()
        };

        this.update(this.data);
    }
});